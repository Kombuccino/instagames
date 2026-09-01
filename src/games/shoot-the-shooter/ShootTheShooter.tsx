import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './ShootTheShooter.css'

type GlassType = 'classic' | 'tapered' | 'tall' | 'heavy' | 'flared' | 'mini'
type LiquidPattern = 'solid' | 'gradient' | 'layered'

type LiquidStyle = {
  a: string
  b: string
  angle: number
  pattern: LiquidPattern
}

type Recipe = {
  id: number
  glass: GlassType
  liquid: LiquidStyle
  name: string
  effect: number
  spawnWeight: number
}

type Shooter = {
  id: number
  recipeId: number
  x: number
}

type EndReason = 'coma' | 'last-call'

type World = {
  shooters: Shooter[]
  nextShooterId: number
  score: number
  alcohol: number
  peakAlcohol: number
  speed: number
  discovered: Set<number>
  lastRecipeId: number | null
  finished: boolean
  endReason: EndReason | null
  soberingCooldown: number
  random: () => number
}

type RenderState = {
  shooters: Shooter[]
  score: number
  alcohol: number
  peakAlcohol: number
  speed: number
  discovered: number[]
  lastRecipeId: number | null
  finished: boolean
  endReason: EndReason | null
}

type GrabState = {
  recipeId: number
  token: number
}

const HIT_X = 50
const HIT_RADIUS = 7.5
const START_SPEED = 18
const MAX_SPEED = 33
const FRICTION_PER_SECOND = 1.25
const SPEED_BOOST = 2.3

const glassTypes: GlassType[] = ['classic', 'tapered', 'tall', 'heavy', 'flared', 'mini']

const liquids: LiquidStyle[] = [
  { a: '#ff285f', b: '#ff285f', angle: 180, pattern: 'solid' },
  { a: '#6a35ff', b: '#ff4fd8', angle: 145, pattern: 'gradient' },
  { a: '#00e5ff', b: '#1565ff', angle: 180, pattern: 'gradient' },
  { a: '#b6ff3b', b: '#22d8a0', angle: 160, pattern: 'gradient' },
  { a: '#ffdd38', b: '#ff722e', angle: 180, pattern: 'gradient' },
  { a: '#ff8ad8', b: '#fff0f8', angle: 180, pattern: 'layered' },
  { a: '#161a28', b: '#7650ff', angle: 180, pattern: 'layered' },
  { a: '#33f0c0', b: '#f2ff76', angle: 180, pattern: 'layered' },
  { a: '#ff375f', b: '#ffb13b', angle: 135, pattern: 'gradient' },
  { a: '#f6f2ff', b: '#8f7dff', angle: 180, pattern: 'gradient' },
  { a: '#00c3a5', b: '#00c3a5', angle: 180, pattern: 'solid' },
  { a: '#ff5b30', b: '#ff5b30', angle: 180, pattern: 'solid' },
  { a: '#2b2dff', b: '#26f7e8', angle: 150, pattern: 'gradient' },
  { a: '#ff2ca3', b: '#772cff', angle: 150, pattern: 'gradient' },
]

const nameStarts = [
  'Turbo', 'Disco', 'Liquid', 'Holy', 'Dirty', 'Midnight', 'Neon', 'Royal', 'Atomic', 'Velvet',
  'Illegal', 'Sunday', 'Uncle', 'Doctor', 'Electric', 'Tiny', 'Grandma’s', 'Belgian', 'Broken', 'Lucky',
]

const nameEnds = [
  'Regret', 'Goblin', 'Divorce', 'Toothpaste', 'Mistake', 'Tractor', 'Redemption', 'Comet', 'Disaster', 'Panic',
  'Miracle', 'Bad Idea', 'Hangover', 'Penguin', 'Elevator', 'Meteor', 'Bandit', 'Confession', 'Shortcut', 'Afterparty',
]

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

function pickInt(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1))
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

function liquidStyle(liquid: LiquidStyle) {
  return {
    '--liquid-a': liquid.a,
    '--liquid-b': liquid.b,
    '--liquid-angle': `${liquid.angle}deg`,
  } as CSSProperties
}

