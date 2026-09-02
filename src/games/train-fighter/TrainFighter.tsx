import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { GameComponentProps } from '../../core/types'
import './TrainFighter.css'

type PickupKind = 'coin' | 'weapon' | 'wagon' | 'shield' | 'turbo'
type TrackObjectKind = PickupKind | 'enemy'

type TrackObject = {
  id: number
  kind: TrackObjectKind
  lane: number
  y: number
  tier: number
  value: number
  wobble: number
}

type Floater = {
  id: number
  text: string
  tone: 'good' | 'bad' | 'info'
  ttl: number
}

type World = {
  random: () => number
  elapsed: number
  distance: number
  biomeIndex: number
  biomeDistance: number
  lane: number
  wagons: number
  coins: number
  weapon: number
  armor: number
  shields: number
  turbo: number
  kills: number
  objects: TrackObject[]
  floaters: Floater[]
  nextId: number
  spawnClock: number
  junctionClock: number
  junctionPulse: number
  stationOpen: boolean
  finished: boolean
  finishReported: boolean
  reportClock: number
  viewClock: number
}

type View = {
  distance: number
  biomeIndex: number
  biomeDistance: number
  lane: number
  laneCount: number
  wagons: number
  coins: number
  weapon: number
  armor: number
  shields: number
  turbo: number
  kills: number
  objects: TrackObject[]
  floaters: Floater[]
  junctionPulse: number
  stationOpen: boolean
  finished: boolean
  score: number
}

const BIOME_LENGTH = 520
const MAX_WAGONS = 10
const LANE_COUNTS = [3, 4, 4, 5] as const

const BIOMES = [
  { key: 'forest', name: 'Mossy Forest', short: 'FOREST' },
  { key: 'desert', name: 'Red Canyon', short: 'CANYON' },
  { key: 'mountain', name: 'Cloud Mountain', short: 'MOUNTAIN' },
  { key: 'snow', name: 'Aurora Pass', short: 'AURORA' },
] as const

const WEAPONS = [
  { name: 'Tiny fists', icon: '✊' },
  { name: 'Boxing glove', icon: '🥊' },
  { name: 'Big wrench', icon: '🔧' },
  { name: 'Spring hammer', icon: '🔨' },
  { name: 'Pop cannon', icon: '💥' },
] as const

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function laneCountFor(world: World) {
  return LANE_COUNTS[world.biomeIndex]
}

function scoreFor(world: World) {
  return Math.max(0, Math.round(world.distance + world.coins * 7 + world.kills * 70 + world.wagons * 25 + world.weapon * 90))
}

function snapshot(world: World): View {
  return {
    distance: Math.round(world.distance),
    biomeIndex: world.biomeIndex,
    biomeDistance: world.biomeDistance,
    lane: world.lane,
    laneCount: laneCountFor(world),
    wagons: world.wagons,
    coins: world.coins,
    weapon: world.weapon,
    armor: world.armor,
    shields: world.shields,
    turbo: world.turbo,
    kills: world.kills,
    objects: world.objects.map((object) => ({ ...object })),
    floaters: world.floaters.map((floater) => ({ ...floater })),
    junctionPulse: world.junctionPulse,
    stationOpen: world.stationOpen,
    finished: world.finished,
    score: scoreFor(world),
  }
}

function createWorld(seed: number): World {
  return {
    random: mulberry32(seed || 1),
    elapsed: 0,
    distance: 0,
    biomeIndex: 0,
    biomeDistance: 0,
    lane: 1,
    wagons: 4,
    coins: 0,
    weapon: 0,
    armor: 0,
    shields: 0,
    turbo: 0,
    kills: 0,
    objects: [],
    floaters: [],
    nextId: 1,
    spawnClock: 0.75,
    junctionClock: 4.6,
    junctionPulse: 0,
    stationOpen: false,
    finished: false,
    finishReported: false,
    reportClock: 0,
    viewClock: 0,
  }
}

function addFloater(world: World, text: string, tone: Floater['tone']) {
  world.floaters.unshift({ id: world.nextId++, text, tone, ttl: 1.15 })
  world.floaters = world.floaters.slice(0, 3)
}

