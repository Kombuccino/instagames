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

// Levels 1–5 are derived from CalcDrop's real dropDelay curve:
// 820ms, 672ms, 551ms, 452ms, 371ms -> ~73, 89, 109, 133, 162 BPM.
// Beyond that the game reaches ~197/241 BPM; music deliberately groups those
// clicks and increases subdivision instead of following them literally.
const GAME_SYNC_BPMS = [73, 89, 109, 133, 162, 166, 170] as const

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
  const ghostDrums: Note[] = []
  const bassSync: Note[] = []
  const hook: Note[] = []
  const driveDrums: Note[] = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    const chord = CHORDS[bar]

    const bassPattern = [root, root, root + 7, root, root + 12, root + 7, root, root + 7]
    bassPattern.forEach((note, index) => add(bass, start + index * .5, .43, note, index === 0 || index === 4 ? 82 : 66))

    const arpPattern = [0, 1, 2, 1, 0, 1, 3, 2, 0, 1, 2, 1, 3, 2, 1, 2]
    arpPattern.forEach((slot, index) => add(arp, start + index * .25, .18, chord[slot], index % 4 === 0 ? 50 : 39))

    ;[0, 2].forEach((beat) => add(drums, start + beat, .11, 36, 88))
    ;[1, 3].forEach((beat) => add(drums, start + beat, .11, 38, 82))

    for (let index = 0; index < 8; index += 1) {
      add(hats, start + index * .5, .055, 42, index % 2 === 0 ? 38 : 28)
    }

    // Rhythmic escalation first: quiet ghost hits, not a new melody.
    ;[.75, 1.75, 2.75, 3.75].forEach((offset, index) => {
      if ((bar + index) % 2 === 0) add(ghostDrums, start + offset, .045, 38, 27)
    })

    // A low-register syncopated answer that reinforces the bass instead of competing with it.
    ;[1.5, 3.5].forEach((offset, index) => {
      add(bassSync, start + offset, .24, index === 0 ? root + 7 : root + 12, 46)
    })

    // One sparse hook only every other bar, deliberately kept in the middle register.
    if (bar % 2 === 0) {
      const phrase = [chord[0] + 5, chord[1] + 5, chord[2] + 3, chord[1] + 5]
      ;[0, 1, 2.5, 3].forEach((offset, index) => add(hook, start + offset, .3, phrase[index], index === 0 ? 60 : 48))
    }

    // Final pressure comes from kick/snare subdivision, not another pitched line.
    ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => {
      add(driveDrums, start + offset, .05, index % 2 === 0 ? 36 : 38, index % 2 === 0 ? 44 : 34)
    })
  })

  return [
    track('L1_BASS_CORE', 'triangle', .16, bass),
    track('L1_ARP_PULSE', 'square', .064, arp),
    track('L1_DRUM_CORE', 'noise', .095, drums),
    track('L2_HATS_CLOCK', 'noise', .055, hats),
    track('L3_GHOST_DRUMS', 'noise', .042, ghostDrums),
    track('L4_BASS_SYNC', 'triangle', .055, bassSync),
    track('L5_SPARSE_HOOK', 'square', .042, hook),
    track('L6_DRIVE_DRUMS', 'noise', .048, driveDrums),
  ]
}

