import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './VladsSkewers.css'

type IngredientKind = 'meat' | 'tomato' | 'pepper' | 'onion' | 'mushroom' | 'zucchini'
type DropKind = IngredientKind | 'blood' | 'garlic'
type ToastTone = 'good' | 'bad' | 'bonus'
type EndReason = 'three-lost'

type IngredientSpec = {
  kind: IngredientKind
  emoji: string
  label: string
}

type FallingDrop = {
  id: number
  kind: DropKind
  x: number
  y: number
  speed: number
  sway: number
  phase: number
  rotation: number
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
}

const MAX_LOST = 3
const CONTROL_TOP = 0.64
const CONTROL_BOTTOM = 0.89
const SKEWER_TIP_OFFSET_PX = 136
const HIT_RADIUS_PX = 38
const CLIENT_RAIL_PX = 96

const ingredients: IngredientSpec[] = [
  { kind: 'meat', emoji: '🥩', label: 'viande' },
  { kind: 'tomato', emoji: '🍅', label: 'tomate' },
  { kind: 'pepper', emoji: '🫑', label: 'poivron' },
  { kind: 'onion', emoji: '🧅', label: 'oignon' },
  { kind: 'mushroom', emoji: '🍄', label: 'champignon' },
  { kind: 'zucchini', emoji: '🥒', label: 'courgette' },
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

function createCustomer(world: Pick<World, 'random' | 'nextCustomerId' | 'score'>): Customer {
  const id = world.nextCustomerId
  const length = orderLength(world.score, world.random)
  const order: IngredientKind[] = []
  for (let index = 0; index < length; index += 1) {
    order.push(randomIngredient(world.random, order[index - 1]))
  }
  const maxPatience = clamp(13.5 + length * 1.35 - world.score * 0.055, 10.5, 19.5)
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

function spawnDrop(world: World, y = -0.06) {
  const difficulty = clamp(world.score / 45, 0, 1)
  const specialRoll = world.random()
  let kind: DropKind

  if (specialRoll < 0.045 + difficulty * 0.018) {
    kind = 'blood'
  } else if (specialRoll < 0.095 + difficulty * 0.035) {
    kind = 'garlic'
  } else {
    const expected = expectedIngredient(world)
    kind = expected && world.random() < 0.38
      ? expected
      : randomIngredient(world.random)
  }

  const regularSpeed = 0.105 + world.random() * 0.045 + difficulty * 0.075
  world.drops.push({
    id: world.nextDropId,
    kind,
    x: 0.07 + world.random() * 0.68,
    y,
    speed: regularSpeed,
    sway: (world.random() * 2 - 1) * (0.014 + difficulty * 0.012),
    phase: world.random() * Math.PI * 2,
    rotation: (world.random() * 2 - 1) * 24,
  })
  world.nextDropId += 1
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
    skewerX: 0.43,
    skewerY: 0.83,
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
  const sizeRef = useRef({ width: 390, height: 800 })
  const finishTimerRef = useRef<number | null>(null)
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))
  const [hasControlled, setHasControlled] = useState(false)

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
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    worldRef.current = createWorld(runSeed)
    setView(snapshot(worldRef.current))
    setHasControlled(false)
    session.setScore(0)
  }, [runSeed, session])

  useEffect(() => () => {
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const updateSize = () => {
      const rect = root.getBoundingClientRect()
      sizeRef.current = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) }
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

    const loseCurrentCustomer = (reason: 'wrong' | 'garlic' | 'patience') => {
      const world = worldRef.current
      world.lost += 1
      if (reason === 'garlic') showToast(world, 'AIL ! VLAD DÉTESTE ÇA', 'bad')
      else if (reason === 'wrong') showToast(world, 'MAUVAISE BROCHETTE', 'bad')
      else showToast(world, 'CLIENT PERDU', 'bad')
      rotateCustomer(world)
      if (world.lost >= MAX_LOST) finishRun()
    }

    const catchDrop = (drop: FallingDrop) => {
      const world = worldRef.current
      world.drops = world.drops.filter((candidate) => candidate.id !== drop.id)

      if (drop.kind === 'blood') {
        const customer = world.customers[0]
        if (customer) customer.patience = Math.min(customer.maxPatience, customer.patience + 4.2)
        world.slowTimer = Math.max(world.slowTimer, 2.8)
        showToast(world, '🩸 SANG FROID · +TEMPS', 'bonus')
        return
      }

      if (drop.kind === 'garlic') {
        loseCurrentCustomer('garlic')
        return
      }

      const customer = world.customers[0]
      const expected = customer?.order[world.skewered.length]
      if (!customer || drop.kind !== expected) {
        loseCurrentCustomer('wrong')
        return
      }

      world.skewered.push(drop.kind)
      if (world.skewered.length < customer.order.length) {
        showToast(world, `${world.skewered.length}/${customer.order.length}`, 'good')
        return
      }

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
          const slowFactor = world.slowTimer > 0 ? 0.56 : 1
          const difficulty = clamp(world.score / 45, 0, 1)

          world.spawnTimer -= dt
          if (world.spawnTimer <= 0) {
            spawnDrop(world)
            const baseGap = 0.82 - difficulty * 0.28
            world.spawnTimer = baseGap + world.random() * (0.34 - difficulty * 0.08)
          }

          for (const drop of world.drops) {
            drop.y += drop.speed * slowFactor * dt
            drop.phase += dt * (1.7 + drop.speed * 5)
            drop.x += Math.sin(drop.phase) * drop.sway * dt
            drop.x = clamp(drop.x, 0.045, 0.78)
            drop.rotation += Math.sin(drop.phase * 0.7) * 8 * dt
          }
          world.drops = world.drops.filter((drop) => drop.y < 1.08)

          if (world.dragging && world.drops.length > 0) {
            const { width, height } = sizeRef.current
            const tipX = world.skewerX
            const tipY = world.skewerY - SKEWER_TIP_OFFSET_PX / height
            let target: FallingDrop | null = null
            let targetDistance = Number.POSITIVE_INFINITY

            for (const drop of world.drops) {
              const dx = (drop.x - tipX) * width
              const dy = (drop.y - tipY) * height
              const distance = Math.hypot(dx, dy)
              if (distance <= HIT_RADIUS_PX && distance < targetDistance) {
                target = drop
                targetDistance = distance
              }
            }
            if (target) catchDrop(target)
          }
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
    const world = worldRef.current
    if (!root || !active || world.finished) return
    const rect = root.getBoundingClientRect()
    const maxX = clamp(1 - CLIENT_RAIL_PX / Math.max(1, rect.width), 0.68, 0.86)
    world.skewerX = clamp((event.clientX - rect.left) / rect.width, 0.055, maxX)
    world.skewerY = clamp((event.clientY - rect.top) / rect.height, CONTROL_TOP, CONTROL_BOTTOM)
    setView(snapshot(world))
  }, [active])

  const activeCustomer = view.customers[0]
  const maxSkewerX = clamp(1 - CLIENT_RAIL_PX / Math.max(1, sizeRef.current.width), 0.68, 0.86)
  const controlWidth = `${maxSkewerX * 100}%`

  return (
    <div ref={rootRef} className={`vlad-game ${view.slowTimer > 0 ? 'is-slowed' : ''}`}>
      <div className="vlad-bg" aria-hidden="true" />
      <div className="vlad-fire" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="vlad-lost" aria-label={`${MAX_LOST - view.lost} clients peuvent encore être perdus`}>
        {Array.from({ length: MAX_LOST }, (_, index) => (
          <span key={index} className={index < view.lost ? 'is-lost' : ''}>☠</span>
        ))}
      </div>

      <aside className="vlad-client-rail" aria-label="File des clients">
        <div className="vlad-rail-label">COMMANDES</div>
        {view.customers.map((customer, customerIndex) => {
          const isActive = customerIndex === 0
          const progress = isActive ? view.skewered.length : 0
          const patience = clamp(customer.patience / customer.maxPatience, 0, 1)
          return (
            <div className={`vlad-client ${isActive ? 'is-active' : ''}`} key={customer.id}>
              <div className="vlad-client-head">
                <span className="vlad-face">{customer.face}</span>
                <strong>{customer.name}</strong>
              </div>
              <div className="vlad-order">
                {customer.order.map((kind, index) => (
                  <IngredientIcon key={`${customer.id}-${index}`} kind={kind} className={isActive && index < progress ? 'is-done' : isActive && index === progress ? 'is-next' : ''} />
                ))}
              </div>
              {isActive && (
                <div className="vlad-patience" aria-label={`Patience ${Math.round(patience * 100)}%`}>
                  <i style={{ width: `${patience * 100}%` }} />
                </div>
              )}
            </div>
          )
        })}
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

      <div
        className={`vlad-skewer ${view.dragging ? 'is-held' : ''}`}
        style={{ left: `${view.skewerX * 100}%`, top: `${view.skewerY * 100}%` }}
        aria-hidden="true"
      >
        <div className="vlad-skewer-metal"><i /></div>
        <div className="vlad-skewered-stack">
          {view.skewered.map((kind, index) => (
            <IngredientIcon key={`${kind}-${index}`} kind={kind} />
          ))}
        </div>
        <div className="vlad-hand">✊🏻</div>
      </div>

      <div className="vlad-control-boundary" style={{ width: controlWidth }} aria-hidden="true">
        {!hasControlled && <span>GLISSE ICI · GUIDE LA POINTE</span>}
      </div>
      <div
        className="vlad-control-zone"
        style={{ width: controlWidth }}
        onPointerDown={(event) => {
          if (!active || worldRef.current.finished) return
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          worldRef.current.dragging = true
          setHasControlled(true)
          moveSkewer(event)
          setView(snapshot(worldRef.current))
        }}
        onPointerMove={(event) => {
          if (!worldRef.current.dragging) return
          event.preventDefault()
          moveSkewer(event)
        }}
        onPointerUp={(event) => {
          if (!worldRef.current.dragging) return
          event.preventDefault()
          worldRef.current.dragging = false
          setView(snapshot(worldRef.current))
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => {
          worldRef.current.dragging = false
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
        <span>🩸 +TEMPS</span><span>🧄 À ÉVITER</span>
      </div>

      {view.finished && (
        <div className="vlad-ending" aria-hidden="true">
          <strong>VLAD FERME LE GRILL</strong>
          <span>{view.served} client{view.served === 1 ? '' : 's'} servi{view.served === 1 ? '' : 's'}</span>
        </div>
      )}

      {activeCustomer && (
        <div className="vlad-next-needed" aria-hidden="true">
          <small>PROCHAIN</small>
          {activeCustomer.order[view.skewered.length] ? <IngredientIcon kind={activeCustomer.order[view.skewered.length]} /> : <span>✓</span>}
        </div>
      )}
    </div>
  )
}
