import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  onLaunch: (arm: string) => void
  handoff?: 'default' | 'home-bis'
}

type PointerStart = {
  id: number
  x: number
  y: number
}

const ENTER_DURATION_MS = 860
const HOME_BIS_ENTER_DURATION_MS = 1700
const TAP_SLOP_PX = 14
const SWIPE_THRESHOLD_PX = 42
const ASSET_ROOT = '/assets/imported/platform/entry-scenes/metro-moment-v1'
const WAGON_ART = `${ASSET_ROOT}/wagon-reader-fuggy.png`
const WAGON_WIDE_ROOT = '/assets/generated/platform/entry-scenes/metro-wide-tests'
const CITY_ART = `${ASSET_ROOT}/city-loop-sunset.png`
const ARM_VARIANTS = Array.from({ length: 8 }, (_, index) => `${ASSET_ROOT}/arms/arm-${String(index + 1).padStart(2, '0')}.png`)
const ARM_STORAGE_KEY = 'minifugg:entry-arm:v1'

type Matrix3 = [number, number, number, number, number, number, number, number, number]

function rectangleToQuad(width: number, height: number, quad: readonly (readonly [number, number])[]): Matrix3 | null {
  const [[tlx, tly], [trx, try_], [brx, bry], [blx, bly]] = quad
  const dx1 = trx - brx
  const dx2 = blx - brx
  const dx3 = tlx - trx + brx - blx
  const dy1 = try_ - bry
  const dy2 = bly - bry
  const dy3 = tly - try_ + bry - bly
  let g = 0
  let h = 0

  if (Math.abs(dx3) >= 1e-8 || Math.abs(dy3) >= 1e-8) {
    const denominator = dx1 * dy2 - dx2 * dy1
    if (Math.abs(denominator) < 1e-8) return null
    g = (dx3 * dy2 - dx2 * dy3) / denominator
    h = (dx1 * dy3 - dx3 * dy1) / denominator
  }

  return [
    (trx - tlx + g * trx) / width,
    (blx - tlx + h * blx) / height,
    tlx,
    (try_ - tly + g * try_) / width,
    (bly - tly + h * bly) / height,
    tly,
    g / width,
    h / height,
    1,
  ]
}

function multiply3(a: Matrix3, b: Matrix3): Matrix3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ]
}

function inverse3(m: Matrix3): Matrix3 | null {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h
  const B = c * h - b * i
  const C = b * f - c * e
  const D = f * g - d * i
  const E = a * i - c * g
  const F = c * d - a * f
  const G = d * h - e * g
  const H = b * g - a * h
  const I = a * e - b * d
  const determinant = a * A + b * D + c * G
  if (Math.abs(determinant) < 1e-8) return null
  return [A / determinant, B / determinant, C / determinant, D / determinant, E / determinant, F / determinant, G / determinant, H / determinant, I / determinant]
}

