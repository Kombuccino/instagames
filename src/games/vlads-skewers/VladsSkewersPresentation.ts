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
  impactCallouts: Phaser.GameObjects.Container[]
}

const CUSTOMER_X = 355
const CUSTOMER_SIZE = 82
const ORDER_X = 302
const ORDER_Y = 566
const ORDER_BUBBLE_WIDTH = 136
const ORDER_BUBBLE_HEIGHT = 58
const ORDER_ICON_SIZE = 26
const ORDER_ICON_SPACING = 23
const CLOCK_Y = 603
const CLOCK_RADIUS = 11

// Coordinates are relative to the portrait baseline (origin .5, 1).
// The old offsets were treated as if y=0 were the face, which put drool near
// the shelf. These frame-specific anchors sit on the lower lip instead.
const CUSTOMER_MOUTH_OFFSETS = [
  [-6, -47], [-8, -48], [-1, -47], [-4, -46], [-4, -50],
  [-12, -46], [-4, -47], [-3, -46], [-4, -48], [-5, -46],
  [-7, -48], [-4, -47], [-1, -47], [-4, -46], [-4, -47],
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

function normalizeCustomerSlots(internals: PresentationInternals) {
  internals.customerSlots.forEach((slot) => {
    slot.actor.x = CUSTOMER_X
    slot.actor.setScale(1)
    slot.portrait.setOrigin(.5, 1).setDisplaySize(CUSTOMER_SIZE, CUSTOMER_SIZE)
  })
}

function redrawDrool(internals: PresentationInternals) {
  internals.customerSlots.forEach((slot, index) => {
    if (!slot.actor.visible || slot.customerId < 0) {
      slot.drool.clear().setVisible(false)
      return
    }

    const active = index === internals.customerSlots.length - 1
    const bob = Math.max(0, Math.sin(internals.elapsed * (active ? 4.4 : 3.4) + slot.phase)) * (active ? 1.4 : .7)
    slot.actor.x = CUSTOMER_X
    slot.actor.y = slot.baseY - bob
    slot.actor.angle = Math.sin(internals.elapsed * 2.2 + slot.phase) * .25
    slot.actor.setScale(1)
    slot.portrait.setDisplaySize(CUSTOMER_SIZE, CUSTOMER_SIZE)

    const salivating = Math.floor((internals.elapsed + slot.phase) * 2) % 7 <= 1
    const frame = ((slot.customerId % CUSTOMER_MOUTH_OFFSETS.length) + CUSTOMER_MOUTH_OFFSETS.length) % CUSTOMER_MOUTH_OFFSETS.length
    const [mouthX, mouthY] = CUSTOMER_MOUTH_OFFSETS[frame]
    slot.drool.clear().setVisible(salivating).setPosition(mouthX, mouthY)
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
    const half = Math.max(30, (active.order.length - 1) * ORDER_ICON_SPACING / 2 + 16)
    internals.orderSkewer
      .lineStyle(5, 0x35140c, 1).lineBetween(ORDER_X - half, ORDER_Y, ORDER_X + half, ORDER_Y)
      .lineStyle(2, 0xd38b25, 1).lineBetween(ORDER_X - half, ORDER_Y - 1, ORDER_X + half + 4, ORDER_Y - 1)
      .fillStyle(0xf2b342, 1).fillTriangle(ORDER_X - half - 7, ORDER_Y - 1, ORDER_X - half, ORDER_Y - 6, ORDER_X - half, ORDER_Y + 4)
      .fillStyle(0x8d2418, 1).fillRect(ORDER_X + half + 2, ORDER_Y - 6, 4, 11)
  }

  internals.orderIcons.forEach((icon, index) => {
    const count = active?.order.length ?? internals.orderIcons.length
    const kind = active?.order[index]
    const width = kind === 'meat' ? Math.round(ORDER_ICON_SIZE * 1.1) : ORDER_ICON_SIZE
    icon
      .setPosition(ORDER_X + (index - (count - 1) / 2) * ORDER_ICON_SPACING, ORDER_Y)
      .setDisplaySize(width, ORDER_ICON_SIZE)
  })

  const ratio = active ? clamp(active.patience / active.maxPatience, 0, 1) : 0
  const meterColor = ratio < .25 ? 0xff3b24 : ratio < .55 ? 0xffa51f : 0x8ed348
  internals.patienceClock.clear().setVisible(Boolean(active))
    .fillStyle(0x180708, 1).fillCircle(ORDER_X, CLOCK_Y, CLOCK_RADIUS + 3)
    .lineStyle(2, 0xc06a31, 1).strokeCircle(ORDER_X, CLOCK_Y, CLOCK_RADIUS + 2)
    .fillStyle(0x5c1713, 1).fillCircle(ORDER_X, CLOCK_Y, CLOCK_RADIUS)

  if (active && ratio > 0) {
    const slices = Math.max(1, Math.ceil(ratio * 12))
    for (let index = 0; index < slices; index += 1) {
      const start = -Math.PI / 2 + index / 12 * Math.PI * 2
      const end = -Math.PI / 2 + (index + .82) / 12 * Math.PI * 2
      internals.patienceClock
        .fillStyle(meterColor, 1)
        .slice(ORDER_X, CLOCK_Y, CLOCK_RADIUS - 2, start, end, false)
        .fillPath()
    }
  }

  internals.patienceText.setPosition(ORDER_X, CLOCK_Y).setFontSize(8)
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
  const note = scene.add.container(clamp(drop.x, 58, 326), clamp(drop.y - 34, 612, 676), [bubble, text]).setDepth(76)
  scene.tweens.add({
    targets: note,
    y: note.y - 8,
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

  const create = internals.create.bind(scene)
  internals.create = () => {
    create()
    normalizeCustomerSlots(internals)
    compactOrder(internals)
    redrawDrool(internals)
  }

  const updateCustomers = internals.updateCustomers.bind(scene)
  internals.updateCustomers = () => {
    updateCustomers()
    normalizeCustomerSlots(internals)
    redrawDrool(internals)
  }

  const refreshHud = internals.refreshHud.bind(scene)
  internals.refreshHud = () => {
    refreshHud()
    normalizeCustomerSlots(internals)
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
      customerX: CUSTOMER_X,
      customerSize: CUSTOMER_SIZE,
      orderBubble: { width: ORDER_BUBBLE_WIDTH, height: ORDER_BUBBLE_HEIGHT },
      ingredientSpeechOnImpale: false,
      grillComments: true,
      droolAnchoredToMouth: true,
    }
    return JSON.stringify(state)
  }
}
