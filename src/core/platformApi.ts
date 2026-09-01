import {
  getLeaderboard,
  submitLeaderboardScore,
  type LeaderboardEntry,
} from './leaderboard'
import {
  addLocalComment,
  getLocalSocialStats,
  listLocalComments,
  recordLocalPlay,
  setLocalBookmark,
  setLocalLove,
  type GameComment,
  type GameSocialStats,
} from './social'
import type { GameLeaderboardSort } from './types'

export type SubmitScoreInput = {
  gameId: string
  boardId: string
  nickname: string
  score: number
  metadata?: Record<string, string | number | boolean>
}

const API_BASE = (import.meta.env.VITE_MINIFUGG_API_URL as string | undefined)?.trim().replace(/\/$/, '')

function leaderboardEndpoint(gameId: string, boardId: string) {
  return `${API_BASE}/v1/leaderboards/${encodeURIComponent(gameId)}/${encodeURIComponent(boardId)}`
}

function gameEndpoint(gameId: string, suffix: string) {
  return `${API_BASE}/v1/games/${encodeURIComponent(gameId)}/${suffix}`
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
    const response = await fetch(`${leaderboardEndpoint(gameId, boardId)}?${query}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
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
    const response = await fetch(leaderboardEndpoint(input.gameId, input.boardId), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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

export async function getGameSocialStats(gameId: string): Promise<GameSocialStats> {
  if (!API_BASE) return getLocalSocialStats(gameId)
  try {
    const response = await fetch(gameEndpoint(gameId, 'stats'), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`Stats API returned ${response.status}`)
    return await response.json() as GameSocialStats
  } catch {
    return getLocalSocialStats(gameId)
  }
}

export async function recordGamePlay(gameId: string): Promise<GameSocialStats> {
  if (!API_BASE) return recordLocalPlay(gameId)
  try {
    const response = await fetch(gameEndpoint(gameId, 'plays'), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`Play API returned ${response.status}`)
    return await response.json() as GameSocialStats
  } catch {
    return recordLocalPlay(gameId)
  }
}

async function setRemoteFlag(gameId: string, flag: 'love' | 'bookmark', enabled: boolean): Promise<GameSocialStats> {
  const local = flag === 'love' ? setLocalLove : setLocalBookmark
  if (!API_BASE) return local(gameId, enabled)
  try {
    const response = await fetch(gameEndpoint(gameId, flag), {
      method: enabled ? 'PUT' : 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`${flag} API returned ${response.status}`)
    return await response.json() as GameSocialStats
  } catch {
    return local(gameId, enabled)
  }
}

export function setGameLove(gameId: string, loved: boolean) {
  return setRemoteFlag(gameId, 'love', loved)
}

export function setGameBookmark(gameId: string, bookmarked: boolean) {
  return setRemoteFlag(gameId, 'bookmark', bookmarked)
}

export async function listGameComments(gameId: string, limit = 50): Promise<GameComment[]> {
  if (!API_BASE) return listLocalComments(gameId, limit)
  try {
    const query = new URLSearchParams({ limit: String(Math.max(1, limit)) })
    const response = await fetch(`${gameEndpoint(gameId, 'comments')}?${query}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`Comments API returned ${response.status}`)
    const payload = await response.json() as GameComment[] | { comments?: GameComment[] }
    const comments = Array.isArray(payload) ? payload : payload.comments
    return Array.isArray(comments) ? comments : []
  } catch {
    return listLocalComments(gameId, limit)
  }
}

export async function addGameComment(gameId: string, nickname: string, body: string): Promise<GameComment | null> {
  if (!API_BASE) return addLocalComment(gameId, nickname, body)
  try {
    const response = await fetch(gameEndpoint(gameId, 'comments'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ nickname, body }),
    })
    if (!response.ok) throw new Error(`Comments API returned ${response.status}`)
    return await response.json() as GameComment
  } catch {
    return addLocalComment(gameId, nickname, body)
  }
}
