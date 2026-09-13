import Phaser from 'phaser'
import type { TetraMindFckScene } from './TetraMindFckScene'

type ActionName = 'left' | 'right' | 'down' | 'rotateLeft' | 'rotateRight'
type RuntimeScene = Phaser.Scene & {
  create: () => void
  finished?: boolean
  pendingClear?: unknown
  runAction?: (action: ActionName, playSound?: boolean) => void
  startHold?: (action: 'left' | 'right' | 'down') => void
  stopHold?: () => void
}
type Aperture = { x: number; y: number; w: number; h: number }

// Old scene coordinates. The gameplay logic still owns these objects; this skin reflows them
// onto the approved wider composition without changing any rule/state.
const OLD_BOARD = { x: 124, y: 164, cell: 22.4 }

// Canonical geometry for the next art pass. It intentionally uses almost the full 390 px width.
const MAIN: Aperture = { x: 92, y: 92, w: 290, h: 580 }
const LEVEL: Aperture = { x: 10, y: 120, w: 74, h: 80 }
const TARGET: Aperture = { x: 10, y: 210, w: 74, h: 80 }
const NEXT: Aperture = { x: 10, y: 300, w: 74, h: 140 }
const NEXT2: Aperture = { x: 10, y: 450, w: 74, h: 140 }
const BOARD = { x: 112, y: 145, cell: 25, w: 250, h: 500 }

const BUTTONS = [
  { action: 'left' as const, up: 'tetra-btn-left-up', down: 'tetra-btn-left-down', x: 10, y: 696, w: 88, h: 62 },
  { action: 'right' as const, up: 'tetra-btn-right-up', down: 'tetra-btn-right-down', x: 104, y: 696, w: 88, h: 62 },
  { action: 'rotateLeft' as const, up: 'tetra-btn-rotate-left-up', down: 'tetra-btn-rotate-left-down', x: 198, y: 696, w: 88, h: 62 },
  { action: 'rotateRight' as const, up: 'tetra-btn-rotate-right-up', down: 'tetra-btn-rotate-right-down', x: 292, y: 696, w: 88, h: 62 },
  { action: 'down' as const, up: 'tetra-btn-down-up', down: 'tetra-btn-down-down', x: 57, y: 766, w: 88, h: 52 },
] as const

const CREAM = 0xe9dcc3
const CREAM_LIGHT = 0xf4ead4
const CREAM_DARK = 0xb7aa91
const RAIL = 0x69645d
const CRT = 0x08281f
const CRT_EDGE = 0x315d4b
const PRINT = '#342f2a'

function destroyBrokenStructuralAssets(scene: RuntimeScene) {
  for (const child of [...scene.children.list]) {
    if (!(child instanceof Phaser.GameObjects.Image)) continue
    const key = child.texture.key
    if (key === 'tetra-shell' || key === 'tetra-crt' || key.startsWith('tetra-btn-')) child.destroy()
  }
}

function drawCrt(scene: RuntimeScene, aperture: Aperture, radius = 8) {
  const graphics = scene.add.graphics().setDepth(2.6)
  graphics.fillStyle(CRT, 1).fillRoundedRect(aperture.x, aperture.y, aperture.w, aperture.h, radius)
  graphics.lineStyle(1, CRT_EDGE, 0.95)
    .strokeRoundedRect(aperture.x + 0.5, aperture.y + 0.5, aperture.w - 1, aperture.h - 1, radius)
}

function drawCanonicalConsole(scene: RuntimeScene) {
  const shell = scene.add.graphics().setDepth(2)

  // Full-width physical body. Only a tiny background bleed remains at the extreme sides.
  shell.fillStyle(0x2d2925, 0.35).fillRoundedRect(2, 58, 386, 770, 24)
  shell.fillStyle(CREAM_DARK, 1).fillRoundedRect(3, 55, 384, 768, 23)
  shell.fillStyle(CREAM, 1).fillRoundedRect(5, 53, 380, 766, 21)
  shell.lineStyle(2, CREAM_LIGHT, 0.82).strokeRoundedRect(7, 55, 376, 762, 19)

  // Compact instrument rail; the board gets the width instead of decorative gutters.
  shell.fillStyle(RAIL, 1).fillRoundedRect(7, 109, 80, 493, 13)
  shell.fillStyle(CREAM, 1).fillRoundedRect(5, 678, 380, 141, 12)
  shell.lineStyle(1, CREAM_DARK, 0.9).lineBetween(7, 682, 383, 682)

  scene.add.text(16, 68, 'TetraMindFck / Calc Drop', {
    fontFamily: 'Georgia, serif', fontSize: '15px', color: PRINT, fontStyle: 'bold italic',
  }).setDepth(2.8)
  scene.add.text(374, 71, 'MINIFUGG', {
    fontFamily: 'monospace', fontSize: '7px', color: PRINT, fontStyle: 'bold', letterSpacing: 1,
  }).setOrigin(1, 0).setDepth(2.8)

  drawCrt(scene, MAIN, 12)
  drawCrt(scene, LEVEL)
  drawCrt(scene, TARGET)
  drawCrt(scene, NEXT)
  drawCrt(scene, NEXT2)

  shell.lineStyle(1, CREAM_DARK, 0.6)
    .lineBetween(88, 108, 88, 602)
    .lineBetween(8, 205, 86, 205)
    .lineBetween(8, 295, 86, 295)
    .lineBetween(8, 445, 86, 445)
}

