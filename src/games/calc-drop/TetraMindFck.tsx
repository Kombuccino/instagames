import { useMemo, useState } from 'react'
import { FuggWelcome, readWelcomeBestScore, recordWelcomeBestScore } from '../../core/FuggWelcome'
import type { GameComponentProps, GameWelcomeVariant } from '../../core/types'
import { CalcDrop } from './CalcDrop'

const GAME_ID = 'tetramindfck'

const WELCOME_VARIANTS: GameWelcomeVariant[] = [
  {
    id: 'pulp-euro',
    label: 'Pulp européen',
    image: '/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.webp',
    unlockScore: 0,
    layers: [
      {
        role: 'background',
        image: '/assets/imported/tetramindfck/welcome/parallax/v1/bg.webp',
        scale: 100,
        parallaxX: 0,
        parallaxY: 0,
        motion: { type: 'none' },
      },
      {
        role: 'midground',
        image: '/assets/imported/tetramindfck/welcome/parallax/v1/burst.webp',
        scale: 75.5,
        y: -16,
        parallaxX: 0,
        parallaxY: 0,
        motion: {
          type: 'breathe',
          speed: 3.65,
          intensity: 20,
          direction: 180,
          irregularity: 1,
        },
        fx: {
          blur: .25,
          glow: 0,
        },
      },
      {
        role: 'foreground',
        image: '/assets/imported/tetramindfck/welcome/parallax/v1/subject.webp',
        scale: 72,
        y: 17.5,
        parallaxX: 0,
        parallaxY: 0,
        motion: {
          type: 'vibrate',
          speed: 1.7,
          intensity: 1.25,
          direction: -76,
          irregularity: .95,
        },
      },
      {
        role: 'overlay',
        image: '/assets/imported/tetramindfck/welcome/parallax/v1/title.webp',
        scale: 90.5,
        y: 4,
        parallaxX: .8,
        parallaxY: .6,
        motion: { type: 'none' },
      },
    ],
  },
  {
    id: 'micro-euro',
    label: 'Micro Europe 90s',
    image: '/assets/imported/tetramindfck/welcome/variants/v2-micro-euro.webp',
    unlockScore: 5_000,
    layers: [
      {
        role: 'background',
        image: '/assets/imported/tetramindfck/welcome/parallax/v2/bg.webp',
        scale: 100,
        parallaxX: 0,
        parallaxY: 0,
        motion: { type: 'none' },
      },
      {
        role: 'midground',
        image: '/assets/imported/tetramindfck/welcome/parallax/v2/midground.webp',
        scale: 100,
        parallaxX: 0,
        parallaxY: 0,
        motion: { type: 'none' },
      },
      {
        role: 'foreground',
        image: '/assets/imported/tetramindfck/welcome/parallax/v2/subject.webp',
        scale: 100,
        parallaxX: 0,
        parallaxY: 0,
        motion: { type: 'none' },
      },
      {
        role: 'overlay',
        image: '/assets/imported/tetramindfck/welcome/parallax/v2/title.webp',
        scale: 100,
        parallaxX: 0,
        parallaxY: 0,
        motion: { type: 'none' },
      },
    ],
  },
  {
    id: 'graphic-poster',
    label: 'Affiche graphique',
    image: '/assets/imported/tetramindfck/welcome/variants/v3-graphic-poster.webp',
    unlockScore: 15_000,
  },
]

export function TetraMindFck(props: GameComponentProps) {
  const [welcomeOpen, setWelcomeOpen] = useState(true)
  const [bestScore, setBestScore] = useState(() => readWelcomeBestScore(GAME_ID))

  const session = useMemo(() => ({
    setScore: props.session.setScore,
    finish: (payload: Parameters<GameComponentProps['session']['finish']>[0]) => {
      setBestScore(recordWelcomeBestScore(GAME_ID, payload.score))
      props.session.finish(payload)
    },
  }), [props.session])

  return (
    <>
      <CalcDrop
        {...props}
        active={props.active && !welcomeOpen}
        session={session}
      />
      {welcomeOpen && (
        <FuggWelcome
          gameId={GAME_ID}
          title="TetraMindFck"
          seed={props.seed}
          active={props.active}
          bestScore={bestScore}
          variants={WELCOME_VARIANTS}
          onPlay={() => setWelcomeOpen(false)}
        />
      )}
    </>
  )
}
