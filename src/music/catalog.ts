type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type ArrangementMode = 'low' | 'mid' | 'high' | 'max'
type Section = 'intro' | 'rise' | 'refrain' | 'breakdown' | 'rebuild' | 'finale'

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

const BARS = 48
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
// Beyond that the game reaches ~197/241 BPM; music caps tempo and changes the
// arrangement instead of mechanically playing the same dense parts faster.
const GAME_SYNC_BPMS = [73, 89, 109, 133, 162, 166, 170] as const

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

function sectionForBar(bar: number): Section {
  if (bar < 8) return 'intro'
  if (bar < 16) return 'rise'
  if (bar < 24) return 'refrain'
  if (bar < 32) return 'breakdown'
  if (bar < 40) return 'rebuild'
  return 'finale'
}

function progressionIndex(bar: number) {
  const section = sectionForBar(bar)
  if (section === 'finale') return (bar + 2) % ROOTS.length
  if (section === 'breakdown') return Math.floor((bar - 24) / 2) % ROOTS.length
  return bar % ROOTS.length
}

function rootForBar(bar: number) {
  return ROOTS[progressionIndex(bar)]
}

function chordForBar(bar: number) {
  return CHORDS[progressionIndex(bar)]
}

function isRefrain(section: Section) {
  return section === 'refrain' || section === 'finale'
}

function rebuildAmount(bar: number) {
  if (sectionForBar(bar) !== 'rebuild') return 1
  return Math.max(0, Math.min(1, (bar - 32) / 7))
}

