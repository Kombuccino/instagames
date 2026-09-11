import Phaser from 'phaser'
import { VladsSkewersScene } from './VladsSkewersScene'

const LEGACY_SKEWER_HEIGHT = 300
const SKEWER_BOTTOM_OFFSET = 35
const SKEWER_WIDTH = 14
const OFFSCREEN_SPAWN_SHIFT = 240

type RuntimeCustomer = {
  order: unknown[]
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
  tipGlow: Phaser.GameObjects.Graphics
  spawnDrop: (y?: number) => void
  findTipContact: (previous: Phaser.Math.Vector2, tip: Phaser.Math.Vector2) => unknown
  addStackFood: (...args: unknown[]) => void
  updateSkewer: (dt: number) => void
  dispatchCompletedSkewer: (customer: RuntimeCustomer) => void
  stateReader: () => string
}

type ImageFactory = (...args: any[]) => Phaser.GameObjects.Image

function skewerHeightForRecipe(count: number) {
  if (count <= 2) return 170
  if (count === 3) return 215
  if (count === 4) return 260
  return 300
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

  // The top pixel at (x,y) is the real collision apex. Everything else grows
  // downward from it, so the visible harpoon and the invisible hit point agree.
  graphics.fillStyle(0x1b0807, 1)
  graphics.fillTriangle(x, y, x - 6, y + 16, x + 6, y + 16)
  graphics.fillTriangle(x - 2, y + 10, x - 11, y + 20, x - 2, y + 16)
  graphics.fillTriangle(x + 2, y + 10, x + 11, y + 20, x + 2, y + 16)
  graphics.fillStyle(0xe0b14b, 1)
  graphics.fillTriangle(x, y + 2, x - 3, y + 13, x + 3, y + 13)
  graphics.fillStyle(0xb96827, 1)
  graphics.fillTriangle(x - 2, y + 11, x - 8, y + 17, x - 2, y + 15)
  graphics.fillTriangle(x + 2, y + 11, x + 8, y + 17, x + 2, y + 15)
  graphics.fillStyle(0xffdb72, 1).fillRect(x - 1, y + 4, 2, 6)
}

/**
 * Runtime tuning kept beside Vlad's canonical Phaser scene.
 *
 * The scene predates variable skewer geometry and stores its former 300-unit
 * length in module constants. These narrowly scoped hooks preserve the shipped
 * gameplay while moving the actual collision/render geometry to the current
 * recipe length. They can be folded into the scene when that file is next
 * structurally edited.
 */
export function applyVladRuntimeTuning(scene: VladsSkewersScene) {
  const internals = scene as unknown as RuntimeInternals

  const spawnDrop = internals.spawnDrop.bind(scene)
  internals.spawnDrop = (y = 145) => {
    spawnDrop(y - OFFSCREEN_SPAWN_SHIFT)
  }

  const findTipContact = internals.findTipContact.bind(scene)
  internals.findTipContact = (previous, tip) => {
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

    // The legacy scene calculated its entry animation against the old tip.
    // Compensate once, then keep the authored impact rotation exactly.
    latest.entryOffsetY -= delta
    latest.visual.root.setRotation(latest.baseRotation)
  }

  const updateSkewer = internals.updateSkewer.bind(scene)
  internals.updateSkewer = (dt: number) => {
    updateSkewer(dt)
    const height = currentSkewerHeight(internals)
    const delta = LEGACY_SKEWER_HEIGHT - height

    internals.skewer
      .setPosition(internals.skewerX, internals.skewerY - SKEWER_BOTTOM_OFFSET)
      .setDisplaySize(SKEWER_WIDTH, height)

    drawHarpoonHead(internals)

    // The legacy update places the stack from its old 300-unit tip. Re-anchor
    // those absolute positions to the recipe-sized harpoon without accumulating
    // any per-frame offset.
    internals.stack.forEach((item) => {
      item.visual.root.y += delta
    })
  }

  const dispatchCompletedSkewer = internals.dispatchCompletedSkewer.bind(scene)
  internals.dispatchCompletedSkewer = (customer: RuntimeCustomer) => {
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

    // The delivery routine derives food positions from the legacy tip offset.
    // Moving its temporary source down by the length delta gives it the new tip,
    // while the image factory correction keeps the shaft attached to Vlad's hand.
    internals.skewerY = originalSkewerY + delta
    try {
      dispatchCompletedSkewer(customer)
    } finally {
      internals.skewerY = originalSkewerY
      factory.image = originalImage
    }
  }

  const stateReader = internals.stateReader.bind(scene)
  internals.stateReader = () => {
    const state = JSON.parse(stateReader()) as {
      skewer?: { tipY?: number; height?: number; width?: number; hitboxVisible?: boolean }
    }
    if (state.skewer) {
      state.skewer.tipY = Math.round(internals.skewerY - currentTipOffset(internals))
      state.skewer.height = currentSkewerHeight(internals)
      state.skewer.width = SKEWER_WIDTH
      state.skewer.hitboxVisible = false
    }
    return JSON.stringify(state)
  }
}
