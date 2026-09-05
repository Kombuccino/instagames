const TRACK_LABELS: Record<string, string> = {
  L1_BASS_CORE: 'Basse principale',
  L1_ARP_PULSE: 'Arpège pulsé',
  L1_DRUM_CORE: 'Batterie principale',
  L2_HATS_CLOCK: 'Charleston métronomique',
  L3_GHOST_DRUMS: 'Percussions fantômes',
  L4_BASS_SYNC: 'Syncope de basse',
  L5_SPARSE_HOOK: 'Refrain / hook mélodique',
  L6_DRIVE_DRUMS: 'Batterie de pression',
  L1_BINARY_BASS: 'Basse binaire',
  L1_EUCLID_DRUM: 'Batterie euclidienne',
  L1_OPERATOR_PULSE: 'Impulsions ×2 / ÷2',
  L2_PRIME_HATS: 'Charleston nombres premiers',
  L3_FIB_RHYTHM: 'Percussions Fibonacci',
  L4_MODULO_BASS: 'Basse modulo 3',
  L5_FIB_HOOK: 'Refrain Fibonacci',
  L6_PRIME_DRIVE: 'Pression nombres premiers',
  MAX3_KICK_RAIL: 'Kick quatre-temps',
  MAX3_SNARE_BACKBEAT: 'Caisse claire 2 et 4',
  MAX3_BASS_RAIL: 'Basse motrice',
  MAX3_OFFBEAT_HATS: 'Charleston de propulsion',
  MAX3_REFRAIN_HOOK: 'Refrain deux mesures',
  MAX3_PRIME_ACCENTS: 'Accents premiers discrets',
  MAX4_KICK_RAIL: 'Grosse caisse quatre-temps',
  MAX4_SNARE_BACKBEAT: 'Caisse claire avec corps',
  MAX4_BASS_RAIL: 'Basse de soutien',
  MAX4_OFFBEAT_HATS: 'Charleston en contretemps',
  MAX4_DRIVE_HATS: 'Charleston rapide 1/16',
  MAX4_TOM_FILLS: 'Fills de toms',
  MAX4_PRIME_ACCENTS: 'Accents ouverts discrets',
  DINO_KICK_LAVA: 'Grosse caisse lave',
  DINO_SNARE_CRACK: 'Caisse claire impact',
  DINO_SUB_BASS: 'Sub-basse magma',
  DINO_DIRT_BASS: 'Basse sale en contretemps',
  DINO_DRIVE_HATS: 'Charleston urgence',
  DINO_TOM_STAMPEDE: 'Toms stampede',
  DINO_EXPLOSION_HITS: 'Explosions',
  DINO_ALARM_STABS: 'Alarme deux notes',
  BTEA_SOFT_KICK: 'Kick doux',
  BTEA_BRUSH_SNARE: 'Snare brossée',
  BTEA_WARM_BASS: 'Basse ronde',
  BTEA_TEA_CHORDS: 'Accords salon de thé',
  BTEA_PEARL_PLUCK: 'Perles rebondissantes',
  BTEA_SHAKER: 'Shaker pétillant',
  BTEA_BUBBLE_POP: 'Bulles pop',
}

export function musicTrackLabel(id: string, fallback = id) {
  return TRACK_LABELS[id] ?? fallback
    .replace(/^L\d+_/, '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase())
}
