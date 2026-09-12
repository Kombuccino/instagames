import type { GameLogicalViewport } from '../types'

export const DEFAULT_LOGICAL_VIEWPORTS = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
} as const satisfies Record<string, GameLogicalViewport>

export const DEFAULT_RENDER_PIXEL_RATIO_CAP = 2
export const MINIFUGG_PORTRAIT_CENTRE_HEIGHT = 662
export const MINIFUGG_DESKTOP_BREAKPOINT = 760
export const MINIFUGG_DESKTOP_MEDIA_QUERY = `(min-width: ${MINIFUGG_DESKTOP_BREAKPOINT}px) and (min-device-width: ${MINIFUGG_DESKTOP_BREAKPOINT}px)`

export type MiniFuggVerticalAnchor = 'top' | 'center' | 'bottom'
export type MiniFuggScaleAxis = 'auto' | 'width' | 'height'

export type MiniFuggGameplayViewportOptions = {
  verticalAnchor?: MiniFuggVerticalAnchor
  scaleAxis?: MiniFuggScaleAxis
}

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
 * Mobile is width-driven: 390 logical units always consume the useful width.
 * Desktop is CENTRE-height driven, still capped by available width. The game may
 * choose which vertical edge absorbs the crop: top, center or bottom. This lets
 * a bottom-anchored game such as Vlad keep its hand/grill fixed while allowing
 * extra or cropped scenery above, without changing horizontal gameplay geometry.
 */
export function fitMiniFuggGameplayViewport(
  logical: GameLogicalViewport,
  available: GameLogicalViewport,
  options: MiniFuggGameplayViewportOptions = {},
) {
  const availableWidth = Math.max(1, available.width)
  const availableHeight = Math.max(1, available.height)
  const canonicalPortrait = logical.width === DEFAULT_LOGICAL_VIEWPORTS.portrait.width
    && logical.height === DEFAULT_LOGICAL_VIEWPORTS.portrait.height
  const protectedHeight = canonicalPortrait ? MINIFUGG_PORTRAIT_CENTRE_HEIGHT : logical.height
  const widthScale = availableWidth / logical.width
  const protectedHeightScale = availableHeight / protectedHeight
  const scaleAxis = options.scaleAxis ?? 'auto'

  const scale = !canonicalPortrait || scaleAxis === 'auto'
    ? Math.min(widthScale, protectedHeightScale)
    : scaleAxis === 'width'
      ? widthScale
      : Math.min(protectedHeightScale, widthScale)

  const width = logical.width * scale
  const height = logical.height * scale
  const verticalRemainder = availableHeight - height
  const verticalAnchor = options.verticalAnchor ?? 'center'
  const offsetY = verticalAnchor === 'top'
    ? 0
    : verticalAnchor === 'bottom'
      ? verticalRemainder
      : verticalRemainder / 2

  return {
    scale,
    width,
    height,
    offsetX: (availableWidth - width) / 2,
    offsetY,
  }
}