function spawnObject(world: World) {
  const random = world.random
  const lanes = laneCountFor(world)
  const roll = random()
  let kind: TrackObjectKind

  const enemyChance = 0.25 + world.biomeIndex * 0.055
  if (roll < enemyChance) kind = 'enemy'
  else if (roll < enemyChance + 0.32) kind = 'coin'
  else if (roll < enemyChance + 0.43) kind = 'weapon'
  else if (roll < enemyChance + 0.54) kind = 'wagon'
  else if (roll < enemyChance + 0.63) kind = 'shield'
  else kind = 'turbo'

  const tier = kind === 'enemy'
    ? clamp(1 + Math.floor(random() * (2 + world.biomeIndex)), 1, 4)
    : 1

  world.objects.push({
    id: world.nextId++,
    kind,
    lane: Math.floor(random() * lanes),
    y: -0.12,
    tier,
    value: kind === 'coin' ? 4 + Math.floor(random() * 8) + world.biomeIndex * 2 : 0,
    wobble: random() * Math.PI * 2,
  })

  const pace = 0.84 - world.biomeIndex * 0.075 - Math.min(0.16, world.elapsed / 180)
  world.spawnClock = Math.max(0.42, pace + random() * 0.34)
}

function resolveObject(world: World, object: TrackObject) {
  if (object.kind === 'coin') {
    world.coins += object.value
    addFloater(world, `+${object.value} COINS`, 'good')
    return
  }

  if (object.kind === 'weapon') {
    if (world.weapon < WEAPONS.length - 1) {
      world.weapon += 1
      addFloater(world, `${WEAPONS[world.weapon].name.toUpperCase()}!`, 'good')
    } else {
      world.coins += 12
      addFloater(world, '+12 COINS', 'good')
    }
    return
  }

  if (object.kind === 'wagon') {
    if (world.wagons < MAX_WAGONS) {
      world.wagons += 1
      addFloater(world, '+1 WAGON', 'good')
    } else {
      world.coins += 10
      addFloater(world, 'FULL TRAIN +10', 'good')
    }
    return
  }

  if (object.kind === 'shield') {
    world.shields = Math.min(3, world.shields + 1)
    addFloater(world, 'BUBBLE SHIELD', 'good')
    return
  }

  if (object.kind === 'turbo') {
    world.turbo = Math.min(7, world.turbo + 3.8)
    addFloater(world, 'TURBO!', 'info')
    return
  }

  const enemyPower = object.tier + Math.floor(world.biomeIndex / 2)
  let damage = Math.max(0, enemyPower - world.weapon - world.armor)
  const absorbed = Math.min(world.shields, damage)
  world.shields -= absorbed
  damage -= absorbed

  const reward = 6 + object.tier * 5 + world.biomeIndex * 3
  world.coins += reward
  world.kills += 1

  if (damage > 0) {
    world.wagons -= damage
    addFloater(world, `KAPOW! −${damage} WAGON${damage > 1 ? 'S' : ''}`, 'bad')
  } else {
    addFloater(world, `SMASH! +${reward}`, 'good')
  }

  if (world.wagons <= 0) {
    world.wagons = 0
    world.finished = true
  }
}

function updateWorld(world: World, dt: number) {
  if (world.finished || world.stationOpen) return

  world.elapsed += dt
  world.turbo = Math.max(0, world.turbo - dt)
  const speed = 24 + world.biomeIndex * 3.4 + (world.turbo > 0 ? 8 : 0)
  world.distance += speed * dt
  world.biomeDistance += speed * dt

  const objectSpeed = 0.31 + world.biomeIndex * 0.022 + (world.turbo > 0 ? 0.045 : 0)
  for (const object of world.objects) object.y += objectSpeed * dt

  const hitLine = 0.735
  const survivors: TrackObject[] = []
  for (const object of world.objects) {
    if (object.y >= hitLine && object.y < hitLine + objectSpeed * dt * 2.4 && object.lane === world.lane) {
      resolveObject(world, object)
    } else if (object.y < 1.12) {
      survivors.push(object)
    }
  }
  world.objects = survivors

  world.spawnClock -= dt
  if (world.spawnClock <= 0) spawnObject(world)

  world.junctionClock -= dt
  world.junctionPulse = Math.max(0, world.junctionPulse - dt)
  if (world.junctionClock <= 0) {
    world.junctionPulse = 1.1
    world.junctionClock = 4.6 + world.random() * 4.2
  }

  world.floaters = world.floaters
    .map((floater) => ({ ...floater, ttl: floater.ttl - dt }))
    .filter((floater) => floater.ttl > 0)

  if (world.biomeDistance >= BIOME_LENGTH) {
    world.biomeDistance = BIOME_LENGTH
    world.objects = []
    if (world.biomeIndex >= BIOMES.length - 1) world.finished = true
    else world.stationOpen = true
  }

  world.reportClock += dt
  world.viewClock += dt
}

