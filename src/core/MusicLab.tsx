import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import musicCatalogSource from '../music/catalog.json'
import './musicLab.css'

type MusicStatus = 'candidate' | 'selected' | 'archived'
type MusicWave = 'square' | 'triangle' | 'sawtooth' | 'noise'

type MusicNote = [startBeat: number, durationBeats: number, midi: number, velocity: number]

type MusicTrack = {
  id: string
  name: string
  wave: MusicWave
  gain: number
  notes: MusicNote[]
}

type MusicStage = {
  label: string
  bpm: number
  variant: string
  activeTracks: string[]
}

type MusicComposition = {
  id: string
  gameId: string
  gameTitle: string
  name: string
  status: MusicStatus
  createdAt: string
  summary: string
  concept: string[]
  key: string
  meter: string
  loopBeats: number
  midiExports: string[]
  stages: MusicStage[]
  variants: Record<string, MusicTrack[]>
}

type MusicCatalog = {
  version: number
  rule: string
  compositions: MusicComposition[]
}

type Filter = 'candidate' | 'selected' | 'archived' | 'all'
type PlaybackMode = 'single' | 'escalation'

type PlaybackState = {
  compositionId: string
  stageIndex: number
  mode: PlaybackMode
}

type ScheduledSource = OscillatorNode | AudioBufferSourceNode

const musicCatalog = musicCatalogSource as unknown as MusicCatalog

const FILTERS: Array<{ id: Filter, label: string }> = [
  { id: 'candidate', label: 'À ÉCOUTER' },
  { id: 'selected', label: 'RETENUES' },
  { id: 'archived', label: 'ARCHIVES' },
  { id: 'all', label: 'TOUT' },
]

const STATUS_LABEL: Record<MusicStatus, string> = {
  candidate: 'À ÉCOUTER',
  selected: 'RETENUE',
  archived: 'ARCHIVE',
}

function midiFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function makeNoiseBuffer(context: AudioContext) {
  const length = Math.max(1, Math.floor(context.sampleRate * 0.7))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let value = 0
  for (let index = 0; index < data.length; index += 1) {
    value = value * 0.62 + (Math.random() * 2 - 1) * 0.38
    data[index] = value
  }
  return buffer
}

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  track: MusicTrack,
  note: MusicNote,
  startTime: number,
  secondsPerBeat: number,
  sources: ScheduledSource[],
) {
  const [startBeat, durationBeats, midi, velocity] = note
  const start = startTime + startBeat * secondsPerBeat
  const duration = Math.max(0.025, durationBeats * secondsPerBeat)
  const end = start + duration
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  oscillator.frequency.setValueAtTime(midiFrequency(midi), start)
  const level = clamp((velocity / 127) * track.gain, 0.002, 0.22)
  envelope.gain.setValueAtTime(0.0001, start)
  envelope.gain.exponentialRampToValueAtTime(level, start + Math.min(0.009, duration * 0.2))
  envelope.gain.setValueAtTime(level, Math.max(start + 0.01, end - 0.024))
  envelope.gain.exponentialRampToValueAtTime(0.0001, end)
  oscillator.connect(envelope).connect(destination)
  oscillator.start(start)
  oscillator.stop(end + 0.025)
  sources.push(oscillator)
}

function scheduleNoise(
  context: AudioContext,
  destination: AudioNode,
  noiseBuffer: AudioBuffer,
  track: MusicTrack,
  note: MusicNote,
  startTime: number,
  secondsPerBeat: number,
  sources: ScheduledSource[],
) {
  const [startBeat, durationBeats, midi, velocity] = note
  const start = startTime + startBeat * secondsPerBeat
  const duration = Math.max(0.028, Math.min(0.16, durationBeats * secondsPerBeat))
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const envelope = context.createGain()
  source.buffer = noiseBuffer
  if (midi <= 37) {
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(260, start)
  } else if (midi <= 40) {
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, start)
    filter.Q.setValueAtTime(0.8, start)
  } else {
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(midi >= 46 ? 6000 : 3600, start)
  }
  const level = clamp((velocity / 127) * track.gain * 1.45, 0.004, 0.24)
  envelope.gain.setValueAtTime(level, start)
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  source.connect(filter).connect(envelope).connect(destination)
  source.start(start)
  source.stop(start + duration + 0.02)
  sources.push(source)
}

