type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }

export const DINO_LAVA_BPM = 164
export const DINO_LAVA_BARS = 32
export const DINO_LAVA_LOOP_BEATS = DINO_LAVA_BARS * 4

const ROOTS = [38, 38, 41, 36, 38, 43, 41, 36]

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

export const dinoLavaTrackIds = [
  'DINO_KICK_LAVA',
  'DINO_SNARE_CRACK',
  'DINO_SUB_BASS',
  'DINO_DIRT_BASS',
  'DINO_DRIVE_HATS',
  'DINO_TOM_STAMPEDE',
  'DINO_EXPLOSION_HITS',
  'DINO_ALARM_STABS',
] as const

export function dinoLavaUrgency(): Track[] {
  const kick: Note[] = []
  const snare: Note[] = []
  const subBass: Note[] = []
  const dirtBass: Note[] = []
  const hats: Note[] = []
  const toms: Note[] = []
  const explosions: Note[] = []
  const alarm: Note[] = []

  for (let bar = 0; bar < DINO_LAVA_BARS; bar += 1) {
    const start = bar * 4
    const local = bar % 8
    const root = ROOTS[local]
    const pressure = bar >= 8
    const panic = bar >= 16
    const finale = bar >= 24

    // The feet-in-lava rail: four physical kicks, never delegated to melody.
    const kicks = finale ? [127, 116, 122, 116] : panic ? [124, 111, 118, 111] : pressure ? [120, 106, 114, 106] : [116, 102, 110, 102]
    kicks.forEach((velocity, beat) => add(kick, start + beat, .24, 36, velocity))
    if (panic && bar % 2 === 1) add(kick, start + 3.5, .16, 36, finale ? 92 : 78)

    ;[1, 3].forEach((beat) => add(snare, start + beat, .19, 38, finale ? 92 : panic ? 84 : 76))
    if (finale && local === 7) {
      add(snare, start + 3.5, .1, 38, 62)
      add(snare, start + 3.75, .08, 38, 72)
    }

    // Sub follows the kick and stays simple enough to remain huge.
    const subPattern = [root, root, root + 5, root]
    subPattern.forEach((midi, beat) => add(subBass, start + beat, .7, midi, beat === 0 ? 92 : beat === 2 ? 82 : 72))

    // Mid-bass teeth appear between kicks rather than replacing them.
    if (pressure) {
      const offsets = finale ? [.5, 1.5, 2.5, 3.5] : [.5, 2.5]
      offsets.forEach((offset, index) => add(dirtBass, start + offset, .28, root + (index % 2 ? 12 : 7), finale ? 58 : 48))
    }

    // Eighth-note hats become sixteenth-note urgency in the last quarter.
    ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => add(hats, start + offset, .075, 42, index === 0 ? 54 : 46))
    if (panic) {
      const extra = finale ? [.25, .75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75] : [2.25, 2.75, 3.25, 3.75]
      extra.forEach((offset, index) => add(hats, start + offset, .055, 44, finale ? (index % 2 ? 42 : 48) : 34))
    }

    // Stomping tom runs announce each 4-bar boundary.
    if (local === 3 || local === 7) {
      add(toms, start + 3, .18, 47, finale ? 84 : 68)
      add(toms, start + 3.5, .16, 45, finale ? 92 : 76)
      add(toms, start + 3.75, .14, 43, finale ? 104 : 88)
    }

    // Explosions are sparse at first, then become a threat cloud in the finale.
    if (bar % 4 === 3) add(explosions, start + 3.5, .3, 34, finale ? 122 : panic ? 110 : 96)
    if (finale && bar % 2 === 1) add(explosions, start + 1.75, .24, 34, 88)

    // A two-note alarm, not a melody: it signals urgency without carrying the groove.
    if (panic && bar % 4 === 0) {
      add(alarm, start + .5, .24, 65, finale ? 58 : 48)
      add(alarm, start + 1, .24, 62, finale ? 62 : 52)
      if (finale) {
        add(alarm, start + 2.5, .2, 65, 50)
        add(alarm, start + 3, .2, 62, 54)
      }
    }
  }

  return [
    track('DINO_KICK_LAVA', 'noise', .28, kick),
    track('DINO_SNARE_CRACK', 'noise', .145, snare),
    track('DINO_SUB_BASS', 'triangle', .14, subBass),
    track('DINO_DIRT_BASS', 'sawtooth', .045, dirtBass),
    track('DINO_DRIVE_HATS', 'noise', .075, hats),
    track('DINO_TOM_STAMPEDE', 'noise', .17, toms),
    track('DINO_EXPLOSION_HITS', 'noise', .24, explosions),
    track('DINO_ALARM_STABS', 'square', .035, alarm),
  ]
}
