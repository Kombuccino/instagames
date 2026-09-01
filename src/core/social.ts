export type GameSocialStats = {
  plays: number
  loves: number
  comments: number
  bookmarks: number
  loved: boolean
  bookmarked: boolean
}

export type GameComment = {
  id: string
  gameId: string
  nickname: string
  body: string
  createdAt: string
}

type SocialStore = {
  games: Record<string, GameSocialStats>
  comments: GameComment[]
}

const STORAGE_KEY = 'minifugg:social:v1'

const EMPTY_STATS: GameSocialStats = {
  plays: 0,
  loves: 0,
  comments: 0,
  bookmarks: 0,
  loved: false,
  bookmarked: false,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore(): SocialStore {
  if (!canUseStorage()) return { games: {}, comments: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { games: {}, comments: [] }
    const parsed = JSON.parse(raw) as Partial<SocialStore>
    return {
      games: parsed.games && typeof parsed.games === 'object' ? parsed.games : {},
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    }
  } catch {
    return { games: {}, comments: [] }
  }
}

function writeStore(store: SocialStore) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Social UI must never make a game unplayable.
  }
}

function currentStats(store: SocialStore, gameId: string): GameSocialStats {
  return { ...EMPTY_STATS, ...(store.games[gameId] ?? {}) }
}

export function getLocalSocialStats(gameId: string) {
  const store = readStore()
  return currentStats(store, gameId)
}

export function recordLocalPlay(gameId: string) {
  const store = readStore()
  const stats = currentStats(store, gameId)
  stats.plays += 1
  store.games[gameId] = stats
  writeStore(store)
  return stats
}

export function setLocalLove(gameId: string, loved: boolean) {
  const store = readStore()
  const stats = currentStats(store, gameId)
  if (stats.loved !== loved) stats.loves = Math.max(0, stats.loves + (loved ? 1 : -1))
  stats.loved = loved
  store.games[gameId] = stats
  writeStore(store)
  return stats
}

export function setLocalBookmark(gameId: string, bookmarked: boolean) {
  const store = readStore()
  const stats = currentStats(store, gameId)
  if (stats.bookmarked !== bookmarked) stats.bookmarks = Math.max(0, stats.bookmarks + (bookmarked ? 1 : -1))
  stats.bookmarked = bookmarked
  store.games[gameId] = stats
  writeStore(store)
  return stats
}

export function listLocalComments(gameId: string, limit = 50) {
  return readStore().comments
    .filter((comment) => comment.gameId === gameId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.max(1, limit))
}

export function addLocalComment(gameId: string, nickname: string, body: string) {
  const cleanNickname = nickname.trim().slice(0, 20)
  const cleanBody = body.trim().slice(0, 500)
  if (!cleanNickname || !cleanBody) return null

  const store = readStore()
  const comment: GameComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    gameId,
    nickname: cleanNickname,
    body: cleanBody,
    createdAt: new Date().toISOString(),
  }
  store.comments.push(comment)

  const stats = currentStats(store, gameId)
  stats.comments += 1
  store.games[gameId] = stats
  writeStore(store)
  return comment
}
