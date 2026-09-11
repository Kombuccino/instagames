import type { GameLogicalViewport } from '../types'

export const DEFAULT_LOGICAL_VIEWPORTS = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
} as const satisfies Record<string, GameLogicalViewport>

export const DEFAULT_RENDER_PIXEL_RATIO_CAP = 2
export const MINIFUGG_PORTRAIT_CENTRE_HEIGHT = 662

export function clampRenderPixelRatio(value = 1) {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(DEFAULT_RENDER_PIXEL_RATIO_CAP, value))
}

/** Classic full-frame fit kept for non-canonical/legacy viewports and tooling. */
export function fitLogicalViewport(logical: GameLogicalViewport, available: GameLogicalViewport) {
  const scale = Math.min(available.width / logical.width, available.height / logical.height)
  return {
    scale,
    width: logical.width * scale,
    height: logical.height * scale,
    offsetX: (available.width - logical.width * scale) / 2,
    offsetY: (available.height - logical.height * scale) / 2,
  }
}

/**
 * MiniFugg gameplay framing for the canonical portrait master.
 *
 * Mobile is width-driven: the 390-wide stage keeps its intended scale and
 * crop-sensitive HAUT/BAS may leave the viewport. On wider screens the
 * always-visible 390×662 CENTRE limits the scale instead. If a viewport is
 * exceptionally short, CENTRE still fits even if that means lateral margins.
 */
export function fitMiniFuggGameplayViewport(logical: GameLogicalViewport, available: GameLogicalViewport) {
  const availableWidth = Math.max(1, available.width)
  const availableHeight = Math.max(1, available.height)
  const canonicalPortrait = logical.width === DEFAULT_LOGICAL_VIEWPORTS.portrait.width
    && logical.height === DEFAULT_LOGICAL_VIEWPORTS.portrait.height
  const protectedHeight = canonicalPortrait ? MINIFUGG_PORTRAIT_CENTRE_HEIGHT : logical.height
  const scale = Math.min(availableWidth / logical.width, availableHeight / protectedHeight)
  const width = logical.width * scale
  const height = logical.height * scale

  return {
    scale,
    width,
    height,
    offsetX: (availableWidth - width) / 2,
    offsetY: (availableHeight - height) / 2,
  }
}
