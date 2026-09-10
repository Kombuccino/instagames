import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { useTetraMindFckMusic } from '../../music/reactiveGameMusic'
import { TETRAMINDFCK_SCENE_KEY, TetraMindFckScene } from './TetraMindFckScene'

export function TetraMindFck({ active, seed, restartToken, session }: GameComponentProps) {
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session

  const [runFinished, setRunFinished] = useState(false)
  const [level, setLevel] = useState(1)
  const gameplayActive = active && !runFinished

  const music = useTetraMindFckMusic({
    level,
    armed: active,
    playing: gameplayActive,
    seed,
    restartToken,
  })
  const musicIdRef = useRef(music.compositionId)
  musicIdRef.current = music.compositionId

  useEffect(() => {
    setRunFinished(false)
    setLevel(1)
  }, [restartToken, seed])

  const createScene = useCallback(() => new TetraMindFckScene({
    seed,
    renderPixelRatio,
    onLevelChange: setLevel,
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => {
        setRunFinished(true)
        sessionRef.current.finish({
          ...payload,
          metadata: {
            ...(payload.metadata ?? {}),
            musicId: musicIdRef.current ?? 'none',
          },
        })
      },
    },
  }), [renderPixelRatio, seed])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f2efe6' }}>
      <PhaserGameHost
        active={gameplayActive}
        restartToken={restartToken}
        logicalViewport={DEFAULT_LOGICAL_VIEWPORTS.portrait}
        sceneKey={TETRAMINDFCK_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        ariaLabel="TetraMindFck. Complète des lignes et atteins l’objectif avec le score total d’un seul clear."
      />
    </div>
  )
}
