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
  durationScale: number
  sources: SourceNode[]
}

export type SymbolicCustomNoteScheduler = (input: SymbolicCustomNoteInput) => boolean

type SymbolicMusicPlayerOptions = {
  composition: SymbolicComposition
  stageIndex?: number
  gain?: number
  customNoteScheduler?: SymbolicCustomNoteScheduler
}

let sharedContext: AudioContext | null = null
let sharedMaster: GainNode | null = null
let sharedNoise: AudioBuffer | null = null

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

async function ensureSharedAudio() {
  if (typeof window === 'undefined') return null

  if (!sharedContext) {
    const context = new AudioContext({ latencyHint: 'interactive' })
    const master = context.createGain()
    const compressor = context.createDynamicsCompressor()

    master.gain.value = .72
    compressor.threshold.value = -15
    compressor.knee.value = 8
    compressor.ratio.value = 5
    compressor.attack.value = .004
    compressor.release.value = .12

    master.connect(compressor).connect(context.destination)
    sharedContext = context
    sharedMaster = master
    sharedNoise = createNoiseBuffer(context)
  }

  if (sharedContext.state === 'suspended') {
    try { await sharedContext.resume() } catch { /* Browser still waiting for a user gesture. */ }
  }

  return sharedContext
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
  rememberSource(sources, oscillator)
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
  rememberSource(sources, source)
}

export class SymbolicMusicPlayer {
  private readonly composition: SymbolicComposition
  private readonly stageIndex: number
  private readonly gain: number
  private readonly customNoteScheduler?: SymbolicCustomNoteScheduler

  private output: GainNode | null = null
  private timer: number | null = null
  private sources: SourceNode[] = []
  private nextOrigin = 0
  private requested = false
  private playing = false
  private destroyed = false

  constructor(options: SymbolicMusicPlayerOptions) {
    this.composition = options.composition
    this.stageIndex = options.stageIndex ?? 0
    this.gain = clamp(options.gain ?? 1, 0, 1.5)
    this.customNoteScheduler = options.customNoteScheduler
  }

  async start() {
    if (this.destroyed) return false
    this.requested = true
    if (this.playing) return true

    const context = await ensureSharedAudio()
    if (!context || context.state !== 'running' || !sharedMaster || !sharedNoise) return false

    if (!this.output) {
      this.output = context.createGain()
      this.output.gain.value = this.gain
      this.output.connect(sharedMaster)
    }

    this.playing = true
    this.nextOrigin = context.currentTime + .035
    this.scheduleLoop(context)
    return true
  }

  async resume() {
    if (!this.requested || this.destroyed) return false
    return this.start()
  }

  pause() {
    if (!this.playing) return
    this.clearScheduledPlayback()
    this.playing = false
  }

  stop() {
    this.requested = false
    this.pause()
  }

  destroy() {
    if (this.destroyed) return
    this.stop()
    this.output?.disconnect()
    this.output = null
    this.destroyed = true
  }

  private clearScheduledPlayback() {
    if (this.timer !== null) window.clearTimeout(this.timer)
    this.timer = null

    this.sources.slice().forEach((source) => {
      try { source.stop() } catch { /* Source already ended. */ }
    })
    this.sources = []
    this.nextOrigin = 0
  }

  private scheduleLoop(context: AudioContext) {
    if (!this.playing || !this.output || !sharedNoise) return

    const stage = this.composition.stages[this.stageIndex] ?? this.composition.stages[0]
    if (!stage) return

    const tracks = this.composition.variants[stage.variant] ?? []
    const activeTracks = new Set(stage.activeTracks)
    const beatSeconds = 60 / stage.bpm
    const origin = this.nextOrigin

    tracks.forEach((track) => {
      if (!activeTracks.has(track.id)) return

      track.notes.forEach((note) => {
        const start = origin + note[0] * beatSeconds
        const handled = this.customNoteScheduler?.({
          context,
          output: this.output!,
          noise: sharedNoise!,
          track,
          note,
          start,
          durationScale: 1,
          sources: this.sources,
        }) ?? false

        if (handled) return
        if (track.wave === 'noise') scheduleNoise(context, this.output!, sharedNoise!, track, note, start, beatSeconds, this.sources)
        else scheduleTone(context, this.output!, track, note, start, beatSeconds, this.sources)
      })
    })

    const loopSeconds = this.composition.loopBeats * beatSeconds
    this.nextOrigin = origin + loopSeconds
    const scheduleAheadSeconds = .28
    const delayMs = Math.max(25, (this.nextOrigin - context.currentTime - scheduleAheadSeconds) * 1000)

    this.timer = window.setTimeout(() => {
      this.timer = null
      this.scheduleLoop(context)
    }, delayMs)
  }
}
