import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './VladsSkewers.css'
import './VladsSkewers.perf.css'
import './VladsSkewers.v4.css'

type IngredientKind = 'meat' | 'tomato' | 'pepper' | 'onion' | 'mushroom' | 'zucchini'
type DropKind = IngredientKind | 'blood' | 'garlic'
type ToastTone = 'good' | 'bad' | 'bonus'
type LoseReason = 'wrong' | 'extra' | 'garlic' | 'patience'

type IngredientSpec = { kind: IngredientKind; emoji: string; label: string; juice: string }
type FallingDrop = { id: number; kind: DropKind; x: number; y: number; speed: number; vx: number; sway: number; phase: number; rotation: number; spin: number }
type DropRender = Pick<FallingDrop, 'id' | 'kind'>
type Customer = { id: number; face: string; name: string; order: IngredientKind[]; patience: number; maxPatience: number }
type Delivery = { token: number; x: number; y: number; face: string; order: IngredientKind[] }
type JuiceImpact = { token: number; x: number; y: number; color: string; kind: IngredientKind; word: string; cry: string }

type World = {
  drops: FallingDrop[]
  customers: Customer[]
  skewered: IngredientKind[]
  score: number
  served: number
  lost: number
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
  served: number
  lost: number
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

const ingredients: IngredientSpec[] = [
  { kind: 'meat', emoji: '🥩', label: 'viande', juice: '#d72f2a' },
  { kind: 'tomato', emoji: '🍅', label: 'tomate', juice: '#ff3b25' },
  { kind: 'pepper', emoji: '🫑', label: 'poivron', juice: '#6bd039' },
  { kind: 'onion', emoji: '🧅', label: 'oignon', juice: '#cd72c7' },
  { kind: 'mushroom', emoji: '🍄', label: 'champignon', juice: '#e4b84e' },
  { kind: 'zucchini', emoji: '🥒', label: 'courgette', juice: '#94c92f' },
]

const ingredientMap = new Map<IngredientKind, IngredientSpec>(ingredients.map((ingredient) => [ingredient.kind, ingredient]))
const customerFaces = ['👩🏻', '👨🏽', '👵🏻', '🧔🏾', '👩🏼‍🦰', '👨🏻‍🦱', '👸🏽', '🧙🏻']
const customerNames = ['Mira', 'Igor', 'Nadia', 'Boris', 'Elena', 'Dragomir', 'Ilona', 'Radu', 'Sorina', 'Mihai']

const impactWords = [
  'SCHLAAAK!', 'SPLOUATCH!', 'KRRRSH!', 'SCHLOP!', 'GLURPSH!',
  'TCHLAAK!', 'SPLOK!', 'KRRATCH!', 'PLOUFSH!', 'SKRUNCH!',
  'SPLORTCH!', 'CHLAAAF!', 'GLOP!', 'SKLOUITCH!', 'FROUATCH!',
]

const cries: Record<IngredientKind, string[]> = {
  meat: ['AAAAARGH !', 'PAS LA POINTE !', 'NOOOON !', 'J’ÉTAIS TENDRE !', 'MAMAN !', 'PAS ENCORE !'],
  tomato: ['MA PEAU !', 'J’ÉTAIS BIO !', 'NOOOON !', 'MON JUS !', 'AÏÏÏE !'],
  pepper: ['PAS LE PÉDONCULE !', 'JE PIQUE DÉJÀ !', 'AAAAH !', 'POURQUOI MOI ?!', 'NOOOON !'],
  onion: ['TU VAS PLEURER !', 'MES COUCHES !', 'AAAAAÏE !', 'SANS PITIÉ !', 'NOOOON !'],
  mushroom: ['JE SUIS UN CHAMPIGNON !', 'PAS LE CHAPEAU !', 'HIIIIII !', 'MA TIGE !', 'NOOOON !'],
  zucchini: ['JE SUIS UNE COURGETTE !', 'PAS EN LONG !', 'AAAAARGH !', 'MA PEAU VERTE !', 'NOOOON !'],
}

const impactParticles = [
  [-58, -34, 13, 8, -24], [61, -31, 9, 15, 22], [-48, 31, 12, 10, 35], [58, 38, 15, 8, -12],
  [-14, -66, 9, 17, 8], [19, -73, 7, 20, -16], [-72, 3, 15, 7, 16], [76, 8, 17, 8, -28],
  [-31, 58, 9, 14, 25], [30, 66, 12, 10, -20], [-88, -22, 8, 8, 0], [91, -9, 9, 9, 0],
  [-5, 83, 8, 12, 10], [46, -54, 8, 10, 30], [-55, -60, 7, 11, -18], [72, 54, 8, 14, 18],
] as const

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

function pick<T>(random: () => number, values: readonly T[]) { return values[Math.floor(random() * values.length)] }

function randomIngredient(random: () => number, previous?: IngredientKind) {
  let candidate = ingredients[Math.floor(random() * ingredients.length)].kind
  if (previous && candidate === previous && random() < 0.72) {
    candidate = ingredients[(ingredients.findIndex((item) => item.kind === candidate) + 1 + Math.floor(random() * (ingredients.length - 1))) % ingredients.length].kind
  }
  return candidate
}

function levelForServed(served: number) { return Math.min(7, 1 + Math.floor(served / 3)) }

function tuningFor(level: number): LevelTuning {
  const table: LevelTuning[] = [
    { maxDrops: 7, baseSpeed: .082, speedJitter: .032, gap: 1.12, gapJitter: .32, obliqueChance: .00, spinChance: .05, secondBurstChance: 0, thirdBurstChance: 0, expectedChance: .58, bloodChance: .018, garlicChance: 0 },
    { maxDrops: 10, baseSpeed: .094, speedJitter: .036, gap: .94, gapJitter: .28, obliqueChance: .05, spinChance: .12, secondBurstChance: 0, thirdBurstChance: 0, expectedChance: .55, bloodChance: .028, garlicChance: .012 },
    { maxDrops: 14, baseSpeed: .108, speedJitter: .042, gap: .78, gapJitter: .23, obliqueChance: .13, spinChance: .26, secondBurstChance: .06, thirdBurstChance: 0, expectedChance: .51, bloodChance: .038, garlicChance: .024 },
    { maxDrops: 19, baseSpeed: .128, speedJitter: .048, gap: .62, gapJitter: .19, obliqueChance: .26, spinChance: .42, secondBurstChance: .18, thirdBurstChance: 0, expectedChance: .47, bloodChance: .048, garlicChance: .038 },
    { maxDrops: 25, baseSpeed: .153, speedJitter: .055, gap: .48, gapJitter: .15, obliqueChance: .42, spinChance: .58, secondBurstChance: .31, thirdBurstChance: .06, expectedChance: .42, bloodChance: .06, garlicChance: .052 },
    { maxDrops: 31, baseSpeed: .184, speedJitter: .062, gap: .35, gapJitter: .11, obliqueChance: .58, spinChance: .72, secondBurstChance: .48, thirdBurstChance: .17, expectedChance: .37, bloodChance: .072, garlicChance: .067 },
    { maxDrops: 36, baseSpeed: .218, speedJitter: .072, gap: .24, gapJitter: .08, obliqueChance: .72, spinChance: .82, secondBurstChance: .65, thirdBurstChance: .34, expectedChance: .33, bloodChance: .085, garlicChance: .082 },
  ]
  return table[Math.max(0, Math.min(table.length - 1, level - 1))]
}

function orderLength(served: number, random: () => number) {
  const level = levelForServed(served)
  if (level === 1) return 2
  if (level === 2) return random() < .7 ? 2 : 3
  if (level === 3) return 3
  if (level === 4) return random() < .65 ? 3 : 4
  if (level === 5) return random() < .5 ? 4 : 5
  if (level === 6) return random() < .72 ? 5 : 6
  return random() < .35 ? 5 : 6
}

function createCustomer(world: Pick<World, 'random' | 'nextCustomerId' | 'served'>): Customer {
  const id = world.nextCustomerId
  const level = levelForServed(world.served)
  const length = orderLength(world.served, world.random)
  const order: IngredientKind[] = []
  for (let index = 0; index < length; index += 1) order.push(randomIngredient(world.random, order[index - 1]))
  const maxPatience = clamp(22 + length * 1.15 - (level - 1) * 1.35, 12, 25)
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

function expectedIngredient(world: World) { return world.customers[0]?.order[world.skewered.length] }

function spawnDrop(world: World, playMaxX: number, hardMaxDrops: number, y = -0.06) {
  const level = levelForServed(world.served)
  const tuning = tuningFor(level)
  const maxDrops = Math.min(hardMaxDrops, tuning.maxDrops)
  if (world.drops.length >= maxDrops) return false

  const specialRoll = world.random()
  let kind: DropKind
  if (specialRoll < tuning.bloodChance) kind = 'blood'
  else if (specialRoll < tuning.bloodChance + tuning.garlicChance) kind = 'garlic'
  else {
    const expected = expectedIngredient(world)
    kind = expected && world.random() < tuning.expectedChance ? expected : randomIngredient(world.random)
  }

  const isRegular = kind !== 'blood' && kind !== 'garlic'
  const goesOblique = level >= 2 && world.random() < tuning.obliqueChance
  const direction = world.random() < .5 ? -1 : 1
  const vx = goesOblique ? direction * (.018 + world.random() * (.018 + level * .008)) : 0
  const spins = isRegular && world.random() < tuning.spinChance
  const spin = spins ? (world.random() * 2 - 1) * (55 + level * 45) : (world.random() * 2 - 1) * 12

  world.drops.push({
    id: world.nextDropId,
    kind,
    x: DROP_MIN_X + world.random() * Math.max(.08, playMaxX - DROP_MIN_X),
    y,
    speed: tuning.baseSpeed + world.random() * tuning.speedJitter,
    vx,
    sway: (world.random() * 2 - 1) * (.004 + level * .0025),
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
    nextDropId: 1, nextCustomerId: 1, spawnTimer: .45,
    skewerX: .42, skewerY: .83, previousTipX: .42, previousTipY: .63,
    dragging: false, slowTimer: 0, finished: false, random: mulberry32(seed || 1),
    toastText: '', toastTone: 'good', toastToken: 0,
    delivery: null, deliveryToken: 0, juiceImpact: null, juiceToken: 0,
  }
  pushCustomer(world)
  pushCustomer(world)
  pushCustomer(world)
  for (let index = 0; index < 3; index += 1) spawnDrop(world, DEFAULT_PLAY_MAX_X, 34, -.04 - index * .28)
  return world
}

function snapshot(world: World): RenderState {
  return {
    customers: world.customers.map((customer) => ({ ...customer, order: [...customer.order] })),
    skewered: [...world.skewered], served: world.served, lost: world.lost,
    dragging: world.dragging, slowTimer: world.slowTimer, finished: world.finished,
    toastText: world.toastText, toastTone: world.toastTone, toastToken: world.toastToken,
    delivery: world.delivery ? { ...world.delivery, order: [...world.delivery.order] } : null,
    juiceImpact: world.juiceImpact ? { ...world.juiceImpact } : null,
  }
}

function dropRenderList(world: World): DropRender[] { return world.drops.map(({ id, kind }) => ({ id, kind })) }
function showToast(world: World, text: string, tone: ToastTone) { world.toastText = text; world.toastTone = tone; world.toastToken += 1 }
function rotateCustomer(world: World) { world.customers.shift(); world.skewered = []; while (world.customers.length < 3) pushCustomer(world) }

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
  const dropRefs = useRef(new Map<number, HTMLSpanElement>())
  const pointerIdRef = useRef<number | null>(null)
  const sizeRef = useRef<StageSize>({ width: 390, height: 800, playMaxX: DEFAULT_PLAY_MAX_X, hardMaxDrops: 34 })
  const finishTimerRef = useRef<number | null>(null)
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))
  const [dropList, setDropList] = useState<DropRender[]>(() => dropRenderList(worldRef.current))
  const [hasControlled, setHasControlled] = useState(false)

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
      session.finish({ score: world.score, metadata: { clientsServed: world.served, clientsLost: world.lost } })
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
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    worldRef.current = createWorld(runSeed)
    setView(snapshot(worldRef.current))
    setDropList(dropRenderList(worldRef.current))
    setHasControlled(false)
    session.setScore(0)
    requestAnimationFrame(() => { paintSkewer(); paintDrops() })
  }, [paintDrops, paintSkewer, releasePointer, runSeed, session])

  useEffect(() => () => { releasePointer(); if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current) }, [releasePointer])
  useEffect(() => { if (!active) releasePointer() }, [active, releasePointer])

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
      showToast(world,
        reason === 'garlic' ? 'AIL ! VLAD DÉTESTE ÇA' : reason === 'extra' ? 'TROP D’INGRÉDIENTS' : reason === 'wrong' ? 'MAUVAISE BROCHETTE' : 'CLIENT PERDU',
        'bad')
      rotateCustomer(world)
      setView(snapshot(world))
      if (world.lost >= MAX_LOST) finishRun()
    }

    const splash = (drop: FallingDrop, kind: IngredientKind) => {
      const spec = ingredientMap.get(kind)
      if (!spec) return
      const world = worldRef.current
      world.juiceToken += 1
      world.juiceImpact = {
        token: world.juiceToken, x: drop.x, y: drop.y, color: spec.juice, kind,
        word: pick(world.random, impactWords), cry: pick(world.random, cries[kind]),
      }
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

      world.skewered.push(drop.kind)
      showToast(world, world.skewered.length < customer.order.length ? `${world.skewered.length}/${customer.order.length}` : 'BROCHETTE PRÊTE · AU CLIENT →', 'good')
      setView(snapshot(world))
    }

    const serveCurrentCustomer = () => {
      const world = worldRef.current
      const customer = world.customers[0]
      if (!customer || world.skewered.length !== customer.order.length) return false
      const previousLevel = levelForServed(world.served)
      world.score += customer.order.length
      world.served += 1
      world.deliveryToken += 1
      world.delivery = { token: world.deliveryToken, x: world.skewerX, y: world.skewerY, face: customer.face, order: [...customer.order] }
      const nextLevel = levelForServed(world.served)
      showToast(world, nextLevel > previousLevel ? `SERVICE ${nextLevel} · ÇA S’ACCÉLÈRE` : `SERVI · +${customer.order.length}`, nextLevel > previousLevel ? 'bonus' : 'good')
      rotateCustomer(world)
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
          const level = levelForServed(world.served)
          const tuning = tuningFor(level)

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
  }, [active, finishRun, paintDrops, session, syncDropList])

  const activeCustomer = view.customers[0]
  const orderReady = Boolean(activeCustomer && view.skewered.length === activeCustomer.order.length)
  const waitingCustomers = [...view.customers.slice(1)].reverse()

  return <div ref={rootRef} className={`vlad-game ${view.slowTimer > 0 ? 'is-slowed' : ''} ${orderReady ? 'is-ready-to-serve' : ''}`}>
    <div className="vlad-bg" aria-hidden="true" />
    <div className="vlad-fire" aria-hidden="true"><i /><i /><i /><i /></div>

    <aside className="vlad-client-rail" aria-label="Clients et commandes">
      <div className="vlad-rail-label">FILE ↓</div>
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
      <div className="vlad-hand">✊🏻</div>
    </div>

    <div className="vlad-control-boundary" aria-hidden="true">{!hasControlled && <span>GLISSE ICI · LA POINTE DORÉE EST LA HITBOX</span>}</div>
    <div ref={controlRef} className="vlad-control-zone" onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
      if (!active || worldRef.current.finished) return
      event.preventDefault(); pointerIdRef.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); worldRef.current.dragging = true
      moveSkewerTo(event.clientX, event.clientY)
      const tip = skewerTip(worldRef.current, sizeRef.current.height)
      worldRef.current.previousTipX = tip.x; worldRef.current.previousTipY = tip.y
      setHasControlled(true); setView(snapshot(worldRef.current))
    }} aria-label="Zone de contrôle de la brochette" />

    {view.toastText && <div className={`vlad-toast is-${view.toastTone}`} key={view.toastToken} aria-hidden="true">{view.toastText}</div>}
    {view.delivery && <div className="vlad-delivery" key={view.delivery.token} style={{ '--delivery-x': `${view.delivery.x * 100}%`, '--delivery-y': `${view.delivery.y * 100}%` } as CSSProperties} aria-hidden="true">
      <div className="vlad-delivery-stick">{view.delivery.order.map((kind, index) => <IngredientIcon kind={kind} key={`${view.delivery?.token}-${index}`} />)}</div><span className="vlad-delivery-face">{view.delivery.face}</span>
    </div>}
    {view.slowTimer > 0 && <div className="vlad-blood-bonus" aria-hidden="true">SANG FROID</div>}
    <div className="vlad-legend" aria-hidden="true"><span>🩸 +TEMPS · RALENTIT</span><span>🧄 À ÉVITER</span></div>
    {view.finished && <div className="vlad-ending" aria-hidden="true"><strong>VLAD FERME LE GRILL</strong><span>{view.served} client{view.served === 1 ? '' : 's'} servi{view.served === 1 ? '' : 's'}</span></div>}
  </div>
}
