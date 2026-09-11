import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/imported/vlads-skewers/welcome/variants/runtime'

/**
 * Five covers explicitly validated by the user on 2026-09-10.
 * Runtime uses the canonical 390 × 844 lossless WebP derivatives of the approved masters.
 * Core owns presentation/selection; all editions are immediately available.
 */
export const VLADS_SKEWERS_WELCOME: GameWelcomeConfig = {
  variants: [
    {
      id: 'chaos',
      label: 'Infernal Feast',
      image: `${ROOT}/vlad-cover-01-chaos.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
    },
    {
      id: 'still-life',
      label: 'Gothic Still Life',
      image: `${ROOT}/vlad-cover-02-still-life.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
    },
    {
      id: 'japanese-portrait',
      label: 'Japanese Portrait',
      image: `${ROOT}/vlad-cover-03-japanese-portrait.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
    },
    {
      id: 'castle-sign',
      label: 'Castle Sign',
      image: `${ROOT}/vlad-cover-04-castle-sign.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
    },
    {
      id: 'japanese-stall',
      label: 'Midnight Stall',
      image: `${ROOT}/vlad-cover-05-japanese-stall.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