function laneLeft(lane: number, laneCount: number) {
  return `${((lane + 0.5) / laneCount) * 100}%`
}

function objectIcon(object: TrackObject) {
  if (object.kind === 'coin') return '●'
  if (object.kind === 'weapon') return WEAPONS[Math.min(WEAPONS.length - 1, object.tier + 1)].icon
  if (object.kind === 'wagon') return '▰'
  if (object.kind === 'shield') return '◉'
  if (object.kind === 'turbo') return '⚡'
  return ''
}

export function TrainFighter({ active, seed, restartToken, session }: GameComponentProps) {
  const worldRef = useRef<World>(createWorld(seed))
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const [view, setView] = useState<View>(() => snapshot(worldRef.current))

  const reset = useCallback(() => {
    worldRef.current = createWorld(seed + restartToken * 9973)
    lastTimeRef.current = null
    const next = snapshot(worldRef.current)
    setView(next)
    session.setScore(next.score)
  }, [restartToken, seed, session])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!active) {
      lastTimeRef.current = null
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }

    const frame = (time: number) => {
      const world = worldRef.current
      const previous = lastTimeRef.current ?? time
      lastTimeRef.current = time
      const dt = Math.min(0.034, Math.max(0, (time - previous) / 1000))

      updateWorld(world, dt)

      if (world.reportClock >= 0.2) {
        world.reportClock = 0
        session.setScore(scoreFor(world))
      }

      if (world.viewClock >= 0.05 || world.finished || world.stationOpen) {
        world.viewClock = 0
        setView(snapshot(world))
      }

      if (world.finished && !world.finishReported) {
        world.finishReported = true
        const finalScore = scoreFor(world)
        session.setScore(finalScore)
        session.finish({
          score: finalScore,
          metadata: {
            biome: BIOMES[world.biomeIndex].key,
            distance: Math.round(world.distance),
            kills: world.kills,
            wagons: world.wagons,
            weapon: world.weapon,
          },
        })
      }

      if (!world.finished) rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }, [active, session])

  const move = useCallback((direction: -1 | 1) => {
    const world = worldRef.current
    if (world.finished || world.stationOpen) return
    world.lane = clamp(world.lane + direction, 0, laneCountFor(world) - 1)
    world.junctionPulse = Math.max(world.junctionPulse, 0.18)
    setView(snapshot(world))
  }, [])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'q') {
        event.preventDefault()
        move(-1)
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault()
        move(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, move])

  const buy = useCallback((kind: 'wagon' | 'weapon' | 'armor') => {
    const world = worldRef.current
    if (!world.stationOpen) return
    const stage = world.biomeIndex + 1
    const costs = {
      wagon: 16 + stage * 4,
      weapon: 24 + stage * 6,
      armor: 30 + stage * 7,
    }
    const cost = costs[kind]
    if (world.coins < cost) {
      addFloater(world, 'NOT ENOUGH COINS', 'bad')
      setView(snapshot(world))
      return
    }

    if (kind === 'wagon' && world.wagons >= MAX_WAGONS) {
      addFloater(world, 'TRAIN ALREADY FULL', 'info')
      setView(snapshot(world))
      return
    }
    if (kind === 'weapon' && world.weapon >= WEAPONS.length - 1) {
      addFloater(world, 'WEAPON MAXED', 'info')
      setView(snapshot(world))
      return
    }
    if (kind === 'armor' && world.armor >= 3) {
      addFloater(world, 'ARMOR MAXED', 'info')
      setView(snapshot(world))
      return
    }

    world.coins -= cost
    if (kind === 'wagon') world.wagons += 1
    if (kind === 'weapon') world.weapon += 1
    if (kind === 'armor') world.armor += 1
    setView(snapshot(world))
  }, [])

  const leaveStation = useCallback(() => {
    const world = worldRef.current
    if (!world.stationOpen) return
    world.biomeIndex += 1
    world.biomeDistance = 0
    world.stationOpen = false
    world.spawnClock = 0.65
    world.lane = Math.min(world.lane, laneCountFor(world) - 1)
    addFloater(world, `NEXT: ${BIOMES[world.biomeIndex].short}`, 'info')
    lastTimeRef.current = null
    setView(snapshot(world))
  }, [])

  const biome = BIOMES[view.biomeIndex]
  const weapon = WEAPONS[view.weapon]
  const stationStage = view.biomeIndex + 1
  const stationCosts = useMemo(() => ({
    wagon: 16 + stationStage * 4,
    weapon: 24 + stationStage * 6,
    armor: 30 + stationStage * 7,
  }), [stationStage])

  const visibleWagons = Math.min(3, view.wagons)
  const railStyle = { '--rail-count': view.laneCount } as CSSProperties

  return (
    <div className={`train-fighter train-fighter--${biome.key}`} data-biome={biome.key}>
      <div className="train-fighter__sky" aria-hidden="true">
        <span className="train-fighter__sun" />
        <span className="train-fighter__cloud train-fighter__cloud--one" />
        <span className="train-fighter__cloud train-fighter__cloud--two" />
        <span className="train-fighter__mountain train-fighter__mountain--one" />
        <span className="train-fighter__mountain train-fighter__mountain--two" />
      </div>

      <div className="mf-game-layout train-fighter__layout">
        <header className="mf-game-hud train-fighter__hud">
          <div className="train-fighter__status train-fighter__status--life" aria-label={`${view.wagons} wagons`}>
            <span className="train-fighter__hud-icon">▰</span>
            <strong>{view.wagons}</strong>
            <span className="train-fighter__hud-label">WAGONS</span>
          </div>
          <div className="train-fighter__biome-chip">
            <span>{biome.short}</span>
            <i style={{ width: `${Math.round(view.biomeDistance / BIOME_LENGTH * 100)}%` }} />
          </div>
          <div className="train-fighter__status train-fighter__status--coins" aria-label={`${view.coins} coins`}>
            <span className="train-fighter__coin-mini">●</span>
            <strong>{view.coins}</strong>
          </div>
        </header>

        <main className="mf-game-stage train-fighter__stage">
          <div className="train-fighter__world" style={railStyle}>
            <div className="train-fighter__scenery" aria-hidden="true">
              <span className="train-fighter__scenery-bit train-fighter__scenery-bit--a" />
              <span className="train-fighter__scenery-bit train-fighter__scenery-bit--b" />
              <span className="train-fighter__scenery-bit train-fighter__scenery-bit--c" />
              <span className="train-fighter__scenery-bit train-fighter__scenery-bit--d" />
            </div>

            <div className={`train-fighter__junction ${view.junctionPulse > 0 ? 'is-live' : ''}`} aria-hidden="true">
              <span>‹</span><b>JUNCTION</b><span>›</span>
            </div>

            <div className="train-fighter__rails" aria-hidden="true">
              {Array.from({ length: view.laneCount }, (_, lane) => (
                <div
                  className={`train-fighter__rail ${lane === view.lane ? 'is-current' : ''}`}
                  key={lane}
                  style={{ left: laneLeft(lane, view.laneCount) }}
                />
              ))}
            </div>

            <div className="train-fighter__objects">
              {view.objects.map((object) => (
                <div
                  className={`train-fighter__object train-fighter__object--${object.kind}`}
                  key={object.id}
                  style={{
                    left: laneLeft(object.lane, view.laneCount),
                    top: `${object.y * 100}%`,
                    '--wobble': `${object.wobble}rad`,
                  } as CSSProperties}
                >
                  {object.kind === 'enemy' ? (
                    <div className={`train-fighter__enemy tier-${object.tier}`}>
                      <span className="train-fighter__enemy-arm train-fighter__enemy-arm--left">╲</span>
                      <span className="train-fighter__enemy-body">
                        <i className="train-fighter__enemy-stack" />
                        <b className="train-fighter__enemy-face">｀皿´</b>
                        <em>{'●'.repeat(object.tier)}</em>
                      </span>
                      <span className="train-fighter__enemy-arm train-fighter__enemy-arm--right">╱</span>
                    </div>
                  ) : (
                    <div className="train-fighter__pickup">
                      <span>{objectIcon(object)}</span>
                      {object.kind === 'coin' && <b>{object.value}</b>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className={`train-fighter__player ${view.turbo > 0 ? 'is-turbo' : ''}`}
              style={{ left: laneLeft(view.lane, view.laneCount) }}
            >
              <div className="train-fighter__weapon-label">{weapon.name}</div>
              <div className="train-fighter__locomotive">
                <span className="train-fighter__arm train-fighter__arm--left"><i>{weapon.icon}</i></span>
                <span className="train-fighter__arm train-fighter__arm--right"><i>{weapon.icon}</i></span>
                <span className="train-fighter__chimney" />
                <span className="train-fighter__cab">
                  <i className="train-fighter__eye train-fighter__eye--left" />
                  <i className="train-fighter__eye train-fighter__eye--right" />
                  <b className="train-fighter__smile" />
                </span>
                <span className="train-fighter__nose" />
                <span className="train-fighter__wheel train-fighter__wheel--left" />
                <span className="train-fighter__wheel train-fighter__wheel--right" />
                {view.shields > 0 && <span className="train-fighter__shield-bubble">{view.shields}</span>}
                {view.armor > 0 && <span className="train-fighter__armor-badge">A{view.armor}</span>}
              </div>

              <div className="train-fighter__wagons" aria-hidden="true">
                {Array.from({ length: visibleWagons }, (_, index) => (
                  <span className="train-fighter__wagon" key={index} style={{ '--wagon-index': index } as CSSProperties}>
                    <i />
                  </span>
                ))}
                {view.wagons > 3 && <b className="train-fighter__hidden-wagons">+{view.wagons - 3}</b>}
              </div>
            </div>

            <div className="train-fighter__floaters" aria-live="polite">
              {view.floaters.map((floater, index) => (
                <div className={`train-fighter__floater is-${floater.tone}`} key={floater.id} style={{ '--floater-index': index } as CSSProperties}>
                  {floater.text}
                </div>
              ))}
            </div>

            {view.stationOpen && (
              <section className="train-fighter__station" aria-label="Pit stop station">
                <div className="train-fighter__station-sign">TINY TOWN STATION</div>
                <h2>PIT STOP!</h2>
                <p>Spend coins before {BIOMES[Math.min(BIOMES.length - 1, view.biomeIndex + 1)].name}.</p>
                <div className="train-fighter__shop">
                  <button type="button" onClick={() => buy('wagon')} disabled={view.coins < stationCosts.wagon || view.wagons >= MAX_WAGONS}>
                    <span>▰</span><b>+1 WAGON</b><em>{stationCosts.wagon} ●</em>
                  </button>
                  <button type="button" onClick={() => buy('weapon')} disabled={view.coins < stationCosts.weapon || view.weapon >= WEAPONS.length - 1}>
                    <span>{WEAPONS[Math.min(WEAPONS.length - 1, view.weapon + 1)].icon}</span><b>WEAPON UP</b><em>{stationCosts.weapon} ●</em>
                  </button>
                  <button type="button" onClick={() => buy('armor')} disabled={view.coins < stationCosts.armor || view.armor >= 3}>
                    <span>◆</span><b>ARMOR UP</b><em>{stationCosts.armor} ●</em>
                  </button>
                </div>
                <button className="train-fighter__depart" type="button" onClick={leaveStation}>CHOO CHOO →</button>
              </section>
            )}
          </div>
        </main>

        <footer className="mf-game-controls train-fighter__controls">
          <button type="button" onClick={() => move(-1)} disabled={view.stationOpen || view.finished || view.lane <= 0} aria-label="Move train left">
            <span>‹</span><b>LEFT</b>
          </button>
          <div className="train-fighter__gear-pill" aria-label={`Weapon ${weapon.name}`}>
            <span>{weapon.icon}</span>
            <b>LV.{view.weapon}</b>
          </div>
          <button type="button" onClick={() => move(1)} disabled={view.stationOpen || view.finished || view.lane >= view.laneCount - 1} aria-label="Move train right">
            <b>RIGHT</b><span>›</span>
          </button>
        </footer>
      </div>
    </div>
  )
}
