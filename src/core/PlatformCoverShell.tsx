import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { GameComment, GameSocialStats } from './social'
import type { InstagameDefinition } from './types'
import { MINIFUGG_CREATOR } from './creatorIdentity'
import { PLATFORM_ALPHA_POLICY } from './platformAlphaPolicy'
import { StaticCoverArt } from './StaticCoverArt'
import { CoinConsole90s } from './CoinConsole90s'
import './platformCover.css'
import './coinConsole90s.css'

export type PlatformPanel = 'info' | 'comments' | null
export type PlatformCommentsStatus = 'idle' | 'loading' | 'ready' | 'unavailable'

type Props = {
  game: InstagameDefinition
  /** Kept as an ignored compatibility prop for developer labs; Info no longer lists the catalog. */
  catalog?: InstagameDefinition[]
  active: boolean
  seed: number
  coins: number
  cost: number
  social: GameSocialStats
  comments: GameComment[]
  commentsStatus: PlatformCommentsStatus
  bestScore: number
  panel: PlatformPanel
  nickname: string
  commentText: string
  launchError: string
  showCoinConsole?: boolean
  onPanel: (panel: Exclude<PlatformPanel, null>) => void
  onClosePanel: () => void
  onToggleLove: () => void
  onToggleBookmark: () => void
  onPlay: () => void
  onChangeGame: (direction?: -1 | 1) => void
  onShare: () => void
  onNicknameChange: (value: string) => void
  onCommentTextChange: (value: string) => void
  onPostComment: () => void
  onOpenLeaderboard: () => void
  onSelectCover: (variantId: string) => void
}

type IconName = 'info' | 'heart' | 'comment' | 'bookmark' | 'share' | 'close' | 'chevron' | 'send'
type CommentThread = {
  id: string
  nickname: string
  body: string
  age: string
}

export function formatSocialCount(value: number) {
  const count = Math.max(0, Math.trunc(value))
  if (count <= 9_999) return count.toLocaleString('en-US')
  if (count < 1_000_000) {
    const scaled = count / 1_000
    const digits = scaled < 100 && !Number.isInteger(scaled) ? 1 : 0
    return `${scaled.toFixed(digits).replace(/\.0$/, '')}k`
  }
  const scaled = count / 1_000_000
  return `${scaled.toFixed(scaled < 100 ? 1 : 0).replace(/\.0$/, '')}m`
}

