import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'

function seededUnit(seed: number) {
  const value = Math.sin(seed) * 10_000
  return value - Math.floor(value)
}

export function NeonTap({ active, seed, session }: GameComponentProps) {
  const [score, setScore] = useState(0)
  const x = 20 + seededUnit(seed) * 60
  const y = 24 + seededUnit(seed + 1) * 50

  useEffect(() => {
    if (!active) return
    session.setScore(score)
  }, [active, score, session])

  const tap = () => {
    if (!active) return
    setScore((value) => value + 1)
  }

  return (
    <button className="demo-game demo-neon" onClick={tap} aria-label="Tap to score">
      <div className="demo-orb" style={{ left: `${x}%`, top: `${y}%` }} />
      <div className="demo-center-copy">
        <b>TAP THE VOID</b>
        <span>tap anywhere</span>
      </div>
    </button>
  )
}

export function HoldZone({ active, seed, session }: GameComponentProps) {
  const [score, setScore] = useState(0)
  const timer = useRef<number | null>(null)
  const rotation = Math.round(seededUnit(seed) * 160 - 80)

  useEffect(() => {
    session.setScore(score)
  }, [score, session])

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
  }

  const start = () => {
    if (!active || timer.current !== null) return
    timer.current = window.setInterval(() => setScore((value) => value + 1), 40)
  }

  useEffect(() => stop, [])

  return (
    <button
      className="demo-game demo-hold"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
    >
      <div className="hold-ring" style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}>
        <i />
      </div>
      <div className="demo-center-copy">
        <b>HOLD</b>
        <span>don't let go</span>
      </div>
    </button>
  )
}

export function DriftDot({ active, seed, session }: GameComponentProps) {
  const [score, setScore] = useState(0)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const phase = useMemo(() => seededUnit(seed) * Math.PI * 2, [seed])

  useEffect(() => {
    if (!active) return
    let frame = 0
    const started = performance.now()
    const loop = (now: number) => {
      const time = (now - started) / 1000
      setPosition({
        x: 50 + Math.sin(time * 1.6 + phase) * 28,
        y: 50 + Math.cos(time * 2.1 + phase) * 25,
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [active, phase])

  useEffect(() => {
    session.setScore(score)
  }, [score, session])

  return (
    <button
      className="demo-game demo-drift"
      onClick={() => active && setScore((value) => value + 10)}
    >
      <div className="drift-grid" />
      <div className="drift-dot" style={{ left: `${position.x}%`, top: `${position.y}%` }} />
      <div className="demo-center-copy demo-low-copy">
        <b>CATCH</b>
        <span>hit the moving signal</span>
      </div>
    </button>
  )
}
