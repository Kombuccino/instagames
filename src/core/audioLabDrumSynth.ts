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
  'DINO_KICK_LAVA',
  'DINO_SNARE_CRACK',
  'DINO_DRIVE_HATS',
  'DINO_TOM_STAMPEDE',
  'DINO_EXPLOSION_HITS',
  'BTEA_SOFT_KICK',
  'BTEA_BRUSH_SNARE',
  'BTEA_SHAKER',
  'BTEA_BUBBLE_POP',
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
  const dino = input.trackId === 'DINO_KICK_LAVA'
  const level = clamp(velocity / 127 * trackGain * (dino ? 1.08 : 1), .025, dino ? .34 : .3)
  const duration = clamp((dino ? .275 : .235) * durationScale, .14, dino ? .4 : .34)

  const body = context.createOscillator()
  const bodyGain = context.createGain()
  body.type = 'sine'
  body.frequency.setValueAtTime(dino ? 172 : 155, start)
  body.frequency.exponentialRampToValueAtTime(dino ? 52 : 56, start + Math.min(dino ? .12 : .105, duration * .48))
  body.frequency.exponentialRampToValueAtTime(dino ? 41 : 46, start + duration)
  bodyGain.gain.setValueAtTime(.0001, start)
  bodyGain.gain.exponentialRampToValueAtTime(level, start + .003)
  bodyGain.gain.exponentialRampToValueAtTime(Math.max(.0002, level * (dino ? .58 : .5)), start + Math.min(dino ? .095 : .075, duration * .45))
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
  clickHigh.frequency.value = dino ? 1300 : 1700
  clickLow.type = 'lowpass'
  clickLow.frequency.value = dino ? 4800 : 5600
  clickGain.gain.setValueAtTime(Math.max(.004, level * (dino ? .2 : .16)), start)
  clickGain.gain.exponentialRampToValueAtTime(.0001, start + (dino ? .032 : .024))
  click.connect(clickHigh).connect(clickLow).connect(clickGain).connect(output)
  click.start(start)
  click.stop(start + .04)
  remember(click, sources)
}

function scheduleSoftKick(input: EnhancedDrumInput) {
  const { context, output, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * .92, .01, .13)
  const duration = clamp(.19 * durationScale, .11, .28)
  const body = context.createOscillator()
  const gain = context.createGain()
  body.type = 'sine'
  body.frequency.setValueAtTime(104, start)
  body.frequency.exponentialRampToValueAtTime(58, start + .09)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + .006)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  body.connect(gain).connect(output)
  body.start(start)
  body.stop(start + duration + .02)
  remember(body, sources)
}

function scheduleSnare(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const dino = input.trackId === 'DINO_SNARE_CRACK'
  const level = clamp(velocity / 127 * trackGain * (dino ? 1.12 : 1), .012, dino ? .24 : .2)
  const duration = clamp((dino ? .175 : .145) * durationScale, .085, dino ? .28 : .24)

  const noiseSource = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const body = context.createBiquadFilter()
  const noiseGain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = dino ? 520 : 650
  body.type = 'bandpass'
  body.frequency.value = dino ? 1500 : 1750
  body.Q.value = dino ? .5 : .65
  noiseGain.gain.setValueAtTime(Math.max(.006, level * (dino ? 1.4 : 1.25)), start)
  noiseGain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  noiseSource.connect(high).connect(body).connect(noiseGain).connect(output)
  noiseSource.start(start)
  noiseSource.stop(start + duration + .02)
  remember(noiseSource, sources)

  const tone = context.createOscillator()
  const toneGain = context.createGain()
  tone.type = 'triangle'
  tone.frequency.setValueAtTime(dino ? 172 : 195, start)
  tone.frequency.exponentialRampToValueAtTime(dino ? 108 : 125, start + Math.min(.09, duration))
  toneGain.gain.setValueAtTime(Math.max(.003, level * (dino ? .55 : .46)), start)
  toneGain.gain.exponentialRampToValueAtTime(.0001, start + Math.min(.14, duration))
  tone.connect(toneGain).connect(output)
  tone.start(start)
  tone.stop(start + Math.min(.15, duration) + .02)
  remember(tone, sources)
}

function scheduleBrushSnare(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * .9, .006, .09)
  const duration = clamp(.16 * durationScale, .1, .24)
  const source = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const low = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = 900
  low.type = 'lowpass'
  low.frequency.value = 5200
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(low).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources)
}

function scheduleHat(input: EnhancedDrumInput) {
  const { context, output, noise, trackId, velocity, trackGain, start, durationScale, sources } = input
  const driveHat = trackId === 'MAX4_DRIVE_HATS'
  const dinoHat = trackId === 'DINO_DRIVE_HATS'
  const levelMultiplier = driveHat ? 2.25 : dinoHat ? 2 : 1.7
  const maxLevel = driveHat ? .16 : dinoHat ? .15 : .11
  const level = clamp(velocity / 127 * trackGain * levelMultiplier, .004, maxLevel)
  const baseDuration = trackId === 'MAX4_PRIME_ACCENTS' ? .12 : driveHat ? .058 : dinoHat ? .065 : .068
  const duration = clamp(baseDuration * durationScale, .025, .18)
  const source = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const band = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = trackId === 'MAX4_PRIME_ACCENTS' ? 4200 : driveHat ? 4300 : dinoHat ? 3900 : 5600
  band.type = 'bandpass'
  band.frequency.value = trackId === 'MAX4_PRIME_ACCENTS' ? 7200 : driveHat ? 6800 : dinoHat ? 6200 : 8800
  band.Q.value = driveHat || dinoHat ? .4 : .55
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(band).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources)
}

