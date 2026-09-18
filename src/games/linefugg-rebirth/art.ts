// T02 approved source atlas. Frames are measured pixels, never inferred by the renderer.
export const ATLAS_KEY = 'linefugg-rebirth-t02'
export const ATLAS_URL = '/assets/imported/linefugg/rebirth/t02-atlas.webp'
export const ATLAS_FALLBACK = '/assets/imported/linefugg/rebirth/t02-atlas.png'
export const FRAMES: Record<string, readonly [number, number, number, number]> = {
  "board": [4, 4, 831, 839],
  "ledger-empty": [839, 4, 832, 412],
  "decor-top-right": [1675, 4, 305, 228],
  "decor-top-left": [4, 847, 333, 187],
  "decor-bottom-left": [341, 847, 407, 180],
  "total-empty": [752, 847, 760, 154],
  "decor-bottom-right": [1516, 847, 392, 153],
  "undo-hover": [4, 1038, 291, 149],
  "undo-off": [299, 1038, 291, 149],
  "undo-on": [594, 1038, 291, 149],
  "undo-pressed": [889, 1038, 291, 149],
  "validate-hover": [1184, 1038, 292, 149],
  "validate-off": [1480, 1038, 292, 149],
  "validate-on": [4, 1191, 292, 149],
  "validate-pressed": [300, 1191, 292, 149],
  "paper-sample": [596, 1191, 175, 120],
  "ledger-row-3": [775, 1191, 771, 109],
  "ledger-row-2": [4, 1344, 771, 108],
  "ledger-row-1": [779, 1344, 771, 107],
  "path-gold-node": [1554, 1344, 94, 94],
  "path-purple-node": [1652, 1344, 94, 94],
  "path-red-node": [1750, 1344, 94, 94],
  "indicator-gold-off": [1848, 1344, 78, 77],
  "indicator-gold-on": [1930, 1344, 78, 77],
  "indicator-purple-off": [4, 1456, 76, 77],
  "indicator-purple-on": [84, 1456, 76, 77],
  "indicator-red-off": [164, 1456, 75, 77],
  "indicator-red-on": [243, 1456, 75, 77],
  "glyph-6": [322, 1456, 41, 58],
  "glyph-3": [367, 1456, 38, 57],
  "glyph-8": [409, 1456, 40, 57],
  "glyph-9": [453, 1456, 41, 57],
  "glyph-1": [498, 1456, 33, 56],
  "glyph-2": [535, 1456, 40, 56],
  "glyph-4": [579, 1456, 43, 56],
  "glyph-5": [626, 1456, 39, 56],
  "glyph-7": [669, 1456, 40, 55],
  "path-red-segment": [713, 1456, 22, 51],
  "path-gold-segment": [739, 1456, 22, 48],
  "path-purple-segment": [765, 1456, 22, 47],
  "glyph-0": [791, 1456, 31, 45],
  "glyph-divide": [826, 1456, 28, 36],
  "label-total": [858, 1456, 143, 32],
  "glyph-plus": [1005, 1456, 23, 24],
  "glyph-multiply": [1032, 1456, 20, 20],
  "glyph-equal": [1056, 1456, 25, 17],
  "glyph-decimal": [1085, 1456, 7, 7],
}
export const GLYPHS: Record<string, readonly [string, number]> = {
  "8": ["glyph-8", 57],
  "1": ["glyph-1", 56],
  "4": ["glyph-4", 56],
  "6": ["glyph-6", 58],
  "3": ["glyph-3", 57],
  "2": ["glyph-2", 56],
  "9": ["glyph-9", 57],
  "5": ["glyph-5", 56],
  "7": ["glyph-7", 55],
  "0": ["glyph-0", 45],
  "+": ["glyph-plus", 24],
  "=": ["glyph-equal", 17],
  "×": ["glyph-multiply", 20],
  "÷": ["glyph-divide", 36],
  ".": ["glyph-decimal", 7],
}
export const STAGE = { width: 390, height: 850 } as const
// Relative art scale is uniform; controls fit within the guaranteed y=70..780 window.
export const ART_SCALE = 390 / 853
export const BOARD_ART = { x: 6.4, y: 80, width: 378.2 } as const
const boardScale = BOARD_ART.width / 831
// Interior lines measured on the empty T02 board; input and glyph centers use the same map.
export const BOARD = { x: BOARD_ART.x + 41 * boardScale, y: BOARD_ART.y + 41 * boardScale,
  width: 747 * boardScale, height: 756 * boardScale } as const
export const COLORS = ['red', 'purple', 'gold'] as const
export const INKS = [0x852326, 0x502773, 0x806017] as const
export const INK = 0x383d36
export const PAPER = 0xefe5cf
export const CONTROLS = {
  undo: { x: 8, y: 710, width: 133, height: 149 * 133 / 291 },
  validate: { x: 249, y: 710, width: 133, height: 149 * 133 / 292 },
} as const
export const RELEASE = { version: '0.1.0-t02', updatedAt: '2026-09-18T14:12:30+02:00' } as const