function Icon({ name, filled = false }: { name: IconName, filled?: boolean }) {
  let content: ReactNode
  if (name === 'info') content = <><circle cx="12" cy="12" r="9" /><path d="M12 10.5v6" /><circle cx="12" cy="7.2" r=".7" fill="currentColor" stroke="none" /></>
  else if (name === 'heart') content = <path d="M12 20.1S4.3 15.6 2.4 11.3C.8 7.7 3 4.2 6.7 4.1c2.2 0 4.1 1.2 5.3 3 1.2-1.8 3.1-3 5.3-3 3.7.1 5.9 3.6 4.3 7.2-1.9 4.3-9.6 8.8-9.6 8.8Z" />
  else if (name === 'comment') content = <path d="M20.5 11.2a8.4 8.4 0 0 1-8.6 8.2 9.5 9.5 0 0 1-3.3-.6L4 20l1.4-3.8a7.7 7.7 0 0 1-1.9-5A8.4 8.4 0 0 1 12.2 3a8.4 8.4 0 0 1 8.3 8.2Z" />
  else if (name === 'bookmark') content = <path d="M6.3 3.2h11.4c.7 0 1.3.6 1.3 1.3v16.2l-7-4.5-7 4.5V4.5c0-.7.6-1.3 1.3-1.3Z" />
  else if (name === 'share') content = <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>
  else if (name === 'close') content = <><path d="M5 5l14 14" /><path d="M19 5 5 19" /></>
  else if (name === 'chevron') content = <path d="m9 5 7 7-7 7" />
  else content = <><path d="m3.5 4.5 17 7.5-17 7.5 3-7.5-3-7.5Z" /><path d="M6.5 12h14" /></>

  return <svg className={`mf-platform-icon mf-platform-icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'}>{content}</svg>
}

function PixelCoin({ small = false }: { small?: boolean }) {
  return <img className={`mf-pixel-coin${small ? ' is-small' : ''}`} src="/assets/generated/platform/ui/coin-console-90s/coin-front.webp" alt="" aria-hidden="true" />
}

function coverVariants(game: InstagameDefinition) {
  if (game.welcome?.variants?.length) return game.welcome.variants
  return [{ id: 'current', label: 'Current cover', image: '', unlockScore: 0 }]
}

function isCoverUnlocked(bestScore: number, unlockScore = 0) {
  return PLATFORM_ALPHA_POLICY.allCoverVariantsUnlocked || bestScore >= unlockScore
}

function formatReleaseDate(updatedAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date(updatedAt))
}

function seededActiveVariant(game: InstagameDefinition, seed: number, bestScore: number) {
  const variants = coverVariants(game)
  const unlocked = variants.filter((variant) => isCoverUnlocked(bestScore, variant.unlockScore))
  const pool = unlocked.length ? unlocked : variants.slice(0, 1)
  return pool[Math.abs(Math.trunc(seed)) % pool.length]?.id ?? variants[0]?.id ?? ''
}

function realComments(comments: GameComment[]): CommentThread[] {
  return comments.map((comment) => ({
    id: comment.id,
    nickname: comment.nickname || 'MiniFugg player',
    body: comment.body,
    age: new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))
}

function Avatar({ nickname }: { nickname: string }) {
  const initial = (nickname.trim()[0] || '?').toUpperCase()
  return <span className="mf-ui-avatar is-free" aria-hidden="true"><span>{initial}</span></span>
}

function FuggyCreatorAvatar() {
  return (
    <span className="mf-ui-avatar mf-comment-avatar is-creator" aria-hidden="true">
      <img
        src={MINIFUGG_CREATOR.avatarSrc}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%', transform: 'scale(1.42)', transformOrigin: '50% 18%' }}
      />
    </span>
  )
}

function CommentCard({ thread }: { thread: CommentThread }) {
  return (
    <div className="mf-comment-thread">
      <Avatar nickname={thread.nickname} />
      <div className="mf-comment-main">
        <div className="mf-comment-meta">
          <strong className="mf-ui-player-name mf-ui-label">{thread.nickname}</strong>
          <time className="mf-ui-meta">{thread.age}</time>
        </div>
        <p className="mf-ui-body">{thread.body}</p>
      </div>
    </div>
  )
}

export function PlatformCoverShell(props: Props) {
  const {
    game, seed, coins, cost, social, comments, commentsStatus, bestScore, panel, nickname, commentText, launchError, showCoinConsole = true,
    onPanel, onClosePanel, onToggleLove, onToggleBookmark, onPlay, onChangeGame, onShare,
    onNicknameChange, onCommentTextChange, onPostComment, onOpenLeaderboard, onSelectCover,
  } = props
  const gesture = useRef<{ pointerId: number, x: number, y: number } | null>(null)
  const variants = useMemo(() => coverVariants(game), [game])
  const defaultVariantId = useMemo(() => seededActiveVariant(game, seed, bestScore), [bestScore, game, seed])
  const [activeVariantId, setActiveVariantId] = useState(defaultVariantId)

  useEffect(() => setActiveVariantId(defaultVariantId), [defaultVariantId, game.id])

  const threads = realComments(comments)

  const beginGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || panel) return
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea')) return
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
  }

  const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = gesture.current
    gesture.current = null
    if (!start || start.pointerId !== event.pointerId || panel) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return
    if (dx < 0) onPlay()
    else onPanel('info')
  }

  const selectCover = (variantId: string, unlocked: boolean) => {
    if (!unlocked) return
    setActiveVariantId(variantId)
    onSelectCover(variantId)
  }

  const activeCover = variants.find((variant) => variant.id === activeVariantId)
  const commentsReady = commentsStatus === 'ready'

  return (
    <div
      className="mf-cover-shell"
      data-cover-migration={game.migration.cover}
      onPointerDown={beginGesture}
      onPointerUp={endGesture}
      onPointerCancel={() => { gesture.current = null }}
    >
      {activeCover?.image && (
        <div className="mf-core-selected-cover">
          <StaticCoverArt variant={activeCover} />
        </div>
      )}
      {showCoinConsole && (
        <CoinConsole90s
          coins={coins}
          cost={cost}
          free={game.status === 'trash'}
          launchError={launchError}
          onPlay={onPlay}
          onChangeGame={onChangeGame}
        />
      )}
      <nav className="mf-cover-rail" aria-label="Game actions">
        <button type="button" onClick={() => onPanel('info')} aria-label="Info"><Icon name="info" /></button>
        <button type="button" className={social.loved ? 'is-loved' : ''} onClick={onToggleLove} aria-label="Like"><Icon name="heart" filled={social.loved} /><small>{formatSocialCount(social.loves)}</small></button>
        <button type="button" onClick={() => onPanel('comments')} aria-label="Comments"><Icon name="comment" /><small>{formatSocialCount(social.comments)}</small></button>
        <button type="button" className={social.bookmarked ? 'is-bookmarked' : ''} onClick={onToggleBookmark} aria-label="Bookmark"><Icon name="bookmark" filled={social.bookmarked} /><small>{formatSocialCount(social.bookmarks)}</small></button>
        <button type="button" onClick={onShare} aria-label="Share"><Icon name="share" /></button>
      </nav>

      {panel && (
        <section className="mf-platform-panel mf-ui-screen" role="dialog" aria-modal="true" aria-label={panel === 'info' ? 'Game information' : 'Comments'}>
          <header className="mf-panel-tabs mf-ui-tabs">
            <button type="button" className={`mf-ui-tab mf-ui-label${panel === 'info' ? ' is-active' : ''}`} onClick={() => onPanel('info')}>INFO</button>
            <button type="button" className={`mf-ui-tab mf-ui-label${panel === 'comments' ? ' is-active' : ''}`} onClick={() => onPanel('comments')}>COMMENTS</button>
            <button type="button" className="mf-panel-close mf-ui-icon-action" onClick={onClosePanel} aria-label="Close"><Icon name="close" /></button>
          </header>

          {panel === 'info' ? (
            <div className="mf-panel-scroll mf-info-panel mf-ui-scroll">
              <section className="mf-cover-selection">
                <h2 className="mf-ui-h3">COVER SELECTION</h2>
                <div className="mf-cover-grid">
                  {variants.map((variant) => {
                    const unlocked = isCoverUnlocked(bestScore, variant.unlockScore)
                    const activeVariant = activeVariantId === variant.id
                    return (
                      <button key={variant.id} type="button" className={`${activeVariant ? 'is-active' : ''}${unlocked ? '' : ' is-locked'}`} onClick={() => selectCover(variant.id, unlocked)} disabled={!unlocked}>
                        {variant.image ? <img src={variant.image} alt="" /> : <span className="mf-cover-fallback">{game.title.slice(0, 2).toUpperCase()}</span>}
                        {activeVariant && <em className="mf-ui-micro">ACTIVE</em>}
                        {!unlocked && <span className="mf-cover-lock">▣</span>}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="mf-game-info-head">
                <h1 className="mf-ui-h1">{game.title}</h1>
                <p className="mf-ui-meta">by <strong className="mf-ui-player-name mf-ui-label">{MINIFUGG_CREATOR.displayName}</strong></p>
                <p className="mf-info-description mf-ui-body">{game.description}</p>
                {game.release && (
                  <p className="mf-info-version mf-ui-meta">
                    Version {game.release.version} <span>•</span> Last update {formatReleaseDate(game.release.updatedAt)}
                  </p>
                )}
              </section>

              <section className="mf-high-score">
                <div><span>🏆</span><p className="mf-ui-h3">HIGH SCORE<small className="mf-ui-meta">Your best score</small><strong>{formatSocialCount(bestScore)}</strong></p></div>
                <button className="mf-ui-action mf-ui-label" type="button" onClick={onOpenLeaderboard}>View leaderboard <Icon name="chevron" /></button>
              </section>

              <section className="mf-how-to-play">
                <h2 className="mf-ui-h3">HOW TO PLAY</h2>
                {game.instructions ? <ol>{game.instructions.rules.slice(0, 6).map((rule, index) => <li className="mf-ui-body" key={rule}><span>{index + 1}</span>{rule}</li>)}</ol> : <p className="mf-ui-body">Open the game, learn by playing, then chase a better score.</p>}
              </section>

              <section className="mf-creator-section">
                <h2 className="mf-ui-h3">CREATOR</h2>
                <div className="mf-creator-card">
                  <FuggyCreatorAvatar />
                  <div>
                    <div className="mf-comment-meta"><strong className="mf-ui-player-name mf-ui-label">{MINIFUGG_CREATOR.displayName}</strong><span className="mf-ui-badge is-creator">Creator</span></div>
                    <p className="mf-ui-body">{MINIFUGG_CREATOR.bio}</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="mf-comments-panel">
              <div className="mf-comments-scroll mf-ui-scroll">
                {commentsStatus === 'loading' && <p className="mf-ui-body">LOADING DISCUSSION…</p>}
                {commentsStatus === 'unavailable' && <p className="mf-ui-body">DISCUSSION UNAVAILABLE. CONNECT TO MINIFUGG CORE TO READ AND POST SHARED COMMENTS.</p>}
                {commentsReady && threads.length === 0 && <p className="mf-ui-body">NO COMMENTS YET. BE THE FIRST.</p>}
                {commentsReady && threads.map((thread) => <CommentCard key={thread.id} thread={thread} />)}
              </div>
              <div className="mf-comment-composer">
                <Avatar nickname={nickname || 'Player'} />
                <input className="mf-comment-nickname" value={nickname} onChange={(event) => onNicknameChange(event.target.value.slice(0, 20))} aria-label="Nickname" maxLength={20} disabled={!commentsReady} />
                <textarea className="mf-ui-field" value={commentText} onChange={(event) => onCommentTextChange(event.target.value.slice(0, 500))} placeholder={commentsReady ? 'Write a comment…' : 'Shared discussion is offline'} rows={1} maxLength={500} disabled={!commentsReady} />
                <button className="mf-ui-icon-action" type="button" onClick={onPostComment} disabled={!commentsReady || !nickname.trim() || !commentText.trim()} aria-label="Post comment"><Icon name="send" /></button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
