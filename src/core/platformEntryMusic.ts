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

const CHUNK_BEATS = 4
const START_AHEAD_SECONDS = .045

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function makeNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .5), context.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < data.length; index += 1) {
    previous = previous * .58 + (Math.random() * 2 - 1) * .42
    data[index] = previous
  }
  return buffer
}

function rememberSource(sources: SourceNode[], node: SourceNode) {
  sources.push(node)
  node.addEventListener('ended', () => {
    const index = sources.indexOf(node)
    if (index >= 0) sources.splice(index, 1)
  }, { once: true })
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
  rememberSource(sources, oscillator)
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
  rememberSource(sources, source)
}

export type PlatformEntryMusicController = {
  start(): Promise<boolean>
  fadeOut(seconds?: number): void
  stop(): void
}

export function createPlatformEntryMusic(sceneStartedAtMs: number): PlatformEntryMusicController {
  const tracks = metroSunsetEntry() as Track[]
  const beatSeconds = 60 / ENTRY_METRO_BPM
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let noise: AudioBuffer | null = null
  let timer: number | null = null
  let playing = false
  let nextBeat = 0
  let nextStart = 0
  const sources: SourceNode[] = []

  const sceneBeatNow = () => {
    const elapsedSeconds = Math.max(0, (performance.now() - sceneStartedAtMs) / 1000)
    const absoluteBeat = elapsedSeconds / ENTRY_METRO_RAIL_CYCLE_SECONDS * ENTRY_METRO_BEATS_PER_RAIL_CYCLE
    return absoluteBeat % ENTRY_METRO_LOOP_BEATS
  }

  const ensureContext = () => {
    if (context && context.state !== 'closed' && master && noise) return context

    context = new AudioContext()
    noise = makeNoiseBuffer(context)

    master = context.createGain()
    const lowpass = context.createBiquadFilter()
    const compressor = context.createDynamicsCompressor()

    // Conservative production headroom. The rail joint and bass can coincide,
    // so keep the scene comfortably below digital full scale before compression.
    master.gain.value = .38
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 10800
    lowpass.Q.value = .18
    compressor.threshold.value = -20
    compressor.knee.value = 10
    compressor.ratio.value = 7
    compressor.attack.value = .004
    compressor.release.value = .2
    master.connect(lowpass).connect(compressor).connect(context.destination)
    return context
  }

  const scheduleChunk = () => {
    if (!context || !master || !noise || !playing || context.state !== 'running') return

    const chunkStart = nextBeat
    const chunkEnd = Math.min(ENTRY_METRO_LOOP_BEATS, chunkStart + CHUNK_BEATS)
    const chunkBeats = Math.max(.05, chunkEnd - chunkStart)
    const chunkSeconds = chunkBeats * beatSeconds

    tracks.forEach((track) => {
      track.notes.forEach((note) => {
        if (note[0] < chunkStart || note[0] >= chunkEnd) return
        const localNote: Note = [note[0] - chunkStart, note[1], note[2], note[3]]

        if (isAudioLabEnhancedDrumTrack(track.id)) {
          scheduleAudioLabEnhancedDrum({
            context: context!,
            output: master!,
            noise: noise!,
            trackId: track.id,
            midi: localNote[2],
            velocity: localNote[3],
            trackGain: track.gain,
            start: nextStart + localNote[0] * beatSeconds,
            durationScale: 1,
            sources,
          })
        } else if (track.wave === 'noise') {
          scheduleNoise(context!, master!, noise!, track, localNote, nextStart, beatSeconds, sources)
        } else {
          scheduleTone(context!, master!, track, localNote, nextStart, beatSeconds, sources)
        }
      })
    })

    nextBeat = chunkEnd >= ENTRY_METRO_LOOP_BEATS - .0001 ? 0 : chunkEnd
    nextStart += chunkSeconds
    timer = window.setTimeout(scheduleChunk, Math.max(80, (chunkSeconds - .14) * 1000))
  }

  const start = async () => {
    const audioContext = ensureContext()
    if (playing && audioContext.state === 'running') return true

    try {
      if (audioContext.state === 'suspended') await audioContext.resume()
    } catch {
      return false
    }
    if (audioContext.state !== 'running') return false

    playing = true
    nextBeat = sceneBeatNow()
    nextStart = audioContext.currentTime + START_AHEAD_SECONDS
    scheduleChunk()
    return true
  }

  const fadeOut = (seconds = .75) => {
    if (!context || !master || context.state === 'closed') return
    const now = context.currentTime
    const current = Math.max(.0001, master.gain.value)
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(current, now)
    master.gain.exponentialRampToValueAtTime(.0001, now + Math.max(.08, seconds))
  }

  const stop = () => {
    playing = false
    if (timer !== null) window.clearTimeout(timer)
    timer = null
    sources.slice().forEach((source) => {
      try { source.stop() } catch { /* already ended */ }
    })
    sources.length = 0
    if (context && context.state !== 'closed') void context.close()
    context = null
    master = null
    noise = null
  }

  return { start, fadeOut, stop }
}
