import Phaser from 'phaser'
import { VladsSkewersScene } from './VladsSkewersScene'

type RuntimeCustomer = {
  id: number
  order: string[]
  patience: number
  maxPatience: number
}

type RuntimeCustomerSlot = {
  actor: Phaser.GameObjects.Container
  portrait: Phaser.GameObjects.Image
  drool: Phaser.GameObjects.Graphics
  baseY: number
  phase: number
  customerId: number
}

type RuntimeDrop = {
  id: number
  kind: string
  x: number
  y: number
}

type PresentationInternals = {
  preload: () => void
  create: () => void
  updateCustomers: () => void
  refreshHud: () => void
  showImpact: (...args: any[]) => void
  startGrilling: (drop: RuntimeDrop) => void
  stateReader: () => string
  customerSlots: RuntimeCustomerSlot[]
  customers: RuntimeCustomer[]
  stack: unknown[]
  elapsed: number
  serveBubble: Phaser.GameObjects.Image
  orderSkewer: Phaser.GameObjects.Graphics
  orderIcons: Phaser.GameObjects.Image[]
  patienceClock: Phaser.GameObjects.Graphics
  patienceText: Phaser.GameObjects.Text
  clientCountText: Phaser.GameObjects.Text
  impactCallouts: Phaser.GameObjects.Container[]
}

const APPROVED_TOWER_KEY = 'vlad-customer-tower-approved'
const APPROVED_CUSTOMERS_KEY = 'vlad-customers-approved'
const APPROVED_TOWER_URL = '/assets/imported/vlads-skewers/backgrounds/vlad-customer-tower.png'
const APPROVED_CUSTOMERS_URL = '/assets/imported/vlads-skewers/sprites/vlad-customer-atlas.png'

// Exact translation of the approved 853 px-wide DA into the canonical 390-unit stage.
// Source crop for the right tower: x=665, y=120, w=188, h=1360.
const DA_SCALE = 390 / 853
const TOWER_X = Math.round(665 * DA_SCALE)
const TOWER_Y = Math.round(120 * DA_SCALE)
const TOWER_WIDTH = Math.round(188 * DA_SCALE)
const TOWER_HEIGHT = Math.round(1360 * DA_SCALE)

// The five frame baselines were recovered from the approved DA without
// resizing/repainting the character pixels.
const CUSTOMER_BASELINES = [184, 297, 416, 529, 645] as const
const CUSTOMER_FRAME_X_OFFSETS = [3, -2, -5, 1, 4] as const
const CUSTOMER_X = 337
const CUSTOMER_WIDTH = Math.round(192 * DA_SCALE)
const CUSTOMER_HEIGHT = Math.round(250 * DA_SCALE)

// Keep the slot interiors dark so the old baked customer fragments from the
// decomposed tower source cannot leak through an empty niche.
const WINDOW_X = 318
const WINDOW_WIDTH = 63
const WINDOW_HEIGHT = 80
const WINDOW_BASELINE_GAP = 16

// Client order: same upper-right location as the approved DA, with room for
// five recipe icons and the clock integrated inside the same cartouche.
const ORDER_X = 240
const ORDER_Y = 128
const ORDER_BUBBLE_WIDTH = 136
const ORDER_BUBBLE_HEIGHT = 58
const ORDER_CONTENT_X = 221
const ORDER_ICON_SIZE = 22
const ORDER_ICON_SPACING = 19
const CLOCK_X = 292
const CLOCK_Y = 128
const CLOCK_RADIUS = 12

// Coordinates relative to the approved 192x250 frames after DA-scale display.
// These sit on the lower lip, not on the shelf or ear.
const CUSTOMER_MOUTH_OFFSETS = [
  [-1, -54],
  [0, -55],
  [1, -50],
  [1, -49],
  [0, -53],
] as const

