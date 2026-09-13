import { useEffect, useMemo, useState } from 'react'
import { miniFuggAudio } from '../audio'
import { gameRegistry } from './gameRegistry'
import type { GameFinishPayload } from './types'

function requestedGameId() {
  if (typeof window === 'undefined') return ''
  return new URL(window.location.href).searchParams.get('game')?.trim() ?? ''
}

/** Isolated, same-origin runtime used inside the calibration lab's exact viewport iframe. */
export function GameplayCalibrationRuntime() {
  const game = useMemo(() => gameRegistry.find((entry) => entry.id === requestedGameId()), [])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const Game = game?.component

  useEffect(() => {
    miniFuggAudio.setMuted(true)
    return () => miniFuggAudio.setMuted(false)
  }, [])

  if (!game || !Game) return <main className="mf-gameplay-runtime-error">Jeu introuvable.</main>

  return (
    <main className="mf-gameplay-runtime" data-testid="gameplay-runtime" data-game-id={game.id}>
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
