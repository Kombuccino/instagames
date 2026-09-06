import { musicTrackLabel as coreMusicTrackLabel } from './trackLabelsCore'

const LINEFUGG_TRACK_LABELS: Record<string, string> = {
  LF8_KICK_GRID: 'Kick de la grille',
  LF8_SNARE_SNAP: 'Caisse claire vectorielle',
  LF8_HATS_CURSOR: 'Curseur rapide 1/16',
  LF8_BASS_VECTOR: 'Basse vectorielle',
  LF8_LINE_SWEEP: 'Trait ascendant',
  LF9_KICK_BOUNCE: 'Kick rebondissant',
  LF9_RIM_CLAP: 'Rim-clap de validation',
  LF9_SHAKER_TICK: 'Ticks de contretemps',
  LF9_WARM_BASS: 'Basse de calcul',
  LF9_CALC_PLUCK: 'Question chiffrée',
  LF9_THREE_COLOR_HOOK: 'Réponse trois couleurs',
}

export function musicTrackLabel(id: string, fallback = id) {
  return LINEFUGG_TRACK_LABELS[id] ?? coreMusicTrackLabel(id, fallback)
}
