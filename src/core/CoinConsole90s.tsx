import { useEffect, useRef, useState } from 'react'
import { miniFuggAudio } from '../audio'

const ASSET_ROOT = '/assets/generated/platform/ui/coin-console-90s'

type Props = {
  fixed?: boolean
  coins: number
  cost: number
  free: boolean
  launchError: string
  onPlay: () => void
  onChangeGame: (direction?: -1 | 1) => void
}

type Timer = ReturnType<typeof window.setTimeout>

export function CoinConsole90s({ fixed = false, coins, cost, free, launchError, onPlay, onChangeGame }: Props) {
  const timers = useRef<Timer[]>([])
  const [pressed, setPressed] = useState(false)
  const [sequence, setSequence] = useState(0)
  const [visibleDebits, setVisibleDebits] = useState(0)
  const inserting = sequence > 0
  const price = free ? 0 : Math.max(0, Math.trunc(cost))
  const canAfford = free || coins >= price

  const later = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])

  useEffect(() => {
    setSequence(0)
    setVisibleDebits(0)
    setPressed(false)
  }, [coins, cost])

  const start = () => {
    if (inserting) return
    if (!canAfford) {
      onPlay()
      return
    }

    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setPressed(true)
    setVisibleDebits(0)
    void miniFuggAudio.playUi('common.move', { owner: 'core-coin-console' })
    later(() => setPressed(false), 115)

    setSequence((value) => value + 1)
    if (price === 0) {
      later(onPlay, 240)
      return
    }

    Array.from({ length: price }, (_, index) => {
      const arrival = 500 + index * 360
      later(() => {
        setVisibleDebits(index + 1)
        void miniFuggAudio.playUi('common.coinInsert', { owner: 'core-coin-console', ignoreCooldown: true })
      }, arrival)
    })
    later(onPlay, 620 + Math.max(0, price - 1) * 360)
  }

  return (
    <div className={`mf-coin-console-system${fixed ? ' is-fixed' : ''}`}>
      <div className="mf-coin-balance mf-coin-balance-90s" aria-label={`${Math.max(0, coins - visibleDebits)} coins`}>
        <img src={`${ASSET_ROOT}/coin-counter-frame.webp`} alt="" />
        <strong>{Math.max(0, coins - visibleDebits)}</strong>
        {Array.from({ length: Math.min(price, 2) }, (_, index) => (
          <span key={`${sequence}:${index}`} className={`mf-coin-debit is-${index + 1}`} aria-hidden="true">-1</span>
        ))}
      </div>

      <div className={`mf-coin-console-90s${inserting ? ' is-inserting' : ''}`} data-sequence={sequence}>
        <img className="mf-coin-console-chassis" src={`${ASSET_ROOT}/console-chassis.webp`} alt="" />

        <button className="mf-console-nav is-prev" type="button" onClick={() => onChangeGame(-1)} disabled={inserting} aria-label="Previous game">
          <img className="is-idle" src={`${ASSET_ROOT}/prev-idle.webp`} alt="PREV GAME" />
          <img className="is-pressed" src={`${ASSET_ROOT}/prev-pressed.webp`} alt="" />
        </button>
        <button className="mf-console-nav is-next" type="button" onClick={() => onChangeGame(1)} disabled={inserting} aria-label="Next game">
          <img className="is-idle" src={`${ASSET_ROOT}/next-idle.webp`} alt="NEXT GAME" />
          <img className="is-pressed" src={`${ASSET_ROOT}/next-pressed.webp`} alt="" />
        </button>

        <button
          className={`mf-console-play${pressed ? ' is-pressed' : ''}`}
          type="button"
          onClick={start}
          disabled={inserting}
          aria-label={free ? 'Play free' : `Play for ${price} coin${price === 1 ? '' : 's'}`}
          data-testid="coin-console-play"
        >
          <span className="mf-console-play-visual" aria-hidden="true">
            <span className="mf-console-play-frame is-idle" />
            <span className="mf-console-play-frame is-warm" />
            <span className="mf-console-play-frame is-hot" />
            <span className="mf-console-play-frame is-down" />
          </span>
        </button>

        {Array.from({ length: Math.min(price, 2) }, (_, index) => (
          <span key={`${sequence}:coin:${index}`} className={`mf-local-insert-coin is-${index + 1}`} aria-hidden="true">
            <img className="is-front" src={`${ASSET_ROOT}/coin-front.webp`} alt="" />
            <img className="is-yaw-30" src={`${ASSET_ROOT}/coin-yaw-30.webp`} alt="" />
            <img className="is-yaw-65" src={`${ASSET_ROOT}/coin-yaw-65.webp`} alt="" />
            <img className="is-edge" src={`${ASSET_ROOT}/coin-edge.webp`} alt="" />
          </span>
        ))}
      </div>

      {launchError && <p className="mf-launch-error mf-ui-meta">{launchError}</p>}
    </div>
  )
}
