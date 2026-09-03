import { useRef, useState } from 'react'
import type { ComponentType, PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps, GameCurationStatus } from './types'
import './statusWelcome.css'

const SWIPE_THRESHOLD = 44

type StatusWelcomeProps = {
  title: string
  description: string
  status: Exclude<GameCurationStatus, 'fugg'>
  active: boolean
  onPlay: () => void
}

function StatusWelcome({ title, description, status, active, onPlay }: StatusWelcomeProps) {
  const swipeRef = useRef<{ pointerId: number, startY: number } | null>(null)
  const isBeta = status === 'beta'

  const beginSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return
    swipeRef.current = { pointerId: event.pointerId, startY: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const endSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current
    swipeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!swipe || swipe.pointerId !== event.pointerId) return
    if (swipe.startY - event.clientY >= SWIPE_THRESHOLD) onPlay()
  }

  const cancelSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <section
      className={`mf-status-welcome is-${isBeta ? 'beta' : 'caca'}`}
      data-active={active ? 'true' : 'false'}
      aria-label={`${title} — ${isBeta ? 'bêta' : 'caca'}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onPlay()
        }
      }}
    >
      <div className="mf-status-welcome-bg" aria-hidden="true" />
      <div className="mf-status-welcome-card">
        <div className="mf-status-mini-cover" aria-hidden="true">
          <small>MiniFugg</small>
          <strong>{title}</strong>
          <span>{description}</span>
          <b>{isBeta ? 'BÊTA' : 'CACA'}</b>
        </div>

        <div className="mf-status-copy">
          <p className="mf-status-kicker">{isBeta ? 'ENCORE DU BOULOT' : 'BOÎTE À CACA'}</p>
          <h1>{isBeta ? 'Ce jeu est en BÊTA.' : 'À tes risques et périls.'}</h1>
          {isBeta ? (
            <p>Il est jouable, mais il reste des bugs, des réglages et probablement des idées bancales. Joue, casse-le, puis raconte-nous ce qui cloche dans les commentaires.</p>
          ) : (
            <p>Ce jeu peut être cassé, bizarre, injuste ou abandonné. Il sortira peut-être un jour de la boîte à caca. Peut-être jamais.</p>
          )}
        </div>
      </div>

      <div
        className="mf-status-welcome-interaction"
        onPointerDown={beginSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={cancelSwipe}
        aria-hidden="true"
      />

      <button type="button" className="mf-status-welcome-play" onClick={onPlay}>
        <span>SWIPE TO PLAY</span><b>↑</b>
      </button>
    </section>
  )
}

export function withStatusWelcome(
  status: Exclude<GameCurationStatus, 'fugg'>,
  title: string,
  description: string,
  Game: ComponentType<GameComponentProps>,
) {
  return function StatusWelcomeGame(props: GameComponentProps) {
    const [welcomeOpen, setWelcomeOpen] = useState(true)

    return (
      <>
        <Game {...props} active={props.active && !welcomeOpen} />
        {welcomeOpen && (
          <StatusWelcome
            title={title}
            description={description}
            status={status}
            active={props.active}
            onPlay={() => setWelcomeOpen(false)}
          />
        )}
      </>
    )
  }
}
