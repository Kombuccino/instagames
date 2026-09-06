import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useTetraMindFckMusic } from '../../music/reactiveGameMusic'
import { CalcDrop } from './CalcDrop'
import { useTetraMindFckSfx } from './useTetraSfx'

export function TetraMindFck(props: GameComponentProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [runFinished, setRunFinished] = useState(false)
  const gameplayActive = props.active && !runFinished

  const music = useTetraMindFckMusic({
    rootRef: shellRef,
    armed: props.active,
    playing: gameplayActive,
    seed: props.seed,
    restartToken: props.restartToken,
  })

  useTetraMindFckSfx({
    rootRef: shellRef,
    armed: props.active,
    playing: gameplayActive,
    runFinished,
    restartToken: props.restartToken,
  })

  useEffect(() => {
    setRunFinished(false)
  }, [props.restartToken, props.seed])

  const session = useMemo(() => ({
    setScore: props.session.setScore,
    finish: (payload: Parameters<GameComponentProps['session']['finish']>[0]) => {
      setRunFinished(true)
      props.session.finish({
        ...payload,
        metadata: {
          ...(payload.metadata ?? {}),
          musicId: music.compositionId ?? 'none',
        },
      })
    },
  }), [music.compositionId, props.session])

  return (
    <div ref={shellRef} style={{ display: 'contents' }}>
      <CalcDrop
        {...props}
        active={gameplayActive}
        session={session}
      />
    </div>
  )
}