function reactiveArrangement(mode: ArrangementMode): Track[] {
  const bass: Note[] = []
  const arp: Note[] = []
  const drums: Note[] = []
  const hats: Note[] = []
  const ghostDrums: Note[] = []
  const bassSync: Note[] = []
  const hook: Note[] = []
  const driveDrums: Note[] = []

  for (let bar = 0; bar < BARS; bar += 1) {
    const start = bar * 4
    const root = rootForBar(bar)
    const chord = chordForBar(bar)
    const section = sectionForBar(bar)
    const refrain = isRefrain(section)
    const breakdown = section === 'breakdown'
    const rebuild = rebuildAmount(bar)

    // Bass density drops as BPM rises. At high speed it becomes a stable pulse,
    // not the same 8th-note line forced through a faster clock.
    if (breakdown) {
      add(bass, start, 1.55, root, 92)
      add(bass, start + 2, 1.35, root + 7, 82)
    } else if (mode === 'low') {
      const pattern = refrain
        ? [root, root + 7, root + 12, root + 7, root, root + 7, root + 12, root + 7]
        : [root, root, root + 7, root, root + 12, root + 7, root, root + 7]
      pattern.forEach((note, index) => add(bass, start + index * .5, .46, note, index % 4 === 0 ? 98 : 76))
    } else if (mode === 'mid') {
      const pattern = refrain ? [root, root + 7, root + 12, root + 7] : [root, root + 7, root, root + 12]
      pattern.forEach((note, index) => add(bass, start + index, .72, note, index === 0 ? 100 : 80))
      if (section === 'rise' || section === 'rebuild') add(bass, start + 3.5, .34, root + 7, 70)
    } else {
      const pattern = refrain ? [root, root + 12, root + 7, root + 12] : [root, root + 7, root, root + 7]
      pattern.forEach((note, index) => add(bass, start + index, .78, note, index === 0 || (refrain && index === 2) ? 104 : 82))
    }

    // The arpeggio deliberately loses density with tempo and disappears from the
    // active arrangement from level 5 upward.
    if (breakdown) {
      ;[0, 2].forEach((offset, index) => add(arp, start + offset, 1.25, chord[index * 2], 44))
    } else if (mode === 'low') {
      if (refrain) {
        const phrase = [chord[0], chord[2], chord[3], chord[1]]
        phrase.forEach((note, index) => add(arp, start + index, .65, note, index === 0 ? 62 : 52))
      } else {
        const phrase = [0, 1, 2, 1, 0, 1, 3, 2]
        phrase.forEach((slot, index) => add(arp, start + index * .5, .3, chord[slot], index % 4 === 0 ? 52 : 42))
      }
    } else if (mode === 'mid') {
      const phrase = refrain ? [0, 2, 3, 1] : [0, 1, 2, 1]
      phrase.forEach((slot, index) => add(arp, start + index, .58, chord[slot], index === 0 ? 56 : 44))
    } else {
      // Kept in the variant for inspection, but high-speed stages do not activate it.
      ;[0, 2].forEach((offset, index) => add(arp, start + offset, 1.15, chord[index * 2], 38))
    }

    // Main kick/snare remains the physical clock. Breakdown deliberately drops to
    // half-time before the rebuild brings the full pulse back.
    if (breakdown) {
      add(drums, start, .16, 36, 112)
      add(drums, start + 2, .17, 38, 106)
    } else {
      ;[0, 2].forEach((beat) => add(drums, start + beat, .14, 36, refrain ? 118 : 112))
      ;[1, 3].forEach((beat) => add(drums, start + beat, .14, 38, refrain ? 110 : 104))
      if ((section === 'rise' || section === 'rebuild') && rebuild > .45) add(drums, start + 3.5, .075, 38, 62)
    }

    // Hats get sparser as BPM rises. More speed means fewer events, not a wash of noise.
    if (breakdown) {
      add(hats, start + 1.5, .12, 46, 48)
      add(hats, start + 3.5, .12, 46, 54)
    } else {
      const hatStep = mode === 'low' ? .5 : 1
      const hatCount = mode === 'low' ? 8 : 4
      for (let index = 0; index < hatCount; index += 1) {
        if (section === 'intro' && bar < 4 && index % 2 === 1) continue
        if (section === 'rebuild' && rebuild < .3 && index % 2 === 1) continue
        add(hats, start + index * hatStep, mode === 'low' ? .075 : .095, 42, index % 2 === 0 ? 66 : 50)
      }
    }

    // Ghosts only decorate the middle-tempo arrangement; they are removed once the
    // track would become smeared at high BPM.
    if (mode !== 'high' && mode !== 'max' && !breakdown && (section === 'rise' || section === 'rebuild' || refrain)) {
      ;[.75, 2.75].forEach((offset, index) => {
        if (section !== 'rebuild' || rebuild > index * .35) add(ghostDrums, start + offset, .075, 38, refrain ? 64 : 58)
      })
    }

    // Sync bass replaces some of the arpeggio's motion at faster levels.
    if (!breakdown) {
      const syncOffsets = mode === 'low' ? [1.5, 3.5] : refrain ? [1.5, 3.25] : [1.5, 3.5]
      syncOffsets.forEach((offset, index) => add(bassSync, start + offset, mode === 'low' ? .3 : .46, index === 0 ? root + 7 : root + 12, refrain ? 86 : 78))
    } else {
      add(bassSync, start + 3, .72, root + 7, 62)
    }

    // The hook acts as the readable melodic replacement for the fast arpeggio.
    if (refrain) {
      const phrase = section === 'finale'
        ? [chord[2] + 5, chord[3] + 5, chord[1] + 5, chord[0] + 12]
        : [chord[0] + 5, chord[1] + 5, chord[2] + 3, chord[1] + 5]
      if (mode === 'high' || mode === 'max') {
        ;[0, 1.5, 3].forEach((offset, index) => add(hook, start + offset, .82, phrase[index], index === 0 ? 72 : 60))
      } else if (bar % 2 === 0) {
        ;[0, 1, 2.5, 3].forEach((offset, index) => add(hook, start + offset, .36, phrase[index], index === 0 ? 64 : 52))
      }
    } else if (section === 'breakdown' && (bar === 28 || bar === 30)) {
      add(hook, start + 2, 1.1, chord[0] + 5, 46)
    } else if (section === 'rebuild' && bar >= 37) {
      add(hook, start + 2.5, .65, chord[1] + 5, 48 + Math.round(rebuild * 12))
    }

    // Drive percussion is a high-speed replacement layer: clear off-beats, not a
    // second wall of 16ths.
    if ((mode === 'high' || mode === 'max') && !breakdown && (section === 'rise' || section === 'rebuild' || refrain)) {
      const offsets = mode === 'max' && refrain ? [.5, 1.5, 2.5, 3.5] : [.5, 2.5]
      offsets.forEach((offset, index) => add(driveDrums, start + offset, .085, index % 2 === 0 ? 36 : 38, refrain ? 78 : 68))
    }
  }

  return [
    track('L1_BASS_CORE', 'triangle', .185, bass),
    track('L1_ARP_PULSE', 'square', .06, arp),
    track('L1_DRUM_CORE', 'noise', .155, drums),
    track('L2_HATS_CLOCK', 'noise', .09, hats),
    track('L3_GHOST_DRUMS', 'noise', .08, ghostDrums),
    track('L4_BASS_SYNC', 'triangle', .095, bassSync),
    track('L5_SPARSE_HOOK', 'square', .052, hook),
    track('L6_DRIVE_DRUMS', 'noise', .09, driveDrums),
  ]
}

