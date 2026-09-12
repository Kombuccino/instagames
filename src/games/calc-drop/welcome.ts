import type { GameWelcomeConfig } from '../../core/types'

export const TETRAMINDFCK_WELCOME: GameWelcomeConfig = {
  selection: 'seeded',
  motion: 'none',
  variants: [
    {
      id: 'pulp-euro',
      label: 'Pulp européen',
      image: '/assets/generated/tetramindfck/welcome/variants/runtime/v1-pulp-euro.webp',
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'micro-euro',
      label: 'Micro Europe 90s',
      image: '/assets/generated/tetramindfck/welcome/variants/runtime/v2-micro-euro.webp',
      unlockScore: 5_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'graphic-poster',
      label: 'Affiche graphique',
      image: '/assets/generated/tetramindfck/welcome/variants/runtime/v3-graphic-poster.webp',
      unlockScore: 15_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
  ],
}
