export type SfxEvent =
  | 'move'
  | 'rotate'
  | 'softDrop'
  | 'land'
  | 'levelUp'
  | 'success'
  | 'fail'
  | 'calculate'
  | 'bonus'
  | 'bigImpact'

type ToneWave = 'square' | 'triangle' | 'sawtooth'

export type SfxStep =
  | {
      type: 'tone'
      at: number
      duration: number
      fromHz: number
      toHz?: number
      wave: ToneWave
      gain: number
    }
  | {
      type: 'noise'
      at: number
      duration: number
      filter: 'lowpass' | 'bandpass' | 'highpass'
      frequency: number
      gain: number
    }

export type SfxDefinition = {
  id: string
  key: string
  event: SfxEvent
  name: string
  scope: 'common' | 'game'
  gameId?: string
  gameTitle?: string
  status: 'selected' | 'archived'
  createdAt: string
  summary: string
  cooldownMs: number
  steps: readonly SfxStep[]
}

export type SfxTransform = {
  transposeSemitones?: number
  gain?: number
  duration?: number
}

export type GameSfxPalette = {
  gameId: string
  gameTitle: string
  accent: SfxTransform
  events: Partial<Record<SfxEvent, string>>
}

const commonSounds: SfxDefinition[] = [
  {
    id: 'MF-SFX-0001',
    key: 'common.move',
    event: 'move',
    name: 'Micro Move',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Micro clic de déplacement. Très court, neutre et réutilisable.',
    cooldownMs: 55,
    steps: [
      { type: 'tone', at: 0, duration: .038, fromHz: 620, toHz: 520, wave: 'square', gain: .48 },
    ],
  },
  {
    id: 'MF-SFX-0002',
    key: 'common.rotate',
    event: 'rotate',
    name: 'Rotate Tick',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Petit double clic montant pour une rotation ou un changement d’orientation.',
    cooldownMs: 65,
    steps: [
      { type: 'tone', at: 0, duration: .035, fromHz: 480, toHz: 560, wave: 'square', gain: .42 },
      { type: 'tone', at: .034, duration: .042, fromHz: 610, toHz: 690, wave: 'triangle', gain: .34 },
    ],
  },
  {
    id: 'MF-SFX-0003',
    key: 'common.softDrop',
    event: 'softDrop',
    name: 'Soft Drop',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Petit mouvement descendant, plus grave qu’un déplacement horizontal.',
    cooldownMs: 75,
    steps: [
      { type: 'tone', at: 0, duration: .055, fromHz: 360, toHz: 235, wave: 'triangle', gain: .48 },
    ],
  },
  {
    id: 'MF-SFX-0004',
    key: 'common.land',
    event: 'land',
    name: 'Soft Land',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Impact mat et compact quand un objet prend sa place.',
    cooldownMs: 90,
    steps: [
      { type: 'tone', at: 0, duration: .075, fromHz: 145, toHz: 82, wave: 'triangle', gain: .62 },
      { type: 'noise', at: 0, duration: .042, filter: 'lowpass', frequency: 520, gain: .34 },
    ],
  },
  {
    id: 'MF-SFX-0005',
    key: 'common.levelUp',
    event: 'levelUp',
    name: 'Level Up',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Signature commune MiniFugg pour un passage de niveau : positive mais courte.',
    cooldownMs: 350,
    steps: [
      { type: 'tone', at: 0, duration: .07, fromHz: 440, toHz: 470, wave: 'triangle', gain: .42 },
      { type: 'tone', at: .052, duration: .075, fromHz: 554, toHz: 590, wave: 'triangle', gain: .4 },
      { type: 'tone', at: .108, duration: .095, fromHz: 659, toHz: 700, wave: 'square', gain: .34 },
    ],
  },
  {
    id: 'MF-SFX-0006',
    key: 'common.success',
    event: 'success',
    name: 'Mini Success',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Confirmation positive générique pour combo, validation ou petit objectif.',
    cooldownMs: 220,
    steps: [
      { type: 'tone', at: 0, duration: .07, fromHz: 590, toHz: 660, wave: 'triangle', gain: .36 },
      { type: 'tone', at: .045, duration: .1, fromHz: 790, toHz: 850, wave: 'triangle', gain: .28 },
    ],
  },
  {
    id: 'MF-SFX-0007',
    key: 'common.fail',
    event: 'fail',
    name: 'Soft Fail',
    scope: 'common',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Fin ou erreur discrète, descendante, sans gros buzzer agressif.',
    cooldownMs: 500,
    steps: [
      { type: 'tone', at: 0, duration: .22, fromHz: 260, toHz: 118, wave: 'triangle', gain: .5 },
      { type: 'noise', at: .02, duration: .08, filter: 'lowpass', frequency: 680, gain: .18 },
    ],
  },
]

