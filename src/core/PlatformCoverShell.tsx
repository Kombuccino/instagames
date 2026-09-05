import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { GameComment, GameSocialStats } from './social'
import type { InstagameDefinition } from './types'
import './platformCover.css'

export type PlatformPanel = 'info' | 'comments' | null

type Props = {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
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
type CommentRole = 'free' | 'creator' | 'lifetime'
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

const CORE_KNOWN_COVERS = {
  tetramindfck: [
    { id: 'pulp-euro', label: 'Pulp européen', image: '/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.webp', unlockScore: 0 },
    { id: 'micro-euro', label: 'Micro Europe 90s', image: '/assets/imported/tetramindfck/welcome/variants/v2-micro-euro.webp', unlockScore: 5_000 },
    { id: 'graphic-poster', label: 'Affiche graphique', image: '/assets/imported/tetramindfck/welcome/variants/v3-graphic-poster.webp', unlockScore: 15_000 },
  ],
} satisfies Partial<Record<string, NonNullable<InstagameDefinition['welcome']>['variants']>>

function coverVariants(game: InstagameDefinition) {
  if (game.welcome?.variants?.length) return game.welcome.variants
  const known = CORE_KNOWN_COVERS[game.id as keyof typeof CORE_KNOWN_COVERS]
  if (known?.length) return known
  return [
    { id: 'current', label: 'Current cover', image: '', unlockScore: 0 },
    { id: 'locked-1', label: 'Locked edition', image: '', unlockScore: 5_000 },
    { id: 'locked-2', label: 'Locked edition', image: '', unlockScore: 15_000 },
    { id: 'locked-3', label: 'Locked edition', image: '', unlockScore: 30_000 },
  ]
}

function seededActiveVariant(game: InstagameDefinition, seed: number, bestScore: number) {
  const variants = coverVariants(game)
  const unlocked = variants.filter((variant) => bestScore >= (variant.unlockScore ?? 0))
  const pool = unlocked.length ? unlocked : variants.slice(0, 1)
  return pool[Math.abs(Math.trunc(seed)) % pool.length]?.id ?? variants[0]?.id ?? ''
}

function fallbackComments(author?: string): CommentThread[] {
  return [
    { id: 'mock-1', nickname: 'NovaPixel', body: 'This game is an absolute brain melt (in the best way). Can’t stop chasing a higher score!', age: '2d', likes: 24, role: 'lifetime' },
    {
      id: 'mock-2', nickname: 'bricks&coffee', body: 'The core idea is genius. Fresh take on a classic.', age: '1d', likes: 12, role: 'free',
      replies: [{ id: 'mock-2-r1', nickname: author || 'MiniFugg', body: 'So happy you’re enjoying it! More twists coming soon 👀', age: '1d', likes: 28, role: 'creator' }],
    },
    {
      id: 'mock-3', nickname: 'TetrisFan87', body: 'Any tips for getting past 1k? Always choke there…', age: '2d', likes: 6, role: 'free',
      replies: [{ id: 'mock-3-r1', nickname: author || 'MiniFugg', body: 'Try to keep a 2-line buffer and watch for the rare pieces. Practice mode is on the list.', age: '1d', likes: 14, role: 'creator' }],
    },
    { id: 'mock-4', nickname: 'indiepop', body: 'Stunning cover art. Instantly hooked.', age: '3d', likes: 31, role: 'lifetime' },
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
  return <span className={`mf-comment-avatar is-${role}`} aria-hidden="true"><span>{role === 'creator' ? '◆' : role === 'lifetime' ? '✦' : initial}</span></span>
}

function CommentCard({ thread, depth = 0, reportedId, onReport }: { thread: CommentThread, depth?: number, reportedId: string, onReport: (id: string) => void }) {
  return (
    <div className={`mf-comment-thread${depth ? ' is-reply' : ''}`}>
      <Avatar nickname={thread.nickname} role={thread.role} />
      <div className="mf-comment-main">
        <div className="mf-comment-meta">
          <strong>{thread.nickname}</strong>
          {thread.role === 'creator' && <span className="mf-badge is-creator">Creator</span>}
          {thread.role === 'lifetime' && <span className="mf-badge is-999"><PixelCoin small />999</span>}
          <time>{thread.age}</time>
          <button className="mf-comment-more" type="button" onClick={() => onReport(thread.id)} aria-label="Comment menu"><Icon name="more" /></button>
        </div>
        <p>{thread.body}</p>
        <div className="mf-comment-actions"><button type="button"><Icon name="comment" />Reply</button><button type="button" className="mf-comment-like"><Icon name="replyHeart" />{thread.likes || ''}</button>{reportedId === thread.id && <span>Report</span>}</div>
      </div>
      {thread.replies?.length ? <div className="mf-comment-replies">{thread.replies.map((reply) => <CommentCard key={reply.id} thread={reply} depth={depth + 1} reportedId={reportedId} onReport={onReport} />)}</div> : null}
    </div>
  )
}

export function PlatformCoverShell(props: Props) {
  const {
    game, catalog, seed, coins, cost, social, comments, bestScore, panel, nickname, commentText, launchError,
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
    <div className="mf-cover-shell" onPointerDown={beginGesture} onPointerUp={endGesture} onPointerCancel={() => { gesture.current = null }}>
      {activeCover?.image && <div className="mf-core-selected-cover" aria-hidden="true"><img src={activeCover.image} alt="" draggable={false} /></div>}
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
        {launchError && <p className="mf-launch-error">{launchError}</p>}
      </div>

      {panel && (
        <section className="mf-platform-panel" role="dialog" aria-modal="true" aria-label={panel === 'info' ? 'Game information' : 'Comments'}>
          <header className="mf-panel-tabs">
            <button type="button" className={panel === 'info' ? 'is-active' : ''} onClick={() => onPanel('info')}>INFO</button>
            <button type="button" className={panel === 'comments' ? 'is-active' : ''} onClick={() => onPanel('comments')}>COMMENTS</button>
            <button type="button" className="mf-panel-close" onClick={onClosePanel} aria-label="Close"><Icon name="close" /></button>
          </header>

          {panel === 'info' ? (
            <div className="mf-panel-scroll mf-info-panel">
              <section className="mf-cover-selection">
                <h2>COVER SELECTION</h2>
                <div className="mf-cover-grid">
                  {variants.map((variant) => {
                    const unlocked = bestScore >= (variant.unlockScore ?? 0)
                    const activeVariant = activeVariantId === variant.id
                    return (
                      <button key={variant.id} type="button" className={`${activeVariant ? 'is-active' : ''}${unlocked ? '' : ' is-locked'}`} onClick={() => selectCover(variant.id, unlocked)} disabled={!unlocked}>
                        {variant.image ? <img src={variant.image} alt="" /> : <span className="mf-cover-fallback">{game.title.slice(0, 2).toUpperCase()}</span>}
                        {activeVariant && <em>ACTIVE</em>}
                        {!unlocked && <span className="mf-cover-lock">▣</span>}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="mf-game-info-head">
                <h1>{game.title}</h1>
                <p>by <strong>{game.author || 'MiniFugg'}</strong></p>
                <p className="mf-info-description">{game.description}</p>
                <p className="mf-info-version">Version 0.1 <span>•</span> Last update Sep 6, 2026</p>
              </section>

              <section className="mf-high-score">
                <div><span>🏆</span><p>HIGH SCORE<small>Your best score</small><strong>{formatSocialCount(bestScore)}</strong></p></div>
                <button type="button" onClick={onOpenLeaderboard}>View leaderboard <Icon name="chevron" /></button>
              </section>

              <section className="mf-how-to-play">
                <h2>HOW TO PLAY</h2>
                {game.instructions ? <ol>{game.instructions.rules.slice(0, 6).map((rule, index) => <li key={rule}><span>{index + 1}</span>{rule}</li>)}</ol> : <p>Open the game, learn by playing, then chase a better score.</p>}
              </section>

              <section className="mf-creator-section">
                <h2>CREATOR</h2>
                <div className="mf-creator-card"><Avatar nickname={game.author || 'MiniFugg'} role="creator" /><div><strong>{game.author || 'MiniFugg'}</strong><p>Small games. Big thoughts. Tiny experiments built to be played immediately.</p><span>{creatorGames.length} game{creatorGames.length === 1 ? '' : 's'}</span></div></div>
                <h3>MORE GAMES BY {game.author || 'MINIFUGG'}</h3>
                <div className="mf-creator-grid">
                  {creatorGames.slice(0, creatorLimit).map((creatorGame) => (
                    <article key={creatorGame.id}>
                      {creatorGame.welcome?.variants?.[0]?.image ? <img src={creatorGame.welcome.variants[0].image} alt="" /> : <div className="mf-creator-cover-fallback">{creatorGame.title.slice(0, 2).toUpperCase()}</div>}
                      <strong>{creatorGame.title}</strong>
                    </article>
                  ))}
                </div>
                {creatorLimit < creatorGames.length && <button className="mf-show-more" type="button" onClick={() => setCreatorLimit((value) => value + 20)}>SHOW 20 MORE</button>}
              </section>
            </div>
          ) : (
            <div className="mf-comments-panel">
              <div className="mf-comments-scroll">
                {threads.map((thread) => <CommentCard key={thread.id} thread={thread} reportedId={reportedId} onReport={(id) => setReportedId((current) => current === id ? '' : id)} />)}
              </div>
              <div className="mf-comment-composer">
                <Avatar nickname={nickname || 'Player'} role="free" />
                <input className="mf-comment-nickname" value={nickname} onChange={(event) => onNicknameChange(event.target.value.slice(0, 20))} aria-label="Nickname" maxLength={20} />
                <textarea value={commentText} onChange={(event) => onCommentTextChange(event.target.value.slice(0, 500))} placeholder="Write a comment…" rows={1} maxLength={500} />
                <button type="button" onClick={onPostComment} disabled={!nickname.trim() || !commentText.trim()} aria-label="Post comment"><Icon name="send" /></button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
