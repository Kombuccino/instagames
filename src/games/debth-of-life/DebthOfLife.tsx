import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './DebthOfLife.css'

type AssetKey = 'house' | 'car' | 'love' | 'child' | 'dog'
type EncounterKind = 'car' | 'love' | 'child' | 'dog' | 'house' | 'credit' | 'tax' | 'illness'
type BonusKind = 'cash' | 'job' | 'raise' | 'inheritance' | 'lottery' | 'promotion'
type EntityType = 'encounter' | 'bonus'

type Entity = {
  id: number
  type: EntityType
  kind: EncounterKind | BonusKind
  x: number
  y: number
  w: number
  h: number
  label: string
  icon: string
  amount: number
  asset?: AssetKey
  assetValue?: number
}

type Platform = {
  id: number
  x: number
  y: number
  w: number
  h: number
}

type Popup = {
  id: number
  text: string
  x: number
  y: number
  ttl: number
  positive: boolean
}

type Assets = Record<AssetKey, number>

type World = {
  random: () => number
  age: number
  cash: number
  debt: number
  salary: number
  assetValue: number
  assets: Assets
  elapsed: number
  distance: number
  scrollSpeed: number
  playerY: number
  playerVy: number
  grounded: boolean
  holdingJump: boolean
  holdTime: number
  entities: Entity[]
  platforms: Platform[]
  popups: Popup[]
  spawnTimer: number
  nextEntityId: number
  nextPlatformId: number
  nextPopupId: number
  shake: number
  flash: number
  finished: boolean
  reportedScore: number
  scoreTimer: number
  hudTimer: number
}

type View = {
  age: number
  cash: number
  debt: number
  salary: number
  assetValue: number
  assets: Assets
  netWorth: number
  debtPressure: number
  finished: boolean
}

const CANVAS_W = 1000
const CANVAS_H = 520
const GROUND_Y = 432
const PLAYER_X = 175
const PLAYER_W = 48
const PLAYER_H = 76
const START_AGE = 18
const END_AGE = 85
const YEARS_PER_SECOND = 1.03
const BASE_SCROLL_SPEED = 246
const GRAVITY = 1710
const MAX_HOLD = 0.34

const encounterDefs: Record<EncounterKind, { label: string; icon: string; amount: number; asset?: AssetKey; assetValue?: number }> = {
  car: { label: 'VOITURE', icon: '🚗', amount: 16_000, asset: 'car', assetValue: 7_500 },
  love: { label: 'COUPLE', icon: '💘', amount: 10_000, asset: 'love', assetValue: 0 },
  child: { label: 'ENFANT', icon: '🍼', amount: 23_000, asset: 'child', assetValue: 0 },
  dog: { label: 'CHIEN', icon: '🐕', amount: 4_200, asset: 'dog', assetValue: 0 },
  house: { label: 'MAISON', icon: '🏠', amount: 128_000, asset: 'house', assetValue: 92_000 },
  credit: { label: 'CRÉDIT', icon: '💳', amount: 19_000 },
  tax: { label: 'IMPÔTS', icon: '🧾', amount: 12_000 },
  illness: { label: 'MALADIE', icon: '💊', amount: 18_000 },
}

const bonusDefs: Record<BonusKind, { label: string; icon: string; amount: number }> = {
  cash: { label: 'PRIME', icon: '💶', amount: 6_500 },
  job: { label: 'NOUVEAU JOB', icon: '💼', amount: 9_000 },
  raise: { label: 'AUGMENTATION', icon: '📈', amount: 0 },
  inheritance: { label: 'HÉRITAGE', icon: '🪦', amount: 58_000 },
  lottery: { label: 'LOTERIE', icon: '🎰', amount: 145_000 },
  promotion: { label: 'PROMOTION', icon: '🚀', amount: 8_000 },
}

