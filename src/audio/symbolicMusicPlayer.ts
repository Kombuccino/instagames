import { coreAudio, rememberAudioSource, type AudioVoice, type MusicHandle } from './coreAudioManager'

export type SymbolicNote = readonly [startBeat: number, durationBeats: number, midi: number, velocity: number]
export type SymbolicWave = 'square' | 'triangle' | 'sawtooth' | 'noise'

export type SymbolicTrack = {
  readonly id: string
  readonly name: string
  readonly wave: SymbolicWave
  readonly gain: number
  readonly notes: readonly SymbolicNote[]
}

export type SymbolicStage = {
  readonly label: string
  readonly bpm: number
  readonly variant: string
  readonly activeTracks: readonly string[]
}

export type SymbolicComposition = {
  readonly id: string
  readonly loopBeats: number
  readonly stages: readonly SymbolicStage[]
  readonly variants: Readonly<Record<string, readonly SymbolicTrack[]>>
}

type SourceNode = OscillatorNode | AudioBufferSourceNode

export type SymbolicCustomNoteInput = {
  context: AudioContext
  output: AudioNode
  noise: AudioBuffer
  track: SymbolicTrack
  note: SymbolicNote
  start: number
  beatSeconds: number
  durationScale: number
  sources: SourceNode[]
}

export type SymbolicCustomNoteScheduler = (input: SymbolicCustomNoteInput) => boolean

export type SymbolicMusicPlayerOptions = {
  composition: SymbolicComposition
  stageIndex?: number
  getStageIndex?: () => number
  initialBeat?: () => number
  filters?: readonly { type: BiquadFilterType, frequency: number, Q?: number }[]
  gain?: number
  customNoteScheduler?: SymbolicCustomNoteScheduler
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .5), context.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0

  for (let index = 0; index < data.length; index += 1) {
    previous = previous * .58 + (Math.random() * 2 - 1) * .42
    data[index] = previous
  }

  return buffer
}

function scheduleTone(
  context: AudioContext,
  output: AudioNode,
  track: SymbolicTrack,
  note: SymbolicNote,
  start: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [, durationBeats, midi, velocity] = note
  const duration = Math.max(.025, durationBeats * beatSeconds)
  const end = start + duration
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = track.wave === 'triangle'
    ? 'triangle'
    : track.wave === 'sawtooth'
      ? 'sawtooth'
      : 'square'
  oscillator.frequency.setValueAtTime(hz(midi), start)

  const level = clamp(velocity / 127 * track.gain, .002, .2)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.009, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .01, end - .02))
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
  track: SymbolicTrack,
  note: SymbolicNote,
  start: number,
  beatSeconds: number,
  sources: SourceNode[],
) {
  const [, durationBeats, midi, velocity] = note
  const duration = Math.max(.025, Math.min(.3, durationBeats * beatSeconds))
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()

  source.buffer = noise
  if (midi <= 37) {
    filter.type = 'lowpass'
    filter.frequency.value = 260
  } else if (midi <= 40) {
    filter.type = 'bandpass'
    filter.frequency.value = 1200
  } else {
    filter.type = 'highpass'
    filter.frequency.value = midi >= 46 ? 6000 : 3600
  }

  gain.gain.setValueAtTime(clamp(velocity / 127 * track.gain * 1.4, .004, .22), start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)

  source.connect(filter).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  rememberAudioSource(sources, source, [filter, gain])
}

export class SymbolicMusicPlayer {
  private voice: AudioVoice | null = null
  private output: AudioNode | null = null
  private noise: AudioBuffer | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private beat = 0
  private nextBeat = 0
  private nextStart = 0
  private segments: { time: number, beat: number, seconds: number }[] = []
  private initialized = false
  private stageIndex = 0
  readonly handle: MusicHandle

  constructor(private readonly options: SymbolicMusicPlayerOptions) {
    this.handle = coreAudio.createMusic(options.composition.id, {
      start: (voice) => {
        this.voice = voice
        this.output = voice.output
        for (const settings of [...options.filters ?? []].reverse()) {
          const filter = voice.context.createBiquadFilter()
          filter.type = settings.type
          filter.frequency.value = settings.frequency
          filter.Q.value = settings.Q ?? .25
          filter.connect(this.output)
          voice.own(filter)
          this.output = filter
        }
        this.noise ??= createNoiseBuffer(voice.context)
        if (!this.initialized) {
          this.beat = options.initialBeat?.() ?? 0
          this.stageIndex = options.getStageIndex?.() ?? options.stageIndex ?? 0
        }
        this.initialized = true
        this.nextBeat = this.beat
        this.nextStart = voice.context.currentTime + .035
        this.segments = []
        this.schedule()
      },
      pause: () => {
        if (this.timer !== null) clearTimeout(this.timer)
        this.timer = null
        const now = this.voice?.context.currentTime ?? 0
        const segment = this.segments.filter((part) => part.time <= now).at(-1)
        if (segment) this.beat = (segment.beat + (now - segment.time) / segment.seconds) % options.composition.loopBeats
        this.voice = null
      },
      reset: () => { this.beat = 0; this.initialized = false; this.segments = [] },
    }, options.gain ?? 1)
  }
  start() { return this.handle.start() }
  resume() { return this.handle.resume() }
  pause() { this.handle.pause() }
  stop(seconds?: number) { this.handle.stop(seconds) }
  destroy() { this.handle.destroy() }

  private schedule() {
    const voice = this.voice
    if (!voice || voice.context.state !== 'running' || !this.noise) return
    const { context, sources } = voice
    const output = this.output ?? voice.output
    const composition = this.options.composition
    // Schedule a quarter beat at a time with 150ms lookahead, never a whole long loop.
    if (this.nextStart < context.currentTime) this.nextStart = context.currentTime + .025
    while (this.nextStart < context.currentTime + .15) {
      if (Math.abs(this.nextBeat % 4) < .00001) this.stageIndex = this.options.getStageIndex?.() ?? this.options.stageIndex ?? 0
      const stage = composition.stages[clamp(this.stageIndex, 0, composition.stages.length - 1)]
      if (!stage) return
      const beatSeconds = 60 / stage.bpm
      const endBeat = Math.min(composition.loopBeats, this.nextBeat + .25)
      const origin = this.nextStart
      this.segments.push({ time: origin, beat: this.nextBeat, seconds: beatSeconds })
      while (this.segments.length > 2 && this.segments[1].time <= context.currentTime) this.segments.shift()
      for (const track of composition.variants[stage.variant] ?? []) {
        if (!stage.activeTracks.includes(track.id)) continue
        for (const note of track.notes) {
          if (note[0] < this.nextBeat || note[0] >= endBeat) continue
          const start = origin + (note[0] - this.nextBeat) * beatSeconds
          const handled = this.options.customNoteScheduler?.({ context, output, noise: this.noise,
            track, note, start, beatSeconds, durationScale: 1, sources }) ?? false
          if (!handled) {
            if (track.wave === 'noise') scheduleNoise(context, output, this.noise, track, note, start, beatSeconds, sources)
            else scheduleTone(context, output, track, note, start, beatSeconds, sources)
          }
        }
      }
      this.nextStart += (endBeat - this.nextBeat) * beatSeconds
      this.nextBeat = endBeat >= composition.loopBeats ? 0 : endBeat
    }
    this.timer = setTimeout(() => this.schedule(), 35)
  }
}
