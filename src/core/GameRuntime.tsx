import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSavedNickname, saveNickname, type LeaderboardEntry } from './leaderboard'
import {
  addGameComment,
  getGameSocialStats,
  listGameComments,
  listLeaderboard,
  recordGamePlay,
  setGameBookmark,
  setGameLove,
  submitRunScore,
  updateMyProfile,
} from './platformApi'
import type { GameComment, GameSocialStats } from './social'
import type { GameFinishPayload, GameLeaderboardMode, GameLeaderboardPeriod, GameLeaderboardScope, InstagameDefinition } from './types'
import { PlatformCoverShell, formatSocialCount, type PlatformCommentsStatus, type PlatformPanel } from './PlatformCoverShell'
import { CoinConsole90s } from './CoinConsole90s'
import { gameCoinCost, useCoreCoinBalance } from './platformEconomy'
import { readWelcomeBestScore, recordWelcomeBestScore } from './welcomeProgress'

type GameRuntimeProps = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  seed: number
  active: boolean
  mounted: boolean
}

type RuntimePhase = 'cover' | 'launching' | 'playing'
type LeaderboardOrigin = 'info' | 'game-over' | null

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

function utcDayId(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function isoWeekId(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = value.getUTCDay() || 7
  value.setUTCDate(value.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((value.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function leaderboardModeFor(game: InstagameDefinition): GameLeaderboardMode {
  const config = game.features?.leaderboard
  return config && config.enabled ? config.mode ?? 'periodic' : 'periodic'
}

function periodsFor(game: InstagameDefinition): GameLeaderboardPeriod[] {
  const config = game.features?.leaderboard
  if (!config || !config.enabled) return []
  if ((config.mode ?? 'periodic') === 'daily-challenge') return ['daily']
  const periods = (config.periods?.length ? config.periods : ['weekly', 'global']).filter((period) => period !== 'daily')
  return periods.length ? periods : ['weekly', 'global']
}

function boardIdFor(period: GameLeaderboardPeriod) {
  if (period === 'weekly') return `week:${isoWeekId()}`
  if (period === 'daily') return utcDayId()
  return 'global'
}

function periodLabel(period: GameLeaderboardPeriod) {
  if (period === 'weekly') return 'WEEK'
  if (period === 'global') return 'EVER'
  return 'DAY'
}

function shiftUtcDay(dayId: string, delta: number) {
  const value = new Date(`${dayId}T00:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() + delta)
  return utcDayId(value)
}

function formatDayLabel(dayId: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dayId}T00:00:00.000Z`)).toUpperCase()
}

function CloseIcon() {
  return (
    <svg className="mf-platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M5 5l14 14" /><path d="M19 5 5 19" />
    </svg>
  )
}

export function GameRuntime({ game, seed, active, mounted }: GameRuntimeProps) {
  const rootRef = useRef<HTMLElement>(null)
  const launchTimerRef = useRef<number | null>(null)
  const playRecordedRef = useRef(false)
  const [phase, setPhase] = useState<RuntimePhase>('cover')
  const [panel, setPanel] = useState<PlatformPanel>(null)
  const [gameMountKey, setGameMountKey] = useState(0)
  const [restartToken, setRestartToken] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState<GameFinishPayload | null>(null)
  const [bestScore, setBestScore] = useState(() => readWelcomeBestScore(game.id))
  const [social, setSocial] = useState<GameSocialStats>(EMPTY_SOCIAL)
  const [comments, setComments] = useState<GameComment[]>([])
  const [commentsStatus, setCommentsStatus] = useState<PlatformCommentsStatus>('idle')
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [commentText, setCommentText] = useState('')
  const [launchError, setLaunchError] = useState('')
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [leaderboardOrigin, setLeaderboardOrigin] = useState<LeaderboardOrigin>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const periods = useMemo(() => periodsFor(game), [game])
  const leaderboardMode = useMemo(() => leaderboardModeFor(game), [game])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<GameLeaderboardPeriod>(periods[0] ?? 'global')
  const [leaderboardScope, setLeaderboardScope] = useState<GameLeaderboardScope>('global')
  const [leaderboardDay, setLeaderboardDay] = useState(() => utcDayId())
  const leaderboardConfig = game.features?.leaderboard || false
  const leaderboardEnabled = Boolean(leaderboardConfig && leaderboardConfig.enabled)
  const leaderboardLimit = leaderboardConfig ? leaderboardConfig.limit ?? 100 : 100
  const leaderboardSort = leaderboardConfig ? leaderboardConfig.sort ?? 'desc' : 'desc'
  const selectedBoardId = leaderboardMode === 'daily-challenge' ? leaderboardDay : boardIdFor(leaderboardPeriod)
  const orientation = game.orientation ?? 'portrait'
  const cost = gameCoinCost(game.status)
  const { balance: coins, spend } = useCoreCoinBalance()
  const Game = game.component

  const refreshSocial = useCallback(async () => {
    setSocial(await getGameSocialStats(game.id))
  }, [game.id])

  const refreshComments = useCallback(async () => {
    setCommentsStatus('loading')
    try {
      setComments(await listGameComments(game.id, 50))
      setCommentsStatus('ready')
    } catch {
      setComments([])
      setCommentsStatus('unavailable')
    }
  }, [game.id])

  const refreshLeaderboard = useCallback(async () => {
    if (!leaderboardEnabled) {
      setLeaderboard([])
      return
    }
    setLoadingLeaderboard(true)
    setLeaderboard(await listLeaderboard(game.id, selectedBoardId, leaderboardLimit, leaderboardSort, leaderboardScope))
    setLoadingLeaderboard(false)
  }, [game.id, leaderboardEnabled, leaderboardLimit, leaderboardScope, leaderboardSort, selectedBoardId])

  useEffect(() => {
    setPhase('cover')
    setPanel(null)
    setLeaderboardOpen(false)
    setLeaderboardOrigin(null)
    setFinished(null)
    setScore(0)
    setLaunchError('')
    setSocial(EMPTY_SOCIAL)
    setComments([])
    setCommentsStatus('idle')
    setBestScore(readWelcomeBestScore(game.id))
    setLeaderboardPeriod(periodsFor(game)[0] ?? 'global')
    setLeaderboardScope('global')
    setLeaderboardDay(utcDayId())
    playRecordedRef.current = false
    void refreshSocial()
  }, [game.id, refreshSocial, seed])

  useEffect(() => {
    if (!active) {
      setPanel(null)
      setLeaderboardOpen(false)
      setLeaderboardOrigin(null)
      setLaunchError('')
    }
  }, [active])

  useEffect(() => {
    if (panel === 'comments') void refreshComments()
  }, [panel, refreshComments])

  useEffect(() => {
    if (leaderboardOpen) void refreshLeaderboard()
  }, [leaderboardOpen, refreshLeaderboard])

  useEffect(() => () => {
    if (launchTimerRef.current !== null) window.clearTimeout(launchTimerRef.current)
  }, [])

  const finish = useCallback((payload: GameFinishPayload) => {
    const next = { ...payload, score: normalizeScore(payload.score) }
    setScore(next.score)
    setFinished(next)
    setBestScore(recordWelcomeBestScore(game.id, next.score))

    const cleanNickname = nickname.trim().slice(0, 20)
    if (leaderboardEnabled && cleanNickname) {
      void submitRunScore({
        gameId: game.id,
        nickname: cleanNickname,
        score: next.score,
        periods,
        boardId: next.boardId ?? (leaderboardMode === 'daily-challenge' ? utcDayId() : undefined),
        metadata: next.metadata,
      })
    }
  }, [game.id, leaderboardEnabled, leaderboardMode, nickname, periods])

  const session = useMemo(() => ({
    setScore: (value: number) => setScore(normalizeScore(value)),
    finish,
  }), [finish])

  const recordPlayOnce = useCallback(async () => {
    if (playRecordedRef.current) return
    playRecordedRef.current = true
    setSocial(await recordGamePlay(game.id))
  }, [game.id])

  const play = useCallback(() => {
    if (!active || phase !== 'cover') return
    if (!spend(cost)) {
      setLaunchError(cost > 1 ? `NOT ENOUGH COINS · NEED ${cost}` : 'NOT ENOUGH COINS')
      return
    }

    setLaunchError('')
    setPanel(null)
    setPhase('launching')
    void recordPlayOnce()

    if (launchTimerRef.current !== null) window.clearTimeout(launchTimerRef.current)
    launchTimerRef.current = window.setTimeout(() => {
      launchTimerRef.current = null
      setPhase('playing')
    }, 340)
  }, [active, cost, phase, recordPlayOnce, spend])

  const closeGame = useCallback(() => {
    if (launchTimerRef.current !== null) {
      window.clearTimeout(launchTimerRef.current)
      launchTimerRef.current = null
    }
    setFinished(null)
    setScore(0)
    setPanel(null)
    setLeaderboardOpen(false)
    setLeaderboardOrigin(null)
    setPhase('cover')
    setGameMountKey((value) => value + 1)
    setRestartToken((value) => value + 1)
    playRecordedRef.current = false
  }, [])

  const replay = useCallback(() => {
    if (!spend(cost)) {
      setPhase('cover')
      setFinished(null)
      setLaunchError(cost > 1 ? `NOT ENOUGH COINS · NEED ${cost}` : 'NOT ENOUGH COINS')
      setGameMountKey((value) => value + 1)
      return
    }
    setFinished(null)
    setScore(0)
    setLeaderboardOpen(false)
    setLeaderboardOrigin(null)
    setRestartToken((value) => value + 1)
    playRecordedRef.current = false
    void recordPlayOnce()
  }, [cost, recordPlayOnce, spend])

  const toggleLove = useCallback(async () => {
    setSocial(await setGameLove(game.id, !social.loved))
  }, [game.id, social.loved])

  const toggleBookmark = useCallback(async () => {
    setSocial(await setGameBookmark(game.id, !social.bookmarked))
  }, [game.id, social.bookmarked])

  const postComment = useCallback(async () => {
    const cleanNickname = nickname.trim().slice(0, 20)
    const cleanComment = commentText.trim().slice(0, 500)
    if (!cleanNickname || !cleanComment || commentsStatus !== 'ready') return
    saveNickname(cleanNickname)
    void updateMyProfile({ displayName: cleanNickname })
    try {
      const comment = await addGameComment(game.id, cleanNickname, cleanComment)
      setCommentText('')
      setComments((current) => [comment, ...current])
      await refreshSocial()
    } catch {
      setCommentsStatus('unavailable')
    }
  }, [commentText, commentsStatus, game.id, nickname, refreshSocial])

  const changeGame = useCallback((direction: -1 | 1 = 1) => {
    const slot = rootRef.current?.closest<HTMLElement>('.game-slot')
    const target = (direction < 0 ? slot?.previousElementSibling : slot?.nextElementSibling) as HTMLElement | null
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const share = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.set('game', game.id)
    const payload = { title: `${game.title} · MiniFugg`, text: game.description, url: url.toString() }
    try {
      if (navigator.share) {
        await navigator.share(payload)
        return
      }
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(payload.url)
    } catch {
      // Cancelled/unsupported share should not disturb the cover.
    }
  }, [game.description, game.id, game.title])

  const openLeaderboard = useCallback((origin: Exclude<LeaderboardOrigin, null>) => {
    setLeaderboardOrigin(origin)
    setPanel(null)
    setLeaderboardOpen(true)
  }, [])

  const closeLeaderboard = useCallback(() => {
    setLeaderboardOpen(false)
    if (leaderboardOrigin === 'info') setPanel('info')
    setLeaderboardOrigin(null)
  }, [leaderboardOrigin])

  const canAdvanceLeaderboardDay = leaderboardDay < utcDayId()

  return (
    <article ref={rootRef} className={`game-card game-orientation-${orientation}`} data-preferred-orientation={orientation} data-phase={phase} aria-label={game.title}>
      <div className="game-surface">
        {mounted ? (
          <Game key={`${game.id}:${seed}:${gameMountKey}`} active={active && phase !== 'cover'} seed={seed} restartToken={restartToken} session={session} />
        ) : (
          <div className="game-placeholder" aria-hidden="true" />
        )}
      </div>

      {(phase === 'cover' || phase === 'launching') && (
        <div className={phase === 'launching' ? 'mf-cover-transition is-launching' : 'mf-cover-transition'}>
          <PlatformCoverShell
            game={game}
            active={active}
            seed={seed}
            coins={coins}
            cost={cost}
            social={social}
            comments={comments}
            commentsStatus={commentsStatus}
            bestScore={bestScore}
            panel={panel}
            nickname={nickname}
            commentText={commentText}
            launchError={launchError}
            showCoinConsole={false}
            onPanel={setPanel}
            onClosePanel={() => setPanel(null)}
            onToggleLove={() => void toggleLove()}
            onToggleBookmark={() => void toggleBookmark()}
            onPlay={play}
            onChangeGame={changeGame}
            onShare={() => void share()}
            onNicknameChange={setNickname}
            onCommentTextChange={setCommentText}
            onPostComment={() => void postComment()}
            onOpenLeaderboard={() => openLeaderboard('info')}
            onSelectCover={() => {}}
          />
        </div>
      )}

      {(phase === 'cover' || phase === 'launching') && active && panel === null && (
        <CoinConsole90s
          fixed
          coins={coins}
          cost={cost}
          free={game.status === 'trash'}
          launchError={launchError}
          onPlay={play}
          onChangeGame={changeGame}
        />
      )}

      {phase === 'playing' && !finished && (
        <button type="button" className="mf-game-close-box" onClick={closeGame} aria-label="Exit game and return to cover">
          <img className="is-idle" src="/assets/generated/platform/ui/coin-console-90s/return-exit-idle.webp" alt="EXIT" />
          <img className="is-focus" src="/assets/generated/platform/ui/coin-console-90s/return-exit-focus.webp" alt="" />
          <img className="is-pressed" src="/assets/generated/platform/ui/coin-console-90s/return-exit-pressed.webp" alt="" />
        </button>
      )}

      {leaderboardOpen && (
        <section className="mf-runtime-panel mf-leaderboard-panel mf-ui-screen" role="dialog" aria-modal="true" aria-label="Leaderboard">
          <header className="mf-runtime-panel-head mf-ui-panel-header">
            <div><small className="mf-ui-meta">{game.title}</small><strong className="mf-ui-h2">LEADERBOARD</strong></div>
            <button className="mf-ui-icon-action" type="button" onClick={closeLeaderboard} aria-label="Back"><CloseIcon /></button>
          </header>
          <div className="mf-leaderboard-controls">
            <div className="mf-leaderboard-tabs mf-ui-tabs" aria-label="Leaderboard scope">
              <button type="button" className={`mf-ui-tab mf-ui-label${leaderboardScope === 'global' ? ' is-active' : ''}`} onClick={() => setLeaderboardScope('global')}>GLOBAL</button>
              <button type="button" className={`mf-ui-tab mf-ui-label${leaderboardScope === 'friends' ? ' is-active' : ''}`} onClick={() => setLeaderboardScope('friends')}>FRIENDS</button>
            </div>
            {leaderboardMode === 'daily-challenge' ? (
              <div className="mf-leaderboard-tabs mf-ui-tabs" aria-label="Challenge day">
                <button type="button" className="mf-ui-tab mf-ui-label" onClick={() => setLeaderboardDay((day) => shiftUtcDay(day, -1))} aria-label="Previous day">‹</button>
                <strong className="mf-ui-label">{formatDayLabel(leaderboardDay)}</strong>
                <button type="button" className="mf-ui-tab mf-ui-label" onClick={() => setLeaderboardDay((day) => shiftUtcDay(day, 1))} disabled={!canAdvanceLeaderboardDay} aria-label="Next day">›</button>
              </div>
            ) : periods.length > 1 ? (
              <div className="mf-leaderboard-tabs mf-ui-tabs" aria-label="Leaderboard period">
                {periods.map((period) => <button key={period} type="button" className={`mf-ui-tab mf-ui-label${leaderboardPeriod === period ? ' is-active' : ''}`} onClick={() => setLeaderboardPeriod(period)}>{periodLabel(period)}</button>)}
              </div>
            ) : null}
          </div>
          <div className="mf-leaderboard-list mf-ui-scroll">
            {loadingLeaderboard ? <p className="mf-ui-body">LOADING…</p> : leaderboard.length ? (
              <ol className="mf-ui-list">{leaderboard.map((entry, index) => {
                const isCurrent = Boolean(entry.isCurrent) || (Boolean(nickname.trim()) && entry.nickname.toLowerCase() === nickname.trim().toLowerCase())
                return <li className={`mf-ui-list-row${isCurrent ? ' is-current' : ''}`} key={entry.id}><span><b>{index + 1}</b><span className="mf-ui-player-name mf-ui-label">{entry.nickname}</span></span><strong>{formatScore(entry.score)}</strong></li>
              })}</ol>
            ) : <p className="mf-ui-body">{leaderboardScope === 'friends' ? 'NO FRIEND SCORE FOR THIS BOARD YET.' : 'NO SCORE YET.'}</p>}
          </div>
        </section>
      )}

      {finished && phase === 'playing' && (
        <div className="mf-run-finished" role="dialog" aria-modal="true" aria-label="Run finished">
          <section className="mf-ui-panel">
            <small className="mf-ui-h3">{game.title}</small>
            <span className="mf-ui-meta">FINAL SCORE</span>
            <strong className="mf-ui-display">{formatScore(finished.score)}</strong>
            <div className="mf-run-finished-actions">
              {leaderboardEnabled && <button className="mf-ui-action mf-ui-label" type="button" onClick={() => openLeaderboard('game-over')}>LEADERBOARD</button>}
              <button type="button" className="is-primary mf-ui-action mf-ui-label" onClick={replay}>{cost ? `INSERT COIN x${cost} · REPLAY` : 'REPLAY FREE'}</button>
              <button className="mf-ui-action mf-ui-label" type="button" onClick={closeGame}>RAGE QUIT</button>
            </div>
            {cost > 0 && <p className="mf-ui-meta">{formatSocialCount(coins)} coins left</p>}
          </section>
        </div>
      )}
    </article>
  )
}
