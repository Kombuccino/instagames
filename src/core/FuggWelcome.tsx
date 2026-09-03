import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { GameWelcomeVariant } from './types'
import './fuggWelcome.css'

const BEST_SCORE_PREFIX = 'minifugg:welcome-best:v1:'
const SWIPE_THRESHOLD = 44
const EXIT_DURATION_MS = 300
const RESIDUAL_WHEEL_GUARD_MS = 750

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

function resetParallaxVars(root: HTMLElement | null) {
  if (!root) return
  root.style.setProperty('--mf-welcome-bg-x', '0px')
  root.style.setProperty('--mf-welcome-bg-y', '0px')
  root.style.setProperty('--mf-welcome-mid-x', '0px')
  root.style.setProperty('--mf-welcome-mid-y', '0px')
  root.style.setProperty('--mf-welcome-fg-x', '0px')
  root.style.setProperty('--mf-welcome-fg-y', '0px')
  root.style.setProperty('--mf-welcome-overlay-x', '0px')
  root.style.setProperty('--mf-welcome-overlay-y', '0px')
  root.style.setProperty('--mf-welcome-light-x', '50%')
  root.style.setProperty('--mf-welcome-light-y', '42%')
}

function resetMotionVars(root: HTMLElement | null) {
  resetParallaxVars(root)
  root?.style.setProperty('--mf-welcome-drag-y', '0px')
}

function guardResidualForwardWheel() {
  const started = performance.now()
  const blockForwardWheel = (event: WheelEvent) => {
    if (performance.now() - started >= RESIDUAL_WHEEL_GUARD_MS) return
    if (event.deltaY <= 0) return
    event.preventDefault()
    event.stopPropagation()
  }

  window.addEventListener('wheel', blockForwardWheel, { capture: true, passive: false })
  window.setTimeout(() => {
    window.removeEventListener('wheel', blockForwardWheel, true)
  }, RESIDUAL_WHEEL_GUARD_MS)
}

export function FuggWelcome({ gameId, title, seed, active, bestScore, variants, onPlay }: FuggWelcomeProps) {
  const rootRef = useRef<HTMLElement>(null)
  const swipeRef = useRef<{ pointerId: number, startY: number } | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const [exiting, setExiting] = useState(false)
  const variant = useMemo(() => pickVariant(variants, bestScore, seed), [bestScore, seed, variants])
  const unlockedCount = useMemo(() => availableVariants(variants, bestScore).length, [bestScore, variants])

  const triggerPlay = useCallback(() => {
    if (exiting) return
    setExiting(true)
    guardResidualForwardWheel()
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null
      onPlay()
    }, EXIT_DURATION_MS)
  }, [exiting, onPlay])

  useEffect(() => () => {
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
  }, [])

  useEffect(() => {
    if (!active) {
      swipeRef.current = null
      resetMotionVars(rootRef.current)
    }
  }, [active])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !active) return

    const onWheel = (event: WheelEvent) => {
      // The first forward wheel gesture belongs to the cover: reveal this game,
      // never scroll straight to the following feed slot.
      if (event.deltaY <= 6) return
      event.preventDefault()
      event.stopPropagation()
      triggerPlay()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [active, triggerPlay])

  useEffect(() => {
    if (!active) return

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      triggerPlay()
    }

    window.addEventListener('keydown', onWindowKeyDown, true)
    return () => window.removeEventListener('keydown', onWindowKeyDown, true)
  }, [active, triggerPlay])

  if (!variant) return null

  const setParallax = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2
    const root = rootRef.current
    if (!root) return

    root.style.setProperty('--mf-welcome-bg-x', `${x * -2.2}px`)
    root.style.setProperty('--mf-welcome-bg-y', `${y * -1.6}px`)
    root.style.setProperty('--mf-welcome-mid-x', `${x * -5.5}px`)
    root.style.setProperty('--mf-welcome-mid-y', `${y * -4}px`)
    root.style.setProperty('--mf-welcome-fg-x', `${x * -9.5}px`)
    root.style.setProperty('--mf-welcome-fg-y', `${y * -7}px`)
    root.style.setProperty('--mf-welcome-overlay-x', `${x * -1.5}px`)
    root.style.setProperty('--mf-welcome-overlay-y', `${y * -1}px`)
    root.style.setProperty('--mf-welcome-light-x', `${50 + x * 18}%`)
    root.style.setProperty('--mf-welcome-light-y', `${42 + y * 13}%`)
  }

  const resetParallax = () => resetParallaxVars(rootRef.current)

  const beginSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || exiting) return
    event.preventDefault()
    event.stopPropagation()
    swipeRef.current = { pointerId: event.pointerId, startY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current
    if (!swipe || swipe.pointerId !== event.pointerId || exiting) return
    event.preventDefault()
    event.stopPropagation()
    const delta = Math.min(0, Math.max(-120, event.clientY - swipe.startY))
    rootRef.current?.style.setProperty('--mf-welcome-drag-y', `${delta}px`)
  }

  const endSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const swipe = swipeRef.current
    swipeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!swipe || swipe.pointerId !== event.pointerId) return

    if (swipe.startY - event.clientY >= SWIPE_THRESHOLD) {
      triggerPlay()
    } else {
      rootRef.current?.style.setProperty('--mf-welcome-drag-y', '0px')
    }
  }

  const cancelSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = null
    rootRef.current?.style.setProperty('--mf-welcome-drag-y', '0px')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const imageStyle = {
    '--mf-welcome-image': `url("${variant.image}")`,
    '--mf-welcome-object-position': variant.objectPosition ?? '50% 50%',
  } as CSSProperties

  const hasRasterLayers = Boolean(variant.layers?.length)

  return (
    <section
      ref={rootRef}
      className="mf-fugg-welcome"
      data-active={active ? 'true' : 'false'}
      data-exiting={exiting ? 'true' : 'false'}
      data-layered={hasRasterLayers ? 'true' : 'false'}
      aria-label={`${title} — écran d'accueil`}
      style={imageStyle}
      onPointerMove={setParallax}
      onPointerLeave={resetParallax}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          event.stopPropagation()
          triggerPlay()
        }
      }}
      tabIndex={0}
    >
      <div className="mf-fugg-welcome-scene" aria-hidden="true">
        {hasRasterLayers ? (
          <div className="mf-fugg-welcome-layer-stack">
            {variant.layers!.map((layer, index) => (
              <img
                className={`mf-fugg-welcome-layer mf-fugg-welcome-layer-${layer.role}`}
                src={layer.image}
                alt=""
                draggable={false}
                style={{ objectPosition: layer.objectPosition ?? variant.objectPosition ?? '50% 50%' }}
                key={`${layer.role}-${index}-${layer.image}`}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mf-fugg-welcome-backdrop" />
            <div className="mf-fugg-welcome-camera">
              <img className="mf-fugg-welcome-poster" src={variant.image} alt="" draggable={false} />
            </div>
          </>
        )}
        <div className="mf-fugg-welcome-light" />
        <div className="mf-fugg-welcome-grain" />

        <div className="mf-fugg-welcome-meta">
          <span>{unlockedCount}/{variants.length}</span>
          <span>{variant.label}</span>
        </div>

        <button
          type="button"
          className={`mf-fugg-welcome-play${hasRasterLayers ? ' is-integrated' : ''}`}
          onClick={triggerPlay}
          aria-label="Swipe to play"
        >
          <span>↑</span>
        </button>
      </div>

      <div
        className="mf-fugg-welcome-interaction"
        onPointerDown={beginSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={cancelSwipe}
        aria-hidden="true"
      />
    </section>
  )
}
