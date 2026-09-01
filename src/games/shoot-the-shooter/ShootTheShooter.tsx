import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './ShootTheShooter.css'

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
  aimX: number
  aimTargetX: number
  aimTimer: number
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
  aimX: number
}

type GrabState = {
  recipeId: number
  token: number
  x: number
}

const BASE_AIM_X = 80
const HIT_RADIUS = 5.8
const START_SPEED = 10.5
const MAX_SPEED = 18
const FRICTION_PER_SECOND = 0.56
const SPEED_BOOST = 1.35
const MISS_PENALTY = 1.25

const glassTypes: GlassType[] = ['classic', 'tapered', 'tall', 'heavy', 'flared', 'mini']

const liquids: LiquidStyle[] = [
  { a: '#ff285f', b: '#ff285f', angle: 180, pattern: 'solid' },
  { a: '#6a35ff', b: '#ff4fd8', angle: 145, pattern: 'gradient' },
  { a: '#00e5ff', b: '#1565ff', angle: 180, pattern: 'gradient' },
  { a: '#b6ff3b', b: '#22d8a0', angle: 160, pattern: 'gradient' },
  { a: '#ffdd38', b: '#ff722e', angle: 180, pattern: 'gradient' },
  { a: '#ff8ad8', b: '#fff0f8', angle: 180, pattern: 'layered' },
  { a: '#171a2a', b: '#7650ff', angle: 180, pattern: 'layered' },
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
  const recipeCount = pickInt(random, 3, 5)
  const combos = shuffle(
    glassTypes.flatMap((glass) => liquids.map((liquid) => ({ glass, liquid }))),
    random,
  ).slice(0, recipeCount)

  const roles: RecipeRole[] = ['sobering', 'bomb']
  while (roles.length < recipeCount) roles.push('mild')
  const shuffledRoles = shuffle(roles, random)
  const usedNames = new Set<string>()

  return combos.map((combo, index): Recipe => {
    let name = ''
    for (let attempt = 0; attempt < 10; attempt += 1) {
      name = `${nameStarts[Math.floor(random() * nameStarts.length)]} ${nameEnds[Math.floor(random() * nameEnds.length)]}`
      if (!usedNames.has(name)) break
    }
    if (usedNames.has(name)) name = `${name} #${index + 1}`
    usedNames.add(name)

    const role = shuffledRoles[index]
    const effect = role === 'sobering'
      ? -pickInt(random, 12, 18)
      : role === 'bomb'
        ? pickInt(random, 19, 26)
        : pickInt(random, 4, 8)

    return {
      id: index,
      ...combo,
      name,
      role,
      effect,
      spawnWeight: role === 'sobering' ? 0.48 : role === 'bomb' ? 0.72 : 1,
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
    aimX: BASE_AIM_X,
    aimTargetX: BASE_AIM_X,
    aimTimer: 0,
    random: mulberry32((seed ^ 0x9e3779b9) >>> 0 || 1),
  }

  let x = -12
  while (x < 110) {
    pushShooter(world, recipes, x)
    x += 16 + world.random() * 7
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
    aimX: world.aimX,
  }
}

function effectLabel(effect: number) {
  return `${effect > 0 ? '+' : '−'}${Math.abs(effect)}%`
}

function drunkClass(alcohol: number) {
  if (alcohol >= 90) return 'is-blackout'
  if (alcohol >= 72) return 'is-wasted'
  if (alcohol >= 50) return 'is-drunk'
  if (alcohol >= 30) return 'is-tipsy'
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
  const discovered = useMemo(() => new Set(view.discovered), [view.discovered])

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
    let renderAccumulator = 0

    const animate = (now: number) => {
      const world = worldRef.current
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000))
      previous = now

      if (!world.finished) {
        world.speed = Math.max(0, world.speed - FRICTION_PER_SECOND * dt)
        const distance = world.speed * dt
        world.shooters.forEach((shooter) => {
          shooter.x += distance
        })
        world.shooters = world.shooters.filter((shooter) => shooter.x < 114)

        let leftmost = world.shooters.reduce((min, shooter) => Math.min(min, shooter.x), Number.POSITIVE_INFINITY)
        if (!Number.isFinite(leftmost)) leftmost = 18
        while (leftmost > -18) {
          leftmost -= 16 + world.random() * 7
          pushShooter(world, recipes, leftmost)
        }

        const drunk = Math.max(0, Math.min(1, (world.alcohol - 28) / 72))
        if (drunk <= 0) {
          world.aimTargetX = BASE_AIM_X
          world.aimX += (BASE_AIM_X - world.aimX) * Math.min(1, dt * 8)
        } else {
          world.aimTimer -= dt
          if (world.aimTimer <= 0) {
            const maxOffset = 1.5 + drunk * 8.5
            world.aimTargetX = BASE_AIM_X + (world.random() * 2 - 1) * maxOffset
            world.aimTimer = 0.18 + (1 - drunk) * 0.22 + world.random() * 0.18
          }
          const follow = Math.min(1, dt * (5 + drunk * 10))
          world.aimX += (world.aimTargetX - world.aimX) * follow
        }

        if (world.speed <= 0.02) {
          finishRun('last-call')
          return
        }

        renderAccumulator += dt
        if (renderAccumulator >= 1 / 30) {
          renderAccumulator = 0
          setView(snapshot(world))
        }
      }

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, finishRun, recipes])

  const drink = useCallback(() => {
    const world = worldRef.current
    if (!active || world.finished) return

    const tolerance = Math.max(4.25, HIT_RADIUS - world.alcohol * 0.014)
    let target: Shooter | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const shooter of world.shooters) {
      const distance = Math.abs(shooter.x - world.aimX)
      if (distance <= tolerance && distance < bestDistance) {
        target = shooter
        bestDistance = distance
      }
    }

    if (!target) {
      world.speed = Math.max(0, world.speed - MISS_PENALTY)
      setView(snapshot(world))
      setMissToken((value) => value + 1)
      return
    }

    const recipe = recipeById.get(target.recipeId)
    if (!recipe) return

    const grabbedAt = world.aimX
    world.shooters = world.shooters.filter((shooter) => shooter.id !== target?.id)
    world.score += 1
    world.alcohol = Math.max(0, Math.min(100, world.alcohol + recipe.effect))
    world.peakAlcohol = Math.max(world.peakAlcohol, world.alcohol)
    world.speed = Math.min(MAX_SPEED, world.speed + SPEED_BOOST)
    world.discovered.add(recipe.id)
    world.lastRecipeId = recipe.id

    grabTokenRef.current += 1
    setGrab({ recipeId: recipe.id, token: grabTokenRef.current, x: grabbedAt })
    if (grabTimerRef.current !== null) window.clearTimeout(grabTimerRef.current)
    grabTimerRef.current = window.setTimeout(() => setGrab(null), 620)

    session.setScore(world.score)
    setView(snapshot(world))

    if (world.alcohol >= 100) finishRun('coma')
  }, [active, finishRun, recipeById, session])

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
      </section>

      <section className="sts-stage">
        <div className="sts-callout">
          {view.finished
            ? view.endReason === 'coma' ? 'COMA ÉTHYLIQUE' : 'LAST CALL'
            : view.alcohol >= 90 ? 'VISE LE POINT. PAS LE VERRE.' : 'TAPE QUAND LE VERRE CROISE LE POINT'}
        </div>

        <div
          className="sts-track"
          role="button"
          tabIndex={0}
          aria-label="Les shooters arrivent de gauche. Touchez quand un verre croise le point de visée près de la main."
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

          <div className={`sts-hand ${grab ? 'is-grabbing' : ''}`} key={`hand-${grab?.token ?? 0}`} aria-hidden="true">
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
              MISS · SLOW
            </div>
          )}
        </div>
      </section>

      <section className="sts-menu" aria-label="Carte des shooters de cette partie">
        <div className="sts-menu-heading">
          <span>CE SOIR · {recipes.length} SHOOTS</span>
          <strong>{view.discovered.length}/{recipes.length} GOÛTÉS</strong>
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
          ? view.endReason === 'coma' ? 'Tu as dépassé la limite.' : 'La ligne s’est arrêtée.'
          : 'Un miss ralentit la ligne. Chaque verre bu la relance.'}
      </div>

      {grabRecipe && grab && (
        <div className={`sts-impact ${grabRecipe.effect < 0 ? 'is-sobering' : grabRecipe.role === 'bomb' ? 'is-bomb' : 'is-boozy'}`} key={`impact-${grab.token}`} aria-hidden="true">
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
