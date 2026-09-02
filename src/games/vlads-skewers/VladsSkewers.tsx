import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './VladsSkewers.css'

type IngredientKind = 'meat' | 'tomato' | 'pepper' | 'onion' | 'mushroom' | 'zucchini'
type DropKind = IngredientKind | 'blood' | 'garlic'
type ToastTone = 'good' | 'bad' | 'bonus'
type EndReason = 'three-lost'
type LoseReason = 'wrong' | 'extra' | 'garlic' | 'patience'

type IngredientSpec = {
  kind: IngredientKind
  emoji: string
  label: string
  juice: string
}

type FallingDrop = {
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
}

type Customer = {
  id: number
  face: string
  name: string
  order: IngredientKind[]
  patience: number
  maxPatience: number
}

type Delivery = {
  token: number
  x: number
  y: number
  face: string
  order: IngredientKind[]
}

type JuiceImpact = {
  token: number
  x: number
  y: number
  color: string
}

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
  endReason: EndReason | null
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
  drops: FallingDrop[]
  customers: Customer[]
  skewered: IngredientKind[]
  score: number
  served: number
  lost: number
  skewerX: number
  skewerY: number
  dragging: boolean
  slowTimer: number
  finished: boolean
  endReason: EndReason | null
  toastText: string
  toastTone: ToastTone
  toastToken: number
  delivery: Delivery | null
  juiceImpact: JuiceImpact | null
}

type StageSize = {
  width: number
  height: number
  playMaxX: number
}

const MAX_LOST = 3
const SKEWER_HEIGHT_PX = 154
const SKEWER_TIP_OVERHANG_PX = 6
const SKEWER_TIP_OFFSET_PX = SKEWER_HEIGHT_PX + SKEWER_TIP_OVERHANG_PX
const TIP_HIT_RADIUS_PX = 18
const DROP_MIN_X = 0.055
const DEFAULT_PLAY_MAX_X = 0.74
const DELIVERY_PAD_PX = 7

const ingredients: IngredientSpec[] = [
  { kind: 'meat', emoji: '🥩', label: 'viande', juice: '#d93b34' },
  { kind: 'tomato', emoji: '🍅', label: 'tomate', juice: '#f0442f' },
  { kind: 'pepper', emoji: '🫑', label: 'poivron', juice: '#7fc843' },
  { kind: 'onion', emoji: '🧅', label: 'oignon', juice: '#c875b9' },
  { kind: 'mushroom', emoji: '🍄', label: 'champignon', juice: '#e3bd67' },
  { kind: 'zucchini', emoji: '🥒', label: 'courgette', juice: '#a6cf3d' },
]

const ingredientMap = new Map<IngredientKind, IngredientSpec>(ingredients.map((ingredient) => [ingredient.kind, ingredient]))
const customerFaces = ['👩🏻', '👨🏽', '👵🏻', '🧔🏾', '👩🏼‍🦰', '👨🏻‍🦱', '👸🏽', '🧙🏻']
const customerNames = ['Mira', 'Igor', 'Nadia', 'Boris', 'Elena', 'Dragomir', 'Ilona', 'Radu', 'Sorina', 'Mihai']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

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

function randomIngredient(random: () => number, previous?: IngredientKind) {
  let candidate = ingredients[Math.floor(random() * ingredients.length)].kind
  if (previous && candidate === previous && random() < 0.72) {
    candidate = ingredients[(ingredients.findIndex((item) => item.kind === candidate) + 1 + Math.floor(random() * (ingredients.length - 1))) % ingredients.length].kind
  }
  return candidate
}

function orderLength(score: number, random: () => number) {
  if (score < 5) return 2
  if (score < 12) return 3
  if (score < 22) return random() < 0.55 ? 3 : 4
  if (score < 38) return random() < 0.45 ? 4 : 5
  return random() < 0.45 ? 5 : 6
}

function intensityFor(world: Pick<World, 'score' | 'served'>) {
  return clamp(world.score / 25 + world.served * 0.045, 0, 2.2)
}

