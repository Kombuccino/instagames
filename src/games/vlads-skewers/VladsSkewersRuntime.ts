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

type RuntimeMatterLimb = {
  anchor: any
  joint: any
  end: any
  upper: any
  lower: any
  side: -1 | 1
  leg: boolean
  index: number
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
  limbSwing: [number, number, number, number]
  limbJointSwing: [number, number, number, number]
  matterLimbs?: RuntimeMatterLimb[]
  visual: {
    root: Phaser.GameObjects.Container
    leftArm: Phaser.GameObjects.Graphics
    rightArm: Phaser.GameObjects.Graphics
    leftLeg: Phaser.GameObjects.Graphics
    rightLeg: Phaser.GameObjects.Graphics
    size: number
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
  drawInertStackLimbs: (...args: any[]) => void
  dispatchCompletedSkewer: (customer: RuntimeCustomer) => void
  clearStack: () => void
  stateReader: () => string
  runTestAction?: (action: string) => string
}

type ImageFactory = (...args: any[]) => Phaser.GameObjects.Image

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

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

function limbStartLocal(item: RuntimeStackItem, side: -1 | 1, leg: boolean) {
  const size = item.visual.size
  return leg
    ? { x: side * size * .17, y: size * .29 }
    : { x: side * size * .32, y: 0 }
}

function localToWorld(item: RuntimeStackItem, point: { x: number; y: number }) {
  const rotated = rotatePoint(point.x, point.y, item.visual.root.rotation)
  return {
    x: item.visual.root.x + rotated.x,
    y: item.visual.root.y + rotated.y,
  }
}

function worldToLocal(item: RuntimeStackItem, point: { x: number; y: number }) {
  return rotatePoint(
    point.x - item.visual.root.x,
    point.y - item.visual.root.y,
    -item.visual.root.rotation,
  )
}

function drawPhysicalLimb(
  graphics: Phaser.GameObjects.Graphics,
  start: { x: number; y: number },
  joint: { x: number; y: number },
  end: { x: number; y: number },
  extremity: 'hand' | 'foot',
  side: -1 | 1,
) {
  const pixel = (value: number) => Math.round(value)
  graphics.clear().lineStyle(5, 0x090405, 1)
  graphics.lineBetween(pixel(start.x), pixel(start.y), pixel(joint.x), pixel(joint.y))
  graphics.lineBetween(pixel(joint.x), pixel(joint.y), pixel(end.x), pixel(end.y))
  graphics.lineStyle(2, 0x6f3024, 1)
  graphics.lineBetween(pixel(start.x), pixel(start.y), pixel(joint.x), pixel(joint.y))
  graphics.lineBetween(pixel(joint.x), pixel(joint.y), pixel(end.x), pixel(end.y))
  graphics.fillStyle(0x170708, 1).fillRect(pixel(joint.x) - 2, pixel(joint.y) - 2, 5, 5)
  graphics.fillStyle(0xa45a43, 1).fillRect(pixel(joint.x) - 1, pixel(joint.y) - 1, 3, 3)
  graphics.fillStyle(0xffead5, 1)
  if (extremity === 'hand') {
    graphics.fillRect(pixel(end.x) - 3, pixel(end.y) - 3, 6, 7)
    graphics.fillRect(pixel(end.x) + side * 2 - (side < 0 ? 2 : 0), pixel(end.y) - 6, 2, 4)
    graphics.fillStyle(0x9f5d50, 1).fillRect(pixel(end.x) - 2, pixel(end.y) + 2, 4, 1)
  } else {
    graphics.fillRect(pixel(end.x) - (side < 0 ? 7 : 0), pixel(end.y) - 2, 7, 5)
    graphics.fillStyle(0x9f5d50, 1).fillRect(pixel(end.x) - (side < 0 ? 6 : 0), pixel(end.y) + 1, 6, 1)
  }
}

function createMatterLimbs(scene: VladsSkewersScene, item: RuntimeStackItem) {
  if (item.matterLimbs) return item.matterLimbs
  const size = item.visual.size
  const specs = [
    { side: -1 as const, leg: false, index: 0 },
    { side: 1 as const, leg: false, index: 1 },
    { side: -1 as const, leg: true, index: 2 },
    { side: 1 as const, leg: true, index: 3 },
  ]

  item.matterLimbs = specs.map((spec) => {
    const startLocal = limbStartLocal(item, spec.side, spec.leg)
    const shoulder = localToWorld(item, startLocal)
    const hang = size * (spec.leg ? .58 : .55)
    const firstLength = hang * .47
    const secondLength = hang * .53
    const initialSide = spec.side * (spec.leg ? 4 : 6)
    const joint = scene.matter.add.circle(shoulder.x + initialSide, shoulder.y + firstLength, 2, {
      frictionAir: .018,
      restitution: 0,
      collisionFilter: { mask: 0 },
      label: `vlad-limb-joint-${spec.index}`,
    })
    const end = scene.matter.add.circle(shoulder.x + initialSide * 1.4, shoulder.y + firstLength + secondLength, 2, {
      frictionAir: .012,
      restitution: 0,
      collisionFilter: { mask: 0 },
      label: `vlad-limb-end-${spec.index}`,
    })
    const anchor = scene.matter.add.circle(shoulder.x, shoulder.y, 2, {
      isStatic: true,
      collisionFilter: { mask: 0 },
      label: `vlad-limb-anchor-${spec.index}`,
    })
    const upper = scene.matter.add.constraint(anchor, joint, firstLength, .94, { damping: .035 })
    const lower = scene.matter.add.constraint(joint, end, secondLength, .92, { damping: .025 })
    return { anchor, joint, end, upper, lower, ...spec }
  })
  return item.matterLimbs
}

function destroyMatterLimbs(scene: VladsSkewersScene, item: RuntimeStackItem) {
  const limbs = item.matterLimbs
  if (!limbs) return
  item.matterLimbs = undefined
  limbs.forEach((limb) => {
    scene.matter.world.removeConstraint(limb.upper)
    scene.matter.world.removeConstraint(limb.lower)
    scene.matter.world.remove(limb.anchor)
    scene.matter.world.remove(limb.joint)
    scene.matter.world.remove(limb.end)
  })
}

function updateMatterLimbs(
  scene: VladsSkewersScene,
  item: RuntimeStackItem,
  accelerationX: number,
  accelerationY: number,
) {
  const limbs = createMatterLimbs(scene, item)
  const forceX = clamp(-accelerationX * .0000018, -.035, .035)
  const forceY = clamp(-accelerationY * .0000015, -.03, .03)

  limbs.forEach((limb) => {
    const startLocal = limbStartLocal(item, limb.side, limb.leg)
    const shoulderWorld = localToWorld(item, startLocal)
    scene.matter.body.setPosition(limb.anchor, shoulderWorld, true)

    // The shoulder is kinematic because it belongs to the skewered body. The
    // rest of the two-link chain is genuine Matter physics: gravity acts in
    // screen/world space and the opposite acceleration impulse creates the
    // expected lag/whip when the player flicks the mouse or finger.
    scene.matter.body.applyForce(limb.joint, limb.joint.position, { x: forceX * .72, y: forceY * .72 })
    scene.matter.body.applyForce(limb.end, limb.end.position, { x: forceX * 1.28, y: forceY * 1.28 })

    const jointLocal = worldToLocal(item, limb.joint.position)
    const endLocal = worldToLocal(item, limb.end.position)
    const graphics = limb.index === 0
      ? item.visual.leftArm
      : limb.index === 1
        ? item.visual.rightArm
        : limb.index === 2
          ? item.visual.leftLeg
          : item.visual.rightLeg

    drawPhysicalLimb(
      graphics,
      startLocal,
      jointLocal,
      endLocal,
      limb.leg ? 'foot' : 'hand',
      limb.side,
    )

    const upperAngle = Math.atan2(jointLocal.y - startLocal.y, jointLocal.x - startLocal.x)
    const lowerAngle = Math.atan2(endLocal.y - jointLocal.y, endLocal.x - jointLocal.x)
    item.limbSwing[limb.index] = Phaser.Math.Angle.Wrap(upperAngle - Math.PI / 2)
    item.limbJointSwing[limb.index] = Phaser.Math.Angle.Wrap(lowerAngle - upperAngle)
  })
}

/** Runtime tuning kept beside Vlad's canonical Phaser scene. */
export function applyVladRuntimeTuning(scene: VladsSkewersScene) {
  const internals = scene as unknown as RuntimeInternals
  let completedRecipeLocked = false
  let previousSkewerX = internals.skewerX
  let previousSkewerY = internals.skewerY
  let previousVelocityX = 0
  let previousVelocityY = 0

  internals.createBloodVisual = (x, y) => createReadableBloodDrop(scene, x, y)

  const runTestAction = internals.runTestAction?.bind(scene)
  if (runTestAction) {
    internals.runTestAction = (action: string) => {
      if (action === 'blood-visual') {
        internals.createBloodVisual(195, 350)
        return internals.stateReader()
      }
      const result = runTestAction(action)
      if (action === 'limb-whirl') {
        for (let step = 0; step < 24; step += 1) {
          scene.matter.step(1000 / 60)
          internals.updateSkewer(1 / 60)
        }
        return internals.stateReader()
      }
      return result
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

  // Disable the previous synthetic spring/flap solver. Matter owns the limb
  // motion below, after the guard-first stack position is finalized.
  internals.drawInertStackLimbs = () => {}

  const updateSkewer = internals.updateSkewer.bind(scene)
  internals.updateSkewer = (dt: number) => {
    updateSkewer(dt)
    const height = currentSkewerHeight(internals)
    const safeDt = Math.max(dt, .001)
    const velocityX = (internals.skewerX - previousSkewerX) / safeDt
    const velocityY = (internals.skewerY - previousSkewerY) / safeDt
    const accelerationX = (velocityX - previousVelocityX) / safeDt
    const accelerationY = (velocityY - previousVelocityY) / safeDt
    previousSkewerX = internals.skewerX
    previousSkewerY = internals.skewerY
    previousVelocityX = velocityX
    previousVelocityY = velocityY

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
      updateMatterLimbs(scene, item, accelerationX, accelerationY)
    })
  }

  const clearStack = internals.clearStack.bind(scene)
  internals.clearStack = () => {
    internals.stack.forEach((item) => destroyMatterLimbs(scene, item))
    clearStack()
  }

  const dispatchCompletedSkewer = internals.dispatchCompletedSkewer.bind(scene)
  const performDispatch = (customer: RuntimeCustomer) => {
    const desiredHeight = skewerHeightForRecipe(customer.order.length)
    const sourceShift = deliverySourceShiftForRecipe(customer.order.length)
    const originalSkewerY = internals.skewerY
    const factory = scene.add as unknown as { image: ImageFactory }
    const originalImage: ImageFactory = factory.image.bind(scene.add)

    internals.stack.forEach((item) => destroyMatterLimbs(scene, item))

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
        limbPhysics?: string
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
      state.skewer.limbPhysics = 'matter-two-link-gravity'
    }
    return JSON.stringify(state)
  }
}
