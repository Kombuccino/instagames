import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import type { GameWelcomeLayer, GameWelcomeVariant } from '../types'

const COVER_WIDTH = 390
const COVER_HEIGHT = 844

type LayerRuntime = {
  frame: Phaser.GameObjects.Container
  motion: Phaser.GameObjects.Container
  baseX: number
  baseY: number
  parallaxX: number
  parallaxY: number
  animation: Required<NonNullable<GameWelcomeLayer['motion']>>
}

const ROLE_DEFAULTS = {
  background: { scale: 103, parallaxX: 2.2, parallaxY: 1.6 },
  midground: { scale: 102, parallaxX: 5.5, parallaxY: 4 },
  foreground: { scale: 101, parallaxX: 9.5, parallaxY: 7 },
  overlay: { scale: 100, parallaxX: 1.5, parallaxY: 1 },
} satisfies Record<GameWelcomeLayer['role'], { scale: number, parallaxX: number, parallaxY: number }>

const MOTION_DURATION = {
  none: 0,
  vibrate: .13,
  float: 5.4,
  breathe: 4.8,
  drift: 7.2,
  sway: 3.8,
} satisfies Record<NonNullable<GameWelcomeLayer['motion']>['type'], number>

function parseObjectPosition(value = '50% 50%') {
  const [rawX = '50%', rawY = '50%'] = value.trim().split(/\s+/)
  const percent = (raw: string) => {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? Phaser.Math.Clamp(parsed / 100, 0, 1) : .5
  }
  return { x: percent(rawX), y: percent(rawY) }
}

function resolveLayer(layer: GameWelcomeLayer) {
  const defaults = ROLE_DEFAULTS[layer.role]
  return {
    scale: layer.scale ?? defaults.scale,
    x: layer.x ?? 0,
    y: layer.y ?? 0,
    rotation: layer.rotation ?? 0,
    opacity: layer.opacity ?? 100,
    parallaxX: layer.parallaxX ?? defaults.parallaxX,
    parallaxY: layer.parallaxY ?? defaults.parallaxY,
    animation: {
      type: layer.motion?.type ?? 'none',
      speed: Math.max(.1, layer.motion?.speed ?? 1),
      intensity: layer.motion?.intensity ?? 0,
      direction: layer.motion?.direction ?? -90,
      irregularity: Phaser.Math.Clamp(layer.motion?.irregularity ?? 0, 0, 1),
    },
  }
}

function alternatingProgress(elapsed: number, duration: number) {
  return (1 - Math.cos(Math.PI * (elapsed / duration))) / 2
}

type MotionKeyframe = { at: number, x: number, y: number, angle: number }

function interpolateKeyframes(progress: number, values: MotionKeyframe[]) {
  const toIndex = Math.max(1, values.findIndex((value) => value.at >= progress))
  const from = values[toIndex - 1]
  const to = values[toIndex]
  const mix = Phaser.Math.Clamp((progress - from.at) / Math.max(.001, to.at - from.at), 0, 1)
  return {
    x: Phaser.Math.Linear(from.x, to.x, mix),
    y: Phaser.Math.Linear(from.y, to.y, mix),
    angle: Phaser.Math.Linear(from.angle, to.angle, mix),
  }
}

class PhaserCoverScene extends Phaser.Scene {
  private readonly layers: LayerRuntime[] = []
  private elapsed = 0

  constructor(
    private readonly variant: GameWelcomeVariant,
    private readonly reducedMotion: boolean,
  ) {
    super({ key: `cover-${variant.id}` })
  }

  preload() {
    this.variant.layers?.forEach((layer, index) => this.load.image(`cover-layer-${index}`, layer.image))
  }

  create() {
    this.cameras.main.setBackgroundColor('#090908')

    this.variant.layers?.forEach((layer, index) => {
      const resolved = resolveLayer(layer)
      const texture = this.textures.get(`cover-layer-${index}`).getSourceImage() as HTMLImageElement
      const fitScale = Math.min(COVER_WIDTH / texture.width, COVER_HEIGHT / texture.height)
      const renderedWidth = texture.width * fitScale
      const renderedHeight = texture.height * fitScale
      const objectPosition = parseObjectPosition(layer.objectPosition ?? this.variant.objectPosition)
      const imageX = (COVER_WIDTH - renderedWidth) * objectPosition.x + renderedWidth / 2 - COVER_WIDTH / 2
      const imageY = (COVER_HEIGHT - renderedHeight) * objectPosition.y + renderedHeight / 2 - COVER_HEIGHT / 2
      const image = this.add.image(imageX, imageY, `cover-layer-${index}`).setScale(fitScale)
      if (layer.fx?.blur && image.filters) {
        image.filters.internal.addBlur(0, layer.fx.blur, layer.fx.blur, 1, 0xffffff, 2)
      }
      if (layer.fx?.glow && image.filters) {
        image.filters.external.addGlow(0xfff5cd, Math.max(.1, layer.fx.glow), 0, 1, false, 4, 8)
      }
      const motion = this.add.container(0, 0, [image])
      const baseX = COVER_WIDTH / 2 + COVER_WIDTH * resolved.x / 100
      const baseY = COVER_HEIGHT / 2 + COVER_HEIGHT * resolved.y / 100
      const frame = this.add.container(baseX, baseY, [motion])
        .setScale(resolved.scale / 100)
        .setRotation(Phaser.Math.DegToRad(resolved.rotation))
        .setAlpha(resolved.opacity / 100)

      this.layers.push({
        frame,
        motion,
        baseX,
        baseY,
        parallaxX: resolved.parallaxX,
        parallaxY: resolved.parallaxY,
        animation: resolved.animation,
      })
    })
  }

