import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './ShootTheShooter.css'
import './ShootTheShooter.mobile-fix.css'
import './ShootTheShooter.landscape.css'

type GlassType = 'classic' | 'tapered' | 'tall' | 'heavy' | 'flared' | 'mini'
type LiquidPattern = 'solid' | 'gradient' | 'layered'
type RecipeRole = 'mild' | 'sobering' | 'bomb'

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
  role: RecipeRole
  spawnWeight: number
}

type Shooter = {
  id: number
  recipeId: number
  x: number
}

type EndReason = 'coma' | 'misses' | 'last-call'

type World = {
  recipes: Recipe[]
  recipeById: Map<number, Recipe>
  shooters: Shooter[]
  discovered: Set<number>
  score: number
  alcohol: number
  peakAlcohol: number
  misses: number
  speed: number
  elapsed: number
  idleSeconds: number
  spawnDistance: number
  nextShooterId: number
  aimX: number
  finished: boolean
  endReason: EndReason | null
  lastRecipeId: number | null
  random: () => number
}

type View = {
  shooters: Shooter[]
  discovered: number[]
  score: number
  alcohol: number
  misses: number
  speed: number
  aimX: number
  finished: boolean
  endReason: EndReason | null
  lastRecipeId: number | null
}

type GrabState = {
  recipeId: number
  token: number
  x: number
}

const MAX_MISSES = 3
const START_SPEED = 14
const CRUISE_SPEED = 19
const MAX_SPEED = 31
const SPEED_BOOST = 1.8
const IDLE_SLOW_AFTER = 4.5
const IDLE_END_AFTER = 12
const DRINK_RANGE = 6.6
const SHOOTER_WIDTH = 8.2
const BASE_AIM_X = 83

const GLASSES: GlassType[] = ['classic', 'tapered', 'tall', 'heavy', 'flared', 'mini']
const NAMES = [
  'Velours Rouge',
  'Larme du Patron',
  'Pétrole Doux',
  'Baiser Froid',
  'Dernier Métro',
  'Petit Jésus',
  'Marteau Rose',
  'Dent de Requin',
  'Mauvaise Idée',
  'Lendemain 8h',
  'Tonton Gérard',
  'Sortie de Route',
  'Eau Bénite',
  'Lune Noire',
  'Feu Follet',
]

const COLORS = [
  ['#f83a63', '#ff9c3b'],
  ['#5d2eff', '#e537ff'],
  ['#16c99a', '#8affbd'],
  ['#f7c844', '#ff6f2f'],
  ['#29b6f6', '#1858d9'],
  ['#ff77bd', '#ff355e'],
  ['#d8d2ff', '#8e77ff'],
  ['#b26932', '#f0a24b'],
  ['#6ce1ff', '#ef82ff'],
  ['#f0f2ee', '#b6d8c3'],
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

function pick<T>(random: () => number, values: readonly T[]) {
  return values[Math.floor(random() * values.length)]
}

function shuffle<T>(random: () => number, values: T[]) {
  const next = [...values]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[next[index], next[target]] = [next[target], next[index]]
  }
  return next
}

function makeLiquid(random: () => number): LiquidStyle {
  const pair = pick(random, COLORS)
  const pattern = pick(random, ['solid', 'gradient', 'layered'] as const)
  return {
    a: pair[0],
    b: pair[1],
    angle: 120 + Math.round(random() * 90),
    pattern,
  }
}

function makeRecipes(random: () => number): Recipe[] {
  const names = shuffle(random, NAMES).slice(0, 5)
  const effects = shuffle(random, [8, 11, 14, -17, 34])
  const roles: RecipeRole[] = effects.map((effect) => effect < 0 ? 'sobering' : effect >= 30 ? 'bomb' : 'mild')
  const glasses = shuffle(random, GLASSES).slice(0, 5)

  return names.map((name, index) => ({
    id: index + 1,
    glass: glasses[index],
    liquid: makeLiquid(random),
    name,
    effect: effects[index],
    role: roles[index],
    spawnWeight: roles[index] === 'mild' ? 1.3 : roles[index] === 'sobering' ? .75 : .58,
  }))
}

