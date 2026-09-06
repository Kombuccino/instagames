import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { SymbolicMusicPlayer } from '../audio/symbolicMusicPlayer'
import { rememberAudioSource } from '../audio/coreAudioManager'
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
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
  rememberAudioSource(sources, oscillator, [gain])
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
  rememberAudioSource(sources, sourceNode, [filter, gain])
}

function levelFromRoot(root: HTMLElement | null) {
  if (!root) return 1
  const value = Number(root.querySelector('.calc-drop-level strong')?.textContent)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

export function useTetraMindFckMusic({ rootRef, armed, playing, seed, restartToken }: Options) {
  const [level, setLevel] = useState(1)
  const levelRef = useRef(level)
  levelRef.current = level
  const composition = useMemo(() => {
    const choices = TETRA_IDS.map(id => musicCatalog.compositions.find(c => c.id === id)).filter((c): c is Composition => Boolean(c))
    return choices[Math.abs((seed ^ Math.imul(restartToken + 1, 0x45d9f3b)) | 0) % choices.length] ?? null
  }, [seed, restartToken])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sync = () => setLevel(levelFromRoot(root))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [rootRef, restartToken])
  const playerRef = useRef<SymbolicMusicPlayer | null>(null)
  useEffect(() => {
    if (!composition) return
    const player = new SymbolicMusicPlayer({
      composition, gain: .8,
      filters: [{ type: 'lowpass', frequency: 8200, Q: .25 }],
      getStageIndex: () => levelRef.current - 1,
      customNoteScheduler: ({ context, output, noise, track, note, start, beatSeconds, sources }) => {
        if (track.wave === 'noise') scheduleNoise(context, output, noise, track as Track, note as Note, 0, start, beatSeconds, sources)
        else scheduleTone(context, output, track as Track, note as Note, 0, start, beatSeconds, sources)
        return true
      },
    })
    playerRef.current = player
    return () => { player.destroy(); if (playerRef.current === player) playerRef.current = null }
  }, [composition])
  useEffect(() => {
    if (armed && playing) void playerRef.current?.start()
    else playerRef.current?.pause()
  }, [armed, playing, composition])
  return { compositionId: composition?.id ?? null, level }
}
