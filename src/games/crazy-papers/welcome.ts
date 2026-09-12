import type { GameWelcomeConfig } from '../../core/types'

export const CRAZY_PAPERS_WELCOME: GameWelcomeConfig = {
  selection: 'seeded',
  motion: 'none',
  variants: [
    {
      id: 'pulp-disaster',
      label: 'Pulp Disaster',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v1-pulp-disaster.webp',
      unlockScore: 0,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'micro-records',
      label: 'Micro Records',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v2-micro-records.webp',
      unlockScore: 5_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'graphic-collapse',
      label: 'Graphic Collapse',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v3-graphic-collapse.webp',
      unlockScore: 15_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'pulp-clerk',
      label: 'Pulp Clerk',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v4-pulp-clerk.webp',
      unlockScore: 30_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
    {
      id: 'constructivist-clerk',
      label: 'Constructivist Clerk',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v5-constructivist-clerk.webp',
      unlockScore: 50_000,
      runtime: 'static',
      fit: 'cover',
      // This source places its clerk in the expendable BAS. The approved art
      // stays intact; a focal crop keeps her face above Core's fixed console.
      objectPosition: 'center 70%',
    },
    {
      id: 'showa-paper-wave',
      label: 'Shōwa Paper Wave',
      image: '/assets/generated/crazy-papers/welcome/variants/runtime/v6-showa-paper-wave.webp',
      unlockScore: 75_000,
      runtime: 'static',
      fit: 'cover',
      objectPosition: 'top center',
    },
  ],
}
