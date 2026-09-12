import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { miniFuggAudio } from '../../audio/index'

export const TETRAMINDFCK_SCENE_KEY = 'tetramindfck-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GAME_ID = 'tetramindfck'
const COLS = 10
const ROWS = 20

// Fixed 390x844 composition. All gameplay-critical geometry lives in CENTRE.
const SHELL_X = 4
const SHELL_Y = 56
const SHELL_W = 382
const SHELL_H = 706
const INFO_X = 10
const INFO_W = 82
const CRT_X = 98
const CRT_Y = 92
const CRT_W = 280
const CRT_H = 564
const SCORE_Y = 103
const BOARD_X = 112
const BOARD_Y = 142
const CELL_SIZE = 24.5
const BOARD_WIDTH = CELL_SIZE * COLS
const BOARD_HEIGHT = CELL_SIZE * ROWS
const MAIN_BUTTON_SIZE = 58
const MAIN_BUTTON_Y = 678
const MAIN_BUTTON_GAP = 4
const DOWN_BUTTON_SIZE = 44
const DOWN_BUTTON_Y = 731
const LOCK_TICKS = 3
const CLEAR_SETTLE_MS = 1180
const MAX_NUMBER = 9
const BASE_MAX_MULTIPLIER = 3
const STANDARD_LINE_MAX = MAX_NUMBER * (BASE_MAX_MULTIPLIER ** (COLS - 1))
const BIG_CLEAR_THRESHOLD = 1000

const ROOM_DARK = 0x3a3029
const ROOM_MID = 0x66584a
const SHELL = 0xeee0c6
const SHELL_LIGHT = 0xfff5df
const SHELL_SHADOW = 0xb9aa92
const INK = 0x1b211d
const CRT_BG = 0x0b2b22
const CRT_DEEP = 0x071f19
const CRT_GRID = 0x2f6551
const CRT_PHOSPHOR = 0xa6d5a5
const CRT_TEXT = '#b8e7b6'
const CRT_NUMBER = 0x8fba8f
const CRT_MULTIPLY = 0xae7977
const CRT_DIVIDE = 0xb39a68
const CRT_BONUS = 0x729fa0
const CRT_ACTIVE = 0xd2e8c6
const CRT_GHOST = 0x79a88f
const BUTTON_MOVE = 0xb83b59
const BUTTON_ROTATE_A = 0xd8952f
const BUTTON_ROTATE_B = 0x2790a3
const BUTTON_DOWN = 0x2d8f82

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
type Piece = { shape: ShapeId; rotation: number; x: number; y: number; tokens: Tile[] }
type ShapeDefinition = { cells: Coord[]; pivot: Coord }
type LineReport = { value: number; points: number; reversed: boolean; steps: Array<number | null> }
type ClearRowSnapshot = { rowIndex: number; tiles: Tile[]; report: LineReport }
type PendingClear = { fullRows: number[]; reports: LineReport[]; gained: number; earnedBonus: BonusKind | null }

export type TetraMindFckSceneBridge = {
  seed: number
  renderPixelRatio?: number
  session: GameSessionApi
  onLevelChange?: (level: number) => void
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
    const value = 1 + Math.floor(random() * 9)
    return { kind: 'number', value, label: String(value) }
  }
  const isMultiply = random() < (2 / 3)
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

