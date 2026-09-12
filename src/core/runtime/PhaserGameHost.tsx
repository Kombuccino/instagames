import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import type { GameLogicalViewport } from '../types'
import {
  clampRenderPixelRatio,
  fitMiniFuggGameplayViewport,
  MINIFUGG_DESKTOP_BREAKPOINT,
  type MiniFuggVerticalAnchor,
} from './gameRuntimePolicy'

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
  /** Which edge keeps priority when MASTER is taller than the useful viewport. */
  verticalAnchor?: MiniFuggVerticalAnchor
  /** Optional engine physics. Omit for games that do not need a physics plugin. */
  physics?: Phaser.Types.Core.PhysicsConfig
  /** Crisp nearest-neighbour sampling for authored pixel-art games. */
  pixelArt?: boolean
}

/**
 * React -> Phaser boundary for MiniFugg 2D games.
 *
 * Phaser keeps a fixed authored logical stage. Core sizes that stage according
 * to MiniFugg Zones: canonical portrait gameplay is width-driven on mobile,
 * CENTRE-height driven on wider screens, and individual games may anchor the
 * vertical crop to top, center or bottom without changing their 390-wide world.
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
  verticalAnchor = 'center',
  physics,
  pixelArt = false,
}: PhaserGameHostProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const activeRef = useRef(active)
  const restartRef = useRef(restartToken)

  activeRef.current = active

  useEffect(() => {
    const viewport = viewportRef.current
    const parent = mountRef.current
    if (!viewport || !parent) return

    const density = clampRenderPixelRatio(renderPixelRatio)
    const renderWidth = Math.round(logicalViewport.width * density)
    const renderHeight = Math.round(logicalViewport.height * density)
    let game: Phaser.Game | null = null

    const layoutStage = () => {
      const bounds = viewport.getBoundingClientRect()
      const available = {
        width: bounds.width || logicalViewport.width,
        height: bounds.height || logicalViewport.height,
      }
      const scaleAxis = window.innerWidth >= MINIFUGG_DESKTOP_BREAKPOINT ? 'height' : 'width'
      const layout = fitMiniFuggGameplayViewport(logicalViewport, available, {
        verticalAnchor,
        scaleAxis,
      })

      parent.style.width = `${layout.width}px`
      parent.style.height = `${layout.height}px`
      parent.style.left = `${layout.offsetX}px`
      parent.style.top = `${layout.offsetY}px`
      game?.scale.refresh()
    }

    // Give Phaser the correct parent geometry before it measures Scale.FIT.
    layoutStage()

    game = new Phaser.Game({
      type: Phaser.AUTO,
      audio: { noAudio: true },
      parent,
      width: renderWidth,
      height: renderHeight,
      transparent: true,
      physics,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: renderWidth,
        height: renderHeight,
        expandParent: false,
      },
      input: {
        activePointers: 1,
        smoothFactor: 0,
        windowEvents: true,
        gamepad: true,
      },
      render: {
        pixelArt,
        antialias: !pixelArt,
        roundPixels: pixelArt,
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
    layoutStage()

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(layoutStage)
    observer?.observe(viewport)
    window.addEventListener('resize', layoutStage)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', layoutStage)
      gameRef.current = null
      game?.destroy(true)
      game = null
    }
  }, [createScene, logicalViewport.height, logicalViewport.width, physics, pixelArt, renderPixelRatio, verticalAnchor])

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
      ref={viewportRef}
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
    >
      <div
        ref={mountRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      />
    </div>
  )
}
