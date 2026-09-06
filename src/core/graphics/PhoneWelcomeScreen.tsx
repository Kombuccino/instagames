import { useEffect, useState } from 'react'
import './phoneWelcomeScreen.css'

const PHONE_SCREEN_ROOT = '/assets/imported/platform/entry-scenes/metro-moment-v1/phone-screen-v1'
const BACKGROUND_ART = `${PHONE_SCREEN_ROOT}/screen-background.png`
const DANCE_FRAMES = Array.from(
  { length: 5 },
  (_, index) => `${PHONE_SCREEN_ROOT}/dance/fuggy-dance-${String(index + 1).padStart(2, '0')}.png`,
)

// Ping-pong the five generated poses so the hips/legs return smoothly instead
// of snapping from the last pose straight back to the first one.
const DANCE_SEQUENCE = [0, 1, 2, 3, 4, 3, 2, 1] as const
const FRAME_DURATION_MS = 190

type PhoneWelcomeScreenProps = {
  paused?: boolean
}

export function PhoneWelcomeScreen({ paused = false }: PhoneWelcomeScreenProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    ;[BACKGROUND_ART, ...DANCE_FRAMES].forEach((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
    })
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % DANCE_SEQUENCE.length)
    }, FRAME_DURATION_MS)
    return () => window.clearInterval(timer)
  }, [paused])

  const frame = DANCE_FRAMES[DANCE_SEQUENCE[step]]

  return (
    <div className="mf-phone-welcome" aria-hidden="true">
      <img
        className="mf-phone-welcome__background"
        src={BACKGROUND_ART}
        alt=""
        draggable={false}
        decoding="sync"
      />
      <span className="mf-phone-welcome__dance-stage">
        <img
          className="mf-phone-welcome__dancer"
          src={frame}
          alt=""
          draggable={false}
          decoding="async"
        />
      </span>
      <span className="mf-phone-welcome__cta-pulse" />
    </div>
  )
}
