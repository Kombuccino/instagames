type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

export const ENTRY_METRO_RAIL_CYCLE_SECONDS = 5.2
export const ENTRY_METRO_BEATS_PER_RAIL_CYCLE = 8
export const ENTRY_METRO_BPM = ENTRY_METRO_BEATS_PER_RAIL_CYCLE * 60 / ENTRY_METRO_RAIL_CYCLE_SECONDS
export const ENTRY_METRO_BARS = 16
export const ENTRY_METRO_LOOP_BEATS = ENTRY_METRO_BARS * 4

const RAIL_PAIR_PERCENTAGES = [23, 24.5, 48, 49.5, 73, 74.5] as const
const RAIL_PAIR_BEATS = RAIL_PAIR_PERCENTAGES.map((percent) => percent / 100 * ENTRY_METRO_BEATS_PER_RAIL_CYCLE)

const CHORDS = [
  [62, 66, 69, 73], // Dmaj7
  [59, 62, 66, 69], // Bm7
  [55, 59, 62, 66], // Gmaj7
  [57, 61, 64, 71], // Aadd9
  [62, 66, 69, 73], // Dmaj7
  [54, 57, 61, 64], // F#m7
  [55, 59, 62, 66], // Gmaj7
  [57, 61, 66, 69], // A6
] as const

const BASS_ROOTS = [50, 47, 43, 45, 50, 42, 43, 45] as const

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

export const metroSunsetEntryTrackIds = [
  'ENTRY_RAIL_TATANG',
  'ENTRY_WARM_BASS',
  'ENTRY_SUNSET_CHORDS',
  'ENTRY_WINDOW_KEYS',
  'ENTRY_BRUSH_SWISH',
] as const

export function metroSunsetEntry(): Track[] {
  const rail: Note[] = []
  const bass: Note[] = []
  const chords: Note[] = []
  const keys: Note[] = []
  const brush: Note[] = []

  // The CSS carriage animation is exactly 5.2s. At 92.307692... BPM that is
  // exactly eight musical beats. These events reproduce the three visual
  // ta-tang pairs at 23/24.5%, 48/49.5% and 73/74.5% of every carriage cycle.
  const railCycles = ENTRY_METRO_LOOP_BEATS / ENTRY_METRO_BEATS_PER_RAIL_CYCLE
  for (let cycle = 0; cycle < railCycles; cycle += 1) {
    const cycleStart = cycle * ENTRY_METRO_BEATS_PER_RAIL_CYCLE
    RAIL_PAIR_BEATS.forEach((offset, index) => {
      const secondHit = index % 2 === 1
      add(rail, cycleStart + offset, secondHit ? .12 : .07, secondHit ? 39 : 37, secondHit ? 72 : 54)
    })
  }

  for (let bar = 0; bar < ENTRY_METRO_BARS; bar += 1) {
    const start = bar * 4
    const chord = CHORDS[bar % CHORDS.length]
    const root = BASS_ROOTS[bar % BASS_ROOTS.length]
    const section = Math.floor(bar / 4)

    // Long, low-velocity harmony: warm light rather than a foreground pad.
    chord.forEach((midi, index) => {
      add(chords, start, 3.72, midi, 28 + index * 2 + (section === 3 ? 3 : 0))
    })

    // Two broad bass breaths per bar, deliberately leaving the rail joints free.
    add(bass, start, 1.52, root, bar % 4 === 0 ? 58 : 52)
    add(bass, start + 2, 1.3, root + 7, 44)

    // Soft brush movement sits between the structural rail hits. The first four
    // bars are deliberately sparse so the ta-tang establishes the identity first.
    if (bar >= 2) {
      const brushVelocity = section === 3 ? 34 : section === 1 ? 30 : 26
      add(brush, start + .5, .18, 38, brushVelocity)
      add(brush, start + 2.5, .18, 38, brushVelocity - 3)
    }
  }

  // A small two-bar motif appears after the environment has established itself.
  // It returns with tiny variations instead of becoming a constant lead melody.
  const phrases = [
    { bar: 4, notes: [66, 69, 73, 71, 69, 66] },
    { bar: 6, notes: [64, 66, 69, 71, 69, 66] },
    { bar: 12, notes: [66, 69, 73, 76, 73, 71] },
    { bar: 14, notes: [64, 66, 69, 71, 69, 66] },
  ] as const
  const offsets = [.5, 1.5, 2.65, 4.5, 5.5, 6.65] as const
  phrases.forEach((phrase, phraseIndex) => {
    const start = phrase.bar * 4
    phrase.notes.forEach((midi, index) => {
      add(keys, start + offsets[index], index === 2 || index === 5 ? .72 : .55, midi, phraseIndex >= 2 ? 40 : 35)
    })
  })

  return [
    track('ENTRY_RAIL_TATANG', 'noise', .115, rail),
    track('ENTRY_WARM_BASS', 'triangle', .105, bass),
    track('ENTRY_SUNSET_CHORDS', 'triangle', .047, chords),
    track('ENTRY_WINDOW_KEYS', 'square', .022, keys),
    track('ENTRY_BRUSH_SWISH', 'noise', .055, brush),
  ]
}
