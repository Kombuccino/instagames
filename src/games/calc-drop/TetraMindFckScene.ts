import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { miniFuggAudio } from '../../audio/index'

export const TETRAMINDFCK_SCENE_KEY = 'tetramindfck-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GAME_ID = 'tetramindfck'
const COLS = 10
const ROWS = 20
const LOCK_TICKS = 3
const CLEAR_SETTLE_MS = 1180
const MAX_NUMBER = 9
const BASE_MAX_MULTIPLIER = 3
const STANDARD_LINE_MAX = MAX_NUMBER * (BASE_MAX_MULTIPLIER ** (COLS - 1))
const BIG_CLEAR_THRESHOLD = 1000

const BG_KEY = 'tetra-bg'
const SHELL_KEY = 'tetra-shell'
const CRT_KEY = 'tetra-crt'
const DIGITS_KEY = 'tetra-digits'
const OPERATORS_KEY = 'tetra-operators'
const BTN_LEFT_UP = 'tetra-btn-left-up'
const BTN_LEFT_DOWN = 'tetra-btn-left-down'
const BTN_RIGHT_UP = 'tetra-btn-right-up'
const BTN_RIGHT_DOWN = 'tetra-btn-right-down'
const BTN_ROTATE_LEFT_UP = 'tetra-btn-rotate-left-up'
const BTN_ROTATE_LEFT_DOWN = 'tetra-btn-rotate-left-down'
const BTN_ROTATE_RIGHT_UP = 'tetra-btn-rotate-right-up'
const BTN_ROTATE_RIGHT_DOWN = 'tetra-btn-rotate-right-down'
const BTN_DOWN_UP = 'tetra-btn-down-up'
const BTN_DOWN_DOWN = 'tetra-btn-down-down'

const BG_PATH = '/assets/imported/tetramindfck/gameplay/background/tetramindfck-gameplay-bg-room.webp'
const SHELL_PATH = '/assets/imported/tetramindfck/gameplay/shell/tetramindfck-console-shell.webp'
const CRT_PATH = '/assets/imported/tetramindfck/gameplay/crt/tetramindfck-crt-plate.webp'
const DIGITS_PATH = '/assets/imported/tetramindfck/gameplay/tiles/tetramindfck-tile-digits-sheet.webp'
const OPERATORS_PATH = '/assets/imported/tetramindfck/gameplay/tiles/tetramindfck-tile-operators-sheet.webp'
const BUTTON_ROOT = '/assets/imported/tetramindfck/gameplay/buttons'

// Geometry measured from the canonical shell asset at 390x844.
const MAIN_CRT = { x: 105.5, y: 122.5, w: 261, h: 503.5 }
const LEVEL_CRT = { x: 24, y: 155.5, w: 64.5, h: 77 }
const TARGET_CRT = { x: 24, y: 254, w: 64.5, h: 71.5 }
const NEXT_CRT = { x: 24, y: 351.5, w: 64.5, h: 105.5 }
const NEXT2_CRT = { x: 24, y: 484, w: 64.5, h: 105.5 }
const BTN_LEFT = { x: 20, y: 654, w: 85.5, h: 58 }
const BTN_RIGHT = { x: 116, y: 654, w: 86.5, h: 58 }
const BTN_ROTATE_LEFT = { x: 213, y: 654, w: 74.5, h: 58 }
const BTN_ROTATE_RIGHT = { x: 298, y: 654, w: 72, h: 58 }
const BTN_DOWN = { x: 78, y: 731, w: 83, h: 37.5 }

const CELL_SIZE = 22.4
const BOARD_WIDTH = CELL_SIZE * COLS
const BOARD_HEIGHT = CELL_SIZE * ROWS
const BOARD_X = MAIN_CRT.x + (MAIN_CRT.w - BOARD_WIDTH) / 2
const BOARD_Y = 164
const SCORE_Y = 132
const PREVIEW_TILE_SIZE = 12.5

const CRT_BG = 0x09291f
const CRT_GRID = 0x2b6852
const CRT_TEXT = '#b9e6b6'
const CRT_BONUS = 0x6e9da0
const CRT_ACTIVE = 0xd0e7c5
const CRT_GHOST = 0x79aa91

