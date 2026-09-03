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
