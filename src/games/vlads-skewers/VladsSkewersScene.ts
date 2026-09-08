import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { miniFuggAudio } from '../../audio'

export const VLADS_SKEWERS_SCENE_KEY = 'vlads-skewers-main'

const W = 390
const H = 844
const GAME_ID = 'vlads-skewers'
const ASSET_ROOT = '/assets/generated/vlads-skewers'
const MAX_LOST = 3
const MAX_STACK = 5
const COMBO_WINDOW = 1.35
const GRILL_Y = 705
const SKEWER_HEIGHT = 300
const TIP_OFFSET = SKEWER_HEIGHT + 35
const PLAY_MIN_X = 38
const PLAY_MAX_X = 326
const FALLING_FOOD_SIZE = 78
const STACK_FOOD_SIZE = 70
const STACK_GAP = 43
const HAND_GRIP_OFFSET = 43
const NATURAL_SKEWER_Y = 780
const MAX_SKEWER_Y = 796
const HAND_HIT_RADIUS_X = 68
const HAND_HIT_RADIUS_Y = 76
const FONT = '"Arial Black", Impact, sans-serif'

type IngredientKind = 'meat' | 'tomato' | 'pepper' | 'onion' | 'mushroom' | 'zucchini' | 'eggplant' | 'chicken' | 'tofu' | 'fish'
type DropKind = IngredientKind | 'blood' | 'garlic'
type Emotion = 'happy' | 'realizing' | 'panic' | 'dead'
type DropState = 'falling' | 'grilling'

type IngredientSpec = {
  kind: IngredientKind
  label: string
  frame: number
  juice: number
}

type FoodVisual = {
  root: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Image
  eyes: Phaser.GameObjects.Image
  mouth: Phaser.GameObjects.Image
  leftArm: Phaser.GameObjects.Graphics
  rightArm: Phaser.GameObjects.Graphics
  leftLeg: Phaser.GameObjects.Graphics
  rightLeg: Phaser.GameObjects.Graphics
  grillMarks: Phaser.GameObjects.Image
  fire: Phaser.GameObjects.Sprite
  phase: number
  cooked: boolean
  size: number
}

type Drop = {
  id: number
  kind: DropKind
  x: number
  y: number
  speed: number
  vx: number
  sway: number
  phase: number
  rotation: number
  spin: number
  state: DropState
  grillAge: number
  smokeTick: number
  visual: FoodVisual | null
  bloodVisual: Phaser.GameObjects.Container | null
}

type StackFood = {
  kind: IngredientKind
  visual: FoodVisual
  baseRotation: number
  lag: number
  lagVelocity: number
  limbSwing: [number, number, number, number]
  limbVelocity: [number, number, number, number]
  entryOffsetX: number
  entryOffsetY: number
  entryAge: number
  pushOffsetY: number
  pushVelocityY: number
}

type Customer = {
  id: number
  frame: number
  name: string
  order: IngredientKind[]
  patience: number
  maxPatience: number
}

type CustomerSlot = {
  actor: Phaser.GameObjects.Container
  portrait: Phaser.GameObjects.Image
  drool: Phaser.GameObjects.Graphics
  baseY: number
  phase: number
  customerId: number
}

type PixelFlame = {
  sprite: Phaser.GameObjects.Sprite
  x: number
  y: number
  width: number
  height: number
  phase: number
  layer: 'rear' | 'fixture' | 'grill'
}

export type VladsSkewersSceneBridge = {
  seed: number
  renderPixelRatio?: number
  session: GameSessionApi
}

const ingredients: IngredientSpec[] = [
  { kind: 'meat', label: 'bœuf', frame: 0, juice: 0xe52f2f },
  { kind: 'tomato', label: 'tomate', frame: 3, juice: 0xff3b22 },
  { kind: 'pepper', label: 'poivron', frame: 1, juice: 0x69cf35 },
  { kind: 'onion', label: 'oignon', frame: 4, juice: 0xdb52c7 },
  { kind: 'mushroom', label: 'champignon', frame: 2, juice: 0xe2ad59 },
  { kind: 'zucchini', label: 'courgette', frame: 5, juice: 0x93c931 },
  { kind: 'eggplant', label: 'aubergine', frame: 6, juice: 0x8e49b4 },
  { kind: 'chicken', label: 'poulet', frame: 8, juice: 0xf3a08c },
  { kind: 'tofu', label: 'tofu', frame: 9, juice: 0xf1cf82 },
  { kind: 'fish', label: 'poisson', frame: 10, juice: 0xff7550 },
]

const specs = new Map(ingredients.map((ingredient) => [ingredient.kind, ingredient]))
const names = ['Vlad', 'Gorak', 'Morgana', 'Fenrik', 'Zlata', 'Boris', 'Ilona', 'Radu', 'Sorina', 'Mihai', 'Draga', 'Oana', 'Krohm', 'Nadja', 'Mircea']
const customerMouthOffsets = [
  [-7, -1], [-9, 0], [-1, 0], [-4, 1], [-4, -3],
  [-14, 1], [-4, 1], [-3, 2], [-4, 0], [-5, 2],
  [-8, 0], [-4, 1], [-1, 1], [-4, 1], [-4, 1],
] as const
const impactWords = ['SCHLAAAK!', 'SPLOUATCH!', 'KRRRSH!', 'SCHLOP!', 'GLURPSH!', 'TCHLAAK!', 'SPLOK!', 'KRRATCH!', 'PLOUFSH!', 'SKRUNCH!', 'SPLORTCH!', 'CHLAAAF!', 'GLOP!', 'SKLOUITCH!', 'FROUATCH!']
const cries = ['AÏE MA PEAU !', 'J’ÉTAIS SI FRAIS !', 'PAS LA POINTE !', 'MON JUS !', 'NOOOON !', 'J’AI RIEN FAIT !']

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}
function clientsForLevel(level: number) { return level + 2 }
function ingredientCountForLevel(level: number) { return Math.min(ingredients.length, 3 + Math.floor((level - 1) / 2)) }
function recipeLengthForLevel(level: number) { return Math.min(MAX_STACK, 2 + Math.floor((level - 1) / 2)) }
function skewerBasePoints(length: number) {
  if (length >= 6) return 15
  if (length === 5) return 10
  if (length === 4) return 6
  if (length === 3) return 4
  return 2
}
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abX = bx - ax
  const abY = by - ay
  const lengthSquared = abX * abX + abY * abY
  if (lengthSquared <= .0001) return Math.hypot(px - ax, py - ay)
  const t = clamp(((px - ax) * abX + (py - ay) * abY) / lengthSquared, 0, 1)
  return Math.hypot(px - (ax + abX * t), py - (ay + abY * t))
}

export class VladsSkewersScene extends Phaser.Scene {
  private readonly bridge: VladsSkewersSceneBridge
  private random: () => number = Math.random
  private drops: Drop[] = []
  private stack: StackFood[] = []
  private customers: Customer[] = []
  private nextDropId = 1
  private nextCustomerId = 0
  private score = 0
  private served = 0
  private lost = 0
  private level = 1
  private levelServed = 0
  private combo = 0
  private comboBest = 1
  private lastImpaleAt = -99
  private elapsed = 0
  private spawnTimer = .45
  private slowTimer = 0
  private hudTimer = 0
  private dragging = false
  private finished = false
  private returnTween?: Phaser.Tweens.Tween
  private autoServeAt: number | null = null
  private skewerX = 195
  private skewerY = NATURAL_SKEWER_Y
  private previousTip = new Phaser.Math.Vector2(195, NATURAL_SKEWER_Y - TIP_OFFSET)
  private previousSkewerX = 195
  private previousSkewerY = NATURAL_SKEWER_Y
  private skewerVelocityX = 0
  private skewerVelocityY = 0
  private capturedPointerId: number | null = null
  private dragStartClientX = 0
  private dragStartClientY = 0
  private dragStartSkewerX = 195
  private dragStartSkewerY = NATURAL_SKEWER_Y
  private handHintActive = false
  private inputCanvas?: HTMLCanvasElement
  private ambientTick = 0

  private background!: Phaser.GameObjects.Image
  private skewer!: Phaser.GameObjects.Image
  private arm!: Phaser.GameObjects.Image
  private handHint!: Phaser.GameObjects.Graphics
  private tipGlow!: Phaser.GameObjects.Graphics
  private scoreText!: Phaser.GameObjects.Text
  private scoreDigits: Phaser.GameObjects.Image[] = []
  private levelText!: Phaser.GameObjects.Text
  private clientCountText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text
  private bonusText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private orderIcons: Phaser.GameObjects.Image[] = []
  private unlockIcons: Phaser.GameObjects.Image[] = []
  private lifeIcons: Phaser.GameObjects.Image[] = []
  private customerSlots: CustomerSlot[] = []
  private patienceBar!: Phaser.GameObjects.Graphics
  private orderSkewer!: Phaser.GameObjects.Graphics
  private serveBubble!: Phaser.GameObjects.Image
  private orderPanel!: Phaser.GameObjects.Image
  private juiceParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private juiceSpeckParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private juiceSeedParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private juiceChunkParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private ashParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private emberParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private foregroundEmberParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private smokeParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private ambientFlames: PixelFlame[] = []
  private impactCallouts: Phaser.GameObjects.Container[] = []

