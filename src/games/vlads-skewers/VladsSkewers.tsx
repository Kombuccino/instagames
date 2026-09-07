import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { miniFuggAudio } from '../../audio'
import { VLADS_SKEWERS_SCENE_KEY, VladsSkewersScene } from './VladsSkewersScene'
import './VladsSkewers.css'

const GAME_ID = 'vlads-skewers'
const VLAD_OVERSCAN = '/assets/generated/vlads-skewers/backgrounds/pixel-grill-overscan.png'

export function VladsSkewers({ active, seed, restartToken, session }: GameComponentProps) {
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 11, 0x27d4eb2d)) >>> 0, [restartToken, seed])

  useEffect(() => {
    if (!active) miniFuggAudio.stopGameSfx(GAME_ID)
    return () => miniFuggAudio.stopGameSfx(GAME_ID)
  }, [active])

  const createScene = useCallback(() => new VladsSkewersScene({
    seed: runSeed,
    renderPixelRatio,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => sessionRef.current.finish(payload),
    },
  }), [renderPixelRatio, runSeed])

  return (
    <div className="vlad-skewers-game" style={{
      position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#070405',
      backgroundImage: `url(${VLAD_OVERSCAN})`,
      backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated',
    }}>
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={DEFAULT_LOGICAL_VIEWPORTS.portrait}
        sceneKey={VLADS_SKEWERS_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        pixelArt
        ariaLabel="Les Brochettes de Vlad. Maintiens et glisse pour déplacer la brochette et empale la commande dans l'ordre. Une brochette complète est validée automatiquement."
      />
    </div>
  )
}
