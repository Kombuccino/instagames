import { useEffect, useMemo, useState } from 'react'
import { miniFuggAudio } from '../audio'
import { gameRegistry } from './gameRegistry'
import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT } from './runtime/gameRuntimePolicy'
import type { GameFinishPayload } from './types'

type LineFuggLabScenario = 'initial' | 'drag' | 'after-line' | 'three-lines'

type StagePoint = { x: number; y: number }

function requestedGameId() {
  if (typeof window === 'undefined') return ''
  return new URL(window.location.href).searchParams.get('game')?.trim() ?? ''
}

function requestedLineFuggScenario(): LineFuggLabScenario | null {
  if (typeof window === 'undefined') return null
  const query = new URL(window.location.href).searchParams
  if (query.get('lab') !== 'gameplay-runtime' || query.get('game') !== 'linefugg') return null
  const value = query.get('scenario')
  return value === 'initial' || value === 'drag' || value === 'after-line' || value === 'three-lines' ? value : null
}

function stageToClient(canvas: HTMLCanvasElement, point: StagePoint) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: rect.left + point.x / MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.width * rect.width,
    y: rect.top + point.y / MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.height * rect.height,
  }
}

function emitPointer(canvas: HTMLCanvasElement, type: 'pointerdown' | 'pointermove' | 'pointerup', point: StagePoint, buttons: number) {
  const client = stageToClient(canvas, point)
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 91,
    pointerType: 'mouse',
    isPrimary: true,
    button: type === 'pointerdown' ? 0 : -1,
    buttons,
    clientX: client.x,
    clientY: client.y,
  })
  canvas.dispatchEvent(event)
  if (type === 'pointerup') window.dispatchEvent(new PointerEvent(type, event))
}

function scheduleLine(canvas: HTMLCanvasElement, from: StagePoint, to: StagePoint, delay: number, timers: number[]) {
  timers.push(window.setTimeout(() => emitPointer(canvas, 'pointerdown', from, 1), delay))
  timers.push(window.setTimeout(() => emitPointer(canvas, 'pointermove', to, 1), delay + 90))
  timers.push(window.setTimeout(() => emitPointer(canvas, 'pointerup', to, 0), delay + 180))
}

/** Isolated, same-origin runtime used inside the calibration and Production Labs. */
export function GameplayCalibrationRuntime() {
  const game = useMemo(() => gameRegistry.find((entry) => entry.id === requestedGameId()), [])
  const scenario = useMemo(requestedLineFuggScenario, [])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const Game = game?.component

  useEffect(() => {
    miniFuggAudio.setMuted(true)
    return () => miniFuggAudio.setMuted(false)
  }, [])

  useEffect(() => {
    if (game?.id !== 'linefugg' || !scenario || scenario === 'initial') return
    let cancelled = false
    const timers: number[] = []
    let attempts = 0

    const prepare = () => {
      if (cancelled) return
      const canvas = document.querySelector<HTMLCanvasElement>('.mf-gameplay-runtime .game-surface canvas')
      if (!canvas) {
        attempts += 1
        if (attempts < 40) timers.push(window.setTimeout(prepare, 100))
        return
      }

      // LineFugg remains on its approved legacy 390 × 844 coordinates until its dedicated geometry migration.
      // L1: long diagonal. L2: vertical. L3: horizontal crossing L1 and L2 once each.
      const line1 = { from: { x: 103, y: 408 }, to: { x: 287, y: 224 } }
      const line2 = { from: { x: 103, y: 178 }, to: { x: 103, y: 362 } }
      const line3 = { from: { x: 57, y: 270 }, to: { x: 241, y: 270 } }

      if (scenario === 'drag') {
        timers.push(window.setTimeout(() => emitPointer(canvas, 'pointerdown', line1.from, 1), 280))
        timers.push(window.setTimeout(() => emitPointer(canvas, 'pointermove', line1.to, 1), 420))
        return
      }

      scheduleLine(canvas, line1.from, line1.to, 260, timers)
      if (scenario === 'three-lines') {
        scheduleLine(canvas, line2.from, line2.to, 1250, timers)
        scheduleLine(canvas, line3.from, line3.to, 2240, timers)
      }
    }

    timers.push(window.setTimeout(prepare, 150))
    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [game?.id, scenario])

  if (!game || !Game) return <main className="mf-gameplay-runtime-error">Jeu introuvable.</main>

  return (
    <main className="mf-gameplay-runtime" data-testid="gameplay-runtime" data-game-id={game.id} data-lab-scenario={scenario ?? undefined}>
      <div className="game-card">
        <div className="game-surface">
          <Game
            active
            seed={20260913}
            restartToken={0}
            session={{ setScore, finish: (payload) => { setScore(payload.score); setFinished(payload) } }}
          />
        </div>
        <div className="mf-gameplay-runtime__readout" aria-hidden="true">
          <span>{game.title}</span><b>{finished ? `FIN · ${finished.score}` : score}</b>
        </div>
      </div>
    </main>
  )
}