function reactiveB(): Track[] {
  const tracks = reactiveA().map((source) => ({ ...source, notes: source.notes.map((note) => [...note] as Note) }))
  const bass = tracks.find((item) => item.id === 'L1_BASS_CORE')!
  const drums = tracks.find((item) => item.id === 'L1_DRUM_CORE')!
  const hats = tracks.find((item) => item.id === 'L2_HATS_CLOCK')!

  bass.notes = []
  drums.notes = []
  hats.notes = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    for (let index = 0; index < 16; index += 1) {
      const note = index % 4 === 0 ? root : index % 4 === 2 ? root + 7 : root + 12
      add(bass.notes, start + index * .25, .17, note, index % 4 === 0 ? 76 : 52)
      add(hats.notes, start + index * .25, .04, 42, index % 4 === 0 ? 34 : 22)
    }
    ;[0, 1, 2, 3].forEach((beat) => add(drums.notes, start + beat, .07, beat % 2 ? 38 : 36, beat % 2 ? 72 : 82))
    ;[.5, 1.5, 2.5, 3.5].forEach((offset) => add(drums.notes, start + offset, .04, 36, 34))
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
  const fibPerc: Note[] = []
  const moduloBass: Note[] = []
  const fibHook: Note[] = []
  const panicRhythm: Note[] = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    const chord = CHORDS[bar]

    const binaryPattern = maxMode ? 16 : 8
    for (let index = 0; index < binaryPattern; index += 1) {
      const step = 4 / binaryPattern
      const bit = index % 4
      const note = bit === 0 ? root : bit === 2 ? root + 12 : root + 7
      add(bass, start + index * step, step * .7, note, bit === 0 ? 84 : 60)
    }

    const kickSlots = maxMode ? [0, 2, 5, 7, 8, 10, 13, 15] : [0, 3, 5, 6]
    const grid = maxMode ? .25 : .5
    kickSlots.forEach((slot, index) => add(drums, start + slot * grid, .07, index % 3 === 1 ? 38 : 36, index % 2 ? 68 : 88))
    add(drums, start + 1, .08, 38, 84)
    add(drums, start + 3, .08, 38, 84)

    // ×2 / ÷2 remains part of the core harmony, but stays low and compact.
    for (let index = 0; index < 8; index += 1) {
      const duration = index % 4 < 2 ? .36 : .18
      const note = chord[index % 3] + (index % 4 === 1 ? 7 : 0)
      add(operators, start + index * .5, duration, note, index % 2 ? 40 : 48)
    }

    // Prime positions should be clearly identifiable as a crisp, syncopated hi-hat language.
    for (let step = 0; step < 16; step += 1) {
      if (PRIME_STEPS.has(step)) add(primeHats, start + step * .25, .065, 42, step === 2 || step === 7 ? 72 : 54)
    }

    // Fibonacci remains rhythmic, but the accents need enough body to be heard inside the mix.
    const fibSlots = [0, 1, 2, 4, 7, 12]
    fibSlots.forEach((slot, index) => {
      if (!maxMode && index > 3) return
      add(fibPerc, start + (slot % 16) * .25, .07, index % 2 ? 38 : 42, 48 + index * 5)
    })

    // Modulo 3 is a real low-register punctuation, not a barely audible ghost note.
    const moduloSteps = maxMode ? 16 : 8
    for (let step = 0; step < moduloSteps; step += 1) {
      if (step % 3 !== bar % 3) continue
      const spacing = 4 / moduloSteps
      add(moduloBass, start + step * spacing, .19, root + 7, 64)
    }

    // Only one additional melodic voice: a sparse Fibonacci hook every two bars.
    if (bar % 2 === 0) {
      const values = maxMode ? FIB.slice(0, 6) : FIB.slice(0, 4)
      values.forEach((value, index) => {
        const degree = (value + bar) % D_MINOR.length
        const spacing = maxMode ? .5 : .75
        add(fibHook, start + index * spacing, maxMode ? .2 : .28, D_MINOR[degree] + 5, index === 0 ? 54 : 42)
      })
    }

    // Prime-indexed pressure gets a short but physical kick/snare identity.
    for (let step = 0; step < 16; step += 1) {
      if (!PRIME_STEPS.has(step)) continue
      add(panicRhythm, start + step * .25, .055, step % 2 ? 36 : 38, maxMode ? 60 : 46)
    }
  })

  return [
    track('L1_BINARY_BASS', 'triangle', .165, bass),
    track('L1_EUCLID_DRUM', 'noise', .1, drums),
    track('L1_OPERATOR_PULSE', 'square', .052, operators),
    track('L2_PRIME_HATS', 'noise', .095, primeHats),
    track('L3_FIB_RHYTHM', 'noise', .088, fibPerc),
    track('L4_MODULO_BASS', 'triangle', .092, moduloBass),
    track('L5_FIB_HOOK', 'square', .038, fibHook),
    track('L6_PRIME_DRIVE', 'noise', .09, panicRhythm),
  ]
}

