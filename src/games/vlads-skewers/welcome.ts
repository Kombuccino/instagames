import type { GameWelcomeConfig } from '../../core/types'

const ROOT = '/assets/generated/vlads-skewers/welcome/variants/runtime'

/**
 * Five covers explicitly validated by the user on 2026-09-10 remain the visual authorities.
 * Runtime uses the 2026-09-12 full-height, lossless WebP restorations without blurred bands.
 * Core owns presentation/selection; all editions are immediately available.
 * The authored 390 × 844 sources stay intact; framing follows the 2026-09-17
 * Cover Calibration review inside the canonical 390 × 850 target / 390 × 710 window.
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
      objectPosition: 'center 2.9%',
    },
    {
      id: 'still-life',
      label: 'Gothic Still Life',
      image: `${ROOT}/vlad-cover-02-still-life.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'center 2.1%',
    },
    {
      id: 'japanese-portrait',
      label: 'Japanese Portrait',
      image: `${ROOT}/vlad-cover-03-japanese-portrait.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'center 2.9%',
    },
    {
      id: 'castle-sign',
      label: 'Castle Sign',
      image: `${ROOT}/vlad-cover-04-castle-sign.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'center 2.1%',
    },
    {
      id: 'japanese-stall',
      label: 'Midnight Stall',
      image: `${ROOT}/vlad-cover-05-japanese-stall.webp`,
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'center 2.9%',
    },
  ],
  selection: 'seeded',
  motion: 'none',
}
