import { useMemo, useState } from 'react'
import { FuggWelcome, readWelcomeBestScore, recordWelcomeBestScore } from '../../core/FuggWelcome'
import type { GameComponentProps, GameWelcomeVariant } from '../../core/types'
import { CalcDrop } from './CalcDrop'

const GAME_ID = 'tetramindfck'

const WELCOME_VARIANTS: GameWelcomeVariant[] = [
  {
    id: 'pulp-euro',
    label: 'Pulp européen',
    image: '/assets/imported/tetramindfck-welcome-v1-pulp-euro.webp',
    unlockScore: 0,
    layers: [
      {
        role: 'background',
        image: '/assets/imported/tetramindfck-welcome-v1-parallax-bg.webp',
        scale: 104,
        parallaxX: 2.2,
        parallaxY: 1.6,
        motion: { type: 'none' },
      },
      {
        role: 'midground',
        image: '/assets/imported/tetramindfck-welcome-v1-parallax-burst.webp',
        scale: 103,
        parallaxX: 6.5,
        parallaxY: 4.5,
        motion: { type: 'float', intensity: 4, speed: .7, direction: -90 },
      },
      {
        role: 'foreground',
        image: '/assets/imported/tetramindfck-welcome-v1-parallax-subject.webp',
        scale: 102,
        y: 2,
        parallaxX: 10,
        parallaxY: 7.5,
        motion: { type: 'vibrate', intensity: 1.4, speed: 1.15, irregularity: .8 },
      },
      {
        role: 'overlay',
        image: '/assets/imported/tetramindfck-welcome-v1-parallax-title.webp',
        scale: 100,
        parallaxX: .8,
        parallaxY: .6,
        motion: { type: 'none' },
      },
    ],
  },
  {
    id: 'micro-euro',
    label: 'Micro Europe 90s',
    image: '/assets/imported/tetramindfck-welcome-v2-micro-euro.webp',
    unlockScore: 5_000,
  },
  {
    id: 'graphic-poster',
    label: 'Affiche graphique',
    image: '/assets/imported/tetramindfck-welcome-v3-graphic-poster.webp',
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
