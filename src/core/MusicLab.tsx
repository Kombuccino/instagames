import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { musicCatalog as source } from '../music/catalog'
import {
  brightnessCutoff,
  normalizeTrackTuning,
  readAudioLabTuning,
  writeAudioLabTuning,
  type CompositionTrackTuning,
  type TrackTuning,
} from './audioLabTuning'
import { MusicScorePanel } from './MusicScorePanel'
import { SoundDesignLab } from './SoundDesignLab'
import { VoiceIdeaRecorder } from './VoiceIdeaRecorder'
import './musicLab.css'

type Status = 'candidate' | 'selected' | 'archived'
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }
type Stage = { label: string, bpm: number, variant: string, activeTracks: string[] }
type Composition = {
  id: string
  gameId: string
  gameTitle: string
  name: string
  status: Status
  createdAt: string
  summary: string
  concept: string[]
  key: string
  meter: string
  loopBeats: number
  midiExports: string[]
  stages: Stage[]
  variants: Record<string, Track[]>
}
type Catalog = { version: number, rule: string, compositions: Composition[] }
type Filter = Status | 'all'
type Playback = { compositionId: string, stageIndex: number }
type SourceNode = OscillatorNode | AudioBufferSourceNode
type TrackBus = { gain: GainNode, filter: BiquadFilterNode }

const musicCatalog = source as unknown as Catalog
const FILTERS: Array<[Filter, string]> = [['candidate', 'À ÉCOUTER'], ['selected', 'RETENUES'], ['archived', 'ARCHIVES'], ['all', 'TOUT']]
const STATUS_LABEL: Record<Status, string> = { candidate: 'À ÉCOUTER', selected: 'RETENUE', archived: 'ARCHIVE' }

function hz(note: number) { return 440 * Math.pow(2, (note - 69) / 12) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

function rememberSource(sources: SourceNode[], node: SourceNode) {
  sources.push(node)
  node.addEventListener('ended', () => {
    const index = sources.indexOf(node)
    if (index >= 0) sources.splice(index, 1)
  }, { once: true })
}

function noiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .5), context.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0
  for (let i = 0; i < data.length; i += 1) {
    previous = previous * .58 + (Math.random() * 2 - 1) * .42
    data[i] = previous
  }
  return buffer
}

function scheduleTone(
  context: AudioContext,
  output: AudioNode,
  track: Track,
  note: Note,
  tuning: TrackTuning,
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, durationBeats * (tuning.noteLengthPercent / 100) * beatSeconds)
  const end = start + duration
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  osc.frequency.setValueAtTime(hz(midi + tuning.transposeSemitones), start)
  const level = clamp(velocity / 127 * track.gain, .002, .2)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.009, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .01, end - .02))
  gain.gain.exponentialRampToValueAtTime(.0001, end)
  osc.connect(gain).connect(output)
  osc.start(start)
  osc.stop(end + .02)
  rememberSource(sources, osc)
}

function scheduleNoise(
  context: AudioContext,
  output: AudioNode,
  buffer: AudioBuffer,
  track: Track,
  note: Note,
  tuning: TrackTuning,
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, Math.min(.3, durationBeats * (tuning.noteLengthPercent / 100) * beatSeconds))
  const sourceNode = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  sourceNode.buffer = buffer
  if (midi <= 37) { filter.type = 'lowpass'; filter.frequency.value = 260 }
  else if (midi <= 40) { filter.type = 'bandpass'; filter.frequency.value = 1200 }
  else { filter.type = 'highpass'; filter.frequency.value = midi >= 46 ? 6000 : 3600 }
  gain.gain.setValueAtTime(clamp(velocity / 127 * track.gain * 1.4, .004, .22), start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  sourceNode.connect(filter).connect(gain).connect(output)
  sourceNode.start(start)
  sourceNode.stop(start + duration + .02)
  rememberSource(sources, sourceNode)
}