  setParallax(x: number, y: number) {
    this.layers.forEach((layer) => {
      layer.frame.setPosition(layer.baseX - x * layer.parallaxX, layer.baseY - y * layer.parallaxY)
    })
  }

  update(_time: number, delta: number) {
    if (this.reducedMotion) return
    this.elapsed += delta / 1000

    this.layers.forEach(({ motion, animation }) => {
      const { type, speed, intensity, direction, irregularity } = animation
      if (type === 'none' || intensity === 0) return
      const duration = MOTION_DURATION[type] / speed
      const radians = Phaser.Math.DegToRad(direction)
      const movementX = Math.cos(radians) * intensity
      const movementY = Math.sin(radians) * intensity
      const jitter = intensity * (.35 + irregularity * .65)
      const angle = Phaser.Math.DegToRad(intensity * .18)
      const progress = (this.elapsed % duration) / duration

      if (type === 'vibrate') {
        const value = interpolateKeyframes(progress, [
          { at: 0, x: 0, y: 0, angle: 0 },
          { at: .12, x: intensity, y: -jitter, angle },
          { at: .27, x: -intensity, y: jitter, angle: -angle },
          { at: .44, x: jitter, y: intensity, angle: 0 },
          { at: .63, x: -jitter, y: -intensity, angle },
          { at: .82, x: intensity, y: jitter, angle: -angle },
          { at: 1, x: 0, y: 0, angle: 0 },
        ])
        motion.setPosition(value.x, value.y).setRotation(value.angle)
        return
      }

      const alternate = alternatingProgress(this.elapsed, duration)
      if (type === 'breathe') {
        motion.setScale(Phaser.Math.Linear(1, 1 + intensity / 500, alternate))
      } else if (type === 'float') {
        motion.setPosition(movementX * alternate, movementY * alternate)
      } else if (type === 'drift') {
        motion.setPosition(movementX * (alternate * 2 - 1), movementY * (alternate * 2 - 1))
      } else if (type === 'sway') {
        motion.setRotation(Phaser.Math.Linear(-angle, angle, alternate))
        motion.setY(Phaser.Math.Linear(jitter, -jitter, alternate))
      }
    })
  }
}

type Props = {
  active: boolean
  variant: GameWelcomeVariant
  ariaLabel: string
}

export function PhaserCoverHost({ active, variant, ariaLabel }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<PhaserCoverScene | null>(null)

  useEffect(() => {
    const parent = mountRef.current
    if (!parent || !variant.layers?.length) return
    const scene = new PhaserCoverScene(variant, window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    sceneRef.current = scene

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      audio: { noAudio: true },
      parent,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      backgroundColor: '#090908',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
      },
      render: { antialias: true, roundPixels: false },
      scene: [scene],
    })
    gameRef.current = game

    return () => {
      sceneRef.current = null
      gameRef.current = null
      game.destroy(true)
    }
  }, [variant])

  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    if (active) {
      if (game.isPaused) game.resume()
    } else if (!game.isPaused) {
      game.pause()
      sceneRef.current?.setParallax(0, 0)
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !mountRef.current) return
      const rect = mountRef.current.getBoundingClientRect()
      const x = Phaser.Math.Clamp(((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2, -1, 1)
      const y = Phaser.Math.Clamp(((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2, -1, 1)
      sceneRef.current?.setParallax(x, y)
    }
    const resetPointer = () => sceneRef.current?.setParallax(0, 0)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('blur', resetPointer)
    return () => {
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('blur', resetPointer)
    }
  }, [active])

  return (
    <div
      ref={mountRef}
      className="mf-phaser-cover-host"
      data-cover-runtime="phaser-2d"
      data-cover-variant={variant.id}
      aria-label={ariaLabel}
      role="img"
    />
  )
}
