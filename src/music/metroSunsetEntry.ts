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
// Exact derived tempo is 92.307692... BPM. Four decimals keeps the Audio Lab
// readable while making the 5.2s carriage-cycle error sub-millisecond.
export const ENTRY_METRO_BPM = 92.3077
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
  'ENTRY_LOW_PULSE',
  'ENTRY_BRUSH_SWISH',
  'ENTRY_FAST_SHIMMER',
  'ENTRY_WARM_BASS',
  'ENTRY_SUNSET_CHORDS',
  'ENTRY_WINDOW_KEYS',
] as const

function isRailGap(localBeat: number) {
  const phase = ((localBeat % ENTRY_METRO_BEATS_PER_RAIL_CYCLE) + ENTRY_METRO_BEATS_PER_RAIL_CYCLE) % ENTRY_METRO_BEATS_PER_RAIL_CYCLE
  return [1.75, 2, 3.75, 4, 5.75, 6].some((beat) => Math.abs(phase - beat) < .01)
}

export function metroSunsetEntry(): Track[] {
  const rail: Note[] = []
  const lowPulse: Note[] = []
  const brush: Note[] = []
  const shimmer: Note[] = []
  const bass: Note[] = []
  const chords: Note[] = []
  const keys: Note[] = []

  // The CSS carriage animation is exactly 5.2s. At 92.307692... BPM that is
  // exactly eight musical beats. These events reproduce the three visual
  // ta-tang pairs at 23/24.5%, 48/49.5% and 73/74.5% of every carriage cycle.
  const railCycles = ENTRY_METRO_LOOP_BEATS / ENTRY_METRO_BEATS_PER_RAIL_CYCLE
  for (let cycle = 0; cycle < railCycles; cycle += 1) {
    const cycleStart = cycle * ENTRY_METRO_BEATS_PER_RAIL_CYCLE
    RAIL_PAIR_BEATS.forEach((offset, index) => {
      const secondHit = index % 2 === 1
      add(rail, cycleStart + offset, secondHit ? .13 : .075, secondHit ? 39 : 37, secondHit ? 82 : 60)
    })
  }

  for (let bar = 0; bar < ENTRY_METRO_BARS; bar += 1) {
    const start = bar * 4
    const chord = CHORDS[bar % CHORDS.length]
    const root = BASS_ROOTS[bar % BASS_ROOTS.length]
    const section = Math.floor(bar / 4)

    chord.forEach((midi, index) => {
      add(chords, start, 3.7, midi, 25 + index * 2 + (section === 3 ? 2 : 0))
    })

    add(bass, start, 1.42, root, bar % 4 === 0 ? 52 : 47)
    add(bass, start + 2, 1.12, root + 7, 38)

    // The pulse now carries a short octave harmonic as well as the bass root.
    // This keeps its weight while making it readable on laptop/phone speakers.
    const pulseLead = bar % 4 === 0 ? 58 : 50
    add(lowPulse, start, .24, root, pulseLead)
    add(lowPulse, start, .12, root + 12, 32)
    add(lowPulse, start + 2, .2, root, 43)
    add(lowPulse, start + 2, .1, root + 12, 25)

    // Brushes are deliberately more present than in the first mix. They occupy
    // the midrange rather than adding more sub energy.
    add(brush, start + 1, .16, 38, section === 3 ? 56 : 49)
    add(brush, start + 3, .16, 38, section === 3 ? 51 : 44)

    const step = bar < 2 ? .5 : .25
    for (let offset = 0; offset < 4 - .001; offset += step) {
      const absoluteBeat = start + offset
      if (isRailGap(absoluteBeat)) continue
      const sixteenth = Math.round(offset * 4)
      const accent = sixteenth % 4 === 2
      const velocity = bar < 2 ? (accent ? 29 : 23) : accent ? 35 : sixteenth % 2 === 0 ? 27 : 20
      add(shimmer, absoluteBeat, .055, 42, velocity + (section === 3 ? 3 : 0))
    }
  }

  const phraseStarts = [2, 6, 10, 14] as const
  const phraseA = [78, 81, 83, 81, 78] as const
  const phraseB = [76, 78, 81, 78, 74] as const
  const offsetsA = [.75, 1.25, 2, 2.75, 3.35] as const
  const offsetsB = [4.5, 5.15, 5.75, 6.5, 7.35] as const
  const reviewedKeyLength = 1.55

  phraseStarts.forEach((bar, phraseIndex) => {
    const start = bar * 4
    phraseA.forEach((midi, index) => {
      const duration = (index === 2 ? .3 : .2) * reviewedKeyLength
      add(keys, start + offsetsA[index], duration, midi, phraseIndex === 3 ? 43 : 37)
    })
    phraseB.forEach((midi, index) => {
      const duration = (index === 2 ? .28 : .18) * reviewedKeyLength
      add(keys, start + offsetsB[index], duration, midi, phraseIndex === 3 ? 41 : 35)
    })
  })

  return [
    track('ENTRY_RAIL_TATANG', 'noise', .105, rail),
    track('ENTRY_LOW_PULSE', 'triangle', .067, lowPulse),
    track('ENTRY_BRUSH_SWISH', 'noise', .082, brush),
    track('ENTRY_FAST_SHIMMER', 'noise', .094, shimmer),
    track('ENTRY_WARM_BASS', 'triangle', .062, bass),
    track('ENTRY_SUNSET_CHORDS', 'triangle', .023, chords),
    track('ENTRY_WINDOW_KEYS', 'triangle', .029, keys),
  ]
}
