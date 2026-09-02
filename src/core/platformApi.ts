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
import type { FeedPreference, GameLeaderboardPeriod, GameLeaderboardSort } from './types'

export type SubmitScoreInput = {
  gameId: string
  boardId: string
  nickname: string
  score: number
  metadata?: Record<string, string | number | boolean>
}

export type SubmitRunScoreInput = {
  gameId: string
  nickname: string
  score: number
  periods: GameLeaderboardPeriod[]
  boardId?: string
  metadata?: Record<string, string | number | boolean>
}

export type PlatformProfileBookmark = {
  gameId: string
  createdAt: string
}

export type PlatformProfile = {
  id: string
  kind: string
  handle: string | null
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  feedPreference: FeedPreference
  bookmarks: PlatformProfileBookmark[]
}

export type UpdatePlatformProfileInput = {
  handle?: string | null
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  feedPreference?: FeedPreference
}

const API_BASE = (import.meta.env.VITE_MINIFUGG_API_URL as string | undefined)?.trim().replace(/\/$/, '')
const LOCAL_PROFILE_KEY = 'minifugg:profile:v1'

function leaderboardEndpoint(gameId: string, boardId: string) {
  return `${API_BASE}/v1/leaderboards/${encodeURIComponent(gameId)}/${encodeURIComponent(boardId)}`
}

function gameEndpoint(gameId: string, suffix: string) {
  return `${API_BASE}/v1/games/${encodeURIComponent(gameId)}/${suffix}`
}

function utcDayId() {
  return new Date().toISOString().slice(0, 10)
}

function isoWeekId(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = value.getUTCDay() || 7
  value.setUTCDate(value.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((value.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function localBoardId(period: GameLeaderboardPeriod) {
  if (period === 'daily') return `day:${utcDayId()}`
  if (period === 'weekly') return `week:${isoWeekId()}`
  return 'global'
}

function normalizeFeedPreference(value: unknown): FeedPreference {
  return value === 'beta' || value === 'all' ? value : 'fugg'
}

function emptyLocalProfile(): PlatformProfile {
  return { id: 'local', kind: 'anonymous', handle: null, displayName: null, bio: null, avatarUrl: null, feedPreference: 'fugg', bookmarks: [] }
}

function localProfile(): PlatformProfile {
  if (typeof window === 'undefined') return emptyLocalProfile()
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY)
    if (!raw) return emptyLocalProfile()
    const parsed = JSON.parse(raw) as Partial<PlatformProfile>
    return {
      id: typeof parsed.id === 'string' ? parsed.id : 'local',
      kind: typeof parsed.kind === 'string' ? parsed.kind : 'anonymous',
      handle: typeof parsed.handle === 'string' ? parsed.handle : null,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : null,
      bio: typeof parsed.bio === 'string' ? parsed.bio : null,
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : null,
      feedPreference: normalizeFeedPreference(parsed.feedPreference),
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
    }
  } catch {
    return emptyLocalProfile()
  }
}

function saveLocalProfile(input: UpdatePlatformProfileInput): PlatformProfile {
  const current = localProfile()
  const next: PlatformProfile = {
    ...current,
    handle: typeof input.handle === 'string' ? input.handle.trim().toLowerCase().slice(0, 30) || null : input.handle ?? current.handle,
    displayName: typeof input.displayName === 'string' ? input.displayName.trim().slice(0, 50) || null : input.displayName ?? current.displayName,
    bio: typeof input.bio === 'string' ? input.bio.trim().slice(0, 280) || null : input.bio ?? current.bio,
    avatarUrl: typeof input.avatarUrl === 'string' ? input.avatarUrl.trim().slice(0, 500) || null : input.avatarUrl ?? current.avatarUrl,
    feedPreference: input.feedPreference ? normalizeFeedPreference(input.feedPreference) : current.feedPreference,
  }
  try {
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next))
  } catch {
    // Profile fallback must never make games unplayable.
  }
  return next
}

