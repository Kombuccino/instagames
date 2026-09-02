import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './VladsSkewers.css'
import './VladsSkewers.perf.css'
import './VladsSkewers.v4.css'
import './VladsSkewers.v5.css'
import './VladsSkewers.v6.css'

type IngredientKind = 'meat' | 'tomato' | 'pepper' | 'onion' | 'mushroom' | 'zucchini' | 'eggplant'
type DropKind = IngredientKind | 'blood' | 'garlic'
type ToastTone = 'good' | 'bad' | 'bonus'
type LoseReason = 'wrong' | 'extra' | 'garlic' | 'patience'

type IngredientSpec = { kind: IngredientKind; emoji: string; label: string; juice: string }
type FallingDrop = { id: number; kind: DropKind; x: number; y: number; speed: number; vx: number; sway: number; phase: number; rotation: number; spin: number }
type DropRender = Pick<FallingDrop, 'id' | 'kind'>
type Customer = { id: number; face: string; name: string; order: IngredientKind[]; patience: number; maxPatience: number }
type Delivery = { token: number; x: number; y: number; face: string; order: IngredientKind[] }
type JuiceImpact = { token: number; x: number; y: number; color: string; kind: IngredientKind; word: string; cry: string }
type GoreBit = { node: HTMLElement; x: number; y: number; vx: number; vy: number; gravity: number; rotation: number; spin: number; age: number; ttl: number }

type World = {
  drops: FallingDrop[]
  customers: Customer[]
  skewered: IngredientKind[]
  score: number
  served: number
  lost: number
  level: number
  levelServed: number
  combo: number
  comboBest: number
  comboToken: number
  lastImpaleAt: number
  nextDropId: number
  nextCustomerId: number
  spawnTimer: number
  skewerX: number
  skewerY: number
  previousTipX: number
  previousTipY: number
  dragging: boolean
  slowTimer: number
  finished: boolean
  random: () => number
  toastText: string
  toastTone: ToastTone
  toastToken: number
  delivery: Delivery | null
  deliveryToken: number
  juiceImpact: JuiceImpact | null
  juiceToken: number
}

type RenderState = {
  customers: Customer[]
  skewered: IngredientKind[]
  score: number
  served: number
  lost: number
  level: number
  levelServed: number
  combo: number
  comboBest: number
  comboToken: number
  dragging: boolean
  slowTimer: number
  finished: boolean
  toastText: string
  toastTone: ToastTone
  toastToken: number
  delivery: Delivery | null
  juiceImpact: JuiceImpact | null
}

type StageSize = { width: number; height: number; playMaxX: number; hardMaxDrops: number }
type LevelTuning = {
  maxDrops: number
  baseSpeed: number
  speedJitter: number
  gap: number
  gapJitter: number
  obliqueChance: number
  spinChance: number
  secondBurstChance: number
  thirdBurstChance: number
  expectedChance: number
  bloodChance: number
  garlicChance: number
}

const MAX_LOST = 3
const SKEWER_TIP_OFFSET_PX = 160
const TIP_HIT_RADIUS_PX = 17
const DROP_MIN_X = 0.055
const DEFAULT_PLAY_MAX_X = 0.72
const DELIVERY_PAD_PX = 22
const UI_REFRESH_SECONDS = 1 / 12
const COMBO_WINDOW_MS = 1350
const MAX_GORE_BITS = 90
const LEVEL_CARD_MS = 3100

const ingredients: IngredientSpec[] = [
  { kind: 'meat', emoji: '🥩', label: 'viande', juice: '#d72f2a' },
  { kind: 'tomato', emoji: '🍅', label: 'tomate', juice: '#ff3b25' },
  { kind: 'pepper', emoji: '🫑', label: 'poivron', juice: '#6bd039' },
  { kind: 'onion', emoji: '🧅', label: 'oignon', juice: '#cd72c7' },
  { kind: 'mushroom', emoji: '🍄', label: 'champignon', juice: '#e4b84e' },
  { kind: 'zucchini', emoji: '🥒', label: 'courgette', juice: '#94c92f' },
  { kind: 'eggplant', emoji: '🍆', label: 'aubergine', juice: '#7b3e8f' },
]

