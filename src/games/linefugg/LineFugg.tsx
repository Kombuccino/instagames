import { useCallback, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { LINEFUGG_SCENE_KEY, LineFuggScene } from './LineFuggScene'

export function LineFugg({ active, seed, restartToken, session }: GameComponentProps) {
  const sessionRef = useRef(session)
  sessionRef.current = session

  const createScene = useCallback(() => new LineFuggScene({
    seed,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => sessionRef.current.finish(payload),
    },
  }), [seed])

  return (
    <PhaserGameHost
      active={active}
      restartToken={restartToken}
      logicalViewport={DEFAULT_LOGICAL_VIEWPORTS.portrait}
      sceneKey={LINEFUGG_SCENE_KEY}
      createScene={createScene}
      ariaLabel="LineFugg. Grille 7 par 7. Trace trois lignes de cinq cases maximum."
    />
  )
}
