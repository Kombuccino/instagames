import { useCallback, useMemo, useState } from 'react'
import type { InstagameDefinition } from './types'

type GameRuntimeProps = {
  game: InstagameDefinition
  seed: number
  active: boolean
  mounted: boolean
}

export function GameRuntime({ game, seed, active, mounted }: GameRuntimeProps) {
  const [score, setScore] = useState(0)
  const Game = game.component
  const updateScore = useCallback((value: number) => setScore(Math.max(0, Math.round(value))), [])
  const session = useMemo(() => ({ setScore: updateScore }), [updateScore])

  return (
    <article className="game-card" aria-label={game.title}>
      <div className="game-surface">
        {mounted ? (
          <Game active={active} seed={seed} session={session} />
        ) : (
          <div className="game-placeholder" aria-hidden="true" />
        )}
      </div>

      <header className="game-topbar">
        <div className="brand">MINIFUGG</div>
        <div className="roulette-pill"><span /> Roulette</div>
      </header>

      <footer className="game-meta">
        <div>
          <strong>{game.title}</strong>
          <p>{game.description}</p>
          {game.author && <small>@{game.author}</small>}
        </div>
        <div className="score-chip" aria-label={`Score ${score}`}>
          <span>score</span>
          <strong>{score}</strong>
        </div>
      </footer>

      <div className="swipe-hint" aria-hidden="true">
        <span>↑</span>
        swipe
      </div>
    </article>
  )
}
