import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { musicCatalog as source } from './catalog'

type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }
type Stage = { label: string, bpm: number, variant: string, activeTracks: readonly string[] }
type Composition = {
  id: string
  status: 'candidate' | 'selected' | 'archived'
  loopBeats: number
  stages: readonly Stage[]
  variants: Record<string, readonly Track[]>
}
type Catalog = { compositions: readonly Composition[] }
type SourceNode = OscillatorNode | AudioBufferSourceNode

type Options = {
  rootRef: RefObject<HTMLElement>
  armed: boolean
  playing: boolean
  seed: number
  restartToken: number
}

const musicCatalog = source as unknown as Catalog
const TETRA_IDS = ['MF-MUS-0001', 'MF-MUS-0002'] as const
const BEATS_PER_BAR = 4

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function noiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .5), context.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < data.length; index += 1) {
    previous = previous * .6 + (Math.random() * 2 - 1) * .4
    data[index] = previous
  }
  return buffer
}

function scheduleTone(
  context: AudioContext,
  output: AudioNode,
  track: Track,
  note: Note,
  localBeat: number,
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [, durationBeats, midi, velocity] = note
  const start = origin + localBeat * beatSeconds
  const duration = Math.max(.025, durationBeats * beatSeconds)
  const end = start + duration
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  oscillator.frequency.setValueAtTime(hz(midi), start)

  const level = clamp(velocity / 127 * track.gain, .0015, .16)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.01, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .012, end - .022))
  gain.gain.exponentialRampToValueAtTime(.0001, end)
  oscillator.connect(gain).connect(output)
  oscillator.start(start)
  oscillator.stop(end + .025)
  sources.push(oscillator)
}

