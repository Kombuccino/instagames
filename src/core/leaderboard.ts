export type LeaderboardEntry = {
  id: string
  gameId: string
  boardId: string
  nickname: string
  score: number
  createdAt: string
}

const STORAGE_KEY = 'minifugg:leaderboard:v1'
const NICKNAME_KEY = 'minifugg:nickname:v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readEntries(): LeaderboardEntry[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEntries(entries: LeaderboardEntry[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-500)))
  } catch {
    // Storage can be unavailable in private/restricted contexts. The game must remain playable.
  }
}

export function getSavedNickname() {
  if (!canUseStorage()) return ''
  try {
    return window.localStorage.getItem(NICKNAME_KEY)?.trim().slice(0, 20) ?? ''
  } catch {
    return ''
  }
}

export function saveNickname(nickname: string) {
  if (!canUseStorage()) return
  try {
    const clean = nickname.trim().slice(0, 20)
    if (clean) window.localStorage.setItem(NICKNAME_KEY, clean)
    else window.localStorage.removeItem(NICKNAME_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export function submitLeaderboardScore(input: Omit<LeaderboardEntry, 'id' | 'createdAt' | 'nickname'> & { nickname: string }) {
  const nickname = input.nickname.trim().slice(0, 20)
  if (!nickname) return null

  const entry: LeaderboardEntry = {
    ...input,
    nickname,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  const entries = readEntries()
  entries.push(entry)
  writeEntries(entries)
  saveNickname(nickname)
  return entry
}

export function getLeaderboard(gameId: string, boardId: string, limit = 10) {
  return readEntries()
    .filter((entry) => entry.gameId === gameId && entry.boardId === boardId)
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
    .slice(0, Math.max(1, limit))
}
