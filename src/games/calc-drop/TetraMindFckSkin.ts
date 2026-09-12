import Phaser from 'phaser'
import type { TetraMindFckScene } from './TetraMindFckScene'

type ActionName = 'left' | 'right' | 'down' | 'rotateLeft' | 'rotateRight'

type RuntimeScene = Phaser.Scene & {
  preload?: () => void
  create: () => void
  finished?: boolean
  pendingClear?: unknown
  runAction?: (action: ActionName, playSound?: boolean) => void
  startHold?: (action: 'left' | 'right' | 'down') => void
  stopHold?: () => void
  crtOverlay?: Phaser.GameObjects.Graphics
  clearLayer?: Phaser.GameObjects.Container
}

const STAGE_WIDTH = 390
const STAGE_HEIGHT = 844
const SHELL_COLOR = 0xe6d7be

const ASSETS = {
  shell: ['tetramindfck-crt-shell', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-crt-shell.webp'],
  left: ['tetramindfck-button-left', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-button-left.webp'],
  right: ['tetramindfck-button-right', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-button-right.webp'],
  rotateLeft: ['tetramindfck-button-rotate-left', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-button-rotate-left.webp'],
  rotateRight: ['tetramindfck-button-rotate-right', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-button-rotate-right.webp'],
  down: ['tetramindfck-button-down', '/assets/imported/tetramindfck/gameplay/ui/tetramindfck-button-down.webp'],
} as const

const BUTTONS = [
  { key: ASSETS.left[0], action: 'left' as const, x: 63, y: 670, width: 84, height: 62 },
  { key: ASSETS.right[0], action: 'right' as const, x: 151, y: 670, width: 84, height: 62 },
  { key: ASSETS.rotateLeft[0], action: 'rotateLeft' as const, x: 239, y: 670, width: 84, height: 62 },
  { key: ASSETS.rotateRight[0], action: 'rotateRight' as const, x: 327, y: 670, width: 84, height: 62 },
  { key: ASSETS.down[0], action: 'down' as const, x: 107, y: 744, width: 72, height: 47 },
] as const

function addButtonBacking(scene: RuntimeScene) {
  BUTTONS.forEach(({ x, y, width, height }) => {
    scene.add.rectangle(x, y, width + 5, height + 5, SHELL_COLOR, 1).setDepth(19)
  })
}

function addRasterButton(scene: RuntimeScene, config: typeof BUTTONS[number]) {
  const { key, action, x, y, width, height } = config
  const button = scene.add.image(x, y, key)
    .setDisplaySize(width, height)
    .setDepth(30)
    .setInteractive({ useHandCursor: true })

  const restore = () => {
    button.setPosition(x, y).setAlpha(1)
    scene.stopHold?.()
  }

  button.on('pointerdown', () => {
    if (scene.finished || scene.pendingClear) return
    button.setPosition(x, y + 1.5).setAlpha(0.88)
    scene.runAction?.(action)
    if (action === 'left' || action === 'right' || action === 'down') scene.startHold?.(action)
  })
  button.on('pointerup', restore)
  button.on('pointerout', restore)
  button.on('pointercancel', restore)
}

function installOverlay(scene: RuntimeScene) {
  scene.crtOverlay?.setDepth(18)
  scene.clearLayer?.setDepth(17)

  addButtonBacking(scene)

  scene.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, ASSETS.shell[0])
    .setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
    .setDepth(20)

  BUTTONS.forEach((button) => addRasterButton(scene, button))
}

/**
 * Applies the approved CRT/handheld raster skin without taking ownership of gameplay state.
 * TetraMindFckScene keeps rules, input semantics and live CRT content; this module owns art only.
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