const assetLabels: Record<AssetKey, { icon: string; label: string }> = {
  house: { icon: '🏠', label: 'Maison' },
  car: { icon: '🚗', label: 'Voiture' },
  love: { icon: '💘', label: 'Couple' },
  child: { icon: '🍼', label: 'Enfant' },
  dog: { icon: '🐕', label: 'Chien' },
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

function netWorth(world: World) {
  return Math.round(world.cash + world.assetValue - world.debt)
}

function debtPressure(world: World) {
  const buffer = Math.max(28_000, world.cash + world.assetValue * 0.72 + world.salary * 0.7)
  const negativeBoost = Math.max(0, -netWorth(world)) / 140_000
  return clamp(world.debt / buffer * 0.54 + negativeBoost, 0, 1)
}

function snapshot(world: World): View {
  return {
    age: world.age,
    cash: Math.round(world.cash),
    debt: Math.round(world.debt),
    salary: Math.round(world.salary),
    assetValue: Math.round(world.assetValue),
    assets: { ...world.assets },
    netWorth: netWorth(world),
    debtPressure: debtPressure(world),
    finished: world.finished,
  }
}

function createWorld(seed: number): World {
  return {
    random: mulberry32(seed || 1),
    age: START_AGE,
    cash: 2_500,
    debt: 0,
    salary: 24_000,
    assetValue: 0,
    assets: { house: 0, car: 0, love: 0, child: 0, dog: 0 },
    elapsed: 0,
    distance: 0,
    scrollSpeed: BASE_SCROLL_SPEED,
    playerY: GROUND_Y - PLAYER_H,
    playerVy: 0,
    grounded: true,
    holdingJump: false,
    holdTime: 0,
    entities: [],
    platforms: [],
    popups: [],
    spawnTimer: 1.15,
    nextEntityId: 1,
    nextPlatformId: 1,
    nextPopupId: 1,
    shake: 0,
    flash: 0,
    finished: false,
    reportedScore: 0,
    scoreTimer: 0,
    hudTimer: 0,
  }
}

function encounterPool(age: number): EncounterKind[] {
  if (age < 28) return ['car', 'credit', 'love', 'tax', 'car', 'credit']
  if (age < 45) return ['house', 'child', 'dog', 'car', 'tax', 'love', 'credit']
  if (age < 65) return ['tax', 'house', 'illness', 'credit', 'child', 'car', 'tax']
  return ['illness', 'tax', 'credit', 'illness', 'dog', 'tax', 'house']
}

function bonusPool(age: number): BonusKind[] {
  if (age < 30) return ['cash', 'job', 'raise', 'job', 'promotion']
  if (age < 55) return ['cash', 'raise', 'promotion', 'job', 'inheritance', 'cash']
  return ['cash', 'raise', 'inheritance', 'promotion', 'lottery', 'inheritance']
}

function makeEncounter(world: World, x: number, y = GROUND_Y - 64): Entity {
  const kind = pick(world.random, encounterPool(world.age))
  const def = encounterDefs[kind]
  const ageScale = 0.82 + ((world.age - START_AGE) / (END_AGE - START_AGE)) * 0.72
  const salaryScale = clamp(world.salary / 42_000, 0.72, 2.15)
  const amount = Math.round(def.amount * (0.65 * ageScale + 0.35 * salaryScale))
  return {
    id: world.nextEntityId++,
    type: 'encounter',
    kind,
    x,
    y,
    w: 66,
    h: 64,
    label: def.label,
    icon: def.icon,
    amount,
    asset: def.asset,
    assetValue: def.assetValue ? Math.round(def.assetValue * ageScale) : 0,
  }
}

function makeBonus(world: World, x: number, y = GROUND_Y - 62): Entity {
  let kind = pick(world.random, bonusPool(world.age))
  if (kind === 'lottery' && world.random() > 0.22) kind = 'cash'
  const def = bonusDefs[kind]
  const incomeScale = clamp(world.salary / 30_000, 0.75, 2.8)
  return {
    id: world.nextEntityId++,
    type: 'bonus',
    kind,
    x,
    y,
    w: 66,
    h: 62,
    label: def.label,
    icon: def.icon,
    amount: Math.round(def.amount * incomeScale),
  }
}

function spawnPattern(world: World) {
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const x = CANVAS_W + 70
  const roll = world.random()

  if (roll < 0.27) {
    const platformY = 310 + ageT * 42
    const platform: Platform = {
      id: world.nextPlatformId++,
      x,
      y: platformY,
      w: 228,
      h: 24,
    }
    world.platforms.push(platform)
    world.entities.push(makeBonus(world, x + 86, platformY - 68))
    world.entities.push(makeEncounter(world, x + 120))
  } else if (roll < 0.62) {
    world.entities.push(makeEncounter(world, x))
    if (world.random() < 0.34 + ageT * 0.24) world.entities.push(makeEncounter(world, x + 184))
  } else if (roll < 0.84) {
    world.entities.push(makeBonus(world, x))
  } else {
    world.entities.push(makeEncounter(world, x))
    world.entities.push(makeBonus(world, x + 150, GROUND_Y - 118))
  }

  const baseGap = 1.68 - ageT * 0.72
  world.spawnTimer = baseGap * (0.82 + world.random() * 0.43)
}

function addPopup(world: World, text: string, x: number, y: number, positive: boolean) {
  world.popups.push({
    id: world.nextPopupId++,
    text,
    x,
    y,
    ttl: 1.05,
    positive,
  })
}

function applyWindfall(world: World, gross: number) {
  const repayment = Math.min(world.debt, gross * 0.62)
  world.debt -= repayment
  world.cash += gross - repayment
  return repayment
}

function collectEntity(world: World, entity: Entity) {
  if (entity.type === 'encounter') {
    const cashHit = Math.min(world.cash, entity.amount * 0.2)
    const addedDebt = Math.max(0, entity.amount - cashHit)
    world.cash -= cashHit
    world.debt += addedDebt
    if (entity.asset) world.assets[entity.asset] += 1
    if (entity.assetValue) world.assetValue += entity.assetValue
    world.shake = 0.34
    world.flash = 0.22
    addPopup(world, `−${formatMoney(entity.amount)} ${entity.label}`, entity.x, entity.y - 14, false)
    return
  }

  const kind = entity.kind as BonusKind
  let gross = entity.amount

  if (kind === 'job') {
    world.salary += Math.max(7_000, Math.round(world.salary * 0.18))
  } else if (kind === 'raise') {
    world.salary = Math.round(world.salary * (1.11 + world.random() * 0.08))
    gross = Math.round(world.salary * 0.06)
  } else if (kind === 'promotion') {
    world.salary = Math.round(world.salary * 1.24)
  }

  const repaid = applyWindfall(world, gross)
  const salaryNote = ['job', 'raise', 'promotion'].includes(kind) ? ` · ${formatMoney(world.salary)}/an` : ''
  const repaymentNote = repaid >= 1_000 ? ` · dette −${formatMoney(repaid)}` : ''
  addPopup(world, `+${formatMoney(gross)} ${entity.label}${salaryNote}${repaymentNote}`, entity.x, entity.y - 14, true)
}

function rectanglesOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function updateWorld(world: World, dt: number) {
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const yearsDt = dt * YEARS_PER_SECOND
  world.elapsed += dt
  world.age = Math.min(END_AGE, world.age + yearsDt)
  world.scrollSpeed = BASE_SCROLL_SPEED * (1 - ageT * 0.29)
  world.distance += world.scrollSpeed * dt

  const lifeSavings = world.salary * 0.18 * yearsDt
  const repayment = Math.min(world.debt, lifeSavings * 0.68)
  world.debt -= repayment
  world.cash += lifeSavings - repayment
  world.debt *= 1 + 0.012 * yearsDt

  const jumpFactor = 1 - ageT * 0.43
  if (world.holdingJump && world.holdTime < MAX_HOLD && world.playerVy < 60) {
    world.playerVy -= 1010 * jumpFactor * dt
    world.holdTime += dt
  }

  const previousBottom = world.playerY + PLAYER_H
  world.playerVy += GRAVITY * dt
  world.playerY += world.playerVy * dt
  world.grounded = false

  for (const platform of world.platforms) platform.x -= world.scrollSpeed * dt
  for (const entity of world.entities) entity.x -= world.scrollSpeed * dt

  const playerLeft = PLAYER_X + 7
  const playerRight = PLAYER_X + PLAYER_W - 7
  const nextBottom = world.playerY + PLAYER_H
  if (world.playerVy >= 0) {
    let landingY = GROUND_Y
    for (const platform of world.platforms) {
      const horizontal = playerRight > platform.x && playerLeft < platform.x + platform.w
      const crossing = previousBottom <= platform.y + 5 && nextBottom >= platform.y
      if (horizontal && crossing && platform.y < landingY) landingY = platform.y
    }
    if (nextBottom >= landingY) {
      world.playerY = landingY - PLAYER_H
      world.playerVy = 0
      world.grounded = true
      world.holdTime = 0
    }
  }

  const hitLeft = PLAYER_X + 5
  const hitTop = world.playerY + 4
  const hitW = PLAYER_W - 10
  const hitH = PLAYER_H - 8
  world.entities = world.entities.filter((entity) => {
    if (entity.x + entity.w < -80) return false
    if (rectanglesOverlap(hitLeft, hitTop, hitW, hitH, entity.x + 5, entity.y + 4, entity.w - 10, entity.h - 8)) {
      collectEntity(world, entity)
      return false
    }
    return true
  })
  world.platforms = world.platforms.filter((platform) => platform.x + platform.w > -90)

  world.spawnTimer -= dt
  if (world.spawnTimer <= 0) spawnPattern(world)

  world.popups = world.popups
    .map((popup) => ({ ...popup, y: popup.y - dt * 34, ttl: popup.ttl - dt }))
    .filter((popup) => popup.ttl > 0)

  world.shake = Math.max(0, world.shake - dt)
  world.flash = Math.max(0, world.flash - dt)
  world.scoreTimer += dt
  world.hudTimer += dt
}

function startJump(world: World) {
  if (world.finished || !world.grounded) return false
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const jumpFactor = 1 - ageT * 0.43
  world.playerVy = -650 * jumpFactor
  world.grounded = false
  world.holdingJump = true
  world.holdTime = 0
  return true
}

function stopJump(world: World) {
  world.holdingJump = false
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

function drawBackground(ctx: CanvasRenderingContext2D, world: World) {
  const pressure = debtPressure(world)
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)

  ctx.fillStyle = '#76d7ff'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.fillStyle = '#ffe054'
  const sunX = 820 - ageT * 460
  const sunY = 82 + ageT * 84
  ctx.beginPath()
  ctx.arc(sunX, sunY, 52 - ageT * 13, 0, Math.PI * 2)
  ctx.fill()

  const farOffset = -((world.distance * 0.11) % 180)
  ctx.fillStyle = '#8ed47b'
  for (let i = -1; i < 8; i += 1) {
    const x = farOffset + i * 180
    ctx.beginPath()
    ctx.moveTo(x, GROUND_Y)
    ctx.quadraticCurveTo(x + 84, 252 + (i % 2) * 28, x + 180, GROUND_Y)
    ctx.closePath()
    ctx.fill()
  }

  const cityOffset = -((world.distance * 0.22) % 138)
  for (let i = -1; i < 10; i += 1) {
    const x = cityOffset + i * 138
    const h = 82 + ((i * 47) % 105)
    ctx.fillStyle = i % 2 ? '#f18d70' : '#efd267'
    ctx.fillRect(x, GROUND_Y - h, 92, h)
    ctx.fillStyle = '#322f34'
    for (let wy = GROUND_Y - h + 18; wy < GROUND_Y - 18; wy += 27) {
      ctx.fillRect(x + 16, wy, 12, 11)
      ctx.fillRect(x + 52, wy, 12, 11)
    }
  }

  ctx.fillStyle = '#efb94e'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y)
  ctx.fillStyle = '#302c32'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 9)
  ctx.fillStyle = '#fff1af'
  const roadOffset = -((world.distance * 0.76) % 110)
  for (let i = -1; i < 12; i += 1) ctx.fillRect(roadOffset + i * 110, GROUND_Y + 48, 56, 8)

  if (pressure > 0) {
    ctx.fillStyle = `rgba(24, 19, 31, ${pressure * 0.79})`
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = `rgba(105, 14, 18, ${Math.max(0, pressure - 0.42) * 0.26})`
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform, pressure: number) {
  ctx.save()
  ctx.fillStyle = pressure > 0.62 ? '#5e565e' : '#fff1bb'
  ctx.strokeStyle = '#171419'
  ctx.lineWidth = 5
  roundedRect(ctx, platform.x, platform.y, platform.w, platform.h, 7)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = pressure > 0.62 ? '#a13f49' : '#ef6f51'
  for (let x = platform.x + 16; x < platform.x + platform.w - 10; x += 34) ctx.fillRect(x, platform.y + 7, 17, 5)
  ctx.restore()
}