function scheduleShaker(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.35, .003, .065)
  const duration = clamp(.055 * durationScale, .032, .1)
  const source = makeNoiseSource(context, noise)
  const high = context.createBiquadFilter()
  const band = context.createBiquadFilter()
  const gain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = 3500
  band.type = 'bandpass'
  band.frequency.value = 6500
  band.Q.value = .42
  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  source.connect(high).connect(band).connect(gain).connect(output)
  source.start(start)
  source.stop(start + duration + .02)
  remember(source, sources)
}

function scheduleTom(input: EnhancedDrumInput) {
  const { context, output, noise, midi, velocity, trackGain, start, durationScale, sources } = input
  const dino = input.trackId === 'DINO_TOM_STAMPEDE'
  const level = clamp(velocity / 127 * trackGain * (dino ? 1.1 : 1), .012, dino ? .24 : .2)
  const duration = clamp((dino ? .21 : .17) * durationScale, .1, dino ? .32 : .28)
  const target = midi <= 43 ? (dino ? 62 : 72) : midi <= 45 ? (dino ? 76 : 88) : (dino ? 94 : 106)

  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(target * (dino ? 2.05 : 1.85), start)
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
  filter.frequency.value = dino ? 720 : 900
  filter.Q.value = .8
  attackGain.gain.setValueAtTime(Math.max(.003, level * (dino ? .24 : .18)), start)
  attackGain.gain.exponentialRampToValueAtTime(.0001, start + .03)
  attack.connect(filter).connect(attackGain).connect(output)
  attack.start(start)
  attack.stop(start + .035)
  remember(attack, sources)
}

function scheduleExplosion(input: EnhancedDrumInput) {
  const { context, output, noise, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.1, .04, .32)
  const duration = clamp(.48 * durationScale, .28, .72)

  const boom = context.createOscillator()
  const boomGain = context.createGain()
  boom.type = 'sine'
  boom.frequency.setValueAtTime(92, start)
  boom.frequency.exponentialRampToValueAtTime(34, start + duration * .72)
  boomGain.gain.setValueAtTime(.0001, start)
  boomGain.gain.exponentialRampToValueAtTime(level, start + .008)
  boomGain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  boom.connect(boomGain).connect(output)
  boom.start(start)
  boom.stop(start + duration + .03)
  remember(boom, sources)

  const blast = makeNoiseSource(context, noise)
  const low = context.createBiquadFilter()
  const high = context.createBiquadFilter()
  const blastGain = context.createGain()
  high.type = 'highpass'
  high.frequency.value = 180
  low.type = 'lowpass'
  low.frequency.value = 2400
  blastGain.gain.setValueAtTime(Math.max(.02, level * .95), start)
  blastGain.gain.exponentialRampToValueAtTime(.0001, start + duration * .8)
  blast.connect(high).connect(low).connect(blastGain).connect(output)
  blast.start(start)
  blast.stop(start + duration + .02)
  remember(blast, sources)
}

function scheduleBubblePop(input: EnhancedDrumInput) {
  const { context, output, midi, velocity, trackGain, start, durationScale, sources } = input
  const level = clamp(velocity / 127 * trackGain * 1.35, .004, .075)
  const duration = clamp(.11 * durationScale, .07, .17)
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  const target = 440 * Math.pow(2, (midi - 69) / 12)
  oscillator.frequency.setValueAtTime(target * .72, start)
  oscillator.frequency.exponentialRampToValueAtTime(target, start + duration * .6)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + .005)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  oscillator.connect(gain).connect(output)
  oscillator.start(start)
  oscillator.stop(start + duration + .02)
  remember(oscillator, sources)
}

export function isAudioLabEnhancedDrumTrack(trackId: string) {
  return ENHANCED_DRUM_TRACKS.has(trackId)
}

export function scheduleAudioLabEnhancedDrum(input: EnhancedDrumInput) {
  if (input.trackId === 'MAX4_KICK_RAIL' || input.trackId === 'DINO_KICK_LAVA') {
    scheduleKick(input)
    return true
  }
  if (input.trackId === 'BTEA_SOFT_KICK') {
    scheduleSoftKick(input)
    return true
  }
  if (input.trackId === 'MAX4_SNARE_BACKBEAT' || input.trackId === 'DINO_SNARE_CRACK') {
    scheduleSnare(input)
    return true
  }
  if (input.trackId === 'BTEA_BRUSH_SNARE') {
    scheduleBrushSnare(input)
    return true
  }
  if (input.trackId === 'MAX4_TOM_FILLS' || input.trackId === 'DINO_TOM_STAMPEDE') {
    scheduleTom(input)
    return true
  }
  if (input.trackId === 'DINO_EXPLOSION_HITS') {
    scheduleExplosion(input)
    return true
  }
  if (input.trackId === 'BTEA_SHAKER') {
    scheduleShaker(input)
    return true
  }
  if (input.trackId === 'BTEA_BUBBLE_POP') {
    scheduleBubblePop(input)
    return true
  }
  if (input.trackId === 'MAX4_OFFBEAT_HATS'
    || input.trackId === 'MAX4_DRIVE_HATS'
    || input.trackId === 'MAX4_PRIME_ACCENTS'
    || input.trackId === 'DINO_DRIVE_HATS') {
    scheduleHat(input)
    return true
  }
  return false
}