export function MusicLab() {
  const [filter, setFilter] = useState<Filter>('candidate')
  const [gameFilter, setGameFilter] = useState('all')
  const [stageByComposition, setStageByComposition] = useState<Record<string, number>>({})
  const [playback, setPlayback] = useState<PlaybackState | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)
  const scheduledSourcesRef = useRef<ScheduledSource[]>([])
  const loopTimerRef = useRef<number | null>(null)
  const playbackRef = useRef<PlaybackState | null>(null)
  const nextLoopStartRef = useRef(0)

  const games = useMemo(() => {
    const unique = new Map<string, string>()
    for (const composition of musicCatalog.compositions) unique.set(composition.gameId, composition.gameTitle)
    return [...unique.entries()].map(([id, title]) => ({ id, title }))
  }, [])

  const compositions = useMemo(() => {
    return musicCatalog.compositions
      .filter((composition) => filter === 'all' || composition.status === filter)
      .filter((composition) => gameFilter === 'all' || composition.gameId === gameFilter)
      .slice()
      .sort((left, right) => right.id.localeCompare(left.id))
  }, [filter, gameFilter])

  const stopPlayback = useCallback(() => {
    if (loopTimerRef.current !== null) {
      window.clearTimeout(loopTimerRef.current)
      loopTimerRef.current = null
    }
    for (const source of scheduledSourcesRef.current) {
      try { source.stop() } catch { /* Already stopped. */ }
    }
    scheduledSourcesRef.current = []
    playbackRef.current = null
    setPlayback(null)
  }, [])

  const ensureAudio = useCallback(async () => {
    let context = audioContextRef.current
    if (!context) {
      context = new AudioContext({ latencyHint: 'interactive' })
      const master = context.createGain()
      const compressor = context.createDynamicsCompressor()
      master.gain.value = 0.72
      compressor.threshold.value = -15
      compressor.knee.value = 8
      compressor.ratio.value = 5
      compressor.attack.value = 0.004
      compressor.release.value = 0.14
      master.connect(compressor).connect(context.destination)
      audioContextRef.current = context
      masterRef.current = master
      noiseBufferRef.current = makeNoiseBuffer(context)
    }
    if (context.state === 'suspended') await context.resume()
    return context
  }, [])

  const scheduleLoop = useCallback((composition: MusicComposition, state: PlaybackState, loopStart: number) => {
    const context = audioContextRef.current
    const master = masterRef.current
    const noiseBuffer = noiseBufferRef.current
    if (!context || !master || !noiseBuffer) return

    const stage = composition.stages[state.stageIndex]
    if (!stage) return
    const tracks = composition.variants[stage.variant] ?? []
    const activeTracks = new Set(stage.activeTracks)
    const secondsPerBeat = 60 / stage.bpm
    const loopDuration = composition.loopBeats * secondsPerBeat

    for (const track of tracks) {
      if (!activeTracks.has(track.id)) continue
      for (const note of track.notes) {
        if (track.wave === 'noise') {
          scheduleNoise(context, master, noiseBuffer, track, note, loopStart, secondsPerBeat, scheduledSourcesRef.current)
        } else {
          scheduleTone(context, master, track, note, loopStart, secondsPerBeat, scheduledSourcesRef.current)
        }
      }
    }

    nextLoopStartRef.current = loopStart + loopDuration
    const delay = Math.max(60, (loopDuration - 0.18) * 1000)
    loopTimerRef.current = window.setTimeout(() => {
      const current = playbackRef.current
      if (!current || current.compositionId !== composition.id) return
      let nextState = current
      if (current.mode === 'escalation' && current.stageIndex < composition.stages.length - 1) {
        nextState = { ...current, stageIndex: current.stageIndex + 1 }
        playbackRef.current = nextState
        setPlayback(nextState)
        setStageByComposition((previous) => ({ ...previous, [composition.id]: nextState.stageIndex }))
      }
      scheduleLoop(composition, nextState, nextLoopStartRef.current)
    }, delay)
  }, [])

  const play = useCallback(async (composition: MusicComposition, mode: PlaybackMode, explicitStage?: number) => {
    stopPlayback()
    const context = await ensureAudio()
    const requestedStage = clamp(explicitStage ?? stageByComposition[composition.id] ?? 0, 0, composition.stages.length - 1)
    const stageIndex = mode === 'escalation' ? 0 : requestedStage
    const state: PlaybackState = { compositionId: composition.id, stageIndex, mode }
    playbackRef.current = state
    setPlayback(state)
    if (mode === 'escalation') setStageByComposition((previous) => ({ ...previous, [composition.id]: 0 }))
    const startAt = context.currentTime + 0.06
    nextLoopStartRef.current = startAt
    scheduleLoop(composition, state, startAt)
  }, [ensureAudio, scheduleLoop, stageByComposition, stopPlayback])

  const changeStage = useCallback((composition: MusicComposition, nextStage: number) => {
    const bounded = clamp(nextStage, 0, composition.stages.length - 1)
    setStageByComposition((previous) => ({ ...previous, [composition.id]: bounded }))
    const current = playbackRef.current
    if (current?.compositionId === composition.id) {
      void play(composition, 'single', bounded)
    }
  }, [play])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Music Lab · MiniFugg God Mode'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => () => {
    stopPlayback()
    const context = audioContextRef.current
    if (context) void context.close()
  }, [stopPlayback])

  return (
    <main className="mf-music-lab">
      <header className="mf-music-lab__head">
        <div>
          <small>MINIFUGG / USR: MOIGOD</small>
          <h1>MUSIC LAB</h1>
          <p>Écoute directe dans le navigateur. Aucun lecteur MIDI du téléphone n’est utilisé.</p>
        </div>
        <div className="mf-music-lab__counter">
          <b>{musicCatalog.compositions.length}</b>
          <span>CRÉATIONS CONSERVÉES</span>
        </div>
      </header>

      <section className="mf-music-lab__toolbar" aria-label="Filtres Music Lab">
        <div className="mf-music-lab__tabs">
          {FILTERS.map((item) => (
            <button type="button" data-active={filter === item.id} onClick={() => setFilter(item.id)} key={item.id}>{item.label}</button>
          ))}
        </div>
        <label>
          <span>JEU</span>
          <select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)}>
            <option value="all">Tous</option>
            {games.map((game) => <option value={game.id} key={game.id}>{game.title}</option>)}
          </select>
        </label>
      </section>

      <section className="mf-music-lab__list">
        {compositions.map((composition) => {
          const selectedStage = clamp(stageByComposition[composition.id] ?? 0, 0, composition.stages.length - 1)
          const stage = composition.stages[selectedStage]
          const isPlaying = playback?.compositionId === composition.id
          const liveStage = isPlaying ? composition.stages[playback.stageIndex] : stage
          return (
            <article className="mf-music-card" data-status={composition.status} data-playing={isPlaying ? 'true' : 'false'} key={composition.id}>
              <div className="mf-music-card__number">
                <span>{composition.id}</span>
                <b>{STATUS_LABEL[composition.status]}</b>
              </div>

              <div className="mf-music-card__title">
                <small>{composition.gameTitle}</small>
                <h2>{composition.name}</h2>
                <p>{composition.summary}</p>
              </div>

              <div className="mf-music-card__tags">
                {composition.concept.map((tag) => <span key={tag}>{tag}</span>)}
              </div>

              <div className="mf-music-card__math">
                <span>{composition.key}</span>
                <span>{composition.meter}</span>
                <span>{composition.loopBeats / 4} mesures</span>
                <span>{composition.midiExports.length} exports MIDI</span>
              </div>

              <div className="mf-music-card__stages">
                <div className="mf-music-card__stage-head">
                  <strong>INTENSITÉ</strong>
                  <span>{liveStage.label} · {liveStage.bpm} BPM</span>
                </div>
                <div className="mf-music-card__stage-buttons">
                  {composition.stages.map((candidate, index) => (
                    <button
                      type="button"
                      data-active={(isPlaying ? playback.stageIndex : selectedStage) === index}
                      onClick={() => changeStage(composition, index)}
                      aria-label={`Niveau ${candidate.label}, ${candidate.bpm} BPM`}
                      key={`${composition.id}-${candidate.label}`}
                    >
                      <b>{candidate.label}</b><small>{candidate.bpm}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mf-music-card__transport">
                <button type="button" className="primary" onClick={() => isPlaying ? stopPlayback() : void play(composition, 'single')}>
                  {isPlaying ? '■ STOP' : '▶ ÉCOUTER'}
                </button>
                <button type="button" onClick={() => void play(composition, 'escalation')}>↗ 1 → MAX</button>
              </div>

              <footer>
                <span>Créée le {composition.createdAt}</span>
                <span>Les fichiers MIDI restent archivés même après décision.</span>
              </footer>
            </article>
          )
        })}

        {compositions.length === 0 && (
          <div className="mf-music-lab__empty">Aucune création dans ce filtre.</div>
        )}
      </section>

      <footer className="mf-music-lab__rule">
        <strong>RÈGLE DU LAB</strong>
        <span>{musicCatalog.rule}</span>
      </footer>
    </main>
  )
}
