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

const MAIN: Aperture = { x: 93, y: 108, w: 289, h: 560 }
const LEVEL: Aperture = { x: 10, y: 142, w: 72, h: 82 }
const TARGET: Aperture = { x: 10, y: 238, w: 72, h: 82 }
const NEXT: Aperture = { x: 10, y: 334, w: 72, h: 112 }
const NEXT2: Aperture = { x: 10, y: 460, w: 72, h: 112 }

const BUTTONS = [
  { action: 'left' as const, up: 'tetra-btn-left-up', down: 'tetra-btn-left-down', x: 10, y: 690, w: 87, h: 62 },
  { action: 'right' as const, up: 'tetra-btn-right-up', down: 'tetra-btn-right-down', x: 104, y: 690, w: 87, h: 62 },
  { action: 'rotateLeft' as const, up: 'tetra-btn-rotate-left-up', down: 'tetra-btn-rotate-left-down', x: 198, y: 690, w: 87, h: 62 },
  { action: 'rotateRight' as const, up: 'tetra-btn-rotate-right-up', down: 'tetra-btn-rotate-right-down', x: 292, y: 690, w: 87, h: 62 },
  { action: 'down' as const, up: 'tetra-btn-down-up', down: 'tetra-btn-down-down', x: 58, y: 762, w: 86, h: 50 },
] as const

const CREAM = 0xe9dcc3
const CREAM_LIGHT = 0xf4ead4
const CREAM_DARK = 0xb7aa91
const RAIL = 0x69645d
const CRT = 0x08281f
const CRT_EDGE = 0x315d4b
const PRINT = '#342f2a'

function destroyCompetingStructuralAssets(scene: RuntimeScene) {
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

  // Border-to-border shell: no decorative side gutters. This is geometry only.
  shell.fillStyle(0x2d2925, 0.34).fillRoundedRect(0, 54, 390, 790, 22)
  shell.fillStyle(CREAM_DARK, 1).fillRoundedRect(0, 51, 390, 789, 22)
  shell.fillStyle(CREAM, 1).fillRoundedRect(0, 49, 390, 791, 20)
  shell.lineStyle(2, CREAM_LIGHT, 0.82).strokeRoundedRect(2, 51, 386, 787, 18)

  // Compact left rail so the 10x20 board owns the width.
  shell.fillStyle(RAIL, 1).fillRoundedRect(5, 132, 82, 451, 13)
  shell.fillStyle(CREAM, 1).fillRoundedRect(0, 676, 390, 164, 8)
  shell.lineStyle(1, CREAM_DARK, 0.88).lineBetween(0, 678, 390, 678)

  scene.add.text(12, 63, 'TetraMindFck / Calc Drop', {
    fontFamily: 'Georgia, serif', fontSize: '15px', color: PRINT, fontStyle: 'bold italic',
  }).setDepth(2.8)
  scene.add.text(378, 66, 'MINIFUGG', {
    fontFamily: 'monospace', fontSize: '7px', color: PRINT, fontStyle: 'bold', letterSpacing: 1,
  }).setOrigin(1, 0).setDepth(2.8)

  drawCrt(scene, MAIN, 12)
  drawCrt(scene, LEVEL)
  drawCrt(scene, TARGET)
  drawCrt(scene, NEXT)
  drawCrt(scene, NEXT2)

  shell.lineStyle(1, CREAM_DARK, 0.55)
    .lineBetween(88, 132, 88, 583)
    .lineBetween(7, 231, 85, 231)
    .lineBetween(7, 327, 85, 327)
    .lineBetween(7, 453, 85, 453)
}

function addButton(scene: RuntimeScene, config: typeof BUTTONS[number]) {
  const cx = config.x + config.w / 2
  const cy = config.y + config.h / 2
  const image = scene.add.image(cx, cy, config.up)
    .setDisplaySize(config.w, config.h)
    .setDepth(30)

  // Hitbox is exactly the rendered button rectangle, not the source texture bounds.
  image.setInteractive(
    new Phaser.Geom.Rectangle(-config.w / 2, -config.h / 2, config.w, config.h),
    Phaser.Geom.Rectangle.Contains,
  )

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
  destroyCompetingStructuralAssets(scene)
  drawCanonicalConsole(scene)
  BUTTONS.forEach((button) => addButton(scene, button))
}

/** Geometry-only gate before final raster DA production. */
export function installTetraMindFckSkin(scene: TetraMindFckScene) {
  const runtime = scene as unknown as RuntimeScene
  const originalCreate = runtime.create.bind(scene)
  runtime.create = () => {
    originalCreate()
    installCanonicalGeometry(runtime)
  }
  return scene
}