const reactiveCore = ['L1_BASS_CORE', 'L1_ARP_PULSE', 'L1_DRUM_CORE']
const mathCore = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L1_OPERATOR_PULSE']

export const musicCatalog = {
  version: 2,
  rule: 'Never delete a music proposal. Change its status to selected or archived.',
  compositions: [
    {
      id: 'MF-MUS-0001',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Reactive Arithmetic v1',
      status: 'selected',
      createdAt: '2026-09-03',
      summary: 'Chiptune réactive recalée sur la chute réelle du jeu : le début reste mélodique, puis la pression vient surtout du rythme et de la subdivision.',
      concept: ['8-bit handheld', 'game-synced tempo', 'rhythm-first escalation', 'D minor'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0001_LoopA.mid', 'MF-MUS-0001_LoopB_Panic.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'A', activeTracks: reactiveCore },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'A', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK'] },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'A', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK', 'L3_GHOST_DRUMS'] },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'A', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK', 'L3_GHOST_DRUMS', 'L4_BASS_SYNC'] },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'A', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK', 'L3_GHOST_DRUMS', 'L4_BASS_SYNC', 'L5_SPARSE_HOOK'] },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'A', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK', 'L3_GHOST_DRUMS', 'L4_BASS_SYNC', 'L5_SPARSE_HOOK', 'L6_DRIVE_DRUMS'] },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'B', activeTracks: [...reactiveCore, 'L2_HATS_CLOCK', 'L3_GHOST_DRUMS', 'L4_BASS_SYNC', 'L5_SPARSE_HOOK', 'L6_DRIVE_DRUMS'] },
      ],
      variants: { A: reactiveA(), B: reactiveB() },
    },
    {
      id: 'MF-MUS-0002',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Prime Cascade',
      status: 'selected',
      createdAt: '2026-09-03',
      summary: 'Mathématique mais plus lisible : nombres premiers, Fibonacci et modulo sont désormais surtout des structures rythmiques, avec une seule petite voix mélodique secondaire.',
      concept: ['powers of 2', 'prime-number rhythm', 'Fibonacci rhythm', 'modulo bass', 'game-synced tempo'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0002_PrimeCascade_A.mid', 'MF-MUS-0002_PrimeCascade_MAX.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'A', activeTracks: mathCore },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'A', activeTracks: [...mathCore, 'L2_PRIME_HATS'] },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'A', activeTracks: [...mathCore, 'L2_PRIME_HATS', 'L3_FIB_RHYTHM'] },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'A', activeTracks: [...mathCore, 'L2_PRIME_HATS', 'L3_FIB_RHYTHM', 'L4_MODULO_BASS'] },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'A', activeTracks: [...mathCore, 'L2_PRIME_HATS', 'L3_FIB_RHYTHM', 'L4_MODULO_BASS', 'L5_FIB_HOOK'] },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'A', activeTracks: [...mathCore, 'L2_PRIME_HATS', 'L3_FIB_RHYTHM', 'L4_MODULO_BASS', 'L5_FIB_HOOK', 'L6_PRIME_DRIVE'] },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'B', activeTracks: [...mathCore, 'L2_PRIME_HATS', 'L3_FIB_RHYTHM', 'L4_MODULO_BASS', 'L5_FIB_HOOK', 'L6_PRIME_DRIVE'] },
      ],
      variants: { A: primeCascade(false), B: primeCascade(true) },
    },
  ],
} as const
