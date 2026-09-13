import Phaser from 'phaser'
import type { TetraMindFckScene } from './TetraMindFckScene'

type ActionName = 'left' | 'right' | 'down' | 'rotateLeft' | 'rotateRight'
type Aperture = { x: number; y: number; w: number; h: number }
type ButtonTextures = { up: string; down: string }

type RuntimeScene = Phaser.Scene & {
  preload?: () => void
  create: () => void
  finished?: boolean
  pendingClear?: unknown
  runAction?: (action: ActionName, playSound?: boolean) => void
  startHold?: (action: 'left' | 'right' | 'down') => void
  stopHold?: () => void
  nextOne?: Phaser.GameObjects.Container
  nextTwo?: Phaser.GameObjects.Container
}

const STAGE_WIDTH = 390
const STAGE_HEIGHT = 844
const CRT_BG = 0x09291f
const CRT_EDGE = 0x56c18b
const CRT_SCAN = 0xb8e7b6

const MAIN_CRT: Aperture = { x: 105.5, y: 122.5, w: 261, h: 503.5 }
const LEVEL_CRT: Aperture = { x: 24, y: 155.5, w: 64.5, h: 77 }
const TARGET_CRT: Aperture = { x: 24, y: 254, w: 64.5, h: 71.5 }
const NEXT_CRT: Aperture = { x: 24, y: 351.5, w: 64.5, h: 105.5 }
const NEXT2_CRT: Aperture = { x: 24, y: 484, w: 64.5, h: 105.5 }

const ASSETS = {
  shell: ['tetramindfck-skin-shell', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-crt-shell.webp'],
  leftUp: ['tetramindfck-skin-left-up', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-left-up.webp'],
  leftDown: ['tetramindfck-skin-left-down', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-left-down.webp'],
  rightUp: ['tetramindfck-skin-right-up', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-right-up.webp'],
  rightDown: ['tetramindfck-skin-right-down', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-right-down.webp'],
  rotateLeftUp: ['tetramindfck-skin-rotate-left-up', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-rotate-left-up.webp'],
  rotateLeftDown: ['tetramindfck-skin-rotate-left-down', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-rotate-left-down.webp'],
  rotateRightUp: ['tetramindfck-skin-rotate-right-up', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-rotate-right-up.webp'],
  rotateRightDown: ['tetramindfck-skin-rotate-right-down', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-rotate-right-down.webp'],
  downUp: ['tetramindfck-skin-down-up', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-down-up.webp'],
  downDown: ['tetramindfck-skin-down-down', '/assets/imported/tetramindfck/gameplay/buttons/tetramindfck-btn-down-down.webp'],
} as const

const BUTTONS: ReadonlyArray<{
  textures: ButtonTextures
  action: ActionName
  x: number
  y: number
  width: number
  height: number
}> = [
  { textures: { up: ASSETS.leftUp[0], down: ASSETS.leftDown[0] }, action: 'left', x: 63, y: 670, width: 84, height: 62 },
  { textures: { up: ASSETS.rightUp[0], down: ASSETS.rightDown[0] }, action: 'right', x: 151, y: 670, width: 84, height: 62 },
  { textures: { up: ASSETS.rotateLeftUp[0], down: ASSETS.rotateLeftDown[0] }, action: 'rotateLeft', x: 239, y: 670, width: 84, height: 62 },
  { textures: { up: ASSETS.rotateRightUp[0], down: ASSETS.rotateRightDown[0] }, action: 'rotateRight', x: 327, y: 670, width: 84, height: 62 },
  { textures: { up: ASSETS.downUp[0], down: ASSETS.downDown[0] }, action: 'down', x: 107, y: 744, width: 72, height: 47 },
]

function fillCrt(scene: RuntimeScene, aperture: Aperture) {
  const g = scene.add.graphics().setDepth(1)
  const radius = Math.min(10, aperture.w * 0.12)
  g.fillStyle(CRT_BG, 1)
    .fillRoundedRect(aperture.x - 1, aperture.y - 1, aperture.w + 2, aperture.h + 2, radius)
  g.lineStyle(1, CRT_EDGE, 0.26)
    .strokeRoundedRect(aperture.x, aperture.y, aperture.w, aperture.h, radius)
  for (let y = aperture.y + 2; y < aperture.y + aperture.h - 2; y += 3) {
    g.lineStyle(1, CRT_SCAN, 0.035)
      .lineBetween(aperture.x + 3, y, aperture.x + aperture.w - 3, y)
  }
}

function removeCompetingSkin(scene: RuntimeScene) {
  for (const child of [...scene.children.list]) {
    if (!(child instanceof Phaser.GameObjects.Image)) continue
    const key = child.texture.key
    if (
      key === 'tetra-shell'
      || key === 'tetra-crt'
      || key.startsWith('tetra-btn-')
    ) child.destroy()
  }
}

function addRasterButton(scene: RuntimeScene, config: typeof BUTTONS[number]) {
  const { textures, action, x, y, width, height } = config
  const button = scene.add.image(x, y, textures.up)
    .setDisplaySize(width, height)
    .setDepth(30)
    .setInteractive({ useHandCursor: true })

  const restore = () => {
    button.setTexture(textures.up).setPosition(x, y).setDisplaySize(width, height).setAlpha(1)
    scene.stopHold?.()
  }

  button.on('pointerdown', () => {
    if (scene.finished || scene.pendingClear) return
    button.setTexture(textures.down).setPosition(x, y).setDisplaySize(width, height).setAlpha(1)
    scene.runAction?.(action)
    if (action === 'left' || action === 'right' || action === 'down') scene.startHold?.(action)
  })
  button.on('pointerup', restore)
  button.on('pointerout', restore)
  button.on('pointercancel', restore)
}

function installOverlay(scene: RuntimeScene) {
  removeCompetingSkin(scene)

  fillCrt(scene, MAIN_CRT)
  fillCrt(scene, LEVEL_CRT)
  fillCrt(scene, TARGET_CRT)
  fillCrt(scene, NEXT_CRT)
  fillCrt(scene, NEXT2_CRT)

  scene.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, ASSETS.shell[0])
    .setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
    .setDepth(20)
    .setScrollFactor(0)

  BUTTONS.forEach((button) => addRasterButton(scene, button))

  // The previews were too small in the approved side CRTs. Keep the I-piece inside
  // the 64.5 logical-pixel aperture while making all four tokens readable.
  scene.nextOne?.setScale(1.1)
  scene.nextTwo?.setScale(1.1)
}

/**
 * Keeps a single coherent raster shell around the Phaser-owned live gameplay.
 * The scene may still preload production candidates, but any competing full-shell,
 * CRT-plate or button object is removed before the canonical skin is installed.
 */
export function installTetraMindFckSkin(scene: TetraMindFckScene) {
  const runtime = scene as unknown as RuntimeScene
  const originalPreload = typeof runtime.preload === 'function' ? runtime.preload.bind(scene) : null
  const originalCreate = runtime.create.bind(scene)

  runtime.preload = () => {
    originalPreload?.()
    Object.values(ASSETS).forEach(([key, url]) => {
      if (!scene.textures.exists(key)) scene.load.image(key, url)
    })
  }

  runtime.create = () => {
    originalCreate()
    installOverlay(runtime)
  }

  return scene
}