function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity, pressure: number) {
  ctx.save()
  const positive = entity.type === 'bonus'
  const body = positive ? '#ecffb7' : '#fff1df'
  const band = positive ? '#55c878' : '#e34f49'
  ctx.fillStyle = pressure > 0.78 ? '#d1c9c3' : body
  ctx.strokeStyle = '#171419'
  ctx.lineWidth = 5
  roundedRect(ctx, entity.x, entity.y, entity.w, entity.h, 13)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = band
  ctx.fillRect(entity.x + 5, entity.y + entity.h - 19, entity.w - 10, 14)
  ctx.font = '31px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(entity.icon, entity.x + entity.w / 2, entity.y + 25)

  ctx.font = '900 12px Arial, sans-serif'
  ctx.fillStyle = '#171419'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(entity.label, entity.x + entity.w / 2, entity.y + entity.h + 17)
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: World) {
  const ageT = clamp((world.age - START_AGE) / (END_AGE - START_AGE), 0, 1)
  const stride = Math.sin(world.elapsed * (13 - ageT * 5)) * (1 - ageT * 0.48)
  const x = PLAYER_X
  const y = world.playerY
  const lean = ageT * 8

  ctx.save()
  ctx.translate(x + PLAYER_W / 2, y)
  ctx.rotate(ageT * 0.055)
  ctx.translate(-(x + PLAYER_W / 2), -y)
  ctx.strokeStyle = '#171419'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.fillStyle = ageT > 0.72 ? '#d9d1ca' : '#ffe0bd'
  ctx.beginPath()
  ctx.arc(x + 25 + lean, y + 15, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = ageT > 0.57 ? '#e7e0df' : '#3b2830'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(x + 24 + lean, y + 11, 12, Math.PI * 1.08, Math.PI * 1.88)
  ctx.stroke()

  ctx.strokeStyle = '#171419'
  ctx.lineWidth = 8
  ctx.fillStyle = pressureColor(debtPressure(world))
  roundedRect(ctx, x + 11 + lean, y + 30, 30, 31, 8)
  ctx.fill()
  ctx.stroke()

  const hipX = x + 26 + lean
  const hipY = y + 61
  const legSwing = stride * 10
  ctx.beginPath()
  ctx.moveTo(hipX, hipY)
  ctx.lineTo(x + 17 + legSwing, y + 76)
  ctx.moveTo(hipX, hipY)
  ctx.lineTo(x + 36 - legSwing, y + 76)
  ctx.stroke()

  ctx.lineWidth = 7
  const armSwing = stride * 8
  ctx.beginPath()
  ctx.moveTo(x + 15 + lean, y + 39)
  ctx.lineTo(x + 2 - armSwing, y + 55)
  ctx.moveTo(x + 38 + lean, y + 39)
  ctx.lineTo(x + 51 + armSwing, y + 51)
  ctx.stroke()

  if (world.age >= 70) {
    ctx.strokeStyle = '#6c4b31'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(x + 52, y + 50)
    ctx.lineTo(x + 58, y + 78)
    ctx.lineTo(x + 67, y + 78)
    ctx.stroke()
  }
  ctx.restore()
}

function pressureColor(pressure: number) {
  if (pressure > 0.75) return '#81747b'
  if (pressure > 0.45) return '#c16a62'
  return '#45b8d8'
}

function drawPopups(ctx: CanvasRenderingContext2D, popups: Popup[]) {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '900 18px Arial, sans-serif'
  for (const popup of popups) {
    ctx.globalAlpha = clamp(popup.ttl * 1.7, 0, 1)
    const width = Math.min(430, ctx.measureText(popup.text).width + 24)
    ctx.fillStyle = popup.positive ? '#d9ff91' : '#ff8a7f'
    ctx.strokeStyle = '#171419'
    ctx.lineWidth = 4
    roundedRect(ctx, popup.x - width / 2, popup.y - 27, width, 32, 7)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#171419'
    ctx.fillText(popup.text, popup.x, popup.y - 6)
  }
  ctx.restore()
}

function drawCanvas(canvas: HTMLCanvasElement, world: World) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.save()
  if (world.shake > 0) {
    const amplitude = world.shake * 12
    ctx.translate((world.random() - 0.5) * amplitude, (world.random() - 0.5) * amplitude)
  }
  drawBackground(ctx, world)
  const pressure = debtPressure(world)
  for (const platform of world.platforms) drawPlatform(ctx, platform, pressure)
  for (const entity of world.entities) drawEntity(ctx, entity, pressure)
  drawPlayer(ctx, world)
  drawPopups(ctx, world.popups)
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255, 66, 57, ${world.flash * 0.75})`
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }
  ctx.restore()
}

const moneyFormatter = new Intl.NumberFormat('fr-FR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function formatMoney(value: number) {
  const sign = value < 0 ? '−' : ''
  return `${sign}${moneyFormatter.format(Math.abs(Math.round(value)))} €`
}

function finalTitle(net: number) {
  if (net >= 300_000) return 'MORT RICHE. QUELLE INDÉCENCE.'
  if (net >= 70_000) return 'TU T’EN SORS PAS SI MAL.'
  if (net >= 0) return 'AU MOINS TU NE DOIS RIEN.'
  if (net > -120_000) return 'TU LAISSES QUELQUES FACTURES.'
  return 'MÊME LA MORT EST À CRÉDIT.'
}

export function DebthOfLife({ active, seed, restartToken, session }: GameComponentProps) {
  const worldRef = useRef<World>(createWorld(seed))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const finishRef = useRef(false)
  const pointerRef = useRef<number | null>(null)
  const [view, setView] = useState<View>(() => snapshot(worldRef.current))
  const [jumpPressed, setJumpPressed] = useState(false)

  const finishRun = useCallback(() => {
    const world = worldRef.current
    if (finishRef.current || world.finished) return
    finishRef.current = true
    world.finished = true
    world.holdingJump = false
    const score = netWorth(world)
    world.reportedScore = score
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
        houses: world.assets.house,
        cars: world.assets.car,
        children: world.assets.child,
        dogs: world.assets.dog,
        relationships: world.assets.love,
      },
    })
  }, [session])

  useEffect(() => {
    const world = createWorld(seed)
    worldRef.current = world
    finishRef.current = false
    pointerRef.current = null
    lastFrameRef.current = null
    setJumpPressed(false)
    setView(snapshot(world))
    session.setScore(netWorth(world))
    if (canvasRef.current) drawCanvas(canvasRef.current, world)
  }, [restartToken, seed, session])

  useEffect(() => {
    if (!active) {
      worldRef.current.holdingJump = false
      setJumpPressed(false)
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

      if (!world.finished && world.scoreTimer >= 0.45) {
        const score = netWorth(world)
        world.scoreTimer = 0
        if (Math.abs(score - world.reportedScore) >= 500) {
          world.reportedScore = score
          session.setScore(score)
        }
      }

      if (world.hudTimer >= 0.12) {
        world.hudTimer = 0
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (![' ', 'ArrowUp', 'w', 'W', 'z', 'Z'].includes(event.key)) return
      event.preventDefault()
      if (event.repeat) return
      if (startJump(worldRef.current)) setJumpPressed(true)
      else worldRef.current.holdingJump = true
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (![' ', 'ArrowUp', 'w', 'W', 'z', 'Z'].includes(event.key)) return
      event.preventDefault()
      stopJump(worldRef.current)
      setJumpPressed(false)
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [active, view.finished])

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  const onJumpDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!active || view.finished) return
    event.preventDefault()
    pointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    if (startJump(worldRef.current)) setJumpPressed(true)
    else worldRef.current.holdingJump = true
  }

  const releaseJump = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerRef.current !== null && event.currentTarget.hasPointerCapture(pointerRef.current)) {
      event.currentTarget.releasePointerCapture(pointerRef.current)
    }
    pointerRef.current = null
    stopJump(worldRef.current)
    setJumpPressed(false)
  }

  const acquisitions = useMemo(() => (
    (Object.keys(view.assets) as AssetKey[])
      .filter((key) => view.assets[key] > 0)
      .map((key) => ({ key, count: view.assets[key], ...assetLabels[key] }))
  ), [view.assets])

  const style = {
    '--dol-pressure': view.debtPressure.toFixed(3),
  } as CSSProperties

  return (
    <div className="dol-root" style={style}>
      <div className="mf-game-layout dol-layout">
        <header className="mf-game-hud dol-hud" aria-label="Situation financière">
          <div className="dol-stat is-age">
            <span className="dol-stat-label">ÂGE</span>
            <strong>{Math.floor(view.age)} ans</strong>
          </div>
          <div className="dol-stat is-cash">
            <span className="dol-stat-label">BANQUE</span>
            <strong>{formatMoney(view.cash)}</strong>
          </div>
          <div className="dol-stat is-debt">
            <span className="dol-stat-label">DETTE</span>
            <strong>{formatMoney(view.debt)}</strong>
          </div>
          <div className="dol-stat is-salary">
            <span className="dol-stat-label">SALAIRE</span>
            <strong>{formatMoney(view.salary)}/an</strong>
          </div>
        </header>

        <main className="mf-game-stage dol-stage">
          <canvas
            ref={canvasRef}
            className="dol-canvas"
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label="Course de ta vie : saute par-dessus les dettes et attrape les opportunités."
          />

          <div className="dol-debt-meter" aria-label={`Pression de la dette ${Math.round(view.debtPressure * 100)}%`}>
            <span>PRESSION DE LA DETTE</span>
            <div className="dol-debt-track"><i style={{ width: `${Math.round(view.debtPressure * 100)}%` }} /></div>
          </div>

          {view.finished && (
            <section className="dol-summary" aria-label="Bilan de vie">
              <p className="dol-summary-kicker">BILAN À {END_AGE} ANS</p>
              <h2>{finalTitle(view.netWorth)}</h2>
              <div className="dol-summary-money">
                <span><small>Banque</small><b>{formatMoney(view.cash)}</b></span>
                <span><small>Dettes</small><b>−{formatMoney(view.debt)}</b></span>
                <span><small>Acquis valorisés</small><b>{formatMoney(view.assetValue)}</b></span>
                <span className={view.netWorth < 0 ? 'is-negative' : 'is-positive'}><small>Patrimoine net</small><b>{formatMoney(view.netWorth)}</b></span>
              </div>
              <div className="dol-acquisitions">
                {acquisitions.length > 0 ? acquisitions.map((item) => (
                  <span key={item.key}>{item.icon} {item.label}{item.count > 1 ? ` ×${item.count}` : ''}</span>
                )) : <span>🧾 Tu n’as acquis que des justificatifs.</span>}
              </div>
            </section>
          )}
        </main>

        <footer className="mf-game-controls dol-controls">
          <button
            className={`dol-jump ${jumpPressed ? 'is-pressed' : ''}`}
            type="button"
            aria-label="Sauter. Maintenir pour sauter plus haut."
            onPointerDown={onJumpDown}
            onPointerUp={releaseJump}
            onPointerCancel={releaseJump}
            onLostPointerCapture={() => {
              pointerRef.current = null
              stopJump(worldRef.current)
              setJumpPressed(false)
            }}
            disabled={view.finished}
          >
            <span>SAUTE !</span>
            <small>maintiens = plus haut</small>
          </button>
          <p className="dol-control-hint">Évite ce qui t’endette. Attrape ce qui te paie. Plus tu vieillis, moins ton corps coopère.</p>
        </footer>
      </div>
    </div>
  )
}