function scheduleNoise(
  context: AudioContext,
  output: AudioNode,
  buffer: AudioBuffer,
  track: Track,
  note: Note,
  localBeat: number,
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [, durationBeats, midi, velocity] = note
  const start = origin + localBeat * beatSeconds
  const duration = Math.max(.025, Math.min(.13, durationBeats * beatSeconds))
  const sourceNode = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  sourceNode.buffer = buffer

  if (midi <= 37) {
    filter.type = 'lowpass'
    filter.frequency.value = 240
  } else if (midi <= 40) {
    filter.type = 'bandpass'
    filter.frequency.value = 1050
  } else {
    filter.type = 'highpass'
    filter.frequency.value = midi >= 46 ? 4700 : 3100
  }

  gain.gain.setValueAtTime(clamp(velocity / 127 * track.gain * 1.25, .003, .17), start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  sourceNode.connect(filter).connect(gain).connect(output)
  sourceNode.start(start)
  sourceNode.stop(start + duration + .02)
  sources.push(sourceNode)
}

function levelFromRoot(root: HTMLElement | null) {
  if (!root) return 1
  const value = Number(root.querySelector('.calc-drop-level strong')?.textContent)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

export function useTetraMindFckMusic({ rootRef, armed, playing, seed, restartToken }: Options) {
  const [level, setLevel] = useState(1)
  const contextRef = useRef<AudioContext | null>(null)
  const outputRef = useRef<GainNode | null>(null)
  const noiseRef = useRef<AudioBuffer | null>(null)
  const sourcesRef = useRef<SourceNode[]>([])
  const timerRef = useRef<number | null>(null)
  const nextStartRef = useRef(0)
  const barRef = useRef(0)
  const levelRef = useRef(1)
  const armedRef = useRef(armed)
  const playingRef = useRef(playing)

  const compositions = useMemo(() => TETRA_IDS
    .map((id) => musicCatalog.compositions.find((item) => item.id === id))
    .filter((item): item is Composition => Boolean(item)), [])

  const composition = useMemo(() => {
    if (compositions.length === 0) return null
    const index = Math.abs((seed ^ Math.imul(restartToken + 1, 0x45d9f3b)) | 0) % compositions.length
    return compositions[index]
  }, [compositions, restartToken, seed])

  useEffect(() => { armedRef.current = armed }, [armed])
  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { levelRef.current = level }, [level])

  const stopSources = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    sourcesRef.current.forEach((node) => {
      try { node.stop() } catch { /* already stopped */ }
    })
    sourcesRef.current = []
  }, [])

  const ensureAudio = useCallback(async () => {
    if (!contextRef.current) {
      const context = new AudioContext({ latencyHint: 'interactive' })
      const output = context.createGain()
      const lowpass = context.createBiquadFilter()
      const compressor = context.createDynamicsCompressor()
      output.gain.value = .58
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 8200
      lowpass.Q.value = .25
      compressor.threshold.value = -17
      compressor.knee.value = 10
      compressor.ratio.value = 4
      compressor.attack.value = .008
      compressor.release.value = .16
      output.connect(lowpass).connect(compressor).connect(context.destination)
      contextRef.current = context
      outputRef.current = output
      noiseRef.current = noiseBuffer(context)
    }
    if (contextRef.current.state === 'suspended') await contextRef.current.resume()
    return contextRef.current
  }, [])

  const scheduleBarRef = useRef<() => void>(() => undefined)
  scheduleBarRef.current = () => {
    const context = contextRef.current
    const output = outputRef.current
    const noise = noiseRef.current
    if (!context || !output || !noise || !composition || !playingRef.current) return

    const stageIndex = clamp(levelRef.current - 1, 0, composition.stages.length - 1)
    const stage = composition.stages[stageIndex]
    const tracks = composition.variants[stage.variant] ?? []
    const enabled = new Set(stage.activeTracks)
    const beatSeconds = 60 / stage.bpm
    const barSeconds = BEATS_PER_BAR * beatSeconds
    const barsInLoop = Math.max(1, Math.round(composition.loopBeats / BEATS_PER_BAR))
    const barIndex = barRef.current % barsInLoop
    const barBeat = barIndex * BEATS_PER_BAR
    const endBeat = barBeat + BEATS_PER_BAR
    const origin = nextStartRef.current || context.currentTime + .045

    tracks.filter((track) => enabled.has(track.id)).forEach((track) => {
      track.notes.forEach((note) => {
        const noteBeat = note[0]
        if (noteBeat < barBeat || noteBeat >= endBeat) return
        const localBeat = noteBeat - barBeat
        if (track.wave === 'noise') scheduleNoise(context, output, noise, track, note, localBeat, origin, beatSeconds, sourcesRef.current)
        else scheduleTone(context, output, track, note, localBeat, origin, beatSeconds, sourcesRef.current)
      })
    })

    barRef.current = (barIndex + 1) % barsInLoop
    nextStartRef.current = origin + barSeconds
    timerRef.current = window.setTimeout(() => scheduleBarRef.current(), Math.max(90, (barSeconds - .12) * 1000))
  }

  const startPlayback = useCallback(async () => {
    if (!composition || !playingRef.current) return
    const context = await ensureAudio()
    stopSources()
    nextStartRef.current = context.currentTime + .05
    scheduleBarRef.current()
  }, [composition, ensureAudio, stopSources])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sync = () => setLevel(levelFromRoot(root))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [restartToken, rootRef])

  useEffect(() => {
    const unlock = () => {
      if (!armedRef.current) return
      void ensureAudio().then(() => {
        if (playingRef.current && timerRef.current === null) void startPlayback()
      })
    }
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('keydown', unlock, true)
    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('keydown', unlock, true)
    }
  }, [ensureAudio, startPlayback])

  useEffect(() => {
    barRef.current = 0
    nextStartRef.current = 0
    stopSources()
    if (!playing) {
      if (contextRef.current?.state === 'running') void contextRef.current.suspend()
      return
    }
    if (contextRef.current) void startPlayback()
  }, [composition, playing, restartToken, startPlayback, stopSources])

  useEffect(() => () => {
    stopSources()
    if (contextRef.current) void contextRef.current.close()
    contextRef.current = null
  }, [stopSources])

  return { compositionId: composition?.id ?? null, level }
}
