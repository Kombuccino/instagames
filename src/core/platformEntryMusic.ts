import { SymbolicMusicPlayer } from '../audio/symbolicMusicPlayer'
import { rememberAudioSource } from '../audio/coreAudioManager'
import { isAudioLabEnhancedDrumTrack, scheduleAudioLabEnhancedDrum } from './audioLabDrumSynth'
import {
  ENTRY_METRO_BEATS_PER_RAIL_CYCLE,
  ENTRY_METRO_BPM,
  ENTRY_METRO_LOOP_BEATS,
  ENTRY_METRO_RAIL_CYCLE_SECONDS,
  metroSunsetEntry,
} from '../music/metroSunsetEntry'

type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }
type SourceNode = OscillatorNode | AudioBufferSourceNode

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
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, durationBeats * beatSeconds)
  const end = start + duration
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  oscillator.frequency.setValueAtTime(hz(midi), start)

  // The entry scene intentionally leaves more headroom than the Audio Lab.
  // Laptop speakers are especially unforgiving when bass + rail transients stack.
  const level = clamp(velocity / 127 * track.gain, .0015, .105)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.012, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .014, end - .025))
  gain.gain.exponentialRampToValueAtTime(.0001, end)

  oscillator.connect(gain).connect(output)
  oscillator.start(start)
  oscillator.stop(end + .02)
  rememberAudioSource(sources, oscillator, [gain])
}

function scheduleNoise(
  context: AudioContext,
  output: AudioNode,
  noise: AudioBuffer,
  track: Track,
  note: Note,
  origin: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [beat, durationBeats, midi, velocity] = note
  const start = origin + beat * beatSeconds
  const duration = Math.max(.025, Math.min(.16, durationBeats * beatSeconds))
  const source = context.createBufferSource()
  const high = context.createBiquadFilter()
  const low = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = noise

  high.type = 'highpass'
  high.frequency.value = midi >= 46 ? 5200 : 3400
  low.type = 'lowpass'
  low.frequency.value = midi >= 46 ? 9800 : 8200
  const level = clamp(velocity / 127 * track.gain * 1.15, .0025, .075)
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)

  source.connect(high).connect(low).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  rememberAudioSource(sources, source, [high, low, gain])
}

export type PlatformEntryMusicController = {
  start(): Promise<boolean>
  fadeOut(seconds?: number): void
  stop(): void
}

export function createPlatformEntryMusic(sceneStartedAtMs: number): PlatformEntryMusicController {
  const tracks = metroSunsetEntry() as Track[]
  const player = new SymbolicMusicPlayer({
    composition: {
      id: 'entry-metro-sunset', loopBeats: ENTRY_METRO_LOOP_BEATS,
      stages: [{ label: 'Entry', bpm: ENTRY_METRO_BPM, variant: 'entry', activeTracks: tracks.map(t => t.id) }],
      variants: { entry: tracks },
    },
    gain: .47,
    filters: [{ type: 'highpass', frequency: 58, Q: .55 }, { type: 'lowpass', frequency: 10800, Q: .18 }],
    initialBeat: () => ((performance.now() - sceneStartedAtMs) / 1000
      / ENTRY_METRO_RAIL_CYCLE_SECONDS * ENTRY_METRO_BEATS_PER_RAIL_CYCLE) % ENTRY_METRO_LOOP_BEATS,
    customNoteScheduler: ({ context, output, noise, track, note, start, sources }) => {
      if (isAudioLabEnhancedDrumTrack(track.id)) {
        scheduleAudioLabEnhancedDrum({ context, output, noise, trackId: track.id, midi: note[2],
          velocity: note[3], trackGain: track.gain, start, durationScale: 1, sources })
      } else {
        const local: Note = [0, note[1], note[2], note[3]]
        if (track.wave === 'noise') scheduleNoise(context, output, noise, track as Track, local, start, 60 / ENTRY_METRO_BPM, sources)
        else scheduleTone(context, output, track as Track, local, start, 60 / ENTRY_METRO_BPM, sources)
      }
      return true
    },
  })
  return { start: () => player.start(), fadeOut: (seconds = .75) => player.stop(seconds), stop: () => player.destroy() }
}
