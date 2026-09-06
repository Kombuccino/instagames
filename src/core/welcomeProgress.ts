const BEST_SCORE_PREFIX = 'minifugg:welcome-best:v1:'

function safeLocalStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readWelcomeBestScore(gameId: string) {
  const storage = safeLocalStorage()
  if (!storage) return 0
  const value = Number(storage.getItem(`${BEST_SCORE_PREFIX}${gameId}`))
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function recordWelcomeBestScore(gameId: string, score: number) {
  const nextScore = Number.isFinite(score) ? Math.max(0, score) : 0
  const previous = readWelcomeBestScore(gameId)
  const best = Math.max(previous, nextScore)
  const storage = safeLocalStorage()
  if (storage) {
    try {
      storage.setItem(`${BEST_SCORE_PREFIX}${gameId}`, String(best))
    } catch {
      // Progress persistence must never block gameplay.
    }
  }
  return best
}