const tetraSounds: SfxDefinition[] = [
  {
    id: 'MF-SFX-0008',
    key: 'tetra.calculate',
    event: 'calculate',
    name: 'Arithmetic Scan',
    scope: 'game',
    gameId: 'tetramindfck',
    gameTitle: 'Tetra MindFuck',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Petit scan calculatoire en impulsions régulières, puis validation grave.',
    cooldownMs: 240,
    steps: [
      { type: 'tone', at: 0, duration: .026, fromHz: 420, wave: 'square', gain: .24 },
      { type: 'tone', at: .026, duration: .026, fromHz: 510, wave: 'square', gain: .24 },
      { type: 'tone', at: .052, duration: .026, fromHz: 600, wave: 'square', gain: .24 },
      { type: 'tone', at: .078, duration: .026, fromHz: 690, wave: 'square', gain: .24 },
      { type: 'tone', at: .104, duration: .026, fromHz: 600, wave: 'square', gain: .2 },
      { type: 'tone', at: .13, duration: .026, fromHz: 510, wave: 'square', gain: .2 },
      { type: 'tone', at: .16, duration: .085, fromHz: 330, toHz: 300, wave: 'triangle', gain: .38 },
    ],
  },
  {
    id: 'MF-SFX-0009',
    key: 'tetra.bonus',
    event: 'bonus',
    name: 'Times Two',
    scope: 'game',
    gameId: 'tetramindfck',
    gameTitle: 'Tetra MindFuck',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Deux fréquences exactement doublées pour signer un bonus arithmétique.',
    cooldownMs: 260,
    steps: [
      { type: 'tone', at: 0, duration: .07, fromHz: 360, toHz: 390, wave: 'triangle', gain: .34 },
      { type: 'tone', at: .065, duration: .1, fromHz: 720, toHz: 760, wave: 'triangle', gain: .32 },
    ],
  },
  {
    id: 'MF-SFX-0010',
    key: 'tetra.bigImpact',
    event: 'bigImpact',
    name: 'Big Number Thump',
    scope: 'game',
    gameId: 'tetramindfck',
    gameTitle: 'Tetra MindFuck',
    status: 'selected',
    createdAt: '2026-09-03',
    summary: 'Impact grave pour un calcul massif, volontairement plus physique que mélodique.',
    cooldownMs: 320,
    steps: [
      { type: 'tone', at: 0, duration: .11, fromHz: 118, toHz: 70, wave: 'triangle', gain: .72 },
      { type: 'noise', at: 0, duration: .07, filter: 'lowpass', frequency: 430, gain: .38 },
      { type: 'tone', at: .07, duration: .08, fromHz: 235, toHz: 190, wave: 'square', gain: .2 },
    ],
  },
]

