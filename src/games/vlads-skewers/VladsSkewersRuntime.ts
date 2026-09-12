import Phaser from 'phaser'
import { VladsSkewersScene } from './VladsSkewersScene'

const LEGACY_SKEWER_HEIGHT = 300
const SKEWER_BOTTOM_OFFSET = 35
const SKEWER_WIDTH = 10
const OFFSCREEN_SPAWN_SHIFT = 240
const ARM_SPRITE_Y_OFFSET = 24
const COMPLETED_HOLD_MS = 1000

type RuntimeCustomer = {
  order: unknown[]
  patience?: number
}

type RuntimeStackItem = {
  baseRotation: number
  entryOffsetY: number
  visual: {
    root: Phaser.GameObjects.Container
  }
}

type RuntimeInternals = {
  customers: RuntimeCustomer[]
  stack: RuntimeStackItem[]
  skewerX: number
  skewerY: number
  skewer: Phaser.GameObjects.Image
  arm: Phaser.GameObjects.Image
  tipGlow: Phaser.GameObjects.Graphics
  spawnDrop: (y?: number) => void
  createBloodVisual: (x: number, y: number) => Phaser.GameObjects.Container
  findTipContact: (previous: Phaser.Math.Vector2, tip: Phaser.Math.Vector2) => unknown
  addStackFood: (...args: unknown[]) => void
  updateSkewer: (dt: number) => void
  dispatchCompletedSkewer: (customer: RuntimeCustomer) => void
  stateReader: () => string
}

type ImageFactory = (...args: any[]) => Phaser.GameObjects.Image

function skewerHeightForRecipe(count: number) {
  // The final body centre sits at 54 + 43*(n-1) from the tip in the canonical
  // scene. These lengths leave only a small visual margin after the requested
  // number of foods, so a 2-food recipe no longer looks able to carry 4.
  if (count <= 2) return 110
  if (count === 3) return 150
  if (count === 4) return 190
  return 230
}

function recipeCount(internals: RuntimeInternals) {
  return Math.max(2, Math.min(5, internals.customers[0]?.order.length ?? 2))
}

function currentSkewerHeight(internals: RuntimeInternals) {
  return skewerHeightForRecipe(recipeCount(internals))
}

function currentTipOffset(internals: RuntimeInternals) {
  return currentSkewerHeight(internals) + SKEWER_BOTTOM_OFFSET
}

function legacyToCurrentTipDelta(internals: RuntimeInternals) {
  return LEGACY_SKEWER_HEIGHT - currentSkewerHeight(internals)
}

function drawHarpoonHead(internals: RuntimeInternals) {
  const x = Math.round(internals.skewerX)
  const y = Math.round(internals.skewerY - currentTipOffset(internals))
  const graphics = internals.tipGlow
  graphics.clear().setDepth(48)

  // Deliberately built on a 2px grid: no antialiased debug dot and the visible
  // apex is the actual collision point.
  graphics.fillStyle(0x1b0807, 1)
  graphics.fillRect(x - 2, y, 4, 4)
  graphics.fillRect(x - 4, y + 4, 8, 8)
  graphics.fillRect(x - 8, y + 10, 6, 4)
  graphics.fillRect(x + 2, y + 10, 6, 4)
  graphics.fillStyle(0xe0b14b, 1)
  graphics.fillRect(x - 1, y + 2, 2, 8)
  graphics.fillRect(x - 3, y + 8, 6, 4)
  graphics.fillStyle(0xb96827, 1)
  graphics.fillRect(x - 6, y + 11, 4, 2)
  graphics.fillRect(x + 2, y + 11, 4, 2)
  graphics.fillStyle(0xffdb72, 1).fillRect(x, y + 2, 1, 5)
}

function createReadableBloodDrop(scene: VladsSkewersScene, x: number, y: number) {
  const root = scene.add.container(Math.round(x), Math.round(y)).setDepth(21)
  const g = scene.add.graphics()

  // Coarse 2px-grid droplet: dark outline, saturated blood mass and a tiny
  // highlight. No circles/triangles, which looked smooth and unlike the rest of
  // Vlad's constructed pixel art.
  g.fillStyle(0x2b0509, 1)
  g.fillRect(-2, -20, 4, 6)
  g.fillRect(-6, -16, 12, 6)
  g.fillRect(-10, -10, 20, 10)
  g.fillRect(-12, 0, 24, 12)
  g.fillRect(-10, 12, 20, 6)
  g.fillRect(-6, 18, 12, 4)

  g.fillStyle(0xd51028, 1)
  g.fillRect(-2, -16, 4, 6)
  g.fillRect(-6, -12, 12, 6)
  g.fillRect(-8, -6, 16, 8)
  g.fillRect(-10, 2, 20, 8)
  g.fillRect(-8, 10, 16, 6)
  g.fillRect(-4, 16, 8, 4)

  g.fillStyle(0xff3b4d, 1)
  g.fillRect(-6, -5, 4, 8)
  g.fillRect(-4, -8, 2, 2)
  g.fillStyle(0xffd7d9, 1)
  g.fillRect(-5, -6, 2, 4)

  root.add(g)
  return root
}