  private readonly stateReader = () => JSON.stringify({
    coordinateSystem: '390x844 logical; origin top-left; x right; y down',
    mode: this.finished ? 'finished' : this.dragging ? 'dragging' : 'playing',
    level: this.level,
    score: this.score,
    served: this.served,
    remainingCustomers: this.customers.length,
    visibleCustomers: Math.min(5, this.customers.length),
    lives: MAX_LOST - this.lost,
    slowSeconds: Number(this.slowTimer.toFixed(2)),
    combo: this.combo,
    maxSkewerIngredients: MAX_STACK,
    fx: {
      ambientFlames: this.ambientFlames.length,
      embersAlive: this.emberParticles?.getAliveParticleCount() ?? 0,
      foregroundEmbersAlive: this.foregroundEmberParticles?.getAliveParticleCount() ?? 0,
      smokeAlive: this.smokeParticles?.getAliveParticleCount() ?? 0,
    },
    customerRosterSize: 15,
    fallArea: { minX: PLAY_MIN_X, maxX: PLAY_MAX_X },
    skewer: { x: Math.round(this.skewerX), y: Math.round(this.skewerY), tipX: Math.round(this.skewerX), tipY: Math.round(this.skewerY - TIP_OFFSET), stack: this.stack.map(item => ({ kind: item.kind, cooked: item.visual.cooked, y: Math.round(item.visual.root.y), rotation: Number(item.visual.root.rotation.toFixed(3)), limbAngles: item.limbSwing.map(angle => Number(angle.toFixed(2))), entryProgress: Number(item.entryAge.toFixed(2)) })) },
    impactCallouts: this.impactCallouts.length,
    input: { handOnly: true, handHint: this.handHintActive, gripX: Math.round(this.skewerX), gripY: Math.round(this.skewerY - HAND_GRIP_OFFSET), hitRadiusX: HAND_HIT_RADIUS_X, hitRadiusY: HAND_HIT_RADIUS_Y },
    activeCustomer: this.customers[0] ? { id: this.customers[0].id, name: this.customers[0].name, order: this.customers[0].order, patience: Number(this.customers[0].patience.toFixed(1)) } : null,
    drops: this.drops.slice(0, 40).map(drop => ({ id: drop.id, kind: drop.kind, x: Math.round(drop.x), y: Math.round(drop.y), vx: Math.round(drop.vx), speed: Math.round(drop.speed), rotation: Number((drop.visual?.root.rotation ?? Phaser.Math.DegToRad(drop.rotation)).toFixed(3)), state: drop.state, emotion: this.emotionFor(drop) })),
  })

  constructor(bridge: VladsSkewersSceneBridge) {
    super(VLADS_SKEWERS_SCENE_KEY)
    this.bridge = bridge
  }

  preload() {
    this.load.image('vlad-bg', `${ASSET_ROOT}/backgrounds/pixel-grill-arena-unlit.png`)
    this.load.spritesheet('vlad-food', `${ASSET_ROOT}/sprites/ingredient-bodies-v2.png`, { frameWidth: 362, frameHeight: 362 })
    this.load.image('vlad-meat', `${ASSET_ROOT}/sprites/bone-in-beef.png`)
    this.load.spritesheet('vlad-customers', `${ASSET_ROOT}/sprites/customer-atlas.png`, { frameWidth: 320, frameHeight: 320 })
    this.load.spritesheet('vlad-parts', `${ASSET_ROOT}/sprites/character-parts-v3.png`, { frameWidth: 313, frameHeight: 313 })
    this.load.image('vlad-ui', `${ASSET_ROOT}/ui/component-atlas.png`)
    this.load.image('vlad-digits', `${ASSET_ROOT}/ui/gothic-digits.png`)
    this.load.image('vlad-skewer', `${ASSET_ROOT}/props/vlad-skewer-hand.png`)
    this.load.image('vlad-arm', `${ASSET_ROOT}/props/vlad-arm-grip.png`)
    this.load.image('vlad-fire', `${ASSET_ROOT}/fx/pixel-fire-atlas.png`)
    this.load.image('vlad-life', `${ASSET_ROOT}/ui/life-skewer.png`)
  }

