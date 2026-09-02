import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getSavedNickname, saveNickname } from './leaderboard'
import {
  addGameComment,
  getGameSocialStats,
  getMyProfile,
  listGameComments,
  listLeaderboard,
  recordGamePlay,
  setGameBookmark,
  setGameLove,
  submitRunScore,
  updateMyProfile,
  type PlatformProfile,
} from './platformApi'
import type { GameComment, GameSocialStats } from './social'
import type { GameFinishPayload, GameLeaderboardPeriod, InstagameDefinition } from './types'
import type { LeaderboardEntry } from './leaderboard'

type GameRuntimeProps = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  seed: number
  active: boolean
  mounted: boolean
}

type OpenSheet = 'help' | 'leaderboard' | 'comments' | 'creator' | 'profile' | null
type IconName = 'rules' | 'heart' | 'comment' | 'bookmark' | 'profile' | 'close'

const EMPTY_SOCIAL: GameSocialStats = {
  plays: 0,
  loves: 0,
  comments: 0,
  bookmarks: 0,
  loved: false,
  bookmarked: false,
}

const PROFILE_ICONS = ['🐸', '👾', '🦷', '🍕', '🦄', '🧠', '👻', '🐙', '🦖', '🤖', '🍄', '🦝']

function randomProfileIcon(id?: string) {
  if (!id) return '👾'
  let hash = 0
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  return PROFILE_ICONS[hash % PROFILE_ICONS.length]
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

function CoreIcon({ name, filled = false }: { name: IconName, filled?: boolean }) {
  let content: ReactNode

  if (name === 'heart') {
    content = <path d="M12 20.3s-7.2-4.4-9.5-8.6C.5 8 2.1 4.5 5.8 4.1c2.1-.2 4.1.8 5.2 2.5 1.1-1.7 3.1-2.7 5.2-2.5 3.7.4 5.3 3.9 3.3 7.6-2.3 4.2-9.5 8.6-9.5 8.6Z" />
  } else if (name === 'comment') {
    content = <path d="M20.5 11.4a8.4 8.4 0 0 1-8.7 8.1 9.4 9.4 0 0 1-3.2-.6L4 20l1.4-3.7a7.7 7.7 0 0 1-1.9-5.1A8.4 8.4 0 0 1 12.2 3a8.4 8.4 0 0 1 8.3 8.4Z" />
  } else if (name === 'bookmark') {
    content = <path d="M6.4 3.2h11.2c.8 0 1.4.6 1.4 1.4v16.2l-7-4.5-7 4.5V4.6c0-.8.6-1.4 1.4-1.4Z" />
  } else if (name === 'profile') {
    content = <><circle cx="12" cy="8" r="3.3" /><path d="M5.2 20c.7-4 3-6 6.8-6s6.1 2 6.8 6" /></>
  } else if (name === 'rules') {
    content = <><circle cx="12" cy="12" r="9" /><path d="M12 10.5v6" /><circle cx="12" cy="7.4" r=".7" className="icon-dot" /></>
  } else {
    content = <><path d="M5 5l14 14" /><path d="M19 5 5 19" /></>
  }

  return (
    <svg className="core-icon" viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'}>
      {content}
    </svg>
  )
}

export function GameRuntimeV2({ game, catalog, seed, active, mounted }: GameRuntimeProps) {
  const [score, setScore] = useState(0)
  const [restartToken, setRestartToken] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const [finishGateOpen, setFinishGateOpen] = useState(false)
  const [sheet, setSheet] = useState<OpenSheet>(null)
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [submitted, setSubmitted] = useState(false)
  const [submittingScore, setSubmittingScore] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<LeaderboardEntry | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [social, setSocial] = useState<GameSocialStats>(EMPTY_SOCIAL)
  const [comments, setComments] = useState<GameComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [profile, setProfile] = useState<PlatformProfile | null>(null)
  const [profileNickname, setProfileNickname] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const playRecorded = useRef(false)

  const Game = game.component
  const orientation = game.orientation ?? 'portrait'
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
  const favoriteGames = useMemo(() => {
    const ids = new Set(profile?.bookmarks.map((bookmark) => bookmark.gameId) ?? [])
    return catalog.filter((candidate) => ids.has(candidate.id))
  }, [catalog, profile])

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

  const refreshProfile = useCallback(async () => {
    const next = await getMyProfile()
    setProfile(next)
    const savedNickname = (next.displayName ?? '').trim()
    const nextNickname = savedNickname || nickname
    setProfileNickname(nextNickname)
    if (savedNickname && savedNickname !== nickname) {
      setNickname(savedNickname)
      saveNickname(savedNickname)
    }
    setProfileMessage('')
  }, [nickname])

  const updateScore = useCallback((value: number) => setScore(normalizeScore(value)), [])
  const finish = useCallback((payload: GameFinishPayload) => {
    const next = { ...payload, score: normalizeScore(payload.score) }
    setScore(next.score)
    setFinished(next)
    setSubmitted(false)
    setSubmittingScore(false)
    setCurrentEntry(null)
    setFinishGateOpen(false)
    setSheet(null)
  }, [])
  const session = useMemo(() => ({ setScore: updateScore, finish }), [finish, updateScore])

  const submitFinishedScore = useCallback(async (name: string, openLadder = true) => {
    if (!finished || !leaderboardEnabled || submitted || submittingScore || !name.trim()) return null
    setSubmittingScore(true)
    const cleanName = name.trim().slice(0, 20)
    const entry = await submitRunScore({
      gameId: game.id,
      nickname: cleanName,
      score: finished.score,
      periods,
      boardId: finished.boardId,
      metadata: finished.metadata,
    })
    setSubmittingScore(false)
    if (!entry) return null
    setNickname(entry.nickname)
    saveNickname(entry.nickname)
    setSubmitted(true)
    setCurrentEntry(entry)
    await refreshLeaderboard()
    if (openLadder) setSheet('leaderboard')
    return entry
  }, [finished, game.id, leaderboardEnabled, periods, refreshLeaderboard, submitted, submittingScore])

  useEffect(() => {
    setScore(0)
    setFinished(null)
    setFinishGateOpen(false)
    setSubmitted(false)
    setSubmittingScore(false)
    setCurrentEntry(null)
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
    if (sheet === 'profile') void refreshProfile()
  }, [refreshComments, refreshLeaderboard, refreshProfile, sheet])

  useEffect(() => {
    if (!finished) return
    const timer = window.setTimeout(() => setFinishGateOpen(true), 1000)
    return () => window.clearTimeout(timer)
  }, [finished])

  useEffect(() => {
    if (!finishGateOpen || !finished || !leaderboardEnabled || submitted) return
    let cancelled = false
    void (async () => {
      let knownNickname = nickname.trim()
      if (!knownNickname) {
        const nextProfile = await getMyProfile()
        if (cancelled) return
        setProfile(nextProfile)
        knownNickname = (nextProfile.displayName ?? '').trim()
        if (knownNickname) {
          setNickname(knownNickname)
          saveNickname(knownNickname)
        }
      }
      if (knownNickname && !cancelled) await submitFinishedScore(knownNickname, true)
    })()
    return () => { cancelled = true }
    // The gate transition intentionally triggers this flow once per finished run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishGateOpen, finished, leaderboardEnabled])

  const replay = () => {
    setScore(0)
    setFinished(null)
    setFinishGateOpen(false)
    setSubmitted(false)
    setSubmittingScore(false)
    setCurrentEntry(null)
    setSheet(null)
    setRestartToken((value) => value + 1)
  }

  const toggleLove = async () => setSocial(await setGameLove(game.id, !social.loved))
  const toggleBookmark = async () => setSocial(await setGameBookmark(game.id, !social.bookmarked))

  const postComment = async () => {
    const cleanNickname = nickname.trim().slice(0, 20)
    if (cleanNickname) {
      saveNickname(cleanNickname)
      void updateMyProfile({ displayName: cleanNickname })
    }
    const comment = await addGameComment(game.id, cleanNickname, commentText)
    if (!comment) return
    setCommentText('')
    setComments((current) => [comment, ...current])
    await refreshSocial()
  }

  const saveProfile = async () => {
    const cleanNickname = profileNickname.trim().slice(0, 20)
    if (!cleanNickname) return
    setSavingProfile(true)
    setProfileMessage('')
    const saved = await updateMyProfile({
      displayName: cleanNickname,
      handle: null,
      bio: null,
      avatarUrl: null,
    })
    setSavingProfile(false)
    if (!saved) {
      setProfileMessage("Impossible d'enregistrer le pseudo.")
      return
    }
    const next = { ...saved, bookmarks: saved.bookmarks.length ? saved.bookmarks : profile?.bookmarks ?? [] }
    setProfile(next)
    setNickname(cleanNickname)
    setProfileNickname(cleanNickname)
    saveNickname(cleanNickname)
    setProfileMessage('Pseudo enregistré.')
  }

  const registerFirstScore = async () => {
    const cleanNickname = nickname.trim().slice(0, 20)
    if (!cleanNickname || !finishGateOpen) return
    saveNickname(cleanNickname)
    const saved = await updateMyProfile({ displayName: cleanNickname, handle: null, bio: null, avatarUrl: null })
    if (saved) setProfile({ ...saved, bookmarks: saved.bookmarks.length ? saved.bookmarks : profile?.bookmarks ?? [] })
    await submitFinishedScore(cleanNickname, true)
  }

  const loveEnabled = game.features?.love !== false
  const commentsEnabled = game.features?.comments !== false
  const bookmarkEnabled = game.features?.bookmark !== false
  const currentEntryIsVisible = Boolean(currentEntry && leaderboard.some((entry) => entry.id === currentEntry.id))

  return (
    <article className={`game-card game-orientation-${orientation}`} data-preferred-orientation={orientation} aria-label={game.title}>
      <div className="game-surface">
        {mounted ? (
          <Game active={active && !finished} seed={seed} restartToken={restartToken} session={session} />
        ) : (
          <div className="game-placeholder" aria-hidden="true" />
        )}
      </div>

      <header className="game-topbar">
        <div className="game-identity">
          <div className="game-heading">
            <strong>{game.title}</strong>
            {game.author && <button type="button" className="creator-link" onClick={() => setSheet('creator')}>@{game.author}</button>}
          </div>
          <div className="game-subline">
            <span>{game.description}</span><b>·</b><span>{formatCount(social.plays)} plays</span>
          </div>
        </div>

        <nav className="game-actions" aria-label="Actions du jeu">
          {game.instructions && game.features?.help !== false && (
            <button type="button" onClick={() => setSheet('help')} aria-label="Règles du jeu"><CoreIcon name="rules" /><small>Règles</small></button>
          )}
          {loveEnabled && (
            <button type="button" className={social.loved ? 'is-active' : ''} onClick={() => void toggleLove()} aria-label="Aimer"><CoreIcon name="heart" filled={social.loved} /><small>{formatCount(social.loves)}</small></button>
          )}
          {commentsEnabled && (
            <button type="button" onClick={() => setSheet('comments')} aria-label="Commentaires"><CoreIcon name="comment" /><small>{formatCount(social.comments)}</small></button>
          )}
          {bookmarkEnabled && (
            <button type="button" className={social.bookmarked ? 'is-active' : ''} onClick={() => void toggleBookmark()} aria-label="Mettre en favori"><CoreIcon name="bookmark" filled={social.bookmarked} /><small>{social.bookmarked ? 'Sauvé' : 'Garder'}</small></button>
          )}
          <button type="button" onClick={() => setSheet('profile')} aria-label="Mon profil"><CoreIcon name="profile" /><small>Profil</small></button>
        </nav>
      </header>

      <button
        type="button"
        className="score-chip"
        onClick={() => leaderboardEnabled && (!finished || finishGateOpen) && setSheet('leaderboard')}
        aria-label={leaderboardEnabled ? `Score ${score}, ouvrir le classement` : `Score ${score}`}
      >
        <span>score</span><strong>{formatScore(score)}</strong>
      </button>

      {sheet && (
        <div className="platform-sheet-backdrop" onPointerDown={() => setSheet(null)}>
          <section className="platform-sheet" onPointerDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="platform-sheet-head">
              <div>
                <small>{sheet === 'profile' ? 'MiniFugg' : game.title}</small>
                <strong>
                  {sheet === 'help' && 'Comment jouer'}
                  {sheet === 'leaderboard' && 'Classement'}
                  {sheet === 'comments' && 'Commentaires'}
                  {sheet === 'creator' && `@${game.author}`}
                  {sheet === 'profile' && 'Mon profil'}
                </strong>
              </div>
              <button type="button" onClick={() => setSheet(null)} aria-label="Fermer"><CoreIcon name="close" /></button>
            </div>

            {sheet === 'help' && game.instructions && (
              <div className="platform-help">
                <p>{game.instructions.goal}</p>
                <ol>{game.instructions.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
                {game.instructions.controls?.length ? <div className="platform-controls">{game.instructions.controls.map((control) => <span key={control}>{control}</span>)}</div> : null}
              </div>
            )}

            {sheet === 'leaderboard' && (
              <div className="platform-leaderboard">
                {periods.length > 1 && (
                  <div className="platform-tabs">
                    {periods.map((period) => <button type="button" className={leaderboardPeriod === period ? 'is-active' : ''} onClick={() => setLeaderboardPeriod(period)} key={period}>{periodLabel(period)}</button>)}
                  </div>
                )}
                <div className="platform-board-label"><span>{periodLabel(leaderboardPeriod)} · {selectedBoardId}</span><button type="button" onClick={() => void refreshLeaderboard()}>Actualiser</button></div>
                {loadingLeaderboard ? <p className="platform-muted">Chargement…</p> : leaderboard.length === 0 && !currentEntry ? <p className="platform-muted">Aucun score pour le moment.</p> : (
                  <ol>
                    {leaderboard.map((entry, index) => (
                      <li className={entry.id === currentEntry?.id ? 'is-current-player' : ''} key={entry.id}>
                        <span><b>{index + 1}</b>{entry.nickname}</span><strong>{formatScore(entry.score)}</strong>
                      </li>
                    ))}
                    {currentEntry && !currentEntryIsVisible && (
                      <li className="is-current-player is-outside-top" key={`current-${currentEntry.id}`}>
                        <span><b>•</b>{currentEntry.nickname}</span><strong>{formatScore(currentEntry.score)}</strong>
                      </li>
                    )}
                  </ol>
                )}
                {finished && (
                  <div className="platform-leaderboard-actions">
                    <button type="button" onClick={replay}>Rejouer</button>
                  </div>
                )}
              </div>
            )}

            {sheet === 'comments' && (
              <div className="platform-comments">
                <div className="platform-comment-form">
                  <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 20))} placeholder="Pseudo" maxLength={20} />
                  <textarea value={commentText} onChange={(event) => setCommentText(event.target.value.slice(0, 500))} placeholder="Ton commentaire…" maxLength={500} rows={3} />
                  <button type="button" onClick={() => void postComment()} disabled={!nickname.trim() || !commentText.trim()}>Commenter</button>
                </div>
                <div className="platform-comment-list">
                  {comments.length === 0 ? <p className="platform-muted">Aucun commentaire.</p> : comments.map((comment) => (
                    <article key={comment.id}><div><strong>@{comment.nickname}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div><p>{comment.body}</p></article>
                  ))}
                </div>
              </div>
            )}

            {sheet === 'creator' && (
              <div className="platform-creator">
                <p>{creatorGames.length} jeu{creatorGames.length > 1 ? 'x' : ''} publié{creatorGames.length > 1 ? 's' : ''} par @{game.author}.</p>
                <div className="platform-creator-games">{creatorGames.map((creatorGame) => <article key={creatorGame.id}><strong>{creatorGame.title}</strong><span>{creatorGame.description}</span></article>)}</div>
              </div>
            )}

            {sheet === 'profile' && (
              <div className="platform-profile is-simple">
                <div className="platform-profile-summary">
                  <div className="platform-profile-avatar" aria-hidden="true">{randomProfileIcon(profile?.id)}</div>
                  <strong>{profileNickname || 'Joueur MiniFugg'}</strong>
                </div>

                <div className="platform-profile-form is-simple">
                  <label><span>Pseudo</span><input value={profileNickname} onChange={(event) => setProfileNickname(event.target.value.slice(0, 20))} placeholder="Ton pseudo" maxLength={20} /></label>
                  <button type="button" onClick={() => void saveProfile()} disabled={savingProfile || !profileNickname.trim()}>{savingProfile ? 'Enregistrement…' : 'Enregistrer'}</button>
                </div>
                {profileMessage && <p className="platform-profile-message">{profileMessage}</p>}

                <div className="platform-profile-favorites">
                  <div className="platform-profile-section-title"><strong>Favoris</strong><span>{favoriteGames.length}</span></div>
                  {favoriteGames.length === 0 ? <p className="platform-muted">Aucun jeu favori pour le moment.</p> : (
                    <div className="platform-profile-game-list">{favoriteGames.map((favorite) => <article key={favorite.id}><strong>{favorite.title}</strong><span>{favorite.description}</span></article>)}</div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {finished && (
        <div className="platform-finish" role="dialog" aria-modal="true" aria-label="Partie terminée">
          <section className="platform-finish-card">
            <small>{game.title}</small><span>Score final</span><strong>{formatScore(finished.score)}</strong>

            {!finishGateOpen && leaderboardEnabled && <p className="platform-finish-pause">Fin de partie…</p>}

            {finishGateOpen && leaderboardEnabled && !submitted && nickname.trim() && (
              <p className="platform-finish-pause">{submittingScore ? 'Enregistrement du score…' : 'Ouverture du classement…'}</p>
            )}

            {finishGateOpen && leaderboardEnabled && !submitted && !nickname.trim() && (
              <div className="platform-score-submit">
                <input value={nickname} onChange={(event) => setNickname(event.target.value.slice(0, 20))} placeholder="Choisis ton pseudo" maxLength={20} autoCapitalize="off" autoComplete="nickname" aria-label="Pseudo" />
                <button type="button" onClick={() => void registerFirstScore()} disabled={!nickname.trim() || submittingScore}>{submittingScore ? '…' : 'Enregistrer'}</button>
              </div>
            )}

            {finishGateOpen && leaderboardEnabled && submitted && <p className="platform-finish-pause">Score enregistré.</p>}

            {(!leaderboardEnabled || (finishGateOpen && submitted)) && (
              <div className="platform-finish-actions">
                <button type="button" className="is-primary" onClick={replay}>Rejouer</button>
              </div>
            )}
          </section>
        </div>
      )}

      <div className="swipe-hint" aria-hidden="true"><span>↑</span>swipe</div>
    </article>
  )
}
