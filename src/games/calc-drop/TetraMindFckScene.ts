import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { miniFuggAudio } from '../../audio/index'

export const TETRAMINDFCK_SCENE_KEY = 'tetramindfck-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GAME_ID = 'tetramindfck'
const COLS = 10
const ROWS = 20
const BOARD_X = 82
const BOARD_Y = 108
const CELL_SIZE = 26.8
const BOARD_WIDTH = CELL_SIZE * COLS
const BOARD_HEIGHT = CELL_SIZE * ROWS
const INFO_X = 8
const INFO_WIDTH = 66
const CONTROL_SIZE = 48
const CONTROL_BOTTOM = 746
const LOCK_TICKS = 3
const CLEAR_SETTLE_MS = 1180
const MAX_NUMBER = 9
const BASE_MAX_MULTIPLIER = 3
const STANDARD_LINE_MAX = MAX_NUMBER * (BASE_MAX_MULTIPLIER ** (COLS - 1))
const BIG_CLEAR_THRESHOLD = 1000

const PAPER = 0xf2efe6
const BOARD_BG = 0xddd8ca
const INK = 0x151515
const NUMBER_BG = 0xf7f3e8
const MULTIPLY_BG = 0xe0c857
const DIVIDE_BG = 0x7b9fc5
const BONUS_BG = 0xd64b36
const GHOST = 0x8f8a7e

const SHAPE_IDS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const
type ShapeId = typeof SHAPE_IDS[number]
type TileKind = 'number' | 'multiply' | 'divide' | 'reverse'
type BonusKind = 'reverse' | 'multiply4' | 'multiply6'
type ActionName = 'left' | 'right' | 'down' | 'rotateLeft' | 'rotateRight'

type Tile = {
  kind: TileKind
  value: number
  label: string
  bonus?: BonusKind
}

type Coord = { x: number; y: number }

type Piece = {
  shape: ShapeId
  rotation: number
  x: number
  y: number
  tokens: Tile[]
}

type ShapeDefinition = {
  cells: Coord[]
  pivot: Coord
}

type LineReport = {
  value: number
  points: number
  reversed: boolean
  steps: Array<number | null>
}

type ClearRowSnapshot = {
  rowIndex: number
  tiles: Tile[]
  report: LineReport
}

type PendingClear = {
  fullRows: number[]
  reports: LineReport[]
  gained: number
  earnedBonus: BonusKind | null
}

export type TetraMindFckSceneBridge = {
  seed: number
  renderPixelRatio?: number
  session: GameSessionApi
  onLevelChange?: (level: number) => void
  onFinished?: () => void
}

