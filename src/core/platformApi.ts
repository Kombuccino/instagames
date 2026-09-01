import {
  getLeaderboard,
  submitLeaderboardScore,
  type LeaderboardEntry,
} from './leaderboard'
import type { GameLeaderboardSort } from './types'

export type SubmitScoreInput = {
  gameId: string
  boardId: string
  nickname: string
  score: number
  metadata?: Record<string, string | number | boolean>
}

const API_BASE = (import.meta.env.VITE_MINIFUGG_API_URL as string | undefined)?.trim().replace(/\/$/, '')

function endpoint(gameId: string, boardId: string) {
  return `${API_BASE}/v1/leaderboards/${encodeURIComponent(gameId)}/${encodeURIComponent(boardId)}`
}

export function hasRemotePlatformApi() {
  return Boolean(API_BASE)
}

export async function listLeaderboard(
  gameId: string,
  boardId: string,
  limit = 10,
  sort: GameLeaderboardSort = 'desc',
): Promise<LeaderboardEntry[]> {
  if (!API_BASE) {
    const entries = getLeaderboard(gameId, boardId, sort === 'asc' ? 500 : limit)
    return sort === 'asc' ? [...entries].reverse().slice(0, limit) : entries
  }

  try {
    const query = new URLSearchParams({ limit: String(Math.max(1, limit)), sort })
    const response = await fetch(`${endpoint(gameId, boardId)}?${query}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Leaderboard API returned ${response.status}`)
    const payload = await response.json() as LeaderboardEntry[] | { entries?: LeaderboardEntry[] }
    const entries = Array.isArray(payload) ? payload : payload.entries
    return Array.isArray(entries) ? entries : []
  } catch {
    const entries = getLeaderboard(gameId, boardId, sort === 'asc' ? 500 : limit)
    return sort === 'asc' ? [...entries].reverse().slice(0, limit) : entries
  }
}

export async function submitScore(input: SubmitScoreInput): Promise<LeaderboardEntry | null> {
  if (!API_BASE) return submitLeaderboardScore(input)

  try {
    const response = await fetch(endpoint(input.gameId, input.boardId), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: input.nickname,
        score: input.score,
        metadata: input.metadata,
      }),
    })
    if (!response.ok) throw new Error(`Leaderboard API returned ${response.status}`)
    return await response.json() as LeaderboardEntry
  } catch {
    return submitLeaderboardScore(input)
  }
}
