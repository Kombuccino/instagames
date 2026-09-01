import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSavedNickname } from './leaderboard'
import { listLeaderboard, submitScore } from './platformApi'
import type { GameFinishPayload, InstagameDefinition } from './types'
import type { LeaderboardEntry } from './leaderboard'

type GameRuntimeProps = {
  game: InstagameDefinition
  seed: number
  active: boolean
  mounted: boolean
}

type OpenSheet = 'help' | 'leaderboard' | null

function normalizeScore(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

function formatScore(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function utcDayId() {
  return new Date().toISOString().slice(0, 10)
}

export function GameRuntime({ game, seed, active, mounted }: GameRuntimeProps) {
  const [score, setScore] = useState(0)
  const [restartToken, setRestartToken] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const [sheet, setSheet] = useState<OpenSheet>(null)
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [submitted, setSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)

  const Game = game.component
  const leaderboardConfig = game.features?.leaderboard || false
  const leaderboardEnabled = Boolean(leaderboardConfig && leaderboardConfig.enabled)
  const defaultBoardId = leaderboardConfig && leaderboardConfig.scope === 'daily' ? utcDayId() : 'global'
  const boardId = finished?.boardId ?? defaultBoardId
  const leaderboardLimit = leaderboardConfig ? leaderboardConfig.limit ?? 10 : 10
  const leaderboardSort = leaderboardConfig ? leaderboardConfig.sort ?? 'desc' : 'desc'

  const updateScore = useCallback((value: number) => setScore(normalizeScore(value)), [])
  const finish = useCallback((payload: GameFinishPayload) => {
    const next = { ...payload, score: normalizeScore(payload.score) }
    setScore(next.score)
    setFinished(next)
    setSubmitted(false)
  }, [])
  const session = useMemo(() => ({ setScore: updateScore, finish }), [finish, updateScore])

  const refreshLeaderboard = useCallback(async () => {
    if (!leaderboardEnabled) return
    setLoadingLeaderboard(true)
    const entries = await listLeaderboard(game.id, boardId, leaderboardLimit, leaderboardSort)
    setLeaderboard(entries)
    setLoadingLeaderboard(false)
  }, [boardId, game.id, leaderboardEnabled, leaderboardLimit, leaderboardSort])

  useEffect(() => {
    setScore(0)
    setFinished(null)
    setSubmitted(false)
    setSheet(null)
  }, [game.id, seed])

  useEffect(() => {
    if (sheet === 'leaderboard') void refreshLeaderboard()
  }, [refreshLeaderboard, sheet])

  const openLeaderboard = () => setSheet('leaderboard')

  const replay = () => {
    setScore(0)
    setFinished(null)
    setSubmitted(false)
    setSheet(null)
    setRestartToken((value) => value + 1)
  }

  const submitFinishedScore = async () => {
    if (!finished || !leaderboardEnabled || submitted || !nickname.trim()) return
    const entry = await submitScore({
      gameId: game.id,
      boardId,
      nickname,
      score: finished.score,
      metadata: finished.metadata,
    })
    if (!entry) return
    setNickname(entry.nickname)
    setSubmitted(true)
    await refreshLeaderboard()
  }

  return (
    <article className="game-card" aria-label={game.title}>
      <div className="game-surface">
        {mounted ? (
          <Game
            active={active && !finished}
            seed={seed}
            restartToken={restartToken}
            session={session}
          />
        ) : (
          <div className="game-placeholder" aria-hidden="true" />
        )}
      </div>

      <header className="game-topbar">
        <div className="brand">MINIFUGG</div>
      </header>

      <aside className="game-actions" aria-label="Options du jeu">
        {game.instructions && game.features?.help !== false && (
          <button type="button" onClick={() => setSheet('help')} aria-label="Règles du jeu">?</button>
        )}
        {leaderboardEnabled && (
          <button type="button" onClick={openLeaderboard} aria-label="Classement">★</button>
        )}
      </aside>

      <footer className="game-meta">
        <div>
          <strong>{game.title}</strong>
          <p>{game.description}</p>
          {game.author && <small>@{game.author}</small>}
        </div>
        <div className="score-chip" aria-label={`Score ${score}`}>
          <span>score</span>
          <strong>{formatScore(score)}</strong>
        </div>
      </footer>

      {sheet && (
        <div className="platform-sheet-backdrop" onPointerDown={() => setSheet(null)}>
          <section className="platform-sheet" onPointerDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="platform-sheet-head">
              <div>
                <small>{game.title}</small>
                <strong>{sheet === 'help' ? 'Comment jouer' : 'Classement'}</strong>
              </div>
              <button type="button" onClick={() => setSheet(null)} aria-label="Fermer">×</button>
            </div>

            {sheet === 'help' && game.instructions && (
              <div className="platform-help">
                <p>{game.instructions.goal}</p>
                <ol>
                  {game.instructions.rules.map((rule) => <li key={rule}>{rule}</li>)}
                </ol>
                {game.instructions.controls?.length ? (
                  <div className="platform-controls">
                    {game.instructions.controls.map((control) => <span key={control}>{control}</span>)}
                  </div>
                ) : null}
              </div>
            )}

            {sheet === 'leaderboard' && (
              <div className="platform-leaderboard">
                <div className="platform-board-label">
                  <span>{leaderboardConfig && leaderboardConfig.scope === 'daily' ? `Aujourd’hui · ${boardId}` : 'Tous les temps'}</span>
                  <button type="button" onClick={() => void refreshLeaderboard()}>Actualiser</button>
                </div>
                {loadingLeaderboard ? (
                  <p className="platform-muted">Chargement…</p>
                ) : leaderboard.length === 0 ? (
                  <p className="platform-muted">Aucun score pour le moment.</p>
                ) : (
                  <ol>
                    {leaderboard.map((entry, index) => (
                      <li key={entry.id}>
                        <span><b>{index + 1}</b>{entry.nickname}</span>
                        <strong>{formatScore(entry.score)}</strong>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {finished && (
        <div className="platform-finish" role="dialog" aria-modal="true" aria-label="Partie terminée">
          <section className="platform-finish-card">
            <small>{game.title}</small>
            <span>Score final</span>
            <strong>{formatScore(finished.score)}</strong>

            {leaderboardEnabled && (
              <div className="platform-score-submit">
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value.slice(0, 20))}
                  placeholder="Ton pseudo"
                  maxLength={20}
                  autoCapitalize="off"
                  autoComplete="nickname"
                  disabled={submitted}
                  aria-label="Pseudo"
                />
                <button type="button" onClick={() => void submitFinishedScore()} disabled={!nickname.trim() || submitted}>
                  {submitted ? 'Enregistré' : 'Enregistrer'}
                </button>
              </div>
            )}

            <div className="platform-finish-actions">
              {leaderboardEnabled && <button type="button" onClick={openLeaderboard}>Classement</button>}
              <button type="button" className="is-primary" onClick={replay}>Rejouer</button>
            </div>
          </section>
        </div>
      )}

      <div className="swipe-hint" aria-hidden="true">
        <span>↑</span>
        swipe
      </div>
    </article>
  )
}
