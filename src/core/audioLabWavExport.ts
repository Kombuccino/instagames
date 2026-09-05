import { brightnessCutoff, normalizeTrackTuning, type CompositionTrackTuning } from './audioLabTuning'
import { isAudioLabEnhancedDrumTrack, scheduleAudioLabEnhancedDrum } from './audioLabDrumSynth'

type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

type Stage = {
  label: string
  bpm: number
  variant: string
  activeTracks: string[]
}

export type AudioLabExportInput = {
  compositionId: string
  compositionName: string
  stage: Stage
  tracks: Track[]
  trackTunings: CompositionTrackTuning
  mutedTrackIds: Set<string>
  startBeat: number
  endBeat: number
  scope: 'piece' | 'excerpt'
}

type LameEncoder = {
  encodeBuffer(samples: Int16Array): Int8Array
  flush(): Int8Array
}

type LameModule = {
  Mp3Encoder?: new (channels: number, sampleRate: number, kbps: number) => LameEncoder
  default?: {
    Mp3Encoder?: new (channels: number, sampleRate: number, kbps: number) => LameEncoder
  }
}

const SAMPLE_RATE = 44100
const MP3_BITRATE_KBPS = 128
const MP3_BLOCK_SIZE = 1152

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function makeNoiseBuffer(context: BaseAudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .5), context.sampleRate)
  const data = buffer.getChannelData(0)
  let previous = 0
  let seed = 0x5f3759df
  for (let index = 0; index < data.length; index += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const random = seed / 0xffffffff * 2 - 1
    previous = previous * .58 + random * .42
    data[index] = previous
  }
  return buffer
}

function scheduleTone(
  context: OfflineAudioContext,
  output: AudioNode,
  track: Track,
  note: Note,
  startBeat: number,
  endBeat: number,
  beatSeconds: number,
  transposeSemitones: number,
  noteLengthPercent: number,
) {
  const [beat, durationBeats, midi, velocity] = note
  if (beat < startBeat || beat >= endBeat) return
  const start = (beat - startBeat) * beatSeconds
  const requestedDuration = Math.max(.025, durationBeats * (noteLengthPercent / 100) * beatSeconds)
  const remaining = Math.max(.025, (endBeat - beat) * beatSeconds)
  const duration = Math.min(requestedDuration, remaining + .06)
  const end = start + duration
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = track.wave === 'triangle' ? 'triangle' : track.wave === 'sawtooth' ? 'sawtooth' : 'square'
  oscillator.frequency.setValueAtTime(hz(midi + transposeSemitones), start)

  const level = clamp(velocity / 127 * track.gain, .002, .2)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.009, duration * .2))
  gain.gain.setValueAtTime(level, Math.max(start + .01, end - .02))
  gain.gain.exponentialRampToValueAtTime(.0001, end)
  oscillator.connect(gain).connect(output)
  oscillator.start(start)
  oscillator.stop(end + .02)
}

function scheduleNoise(
  context: OfflineAudioContext,
  output: AudioNode,
  buffer: AudioBuffer,
  track: Track,
  note: Note,
  startBeat: number,
  endBeat: number,
  beatSeconds: number,
  noteLengthPercent: number,
) {
  const [beat, durationBeats, midi, velocity] = note
  if (beat < startBeat || beat >= endBeat) return
  const start = (beat - startBeat) * beatSeconds
  const requestedDuration = Math.max(.025, Math.min(.3, durationBeats * (noteLengthPercent / 100) * beatSeconds))
  const remaining = Math.max(.025, (endBeat - beat) * beatSeconds)
  const duration = Math.min(requestedDuration, remaining + .04)
  const sourceNode = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  sourceNode.buffer = buffer

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
  sourceNode.connect(filter).connect(gain).connect(output)
  sourceNode.start(start)
  sourceNode.stop(start + duration + .02)
}

