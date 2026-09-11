import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/imported/linefugg/welcome/variants/runtime'

/**
 * Exact PNG masters approved on 2026-09-07 remain preserved as canonical artwork.
 * Runtime serves lossless WebP derivatives of those same four compositions.
 * Core owns selection and presentation. No animation or invented score gates:
 * all four editions replace the placeholder and are available in Cover selection.
 * Contain preserves the baked title; only the decorative exterior is cover-cropped.
 */
export const LINEFUGG_WELCOME: GameWelcomeConfig = {
  variants: [
    {
      id: 'a-pulp-euro',
      label: 'The Astronomer',
      image: `${ROOT}/linefugg-cover-a-pulp-euro.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'b-micro-euro',
      label: 'The Cartographer',
      image: `${ROOT}/linefugg-cover-b-micro-euro.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'c-graphic-poster',
      label: 'Cosmic Routes',
      image: `${ROOT}/linefugg-cover-c-graphic-poster.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'd-japanese-edition',
      label: 'Japanese Edition',
      image: `${ROOT}/linefugg-cover-d-japanese-edition.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
