import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import type { GameLogicalViewport } from '../types'

export type PhaserSceneFactory = () => Phaser.Scene

type PhaserGameHostProps = {
  active: boolean
  restartToken: number
  logicalViewport: GameLogicalViewport
  sceneKey: string
  createScene: PhaserSceneFactory
  ariaLabel: string
  className?: string
  /** Raster density only. The scene keeps its logical stage via camera zoom. */
  renderPixelRatio?: number
}

/**
 * Minimal React -> Phaser boundary for MiniFugg 2D games.
 *
 * React owns the host element and lifecycle. Phaser owns the complete authored
 * game stage. The stage always keeps its fixed logical size and is uniformly
 * fitted/centered inside the host.
 */
export function PhaserGameHost({
  active,
  restartToken,
  logicalViewport,
  sceneKey,
  createScene,
  ariaLabel,
  className,
  renderPixelRatio = 1,
}: PhaserGameHostProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const activeRef = useRef(active)
  const restartRef = useRef(restartToken)

  activeRef.current = active

  useEffect(() => {
    const parent = mountRef.current
    if (!parent) return
    const density = Math.max(1, Math.min(2, renderPixelRatio))

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      audio: { noAudio: true },
      parent,
      width: logicalViewport.width * density,
      height: logicalViewport.height * density,
      transparent: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: logicalViewport.width * density,
        height: logicalViewport.height * density,
      },
      input: {
        activePointers: 1,
        smoothFactor: 0,
        windowEvents: true,
        gamepad: true,
      },
      render: {
        antialias: true,
        roundPixels: false,
      },
      scene: [createScene()],
      callbacks: {
        postBoot: (bootedGame) => {
          if (!activeRef.current) bootedGame.pause()
        },
      },
    })

    gameRef.current = game
    restartRef.current = restartToken

    return () => {
      gameRef.current = null
      game.destroy(true)
    }
  }, [createScene, logicalViewport.height, logicalViewport.width, renderPixelRatio])

  useEffect(() => {
    const game = gameRef.current
    if (!game) return

    if (active) {
      if (game.isPaused) game.resume()
    } else if (!game.isPaused) {
      game.pause()
    }
  }, [active])

  useEffect(() => {
    const game = gameRef.current
    if (!game || restartRef.current === restartToken) return

    restartRef.current = restartToken
    game.scene.start(sceneKey)
  }, [restartToken, sceneKey])

  return (
    <div
      ref={mountRef}
      className={className ? `mf-phaser-host ${className}` : 'mf-phaser-host'}
      role="application"
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    />
  )
}
