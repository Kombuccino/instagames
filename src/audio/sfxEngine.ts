import { coreAudio, AudioVoice, rememberAudioSource, type AudioBus } from './coreAudioManager'
import { gameSfxPalettes, sfxCatalog, type SfxDefinition, type SfxEvent, type SfxTransform } from './sfxCatalog'

export type PlayOptions = {
  bus?: AudioBus
  owner?: string
  intensity?: number
  transform?: SfxTransform
  brightness?: number
  ignoreCooldown?: boolean
}

let noise: AudioBuffer | null = null
const lastPlayed = new Map<string, number>()

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function noiseBuffer(audio: AudioContext) {
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * .35), audio.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < data.length; index += 1) {
    previous = previous * .54 + (Math.random() * 2 - 1) * .46
    data[index] = previous
  }
  return buffer
}

function mergeTransform(base?: SfxTransform, extra?: SfxTransform): Required<SfxTransform> {
  return {
    transposeSemitones: (base?.transposeSemitones ?? 0) + (extra?.transposeSemitones ?? 0),
    gain: (base?.gain ?? 1) * (extra?.gain ?? 1),
    duration: (base?.duration ?? 1) * (extra?.duration ?? 1),
  }
}

function definitionByKey(key: string) {
  return sfxCatalog.sounds.find((sound) => sound.key === key) ?? null
}

function definitionById(id: string) {
  return sfxCatalog.sounds.find((sound) => sound.id === id) ?? null
}

function shouldPlay(definition: SfxDefinition, ignoreCooldown: boolean) {
  if (ignoreCooldown) return true
  const now = performance.now()
  const previous = lastPlayed.get(definition.id) ?? -Infinity
  if (now - previous < definition.cooldownMs) return false
  lastPlayed.set(definition.id, now)
  return true
}

function brightnessFactor(brightness: number) {
  return Math.pow(2, clamp(brightness, -100, 100) / 70)
}

function scheduleTone(
  audio: AudioContext,
  voice: AudioVoice,
  definition: SfxDefinition,
  step: Extract<SfxDefinition['steps'][number], { type: 'tone' }>,
  origin: number,
  intensity: number,
  transform: Required<SfxTransform>,
  brightness: number,
) {
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  const filter = audio.createBiquadFilter()
  const transposition = Math.pow(2, transform.transposeSemitones / 12)
  const start = origin + step.at
  const duration = Math.max(.018, step.duration * transform.duration)
  const end = start + duration
  const startHz = Math.max(35, step.fromHz * transposition)
  const endHz = Math.max(35, (step.toHz ?? step.fromHz) * transposition)
  const level = clamp(.075 * step.gain * transform.gain * intensity, .001, .12)

  oscillator.type = step.wave
  oscillator.frequency.setValueAtTime(startHz, start)
  if (Math.abs(endHz - startHz) > 1) oscillator.frequency.exponentialRampToValueAtTime(endHz, end)

  filter.type = 'lowpass'
  filter.frequency.value = clamp(8500 * brightnessFactor(brightness), 900, 18000)
  filter.Q.value = .2

  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.007, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .008, end - .018))
  gain.gain.exponentialRampToValueAtTime(.0001, end)

  oscillator.connect(gain).connect(filter).connect(voice.output)
  oscillator.start(start)
  oscillator.stop(end + .02)
  rememberAudioSource(voice.sources, oscillator, [gain, filter])

  void definition
}

function scheduleNoise(
  audio: AudioContext,
  voice: AudioVoice,
  buffer: AudioBuffer,
  step: Extract<SfxDefinition['steps'][number], { type: 'noise' }>,
  origin: number,
  intensity: number,
  transform: Required<SfxTransform>,
  brightness: number,
) {
  const source = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const gain = audio.createGain()
  const start = origin + step.at
  const duration = Math.max(.018, step.duration * transform.duration)
  const transposition = Math.pow(2, transform.transposeSemitones / 12)
  const level = clamp(.085 * step.gain * transform.gain * intensity, .001, .13)

  source.buffer = buffer
  filter.type = step.filter
  filter.frequency.value = clamp(step.frequency * transposition * brightnessFactor(brightness), 80, 15000)
  filter.Q.value = step.filter === 'bandpass' ? .8 : .25

  gain.gain.setValueAtTime(level, start)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)

  source.connect(filter).connect(gain).connect(voice.output)
  source.start(start)
  source.stop(start + duration + .02)
  rememberAudioSource(voice.sources, source, [filter, gain])
}

export function stopGameSfx(owner: string) {
  coreAudio.stopEffects(owner)
}

function playDefinition(definition: SfxDefinition, options: PlayOptions = {}) {
  // Transients are dropped while blocked, never replayed as a burst on unlock.
  void coreAudio.unlock()
  const state = coreAudio.getSnapshot()
  if (state.contextState !== 'running' || state.hidden || state.suspended) return Promise.resolve(false)
  if (!shouldPlay(definition, options.ignoreCooldown ?? false)) return Promise.resolve(false)
  const audio = coreAudio.getContext()
  noise ??= noiseBuffer(audio)
  const intensity = clamp(options.intensity ?? 1, .45, 1.35)
  const transform = mergeTransform(undefined, options.transform)
  const brightness = clamp(options.brightness ?? 0, -100, 100)
  const origin = audio.currentTime + .006
  const duration = Math.max(.1, ...definition.steps.map(step => step.at + step.duration * transform.duration)) + .05
  return Promise.resolve(coreAudio.playEffect(options.bus ?? 'SFX', duration, voice => {
    definition.steps.forEach(step => {
      if (step.type === 'tone') scheduleTone(audio, voice, definition, step, origin, intensity, transform, brightness)
      else scheduleNoise(audio, voice, noise!, step, origin, intensity, transform, brightness)
    })
  }, options.owner))
}

export function unlockSfxAudio() { return coreAudio.unlock() }

export function playUi(key: string, options: PlayOptions = {}) {
  return playMiniFuggSfx(key, { ...options, bus: 'UI' })
}

export function playMiniFuggSfx(key: string, options: PlayOptions = {}) {
  const definition = definitionByKey(key)
  if (!definition) return Promise.resolve(false)
  return playDefinition(definition, options)
}

export function playGameSfx(gameId: string, event: SfxEvent, options: PlayOptions = {}) {
  const palette = gameSfxPalettes[gameId]
  const key = palette?.events[event]
  if (!key) return Promise.resolve(false)
  const definition = definitionByKey(key)
  if (!definition) return Promise.resolve(false)

  return playDefinition(definition, {
    ...options,
    owner: options.owner ?? gameId,
    transform: mergeTransform(palette.accent, options.transform),
  })
}

export function previewSfxById(id: string, options: PlayOptions = {}) {
  const definition = definitionById(id)
  if (!definition) return Promise.resolve(false)
  return playDefinition(definition, { ...options, ignoreCooldown: true })
}
