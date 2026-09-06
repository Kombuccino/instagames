import { rememberAudioSource } from '../audio/coreAudioManager'
type SourceNode = OscillatorNode | AudioBufferSourceNode

type LineFuggDrumInput = {
  context: BaseAudioContext
  output: AudioNode
  noise: AudioBuffer
  trackId: string
  midi: number
  velocity: number
  trackGain: number
  start: number
  durationScale: number
  sources?: SourceNode[]
}

const LINEFUGG_DRUM_TRACKS = new Set([
  'LF8_KICK_GRID',
  'LF8_SNARE_SNAP',
  'LF8_HATS_CURSOR',
  'LF9_KICK_BOUNCE',
  'LF9_RIM_CLAP',
  'LF9_SHAKER_TICK',
])

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function remember(node: SourceNode, sources: SourceNode[] | undefined, nodes: AudioNode[]) {
  rememberAudioSource(sources ?? [], node, nodes)
}

function noiseSource(context: BaseAudioContext, noise: AudioBuffer) {
  const source = context.createBufferSource()
  source.buffer = noise
  return source
}

function scheduleKick(input: LineFuggDrumInput, bounce: boolean) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * (bounce ? .96 : 1.08), .014, bounce ? .18 : .22)
  const duration = clamp((bounce ? .21 : .16) * durationScale, .1, bounce ? .3 : .24)

  const body = context.createOscillator()
  const bodyGain = context.createGain()
  body.type = 'sine'
  body.frequency.setValueAtTime(bounce ? 116 : 154, start)
  body.frequency.exponentialRampToValueAtTime(bounce ? 58 : 54, start + Math.min(duration * .62, bounce ? .13 : .095))
  bodyGain.gain.setValueAtTime(.0001, start)
  bodyGain.gain.exponentialRampToValueAtTime(level, start + .004)
  bodyGain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  body.connect(bodyGain).connect(output)
  body.start(start)
  body.stop(start + duration + .02)
  remember(body, sources, [bodyGain])

  const attack = noiseSource(context, noise)
  const high = context.createBiquadFilter()
  const low = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = bounce ? 900 : 1550
  low.type = 'lowpass'
  low.frequency.value = bounce ? 3300 : 5200
  gain.gain.setValueAtTime(Math.max(.003, level * (bounce ? .11 : .19)), start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + (bounce ? .026 : .019))
  attack.connect(high).connect(low).connect(gain).connect(output)
  attack.start(start)
  attack.stop(start + .035)
  remember(attack, sources, [high, low, gain])
}

function scheduleSnap(input: LineFuggDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.18, .008, .17)
  const duration = clamp(.105 * durationScale, .07, .18)

  const source = noiseSource(context, noise)
  const high = context.createBiquadFilter()
  const band = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = 720
  band.type = 'bandpass'
  band.frequency.value = 2050
  band.Q.value = .72
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(band).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources, [high, band, gain])

  const body = context.createOscillator()
  const bodyGain = context.createGain()
  body.type = 'triangle'
  body.frequency.setValueAtTime(215, start)
  body.frequency.exponentialRampToValueAtTime(142, start + Math.min(.075, duration))
  bodyGain.gain.setValueAtTime(Math.max(.002, level * .28), start)
  bodyGain.gain.exponentialRampToValueAtTime(.0001, start + Math.min(.09, duration))
  body.connect(bodyGain).connect(output)
  body.start(start)
  body.stop(start + Math.min(.1, duration) + .02)
  remember(body, sources, [bodyGain])
}

function scheduleRimClap(input: LineFuggDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.12, .006, .13)
  const duration = clamp(.09 * durationScale, .055, .15)

  const rim = context.createOscillator()
  const rimGain = context.createGain()
  rim.type = 'triangle'
  rim.frequency.setValueAtTime(920, start)
  rim.frequency.exponentialRampToValueAtTime(610, start + .038)
  rimGain.gain.setValueAtTime(level * .72, start)
  rimGain.gain.exponentialRampToValueAtTime(.0001, start + .052)
  rim.connect(rimGain).connect(output)
  rim.start(start)
  rim.stop(start + .065)
  remember(rim, sources, [rimGain])

  ;[0, .018].forEach((delay, index) => {
    const source = noiseSource(context, noise)
    const high = context.createBiquadFilter()
    const low = context.createBiquadFilter()
    const gain = context.createGain()
    high.type = 'highpass'
    high.frequency.value = 1200
    low.type = 'lowpass'
    low.frequency.value = 4700
    gain.gain.setValueAtTime(level * (index === 0 ? .8 : .48), start + delay)
    gain.gain.exponentialRampToValueAtTime(.0001, start + delay + duration)
    source.connect(high).connect(low).connect(gain).connect(output)
    source.start(start + delay)
    source.stop(start + delay + duration + .02)
    remember(source, sources, [high, low, gain])
  })
}

function scheduleHat(input: LineFuggDrumInput, shaker: boolean) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * (shaker ? 1.55 : 1.9), .003, shaker ? .09 : .115)
  const duration = clamp((shaker ? .06 : .043) * durationScale, .025, shaker ? .11 : .08)
  const source = noiseSource(context, noise)
  const high = context.createBiquadFilter()
  const band = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = shaker ? 3100 : 4300
  band.type = 'bandpass'
  band.frequency.value = shaker ? 6100 : 7500
  band.Q.value = shaker ? .38 : .5
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(band).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources, [high, band, gain])
}

export function isLineFuggDrumTrack(trackId: string) {
  return LINEFUGG_DRUM_TRACKS.has(trackId)
}

export function scheduleLineFuggDrum(input: LineFuggDrumInput) {
  if (input.trackId === 'LF8_KICK_GRID') {
    scheduleKick(input, false)
    return true
  }
  if (input.trackId === 'LF9_KICK_BOUNCE') {
    scheduleKick(input, true)
    return true
  }
  if (input.trackId === 'LF8_SNARE_SNAP') {
    scheduleSnap(input)
    return true
  }
  if (input.trackId === 'LF9_RIM_CLAP') {
    scheduleRimClap(input)
    return true
  }
  if (input.trackId === 'LF8_HATS_CURSOR') {
    scheduleHat(input, false)
    return true
  }
  if (input.trackId === 'LF9_SHAKER_TICK') {
    scheduleHat(input, true)
    return true
  }
  return false
}
