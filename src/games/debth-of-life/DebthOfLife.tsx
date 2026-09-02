import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './DebthOfLife.css'

type AcquisitionKey = 'home' | 'car' | 'family' | 'dog' | 'degree' | 'portfolio'
type AcquisitionState = Record<AcquisitionKey, number>

type Effect = {
  cash?: number
  debt?: number
  salary?: number
  salaryFactor?: number
  asset?: number
  acquisition?: AcquisitionKey
}

type Choice = {
  title: string
  detail: string
  effect: Effect
  tone: 'neutral' | 'risk' | 'gain'
}

type Gate = {
  id: number
  x: number
  width: number
  top: Choice
  bottom: Choice
  resolved: boolean
}

type Hazard = {
  id: number
  x: number
  y: number
  w: number
  h: number
  label: string
  cost: number
  hit: boolean
}

type Pickup = {
  id: number
  x: number
  y: number
  r: number
  amount: number
  taken: boolean
}

type Popup = {
  id: number
  text: string
  ttl: number
  positive: boolean
}

type World = {
  random: () => number
  age: number
  cash: number
  debt: number
  salary: number
  assetValue: number
  acquisitions: AcquisitionState
  elapsed: number
  distance: number
  speed: number
  playerY: number
  playerVy: number
  grounded: boolean
  holdJump: boolean
  jumpHeldFor: number
  gates: Gate[]
  hazards: Hazard[]
  pickups: Pickup[]
  popups: Popup[]
  spawnClock: number
  pickupClock: number
  nextId: number
  shake: number
  hitFlash: number
  finished: boolean
  scoreClock: number
  viewClock: number
  reportedScore: number
}

type View = {
  age: number
  cash: number
  debt: number
  salary: number
  assetValue: number
  net: number
  pressure: number
  acquisitions: AcquisitionState
  finished: boolean
}

const W = 1000
const H = 520
const GROUND = 444
const PLAYER_X = 166
const PLAYER_W = 46
const PLAYER_H = 74
const START_AGE = 18
const END_AGE = 85
const YEARS_PER_SECOND = 0.94
const BASE_SPEED = 260
const GRAVITY = 1740
const MAX_HOLD = 0.31
const TOP_CHOICE_Y = 270
const BOTTOM_CHOICE_Y = 357
const CHOICE_H = 68

