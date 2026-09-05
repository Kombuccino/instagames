type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Section = 'intro' | 'rise' | 'refrain' | 'descent' | 'rebuild' | 'finale'

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
const ROOTS = [50, 46, 41, 48, 50, 46, 43, 45]

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

function sectionForBar(bar: number): Section {
  const cycle = Math.floor(bar / CYCLE_BARS)
  if (cycle === 0) return 'intro'
  if (cycle === 1) return 'rise'
  if (cycle === 2) return 'refrain'
  if (cycle === 3) return 'descent'
  if (cycle === 4) return 'rebuild'
  return 'finale'
}

export const primeCascadeDrumRailTrackIds = [
  'MAX4_KICK_RAIL',
  'MAX4_SNARE_BACKBEAT',
  'MAX4_BASS_RAIL',
  'MAX4_OFFBEAT_HATS',
  'MAX4_DRIVE_HATS',
  'MAX4_TOM_FILLS',
  'MAX4_PRIME_ACCENTS',
] as const

export function primeCascadeDrumRail(): Track[] {
  const kick: Note[] = []
  const snare: Note[] = []
  const bass: Note[] = []
  const hats: Note[] = []
  const driveHats: Note[] = []
  const tomFills: Note[] = []
  const primeAccents: Note[] = []

  for (let bar = 0; bar < BARS; bar += 1) {
    const start = bar * 4
    const localBar = bar % CYCLE_BARS
    const root = ROOTS[localBar]
    const section = sectionForBar(bar)
    const refrain = section === 'refrain'
    const finale = section === 'finale'
    const descent = section === 'descent'

    // The kick remains the main clock. Every quarter is audible and beat 1 owns the bar.
    const kickVelocities = finale
      ? [126, 112, 120, 112]
      : refrain
        ? [124, 108, 118, 108]
        : descent
          ? [114, 100, 108, 100]
          : [120, 104, 112, 104]
    kickVelocities.forEach((velocity, beat) => add(kick, start + beat, .22, 36, velocity))

    // High-pressure sections add one controlled double-kick, without replacing the quarter pulse.
    if ((refrain || finale) && bar % 2 === 1) add(kick, start + 3.5, .14, 36, finale ? 84 : 72)

    // Backbeat stays broad and lower than the kick. Small ghosts only announce phrase endings.
    ;[1, 3].forEach((beat) => add(snare, start + beat, .18, 38, finale ? 88 : refrain ? 82 : descent ? 68 : 76))
    if ((section === 'rise' || section === 'rebuild' || finale) && localBar === 7) {
      add(snare, start + 3.5, .1, 38, 54)
      add(snare, start + 3.75, .08, 38, 62)
    }

    // Bass is deliberately quieter and shorter than before: it supports the drums, never carries them.
    const bassPattern = descent ? [root, root, root, root] : [root, root, root + 7, root]
    bassPattern.forEach((midi, beat) => {
      const velocity = beat === 0 ? 70 : beat === 2 ? 62 : 54
      add(bass, start + beat, .56, midi, velocity)
    })

    // Constant offbeat hats make 170 BPM perceptible even when melodic content is absent.
    if (!(section === 'intro' && localBar < 2)) {
      ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => {
        add(hats, start + offset, .075, 42, index === 0 ? 42 : 36)
      })
    }

    // Sixteenth-note propulsion must be clearly audible: together with the offbeat hats it creates
    // the fast 1/16 grid that makes MAX feel materially quicker than lower stages.
    let driveOffsets: number[] = []
    if (section === 'rise') driveOffsets = [2.25, 2.75, 3.25, 3.75]
    else if (refrain || finale) driveOffsets = [.25, .75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75]
    else if (section === 'rebuild') {
      const count = Math.min(8, (localBar + 1) * 2)
      driveOffsets = [.25, .75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75].slice(8 - count)
    } else if (descent && localBar >= 6) driveOffsets = [2.75, 3.25, 3.75]
    driveOffsets.forEach((offset, index) => add(driveHats, start + offset, .06, 44, index % 2 === 0 ? 54 : 46))

    // Drum fills replace the rejected melodic refrain. They mark four- and eight-bar boundaries.
    const fillEveryTwoBars = finale && localBar % 2 === 1
    const fillEveryFourBars = (refrain || section === 'rise' || section === 'rebuild') && localBar % 4 === 3
    if (fillEveryTwoBars || fillEveryFourBars || localBar === 7) {
      add(tomFills, start + 3, .16, 47, finale ? 70 : 60)
      add(tomFills, start + 3.5, .14, 45, finale ? 78 : 68)
      add(tomFills, start + 3.75, .13, 43, finale ? 88 : 76)
    }

    // Mathematics stays in one occasional open-hat accent, never in the rhythmic spine.
    if ((section === 'rise' || section === 'rebuild' || finale) && bar % 2 === 1) {
      const prime = [2, 3, 5, 7, 11, 13][bar % 6]
      const offsets = [.5, 1.5, 2.5, 3.5]
      add(primeAccents, start + offsets[(bar + prime) % offsets.length], .13, 46, finale ? 38 : 30)
    }
  }

  return [
    track('MAX4_KICK_RAIL', 'noise', .255, kick),
    track('MAX4_SNARE_BACKBEAT', 'noise', .135, snare),
    track('MAX4_BASS_RAIL', 'triangle', .085, bass),
    track('MAX4_OFFBEAT_HATS', 'noise', .06, hats),
    track('MAX4_DRIVE_HATS', 'noise', .075, driveHats),
    track('MAX4_TOM_FILLS', 'noise', .15, tomFills),
    track('MAX4_PRIME_ACCENTS', 'noise', .045, primeAccents),
  ]
}
