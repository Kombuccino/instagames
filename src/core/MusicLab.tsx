import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { musicCatalog as source } from '../music/catalog'
import { SoundDesignLab } from './SoundDesignLab'
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
type Playback = { compositionId: string, stageIndex: number, escalation: boolean }
type SourceNode = OscillatorNode | AudioBufferSourceNode

const musicCatalog = source as unknown as Catalog
const FILTERS: Array<[Filter, string]> = [['candidate', 'À ÉCOUTER'], ['selected', 'RETENUES'], ['archived', 'ARCHIVES'], ['all', 'TOUT']]
const STATUS_LABEL: Record<Status, string> = { candidate: 'À ÉCOUTER', selected: 'RETENUE', archived: 'ARCHIVE' }

function hz(note: number) { return 440 * Math.pow(2, (note - 69) / 12) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

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

function scheduleTone(context: AudioContext, output: AudioNode, track: Track, note: Note, origin: number, beatSeconds: number, sources: SourceNode[]) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, durationBeats * beatSeconds)
  const end = start + duration
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  osc.frequency.setValueAtTime(hz(midi), start)
  const level = clamp(velocity / 127 * track.gain, .002, .2)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.009, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .01, end - .02))
  gain.gain.exponentialRampToValueAtTime(.0001, end)
  osc.connect(gain).connect(output)
  osc.start(start)
  osc.stop(end + .02)
  sources.push(osc)
}

function scheduleNoise(context: AudioContext, output: AudioNode, buffer: AudioBuffer, track: Track, note: Note, origin: number, beatSeconds: number, sources: SourceNode[]) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, Math.min(.15, durationBeats * beatSeconds))
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  if (midi <= 37) { filter.type = 'lowpass'; filter.frequency.value = 260 }
  else if (midi <= 40) { filter.type = 'bandpass'; filter.frequency.value = 1200 }
  else { filter.type = 'highpass'; filter.frequency.value = midi >= 46 ? 6000 : 3600 }
  gain.gain.setValueAtTime(clamp(velocity / 127 * track.gain * 1.4, .004, .22), start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(filter).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  sources.push(source)
}

export function MusicLab() {
  const [filter, setFilter] = useState<Filter>('all')
  const [game, setGame] = useState('all')
  const [stages, setStages] = useState<Record<string, number>>({})
  const [playback, setPlayback] = useState<Playback | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const outputRef = useRef<GainNode | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const sourcesRef = useRef<SourceNode[]>([])
  const timerRef = useRef<number | null>(null)
  const stateRef = useRef<Playback | null>(null)
  const nextStartRef = useRef(0)

  const games = useMemo(() => [...new Map(musicCatalog.compositions.map((item) => [item.gameId, item.gameTitle])).entries()], [])
  const shown = useMemo(() => musicCatalog.compositions
    .filter((item) => filter === 'all' || item.status === filter)
    .filter((item) => game === 'all' || item.gameId === game)
    .slice().sort((a, b) => b.id.localeCompare(a.id)), [filter, game])

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    sourcesRef.current.forEach((node) => { try { node.stop() } catch { /* already ended */ } })
    sourcesRef.current = []
    stateRef.current = null
    setPlayback(null)
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

    tracks.filter((track) => enabled.has(track.id)).forEach((track) => track.notes.forEach((note) => {
      if (track.wave === 'noise') scheduleNoise(context, output, noise, track, note, origin, beatSeconds, sourcesRef.current)
      else scheduleTone(context, output, track, note, origin, beatSeconds, sourcesRef.current)
    }))

    nextStartRef.current = origin + loopSeconds
    timerRef.current = window.setTimeout(() => {
      const current = stateRef.current
      if (!current || current.compositionId !== composition.id) return
      let next = current
      if (current.escalation && current.stageIndex < composition.stages.length - 1) {
        next = { ...current, stageIndex: current.stageIndex + 1 }
        stateRef.current = next
        setPlayback(next)
        setStages((old) => ({ ...old, [composition.id]: next.stageIndex }))
      }
      scheduleLoop(composition, next, nextStartRef.current)
    }, Math.max(80, (loopSeconds - .15) * 1000))
  }, [])

  const play = useCallback(async (composition: Composition, escalation = false, requestedStage?: number) => {
    stop()
    const context = await ensureAudio()
    const stageIndex = escalation ? 0 : clamp(requestedStage ?? stages[composition.id] ?? 0, 0, composition.stages.length - 1)
    const state = { compositionId: composition.id, stageIndex, escalation }
    stateRef.current = state
    setPlayback(state)
    if (escalation) setStages((old) => ({ ...old, [composition.id]: 0 }))
    scheduleLoop(composition, state, context.currentTime + .06)
  }, [ensureAudio, scheduleLoop, stages, stop])

  const chooseStage = useCallback((composition: Composition, index: number) => {
    setStages((old) => ({ ...old, [composition.id]: index }))
    if (stateRef.current?.compositionId === composition.id) void play(composition, false, index)
  }, [play])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'Audio Lab · MiniFugg God Mode'
    return () => { document.title = oldTitle }
  }, [])

  useEffect(() => () => {
    stop()
    if (contextRef.current) void contextRef.current.close()
  }, [stop])

  return (
    <main className="mf-music-lab">
      <header className="mf-music-lab__head">
        <div><small>MINIFUGG / USR: MOIGOD</small><h1>AUDIO LAB</h1><p>Musiques réactives et sound design procédural, écoutables directement dans le navigateur.</p></div>
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
              <div className="mf-music-card__transport"><button type="button" className="primary" onClick={() => isPlaying ? stop() : void play(composition)}>{isPlaying ? '■ STOP' : '▶ ÉCOUTER'}</button><button type="button" onClick={() => void play(composition, true)}>↗ 1 → MAX</button></div>
              <footer><span>Créée le {composition.createdAt}</span><span>La source MIDI symbolique reste archivée après décision.</span></footer>
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