const PRIME_STEPS = new Set([2, 3, 5, 7, 11, 13])
const FIB = [0, 1, 1, 2, 3, 5, 0, 5, 3, 2, 1, 1, 0]
const D_MINOR = [62, 64, 65, 67, 69, 70, 72]

function primeArrangement(mode: ArrangementMode): Track[] {
  const bass: Note[] = []
  const drums: Note[] = []
  const operators: Note[] = []
  const primeHats: Note[] = []
  const fibPerc: Note[] = []
  const moduloBass: Note[] = []
  const fibHook: Note[] = []
  const panicRhythm: Note[] = []

  for (let bar = 0; bar < BARS; bar += 1) {
    const start = bar * 4
    const root = rootForBar(bar)
    const chord = chordForBar(bar)
    const section = sectionForBar(bar)
    const refrain = isRefrain(section)
    const breakdown = section === 'breakdown'
    const rebuild = rebuildAmount(bar)

    // Binary bass halves its event density as tempo rises.
    if (breakdown) {
      add(bass, start, 1.55, root, 92)
      add(bass, start + 2, 1.25, root + 12, 78)
    } else {
      const count = mode === 'low' ? 8 : 4
      const spacing = 4 / count
      for (let index = 0; index < count; index += 1) {
        const bit = index % 4
        const note = bit === 0 ? root : bit === 2 ? root + 12 : root + 7
        add(bass, start + index * spacing, spacing * .72, note, bit === 0 ? 96 : 72)
      }
    }

    if (breakdown) {
      add(drums, start, .16, 36, 112)
      add(drums, start + 2, .17, 38, 104)
    } else {
      // Euclidean identity stays, but the high-speed variants use a coarser grid.
      const slots = mode === 'low' ? [0, 3, 5, 6] : mode === 'mid' ? [0, 2, 5, 7] : [0, 2, 4, 6]
      const grid = mode === 'low' ? .5 : .5
      slots.forEach((slot, index) => add(drums, start + slot * grid, .09, index % 3 === 1 ? 38 : 36, refrain ? 100 : 88))
      add(drums, start + 1, .1, 38, 92)
      add(drums, start + 3, .1, 38, 92)
    }

    // ×2 / ÷2 is useful at low/mid tempo, then is removed from the active stage
    // instead of being accelerated into a blur.
    if (breakdown) {
      ;[0, 2].forEach((offset, index) => add(operators, start + offset, 1.05, chord[index * 2], 42))
    } else {
      const count = mode === 'low' ? 8 : 4
      const spacing = 4 / count
      for (let index = 0; index < count; index += 1) {
        const duration = index % 2 === 0 ? spacing * .72 : spacing * .4
        const note = chord[index % 3] + (index % 4 === 1 ? 7 : 0)
        add(operators, start + index * spacing, duration, note, refrain ? 52 : 46)
      }
    }

    // Prime hats are intentionally reduced at faster tempi.
    if (!breakdown) {
      const primeSlots = mode === 'low'
        ? [2, 3, 5, 7, 11, 13]
        : mode === 'mid'
          ? [2, 5, 11, 13]
          : [2, 7, 13]
      primeSlots.forEach((step, index) => {
        if (!PRIME_STEPS.has(step)) return
        if (section === 'intro' && bar < 4 && index % 2 === 1) return
        add(primeHats, start + step * .25, mode === 'low' ? .07 : .09, 42, index === 0 || index === primeSlots.length - 1 ? 72 : 56)
      })
    }

    // Fibonacci percussion is a middle-tempo color and gets removed at high speed.
    if ((mode === 'low' || mode === 'mid') && !breakdown && (section === 'rise' || section === 'rebuild' || refrain)) {
      const fibSlots = mode === 'low' ? [0, 1, 2, 4, 7, 12] : [0, 2, 7, 12]
      fibSlots.forEach((slot, index) => {
        if (section === 'rebuild' && rebuild < index / fibSlots.length) return
        add(fibPerc, start + (slot % 16) * .25, .075, index % 2 ? 38 : 42, 52 + index * 4)
      })
    }

    // Modulo bass becomes the low-register replacement for some removed melodic motion.
    if (breakdown) {
      add(moduloBass, start + 1.5, .9, root + 7, 68)
    } else {
      const moduloSteps = mode === 'low' ? 8 : 4
      const spacing = 4 / moduloSteps
      for (let step = 0; step < moduloSteps; step += 1) {
        if (step % 3 !== bar % 3) continue
        add(moduloBass, start + step * spacing, mode === 'low' ? .22 : .48, root + 7, refrain ? 78 : 68)
      }
    }

    // Fibonacci hook becomes the readable high-tempo melodic voice and carries the refrain.
    if (refrain) {
      const values = mode === 'high' || mode === 'max' ? FIB.slice(0, 4) : FIB.slice(0, 5)
      const spacing = mode === 'high' || mode === 'max' ? 1 : .75
      values.forEach((value, index) => {
        const degree = (value + bar) % D_MINOR.length
        add(fibHook, start + Math.min(3, index * spacing), mode === 'high' || mode === 'max' ? .75 : .34, D_MINOR[degree] + 5, index === 0 ? 68 : 54)
      })
    } else if (section === 'breakdown' && bar % 2 === 0) {
      add(fibHook, start + 2, 1.1, D_MINOR[(bar / 2) % D_MINOR.length] + 5, 44)
    } else if (section === 'rebuild' && bar >= 37) {
      add(fibHook, start + 3, .65, D_MINOR[(bar + 2) % D_MINOR.length] + 5, 48 + Math.round(rebuild * 12))
    }

    // Prime drive replaces the small high-frequency layers at high speed.
    if ((mode === 'high' || mode === 'max') && !breakdown && (section === 'rise' || section === 'rebuild' || refrain)) {
      const slots = mode === 'max' && refrain ? [2, 5, 7, 13] : [2, 7, 13]
      slots.forEach((step, index) => add(panicRhythm, start + step * .25, .075, index % 2 ? 36 : 38, refrain ? 76 : 64))
    }
  }

  return [
    track('L1_BINARY_BASS', 'triangle', .175, bass),
    track('L1_EUCLID_DRUM', 'noise', .13, drums),
    track('L1_OPERATOR_PULSE', 'square', .054, operators),
    track('L2_PRIME_HATS', 'noise', .095, primeHats),
    track('L3_FIB_RHYTHM', 'noise', .088, fibPerc),
    track('L4_MODULO_BASS', 'triangle', .1, moduloBass),
    track('L5_FIB_HOOK', 'square', .048, fibHook),
    track('L6_PRIME_DRIVE', 'noise', .095, panicRhythm),
  ]
}

