type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'

type Track = {
  id: string
  name: string
  wave: Wave
  gain: number
  notes: Note[]
}

export const LINEFUGG_VECTOR_BPM = 152
export const LINEFUGG_BOUNCE_BPM = 136
export const LINEFUGG_SHORT_BARS = 8
export const LINEFUGG_SHORT_LOOP_BEATS = LINEFUGG_SHORT_BARS * 4
export const LINEFUGG_VECTOR_BARS = 48
export const LINEFUGG_VECTOR_LOOP_BEATS = LINEFUGG_VECTOR_BARS * 4

function track(id: string, wave: Wave, gain: number, notes: Note[]): Track {
  return { id, name: id.replaceAll('_', ' '), wave, gain, notes }
}

function add(notes: Note[], start: number, duration: number, midi: number, velocity: number) {
  notes.push([start, duration, midi, velocity])
}

export const lineFuggVectorTrackIds = [
  'LF8_KICK_GRID',
  'LF8_SNARE_SNAP',
  'LF8_HATS_CURSOR',
  'LF8_BASS_VECTOR',
  'LF8_LINE_SWEEP',
] as const

const VECTOR_ROOTS = [40, 40, 38, 36, 40, 43, 38, 35] as const // E E D C E G D B
const VECTOR_SWEEP_RISE = [64, 67, 71, 76] as const
const VECTOR_SWEEP_LEAP = [64, 71, 74, 76] as const
const VECTOR_SWEEP_FALL = [76, 74, 71, 67] as const

function addVectorKick(kick: Note[], start: number, section: number, localBar: number) {
  const phraseEnd = localBar === 3 || localBar === 7

  // Section 0 is the approved original groove. Later sections only reshape the
  // same kick identity: short lift-offs, returns and a denser final drive.
  if (section === 2 && localBar < 2) {
    add(kick, start, .13, 36, 110)
    return
  }

  if (section === 2 && localBar === 2) {
    ;[0, 2].forEach((beat, index) => add(kick, start + beat, .13, 36, index === 0 ? 112 : 94))
    return
  }

  if (section === 2 && (localBar === 3 || localBar === 7)) {
    ;[0, 1.5, 2, 3.5].forEach((beat, index) => add(kick, start + beat, index % 2 ? .1 : .13, 36, [114, 72, 101, 82][index]))
    return
  }

  if (section === 3 && (localBar === 2 || localBar === 6)) {
    // A single missing back-half kick leaves room for the bass/sweep exchange.
    add(kick, start, .13, 36, 112)
    return
  }

  ;[0, 2].forEach((beat, index) => {
    const finalBoost = section === 5 ? 4 : 0
    add(kick, start + beat, .13, 36, (index === 0 ? 112 : 98) + finalBoost)
  })

  if (phraseEnd || (section === 5 && localBar % 2 === 1)) {
    add(kick, start + 3.5, .1, 36, section === 5 ? 84 : 78)
  }
}

function addVectorSnare(snare: Note[], start: number, section: number, localBar: number) {
  const phraseEnd = localBar === 3 || localBar === 7

  // The clap/snare gets its own lift in section 4 while kick + hats keep the
  // player locked to the grid. Its return is deliberately more physical.
  if (section === 4 && localBar < 2) {
    add(snare, start + 3, .11, 38, 82)
    return
  }

  const base = section === 4 && localBar >= 4 ? 90 : section === 5 ? 88 : 84
  ;[1, 3].forEach((beat, index) => add(snare, start + beat, .11, 38, base + (phraseEnd && index === 1 ? 8 : 0)))

  if ((section === 1 || section === 4 || section === 5) && phraseEnd) {
    add(snare, start + 3.75, .07, 38, section === 5 ? 62 : 54)
  }
}

function addVectorHats(hats: Note[], start: number, section: number, localBar: number) {
  for (let step = 0; step < 16; step += 1) {
    const eighthAccent = step % 4 === 2
    const quarterAccent = step % 4 === 0
    let velocity = eighthAccent ? 53 : quarterAccent ? 39 : 27

    if (section === 1) velocity += step % 8 === 6 ? 5 : 1
    if (section === 2 && localBar < 2) velocity -= quarterAccent ? 3 : 1
    if (section === 3 && step % 8 === 2) velocity += 4
    if (section === 4 && localBar >= 4) velocity += 3
    if (section === 5) velocity += step % 4 === 2 ? 6 : 3

    add(hats, start + step * .25, .045, 42, velocity)
  }
}

function addVectorBass(bass: Note[], start: number, root: number, section: number, localBar: number) {
  let offsets: readonly number[] = [0, .75, 1.5, 2, 2.75, 3.5]
  let notes: readonly number[] = [root, root + 7, root + 12, root, root + 7, root + 12]
  let durations: readonly number[] = [.42, .25, .25, .42, .25, .25]

  if (section === 1) {
    offsets = [0, .5, 1.5, 2.25, 3, 3.5]
    notes = [root, root + 7, root + 12, root + 7, root, root + 12]
    durations = [.4, .22, .3, .25, .32, .22]
  } else if (section === 2) {
    offsets = [0, .75, 1.25, 2, 2.75, 3.25]
    notes = [root, root + 12, root + 7, root, root + 12, root + 7]
    durations = [.44, .22, .22, .38, .24, .42]
  } else if (section === 3) {
    const alternate = localBar % 2 === 1
    offsets = alternate ? [0, .5, 1.25, 2, 2.5, 3.25] : [0, .75, 1.5, 2.25, 3, 3.5]
    notes = alternate
      ? [root, root + 12, root + 7, root, root + 7, root + 12]
      : [root, root + 7, root + 12, root + 7, root, root + 12]
    durations = alternate ? [.34, .22, .28, .34, .24, .4] : [.4, .24, .28, .24, .3, .24]
  } else if (section === 5) {
    offsets = [0, .5, 1.25, 2, 2.5, 3, 3.5]
    notes = [root, root + 7, root + 12, root, root + 12, root + 7, root + 12]
    durations = [.38, .2, .24, .36, .2, .2, .22]
  }

  offsets.forEach((offset, index) => {
    const first = index === 0
    const middleAnchor = Math.abs(offset - 2) < .01
    const sectionAccent = section === 3 && localBar % 2 === 1 && index === offsets.length - 1 ? 4 : 0
    add(bass, start + offset, durations[index], notes[index], (first ? 88 : middleAnchor ? 78 : 64) + sectionAccent)
  })
}

