import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { GameWelcomeVariant } from './types'
import './fuggWelcome.css'

const BEST_SCORE_PREFIX = 'minifugg:welcome-best:v1:'
const SWIPE_THRESHOLD = 44

type FuggWelcomeProps = {
  gameId: string
  title: string
  seed: number
  active: boolean
  bestScore: number
  variants: GameWelcomeVariant[]
  onPlay: () => void
}

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
      // Welcome art must never block gameplay if storage is unavailable.
    }
  }
  return best
}

function availableVariants(variants: GameWelcomeVariant[], bestScore: number) {
  const unlocked = variants.filter((variant) => bestScore >= (variant.unlockScore ?? 0))
  return unlocked.length > 0 ? unlocked : variants.slice(0, 1)
}

function pickVariant(variants: GameWelcomeVariant[], bestScore: number, seed: number) {
  const unlocked = availableVariants(variants, bestScore)
  if (unlocked.length <= 1) return unlocked[0]
  const index = Math.abs(Math.trunc(seed)) % unlocked.length
  return unlocked[index]
}

export function FuggWelcome({ gameId, title, seed, active, bestScore, variants, onPlay }: FuggWelcomeProps) {
  const rootRef = useRef<HTMLElement>(null)
  const swipeRef = useRef<{ pointerId: number, startY: number } | null>(null)
  const variant = useMemo(() => pickVariant(variants, bestScore, seed), [bestScore, seed, variants])
  const unlockedCount = useMemo(() => availableVariants(variants, bestScore).length, [bestScore, variants])

  useEffect(() => {
    if (!active) swipeRef.current = null
  }, [active])

  if (!variant) return null

  const setParallax = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2
    rootRef.current?.style.setProperty('--mf-welcome-x', `${x * -7}px`)
    rootRef.current?.style.setProperty('--mf-welcome-y', `${y * -5}px`)
    rootRef.current?.style.setProperty('--mf-welcome-light-x', `${50 + x * 18}%`)
    rootRef.current?.style.setProperty('--mf-welcome-light-y', `${42 + y * 13}%`)
  }

  const resetParallax = () => {
    rootRef.current?.style.setProperty('--mf-welcome-x', '0px')
    rootRef.current?.style.setProperty('--mf-welcome-y', '0px')
    rootRef.current?.style.setProperty('--mf-welcome-light-x', '50%')
    rootRef.current?.style.setProperty('--mf-welcome-light-y', '42%')
  }

  const beginSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return
    swipeRef.current = { pointerId: event.pointerId, startY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const endSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current
    swipeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!swipe || swipe.pointerId !== event.pointerId) return
    if (swipe.startY - event.clientY >= SWIPE_THRESHOLD) onPlay()
  }

  const cancelSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const imageStyle = {
    '--mf-welcome-image': `url("${variant.image}")`,
    '--mf-welcome-object-position': variant.objectPosition ?? '50% 50%',
  } as CSSProperties

  return (
    <section
      ref={rootRef}
      className="mf-fugg-welcome"
      data-active={active ? 'true' : 'false'}
      aria-label={`${title} — écran d'accueil`}
      style={imageStyle}
      onPointerMove={setParallax}
      onPointerLeave={resetParallax}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onPlay()
        }
      }}
      tabIndex={0}
    >
      <div className="mf-fugg-welcome-backdrop" aria-hidden="true" />
      <div className="mf-fugg-welcome-camera" aria-hidden="true">
        <img className="mf-fugg-welcome-poster" src={variant.image} alt="" draggable={false} />
      </div>
      <div className="mf-fugg-welcome-light" aria-hidden="true" />
      <div className="mf-fugg-welcome-grain" aria-hidden="true" />

      <span className="mf-fugg-welcome-tetro mf-fugg-welcome-tetro-a" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="mf-fugg-welcome-tetro mf-fugg-welcome-tetro-b" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="mf-fugg-welcome-tetro mf-fugg-welcome-tetro-c" aria-hidden="true"><i /><i /><i /><i /></span>

      <div
        className="mf-fugg-welcome-interaction"
        onPointerDown={beginSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={cancelSwipe}
        aria-hidden="true"
      />

      <div className="mf-fugg-welcome-meta" aria-hidden="true">
        <span>{unlockedCount}/{variants.length}</span>
        <span>{variant.label}</span>
      </div>

      <button type="button" className="mf-fugg-welcome-play" onClick={onPlay} aria-label="Swipe to play">
        <span>↑</span>
      </button>
    </section>
  )
}