export function MusicLab() {
  const [filter, setFilter] = useState<Filter>('all')
  const [game, setGame] = useState('all')
  const [stages, setStages] = useState<Record<string, number>>({})
  const [playback, setPlayback] = useState<Playback | null>(null)
  const [paused, setPaused] = useState(false)
  const [playheadBeat, setPlayheadBeat] = useState(0)
  const [mutedTracks, setMutedTracks] = useState<Record<string, string[]>>({})
  const [trackTunings, setTrackTunings] = useState<Record<string, CompositionTrackTuning>>(() => Object.fromEntries(
    musicCatalog.compositions.map((composition) => [composition.id, readAudioLabTuning(composition.id)]),
  ))
  const contextRef = useRef<AudioContext | null>(null)
  const outputRef = useRef<GainNode | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const sourcesRef = useRef<SourceNode[]>([])
  const timerRef = useRef<number | null>(null)
  const stateRef = useRef<Playback | null>(null)
  const nextStartRef = useRef(0)
  const playbackOriginRef = useRef(0)
  const mutedRef = useRef<Record<string, string[]>>({})
  const tuningsRef = useRef<Record<string, CompositionTrackTuning>>(trackTunings)
  const trackBusesRef = useRef(new Map<string, TrackBus>())

  const games = useMemo(() => [...new Map(musicCatalog.compositions.map((item) => [item.gameId, item.gameTitle])).entries()], [])
  const shown = useMemo(() => musicCatalog.compositions
    .filter((item) => filter === 'all' || item.status === filter)
    .filter((item) => game === 'all' || item.gameId === game)
    .slice().sort((a, b) => b.id.localeCompare(a.id)), [filter, game])

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    sourcesRef.current.slice().forEach((node) => { try { node.stop() } catch { /* already ended */ } })
    sourcesRef.current = []
    stateRef.current = null
    nextStartRef.current = 0
    playbackOriginRef.current = 0
    setPlayback(null)
    setPaused(false)
    setPlayheadBeat(0)
  }, [])

  const ensureAudio = useCallback(async () => {
    if (!contextRef.current) {
      const context = new AudioContext({ latencyHint: 'interactive' })
      const output = context.createGain()
      const compressor = context.createDynamicsCompressor()
      output.gain.value = .72
      compressor.threshold.value = -15
      compressor.knee.value = 8
      compressor.ratio.value = 5
      output.connect(compressor).connect(context.destination)
      contextRef.current = context
      outputRef.current = output
      noiseRef.current = noiseBuffer(context)
    }
    if (contextRef.current.state === 'suspended') await contextRef.current.resume()
    return contextRef.current
  }, [])

  const tuningFor = useCallback((compositionId: string, trackId: string) => (
    normalizeTrackTuning(tuningsRef.current[compositionId]?.[trackId])
  ), [])

  const getTrackBus = useCallback((context: AudioContext, output: AudioNode, compositionId: string, trackId: string) => {
    const key = `${compositionId}:${trackId}`
    const existing = trackBusesRef.current.get(key)
    if (existing) return existing

    const tuning = normalizeTrackTuning(tuningsRef.current[compositionId]?.[trackId])
    const muted = mutedRef.current[compositionId]?.includes(trackId) ?? false
    const gain = context.createGain()
    const filterNode = context.createBiquadFilter()
    filterNode.type = 'lowpass'
    filterNode.Q.value = .25
    filterNode.frequency.value = brightnessCutoff(tuning.brightness)
    gain.gain.value = muted || !tuning.enabled ? 0 : tuning.volumePercent / 100
    gain.connect(filterNode).connect(output)

    const bus = { gain, filter: filterNode }
    trackBusesRef.current.set(key, bus)
    return bus
  }, [])

  const refreshTrackBus = useCallback((compositionId: string, trackId: string) => {
    const context = contextRef.current
    const bus = trackBusesRef.current.get(`${compositionId}:${trackId}`)
    if (!context || !bus) return
    const tuning = normalizeTrackTuning(tuningsRef.current[compositionId]?.[trackId])
    const muted = mutedRef.current[compositionId]?.includes(trackId) ?? false
    bus.gain.gain.setTargetAtTime(muted || !tuning.enabled ? 0 : tuning.volumePercent / 100, context.currentTime, .012)
    bus.filter.frequency.setTargetAtTime(brightnessCutoff(tuning.brightness), context.currentTime, .018)
  }, [])

  const scheduleLoop: (composition: Composition, state: Playback, origin: number) => void = useCallback((composition, state, origin) => {
    const context = contextRef.current
    const output = outputRef.current
    const noise = noiseRef.current
    if (!context || !output || !noise) return
    const stage = composition.stages[state.stageIndex]
    const tracks = composition.variants[stage.variant] ?? []
    const enabled = new Set(stage.activeTracks)
    const beatSeconds = 60 / stage.bpm
    const loopSeconds = composition.loopBeats * beatSeconds

    tracks.filter((track) => enabled.has(track.id)).forEach((track) => {
      const tuning = tuningFor(composition.id, track.id)
      if (!tuning.enabled) return
      const trackOutput = getTrackBus(context, output, composition.id, track.id).gain
      track.notes.forEach((note) => {
        if (track.wave === 'noise') scheduleNoise(context, trackOutput, noise, track, note, tuning, origin, beatSeconds, sourcesRef.current)
        else scheduleTone(context, trackOutput, track, note, tuning, origin, beatSeconds, sourcesRef.current)
      })
    })

    nextStartRef.current = origin + loopSeconds
    timerRef.current = window.setTimeout(() => {
      const current = stateRef.current
      if (!current || current.compositionId !== composition.id || context.state === 'suspended') return
      scheduleLoop(composition, current, nextStartRef.current)
    }, Math.max(80, (loopSeconds - .15) * 1000))
  }, [getTrackBus, tuningFor])

  const play = useCallback(async (composition: Composition, requestedStage?: number) => {
    stop()
    const context = await ensureAudio()
    const stageIndex = clamp(requestedStage ?? stages[composition.id] ?? 0, 0, composition.stages.length - 1)
    const state = { compositionId: composition.id, stageIndex }
    const origin = context.currentTime + .06
    stateRef.current = state
    playbackOriginRef.current = origin
    setPlayback(state)
    setPaused(false)
    scheduleLoop(composition, state, origin)
  }, [ensureAudio, scheduleLoop, stages, stop])

  const chooseStage = useCallback((composition: Composition, index: number) => {
    setStages((old) => ({ ...old, [composition.id]: index }))
    if (stateRef.current?.compositionId === composition.id) void play(composition, index)
  }, [play])

  const togglePause = useCallback(async () => {
    const context = contextRef.current
    const current = stateRef.current
    if (!context || !current) return
    const composition = musicCatalog.compositions.find((item) => item.id === current.compositionId)
    if (!composition) return

    if (context.state === 'running') {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = null
      await context.suspend()
      setPaused(true)
      return
    }

    if (context.state === 'suspended') {
      await context.resume()
      setPaused(false)
      const delay = Math.max(80, (nextStartRef.current - context.currentTime - .15) * 1000)
      timerRef.current = window.setTimeout(() => {
        const liveState = stateRef.current
        if (!liveState || liveState.compositionId !== composition.id) return
        scheduleLoop(composition, liveState, nextStartRef.current)
      }, delay)
    }
  }, [scheduleLoop])

  const toggleMute = useCallback((compositionId: string, trackId: string) => {
    const existing = mutedRef.current[compositionId] ?? []
    const willMute = !existing.includes(trackId)
    const nextList = willMute ? [...existing, trackId] : existing.filter((id) => id !== trackId)
    const next = { ...mutedRef.current, [compositionId]: nextList }
    mutedRef.current = next
    setMutedTracks(next)
    refreshTrackBus(compositionId, trackId)
  }, [refreshTrackBus])

  const updateTrackTuning = useCallback((compositionId: string, trackId: string, patch: Partial<TrackTuning>) => {
    const currentComposition = tuningsRef.current[compositionId] ?? {}
    const currentTrack = normalizeTrackTuning(currentComposition[trackId])
    const nextTrack = normalizeTrackTuning({ ...currentTrack, ...patch })
    const nextComposition = { ...currentComposition, [trackId]: nextTrack }
    const next = { ...tuningsRef.current, [compositionId]: nextComposition }
    tuningsRef.current = next
    setTrackTunings(next)
    writeAudioLabTuning(compositionId, nextComposition)
    refreshTrackBus(compositionId, trackId)
  }, [refreshTrackBus])

  const resetTrackTuning = useCallback((compositionId: string, trackId: string) => {
    const currentComposition = { ...(tuningsRef.current[compositionId] ?? {}) }
    delete currentComposition[trackId]
    const next = { ...tuningsRef.current, [compositionId]: currentComposition }
    tuningsRef.current = next
    setTrackTunings(next)
    writeAudioLabTuning(compositionId, currentComposition)
    refreshTrackBus(compositionId, trackId)
  }, [refreshTrackBus])

  const resetCompositionTuning = useCallback((compositionId: string) => {
    const previous = tuningsRef.current[compositionId] ?? {}
    const next = { ...tuningsRef.current, [compositionId]: {} }
    tuningsRef.current = next
    setTrackTunings(next)
    writeAudioLabTuning(compositionId, {})
    Object.keys(previous).forEach((trackId) => refreshTrackBus(compositionId, trackId))
  }, [refreshTrackBus])

  const replayCurrentTuning = useCallback(() => {
    const current = stateRef.current
    const context = contextRef.current
    if (!current || !context || context.state !== 'running') return
    const composition = musicCatalog.compositions.find((item) => item.id === current.compositionId)
    if (composition) void play(composition, current.stageIndex)
  }, [play])

  useEffect(() => {
    if (!playback) {
      setPlayheadBeat(0)
      return undefined
    }
    const context = contextRef.current
    const composition = musicCatalog.compositions.find((item) => item.id === playback.compositionId)
    if (!context || !composition) return undefined
    const stage = composition.stages[playback.stageIndex]
    const beatSeconds = 60 / stage.bpm

    const update = () => {
      const elapsed = Math.max(0, context.currentTime - playbackOriginRef.current)
      setPlayheadBeat((elapsed / beatSeconds) % composition.loopBeats)
    }
    update()
    if (paused) return undefined
    const timer = window.setInterval(update, 80)
    return () => window.clearInterval(timer)
  }, [paused, playback])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !stateRef.current) return
      const target = event.target
      if (target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) return
      event.preventDefault()
      void togglePause()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'Audio Lab · MiniFugg God Mode'
    return () => { document.title = oldTitle }
  }, [])

  useEffect(() => () => {
    stop()
    trackBusesRef.current.forEach((bus) => {
      bus.gain.disconnect()
      bus.filter.disconnect()
    })
    trackBusesRef.current.clear()
    if (contextRef.current) void contextRef.current.close()
  }, [stop])

  return (
    <main className="mf-music-lab">
      <header className="mf-music-lab__head">
        <div><small>MINIFUGG / USR: MOIGOD</small><h1>AUDIO LAB</h1><p>Musiques réactives et sound design procédural, avec partition inspectable, mix local, idées vocales et extraits copiables.</p></div>
        <div className="mf-music-lab__counter"><b>{musicCatalog.compositions.length}</b><span>CRÉATIONS MUSICALES</span></div>
      </header>

      <section className="mf-music-lab__toolbar">
        <div className="mf-music-lab__tabs">{FILTERS.map(([id, label]) => <button type="button" data-active={filter === id} onClick={() => setFilter(id)} key={id}>{label}</button>)}</div>
        <label><span>JEU</span><select value={game} onChange={(event) => setGame(event.target.value)}><option value="all">Tous</option>{games.map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select></label>
      </section>

      <section className="mf-music-lab__list">
        {shown.map((composition) => {
          const chosen = clamp(stages[composition.id] ?? 0, 0, composition.stages.length - 1)
          const isPlaying = playback?.compositionId === composition.id
          const liveIndex = isPlaying ? playback.stageIndex : chosen
          const live = composition.stages[liveIndex]
          const liveTracks = (composition.variants[live.variant] ?? []).filter((track) => live.activeTracks.includes(track.id))
          const allTracks = [...new Map(Object.values(composition.variants).flat().map((track) => [track.id, track])).values()]
          const muted = new Set(mutedTracks[composition.id] ?? [])
          const tuning = trackTunings[composition.id] ?? {}
          return (
            <article className="mf-music-card" data-status={composition.status} data-playing={isPlaying ? 'true' : 'false'} key={composition.id}>
              <div className="mf-music-card__number"><span>{composition.id}</span><b>{STATUS_LABEL[composition.status]}</b></div>
              <div className="mf-music-card__title"><small>{composition.gameTitle}</small><h2>{composition.name}</h2><p>{composition.summary}</p></div>
              <div className="mf-music-card__tags">{composition.concept.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="mf-music-card__math"><span>{composition.key}</span><span>{composition.meter}</span><span>{composition.loopBeats / 4} mesures</span><span>{composition.midiExports.length} exports MIDI</span></div>
              <div className="mf-music-card__stages">
                <div className="mf-music-card__stage-head"><strong>INTENSITÉ</strong><span>{live.label} · {live.bpm} BPM</span></div>
                <div className="mf-music-card__stage-buttons">{composition.stages.map((stage, index) => <button type="button" data-active={liveIndex === index} onClick={() => chooseStage(composition, index)} key={stage.label}><b>{stage.label}</b><small>{stage.bpm}</small></button>)}</div>
              </div>
              <div className="mf-music-card__transport">
                <button type="button" className="primary" onClick={() => isPlaying ? stop() : void play(composition)}>{isPlaying ? '■ STOP' : '▶ ÉCOUTER'}</button>
                {isPlaying ? <button type="button" onClick={() => void togglePause()}>{paused ? '▶ REPRENDRE' : 'Ⅱ PAUSE'} <small>ESPACE</small></button> : null}
              </div>
              <MusicScorePanel
                composition={composition}
                stage={live}
                tracks={liveTracks}
                allTracks={allTracks}
                mutedTrackIds={muted}
                trackTunings={tuning}
                onToggleMute={(trackId) => toggleMute(composition.id, trackId)}
                onChangeTuning={(trackId, patch) => updateTrackTuning(composition.id, trackId, patch)}
                onResetTrack={(trackId) => resetTrackTuning(composition.id, trackId)}
                onResetComposition={() => resetCompositionTuning(composition.id)}
                onCommitPitchOrLength={replayCurrentTuning}
                playheadBeat={isPlaying ? playheadBeat : 0}
                isPlaying={isPlaying}
                paused={isPlaying && paused}
              />
              <VoiceIdeaRecorder
                composition={composition}
                stage={live}
                isPlaying={isPlaying}
                paused={isPlaying && paused}
                playheadBeat={isPlaying ? playheadBeat : 0}
                onStartMusic={() => play(composition, liveIndex)}
                onResumeMusic={() => togglePause()}
              />
              <footer><span>Créée le {composition.createdAt}</span><span>Les réglages et prises du Lab restent locaux jusqu’à export/copie.</span></footer>
            </article>
          )
        })}
        {shown.length === 0 && <div className="mf-music-lab__empty">Aucune création dans ce filtre.</div>}
      </section>

      <footer className="mf-music-lab__rule"><strong>RÈGLE MUSIQUE</strong><span>{musicCatalog.rule}</span></footer>
      <SoundDesignLab />
    </main>
  )
}
