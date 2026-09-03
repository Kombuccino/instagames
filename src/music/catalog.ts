type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

const BARS = 8
const LOOP_BEATS = BARS * 4
const ROOTS = [50, 46, 41, 48, 50, 46, 43, 45]
const CHORDS = [
  [62, 65, 69, 74],
  [58, 62, 65, 70],
  [65, 69, 72, 77],
  [60, 64, 67, 72],
  [62, 65, 69, 74],
  [58, 62, 65, 70],
  [55, 58, 62, 67],
  [57, 61, 64, 69],
]

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

function reactiveA(): Track[] {
  const bass: Note[] = []
  const arp: Note[] = []
  const drums: Note[] = []
  const hats: Note[] = []
  const lead: Note[] = []
  const counter: Note[] = []
  const stabs: Note[] = []
  const panic: Note[] = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    const bassPattern = [root, root, root + 7, root, root + 12, root + 7, root, root + 7]
    bassPattern.forEach((note, index) => add(bass, start + index * .5, .43, note, index === 0 || index === 4 ? 84 : 70))

    const chord = CHORDS[bar]
    const arpPattern = [0, 1, 2, 1, 0, 1, 3, 2, 0, 1, 2, 1, 3, 2, 1, 2]
    arpPattern.forEach((slot, index) => add(arp, start + index * .25, .19, chord[slot], index % 4 === 0 ? 54 : 44))

    ;[0, 2].forEach((beat) => add(drums, start + beat, .11, 36, 92))
    ;[1, 3].forEach((beat) => add(drums, start + beat, .11, 38, 86))
    for (let index = 0; index < 8; index += 1) add(hats, start + index * .5, .07, 42, index % 2 === 0 ? 46 : 34)

    const leadPattern = [0, 2, 4, 7, 4, 2, 1, 0]
    const scale = [62, 64, 65, 67, 69, 70, 72, 74]
    leadPattern.forEach((degree, index) => {
      if (index === 1 || index === 6) return
      add(lead, start + index * .5, index % 3 === 0 ? .42 : .28, scale[(degree + bar) % scale.length] + 12, index === 0 || index === 4 ? 82 : 70)
    })

    const top = chord[2] + 12
    ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => add(counter, start + offset, .27, top + [4, 2, 0, -2][index], index === 3 ? 56 : 48))

    ;[.5, 1.5, 2.5, 3.5].forEach((offset) => {
      chord.slice(0, 3).forEach((note) => add(stabs, start + offset, .18, note + 12, 35))
    })

    for (let index = 0; index < 16; index += 1) {
      add(panic, start + index * .25, .1, (index % 2 ? chord[1] : chord[2]) + 24, index % 4 === 0 ? 48 : 34)
    }
  })

  return [
    track('L1_BASS_CORE', 'triangle', .16, bass),
    track('L1_ARP_PULSE', 'square', .075, arp),
    track('L1_DRUM_CORE', 'noise', .1, drums),
    track('L2_HATS_CLOCK', 'noise', .1, hats),
    track('L3_LEAD_MAIN', 'square', .075, lead),
    track('L4_COUNTER_SYNC', 'square', .065, counter),
    track('L5_DRIVE_STABS', 'square', .055, stabs),
    track('L6_PANIC_SPARK', 'square', .05, panic),
  ]
}

function reactiveB(): Track[] {
  const tracks = reactiveA().map((source) => ({ ...source, notes: source.notes.map((note) => [...note] as Note) }))
  const bass = tracks.find((item) => item.id === 'L1_BASS_CORE')!
  const drums = tracks.find((item) => item.id === 'L1_DRUM_CORE')!
  const hats = tracks.find((item) => item.id === 'L2_HATS_CLOCK')!
  const lead = tracks.find((item) => item.id === 'L3_LEAD_MAIN')!

  bass.notes = []
  drums.notes = []
  hats.notes = []
  lead.notes = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    for (let index = 0; index < 16; index += 1) {
      const bassNote = [root, root + 7, root + 12, root + 7][index % 4]
      add(bass.notes, start + index * .25, .18, bassNote, index % 4 === 0 ? 86 : 68)
      add(hats.notes, start + index * .25, .06, index === 15 && bar % 4 === 3 ? 46 : 42, index % 4 === 0 ? 48 : 32)
    }
    ;[0, 1.5, 2, 3].forEach((offset, index) => add(drums.notes, start + offset, .1, index === 1 || index === 3 ? 38 : 36, 88))
    const chord = CHORDS[bar]
    const phrase = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[0] + 24, chord[2] + 12]
    phrase.forEach((note, index) => add(lead.notes, start + index * .5, .3, note, index % 4 === 0 ? 88 : 74))
  })

  return tracks
}

