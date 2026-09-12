import type { ComponentType } from 'react'

export type GameLeaderboardPeriod = 'daily' | 'weekly' | 'global'
export type GameLeaderboardSort = 'desc' | 'asc'
export type GameOrientation = 'portrait' | 'landscape' | 'both'
export type GameCurationStatus = 'fugg' | 'beta' | 'trash'
export type GameRuntimeKind = 'legacy-dom' | 'phaser-2d' | 'three-3d'
export type GameMigrationState = 'required' | 'in-progress' | 'current'
export type CoverMigrationState = 'update-required' | 'in-progress' | 'current'
/** Persisted discovery preference kept for profile/API backward compatibility. */
export type FeedPreference = 'fugg' | 'beta' | 'all'

export type GameLogicalViewport = {
  width: number
  height: number
}

export type GameMigrationConfig = {
  state: GameMigrationState
  targetRuntime: Exclude<GameRuntimeKind, 'legacy-dom'>
  /** Locked games may only receive migration work or minimal urgent blocking/security fixes. */
  locked: boolean
  cover: CoverMigrationState
}

export type GameWelcomeVariant = {
  id: string
  label: string
  image: string
  unlockScore?: number
  objectPosition?: string
  /** Preserve an uncroppable flat master/title; Core fills the outside with decorative overscan. */
  fit?: 'cover' | 'contain'
  /** Covers are static raster art rendered by Core. */
  runtime?: 'static'
}

export type GameWelcomeConfig = {
  variants: GameWelcomeVariant[]
  /** Stable per-feed-slot rotation among unlocked covers. */
  selection?: 'seeded' | 'first'
  /** Legacy simple-motion hint. */
  motion?: 'subtle' | 'none'
}

export type GameLeaderboardConfig = {
  enabled: true
  periods?: GameLeaderboardPeriod[]
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

export type GameReleaseMetadata = {
  /** Player-facing semantic version for the currently deployed game. */
  version: string
  /** ISO 8601 delivery timestamp with the Europe/Paris offset at delivery time. */
  updatedAt: string
  /** Repository-relative canonical changelog source. */
  changelogPath: `src/games/${string}/CHANGELOG.md`
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
  status: GameCurationStatus
  orientation: GameOrientation
  /** Active renderer. Existing catalog entries remain legacy-dom until migrated. */
  runtime: GameRuntimeKind
  /** Fixed authored coordinate system. Physical screen size only scales this uniformly. */
  logicalViewport: GameLogicalViewport
  /** Explicit migration lock/state for the current catalog. */
  migration: GameMigrationConfig
  /** Core-owned discovery cover configuration. Games must not render their own cover/welcome UI. */
  welcome?: GameWelcomeConfig
  component: ComponentType<GameComponentProps>
  instructions?: GameInstructions
  features?: GameFeatureConfig
  /** Single source consumed by the Information panel for shipped release details. */
  release?: GameReleaseMetadata
}
