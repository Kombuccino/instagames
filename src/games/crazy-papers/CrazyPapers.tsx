import { useCallback, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'
import {
  CRAZY_PAPERS_SCENE_KEY,
  CrazyPapersScene,
  type CrazyPapersSceneBridge,
} from './CrazyPapersScene'

class CrazyPapersViewportScene extends CrazyPapersScene {
  private readonly renderPixelRatio: number

  constructor(bridge: CrazyPapersSceneBridge, renderPixelRatio: number) {
    super(bridge)
    this.renderPixelRatio = renderPixelRatio
  }

  create() {
    // This production scene predates the 390 × 850 contract. Preserve its
    // 390 × 844 authored world while mirroring raster density in the camera.
    this.cameras.main
      .setZoom(this.renderPixelRatio)
      .centerOn(
        MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.width / 2,
        MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.height / 2,
      )
    super.create()
  }
}

export function CrazyPapers({ active, seed, restartToken, session }: GameComponentProps) {
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session

  const createScene = useCallback(() => new CrazyPapersViewportScene({
    seed,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => sessionRef.current.finish(payload),
    },
  }, renderPixelRatio), [renderPixelRatio, seed])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#302d25' }}>
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={MINIFUGG_LEGACY_PORTRAIT_VIEWPORT}
        sceneKey={CRAZY_PAPERS_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        ariaLabel="CrazyPapers. Trie les dossiers vers cinq services avec les tampons. Les piles montent et une vague de paperasse descend quand le bureau sature."
      />
    </div>
  )
}
