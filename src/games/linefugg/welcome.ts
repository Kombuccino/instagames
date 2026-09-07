import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/imported/linefugg/welcome/variants'

/**
 * Exact PNG masters approved on 2026-09-07. See ASSET_MANIFEST.md for provenance.
 * Core owns selection and presentation. No animation or invented score gates:
 * all four editions replace the placeholder and are available in Cover selection.
 * Contain preserves the baked title; only the decorative exterior is cover-cropped.
 */
export const LINEFUGG_WELCOME: GameWelcomeConfig = {
  variants: [
    {
      id: 'a-pulp-euro',
      label: 'The Astronomer',
      image: `${ROOT}/linefugg-cover-a-pulp-euro-approved-2026-09-07.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'b-micro-euro',
      label: 'The Cartographer',
      image: `${ROOT}/linefugg-cover-b-micro-euro-approved-2026-09-07.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'c-graphic-poster',
      label: 'Cosmic Routes',
      image: `${ROOT}/linefugg-cover-c-graphic-poster-approved-2026-09-07.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'd-japanese-edition',
      label: 'Japanese Edition',
      image: `${ROOT}/linefugg-cover-d-japanese-edition-approved-2026-09-07.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
