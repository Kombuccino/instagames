import { SymbolicMusicPlayer, type SymbolicComposition } from './symbolicMusicPlayer'
import { musicCatalog } from '../music/catalog'
import { scheduleLineFuggDrum } from '../core/lineFuggDrumSynth'

const LINEFUGG_MUSIC_IDS = ['MF-MUS-0008', 'MF-MUS-0009'] as const

const LINEFUGG_MUSIC = LINEFUGG_MUSIC_IDS
  .map((id) => musicCatalog.compositions.find((composition) => composition.id === id))
  .filter(Boolean) as unknown as SymbolicComposition[]

export function createLineFuggMusicPlayer(seed: number, restartToken: number) {
  if (LINEFUGG_MUSIC.length === 0) return null
  const index = ((seed >>> 0) + restartToken) % LINEFUGG_MUSIC.length
  const composition = LINEFUGG_MUSIC[index]

  return new SymbolicMusicPlayer({
    composition,
    gain: .9,
    customNoteScheduler: ({ context, output, noise, track, note, start, durationScale, sources }) => (
      scheduleLineFuggDrum({
        context,
        output,
        noise,
        trackId: track.id,
        midi: note[2],
        velocity: note[3],
        trackGain: track.gain,
        start,
        durationScale,
        sources,
      })
    ),
  })
}