const SHAPES: Record<ShapeId, ShapeDefinition> = {
  I: { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], pivot: { x: 1.5, y: 1.5 } },
  O: { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1.5, y: 0.5 } },
  T: { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 0 }], pivot: { x: 1, y: 1 } },
  S: { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], pivot: { x: 1, y: 1 } },
  Z: { cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
  J: { cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
  L: { cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
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

function seededShuffle<T>(items: readonly T[], seed: number) {
  const random = mulberry32(seed || 1)
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function shapeForIndex(seed: number, index: number) {
  const bagIndex = Math.floor(index / SHAPE_IDS.length)
  const withinBag = index % SHAPE_IDS.length
  return seededShuffle(SHAPE_IDS, (seed ^ Math.imul(bagIndex + 1, 0x45d9f3b)) >>> 0)[withinBag]
}

function tokenFor(random: () => number): Tile {
  if (random() > 0.29) {
    const value = Math.floor(random() * 10)
    return { kind: 'number', value, label: String(value) }
  }
  const isMultiply = random() < 0.68
  const value = random() < 0.72 ? 2 : 3
  return { kind: isMultiply ? 'multiply' : 'divide', value, label: `${isMultiply ? '×' : '÷'}${value}` }
}

function bonusTile(kind: BonusKind): Tile {
  if (kind === 'reverse') return { kind: 'reverse', value: 0, label: '⇄', bonus: kind }
  const value = kind === 'multiply4' ? 4 : 6
  return { kind: 'multiply', value, label: `×${value}`, bonus: kind }
}

function bonusForClear(lineCount: number): BonusKind | null {
  if (lineCount >= 4) return 'multiply6'
  if (lineCount === 3) return 'multiply4'
  if (lineCount === 2) return 'reverse'
  return null
}

function createPiece(seed: number, index: number, bonus: BonusKind | null = null): Piece {
  const random = mulberry32((seed ^ Math.imul(index + 17, 0x27d4eb2d)) >>> 0)
  const tokens = Array.from({ length: 4 }, () => tokenFor(random))
  if (bonus) tokens[Math.floor(random() * tokens.length)] = bonusTile(bonus)
  return { shape: shapeForIndex(seed, index), rotation: 0, x: 3, y: -1, tokens }
}

function rotateCoord(coord: Coord, pivot: Coord, direction: -1 | 1) {
  const dx = coord.x - pivot.x
  const dy = coord.y - pivot.y
  return direction === 1
    ? { x: Math.round(pivot.x - dy), y: Math.round(pivot.y + dx) }
    : { x: Math.round(pivot.x + dy), y: Math.round(pivot.y - dx) }
}

function pieceCells(piece: Piece) {
  const definition = SHAPES[piece.shape]
  let coords = definition.cells.map((cell) => ({ ...cell }))
  const turns = ((piece.rotation % 4) + 4) % 4
  for (let turn = 0; turn < turns; turn += 1) coords = coords.map((coord) => rotateCoord(coord, definition.pivot, 1))
  return coords.map((coord, tokenIndex) => ({ x: piece.x + coord.x, y: piece.y + coord.y, tokenIndex }))
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array<Tile | null>(COLS).fill(null))
}

function theoreticalMaxForRow(row: Tile[]) {
  const arithmeticSlots = Math.max(0, row.length - row.filter((tile) => tile.kind === 'reverse').length)
  if (arithmeticSlots === 0) return 0
  const strongMultipliers = row
    .filter((tile) => tile.kind === 'multiply' && tile.value > BASE_MAX_MULTIPLIER)
    .map((tile) => tile.value)
    .sort((a, b) => b - a)
    .slice(0, Math.max(0, arithmeticSlots - 1))
  return Math.round(
    MAX_NUMBER
    * strongMultipliers.reduce((product, multiplier) => product * multiplier, 1)
    * (BASE_MAX_MULTIPLIER ** Math.max(0, arithmeticSlots - 1 - strongMultipliers.length)),
  )
}

function evaluateRow(row: Tile[]): LineReport {
  const reversed = row.some((tile) => tile.kind === 'reverse')
  const order = Array.from({ length: row.length }, (_, index) => index)
  if (reversed) order.reverse()
  const theoreticalMax = theoreticalMaxForRow(row)
  const steps = Array<number | null>(row.length).fill(null)
  let value = 0
  for (const column of order) {
    const tile = row[column]
    if (tile.kind === 'reverse') continue
    if (tile.kind === 'number') value += tile.value
    if (tile.kind === 'multiply') value *= tile.value
    if (tile.kind === 'divide') value /= tile.value
    value = Math.min(theoreticalMax, Math.max(0, value))
    steps[column] = value
  }
  return { value, points: Math.max(0, Math.round(value)), reversed, steps }
}

function targetForLevel(level: number) {
  return level <= 1 ? 50 : (level - 1) * 100
}

function advanceObjective(level: number, bestAttempt: number, singleLineScore: number) {
  let nextLevel = level
  while (singleLineScore >= targetForLevel(nextLevel)) nextLevel += 1
  const levelsGained = nextLevel - level
  return {
    level: nextLevel,
    levelsGained,
    bestAttempt: levelsGained > 0 ? singleLineScore : Math.max(bestAttempt, singleLineScore),
  }
}

function dropDelay(level: number) {
  return Math.max(70, Math.round(820 * (0.82 ** (level - 1))))
}

function formatCompact(value: number) {
  const absolute = Math.abs(value)
  if (absolute < 1000) return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.0', '')
  if (absolute < 1_000_000) return `${(value / 1000).toFixed(1).replace('.0', '')}k`
  return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`
}

function tileFill(tile: Tile) {
  if (tile.bonus || tile.kind === 'reverse') return BONUS_BG
  if (tile.kind === 'multiply') return MULTIPLY_BG
  if (tile.kind === 'divide') return DIVIDE_BG
  return NUMBER_BG
}

export class TetraMindFckScene extends Phaser.Scene {
  private readonly bridge: TetraMindFckSceneBridge
  private board: Array<Array<Tile | null>> = emptyBoard()
  private active: Piece = createPiece(1, 0)
  private pieceIndex = 0
  private score = 0
  private level = 1
  private bestAttempt = 0
  private lines = 0
  private lockTicks = 0
  private finished = false
  private pendingClear: PendingClear | null = null
  private gravityTimer: Phaser.Time.TimerEvent | null = null
  private holdTimer: Phaser.Time.TimerEvent | null = null

  private cellRects: Phaser.GameObjects.Rectangle[] = []
  private cellTexts: Phaser.GameObjects.Text[] = []
  private boardFrame!: Phaser.GameObjects.Graphics
  private lockGraphics!: Phaser.GameObjects.Graphics
  private levelText!: Phaser.GameObjects.Text
  private targetText!: Phaser.GameObjects.Text
  private bestText!: Phaser.GameObjects.Text
  private progressGraphics!: Phaser.GameObjects.Graphics
  private nextOne!: Phaser.GameObjects.Container
  private nextTwo!: Phaser.GameObjects.Container
  private clearLayer!: Phaser.GameObjects.Container

  constructor(bridge: TetraMindFckSceneBridge) {
    super({ key: TETRAMINDFCK_SCENE_KEY })
    this.bridge = bridge
  }

  init() {
    const seed = this.bridge.seed || 1
    this.board = emptyBoard()
    this.active = createPiece(seed, 0)
    this.pieceIndex = 0
    this.score = 0
    this.level = 1
    this.bestAttempt = 0
    this.lines = 0
    this.lockTicks = 0
    this.finished = false
    this.pendingClear = null
  }

  create() {
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(STAGE_WIDTH / 2, STAGE_HEIGHT / 2)
    this.drawBackground()
    this.createBoard()
    this.createHud()
    this.createControls()
    this.clearLayer = this.add.container(0, 0).setDepth(30)
    this.registerKeyboard()
    this.input.on('pointerup', this.stopHold, this)
    this.input.on('pointerupoutside', this.stopHold, this)
    this.events.once('shutdown', this.handleShutdown, this)
    this.bridge.session.setScore(0)
    this.bridge.onLevelChange?.(1)
    this.resetGravityTimer()
    this.renderAll()

    if (import.meta.env.DEV) {
      Object.assign(window, { render_game_to_text: () => JSON.stringify({
        game: GAME_ID,
        runtime: 'phaser-2d',
        coordinateSystem: '390x844; origin top-left; x right, y down',
        board: { x: BOARD_X, y: BOARD_Y, width: BOARD_WIDTH, height: BOARD_HEIGHT, cols: COLS, rows: ROWS },
        level: this.level,
        target: targetForLevel(this.level),
        bestAttempt: this.bestAttempt,
        score: this.score,
        lines: this.lines,
        pieceIndex: this.pieceIndex,
        pendingClear: Boolean(this.pendingClear),
        gameOver: this.finished,
      }) })
    }
  }

  private drawBackground() {
    const background = this.add.graphics().setDepth(0)
    background.fillStyle(PAPER, 1).fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)
    background.lineStyle(1, INK, 0.045)
    for (let x = 0; x <= STAGE_WIDTH; x += 22) background.lineBetween(x, 0, x, STAGE_HEIGHT)
    for (let y = 0; y <= STAGE_HEIGHT; y += 22) background.lineBetween(0, y, STAGE_WIDTH, y)
  }

  private createBoard() {
    this.boardFrame = this.add.graphics().setDepth(2)
    this.boardFrame.fillStyle(BOARD_BG, 1).fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    this.boardFrame.lineStyle(3, INK, 1).strokeRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    this.boardFrame.lineStyle(1, INK, 0.12)
    for (let column = 1; column < COLS; column += 1) {
      const x = BOARD_X + column * CELL_SIZE
      this.boardFrame.lineBetween(x, BOARD_Y, x, BOARD_Y + BOARD_HEIGHT)
    }
    for (let row = 1; row < ROWS; row += 1) {
      const y = BOARD_Y + row * CELL_SIZE
      this.boardFrame.lineBetween(BOARD_X, y, BOARD_X + BOARD_WIDTH, y)
    }

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLS; column += 1) {
        const x = BOARD_X + (column + 0.5) * CELL_SIZE
        const y = BOARD_Y + (row + 0.5) * CELL_SIZE
        const rect = this.add.rectangle(x, y, CELL_SIZE - 1, CELL_SIZE - 1, NUMBER_BG, 1).setDepth(5).setVisible(false)
        const text = this.add.text(x, y, '', {
          fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', color: '#151515', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(6).setVisible(false)
        this.cellRects.push(rect)
        this.cellTexts.push(text)
      }
    }
    this.lockGraphics = this.add.graphics().setDepth(12)
  }

  private createHud() {
    const heading = { fontFamily: 'Inter, Arial, sans-serif', fontSize: '11px', color: '#151515', fontStyle: 'bold' as const }
    const value = { fontFamily: 'Inter, Arial, sans-serif', fontSize: '25px', color: '#151515', fontStyle: 'bold' as const }

    const rule = this.add.graphics().setDepth(4)
    rule.lineStyle(3, INK, 1).lineBetween(INFO_X, 108, INFO_X + INFO_WIDTH, 108)
    rule.lineStyle(1, INK, 1).lineBetween(INFO_X, 158, INFO_X + INFO_WIDTH, 158)

    this.add.text(INFO_X + INFO_WIDTH / 2, 116, 'LVL', heading).setOrigin(0.5, 0).setDepth(5)
    this.levelText = this.add.text(INFO_X + INFO_WIDTH / 2, 132, '1', value).setOrigin(0.5, 0).setDepth(5)

    this.add.text(INFO_X + INFO_WIDTH / 2, 177, 'OBJECTIF', heading).setOrigin(0.5, 0).setDepth(5)
    this.targetText = this.add.text(INFO_X + INFO_WIDTH / 2, 193, '50', {
      ...value, fontSize: '22px', color: '#d64b36',
    }).setOrigin(0.5, 0).setDepth(5)
    this.add.text(INFO_X + INFO_WIDTH / 2, 220, 'EN 1 COUP', {
      ...heading, fontSize: '9px',
    }).setOrigin(0.5, 0).setDepth(5)

    this.progressGraphics = this.add.graphics().setDepth(5)
    this.add.text(INFO_X + INFO_WIDTH / 2, 357, 'MEILLEUR', { ...heading, fontSize: '9px' }).setOrigin(0.5, 0).setDepth(5)
    this.bestText = this.add.text(INFO_X + INFO_WIDTH / 2, 373, '0', {
      ...heading, fontSize: '14px',
    }).setOrigin(0.5, 0).setDepth(5)

    const nextRule = this.add.graphics().setDepth(4)
    nextRule.lineStyle(2, INK, 1).lineBetween(INFO_X, 405, INFO_X + INFO_WIDTH, 405)
    this.add.text(INFO_X + INFO_WIDTH / 2, 414, 'NEXT', heading).setOrigin(0.5, 0).setDepth(5)
    this.nextOne = this.add.container(INFO_X + INFO_WIDTH / 2, 449).setDepth(6)
    this.nextTwo = this.add.container(INFO_X + INFO_WIDTH / 2, 513).setDepth(6)
  }

  private createControls() {
    this.makeButton(8 + CONTROL_SIZE / 2, CONTROL_BOTTOM - CONTROL_SIZE - 4, '←', NUMBER_BG, 'left')
    this.makeButton(8 + CONTROL_SIZE + 6 + CONTROL_SIZE / 2, CONTROL_BOTTOM - CONTROL_SIZE - 4, '→', NUMBER_BG, 'right')
    this.makeButton(8 + (CONTROL_SIZE * 2 + 6) / 2, CONTROL_BOTTOM - CONTROL_SIZE / 2, '↓', MULTIPLY_BG, 'down')
    this.makeButton(282 + CONTROL_SIZE / 2, CONTROL_BOTTOM - CONTROL_SIZE / 2, '↺', DIVIDE_BG, 'rotateLeft')
    this.makeButton(282 + CONTROL_SIZE + 8 + CONTROL_SIZE / 2, CONTROL_BOTTOM - CONTROL_SIZE / 2, '↻', DIVIDE_BG, 'rotateRight')
  }

  private makeButton(x: number, y: number, label: string, fill: number, action: ActionName) {
    this.add.rectangle(x + 3, y + 3, CONTROL_SIZE, CONTROL_SIZE, INK, 1).setDepth(8)
    const rect = this.add.rectangle(x, y, CONTROL_SIZE, CONTROL_SIZE, fill, 1)
      .setStrokeStyle(2, INK, 1)
      .setDepth(9)
      .setInteractive({ useHandCursor: true })
    this.add.text(x, y, label, {
      fontFamily: 'Inter, Arial, sans-serif', fontSize: '27px', color: '#151515', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10)
    rect.on('pointerdown', () => {
      if (this.finished || this.pendingClear) return
      rect.setPosition(x + 2, y + 2)
      this.runAction(action)
      if (action === 'left' || action === 'right' || action === 'down') this.startHold(action)
    })
    rect.on('pointerup', () => { rect.setPosition(x, y); this.stopHold() })
    rect.on('pointerout', () => { rect.setPosition(x, y); this.stopHold() })
  }

  private registerKeyboard() {
    const keyboard = this.input.keyboard
    if (!keyboard) return
    keyboard.addCapture('UP,DOWN,LEFT,RIGHT,Z,X')
    keyboard.on('keydown-LEFT', () => this.runAction('left'))
    keyboard.on('keydown-RIGHT', () => this.runAction('right'))
    keyboard.on('keydown-DOWN', () => this.runAction('down'))
    keyboard.on('keydown-UP', () => this.runAction('rotateRight'))
    keyboard.on('keydown-Z', () => this.runAction('rotateLeft'))
    keyboard.on('keydown-X', () => this.runAction('rotateRight'))
  }

  private startHold(action: 'left' | 'right' | 'down') {
    this.stopHold()
    this.holdTimer = this.time.addEvent({
      delay: action === 'down' ? 55 : 100,
      loop: true,
      callback: () => this.runAction(action),
    })
  }

  private stopHold = () => {
    this.holdTimer?.remove()
    this.holdTimer = null
  }

  private resetGravityTimer() {
    this.gravityTimer?.remove()
    this.gravityTimer = null
    if (this.finished || this.pendingClear) return
    this.gravityTimer = this.time.addEvent({
      delay: dropDelay(this.level), loop: true, callback: this.tick, callbackScope: this,
    })
  }

  private canPlace(piece: Piece) {
    return pieceCells(piece).every(({ x, y }) => {
      if (x < 0 || x >= COLS || y >= ROWS) return false
      if (y < 0) return true
      return this.board[y][x] === null
    })
  }

  private isGrounded(piece = this.active) {
    return !this.canPlace({ ...piece, y: piece.y + 1 })
  }

  private tick() {
    if (this.finished || this.pendingClear) return
    const moved = { ...this.active, y: this.active.y + 1 }
    if (this.canPlace(moved)) {
      this.active = moved
      this.lockTicks = 0
      this.renderBoard()
      return
    }
    this.consumeLockTick()
  }

  private runAction(action: ActionName) {
    if (this.finished || this.pendingClear) return
    if (action === 'left' || action === 'right') {
      void miniFuggAudio.playGameSfx(GAME_ID, 'move')
      const moved = { ...this.active, x: this.active.x + (action === 'left' ? -1 : 1) }
      if (!this.canPlace(moved)) return
      this.active = moved
      if (!this.isGrounded(moved)) this.lockTicks = 0
      this.renderBoard()
      return
    }
    if (action === 'down') {
      void miniFuggAudio.playGameSfx(GAME_ID, 'softDrop')
      const moved = { ...this.active, y: this.active.y + 1 }
      if (this.canPlace(moved)) {
        this.active = moved
        this.lockTicks = 0
        this.renderBoard()
      } else if (this.isGrounded()) {
        this.consumeLockTick()
      }
      return
    }

    void miniFuggAudio.playGameSfx(GAME_ID, 'rotate')
    const direction = action === 'rotateLeft' ? -1 : 1
    const nextRotation = this.active.rotation + direction
    for (const kick of [0, -1, 1, -2, 2]) {
      const rotated = { ...this.active, rotation: nextRotation, x: this.active.x + kick }
      if (!this.canPlace(rotated)) continue
      this.active = rotated
      if (!this.isGrounded(rotated)) this.lockTicks = 0
      this.renderBoard()
      return
    }
  }

  private consumeLockTick() {
    this.lockTicks += 1
    if (this.lockTicks >= LOCK_TICKS) this.lockPiece()
    else this.renderLockMeter()
  }

  private lockPiece() {
    const board = this.board.map((row) => [...row])
    let toppedOut = false
    for (const { x, y, tokenIndex } of pieceCells(this.active)) {
      if (y < 0) { toppedOut = true; continue }
      board[y][x] = this.active.tokens[tokenIndex]
    }
    this.board = board
    this.lockTicks = 0
    void miniFuggAudio.playGameSfx(GAME_ID, 'land', { intensity: 1 })
    if (toppedOut) { this.finishRun(); return }

    const fullRows: number[] = []
    const reports: LineReport[] = []
    for (let row = 0; row < ROWS; row += 1) {
      if (board[row].every((cell) => cell !== null)) {
        fullRows.push(row)
        reports.push(evaluateRow(board[row] as Tile[]))
      }
    }

    if (fullRows.length === 0) {
      this.spawnNextPiece(null)
      return
    }

    const snapshots = fullRows.map((rowIndex, index) => ({
      rowIndex, tiles: [...(board[rowIndex] as Tile[])], report: reports[index],
    }))
    const gained = reports.reduce((sum, report) => sum + report.points, 0)
    const earnedBonus = bonusForClear(fullRows.length)
    this.pendingClear = { fullRows, reports, gained, earnedBonus }
    this.gravityTimer?.remove()
    this.gravityTimer = null
    this.stopHold()
    this.renderBoard()
    void miniFuggAudio.playGameSfx(GAME_ID, 'calculate', { intensity: Math.min(1.25, 0.82 + fullRows.length * 0.12) })
    if (earnedBonus) this.time.delayedCall(135, () => void miniFuggAudio.playGameSfx(GAME_ID, 'bonus'))
    if (gained > BIG_CLEAR_THRESHOLD) void miniFuggAudio.playGameSfx(GAME_ID, 'bigImpact', { intensity: 1.05 })
    this.animateClearRows(snapshots)
    this.time.delayedCall(CLEAR_SETTLE_MS, this.commitClear, [], this)
  }

  private spawnNextPiece(bonus: BonusKind | null) {
    this.pieceIndex += 1
    this.active = createPiece(this.bridge.seed || 1, this.pieceIndex, bonus)
    this.renderAll()
    if (!this.canPlace(this.active)) this.finishRun()
  }

  private commitClear() {
    const pending = this.pendingClear
    if (!pending || this.finished) return
    this.board = [
      ...Array.from({ length: pending.fullRows.length }, () => Array<Tile | null>(COLS).fill(null)),
      ...this.board.filter((_, rowIndex) => !pending.fullRows.includes(rowIndex)),
    ]
    const singleLineScore = Math.max(...pending.reports.map((report) => report.points), 0)
    const progression = advanceObjective(this.level, this.bestAttempt, singleLineScore)
    const previousLevel = this.level
    this.level = progression.level
    this.bestAttempt = progression.bestAttempt
    this.score += pending.gained
    this.lines += pending.fullRows.length
    const earnedBonus = pending.earnedBonus
    this.pendingClear = null
    this.clearLayer.removeAll(true)
    this.bridge.session.setScore(this.score)
    if (this.level !== previousLevel) {
      this.bridge.onLevelChange?.(this.level)
      void miniFuggAudio.playGameSfx(GAME_ID, 'levelUp', { intensity: Math.min(1.25, 0.9 + progression.levelsGained * 0.08) })
    }
    this.pieceIndex += 1
    this.active = createPiece(this.bridge.seed || 1, this.pieceIndex, earnedBonus)
    this.renderAll()
    if (!this.canPlace(this.active)) { this.finishRun(); return }
    this.resetGravityTimer()
  }

  private finishRun() {
    if (this.finished) return
    this.finished = true
    this.gravityTimer?.remove()
    this.gravityTimer = null
    this.stopHold()
    void miniFuggAudio.playGameSfx(GAME_ID, 'fail', { intensity: 0.95 })
    this.bridge.onFinished?.()
    this.bridge.session.finish({
      score: this.score,
      metadata: {
        level: this.level,
        lines: this.lines,
        target: targetForLevel(this.level),
        bestSingleLine: this.bestAttempt,
        standardLineMax: STANDARD_LINE_MAX,
      },
    })
  }

  private renderAll() {
    this.renderBoard()
    this.renderHud()
    this.renderPreviews()
    this.renderLockMeter()
  }

  private renderBoard() {
    const activeMap = new Map<string, Tile>()
    if (!this.pendingClear && !this.finished) {
      for (const { x, y, tokenIndex } of pieceCells(this.active)) {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) activeMap.set(`${x}:${y}`, this.active.tokens[tokenIndex])
      }
    }
    const ghostSet = new Set<string>()
    if (!this.pendingClear && !this.finished) {
      let ghost = this.active
      while (this.canPlace({ ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 }
      for (const { x, y } of pieceCells(ghost)) if (x >= 0 && x < COLS && y >= 0 && y < ROWS) ghostSet.add(`${x}:${y}`)
    }

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLS; column += 1) {
        const index = row * COLS + column
        const key = `${column}:${row}`
        const moving = activeMap.get(key)
        const settled = this.board[row][column]
        const tile = moving ?? settled
        const rect = this.cellRects[index]
        const text = this.cellTexts[index]
        if (!tile) {
          if (ghostSet.has(key)) {
            rect.setVisible(true).setFillStyle(BOARD_BG, 0).setStrokeStyle(1, GHOST, 0.7)
          } else rect.setVisible(false)
          text.setVisible(false)
          continue
        }
        rect.setVisible(true).setFillStyle(tileFill(tile), 1).setStrokeStyle(moving ? 2 : 1, moving ? BONUS_BG : INK, 1)
        text.setVisible(true).setText(tile.label).setColor(tile.bonus || tile.kind === 'reverse' ? '#ffffff' : '#151515')
      }
    }
    this.renderLockMeter()
  }

  private renderLockMeter() {
    this.lockGraphics.clear()
    if (this.pendingClear || this.finished || !this.isGrounded()) return
    const x = BOARD_X + BOARD_WIDTH + 4
    const baseY = BOARD_Y + BOARD_HEIGHT - 12
    for (let index = 0; index < LOCK_TICKS; index += 1) {
      this.lockGraphics.fillStyle(index < this.lockTicks ? BONUS_BG : 0xc9c3b5, 1)
      this.lockGraphics.fillRect(x, baseY - index * 16, 5, 12)
      this.lockGraphics.lineStyle(1, INK, 1).strokeRect(x, baseY - index * 16, 5, 12)
    }
  }

  private renderHud() {
    const target = targetForLevel(this.level)
    this.levelText.setText(String(this.level))
    this.targetText.setText(target.toLocaleString('fr-FR'))
    this.bestText.setText(this.bestAttempt.toLocaleString('fr-FR'))
    const ratio = Math.min(1, this.bestAttempt / target)
    const barX = INFO_X + INFO_WIDTH / 2 - 5
    const barY = 244
    const barHeight = 104
    this.progressGraphics.clear()
    this.progressGraphics.fillStyle(0xd8d3c6, 1).fillRect(barX, barY, 10, barHeight)
    this.progressGraphics.lineStyle(1, INK, 1).strokeRect(barX, barY, 10, barHeight)
    const fillHeight = Math.max(0, (barHeight - 2) * ratio)
    this.progressGraphics.fillStyle(BONUS_BG, 1).fillRect(barX + 1, barY + barHeight - 1 - fillHeight, 8, fillHeight)
  }

  private renderPreviews() {
    this.renderPreview(this.nextOne, createPiece(this.bridge.seed || 1, this.pieceIndex + 1, this.pendingClear?.earnedBonus ?? null))
    this.renderPreview(this.nextTwo, createPiece(this.bridge.seed || 1, this.pieceIndex + 2))
  }

  private renderPreview(container: Phaser.GameObjects.Container, piece: Piece) {
    container.removeAll(true)
    const cells = pieceCells({ ...piece, x: 0, y: 0 })
    const minX = Math.min(...cells.map((cell) => cell.x))
    const minY = Math.min(...cells.map((cell) => cell.y))
    const size = 12
    const offset = 18
    for (const cell of cells) {
      const tile = piece.tokens[cell.tokenIndex]
      const x = (cell.x - minX) * size - offset
      const y = (cell.y - minY) * size - 6
      const rect = this.add.rectangle(x, y, size - 1, size - 1, tileFill(tile), 1).setStrokeStyle(1, INK, 1)
      const label = this.add.text(x, y, tile.label, {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '7px', color: tile.bonus || tile.kind === 'reverse' ? '#ffffff' : '#151515', fontStyle: 'bold',
      }).setOrigin(0.5)
      container.add([rect, label])
    }
  }

  private animateClearRows(snapshots: ClearRowSnapshot[]) {
    for (const snapshot of snapshots) this.animateClearRow(snapshot)
  }

  private animateClearRow(snapshot: ClearRowSnapshot) {
    const rowY = BOARD_Y + (snapshot.rowIndex + 0.5) * CELL_SIZE
    const rowContainer = this.add.container(0, 0)
    this.clearLayer.add(rowContainer)
    const cells: Phaser.GameObjects.Container[] = []

    snapshot.tiles.forEach((tile, column) => {
      const x = BOARD_X + (column + 0.5) * CELL_SIZE
      const box = this.add.rectangle(0, 0, CELL_SIZE - 1, CELL_SIZE - 1, tileFill(tile), 1).setStrokeStyle(1, INK, 1)
      const effectLabel = tile.kind === 'number' ? `+${tile.label}` : tile.label
      const label = this.add.text(0, 0, effectLabel, {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '13px', color: tile.bonus || tile.kind === 'reverse' ? '#ffffff' : '#151515', fontStyle: 'bold',
      }).setOrigin(0.5)
      const cellContainer = this.add.container(x, rowY, [box, label])
      rowContainer.add(cellContainer)
      cells.push(cellContainer)

      const calculationOrder = snapshot.report.reversed ? COLS - 1 - column : column
      const stepValue = snapshot.report.steps[column]
      if (stepValue !== null) {
        const step = this.add.text(x, rowY - 18, formatCompact(stepValue), {
          fontFamily: 'Inter, Arial, sans-serif', fontSize: '9px', color: '#ffffff', backgroundColor: '#151515', fontStyle: 'bold', padding: { x: 2, y: 1 },
        }).setOrigin(0.5).setAlpha(0)
        rowContainer.add(step)
        this.time.delayedCall(70 + calculationOrder * 46, () => {
          this.tweens.add({ targets: [cellContainer], scale: 1.18, duration: 90, yoyo: true })
          this.tweens.add({ targets: step, alpha: 1, y: rowY - 21, duration: 90, hold: 210, yoyo: true })
        })
      }
    })

    const arrow = this.add.rectangle(
      snapshot.report.reversed ? BOARD_X + BOARD_WIDTH : BOARD_X,
      rowY,
      BOARD_WIDTH,
      3,
      BONUS_BG,
      1,
    ).setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setScale(0, 1)
    rowContainer.add(arrow)
    this.tweens.add({ targets: arrow, scaleX: 1, duration: 620, ease: 'Cubic.easeOut' })

    const scoreX = snapshot.report.reversed ? BOARD_X - 4 : BOARD_X + BOARD_WIDTH + 4
    const score = this.add.text(scoreX, rowY, `+${formatCompact(snapshot.report.points)}`, {
      fontFamily: 'Inter, Arial, sans-serif', fontSize: '12px', color: '#151515', backgroundColor: '#f2efe6', fontStyle: 'bold', padding: { x: 2, y: 2 },
    }).setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setAlpha(0)
    rowContainer.add(score)
    this.time.delayedCall(430, () => this.tweens.add({ targets: score, alpha: 1, duration: 100, hold: 420, yoyo: true }))

    cells.forEach((cell, column) => {
      const wipeOrder = COLS - 1 - column
      this.time.delayedCall(540 + wipeOrder * 34, () => {
        this.tweens.add({ targets: cell, alpha: 0, scaleX: 0.18, x: cell.x - 10, duration: 250, ease: 'Cubic.easeIn' })
      })
    })
  }

  private handleShutdown() {
    this.gravityTimer?.remove()
    this.gravityTimer = null
    this.stopHold()
    miniFuggAudio.stopGameSfx(GAME_ID)
    this.input.off('pointerup', this.stopHold, this)
    this.input.off('pointerupoutside', this.stopHold, this)
    this.input.keyboard?.removeAllListeners()
  }
}
