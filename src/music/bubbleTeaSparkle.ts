type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }

export const BUBBLE_TEA_BPM = 94
export const BUBBLE_TEA_BARS = 32
export const BUBBLE_TEA_LOOP_BEATS = BUBBLE_TEA_BARS * 4

const ROOTS = [48, 45, 53, 55]
const CHORDS = [
  [60, 64, 67, 71], // Cmaj7
  [57, 60, 64, 67], // Am7
  [53, 57, 60, 64], // Fmaj7
  [55, 59, 62, 65], // G7
]

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

export const bubbleTeaTrackIds = [
  'BTEA_SOFT_KICK',
  'BTEA_BRUSH_SNARE',
  'BTEA_WARM_BASS',
  'BTEA_TEA_CHORDS',
  'BTEA_PEARL_PLUCK',
  'BTEA_SHAKER',
  'BTEA_BUBBLE_POP',
] as const

export function bubbleTeaSparkle(): Track[] {
  const kick: Note[] = []
  const snare: Note[] = []
  const bass: Note[] = []
  const chords: Note[] = []
  const pluck: Note[] = []
  const shaker: Note[] = []
  const pops: Note[] = []

  for (let bar = 0; bar < BUBBLE_TEA_BARS; bar += 1) {
    const start = bar * 4
    const slot = bar % 4
    const root = ROOTS[slot]
    const chord = CHORDS[slot]
    const lift = bar >= 8 && bar < 16
    const sipBreak = bar >= 16 && bar < 20
    const sparkle = bar >= 20
    const finale = bar >= 28

    // Soft café groove: kick stays round and sparse.
    add(kick, start, .22, 36, finale ? 82 : 72)
    add(kick, start + 2.5, .18, 36, sparkle ? 64 : 54)
    if (lift || finale) add(kick, start + 3.5, .15, 36, 44)

    // Brush/clap on 2 and 4, intentionally relaxed.
    ;[1, 3].forEach((beat) => add(snare, start + beat, .16, 38, finale ? 62 : 52))

    // Warm bass leaves space between notes like a small lounge trio.
    if (!sipBreak || bar % 2 === 0) {
      add(bass, start, 1.15, root, 66)
      add(bass, start + 2, .85, root + 7, 54)
      if (sparkle) add(bass, start + 3.5, .35, root + 12, 42)
    }

    // Long maj7/min7 colour, low in the mix.
    if (!sipBreak || bar % 2 === 0) {
      chord.forEach((midi, index) => add(chords, start, 1.55, midi, index === 0 ? 42 : 34))
      chord.slice(0, 3).forEach((midi, index) => add(chords, start + 2, 1.35, midi + (index === 2 ? 12 : 0), 30))
    }

    // Pearls bounce in a recognizable 2-bar call/response instead of random notes.
    if (!sipBreak && bar % 2 === 0) {
      const phrase = [chord[1] + 12, chord[2] + 12, chord[3] + 7, chord[2] + 12, chord[1] + 12]
      const offsets = [.75, 1.5, 2.25, 3, 3.5]
      phrase.forEach((midi, index) => add(pluck, start + offsets[index], .18, midi, index === 0 ? 48 : 40))
    }

    // Shaker gives the little fizz, stronger in the final third.
    const shakerOffsets = sparkle
      ? [.5, 1, 1.5, 2, 2.5, 3, 3.5]
      : [.5, 1.5, 2.5, 3.5]
    shakerOffsets.forEach((offset, index) => add(shaker, start + offset, .055, 42, sparkle ? (index % 2 ? 30 : 36) : 26))

    // Bubble pops are punctuation: pairs rising upward, never continuous beeping.
    if ((lift || sparkle) && bar % 2 === 1) {
      add(pops, start + 1.75, .12, 78, finale ? 58 : 48)
      add(pops, start + 2.05, .11, 82, finale ? 62 : 52)
    }
    if (finale && bar % 4 === 3) {
      add(pops, start + 3.25, .1, 82, 50)
      add(pops, start + 3.5, .1, 86, 56)
      add(pops, start + 3.75, .1, 90, 62)
    }
  }

  return [
    track('BTEA_SOFT_KICK', 'noise', .12, kick),
    track('BTEA_BRUSH_SNARE', 'noise', .075, snare),
    track('BTEA_WARM_BASS', 'triangle', .085, bass),
    track('BTEA_TEA_CHORDS', 'triangle', .032, chords),
    track('BTEA_PEARL_PLUCK', 'square', .028, pluck),
    track('BTEA_SHAKER', 'noise', .04, shaker),
    track('BTEA_BUBBLE_POP', 'square', .035, pops),
  ]
}
