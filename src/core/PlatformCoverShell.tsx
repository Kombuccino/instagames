import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { GameComment, GameSocialStats } from './social'
import type { InstagameDefinition } from './types'
import { PLATFORM_ALPHA_POLICY } from './platformAlphaPolicy'
import { PhaserCoverHost } from './runtime/PhaserCoverHost'
import { StaticCoverArt } from './StaticCoverArt'
import './platformCover.css'

export type PlatformPanel = 'info' | 'comments' | null

type Props = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  active: boolean
  seed: number
  coins: number
  cost: number
  social: GameSocialStats
  comments: GameComment[]
  bestScore: number
  panel: PlatformPanel
  nickname: string
  commentText: string
  launchError: string
  onPanel: (panel: Exclude<PlatformPanel, null>) => void
  onClosePanel: () => void
  onToggleLove: () => void
  onToggleBookmark: () => void
  onPlay: () => void
  onChangeGame: () => void
  onShare: () => void
  onNicknameChange: (value: string) => void
  onCommentTextChange: (value: string) => void
  onPostComment: () => void
  onOpenLeaderboard: () => void
  onSelectCover: (variantId: string) => void
}

type IconName = 'info' | 'heart' | 'comment' | 'bookmark' | 'share' | 'close' | 'chevron' | 'send' | 'replyHeart' | 'more'
type CommentRole = 'free' | 'creator' | '999'
type CommentThread = {
  id: string
  nickname: string
  body: string
  age: string
  likes: number
  role: CommentRole
  replies?: CommentThread[]
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
  else if (name === 'heart' || name === 'replyHeart') content = <path d="M12 20.1S4.3 15.6 2.4 11.3C.8 7.7 3 4.2 6.7 4.1c2.2 0 4.1 1.2 5.3 3 1.2-1.8 3.1-3 5.3-3 3.7.1 5.9 3.6 4.3 7.2-1.9 4.3-9.6 8.8-9.6 8.8Z" />
  else if (name === 'comment') content = <path d="M20.5 11.2a8.4 8.4 0 0 1-8.6 8.2 9.5 9.5 0 0 1-3.3-.6L4 20l1.4-3.8a7.7 7.7 0 0 1-1.9-5A8.4 8.4 0 0 1 12.2 3a8.4 8.4 0 0 1 8.3 8.2Z" />
  else if (name === 'bookmark') content = <path d="M6.3 3.2h11.4c.7 0 1.3.6 1.3 1.3v16.2l-7-4.5-7 4.5V4.5c0-.7.6-1.3 1.3-1.3Z" />
  else if (name === 'share') content = <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>
  else if (name === 'close') content = <><path d="M5 5l14 14" /><path d="M19 5 5 19" /></>
  else if (name === 'chevron') content = <path d="m9 5 7 7-7 7" />
  else if (name === 'send') content = <><path d="m3.5 4.5 17 7.5-17 7.5 3-7.5-3-7.5Z" /><path d="M6.5 12h14" /></>
  else content = <><circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" /></>

  return <svg className={`mf-platform-icon mf-platform-icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'}>{content}</svg>
}

function PixelCoin({ small = false }: { small?: boolean }) {
  return <span className={`mf-pixel-coin${small ? ' is-small' : ''}`} aria-hidden="true"><i /><b /></span>
}

function coverVariants(game: InstagameDefinition) {
  if (game.welcome?.variants?.length) return game.welcome.variants
  return [{ id: 'current', label: 'Current cover', image: '', unlockScore: 0 }]
}

function isCoverUnlocked(bestScore: number, unlockScore = 0) {
  return PLATFORM_ALPHA_POLICY.allCoverVariantsUnlocked || bestScore >= unlockScore
}

function seededActiveVariant(game: InstagameDefinition, seed: number, bestScore: number) {
  const variants = coverVariants(game)
  const unlocked = variants.filter((variant) => isCoverUnlocked(bestScore, variant.unlockScore))
  const pool = unlocked.length ? unlocked : variants.slice(0, 1)
  return pool[Math.abs(Math.trunc(seed)) % pool.length]?.id ?? variants[0]?.id ?? ''
}

function fallbackComments(author?: string): CommentThread[] {
  return [
    { id: 'mock-1', nickname: 'NovaPixel', body: 'This game is an absolute brain melt (in the best way). Can’t stop chasing a higher score!', age: '2d', likes: 24, role: '999' },
    {
      id: 'mock-2', nickname: 'bricks&coffee', body: 'The core idea is genius. Fresh take on a classic.', age: '1d', likes: 12, role: 'free',
      replies: [{ id: 'mock-2-r1', nickname: author || 'MiniFugg', body: 'So happy you’re enjoying it! More twists coming soon 👀', age: '1d', likes: 28, role: 'creator' }],
    },
    {
      id: 'mock-3', nickname: 'TetrisFan87', body: 'Any tips for getting past 1k? Always choke there…', age: '2d', likes: 6, role: 'free',
      replies: [{ id: 'mock-3-r1', nickname: author || 'MiniFugg', body: 'Try to keep a 2-line buffer and watch for the rare pieces. Practice mode is on the list.', age: '1d', likes: 14, role: 'creator' }],
    },
    { id: 'mock-4', nickname: 'indiepop', body: 'Stunning cover art. Instantly hooked.', age: '3d', likes: 31, role: '999' },
  ]
}

function realComments(comments: GameComment[], author?: string): CommentThread[] {
  return comments.map((comment) => ({
    id: comment.id,
    nickname: comment.nickname || 'MiniFugg player',
    body: comment.body,
    age: new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    likes: 0,
    role: author && comment.nickname.toLowerCase() === author.toLowerCase() ? 'creator' : 'free',
  }))
}

function Avatar({ nickname, role }: { nickname: string, role: CommentRole }) {
  const initial = (nickname.trim()[0] || '?').toUpperCase()
  return <span className={`mf-ui-avatar is-${role}`} aria-hidden="true"><span>{role === 'creator' ? '◆' : role === '999' ? '✦' : initial}</span></span>
}

function CommentCard({ thread, depth = 0, reportedId, onReport }: { thread: CommentThread, depth?: number, reportedId: string, onReport: (id: string) => void }) {
  return (
    <div className={`mf-comment-thread${depth ? ' is-reply' : ''}`}>
      <Avatar nickname={thread.nickname} role={thread.role} />
      <div className="mf-comment-main">
        <div className="mf-comment-meta">
          <strong className="mf-ui-player-name mf-ui-label">{thread.nickname}</strong>
          {thread.role === 'creator' && <span className="mf-ui-badge is-creator">Creator</span>}
          {thread.role === '999' && <span className="mf-ui-badge is-999"><PixelCoin small />999</span>}
          <time className="mf-ui-meta">{thread.age}</time>
          <button className="mf-comment-more mf-ui-icon-action" type="button" onClick={() => onReport(thread.id)} aria-label="Comment menu"><Icon name="more" /></button>
        </div>
        <p className="mf-ui-body">{thread.body}</p>
        <div className="mf-comment-actions mf-ui-micro"><button type="button"><Icon name="comment" />Reply</button><button type="button" className="mf-comment-like"><Icon name="replyHeart" />{thread.likes || ''}</button>{reportedId === thread.id && <span>Report</span>}</div>
      </div>
      {thread.replies?.length ? <div className="mf-comment-replies">{thread.replies.map((reply) => <CommentCard key={reply.id} thread={reply} depth={depth + 1} reportedId={reportedId} onReport={onReport} />)}</div> : null}
    </div>
  )
}

export function PlatformCoverShell(props: Props) {
  const {
    game, catalog, active, seed, coins, cost, social, comments, bestScore, panel, nickname, commentText, launchError,
    onPanel, onClosePanel, onToggleLove, onToggleBookmark, onPlay, onChangeGame, onShare,
    onNicknameChange, onCommentTextChange, onPostComment, onOpenLeaderboard, onSelectCover,
  } = props
  const gesture = useRef<{ pointerId: number, x: number, y: number } | null>(null)
  const [creatorLimit, setCreatorLimit] = useState(20)
  const [reportedId, setReportedId] = useState('')
  const variants = useMemo(() => coverVariants(game), [game])
  const defaultVariantId = useMemo(() => seededActiveVariant(game, seed, bestScore), [bestScore, game, seed])
  const [activeVariantId, setActiveVariantId] = useState(defaultVariantId)

  useEffect(() => setActiveVariantId(defaultVariantId), [defaultVariantId, game.id])
  useEffect(() => setCreatorLimit(20), [game.author, game.id])

  const creatorGames = useMemo(() => game.author ? catalog.filter((candidate) => candidate.author === game.author) : [], [catalog, game.author])
  const threads = comments.length ? [...realComments(comments, game.author), ...fallbackComments(game.author).slice(1, 3)] : fallbackComments(game.author)

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

  const cta = game.status === 'trash' ? 'PLAY FREE' : `INSERT COIN x${cost}`
  const activeCover = variants.find((variant) => variant.id === activeVariantId)

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
          {active && activeCover.runtime === 'phaser-2d' && activeCover.layers?.length ? (
            <PhaserCoverHost
              active={!panel}
              variant={activeCover}
              ariaLabel={`${game.title} — ${activeCover.label}`}
            />
          ) : null}
        </div>
      )}
      <div className="mf-coin-balance" aria-label={`${coins} coins`}><PixelCoin /><strong>{formatSocialCount(coins)}</strong></div>

      <nav className="mf-cover-rail" aria-label="Game actions">
        <button type="button" onClick={() => onPanel('info')} aria-label="Info"><Icon name="info" /></button>
        <button type="button" className={social.loved ? 'is-loved' : ''} onClick={onToggleLove} aria-label="Like"><Icon name="heart" filled={social.loved} /><small>{formatSocialCount(social.loves)}</small></button>
        <button type="button" onClick={() => onPanel('comments')} aria-label="Comments"><Icon name="comment" /><small>{formatSocialCount(social.comments)}</small></button>
        <button type="button" className={social.bookmarked ? 'is-bookmarked' : ''} onClick={onToggleBookmark} aria-label="Bookmark"><Icon name="bookmark" filled={social.bookmarked} /><small>{formatSocialCount(social.bookmarks)}</small></button>
        <button type="button" onClick={onShare} aria-label="Share"><Icon name="share" /></button>
      </nav>

      <div className="mf-cover-bottom">
        <button className="mf-change-game" type="button" onClick={onChangeGame}><span>⌃</span>CHANGE GAME</button>
        <button className={`mf-insert-coin${game.status === 'trash' ? ' is-free' : ''}`} type="button" onClick={onPlay}>
          <span>{cta}</span>
          {game.status !== 'trash' && <span className={`mf-insert-coins is-${cost}`} aria-hidden="true">{Array.from({ length: cost }, (_, index) => <PixelCoin key={index} />)}</span>}
          <b>&gt;&gt;</b>
        </button>
        {launchError && <p className="mf-launch-error mf-ui-meta">{launchError}</p>}
      </div>

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
                <p className="mf-ui-meta">by <strong className="mf-ui-player-name mf-ui-label">{game.author || 'MiniFugg'}</strong></p>
                <p className="mf-info-description mf-ui-body">{game.description}</p>
                <p className="mf-info-version mf-ui-meta">Version 0.1 <span>•</span> Last update Sep 6, 2026</p>
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
                <div className="mf-creator-card"><Avatar nickname={game.author || 'MiniFugg'} role="creator" /><div><strong className="mf-ui-player-name mf-ui-label">{game.author || 'MiniFugg'}</strong><p className="mf-ui-body">Small games. Big thoughts. Tiny experiments built to be played immediately.</p><span className="mf-ui-meta">{creatorGames.length} game{creatorGames.length === 1 ? '' : 's'}</span></div></div>
                <h3 className="mf-ui-h3">MORE GAMES BY {game.author || 'MINIFUGG'}</h3>
                <div className="mf-creator-grid">
                  {creatorGames.slice(0, creatorLimit).map((creatorGame) => (
                    <article key={creatorGame.id}>
                      {creatorGame.welcome?.variants?.[0]?.image ? <img src={creatorGame.welcome.variants[0].image} alt="" /> : <div className="mf-creator-cover-fallback">{creatorGame.title.slice(0, 2).toUpperCase()}</div>}
                      <strong className="mf-ui-label">{creatorGame.title}</strong>
                    </article>
                  ))}
                </div>
                {creatorLimit < creatorGames.length && <button className="mf-show-more mf-ui-action mf-ui-label" type="button" onClick={() => setCreatorLimit((value) => value + 20)}>SHOW 20 MORE</button>}
              </section>
            </div>
          ) : (
            <div className="mf-comments-panel">
              <div className="mf-comments-scroll mf-ui-scroll">
                {threads.map((thread) => <CommentCard key={thread.id} thread={thread} reportedId={reportedId} onReport={(id) => setReportedId((current) => current === id ? '' : id)} />)}
              </div>
              <div className="mf-comment-composer">
                <Avatar nickname={nickname || 'Player'} role="free" />
                <input className="mf-comment-nickname" value={nickname} onChange={(event) => onNicknameChange(event.target.value.slice(0, 20))} aria-label="Nickname" maxLength={20} />
                <textarea className="mf-ui-field" value={commentText} onChange={(event) => onCommentTextChange(event.target.value.slice(0, 500))} placeholder="Write a comment…" rows={1} maxLength={500} />
                <button className="mf-ui-icon-action" type="button" onClick={onPostComment} disabled={!nickname.trim() || !commentText.trim()} aria-label="Post comment"><Icon name="send" /></button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