/** Runtime tuning kept beside Vlad's canonical Phaser scene. */
export function applyVladRuntimeTuning(scene: VladsSkewersScene) {
  const internals = scene as unknown as RuntimeInternals
  let completedRecipeLocked = false

  const originalBlood = internals.createBloodVisual.bind(scene)
  void originalBlood
  internals.createBloodVisual = (x, y) => createReadableBloodDrop(scene, x, y)

  const spawnDrop = internals.spawnDrop.bind(scene)
  internals.spawnDrop = (y = 145) => {
    spawnDrop(y - OFFSCREEN_SPAWN_SHIFT)
  }

  const findTipContact = internals.findTipContact.bind(scene)
  internals.findTipContact = (previous, tip) => {
    if (completedRecipeLocked) return null
    const delta = legacyToCurrentTipDelta(internals)
    return findTipContact(
      new Phaser.Math.Vector2(previous.x, previous.y + delta),
      new Phaser.Math.Vector2(tip.x, tip.y + delta),
    )
  }

  const addStackFood = internals.addStackFood.bind(scene)
  internals.addStackFood = (...args: unknown[]) => {
    const delta = legacyToCurrentTipDelta(internals)
    addStackFood(...args)
    const latest = internals.stack[internals.stack.length - 1]
    if (!latest) return
    latest.entryOffsetY -= delta
    latest.visual.root.setRotation(latest.baseRotation)
  }

  const updateSkewer = internals.updateSkewer.bind(scene)
  internals.updateSkewer = (dt: number) => {
    updateSkewer(dt)
    const height = currentSkewerHeight(internals)
    const delta = LEGACY_SKEWER_HEIGHT - height

    internals.skewer
      .setPosition(Math.round(internals.skewerX), Math.round(internals.skewerY - SKEWER_BOTTOM_OFFSET))
      .setDisplaySize(SKEWER_WIDTH, height)

    internals.arm.setPosition(Math.round(internals.skewerX + 23), Math.round(internals.skewerY - 92 + ARM_SPRITE_Y_OFFSET))
    drawHarpoonHead(internals)

    internals.stack.forEach((item) => {
      item.visual.root.x = Math.round(item.visual.root.x)
      item.visual.root.y = Math.round(item.visual.root.y + delta)
    })
  }

  const dispatchCompletedSkewer = internals.dispatchCompletedSkewer.bind(scene)
  const performDispatch = (customer: RuntimeCustomer) => {
    const desiredHeight = skewerHeightForRecipe(customer.order.length)
    const delta = LEGACY_SKEWER_HEIGHT - desiredHeight
    const originalSkewerY = internals.skewerY
    const factory = scene.add as unknown as { image: ImageFactory }
    const originalImage: ImageFactory = factory.image.bind(scene.add)

    factory.image = (...args: any[]) => {
      const deliveryShaft = args[2] === 'vlad-skewer' && args[3] === 'shaft'
      if (deliveryShaft && typeof args[1] === 'number') args[1] -= delta
      const image = originalImage(...args)
      if (!deliveryShaft) return image

      const setDisplaySize = image.setDisplaySize.bind(image)
      image.setDisplaySize = ((_: number, __: number) => {
        image.setDisplaySize = setDisplaySize as typeof image.setDisplaySize
        return setDisplaySize(SKEWER_WIDTH, desiredHeight)
      }) as typeof image.setDisplaySize
      return image
    }

    internals.skewerY = originalSkewerY + delta
    try {
      dispatchCompletedSkewer(customer)
    } finally {
      internals.skewerY = originalSkewerY
      factory.image = originalImage
      completedRecipeLocked = false
    }
  }

  internals.dispatchCompletedSkewer = (customer: RuntimeCustomer) => {
    if (completedRecipeLocked) return
    completedRecipeLocked = true
    if (typeof customer.patience === 'number') customer.patience = Math.max(customer.patience, 1.25)

    // Keep the completed skewer in the player's hand for one full second. During
    // this presentation beat the apex has no collision, so a falling ingredient
    // cannot accidentally ruin an already-valid recipe.
    scene.time.delayedCall(COMPLETED_HOLD_MS, () => {
      if (internals.customers[0] !== customer) {
        completedRecipeLocked = false
        return
      }
      performDispatch(customer)
    })
  }

  const stateReader = internals.stateReader.bind(scene)
  internals.stateReader = () => {
    const state = JSON.parse(stateReader()) as {
      skewer?: { tipY?: number; height?: number; width?: number; hitboxVisible?: boolean; completedLock?: boolean }
    }
    if (state.skewer) {
      state.skewer.tipY = Math.round(internals.skewerY - currentTipOffset(internals))
      state.skewer.height = currentSkewerHeight(internals)
      state.skewer.width = SKEWER_WIDTH
      state.skewer.hitboxVisible = false
      state.skewer.completedLock = completedRecipeLocked
    }
    return JSON.stringify(state)
  }
}