const PRIME_STEPS = new Set([2, 3, 5, 7, 11, 13])
const FIB = [0, 1, 1, 2, 3, 5, 0, 5, 3, 2, 1, 1, 0]
const D_MINOR = [62, 64, 65, 67, 69, 70, 72]

function primeCascade(maxMode = false): Track[] {
  const bass: Note[] = []
  const drums: Note[] = []
  const operators: Note[] = []
  const primeHats: Note[] = []
  const fibonacci: Note[] = []
  const multDiv: Note[] = []
  const modulo: Note[] = []
  const panicPrimes: Note[] = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    const chord = CHORDS[bar]

    // Binary density: 2, 4, 8 then effectively 16 pulses at maximum pressure.
    const binaryPattern = maxMode ? 16 : 8
    for (let index = 0; index < binaryPattern; index += 1) {
      const step = 4 / binaryPattern
      const bit = index % 4
      const note = bit === 0 ? root : bit === 2 ? root + 12 : root + 7
      add(bass, start + index * step, step * .72, note, bit === 0 ? 88 : 64)
    }

    // Euclidean-ish 5-of-8 rhythm: regular enough to groove, asymmetric enough to feel computed.
    const kickSlots = maxMode ? [0, 2, 3, 5, 7, 8, 10, 11, 13, 15] : [0, 3, 5, 6]
    const drumGrid = maxMode ? .25 : .5
    kickSlots.forEach((slot, index) => add(drums, start + slot * drumGrid, .08, index % 3 === 1 ? 38 : 36, index % 2 ? 76 : 94))
    add(drums, start + 1, .09, 38, 94)
    add(drums, start + 3, .09, 38, 94)

    // Operators: ×2 and ÷2 are represented by long/short alternating gates.
    for (let index = 0; index < 8; index += 1) {
      const duration = index % 4 < 2 ? .38 : .19
      const octave = index % 4 === 1 ? 12 : 0
      add(operators, start + index * .5, duration, chord[index % 3] + octave, index % 2 ? 45 : 56)
    }

    // Prime accents on a 16-step grid: 2,3,5,7,11,13. These stay deliberately behind the groove.
    for (let step = 0; step < 16; step += 1) {
      if (PRIME_STEPS.has(step)) add(primeHats, start + step * .25, .05, step === 13 ? 46 : 42, step === 2 || step === 7 ? 44 : 34)
    }

    // Fibonacci degrees; the phrase rotates with each falling 'row'.
    FIB.forEach((value, index) => {
      if (!maxMode && index > 7) return
      const degree = (value + bar) % D_MINOR.length
      const spacing = maxMode ? .25 : .5
      add(fibonacci, start + index * spacing, maxMode ? .17 : .3, D_MINOR[degree] + 12, index === 0 || index === 5 ? 76 : 58)
    })

    // Multiplication / division: interval doubles, then collapses by half.
    const intervalCycle = maxMode ? [1, 2, 4, 8, 4, 2, 1, 2] : [1, 2, 4, 2]
    intervalCycle.forEach((interval, index) => {
      const spacing = maxMode ? .5 : 1
      const base = chord[index % 3] + 12
      add(multDiv, start + index * spacing + .25, maxMode ? .2 : .38, base + interval, 40 + interval)
    })

    // Modulo 3 against 4/4: audible 'remainder' stabs.
    const moduloSteps = maxMode ? 16 : 8
    for (let step = 0; step < moduloSteps; step += 1) {
      if (step % 3 !== bar % 3) continue
      const spacing = 4 / moduloSteps
      chord.slice(0, 3).forEach((note) => add(modulo, start + step * spacing, .12, note + 12, 28))
    }

    // Near/max pressure: prime sparks stay in the upper register, but no longer jump a full extra octave.
    for (let step = 0; step < 16; step += 1) {
      if (!PRIME_STEPS.has(step)) continue
      const pitch = chord[2] + 19 + (maxMode && step % 2 ? 5 : 0)
      add(panicPrimes, start + step * .25, .065, pitch, maxMode ? 34 : 30)
    }
  })

  if (maxMode) {
    // Final bar uses a C# leading tone to mathematically 'resolve' back into D when the loop restarts.
    add(fibonacci, 30.5, .22, 85, 62)
    add(fibonacci, 31, .22, 86, 72)
    add(fibonacci, 31.5, .22, 85, 64)
  }

  return [
    track('L1_BINARY_BASS', 'triangle', .17, bass),
    track('L1_EUCLID_DRUM', 'noise', .105, drums),
    track('L1_OPERATOR_PULSE', 'square', .06, operators),
    track('L2_PRIME_HATS', 'noise', .045, primeHats),
    track('L3_FIBONACCI_LEAD', 'square', .055, fibonacci),
    track('L4_MULT_DIV_COUNTER', 'square', .04, multDiv),
    track('L5_MODULO_STABS', 'square', .032, modulo),
    track('L6_PANIC_PRIMES', 'square', .018, panicPrimes),
  ]
}

