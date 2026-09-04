type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type ArrangementMode = 'low' | 'mid' | 'high' | 'max'
type Section = 'intro' | 'rise' | 'refrain' | 'descent' | 'rebuild' | 'finale'
type Family = 'reactive' | 'prime'

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

const CYCLE_BARS = 8
const CYCLES = 6
const BARS = CYCLE_BARS * CYCLES
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
// Above that, tempo is capped. Arrangement density changes instead of forcing
// the same dense melody through an ever faster clock.
const GAME_SYNC_BPMS = [73, 89, 109, 133, 162, 166, 170] as const

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

function clampVelocity(value: number) {
  return Math.max(1, Math.min(127, Math.round(value)))
}

function sectionForCycle(cycle: number): Section {
  if (cycle === 0) return 'intro'
  if (cycle === 1) return 'rise'
  if (cycle === 2) return 'refrain'
  if (cycle === 3) return 'descent'
  if (cycle === 4) return 'rebuild'
  return 'finale'
}

function isQuarter(beat: number) {
  return Math.abs(beat - Math.round(beat)) < .001
}

function isOffbeatEighth(beat: number) {
  const fraction = ((beat % 1) + 1) % 1
  return Math.abs(fraction - .5) < .001
}

function sectionVelocity(section: Section, trackId: string) {
  const anchor = trackId === 'L1_BASS_CORE'
    || trackId === 'L1_DRUM_CORE'
    || trackId === 'L1_BINARY_BASS'
    || trackId === 'L1_EUCLID_DRUM'

  if (section === 'intro') return anchor ? .98 : .88
  if (section === 'rise') return 1
  if (section === 'refrain') return anchor ? 1.06 : 1.02
  if (section === 'descent') return anchor ? .96 : .72
  if (section === 'rebuild') return anchor ? 1 : .9
  return anchor ? 1.08 : 1.04
}

// These eight bars are intentionally the musical source that existed before
// the long-form rewrite. The 48-bar arrangements below preserve these pitches,
// harmony and rhythmic identities instead of composing new material on top.
function reactiveSource(): Track[] {
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
    bassPattern.forEach((note, index) => add(bass, start + index * .5, .46, note, index === 0 || index === 4 ? 96 : 76))

    const arpPattern = [0, 1, 2, 1, 0, 1, 3, 2, 0, 1, 2, 1, 3, 2, 1, 2]
    arpPattern.forEach((slot, index) => add(arp, start + index * .25, .18, chord[slot], index % 4 === 0 ? 50 : 39))

    // Unambiguous foot pulse: kick / snare / kick / snare, every bar, every section.
    ;[0, 2].forEach((beat) => add(drums, start + beat, .14, 36, 112))
    ;[1, 3].forEach((beat) => add(drums, start + beat, .14, 38, 104))

    for (let index = 0; index < 8; index += 1) {
      add(hats, start + index * .5, .075, 42, index % 2 === 0 ? 64 : 48)
    }

    ;[.75, 1.75, 2.75, 3.75].forEach((offset, index) => {
      if ((bar + index) % 2 === 0) add(ghostDrums, start + offset, .07, 38, 58)
    })

    ;[1.5, 3.5].forEach((offset, index) => {
      add(bassSync, start + offset, .3, index === 0 ? root + 7 : root + 12, 78)
    })

    if (bar % 2 === 0) {
      const phrase = [chord[0] + 5, chord[1] + 5, chord[2] + 3, chord[1] + 5]
      ;[0, 1, 2.5, 3].forEach((offset, index) => add(hook, start + offset, .3, phrase[index], index === 0 ? 60 : 48))
    }

    ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => {
      add(driveDrums, start + offset, .075, index % 2 === 0 ? 36 : 38, index % 2 === 0 ? 72 : 60)
    })
  })

  return [
    track('L1_BASS_CORE', 'triangle', .185, bass),
    track('L1_ARP_PULSE', 'square', .06, arp),
    track('L1_DRUM_CORE', 'noise', .155, drums),
    track('L2_HATS_CLOCK', 'noise', .09, hats),
    track('L3_GHOST_DRUMS', 'noise', .08, ghostDrums),
    track('L4_BASS_SYNC', 'triangle', .095, bassSync),
    track('L5_SPARSE_HOOK', 'square', .042, hook),
    track('L6_DRIVE_DRUMS', 'noise', .085, driveDrums),
  ]
}