  create() {
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(W / 2, H / 2)
    this.textures.get('vlad-bg').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-food').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-meat').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-customers').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-parts').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-ui').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-digits').setFilter(Phaser.Textures.FilterMode.NEAREST)
    const digits = this.textures.get('vlad-digits')
    for (let index = 0; index < 12; index += 1) if (!digits.has(`digit-${index}`)) digits.add(`digit-${index}`, 0, index * 181, 185, 181, 315)
    this.textures.get('vlad-arm').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-fire').setFilter(Phaser.Textures.FilterMode.NEAREST)
    const skewerTexture = this.textures.get('vlad-skewer')
    if (!skewerTexture.has('shaft')) skewerTexture.add('shaft', 0, 82, 0, 94, 590)
    const fire = this.textures.get('vlad-fire')
    const fireCell = 443
    for (let row = 0; row < 2; row += 1) for (let column = 0; column < 4; column += 1) {
      const index = row * 4 + column
      if (!fire.has(`fire-${index}`)) fire.add(`fire-${index}`, 0, column * fireCell, row * fireCell, fireCell, fireCell)
    }
    if (!this.anims.exists('vlad-torch-fire')) this.anims.create({ key: 'vlad-torch-fire', frames: [0, 1, 2, 3].map(frame => ({ key: 'vlad-fire', frame: `fire-${frame}` })), frameRate: 9, repeat: -1 })
    if (!this.anims.exists('vlad-grill-fire')) this.anims.create({ key: 'vlad-grill-fire', frames: [4, 5, 6, 7].map(frame => ({ key: 'vlad-fire', frame: `fire-${frame}` })), frameRate: 10, repeat: -1 })
    const ui = this.textures.get('vlad-ui')
    if (!ui.has('order')) ui.add('order', 0, 24, 124, 650, 360)
    if (!ui.has('score')) ui.add('score', 0, 690, 150, 305, 340)
    if (!ui.has('bubble')) ui.add('bubble', 0, 12, 536, 452, 350)
    this.resetRun()
    this.buildScene()
    this.registerInput()
    this.bridge.session.setScore(0)
    this.refreshHud()
    this.showLevelCard()
    if (import.meta.env.DEV) {
      const debugWindow = window as Window & { render_game_to_text?: () => string; advanceTime?: (ms: number) => void; vlad_test_action?: (action: string) => string }
      debugWindow.render_game_to_text = this.stateReader
      debugWindow.advanceTime = (ms) => {
        const steps = Math.max(1, Math.round(ms / (1000 / 60)))
        for (let index = 0; index < steps; index += 1) this.simulate(1 / 60)
      }
      debugWindow.vlad_test_action = (action) => this.runTestAction(action)
    }
  }

  update(_time: number, delta: number) {
    this.simulate(Math.min(.05, delta / 1000))
  }

  private resetRun() {
    this.random = mulberry32(this.bridge.seed || 1)
    this.drops = []
    this.stack = []
    this.customers = []
    this.nextDropId = 1
    this.nextCustomerId = Math.floor(this.random() * 15)
    this.score = 0
    this.served = 0
    this.lost = 0
    this.level = 1
    this.levelServed = 0
    this.combo = 0
    this.comboBest = 1
    this.lastImpaleAt = -99
    this.elapsed = 0
    this.spawnTimer = .45
    this.slowTimer = 0
    this.dragging = false
    this.finished = false
    this.autoServeAt = null
    this.handHintActive = false
    this.ambientTick = 0
    this.skewerX = 195
    this.skewerY = NATURAL_SKEWER_Y
    this.previousTip.set(195, NATURAL_SKEWER_Y - TIP_OFFSET)
    this.previousSkewerX = 195
    this.previousSkewerY = NATURAL_SKEWER_Y
    this.skewerVelocityX = 0
    this.skewerVelocityY = 0
    while (this.customers.length < clientsForLevel(this.level)) this.pushCustomer()
  }

  private buildScene() {
    this.background = this.add.image(W / 2, H / 2, 'vlad-bg').setDisplaySize(W, H).setDepth(0)
    this.makeParticleTextures()
    this.emberParticles = this.add.particles(0, 0, 'vlad-ember', {
      emitting: false, lifespan: { min: 900, max: 1800 }, speedY: { min: -112, max: -34 }, speedX: { min: -22, max: 22 },
      color: [0xfff1a3, 0xffb51c, 0xff4a14], colorEase: 'Quad.Out', scale: { start: .72, end: .08 }, alpha: { start: 1, end: 0 }, rotate: { min: -18, max: 18 }, quantity: 1, maxParticles: 210,
    }).setDepth(3)
    this.foregroundEmberParticles = this.add.particles(0, 0, 'vlad-ember', {
      emitting: false, lifespan: { min: 720, max: 1500 }, speedY: { min: -145, max: -52 }, speedX: { min: -30, max: 30 },
      color: [0xffffc2, 0xffa313, 0xe9340b], colorEase: 'Quad.Out', scale: { start: .9, end: .1 }, alpha: { start: 1, end: 0 }, rotate: { min: -22, max: 22 }, quantity: 1, maxParticles: 180,
    }).setDepth(21)
    this.juiceParticles = this.add.particles(0, 0, 'vlad-juice-drop', {
      emitting: false, lifespan: { min: 2200, max: 3900 }, speed: { min: 75, max: 245 }, angle: { min: 190, max: 350 },
      gravityY: 145, rotate: { min: -145, max: 145 }, scale: { start: 1.08, end: .44 }, alpha: { start: 1, end: 0, ease: 'Cubic.In' }, maxParticles: 230,
    }).setDepth(70)
    this.juiceSpeckParticles = this.add.particles(0, 0, 'vlad-pixel', {
      emitting: false, lifespan: { min: 1500, max: 2700 }, speed: { min: 95, max: 275 }, angle: { min: 190, max: 350 },
      gravityY: 190, scale: { start: .75, end: .18 }, alpha: { start: 1, end: 0, ease: 'Quad.In' }, maxParticles: 220,
    }).setDepth(69)
    this.juiceSeedParticles = this.add.particles(0, 0, 'vlad-seed', {
      emitting: false, lifespan: { min: 1900, max: 3400 }, speed: { min: 72, max: 220 }, angle: { min: 190, max: 350 },
      gravityY: 175, rotate: { min: -360, max: 360 }, scale: { start: 1, end: .36 }, alpha: { start: 1, end: 0, ease: 'Cubic.In' }, maxParticles: 130,
    }).setDepth(71)
    this.juiceChunkParticles = this.add.particles(0, 0, 'vlad-juice-chunk', {
      emitting: false, lifespan: { min: 2100, max: 3800 }, speed: { min: 62, max: 205 }, angle: { min: 190, max: 350 },
      gravityY: 205, rotate: { min: -260, max: 260 }, scale: { start: 1.15, end: .24 }, alpha: { start: 1, end: 0, ease: 'Cubic.In' }, maxParticles: 160,
    }).setDepth(72)
    this.ashParticles = this.add.particles(0, 0, 'vlad-ash', {
      emitting: false, lifespan: { min: 750, max: 1450 }, speedY: { min: -52, max: -14 }, speedX: { min: -34, max: 34 },
      gravityY: 18, scale: { start: 1.35, end: .2 }, alpha: { start: .95, end: 0 }, maxParticles: 140,
    }).setDepth(22)
    this.smokeParticles = this.add.particles(0, 0, 'vlad-smoke', {
      emitting: false, lifespan: { min: 1400, max: 2500 }, speedY: { min: -48, max: -15 }, speedX: { min: -14, max: 14 },
      scale: { start: 1.5, end: 5 }, alpha: { start: .34, end: 0 }, maxParticles: 180,
    }).setDepth(19)
    this.buildAmbientFlames()

    this.buildHud()
    this.arm = this.add.image(this.skewerX + 23, this.skewerY - 92, 'vlad-arm').setOrigin(.5, 0).setDisplaySize(290, 435).setDepth(46)
    this.handHint = this.add.graphics().setDepth(62).setVisible(false)
    this.skewer = this.add.image(this.skewerX, this.skewerY, 'vlad-skewer', 'shaft').setOrigin(.5, 1).setDisplaySize(30, SKEWER_HEIGHT).setDepth(45)
    this.tipGlow = this.add.graphics().setDepth(44)
    this.comboText = this.add.text(195, 525, '', {
      fontFamily: FONT, fontSize: '28px', color: '#ffe25a', stroke: '#8b130b', strokeThickness: 6, align: 'center', resolution: 1,
    }).setOrigin(.5).setDepth(80).setVisible(false)
    this.bonusText = this.add.text(195, 650, '', {
      fontFamily: FONT, fontSize: '12px', color: '#ff8b9a', stroke: '#36050b', strokeThickness: 4, align: 'center', resolution: 1,
    }).setOrigin(.5).setDepth(81).setVisible(false)
    this.statusText = this.add.text(195, 574, '', {
      fontFamily: FONT, fontSize: '13px', color: '#fff0c4', stroke: '#170707', strokeThickness: 4, align: 'center', wordWrap: { width: 355 }, resolution: 1,
    }).setOrigin(.5).setDepth(82)
  }

  private buildHud() {
    this.orderPanel = this.add.image(195, 48, 'vlad-ui', 'order').setDisplaySize(188, 82).setDepth(50)
    this.add.image(342, 48, 'vlad-ui', 'score').setDisplaySize(96, 88).setDepth(50)
    this.levelText = this.add.text(195, 18, '', { fontFamily: FONT, fontSize: '15px', color: '#ffbd62', stroke: '#220706', strokeThickness: 3, resolution: 1 }).setOrigin(.5).setDepth(52)
    this.add.text(342, 19, 'SCORE', { fontFamily: FONT, fontSize: '9px', color: '#ffdfa0', stroke: '#210706', strokeThickness: 2, resolution: 1 }).setOrigin(.5).setDepth(52)
    this.scoreText = this.add.text(342, 51, '', { fontFamily: FONT, fontSize: '1px', color: '#ff9e2d', resolution: 1 }).setVisible(false)

    for (let index = 0; index < MAX_LOST; index += 1) {
      this.add.rectangle(20 + index * 18, 195, 14, 63, 0x080506, .82).setStrokeStyle(2, 0x6e2518, 1).setDepth(48)
      this.lifeIcons.push(this.add.image(20 + index * 18, 195, 'vlad-life').setDisplaySize(16, 64).setDepth(51))
    }

    const ys = [198, 310, 422, 534, 646]
    ys.forEach((y, index) => {
      const actor = this.add.container(349, y + 48).setDepth(26 + index)
      const portrait = this.add.image(0, 0, 'vlad-customers', 0).setOrigin(.5, 1).setDisplaySize(96, 96)
      const drool = this.add.graphics().setVisible(false)
      actor.add([portrait, drool])
      this.customerSlots.push({ actor, portrait, drool, baseY: y + 48, phase: index * 1.7, customerId: -1 })
    })
    this.clientCountText = this.add.text(349, 172, '', {
      fontFamily: FONT, fontSize: '9px', color: '#ffd899', stroke: '#180707', strokeThickness: 3, resolution: 1,
    }).setOrigin(.5).setDepth(58)
    this.serveBubble = this.add.image(300, 558, 'vlad-ui', 'bubble').setDisplaySize(176, 104).setDepth(58)
    this.orderSkewer = this.add.graphics().setDepth(59)
    this.patienceBar = this.add.graphics().setDepth(61)
  }

  private makeParticleTextures() {
    const make = (key: string, color: number, size: number) => {
      if (this.textures.exists(key)) return
      const stamp = this.make.graphics({ x: 0, y: 0 })
      stamp.fillStyle(color).fillRect(0, 0, size, size)
      stamp.generateTexture(key, size, size)
      stamp.destroy()
    }
    make('vlad-pixel', 0xffffff, 5)
    make('vlad-ash', 0x5c5149, 4)
    if (!this.textures.exists('vlad-ember')) {
      const spark = this.make.graphics({ x: 0, y: 0 })
      spark.fillStyle(0xfff0a0).fillRect(2, 0, 1, 2)
      spark.fillStyle(0xffbf24).fillRect(1, 2, 3, 4)
      spark.fillStyle(0xff5315).fillRect(2, 6, 1, 2)
      spark.generateTexture('vlad-ember', 5, 8)
      spark.destroy()
    }
    if (!this.textures.exists('vlad-juice-drop')) {
      const drop = this.make.graphics({ x: 0, y: 0 })
      drop.fillStyle(0xffffff)
      drop.fillRect(5, 0, 1, 2).fillRect(4, 2, 3, 3).fillRect(3, 5, 5, 3)
      drop.fillRect(2, 8, 7, 7).fillRect(3, 15, 5, 2).fillRect(4, 17, 3, 1)
      drop.fillStyle(0xffd9d0, .9).fillRect(3, 8, 2, 4)
      drop.generateTexture('vlad-juice-drop', 11, 18)
      drop.destroy()
    }
    if (!this.textures.exists('vlad-seed')) {
      const seed = this.make.graphics({ x: 0, y: 0 })
      seed.fillStyle(0x6b3117).fillRect(1, 0, 4, 1)
      seed.fillStyle(0xffe3a0).fillRect(0, 1, 6, 2).fillRect(1, 3, 4, 1)
      seed.fillStyle(0xffffff).fillRect(1, 1, 2, 1)
      seed.generateTexture('vlad-seed', 6, 4)
      seed.destroy()
    }
    if (!this.textures.exists('vlad-juice-chunk')) {
      const chunk = this.make.graphics({ x: 0, y: 0 })
      chunk.fillStyle(0xffffff).fillRect(1, 0, 5, 2).fillRect(0, 2, 8, 4).fillRect(2, 6, 5, 2)
      chunk.fillStyle(0xffd7bf, .85).fillRect(1, 2, 3, 2)
      chunk.generateTexture('vlad-juice-chunk', 8, 8)
      chunk.destroy()
    }
    make('vlad-smoke', 0x85766d, 5)
  }

  private buildAmbientFlames() {
    const sources: Array<Omit<PixelFlame, 'sprite' | 'phase'>> = [
      { x: 77, y: 193, width: 20, height: 38, layer: 'fixture' },
      { x: 293, y: 112, width: 19, height: 36, layer: 'fixture' },
      { x: 293, y: 321, width: 19, height: 36, layer: 'fixture' },
      { x: 87, y: 551, width: 21, height: 39, layer: 'fixture' },
      { x: 294, y: 558, width: 20, height: 38, layer: 'fixture' },
      ...[82, 132, 186, 240, 289].map((x, index) => ({
        x, y: 731 + (index % 2) * 5, width: 82 + (index % 3) * 10, height: 70 + ((index * 11) % 30), layer: 'rear' as const,
      })),
      ...[58, 119, 183, 248, 317].map((x, index) => ({
        x, y: 844 + (index % 2) * 3, width: 104 + (index % 3) * 11, height: 104 + ((index * 13) % 30), layer: 'grill' as const,
      })),
    ]
    this.ambientFlames = sources.map((source, index) => ({
      ...source,
      phase: index * 1.37,
      sprite: this.add.sprite(source.x, source.y, 'vlad-fire', source.layer === 'fixture' ? 'fire-0' : 'fire-4')
        .setOrigin(.5, 1).setDisplaySize(source.width, source.height)
        .setDepth(source.layer === 'rear' ? 2 : source.layer === 'grill' ? 18 : 4)
        .play({ key: source.layer === 'fixture' ? 'vlad-torch-fire' : 'vlad-grill-fire', startFrame: index % 4 }),
    }))
  }

  private registerInput() {
    this.inputCanvas = this.game.canvas
    this.inputCanvas.addEventListener('pointerdown', this.handleDomPointerDown, { passive: false })
    window.addEventListener('pointermove', this.handleDomPointerMove, { passive: false })
    window.addEventListener('pointerup', this.handleDomPointerUp, { passive: false })
    window.addEventListener('pointercancel', this.handleDomPointerUp, { passive: false })
    this.input.keyboard?.on('keydown-F', this.toggleFullscreen, this)
    this.events.once('shutdown', this.handleShutdown, this)
    this.events.once('destroy', this.handleShutdown, this)
  }

  private handleShutdown() {
    this.inputCanvas?.removeEventListener('pointerdown', this.handleDomPointerDown)
    window.removeEventListener('pointermove', this.handleDomPointerMove)
    window.removeEventListener('pointerup', this.handleDomPointerUp)
    window.removeEventListener('pointercancel', this.handleDomPointerUp)
    this.inputCanvas = undefined
    this.capturedPointerId = null
    this.input?.keyboard?.off('keydown-F', this.toggleFullscreen, this)
    miniFuggAudio.stopGameSfx(GAME_ID)
    const debugWindow = window as Window & { render_game_to_text?: () => string; advanceTime?: (ms: number) => void; vlad_test_action?: (action: string) => string }
    if (debugWindow.render_game_to_text === this.stateReader) delete debugWindow.render_game_to_text
    delete debugWindow.advanceTime
    delete debugWindow.vlad_test_action
  }

  private toggleFullscreen() {
    if (this.scale.isFullscreen) this.scale.stopFullscreen()
    else void this.scale.startFullscreen()
  }

  private clientToWorld(clientX: number, clientY: number) {
    const bounds = this.inputCanvas?.getBoundingClientRect()
    if (!bounds) return new Phaser.Math.Vector2(this.skewerX, this.skewerY)
    return new Phaser.Math.Vector2((clientX - bounds.left) / bounds.width * W, (clientY - bounds.top) / bounds.height * H)
  }

  private readonly handleDomPointerDown = (event: PointerEvent) => {
    if (this.finished) return
    const point = this.clientToWorld(event.clientX, event.clientY)
    event.preventDefault()
    if (!this.isPointOnHand(point)) {
      this.handHintActive = true
      return
    }
    this.returnTween?.stop()
    this.returnTween = undefined
    this.handHintActive = false
    this.handHint.setVisible(false)
    this.capturedPointerId = event.pointerId
    this.dragStartClientX = event.clientX
    this.dragStartClientY = event.clientY
    this.dragStartSkewerX = this.skewerX
    this.dragStartSkewerY = this.skewerY
    try { this.inputCanvas?.setPointerCapture(event.pointerId) } catch { /* capture can fail after a cancelled touch */ }
    this.dragging = true
    this.previousTip.set(this.skewerX, this.skewerY - TIP_OFFSET)
  }

  private readonly handleDomPointerMove = (event: PointerEvent) => {
    if (!this.dragging || this.finished || event.pointerId !== this.capturedPointerId) return
    event.preventDefault()
    const bounds = this.inputCanvas?.getBoundingClientRect()
    if (!bounds) return
    const deltaX = (event.clientX - this.dragStartClientX) / bounds.width * W
    const deltaY = (event.clientY - this.dragStartClientY) / bounds.height * H
    this.moveSkewer(new Phaser.Math.Vector2(this.dragStartSkewerX + deltaX, this.dragStartSkewerY + deltaY))
  }

  private readonly handleDomPointerUp = (event: PointerEvent) => {
    if (!this.dragging || event.pointerId !== this.capturedPointerId) return
    event.preventDefault()
    try { this.inputCanvas?.releasePointerCapture(event.pointerId) } catch { /* already released */ }
    this.capturedPointerId = null
    this.dragging = false
    const returnState = { y: this.skewerY }
    this.returnTween?.stop()
    this.returnTween = this.tweens.add({
      targets: returnState,
      y: NATURAL_SKEWER_Y,
      duration: 360,
      ease: 'Back.Out',
      onUpdate: () => { this.skewerY = returnState.y },
      onComplete: () => { this.returnTween = undefined },
    })
  }

  private moveSkewer(point: Phaser.Math.Vector2) {
    this.skewerX = clamp(point.x, 54, 341)
    this.skewerY = clamp(point.y, 500, MAX_SKEWER_Y)
  }

  private isPointOnHand(point: Phaser.Math.Vector2) {
    const dx = (point.x - this.skewerX) / HAND_HIT_RADIUS_X
    const dy = (point.y - (this.skewerY - HAND_GRIP_OFFSET)) / HAND_HIT_RADIUS_Y
    return dx * dx + dy * dy <= 1
  }

  private simulate(dt: number) {
    if (!Number.isFinite(dt) || dt <= 0) return
    this.elapsed += dt
    this.updateAmbient()
    this.updateCustomers()
    if (this.finished) return

    if (this.autoServeAt !== null && this.elapsed >= this.autoServeAt) {
      this.autoServeAt = null
      this.serveCustomer()
    }
    if (this.finished) return

    this.slowTimer = Math.max(0, this.slowTimer - dt)
    const slow = this.slowTimer > 0 ? .46 : 1
    const active = this.customers[0]
    if (active) {
      active.patience = Math.max(0, active.patience - dt)
      if (active.patience <= 0) this.loseCustomer('TROP TARD !')
    }
    if (this.finished) return

    if (this.combo >= 2 && this.elapsed - this.lastImpaleAt > COMBO_WINDOW) {
      this.combo = 0
      this.comboText.setVisible(false)
    }

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      const tuning = this.tuning()
      let burst = 1
      if (this.random() < tuning.second) burst += 1
      if (this.random() < tuning.third) burst += 1
      for (let index = 0; index < burst; index += 1) this.spawnDrop(145 - index * 38)
      this.spawnTimer = tuning.gap + this.random() * tuning.gapJitter
    }

    this.updateDropRelationships(dt)
    for (const drop of [...this.drops]) {
      if (drop.state === 'falling') this.updateFallingDrop(drop, dt, slow)
      else this.updateGrillingDrop(drop, dt)
    }

    const tip = new Phaser.Math.Vector2(this.skewerX, this.skewerY - TIP_OFFSET)
    if (this.dragging) {
      const target = this.findImpaleTarget(this.previousTip, tip)
      if (target) this.catchDrop(target, tip.x - this.previousTip.x, tip.y - this.previousTip.y)
    }
    this.previousTip.copy(tip)
    this.updateSkewer(dt)

    this.hudTimer -= dt
    if (this.hudTimer <= 0) {
      this.hudTimer = .1
      this.refreshHud()
    }
  }

  private tuning() {
    const step = Math.max(0, this.level - 1)
    return {
      maxDrops: Math.round(clamp(7 + step * 3.5, 7, 40)),
      speed: clamp(.082 + step * .0165, .082, .235) * H,
      speedJitter: clamp(.03 + step * .0045, .03, .075) * H,
      gap: clamp(1.12 - step * .105, .24, 1.12),
      gapJitter: clamp(.30 - step * .024, .07, .30),
      oblique: clamp((step - .4) * .105, 0, .74),
      spin: clamp(.05 + step * .092, .05, .86),
      second: clamp((step - 1) * .105, 0, .68),
      third: clamp((step - 4) * .085, 0, .38),
      expected: clamp(.60 - step * .032, .31, .60),
      blood: clamp(.018 + step * .009, .018, .09),
      garlic: clamp(step * .011, 0, .088),
    }
  }

  private availableIngredients() { return ingredients.slice(0, ingredientCountForLevel(this.level)) }

  private randomIngredient(pool = this.availableIngredients()) {
    return pool[Math.floor(this.random() * pool.length)].kind
  }

  private expectedIngredient() { return this.customers[0]?.order[this.stack.length] }

  private spawnDrop(y = 145) {
    const tuning = this.tuning()
    if (this.drops.length >= tuning.maxDrops) return
    const roll = this.random()
    let kind: DropKind
    if (roll < tuning.blood) kind = 'blood'
    else if (roll < tuning.blood + tuning.garlic) kind = 'garlic'
    else kind = this.expectedIngredient() && this.random() < tuning.expected ? this.expectedIngredient()! : this.randomIngredient()
    const oblique = this.random() < tuning.oblique
    const vx = oblique ? (this.random() < .5 ? -1 : 1) * (16 + this.random() * (18 + this.level * 4)) : 0
    const spins = kind !== 'blood' && this.random() < tuning.spin
    const drop: Drop = {
      id: this.nextDropId++, kind, x: PLAY_MIN_X + this.random() * (PLAY_MAX_X - PLAY_MIN_X), y,
      speed: tuning.speed + this.random() * tuning.speedJitter, vx, sway: (this.random() * 2 - 1) * (4 + Math.min(this.level, 10) * 1.8),
      phase: this.random() * Math.PI * 2, rotation: (this.random() * 2 - 1) * 18,
      spin: spins ? (this.random() * 2 - 1) * (55 + this.level * 42) : (this.random() * 2 - 1) * 9,
      state: 'falling', grillAge: 0, smokeTick: 0, visual: null, bloodVisual: null,
    }
    if (kind === 'blood') drop.bloodVisual = this.createBloodVisual(drop.x, drop.y)
    else drop.visual = this.createFoodVisual(kind, drop.x, drop.y, FALLING_FOOD_SIZE)
    this.drops.push(drop)
  }

  private createBloodVisual(x: number, y: number) {
    const root = this.add.container(x, y).setDepth(21)
    const graphics = this.add.graphics()
    graphics.fillStyle(0xff2038).fillCircle(0, 6, 13).fillTriangle(0, -18, -9, 4, 9, 4)
    graphics.lineStyle(3, 0x751018).strokeCircle(0, 6, 13)
    root.add(graphics)
    return root
  }

  private createIngredientIcon(kind: IngredientKind, x: number, y: number, size: number, depth: number) {
    return kind === 'meat'
      ? this.add.image(x, y, 'vlad-meat').setDisplaySize(size * 1.1, size).setDepth(depth)
      : this.add.image(x, y, 'vlad-food', specs.get(kind)!.frame).setDisplaySize(size, size).setDepth(depth)
  }

  private createFoodVisual(kind: Exclude<DropKind, 'blood'>, x: number, y: number, size: number) {
    const frame = kind === 'garlic' ? 7 : specs.get(kind as IngredientKind)!.frame
    const root = this.add.container(x, y).setDepth(20)
    const leftLeg = this.add.graphics()
    const rightLeg = this.add.graphics()
    const leftArm = this.add.graphics()
    const rightArm = this.add.graphics()
    const body = kind === 'meat'
      ? this.add.image(0, 0, 'vlad-meat').setDisplaySize(size * 1.18, size * 1.08)
      : this.add.image(0, 0, 'vlad-food', frame).setDisplaySize(size * 1.08, size * 1.08)
    const grillMarks = this.add.image(0, 2, 'vlad-parts', 13).setDisplaySize(size * .82, size * .82).setVisible(false)
    const eyes = this.add.image(0, -size * .12, 'vlad-parts', 0).setDisplaySize(size * .76, size * .76)
    const mouth = this.add.image(0, size * .24, 'vlad-parts', 4).setDisplaySize(size * .58, size * .58)
    const fire = this.add.sprite(0, size * .43, 'vlad-fire', 'fire-0')
      .setOrigin(.5, 1).setDisplaySize(size * 1.18, size * 1.18).setVisible(false)
      .play({ key: 'vlad-torch-fire', startFrame: Math.floor(this.random() * 4) })
    root.add([leftLeg, rightLeg, leftArm, rightArm, fire, body, grillMarks, eyes, mouth])
    return { root, body, eyes, mouth, leftArm, rightArm, leftLeg, rightLeg, grillMarks, fire, phase: this.random() * Math.PI * 2, cooked: false, size }
  }

  private emotionFor(drop: Drop): Emotion {
    if (drop.state === 'grilling') return 'dead'
    if (drop.y < 300) return 'happy'
    if (drop.y < 475) return 'realizing'
    return 'panic'
  }

  private updateDropRelationships(dt: number) {
    const falling = this.drops.filter(drop => drop.state === 'falling' && drop.kind !== 'blood')
    for (let index = 0; index < falling.length; index += 1) {
      for (let other = index + 1; other < falling.length; other += 1) {
        const a = falling[index]
        const b = falling[other]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy)
        const radiusA = a.visual ? a.visual.size * .39 : 13
        const radiusB = b.visual ? b.visual.size * .39 : 13
        const minimum = radiusA + radiusB
        if (distance >= minimum || distance <= .1) continue
        const nx = dx / distance
        const ny = dy / distance
        const overlap = minimum - distance
        a.x -= nx * overlap * .5
        a.y -= ny * overlap * .5
        b.x += nx * overlap * .5
        b.y += ny * overlap * .5
        const relative = (b.vx - a.vx) * nx + (b.speed - a.speed) * ny
        const impulse = Math.max(18, Math.abs(relative) * .62 + overlap * 7)
        a.vx -= nx * impulse
        b.vx += nx * impulse
        a.speed -= ny * impulse * .45
        b.speed += ny * impulse * .45
      }
    }
  }

  private nearestNeighbour(drop: Drop) {
    let nearest: Drop | null = null
    let nearestDistance = 72
    for (const candidate of this.drops) {
      if (candidate === drop || candidate.state !== 'falling' || candidate.kind === 'blood') continue
      const distance = Math.hypot(candidate.x - drop.x, candidate.y - drop.y)
      if (distance < nearestDistance) { nearest = candidate; nearestDistance = distance }
    }
    return nearest
  }

  private updateFallingDrop(drop: Drop, dt: number, slow: number) {
    drop.phase += dt * (1.7 + drop.speed / 120)
    drop.y += drop.speed * slow * dt
    drop.speed = Math.min(this.tuning().speed * 1.45, drop.speed + 92 * dt)
    drop.x += (drop.vx + Math.sin(drop.phase) * drop.sway) * slow * dt
    const wallRadius = drop.visual ? drop.visual.size * .39 : 13
    if (drop.x <= PLAY_MIN_X + wallRadius) {
      drop.x = PLAY_MIN_X + wallRadius
      drop.vx = Math.max(55, Math.abs(drop.vx) * .78 + 24)
      drop.speed = Math.max(25, drop.speed - 18)
    }
    if (drop.x >= PLAY_MAX_X - wallRadius) {
      drop.x = PLAY_MAX_X - wallRadius
      drop.vx = -Math.max(55, Math.abs(drop.vx) * .78 + 24)
      drop.speed = Math.max(25, drop.speed - 18)
    }
    drop.rotation += drop.spin * slow * dt
    const emotion = this.emotionFor(drop)
    const frantic = emotion === 'panic' ? Math.sin(this.elapsed * 24 + drop.phase) * 3 : 0
    if (drop.visual) {
      drop.visual.root.setPosition(drop.x + frantic, drop.y).setRotation(Phaser.Math.DegToRad(drop.rotation))
      this.drawFoodParts(drop.visual, emotion, this.elapsed, this.nearestNeighbour(drop))
    } else if (drop.bloodVisual) {
      drop.bloodVisual.setPosition(drop.x, drop.y).setRotation(Phaser.Math.DegToRad(drop.rotation))
    }
    if (drop.y >= GRILL_Y) this.startGrilling(drop)
  }

  private startGrilling(drop: Drop) {
    drop.state = 'grilling'
    drop.grillAge = 0
    drop.smokeTick = 0
    drop.speed = 0
    drop.vx = 0
    drop.y = GRILL_Y + 9 + this.random() * 12
    if (drop.kind === 'blood') {
      this.removeDrop(drop)
      return
    }
    miniFuggAudio.playSfx('vlad.sizzle', { owner: GAME_ID, intensity: .7 })
    this.emberParticles.explode(7, drop.x, drop.y + 10)
    this.smokeParticles.explode(3, drop.x, drop.y - 8)
  }

  private updateGrillingDrop(drop: Drop, dt: number) {
    if (drop.grillAge < 0) return
    drop.grillAge += dt
    if (!drop.visual) return
    const struggle = Math.max(0, 1 - drop.grillAge / 1.5)
    drop.visual.root.setPosition(drop.x + Math.sin(this.elapsed * 31 + drop.phase) * 2.5 * struggle, drop.y + Math.abs(Math.sin(this.elapsed * 17 + drop.phase)) * 2)
    drop.visual.root.setRotation(Phaser.Math.DegToRad(drop.rotation))
    drop.visual.cooked = true
    if (drop.grillAge < .9) drop.visual.body.setTint(0xffbd72)
    else if (drop.grillAge < 1.65) drop.visual.body.setTint(0x654331)
    else drop.visual.body.setTint(0x171313)
    this.drawFoodParts(drop.visual, 'dead', this.elapsed, null)
    this.drawGrillMarks(drop.visual, drop.grillAge > 1.65 ? 0x090707 : 0x4d1b0c)
    this.drawFoodFire(drop.visual, clamp(1.25 - drop.grillAge * .28, .45, 1.15))
    const smokeTick = Math.floor(drop.grillAge * 10)
    if (smokeTick > drop.smokeTick) {
      drop.smokeTick = smokeTick
      this.smokeParticles.explode(drop.grillAge > 1.2 ? 3 : 2, drop.x + (this.random() * 2 - 1) * 12, drop.y - 22)
    }
    if (drop.grillAge > 1.15 && Math.floor(drop.grillAge * 12) % 3 === 0) this.ashParticles.explode(2, drop.x, drop.y - 16)
    if (drop.grillAge >= 2.25) {
      this.ashParticles.explode(20, drop.x, drop.y)
      this.tweens.add({ targets: drop.visual.root, alpha: 0, scale: .25, duration: 180, onComplete: () => this.removeDrop(drop) })
      drop.grillAge = -999
    }
  }

  private drawFoodParts(visual: FoodVisual, emotion: Emotion, time: number, neighbour: Drop | null) {
    const wave = Math.sin(time * (emotion === 'panic' ? 19 : 7) + visual.phase)
    const size = visual.size
    const expression = emotion === 'happy' ? 0 : emotion === 'realizing' ? 1 : emotion === 'panic' ? 2 : 3
    visual.eyes.setFrame(expression)
    visual.mouth.setFrame(4 + expression)

    const armPose = (side: -1 | 1) => {
      const shoulder = { x: side * size * .31, y: -size * .02 }
      let elbow = { x: side * size * .45, y: -size * (.11 + wave * .07 * side) }
      let hand = { x: side * size * .57, y: -size * (.28 + wave * .13 * side) }
      if (emotion === 'realizing') {
        elbow = { x: side * size * .46, y: size * .02 }
        hand = { x: side * size * .62, y: -size * .05 }
      } else if (emotion === 'panic') {
        elbow = { x: side * size * .47, y: -size * (.17 + wave * .12) }
        hand = { x: side * size * .64, y: -size * (.34 + wave * .2 * side) }
      } else if (emotion === 'dead') {
        elbow = { x: side * size * .4, y: size * .2 }
        hand = { x: side * size * .5, y: size * (.43 + Math.abs(wave) * .05) }
      }
      if (neighbour && visual.root.parentContainer === null && emotion !== 'dead') {
        const dx = neighbour.x - visual.root.x
        const dy = neighbour.y - visual.root.y
        if (Math.sign(dx || side) === side) {
          const reach = Math.min(size * .68, Math.hypot(dx, dy) * .72)
          const angle = Math.atan2(dy, dx)
          hand = { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach }
          elbow = { x: (shoulder.x + hand.x) * .52, y: (shoulder.y + hand.y) * .52 - size * .09 }
        }
      }
      return { shoulder, elbow, hand }
    }
    const legPose = (side: -1 | 1) => {
      const hip = { x: side * size * .15, y: size * .28 }
      const kick = emotion === 'panic' ? wave * .15 : emotion === 'happy' ? wave * .1 : 0
      const knee = { x: side * size * (.22 + kick), y: size * .45 }
      const foot = emotion === 'dead'
        ? { x: side * size * (.3 + Math.abs(wave) * .04), y: size * .64 }
        : { x: side * size * (.34 + kick), y: size * (.59 - Math.abs(wave) * .06) }
      return { hip, knee, foot }
    }
    const leftArm = armPose(-1)
    const rightArm = armPose(1)
    const leftLeg = legPose(-1)
    const rightLeg = legPose(1)
    this.drawJointedLimb(visual.leftArm, leftArm.shoulder, leftArm.elbow, leftArm.hand, 'hand', -1)
    this.drawJointedLimb(visual.rightArm, rightArm.shoulder, rightArm.elbow, rightArm.hand, 'hand', 1)
    this.drawJointedLimb(visual.leftLeg, leftLeg.hip, leftLeg.knee, leftLeg.foot, 'foot', -1)
    this.drawJointedLimb(visual.rightLeg, rightLeg.hip, rightLeg.knee, rightLeg.foot, 'foot', 1)

    const faceBounce = emotion === 'panic' ? 1 + Math.abs(wave) * .08 : 1
    visual.eyes.setPosition(0, -size * .12).setDisplaySize(size * .76 * faceBounce, size * .76 * faceBounce)
    const mouthBounce = emotion === 'panic' ? 1 + Math.abs(wave) * .12 : 1
    visual.mouth.setPosition(0, size * .24).setDisplaySize(size * .58 * mouthBounce, size * .58 * mouthBounce)
  }

  private drawJointedLimb(
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

  private drawGrillMarks(visual: FoodVisual, color = 0x57210f) {
    visual.grillMarks.setVisible(true).setTint(color)
  }

  private drawFoodFire(visual: FoodVisual, intensity: number) {
    visual.fire.setVisible(intensity > 0)
      .setDisplaySize(visual.size * (1.02 + intensity * .26), visual.size * (.94 + intensity * .38))
      .setAlpha(clamp(.68 + intensity * .22, 0, 1))
  }

  private findImpaleTarget(previous: Phaser.Math.Vector2, tip: Phaser.Math.Vector2) {
    let found: Drop | null = null
    let foundDistance = Number.POSITIVE_INFINITY
    for (const drop of this.drops) {
      if (drop.state !== 'falling') continue
      const distance = distanceToSegment(drop.x, drop.y, previous.x, previous.y, tip.x, tip.y)
      const foodRadius = drop.visual ? drop.visual.size * .39 : 13
      if (distance <= foodRadius && distance < foundDistance) { found = drop; foundDistance = distance }
    }
    return found
  }

  private catchDrop(drop: Drop, impactDx = 0, impactDy = -1) {
    const impactX = drop.x
    const impactY = drop.y
    const impactRotation = drop.visual?.root.rotation ?? Phaser.Math.DegToRad(drop.rotation)
    if (drop.kind === 'blood') {
      this.slowTimer = 3.4
      const active = this.customers[0]
      if (active) active.patience = Math.min(active.maxPatience, active.patience + 5)
      this.removeDrop(drop)
      this.flashStatus('SANG FROID · +TEMPS', '#ff7180')
      this.showActiveBonus()
      miniFuggAudio.playGameSfx(GAME_ID, 'bonus', { intensity: .9 })
      return
    }
    if (drop.kind === 'garlic') {
      this.removeDrop(drop)
      this.showImpact(impactX, impactY, 1, 0xf1d6a3, impactDx, impactDy)
      this.loseCustomer('AIL ! CLIENT PERDU')
      return
    }

    const customer = this.customers[0]
    const expected = this.expectedIngredient()
    if (!customer || this.stack.length >= Math.min(customer.order.length, MAX_STACK) || drop.kind !== expected) {
      this.removeDrop(drop)
      this.showImpact(impactX, impactY, 1, specs.get(drop.kind)!.juice, impactDx, impactDy)
      this.loseCustomer('MAUVAISE BROCHETTE')
      return
    }

    this.combo = this.elapsed - this.lastImpaleAt <= COMBO_WINDOW ? Math.min(6, this.combo + 1) : 1
    this.comboBest = Math.max(this.comboBest, this.combo)
    this.lastImpaleAt = this.elapsed
    const tier = Math.min(5, Math.max(1, this.combo))
    this.removeDrop(drop)
    this.addStackFood(drop.kind, impactX, impactY, impactRotation)
    const stacked = this.stack[this.stack.length - 1]
    stacked.visual.cooked = true
    stacked.visual.body.setTint(0xffbd72)
    this.drawGrillMarks(stacked.visual)
    this.showImpact(impactX, impactY, tier, specs.get(drop.kind)!.juice, impactDx, impactDy)
    void miniFuggAudio.playSfx(`vlad.impale${tier}`, { owner: GAME_ID, intensity: .8 + tier * .09 })
    if (this.stack.length === customer.order.length) {
      this.autoServeAt = this.elapsed + 2.35
      this.flashStatus('BROCHETTE VALIDÉE !', '#ffe26a')
      void miniFuggAudio.playSfx('vlad.sizzle', { owner: GAME_ID, intensity: 1 })
    }
    this.refreshHud()
  }

  private addStackFood(kind: IngredientKind, impactX = this.skewerX, impactY = this.skewerY - TIP_OFFSET, baseRotation = 0) {
    this.stack.forEach(item => { item.pushOffsetY -= STACK_GAP })
    const targetY = this.skewerY - TIP_OFFSET + 54
    const visual = this.createFoodVisual(kind, impactX, impactY, STACK_FOOD_SIZE)
    visual.root.setDepth(47)
    this.stack.push({
      kind, visual, baseRotation, lag: 0, lagVelocity: 0,
      limbSwing: [-.35, .28, -.2, .25], limbVelocity: [0, 0, 0, 0],
      entryOffsetX: impactX - this.skewerX,
      entryOffsetY: impactY - targetY,
      entryAge: 0,
      pushOffsetY: 0,
      pushVelocityY: 0,
    })
  }

  private updateSkewer(dt: number) {
    const tipY = this.skewerY - TIP_OFFSET
    this.skewer.setPosition(this.skewerX, this.skewerY - 35).setDisplaySize(30, SKEWER_HEIGHT)
    this.arm.setPosition(this.skewerX + 23, this.skewerY - 92)
    this.drawHandHint()
    const velocityX = (this.skewerX - this.previousSkewerX) / Math.max(dt, .001)
    const velocityY = (this.skewerY - this.previousSkewerY) / Math.max(dt, .001)
    const accelerationX = (velocityX - this.skewerVelocityX) / Math.max(dt, .001)
    const accelerationY = (velocityY - this.skewerVelocityY) / Math.max(dt, .001)
    this.skewerVelocityX = velocityX
    this.skewerVelocityY = velocityY
    this.previousSkewerX = this.skewerX
    this.previousSkewerY = this.skewerY
    const badgeX = clamp(this.skewerX + (this.skewerX > 270 ? -72 : 72), 62, 328)
    const badgeY = clamp(this.skewerY - 108, 540, 710)
    this.comboText.setPosition(badgeX, badgeY)
    this.bonusText.setPosition(badgeX, badgeY + (this.comboText.visible ? 30 : 0))
    if (this.slowTimer > 0) this.bonusText.setText(`SANG FROID ${this.slowTimer.toFixed(1)}s`).setVisible(true)
    else this.bonusText.setVisible(false)
    this.tipGlow.clear().fillStyle(0xffe36a, .75).fillRect(this.skewerX - 2, tipY - 2, 4, 4)
    this.stack.forEach((item, index) => {
      const rankFromTip = this.stack.length - 1 - index
      const targetLag = clamp(-velocityX * .018, -13, 13)
      item.lagVelocity += (targetLag - item.lag) * dt * 21
      item.lagVelocity *= Math.pow(.08, dt)
      item.lag += item.lagVelocity * dt
      item.pushVelocityY += -item.pushOffsetY * 24 * dt
      item.pushVelocityY *= Math.pow(.045, dt)
      item.pushOffsetY += item.pushVelocityY * dt
      item.entryAge = Math.min(1, item.entryAge + dt / .78)
      const entry = 1 - Phaser.Math.Easing.Cubic.Out(item.entryAge)
      item.visual.root.setPosition(
        this.skewerX + item.lag + item.entryOffsetX * entry,
        tipY + 54 + rankFromTip * STACK_GAP + item.pushOffsetY + item.entryOffsetY * entry,
      ).setRotation(item.baseRotation)
      this.drawFoodParts(item.visual, 'dead', this.elapsed + index * .2, null)
      this.drawInertStackLimbs(item, velocityX, velocityY, accelerationX, accelerationY, dt, index)
      if (item.visual.cooked) this.drawGrillMarks(item.visual)
    })
  }

  private drawHandHint() {
    const hint = this.handHint
    hint.clear()
    if (!this.handHintActive || Math.floor(this.elapsed * 7) % 2 === 0) {
      hint.setVisible(false)
      this.arm.clearTint()
      return
    }
    const x = Math.round(this.skewerX)
    const y = Math.round(this.skewerY - HAND_GRIP_OFFSET)
    this.arm.setTint(0xffd873)
    hint.setVisible(true).lineStyle(3, 0xffd34d, 1)
    hint.strokeRect(x - 62, y - 68, 22, 3).strokeRect(x - 62, y - 68, 3, 22)
    hint.strokeRect(x + 40, y - 68, 22, 3).strokeRect(x + 59, y - 68, 3, 22)
    hint.strokeRect(x - 62, y + 65, 22, 3).strokeRect(x - 62, y + 46, 3, 22)
    hint.strokeRect(x + 40, y + 65, 22, 3).strokeRect(x + 59, y + 46, 3, 22)
  }

  private drawInertStackLimbs(item: StackFood, velocityX: number, velocityY: number, accelerationX: number, accelerationY: number, dt: number, index: number) {
    const visual = item.visual
    const size = visual.size
    const speed = Math.hypot(velocityX, velocityY)
    const agitation = clamp(speed / 420, 0, 1.8)
    const kickX = clamp(-accelerationX / 4400, -2.4, 2.4)
    const kickY = clamp(-accelerationY / 5200, -2, 2)
    for (let limbIndex = 0; limbIndex < 4; limbIndex += 1) {
      const side = limbIndex % 2 === 0 ? -1 : 1
      const phase = this.elapsed * (12 + limbIndex * 1.7) + index * 1.9 + limbIndex * 2.2
      const velocityTorque = (-velocityX * .018 + velocityY * .011 * side) * (limbIndex < 2 ? 1.12 : .94)
      const accelerationKick = kickX * (1 + limbIndex * .08) + kickY * side
      const flutter = Math.sin(phase) * agitation * (4.4 + limbIndex * .4)
      const gravityReturn = -Math.sin(item.limbSwing[limbIndex]) * (agitation < .08 ? 4.8 : .6)
      item.limbVelocity[limbIndex] += (velocityTorque + accelerationKick + flutter + gravityReturn) * dt
      item.limbVelocity[limbIndex] *= Math.pow(agitation > .12 ? .74 : .24, dt)
      item.limbSwing[limbIndex] += item.limbVelocity[limbIndex] * dt
    }
    const limb = (side: -1 | 1, swing: number, leg: boolean) => {
      const start = leg ? { x: side * size * .17, y: size * .29 } : { x: side * size * .32, y: 0 }
      const hang = size * (leg ? .58 : .55)
      const angle = Math.PI / 2 + swing
      const end = { x: start.x + Math.cos(angle) * hang, y: start.y + Math.sin(angle) * hang }
      const bend = Math.sin(swing * .7 + side) * size * .13
      const joint = {
        x: (start.x + end.x) * .5 + Math.cos(angle + Math.PI / 2) * bend,
        y: (start.y + end.y) * .5 + Math.sin(angle + Math.PI / 2) * bend,
      }
      return { start, joint, end }
    }
    const la = limb(-1, item.limbSwing[0], false)
    const ra = limb(1, item.limbSwing[1], false)
    const ll = limb(-1, item.limbSwing[2], true)
    const rl = limb(1, item.limbSwing[3], true)
    this.drawJointedLimb(visual.leftArm, la.start, la.joint, la.end, 'hand', -1)
    this.drawJointedLimb(visual.rightArm, ra.start, ra.joint, ra.end, 'hand', 1)
    this.drawJointedLimb(visual.leftLeg, ll.start, ll.joint, ll.end, 'foot', -1)
    this.drawJointedLimb(visual.rightLeg, rl.start, rl.joint, rl.end, 'foot', 1)
  }

  private showImpact(x: number, y: number, tier: number, color: number, impactDx = 0, impactDy = -1) {
    const count = [12, 18, 25, 34, 46][tier - 1]
    const direction = Math.hypot(impactDx, impactDy) > 2
      ? Phaser.Math.RadToDeg(Math.atan2(impactDy, impactDx))
      : -90
    const cone = { min: direction - 34, max: direction + 34 }
    this.juiceParticles.setEmitterAngle(cone)
    this.juiceSpeckParticles.setEmitterAngle({ min: direction - 46, max: direction + 46 })
    this.juiceSeedParticles.setEmitterAngle({ min: direction - 52, max: direction + 52 })
    this.juiceChunkParticles.setEmitterAngle({ min: direction - 38, max: direction + 38 })
    this.juiceParticles.setParticleTint(color).explode(count, x, y)
    this.juiceSpeckParticles.setParticleTint(color).explode(Math.round(count * .72), x, y)
    this.juiceSeedParticles.explode(2 + tier * 2, x, y)
    this.juiceChunkParticles.setParticleTint(color).explode(4 + tier * 3, x, y)
    this.cameras.main.shake(55 + tier * 32, .0015 + tier * .0014)
    const splash = this.add.image(x, y, 'vlad-parts', 15)
      .setDisplaySize(34 + tier * 9, 34 + tier * 9)
      .setTint(color)
      .setAngle((this.random() * 2 - 1) * 22)
      .setDepth(75)
    const calloutX = clamp(x + (tier % 2 === 0 ? 42 : -42), 82, 308)
    const callout = this.add.container(calloutX, y - 35).setDepth(77)
    const word = this.add.text(0, 0, impactWords[Math.floor(this.random() * impactWords.length)], {
      fontFamily: FONT, fontSize: `${14 + tier * 2}px`, color: '#fff0b0', stroke: '#7d0908', strokeThickness: 5, resolution: 1,
    }).setOrigin(.5)
    const cry = this.add.text(0, 31, cries[Math.floor(this.random() * cries.length)], {
      fontFamily: FONT, fontSize: '9px', color: '#2a0908', resolution: 1,
    }).setOrigin(.5)
    const bubbleWidth = clamp(cry.width + 24, 74, 138)
    const bubble = this.add.graphics()
      .fillStyle(0x160607, 1).fillRect(-bubbleWidth / 2 - 3, 16, bubbleWidth + 6, 31)
      .fillStyle(0xfff1cc, 1).fillRect(-bubbleWidth / 2, 19, bubbleWidth, 25)
      .fillStyle(0x160607, 1).fillTriangle(-8, 44, 5, 44, -4, 54)
      .fillStyle(0xfff1cc, 1).fillTriangle(-5, 42, 3, 42, -3, 49)
    callout.add([bubble, word, cry])
    this.impactCallouts.forEach(older => { older.y -= 38; older.setAlpha(older.alpha * .52) })
    this.impactCallouts.push(callout)
    this.tweens.add({ targets: splash, y: splash.y - 24, alpha: 0, scale: 1.2, delay: 520 + tier * 90, duration: 900, ease: 'Cubic.Out', onComplete: () => splash.destroy() })
    this.tweens.add({
      targets: callout, y: callout.y - 34, alpha: 0, delay: 1450 + tier * 140, duration: 850, ease: 'Cubic.In',
      onComplete: () => { this.impactCallouts = this.impactCallouts.filter(item => item !== callout); callout.destroy(true) },
    })
    if (tier >= 2) {
      const actual = this.combo > 5 ? `×${this.combo} · BRUTALITY!` : tier === 5 ? '×5 BRUTALITY!' : `×${tier}`
      this.comboText.setText(actual).setVisible(true).setScale(.72 + tier * .08).setColor(tier === 5 ? '#ff3b20' : '#ffe25a').setAlpha(1)
      this.tweens.killTweensOf(this.comboText)
      this.tweens.add({ targets: this.comboText, scale: { from: 1.35, to: 1 }, duration: 210, ease: 'Back.Out' })
    }
  }

  private showActiveBonus() {
    this.bonusText.setText('SANG FROID 3.4s').setVisible(true).setAlpha(1).setScale(1.9)
    this.tweens.killTweensOf(this.bonusText)
    this.tweens.add({ targets: this.bonusText, scale: 1, duration: 320, ease: 'Back.Out' })
  }

  private removeDrop(drop: Drop) {
    const index = this.drops.indexOf(drop)
    if (index >= 0) this.drops.splice(index, 1)
    drop.visual?.root.destroy(true)
    drop.bloodVisual?.destroy(true)
  }

  private clearStack() {
    this.stack.forEach(item => item.visual.root.destroy(true))
    this.stack = []
    this.combo = 0
    this.comboBest = 1
    this.autoServeAt = null
    this.comboText.setVisible(false)
  }

  private loseCustomer(message: string) {
    if (this.finished) return
    this.lost += 1
    this.flashStatus(message, '#ff6a4d')
    void miniFuggAudio.playGameSfx(GAME_ID, 'fail', { intensity: 1 })
    const lostIcon = this.lifeIcons[this.lost - 1]
    if (lostIcon) this.tweens.add({ targets: lostIcon, y: '+=85', angle: 80, alpha: 0, duration: 520, ease: 'Cubic.In' })
    this.clearStack()
    if (this.lost >= MAX_LOST) {
      this.finished = true
      this.statusText.setText('VLAD FERME LE GRILL').setColor('#ffbb63').setVisible(true)
      this.bridge.session.finish({ score: this.score, metadata: { served: this.served, level: this.level } })
      return
    }
    this.levelServed += 1
    this.customers.shift()
    if (this.customers.length === 0) this.advanceLevel()
    else this.refreshHud()
  }

  private serveCustomer() {
    const customer = this.customers[0]
    if (!customer || this.stack.length !== customer.order.length) return
    const multiplier = Math.max(1, this.comboBest)
    const earned = skewerBasePoints(customer.order.length) * multiplier
    this.score += earned
    this.served += 1
    this.levelServed += 1
    this.bridge.session.setScore(this.score)
    this.flashStatus(`SERVI · +${earned}${multiplier > 1 ? ` · ×${multiplier}` : ''}`, '#ffe56a')
    void miniFuggAudio.playGameSfx(GAME_ID, 'success', { intensity: 1 })

    this.clearStack()
    this.customers.shift()
    if (this.customers.length === 0) this.advanceLevel()
    else this.refreshHud()
  }

  private advanceLevel() {
    this.level += 1
    this.levelServed = 0
    this.drops.forEach(drop => { drop.visual?.root.destroy(true); drop.bloodVisual?.destroy(true) })
    this.drops = []
    this.customers = []
    while (this.customers.length < clientsForLevel(this.level)) this.pushCustomer()
    this.spawnTimer = this.tuning().gap * .75
    this.showLevelCard()
    void miniFuggAudio.playGameSfx(GAME_ID, 'levelUp', { intensity: 1 })
    this.refreshHud()
  }

  private pushCustomer() {
    const id = this.nextCustomerId++
    const pool = this.availableIngredients()
    const order: IngredientKind[] = []
    for (let index = 0; index < recipeLengthForLevel(this.level); index += 1) order.push(this.randomIngredient(pool))
    const maxPatience = clamp(24 + order.length * 1.2 - (this.level - 1) * .85, 12, 26)
    this.customers.push({ id, frame: id % 15, name: names[id % names.length], order, patience: maxPatience, maxPatience })
  }

  private refreshHud() {
    if (!this.scoreText) return
    this.drawScoreDigits()
    this.levelText.setText(`NIVEAU ${this.level}`)
    this.unlockIcons.forEach(icon => icon.destroy())
    this.unlockIcons = this.availableIngredients().map((ingredient, index, list) => {
      const spacing = Math.min(27, 166 / Math.max(1, list.length - 1))
      return this.createIngredientIcon(ingredient.kind, 195 + (index - (list.length - 1) / 2) * spacing, 52, 23, 53)
    })

    const visibleCustomers = this.customers.slice(0, 5).reverse()
    const firstVisibleSlot = this.customerSlots.length - visibleCustomers.length
    this.customerSlots.forEach((slot, index) => {
      const customer = index >= firstVisibleSlot ? visibleCustomers[index - firstVisibleSlot] : undefined
      slot.actor.setVisible(Boolean(customer))
      if (!customer) return
      slot.customerId = customer.id
      slot.portrait.setFrame(customer.frame)
      slot.actor.setScale(index === this.customerSlots.length - 1 ? 1.02 : .9)
    })
    const topCustomerSlot = this.customerSlots[firstVisibleSlot]
    this.clientCountText
      .setText(`RESTE ×${this.customers.length}`)
      .setPosition(349, topCustomerSlot ? Math.min(topCustomerSlot.baseY - 110, 492) : 172)
      .setVisible(this.customers.length > 0)

    this.orderIcons.forEach(icon => icon.destroy())
    const active = this.customers[0]
    this.orderSkewer.clear().setVisible(Boolean(active))
    if (active) {
      const half = Math.max(43, (active.order.length - 1) * 14 + 24)
      this.orderSkewer.lineStyle(6, 0x35140c, 1).lineBetween(300 - half, 555, 300 + half, 555)
      this.orderSkewer.lineStyle(2, 0xd38b25, 1).lineBetween(300 - half, 554, 300 + half + 5, 554)
      this.orderSkewer.fillStyle(0xf2b342, 1).fillTriangle(300 - half - 9, 554, 300 - half, 548, 300 - half, 560)
      this.orderSkewer.fillStyle(0x8d2418, 1).fillRect(300 + half + 3, 548, 5, 13)
    }
    this.orderIcons = active ? active.order.map((kind, index) => {
      const done = index < this.stack.length
      return this.createIngredientIcon(kind, 300 + (index - (active.order.length - 1) / 2) * 28, 555, 32, 60)
        .setTint(done ? 0x66584b : 0xffffff)
    }) : []
    this.serveBubble.setVisible(Boolean(active))
    const meterX = 254
    const meterY = 608
    const meterWidth = 92
    const ratio = active ? clamp(active.patience / active.maxPatience, 0, 1) : 0
    const meterColor = ratio < .25 ? 0xff3b24 : ratio < .55 ? 0xffa51f : 0x8ed348
    this.patienceBar.clear()
      .fillStyle(0x160708, 1).fillRect(meterX, meterY, meterWidth, 12)
      .lineStyle(2, 0xb86228, 1).strokeRect(meterX, meterY, meterWidth, 12)
      .fillStyle(0x3b1710, 1).fillRect(meterX + 4, meterY + 4, meterWidth - 8, 4)
    if (active) this.patienceBar.fillStyle(meterColor, 1).fillRect(meterX + 4, meterY + 4, Math.round((meterWidth - 8) * ratio), 4)
    this.patienceBar.fillStyle(0xe6a34b, 1).fillTriangle(meterX - 4, meterY + 6, meterX, meterY + 2, meterX, meterY + 10)
    for (let tick = 1; tick < 4; tick += 1) this.patienceBar.fillStyle(0x080405, .8).fillRect(meterX + tick * 21 + 3, meterY + 3, 2, 6)
  }

  private drawScoreDigits() {
    this.scoreDigits.forEach(digit => digit.destroy())
    const value = String(this.score)
    const digitHeight = value.length >= 7 ? 19 : value.length >= 5 ? 24 : 31
    const digitWidth = Math.round(digitHeight * .575)
    const gap = Math.max(1, Math.round(digitWidth * .08))
    const totalWidth = value.length * digitWidth + Math.max(0, value.length - 1) * gap
    this.scoreDigits = [...value].map((character, index) => this.add.image(
      342 - totalWidth / 2 + digitWidth / 2 + index * (digitWidth + gap), 54,
      'vlad-digits', `digit-${Number(character)}`,
    ).setDisplaySize(digitWidth, digitHeight).setDepth(53))
  }

  private updateCustomers() {
    this.customerSlots.forEach((slot, index) => {
      if (!slot.actor.visible) return
      const hop = Math.max(0, Math.sin(this.elapsed * (index === 2 ? 7.5 : 4.2) + slot.phase))
      const active = index === this.customerSlots.length - 1
      const feastHop = Math.floor((this.elapsed + slot.phase) / 2.8) % 3 === 0 ? hop * (active ? 8 : 4) : hop * 1.25
      slot.actor.y = slot.baseY - feastHop
      slot.actor.angle = Math.sin(this.elapsed * 3 + slot.phase) * (active ? 2 : 1)
      const salivating = Math.floor((this.elapsed + slot.phase) * 2) % 7 <= 1
      const [mouthX, mouthY] = customerMouthOffsets[slot.customerId % customerMouthOffsets.length]
      slot.drool.clear().setVisible(salivating).setPosition(mouthX, mouthY + 3 + hop)
      if (salivating) {
        const drip = Math.floor((this.elapsed * 12 + slot.phase) % 8)
        slot.drool.fillStyle(0x8eefff, .95).fillRect(0, 0, 3, 5 + drip)
        slot.drool.fillStyle(0xd9ffff, .9).fillRect(0, 0, 1, 4)
        if (drip > 4) slot.drool.fillStyle(0x6bd7ed, .95).fillRect(-1, 6 + drip, 5, 4)
      }
    })
  }

  private updateAmbient() {
    const tick = Math.floor(this.elapsed * 12)
    if (tick > this.ambientTick) {
      this.ambientTick = tick
      for (let burst = 0; burst < 3; burst += 1) {
        const source = this.ambientFlames[Math.floor(this.random() * this.ambientFlames.length)]
        const emitter = source.layer === 'grill' ? this.foregroundEmberParticles : this.emberParticles
        emitter.explode(source.layer === 'fixture' ? 2 : 4, source.x + (this.random() * 2 - 1) * source.width * .34, source.y - source.height * (.22 + this.random() * .35))
      }
      this.foregroundEmberParticles.explode(5, 55 + this.random() * 280, 790 + this.random() * 40)
      if (tick % 2 === 0) this.emberParticles.explode(4, 70 + this.random() * 245, 675 + this.random() * 70)
      if (tick % 3 === 0) this.smokeParticles.explode(3, 70 + this.random() * 250, 705 + this.random() * 95)
    }
  }

  private flashStatus(text: string, color: string) {
    this.statusText.setText(text).setColor(color).setVisible(true).setAlpha(1).setScale(1)
    this.tweens.killTweensOf(this.statusText)
    this.tweens.add({ targets: this.statusText, alpha: 0, delay: 950, duration: 720, ease: 'Cubic.In', onComplete: () => this.statusText.setVisible(false) })
  }

  private showLevelCard() {
    this.tweens.killTweensOf(this.orderPanel)
    this.orderPanel.setAlpha(.55)
    this.tweens.add({ targets: this.orderPanel, alpha: 1, duration: 320, ease: 'Cubic.Out' })
    this.flashStatus(`NIVEAU ${this.level}`, '#ffca69')
  }

  private runTestAction(action: string) {
    if (!import.meta.env.DEV) return this.stateReader()
    if (action === 'tip-probe') {
      this.drops.forEach(drop => { drop.visual?.root.destroy(true); drop.bloodVisual?.destroy(true) })
      this.drops = []
      this.clearStack()
      this.spawnTimer = 99
      const customer = this.customers[0]
      if (customer) {
        customer.order = ['pepper', 'tomato']
        customer.maxPatience = customer.patience = 26
      }
      const drop: Drop = {
        id: this.nextDropId++, kind: 'pepper', x: 195, y: 400, speed: 0, vx: 0, sway: 0, phase: 0,
        rotation: 23, spin: 0, state: 'falling', grillAge: 0, smokeTick: 0, visual: this.createFoodVisual('pepper', 195, 400, FALLING_FOOD_SIZE), bloodVisual: null,
      }
      this.drops.push(drop)
    }
    if (action === 'brutality') {
      this.clearStack()
      const customer = this.customers[0]
      if (customer) {
        customer.order = ['meat', 'tomato', 'pepper', 'onion', 'mushroom']
        customer.maxPatience = customer.patience = 26
        customer.order.forEach((kind, index) => {
          this.elapsed += .1
          const drop: Drop = {
            id: this.nextDropId++, kind, x: 160 + index * 10, y: 410, speed: 0, vx: 0, sway: 0, phase: index,
            rotation: 0, spin: 0, state: 'falling', grillAge: 0, smokeTick: 0, visual: this.createFoodVisual(kind, 160 + index * 10, 410, FALLING_FOOD_SIZE), bloodVisual: null,
          }
          this.drops.push(drop)
          this.catchDrop(drop)
        })
      }
    }
    if (action === 'limb-whirl' && this.stack.length > 0) {
      this.skewerX = 72
      this.updateSkewer(1 / 60)
      this.skewerX = 318
      for (let step = 0; step < 24; step += 1) {
        this.updateSkewer(1 / 60)
      }
      this.skewerX = 195
      this.updateSkewer(1 / 60)
    }
    if (action === 'serve') this.serveCustomer()
    if (action === 'lose') this.loseCustomer('BROCHETTE RATÉE')
    if (action === 'grill') {
      const kind: IngredientKind = 'pepper'
      const drop: Drop = {
        id: this.nextDropId++, kind, x: 118, y: GRILL_Y, speed: 0, vx: 0, sway: 0, phase: this.random() * 6,
        rotation: -8, spin: 0, state: 'falling', grillAge: 0, smokeTick: 0, visual: this.createFoodVisual(kind, 118, GRILL_Y, FALLING_FOOD_SIZE), bloodVisual: null,
      }
      this.drops.push(drop)
      this.startGrilling(drop)
    }
    if (action === 'physics-probe') {
      this.drops.forEach(drop => { drop.visual?.root.destroy(true); drop.bloodVisual?.destroy(true) })
      this.drops = []
      this.clearStack()
      this.spawnTimer = 99
      const drop: Drop = {
        id: this.nextDropId++, kind: 'tomato', x: this.skewerX + 24, y: this.skewerY - 180,
        speed: 25, vx: 0, sway: 0, phase: 0, rotation: 0, spin: 0,
        state: 'falling', grillAge: 0, smokeTick: 0,
        visual: this.createFoodVisual('tomato', this.skewerX + 24, this.skewerY - 180, FALLING_FOOD_SIZE), bloodVisual: null,
      }
      this.drops.push(drop)
    }
    if (action === 'queue-six') {
      this.level = 4
      this.levelServed = 0
      this.customers = []
      while (this.customers.length < clientsForLevel(this.level)) this.pushCustomer()
    }
    if (action === 'max-recipe') {
      this.level = 99
      this.customers = []
      this.pushCustomer()
    }
    this.refreshHud()
    return this.stateReader()
  }
}
