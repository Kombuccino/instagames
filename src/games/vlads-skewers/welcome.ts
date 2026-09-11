import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/imported/vlads-skewers/welcome/variants'

/**
 * Five covers explicitly validated by the user on 2026-09-10.
 * Use the exact approved PNGs: no regeneration, recoloring or destructive resize.
 * Core owns presentation/selection; all editions are immediately available.
 */
export const VLADS_SKEWERS_WELCOME: GameWelcomeConfig = {
  variants: [
    {
      id: 'chaos',
      label: 'Infernal Feast',
      image: `${ROOT}/vlad-cover-01-chaos-approved-2026-09-10.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'still-life',
      label: 'Gothic Still Life',
      image: `${ROOT}/vlad-cover-02-still-life-approved-2026-09-10.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'japanese-portrait',
      label: 'Japanese Portrait',
      image: `${ROOT}/vlad-cover-03-japanese-portrait-approved-2026-09-10.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'castle-sign',
      label: 'Castle Sign',
      image: `${ROOT}/vlad-cover-04-castle-sign-approved-2026-09-10.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
    {
      id: 'japanese-stall',
      label: 'Midnight Stall',
      image: `${ROOT}/vlad-cover-05-japanese-stall-approved-2026-09-10.png`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'contain',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