function quadToQuadMatrix(source: readonly (readonly [number, number])[], destination: readonly (readonly [number, number])[], width: number, height: number) {
  const sourceMatrix = rectangleToQuad(width, height, source)
  const destinationMatrix = rectangleToQuad(width, height, destination)
  if (!sourceMatrix || !destinationMatrix) return 'none'
  const inverseSource = inverse3(sourceMatrix)
  if (!inverseSource) return 'none'
  const [a, b, c, d, e, f, g, h, i] = multiply3(destinationMatrix, inverseSource)
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,${i})`
}

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

export function PlatformEntryScene({ onLaunch, handoff = 'default' }: PlatformEntrySceneProps) {
  const [entering, setEntering] = useState(false)
  const [arm] = useState(chooseArm)
  const [wideWagonVariant] = useState(() => {
    if (typeof window === 'undefined') return 'b'
    return new URL(window.location.href).searchParams.get('metro') === 'a' ? 'a' : 'b'
  })
  const enteringRef = useRef(false)
  const pointerRef = useRef<PointerStart | null>(null)
  const timerRef = useRef<number | null>(null)
  const sceneStartedAtRef = useRef(typeof performance === 'undefined' ? 0 : performance.now())
  const musicRef = useRef<PlatformEntryMusicController | null>(null)
  const phoneRigRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (handoff !== 'home-bis') return
    const rig = phoneRigRef.current
    if (!rig) return

    const updateHandoffTransform = () => {
      const width = rig.offsetWidth
      const height = rig.offsetHeight
      if (width <= 0 || height <= 0) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      if (viewportWidth <= 760) {
        rig.style.removeProperty('--mf-entry-final-transform')
        return
      }

      const layoutWidth = Math.min(viewportWidth, viewportHeight * 1.7768)
      const layoutLeft = (viewportWidth - layoutWidth) / 2
      const rightInset = layoutWidth * (viewportWidth <= 1050 ? 0.015 : 0.055)
      const masterScale = viewportHeight / 662
      const masterWidth = 390 * masterScale
      const masterHeight = 844 * masterScale
      const wrapLeft = layoutLeft + layoutWidth - rightInset - masterWidth
      const wrapTop = -91 * masterScale
      const bezel = 6
      const targetLeft = wrapLeft + bezel
      const targetTop = wrapTop + bezel
      const targetRight = wrapLeft + masterWidth - bezel
      const targetBottom = wrapTop + masterHeight - bezel
      const rigRect = rig.getBoundingClientRect()
      const source = PHONE_SCREEN_QUAD.map(([x, y]) => [x * width, y * height] as const)
      const destination = [
        [targetLeft - rigRect.left, targetTop - rigRect.top],
        [targetRight - rigRect.left, targetTop - rigRect.top],
        [targetRight - rigRect.left, targetBottom - rigRect.top],
        [targetLeft - rigRect.left, targetBottom - rigRect.top],
      ] as const

      const transform = quadToQuadMatrix(source, destination, width, height)
      rig.style.setProperty('--mf-entry-final-transform', transform)
      document.documentElement.style.setProperty('--mf-entry-home-final-transform', transform)
    }

    const observer = new ResizeObserver(updateHandoffTransform)
    observer.observe(rig)
    window.addEventListener('resize', updateHandoffTransform)
    updateHandoffTransform()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHandoffTransform)
    }
  }, [handoff])

  const triggerEntry = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true
    const duration = handoff === 'home-bis' ? HOME_BIS_ENTER_DURATION_MS : ENTER_DURATION_MS
    musicRef.current?.fadeOut(duration / 1000)
    setEntering(true)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      onLaunch(arm)
    }, duration)
  }, [arm, handoff, onLaunch])

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
      className={`mf-entry-scene${handoff === 'home-bis' ? ' is-home-bis-handoff' : ''}${entering ? ' is-entering' : ''}`}
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
          {handoff === 'home-bis' ? (
            <picture>
              <source media="(min-width: 761px)" srcSet={`${WAGON_WIDE_ROOT}/metro-wide-${wideWagonVariant}.webp`} type="image/webp" />
              <source media="(min-width: 761px)" srcSet={`${WAGON_WIDE_ROOT}/metro-wide-${wideWagonVariant}.png`} type="image/png" />
              <img className="mf-entry-scene__wagon mf-entry-scene__wagon--wide" src={WAGON_ART} alt="" draggable={false} decoding="sync" />
            </picture>
          ) : (
            <img className="mf-entry-scene__wagon" src={WAGON_ART} alt="" draggable={false} decoding="sync" />
          )}
          <FuggyEyes className="mf-entry-scene__fuggy-eyes" />
        </div>

        {handoff === 'home-bis' && <span className="mf-entry-scene__handoff-blackout" aria-hidden="true" />}

        <div ref={phoneRigRef} className="mf-entry-scene__phone-rig" aria-hidden="true">
          <div className="mf-entry-scene__hand-group">
            <img className="mf-entry-scene__arm" src={arm} alt="" draggable={false} decoding="sync" />
            <ProjectiveDomSurface
              className="mf-entry-scene__phone-projective"
              planeClassName="mf-entry-scene__phone-ui"
              quad={PHONE_SCREEN_QUAD}
              logicalWidth={56.28}
              logicalHeight={100}
            >
              <PhoneWelcomeScreen paused={entering} />
              {handoff === 'home-bis' && <span className="mf-entry-scene__loading">LOADING<span aria-hidden="true">•••</span></span>}
            </ProjectiveDomSurface>
          </div>
        </div>

        <span className="mf-entry-scene__flash" aria-hidden="true" />
      </div>
    </main>
  )
}
