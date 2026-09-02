import type { ComponentType } from 'react'

export type GameLeaderboardPeriod = 'daily' | 'weekly' | 'global'
export type GameLeaderboardSort = 'desc' | 'asc'
export type GameOrientation = 'portrait' | 'landscape' | 'both'

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
  /** Preferred gameplay orientation. Core remains responsive in both directions. */
  orientation?: GameOrientation
  component: ComponentType<GameComponentProps>
  instructions?: GameInstructions
  features?: GameFeatureConfig
}