async function renderAudioLab(input: AudioLabExportInput) {
  const beatSeconds = 60 / input.stage.bpm
  const startBeat = Math.max(0, input.startBeat)
  const endBeat = Math.max(startBeat + .25, input.endBeat)
  const musicalSeconds = (endBeat - startBeat) * beatSeconds
  const renderSeconds = musicalSeconds + .35
  const frameCount = Math.max(1, Math.ceil(renderSeconds * SAMPLE_RATE))
  const context = new OfflineAudioContext(1, frameCount, SAMPLE_RATE)

  const master = context.createGain()
  const compressor = context.createDynamicsCompressor()
  master.gain.setValueAtTime(.72, 0)
  master.gain.setValueAtTime(.72, musicalSeconds)
  master.gain.exponentialRampToValueAtTime(.0001, Math.min(renderSeconds, musicalSeconds + .25))
  compressor.threshold.value = -15
  compressor.knee.value = 8
  compressor.ratio.value = 5
  master.connect(compressor).connect(context.destination)

  const noise = makeNoiseBuffer(context)
  const enabled = new Set(input.stage.activeTracks)

  input.tracks.filter((track) => enabled.has(track.id)).forEach((track) => {
    const tuning = normalizeTrackTuning(input.trackTunings[track.id])
    if (!tuning.enabled || input.mutedTrackIds.has(track.id)) return

    const trackGain = context.createGain()
    const trackFilter = context.createBiquadFilter()
    trackGain.gain.value = tuning.volumePercent / 100
    trackFilter.type = 'lowpass'
    trackFilter.Q.value = .25
    trackFilter.frequency.value = brightnessCutoff(tuning.brightness)
    trackGain.connect(trackFilter).connect(master)

    track.notes.forEach((note) => {
      if (note[0] < startBeat || note[0] >= endBeat) return
      if (isAudioLabEnhancedDrumTrack(track.id)) {
        scheduleAudioLabEnhancedDrum({
          context,
          output: trackGain,
          noise,
          trackId: track.id,
          midi: note[2],
          velocity: note[3],
          trackGain: track.gain,
          start: (note[0] - startBeat) * beatSeconds,
          durationScale: tuning.noteLengthPercent / 100,
        })
      } else if (track.wave === 'noise') {
        scheduleNoise(context, trackGain, noise, track, note, startBeat, endBeat, beatSeconds, tuning.noteLengthPercent)
      } else {
        scheduleTone(context, trackGain, track, note, startBeat, endBeat, beatSeconds, tuning.transposeSemitones, tuning.noteLengthPercent)
      }
    })
  })

  return {
    buffer: await context.startRendering(),
    startBeat,
    endBeat,
  }
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}

function audioBufferToWav(buffer: AudioBuffer) {
  const channelCount = buffer.numberOfChannels
  const frameCount = buffer.length
  const bytesPerSample = 2
  const blockAlign = channelCount * bytesPerSample
  const byteRate = buffer.sampleRate * blockAlign
  const dataSize = frameCount * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  const channels = Array.from({ length: channelCount }, (_, index) => buffer.getChannelData(index))
  let offset = 44
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = clamp(channels[channel][frame], -1, 1)
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function floatChannelToInt16(channel: Float32Array) {
  const samples = new Int16Array(channel.length)
  for (let index = 0; index < channel.length; index += 1) {
    const sample = clamp(channel[index], -1, 1)
    samples[index] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff)
  }
  return samples
}

function copyEncodedBytes(bytes: Int8Array) {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  return copy.buffer
}

async function audioBufferToMp3(buffer: AudioBuffer) {
  const lameModule = await import('@breezystack/lamejs') as unknown as LameModule
  const Mp3Encoder = lameModule.Mp3Encoder ?? lameModule.default?.Mp3Encoder
  if (!Mp3Encoder) throw new Error('MP3 encoder unavailable')

  const encoder = new Mp3Encoder(1, buffer.sampleRate, MP3_BITRATE_KBPS)
  const samples = floatChannelToInt16(buffer.getChannelData(0))
  const chunks: BlobPart[] = []

  for (let offset = 0; offset < samples.length; offset += MP3_BLOCK_SIZE) {
    const encoded = encoder.encodeBuffer(samples.subarray(offset, offset + MP3_BLOCK_SIZE))
    if (encoded.length > 0) chunks.push(copyEncodedBytes(encoded))
  }

  const tail = encoder.flush()
  if (tail.length > 0) chunks.push(copyEncodedBytes(tail))
  return new Blob(chunks, { type: 'audio/mpeg' })
}

function safePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function filenameFor(input: AudioLabExportInput, extension: 'wav' | 'mp3', startBeat: number, endBeat: number) {
  const rangePart = input.scope === 'excerpt' ? `_beats-${startBeat.toFixed(2)}-${endBeat.toFixed(2)}` : ''
  return `${safePart(input.compositionId)}_${safePart(input.compositionName)}_stage-${safePart(input.stage.label)}_${input.stage.bpm}bpm_${input.scope}${rangePart}.${extension}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export async function exportAudioLabWav(input: AudioLabExportInput) {
  const rendered = await renderAudioLab(input)
  const filename = filenameFor(input, 'wav', rendered.startBeat, rendered.endBeat)
  downloadBlob(audioBufferToWav(rendered.buffer), filename)
  return filename
}

export async function exportAudioLabMp3(input: AudioLabExportInput) {
  const rendered = await renderAudioLab(input)
  const filename = filenameFor(input, 'mp3', rendered.startBeat, rendered.endBeat)
  downloadBlob(await audioBufferToMp3(rendered.buffer), filename)
  return filename
}