const SHAPE_IDS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const
type ShapeId = typeof SHAPE_IDS[number]
type TileKind = 'number' | 'multiply' | 'divide' | 'reverse'
type BonusKind = 'reverse' | 'multiply4' | 'multiply6'
type ActionName = 'left' | 'right' | 'down' | 'rotateLeft' | 'rotateRight'
type Tile = { kind: TileKind; value: number; label: string; bonus?: BonusKind }
type Coord = { x: number; y: number }
type Piece = { shape: ShapeId; rotation: number; x: number; y: number; tokens: Tile[] }
type ShapeDefinition = { cells: Coord[]; pivot: Coord }
type LineReport = { value: number; points: number; reversed: boolean; steps: Array<number | null> }
type ClearRowSnapshot = { rowIndex: number; tiles: Tile[]; report: LineReport }
type PendingClear = { fullRows: number[]; reports: LineReport[]; gained: number; earnedBonus: BonusKind | null }
type Aperture = { x: number; y: number; w: number; h: number }

type ButtonTextures = { up: string; down: string }

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
  return { level: nextLevel, levelsGained, bestAttempt: levelsGained > 0 ? clearScore : Math.max(bestAttempt, clearScore) }
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

function tileFrame(tile: Tile) {
  if (tile.kind === 'number') return { texture: DIGITS_KEY, frame: Math.max(0, Math.min(8, tile.value - 1)) }
  if (tile.kind === 'reverse') return { texture: OPERATORS_KEY, frame: 6 }
  if (tile.kind === 'divide') return { texture: OPERATORS_KEY, frame: tile.value === 2 ? 4 : 5 }
  if (tile.value === 2) return { texture: OPERATORS_KEY, frame: 0 }
  if (tile.value === 3) return { texture: OPERATORS_KEY, frame: 1 }
  if (tile.value === 4) return { texture: OPERATORS_KEY, frame: 2 }
  return { texture: OPERATORS_KEY, frame: 3 }
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
  private cellSprites: Phaser.GameObjects.Image[] = []
  private ghostRects: Phaser.GameObjects.Rectangle[] = []
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

  preload() {
    this.load.image(BG_KEY, BG_PATH)
    this.load.image(SHELL_KEY, SHELL_PATH)
    this.load.image(CRT_KEY, CRT_PATH)
    this.load.spritesheet(DIGITS_KEY, DIGITS_PATH, { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet(OPERATORS_KEY, OPERATORS_PATH, { frameWidth: 64, frameHeight: 64 })
    this.load.image(BTN_LEFT_UP, `${BUTTON_ROOT}/tetramindfck-btn-left-up.webp`)
    this.load.image(BTN_LEFT_DOWN, `${BUTTON_ROOT}/tetramindfck-btn-left-down.webp`)
    this.load.image(BTN_RIGHT_UP, `${BUTTON_ROOT}/tetramindfck-btn-right-up.webp`)
    this.load.image(BTN_RIGHT_DOWN, `${BUTTON_ROOT}/tetramindfck-btn-right-down.webp`)
    this.load.image(BTN_ROTATE_LEFT_UP, `${BUTTON_ROOT}/tetramindfck-btn-rotate-left-up.webp`)
    this.load.image(BTN_ROTATE_LEFT_DOWN, `${BUTTON_ROOT}/tetramindfck-btn-rotate-left-down.webp`)
    this.load.image(BTN_ROTATE_RIGHT_UP, `${BUTTON_ROOT}/tetramindfck-btn-rotate-right-up.webp`)
    this.load.image(BTN_ROTATE_RIGHT_DOWN, `${BUTTON_ROOT}/tetramindfck-btn-rotate-right-down.webp`)
    this.load.image(BTN_DOWN_UP, `${BUTTON_ROOT}/tetramindfck-btn-down-up.webp`)
    this.load.image(BTN_DOWN_DOWN, `${BUTTON_ROOT}/tetramindfck-btn-down-down.webp`)
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
    this.cellSprites = []
    this.ghostRects = []
  }

  create() {
    this.cameras.main.setBackgroundColor('#241a15')
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(STAGE_WIDTH / 2, STAGE_HEIGHT / 2)
    this.drawBackground()
    this.drawCrtPlate()
    this.createBoard()
    this.createHud()
    this.createControls()
    this.clearLayer = this.add.container(0, 0).setDepth(26)
    this.drawShellOverlay()
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
    this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, BG_KEY)
      .setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
      .setDepth(0)
  }

  private drawCrtPlate() {
    this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, CRT_KEY)
      .setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
      .setDepth(1)
  }

  private drawShellOverlay() {
    this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, SHELL_KEY)
      .setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
      .setDepth(20)
      .setScrollFactor(0)
  }

  private createBoard() {
    const grid = this.add.graphics().setDepth(3)
    grid.fillStyle(CRT_BG, 0.1).fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    grid.lineStyle(1, CRT_GRID, 0.52).strokeRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT)
    grid.lineStyle(1, CRT_GRID, 0.34)
    for (let column = 1; column < COLS; column += 1) {
      const x = BOARD_X + column * CELL_SIZE
      grid.lineBetween(x, BOARD_Y, x, BOARD_Y + BOARD_HEIGHT)
    }
    for (let row = 1; row < ROWS; row += 1) {
      const y = BOARD_Y + row * CELL_SIZE
      grid.lineBetween(BOARD_X, y, BOARD_X + BOARD_WIDTH, y)
    }

    for (let row = 0; row < ROWS; row += 1) {
      for (let column = 0; column < COLS; column += 1) {
        const x = BOARD_X + (column + 0.5) * CELL_SIZE
        const y = BOARD_Y + (row + 0.5) * CELL_SIZE
        this.ghostRects.push(
          this.add.rectangle(x, y, CELL_SIZE - 2, CELL_SIZE - 2, CRT_BG, 0)
            .setStrokeStyle(1, CRT_GHOST, 0.75)
            .setDepth(7)
            .setVisible(false),
        )
        this.cellSprites.push(
          this.add.image(x, y, DIGITS_KEY, 0)
            .setDisplaySize(CELL_SIZE - 1.5, CELL_SIZE - 1.5)
            .setDepth(8)
            .setVisible(false),
        )
      }
    }
    this.lockGraphics = this.add.graphics().setDepth(18)
  }

  private createHud() {
    const labelStyle = { fontFamily: 'monospace', fontSize: '8px', color: CRT_TEXT, fontStyle: 'bold' as const, letterSpacing: 1 }
    this.add.text(LEVEL_CRT.x + LEVEL_CRT.w / 2, LEVEL_CRT.y + 7, 'LEVEL', labelStyle).setOrigin(0.5, 0).setDepth(9)
    this.add.text(TARGET_CRT.x + TARGET_CRT.w / 2, TARGET_CRT.y + 7, 'TARGET', labelStyle).setOrigin(0.5, 0).setDepth(9)
    this.add.text(NEXT_CRT.x + NEXT_CRT.w / 2, NEXT_CRT.y + 7, 'NEXT', labelStyle).setOrigin(0.5, 0).setDepth(9)
    this.add.text(NEXT2_CRT.x + NEXT2_CRT.w / 2, NEXT2_CRT.y + 7, 'NEXT+1', labelStyle).setOrigin(0.5, 0).setDepth(9)

    this.levelText = this.add.text(LEVEL_CRT.x + LEVEL_CRT.w / 2, LEVEL_CRT.y + 44, '1', {
      fontFamily: 'monospace', fontSize: '28px', color: CRT_TEXT, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9)
    this.targetText = this.add.text(TARGET_CRT.x + TARGET_CRT.w / 2, TARGET_CRT.y + 42, '50', {
      fontFamily: 'monospace', fontSize: '23px', color: '#d5a4a7', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9)

    this.add.triangle(NEXT_CRT.x + 6, NEXT_CRT.y + 24, 0, 0, 0, 11, 8, 5.5, CRT_ACTIVE, 0.9).setOrigin(0.5).setDepth(10)
    this.nextOne = this.add.container(NEXT_CRT.x + NEXT_CRT.w / 2, NEXT_CRT.y + 65).setDepth(10)
    this.nextTwo = this.add.container(NEXT2_CRT.x + NEXT2_CRT.w / 2, NEXT2_CRT.y + 65).setDepth(10)

    this.add.text(MAIN_CRT.x + 11, SCORE_Y, 'SCORE', {
      fontFamily: 'monospace', fontSize: '11px', color: CRT_TEXT, fontStyle: 'bold', letterSpacing: 1,
    }).setDepth(9)
    this.scoreText = this.add.text(MAIN_CRT.x + MAIN_CRT.w - 11, SCORE_Y - 2, '0', {
      fontFamily: 'monospace', fontSize: '21px', color: CRT_TEXT, fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(9)
  }

  private createControls() {
    this.makeImageButton({ up: BTN_LEFT_UP, down: BTN_LEFT_DOWN }, BTN_LEFT, 'left')
    this.makeImageButton({ up: BTN_RIGHT_UP, down: BTN_RIGHT_DOWN }, BTN_RIGHT, 'right')
    this.makeImageButton({ up: BTN_ROTATE_LEFT_UP, down: BTN_ROTATE_LEFT_DOWN }, BTN_ROTATE_LEFT, 'rotateLeft')
    this.makeImageButton({ up: BTN_ROTATE_RIGHT_UP, down: BTN_ROTATE_RIGHT_DOWN }, BTN_ROTATE_RIGHT, 'rotateRight')
    this.makeImageButton({ up: BTN_DOWN_UP, down: BTN_DOWN_DOWN }, BTN_DOWN, 'down')
  }

  private makeImageButton(textures: ButtonTextures, box: Aperture, action: ActionName) {
    const image = this.add.image(box.x + box.w / 2, box.y + box.h / 2, textures.up)
      .setDisplaySize(box.w, box.h)
      .setDepth(21)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, box.w, box.h), Phaser.Geom.Rectangle.Contains)

    const setPressed = (pressed: boolean) => {
      image.setTexture(pressed ? textures.down : textures.up)
      image.setDisplaySize(box.w, box.h)
    }

    image.on('pointerdown', () => {
      if (this.finished || this.pendingClear) return
      setPressed(true)
      this.runAction(action)
      if (action === 'left' || action === 'right' || action === 'down') this.startHold(action)
    })
    image.on('pointerup', () => { setPressed(false); this.stopHold() })
    image.on('pointerout', () => { setPressed(false); this.stopHold() })
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
    this.holdTimer = this.time.addEvent({ delay: action === 'down' ? 55 : 100, loop: true, callback: () => this.runAction(action, false) })
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
      metadata: { level: this.level, lines: this.lines, target: targetForLevel(this.level), bestClear: this.bestAttempt, standardLineMax: STANDARD_LINE_MAX },
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
        const sprite = this.cellSprites[index]
        const ghost = this.ghostRects[index]

        if (!tile) {
          sprite.setVisible(false)
          ghost.setVisible(ghostSet.has(key))
          continue
        }

        ghost.setVisible(false)
        const frame = tileFrame(tile)
        sprite
          .setTexture(frame.texture, frame.frame)
          .setDisplaySize(CELL_SIZE - 1.5, CELL_SIZE - 1.5)
          .setAlpha(moving ? 1 : 0.88)
          .setVisible(true)
      }
    }
    this.renderLockMeter()
  }

  private renderLockMeter() {
    this.lockGraphics.clear()
    if (this.pendingClear || this.finished || !this.isGrounded()) return
    const x = BOARD_X + BOARD_WIDTH + 4
    const baseY = BOARD_Y + BOARD_HEIGHT - 10
    for (let index = 0; index < LOCK_TICKS; index += 1) {
      this.lockGraphics.fillStyle(index < this.lockTicks ? CRT_BONUS : CRT_GRID, 0.85).fillRect(x, baseY - index * 12, 4, 9)
    }
  }

  private renderHud() {
    const target = targetForLevel(this.level)
    this.levelText.setText(String(this.level))
    this.targetText.setText(String(target)).setFontSize(String(target).length > 5 ? 16 : String(target).length > 3 ? 19 : 23)
    this.scoreText.setText(String(this.score))
    const digits = String(Math.abs(this.score)).length
    this.scoreText.setFontSize(digits > 11 ? 13 : digits > 8 ? 16 : 21)
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
    const width = (maxX - minX + 1) * PREVIEW_TILE_SIZE
    const height = (maxY - minY + 1) * PREVIEW_TILE_SIZE

    for (const cell of cells) {
      const tile = piece.tokens[cell.tokenIndex]
      const x = (cell.x - minX) * PREVIEW_TILE_SIZE - width / 2 + PREVIEW_TILE_SIZE / 2
      const y = (cell.y - minY) * PREVIEW_TILE_SIZE - height / 2 + PREVIEW_TILE_SIZE / 2
      const frame = tileFrame(tile)
      container.add(
        this.add.image(x, y, frame.texture, frame.frame)
          .setDisplaySize(PREVIEW_TILE_SIZE - 0.7, PREVIEW_TILE_SIZE - 0.7),
      )
    }
  }

  private animateClearRows(snapshots: ClearRowSnapshot[]) {
    for (const snapshot of snapshots) this.animateClearRow(snapshot)
  }

  private animateClearRow(snapshot: ClearRowSnapshot) {
    const rowY = BOARD_Y + (snapshot.rowIndex + 0.5) * CELL_SIZE
    const rowContainer = this.add.container(0, 0)
    this.clearLayer.add(rowContainer)
    const cells: Phaser.GameObjects.Image[] = []

    snapshot.tiles.forEach((tile, column) => {
      const x = BOARD_X + (column + 0.5) * CELL_SIZE
      const frame = tileFrame(tile)
      const cell = this.add.image(x, rowY, frame.texture, frame.frame)
        .setDisplaySize(CELL_SIZE - 1.5, CELL_SIZE - 1.5)
      rowContainer.add(cell)
      cells.push(cell)

      const calculationOrder = snapshot.report.reversed ? COLS - 1 - column : column
      const stepValue = snapshot.report.steps[column]
      if (stepValue !== null) {
        const step = this.add.text(x, rowY - 15, formatCompact(stepValue), {
          fontFamily: 'monospace', fontSize: '8px', color: CRT_TEXT, backgroundColor: '#0b2b22', fontStyle: 'bold', padding: { x: 2, y: 1 },
        }).setOrigin(0.5).setAlpha(0)
        rowContainer.add(step)
        this.time.delayedCall(70 + calculationOrder * 46, () => {
          this.tweens.add({ targets: cell, scale: 1.08, duration: 90, yoyo: true })
          this.tweens.add({ targets: step, alpha: 1, y: rowY - 18, duration: 90, hold: 210, yoyo: true })
        })
      }
    })

    const arrow = this.add.rectangle(snapshot.report.reversed ? BOARD_X + BOARD_WIDTH : BOARD_X, rowY, BOARD_WIDTH, 2, CRT_ACTIVE, 0.9)
      .setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setScale(0, 1)
    rowContainer.add(arrow)
    this.tweens.add({ targets: arrow, scaleX: 1, duration: 620, ease: 'Cubic.easeOut' })

    const scoreX = snapshot.report.reversed ? BOARD_X - 3 : BOARD_X + BOARD_WIDTH + 3
    const score = this.add.text(scoreX, rowY, `${snapshot.report.reversed ? '←' : '→'}${formatCompact(snapshot.report.points)}`, {
      fontFamily: 'monospace', fontSize: '9px', color: CRT_TEXT, backgroundColor: '#0b2b22', fontStyle: 'bold', padding: { x: 2, y: 2 },
    }).setOrigin(snapshot.report.reversed ? 1 : 0, 0.5).setAlpha(0)
    rowContainer.add(score)
    this.time.delayedCall(430, () => this.tweens.add({ targets: score, alpha: 1, duration: 100, hold: 420, yoyo: true }))

    cells.forEach((cell, column) => {
      const wipeOrder = COLS - 1 - column
      this.time.delayedCall(540 + wipeOrder * 34, () => this.tweens.add({ targets: cell, alpha: 0, scaleX: 0.18, x: cell.x - 8, duration: 250, ease: 'Cubic.easeIn' }))
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