function createCustomer(world: Pick<World, 'random' | 'nextCustomerId' | 'score'>): Customer {
  const id = world.nextCustomerId
  const length = orderLength(world.score, world.random)
  const order: IngredientKind[] = []
  for (let index = 0; index < length; index += 1) {
    order.push(randomIngredient(world.random, order[index - 1]))
  }
  const maxPatience = clamp(14.5 + length * 1.4 - world.score * 0.045, 10.5, 20.5)
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

function expectedIngredient(world: World) {
  const customer = world.customers[0]
  return customer?.order[world.skewered.length]
}

function spawnDrop(world: World, y = -0.06, playMaxX = DEFAULT_PLAY_MAX_X) {
  const intensity = intensityFor(world)
  const specialRoll = world.random()
  let kind: DropKind

  if (specialRoll < 0.045 + intensity * 0.019) {
    kind = 'blood'
  } else if (specialRoll < 0.10 + intensity * 0.031) {
    kind = 'garlic'
  } else {
    const expected = expectedIngredient(world)
    const expectedChance = clamp(0.43 - intensity * 0.055, 0.29, 0.43)
    kind = expected && world.random() < expectedChance
      ? expected
      : randomIngredient(world.random)
  }

  const regularSpeed = 0.12 + world.random() * 0.06 + intensity * 0.095
  const obliqueChance = clamp(0.18 + intensity * 0.24, 0.18, 0.72)
  const goesOblique = world.random() < obliqueChance
  const direction = world.random() < 0.5 ? -1 : 1
  const vx = goesOblique
    ? direction * (0.025 + world.random() * (0.035 + intensity * 0.025))
    : 0
  const isRegular = kind !== 'blood' && kind !== 'garlic'
  const spinChance = clamp(0.42 + intensity * 0.18, 0.42, 0.82)
  const spin = isRegular && world.random() < spinChance
    ? (world.random() * 2 - 1) * (105 + intensity * 115)
    : (world.random() * 2 - 1) * 24

  world.drops.push({
    id: world.nextDropId,
    kind,
    x: DROP_MIN_X + world.random() * Math.max(0.08, playMaxX - DROP_MIN_X),
    y,
    speed: regularSpeed,
    vx,
    sway: (world.random() * 2 - 1) * (0.012 + intensity * 0.008),
    phase: world.random() * Math.PI * 2,
    rotation: (world.random() * 2 - 1) * 30,
    spin,
  })
  world.nextDropId += 1
}

function skewerTip(world: Pick<World, 'skewerX' | 'skewerY'>, height: number) {
  return {
    x: world.skewerX,
    y: world.skewerY - SKEWER_TIP_OFFSET_PX / Math.max(1, height),
  }
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abX = bx - ax
  const abY = by - ay
  const lengthSquared = abX * abX + abY * abY
  if (lengthSquared <= 0.0001) return Math.hypot(px - ax, py - ay)
  const t = clamp(((px - ax) * abX + (py - ay) * abY) / lengthSquared, 0, 1)
  const closestX = ax + abX * t
  const closestY = ay + abY * t
  return Math.hypot(px - closestX, py - closestY)
}

function createWorld(seed: number): World {
  const world: World = {
    drops: [],
    customers: [],
    skewered: [],
    score: 0,
    served: 0,
    lost: 0,
    nextDropId: 1,
    nextCustomerId: 1,
    spawnTimer: 0.24,
    skewerX: 0.42,
    skewerY: 0.83,
    previousTipX: 0.42,
    previousTipY: 0.63,
    dragging: false,
    slowTimer: 0,
    finished: false,
    endReason: null,
    random: mulberry32(seed || 1),
    toastText: '',
    toastTone: 'good',
    toastToken: 0,
    delivery: null,
    deliveryToken: 0,
    juiceImpact: null,
    juiceToken: 0,
  }

  pushCustomer(world)
  pushCustomer(world)
  pushCustomer(world)

  for (let index = 0; index < 6; index += 1) {
    spawnDrop(world, -0.02 - index * 0.16)
  }
  return world
}

function snapshot(world: World): RenderState {
  return {
    drops: world.drops.map((drop) => ({ ...drop })),
    customers: world.customers.map((customer) => ({ ...customer, order: [...customer.order] })),
    skewered: [...world.skewered],
    score: world.score,
    served: world.served,
    lost: world.lost,
    skewerX: world.skewerX,
    skewerY: world.skewerY,
    dragging: world.dragging,
    slowTimer: world.slowTimer,
    finished: world.finished,
    endReason: world.endReason,
    toastText: world.toastText,
    toastTone: world.toastTone,
    toastToken: world.toastToken,
    delivery: world.delivery ? { ...world.delivery, order: [...world.delivery.order] } : null,
    juiceImpact: world.juiceImpact ? { ...world.juiceImpact } : null,
  }
}

function showToast(world: World, text: string, tone: ToastTone) {
  world.toastText = text
  world.toastTone = tone
  world.toastToken += 1
}

function rotateCustomer(world: World) {
  world.customers.shift()
  world.skewered = []
  while (world.customers.length < 3) pushCustomer(world)
}

function IngredientIcon({ kind, className = '' }: { kind: IngredientKind, className?: string }) {
  const ingredient = ingredientMap.get(kind)
  return <span className={`vlad-ingredient-icon ${className}`} aria-label={ingredient?.label}>{ingredient?.emoji}</span>
}

export function VladsSkewers({ active, seed, restartToken, session }: GameComponentProps) {
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 11, 0x27d4eb2d)) >>> 0, [restartToken, seed])
  const worldRef = useRef<World>(createWorld(runSeed))
  const rootRef = useRef<HTMLDivElement | null>(null)
  const controlRef = useRef<HTMLDivElement | null>(null)
  const customerRef = useRef<HTMLDivElement | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const sizeRef = useRef<StageSize>({ width: 390, height: 800, playMaxX: DEFAULT_PLAY_MAX_X })
  const finishTimerRef = useRef<number | null>(null)
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))
  const [hasControlled, setHasControlled] = useState(false)

  const releasePointer = useCallback(() => {
    const pointerId = pointerIdRef.current
    const control = controlRef.current
    if (pointerId !== null && control?.hasPointerCapture(pointerId)) {
      control.releasePointerCapture(pointerId)
    }
    pointerIdRef.current = null
    worldRef.current.dragging = false
  }, [])

  const finishRun = useCallback(() => {
    const world = worldRef.current
    if (world.finished) return
    world.finished = true
    world.endReason = 'three-lost'
    world.dragging = false
    showToast(world, 'SERVICE TERMINÉ', 'bad')
    setView(snapshot(world))

    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    finishTimerRef.current = window.setTimeout(() => {
      session.finish({
        score: world.score,
        metadata: {
          clientsServed: world.served,
          clientsLost: world.lost,
          longestOrder: world.customers.reduce((max, customer) => Math.max(max, customer.order.length), 0),
        },
      })
    }, 520)
  }, [session])

  useEffect(() => {
    releasePointer()
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    worldRef.current = createWorld(runSeed)
    setView(snapshot(worldRef.current))
    setHasControlled(false)
    session.setScore(0)
  }, [releasePointer, runSeed, session])

  useEffect(() => () => {
    releasePointer()
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
  }, [releasePointer])

  useEffect(() => {
    if (active) return
    releasePointer()
  }, [active, releasePointer])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const updateSize = () => {
      const rect = root.getBoundingClientRect()
      const customerWidth = customerRef.current?.getBoundingClientRect().width ?? 104
      sizeRef.current = {
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        playMaxX: clamp(1 - (customerWidth + 22) / Math.max(1, rect.width), 0.70, 0.84),
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!active || worldRef.current.finished) return

    let frame = 0
    let previous = performance.now()
    let renderAccumulator = 0

    const loseCurrentCustomer = (reason: LoseReason) => {
      const world = worldRef.current
      world.lost += 1
      if (reason === 'garlic') showToast(world, 'AIL ! VLAD DÉTESTE ÇA', 'bad')
      else if (reason === 'extra') showToast(world, 'TROP D’INGRÉDIENTS', 'bad')
      else if (reason === 'wrong') showToast(world, 'MAUVAISE BROCHETTE', 'bad')
      else showToast(world, 'CLIENT PERDU', 'bad')
      rotateCustomer(world)
      if (world.lost >= MAX_LOST) finishRun()
    }

    const splash = (drop: FallingDrop, kind: IngredientKind) => {
      const spec = ingredientMap.get(kind)
      if (!spec) return
      const world = worldRef.current
      world.juiceToken += 1
      world.juiceImpact = {
        token: world.juiceToken,
        x: drop.x,
        y: drop.y,
        color: spec.juice,
      }
    }

    const catchDrop = (drop: FallingDrop) => {
      const world = worldRef.current
      world.drops = world.drops.filter((candidate) => candidate.id !== drop.id)

      if (drop.kind === 'blood') {
        const customer = world.customers[0]
        if (customer) customer.patience = Math.min(customer.maxPatience, customer.patience + 4.8)
        world.slowTimer = Math.max(world.slowTimer, 3.4)
        showToast(world, '🩸 SANG FROID · RALENTI', 'bonus')
        return
      }

      if (drop.kind === 'garlic') {
        loseCurrentCustomer('garlic')
        return
      }

      splash(drop, drop.kind)
      const customer = world.customers[0]
      const expected = customer?.order[world.skewered.length]
      if (!customer) return

      if (world.skewered.length >= customer.order.length) {
        loseCurrentCustomer('extra')
        return
      }

      if (drop.kind !== expected) {
        loseCurrentCustomer('wrong')
        return
      }

      world.skewered.push(drop.kind)
      if (world.skewered.length < customer.order.length) {
        showToast(world, `${world.skewered.length}/${customer.order.length}`, 'good')
      } else {
        showToast(world, 'BROCHETTE PRÊTE · AU CLIENT →', 'good')
      }
    }

    const serveCurrentCustomer = () => {
      const world = worldRef.current
      const customer = world.customers[0]
      if (!customer || world.skewered.length !== customer.order.length) return false

      const value = customer.order.length
      world.score += value
      world.served += 1
      world.deliveryToken += 1
      world.delivery = {
        token: world.deliveryToken,
        x: world.skewerX,
        y: world.skewerY,
        face: customer.face,
        order: [...customer.order],
      }
      showToast(world, `SERVI · +${value}`, 'good')
      rotateCustomer(world)
      session.setScore(world.score)
      return true
    }

    const animate = (now: number) => {
      const world = worldRef.current
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000))
      previous = now

      if (!world.finished) {
        const activeCustomer = world.customers[0]
        if (activeCustomer) {
          activeCustomer.patience = Math.max(0, activeCustomer.patience - dt)
          if (activeCustomer.patience <= 0) loseCurrentCustomer('patience')
        }

        if (!world.finished) {
          world.slowTimer = Math.max(0, world.slowTimer - dt)
          const slowFactor = world.slowTimer > 0 ? 0.48 : 1
          const intensity = intensityFor(world)
          const { width, height, playMaxX } = sizeRef.current

          world.spawnTimer -= dt
          if (world.spawnTimer <= 0) {
            let burst = 1
            if (intensity > 0.55 && world.random() < 0.16 + intensity * 0.11) burst += 1
            if (intensity > 1.35 && world.random() < 0.12 + (intensity - 1.35) * 0.08) burst += 1
            for (let index = 0; index < burst; index += 1) {
              spawnDrop(world, -0.055 - index * 0.05, playMaxX)
            }
            const baseGap = Math.max(0.15, 0.73 - intensity * 0.245)
            const randomGap = Math.max(0.10, 0.23 - intensity * 0.045)
            world.spawnTimer = baseGap + world.random() * randomGap
          }

          for (const drop of world.drops) {
            drop.y += drop.speed * slowFactor * dt
            drop.phase += dt * (1.9 + drop.speed * 5)
            drop.x += (drop.vx + Math.sin(drop.phase) * drop.sway) * slowFactor * dt
            if (drop.x <= DROP_MIN_X) {
              drop.x = DROP_MIN_X
              drop.vx = Math.abs(drop.vx)
            } else if (drop.x >= playMaxX) {
              drop.x = playMaxX
              drop.vx = -Math.abs(drop.vx)
            }
            drop.rotation += drop.spin * slowFactor * dt
          }
          world.drops = world.drops.filter((drop) => drop.y < 1.08)

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
              const ax = world.previousTipX * width
              const ay = world.previousTipY * height
              const bx = tip.x * width
              const by = tip.y * height

              for (const drop of world.drops) {
                const distance = distanceToSegment(drop.x * width, drop.y * height, ax, ay, bx, by)
                if (distance <= TIP_HIT_RADIUS_PX && distance < targetDistance) {
                  target = drop
                  targetDistance = distance
                }
              }
              if (target) catchDrop(target)
            }
          }

          world.previousTipX = tip.x
          world.previousTipY = tip.y
        }

        renderAccumulator += dt
        if (renderAccumulator >= 1 / 30) {
          renderAccumulator = 0
          setView(snapshot(world))
        }
      }

      if (!world.finished) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, finishRun, session])

  const moveSkewer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const root = rootRef.current
    const control = controlRef.current
    const world = worldRef.current
    if (!root || !control || !active || world.finished) return
    const rootRect = root.getBoundingClientRect()
    const controlRect = control.getBoundingClientRect()
    const x = clamp(event.clientX, rootRect.left + 16, rootRect.right - 14)
    const y = clamp(event.clientY, controlRect.top, controlRect.bottom)
    world.skewerX = (x - rootRect.left) / Math.max(1, rootRect.width)
    world.skewerY = (y - rootRect.top) / Math.max(1, rootRect.height)
    setView(snapshot(world))
  }, [active])

  const activeCustomer = view.customers[0]
  const orderReady = Boolean(activeCustomer && view.skewered.length === activeCustomer.order.length)

  return (
    <div ref={rootRef} className={`vlad-game ${view.slowTimer > 0 ? 'is-slowed' : ''} ${orderReady ? 'is-ready-to-serve' : ''}`}>
      <div className="vlad-bg" aria-hidden="true" />
      <div className="vlad-fire" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="vlad-lost" aria-label={`${MAX_LOST - view.lost} clients peuvent encore être perdus`}>
        {Array.from({ length: MAX_LOST }, (_, index) => (
          <span key={index} className={index < view.lost ? 'is-lost' : ''}>☠</span>
        ))}
      </div>

      <aside className="vlad-client-rail" aria-label="Clients et commandes">
        <div className="vlad-rail-label">CLIENT</div>
        {activeCustomer && (
          <div ref={customerRef} className={`vlad-client is-active ${orderReady ? 'is-ready' : ''}`} key={activeCustomer.id}>
            <div className="vlad-client-head">
              <span className="vlad-face">{activeCustomer.face}</span>
              <strong>{activeCustomer.name}</strong>
            </div>
            <div className="vlad-order">
              {activeCustomer.order.map((kind, index) => (
                <IngredientIcon
                  key={`${activeCustomer.id}-${index}`}
                  kind={kind}
                  className={index < view.skewered.length ? 'is-done' : index === view.skewered.length ? 'is-next' : ''}
                />
              ))}
            </div>
            <div className="vlad-patience" aria-label={`Patience ${Math.round(clamp(activeCustomer.patience / activeCustomer.maxPatience, 0, 1) * 100)}%`}>
              <i style={{ width: `${clamp(activeCustomer.patience / activeCustomer.maxPatience, 0, 1) * 100}%` }} />
            </div>
            <div className="vlad-serve-target">{orderReady ? '→ DONNE-LUI' : 'COMMANDE'}</div>
          </div>
        )}

        <div className="vlad-waiting-clients" aria-label="Clients suivants">
          {view.customers.slice(1).map((customer) => (
            <div className="vlad-client is-waiting" key={customer.id}>
              <div className="vlad-client-head">
                <span className="vlad-face">{customer.face}</span>
                <strong>{customer.name}</strong>
              </div>
              <div className="vlad-order">
                {customer.order.map((kind, index) => (
                  <IngredientIcon key={`${customer.id}-${index}`} kind={kind} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="vlad-drop-field" aria-label="Ingrédients qui tombent">
        {view.drops.map((drop) => {
          const regular = drop.kind !== 'blood' && drop.kind !== 'garlic'
          const emoji = regular
            ? ingredientMap.get(drop.kind as IngredientKind)?.emoji
            : drop.kind === 'blood' ? '🩸' : '🧄'
          return (
            <span
              className={`vlad-drop is-${drop.kind}`}
              key={drop.id}
              style={{
                left: `${drop.x * 100}%`,
                top: `${drop.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${drop.rotation}deg)`,
              }}
              aria-hidden="true"
            >
              {emoji}
            </span>
          )
        })}
      </main>

      {view.juiceImpact && (
        <div
          className="vlad-splash"
          key={view.juiceImpact.token}
          style={{
            left: `${view.juiceImpact.x * 100}%`,
            top: `${view.juiceImpact.y * 100}%`,
            '--juice': view.juiceImpact.color,
          } as CSSProperties}
          aria-hidden="true"
        >
          <b />
          <i /><i /><i /><i /><i /><i />
        </div>
      )}

      <div
        className={`vlad-skewer ${view.dragging ? 'is-held' : ''} ${orderReady ? 'is-loaded' : ''}`}
        style={{ left: `${view.skewerX * 100}%`, top: `${view.skewerY * 100}%` }}
        aria-hidden="true"
      >
        <div className="vlad-skewer-metal"><i /></div>
        <span className="vlad-tip-marker" />
        <div className="vlad-skewered-stack">
          {view.skewered.map((kind, index) => (
            <IngredientIcon key={`${kind}-${index}`} kind={kind} />
          ))}
        </div>
        <div className="vlad-hand">✊🏻</div>
      </div>

      <div className="vlad-control-boundary" aria-hidden="true">
        {!hasControlled && <span>GLISSE ICI · LA POINTE DORÉE EST LA HITBOX</span>}
      </div>
      <div
        ref={controlRef}
        className="vlad-control-zone"
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (!active || worldRef.current.finished) return
          event.preventDefault()
          pointerIdRef.current = event.pointerId
          event.currentTarget.setPointerCapture(event.pointerId)
          worldRef.current.dragging = true
          const { height } = sizeRef.current
          moveSkewer(event)
          const tip = skewerTip(worldRef.current, height)
          worldRef.current.previousTipX = tip.x
          worldRef.current.previousTipY = tip.y
          setHasControlled(true)
          setView(snapshot(worldRef.current))
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (!worldRef.current.dragging || pointerIdRef.current !== event.pointerId) return
          event.preventDefault()
          moveSkewer(event)
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (pointerIdRef.current !== event.pointerId) return
          event.preventDefault()
          releasePointer()
          setView(snapshot(worldRef.current))
        }}
        onPointerCancel={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (pointerIdRef.current !== event.pointerId) return
          releasePointer()
          setView(snapshot(worldRef.current))
        }}
        aria-label="Zone de contrôle de la brochette"
      />

      {view.toastText && (
        <div className={`vlad-toast is-${view.toastTone}`} key={view.toastToken} aria-hidden="true">
          {view.toastText}
        </div>
      )}

      {view.delivery && (
        <div
          className="vlad-delivery"
          key={view.delivery.token}
          style={{ '--delivery-x': `${view.delivery.x * 100}%`, '--delivery-y': `${view.delivery.y * 100}%` } as CSSProperties}
          aria-hidden="true"
        >
          <div className="vlad-delivery-stick">
            {view.delivery.order.map((kind, index) => <IngredientIcon kind={kind} key={`${view.delivery?.token}-${index}`} />)}
          </div>
          <span className="vlad-delivery-face">{view.delivery.face}</span>
        </div>
      )}

      {view.slowTimer > 0 && <div className="vlad-blood-bonus" aria-hidden="true">SANG FROID</div>}

      <div className="vlad-legend" aria-hidden="true">
        <span>🩸 +TEMPS · RALENTIT</span><span>🧄 À ÉVITER</span>
      </div>

      {view.finished && (
        <div className="vlad-ending" aria-hidden="true">
          <strong>VLAD FERME LE GRILL</strong>
          <span>{view.served} client{view.served === 1 ? '' : 's'} servi{view.served === 1 ? '' : 's'}</span>
        </div>
      )}

      {activeCustomer && (
        <div className={`vlad-next-needed ${orderReady ? 'is-ready' : ''}`} aria-hidden="true">
          <small>{orderReady ? 'À LIVRER' : 'PROCHAIN'}</small>
          {activeCustomer.order[view.skewered.length] ? <IngredientIcon kind={activeCustomer.order[view.skewered.length]} /> : <span>→</span>}
        </div>
      )}
    </div>
  )
}