const reactiveLow = ['L1_BASS_CORE', 'L1_ARP_PULSE', 'L1_DRUM_CORE']
const reactiveLowPlus = [...reactiveLow, 'L2_HATS_CLOCK']
const reactiveMid = [...reactiveLowPlus, 'L3_GHOST_DRUMS']
const reactiveMidPlus = [...reactiveLowPlus, 'L3_GHOST_DRUMS', 'L4_BASS_SYNC']
const reactiveHigh = ['L1_BASS_CORE', 'L1_DRUM_CORE', 'L2_HATS_CLOCK', 'L4_BASS_SYNC', 'L5_SPARSE_HOOK']
const reactiveDrive = [...reactiveHigh, 'L6_DRIVE_DRUMS']

const primeLow = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L1_OPERATOR_PULSE']
const primeLowPlus = [...primeLow, 'L2_PRIME_HATS']
const primeMid = [...primeLowPlus, 'L3_FIB_RHYTHM']
const primeMidPlus = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L2_PRIME_HATS', 'L3_FIB_RHYTHM', 'L4_MODULO_BASS']
const primeHigh = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L2_PRIME_HATS', 'L4_MODULO_BASS', 'L5_FIB_HOOK']
const primeDrive = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L4_MODULO_BASS', 'L5_FIB_HOOK', 'L6_PRIME_DRIVE']

