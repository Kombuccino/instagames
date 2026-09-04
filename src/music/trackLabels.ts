const TRACK_LABELS: Record<string, string> = {
  L1_BASS_CORE: 'Basse principale',
  L1_ARP_PULSE: 'Arpège pulsé',
  L1_DRUM_CORE: 'Batterie principale',
  L2_HATS_CLOCK: 'Charleston métronomique',
  L3_GHOST_DRUMS: 'Percussions fantômes',
  L4_BASS_SYNC: 'Syncope de basse',
  L5_SPARSE_HOOK: 'Hook mélodique discret',
  L6_DRIVE_DRUMS: 'Batterie de pression',
  L1_BINARY_BASS: 'Basse binaire',
  L1_EUCLID_DRUM: 'Batterie euclidienne',
  L1_OPERATOR_PULSE: 'Impulsions ×2 / ÷2',
  L2_PRIME_HATS: 'Charleston nombres premiers',
  L3_FIB_RHYTHM: 'Percussions Fibonacci',
  L4_MODULO_BASS: 'Basse modulo 3',
  L5_FIB_HOOK: 'Hook Fibonacci',
  L6_PRIME_DRIVE: 'Pression nombres premiers',
}

export function musicTrackLabel(id: string, fallback = id) {
  return TRACK_LABELS[id] ?? fallback
    .replace(/^L\d+_/, '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase())
}
