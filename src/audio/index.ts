import { coreAudio } from './coreAudioManager'
import { playGameSfx, playMiniFuggSfx, playUi, stopGameSfx } from './sfxEngine'

/** Semantic public API shared by React, Phaser and Three.js clients. */
export const miniFuggAudio = {
  unlock: () => coreAudio.unlock(),
  resume: () => coreAudio.resume(),
  suspend: () => coreAudio.suspend(),
  setMusic: coreAudio.setMusic.bind(coreAudio),
  stopMusic: coreAudio.stopMusic.bind(coreAudio),
  pauseMusic: () => coreAudio.pauseMusic(),
  resumeMusic: () => coreAudio.resumeMusic(),
  setBusVolume: coreAudio.setBusVolume.bind(coreAudio),
  setMuted: coreAudio.setMuted.bind(coreAudio),
  playSfx: playMiniFuggSfx,
  playGameSfx,
  playUi,
  stopGameSfx,
}

export { SymbolicMusicPlayer } from './symbolicMusicPlayer'
export type { SymbolicComposition, SymbolicMusicPlayerOptions } from './symbolicMusicPlayer'
export type { MusicHandle, AudioBus } from './coreAudioManager'
