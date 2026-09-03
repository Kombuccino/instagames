import type { GameWelcomeLayer, GameWelcomeLayerRole, GameWelcomeMotionType } from './types'

const ROLE_DEFAULTS: Record<GameWelcomeLayerRole, { scale: number, parallaxX: number, parallaxY: number }> = {
  background: { scale: 103, parallaxX: 2.2, parallaxY: 1.6 },
  midground: { scale: 102, parallaxX: 5.5, parallaxY: 4 },
  foreground: { scale: 101, parallaxX: 9.5, parallaxY: 7 },
  overlay: { scale: 100, parallaxX: 1.5, parallaxY: 1 },
}

export function resolveWelcomeLayer(layer: GameWelcomeLayer) {
  const defaults = ROLE_DEFAULTS[layer.role]
  return {
    scale: layer.scale ?? defaults.scale,
    x: layer.x ?? 0,
    y: layer.y ?? 0,
    rotation: layer.rotation ?? 0,
    opacity: layer.opacity ?? 100,
    parallaxX: layer.parallaxX ?? defaults.parallaxX,
    parallaxY: layer.parallaxY ?? defaults.parallaxY,
    motion: {
      type: layer.motion?.type ?? 'none' as GameWelcomeMotionType,
      speed: layer.motion?.speed ?? 1,
      intensity: layer.motion?.intensity ?? 0,
      direction: layer.motion?.direction ?? -90,
      irregularity: layer.motion?.irregularity ?? 0,
    },
    fx: {
      blur: layer.fx?.blur ?? 0,
      glow: layer.fx?.glow ?? 0,
    },
  }
}

export function welcomeMotionDuration(type: GameWelcomeMotionType, speed: number) {
  const safeSpeed = Math.max(.1, speed || 1)
  const base = type === 'vibrate'
    ? .13
    : type === 'float'
      ? 5.4
      : type === 'breathe'
        ? 4.8
        : type === 'drift'
          ? 7.2
          : type === 'sway'
            ? 3.8
            : 0
  return base > 0 ? `${Math.max(.04, base / safeSpeed).toFixed(3)}s` : '0s'
}