function reflowBoard(scene: RuntimeScene) {
  const scale = BOARD.cell / OLD_BOARD.cell
  const tx = BOARD.x - OLD_BOARD.x * scale
  const ty = BOARD.y - OLD_BOARD.y * scale

  for (const child of scene.children.list) {
    const depth = child.depth

    if (child instanceof Phaser.GameObjects.Graphics && depth === 3) {
      child.setScale(scale).setPosition(tx, ty)
      continue
    }

    if (child instanceof Phaser.GameObjects.Rectangle && depth === 7) {
      child.setPosition(child.x * scale + tx, child.y * scale + ty).setDisplaySize(BOARD.cell - 2, BOARD.cell - 2)
      continue
    }

    if (child instanceof Phaser.GameObjects.Image && depth === 8) {
      child.setPosition(child.x * scale + tx, child.y * scale + ty).setDisplaySize(BOARD.cell - 1.2, BOARD.cell - 1.2)
    }
  }
}

function reflowHud(scene: RuntimeScene) {
  for (const child of scene.children.list) {
    if (child instanceof Phaser.GameObjects.Text && child.depth === 9) {
      const text = child.text
      if (text === 'LEVEL') child.setPosition(LEVEL.x + LEVEL.w / 2, LEVEL.y + 7).setOrigin(0.5, 0)
      else if (text === 'TARGET') child.setPosition(TARGET.x + TARGET.w / 2, TARGET.y + 7).setOrigin(0.5, 0)
      else if (text === 'NEXT') child.setPosition(NEXT.x + NEXT.w / 2, NEXT.y + 7).setOrigin(0.5, 0)
      else if (text === 'NEXT+1') child.setPosition(NEXT2.x + NEXT2.w / 2, NEXT2.y + 7).setOrigin(0.5, 0)
      else if (child.x < 90 && child.y < 250) child.setPosition(LEVEL.x + LEVEL.w / 2, LEVEL.y + 48).setOrigin(0.5)
      else if (child.x < 90 && child.y < 350) child.setPosition(TARGET.x + TARGET.w / 2, TARGET.y + 48).setOrigin(0.5)
      else if (child.x > 300) child.setPosition(MAIN.x + MAIN.w - 12, MAIN.y + 10).setOrigin(1, 0)
      else if (child.x > 90 && child.y < 160) child.setPosition(MAIN.x + 12, MAIN.y + 10).setOrigin(0, 0)
    }

    if (child instanceof Phaser.GameObjects.Container && child.depth === 10) {
      if (child.y < 500) child.setPosition(NEXT.x + NEXT.w / 2, NEXT.y + 82).setScale(1.28)
      else child.setPosition(NEXT2.x + NEXT2.w / 2, NEXT2.y + 82).setScale(1.28)
    }

    if (child instanceof Phaser.GameObjects.Triangle && child.depth === 10) {
      child.setPosition(NEXT.x + 6, NEXT.y + 28)
    }
  }
}

function addButton(scene: RuntimeScene, config: typeof BUTTONS[number]) {
  const cx = config.x + config.w / 2
  const cy = config.y + config.h / 2
  const image = scene.add.image(cx, cy, config.up)
    .setDisplaySize(config.w, config.h)
    .setDepth(30)
    .setInteractive({ useHandCursor: true })

  const restore = () => {
    image.setTexture(config.up).setPosition(cx, cy).setDisplaySize(config.w, config.h)
    scene.stopHold?.()
  }

  image.on('pointerdown', () => {
    if (scene.finished || scene.pendingClear) return
    image.setTexture(config.down).setDisplaySize(config.w, config.h)
    scene.runAction?.(config.action)
    if (config.action === 'left' || config.action === 'right' || config.action === 'down') scene.startHold?.(config.action)
  })
  image.on('pointerup', restore)
  image.on('pointerout', restore)
  image.on('pointercancel', restore)
}

function installCanonicalGeometry(scene: RuntimeScene) {
  destroyBrokenStructuralAssets(scene)
  reflowBoard(scene)
  reflowHud(scene)
  drawCanonicalConsole(scene)
  BUTTONS.forEach((button) => addButton(scene, button))
}

/**
 * Geometry-only structural skin. It maximises the board width first; the final approved
 * raster material will be painted onto these exact apertures after the composition is validated.
 */
export function installTetraMindFckSkin(scene: TetraMindFckScene) {
  const runtime = scene as unknown as RuntimeScene
  const originalCreate = runtime.create.bind(scene)
  runtime.create = () => {
    originalCreate()
    installCanonicalGeometry(runtime)
  }
  return scene
}