function createRecipes(seed: number) {
  const random = mulberry32(seed || 1)
  const recipeCount = pickInt(random, 10, 20)
  const combos = shuffle(
    glassTypes.flatMap((glass) => liquids.map((liquid) => ({ glass, liquid }))),
    random,
  ).slice(0, recipeCount)

  const soberingCount = recipeCount >= 16 ? 2 : 1
  const soberingSlots = new Set(
    shuffle(Array.from({ length: recipeCount }, (_, index) => index), random).slice(0, soberingCount),
  )
  const usedNames = new Set<string>()

  return combos.map((combo, index): Recipe => {
    let name = ''
    for (let attempt = 0; attempt < 10; attempt += 1) {
      name = `${nameStarts[Math.floor(random() * nameStarts.length)]} ${nameEnds[Math.floor(random() * nameEnds.length)]}`
      if (!usedNames.has(name)) break
    }
    if (usedNames.has(name)) name = `${name} #${index + 1}`
    usedNames.add(name)

    const isSobering = soberingSlots.has(index)
    return {
      id: index,
      ...combo,
      name,
      effect: isSobering ? -pickInt(random, 12, 22) : pickInt(random, 4, random() < 0.17 ? 17 : 13),
      spawnWeight: isSobering ? 0.22 : 1,
    }
  })
}

function weightedRecipe(random: () => number, recipes: Recipe[], soberingCooldown: number) {
  const allowed = recipes.filter((recipe) => recipe.effect >= 0 || soberingCooldown <= 0)
  const total = allowed.reduce((sum, recipe) => sum + recipe.spawnWeight, 0)
  let roll = random() * total
  for (const recipe of allowed) {
    roll -= recipe.spawnWeight
    if (roll <= 0) return recipe
  }
  return allowed[allowed.length - 1] ?? recipes[0]
}

function pushShooter(world: World, recipes: Recipe[], x: number) {
  const recipe = weightedRecipe(world.random, recipes, world.soberingCooldown)
  world.shooters.push({ id: world.nextShooterId, recipeId: recipe.id, x })
  world.nextShooterId += 1
  world.soberingCooldown = recipe.effect < 0 ? 3 : Math.max(0, world.soberingCooldown - 1)
}

function createWorld(recipes: Recipe[], seed: number): World {
  const world: World = {
    shooters: [],
    nextShooterId: 0,
    score: 0,
    alcohol: 0,
    peakAlcohol: 0,
    speed: START_SPEED,
    discovered: new Set<number>(),
    lastRecipeId: null,
    finished: false,
    endReason: null,
    soberingCooldown: 0,
    random: mulberry32((seed ^ 0x9e3779b9) >>> 0 || 1),
  }

  let x = 14
  while (x < 132) {
    pushShooter(world, recipes, x)
    x += 14 + world.random() * 8
  }
  return world
}

function snapshot(world: World): RenderState {
  return {
    shooters: world.shooters.map((shooter) => ({ ...shooter })),
    score: world.score,
    alcohol: world.alcohol,
    peakAlcohol: world.peakAlcohol,
    speed: world.speed,
    discovered: [...world.discovered],
    lastRecipeId: world.lastRecipeId,
    finished: world.finished,
    endReason: world.endReason,
  }
}

function effectLabel(effect: number) {
  return `${effect > 0 ? '+' : '−'}${Math.abs(effect)}%`
}

function drunkClass(alcohol: number) {
  if (alcohol >= 90) return 'is-blackout'
  if (alcohol >= 75) return 'is-wasted'
  if (alcohol >= 55) return 'is-drunk'
  if (alcohol >= 28) return 'is-tipsy'
  return 'is-sober'
}

function GlassVisual({ recipe, mini = false }: { recipe: Recipe, mini?: boolean }) {
  return (
    <span className={`${mini ? 'sts-glass-icon' : 'sts-glass'} is-${recipe.glass}`} style={liquidStyle(recipe.liquid)}>
      <span className={`sts-liquid is-${recipe.liquid.pattern}`} />
      <span className="sts-glass-shine" />
    </span>
  )
}

