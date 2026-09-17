import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'
import { miniFuggAudio } from '../../audio'
import { VLADS_SKEWERS_SCENE_KEY, VladsSkewersScene } from './VladsSkewersScene'
import { applyVladRuntimeTuning } from './VladsSkewersRuntime'
import { applyVladPresentationTuning } from './VladsSkewersPresentation'
import './VladsSkewers.css'

const GAME_ID = 'vlads-skewers'
const VLAD_PHYSICS = {
  default: 'matter',
  matter: {
    gravity: { x: 0, y: 1.35 },
    enableSleeping: false,
    positionIterations: 8,
    velocityIterations: 6,
    constraintIterations: 4,
    debug: false,
  },
}

export function VladsSkewers({ active, seed, restartToken, session }: GameComponentProps) {
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 11, 0x27d4eb2d)) >>> 0, [restartToken, seed])

  useEffect(() => {
    if (!active) miniFuggAudio.stopGameSfx(GAME_ID)
    return () => miniFuggAudio.stopGameSfx(GAME_ID)
  }, [active])

  const createScene = useCallback(() => {
    const scene = new VladsSkewersScene({
      seed: runSeed,
      renderPixelRatio,
      session: {
        setScore: (score) => sessionRef.current.setScore(score),
        finish: (payload) => sessionRef.current.finish(payload),
      },
    })
    applyVladRuntimeTuning(scene)
    applyVladPresentationTuning(scene)
    return scene
  }, [renderPixelRatio, runSeed])

  return (
    <div className="vlad-skewers-game" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#070405',
    }}>
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={MINIFUGG_LEGACY_PORTRAIT_VIEWPORT}
        sceneKey={VLADS_SKEWERS_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        verticalAnchor="bottom"
        physics={VLAD_PHYSICS}
        pixelArt
        ariaLabel="Les Brochettes de Vlad. Maintiens et glisse pour déplacer la brochette et empale la commande dans l'ordre. Une brochette complète est validée automatiquement."
      />
    </div>
  )
}
