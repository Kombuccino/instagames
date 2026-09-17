import type { GameLogicalViewport } from '../types'

/** Canonical authored portrait contract for all new MiniFugg production. */
export const MINIFUGG_MASTER_VIEWPORT = { width: 390, height: 850 } as const satisfies GameLogicalViewport
/** Existing approved games/assets authored before the 17 September 2026 contract stay valid without rescaling. */
export const MINIFUGG_LEGACY_PORTRAIT_VIEWPORT = { width: 390, height: 844 } as const satisfies GameLogicalViewport

export const DEFAULT_LOGICAL_VIEWPORTS = {
  portrait: MINIFUGG_MASTER_VIEWPORT,
  landscape: { width: 844, height: 390 },
} as const satisfies Record<string, GameLogicalViewport>

export const DEFAULT_RENDER_PIXEL_RATIO_CAP = 2
/** Canonical guaranteed gameplay window, expressed directly in logical MiniFugg units. */
export const MINIFUGG_REFERENCE_VIEWPORT = { width: 390, height: 710 } as const
/** Kept under the historical export name while callers migrate to the simpler 390 × 710 contract. */
export const MINIFUGG_PORTRAIT_CENTRE_HEIGHT = MINIFUGG_REFERENCE_VIEWPORT.height
export const MINIFUGG_DESKTOP_BREAKPOINT = 760
export const MINIFUGG_DESKTOP_MEDIA_QUERY = `(min-width: ${MINIFUGG_DESKTOP_BREAKPOINT}px) and (min-device-width: ${MINIFUGG_DESKTOP_BREAKPOINT}px)`

export type MiniFuggVerticalAnchor = 'top' | 'center' | 'bottom'
export type MiniFuggScaleAxis = 'auto' | 'width' | 'height'

export type MiniFuggGameplayViewportOptions = {
  verticalAnchor?: MiniFuggVerticalAnchor
  scaleAxis?: MiniFuggScaleAxis
}

export function readGameplayCalibrationAnchor(): MiniFuggVerticalAnchor | null {
  if (typeof window === 'undefined') return null
  const query = new URL(window.location.href).searchParams
  if (query.get('lab') !== 'gameplay-runtime') return null
  const anchor = query.get('anchor')
  return anchor === 'top' || anchor === 'center' || anchor === 'bottom' ? anchor : null
}

export function clampRenderPixelRatio(value = 1) {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(DEFAULT_RENDER_PIXEL_RATIO_CAP, value))
}

function usesMiniFuggPortraitContract(logical: GameLogicalViewport) {
  return logical.width === MINIFUGG_MASTER_VIEWPORT.width
    && (logical.height === MINIFUGG_MASTER_VIEWPORT.height
      || logical.height === MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.height)
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
 * MiniFugg gameplay framing.
 *
 * New portrait production is authored on 390 × 850 with a guaranteed 390 × 710
 * gameplay window: exactly 70 logical units of crop reserve above and below in
 * the centered case. Existing 390 × 844 games remain valid and keep their own
 * coordinates while using the same 710-unit guaranteed window.
 *
 * Mobile is width-driven. Desktop is guaranteed-window-height driven, still
 * capped by available width. Vertical anchoring changes only which edge absorbs
 * crop; it never changes game geometry.
 */
export function fitMiniFuggGameplayViewport(
  logical: GameLogicalViewport,
  available: GameLogicalViewport,
  options: MiniFuggGameplayViewportOptions = {},
) {
  const availableWidth = Math.max(1, available.width)
  const availableHeight = Math.max(1, available.height)
  const miniFuggPortrait = usesMiniFuggPortraitContract(logical)
  const protectedHeight = miniFuggPortrait ? MINIFUGG_PORTRAIT_CENTRE_HEIGHT : logical.height
  const widthScale = availableWidth / logical.width
  const protectedHeightScale = availableHeight / protectedHeight
  const scaleAxis = options.scaleAxis ?? 'auto'

  const scale = !miniFuggPortrait || scaleAxis === 'auto'
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