const PRIME_STEPS = new Set([2, 3, 5, 7, 11, 13])
const FIB = [0, 1, 1, 2, 3, 5, 0, 5, 3, 2, 1, 1, 0]
const D_MINOR = [62, 64, 65, 67, 69, 70, 72]

function primeSource(): Track[] {
  const bass: Note[] = []
  const drums: Note[] = []
  const operators: Note[] = []
  const primeHats: Note[] = []
  const fibPerc: Note[] = []
  const moduloBass: Note[] = []
  const fibHook: Note[] = []
  const primeDrive: Note[] = []

  ROOTS.forEach((root, bar) => {
    const start = bar * 4
    const chord = CHORDS[bar]

    for (let index = 0; index < 8; index += 1) {
      const bit = index % 4
      const note = bit === 0 ? root : bit === 2 ? root + 12 : root + 7
      add(bass, start + index * .5, .35, note, bit === 0 ? 84 : 60)
    }

    // Keep the Euclidean flavour as secondary accents, but put an explicit
    // four-beat spine underneath it so the player's foot never loses the bar.
    ;[0, 2].forEach((beat) => add(drums, start + beat, .11, 36, 106))
    ;[1, 3].forEach((beat) => add(drums, start + beat, .11, 38, 98))
    ;[1.5, 2.5].forEach((beat, index) => add(drums, start + beat, .065, index ? 38 : 36, 48))

    for (let index = 0; index < 8; index += 1) {
      const duration = index % 4 < 2 ? .36 : .18
      const note = chord[index % 3] + (index % 4 === 1 ? 7 : 0)
      add(operators, start + index * .5, duration, note, index % 2 ? 40 : 48)
    }

    for (let step = 0; step < 16; step += 1) {
      if (PRIME_STEPS.has(step)) add(primeHats, start + step * .25, .065, 42, step === 2 || step === 7 ? 72 : 54)
    }

    const fibSlots = [0, 1, 2, 4]
    fibSlots.forEach((slot, index) => {
      add(fibPerc, start + slot * .25, .07, index % 2 ? 38 : 42, 48 + index * 5)
    })

    for (let step = 0; step < 8; step += 1) {
      if (step % 3 !== bar % 3) continue
      add(moduloBass, start + step * .5, .19, root + 7, 64)
    }

    if (bar % 2 === 0) {
      FIB.slice(0, 4).forEach((value, index) => {
        const degree = (value + bar) % D_MINOR.length
        add(fibHook, start + index * .75, .28, D_MINOR[degree] + 5, index === 0 ? 54 : 42)
      })
    }

    for (let step = 0; step < 16; step += 1) {
      if (!PRIME_STEPS.has(step)) continue
      add(primeDrive, start + step * .25, .055, step % 2 ? 36 : 38, 48)
    }
  })

  return [
    track('L1_BINARY_BASS', 'triangle', .165, bass),
    track('L1_EUCLID_DRUM', 'noise', .13, drums),
    track('L1_OPERATOR_PULSE', 'square', .052, operators),
    track('L2_PRIME_HATS', 'noise', .095, primeHats),
    track('L3_FIB_RHYTHM', 'noise', .088, fibPerc),
    track('L4_MODULO_BASS', 'triangle', .092, moduloBass),
    track('L5_FIB_HOOK', 'square', .038, fibHook),
    track('L6_PRIME_DRIVE', 'noise', .075, primeDrive),
  ]
}