const acquisitionNames: Record<AcquisitionKey, string> = {
  home: 'Maison',
  car: 'Voiture',
  family: 'Famille',
  dog: 'Chien',
  degree: 'Diplôme',
  portfolio: 'Placements',
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pick<T>(random: () => number, values: readonly T[]) {
  return values[Math.floor(random() * values.length)]
}

function money(value: number) {
  const abs = Math.abs(Math.round(value))
  const sign = value < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M€`
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)}K€`
  return `${sign}${abs}€`
}

function netWorth(world: World) {
  return Math.round(world.cash + world.assetValue - world.debt)
}

function pressure(world: World) {
  const base = Math.max(42_000, world.salary * 1.2 + world.assetValue * 0.45)
  return clamp(world.debt / base * 0.52 + Math.max(0, -netWorth(world)) / 180_000, 0, 1)
}

function snapshot(world: World): View {
  return {
    age: world.age,
    cash: Math.round(world.cash),
    debt: Math.round(world.debt),
    salary: Math.round(world.salary),
    assetValue: Math.round(world.assetValue),
    net: netWorth(world),
    pressure: pressure(world),
    acquisitions: { ...world.acquisitions },
    finished: world.finished,
  }
}

function createWorld(seed: number): World {
  return {
    random: mulberry32(seed || 1),
    age: START_AGE,
    cash: 6_000,
    debt: 0,
    salary: 26_000,
    assetValue: 0,
    acquisitions: { home: 0, car: 0, family: 0, dog: 0, degree: 0, portfolio: 0 },
    elapsed: 0,
    distance: 0,
    speed: BASE_SPEED,
    playerY: GROUND - PLAYER_H,
    playerVy: 0,
    grounded: true,
    holdJump: false,
    jumpHeldFor: 0,
    gates: [],
    hazards: [],
    pickups: [],
    popups: [],
    spawnClock: 2.1,
    pickupClock: 1.25,
    nextId: 1,
    shake: 0,
    hitFlash: 0,
    finished: false,
    scoreClock: 0,
    viewClock: 0,
    reportedScore: 6_000,
  }
}

const gatePairs: Array<[Choice, Choice]> = [
  [
    { title: 'REPRENDRE DES ÉTUDES', detail: '+18K dette  ·  +11K/an', tone: 'risk', effect: { debt: 18_000, salary: 11_000, acquisition: 'degree' } },
    { title: 'GARDER LE JOB', detail: '+4K cash  ·  salaire stable', tone: 'neutral', effect: { cash: 4_000 } },
  ],
  [
    { title: 'ACHETER', detail: '+145K dette  ·  +118K actif', tone: 'risk', effect: { debt: 145_000, asset: 118_000, acquisition: 'home' } },
    { title: 'LOUER', detail: '−6K cash  ·  zéro actif', tone: 'neutral', effect: { cash: -6_000 } },
  ],
  [
    { title: 'INVESTIR', detail: '−12K cash  ·  +19K actif', tone: 'gain', effect: { cash: -12_000, asset: 19_000, acquisition: 'portfolio' } },
    { title: 'GARDER LE CASH', detail: '+2K cash  ·  aucun risque', tone: 'neutral', effect: { cash: 2_000 } },
  ],
  [
    { title: 'CHANGER DE BOULOT', detail: '+18% salaire  ·  +3K cash', tone: 'gain', effect: { salaryFactor: 1.18, cash: 3_000 } },
    { title: 'RESTER TRANQUILLE', detail: '+7K cash  ·  salaire stable', tone: 'neutral', effect: { cash: 7_000 } },
  ],
  [
    { title: 'FONDER UNE FAMILLE', detail: '+22K dette  ·  acquis de vie', tone: 'risk', effect: { debt: 22_000, acquisition: 'family' } },
    { title: 'VIE SOLO', detail: '+9K cash  ·  zéro charge', tone: 'neutral', effect: { cash: 9_000 } },
  ],
  [
    { title: 'BELLE VOITURE', detail: '+32K dette  ·  +14K actif', tone: 'risk', effect: { debt: 32_000, asset: 14_000, acquisition: 'car' } },
    { title: 'VIEILLE CAISSE', detail: '−5K cash  ·  +2K actif', tone: 'neutral', effect: { cash: -5_000, asset: 2_000, acquisition: 'car' } },
  ],
  [
    { title: 'CRÉDIT CONSO', detail: '+18K cash  ·  +27K dette', tone: 'risk', effect: { cash: 18_000, debt: 27_000 } },
    { title: 'SERRER LA CEINTURE', detail: '−4K cash  ·  dette inchangée', tone: 'neutral', effect: { cash: -4_000 } },
  ],
  [
    { title: 'ADOPTER UN CHIEN', detail: '−7K cash  ·  acquis de vie', tone: 'gain', effect: { cash: -7_000, acquisition: 'dog' } },
    { title: 'PAS MAINTENANT', detail: '+3K cash', tone: 'neutral', effect: { cash: 3_000 } },
  ],
  [
    { title: 'PLACEMENT AGRESSIF', detail: '−20K cash  ·  +34K actif', tone: 'risk', effect: { cash: -20_000, asset: 34_000, acquisition: 'portfolio' } },
    { title: 'LIVRET PÉPÈRE', detail: '−5K cash  ·  +7K actif', tone: 'gain', effect: { cash: -5_000, asset: 7_000, acquisition: 'portfolio' } },
  ],
  [
    { title: 'PROMOTION', detail: '+25% salaire  ·  −8K cash', tone: 'gain', effect: { salaryFactor: 1.25, cash: -8_000 } },
    { title: 'REFUSER', detail: '+5K cash  ·  pas de hausse', tone: 'neutral', effect: { cash: 5_000 } },
  ],
]

function scaledChoice(choice: Choice, age: number): Choice {
  const ageT = clamp((age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const scale = 0.82 + ageT * 0.58
  const effect = { ...choice.effect }
  if (effect.cash) effect.cash = Math.round(effect.cash * scale)
  if (effect.debt) effect.debt = Math.round(effect.debt * scale)
  if (effect.asset) effect.asset = Math.round(effect.asset * scale)
  return { ...choice, effect }
}

function spawnGate(world: World) {
  const pair = pick(world.random, gatePairs)
  world.gates.push({
    id: world.nextId++,
    x: W + 70,
    width: 250,
    top: scaledChoice(pair[0], world.age),
    bottom: scaledChoice(pair[1], world.age),
    resolved: false,
  })

  if (world.random() < 0.48) {
    const labels = ['IMPÔTS', 'PANNE', 'SOINS', 'FRANCHISE', 'FACTURE']
    const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
    world.hazards.push({
      id: world.nextId++,
      x: W + 430,
      y: GROUND - 54,
      w: 43,
      h: 54,
      label: pick(world.random, labels),
      cost: Math.round((2_800 + world.random() * 6_500) * (0.85 + ageT * 0.85)),
      hit: false,
    })
  }

  world.spawnClock = 4.2 + world.random() * 1.15
}

function spawnPickup(world: World) {
  const high = world.random() < 0.58
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  world.pickups.push({
    id: world.nextId++,
    x: W + 40,
    y: high ? 300 + ageT * 24 : GROUND - 42,
    r: 18,
    amount: Math.round((1_100 + world.random() * 2_400) * (0.9 + ageT * 0.65)),
    taken: false,
  })
  world.pickupClock = 2.3 + world.random() * 2.15
}

function addPopup(world: World, text: string, positive: boolean) {
  world.popups.unshift({ id: world.nextId++, text, ttl: 1.25, positive })
  world.popups = world.popups.slice(0, 3)
}

function applyCash(world: World, amount: number) {
  if (amount >= 0) {
    const repay = Math.min(world.debt, amount * 0.56)
    world.debt -= repay
    world.cash += amount - repay
    return repay
  }
  const cost = -amount
  const paid = Math.min(world.cash, cost)
  world.cash -= paid
  world.debt += cost - paid
  return 0
}

function applyChoice(world: World, choice: Choice) {
  const beforeSalary = world.salary
  let repaid = 0
  if (choice.effect.cash) repaid = applyCash(world, choice.effect.cash)
  if (choice.effect.debt) world.debt += choice.effect.debt
  if (choice.effect.salary) world.salary += choice.effect.salary
  if (choice.effect.salaryFactor) world.salary = Math.round(world.salary * choice.effect.salaryFactor)
  if (choice.effect.asset) world.assetValue += choice.effect.asset
  if (choice.effect.acquisition) world.acquisitions[choice.effect.acquisition] += 1

  const notes: string[] = []
  if (choice.effect.cash) notes.push(`${choice.effect.cash > 0 ? '+' : ''}${money(choice.effect.cash)}`)
  if (choice.effect.debt) notes.push(`DETTE +${money(choice.effect.debt)}`)
  if (world.salary !== beforeSalary) notes.push(`${money(world.salary)}/AN`)
  if (repaid > 500) notes.push(`REMBOURSÉ ${money(repaid)}`)
  addPopup(world, `${choice.title}  ${notes.join('  ·  ')}`, choice.tone === 'gain' || netWorth(world) >= 0)
}

function overlaps(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function startJump(world: World) {
  if (world.finished || !world.grounded) return false
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const strength = 1 - ageT * 0.39
  world.playerVy = -670 * strength
  world.grounded = false
  world.holdJump = true
  world.jumpHeldFor = 0
  return true
}

function releaseJump(world: World) {
  world.holdJump = false
}

function updateWorld(world: World, dt: number) {
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const years = dt * YEARS_PER_SECOND
  world.elapsed += dt
  world.age = Math.min(END_AGE, world.age + years)
  world.speed = BASE_SPEED * (1 - ageT * 0.27)
  world.distance += world.speed * dt

  const annualSavings = Math.max(1_500, world.salary * 0.19 - 2_800 - world.acquisitions.family * 1_600 - world.acquisitions.dog * 450)
  const earned = annualSavings * years
  const repayment = Math.min(world.debt, earned * 0.64)
  world.debt -= repayment
  world.cash += earned - repayment
  world.debt *= 1 + 0.036 * years

  if (world.holdJump && world.jumpHeldFor < MAX_HOLD && world.playerVy < 40) {
    world.playerVy -= 1050 * (1 - ageT * 0.42) * dt
    world.jumpHeldFor += dt
  }
  world.playerVy += GRAVITY * dt
  world.playerY += world.playerVy * dt
  if (world.playerY + PLAYER_H >= GROUND) {
    world.playerY = GROUND - PLAYER_H
    world.playerVy = 0
    world.grounded = true
    world.jumpHeldFor = 0
  } else {
    world.grounded = false
  }

  for (const gate of world.gates) gate.x -= world.speed * dt
  for (const hazard of world.hazards) hazard.x -= world.speed * dt
  for (const pickup of world.pickups) pickup.x -= world.speed * dt

  const px = PLAYER_X + 5
  const py = world.playerY + 4
  const pw = PLAYER_W - 10
  const ph = PLAYER_H - 8

  for (const gate of world.gates) {
    if (gate.resolved) continue
    const gx = gate.x
    const topHit = overlaps(px, py, pw, ph, gx, TOP_CHOICE_Y, gate.width, CHOICE_H)
    const bottomHit = overlaps(px, py, pw, ph, gx, BOTTOM_CHOICE_Y, gate.width, CHOICE_H)
    if (topHit || bottomHit) {
      gate.resolved = true
      applyChoice(world, topHit ? gate.top : gate.bottom)
    } else if (gate.x + gate.width < PLAYER_X - 6) {
      gate.resolved = true
      addPopup(world, 'TU N’AS RIEN SIGNÉ.', true)
    }
  }

  for (const hazard of world.hazards) {
    if (hazard.hit) continue
    if (overlaps(px, py, pw, ph, hazard.x, hazard.y, hazard.w, hazard.h)) {
      hazard.hit = true
      applyCash(world, -hazard.cost)
      world.shake = 0.28
      world.hitFlash = 0.18
      addPopup(world, `${hazard.label}  −${money(hazard.cost)}`, false)
    }
  }

  for (const pickup of world.pickups) {
    if (pickup.taken) continue
    if (overlaps(px, py, pw, ph, pickup.x - pickup.r, pickup.y - pickup.r, pickup.r * 2, pickup.r * 2)) {
      pickup.taken = true
      const repaidNow = applyCash(world, pickup.amount)
      addPopup(world, repaidNow > 400 ? `REVENU +${money(pickup.amount)}  ·  DETTE −${money(repaidNow)}` : `REVENU +${money(pickup.amount)}`, true)
    }
  }

  world.gates = world.gates.filter((gate) => gate.x + gate.width > -80)
  world.hazards = world.hazards.filter((hazard) => hazard.x + hazard.w > -80)
  world.pickups = world.pickups.filter((pickup) => pickup.x + pickup.r > -80 && !pickup.taken)

  world.spawnClock -= dt
  world.pickupClock -= dt
  if (world.spawnClock <= 0) spawnGate(world)
  if (world.pickupClock <= 0) spawnPickup(world)

  world.popups = world.popups.map((popup) => ({ ...popup, ttl: popup.ttl - dt })).filter((popup) => popup.ttl > 0)
  world.shake = Math.max(0, world.shake - dt)
  world.hitFlash = Math.max(0, world.hitFlash - dt)
  world.scoreClock += dt
  world.viewClock += dt
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawPaperWorld(ctx: CanvasRenderingContext2D, world: World) {
  const p = pressure(world)
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  ctx.fillStyle = p > 0.72 ? '#b7b0a4' : '#ede7d7'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#14324a'
  ctx.fillRect(0, 0, W, 68)
  ctx.fillStyle = '#f0bd2d'
  ctx.fillRect(0, 68, W * (1 - ageT * 0.45), 7)

  ctx.strokeStyle = p > 0.6 ? '#6f6961' : '#c7c0b2'
  ctx.lineWidth = 1
  for (let y = 102; y < GROUND; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (let x = -((world.distance * 0.14) % 92); x < W; x += 92) {
    ctx.beginPath()
    ctx.moveTo(x, 92)
    ctx.lineTo(x, GROUND)
    ctx.stroke()
  }

  const barsOffset = -((world.distance * 0.19) % 150)
  for (let i = -1; i < 9; i += 1) {
    const x = barsOffset + i * 150
    const h = 65 + ((i * 71 + 190) % 125)
    ctx.fillStyle = i % 2 ? '#d2c9b8' : '#c0b5a3'
    ctx.fillRect(x, GROUND - h, 78, h)
    ctx.fillStyle = '#14324a'
    ctx.fillRect(x + 12, GROUND - h + 18, 42, 6)
    ctx.fillRect(x + 12, GROUND - h + 34, 26, 6)
  }

  ctx.fillStyle = '#151719'
  ctx.fillRect(0, GROUND, W, 8)
  ctx.fillStyle = '#f7f1e4'
  ctx.fillRect(0, GROUND + 8, W, H - GROUND - 8)
  ctx.fillStyle = '#151719'
  ctx.font = '700 12px Arial, sans-serif'
  ctx.textAlign = 'left'
  for (let x = -((world.distance * 0.65) % 170); x < W; x += 170) ctx.fillText('SOLDE  •  SOLDE  •  SOLDE', x, GROUND + 35)

  const debtX = 12 + p * 118
  if (p > 0.02) {
    ctx.fillStyle = `rgba(180, 42, 34, ${0.12 + p * 0.28})`
    ctx.fillRect(0, 76, debtX, GROUND - 76)
    ctx.strokeStyle = '#a32d29'
    ctx.lineWidth = 5
    ctx.setLineDash([10, 9])
    ctx.beginPath()
    ctx.moveTo(debtX, 78)
    ctx.lineTo(debtX, GROUND)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.save()
    ctx.translate(debtX - 10, 240)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#7e211e'
    ctx.font = '900 19px Arial, sans-serif'
    ctx.fillText('DETTE', 0, 0)
    ctx.restore()
  }

  if (p > 0.42) {
    ctx.fillStyle = `rgba(68, 49, 45, ${(p - 0.42) * 0.52})`
    ctx.fillRect(0, 0, W, H)
  }
}

function drawChoice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, choice: Choice, active: boolean) {
  const accent = choice.tone === 'risk' ? '#b6362e' : choice.tone === 'gain' ? '#1c6a4f' : '#31566f'
  ctx.save()
  ctx.globalAlpha = active ? 1 : 0.26
  ctx.fillStyle = '#f7f1e4'
  ctx.strokeStyle = '#151719'
  ctx.lineWidth = 4
  roundedRect(ctx, x, y, w, CHOICE_H, 4)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = accent
  ctx.fillRect(x, y, 11, CHOICE_H)
  ctx.fillStyle = '#151719'
  ctx.font = '900 17px Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(choice.title, x + 22, y + 28)
  ctx.font = '700 13px Arial, sans-serif'
  ctx.fillStyle = '#4d4e4d'
  ctx.fillText(choice.detail, x + 22, y + 50)
  ctx.restore()
}

function drawGate(ctx: CanvasRenderingContext2D, gate: Gate) {
  ctx.strokeStyle = '#151719'
  ctx.lineWidth = 2
  ctx.setLineDash([7, 6])
  ctx.beginPath()
  ctx.moveTo(gate.x + gate.width + 12, TOP_CHOICE_Y - 17)
  ctx.lineTo(gate.x + gate.width + 12, BOTTOM_CHOICE_Y + CHOICE_H + 10)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#151719'
  ctx.font = '900 11px Arial, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('CHOISIS TA VIE', gate.x + gate.width, TOP_CHOICE_Y - 11)
  drawChoice(ctx, gate.x, TOP_CHOICE_Y, gate.width, gate.top, !gate.resolved)
  drawChoice(ctx, gate.x, BOTTOM_CHOICE_Y, gate.width, gate.bottom, !gate.resolved)
}

function drawHazard(ctx: CanvasRenderingContext2D, hazard: Hazard) {
  if (hazard.hit) return
  ctx.save()
  ctx.fillStyle = '#f7f1e4'
  ctx.strokeStyle = '#a32d29'
  ctx.lineWidth = 5
  ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h)
  ctx.strokeRect(hazard.x, hazard.y, hazard.w, hazard.h)
  ctx.fillStyle = '#a32d29'
  ctx.fillRect(hazard.x + 6, hazard.y + 8, hazard.w - 12, 8)
  ctx.fillRect(hazard.x + 6, hazard.y + 24, hazard.w - 18, 5)
  ctx.fillRect(hazard.x + 6, hazard.y + 35, hazard.w - 12, 5)
  ctx.save()
  ctx.translate(hazard.x + hazard.w / 2, hazard.y - 7)
  ctx.rotate(-0.05)
  ctx.fillStyle = '#a32d29'
  ctx.font = '900 11px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(hazard.label, 0, 0)
  ctx.restore()
  ctx.restore()
}

function drawPickup(ctx: CanvasRenderingContext2D, pickup: Pickup) {
  if (pickup.taken) return
  ctx.save()
  ctx.translate(pickup.x, pickup.y)
  ctx.rotate(Math.sin(pickup.x * 0.02) * 0.12)
  ctx.fillStyle = '#f0bd2d'
  ctx.strokeStyle = '#151719'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(0, 0, pickup.r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#151719'
  ctx.font = '900 21px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('€', 0, 1)
  ctx.restore()
}

function drawRunner(ctx: CanvasRenderingContext2D, world: World) {
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const stride = Math.sin(world.elapsed * (14 - ageT * 6)) * (1 - ageT * 0.5)
  const x = PLAYER_X
  const y = world.playerY
  const bend = ageT * 11

  ctx.save()
  ctx.strokeStyle = '#111315'
  ctx.fillStyle = '#111315'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.arc(x + 24 + bend, y + 14, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x + 24 + bend, y + 27)
  ctx.lineTo(x + 22, y + 57)
  ctx.stroke()

  const leg = stride * 9
  ctx.beginPath()
  ctx.moveTo(x + 22, y + 57)
  ctx.lineTo(x + 12 + leg, y + 73)
  ctx.moveTo(x + 22, y + 57)
  ctx.lineTo(x + 34 - leg, y + 73)
  ctx.stroke()

  const arm = stride * 7
  ctx.beginPath()
  ctx.moveTo(x + 23 + bend * 0.5, y + 35)
  ctx.lineTo(x + 8 - arm, y + 48)
  ctx.moveTo(x + 24 + bend * 0.5, y + 35)
  ctx.lineTo(x + 40 + arm, y + 44)
  ctx.stroke()

  ctx.fillStyle = '#31566f'
  ctx.strokeStyle = '#111315'
  ctx.lineWidth = 3
  roundedRect(ctx, x + 35 + arm, y + 38, 18, 14, 2)
  ctx.fill()
  ctx.stroke()

  if (world.age > 68) {
    ctx.strokeStyle = '#7f674f'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x + 44, y + 43)
    ctx.lineTo(x + 52, y + 72)
    ctx.lineTo(x + 59, y + 72)
    ctx.stroke()
  }
  ctx.restore()
}

function drawPopups(ctx: CanvasRenderingContext2D, world: World) {
  let y = 96
  for (const popup of world.popups) {
    ctx.save()
    ctx.globalAlpha = clamp(popup.ttl * 1.6, 0, 1)
    ctx.fillStyle = popup.positive ? '#14324a' : '#a32d29'
    ctx.font = '900 18px Arial, sans-serif'
    ctx.textAlign = 'center'
    const width = Math.min(720, ctx.measureText(popup.text).width + 32)
    ctx.fillRect((W - width) / 2, y, width, 34)
    ctx.fillStyle = '#f7f1e4'
    ctx.fillText(popup.text, W / 2, y + 23)
    ctx.restore()
    y += 39
  }
}

function drawCanvas(canvas: HTMLCanvasElement, world: World) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  if (world.shake > 0) {
    const n = world.shake * 10
    ctx.translate(Math.sin(world.elapsed * 93) * n, Math.cos(world.elapsed * 77) * n * 0.5)
  }
  drawPaperWorld(ctx, world)
  for (const gate of world.gates) drawGate(ctx, gate)
  for (const hazard of world.hazards) drawHazard(ctx, hazard)
  for (const pickup of world.pickups) drawPickup(ctx, pickup)
  drawRunner(ctx, world)
  drawPopups(ctx, world)
  if (world.hitFlash > 0) {
    ctx.fillStyle = `rgba(180, 42, 34, ${world.hitFlash * 0.65})`
    ctx.fillRect(0, 0, W, H)
  }
  ctx.restore()
}

function verdict(net: number) {
  if (net >= 350_000) return 'TU AS GAGNÉ AU CAPITALISME.'
  if (net >= 100_000) return 'TU MEURS PLUTÔT BIEN.'
  if (net >= 0) return 'LE COMPTE EST À PEU PRÈS PROPRE.'
  if (net > -100_000) return 'TES HÉRITIERS VONT SOUFFLER.'
  return 'MÊME TON CERCUEIL EST FINANCÉ.'
}

export function DebthOfLife({ active, seed, restartToken, session }: GameComponentProps) {
  const worldRef = useRef<World>(createWorld(seed))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const pointerRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const [view, setView] = useState<View>(() => snapshot(worldRef.current))
  const [pressed, setPressed] = useState(false)

  const finishRun = useCallback(() => {
    const world = worldRef.current
    if (finishedRef.current || world.finished) return
    finishedRef.current = true
    world.finished = true
    world.holdJump = false
    const score = netWorth(world)
    setView(snapshot(world))
    session.setScore(score)
    session.finish({
      score,
      metadata: {
        age: Math.round(world.age),
        cash: Math.round(world.cash),
        debt: Math.round(world.debt),
        assets: Math.round(world.assetValue),
        salary: Math.round(world.salary),
        homes: world.acquisitions.home,
        cars: world.acquisitions.car,
        family: world.acquisitions.family,
        dogs: world.acquisitions.dog,
        degrees: world.acquisitions.degree,
        investments: world.acquisitions.portfolio,
      },
    })
  }, [session])

  useEffect(() => {
    const world = createWorld(seed)
    worldRef.current = world
    finishedRef.current = false
    pointerRef.current = null
    lastFrameRef.current = null
    setPressed(false)
    setView(snapshot(world))
    session.setScore(netWorth(world))
    if (canvasRef.current) drawCanvas(canvasRef.current, world)
  }, [restartToken, seed, session])

  useEffect(() => {
    if (!active) {
      worldRef.current.holdJump = false
      setPressed(false)
      lastFrameRef.current = null
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      return
    }

    const tick = (time: number) => {
      const previous = lastFrameRef.current ?? time
      const dt = Math.min(0.04, Math.max(0, (time - previous) / 1000))
      lastFrameRef.current = time
      const world = worldRef.current

      if (!world.finished) updateWorld(world, dt)
      if (canvasRef.current) drawCanvas(canvasRef.current, world)

      if (!world.finished && world.scoreClock >= 0.4) {
        world.scoreClock = 0
        const score = netWorth(world)
        if (Math.abs(score - world.reportedScore) >= 300) {
          world.reportedScore = score
          session.setScore(score)
        }
      }
      if (world.viewClock >= 0.11) {
        world.viewClock = 0
        setView(snapshot(world))
      }
      if (!world.finished && world.age >= END_AGE) {
        finishRun()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [active, finishRun, session])

  useEffect(() => {
    if (!active || view.finished) return
    const keys = [' ', 'ArrowUp', 'w', 'W', 'z', 'Z']
    const down = (event: KeyboardEvent) => {
      if (!keys.includes(event.key)) return
      event.preventDefault()
      if (event.repeat) return
      if (startJump(worldRef.current)) setPressed(true)
    }
    const up = (event: KeyboardEvent) => {
      if (!keys.includes(event.key)) return
      event.preventDefault()
      releaseJump(worldRef.current)
      setPressed(false)
    }
    window.addEventListener('keydown', down, { passive: false })
    window.addEventListener('keyup', up, { passive: false })
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [active, view.finished])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const jumpDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!active || view.finished) return
    event.preventDefault()
    pointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    if (startJump(worldRef.current)) setPressed(true)
  }

  const jumpUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerRef.current !== null && event.currentTarget.hasPointerCapture(pointerRef.current)) {
      event.currentTarget.releasePointerCapture(pointerRef.current)
    }
    pointerRef.current = null
    releaseJump(worldRef.current)
    setPressed(false)
  }

  const acquisitions = useMemo(() => (
    (Object.keys(view.acquisitions) as AcquisitionKey[])
      .filter((key) => view.acquisitions[key] > 0)
      .map((key) => ({ key, label: acquisitionNames[key], count: view.acquisitions[key] }))
  ), [view.acquisitions])

  const cssVars = { '--dol-pressure': view.pressure.toFixed(3) } as CSSProperties

  return (
    <div className="dol-root" style={cssVars}>
      <div className="mf-game-layout dol-layout">
        <header className="mf-game-hud dol-hud">
          <div><span>ÂGE</span><strong>{Math.floor(view.age)}</strong></div>
          <div><span>BANQUE</span><strong>{money(view.cash)}</strong></div>
          <div className="is-debt"><span>DETTE</span><strong>{money(view.debt)}</strong></div>
          <div><span>SALAIRE</span><strong>{money(view.salary)}/AN</strong></div>
        </header>

        <main className="mf-game-stage dol-stage">
          <canvas ref={canvasRef} className="dol-canvas" width={W} height={H} aria-label="Runner financier : saute pour choisir la trajectoire haute, reste au sol pour la trajectoire basse." />
          <div className="dol-pressure" aria-label={`Pression de dette ${Math.round(view.pressure * 100)}%`}>
            <span>LA DETTE TE RATTRAPE</span>
            <i><b style={{ width: `${Math.round(view.pressure * 100)}%` }} /></i>
          </div>

          {view.finished && (
            <section className="dol-summary">
              <p>AVIS DE DÉCÈS FINANCIER · {END_AGE} ANS</p>
              <h2>{verdict(view.net)}</h2>
              <div className="dol-balance">
                <span><small>BANQUE</small><b>{money(view.cash)}</b></span>
                <span><small>ACTIFS</small><b>{money(view.assetValue)}</b></span>
                <span><small>DETTES</small><b>−{money(view.debt)}</b></span>
                <span className={view.net < 0 ? 'bad' : 'good'}><small>PATRIMOINE NET</small><b>{money(view.net)}</b></span>
              </div>
              <div className="dol-life-list">
                {acquisitions.length ? acquisitions.map((item) => <span key={item.key}>{item.label}{item.count > 1 ? ` ×${item.count}` : ''}</span>) : <span>RIEN À TRANSMETTRE, MÊME PAS UN CHIEN.</span>}
              </div>
            </section>
          )}
        </main>

        <footer className="mf-game-controls dol-controls">
          <button
            className={pressed ? 'is-pressed' : ''}
            type="button"
            onPointerDown={jumpDown}
            onPointerUp={jumpUp}
            onPointerCancel={jumpUp}
            onLostPointerCapture={() => {
              pointerRef.current = null
              releaseJump(worldRef.current)
              setPressed(false)
            }}
            disabled={view.finished}
          >
            <b>SAUTER</b>
            <span>maintenir = viser l’option haute</span>
          </button>
          <p><b>HAUT = un choix. BAS = l’autre.</b> Lis vite. Les deux peuvent être de mauvaises idées.</p>
        </footer>
      </div>
    </div>
  )
}
