export type StyleKitId =
  | 'pixel-dungeon'
  | 'paper-cut'
  | 'ink-pulp'
  | 'toybox'
  | 'sports-broadcast'
  | 'editorial-grid'

export type StyleKit = {
  id: StyleKitId
  name: string
  bestFor: string[]
  palette: string[]
  geometry: string
  typography: string
  texture: string
  motion: string
  assetVocabulary: string[]
  avoid: string[]
  assetBase?: string
}

export const STYLE_KITS: StyleKit[] = [
  {
    id: 'pixel-dungeon',
    name: 'Pixel Dungeon',
    bestFor: ['roguelike', 'tile tactics', 'dungeon', 'grid action'],
    palette: ['#17140f', '#3d3426', '#7c6741', '#d2b875', '#f1e4b3', '#9e3d32', '#4f7a50'],
    geometry: '16px/24px tile logic, chunky silhouettes, hard pixel edges, no soft cards',
    typography: 'compact bitmap-like or blocky system fallback; large numbers and short labels',
    texture: 'stone, dirt, wood, metal, torchlight; restrained dithering',
    motion: 'stepped movement, tiny hit-stop, tile snaps, 2–4 frame accents',
    assetVocabulary: ['floor', 'wall', 'door', 'chest', 'coin', 'potion', 'spikes', 'slime', 'skeleton', 'sword', 'shield', 'heart', 'key', 'stairs', 'torch'],
    avoid: ['purple neon', 'glass panels', 'smooth vector gradients', 'tiny UI chrome'],
    assetBase: '/style-kits/pixel-dungeon.svg',
  },
  {
    id: 'paper-cut',
    name: 'Paper Cut',
    bestFor: ['puzzle', 'sorting', 'food', 'cozy', 'casual'],
    palette: ['#f2e7cf', '#d6553f', '#e8b34b', '#4f865f', '#5c78a8', '#2f2a25'],
    geometry: 'cut-paper silhouettes, imperfect circles, tabs, stickers and layered scraps',
    typography: 'friendly bold sans or hand-lettered feeling; high contrast and generous size',
    texture: 'paper grain, cardboard edges, felt, printed ink misregistration',
    motion: 'small lifts, paper flips, springy placement, tactile drag feedback',
    assetVocabulary: ['label', 'sticker', 'token', 'card', 'tray', 'stamp', 'tape', 'paper shadow'],
    avoid: ['perfect glass surfaces', 'cyber HUDs', 'excessively smooth gradients'],
  },
  {
    id: 'ink-pulp',
    name: 'Ink Pulp',
    bestFor: ['weird arcade', 'dark comedy', 'monster game', 'comic action'],
    palette: ['#f3ead6', '#181515', '#c7332f', '#d7962c', '#65704a'],
    geometry: 'thick ink contours, angular captions, rough silhouettes, print-panel composition',
    typography: 'condensed grotesk, comic display caps, oversized impact words',
    texture: 'halftone, dry brush, photocopy noise, imperfect registration',
    motion: 'smears, impact frames, snap zooms, panel shakes, hard cuts',
    assetVocabulary: ['burst', 'caption', 'speed line', 'ink splat', 'panel', 'stamp', 'rough icon'],
    avoid: ['clean SaaS cards', 'soft pastel glow', 'delicate hairline icons'],
  },
  {
    id: 'toybox',
    name: 'Toybox',
    bestFor: ['physics', 'stacking', 'party', 'object manipulation', 'kids-friendly action'],
    palette: ['#f4d547', '#e35d48', '#4e8fe6', '#59a96a', '#f5f0df', '#34302c'],
    geometry: 'chunky blocks, oversized objects, rounded toy silhouettes, simple pseudo-3D shading',
    typography: 'big playful sans, short labels, chunky numerals',
    texture: 'painted wood, plastic, foam, rubber; simple highlights rather than glass',
    motion: 'weight, bounce, squash, wobble, collisions with readable anticipation',
    assetVocabulary: ['block', 'ball', 'crate', 'peg', 'spring', 'platform', 'wheel', 'button'],
    avoid: ['thin abstract UI', 'dark cyberpunk palette', 'micro typography'],
  },
  {
    id: 'sports-broadcast',
    name: 'Sports Broadcast',
    bestFor: ['racing', 'sports', 'timing', 'score chase', 'reflex'],
    palette: ['#101315', '#f5f5f0', '#ef3d36', '#f6cf35', '#2c8a68'],
    geometry: 'broadcast bars, timing strips, lane markings, badges, strong horizontal hierarchy',
    typography: 'condensed bold numerals, tabular scores, uppercase labels',
    texture: 'mostly flat; occasional field, asphalt, paper ticket or LED texture',
    motion: 'score ticks, wipes, split times, fast directional transitions, minimal bounce',
    assetVocabulary: ['timer', 'lap', 'rank', 'lane', 'flag', 'split', 'badge', 'ticker'],
    avoid: ['fantasy ornament', 'soft glass cards', 'decorative glow without information'],
  },
  {
    id: 'editorial-grid',
    name: 'Editorial Grid',
    bestFor: ['numbers', 'logic', 'word', 'strategy', 'abstract puzzle'],
    palette: ['#f3f0e8', '#151515', '#d94a35', '#315f9b', '#d8bf50'],
    geometry: 'strict grid, rules, columns, circles and typographic blocks; print-first composition',
    typography: 'large editorial serif/sans contrast or strong grotesk; generous readable hierarchy',
    texture: 'paper, newsprint, registration marks, subtle grain; often nearly flat',
    motion: 'precise slides, line draws, number flips, restrained emphasis',
    assetVocabulary: ['grid', 'rule', 'index', 'marker', 'number', 'label', 'diagram', 'stamp'],
    avoid: ['neon sci-fi', 'floating rounded cards', 'decorative particles'],
  },
]

export function getStyleKit(id: StyleKitId) {
  return STYLE_KITS.find((kit) => kit.id === id)
}