export const musicCatalog = {
  version: 3,
  rule: 'Never delete a music proposal. Change its status to selected or archived.',
  compositions: [
    {
      id: 'MF-MUS-0001',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Reactive Arithmetic v1',
      status: 'selected',
      createdAt: '2026-09-03',
      summary: 'Chiptune réactive longue forme : les lignes se simplifient ou se remplacent avec le tempo, avec refrain, descente et reconstruction au lieu d’un simple empilement.',
      concept: ['8-bit handheld', 'tempo-aware orchestration', 'long-form sections', 'rhythm-first escalation', 'D minor'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0001_LoopA.mid', 'MF-MUS-0001_LoopB_Panic.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'LOW', activeTracks: reactiveLow },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'LOW', activeTracks: reactiveLowPlus },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'MID', activeTracks: reactiveMid },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'MID', activeTracks: reactiveMidPlus },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'HIGH', activeTracks: reactiveHigh },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'HIGH', activeTracks: reactiveDrive },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'MAX', activeTracks: reactiveDrive },
      ],
      variants: {
        LOW: reactiveArrangement('low'),
        MID: reactiveArrangement('mid'),
        HIGH: reactiveArrangement('high'),
        MAX: reactiveArrangement('max'),
      },
    },
    {
      id: 'MF-MUS-0002',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Prime Cascade',
      status: 'selected',
      createdAt: '2026-09-03',
      summary: 'Arrangement mathématique longue forme : les motifs premiers/Fibonacci changent de fonction avec le tempo, puis laissent place à des voix plus espacées aux niveaux rapides.',
      concept: ['powers of 2', 'prime-number rhythm', 'Fibonacci rhythm', 'tempo-aware replacement', 'long-form sections'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0002_PrimeCascade_A.mid', 'MF-MUS-0002_PrimeCascade_MAX.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'LOW', activeTracks: primeLow },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'LOW', activeTracks: primeLowPlus },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'MID', activeTracks: primeMid },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'MID', activeTracks: primeMidPlus },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'HIGH', activeTracks: primeHigh },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'HIGH', activeTracks: primeDrive },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'MAX', activeTracks: primeDrive },
      ],
      variants: {
        LOW: primeArrangement('low'),
        MID: primeArrangement('mid'),
        HIGH: primeArrangement('high'),
        MAX: primeArrangement('max'),
      },
    },
  ],
} as const
