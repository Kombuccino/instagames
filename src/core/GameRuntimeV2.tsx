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
import type { FeedPreference, GameFinishPayload, GameLeaderboardPeriod, InstagameDefinition } from './types'
import { readWelcomeBestScore, recordWelcomeBestScore } from './FuggWelcome'
import { PlatformCoverShell, formatSocialCount, type PlatformPanel } from './PlatformCoverShell'
import { gameCoinCost, useCoreCoinBalance } from './platformEconomy'

type GameRuntimeProps = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  seed: number
  active: boolean
  mounted: boolean
  feedPreference: FeedPreference
  onFeedPreferenceChange: (value: FeedPreference) => void
}

type RuntimePhase = 'cover' | 'launching' | 'playing'

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
  if (period === 'daily') return 'DAY'
  if (period === 'weekly') return 'WEEK'
  return 'GLOBAL'
}

function CloseIcon() {
  return (
    <svg className="mf-platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M5 5l14 14" /><path d="M19 5 5 19" />
    </svg>
  )
}

export function GameRuntimeV2({ game, catalog, seed, active, mounted }: GameRuntimeProps) {
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
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [commentText, setCommentText] = useState('')
  const [launchError, setLaunchError] = useState('')
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const periods = useMemo(() => periodsFor(game), [game])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<GameLeaderboardPeriod>(periods[0] ?? 'global')
  const leaderboardConfig = game.features?.leaderboard || false
  const leaderboardEnabled = Boolean(leaderboardConfig && leaderboardConfig.enabled)
  const leaderboardLimit = leaderboardConfig ? leaderboardConfig.limit ?? 20 : 20
  const leaderboardSort = leaderboardConfig ? leaderboardConfig.sort ?? 'desc' : 'desc'
  const selectedBoardId = boardIdFor(leaderboardPeriod)
  const orientation = game.orientation ?? 'portrait'
  const cost = gameCoinCost(game.status)
  const { balance: coins, spend } = useCoreCoinBalance()
  const Game = game.component

  const refreshSocial = useCallback(async () => {
    setSocial(await getGameSocialStats(game.id))
  }, [game.id])

  const refreshComments = useCallback(async () => {
    setComments(await listGameComments(game.id, 50))
  }, [game.id])

  const refreshLeaderboard = useCallback(async () => {
    if (!leaderboardEnabled) {
      setLeaderboard([])
      return
    }
    setLoadingLeaderboard(true)
    setLeaderboard(await listLeaderboard(game.id, selectedBoardId, leaderboardLimit, leaderboardSort))
    setLoadingLeaderboard(false)
  }, [game.id, leaderboardEnabled, leaderboardLimit, leaderboardSort, selectedBoardId])

  useEffect(() => {
    setPhase('cover')
    setPanel(null)
    setLeaderboardOpen(false)
    setFinished(null)
    setScore(0)
    setLaunchError('')
    setSocial(EMPTY_SOCIAL)
    setComments([])
    setBestScore(readWelcomeBestScore(game.id))
    setLeaderboardPeriod(periodsFor(game)[0] ?? 'global')
    playRecordedRef.current = false
    void refreshSocial()
  }, [game.id, refreshSocial, seed])

  useEffect(() => {
    if (!active) {
      setPanel(null)
      setLeaderboardOpen(false)
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
        boardId: next.boardId,
        metadata: next.metadata,
      })
    }
  }, [game.id, leaderboardEnabled, nickname, periods])

  const session = useMemo(() => ({
    setScore: (value: number) => setScore(normalizeScore(value)),
    finish,
  }), [finish])

  const invokeLegacyWelcomePlay = useCallback(() => {
    const root = rootRef.current
    const trigger = root?.querySelector<HTMLButtonElement>('.mf-fugg-welcome-play, .mf-status-welcome-play')
    trigger?.click()
  }, [])

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
    invokeLegacyWelcomePlay()
    void recordPlayOnce()

    if (launchTimerRef.current !== null) window.clearTimeout(launchTimerRef.current)
    launchTimerRef.current = window.setTimeout(() => {
      launchTimerRef.current = null
      setPhase('playing')
    }, 340)
  }, [active, cost, invokeLegacyWelcomePlay, phase, recordPlayOnce, spend])

  const closeGame = useCallback(() => {
    if (launchTimerRef.current !== null) {
      window.clearTimeout(launchTimerRef.current)
      launchTimerRef.current = null
    }
    setFinished(null)
    setScore(0)
    setPanel(null)
    setLeaderboardOpen(false)
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
    if (!cleanNickname || !cleanComment) return
    saveNickname(cleanNickname)
    void updateMyProfile({ displayName: cleanNickname })
    const comment = await addGameComment(game.id, cleanNickname, cleanComment)
    if (!comment) return
    setCommentText('')
    setComments((current) => [comment, ...current])
    await refreshSocial()
  }, [commentText, game.id, nickname, refreshSocial])

  const changeGame = useCallback(() => {
    const slot = rootRef.current?.closest<HTMLElement>('.game-slot')
    const next = slot?.nextElementSibling as HTMLElement | null
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const openLeaderboard = useCallback(() => {
    setPanel(null)
    setLeaderboardOpen(true)
  }, [])

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
            catalog={catalog}
            seed={seed}
            coins={coins}
            cost={cost}
            social={social}
            comments={comments}
            bestScore={bestScore}
            panel={panel}
            nickname={nickname}
            commentText={commentText}
            launchError={launchError}
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
            onOpenLeaderboard={openLeaderboard}
            onSelectCover={() => {}}
          />
        </div>
      )}

      {phase === 'playing' && !finished && (
        <button type="button" className="mf-game-close-box" onClick={closeGame} aria-label="Return to cover"><CloseIcon /></button>
      )}

      {leaderboardOpen && (
        <section className="mf-runtime-panel mf-leaderboard-panel" role="dialog" aria-modal="true" aria-label="Leaderboard">
          <header className="mf-runtime-panel-head">
            <div><small>{game.title}</small><strong>LEADERBOARD</strong></div>
            <button type="button" onClick={() => setLeaderboardOpen(false)} aria-label="Close"><CloseIcon /></button>
          </header>
          {periods.length > 1 && (
            <div className="mf-leaderboard-tabs">
              {periods.map((period) => <button key={period} type="button" className={leaderboardPeriod === period ? 'is-active' : ''} onClick={() => setLeaderboardPeriod(period)}>{periodLabel(period)}</button>)}
            </div>
          )}
          <div className="mf-leaderboard-list">
            {loadingLeaderboard ? <p>LOADING…</p> : leaderboard.length ? (
              <ol>{leaderboard.map((entry, index) => <li key={entry.id}><span><b>{index + 1}</b>{entry.nickname}</span><strong>{formatScore(entry.score)}</strong></li>)}</ol>
            ) : <p>NO SCORE YET.</p>}
          </div>
        </section>
      )}

      {finished && phase === 'playing' && (
        <div className="mf-run-finished" role="dialog" aria-modal="true" aria-label="Run finished">
          <section>
            <small>{game.title}</small>
            <span>FINAL SCORE</span>
            <strong>{formatScore(finished.score)}</strong>
            <div className="mf-run-finished-actions">
              {leaderboardEnabled && <button type="button" onClick={openLeaderboard}>LEADERBOARD</button>}
              <button type="button" className="is-primary" onClick={replay}>{cost ? `INSERT COIN x${cost} · REPLAY` : 'REPLAY FREE'}</button>
              <button type="button" onClick={closeGame}>QUIT</button>
            </div>
            {cost > 0 && <p>{formatSocialCount(coins)} coins left</p>}
          </section>
        </div>
      )}
    </article>
  )
}
