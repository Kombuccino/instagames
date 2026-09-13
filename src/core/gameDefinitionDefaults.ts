import type { GameFeatureConfig, InstagameDefinition } from './types'

// Platform defaults only. Per-game version, rules, cover and migration state
// belong in src/games/<folder>/definition.ts, never here.
export const STANDARD_FEATURES: GameFeatureConfig = {
  help: true,
  love: true,
  comments: true,
  bookmark: true,
  leaderboard: {
    enabled: true,
    mode: 'periodic',
    periods: ['weekly', 'global'],
    sort: 'desc',
    limit: 100,
  },
  share: true,
  remix: false,
}

export const DAILY_CHALLENGE_FEATURES: GameFeatureConfig = {
  ...STANDARD_FEATURES,
  leaderboard: {
    enabled: true,
    mode: 'daily-challenge',
    periods: ['daily'],
    sort: 'desc',
    limit: 100,
  },
}

// A temporary navigation cover is not an artistic approval.
export function placeholderWelcome(gameId: string): NonNullable<InstagameDefinition['welcome']> {
  return {
    variants: [{
      id: 'placeholder-v1',
      label: 'Temporary cover',
      image: `/assets/imported/${gameId}/welcome/cover-placeholder-v1.png`,
      unlockScore: 0,
    }],
    selection: 'first',
    motion: 'none',
  }
}