const ingredientMap = new Map<IngredientKind, IngredientSpec>(ingredients.map((ingredient) => [ingredient.kind, ingredient]))
const customerFaces = ['👩🏻', '👨🏽', '👵🏻', '🧔🏾', '👩🏼‍🦰', '👨🏻‍🦱', '👸🏽', '🧙🏻']
const customerNames = ['Mira', 'Igor', 'Nadia', 'Boris', 'Elena', 'Dragomir', 'Ilona', 'Radu', 'Sorina', 'Mihai']
const impactWords = ['SCHLAAAK!', 'SPLOUATCH!', 'KRRRSH!', 'SCHLOP!', 'GLURPSH!', 'TCHLAAK!', 'SPLOK!', 'KRRATCH!', 'PLOUFSH!', 'SKRUNCH!', 'SPLORTCH!', 'CHLAAAF!', 'GLOP!', 'SKLOUITCH!', 'FROUATCH!']
const cries: Record<IngredientKind, string[]> = {
  meat: ['AAAAARGH !', 'PAS LA POINTE !', 'NOOOON !', 'J’ÉTAIS TENDRE !', 'MAMAN !', 'PAS ENCORE !'],
  tomato: ['MA PEAU !', 'J’ÉTAIS BIO !', 'NOOOON !', 'MON JUS !', 'AÏÏÏE !'],
  pepper: ['PAS LE PÉDONCULE !', 'JE PIQUE DÉJÀ !', 'AAAAH !', 'POURQUOI MOI ?!', 'NOOOON !'],
  onion: ['TU VAS PLEURER !', 'MES COUCHES !', 'AAAAAÏE !', 'SANS PITIÉ !', 'NOOOON !'],
  mushroom: ['JE SUIS UN CHAMPIGNON !', 'PAS LE CHAPEAU !', 'HIIIIII !', 'MA TIGE !', 'NOOOON !'],
  zucchini: ['JE SUIS UNE COURGETTE !', 'PAS EN LONG !', 'AAAAARGH !', 'MA PEAU VERTE !', 'NOOOON !'],
  eggplant: ['PAS L’AUBERGINE !', 'MA BELLE PEAU !', 'HAAAAA !', 'PAS COMME ÇA !', 'JE SUIS VIOLETTE !'],
}
const impactParticles = [
  [-58, -34, 13, 8, -24], [61, -31, 9, 15, 22], [-48, 31, 12, 10, 35], [58, 38, 15, 8, -12],
  [-14, -66, 9, 17, 8], [19, -73, 7, 20, -16], [-72, 3, 15, 7, 16], [76, 8, 17, 8, -28],
  [-31, 58, 9, 14, 25], [30, 66, 12, 10, -20], [-88, -22, 8, 8, 0], [91, -9, 9, 9, 0],
  [-5, 83, 8, 12, 10], [46, -54, 8, 10, 30], [-55, -60, 7, 11, -18], [72, 54, 8, 14, 18],
] as const

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
function pick<T>(random: () => number, values: readonly T[]) { return values[Math.floor(random() * values.length)] }
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
function ingredientCountForLevel(level: number) { return Math.min(7, 3 + Math.floor((level - 1) / 2)) }
function recipeLengthForLevel(level: number) { return Math.min(6, 2 + Math.floor((level - 1) / 2)) }
function availableIngredientsForLevel(level: number) { return ingredients.slice(0, ingredientCountForLevel(level)) }
function skewerBasePoints(length: number) {
  if (length >= 6) return 15
  if (length === 5) return 10
  if (length === 4) return 6
  if (length === 3) return 4
  return 2
}

function tuningFor(level: number): LevelTuning {
  const step = Math.max(0, level - 1)
  return {
    maxDrops: Math.round(clamp(7 + step * 3.5, 7, 40)),
    baseSpeed: clamp(.082 + step * .0165, .082, .235),
    speedJitter: clamp(.03 + step * .0045, .03, .075),
    gap: clamp(1.12 - step * .105, .24, 1.12),
    gapJitter: clamp(.30 - step * .024, .07, .30),
    obliqueChance: clamp((step - .4) * .105, 0, .74),
    spinChance: clamp(.05 + step * .092, .05, .86),
    secondBurstChance: clamp((step - 1) * .105, 0, .68),
    thirdBurstChance: clamp((step - 4) * .085, 0, .38),
    expectedChance: clamp(.60 - step * .032, .31, .60),
    bloodChance: clamp(.018 + step * .009, .018, .09),
    garlicChance: clamp(step * .011, 0, .088),
  }
}

function randomIngredient(random: () => number, pool: IngredientSpec[], previous?: IngredientKind) {
  let candidate = pool[Math.floor(random() * pool.length)].kind
  if (previous && candidate === previous && pool.length > 1 && random() < .76) {
    candidate = pool[(pool.findIndex((item) => item.kind === candidate) + 1 + Math.floor(random() * (pool.length - 1))) % pool.length].kind
  }
  return candidate
}

function createCustomer(world: Pick<World, 'random' | 'nextCustomerId' | 'level'>): Customer {
  const id = world.nextCustomerId
  const pool = availableIngredientsForLevel(world.level)
  const length = recipeLengthForLevel(world.level)
  const order: IngredientKind[] = []
  for (let index = 0; index < length; index += 1) order.push(randomIngredient(world.random, pool, order[index - 1]))
  const maxPatience = clamp(24 + length * 1.2 - (world.level - 1) * .85, 12, 26)
  return {
    id,
    face: customerFaces[id % customerFaces.length],
    name: customerNames[(id * 3 + Math.floor(world.random() * customerNames.length)) % customerNames.length],
    order,
    patience: maxPatience,
    maxPatience,
  }
}

