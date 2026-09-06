import {
  isAudioLabEnhancedDrumTrack as isCoreEnhancedDrumTrack,
  scheduleAudioLabEnhancedDrum as scheduleCoreEnhancedDrum,
} from './audioLabDrumSynthCore'
import { isLineFuggDrumTrack, scheduleLineFuggDrum } from './lineFuggDrumSynth'

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

export function isAudioLabEnhancedDrumTrack(trackId: string) {
  return isLineFuggDrumTrack(trackId) || isCoreEnhancedDrumTrack(trackId)
}

export function scheduleAudioLabEnhancedDrum(input: EnhancedDrumInput) {
  if (scheduleLineFuggDrum(input)) return true
  return scheduleCoreEnhancedDrum(input)
}