const reactiveTracks = ['L1_BASS_CORE', 'L1_ARP_PULSE', 'L1_DRUM_CORE']
const mathTracks = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L1_OPERATOR_PULSE']

export const musicCatalog = {
  version: 1,
  rule: 'Never delete a music proposal. Change its status to selected or archived.',
  compositions: [
    {
      id: 'MF-MUS-0001',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Reactive Arithmetic v1',
      status: 'candidate',
      createdAt: '2026-09-03',
      summary: 'Première chiptune réactive : la vitesse et les couches montent avec le niveau.',
      concept: ['8-bit handheld', 'layered escalation', 'D minor', 'reactive tempo'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0001_LoopA.mid', 'MF-MUS-0001_LoopB_Panic.mid'],
      stages: [
        { label: '1', bpm: 112, variant: 'A', activeTracks: reactiveTracks },
        { label: '2', bpm: 120, variant: 'A', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK'] },
        { label: '3', bpm: 130, variant: 'A', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK', 'L3_LEAD_MAIN'] },
        { label: '4', bpm: 141, variant: 'A', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK', 'L3_LEAD_MAIN', 'L4_COUNTER_SYNC'] },
        { label: '5', bpm: 153, variant: 'A', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK', 'L3_LEAD_MAIN', 'L4_COUNTER_SYNC', 'L5_DRIVE_STABS'] },
        { label: '6', bpm: 166, variant: 'A', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK', 'L3_LEAD_MAIN', 'L4_COUNTER_SYNC', 'L5_DRIVE_STABS', 'L6_PANIC_SPARK'] },
        { label: 'MAX', bpm: 180, variant: 'B', activeTracks: [...reactiveTracks, 'L2_HATS_CLOCK', 'L3_LEAD_MAIN', 'L4_COUNTER_SYNC', 'L5_DRIVE_STABS', 'L6_PANIC_SPARK'] },
      ],
      variants: { A: reactiveA(), B: reactiveB() },
    },
    {
      id: 'MF-MUS-0002',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Prime Cascade',
      status: 'candidate',
      createdAt: '2026-09-03',
      summary: 'Une chiptune réellement mathématique : puissances de deux, nombres premiers, Fibonacci, modulo et ×2/÷2 se superposent jusqu’à l’emballement, avec les nouvelles couches mixées derrière le groove central.',
      concept: ['powers of 2', 'prime accents 2·3·5·7', 'Fibonacci melody', '×2 / ÷2 durations', 'modulo 3', 'computational panic'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0002_PrimeCascade_A.mid', 'MF-MUS-0002_PrimeCascade_MAX.mid'],
      stages: [
        { label: '1', bpm: 108, variant: 'A', activeTracks: mathTracks },
        { label: '2', bpm: 118, variant: 'A', activeTracks: [...mathTracks, 'L2_PRIME_HATS'] },
        { label: '3', bpm: 130, variant: 'A', activeTracks: [...mathTracks, 'L2_PRIME_HATS', 'L3_FIBONACCI_LEAD'] },
        { label: '4', bpm: 144, variant: 'A', activeTracks: [...mathTracks, 'L2_PRIME_HATS', 'L3_FIBONACCI_LEAD', 'L4_MULT_DIV_COUNTER'] },
        { label: '5', bpm: 158, variant: 'A', activeTracks: [...mathTracks, 'L2_PRIME_HATS', 'L3_FIBONACCI_LEAD', 'L4_MULT_DIV_COUNTER', 'L5_MODULO_STABS'] },
        { label: '6', bpm: 172, variant: 'A', activeTracks: [...mathTracks, 'L2_PRIME_HATS', 'L3_FIBONACCI_LEAD', 'L4_MULT_DIV_COUNTER', 'L5_MODULO_STABS', 'L6_PANIC_PRIMES'] },
        { label: 'MAX', bpm: 188, variant: 'B', activeTracks: [...mathTracks, 'L2_PRIME_HATS', 'L3_FIBONACCI_LEAD', 'L4_MULT_DIV_COUNTER', 'L5_MODULO_STABS', 'L6_PANIC_PRIMES'] },
      ],
      variants: { A: primeCascade(false), B: primeCascade(true) },
    },
  ],
} as const
