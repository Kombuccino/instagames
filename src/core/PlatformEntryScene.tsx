import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { FuggyEyes } from './graphics/FuggyEyes'
import { PerspectiveTextureCanvas } from './graphics/PerspectiveTextureCanvas'
import { PhoneWelcomeScreen } from './graphics/PhoneWelcomeScreen'
import { ProjectiveDomSurface } from './graphics/ProjectiveDomSurface'
import { createPlatformEntryMusic, type PlatformEntryMusicController } from './platformEntryMusic'
import './platformEntryScene.css'
import './phoneProjectiveSurface.css'
import './platformEntrySceneHandoff.css'

type PlatformEntrySceneProps = {
  onLaunch: () => void
}

type PointerStart = {
  id: number
  x: number
  y: number
}

const ENTER_DURATION_MS = 860
const TAP_SLOP_PX = 14
const SWIPE_THRESHOLD_PX = 42
const ASSET_ROOT = '/assets/imported/platform/entry-scenes/metro-moment-v1'
const WAGON_ART = `${ASSET_ROOT}/wagon-reader-fuggy.png`
const CITY_ART = `${ASSET_ROOT}/city-loop-sunset.png`
const ARM_VARIANTS = Array.from({ length: 8 }, (_, index) => `${ASSET_ROOT}/arms/arm-${String(index + 1).padStart(2, '0')}.png`)
const ARM_STORAGE_KEY = 'minifugg:entry-arm:v1'

/*
 * Re-measured from the production arm PNGs themselves rather than from a
 * rendered screenshot. Six independently generated variants converge within
 * roughly one source pixel on these inner-display edges; the two remaining
 * variants use the same locked phone geometry. Order is TL, TR, BR, BL.
 */
const PHONE_SCREEN_QUAD = [
  [0.338072, 0.297603],
  [0.629183, 0.297324],
  [0.559736, 0.660858],
  [0.263604, 0.652634],
] as const

function chooseArm() {
  if (typeof window === 'undefined') return ARM_VARIANTS[0]

  let previous = -1
  try {
    previous = Number(window.sessionStorage.getItem(ARM_STORAGE_KEY))
  } catch {
    // Random arm selection must never block entry.
  }

  let index = Math.floor(Math.random() * ARM_VARIANTS.length)
  if (ARM_VARIANTS.length > 1 && index === previous) index = (index + 1 + Math.floor(Math.random() * (ARM_VARIANTS.length - 1))) % ARM_VARIANTS.length

  try {
    window.sessionStorage.setItem(ARM_STORAGE_KEY, String(index))
  } catch {
    // Ignore unavailable storage.
  }

  return ARM_VARIANTS[index]
}

export function PlatformEntryScene({ onLaunch }: PlatformEntrySceneProps) {
  const [entering, setEntering] = useState(false)
  const [arm] = useState(chooseArm)
  const enteringRef = useRef(false)
  const pointerRef = useRef<PointerStart | null>(null)
  const timerRef = useRef<number | null>(null)
  const sceneStartedAtRef = useRef(typeof performance === 'undefined' ? 0 : performance.now())
  const musicRef = useRef<PlatformEntryMusicController | null>(null)

  const triggerEntry = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true
    musicRef.current?.fadeOut(ENTER_DURATION_MS / 1000)
    setEntering(true)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      onLaunch()
    }, ENTER_DURATION_MS)
  }, [onLaunch])

  useEffect(() => {
    document.title = 'MiniFugg'
    const music = createPlatformEntryMusic(sceneStartedAtRef.current)
    musicRef.current = music

    void music.start()
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      music.stop()
      if (musicRef.current === music) musicRef.current = null
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (enteringRef.current || !event.isPrimary) return
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerRef.current
    if (!start || start.id !== event.pointerId) return
    pointerRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const distance = Math.hypot(dx, dy)
    if (distance <= TAP_SLOP_PX || dy <= -SWIPE_THRESHOLD_PX) triggerEntry()
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (enteringRef.current || event.deltaY < 24) return
    event.preventDefault()
    triggerEntry()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (enteringRef.current) return
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowUp') return
    event.preventDefault()
    triggerEntry()
  }

  return (
    <main
      className={`mf-entry-scene${entering ? ' is-entering' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Tap to play MiniFugg"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div className="mf-entry-scene__stage">
        <div className="mf-entry-scene__city" aria-hidden="true">
          <PerspectiveTextureCanvas
            src={CITY_ART}
            className="mf-entry-scene__city-canvas"
            paused={entering}
            speed={116}
            slices={260}
            nearX={-0.16}
            farX={1.02}
            nearTop={-0.34}
            nearBottom={0.78}
            farTop={0.365}
            farBottom={0.425}
            xCurve={3.6}
            depthCurve={1.18}
          />
        </div>

        <div className="mf-entry-scene__carriage" aria-hidden="true">
          <img className="mf-entry-scene__wagon" src={WAGON_ART} alt="" draggable={false} decoding="sync" fetchPriority="high" />
          <FuggyEyes className="mf-entry-scene__fuggy-eyes" />
        </div>

        <div className="mf-entry-scene__hand-group" aria-hidden="true">
          <img className="mf-entry-scene__arm" src={arm} alt="" draggable={false} decoding="sync" fetchPriority="high" />
          <ProjectiveDomSurface
            className="mf-entry-scene__phone-projective"
            planeClassName="mf-entry-scene__phone-ui"
            quad={PHONE_SCREEN_QUAD}
            logicalWidth={56.28}
            logicalHeight={100}
          >
            <PhoneWelcomeScreen paused={entering} />
          </ProjectiveDomSurface>
        </div>

        <span className="mf-entry-scene__flash" aria-hidden="true" />
      </div>
    </main>
  )
}