function pushCustomer(world: World) {
  const customer = createCustomer(world)
  world.nextCustomerId += 1
  world.customers.push(customer)
}

function rebuildCustomerQueue(world: World) {
  world.customers = []
  world.skewered = []
  world.combo = 0
  world.comboBest = 1
  world.lastImpaleAt = 0
  while (world.customers.length < 3) pushCustomer(world)
}

function rotateCustomer(world: World) {
  world.customers.shift()
  world.skewered = []
  world.combo = 0
  world.comboBest = 1
  world.lastImpaleAt = 0
  while (world.customers.length < 3) pushCustomer(world)
}

function expectedIngredient(world: World) { return world.customers[0]?.order[world.skewered.length] }

function spawnDrop(world: World, playMaxX: number, hardMaxDrops: number, y = -0.06) {
  const tuning = tuningFor(world.level)
  const maxDrops = Math.min(hardMaxDrops, tuning.maxDrops)
  if (world.drops.length >= maxDrops) return false

  const specialRoll = world.random()
  let kind: DropKind
  if (specialRoll < tuning.bloodChance) kind = 'blood'
  else if (specialRoll < tuning.bloodChance + tuning.garlicChance) kind = 'garlic'
  else {
    const expected = expectedIngredient(world)
    const pool = availableIngredientsForLevel(world.level)
    kind = expected && world.random() < tuning.expectedChance ? expected : randomIngredient(world.random, pool)
  }

  const isRegular = kind !== 'blood' && kind !== 'garlic'
  const goesOblique = world.level >= 2 && world.random() < tuning.obliqueChance
  const direction = world.random() < .5 ? -1 : 1
  const vx = goesOblique ? direction * (.018 + world.random() * (.018 + world.level * .0075)) : 0
  const spins = isRegular && world.random() < tuning.spinChance
  const spin = spins ? (world.random() * 2 - 1) * (55 + world.level * 42) : (world.random() * 2 - 1) * 11

  world.drops.push({
    id: world.nextDropId,
    kind,
    x: DROP_MIN_X + world.random() * Math.max(.08, playMaxX - DROP_MIN_X),
    y,
    speed: tuning.baseSpeed + world.random() * tuning.speedJitter,
    vx,
    sway: (world.random() * 2 - 1) * (.004 + Math.min(world.level, 10) * .0024),
    phase: world.random() * Math.PI * 2,
    rotation: (world.random() * 2 - 1) * 28,
    spin,
  })
  world.nextDropId += 1
  return true
}

function skewerTip(world: Pick<World, 'skewerX' | 'skewerY'>, height: number) {
  return { x: world.skewerX, y: world.skewerY - SKEWER_TIP_OFFSET_PX / Math.max(1, height) }
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abX = bx - ax
  const abY = by - ay
  const lengthSquared = abX * abX + abY * abY
  if (lengthSquared <= .0001) return Math.hypot(px - ax, py - ay)
  const t = clamp(((px - ax) * abX + (py - ay) * abY) / lengthSquared, 0, 1)
  return Math.hypot(px - (ax + abX * t), py - (ay + abY * t))
}

function createWorld(seed: number): World {
  const world: World = {
    drops: [], customers: [], skewered: [], score: 0, served: 0, lost: 0,
    level: 1, levelServed: 0, combo: 0, comboBest: 1, comboToken: 0, lastImpaleAt: 0,
    nextDropId: 1, nextCustomerId: 1, spawnTimer: .48,
    skewerX: .42, skewerY: .83, previousTipX: .42, previousTipY: .63,
    dragging: false, slowTimer: 0, finished: false, random: mulberry32(seed || 1),
    toastText: '', toastTone: 'good', toastToken: 0,
    delivery: null, deliveryToken: 0, juiceImpact: null, juiceToken: 0,
  }
  rebuildCustomerQueue(world)
  for (let index = 0; index < 3; index += 1) spawnDrop(world, DEFAULT_PLAY_MAX_X, 34, -.04 - index * .29)
  return world
}

function snapshot(world: World): RenderState {
  return {
    customers: world.customers.map((customer) => ({ ...customer, order: [...customer.order] })),
    skewered: [...world.skewered], score: world.score, served: world.served, lost: world.lost,
    level: world.level, levelServed: world.levelServed, combo: world.combo, comboBest: world.comboBest, comboToken: world.comboToken,
    dragging: world.dragging, slowTimer: world.slowTimer, finished: world.finished,
    toastText: world.toastText, toastTone: world.toastTone, toastToken: world.toastToken,
    delivery: world.delivery ? { ...world.delivery, order: [...world.delivery.order] } : null,
    juiceImpact: world.juiceImpact ? { ...world.juiceImpact } : null,
  }
}

