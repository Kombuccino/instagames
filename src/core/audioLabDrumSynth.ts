type SourceNode = OscillatorNode | AudioBufferSourceNode

type EnhancedDrumInput = {
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

const ENHANCED_DRUM_TRACKS = new Set([
  'MAX4_KICK_RAIL',
  'MAX4_SNARE_BACKBEAT',
  'MAX4_OFFBEAT_HATS',
  'MAX4_DRIVE_HATS',
  'MAX4_TOM_FILLS',
  'MAX4_PRIME_ACCENTS',
])

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function remember(node: SourceNode, sources?: SourceNode[]) {
  if (!sources) return
  sources.push(node)
  node.addEventListener('ended', () => {
    const index = sources.indexOf(node)
    if (index >= 0) sources.splice(index, 1)
  }, { once: true })
}

function makeNoiseSource(context: BaseAudioContext, noise: AudioBuffer) {
  const source = context.createBufferSource()
  source.buffer = noise
  return source
}

function scheduleKick(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain, .025, .3)
  const duration = clamp(.235 * durationScale, .14, .34)

  const body = context.createOscillator()
  const bodyGain = context.createGain()
  body.type = 'sine'
  body.frequency.setValueAtTime(155, start)
  body.frequency.exponentialRampToValueAtTime(56, start + Math.min(.105, duration * .48))
  body.frequency.exponentialRampToValueAtTime(46, start + duration)
  bodyGain.gain.setValueAtTime(.0001, start)
  bodyGain.gain.exponentialRampToValueAtTime(level, start + .003)
  bodyGain.gain.exponentialRampToValueAtTime(Math.max(.0002, level * .5), start + Math.min(.075, duration * .45))
  bodyGain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  body.connect(bodyGain).connect(output)
  body.start(start)
  body.stop(start + duration + .02)
  remember(body, sources)

  const click = makeNoiseSource(context, noise)
  const clickHigh = context.createBiquadFilter()
  const clickLow = context.createBiquadFilter()
  const clickGain = context.createGain()
  clickHigh.type = 'highpass'
  clickHigh.frequency.value = 1700
  clickLow.type = 'lowpass'
  clickLow.frequency.value = 5600
  clickGain.gain.setValueAtTime(Math.max(.004, level * .16), start)
  clickGain.gain.exponentialRampToValueAtTime(.0001, start + .024)
  click.connect(clickHigh).connect(clickLow).connect(clickGain).connect(output)
  click.start(start)
  click.stop(start + .03)
  remember(click, sources)
}

function scheduleSnare(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain, .012, .2)
  const duration = clamp(.145 * durationScale, .085, .24)

  const noiseSource = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const body = context.createBiquadFilter()
  const noiseGain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = 650
  body.type = 'bandpass'
  body.frequency.value = 1750
  body.Q.value = .65
  noiseGain.gain.setValueAtTime(Math.max(.006, level * 1.25), start)
  noiseGain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  noiseSource.connect(high).connect(body).connect(noiseGain).connect(output)
  noiseSource.start(start)
  noiseSource.stop(start + duration + .02)
  remember(noiseSource, sources)

  const tone = context.createOscillator()
  const toneGain = context.createGain()
  tone.type = 'triangle'
  tone.frequency.setValueAtTime(195, start)
  tone.frequency.exponentialRampToValueAtTime(125, start + Math.min(.09, duration))
  toneGain.gain.setValueAtTime(Math.max(.003, level * .46), start)
  toneGain.gain.exponentialRampToValueAtTime(.0001, start + Math.min(.12, duration))
  tone.connect(toneGain).connect(output)
  tone.start(start)
  tone.stop(start + Math.min(.13, duration) + .02)
  remember(tone, sources)
}

function scheduleHat(input: EnhancedDrumInput) {
  const { context, output, noise, trackId, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.7, .004, .11)
  const baseDuration = trackId === 'MAX4_PRIME_ACCENTS' ? .12 : trackId === 'MAX4_DRIVE_HATS' ? .038 : .068
  const duration = clamp(baseDuration * durationScale, .025, .18)
  const source = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const band = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = trackId === 'MAX4_PRIME_ACCENTS' ? 4200 : 5600
  band.type = 'bandpass'
  band.frequency.value = trackId === 'MAX4_PRIME_ACCENTS' ? 7200 : 8800
  band.Q.value = .55
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(band).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources)
}

function scheduleTom(input: EnhancedDrumInput) {
  const { context, output, noise, midi, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain, .012, .2)
  const duration = clamp(.17 * durationScale, .1, .28)
  const target = midi <= 43 ? 72 : midi <= 45 ? 88 : 106

  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(target * 1.85, start)
  oscillator.frequency.exponentialRampToValueAtTime(target, start + duration * .7)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + .004)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  oscillator.connect(gain).connect(output)
  oscillator.start(start)
  oscillator.stop(start + duration + .02)
  remember(oscillator, sources)

  const attack = makeNoiseSource(context, noise)
  const filter = context.createBiquadFilter()
  const attackGain = context.createGain()
  filter.type = 'bandpass'
  filter.frequency.value = 900
  filter.Q.value = .8
  attackGain.gain.setValueAtTime(Math.max(.003, level * .18), start)
  attackGain.gain.exponentialRampToValueAtTime(.0001, start + .025)
  attack.connect(filter).connect(attackGain).connect(output)
  attack.start(start)
  attack.stop(start + .03)
  remember(attack, sources)
}

export function isAudioLabEnhancedDrumTrack(trackId: string) {
  return ENHANCED_DRUM_TRACKS.has(trackId)
}

export function scheduleAudioLabEnhancedDrum(input: EnhancedDrumInput) {
  if (input.trackId === 'MAX4_KICK_RAIL') {
    scheduleKick(input)
    return true
  }
  if (input.trackId === 'MAX4_SNARE_BACKBEAT') {
    scheduleSnare(input)
    return true
  }
  if (input.trackId === 'MAX4_TOM_FILLS') {
    scheduleTom(input)
    return true
  }
  if (input.trackId === 'MAX4_OFFBEAT_HATS'
    || input.trackId === 'MAX4_DRIVE_HATS'
    || input.trackId === 'MAX4_PRIME_ACCENTS') {
    scheduleHat(input)
    return true
  }
  return false
}
