import { useCallback, useEffect, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import { PhaserGameHost } from '../../core/runtime/PhaserGameHost'
import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT, MINIFUGG_MASTER_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'
import { createLineFuggMusicPlayer } from '../../audio/gameMusic'
import { LINEFUGG_SCENE_KEY, LineFuggScene } from './LineFuggScene'

const LINEFUGG_BACKGROUND = '/assets/imported/linefugg/backgrounds/orbital-environment.webp'

export function LineFugg({ active, seed, restartToken, session }: GameComponentProps) {
  const query = new URL(window.location.href).searchParams
  const rebirthLab = query.get('lab') === 'gameplay-runtime' && query.get('skin') === 'rebirth-editorial'
  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current
  const sessionRef = useRef(session)
  sessionRef.current = session

  const musicRef = useRef<ReturnType<typeof createLineFuggMusicPlayer>>(null)
  useEffect(() => {
    const player = createLineFuggMusicPlayer(seed, restartToken)
    musicRef.current = player
    return () => { player?.destroy(); if (musicRef.current === player) musicRef.current = null }
  }, [seed, restartToken])
  useEffect(() => {
    if (active) void musicRef.current?.start()
    else musicRef.current?.pause()
  }, [active, seed, restartToken])

  const createScene = useCallback(() => new LineFuggScene({
    seed,
    renderPixelRatio,
    visualMode: rebirthLab ? 'rebirth-editorial' : 'orbital',
    session: {
      setScore: (score) => sessionRef.current.setScore(score),
      finish: (payload) => {
        musicRef.current?.stop()
        sessionRef.current.finish(payload)
      },
    },
  }), [seed, renderPixelRatio])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: rebirthLab ? '#eee5d5' : '#02070e',
        backgroundImage: rebirthLab ? 'none' : `linear-gradient(rgba(1, 5, 12, .10), rgba(1, 5, 12, .10)), url(${LINEFUGG_BACKGROUND})`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <PhaserGameHost
        active={active}
        restartToken={restartToken}
        logicalViewport={rebirthLab ? MINIFUGG_MASTER_VIEWPORT : MINIFUGG_LEGACY_PORTRAIT_VIEWPORT}
        sceneKey={LINEFUGG_SCENE_KEY}
        createScene={createScene}
        renderPixelRatio={renderPixelRatio}
        ariaLabel="LineFugg. Grille 7 par 7. Trace trois lignes de cinq cases maximum, ajuste-les si nécessaire, puis utilise le bouton de validation."
      />
    </div>
  )
}