export function ShootTheShooter({ active, seed, restartToken, session }: GameComponentProps) {
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 1, 0x45d9f3b)) >>> 0, [restartToken, seed])
  const recipes = useMemo(() => createRecipes(runSeed), [runSeed])
  const worldRef = useRef<World>(createWorld(recipes, runSeed))
  const finishTimerRef = useRef<number | null>(null)
  const grabTimerRef = useRef<number | null>(null)
  const grabTokenRef = useRef(0)
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))
  const [grab, setGrab] = useState<GrabState | null>(null)
  const [missToken, setMissToken] = useState(0)

  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes])

  const finishRun = useCallback((reason: EndReason) => {
    const world = worldRef.current
    if (world.finished) return

    world.finished = true
    world.endReason = reason
    world.speed = 0
    setView(snapshot(world))

    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    finishTimerRef.current = window.setTimeout(() => {
      session.finish({
        score: world.score,
        metadata: {
          end: reason,
          alcoholPeak: Math.round(world.peakAlcohol),
          finalAlcohol: Math.round(world.alcohol),
          recipesDiscovered: world.discovered.size,
        },
      })
    }, reason === 'coma' ? 700 : 450)
  }, [session])

  useEffect(() => {
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
    worldRef.current = createWorld(recipes, runSeed)
    setView(snapshot(worldRef.current))
    setGrab(null)
    setMissToken(0)
    session.setScore(0)
  }, [recipes, runSeed, session])

  useEffect(() => () => {
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current)
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
  }, [])

  useEffect(() => {
    if (!active || worldRef.current.finished) return

    let frame = 0
    let previous = performance.now()

    const animate = (now: number) => {
      const world = worldRef.current
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000))
      previous = now

      if (!world.finished) {
        world.speed = Math.max(0, world.speed - FRICTION_PER_SECOND * dt)
        const distance = world.speed * dt
        world.shooters.forEach((shooter) => {
          shooter.x -= distance
        })
        world.shooters = world.shooters.filter((shooter) => shooter.x > -12)

        let furthest = world.shooters.reduce((max, shooter) => Math.max(max, shooter.x), -Infinity)
        if (!Number.isFinite(furthest)) furthest = 90
        while (furthest < 126) {
          furthest += 14 + world.random() * 8
          pushShooter(world, recipes, furthest)
        }

        if (world.speed <= 0.02) {
          finishRun('last-call')
          return
        }

        setView(snapshot(world))
      }

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, finishRun, recipes])

  const drink = useCallback(() => {
    const world = worldRef.current
    if (!active || world.finished) return

    const tolerance = Math.max(3.8, HIT_RADIUS - world.alcohol * 0.037)
    let target: Shooter | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const shooter of world.shooters) {
      const distance = Math.abs(shooter.x - HIT_X)
      if (distance <= tolerance && distance < bestDistance) {
        target = shooter
        bestDistance = distance
      }
    }

    if (!target) {
      setMissToken((value) => value + 1)
      return
    }

    const recipe = recipeById.get(target.recipeId)
    if (!recipe) return

    world.shooters = world.shooters.filter((shooter) => shooter.id !== target?.id)
    world.score += 1
    world.alcohol = Math.max(0, Math.min(100, world.alcohol + recipe.effect))
    world.peakAlcohol = Math.max(world.peakAlcohol, world.alcohol)
    world.speed = Math.min(MAX_SPEED, world.speed + SPEED_BOOST)
    world.discovered.add(recipe.id)
    world.lastRecipeId = recipe.id

    grabTokenRef.current += 1
    setGrab({ recipeId: recipe.id, token: grabTokenRef.current })
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
    grabTimerRef.current = window.setTimeout(() => setGrab(null), 720)

    session.setScore(world.score)
    setView(snapshot(world))

    if (world.alcohol >= 100) finishRun('coma')
  }, [active, finishRun, recipeById, session])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    drink()
  }

  const lastRecipe = view.lastRecipeId === null ? null : recipeById.get(view.lastRecipeId) ?? null
  const grabRecipe = grab ? recipeById.get(grab.recipeId) ?? null : null
  const discoveredRecipes = view.discovered
    .map((id) => recipeById.get(id))
    .filter((recipe): recipe is Recipe => Boolean(recipe))
    .slice(-7)
    .reverse()

  const visualStyle = {
    '--sts-blur': `${Math.max(0, (view.alcohol - 34) / 24)}px`,
    '--sts-hue': `${Math.max(0, view.alcohol - 22) * 1.22}deg`,
    '--sts-saturation': `${1 + view.alcohol / 70}`,
    '--sts-double': `${Math.max(0, view.alcohol - 58) / 5.2}px`,
    '--sts-chaos': `${Math.max(0, view.alcohol - 52) / 48}`,
  } as CSSProperties

  return (
    <div className={`sts-game ${drunkClass(view.alcohol)}`} style={visualStyle}>
      <div className="sts-ambient" aria-hidden="true" />

      <section className="sts-topbar" aria-label="État de la partie">
        <div className="sts-alcohol">
          <div className="sts-alcohol-label">
            <span>ALCOOL</span>
            <strong>{Math.round(view.alcohol)}%</strong>
          </div>
          <div className="sts-alcohol-track">
            <i style={{ width: `${view.alcohol}%` }} />
          </div>
        </div>
      </section>

      <section className="sts-stage">
        <div className="sts-callout">
          {view.finished
            ? view.endReason === 'coma' ? 'COMA ÉTHYLIQUE' : 'LAST CALL'
            : view.alcohol >= 90 ? 'TIENS BON.' : 'TAPE POUR ATTRAPER LE SHOOT'}
        </div>

        <div
          className="sts-track"
          role="button"
          tabIndex={0}
          aria-label="Ligne de shooters. Touchez quand un shooter arrive à portée de la main."
          onPointerDown={(event) => {
            event.preventDefault()
            drink()
          }}
          onKeyDown={onKeyDown}
        >
          <div className="sts-grab-marker" aria-hidden="true" />

          <div className="sts-belt" aria-hidden="true">
            {view.shooters.map((shooter) => {
              const recipe = recipeById.get(shooter.recipeId)
              if (!recipe) return null
              return (
                <div
                  className="sts-shooter"
                  key={shooter.id}
                  style={{ left: `${shooter.x}%`, '--shot-phase': `${(shooter.id % 7) * -0.11}s` } as CSSProperties}
                >
                  <GlassVisual recipe={recipe} />
                </div>
              )
            })}
          </div>

          <div className={`sts-hand ${grab ? 'is-grabbing' : ''}`} key={`hand-${grab?.token ?? 0}`} aria-hidden="true">
            <span className="sts-hand-thumb" />
            <span className="sts-hand-palm" />
            <span className="sts-hand-finger f1" />
            <span className="sts-hand-finger f2" />
            <span className="sts-hand-finger f3" />
          </div>

          {grabRecipe && grab && (
            <div className="sts-grabbed" key={`grab-${grab.token}`} aria-hidden="true">
              <GlassVisual recipe={grabRecipe} />
            </div>
          )}

          {missToken > 0 && <div className="sts-miss" key={`miss-${missToken}`} aria-hidden="true">MISS</div>}
        </div>

        <div className="sts-reveal" aria-live="polite">
          {lastRecipe ? (
            <>
              <GlassVisual recipe={lastRecipe} mini />
              <div>
                <strong>{lastRecipe.name}</strong>
                <span className={lastRecipe.effect < 0 ? 'is-sobering' : 'is-boozy'}>{effectLabel(lastRecipe.effect)} ALCOOL</span>
              </div>
            </>
          ) : (
            <span>Tu ne connais l’effet d’un shoot qu’après l’avoir bu.</span>
          )}
        </div>
      </section>

      <section className="sts-discovery" aria-label="Recettes découvertes">
        <div className="sts-discovery-heading">
          <span>BAR MEMORY</span>
          <strong>{view.discovered.length}/{recipes.length}</strong>
        </div>
        <div className="sts-recipe-row">
          {discoveredRecipes.length === 0 ? (
            <div className="sts-unknown">???</div>
          ) : discoveredRecipes.map((recipe) => (
            <div className="sts-recipe-chip" key={recipe.id}>
              <GlassVisual recipe={recipe} mini />
              <div>
                <strong>{recipe.name}</strong>
                <span className={recipe.effect < 0 ? 'is-sobering' : 'is-boozy'}>{effectLabel(recipe.effect)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sts-hint">
        {view.finished
          ? view.endReason === 'coma' ? 'Tu as dépassé la limite.' : 'La ligne s’est arrêtée.'
          : 'Bois pour garder le bar en mouvement.'}
      </div>

      {grabRecipe && grab && (
        <div className={`sts-impact ${grabRecipe.effect < 0 ? 'is-sobering' : 'is-boozy'}`} key={`impact-${grab.token}`} aria-hidden="true">
          <span>{grabRecipe.name}</span>
          <strong>{effectLabel(grabRecipe.effect)}</strong>
        </div>
      )}

      {view.finished && (
        <div className={`sts-ending is-${view.endReason}`} aria-hidden="true">
          <strong>{view.endReason === 'coma' ? 'COMA' : 'LAST CALL'}</strong>
        </div>
      )}
    </div>
  )
}
