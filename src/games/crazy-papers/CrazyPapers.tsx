import { useCallback, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { CRAZY_PAPERS_SCENE_KEY, CrazyPapersScene } from './CrazyPapersScene'

export function CrazyPapers({ active, seed, restartToken, session }: GameComponentProps) {
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session

  const createScene = useCallback(() => new CrazyPapersScene({
    seed,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => sessionRef.current.finish(payload),
    },
  }), [seed])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#302d25' }}>
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={DEFAULT_LOGICAL_VIEWPORTS.portrait}
        sceneKey={CRAZY_PAPERS_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        ariaLabel="CrazyPapers. Trie les dossiers vers cinq services avec les tampons. Les piles montent et une vague de paperasse descend quand le bureau sature."
      />
    </div>
  )
}
