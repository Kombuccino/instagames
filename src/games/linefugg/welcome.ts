import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/generated/linefugg/welcome/variants/runtime'

/**
 * Exact PNG references approved on 2026-09-07 remain preserved as visual authorities.
 * Runtime serves lossless WebP derivatives of the 2026-09-12 full-height restorations.
 * Core owns selection and presentation. No animation or invented score gates:
 * all four editions replace the placeholder and are available in Cover selection.
 * The authored 390 × 844 frame fills the Cover; only its continuous lower art is cropped.
 */
export const LINEFUGG_WELCOME: GameWelcomeConfig = {
  variants: [
    {
      id: 'a-pulp-euro',
      label: 'The Astronomer',
      image: `${ROOT}/linefugg-cover-a-pulp-euro.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'b-micro-euro',
      label: 'The Cartographer',
      image: `${ROOT}/linefugg-cover-b-micro-euro.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'c-graphic-poster',
      label: 'Cosmic Routes',
      image: `${ROOT}/linefugg-cover-c-graphic-poster.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'd-japanese-edition',
      label: 'Japanese Edition',
      image: `${ROOT}/linefugg-cover-d-japanese-edition.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