function weightedRecipe(random: () => number, recipes: Recipe[], previousRecipeId: number | null) {
  const pool = recipes.flatMap((recipe) => {
    const weight = recipe.id === previousRecipeId ? recipe.spawnWeight * .35 : recipe.spawnWeight
    const copies = Math.max(1, Math.round(weight * 10))
    return Array.from({ length: copies }, () => recipe)
  })
  return pick(random, pool)
}

function spawnShooter(world: World, x = -SHOOTER_WIDTH) {
  const previous = world.shooters.at(-1)?.recipeId ?? null
  const recipe = weightedRecipe(world.random, world.recipes, previous)
  world.shooters.push({ id: world.nextShooterId, recipeId: recipe.id, x })
  world.nextShooterId += 1
}

function createWorld(seed: number): World {
  const random = mulberry32(seed || 1)
  const recipes = makeRecipes(random)
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const world: World = {
    recipes,
    recipeById,
    shooters: [],
    discovered: new Set(),
    score: 0,
    alcohol: 0,
    peakAlcohol: 0,
    misses: 0,
    speed: START_SPEED,
    elapsed: 0,
    idleSeconds: 0,
    spawnDistance: 0,
    nextShooterId: 1,
    aimX: BASE_AIM_X,
    finished: false,
    endReason: null,
    lastRecipeId: null,
    random,
  }

  spawnShooter(world, 18)
  spawnShooter(world, -4)
  return world
}

function snapshot(world: World): View {
  return {
    shooters: world.shooters.map((shooter) => ({ ...shooter })),
    discovered: [...world.discovered],
    score: world.score,
    alcohol: world.alcohol,
    misses: world.misses,
    speed: world.speed,
    aimX: world.aimX,
    finished: world.finished,
    endReason: world.endReason,
    lastRecipeId: world.lastRecipeId,
  }
}

function effectLabel(effect: number) {
  return effect < 0 ? `${effect}%` : `+${effect}%`
}

function drunkClass(alcohol: number) {
  if (alcohol >= 90) return 'is-blackout'
  if (alcohol >= 72) return 'is-wasted'
  if (alcohol >= 48) return 'is-drunk'
  if (alcohol >= 30) return 'is-tipsy'
  return 'is-sober'
}

function GlassVisual({ recipe, mini = false }: { recipe: Recipe; mini?: boolean }) {
  return (
    <span
      className={`${mini ? 'sts-glass-icon' : 'sts-glass'} is-${recipe.glass}`}
      style={{
        '--liquid-a': recipe.liquid.a,
        '--liquid-b': recipe.liquid.b,
        '--liquid-angle': `${recipe.liquid.angle}deg`,
      } as CSSProperties}
      aria-hidden="true"
    >
      <span className={`sts-liquid is-${recipe.liquid.pattern}`} />
      <span className="sts-glass-shine" />
    </span>
  )
}

