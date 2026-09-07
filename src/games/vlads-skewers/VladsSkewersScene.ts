import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { miniFuggAudio } from '../../audio'

export const VLADS_SKEWERS_SCENE_KEY = 'vlads-skewers-main'

const W = 390
const H = 844
const GAME_ID = 'vlads-skewers'
const ASSET_ROOT = '/assets/generated/vlads-skewers'
const MAX_LOST = 3
const COMBO_WINDOW = 1.35
const GRILL_Y = 705
const TIP_OFFSET = 365
const TIP_RADIUS = 12
const PLAY_MIN_X = 68
const PLAY_MAX_X = 290
const FALLING_FOOD_SIZE = 78
const STACK_FOOD_SIZE = 70
const STACK_GAP = 43
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
  leftArm: Phaser.GameObjects.Image
  rightArm: Phaser.GameObjects.Image
  leftLeg: Phaser.GameObjects.Image
  rightLeg: Phaser.GameObjects.Image
  grillMarks: Phaser.GameObjects.Image
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
  visual: FoodVisual | null
  bloodVisual: Phaser.GameObjects.Container | null
}

type StackFood = {
  kind: IngredientKind
  visual: FoodVisual
  lag: number
  lagVelocity: number
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
  root: Phaser.GameObjects.Container
  portrait: Phaser.GameObjects.Image
  drool: Phaser.GameObjects.Image
  baseY: number
  phase: number
  customerId: number
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
function recipeLengthForLevel(level: number) { return Math.min(6, 2 + Math.floor((level - 1) / 2)) }
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
  private skewerX = 195
  private skewerY = 820
  private previousTip = new Phaser.Math.Vector2(195, 455)
  private previousSkewerX = 195

  private background!: Phaser.GameObjects.Image
  private skewer!: Phaser.GameObjects.Image
  private tipGlow!: Phaser.GameObjects.Graphics
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private clientsText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text
  private statusText!: Phaser.GameObjects.Text
  private orderIcons: Phaser.GameObjects.Image[] = []
  private unlockIcons: Phaser.GameObjects.Image[] = []
  private lifeIcons: Phaser.GameObjects.Image[] = []
  private customerSlots: CustomerSlot[] = []
  private patienceBar!: Phaser.GameObjects.Graphics
  private serveBubble!: Phaser.GameObjects.Image
  private orderPanel!: Phaser.GameObjects.Image
  private juiceParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private ashParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private emberParticles!: Phaser.GameObjects.Particles.ParticleEmitter

  private readonly stateReader = () => JSON.stringify({
    coordinateSystem: '390x844 logical; origin top-left; x right; y down',
    mode: this.finished ? 'finished' : this.dragging ? 'dragging' : 'playing',
    level: this.level,
    score: this.score,
    served: this.served,
    lives: MAX_LOST - this.lost,
    slowSeconds: Number(this.slowTimer.toFixed(2)),
    combo: this.combo,
    customerRosterSize: 15,
    skewer: { x: Math.round(this.skewerX), y: Math.round(this.skewerY), tipX: Math.round(this.skewerX), tipY: Math.round(this.skewerY - TIP_OFFSET), stack: this.stack.map(item => ({ kind: item.kind, cooked: item.visual.cooked })) },
    activeCustomer: this.customers[0] ? { id: this.customers[0].id, name: this.customers[0].name, order: this.customers[0].order, patience: Number(this.customers[0].patience.toFixed(1)) } : null,
    drops: this.drops.slice(0, 40).map(drop => ({ id: drop.id, kind: drop.kind, x: Math.round(drop.x), y: Math.round(drop.y), state: drop.state, emotion: this.emotionFor(drop) })),
  })

  constructor(bridge: VladsSkewersSceneBridge) {
    super(VLADS_SKEWERS_SCENE_KEY)
    this.bridge = bridge
  }

  preload() {
    this.load.image('vlad-bg', `${ASSET_ROOT}/backgrounds/pixel-grill-arena.png`)
    this.load.spritesheet('vlad-food', `${ASSET_ROOT}/sprites/ingredient-bodies-v2.png`, { frameWidth: 362, frameHeight: 362 })
    this.load.spritesheet('vlad-customers', `${ASSET_ROOT}/sprites/customer-atlas.png`, { frameWidth: 320, frameHeight: 320 })
    this.load.spritesheet('vlad-parts', `${ASSET_ROOT}/sprites/character-parts-v3.png`, { frameWidth: 313, frameHeight: 313 })
    this.load.image('vlad-ui', `${ASSET_ROOT}/ui/component-atlas.png`)
    this.load.image('vlad-booth', `${ASSET_ROOT}/ui/customer-booth-v2.png`)
    this.load.image('vlad-skewer', `${ASSET_ROOT}/props/vlad-skewer-hand.png`)
    this.load.image('vlad-life', `${ASSET_ROOT}/ui/life-skewer.png`)
  }

  create() {
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(W / 2, H / 2)
    this.textures.get('vlad-bg').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-food').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-customers').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-parts').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-ui').setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get('vlad-booth').setFilter(Phaser.Textures.FilterMode.NEAREST)
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
    this.skewerX = 195
    this.skewerY = 820
    this.previousTip.set(195, 455)
    this.previousSkewerX = 195
    while (this.customers.length < 3) this.pushCustomer()
  }

  private buildScene() {
    this.background = this.add.image(W / 2, H / 2, 'vlad-bg').setDisplaySize(W, H).setDepth(0)
    this.makeParticleTextures()
    this.emberParticles = this.add.particles(0, 0, 'vlad-ember', {
      emitting: false, lifespan: { min: 550, max: 1100 }, speedY: { min: -80, max: -28 }, speedX: { min: -12, max: 12 },
      scale: { start: 1, end: 0 }, alpha: { start: .9, end: 0 }, quantity: 1, maxParticles: 70,
    }).setDepth(3)
    this.juiceParticles = this.add.particles(0, 0, 'vlad-pixel', {
      emitting: false, lifespan: { min: 320, max: 680 }, speed: { min: 62, max: 185 }, angle: { min: 195, max: 345 },
      gravityY: 370, scale: { start: .72, end: .16 }, alpha: { start: 1, end: .2 }, maxParticles: 120,
    }).setDepth(70)
    this.ashParticles = this.add.particles(0, 0, 'vlad-ash', {
      emitting: false, lifespan: { min: 650, max: 1250 }, speedY: { min: -38, max: -8 }, speedX: { min: -28, max: 28 },
      gravityY: 24, scale: { start: 1.1, end: .15 }, alpha: { start: .9, end: 0 }, maxParticles: 90,
    }).setDepth(22)

    this.buildHud()
    // The authored spear tip sits at x=128.5 in the 512 px source image.
    // Anchor the whole arm on that exact pixel so the visible point, hit test,
    // and stacked ingredients all share the same world coordinate.
    this.skewer = this.add.image(this.skewerX, H + 4, 'vlad-skewer').setOrigin(128.5 / 512, 1).setDisplaySize(170, H + 4 - (this.skewerY - TIP_OFFSET)).setDepth(45)
    this.tipGlow = this.add.graphics().setDepth(44)
    this.comboText = this.add.text(195, 525, '', {
      fontFamily: FONT, fontSize: '28px', color: '#ffe25a', stroke: '#8b130b', strokeThickness: 6, align: 'center', resolution: 1,
    }).setOrigin(.5).setDepth(80).setVisible(false)
    this.statusText = this.add.text(195, 574, '', {
      fontFamily: FONT, fontSize: '13px', color: '#fff0c4', stroke: '#170707', strokeThickness: 4, align: 'center', wordWrap: { width: 355 }, resolution: 1,
    }).setOrigin(.5).setDepth(82)
  }

  private buildHud() {
    this.orderPanel = this.add.image(194, 68, 'vlad-ui', 'order').setDisplaySize(244, 122).setDepth(50)
    this.add.image(352, 56, 'vlad-ui', 'score').setDisplaySize(72, 80).setDepth(50)
    this.levelText = this.add.text(194, 26, '', { fontFamily: FONT, fontSize: '22px', color: '#ffbd62', stroke: '#220706', strokeThickness: 4, resolution: 1 }).setOrigin(.5).setDepth(52)
    this.clientsText = this.add.text(194, 105, '', { fontFamily: FONT, fontSize: '12px', color: '#3d1507', stroke: '#f4c786', strokeThickness: 1, resolution: 1 }).setOrigin(.5).setDepth(52)
    this.add.text(352, 31, 'SCORE', { fontFamily: FONT, fontSize: '9px', color: '#ffdfa0', stroke: '#210706', strokeThickness: 2, resolution: 1 }).setOrigin(.5).setDepth(52)
    this.scoreText = this.add.text(352, 58, '0', { fontFamily: FONT, fontSize: '23px', color: '#ff9e2d', stroke: '#2a0805', strokeThickness: 3, resolution: 1 }).setOrigin(.5).setDepth(52)

    for (let index = 0; index < MAX_LOST; index += 1) {
      this.add.rectangle(20 + index * 18, 195, 14, 63, 0x080506, .82).setStrokeStyle(2, 0x6e2518, 1).setDepth(48)
      this.lifeIcons.push(this.add.image(20 + index * 18, 195, 'vlad-life').setDisplaySize(16, 64).setDepth(51))
    }

    const ys = [292, 458, 628]
    ys.forEach((y, index) => {
      const root = this.add.container(344, y).setDepth(25 + index)
      const shadow = this.add.rectangle(0, 5, 83, 102, 0x050304, .88)
      const portrait = this.add.image(0, 5, 'vlad-customers', 0).setDisplaySize(94, 94)
      const booth = this.add.image(0, 0, 'vlad-booth').setDisplaySize(108, 144)
      const drool = this.add.image(11, 13, 'vlad-parts', 12).setDisplaySize(27, 27).setVisible(false)
      root.add([shadow, portrait, booth, drool])
      this.customerSlots.push({ root, portrait, drool, baseY: y, phase: index * 1.7, customerId: -1 })
    })
    this.serveBubble = this.add.image(319, 544, 'vlad-ui', 'bubble').setDisplaySize(136, 88).setDepth(58)
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
    make('vlad-ember', 0xff6a1c, 4)
  }

  private registerInput() {
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.input.keyboard?.on('keydown-F', this.toggleFullscreen, this)
    this.events.once('shutdown', this.handleShutdown, this)
    this.events.once('destroy', this.handleShutdown, this)
  }

  private handleShutdown() {
    this.input?.off('pointerdown', this.handlePointerDown, this)
    this.input?.off('pointermove', this.handlePointerMove, this)
    this.input?.off('pointerup', this.handlePointerUp, this)
    this.input?.off('pointerupoutside', this.handlePointerUp, this)
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

  private pointerWorld(pointer: Phaser.Input.Pointer) {
    return pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished) return
    const point = this.pointerWorld(pointer)
    if (point.y < 560) return
    this.returnTween?.stop()
    this.returnTween = undefined
    this.dragging = true
    this.moveSkewer(point)
    this.previousTip.set(this.skewerX, this.skewerY - TIP_OFFSET)
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.dragging || this.finished) return
    this.moveSkewer(this.pointerWorld(pointer))
  }

  private handlePointerUp() {
    if (!this.dragging) return
    this.dragging = false
    const returnState = { y: this.skewerY }
    this.returnTween?.stop()
    this.returnTween = this.tweens.add({
      targets: returnState,
      y: 832,
      duration: 360,
      ease: 'Back.Out',
      onUpdate: () => { this.skewerY = returnState.y },
      onComplete: () => { this.returnTween = undefined },
    })
  }

  private moveSkewer(point: Phaser.Math.Vector2) {
    this.skewerX = clamp(point.x, 54, 341)
    this.skewerY = clamp(point.y, 670, 832)
  }

  private simulate(dt: number) {
    if (!Number.isFinite(dt) || dt <= 0) return
    this.elapsed += dt
    this.updateAmbient()
    this.updateCustomers()
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
      if (target) this.catchDrop(target)
      if (this.stack.length === this.customers[0]?.order.length && tip.x > 294 && tip.y > 390 && tip.y < 575) this.serveCustomer()
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
      state: 'falling', grillAge: 0, visual: null, bloodVisual: null,
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

  private createFoodVisual(kind: Exclude<DropKind, 'blood'>, x: number, y: number, size: number) {
    const frame = kind === 'garlic' ? 7 : specs.get(kind as IngredientKind)!.frame
    const root = this.add.container(x, y).setDepth(20)
    const leftLeg = this.add.image(-size * .14, size * .34, 'vlad-parts', 10).setDisplaySize(size * .72, size * .72)
    const rightLeg = this.add.image(size * .14, size * .34, 'vlad-parts', 10).setDisplaySize(size * .72, size * .72).setFlipX(true)
    const leftArm = this.add.image(-size * .35, 0, 'vlad-parts', 9).setDisplaySize(size * .82, size * .82)
    const rightArm = this.add.image(size * .35, 0, 'vlad-parts', 9).setDisplaySize(size * .82, size * .82).setFlipX(true)
    const body = this.add.image(0, 0, 'vlad-food', frame).setDisplaySize(size * 1.08, size * 1.08)
    const grillMarks = this.add.image(0, 2, 'vlad-parts', 13).setDisplaySize(size * .82, size * .82).setVisible(false)
    const eyes = this.add.image(0, -size * .09, 'vlad-parts', 0).setDisplaySize(size * .78, size * .78)
    const mouth = this.add.image(0, size * .15, 'vlad-parts', 4).setDisplaySize(size * .62, size * .62)
    root.add([leftLeg, rightLeg, leftArm, rightArm, body, grillMarks, eyes, mouth])
    return { root, body, eyes, mouth, leftArm, rightArm, leftLeg, rightLeg, grillMarks, phase: this.random() * Math.PI * 2, cooked: false, size }
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
        if (distance >= 38 || distance <= .1) continue
        const push = (38 - distance) * 1.7 * dt
        const direction = dx >= 0 ? 1 : -1
        a.vx -= direction * push
        b.vx += direction * push
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
    drop.x += (drop.vx + Math.sin(drop.phase) * drop.sway) * slow * dt
    if (drop.x <= PLAY_MIN_X) { drop.x = PLAY_MIN_X; drop.vx = Math.abs(drop.vx) }
    if (drop.x >= PLAY_MAX_X) { drop.x = PLAY_MAX_X; drop.vx = -Math.abs(drop.vx) }
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
    drop.speed = 0
    drop.vx = 0
    drop.y = GRILL_Y + 9 + this.random() * 12
    drop.rotation = (this.random() * 2 - 1) * 12
    if (drop.kind === 'blood') {
      this.removeDrop(drop)
      return
    }
    miniFuggAudio.playSfx('vlad.sizzle', { owner: GAME_ID, intensity: .7 })
    this.emberParticles.explode(4, drop.x, drop.y + 10)
  }

  private updateGrillingDrop(drop: Drop, dt: number) {
    if (drop.grillAge < 0) return
    drop.grillAge += dt
    if (!drop.visual) return
    const struggle = Math.max(0, 1 - drop.grillAge / 1.5)
    drop.visual.root.setPosition(drop.x + Math.sin(this.elapsed * 31 + drop.phase) * 2.5 * struggle, drop.y + Math.abs(Math.sin(this.elapsed * 17 + drop.phase)) * 2)
    drop.visual.root.setRotation(Phaser.Math.DegToRad(drop.rotation + Math.sin(this.elapsed * 18) * 5 * struggle))
    drop.visual.cooked = true
    if (drop.grillAge < .9) drop.visual.body.setTint(0xffbd72)
    else if (drop.grillAge < 1.65) drop.visual.body.setTint(0x654331)
    else drop.visual.body.setTint(0x171313)
    this.drawFoodParts(drop.visual, 'dead', this.elapsed, null)
    this.drawGrillMarks(drop.visual, drop.grillAge > 1.65 ? 0x090707 : 0x4d1b0c)
    if (drop.grillAge > 1.35 && Math.floor(drop.grillAge * 12) % 4 === 0) this.ashParticles.explode(1, drop.x, drop.y - 16)
    if (drop.grillAge >= 2.25) {
      this.ashParticles.explode(12, drop.x, drop.y)
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

    const frantic = emotion === 'panic' ? 18 : emotion === 'happy' ? 8 : emotion === 'realizing' ? 4 : 2
    visual.leftArm.setPosition(-size * .34, -size * .01).setAngle(emotion === 'dead' ? 54 : -10 - wave * frantic)
    visual.rightArm.setPosition(size * .34, -size * .01).setAngle(emotion === 'dead' ? -54 : 10 + wave * frantic)
    visual.leftLeg.setPosition(-size * .14, size * .34).setAngle(emotion === 'dead' ? 24 : wave * frantic * .7)
    visual.rightLeg.setPosition(size * .14, size * .34).setAngle(emotion === 'dead' ? -24 : -wave * frantic * .7)
    visual.leftArm.setDisplaySize(size * .82, size * .82)
    visual.rightArm.setDisplaySize(size * .82, size * .82)

    if (neighbour && visual.root.parentContainer === null && emotion !== 'dead') {
      const dx = neighbour.x - visual.root.x
      const dy = neighbour.y - visual.root.y
      const reach = clamp(Math.hypot(dx, dy) / 72, .7, 1.08)
      const target = dx < 0 ? visual.leftArm : visual.rightArm
      target.setDisplaySize(size * .82 * reach, size * .82).setAngle(Phaser.Math.RadToDeg(Math.atan2(dy, Math.abs(dx))) * (dx < 0 ? -1 : 1))
    }

    const faceBounce = emotion === 'panic' ? 1 + Math.abs(wave) * .08 : 1
    visual.eyes.setDisplaySize(size * .78 * faceBounce, size * .78 * faceBounce)
    const mouthBounce = emotion === 'panic' ? 1 + Math.abs(wave) * .12 : 1
    visual.mouth.setDisplaySize(size * .62 * mouthBounce, size * .62 * mouthBounce)
  }

  private drawGrillMarks(visual: FoodVisual, color = 0x57210f) {
    visual.grillMarks.setVisible(true).setTint(color)
  }

  private findImpaleTarget(previous: Phaser.Math.Vector2, tip: Phaser.Math.Vector2) {
    let found: Drop | null = null
    let foundDistance = Number.POSITIVE_INFINITY
    for (const drop of this.drops) {
      if (drop.state !== 'falling') continue
      const distance = distanceToSegment(drop.x, drop.y, previous.x, previous.y, tip.x, tip.y)
      if (distance <= TIP_RADIUS && distance < foundDistance) { found = drop; foundDistance = distance }
    }
    return found
  }

  private catchDrop(drop: Drop) {
    const impactX = drop.x
    const impactY = drop.y
    if (drop.kind === 'blood') {
      this.slowTimer = 3.4
      const active = this.customers[0]
      if (active) active.patience = Math.min(active.maxPatience, active.patience + 5)
      this.removeDrop(drop)
      this.flashStatus('SANG FROID · +TEMPS', '#ff7180')
      miniFuggAudio.playGameSfx(GAME_ID, 'bonus', { intensity: .9 })
      return
    }
    if (drop.kind === 'garlic') {
      this.removeDrop(drop)
      this.showImpact(impactX, impactY, 1, 0xf1d6a3)
      this.loseCustomer('AIL ! CLIENT PERDU')
      return
    }

    const customer = this.customers[0]
    const expected = this.expectedIngredient()
    if (!customer || this.stack.length >= customer.order.length || drop.kind !== expected) {
      this.removeDrop(drop)
      this.showImpact(impactX, impactY, 1, specs.get(drop.kind)!.juice)
      this.loseCustomer('MAUVAISE BROCHETTE')
      return
    }

    this.combo = this.elapsed - this.lastImpaleAt <= COMBO_WINDOW ? Math.min(6, this.combo + 1) : 1
    this.comboBest = Math.max(this.comboBest, this.combo)
    this.lastImpaleAt = this.elapsed
    const tier = Math.min(5, Math.max(1, this.combo))
    this.removeDrop(drop)
    this.addStackFood(drop.kind)
    this.showImpact(impactX, impactY, tier, specs.get(drop.kind)!.juice)
    void miniFuggAudio.playSfx(`vlad.impale${tier}`, { owner: GAME_ID, intensity: .8 + tier * .09 })
    if (this.stack.length === customer.order.length) {
      this.stack.forEach(item => {
        item.visual.cooked = true
        item.visual.body.setTint(0xffbd72)
        this.drawGrillMarks(item.visual)
      })
      this.flashStatus('BROCHETTE GRILLÉE · AU CLIENT →', '#ffe26a')
      void miniFuggAudio.playSfx('vlad.sizzle', { owner: GAME_ID, intensity: 1 })
    }
    this.refreshHud()
  }

  private addStackFood(kind: IngredientKind) {
    const visual = this.createFoodVisual(kind, this.skewerX, this.skewerY - TIP_OFFSET + 54 + this.stack.length * STACK_GAP, STACK_FOOD_SIZE)
    visual.root.setDepth(47)
    this.stack.push({ kind, visual, lag: 0, lagVelocity: 0 })
  }

  private updateSkewer(dt: number) {
    const tipY = this.skewerY - TIP_OFFSET
    this.skewer.setPosition(this.skewerX, H + 4).setDisplaySize(170, H + 4 - tipY)
    const velocity = (this.skewerX - this.previousSkewerX) / Math.max(dt, .001)
    this.previousSkewerX = this.skewerX
    this.tipGlow.clear().fillStyle(0xffe36a, .75).fillRect(this.skewerX - 2, tipY - 2, 4, 4)
    this.stack.forEach((item, index) => {
      const targetLag = clamp(-velocity * .018, -13, 13)
      item.lagVelocity += (targetLag - item.lag) * dt * 21
      item.lagVelocity *= Math.pow(.08, dt)
      item.lag += item.lagVelocity * dt
      item.visual.root.setPosition(this.skewerX + item.lag, tipY + 54 + index * STACK_GAP).setRotation(item.lag * .018)
      this.drawFoodParts(item.visual, 'dead', this.elapsed + index * .2, null)
      if (item.visual.cooked) this.drawGrillMarks(item.visual)
    })
  }

  private showImpact(x: number, y: number, tier: number, color: number) {
    const count = [4, 7, 10, 14, 20][tier - 1]
    this.juiceParticles.setParticleTint(color).explode(count, x, y)
    this.cameras.main.shake(55 + tier * 32, .0015 + tier * .0014)
    const splash = this.add.image(x, y, 'vlad-parts', 15)
      .setDisplaySize(34 + tier * 9, 34 + tier * 9)
      .setTint(color)
      .setAngle((this.random() * 2 - 1) * 22)
      .setDepth(75)
    const word = this.add.text(x, y - 35, impactWords[Math.floor(this.random() * impactWords.length)], {
      fontFamily: FONT, fontSize: `${15 + tier * 3}px`, color: '#fff0b0', stroke: '#7d0908', strokeThickness: 5, resolution: 1,
    }).setOrigin(.5).setDepth(77)
    const cry = this.add.text(x, y - 13, cries[Math.floor(this.random() * cries.length)], {
      fontFamily: FONT, fontSize: '9px', color: '#ffffff', stroke: '#190505', strokeThickness: 3, resolution: 1,
    }).setOrigin(.5).setDepth(77)
    this.tweens.add({ targets: [splash, word, cry], y: '-=24', alpha: 0, scale: 1.12, duration: 360 + tier * 38, ease: 'Stepped', onComplete: () => { splash.destroy(); word.destroy(); cry.destroy() } })
    if (tier >= 2) {
      const actual = this.combo > 5 ? `×${this.combo} · BRUTALITY!` : tier === 5 ? '×5 BRUTALITY!' : `×${tier}`
      this.comboText.setText(actual).setVisible(true).setScale(.72 + tier * .08).setColor(tier === 5 ? '#ff3b20' : '#ffe25a').setAlpha(1)
      this.tweens.killTweensOf(this.comboText)
      this.tweens.add({ targets: this.comboText, scale: { from: 1.35, to: 1 }, duration: 210, ease: 'Back.Out' })
    }
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
    this.rotateCustomer()
    this.refreshHud()
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

    const delivery = this.add.container(this.skewerX, this.skewerY - TIP_OFFSET + 90).setDepth(90)
    this.stack.forEach((item, index) => {
      const clone = this.createFoodVisual(item.kind, 0, index * 31, 52)
      clone.body.setTint(0xffbd72)
      clone.cooked = true
      this.drawFoodParts(clone, 'dead', this.elapsed + index * .2, null)
      this.drawGrillMarks(clone)
      delivery.add(clone.root)
    })
    this.tweens.add({ targets: delivery, x: 338, y: 615, angle: 15, scale: .72, duration: 430, ease: 'Cubic.In', onComplete: () => delivery.destroy(true) })
    this.clearStack()

    if (this.levelServed >= clientsForLevel(this.level)) {
      this.level += 1
      this.levelServed = 0
      this.drops.forEach(drop => { drop.visual?.root.destroy(true); drop.bloodVisual?.destroy(true) })
      this.drops = []
      this.customers = []
      while (this.customers.length < 3) this.pushCustomer()
      this.spawnTimer = this.tuning().gap * .75
      this.showLevelCard()
      void miniFuggAudio.playGameSfx(GAME_ID, 'levelUp', { intensity: 1 })
    } else this.rotateCustomer()
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

  private rotateCustomer() {
    this.customers.shift()
    while (this.customers.length < 3) this.pushCustomer()
  }

  private refreshHud() {
    if (!this.scoreText) return
    this.scoreText.setText(String(this.score))
    this.levelText.setText(`NIVEAU ${this.level}`)
    this.clientsText.setText(`RESTE ${Math.max(0, clientsForLevel(this.level) - this.levelServed)}/${clientsForLevel(this.level)} CLIENTS`)
    this.unlockIcons.forEach(icon => icon.destroy())
    this.unlockIcons = this.availableIngredients().map((ingredient, index, list) => {
      const spacing = Math.min(32, 196 / Math.max(1, list.length - 1))
      return this.add.image(194 + (index - (list.length - 1) / 2) * spacing, 69, 'vlad-food', ingredient.frame).setDisplaySize(31, 31).setDepth(53)
    })

    const orderedCustomers = [this.customers[2], this.customers[1], this.customers[0]]
    this.customerSlots.forEach((slot, index) => {
      const customer = orderedCustomers[index]
      slot.root.setVisible(Boolean(customer))
      if (!customer) return
      slot.customerId = customer.id
      slot.portrait.setFrame(customer.frame)
      if (index === 2) slot.root.setScale(1.06)
      else slot.root.setScale(.88)
    })

    this.orderIcons.forEach(icon => icon.destroy())
    const active = this.customers[0]
    this.orderIcons = active ? active.order.map((kind, index) => {
      const done = index < this.stack.length
      const frame = specs.get(kind)!.frame
      return this.add.image(319 + (index - (active.order.length - 1) / 2) * 22, 538, 'vlad-food', frame)
        .setDisplaySize(28, 28).setTint(done ? 0x66584b : 0xffffff).setDepth(60)
    }) : []
    this.patienceBar.clear().fillStyle(0x1b0908, 1).fillRect(286, 570, 67, 8)
    if (active) this.patienceBar.fillStyle(active.patience / active.maxPatience < .28 ? 0xff3b2e : 0x8ed348, 1).fillRect(289, 573, 61 * active.patience / active.maxPatience, 3)
  }

  private updateCustomers() {
    this.customerSlots.forEach((slot, index) => {
      if (!slot.root.visible) return
      const hop = Math.max(0, Math.sin(this.elapsed * (index === 2 ? 7.5 : 4.2) + slot.phase))
      const feastHop = Math.floor((this.elapsed + slot.phase) / 2.8) % 3 === 0 ? hop * (index === 2 ? 9 : 5) : hop * 1.5
      slot.root.y = slot.baseY - feastHop
      slot.root.angle = Math.sin(this.elapsed * 3 + slot.phase) * (index === 2 ? 2 : 1)
      const salivating = Math.floor((this.elapsed + slot.phase) * 2) % 7 <= 1
      const side = slot.customerId % 2 === 0 ? 1 : -1
      slot.drool.setVisible(salivating).setPosition(side * 11, 13 + hop * 2).setFlipX(side < 0).setAlpha(.82 + hop * .18)
    })
  }

  private updateAmbient() {
    if (Math.floor(this.elapsed * 12) % 4 === 0 && this.random() < .28) this.emberParticles.explode(1, 20 + this.random() * 350, 795)
  }

  private flashStatus(text: string, color: string) {
    this.statusText.setText(text).setColor(color).setVisible(true).setAlpha(1).setScale(1)
    this.tweens.killTweensOf(this.statusText)
    this.tweens.add({ targets: this.statusText, alpha: 0, yoyo: true, hold: 650, duration: 180, onComplete: () => this.statusText.setVisible(false) })
  }

  private showLevelCard() {
    this.tweens.killTweensOf(this.orderPanel)
    this.orderPanel.setAlpha(.55)
    this.tweens.add({ targets: this.orderPanel, alpha: 1, duration: 320, ease: 'Cubic.Out' })
    this.flashStatus(`NIVEAU ${this.level} · ${clientsForLevel(this.level)} CLIENTS`, '#ffca69')
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
        customer.order = ['pepper']
        customer.maxPatience = customer.patience = 26
      }
      const drop: Drop = {
        id: this.nextDropId++, kind: 'pepper', x: 195, y: 400, speed: 0, vx: 0, sway: 0, phase: 0,
        rotation: 0, spin: 0, state: 'falling', grillAge: 0, visual: this.createFoodVisual('pepper', 195, 400, FALLING_FOOD_SIZE), bloodVisual: null,
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
            rotation: 0, spin: 0, state: 'falling', grillAge: 0, visual: this.createFoodVisual(kind, 160 + index * 10, 410, FALLING_FOOD_SIZE), bloodVisual: null,
          }
          this.drops.push(drop)
          this.catchDrop(drop)
        })
      }
    }
    if (action === 'serve') this.serveCustomer()
    if (action === 'lose') this.loseCustomer('BROCHETTE RATÉE')
    if (action === 'grill') {
      const kind: IngredientKind = 'pepper'
      const drop: Drop = {
        id: this.nextDropId++, kind, x: 118, y: GRILL_Y, speed: 0, vx: 0, sway: 0, phase: this.random() * 6,
        rotation: -8, spin: 0, state: 'falling', grillAge: 0, visual: this.createFoodVisual(kind, 118, GRILL_Y, FALLING_FOOD_SIZE), bloodVisual: null,
      }
      this.drops.push(drop)
      this.startGrilling(drop)
    }
    this.refreshHud()
    return this.stateReader()
  }
}
