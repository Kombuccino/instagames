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
  'LF8_THREE_LINE_PULSE',
  'LF8_LINE_SWEEP',
] as const

export function lineFuggVectorRush(): Track[] {
  const kick: Note[] = []
  const snare: Note[] = []
  const hats: Note[] = []
  const bass: Note[] = []
  const pulse: Note[] = []
  const sweep: Note[] = []
  const roots = [40, 40, 38, 36, 40, 43, 38, 35] as const // E E D C E G D B

  for (let bar = 0; bar < LINEFUGG_SHORT_BARS; bar += 1) {
    const start = bar * 4
    const root = roots[bar]
    const lastPair = bar === 3 || bar === 7

    // Tight, explicit grid. The extra late kick only appears at the end of each
    // four-bar phrase so the loop feels urgent without becoming double-kick soup.
    ;[0, 2].forEach((beat, index) => add(kick, start + beat, .13, 36, index === 0 ? 112 : 98))
    if (lastPair) add(kick, start + 3.5, .1, 36, 78)
    ;[1, 3].forEach((beat) => add(snare, start + beat, .11, 38, lastPair ? 92 : 84))

    // Cursor-like 1/16 texture, with a clearly accented eighth-note skeleton.
    for (let step = 0; step < 16; step += 1) {
      const velocity = step % 4 === 2 ? 53 : step % 2 === 0 ? 39 : 27
      add(hats, start + step * .25, .045, 42, velocity + (bar >= 4 ? 3 : 0))
    }

    const bassOffsets = [0, .75, 1.5, 2, 2.75, 3.5] as const
    const bassNotes = [root, root + 7, root + 12, root, root + 7, root + 12] as const
    bassOffsets.forEach((offset, index) => {
      add(bass, start + offset, index === 0 || index === 3 ? .42 : .25, bassNotes[index], index === 0 ? 88 : index === 3 ? 78 : 64)
    })

    // Three attacks are the identity: one for each line available to the player.
    const triad = bar % 2 === 0 ? [64, 67, 71] : [62, 66, 69]
    ;[.5, 1.75, 3].forEach((offset, index) => {
      add(pulse, start + offset, .18, triad[index], index === 0 ? 58 : 48)
    })

    // A short rising line every two bars evokes the finger drawing across cells.
    if (bar % 2 === 1) {
      const line = [64, 67, 71, 76]
      line.forEach((midi, index) => add(sweep, start + 2.75 + index * .25, .13, midi, 31 + index * 3))
    }
  }

  return [
    track('LF8_KICK_GRID', 'noise', .13, kick),
    track('LF8_SNARE_SNAP', 'noise', .088, snare),
    track('LF8_HATS_CURSOR', 'noise', .062, hats),
    track('LF8_BASS_VECTOR', 'triangle', .102, bass),
    track('LF8_THREE_LINE_PULSE', 'square', .035, pulse),
    track('LF8_LINE_SWEEP', 'sawtooth', .018, sweep),
  ]
}

export const lineFuggBounceTrackIds = [
  'LF9_KICK_BOUNCE',
  'LF9_RIM_CLAP',
  'LF9_SHAKER_TICK',
  'LF9_WARM_BASS',
  'LF9_CALC_PLUCK',
  'LF9_THREE_COLOR_HOOK',
] as const

export function lineFuggQuickSumBounce(): Track[] {
  const kick: Note[] = []
  const rim: Note[] = []
  const shaker: Note[] = []
  const bass: Note[] = []
  const pluck: Note[] = []
  const hook: Note[] = []
  const roots = [45, 45, 48, 43, 45, 41, 43, 44] as const // A A C G A F G G# approach

  for (let bar = 0; bar < LINEFUGG_SHORT_BARS; bar += 1) {
    const start = bar * 4
    const root = roots[bar]
    const answerBar = bar % 4 === 3

    // Looser than Vector Rush: a round kick and a syncopated pickup create bounce.
    ;[0, 2.5].forEach((beat, index) => add(kick, start + beat, .16, 36, index === 0 ? 96 : 76))
    if (answerBar) add(kick, start + 3.5, .11, 36, 66)
    ;[1, 3].forEach((beat, index) => add(rim, start + beat, .09, 38, index === 0 ? 76 : 84))

    // A light uneven tick rather than a straight machine-gun hat pattern.
    ;[.5, 1.25, 2, 2.75, 3.5].forEach((offset, index) => {
      add(shaker, start + offset, .055, 42, index === 2 ? 48 : 34 + (index % 2) * 5)
    })

    const bassOffsets = [0, .75, 1.75, 2.5, 3.25] as const
    const bassNotes = [root, root + 7, root + 12, root + 7, root + 2] as const
    bassOffsets.forEach((offset, index) => {
      add(bass, start + offset, index === 0 ? .58 : .32, bassNotes[index], index === 0 ? 80 : 58 + (index === 2 ? 8 : 0))
    })

    // Tiny calculation exchange: question, answer, confirmation.
    const question = bar % 2 === 0 ? [69, 72, 76] : [67, 71, 74]
    ;[.25, 1.5, 2.25].forEach((offset, index) => {
      add(pluck, start + offset, index === 2 ? .28 : .16, question[index], index === 2 ? 50 : 42)
    })

    // Orange / violet / yellow translated into a friendly three-note signature.
    if (bar === 1 || bar === 3 || bar === 5 || bar === 7) {
      const phrase = bar < 4 ? [76, 79, 81] : [79, 81, 84]
      ;[.5, 1.25, 2.25].forEach((offset, index) => {
        add(hook, start + offset, index === 2 ? .42 : .24, phrase[index], answerBar ? 50 : 43)
      })
    }
  }

  return [
    track('LF9_KICK_BOUNCE', 'noise', .105, kick),
    track('LF9_RIM_CLAP', 'noise', .082, rim),
    track('LF9_SHAKER_TICK', 'noise', .058, shaker),
    track('LF9_WARM_BASS', 'triangle', .095, bass),
    track('LF9_CALC_PLUCK', 'square', .03, pluck),
    track('LF9_THREE_COLOR_HOOK', 'triangle', .034, hook),
  ]
}
