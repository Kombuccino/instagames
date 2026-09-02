import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './homeSplash.css'

type HomeSplashProps = {
  onComplete: () => void
}

const EXIT_DURATION_MS = 440
const SWIPE_THRESHOLD_PX = 72
const MAX_DRAG_VH = 34

export function HomeSplash({ onComplete }: HomeSplashProps) {
  const pointerIdRef = useRef<number | null>(null)
  const startYRef = useRef(0)
  const dragYRef = useRef(0)
  const exitTimerRef = useRef<number | null>(null)
  const exitingRef = useRef(false)
  const [dragY, setDragY] = useState(0)
  const [exiting, setExiting] = useState(false)

  const finish = useCallback(() => {
    if (exitingRef.current) return
    exitingRef.current = true
    setExiting(true)
    exitTimerRef.current = window.setTimeout(onComplete, EXIT_DURATION_MS)
  }, [onComplete])

  useEffect(() => {
    document.title = 'MiniFugg'
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    }
  }, [])

  const resetDrag = useCallback(() => {
    dragYRef.current = 0
    setDragY(0)
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (exitingRef.current || !event.isPrimary) return
    pointerIdRef.current = event.pointerId
    startYRef.current = event.clientY
    dragYRef.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (exitingRef.current || pointerIdRef.current !== event.pointerId) return
    const maxDrag = window.innerHeight * (MAX_DRAG_VH / 100)
    const nextDrag = Math.min(Math.max(startYRef.current - event.clientY, 0), maxDrag)
    dragYRef.current = nextDrag
    setDragY(nextDrag)
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pointerIdRef.current = null
    if (dragYRef.current >= SWIPE_THRESHOLD_PX) finish()
    else resetDrag()
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 52) finish()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp') {
      event.preventDefault()
      finish()
    }
  }

  const style = {
    '--mf-home-shell-y': `${dragY * -0.34}px`,
    '--mf-home-scene-y': `${dragY * -0.66}px`,
  } as CSSProperties

  return (
    <div
      className={`mf-home-splash${exiting ? ' is-exiting' : ''}${dragY > 0 ? ' is-dragging' : ''}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label="Swipe up to enter MiniFugg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div className="mf-home-splash__backdrop" aria-hidden="true" />
      <div className="mf-home-splash__scene" aria-hidden="true">
        <img
          className="mf-home-splash__art"
          src="/assets/minifugg-home-pixel.webp"
          alt=""
          draggable={false}
        />
        <div className="mf-home-splash__lamp-glow" />
        <div className="mf-home-splash__crt-glow" />
        <div className="mf-home-splash__swipe-glow" />
        <div className="mf-home-splash__swipe-pulse">
          <span />
          <span />
        </div>
        <div className="mf-home-splash__scanline" />
      </div>
      <span className="mf-home-splash__sr-only">Swipe up to play</span>
    </div>
  )
}