function keepReactiveNote(trackId: string, mode: ArrangementMode, section: Section, beat: number, localBar: number) {
  if (trackId === 'L1_DRUM_CORE') return true

  if (trackId === 'L1_BASS_CORE') {
    if (mode === 'high' || mode === 'max') return isQuarter(beat)
    return true
  }

  if (trackId === 'L1_ARP_PULSE') {
    if (section === 'descent') return isQuarter(beat)
    if (mode === 'high' || mode === 'max') return isQuarter(beat)
    return true
  }

  if (trackId === 'L2_HATS_CLOCK') {
    if (section === 'intro' && localBar < 2) return false
    if (section === 'descent') return isOffbeatEighth(beat) && localBar % 2 === 0
    if (mode === 'high' || mode === 'max') return isOffbeatEighth(beat)
    return true
  }

  if (trackId === 'L3_GHOST_DRUMS') {
    return mode !== 'high' && mode !== 'max' && section !== 'intro' && section !== 'descent'
  }

  if (trackId === 'L4_BASS_SYNC') {
    return section === 'rise' || section === 'refrain' || section === 'rebuild' || section === 'finale'
  }

  if (trackId === 'L5_SPARSE_HOOK') {
    return section === 'refrain' || section === 'finale'
  }

  if (trackId === 'L6_DRIVE_DRUMS') {
    return (mode === 'high' || mode === 'max') && (section === 'refrain' || section === 'finale')
  }

  return true
}

function keepPrimeNote(trackId: string, mode: ArrangementMode, section: Section, beat: number, localBar: number) {
  if (trackId === 'L1_EUCLID_DRUM') return true

  if (trackId === 'L1_BINARY_BASS') {
    if (mode === 'high' || mode === 'max') return isQuarter(beat)
    return true
  }

  if (trackId === 'L1_OPERATOR_PULSE') {
    if (section === 'descent') return isQuarter(beat)
    if (mode === 'high' || mode === 'max') return isQuarter(beat)
    return true
  }

  if (trackId === 'L2_PRIME_HATS') {
    if (section === 'intro' && localBar < 2) return false
    if (section === 'descent') return false
    if (mode === 'high' || mode === 'max') {
      const step = Math.round((((beat % 4) + 4) % 4) * 4)
      return step === 2 || step === 7 || step === 13
    }
    return true
  }

  if (trackId === 'L3_FIB_RHYTHM') {
    return mode !== 'high' && mode !== 'max' && section !== 'intro' && section !== 'descent'
  }

  if (trackId === 'L4_MODULO_BASS') {
    return section === 'refrain' || section === 'rebuild' || section === 'finale'
  }

  if (trackId === 'L5_FIB_HOOK') {
    return section === 'refrain' || section === 'finale'
  }

  if (trackId === 'L6_PRIME_DRIVE') {
    return (mode === 'high' || mode === 'max') && (section === 'refrain' || section === 'finale')
  }

  return true
}

function longForm(source: Track[], family: Family, mode: ArrangementMode): Track[] {
  return source.map((sourceTrack) => {
    const notes: Note[] = []

    for (let cycle = 0; cycle < CYCLES; cycle += 1) {
      const section = sectionForCycle(cycle)
      const offset = cycle * CYCLE_BARS * 4

      sourceTrack.notes.forEach(([beat, duration, midi, velocity]) => {
        const localBar = Math.floor(beat / 4)
        const keep = family === 'reactive'
          ? keepReactiveNote(sourceTrack.id, mode, section, beat, localBar)
          : keepPrimeNote(sourceTrack.id, mode, section, beat, localBar)
        if (!keep) return

        const factor = sectionVelocity(section, sourceTrack.id)
        notes.push([beat + offset, duration, midi, clampVelocity(velocity * factor)])
      })
    }

    return track(sourceTrack.id, sourceTrack.wave, sourceTrack.gain, notes)
  })
}

function reactiveArrangement(mode: ArrangementMode) {
  return longForm(reactiveSource(), 'reactive', mode)
}

