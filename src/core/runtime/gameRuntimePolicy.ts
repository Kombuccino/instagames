import type { GameOrientation, GameLogicalViewport } from '../types'

export const MINIFUGG_ENGINE_POLICY = {
  core: 'react' as const,
  twoD: 'phaser-2d' as const,
  threeD: 'three-3d' as const,
}

export const DEFAULT_LOGICAL_VIEWPORTS: Record<Exclude<GameOrientation, 'both'>, GameLogicalViewport> = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
}

export type MiniFuggAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'primary'
  | 'secondary'
  | 'pause'

export function fitLogicalViewport(logical: GameLogicalViewport, available: GameLogicalViewport) {
  const widthRatio = available.width / logical.width
  const heightRatio = available.height / logical.height
  const scale = Math.min(widthRatio, heightRatio)
  const width = logical.width * scale
  const height = logical.height * scale

  return {
    scale,
    width,
    height,
    offsetX: (available.width - width) / 2,
    offsetY: (available.height - height) / 2,
  }
}
