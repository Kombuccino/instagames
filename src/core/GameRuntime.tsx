import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSavedNickname } from './leaderboard'
import {
  addGameComment,
  getGameSocialStats,
  listGameComments,
  listLeaderboard,
  recordGamePlay,
  setGameBookmark,
  setGameLove,
  submitScore,
} from './platformApi'
import type { GameComment, GameSocialStats } from './social'
import type {
  GameFinishPayload,
  GameLeaderboardPeriod,
  InstagameDefinition,
} from './types'
import type { LeaderboardEntry } from './leaderboard'

type GameRuntimeProps = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  seed: number
  active: boolean
  mounted: boolean
}

type OpenSheet = 'help' | 'leaderboard' | 'comments' | 'creator' | null

const EMPTY_SOCIAL: GameSocialStats = {
  plays: 0,
  loves: 0,
  comments: 0,
  bookmarks: 0,
  loved: false,
  bookmarked: false,
}

function normalizeScore(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

function formatScore(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function formatCount(value: number) {
  if (value < 1_000) return String(value)
  if (value < 1_000_000) return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0).replace('.0', '')}k`
  return `${(value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0).replace('.0', '')}m`
}

function utcDayId() {
  return new Date().toISOString().slice(0, 10)
}

function isoWeekId(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = value.getUTCDay() || 7
  value.setUTCDate(value.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((value.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function periodsFor(game: InstagameDefinition): GameLeaderboardPeriod[] {
  const config = game.features?.leaderboard
  if (!config || !config.enabled) return []
  if (config.periods?.length) return config.periods
  if (config.scope) return [config.scope]
  return ['global']
}

function boardIdFor(period: GameLeaderboardPeriod) {
  if (period === 'daily') return `day:${utcDayId()}`
  if (period === 'weekly') return `week:${isoWeekId()}`
  return 'global'
}

function periodLabel(period: GameLeaderboardPeriod) {
  if (period === 'daily') return 'Jour'
  if (period === 'weekly') return 'Semaine'
  return 'Global'
}

export function GameRuntime({ game, catalog, seed, active, mounted }: GameRuntimeProps) {
  const [score, setScore] = useState(0)
  const [restartToken, setRestartToken] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const [sheet, setSheet] = useState<OpenSheet>(null)
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [submitted, setSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [social, setSocial] = useState<GameSocialStats>(EMPTY_SOCIAL)
  const [comments, setComments] = useState<GameComment[]>([])
  const [commentText, setCommentText] = useState('')
  const playRecorded = useRef(false)

  const Game = game.component
  const leaderboardConfig = game.features?.leaderboard || false
  const leaderboardEnabled = Boolean(leaderboardConfig && leaderboardConfig.enabled)
  const periods = useMemo(() => periodsFor(game), [game])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<GameLeaderboardPeriod>(periods[0] ?? 'global')
  const leaderboardLimit = leaderboardConfig ? leaderboardConfig.limit ?? 10 : 10
  const leaderboardSort = leaderboardConfig ? leaderboardConfig.sort ?? 'desc' : 'desc'
  const selectedBoardId = finished?.boardId ?? boardIdFor(leaderboardPeriod)
  const creatorGames = useMemo(
    () => game.author ? catalog.filter((candidate) => candidate.author === game.author) : [],
    [catalog, game.author],
  )

  const updateScore = useCallback((value: number) => setScore(normalizeScore(value)), [])
  const finish = useCallback((payload: GameFinishPayload) => {
    const next = { ...payload, score: normalizeScore(payload.score) }
    setScore(next.score)
    setFinished(next)
    setSubmitted(false)
  }, [])
  const session = useMemo(() => ({ setScore: updateScore, finish }), [finish, updateScore])

  const refreshSocial = useCallback(async () => {
    setSocial(await getGameSocialStats(game.id))
  }, [game.id])

  const refreshLeaderboard = useCallback(async () => {
    if (!leaderboardEnabled) return
    setLoadingLeaderboard(true)
    const entries = await listLeaderboard(game.id, selectedBoardId, leaderboardLimit, leaderboardSort)
    setLeaderboard(entries)
    setLoadingLeaderboard(false)
  }, [game.id, leaderboardEnabled, leaderboardLimit, leaderboardSort, selectedBoardId])

  const refreshComments = useCallback(async () => {
    setComments(await listGameComments(game.id, 50))
  }, [game.id])

  useEffect(() => {
    setScore(0)
    setFinished(null)
    setSubmitted(false)
    setSheet(null)
    setSocial(EMPTY_SOCIAL)
    setComments([])
    setCommentText('')
    playRecorded.current = false
    const nextPeriods = periodsFor(game)
    setLeaderboardPeriod(nextPeriods[0] ?? 'global')
    void refreshSocial()
  }, [game.id, refreshSocial, seed])

  useEffect(() => {
    if (!active || !mounted || playRecorded.current) return
    playRecorded.current = true
    void recordGamePlay(game.id).then(setSocial)
  }, [active, game.id, mounted])

  useEffect(() => {
    if (sheet === 'leaderboard') void refreshLeaderboard()
    if (sheet === 'comments') void refreshComments()
  }, [refreshComments, refreshLeaderboard, sheet])

  useEffect(() => {
    if (sheet === 'leaderboard') void refreshLeaderboard()
  }, [leaderboardPeriod, refreshLeaderboard, sheet])

  const replay = () => {
    setScore(0)
    setFinished(null)
    setSubmitted(false)
    setSheet(null)
    setRestartToken((value) => value + 1)
  }

  const submitFinishedScore = async () => {
    if (!finished || !leaderboardEnabled || submitted || !nickname.trim()) return
    const boardIds = finished.boardId ? [finished.boardId] : periods.map(boardIdFor)
    let firstEntry: LeaderboardEntry | null = null
    for (const boardId of boardIds) {
      const entry = await submitScore({
        gameId: game.id,
        boardId,
        nickname,
        score: finished.score,
        metadata: finished.metadata,
      })
      if (!firstEntry && entry) firstEntry = entry
    }
    if (!firstEntry) return
    setNickname(firstEntry.nickname)
    setSubmitted(true)
    await refreshLeaderboard()
  }

  const toggleLove = async () => setSocial(await setGameLove(game.id, !social.loved))
  const toggleBookmark = async () => setSocial(await setGameBookmark(game.id, !social.bookmarked))

  const postComment = async () => {
    const comment = await addGameComment(game.id, nickname, commentText)
    if (!comment) return
    setCommentText('')
    setComments((current) => [comment, ...current])
    await refreshSocial()
  }

  const loveEnabled = game.features?.love !== false
  const commentsEnabled = game.features?.comments !== false
  const bookmarkEnabled = game.features?.bookmark !== false

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
        <div className="game-identity">
          <div className="game-heading">
            <strong>{game.title}</strong>
            {game.author && (
              <button type="button" className="creator-link" onClick={() => setSheet('creator')}>@{game.author}</button>
            )}
          </div>
          <div className="game-subline">
            <span>{game.description}</span>
            <b>·</b>
            <span>{formatCount(social.plays)} plays</span>
          </div>
        </div>

        <nav className="game-actions" aria-label="Actions du jeu">
          {game.instructions && game.features?.help !== false && (
            <button type="button" onClick={() => setSheet('help')} aria-label="Règles du jeu">
              <span>≡</span><small>Règles</small>
            </button>
          )}
          {loveEnabled && (
            <button type="button" className={social.loved ? 'is-active' : ''} onClick={() => void toggleLove()} aria-label="Aimer">
              <span>♥</span><small>{formatCount(social.loves)}</small>
            </button>
          )}
          {commentsEnabled && (
            <button type="button" onClick={() => setSheet('comments')} aria-label="Commentaires">
              <span>◌</span><small>{formatCount(social.comments)}</small>
            </button>
          )}
          {bookmarkEnabled && (
            <button type="button" className={social.bookmarked ? 'is-active' : ''} onClick={() => void toggleBookmark()} aria-label="Mettre en favori">
              <span>▮</span><small>{social.bookmarked ? 'Sauvé' : 'Garder'}</small>
            </button>
          )}
        </nav>
      </header>

      <button
        type="button"
        className="score-chip"
        onClick={() => leaderboardEnabled && setSheet('leaderboard')}
        aria-label={leaderboardEnabled ? `Score ${score}, ouvrir le classement` : `Score ${score}`}
      >
        <span>score</span>
        <strong>{formatScore(score)}</strong>
      </button>

      {sheet && (
        <div className="platform-sheet-backdrop" onPointerDown={() => setSheet(null)}>
          <section className="platform-sheet" onPointerDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="platform-sheet-head">
              <div>
                <small>{game.title}</small>
                <strong>
                  {sheet === 'help' && 'Comment jouer'}
                  {sheet === 'leaderboard' && 'Classement'}
                  {sheet === 'comments' && 'Commentaires'}
                  {sheet === 'creator' && `@${game.author}`}
                </strong>
              </div>
              <button type="button" onClick={() => setSheet(null)} aria-label="Fermer">×</button>
            </div>

            {sheet === 'help' && game.instructions && (
              <div className="platform-help">
                <p>{game.instructions.goal}</p>
                <ol>{game.instructions.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
                {game.instructions.controls?.length ? (
                  <div className="platform-controls">
                    {game.instructions.controls.map((control) => <span key={control}>{control}</span>)}
                  </div>
                ) : null}
              </div>
            )}

            {sheet === 'leaderboard' && (
              <div className="platform-leaderboard">
                {periods.length > 1 && (
                  <div className="platform-tabs">
                    {periods.map((period) => (
                      <button
                        type="button"
                        className={leaderboardPeriod === period ? 'is-active' : ''}
                        onClick={() => setLeaderboardPeriod(period)}
                        key={period}
                      >
                        {periodLabel(period)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="platform-board-label">
                  <span>{periodLabel(leaderboardPeriod)} · {selectedBoardId}</span>
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

            {sheet === 'comments' && (
              <div className="platform-comments">
                <div className="platform-comment-form">
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value.slice(0, 20))}
                    placeholder="Pseudo"
                    maxLength={20}
                  />
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value.slice(0, 500))}
                    placeholder="Ton commentaire…"
                    maxLength={500}
                    rows={3}
                  />
                  <button type="button" onClick={() => void postComment()} disabled={!nickname.trim() || !commentText.trim()}>Commenter</button>
                </div>
                <div className="platform-comment-list">
                  {comments.length === 0 ? <p className="platform-muted">Aucun commentaire.</p> : comments.map((comment) => (
                    <article key={comment.id}>
                      <div><strong>@{comment.nickname}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div>
                      <p>{comment.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {sheet === 'creator' && (
              <div className="platform-creator">
                <p>{creatorGames.length} jeu{creatorGames.length > 1 ? 'x' : ''} publié{creatorGames.length > 1 ? 's' : ''} par @{game.author}.</p>
                <div className="platform-creator-games">
                  {creatorGames.map((creatorGame) => (
                    <article key={creatorGame.id}>
                      <strong>{creatorGame.title}</strong>
                      <span>{creatorGame.description}</span>
                    </article>
                  ))}
                </div>
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
              {leaderboardEnabled && <button type="button" onClick={() => setSheet('leaderboard')}>Classement</button>}
              <button type="button" className="is-primary" onClick={replay}>Rejouer</button>
            </div>
          </section>
        </div>
      )}

      <div className="swipe-hint" aria-hidden="true"><span>↑</span>swipe</div>
    </article>
  )
}
