import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './ShootTheShooter.css'

type Shape = 'circle' | 'diamond' | 'triangle' | 'square' | 'hexagon' | 'star'

type Recipe = {
  id: number
  color: string
  colorName: string
  shape: Shape
  name: string
  effect: number
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

const HIT_X = 50
const HIT_RADIUS = 7.2
const START_SPEED = 17
const MAX_SPEED = 31
const FRICTION_PER_SECOND = 1.15
const SPEED_BOOST = 2.15

const colors = [
  ['#ff3b5c', 'Red'],
  ['#4d8dff', 'Blue'],
  ['#72e48c', 'Green'],
  ['#ffd447', 'Yellow'],
  ['#b269ff', 'Purple'],
  ['#ff8b3d', 'Orange'],
  ['#28d9d2', 'Cyan'],
  ['#ff72c6', 'Pink'],
] as const

const shapes: Shape[] = ['circle', 'diamond', 'triangle', 'square', 'hexagon', 'star']

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

function createRecipes(seed: number) {
  const random = mulberry32(seed || 1)
  const recipeCount = pickInt(random, 10, 20)
  const combos = shuffle(
    colors.flatMap(([color, colorName]) => shapes.map((shape) => ({ color, colorName, shape }))),
    random,
  ).slice(0, recipeCount)

  const soberingSlots = new Set(shuffle(Array.from({ length: recipeCount }, (_, index) => index), random).slice(0, Math.max(2, Math.round(recipeCount * 0.22))))
  const usedNames = new Set<string>()

  return combos.map((combo, index): Recipe => {
    let name = ''
    for (let attempt = 0; attempt < 8; attempt += 1) {
      name = `${nameStarts[Math.floor(random() * nameStarts.length)]} ${nameEnds[Math.floor(random() * nameEnds.length)]}`
      if (!usedNames.has(name)) break
    }
    if (usedNames.has(name)) name = `${name} #${index + 1}`
    usedNames.add(name)

    const effect = soberingSlots.has(index)
      ? -pickInt(random, 7, 18)
      : pickInt(random, 3, random() < 0.18 ? 21 : 15)

    return {
      id: index,
      ...combo,
      name,
      effect,
    }
  })
}

function createWorld(recipes: Recipe[], seed: number): World {
  const random = mulberry32((seed ^ 0x9e3779b9) >>> 0 || 1)
  const shooters: Shooter[] = []
  let x = 16
  let nextShooterId = 0

  while (x < 132) {
    shooters.push({
      id: nextShooterId,
      recipeId: Math.floor(random() * recipes.length),
      x,
    })
    nextShooterId += 1
    x += 14 + random() * 8
  }

  return {
    shooters,
    nextShooterId,
    score: 0,
    alcohol: 0,
    peakAlcohol: 0,
    speed: START_SPEED,
    discovered: new Set<number>(),
    lastRecipeId: null,
    finished: false,
    endReason: null,
    random,
  }
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
  if (alcohol >= 30) return 'is-tipsy'
  return 'is-sober'
}

export function ShootTheShooter({ active, seed, restartToken, session }: GameComponentProps) {
  const runSeed = useMemo(() => (seed ^ Math.imul(restartToken + 1, 0x45d9f3b)) >>> 0, [restartToken, seed])
  const recipes = useMemo(() => createRecipes(runSeed), [runSeed])
  const worldRef = useRef<World>(createWorld(recipes, runSeed))
  const [view, setView] = useState<RenderState>(() => snapshot(worldRef.current))

  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes])

  const finishRun = useCallback((reason: EndReason) => {
    const world = worldRef.current
    if (world.finished) return

    world.finished = true
    world.endReason = reason
    world.speed = 0
    setView(snapshot(world))
    session.finish({
      score: world.score,
      metadata: {
        end: reason,
        alcoholPeak: Math.round(world.peakAlcohol),
        finalAlcohol: Math.round(world.alcohol),
        recipesDiscovered: world.discovered.size,
      },
    })
  }, [session])

  useEffect(() => {
    worldRef.current = createWorld(recipes, runSeed)
    setView(snapshot(worldRef.current))
    session.setScore(0)
  }, [recipes, runSeed, session])

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
        while (furthest < 125) {
          furthest += 14 + world.random() * 8
          world.shooters.push({
            id: world.nextShooterId,
            recipeId: Math.floor(world.random() * recipes.length),
            x: furthest,
          })
          world.nextShooterId += 1
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
  }, [active, finishRun, recipes.length])

  const drink = useCallback(() => {
    const world = worldRef.current
    if (!active || world.finished) return

    let target: Shooter | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const shooter of world.shooters) {
      const distance = Math.abs(shooter.x - HIT_X)
      if (distance <= HIT_RADIUS && distance < bestDistance) {
        target = shooter
        bestDistance = distance
      }
    }

    if (!target) return

    const recipe = recipeById.get(target.recipeId)
    if (!recipe) return

    world.shooters = world.shooters.filter((shooter) => shooter.id !== target?.id)
    world.score += 1
    world.alcohol = Math.max(0, Math.min(100, world.alcohol + recipe.effect))
    world.peakAlcohol = Math.max(world.peakAlcohol, world.alcohol)
    world.speed = Math.min(MAX_SPEED, world.speed + SPEED_BOOST)
    world.discovered.add(recipe.id)
    world.lastRecipeId = recipe.id

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
  const discoveredRecipes = view.discovered
    .map((id) => recipeById.get(id))
    .filter((recipe): recipe is Recipe => Boolean(recipe))
    .slice(-8)
    .reverse()

  const visualStyle = {
    '--sts-blur': `${Math.max(0, (view.alcohol - 55) / 40)}px`,
    '--sts-hue': `${Math.max(0, view.alcohol - 28) * 0.72}deg`,
    '--sts-saturation': `${1 + view.alcohol / 115}`,
    '--sts-distort': `${Math.max(0, view.alcohol - 60) / 25}px`,
  } as CSSProperties

  return (
    <div className={`sts-game ${drunkClass(view.alcohol)}`} style={visualStyle}>
      <div className="sts-ambient" aria-hidden="true" />

      <section className="sts-topbar" aria-label="État de la partie">
        <div className="sts-momentum">
          <span>MOMENTUM</span>
          <div className="sts-momentum-track">
            <i style={{ width: `${Math.max(0, Math.min(100, (view.speed / MAX_SPEED) * 100))}%` }} />
          </div>
        </div>

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
            : 'TAPE QUAND LE SHOOT EST AU CENTRE'}
        </div>

        <div
          className="sts-track"
          role="button"
          tabIndex={0}
          aria-label="Ligne de shooters. Touchez quand un shooter passe dans la zone centrale."
          onPointerDown={(event) => {
            event.preventDefault()
            drink()
          }}
          onKeyDown={onKeyDown}
        >
          <div className="sts-hit-zone" aria-hidden="true">
            <span>DRINK</span>
          </div>

          <div className="sts-belt" aria-hidden="true">
            {view.shooters.map((shooter) => {
              const recipe = recipeById.get(shooter.recipeId)
              if (!recipe) return null
              return (
                <div
                  className="sts-shooter"
                  key={shooter.id}
                  style={{ left: `${shooter.x}%`, '--shot-color': recipe.color } as CSSProperties}
                >
                  <div className="sts-glass">
                    <div className="sts-liquid" />
                    <div className={`sts-shape is-${recipe.shape}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={`sts-reveal ${lastRecipe ? 'has-recipe' : ''}`} aria-live="polite">
          {lastRecipe ? (
            <>
              <span className={`sts-mini-shape is-${lastRecipe.shape}`} style={{ '--shot-color': lastRecipe.color } as CSSProperties} />
              <div>
                <strong>{lastRecipe.name}</strong>
                <span className={lastRecipe.effect < 0 ? 'is-sobering' : 'is-boozy'}>{effectLabel(lastRecipe.effect)} ALCOOL</span>
              </div>
            </>
          ) : (
            <span>Chaque recette révèle son effet après le premier shoot.</span>
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
              <span className={`sts-mini-shape is-${recipe.shape}`} style={{ '--shot-color': recipe.color } as CSSProperties} />
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
          ? `${view.score} shoot${view.score === 1 ? '' : 's'} · pic ${Math.round(view.peakAlcohol)}%`
          : view.speed < 7 ? 'ÇA CALE — BOIS VITE' : 'Bois pour garder la ligne en mouvement'}
      </div>
    </div>
  )
}
