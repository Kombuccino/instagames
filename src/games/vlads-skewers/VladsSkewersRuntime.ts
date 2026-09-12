import Phaser from 'phaser'
import { VladsSkewersScene } from './VladsSkewersScene'

const LEGACY_SKEWER_HEIGHT = 300
const SKEWER_BOTTOM_OFFSET = 35
const SKEWER_WIDTH = 10
const OFFSCREEN_SPAWN_SHIFT = 240
const ARM_SPRITE_Y_OFFSET = 24
const COMPLETED_HOLD_MS = 1000
const STACK_GAP = 43
const GUARD_STACK_CLEARANCE = 38

type RuntimeCustomer = {
  order: unknown[]
  patience?: number
}

type RuntimeStackItem = {
  baseRotation: number
  entryOffsetX: number
  entryOffsetY: number
  entryAge: number
  pushOffsetY: number
  pushVelocityY: number
  pierceLocalX: number
  pierceLocalY: number
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
  runTestAction?: (action: string) => string
}

type ImageFactory = (...args: any[]) => Phaser.GameObjects.Image

function skewerHeightForRecipe(count: number) {
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

function rotatePoint(x: number, y: number, rotation: number) {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  return { x: x * cos - y * sin, y: x * sin + y * cos }
}

function guardStackTarget(internals: RuntimeInternals, item: RuntimeStackItem, index: number) {
  const anchor = rotatePoint(item.pierceLocalX, item.pierceLocalY, item.baseRotation)
  const guardY = internals.skewerY - SKEWER_BOTTOM_OFFSET
  return {
    x: internals.skewerX - anchor.x,
    y: guardY - GUARD_STACK_CLEARANCE - index * STACK_GAP - anchor.y,
  }
}

function deliverySourceShiftForRecipe(count: number) {
  // The legacy delivery code arranges food from the tip. Offset its temporary
  // source so those same settle points coincide with our guard-first stack.
  return 208 - (Math.max(2, Math.min(5, count)) - 1) * STACK_GAP
}

function drawHarpoonHead(internals: RuntimeInternals) {
  const x = Math.round(internals.skewerX)
  const y = Math.round(internals.skewerY - currentTipOffset(internals))
  const graphics = internals.tipGlow
  graphics.clear().setDepth(48)

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

  internals.createBloodVisual = (x, y) => createReadableBloodDrop(scene, x, y)

  const runTestAction = internals.runTestAction?.bind(scene)
  if (runTestAction) {
    internals.runTestAction = (action: string) => {
      if (action === 'blood-visual') {
        internals.createBloodVisual(195, 350)
        return internals.stateReader()
      }
      return runTestAction(action)
    }
  }

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
    addStackFood(...args)

    // The canonical scene used to pile food downwards from the tip. Reset that
    // push model: the first pierced food belongs against the guard, and every
    // following food gets the next slot above it.
    internals.stack.forEach((item) => {
      item.pushOffsetY = 0
      item.pushVelocityY = 0
    })

    const latestIndex = internals.stack.length - 1
    const latest = internals.stack[latestIndex]
    if (!latest) return
    const target = guardStackTarget(internals, latest, latestIndex)
    latest.entryOffsetX = latest.visual.root.x - target.x
    latest.entryOffsetY = latest.visual.root.y - target.y
    latest.visual.root.setRotation(latest.baseRotation)
  }

  const updateSkewer = internals.updateSkewer.bind(scene)
  internals.updateSkewer = (dt: number) => {
    updateSkewer(dt)
    const height = currentSkewerHeight(internals)

    internals.skewer
      .setPosition(Math.round(internals.skewerX), Math.round(internals.skewerY - SKEWER_BOTTOM_OFFSET))
      .setDisplaySize(SKEWER_WIDTH, height)

    internals.arm.setPosition(Math.round(internals.skewerX + 23), Math.round(internals.skewerY - 92 + ARM_SPRITE_Y_OFFSET))
    drawHarpoonHead(internals)

    internals.stack.forEach((item, index) => {
      item.pushOffsetY = 0
      item.pushVelocityY = 0
      const target = guardStackTarget(internals, item, index)
      const entry = 1 - Phaser.Math.Easing.Cubic.Out(item.entryAge)
      item.visual.root
        .setPosition(
          Math.round(target.x + item.entryOffsetX * entry),
          Math.round(target.y + item.entryOffsetY * entry),
        )
        .setRotation(item.baseRotation)
    })
  }

  const dispatchCompletedSkewer = internals.dispatchCompletedSkewer.bind(scene)
  const performDispatch = (customer: RuntimeCustomer) => {
    const desiredHeight = skewerHeightForRecipe(customer.order.length)
    const sourceShift = deliverySourceShiftForRecipe(customer.order.length)
    const originalSkewerY = internals.skewerY
    const factory = scene.add as unknown as { image: ImageFactory }
    const originalImage: ImageFactory = factory.image.bind(scene.add)

    factory.image = (...args: any[]) => {
      const deliveryShaft = args[2] === 'vlad-skewer' && args[3] === 'shaft'
      if (deliveryShaft && typeof args[1] === 'number') args[1] -= sourceShift
      const image = originalImage(...args)
      if (!deliveryShaft) return image

      const setDisplaySize = image.setDisplaySize.bind(image)
      image.setDisplaySize = ((_: number, __: number) => {
        image.setDisplaySize = setDisplaySize as typeof image.setDisplaySize
        return setDisplaySize(SKEWER_WIDTH, desiredHeight)
      }) as typeof image.setDisplaySize
      return image
    }

    internals.skewerY = originalSkewerY + sourceShift
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
      skewer?: {
        tipY?: number
        height?: number
        width?: number
        hitboxVisible?: boolean
        completedLock?: boolean
        stackLayout?: string
        guardY?: number
      }
    }
    if (state.skewer) {
      state.skewer.tipY = Math.round(internals.skewerY - currentTipOffset(internals))
      state.skewer.height = currentSkewerHeight(internals)
      state.skewer.width = SKEWER_WIDTH
      state.skewer.hitboxVisible = false
      state.skewer.completedLock = completedRecipeLocked
      state.skewer.stackLayout = 'guard-up'
      state.skewer.guardY = Math.round(internals.skewerY - SKEWER_BOTTOM_OFFSET)
    }
    return JSON.stringify(state)
  }
}