export function ShootTheShooter({ active, seed, restartToken, session }: GameComponentProps) {
  const worldRef = useRef<World>(createWorld(seed))
  const [view, setView] = useState<View>(() => snapshot(worldRef.current))
  const [grab, setGrab] = useState<GrabState | null>(null)
  const [missToken, setMissToken] = useState(0)
  const grabTokenRef = useRef(0)
  const grabTimerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const finishedRef = useRef(false)

  const recipes = worldRef.current.recipes
  const recipeById = worldRef.current.recipeById
  const discovered = useMemo(() => new Set(view.discovered), [view.discovered])

  const finishRun = useCallback((reason: EndReason) => {
    const world = worldRef.current
    if (finishedRef.current || world.finished) return
    finishedRef.current = true
    world.finished = true
    world.endReason = reason
    setView(snapshot(world))
    session.finish({
      score: world.score,
      metadata: {
        peakAlcohol: Math.round(world.peakAlcohol),
        discovered: world.discovered.size,
        misses: world.misses,
        reason,
      },
    })
  }, [session])

  useEffect(() => {
    const world = createWorld(seed)
    worldRef.current = world
    finishedRef.current = false
    setView(snapshot(world))
    setGrab(null)
    setMissToken(0)
    grabTokenRef.current = 0
    lastFrameRef.current = null
    session.setScore(0)
  }, [restartToken, seed, session])

  useEffect(() => () => {
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  useEffect(() => {
    if (!active || finishedRef.current) {
      lastFrameRef.current = null
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      return
    }

    const tick = (time: number) => {
      const previous = lastFrameRef.current ?? time
      const dt = Math.min(.045, Math.max(0, (time - previous) / 1000))
      lastFrameRef.current = time
      const world = worldRef.current

      world.elapsed += dt
      world.idleSeconds += dt

      if (world.idleSeconds > IDLE_SLOW_AFTER) {
        const slowFactor = Math.min(1, (world.idleSeconds - IDLE_SLOW_AFTER) / 3.5)
        world.speed = Math.max(7.2, world.speed - dt * (2.4 + slowFactor * 3.2))
      } else if (world.speed < CRUISE_SPEED) {
        world.speed = Math.min(CRUISE_SPEED, world.speed + dt * 2.8)
      }

      const intoxication = Math.min(1, world.alcohol / 100)
      const wobble =
        Math.sin(world.elapsed * (1.1 + intoxication * 1.8)) * intoxication * 4.4 +
        Math.sin(world.elapsed * (2.7 + intoxication * 2.4) + 1.8) * intoxication * intoxication * 4.1
      world.aimX = Math.max(70, Math.min(92, BASE_AIM_X + wobble))

      for (const shooter of world.shooters) shooter.x += world.speed * dt
      world.spawnDistance += world.speed * dt

      const spacing = Math.max(13.2, 21 - world.speed * .22)
      if (world.spawnDistance >= spacing) {
        world.spawnDistance %= spacing
        spawnShooter(world)
      }

      let missed = false
      world.shooters = world.shooters.filter((shooter) => {
        if (shooter.x <= 108) return true
        world.misses += 1
        missed = true
        return false
      })
      if (missed) setMissToken((value) => value + 1)

      setView(snapshot(world))

      if (world.misses >= MAX_MISSES) {
        finishRun('misses')
        return
      }
      if (world.idleSeconds >= IDLE_END_AFTER) {
        finishRun('last-call')
        return
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [active, finishRun])

  const drink = useCallback(() => {
    if (!active || finishedRef.current) return
    const world = worldRef.current
    if (world.finished) return

    let bestIndex = -1
    let bestDistance = Infinity
    for (let index = 0; index < world.shooters.length; index += 1) {
      const shooter = world.shooters[index]
      const distance = Math.abs(shooter.x - view.aimX)
      if (distance <= DRINK_RANGE && distance < bestDistance) {
        bestDistance = distance
        bestIndex = index
      }
    }

    if (bestIndex < 0) {
      world.misses += 1
      setMissToken((value) => value + 1)
      setView(snapshot(world))
      if (world.misses >= MAX_MISSES) finishRun('misses')
      return
    }

    const [shooter] = world.shooters.splice(bestIndex, 1)
    const recipe = recipeById.get(shooter.recipeId)
    if (!recipe) return
    const grabbedAt = shooter.x

    world.alcohol = Math.max(0, Math.min(100, world.alcohol + recipe.effect))
    world.score += 1
    world.peakAlcohol = Math.max(world.peakAlcohol, world.alcohol)
    world.idleSeconds = 0
    world.speed = Math.min(MAX_SPEED, Math.max(CRUISE_SPEED, world.speed) + SPEED_BOOST)
    world.discovered.add(recipe.id)
    world.lastRecipeId = recipe.id

    grabTokenRef.current += 1
    setGrab({ recipeId: recipe.id, token: grabTokenRef.current, x: grabbedAt })
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
    grabTimerRef.current = window.setTimeout(() => setGrab(null), 700)

    session.setScore(world.score)
    setView(snapshot(world))

    if (world.alcohol >= 100) finishRun('coma')
  }, [active, finishRun, recipeById, session, view.aimX, view.shooters])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    drink()
  }

  const grabRecipe = grab ? recipeById.get(grab.recipeId) ?? null : null
  const intoxication = view.alcohol < 30
    ? 0
    : Math.min(1, 0.18 + ((view.alcohol - 30) / 70) * 0.82)
  const visualStyle = {
    '--sts-hue': `${Math.max(0, view.alcohol - 25) * 1.3}deg`,
    '--sts-saturation': `${1 + Math.max(0, view.alcohol - 25) / 48}`,
    '--sts-double': `${Math.max(0, view.alcohol - 48) / 8}px`,
    '--sts-blur': `${Math.max(0, view.alcohol - 80) / 18}px`,
    '--sts-wave-opacity': `${intoxication * 0.78}`,
    '--sts-pixel-opacity': `${intoxication * 0.46}`,
    '--sts-pixel-size': `${Math.max(7, 16 - intoxication * 8)}px`,
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

        <div className="sts-miss-lives" aria-label={`${MAX_MISSES - view.misses} erreurs restantes`}>
          {Array.from({ length: MAX_MISSES }, (_, index) => (
            <span key={index} className={index < view.misses ? 'is-lost' : ''} aria-hidden="true" />
          ))}
        </div>
      </section>

      <section className="sts-stage">
        <div className="sts-callout">
          {view.finished
            ? view.endReason === 'coma'
              ? 'COMA ÉTHYLIQUE'
              : view.endReason === 'misses'
                ? '3 VERRES RATÉS'
                : 'LAST CALL'
            : view.alcohol >= 90 ? 'VISE LE POINT. PAS LE VERRE.' : 'TAPE QUAND LE VERRE CROISE LE POINT'}
        </div>

        <div
          ref={trackRef}
          className="sts-track"
          role="button"
          tabIndex={0}
          aria-label="Les shooters arrivent de gauche. Touchez quand un verre croise le point de visée au-dessus de la main."
          onPointerDown={(event) => {
            event.preventDefault()
            drink()
          }}
          onKeyDown={onKeyDown}
        >
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

          <div className="sts-wave-layer" aria-hidden="true" />
          <div className="sts-pixel-layer" aria-hidden="true" />

          <div className="sts-aim" style={{ left: `${view.aimX}%` }} aria-hidden="true">
            <span />
          </div>

          <div
            className={`sts-hand ${grab ? 'is-grabbing' : ''}`}
            key={`hand-${grab?.token ?? 0}`}
            style={{ left: `${grab?.x ?? BASE_AIM_X}%` }}
            aria-hidden="true"
          >
            <span className="sts-hand-emoji">🤏</span>
          </div>

          {grabRecipe && grab && (
            <div
              className="sts-grabbed"
              key={`grab-${grab.token}`}
              style={{ '--grab-x': `${grab.x}%` } as CSSProperties}
              aria-hidden="true"
            >
              <GlassVisual recipe={grabRecipe} />
            </div>
          )}

          {missToken > 0 && (
            <div className="sts-miss" key={`miss-${missToken}`} style={{ left: `${view.aimX}%` }} aria-hidden="true">
              RATÉ · {Math.min(view.misses, MAX_MISSES)}/{MAX_MISSES}
            </div>
          )}
        </div>
      </section>

      <section className="sts-menu" aria-label="Carte des shooters de cette partie">
        <div className="sts-menu-heading">
          <span>CE SOIR · 5 SHOOTS</span>
          <strong>{view.discovered.length}/5 GOÛTÉS</strong>
        </div>
        <div className="sts-recipe-grid" style={{ '--recipe-count': recipes.length } as CSSProperties}>
          {recipes.map((recipe) => {
            const known = discovered.has(recipe.id)
            return (
              <div className={`sts-recipe-card ${known ? 'is-known' : ''}`} key={recipe.id}>
                <GlassVisual recipe={recipe} mini />
                <strong>{recipe.name}</strong>
                <span className={known ? recipe.effect < 0 ? 'is-sobering' : 'is-boozy' : 'is-unknown'}>
                  {known ? effectLabel(recipe.effect) : '???'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="sts-hint">
        {view.finished
          ? view.endReason === 'coma'
            ? 'Tu as dépassé la limite.'
            : view.endReason === 'misses'
              ? 'Trois erreurs : bar fermé.'
              : 'Tu as arrêté de boire trop longtemps.'
          : '3 erreurs maximum. La cible visible est la vraie zone de prise.'}
      </div>

      {grabRecipe && grab && (
        <div className={`sts-impact ${grabRecipe.effect < 0 ? 'is-sobering' : grabRecipe.role === 'bomb' ? 'is-bomb' : 'is-boozy'}`} key={`impact-${grab.token}`} aria-hidden="true">
          <span>{grabRecipe.name}</span>
          <strong>{effectLabel(grabRecipe.effect)}</strong>
        </div>
      )}

      {view.finished && (
        <div className={`sts-ending is-${view.endReason}`} aria-hidden="true">
          <strong>{view.endReason === 'coma' ? 'COMA' : view.endReason === 'misses' ? '3 MISSES' : 'LAST CALL'}</strong>
        </div>
      )}
    </div>
  )
}
