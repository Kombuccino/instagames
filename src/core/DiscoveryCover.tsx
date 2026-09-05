import { useState, type ReactNode } from 'react'
import './discoveryCover.css'

type CoverIconName = 'info' | 'heart' | 'comment' | 'bookmark' | 'share'

type DiscoveryCoverProps = {
  title: string
  art: string
  coinBalance: number
  cost: number
  likeCount?: string
  commentCount?: string
  bookmarkCount?: string
  interactive?: boolean
  onPlay?: () => void
  onInfo?: () => void
  onComments?: () => void
  onShare?: () => void
}

function CoverIcon({ name, filled = false }: { name: CoverIconName, filled?: boolean }) {
  let content: ReactNode

  if (name === 'info') {
    content = <><circle cx="12" cy="12" r="9" /><path d="M12 10.7v6" /><circle cx="12" cy="7.4" r=".7" className="mf-cover-icon-dot" /></>
  } else if (name === 'heart') {
    content = <path d="M12 20.3s-7.2-4.4-9.5-8.6C.5 8 2.1 4.5 5.8 4.1c2.1-.2 4.1.8 5.2 2.5 1.1-1.7 3.1-2.7 5.2-2.5 3.7.4 5.3 3.9 3.3 7.6-2.3 4.2-9.5 8.6-9.5 8.6Z" />
  } else if (name === 'comment') {
    content = <path d="M20.5 11.4a8.4 8.4 0 0 1-8.7 8.1 9.4 9.4 0 0 1-3.2-.6L4 20l1.4-3.7a7.7 7.7 0 0 1-1.9-5.1A8.4 8.4 0 0 1 12.2 3a8.4 8.4 0 0 1 8.3 8.4Z" />
  } else if (name === 'bookmark') {
    content = <path d="M6.4 3.2h11.2c.8 0 1.4.6 1.4 1.4v16.2l-7-4.5-7 4.5V4.6c0-.8.6-1.4 1.4-1.4Z" />
  } else {
    content = <><circle cx="18" cy="5.5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="18.5" r="2.2" /><path d="m8 11 7.8-4.3M8 13l7.8 4.3" /></>
  }

  return (
    <svg className="mf-cover-icon" viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'}>
      {content}
    </svg>
  )
}

function PixelCoin({ small = false }: { small?: boolean }) {
  return <span className={`mf-pixel-coin${small ? ' is-small' : ''}`} aria-hidden="true"><i /></span>
}

export function DiscoveryCover({
  title,
  art,
  coinBalance,
  cost,
  likeCount = '2.4k',
  commentCount = '186',
  bookmarkCount = '12k',
  interactive = true,
  onPlay,
  onInfo,
  onComments,
  onShare,
}: DiscoveryCoverProps) {
  const [liked, setLiked] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <section className="mf-discovery-cover" aria-label={`${title} cover`}>
      <img className="mf-discovery-cover__art" src={art} alt="" draggable={false} />
      <div className="mf-discovery-cover__shade" aria-hidden="true" />

      <div className="mf-discovery-cover__balance" aria-label={`${coinBalance} coins`}>
        <PixelCoin small />
        <strong>{coinBalance}</strong>
      </div>

      <nav className="mf-discovery-cover__rail" aria-label="Game actions">
        <button type="button" onClick={onInfo} disabled={!interactive} aria-label="Info">
          <CoverIcon name="info" />
        </button>
        <button
          type="button"
          className={liked ? 'is-active is-like' : ''}
          onClick={() => interactive && setLiked((value) => !value)}
          disabled={!interactive}
          aria-label="Like"
          aria-pressed={liked}
        >
          <CoverIcon name="heart" filled={liked} />
          <small>{likeCount}</small>
        </button>
        <button type="button" onClick={onComments} disabled={!interactive} aria-label="Comments">
          <CoverIcon name="comment" />
          <small>{commentCount}</small>
        </button>
        <button
          type="button"
          className={bookmarked ? 'is-active' : ''}
          onClick={() => interactive && setBookmarked((value) => !value)}
          disabled={!interactive}
          aria-label="Bookmark"
          aria-pressed={bookmarked}
        >
          <CoverIcon name="bookmark" filled={bookmarked} />
          <small>{bookmarkCount}</small>
        </button>
        <button type="button" onClick={onShare} disabled={!interactive} aria-label="Share">
          <CoverIcon name="share" />
        </button>
      </nav>

      <button className="mf-discovery-cover__change" type="button" disabled={!interactive} aria-label="Change game">
        <span aria-hidden="true">⌃</span>
        <strong>CHANGE GAME</strong>
      </button>

      <button
        className="mf-discovery-cover__play"
        type="button"
        onClick={onPlay}
        disabled={!interactive}
        aria-label={`Insert coin, ${cost} coins`}
      >
        <span>INSERT COIN x{cost}</span>
        <span className="mf-discovery-cover__coin-pair" aria-hidden="true"><PixelCoin /><PixelCoin /></span>
        <b>&gt;&gt;</b>
      </button>
    </section>
  )
}