export function hasRemotePlatformApi() {
  return Boolean(API_BASE)
}

export async function getMyProfile(): Promise<PlatformProfile> {
  if (!API_BASE) return localProfile()
  try {
    const response = await fetch(`${API_BASE}/v1/me`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`Profile API returned ${response.status}`)
    const payload = await response.json() as PlatformProfile
    return {
      ...payload,
      feedPreference: normalizeFeedPreference(payload.feedPreference),
      bookmarks: Array.isArray(payload.bookmarks) ? payload.bookmarks : [],
    }
  } catch {
    return localProfile()
  }
}

export async function updateMyProfile(input: UpdatePlatformProfileInput): Promise<PlatformProfile | null> {
  if (!API_BASE) return saveLocalProfile(input)
  try {
    const response = await fetch(`${API_BASE}/v1/me/profile`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!response.ok) return null
    const payload = await response.json() as Omit<PlatformProfile, 'bookmarks'> & { bookmarks?: PlatformProfileBookmark[] }
    return {
      ...payload,
      feedPreference: normalizeFeedPreference(payload.feedPreference),
      bookmarks: Array.isArray(payload.bookmarks) ? payload.bookmarks : [],
    }
  } catch {
    return saveLocalProfile(input)
  }
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

/** Legacy/special-board score submission. New games normally use submitRunScore through Core. */
export async function submitScore(input: SubmitScoreInput): Promise<LeaderboardEntry | null> {
  if (!API_BASE) return submitLeaderboardScore(input)

  try {
    const response = await fetch(leaderboardEndpoint(input.gameId, input.boardId), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nickname: input.nickname, score: input.score, metadata: input.metadata }),
    })
    if (!response.ok) throw new Error(`Leaderboard API returned ${response.status}`)
    return await response.json() as LeaderboardEntry
  } catch {
    return submitLeaderboardScore(input)
  }
}

export async function submitRunScore(input: SubmitRunScoreInput): Promise<LeaderboardEntry | null> {
  if (!API_BASE) {
    const boardIds = input.boardId ? [input.boardId] : input.periods.map(localBoardId)
    let first: LeaderboardEntry | null = null
    for (const boardId of boardIds) {
      const entry = submitLeaderboardScore({
        gameId: input.gameId,
        boardId,
        nickname: input.nickname,
        score: input.score,
      })
      if (!first && entry) first = entry
    }
    return first
  }

  try {
    const response = await fetch(`${API_BASE}/v1/scores`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error(`Score API returned ${response.status}`)
    return await response.json() as LeaderboardEntry
  } catch {
    const boardIds = input.boardId ? [input.boardId] : input.periods.map(localBoardId)
    let first: LeaderboardEntry | null = null
    for (const boardId of boardIds) {
      const entry = submitLeaderboardScore({
        gameId: input.gameId,
        boardId,
        nickname: input.nickname,
        score: input.score,
      })
      if (!first && entry) first = entry
    }
    return first
  }
}

export async function getGameSocialStats(gameId: string): Promise<GameSocialStats> {
  if (!API_BASE) return getLocalSocialStats(gameId)
  try {
    const response = await fetch(gameEndpoint(gameId, 'stats'), { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!response.ok) throw new Error(`Stats API returned ${response.status}`)
    return await response.json() as GameSocialStats
  } catch {
    return getLocalSocialStats(gameId)
  }
}

export async function recordGamePlay(gameId: string): Promise<GameSocialStats> {
  if (!API_BASE) return recordLocalPlay(gameId)
  try {
    const response = await fetch(gameEndpoint(gameId, 'plays'), { method: 'POST', headers: { Accept: 'application/json' }, credentials: 'include' })
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
    const response = await fetch(`${gameEndpoint(gameId, 'comments')}?${query}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
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
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nickname, body }),
    })
    if (!response.ok) throw new Error(`Comments API returned ${response.status}`)
    return await response.json() as GameComment
  } catch {
    return addLocalComment(gameId, nickname, body)
  }
}
