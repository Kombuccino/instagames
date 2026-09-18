import { useCallback, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { MINIFUGG_MASTER_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'
import { LineFuggRebirthScene, REBIRTH_SCENE_KEY } from './LineFuggRebirthScene'

/** Isolated Rebirth entry. The classic component and its assets are not changed. */
export function LineFuggRebirth({ active, seed, restartToken, session }: GameComponentProps) {
  const sessionRef = useRef(session)
  sessionRef.current = session
  const density = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const createScene = useCallback(() => new LineFuggRebirthScene({ seed, renderPixelRatio: density, session: {
    setScore: value => sessionRef.current.setScore(value),
    finish: payload => sessionRef.current.finish(payload),
  } }), [seed, density])
  return <div data-testid="linefugg-rebirth" style={{ position: 'absolute', inset: 0, background: '#efe5cf' }}>
    <PhaserGameHost active={active} restartToken={restartToken} logicalViewport={MINIFUGG_MASTER_VIEWPORT}
      sceneKey={REBIRTH_SCENE_KEY} createScene={createScene} renderPixelRatio={density}
      ariaLabel="LineFugg Rebirth. Trace trois lignes droites de deux à cinq cases. Flèches et Espace au clavier ; U pour annuler ; Entrée pour valider." />
  </div>
}
