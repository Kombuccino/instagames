import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { DiscoveryCover } from './DiscoveryCover'
import './platformEntryScene.css'

type PlatformEntrySceneProps = {
  onLaunch: () => void
}

type EntryPhase = 'scene' | 'entering' | 'cover'

type PointerStart = {
  id: number
  x: number
  y: number
}

const ENTER_DURATION_MS = 860
const TAP_SLOP_PX = 12
const SWIPE_THRESHOLD_PX = 42
const COVER_ART = '/assets/imported/tetramindfck-welcome-v1-pulp-euro.webp'

export function PlatformEntryScene({ onLaunch }: PlatformEntrySceneProps) {
  const [phase, setPhase] = useState<EntryPhase>('scene')
  const phaseRef = useRef<EntryPhase>('scene')
  const pointerRef = useRef<PointerStart | null>(null)
  const timerRef = useRef<number | null>(null)

  const triggerEntry = useCallback(() => {
    if (phaseRef.current !== 'scene') return
    phaseRef.current = 'entering'
    setPhase('entering')
    timerRef.current = window.setTimeout(() => {
      phaseRef.current = 'cover'
      setPhase('cover')
      timerRef.current = null
    }, ENTER_DURATION_MS)
  }, [])

  useEffect(() => {
    document.title = 'MiniFugg'
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (phaseRef.current !== 'scene' || !event.isPrimary) return
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pointerRef.current
    if (!start || start.id !== event.pointerId) return
    pointerRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const distance = Math.hypot(dx, dy)
    if (distance <= TAP_SLOP_PX || dy <= -SWIPE_THRESHOLD_PX) triggerEntry()
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (phaseRef.current !== 'scene' || event.deltaY < 26) return
    event.preventDefault()
    triggerEntry()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (phaseRef.current !== 'scene') return
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowUp') return
    event.preventDefault()
    triggerEntry()
  }

  return (
    <main
      className={`mf-entry-scene is-${phase}`}
      data-phase={phase}
      role={phase === 'scene' ? 'button' : undefined}
      tabIndex={phase === 'scene' ? 0 : -1}
      aria-label={phase === 'scene' ? 'Enter MiniFugg' : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div className="mf-entry-scene__world" aria-hidden="true">
        <div className="mf-entry-scene__ceiling">
          <span className="is-light-a" />
          <span className="is-light-b" />
          <span className="is-panel" />
        </div>

        <div className="mf-entry-scene__window is-left">
          <i className="is-city-a" />
          <i className="is-city-b" />
          <i className="is-city-c" />
        </div>
        <div className="mf-entry-scene__window is-right">
          <i className="is-city-a" />
          <i className="is-city-b" />
          <i className="is-city-c" />
        </div>

        <div className="mf-entry-scene__door is-left" />
        <div className="mf-entry-scene__door is-right" />
        <div className="mf-entry-scene__pole is-left" />
        <div className="mf-entry-scene__pole is-right" />
        <div className="mf-entry-scene__floor" />
        <div className="mf-entry-scene__seat is-left" />
        <div className="mf-entry-scene__seat is-right" />

        <div className="mf-entry-passenger is-left">
          <span className="mf-entry-passenger__body" />
          <span className="mf-entry-passenger__neck" />
          <span className="mf-entry-passenger__head" />
          <span className="mf-entry-passenger__hair" />
        </div>
        <div className="mf-entry-passenger is-right">
          <span className="mf-entry-passenger__body" />
          <span className="mf-entry-passenger__neck" />
          <span className="mf-entry-passenger__head" />
          <span className="mf-entry-passenger__hair" />
        </div>

        <div className="mf-entry-fuggy">
          <span className="mf-entry-fuggy__ear is-left" />
          <span className="mf-entry-fuggy__ear is-right" />
          <span className="mf-entry-fuggy__head" />
          <span className="mf-entry-fuggy__mask" />
          <span className="mf-entry-fuggy__eye is-left" />
          <span className="mf-entry-fuggy__eye is-right" />
          <span className="mf-entry-fuggy__body" />
          <span className="mf-entry-fuggy__foot is-left" />
          <span className="mf-entry-fuggy__foot is-right" />
        </div>

        <div className="mf-entry-scene__arm">
          <span className="mf-entry-scene__sleeve" />
          <span className="mf-entry-scene__forearm" />
          <span className="mf-entry-scene__palm" />
        </div>

        <div className="mf-entry-scene__phone-frame">
          <span className="mf-entry-scene__phone-notch" />
        </div>
        <div className="mf-entry-scene__finger is-left" />
        <div className="mf-entry-scene__finger is-right" />
        <div className="mf-entry-scene__thumb" />
        <div className="mf-entry-scene__passing-light" />
      </div>

      <div className="mf-entry-scene__live-viewport">
        <DiscoveryCover
          title="TetraMindFck"
          art={COVER_ART}
          coinBalance={40}
          cost={2}
          interactive={phase === 'cover'}
          onPlay={phase === 'cover' ? onLaunch : undefined}
        />
      </div>

      <div className="mf-entry-scene__cue" aria-hidden="true">
        <span>⌃</span>
        <small>ENTER</small>
      </div>
    </main>
  )
}
