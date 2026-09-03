import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { GameWelcomeVariant } from './types'
import { ParallaxLab, readParallaxLabDraft, writeParallaxLabDraft } from './ParallaxLab'
import { resolveWelcomeLayer, welcomeMotionDuration } from './welcomeTuning'
import './fuggWelcome.css'

const BEST_SCORE_PREFIX = 'minifugg:welcome-best:v1:'
const SWIPE_THRESHOLD = 44
const EXIT_DURATION_MS = 300
const RESIDUAL_WHEEL_GUARD_MS = 750
const LAB_MIN_WIDTH = 980

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

function cloneVariants(variants: GameWelcomeVariant[]) {
  return JSON.parse(JSON.stringify(variants)) as GameWelcomeVariant[]
}

function labRequestedFor(gameId: string) {
  if (typeof window === 'undefined') return false
  const query = new URLSearchParams(window.location.search)
  return query.get('usr') === 'moigod' && query.get('game') === gameId
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
  root.style.setProperty('--mf-welcome-mid-x', '0px')
  root.style.setProperty('--mf-welcome-mid-y', '0px')
  root.style.setProperty('--mf-welcome-light-x', '50%')
  root.style.setProperty('--mf-welcome-light-y', '42%')
  root.querySelectorAll<HTMLElement>('[data-mf-welcome-layer]').forEach((layer) => {
    layer.style.setProperty('--mf-layer-parallax-x', '0px')
    layer.style.setProperty('--mf-layer-parallax-y', '0px')
  })
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
  const [labEnabled, setLabEnabled] = useState(false)
  const [draftVariants, setDraftVariants] = useState<GameWelcomeVariant[]>(() => cloneVariants(variants))
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [simulatedScore, setSimulatedScore] = useState(bestScore)
  const [showGuides, setShowGuides] = useState(false)

  useEffect(() => {
    if (!labRequestedFor(gameId)) {
      setLabEnabled(false)
      return
    }

    const media = window.matchMedia(`(min-width: ${LAB_MIN_WIDTH}px)`)
    const sync = () => setLabEnabled(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [gameId])

  useEffect(() => {
    if (!labEnabled) return
    document.body.classList.add('mf-parallax-lab-active')
    return () => document.body.classList.remove('mf-parallax-lab-active')
  }, [labEnabled])

  useEffect(() => {
    if (!labEnabled) {
      setDraftVariants(cloneVariants(variants))
      return
    }
    const draft = readParallaxLabDraft(gameId, cloneVariants(variants))
    setDraftVariants(draft)
    setSimulatedScore(bestScore)
    setSelectedVariantId((current) => current && draft.some((variant) => variant.id === current) ? current : (pickVariant(draft, bestScore, seed)?.id ?? draft[0]?.id ?? ''))
  }, [bestScore, gameId, labEnabled, seed, variants])

  useEffect(() => {
    if (labEnabled) writeParallaxLabDraft(gameId, draftVariants, variants)
  }, [draftVariants, gameId, labEnabled, variants])

  const effectiveVariants = labEnabled ? draftVariants : variants
  const previewScore = labEnabled ? simulatedScore : bestScore
  const seededVariant = useMemo(() => pickVariant(effectiveVariants, previewScore, seed), [effectiveVariants, previewScore, seed])
  const variant = labEnabled && selectedVariantId
    ? effectiveVariants.find((candidate) => candidate.id === selectedVariantId) ?? seededVariant
    : seededVariant
  const unlockedCount = useMemo(() => availableVariants(effectiveVariants, previewScore).length, [effectiveVariants, previewScore])

  const triggerPlay = useCallback(() => {
    if (labEnabled || exiting) return
    setExiting(true)
    guardResidualForwardWheel()
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null
      onPlay()
    }, EXIT_DURATION_MS)
  }, [exiting, labEnabled, onPlay])

  useEffect(() => () => {
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    document.body.classList.remove('mf-parallax-lab-active')
  }, [])

  useEffect(() => {
    if (!active) {
      swipeRef.current = null
      resetMotionVars(rootRef.current)
    }
  }, [active])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !active || labEnabled) return

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 6) return
      event.preventDefault()
      event.stopPropagation()
      triggerPlay()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [active, labEnabled, triggerPlay])

  useEffect(() => {
    if (!active || labEnabled) return

    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-mf-parallax-lab]')) return
      if (event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      triggerPlay()
    }

    window.addEventListener('keydown', onWindowKeyDown, true)
    return () => window.removeEventListener('keydown', onWindowKeyDown, true)
  }, [active, labEnabled, triggerPlay])

  if (!variant) return null

  const setParallax = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2
    const root = rootRef.current
    if (!root) return

    root.style.setProperty('--mf-welcome-mid-x', `${x * -5.5}px`)
    root.style.setProperty('--mf-welcome-mid-y', `${y * -4}px`)
    root.style.setProperty('--mf-welcome-light-x', `${50 + x * 18}%`)
    root.style.setProperty('--mf-welcome-light-y', `${42 + y * 13}%`)

    root.querySelectorAll<HTMLElement>('[data-mf-welcome-layer]').forEach((layer) => {
      const parallaxX = Number(layer.dataset.parallaxX) || 0
      const parallaxY = Number(layer.dataset.parallaxY) || 0
      layer.style.setProperty('--mf-layer-parallax-x', `${x * -parallaxX}px`)
      layer.style.setProperty('--mf-layer-parallax-y', `${y * -parallaxY}px`)
    })
  }

  const resetParallax = () => resetParallaxVars(rootRef.current)

  const beginSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || exiting || labEnabled) return
    event.preventDefault()
    event.stopPropagation()
    swipeRef.current = { pointerId: event.pointerId, startY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current
    if (!swipe || swipe.pointerId !== event.pointerId || exiting || labEnabled) return
    event.preventDefault()
    event.stopPropagation()
    const delta = Math.min(0, Math.max(-120, event.clientY - swipe.startY))
    rootRef.current?.style.setProperty('--mf-welcome-drag-y', `${delta}px`)
  }

  const endSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (labEnabled) return
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
    <>
      <section
        ref={rootRef}
        className="mf-fugg-welcome"
        data-active={active ? 'true' : 'false'}
        data-exiting={exiting ? 'true' : 'false'}
        data-layered={hasRasterLayers ? 'true' : 'false'}
        data-lab={labEnabled ? 'true' : 'false'}
        data-guides={showGuides ? 'true' : 'false'}
        aria-label={`${title} — écran d'accueil`}
        style={imageStyle}
        onPointerMove={setParallax}
        onPointerLeave={resetParallax}
        tabIndex={0}
      >
        <div className="mf-fugg-welcome-scene" aria-hidden="true">
          {hasRasterLayers ? (
            <div className="mf-fugg-welcome-layer-stack">
              {variant.layers!.map((layer, index) => {
                const tuning = resolveWelcomeLayer(layer)
                const radians = tuning.motion.direction * Math.PI / 180
                const motionX = Math.cos(radians) * tuning.motion.intensity
                const motionY = Math.sin(radians) * tuning.motion.intensity
                const jitterY = tuning.motion.intensity * (.35 + tuning.motion.irregularity * .65)
                const motionAngle = tuning.motion.intensity * .18
                const motionScale = 1 + tuning.motion.intensity / 500
                const layerStyle = {
                  '--mf-layer-x': `${tuning.x}%`,
                  '--mf-layer-y': `${tuning.y}%`,
                  '--mf-layer-scale': String(tuning.scale / 100),
                  '--mf-layer-rotation': `${tuning.rotation}deg`,
                  '--mf-layer-opacity': String(tuning.opacity / 100),
                  '--mf-layer-motion-duration': welcomeMotionDuration(tuning.motion.type, tuning.motion.speed),
                  '--mf-layer-motion-intensity': `${tuning.motion.intensity}px`,
                  '--mf-layer-motion-jitter-y': `${jitterY}px`,
                  '--mf-layer-motion-x': `${motionX}px`,
                  '--mf-layer-motion-y': `${motionY}px`,
                  '--mf-layer-motion-angle': `${motionAngle}deg`,
                  '--mf-layer-motion-scale': String(motionScale),
                  '--mf-layer-blur': `${tuning.fx.blur}px`,
                  '--mf-layer-glow': `${tuning.fx.glow}px`,
                  objectPosition: layer.objectPosition ?? variant.objectPosition ?? '50% 50%',
                } as CSSProperties

                return (
                  <div
                    className={`mf-fugg-welcome-layer-frame mf-fugg-welcome-layer-${layer.role}`}
                    data-mf-welcome-layer
                    data-parallax-x={tuning.parallaxX}
                    data-parallax-y={tuning.parallaxY}
                    style={layerStyle}
                    key={`${layer.role}-${index}-${layer.image}`}
                  >
                    <img
                      className="mf-fugg-welcome-layer-art"
                      data-motion={tuning.motion.type}
                      src={layer.image}
                      alt=""
                      draggable={false}
                    />
                    {labEnabled && showGuides && <span className="mf-fugg-welcome-layer-label">{index + 1} · {layer.role}</span>}
                  </div>
                )
              })}
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
            <span>{unlockedCount}/{effectiveVariants.length}</span>
            <span>{variant.label}</span>
          </div>

          <button
            type="button"
            className={`mf-fugg-welcome-play${hasRasterLayers ? ' is-integrated' : ''}`}
            onClick={triggerPlay}
            aria-label="Swipe to play"
            disabled={labEnabled}
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

      {labEnabled && createPortal(
        <ParallaxLab
          gameId={gameId}
          title={title}
          variants={draftVariants}
          productionVariants={variants}
          setVariants={setDraftVariants}
          selectedVariantId={selectedVariantId || variant.id}
          onSelectedVariantId={setSelectedVariantId}
          simulatedScore={simulatedScore}
          onSimulatedScore={setSimulatedScore}
          showGuides={showGuides}
          onShowGuides={setShowGuides}
        />,
        document.body,
      )}
    </>
  )
}