const vladSounds: SfxDefinition[] = [
  {
    id: 'MF-SFX-0011', key: 'vlad.impale1', event: 'land', name: 'Vlad Prick', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Premier empalement : pointe sèche et jus bref.', cooldownMs: 55,
    steps: [
      { type: 'noise', at: 0, duration: .045, filter: 'highpass', frequency: 1700, gain: .42 },
      { type: 'tone', at: 0, duration: .07, fromHz: 180, toHz: 105, wave: 'triangle', gain: .55 },
    ],
  },
  {
    id: 'MF-SFX-0012', key: 'vlad.impale2', event: 'bonus', name: 'Vlad Double Squish', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Deuxième impact plus humide, avec rebond aigu.', cooldownMs: 55,
    steps: [
      { type: 'noise', at: 0, duration: .075, filter: 'bandpass', frequency: 940, gain: .62 },
      { type: 'tone', at: 0, duration: .09, fromHz: 170, toHz: 82, wave: 'triangle', gain: .68 },
      { type: 'tone', at: .05, duration: .07, fromHz: 410, toHz: 580, wave: 'square', gain: .24 },
    ],
  },
  {
    id: 'MF-SFX-0013', key: 'vlad.impale3', event: 'bigImpact', name: 'Vlad Triple Crunch', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Troisième impact avec craquement de grille et basse.', cooldownMs: 55,
    steps: [
      { type: 'noise', at: 0, duration: .11, filter: 'bandpass', frequency: 720, gain: .78 },
      { type: 'tone', at: 0, duration: .14, fromHz: 145, toHz: 58, wave: 'sawtooth', gain: .72 },
      { type: 'tone', at: .07, duration: .09, fromHz: 510, toHz: 690, wave: 'square', gain: .28 },
    ],
  },
  {
    id: 'MF-SFX-0014', key: 'vlad.impale4', event: 'bigImpact', name: 'Vlad Quad Slaughter', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Quatrième impact très dense en deux coups.', cooldownMs: 55,
    steps: [
      { type: 'noise', at: 0, duration: .14, filter: 'lowpass', frequency: 920, gain: .9 },
      { type: 'tone', at: 0, duration: .16, fromHz: 125, toHz: 48, wave: 'sawtooth', gain: .88 },
      { type: 'noise', at: .08, duration: .08, filter: 'highpass', frequency: 1900, gain: .45 },
      { type: 'tone', at: .1, duration: .1, fromHz: 330, toHz: 760, wave: 'square', gain: .34 },
    ],
  },
  {
    id: 'MF-SFX-0015', key: 'vlad.impale5', event: 'bigImpact', name: 'Vlad Brutality', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Signature BRUTALITY : masse, déchirure et sirène montante.', cooldownMs: 55,
    steps: [
      { type: 'noise', at: 0, duration: .2, filter: 'lowpass', frequency: 1100, gain: 1 },
      { type: 'tone', at: 0, duration: .22, fromHz: 105, toHz: 38, wave: 'sawtooth', gain: 1 },
      { type: 'noise', at: .065, duration: .15, filter: 'highpass', frequency: 2300, gain: .55 },
      { type: 'tone', at: .1, duration: .18, fromHz: 310, toHz: 940, wave: 'square', gain: .46 },
    ],
  },
  {
    id: 'MF-SFX-0016', key: 'vlad.sizzle', event: 'land', name: 'Vlad Sizzle', scope: 'game', gameId: 'vlads-skewers', gameTitle: 'Les Brochettes de Vlad', status: 'selected', createdAt: '2026-09-07',
    summary: 'Crépitement sec pour la cuisson dorée et la grille.', cooldownMs: 120,
    steps: [
      { type: 'noise', at: 0, duration: .24, filter: 'highpass', frequency: 2600, gain: .52 },
      { type: 'noise', at: .08, duration: .18, filter: 'bandpass', frequency: 1500, gain: .35 },
    ],
  },
]

export const sfxCatalog = {
  version: 1,
  rule: 'Never delete a MiniFugg sound identity. Archive or supersede it while keeping its MF-SFX id.',
  sounds: [...commonSounds, ...tetraSounds, ...vladSounds] as readonly SfxDefinition[],
} as const

export const gameSfxPalettes: Record<string, GameSfxPalette> = {
  tetramindfck: {
    gameId: 'tetramindfck',
    gameTitle: 'Tetra MindFuck',
    accent: { transposeSemitones: -2, gain: .82, duration: .92 },
    events: {
      move: 'common.move',
      rotate: 'common.rotate',
      softDrop: 'common.softDrop',
      land: 'common.land',
      levelUp: 'common.levelUp',
      success: 'common.success',
      fail: 'common.fail',
      calculate: 'tetra.calculate',
      bonus: 'tetra.bonus',
      bigImpact: 'tetra.bigImpact',
    },
  },
  'vlads-skewers': {
    gameId: 'vlads-skewers',
    gameTitle: 'Les Brochettes de Vlad',
    accent: { transposeSemitones: -2, gain: .92, duration: .94 },
    events: {
      land: 'vlad.impale1',
      levelUp: 'common.levelUp',
      success: 'common.success',
      fail: 'common.fail',
      bonus: 'common.success',
      bigImpact: 'vlad.impale5',
    },
  },
}