const GRILL_COMMENTS = [
  'ÇA CHAUFFE…',
  'JE CROUSTILLE.',
  'PAS LE GRILL…',
  'TROP CUIT ?',
  'AÏE, LE BBQ.',
  'ÇA SENT LE ROUSSI.',
  'JE FONDS…',
  'BIEN GRILLÉ…',
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function approvedFrameFor(customerId: number) {
  return ((customerId % 5) + 5) % 5
}

function installApprovedTower(scene: VladsSkewersScene) {
  const tower = scene.add.image(TOWER_X, TOWER_Y, APPROVED_TOWER_KEY)
    .setOrigin(0, 0)
    .setDisplaySize(TOWER_WIDTH, TOWER_HEIGHT)
    .setDepth(24)

  const recesses = scene.add.graphics().setDepth(25)
  CUSTOMER_BASELINES.forEach((baseline) => {
    recesses
      .fillStyle(0x10090a, 1)
      .fillRect(
        WINDOW_X,
        baseline - WINDOW_BASELINE_GAP - WINDOW_HEIGHT,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
      )
  })

  return { tower, recesses }
}

function bindApprovedCustomers(internals: PresentationInternals) {
  const visibleCustomers = internals.customers.slice(0, 5)

  internals.customerSlots.forEach((slot, index) => {
    const customer = visibleCustomers[index]
    slot.actor.setVisible(Boolean(customer))
    slot.drool.clear().setVisible(false)

    if (!customer) {
      slot.customerId = -1
      return
    }

    const frame = approvedFrameFor(customer.id)
    slot.customerId = customer.id
    slot.baseY = CUSTOMER_BASELINES[index]
    slot.actor
      .setDepth(27 + index)
      .setScale(1)
      .setAngle(0)
      .setPosition(
        CUSTOMER_X + CUSTOMER_FRAME_X_OFFSETS[frame],
        slot.baseY,
      )

    slot.portrait
      .setTexture(APPROVED_CUSTOMERS_KEY, frame)
      .setOrigin(.5, 1)
      .setDisplaySize(CUSTOMER_WIDTH, CUSTOMER_HEIGHT)
      .clearTint()
  })

  const firstVisible = internals.customerSlots[0]
  internals.clientCountText
    .setText(`RESTE ×${internals.customers.length}`)
    .setPosition(340, firstVisible?.actor.visible ? 72 : 172)
    .setVisible(internals.customers.length > 0)
}

function redrawDrool(internals: PresentationInternals) {
  internals.customerSlots.forEach((slot, index) => {
    if (!slot.actor.visible || slot.customerId < 0) {
      slot.drool.clear().setVisible(false)
      return
    }

    // No fractional rotation or sub-pixel animation on the authored sprites:
    // that was the main source of blue/soft edge artifacts on desktop.
    const active = index === 0
    const pulse = Math.sin(internals.elapsed * (active ? 4 : 3.1) + slot.phase)
    const bob = pulse > .72 ? (active ? 2 : 1) : 0
    const frame = approvedFrameFor(slot.customerId)

    slot.actor
      .setAngle(0)
      .setScale(1)
      .setPosition(
        CUSTOMER_X + CUSTOMER_FRAME_X_OFFSETS[frame],
        slot.baseY - bob,
      )

    slot.portrait
      .setTexture(APPROVED_CUSTOMERS_KEY, frame)
      .setOrigin(.5, 1)
      .setDisplaySize(CUSTOMER_WIDTH, CUSTOMER_HEIGHT)

    const salivating = Math.floor((internals.elapsed + slot.phase) * 2) % 7 <= 1
    const [mouthX, mouthY] = CUSTOMER_MOUTH_OFFSETS[frame]
    slot.drool
      .clear()
      .setVisible(salivating)
      .setPosition(mouthX, mouthY)

    if (!salivating) return

    const drip = Math.floor((internals.elapsed * 10 + slot.phase) % 7)
    slot.drool
      .fillStyle(0x8eefff, .92)
      .fillRect(0, 0, 2, 4 + drip)
      .fillRect(-1, 3 + drip, 4, 3)
  })
}

function compactOrder(internals: PresentationInternals) {
  const active = internals.customers[0]

  internals.serveBubble
    .setPosition(ORDER_X, ORDER_Y)
    .setDisplaySize(ORDER_BUBBLE_WIDTH, ORDER_BUBBLE_HEIGHT)
    .setVisible(Boolean(active))

  internals.orderSkewer.clear().setVisible(Boolean(active))
  if (active) {
    const count = Math.min(5, active.order.length)
    const half = Math.max(28, (count - 1) * ORDER_ICON_SPACING / 2 + 13)
    internals.orderSkewer
      .lineStyle(5, 0x35140c, 1)
      .lineBetween(ORDER_CONTENT_X - half, ORDER_Y, ORDER_CONTENT_X + half, ORDER_Y)
      .lineStyle(2, 0xd38b25, 1)
      .lineBetween(ORDER_CONTENT_X - half, ORDER_Y - 1, ORDER_CONTENT_X + half + 4, ORDER_Y - 1)
      .fillStyle(0xf2b342, 1)
      .fillTriangle(
        ORDER_CONTENT_X - half - 7,
        ORDER_Y - 1,
        ORDER_CONTENT_X - half,
        ORDER_Y - 6,
        ORDER_CONTENT_X - half,
        ORDER_Y + 4,
      )
      .fillStyle(0x8d2418, 1)
      .fillRect(ORDER_CONTENT_X + half + 2, ORDER_Y - 6, 4, 11)
  }

  internals.orderIcons.forEach((icon, index) => {
    const count = Math.min(5, active?.order.length ?? internals.orderIcons.length)
    const kind = active?.order[index]
    const width = kind === 'meat' ? Math.round(ORDER_ICON_SIZE * 1.1) : ORDER_ICON_SIZE
    icon
      .setPosition(
        ORDER_CONTENT_X + (index - (count - 1) / 2) * ORDER_ICON_SPACING,
        ORDER_Y,
      )
      .setDisplaySize(width, ORDER_ICON_SIZE)
  })

  const ratio = active ? clamp(active.patience / active.maxPatience, 0, 1) : 0
  const meterColor = ratio < .25 ? 0xff3b24 : ratio < .55 ? 0xffa51f : 0x8ed348

  internals.patienceClock
    .clear()
    .setVisible(Boolean(active))
    .fillStyle(0x180708, 1).fillCircle(CLOCK_X, CLOCK_Y, CLOCK_RADIUS + 3)
    .lineStyle(2, 0xc06a31, 1).strokeCircle(CLOCK_X, CLOCK_Y, CLOCK_RADIUS + 2)
    .fillStyle(0x5c1713, 1).fillCircle(CLOCK_X, CLOCK_Y, CLOCK_RADIUS)

  if (active && ratio > 0) {
    const slices = Math.max(1, Math.ceil(ratio * 12))
    for (let index = 0; index < slices; index += 1) {
      const start = -Math.PI / 2 + index / 12 * Math.PI * 2
      const end = -Math.PI / 2 + (index + .82) / 12 * Math.PI * 2
      internals.patienceClock
        .fillStyle(meterColor, 1)
        .slice(CLOCK_X, CLOCK_Y, CLOCK_RADIUS - 2, start, end, false)
        .fillPath()
    }
  }

  internals.patienceText
    .setPosition(CLOCK_X, CLOCK_Y)
    .setFontSize(8)
}

function removeIngredientSpeech(internals: PresentationInternals) {
  const callout = internals.impactCallouts[internals.impactCallouts.length - 1]
  if (!callout) return
  const children = callout.getAll()
  if (children.length < 3) return

  const bubble = children[0]
  const word = children[1] as Phaser.GameObjects.Text
  const speech = children[2]
  bubble.destroy()
  speech.destroy()
  word.setY(0).setAlpha(1)
}

function showGrillComment(scene: VladsSkewersScene, drop: RuntimeDrop) {
  if (drop.kind === 'blood') return
  const phrase = GRILL_COMMENTS[Math.abs(drop.id) % GRILL_COMMENTS.length]
  const text = scene.add.text(0, 0, phrase, {
    fontFamily: 'monospace',
    fontStyle: 'bold',
    fontSize: '7px',
    color: '#2a0908',
    resolution: 1,
  }).setOrigin(.5)
  const width = clamp(text.width + 14, 54, 96)
  const bubble = scene.add.graphics()
    .fillStyle(0x160607, .94).fillRect(-width / 2 - 2, -10, width + 4, 20)
    .fillStyle(0xffedc6, .96).fillRect(-width / 2, -8, width, 16)
    .fillStyle(0x160607, .94).fillTriangle(-4, 8, 5, 8, 0, 14)
    .fillStyle(0xffedc6, .96).fillTriangle(-2, 7, 3, 7, 0, 11)
  const note = scene.add.container(
    Math.round(clamp(drop.x, 58, 326)),
    Math.round(clamp(drop.y - 34, 612, 676)),
    [bubble, text],
  ).setDepth(76)

  scene.tweens.add({
    targets: note,
    y: Math.round(note.y - 8),
    alpha: 0,
    delay: 650,
    duration: 380,
    ease: 'Cubic.In',
    onComplete: () => note.destroy(true),
  })
}

/** Presentation-only corrections validated against Vlad's authored DA. */
export function applyVladPresentationTuning(scene: VladsSkewersScene) {
  const internals = scene as unknown as PresentationInternals

  const preload = internals.preload.bind(scene)
  internals.preload = () => {
    preload()
    scene.load.image(APPROVED_TOWER_KEY, APPROVED_TOWER_URL)
    scene.load.spritesheet(APPROVED_CUSTOMERS_KEY, APPROVED_CUSTOMERS_URL, {
      frameWidth: 192,
      frameHeight: 250,
      startFrame: 0,
      endFrame: 4,
    })
  }

  const create = internals.create.bind(scene)
  internals.create = () => {
    create()
    installApprovedTower(scene)
    bindApprovedCustomers(internals)
    compactOrder(internals)
    redrawDrool(internals)
  }

  // Customer motion is deliberately owned here. The former implementation
  // rotated/scaled the sprites fractionally, which blurred/colored pixel edges.
  internals.updateCustomers = () => {
    bindApprovedCustomers(internals)
    redrawDrool(internals)
  }

  const refreshHud = internals.refreshHud.bind(scene)
  internals.refreshHud = () => {
    refreshHud()
    bindApprovedCustomers(internals)
    compactOrder(internals)
  }

  const showImpact = internals.showImpact.bind(scene)
  internals.showImpact = (...args: any[]) => {
    showImpact(...args)
    removeIngredientSpeech(internals)
  }

  const startGrilling = internals.startGrilling.bind(scene)
  internals.startGrilling = (drop: RuntimeDrop) => {
    startGrilling(drop)
    showGrillComment(scene, drop)
  }

  const stateReader = internals.stateReader.bind(scene)
  internals.stateReader = () => {
    const state = JSON.parse(stateReader()) as Record<string, any>
    state.presentation = {
      customerOrder: 'active-top',
      customerTower: {
        x: TOWER_X,
        y: TOWER_Y,
        width: TOWER_WIDTH,
        height: TOWER_HEIGHT,
        baselines: [...CUSTOMER_BASELINES],
      },
      customerTexture: APPROVED_CUSTOMERS_KEY,
      customerDisplay: {
        width: CUSTOMER_WIDTH,
        height: CUSTOMER_HEIGHT,
        integerMotion: true,
        rotation: 0,
      },
      orderBubble: {
        x: ORDER_X,
        y: ORDER_Y,
        width: ORDER_BUBBLE_WIDTH,
        height: ORDER_BUBBLE_HEIGHT,
        maxIngredients: 5,
        timerIntegrated: true,
      },
      ingredientSpeechOnImpale: false,
      grillComments: true,
      droolAnchoredToMouth: true,
    }
    return JSON.stringify(state)
  }
}