function dropRenderList(world: World): DropRender[] { return world.drops.map(({ id, kind }) => ({ id, kind })) }
function showToast(world: World, text: string, tone: ToastTone) { world.toastText = text; world.toastTone = tone; world.toastToken += 1 }

function IngredientIcon({ kind, className = '' }: { kind: IngredientKind; className?: string }) {
  const ingredient = ingredientMap.get(kind)
  return <span className={`vlad-ingredient-icon ${className}`} aria-label={ingredient?.label}>{ingredient?.emoji}</span>
}

const DropField = memo(function DropField({ drops, register }: { drops: DropRender[]; register: (id: number, node: HTMLSpanElement | null) => void }) {
  return <main className="vlad-drop-field" aria-label="Ingrédients qui tombent">
    {drops.map((drop) => {
      const regular = drop.kind !== 'blood' && drop.kind !== 'garlic'
      const emoji = regular ? ingredientMap.get(drop.kind as IngredientKind)?.emoji : drop.kind === 'blood' ? '🩸' : '🧄'
      return <span ref={(node) => register(drop.id, node)} className={`vlad-drop is-${drop.kind}`} key={drop.id} aria-hidden="true">{emoji}</span>
    })}
  </main>
})

export function VladsSkewers({ active, seed, restartToken, session }: GameComponentProps) {
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 11, 0x27d4eb2d)) >>> 0, [restartToken, seed])
  const worldRef = useRef<World>(createWorld(runSeed))
  const rootRef = useRef<HTMLDivElement | null>(null)
  const controlRef = useRef<HTMLDivElement | null>(null)
  const customerRef = useRef<HTMLDivElement | null>(null)
  const skewerRef = useRef<HTMLDivElement | null>(null)
  const goreLayerRef = useRef<HTMLDivElement | null>(null)
  const goreBitsRef = useRef<GoreBit[]>([])
  const dropRefs = useRef(new Map<number, HTMLSpanElement>())
  const pointerIdRef = useRef<number | null>(null)
  const sizeRef = useRef<StageSize>({ width: 390, height: 800, playMaxX: DEFAULT_PLAY_MAX_X, hardMaxDrops: 34 })
  const finishTimerRef = useRef<number | null>(null)
  const levelCardTimerRef = useRef<number | null>(null)
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))
  const [dropList, setDropList] = useState<DropRender[]>(() => dropRenderList(worldRef.current))
  const [levelCard, setLevelCard] = useState(1)

  const syncDropList = useCallback(() => setDropList(dropRenderList(worldRef.current)), [])
  const registerDrop = useCallback((id: number, node: HTMLSpanElement | null) => { if (node) dropRefs.current.set(id, node); else dropRefs.current.delete(id) }, [])

  const paintSkewer = useCallback(() => {
    const node = skewerRef.current
    const { width, height } = sizeRef.current
    const world = worldRef.current
    if (node) node.style.transform = `translate3d(${world.skewerX * width}px, ${world.skewerY * height}px, 0) translate(-50%, -100%)`
  }, [])

  const paintDrops = useCallback(() => {
    const { width, height } = sizeRef.current
    for (const drop of worldRef.current.drops) {
      const node = dropRefs.current.get(drop.id)
      if (node) node.style.transform = `translate3d(${drop.x * width}px, ${drop.y * height}px, 0) translate(-50%, -50%) rotate(${drop.rotation}deg)`
    }
  }, [])

  const clearGore = useCallback(() => {
    for (const bit of goreBitsRef.current) bit.node.remove()
    goreBitsRef.current = []
  }, [])

  const spawnGore = useCallback((x: number, y: number, color: string, amount: number, heavy = false) => {
    const layer = goreLayerRef.current
    if (!layer) return
    const world = worldRef.current
    for (let index = 0; index < amount; index += 1) {
      const node = document.createElement('i')
      const chunk = index % (heavy ? 2 : 3) === 0
      node.className = `vlad-gore-bit ${chunk ? 'is-chunk' : 'is-drop'}`
      node.style.setProperty('--gore', color)
      node.style.setProperty('--gore-size', `${chunk ? 7 + Math.round(world.random() * 10) : 4 + Math.round(world.random() * 7)}px`)
      layer.appendChild(node)
      const angle = (-Math.PI * .9) + world.random() * Math.PI * .8
      const power = (heavy ? .22 : .18) + world.random() * (heavy ? .18 : .15)
      goreBitsRef.current.push({
        node,
        x,
        y,
        vx: Math.cos(angle) * power + (world.random() - .5) * .06,
        vy: Math.sin(angle) * power - .05 - world.random() * .06,
        gravity: .48 + world.random() * .18,
        rotation: world.random() * 180,
        spin: (world.random() - .5) * 520,
        age: 0,
        ttl: 3.4 + world.random() * 1.2,
      })
    }
    while (goreBitsRef.current.length > MAX_GORE_BITS) {
      const oldest = goreBitsRef.current.shift()
      oldest?.node.remove()
    }
  }, [])

  const animateGore = useCallback((dt: number, slowFactor: number, tuning: LevelTuning) => {
    const { width, height } = sizeRef.current
    const survivors: GoreBit[] = []
    for (const bit of goreBitsRef.current) {
      bit.age += dt
      bit.vy += bit.gravity * dt * slowFactor
      bit.vx *= Math.pow(.985, dt * 60)
      bit.x += bit.vx * dt * slowFactor
      bit.y += (bit.vy + tuning.baseSpeed * .24) * dt * slowFactor
      bit.rotation += bit.spin * dt * slowFactor
      bit.node.style.transform = `translate3d(${bit.x * width}px, ${bit.y * height}px, 0) translate(-50%, -50%) rotate(${bit.rotation}deg)`
      if (bit.y < 1.12 && bit.age < bit.ttl) survivors.push(bit)
      else bit.node.remove()
    }
    goreBitsRef.current = survivors
  }, [])

  const releasePointer = useCallback(() => {
    const pointerId = pointerIdRef.current
    const control = controlRef.current
    if (pointerId !== null && control?.hasPointerCapture(pointerId)) control.releasePointerCapture(pointerId)
    pointerIdRef.current = null
    worldRef.current.dragging = false
  }, [])

  const finishRun = useCallback(() => {
    const world = worldRef.current
    if (world.finished) return
    world.finished = true
    world.dragging = false
    showToast(world, 'SERVICE TERMINÉ', 'bad')
    setView(snapshot(world))
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    finishTimerRef.current = window.setTimeout(() => {
      session.finish({ score: world.score, metadata: { clientsServed: world.served, clientsLost: world.lost, level: world.level } })
    }, 520)
  }, [session])

  const moveSkewerTo = useCallback((clientX: number, clientY: number) => {
    const root = rootRef.current
    const control = controlRef.current
    const world = worldRef.current
    if (!root || !control || !active || world.finished || !world.dragging) return
    const rootRect = root.getBoundingClientRect()
    const controlRect = control.getBoundingClientRect()
    const x = clamp(clientX, rootRect.left + 14, rootRect.right - 12)
    const y = clamp(clientY, controlRect.top, controlRect.bottom)
    world.skewerX = (x - rootRect.left) / Math.max(1, rootRect.width)
    world.skewerY = (y - rootRect.top) / Math.max(1, rootRect.height)
    paintSkewer()
  }, [active, paintSkewer])

  useEffect(() => {
    releasePointer()
    clearGore()
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    worldRef.current = createWorld(runSeed)
    setView(snapshot(worldRef.current))
    setDropList(dropRenderList(worldRef.current))
    session.setScore(0)
    requestAnimationFrame(() => { paintSkewer(); paintDrops() })
  }, [clearGore, paintDrops, paintSkewer, releasePointer, runSeed, session])

  useEffect(() => () => {
    releasePointer()
    clearGore()
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    if (levelCardTimerRef.current !== null) window.clearTimeout(levelCardTimerRef.current)
  }, [clearGore, releasePointer])

  useEffect(() => { if (!active) releasePointer() }, [active, releasePointer])

  useEffect(() => {
    setLevelCard(view.level)
    if (levelCardTimerRef.current !== null) window.clearTimeout(levelCardTimerRef.current)
    levelCardTimerRef.current = window.setTimeout(() => setLevelCard(0), LEVEL_CARD_MS)
  }, [restartToken, view.level])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const updateSize = () => {
      const rect = root.getBoundingClientRect()
      const railWidth = customerRef.current?.closest('.vlad-client-rail')?.getBoundingClientRect().width ?? 118
      const width = Math.max(1, rect.width)
      sizeRef.current = { width, height: Math.max(1, rect.height), playMaxX: clamp(1 - (railWidth + 24) / width, .66, .82), hardMaxDrops: width <= 520 ? 34 : 42 }
      paintSkewer(); paintDrops()
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(root)
    return () => observer.disconnect()
  }, [paintDrops, paintSkewer])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId || !worldRef.current.dragging) return
      event.preventDefault()
      moveSkewerTo(event.clientX, event.clientY)
    }
    const onEnd = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return
      releasePointer(); setView(snapshot(worldRef.current))
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onEnd, { passive: false })
    window.addEventListener('pointercancel', onEnd, { passive: false })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
    }
  }, [moveSkewerTo, releasePointer])

  useEffect(() => {
    if (!active || worldRef.current.finished) return
    let frame = 0
    let previous = performance.now()
    let uiAccumulator = 0

    const loseCurrentCustomer = (reason: LoseReason) => {
      const world = worldRef.current
      world.lost += 1
      showToast(world, reason === 'garlic' ? 'AIL ! VLAD DÉTESTE ÇA' : reason === 'extra' ? 'TROP D’INGRÉDIENTS' : reason === 'wrong' ? 'MAUVAISE BROCHETTE' : 'CLIENT PERDU', 'bad')
      rotateCustomer(world)
      setView(snapshot(world))
      if (world.lost >= MAX_LOST) finishRun()
    }

    const splash = (drop: FallingDrop, kind: IngredientKind) => {
      const spec = ingredientMap.get(kind)
      if (!spec) return
      const world = worldRef.current
      world.juiceToken += 1
      world.juiceImpact = { token: world.juiceToken, x: drop.x, y: drop.y, color: spec.juice, kind, word: pick(world.random, impactWords), cry: pick(world.random, cries[kind]) }
      spawnGore(drop.x, drop.y, spec.juice, kind === 'meat' ? 13 : 10, kind === 'meat')
    }

    const catchDrop = (drop: FallingDrop) => {
      const world = worldRef.current
      world.drops = world.drops.filter((candidate) => candidate.id !== drop.id)
      dropRefs.current.delete(drop.id)
      syncDropList()

      if (drop.kind === 'blood') {
        const customer = world.customers[0]
        if (customer) customer.patience = Math.min(customer.maxPatience, customer.patience + 5.5)
        world.slowTimer = Math.max(world.slowTimer, 3.8)
        spawnGore(drop.x, drop.y, '#dc1738', 16, true)
        showToast(world, '🩸 SANG FROID · RALENTI', 'bonus')
        setView(snapshot(world))
        return
      }
      if (drop.kind === 'garlic') { loseCurrentCustomer('garlic'); return }

      splash(drop, drop.kind)
      const customer = world.customers[0]
      const expected = customer?.order[world.skewered.length]
      if (!customer) return
      if (world.skewered.length >= customer.order.length) { loseCurrentCustomer('extra'); return }
      if (drop.kind !== expected) { loseCurrentCustomer('wrong'); return }

      const now = performance.now()
      world.combo = world.lastImpaleAt > 0 && now - world.lastImpaleAt <= COMBO_WINDOW_MS ? Math.min(6, world.combo + 1) : 1
      world.comboBest = Math.max(world.comboBest, world.combo)
      world.comboToken += 1
      world.lastImpaleAt = now
      world.skewered.push(drop.kind)
      showToast(world, world.skewered.length < customer.order.length ? `${world.skewered.length}/${customer.order.length}` : 'BROCHETTE PRÊTE · AU CLIENT →', 'good')
      setView(snapshot(world))
    }

    const serveCurrentCustomer = () => {
      const world = worldRef.current
      const customer = world.customers[0]
      if (!customer || world.skewered.length !== customer.order.length) return false

      const base = skewerBasePoints(customer.order.length)
      const multiplier = Math.max(1, world.comboBest)
      const earned = base * multiplier
      world.score += earned
      world.served += 1
      world.levelServed += 1
      world.deliveryToken += 1
      world.delivery = { token: world.deliveryToken, x: world.skewerX, y: world.skewerY, face: customer.face, order: [...customer.order] }
      const finishedLevel = world.levelServed >= clientsForLevel(world.level)
      showToast(world, `SERVI · +${earned}${multiplier > 1 ? ` · ×${multiplier}` : ''}`, multiplier > 1 ? 'bonus' : 'good')

      if (finishedLevel) {
        world.level += 1
        world.levelServed = 0
        world.drops = []
        dropRefs.current.clear()
        rebuildCustomerQueue(world)
        const tuning = tuningFor(world.level)
        const seedDrops = Math.min(5, 2 + Math.floor(world.level / 2))
        for (let index = 0; index < seedDrops; index += 1) spawnDrop(world, sizeRef.current.playMaxX, sizeRef.current.hardMaxDrops, -.04 - index * Math.max(.09, .24 - world.level * .012))
        world.spawnTimer = tuning.gap * .75
        syncDropList()
      } else {
        rotateCustomer(world)
      }

      session.setScore(world.score)
      setView(snapshot(world))
      return true
    }

    const animate = (now: number) => {
      const world = worldRef.current
      const dt = Math.min(.05, Math.max(0, (now - previous) / 1000))
      previous = now

      if (!world.finished) {
        const activeCustomer = world.customers[0]
        if (activeCustomer) {
          activeCustomer.patience = Math.max(0, activeCustomer.patience - dt)
          if (activeCustomer.patience <= 0) loseCurrentCustomer('patience')
        }

        if (!world.finished) {
          const { width, height, playMaxX, hardMaxDrops } = sizeRef.current
          world.slowTimer = Math.max(0, world.slowTimer - dt)
          const slowFactor = world.slowTimer > 0 ? .46 : 1
          const tuning = tuningFor(world.level)

          if (world.combo >= 2 && world.lastImpaleAt > 0 && now - world.lastImpaleAt > COMBO_WINDOW_MS) {
            world.combo = 0
            world.comboToken += 1
            setView(snapshot(world))
          }

          world.spawnTimer -= dt
          if (world.spawnTimer <= 0) {
            let burst = 1
            if (world.random() < tuning.secondBurstChance) burst += 1
            if (world.random() < tuning.thirdBurstChance) burst += 1
            let changed = false
            for (let index = 0; index < burst; index += 1) changed = spawnDrop(world, playMaxX, hardMaxDrops, -.055 - index * .045) || changed
            if (changed) syncDropList()
            world.spawnTimer = tuning.gap + world.random() * tuning.gapJitter
          }

          for (const drop of world.drops) {
            drop.y += drop.speed * slowFactor * dt
            drop.phase += dt * (1.55 + drop.speed * 4.4)
            drop.x += (drop.vx + Math.sin(drop.phase) * drop.sway) * slowFactor * dt
            if (drop.x <= DROP_MIN_X) { drop.x = DROP_MIN_X; drop.vx = Math.abs(drop.vx) }
            else if (drop.x >= playMaxX) { drop.x = playMaxX; drop.vx = -Math.abs(drop.vx) }
            drop.rotation += drop.spin * slowFactor * dt
          }
          const before = world.drops.length
          world.drops = world.drops.filter((drop) => drop.y < 1.03)
          if (world.drops.length !== before) syncDropList()
          paintDrops()
          animateGore(dt, slowFactor, tuning)

          const tip = skewerTip(world, height)
          if (world.dragging) {
            const rootRect = rootRef.current?.getBoundingClientRect()
            const customerRect = customerRef.current?.getBoundingClientRect()
            const customer = world.customers[0]
            const ready = Boolean(customer && world.skewered.length === customer.order.length)
            let served = false

            if (ready && rootRect && customerRect) {
              const tipViewportX = rootRect.left + tip.x * width
              const tipViewportY = rootRect.top + tip.y * height
              const insideCustomer = tipViewportX >= customerRect.left - DELIVERY_PAD_PX
                && tipViewportX <= customerRect.right + DELIVERY_PAD_PX
                && tipViewportY >= customerRect.top - DELIVERY_PAD_PX
                && tipViewportY <= customerRect.bottom + DELIVERY_PAD_PX
              if (insideCustomer) served = serveCurrentCustomer()
            }

            if (!served && world.drops.length > 0) {
              let target: FallingDrop | null = null
              let targetDistance = Number.POSITIVE_INFINITY
              const ax = world.previousTipX * width, ay = world.previousTipY * height
              const bx = tip.x * width, by = tip.y * height
              for (const drop of world.drops) {
                const distance = distanceToSegment(drop.x * width, drop.y * height, ax, ay, bx, by)
                if (distance <= TIP_HIT_RADIUS_PX && distance < targetDistance) { target = drop; targetDistance = distance }
              }
              if (target) catchDrop(target)
            }
          }
          world.previousTipX = tip.x
          world.previousTipY = tip.y
        }

        uiAccumulator += dt
        if (uiAccumulator >= UI_REFRESH_SECONDS) { uiAccumulator = 0; setView(snapshot(world)) }
      }
      if (!world.finished) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, animateGore, finishRun, paintDrops, session, spawnGore, syncDropList])

  const activeCustomer = view.customers[0]
  const orderReady = Boolean(activeCustomer && view.skewered.length === activeCustomer.order.length)
  const waitingCustomers = [...view.customers.slice(1)].reverse()
  const levelIngredients = availableIngredientsForLevel(view.level)
  const clientsTarget = clientsForLevel(view.level)

  return <div ref={rootRef} className={`vlad-game ${view.slowTimer > 0 ? 'is-slowed' : ''} ${orderReady ? 'is-ready-to-serve' : ''}`}>
    <div className="vlad-bg" aria-hidden="true" />
    <div className="vlad-fire" aria-hidden="true"><i /><i /><i /><i /></div>
    <div ref={goreLayerRef} className="vlad-gore-rain" aria-hidden="true" />

    <aside className="vlad-client-rail" aria-label="Clients et commandes">
      <div className="vlad-rail-label">N{view.level} · {view.levelServed}/{clientsTarget} ↓</div>
      <div className="vlad-waiting-clients" aria-label="Clients suivants">
        {waitingCustomers.map((customer) => <div className="vlad-client is-waiting" key={customer.id}>
          <div className="vlad-client-head"><span className="vlad-face">{customer.face}</span><strong>{customer.name}</strong></div>
          <div className="vlad-order">{customer.order.map((kind, index) => <IngredientIcon key={`${customer.id}-${index}`} kind={kind} />)}</div>
        </div>)}
      </div>
      {activeCustomer && <div className="vlad-active-row">
        <div className="vlad-lost" aria-label={`${MAX_LOST - view.lost} erreurs restantes`}>
          {Array.from({ length: MAX_LOST }, (_, index) => <span key={index} className={index < view.lost ? 'is-lost' : ''}>☠</span>)}
        </div>
        <div ref={customerRef} className={`vlad-client is-active ${orderReady ? 'is-ready' : ''}`} key={activeCustomer.id}>
          <div className="vlad-client-head"><span className="vlad-face">{activeCustomer.face}</span><strong>{activeCustomer.name}</strong></div>
          <div className="vlad-order">{activeCustomer.order.map((kind, index) => <IngredientIcon key={`${activeCustomer.id}-${index}`} kind={kind} className={index < view.skewered.length ? 'is-done' : index === view.skewered.length ? 'is-next' : ''} />)}</div>
          <div className="vlad-patience"><i style={{ width: `${clamp(activeCustomer.patience / activeCustomer.maxPatience, 0, 1) * 100}%` }} /></div>
          <div className="vlad-serve-target">{orderReady ? '→ DONNE-LUI' : 'À SERVIR'}</div>
        </div>
      </div>}
    </aside>

    <DropField drops={dropList} register={registerDrop} />

    {view.juiceImpact && <div className={`vlad-impact is-${view.juiceImpact.kind}`} key={view.juiceImpact.token} style={{ left: `${view.juiceImpact.x * 100}%`, top: `${view.juiceImpact.y * 100}%`, '--juice': view.juiceImpact.color } as CSSProperties} aria-hidden="true">
      <span className="vlad-impact-ring" /><span className="vlad-impact-core" /><span className="vlad-impact-slash" />
      <strong>{view.juiceImpact.word}</strong><em>{view.juiceImpact.cry}</em>
      {impactParticles.map(([dx, dy, w, h, rot], index) => <i key={index} style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, '--pw': `${w}px`, '--ph': `${h}px`, '--pr': `${rot}deg` } as CSSProperties} />)}
    </div>}

    <div ref={skewerRef} className={`vlad-skewer ${view.dragging ? 'is-held' : ''} ${orderReady ? 'is-loaded' : ''}`} aria-hidden="true">
      <div className="vlad-skewer-metal"><i /></div><span className="vlad-tip-marker" />
      <div className="vlad-skewered-stack">{view.skewered.map((kind, index) => <IngredientIcon key={`${kind}-${index}`} kind={kind} />)}</div>
      {view.combo >= 2 && <div className="vlad-combo" key={view.comboToken}>×{view.combo}</div>}
      <div className="vlad-hand">✊🏻</div>
    </div>

    <div className="vlad-control-boundary" aria-hidden="true" />
    <div ref={controlRef} className="vlad-control-zone" onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
      if (!active || worldRef.current.finished) return
      event.preventDefault(); pointerIdRef.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); worldRef.current.dragging = true
      moveSkewerTo(event.clientX, event.clientY)
      const tip = skewerTip(worldRef.current, sizeRef.current.height)
      worldRef.current.previousTipX = tip.x; worldRef.current.previousTipY = tip.y
      setView(snapshot(worldRef.current))
    }} aria-label="Zone de contrôle de la brochette" />

    {levelCard > 0 && <div className="vlad-level-card vlad-level-card-v6" key={`${restartToken}-${levelCard}`} aria-hidden="true">
      <strong>NIVEAU {levelCard}</strong>
      <div className="vlad-level-ingredients">{availableIngredientsForLevel(levelCard).map((ingredient) => <span key={ingredient.kind}>{ingredient.emoji}</span>)}</div>
      <span>— {clientsForLevel(levelCard)} CLIENTS —</span>
    </div>}

    {view.toastText && <div className={`vlad-toast is-${view.toastTone}`} key={view.toastToken} aria-hidden="true">{view.toastText}</div>}
    {view.delivery && <div className="vlad-delivery" key={view.delivery.token} style={{ '--delivery-x': `${view.delivery.x * 100}%`, '--delivery-y': `${view.delivery.y * 100}%` } as CSSProperties} aria-hidden="true">
      <div className="vlad-delivery-stick">{view.delivery.order.map((kind, index) => <IngredientIcon kind={kind} key={`${view.delivery?.token}-${index}`} />)}</div><span className="vlad-delivery-face">{view.delivery.face}</span>
    </div>}
    {view.slowTimer > 0 && <div className="vlad-blood-bonus" aria-hidden="true">SANG FROID</div>}
    <div className="vlad-legend" aria-hidden="true"><span>🩸 +TEMPS · RALENTIT</span><span>🧄 À ÉVITER</span></div>
    {view.finished && <div className="vlad-ending" aria-hidden="true"><strong>VLAD FERME LE GRILL</strong><span>{view.served} client{view.served === 1 ? '' : 's'} servi{view.served === 1 ? '' : 's'} · niveau {view.level}</span></div>}
  </div>
}