function addVectorSweep(sweep: Note[], start: number, section: number, localBar: number) {
  let phrase: readonly number[] | null = null
  let offset = 2.75

  if (section === 0 && localBar % 2 === 1) phrase = VECTOR_SWEEP_RISE
  else if (section === 1 && localBar % 2 === 1) phrase = localBar % 4 === 1 ? VECTOR_SWEEP_LEAP : VECTOR_SWEEP_RISE
  else if (section === 2 && (localBar === 1 || localBar === 5 || localBar === 7)) phrase = localBar === 5 ? VECTOR_SWEEP_FALL : VECTOR_SWEEP_RISE
  else if (section === 3) {
    phrase = localBar % 2 === 0 ? VECTOR_SWEEP_RISE : VECTOR_SWEEP_FALL
    offset = localBar % 2 === 0 ? 2.5 : 2.75
  } else if (section === 4 && localBar % 2 === 1) phrase = VECTOR_SWEEP_LEAP
  else if (section === 5 && localBar % 2 === 1) phrase = localBar === 7 ? VECTOR_SWEEP_LEAP : VECTOR_SWEEP_RISE

  if (!phrase) return
  phrase.forEach((midi, index) => {
    const velocity = 31 + index * 3 + (section === 5 ? 3 : 0)
    add(sweep, start + offset + index * .25, .13, midi, velocity)
  })
}

export function lineFuggVectorRush(): Track[] {
  const kick: Note[] = []
  const snare: Note[] = []
  const hats: Note[] = []
  const bass: Note[] = []
  const sweep: Note[] = []

  for (let bar = 0; bar < LINEFUGG_VECTOR_BARS; bar += 1) {
    const start = bar * 4
    const section = Math.floor(bar / 8)
    const localBar = bar % 8
    const root = VECTOR_ROOTS[localBar]

    addVectorKick(kick, start, section, localBar)
    addVectorSnare(snare, start, section, localBar)
    addVectorHats(hats, start, section, localBar)
    addVectorBass(bass, start, root, section, localBar)
    addVectorSweep(sweep, start, section, localBar)
  }

  return [
    track('LF8_KICK_GRID', 'noise', .13, kick),
    track('LF8_SNARE_SNAP', 'noise', .088, snare),
    track('LF8_HATS_CURSOR', 'noise', .062, hats),
    track('LF8_BASS_VECTOR', 'triangle', .102, bass),
    track('LF8_LINE_SWEEP', 'sawtooth', .018, sweep),
  ]
}

export const lineFuggBounceTrackIds = [
  'LF9_KICK_BOUNCE',
  'LF9_RIM_CLAP',
  'LF9_SHAKER_TICK',
  'LF9_WARM_BASS',
] as const

const BOUNCE_ROOTS = [45, 41, 48, 43, 45, 41, 38, 40] as const // Am F C G / Am F Dm E
const BOUNCE_THIRDS = [3, 4, 4, 4, 3, 4, 3, 4] as const

export function lineFuggQuickSumBounce(): Track[] {
  const kick: Note[] = []
  const rim: Note[] = []
  const shaker: Note[] = []
  const bass: Note[] = []

  for (let bar = 0; bar < LINEFUGG_SHORT_BARS; bar += 1) {
    const start = bar * 4
    const root = BOUNCE_ROOTS[bar]
    const phraseEnd = bar === 3 || bar === 7

    // The round kick/rim identity is the foreground. The offbeat skeleton stays
    // regular enough that the player never loses the bar.
    ;[0, 2.5].forEach((beat, index) => add(kick, start + beat, .16, 36, index === 0 ? 98 : 76))
    if (phraseEnd) add(kick, start + 3.5, .11, 36, 68)
    ;[1, 3].forEach((beat, index) => add(rim, start + beat, .09, 38, index === 0 ? 76 : 84))
    ;[.5, 1.5, 2.5, 3.5].forEach((offset, index) => {
      add(shaker, start + offset, .055, 42, index === 2 ? 47 : 36)
    })

    // The bass now carries all pitched movement. Chord tones and a sustained
    // final note keep the loop full without reintroducing a foreground melody.
    const bassOffsets = [0, .75, 1.5, 2.25, 3] as const
    const bassDurations = [.55, .35, .4, .35, .86] as const
    const bassNotes = [root, root + 7, root + 12, root + 7, root + BOUNCE_THIRDS[bar] + 12] as const
    bassOffsets.forEach((offset, index) => {
      const phraseAccent = phraseEnd && index === 4 ? 4 : 0
      add(bass, start + offset, bassDurations[index], bassNotes[index], (index === 0 ? 82 : index === 4 ? 68 : 60) + phraseAccent)
    })
  }

  return [
    track('LF9_KICK_BOUNCE', 'noise', .105, kick),
    track('LF9_RIM_CLAP', 'noise', .082, rim),
    track('LF9_SHAKER_TICK', 'noise', .054, shaker),
    track('LF9_WARM_BASS', 'triangle', .1, bass),
  ]
}
