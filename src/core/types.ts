import type { ComponentType } from 'react'

export type GameLeaderboardPeriod = 'daily' | 'weekly' | 'global'
export type GameLeaderboardSort = 'desc' | 'asc'
export type GameOrientation = 'portrait' | 'landscape' | 'both'
export type GameCurationStatus = 'fugg' | 'beta' | 'trash'
export type FeedPreference = 'fugg' | 'beta' | 'all'

export type GameWelcomeLayerRole = 'background' | 'midground' | 'foreground' | 'overlay'

export type GameWelcomeLayer = {
  /** Repository-served raster asset. Production layers must come through the Drive asset pipeline. */
  image: string
  /** Controls the movement depth. The role also defines sensible default stacking and motion. */
  role: GameWelcomeLayerRole
  /** Optional object-position override; keep matching layers aligned when possible. */
  objectPosition?: string
}

export type GameWelcomeVariant = {
  id: string
  label: string
  image: string
  unlockScore?: number
  /** Optional object-position override for crop-safe responsive rendering. */
  objectPosition?: string
  /**
   * Real raster layers used for parallax. When present, these replace the flat poster at runtime.
   * Do not fake important parallax objects with CSS geometry.
   */
  layers?: GameWelcomeLayer[]
}

export type GameWelcomeConfig = {
  variants: GameWelcomeVariant[]
  /** Stable per-feed-slot rotation among unlocked covers. */
  selection?: 'seeded' | 'first'
  /** Enables subtle image movement/light effects; never required for gameplay. */
  motion?: 'subtle' | 'none'
}

export type GameLeaderboardConfig = {
  enabled: true
  periods?: GameLeaderboardPeriod[]
  /** Legacy single-period setting. Prefer periods. */
  scope?: 'daily' | 'global'
  sort?: GameLeaderboardSort
  limit?: number
}

export type GameFeatureConfig = {
  help?: boolean
  leaderboard?: GameLeaderboardConfig | false
  love?: boolean
  comments?: boolean
  bookmark?: boolean
  share?: boolean
  remix?: boolean
}

export type GameInstructions = {
  goal: string
  rules: string[]
  controls?: string[]
}

export type GameFinishPayload = {
  score: number
  boardId?: string
  metadata?: Record<string, string | number | boolean>
}

export type GameSessionApi = {
  setScore: (score: number) => void
  finish: (payload: GameFinishPayload) => void
}

export type GameComponentProps = {
  active: boolean
  seed: number
  restartToken: number
  session: GameSessionApi
}

export type InstagameDefinition = {
  id: string
  title: string
  description: string
  author?: string
  /** Developer-selected curation tier. Defaults to fugg for legacy games. */
  status?: GameCurationStatus
  /** Preferred gameplay orientation. Core remains responsive in both directions. */
  orientation?: GameOrientation
  /** Premium collectible intro art. Reserved for curated Fugg games. */
  welcome?: GameWelcomeConfig
  component: ComponentType<GameComponentProps>
  instructions?: GameInstructions
  features?: GameFeatureConfig
}