function advanceObjective(level: number, bestAttempt: number, clearScore: number) {
  let nextLevel = level
  while (clearScore >= targetForLevel(nextLevel)) nextLevel += 1
  const levelsGained = nextLevel - level
  return {
    level: nextLevel,
    levelsGained,
    bestAttempt: levelsGained > 0 ? clearScore : Math.max(bestAttempt, clearScore),
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
  if (tile.bonus || tile.kind === 'reverse') return CRT_BONUS
  if (tile.kind === 'multiply') return CRT_MULTIPLY
  if (tile.kind === 'divide') return CRT_DIVIDE
  return CRT_NUMBER
}

function tileInk(tile: Tile) {
  return tile.bonus || tile.kind === 'reverse' ? '#102a28' : '#12261c'
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
  private crtOverlay!: Phaser.GameObjects.Graphics
  private lockGraphics!: Phaser.GameObjects.Graphics
  private levelText!: Phaser.GameObjects.Text
  private targetText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
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
    this.cellRects = []
    this.cellTexts = []
  }

  create() {
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(STAGE_WIDTH / 2, STAGE_HEIGHT / 2)
    this.drawBackground()
    this.drawShell()
    this.createBoard()
    this.createHud()
    this.createControls()
    this.clearLayer = this.add.container(0, 0).setDepth(30)
    this.drawCrtOverlay()
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
        bestClear: this.bestAttempt,
        score: this.score,
        lines: this.lines,
        pieceIndex: this.pieceIndex,
        pendingClear: Boolean(this.pendingClear),
        gameOver: this.finished,
      }) })
    }
  }

  private drawBackground() {
    const g = this.add.graphics().setDepth(0)
    g.fillStyle(ROOM_DARK, 1).fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)
    g.fillStyle(ROOM_MID, 1).fillRect(0, 0, STAGE_WIDTH, 88)
    g.fillStyle(0x211d19, 1).fillRect(0, 18, STAGE_WIDTH, 8)
    g.fillStyle(0x2c251f, 1).fillRect(100, 26, 208, 62)
    g.fillStyle(0x4f7653, 0.85).fillEllipse(35, 29, 46, 16)
    g.fillEllipse(47, 43, 34, 18)
    g.fillStyle(0xd7cbb9, 0.8).fillRoundedRect(330, 26, 36, 50, 8)
    g.fillStyle(0x24211e, 0.55).fillRect(341, 38, 14, 14)
  }

  private drawShell() {
    const g = this.add.graphics().setDepth(1)
    g.fillStyle(SHELL_SHADOW, 1).fillRoundedRect(SHELL_X + 3, SHELL_Y + 5, SHELL_W, SHELL_H, 24)
    g.fillStyle(SHELL, 1).fillRoundedRect(SHELL_X, SHELL_Y, SHELL_W, SHELL_H, 24)
    g.lineStyle(2, SHELL_LIGHT, 0.95).strokeRoundedRect(SHELL_X + 1, SHELL_Y + 1, SHELL_W - 2, SHELL_H - 2, 23)
    g.lineStyle(1, INK, 0.2).strokeRoundedRect(SHELL_X + 8, SHELL_Y + 8, SHELL_W - 16, SHELL_H - 16, 18)

    this.add.text(20, 68, 'TetraMindFck / Calc Drop', {
      fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: '16px', color: '#1b211d', fontStyle: 'bold italic',
    }).setDepth(3)
    this.add.text(326, 70, 'MINIFUGG', {
      fontFamily: 'monospace', fontSize: '8px', color: '#1b211d', fontStyle: 'bold', letterSpacing: 1,
    }).setDepth(3)

    // Left equipment rail: cream body directly around the CRT apertures.
    g.fillStyle(0xd9cbb3, 1).fillRoundedRect(INFO_X - 2, 102, INFO_W + 4, 444, 12)
    g.lineStyle(1, INK, 0.3).strokeRoundedRect(INFO_X - 2, 102, INFO_W + 4, 444, 12)

    // One CRT frame only.
    g.fillStyle(0x17231e, 1).fillRoundedRect(CRT_X - 4, CRT_Y - 4, CRT_W + 8, CRT_H + 8, 18)
    g.fillStyle(CRT_BG, 1).fillRoundedRect(CRT_X, CRT_Y, CRT_W, CRT_H, 14)
    g.lineStyle(2, 0x7f9b82, 0.42).strokeRoundedRect(CRT_X + 1, CRT_Y + 1, CRT_W - 2, CRT_H - 2, 13)
  }

  private createBoard() {
    this.boardFrame = this.add.graphics().setDepth(4)
    this.boardFrame.fillStyle(CRT_DEEP, 1).fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    this.boardFrame.lineStyle(1, CRT_GRID, 0.7).strokeRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    this.boardFrame.lineStyle(1, CRT_GRID, 0.42)
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
        const rect = this.add.rectangle(x, y, CELL_SIZE - 1, CELL_SIZE - 1, CRT_NUMBER, 0.76).setDepth(8).setVisible(false)
        const text = this.add.text(x, y + 0.5, '', {
          fontFamily: 'monospace', fontSize: '13px', color: '#12261c', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(9).setVisible(false)
        this.cellRects.push(rect)
        this.cellTexts.push(text)
      }
    }
    this.lockGraphics = this.add.graphics().setDepth(18)
  }

  private createMiniCrt(x: number, y: number, w: number, h: number, label: string) {
    const g = this.add.graphics().setDepth(4)
    g.fillStyle(0x17231e, 1).fillRoundedRect(x, y, w, h, 8)
    g.lineStyle(1, 0x7f9b82, 0.35).strokeRoundedRect(x, y, w, h, 8)
    g.fillStyle(CRT_BG, 1).fillRoundedRect(x + 4, y + 19, w - 8, h - 23, 5)
    this.add.text(x + w / 2, y + 4, label, {
      fontFamily: 'monospace', fontSize: '9px', color: CRT_TEXT, fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0.5, 0).setDepth(5)
    for (let sy = y + 23; sy < y + h - 4; sy += 3) {
      g.lineStyle(1, CRT_PHOSPHOR, 0.035).lineBetween(x + 5, sy, x + w - 5, sy)
    }
  }

  private createHud() {
    this.createMiniCrt(INFO_X + 2, 112, INFO_W - 4, 78, 'LEVEL')
    this.createMiniCrt(INFO_X + 2, 198, INFO_W - 4, 78, 'TARGET')
    this.createMiniCrt(INFO_X + 2, 286, INFO_W - 4, 116, 'NEXT')
    this.createMiniCrt(INFO_X + 2, 410, INFO_W - 4, 116, 'NEXT+1')

    this.levelText = this.add.text(INFO_X + INFO_W / 2, 156, '1', {
      fontFamily: 'monospace', fontSize: '28px', color: CRT_TEXT, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6)
    this.targetText = this.add.text(INFO_X + INFO_W / 2, 242, '50', {
      fontFamily: 'monospace', fontSize: '24px', color: '#d4a5a8', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6)

    // Immediate-next marker.
    this.add.triangle(INFO_X + 7, 313, 0, 0, 0, 12, 9, 6, CRT_ACTIVE, 0.9).setOrigin(0.5).setDepth(7)

    this.nextOne = this.add.container(INFO_X + INFO_W / 2, 349).setDepth(8)
    this.nextTwo = this.add.container(INFO_X + INFO_W / 2, 473).setDepth(8)

    this.add.text(CRT_X + 12, SCORE_Y, 'SCORE', {
      fontFamily: 'monospace', fontSize: '12px', color: CRT_TEXT, fontStyle: 'bold', letterSpacing: 1,
    }).setDepth(7)
    this.scoreText = this.add.text(CRT_X + CRT_W - 12, SCORE_Y - 2, '0', {
      fontFamily: 'monospace', fontSize: '22px', color: CRT_TEXT, fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(7)
  }

  private createControls() {
    const totalWidth = MAIN_BUTTON_SIZE * 4 + MAIN_BUTTON_GAP * 3
    const startX = (STAGE_WIDTH - totalWidth) / 2
    const centers = Array.from({ length: 4 }, (_, index) => startX + MAIN_BUTTON_SIZE / 2 + index * (MAIN_BUTTON_SIZE + MAIN_BUTTON_GAP))

    this.makeButton(centers[0], MAIN_BUTTON_Y, MAIN_BUTTON_SIZE, '◀', BUTTON_MOVE, 'left')
    this.makeButton(centers[1], MAIN_BUTTON_Y, MAIN_BUTTON_SIZE, '▶', BUTTON_MOVE, 'right')
    this.makeButton(centers[2], MAIN_BUTTON_Y, MAIN_BUTTON_SIZE, '↺', BUTTON_ROTATE_A, 'rotateLeft')
    this.makeButton(centers[3], MAIN_BUTTON_Y, MAIN_BUTTON_SIZE, '↻', BUTTON_ROTATE_B, 'rotateRight')
    this.makeButton((centers[0] + centers[1]) / 2, DOWN_BUTTON_Y, DOWN_BUTTON_SIZE, '▼', BUTTON_DOWN, 'down')

    const labelStyle = { fontFamily: 'monospace', fontSize: '8px', color: '#1b211d', fontStyle: 'bold' as const }
    this.add.text(centers[0], MAIN_BUTTON_Y + 37, 'LEFT', labelStyle).setOrigin(0.5).setDepth(12)
    this.add.text(centers[1], MAIN_BUTTON_Y + 37, 'RIGHT', labelStyle).setOrigin(0.5).setDepth(12)
    this.add.text(centers[2], MAIN_BUTTON_Y + 37, 'ROTATE', labelStyle).setOrigin(0.5).setDepth(12)
    this.add.text(centers[3], MAIN_BUTTON_Y + 37, 'ROTATE', labelStyle).setOrigin(0.5).setDepth(12)
    this.add.text((centers[0] + centers[1]) / 2, DOWN_BUTTON_Y + 28, 'DOWN', labelStyle).setOrigin(0.5).setDepth(12)
  }

  private makeButton(x: number, y: number, size: number, label: string, fill: number, action: ActionName) {
    const shadow = this.add.rectangle(x + 2, y + 3, size, size, 0x51473d, 0.9).setDepth(9)
    const rect = this.add.rectangle(x, y, size, size, fill, 1)
      .setStrokeStyle(2, INK, 0.9)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
    const gloss = this.add.rectangle(x, y - size * 0.22, size - 6, Math.max(5, size * 0.12), SHELL_LIGHT, 0.18).setDepth(11)
    const icon = this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif', fontSize: `${Math.round(size * 0.46)}px`, color: '#f8ead2', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12)

    const setPressed = (pressed: boolean) => {
      const dy = pressed ? 2 : 0
      rect.setPosition(x, y + dy)
      gloss.setPosition(x, y - size * 0.22 + dy)
      icon.setPosition(x, y + dy)
      shadow.setAlpha(pressed ? 0.45 : 0.9)
    }

    rect.on('pointerdown', () => {
      if (this.finished || this.pendingClear) return
      setPressed(true)
      this.runAction(action)
      if (action === 'left' || action === 'right' || action === 'down') this.startHold(action)
    })
    rect.on('pointerup', () => { setPressed(false); this.stopHold() })
    rect.on('pointerout', () => { setPressed(false); this.stopHold() })
  }

  private drawCrtOverlay() {
    this.crtOverlay = this.add.graphics().setDepth(26)
    this.crtOverlay.lineStyle(1, CRT_PHOSPHOR, 0.035)
    for (let y = CRT_Y + 2; y < CRT_Y + CRT_H - 2; y += 3) {
      this.crtOverlay.lineBetween(CRT_X + 3, y, CRT_X + CRT_W - 3, y)
    }
    this.crtOverlay.fillStyle(0x00140f, 0.09).fillRoundedRect(CRT_X + 2, CRT_Y + 2, CRT_W - 4, CRT_H - 4, 12)
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
      callback: () => this.runAction(action, false),
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
    this.gravityTimer = this.time.addEvent({ delay: dropDelay(this.level), loop: true, callback: this.tick, callbackScope: this })
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

  private runAction(action: ActionName, playSound = true) {
    if (this.finished || this.pendingClear) return
    if (action === 'left' || action === 'right') {
      if (playSound) void miniFuggAudio.playGameSfx(GAME_ID, 'move')
      const moved = { ...this.active, x: this.active.x + (action === 'left' ? -1 : 1) }
      if (!this.canPlace(moved)) return
      this.active = moved
      if (!this.isGrounded(moved)) this.lockTicks = 0
      this.renderBoard()
      return
    }
    if (action === 'down') {
      if (playSound) void miniFuggAudio.playGameSfx(GAME_ID, 'softDrop')
      const moved = { ...this.active, y: this.active.y + 1 }
      if (this.canPlace(moved)) {
        this.active = moved
        this.lockTicks = 0
        this.renderBoard()
      } else if (this.isGrounded()) this.consumeLockTick()
      return
    }

    if (playSound) void miniFuggAudio.playGameSfx(GAME_ID, 'rotate')
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

    const snapshots = fullRows.map((rowIndex, index) => ({ rowIndex, tiles: [...(board[rowIndex] as Tile[])], report: reports[index] }))
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
    const progression = advanceObjective(this.level, this.bestAttempt, pending.gained)
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
    this.bridge.session.finish({
      score: this.score,
      metadata: {
        level: this.level,
        lines: this.lines,
        target: targetForLevel(this.level),
        bestClear: this.bestAttempt,
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
            rect.setVisible(true).setFillStyle(CRT_BG, 0).setStrokeStyle(1, CRT_GHOST, 0.8)
          } else rect.setVisible(false)
          text.setVisible(false)
          continue
        }
        rect
          .setVisible(true)
          .setFillStyle(tileFill(tile), moving ? 0.9 : 0.74)
          .setStrokeStyle(moving ? 2 : 1, moving ? CRT_ACTIVE : CRT_DEEP, moving ? 0.9 : 0.7)
        text.setVisible(true).setText(tile.label).setColor(tileInk(tile))
      }
    }
    this.renderLockMeter()
  }

  private renderLockMeter() {
    this.lockGraphics.clear()
    if (this.pendingClear || this.finished || !this.isGrounded()) return
    const x = BOARD_X + BOARD_WIDTH + 5
    const baseY = BOARD_Y + BOARD_HEIGHT - 10
    for (let index = 0; index < LOCK_TICKS; index += 1) {
      this.lockGraphics.fillStyle(index < this.lockTicks ? CRT_BONUS : CRT_GRID, 0.85)
      this.lockGraphics.fillRect(x, baseY - index * 12, 4, 9)
    }
  }

  private renderHud() {
    const target = targetForLevel(this.level)
    this.levelText.setText(String(this.level))
    this.targetText.setText(String(target))
    this.targetText.setFontSize(String(target).length > 5 ? 17 : String(target).length > 3 ? 20 : 24)
    this.scoreText.setText(String(this.score))
    const digits = String(Math.abs(this.score)).length
    this.scoreText.setFontSize(digits > 11 ? 14 : digits > 8 ? 17 : 22)
  }

  private renderPreviews() {
    this.renderPreview(this.nextOne, createPiece(this.bridge.seed || 1, this.pieceIndex + 1, this.pendingClear?.earnedBonus ?? null))
    this.renderPreview(this.nextTwo, createPiece(this.bridge.seed || 1, this.pieceIndex + 2))
  }

  private renderPreview(container: Phaser.GameObjects.Container, piece: Piece) {
    container.removeAll(true)
    const cells = pieceCells({ ...piece, x: 0, y: 0 })
    const minX = Math.min(...cells.map((cell) => cell.x))
    const maxX = Math.max(...cells.map((cell) => cell.x))
    const minY = Math.min(...cells.map((cell) => cell.y))
    const maxY = Math.max(...cells.map((cell) => cell.y))
    const size = 11
    const width = (maxX - minX + 1) * size
    const height = (maxY - minY + 1) * size
    for (const cell of cells) {
      const tile = piece.tokens[cell.tokenIndex]
      const x = (cell.x - minX) * size - width / 2 + size / 2
      const y = (cell.y - minY) * size - height / 2 + size / 2
      const rect = this.add.rectangle(x, y, size - 1, size - 1, tileFill(tile), 0.74).setStrokeStyle(1, CRT_DEEP, 0.7)
      const label = this.add.text(x, y + 0.5, tile.label, {
        fontFamily: 'monospace', fontSize: '6px', color: tileInk(tile), fontStyle: 'bold',
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
      const box = this.add.rectangle(0, 0, CELL_SIZE - 1, CELL_SIZE - 1, tileFill(tile), 0.8).setStrokeStyle(1, CRT_ACTIVE, 0.8)
      const effectLabel = tile.kind === 'number' ? `+${tile.label}` : tile.label
      const label = this.add.text(0, 0.5, effectLabel, {
        fontFamily: 'monospace', fontSize: '11px', color: tileInk(tile), fontStyle: 'bold',
      }).setOrigin(0.5)
      const cellContainer = this.add.container(x, rowY, [box, label])
      rowContainer.add(cellContainer)
      cells.push(cellContainer)

      const calculationOrder = snapshot.report.reversed ? COLS - 1 - column : column
      const stepValue = snapshot.report.steps[column]
      if (stepValue !== null) {
        const step = this.add.text(x, rowY - 16, formatCompact(stepValue), {
          fontFamily: 'monospace', fontSize: '8px', color: CRT_TEXT, backgroundColor: '#0b2b22', fontStyle: 'bold', padding: { x: 2, y: 1 },
        }).setOrigin(0.5).setAlpha(0)
        rowContainer.add(step)
        this.time.delayedCall(70 + calculationOrder * 46, () => {
          this.tweens.add({ targets: cellContainer, scale: 1.08, duration: 90, yoyo: true })
          this.tweens.add({ targets: step, alpha: 1, y: rowY - 19, duration: 90, hold: 210, yoyo: true })
        })
      }
    })

    const arrow = this.add.rectangle(
      snapshot.report.reversed ? BOARD_X + BOARD_WIDTH : BOARD_X,
      rowY,
      BOARD_WIDTH,
      2,
      CRT_ACTIVE,
      0.9,
    ).setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setScale(0, 1)
    rowContainer.add(arrow)
    this.tweens.add({ targets: arrow, scaleX: 1, duration: 620, ease: 'Cubic.easeOut' })

    const scoreX = snapshot.report.reversed ? BOARD_X - 3 : BOARD_X + BOARD_WIDTH + 3
    const score = this.add.text(scoreX, rowY, `${snapshot.report.reversed ? '←' : '→'}${formatCompact(snapshot.report.points)}`, {
      fontFamily: 'monospace', fontSize: '10px', color: CRT_TEXT, backgroundColor: '#0b2b22', fontStyle: 'bold', padding: { x: 2, y: 2 },
    }).setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setAlpha(0)
    rowContainer.add(score)
    this.time.delayedCall(430, () => this.tweens.add({ targets: score, alpha: 1, duration: 100, hold: 420, yoyo: true }))

    cells.forEach((cell, column) => {
      const wipeOrder = COLS - 1 - column
      this.time.delayedCall(540 + wipeOrder * 34, () => {
        this.tweens.add({ targets: cell, alpha: 0, scaleX: 0.18, x: cell.x - 8, duration: 250, ease: 'Cubic.easeIn' })
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