function primeArrangement(mode: ArrangementMode) {
  return longForm(primeSource(), 'prime', mode)
}

const reactive1 = ['L1_BASS_CORE', 'L1_ARP_PULSE', 'L1_DRUM_CORE']
const reactive2 = [...reactive1, 'L2_HATS_CLOCK']
const reactive3 = [...reactive2, 'L3_GHOST_DRUMS']
const reactive4 = ['L1_BASS_CORE', 'L1_ARP_PULSE', 'L1_DRUM_CORE', 'L2_HATS_CLOCK', 'L4_BASS_SYNC']
const reactive5 = ['L1_BASS_CORE', 'L1_DRUM_CORE', 'L2_HATS_CLOCK', 'L5_SPARSE_HOOK']
const reactive6 = [...reactive5, 'L6_DRIVE_DRUMS']

const prime1 = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L1_OPERATOR_PULSE']
const prime2 = [...prime1, 'L2_PRIME_HATS']
const prime3 = [...prime2, 'L3_FIB_RHYTHM']
const prime4 = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L2_PRIME_HATS', 'L4_MODULO_BASS']
const prime5 = ['L1_BINARY_BASS', 'L1_EUCLID_DRUM', 'L4_MODULO_BASS', 'L5_FIB_HOOK']
const prime6 = [...prime5, 'L6_PRIME_DRIVE']
const primeMax = [...prime6, 'L2_PRIME_HATS']

export const musicCatalog = {
  version: 4,
  rule: 'Never delete a music proposal. Change its status to selected or archived.',
  compositions: [
    {
      id: 'MF-MUS-0001',
      gameId: 'tetramindfck',
      gameTitle: 'Tetra MindFuck',
      name: 'Reactive Arithmetic v1',
      status: 'selected',
      createdAt: '2026-09-03',
      summary: 'Le groove original restauré sur une forme longue : basse et batterie restent le rail, tandis que les ornements se retirent ou se simplifient quand le tempo monte.',
      concept: ['8-bit handheld', 'game-synced tempo', 'unbroken foot pulse', 'tempo-safe orchestration', 'D minor'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0001_LoopA.mid', 'MF-MUS-0001_LoopB_Panic.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'LOW', activeTracks: reactive1 },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'LOW', activeTracks: reactive2 },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'MID', activeTracks: reactive3 },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'MID', activeTracks: reactive4 },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'HIGH', activeTracks: reactive5 },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'HIGH', activeTracks: reactive6 },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'MAX', activeTracks: reactive6 },
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
      summary: 'La construction mathématique revient autour d’un battement quatre-temps explicite : les motifs premiers/Fibonacci restent des accents, jamais un remplacement du groove.',
      concept: ['powers of 2', 'prime-number accents', 'Fibonacci accents', 'unbroken foot pulse', 'game-synced tempo'],
      key: 'D minor',
      meter: '4/4',
      loopBeats: LOOP_BEATS,
      midiExports: ['MF-MUS-0002_PrimeCascade_A.mid', 'MF-MUS-0002_PrimeCascade_MAX.mid'],
      stages: [
        { label: '1', bpm: GAME_SYNC_BPMS[0], variant: 'LOW', activeTracks: prime1 },
        { label: '2', bpm: GAME_SYNC_BPMS[1], variant: 'LOW', activeTracks: prime2 },
        { label: '3', bpm: GAME_SYNC_BPMS[2], variant: 'MID', activeTracks: prime3 },
        { label: '4', bpm: GAME_SYNC_BPMS[3], variant: 'MID', activeTracks: prime4 },
        { label: '5', bpm: GAME_SYNC_BPMS[4], variant: 'HIGH', activeTracks: prime5 },
        { label: '6', bpm: GAME_SYNC_BPMS[5], variant: 'HIGH', activeTracks: prime6 },
        { label: 'MAX', bpm: GAME_SYNC_BPMS[6], variant: 'MAX', activeTracks: primeMax },
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
