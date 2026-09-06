import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'

export const LINEFUGG_SCENE_KEY = 'linefugg-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GRID_SIZE = 7
const MAX_LINES = 3
const MAX_LINE_CELLS = 5
const GAME_ID = 'linefugg'

// The 7×7 interactive grid is the transparent/content opening of the 370-unit
// Orbital board instrument. These coordinates never change with viewport size.
const BOARD_X = 54
const BOARD_Y = 188
const BOARD_SIZE = 282
const CELL_SIZE = BOARD_SIZE / GRID_SIZE
const BOARD_PANEL_SIZE = 370
const BOARD_CENTER_X = BOARD_X + BOARD_SIZE / 2
const BOARD_CENTER_Y = BOARD_Y + BOARD_SIZE / 2

const HISTORY_Y = 526
const HISTORY_ROW_HEIGHT = 48
const HISTORY_ROW_GAP = 4
const TOTAL_Y = 704
const CONTROL_Y = 790
const CONTROL_BUTTON_SIZE = 84
const INDICATOR_CENTERS = [156, 195, 234] as const

const ASSET_ROOT = '/assets/imported/linefugg'

const ASSETS = {
  boardPanel: ['linefugg-orbital-board-v5', `${ASSET_ROOT}/ui/orbital-board-panel-v5.png`],
  cellMultiply: ['linefugg-orbital-cell-multiply', `${ASSET_ROOT}/ui/orbital-cell-multiply-v3.png`],
  cellDivide: ['linefugg-orbital-cell-divide', `${ASSET_ROOT}/ui/orbital-cell-divide-v3.png`],
  historyRow: ['linefugg-orbital-history-v5', `${ASSET_ROOT}/ui/orbital-history-row-v5.png`],
  totalPlate: ['linefugg-orbital-total-v5', `${ASSET_ROOT}/ui/orbital-total-plate-v5.png`],
  controlDock: ['linefugg-orbital-dock-v5', `${ASSET_ROOT}/ui/orbital-control-dock-v5.png`],
  undoDisabled: ['linefugg-orbital-undo-disabled-v5', `${ASSET_ROOT}/ui/orbital-undo-disabled-v5.png`],
  undoIdle: ['linefugg-orbital-undo-idle-v5', `${ASSET_ROOT}/ui/orbital-undo-idle-v5.png`],
  validateDisabled: ['linefugg-orbital-validate-disabled-v5', `${ASSET_ROOT}/ui/orbital-validate-disabled-v5.png`],
  validateReady: ['linefugg-orbital-validate-ready-v5', `${ASSET_ROOT}/ui/orbital-validate-ready-v5.png`],
} as const

const INK_NAVY = 0x061424
const BRASS_LIGHT = 0xd9a24a
const PARCHMENT_LIGHT = 0xf3e3bd
const EMERALD = 0x20c46b
const ERROR = 0xff5b3d

const LINE_COLORS = [0xff5a36, 0xa54dff, 0xffc72c] as const
const LINE_COLOR_STRINGS = ['#ff5a36', '#a54dff', '#ffc72c'] as const

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
] as const

type CellKind = 'add' | 'multiply' | 'divide'

type Cell = {
  kind: CellKind
  value: number
  label: string
}

type Point = {
  row: number
  col: number
}

type PlayedLine = {
  start: Point
  end: Point
  cells: Point[]
  score: number
}

type DragState = {
  pointerId: number
  start: Point
  end: Point | null
  cells: Point[]
  valid: boolean
  pointerX: number
  pointerY: number
}

type HistoryRow = {
  background: Phaser.GameObjects.Image
  marker: Phaser.GameObjects.Arc
  arrow: Phaser.GameObjects.Text
  formula: Phaser.GameObjects.Text
  score: Phaser.GameObjects.Text
}

type AmbientStar = {
  x: number
  y: number
  radius: number
  phase: number
  speed: number
}

export type LineFuggSceneBridge = {
  seed: number
  session: GameSessionApi
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

function hashString(value: string) {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function currentUtcDayId() {
  return new Date().toISOString().slice(0, 10)
}

function pickInt(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1))
}

function createCell(random: () => number): Cell {
  const roll = random()

  if (roll < 0.64) {
    const value = pickInt(random, 1, 9)
    return { kind: 'add', value, label: String(value) }
  }

  if (roll < 0.80) {
    const value = -pickInt(random, 1, 9)
    return { kind: 'add', value, label: `−${Math.abs(value)}` }
  }

  if (roll < 0.92) {
    const value = random() < 0.78 ? 2 : 3
    return { kind: 'multiply', value, label: `×${value}` }
  }

  const value = random() < 0.72 ? 2 : 3
  return { kind: 'divide', value, label: `÷${value}` }
}

function createBoard(seed: number) {
  const random = mulberry32(seed || 1)
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => createCell(random))
}

function pointKey(point: Point) {
  return `${point.row}:${point.col}`
}

function cellsForLine(start: Point, end: Point) {
  const rowDelta = end.row - start.row
  const colDelta = end.col - start.col
  const rowStep = Math.sign(rowDelta)
  const colStep = Math.sign(colDelta)
  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta))

  if (steps === 0) return [start]

  const straight = rowDelta === 0 || colDelta === 0 || Math.abs(rowDelta) === Math.abs(colDelta)
  if (!straight) return []

  return Array.from({ length: steps + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }))
}

function roundScore(value: number) {
  return Math.round(value * 100) / 100
}

function scoreCells(cells: Point[], board: Cell[]) {
  let score = 0

  for (const point of cells) {
    const cell = board[point.row * GRID_SIZE + point.col]
    if (cell.kind === 'add') score += cell.value
    if (cell.kind === 'multiply') score *= cell.value
    if (cell.kind === 'divide') score /= cell.value
  }

  return roundScore(score)
}

function overlapsMoreThanOnce(candidate: Point[], played: PlayedLine[]) {
  const candidateKeys = new Set(candidate.map(pointKey))

  return played.some((line) => {
    let intersections = 0
    for (const cell of line.cells) {
      if (!candidateKeys.has(pointKey(cell))) continue
      intersections += 1
      if (intersections > 1) return true
    }
    return false
  })
}

function formatScore(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function formulaFor(cells: Point[], board: Cell[]) {
  return cells.map((point, index) => {
    const cell = board[point.row * GRID_SIZE + point.col]
    if (cell.kind === 'add' && cell.value > 0 && index > 0) return `+${cell.label}`
    return cell.label
  }).join(' ')
}

function cellCenter(point: Point) {
  return {
    x: BOARD_X + (point.col + 0.5) * CELL_SIZE,
    y: BOARD_Y + (point.row + 0.5) * CELL_SIZE,
  }
}

export class LineFuggScene extends Phaser.Scene {
  private readonly bridge: LineFuggSceneBridge

  private dayId = ''
  private board: Cell[] = []
  private lines: PlayedLine[] = []
  private drag: DragState | null = null
  private finished = false
  private validating = false
  private undoPressed = false
  private validatePressed = false

  private boardOverlayGraphics!: Phaser.GameObjects.Graphics
  private lineGraphics!: Phaser.GameObjects.Graphics
  private energyGraphics!: Phaser.GameObjects.Graphics
  private ambientGraphics!: Phaser.GameObjects.Graphics
  private indicatorGraphics!: Phaser.GameObjects.Graphics
  private controlPulseGraphics!: Phaser.GameObjects.Graphics

  private cellTexts: Phaser.GameObjects.Text[] = []
  private ambientStars: AmbientStar[] = []

  private liveContainer!: Phaser.GameObjects.Container
  private liveBackground!: Phaser.GameObjects.Graphics
  private liveText!: Phaser.GameObjects.Text

  private historyRows: HistoryRow[] = []
  private totalText!: Phaser.GameObjects.Text

  private undoButton!: Phaser.GameObjects.Image
  private validateButton!: Phaser.GameObjects.Image

  constructor(bridge: LineFuggSceneBridge) {
    super({ key: LINEFUGG_SCENE_KEY })
    this.bridge = bridge
  }

  preload() {
    Object.values(ASSETS).forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.resetRunState()
    this.createBackground()
    this.createBoardObjects()
    this.createLiveValue()
    this.createHistory()
    this.createControls()
    this.registerInput()
    this.refreshPresentation()
    this.bridge.session.setScore(0)
  }

  update(time: number) {
    this.renderAmbient(time)
    this.renderEnergy(time)
    this.renderControlPulse(time)
  }

  private resetRunState() {
    this.dayId = currentUtcDayId()
    this.board = createBoard(hashString(`${GAME_ID}:${this.dayId}`))
    this.lines = []
    this.drag = null
    this.finished = false
    this.validating = false
    this.undoPressed = false
    this.validatePressed = false
    this.cellTexts = []
    this.historyRows = []

    const random = mulberry32(hashString(`linefugg-stars:${this.bridge.seed}:${this.dayId}`))
    this.ambientStars = Array.from({ length: 24 }, () => ({
      x: random() * STAGE_WIDTH,
      y: random() * STAGE_HEIGHT,
      radius: 0.45 + random() * 1.05,
      phase: random() * Math.PI * 2,
      speed: 0.00055 + random() * 0.0011,
    }))
  }

  private createBackground() {
    // The illustrated observatory backdrop is CSS-owned by LineFugg.tsx so it can
    // cover/crop inside the Core game surface independently of the fixed 390x844 stage.
    // Keep Phaser transparent here: no second copy, no seams, no accidental contain-fit.
    this.ambientGraphics = this.add.graphics().setDepth(3)
  }

  private createBoardObjects() {
    const [boardKey] = ASSETS.boardPanel

    // Deep backing is deliberately separate from the ornate frame. It guarantees
    // the 7x7 playfield always reads as one enamel calculation surface even when
    // the illustrated panel contains transparent/open celestial details.
    this.add.rectangle(BOARD_CENTER_X, BOARD_CENTER_Y + 2, BOARD_SIZE + 16, BOARD_SIZE + 16, 0x020914, 0.92)
      .setStrokeStyle(2, 0x6f431e, 0.84)
      .setDepth(6)

    this.add.image(BOARD_CENTER_X, BOARD_CENTER_Y, boardKey)
      .setDisplaySize(BOARD_PANEL_SIZE, BOARD_PANEL_SIZE)
      .setDepth(8)

    // Calm the interior so numbers and paths outrank the illustration.
    this.add.rectangle(BOARD_CENTER_X, BOARD_CENTER_Y, BOARD_SIZE + 2, BOARD_SIZE + 2, INK_NAVY, 0.26)
      .setDepth(8.5)

    // Every normal cell gets a subtle navy enamel plate. Special × / ÷ materials
    // sit above these plates, so all 49 cells share the same physical grammar.
    const cellBaseGraphics = this.add.graphics().setDepth(9)
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const x = BOARD_X + col * CELL_SIZE
        const y = BOARD_Y + row * CELL_SIZE
        cellBaseGraphics.fillStyle(0x071a2a, 0.72)
        cellBaseGraphics.fillRoundedRect(x + 2.2, y + 2.2, CELL_SIZE - 4.4, CELL_SIZE - 4.4, 4.5)
        cellBaseGraphics.lineStyle(1.05, BRASS_LIGHT, 0.34)
        cellBaseGraphics.strokeRoundedRect(x + 2.2, y + 2.2, CELL_SIZE - 4.4, CELL_SIZE - 4.4, 4.5)
      }
    }

    this.board.forEach((cell, index) => {
      if (cell.kind === 'add') return

      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const key = cell.kind === 'multiply' ? ASSETS.cellMultiply[0] : ASSETS.cellDivide[0]
      this.add.image(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        key,
      ).setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4).setDepth(10)
    })

    this.boardOverlayGraphics = this.add.graphics().setDepth(18)
    this.lineGraphics = this.add.graphics().setDepth(20)
    this.energyGraphics = this.add.graphics().setDepth(22)

    this.cellTexts = this.board.map((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const color = cell.kind === 'multiply'
        ? '#fff1c9'
        : cell.kind === 'divide'
          ? '#f9ebff'
          : '#f5e6c1'

      return this.add.text(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        cell.label,
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color,
          shadow: {
            offsetX: 0,
            offsetY: 2,
            color: '#000000',
            blur: 3,
            fill: true,
          },
        },
      ).setOrigin(0.5).setDepth(30)
    })
  }

  private createLiveValue() {
    this.liveBackground = this.add.graphics()
    this.liveText = this.add.text(0, 0, '', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#20170e',
    }).setOrigin(0.5)

    this.liveContainer = this.add.container(0, 0, [this.liveBackground, this.liveText])
      .setDepth(60)
      .setVisible(false)
  }

  private createHistory() {
    const [rowKey] = ASSETS.historyRow

    for (let index = 0; index < MAX_LINES; index += 1) {
      const y = HISTORY_Y + HISTORY_ROW_HEIGHT / 2 + index * (HISTORY_ROW_HEIGHT + HISTORY_ROW_GAP)
      this.add.rectangle(195, y + 2, 374, HISTORY_ROW_HEIGHT - 2, 0x020914, 0.54)
        .setDepth(38)

      this.add.rectangle(195, y, 366, HISTORY_ROW_HEIGHT - 8, 0xf0dfb6, 0.98)
        .setStrokeStyle(1.6, BRASS_LIGHT, 0.88)
        .setDepth(39)

      const background = this.add.image(195, y, rowKey)
        .setDisplaySize(372, HISTORY_ROW_HEIGHT)
        .setAlpha(0.84)
        .setDepth(40)

      const marker = this.add.circle(28, y, 6.5, LINE_COLORS[index], 0.28)
        .setStrokeStyle(2, LINE_COLORS[index], 0.42)
        .setDepth(42)

      const arrow = this.add.text(43, y, '→', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: LINE_COLOR_STRINGS[index],
      }).setOrigin(0.5).setDepth(42).setAlpha(0.38)

      const formula = this.add.text(58, y, '', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#281b0f',
      }).setOrigin(0, 0.5).setDepth(42)

      const score = this.add.text(354, y, '', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#1c140d',
      }).setOrigin(1, 0.5).setDepth(42)

      this.historyRows.push({ background, marker, arrow, formula, score })
    }

    const [totalKey] = ASSETS.totalPlate
    this.add.rectangle(195, TOTAL_Y + 2, 232, 52, 0x020914, 0.64)
      .setDepth(38)
    this.add.rectangle(195, TOTAL_Y, 226, 48, INK_NAVY, 0.97)
      .setStrokeStyle(2, BRASS_LIGHT, 0.92)
      .setDepth(39)
    this.add.image(195, TOTAL_Y, totalKey)
      .setDisplaySize(222, 49)
      .setAlpha(0.86)
      .setDepth(40)

    this.totalText = this.add.text(195, TOTAL_Y, 'Σ 0', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#f5e5b9',
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 3,
        fill: true,
      },
    }).setOrigin(0.5).setDepth(42)
  }

  private createControls() {
    const [dockKey] = ASSETS.controlDock
    this.add.image(195, CONTROL_Y, dockKey)
      .setDisplaySize(378, 126)
      .setDepth(44)

    this.indicatorGraphics = this.add.graphics().setDepth(47)
    this.controlPulseGraphics = this.add.graphics().setDepth(47)

    this.undoButton = this.add.image(53, CONTROL_Y, ASSETS.undoDisabled[0])
      .setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE)
      .setDepth(48)
      .setInteractive({ useHandCursor: true })

    this.validateButton = this.add.image(337, CONTROL_Y, ASSETS.validateDisabled[0])
      .setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE)
      .setDepth(48)
      .setInteractive({ useHandCursor: true })

    this.undoButton.on('pointerdown', this.handleUndoDown, this)
    this.undoButton.on('pointerup', this.handleUndoUp, this)
    this.undoButton.on('pointerout', this.handleUndoOut, this)

    this.validateButton.on('pointerdown', this.handleValidateDown, this)
    this.validateButton.on('pointerup', this.handleValidateUp, this)
    this.validateButton.on('pointerout', this.handleValidateOut, this)
  }

  private registerInput() {
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.game.events.on('pause', this.handleGamePause, this)
    this.events.once('shutdown', this.handleShutdown, this)
  }

  private handleShutdown() {
    this.input.off('pointerdown', this.handlePointerDown, this)
    this.input.off('pointermove', this.handlePointerMove, this)
    this.input.off('pointerup', this.handlePointerUp, this)
    this.input.off('pointerupoutside', this.handlePointerUp, this)
    this.game.events.off('pause', this.handleGamePause, this)

    this.undoButton?.off('pointerdown', this.handleUndoDown, this)
    this.undoButton?.off('pointerup', this.handleUndoUp, this)
    this.undoButton?.off('pointerout', this.handleUndoOut, this)
    this.validateButton?.off('pointerdown', this.handleValidateDown, this)
    this.validateButton?.off('pointerup', this.handleValidateUp, this)
    this.validateButton?.off('pointerout', this.handleValidateOut, this)
  }

  private handleGamePause() {
    if (!this.drag) return
    this.drag = null
    this.refreshPresentation()
  }

  private undoEnabled() {
    return !this.finished && !this.validating && !this.drag && this.lines.length > 0
  }

  private validateEnabled() {
    return !this.finished && !this.validating && !this.drag && this.lines.length === MAX_LINES
  }

  private handleUndoDown() {
    if (!this.undoEnabled()) return
    this.undoPressed = true
    this.renderControls()
  }

  private handleUndoUp() {
    const shouldUndo = this.undoPressed && this.undoEnabled()
    this.undoPressed = false
    if (shouldUndo) this.undo()
    else this.renderControls()
  }

  private handleUndoOut() {
    if (!this.undoPressed) return
    this.undoPressed = false
    this.renderControls()
  }

  private handleValidateDown() {
    if (!this.validateEnabled()) return
    this.validatePressed = true
    this.renderControls()
  }

  private handleValidateUp() {
    const shouldValidate = this.validatePressed && this.validateEnabled()
    this.validatePressed = false
    if (shouldValidate) this.validateRun()
    else this.renderControls()
  }

  private handleValidateOut() {
    if (!this.validatePressed) return
    this.validatePressed = false
    this.renderControls()
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.validating || this.drag || this.lines.length >= MAX_LINES) return

    const nativeEvent = pointer.event
    if (typeof MouseEvent !== 'undefined' && nativeEvent instanceof MouseEvent && nativeEvent.button !== 0) return

    const world = this.pointerWorld(pointer)
    const start = this.pointFromWorld(world.x, world.y)
    if (!start) return

    this.drag = this.buildDrag(pointer.id, start, null, world.x, world.y)
    this.refreshPresentation()
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.drag || this.drag.pointerId !== pointer.id) return

    const world = this.pointerWorld(pointer)
    const end = this.snapEnd(this.drag.start, world.x, world.y)
    this.drag = this.buildDrag(pointer.id, this.drag.start, end, world.x, world.y)
    this.refreshPresentation()
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.drag || this.drag.pointerId !== pointer.id) return

    if (pointer.wasCanceled) {
      this.drag = null
      this.refreshPresentation()
      return
    }

    const world = this.pointerWorld(pointer)
    const end = this.snapEnd(this.drag.start, world.x, world.y)
    const finalDrag = this.buildDrag(pointer.id, this.drag.start, end, world.x, world.y)
    this.drag = null

    if (!end || finalDrag.cells.length < 2 || !finalDrag.valid) {
      this.flashInvalid(finalDrag.pointerX, finalDrag.pointerY)
      this.refreshPresentation()
      return
    }

    const playedLine: PlayedLine = {
      start: finalDrag.start,
      end,
      cells: finalDrag.cells,
      score: scoreCells(finalDrag.cells, this.board),
    }

    this.lines.push(playedLine)
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
    this.pulseNewLine(this.lines.length - 1)
  }

  private undo() {
    if (!this.undoEnabled()) return

    this.lines.pop()
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
  }

  private validateRun() {
    if (!this.validateEnabled()) return

    this.validating = true
    this.validatePressed = false
    this.refreshPresentation()

    const total = this.totalScore()
    this.bridge.session.setScore(total)

    this.tweens.add({
      targets: this.validateButton,
      scaleX: this.validateButton.scaleX * 1.10,
      scaleY: this.validateButton.scaleY * 1.10,
      duration: 130,
      yoyo: true,
      ease: 'Sine.easeOut',
    })

    this.time.delayedCall(360, () => {
      if (!this.scene.isActive()) return

      this.finished = true
      this.bridge.session.finish({
        score: total,
        boardId: this.dayId,
        metadata: {
          board: this.dayId,
          gridSize: GRID_SIZE,
          lineLimit: MAX_LINE_CELLS,
          runtimeSeed: this.bridge.seed,
          artDirection: 'orbital-accounting-modular-v5',
        },
      })
      this.scene.pause()
    })
  }

  private pulseNewLine(index: number) {
    const row = this.historyRows[index]
    if (!row) return

    row.background.setScale(row.background.scaleX * 0.985, row.background.scaleY * 0.92)
    this.tweens.add({
      targets: row.background,
      scaleX: 372 / row.background.width,
      scaleY: HISTORY_ROW_HEIGHT / row.background.height,
      duration: 180,
      ease: 'Back.easeOut',
    })

    for (const point of this.lines[index]?.cells ?? []) {
      const text = this.cellTexts[point.row * GRID_SIZE + point.col]
      if (!text) continue
      text.setScale(1.11)
      this.tweens.add({
        targets: text,
        scale: 1,
        duration: 210,
        ease: 'Sine.easeOut',
      })
    }
  }

  private flashInvalid(x: number, y: number) {
    this.cameras.main.shake(90, 0.0022)
    const flare = this.add.circle(x, y, 24, ERROR, 0.22)
      .setStrokeStyle(3, ERROR, 0.8)
      .setDepth(62)

    this.tweens.add({
      targets: flare,
      alpha: 0,
      scale: 1.5,
      duration: 170,
      onComplete: () => flare.destroy(),
    })
  }

  private pointerWorld(pointer: Phaser.Input.Pointer) {
    pointer.updateWorldPoint(this.cameras.main)
    return { x: pointer.worldX, y: pointer.worldY }
  }

  private pointFromWorld(x: number, y: number): Point | null {
    if (x < BOARD_X || x >= BOARD_X + BOARD_SIZE || y < BOARD_Y || y >= BOARD_Y + BOARD_SIZE) return null

    return {
      row: Phaser.Math.Clamp(Math.floor((y - BOARD_Y) / CELL_SIZE), 0, GRID_SIZE - 1),
      col: Phaser.Math.Clamp(Math.floor((x - BOARD_X) / CELL_SIZE), 0, GRID_SIZE - 1),
    }
  }

  private snapEnd(start: Point, worldX: number, worldY: number) {
    const gridX = (worldX - BOARD_X) / CELL_SIZE - 0.5
    const gridY = (worldY - BOARD_Y) / CELL_SIZE - 0.5
    const distanceFromStart = Math.hypot(gridX - start.col, gridY - start.row)
    if (distanceFromStart < 0.62) return null

    let best: Point | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const [rowStep, colStep] of DIRECTIONS) {
      for (let step = 1; step < MAX_LINE_CELLS; step += 1) {
        const row = start.row + rowStep * step
        const col = start.col + colStep * step
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) break

        const distance = (gridX - col) ** 2 + (gridY - row) ** 2
        if (distance < bestDistance) {
          bestDistance = distance
          best = { row, col }
        }
      }
    }

    return best
  }

  private buildDrag(pointerId: number, start: Point, end: Point | null, pointerX: number, pointerY: number): DragState {
    const cells = end ? cellsForLine(start, end) : []

    return {
      pointerId,
      start,
      end,
      cells,
      pointerX,
      pointerY,
      valid: cells.length >= 2
        && cells.length <= MAX_LINE_CELLS
        && !overlapsMoreThanOnce(cells, this.lines),
    }
  }

  private totalScore() {
    return roundScore(this.lines.reduce((sum, line) => sum + line.score, 0))
  }

  private refreshPresentation() {
    this.renderBoardOverlays()
    this.renderLines()
    this.renderLiveValue()
    this.renderHistory()
    this.renderControls()
  }

  private renderBoardOverlays() {
    const usedCounts = new Map<string, number>()
    for (const line of this.lines) {
      for (const point of line.cells) {
        const key = pointKey(point)
        usedCounts.set(key, (usedCounts.get(key) ?? 0) + 1)
      }
    }

    const preview = new Set(this.drag?.cells.map(pointKey) ?? [])
    const previewColor = this.drag?.valid
      ? LINE_COLORS[Math.min(this.lines.length, MAX_LINES - 1)]
      : ERROR

    this.boardOverlayGraphics.clear()

    this.board.forEach((_cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const x = BOARD_X + col * CELL_SIZE
      const y = BOARD_Y + row * CELL_SIZE
      const key = `${row}:${col}`
      const useCount = usedCounts.get(key) ?? 0

      if (useCount > 0) {
        this.boardOverlayGraphics.fillStyle(0xffffff, 0.045 + Math.min(useCount, 2) * 0.025)
        this.boardOverlayGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
      }

      if (useCount > 1) {
        this.boardOverlayGraphics.lineStyle(2, BRASS_LIGHT, 0.92)
        this.boardOverlayGraphics.strokeCircle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.34)
      }

      if (preview.has(key)) {
        this.boardOverlayGraphics.fillStyle(previewColor, this.drag?.valid ? 0.13 : 0.20)
        this.boardOverlayGraphics.fillRoundedRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 6)
        this.boardOverlayGraphics.lineStyle(2, previewColor, 0.76)
        this.boardOverlayGraphics.strokeCircle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.31)
      }
    })
  }

  private renderLines() {
    this.lineGraphics.clear()

    this.lines.forEach((line, index) => {
      this.drawOrbitalLine(line.start, line.end, LINE_COLORS[index] ?? 0xffffff, 1)
    })

    if (this.drag?.end) {
      const color = this.drag.valid
        ? LINE_COLORS[Math.min(this.lines.length, MAX_LINES - 1)]
        : ERROR
      this.drawOrbitalLine(this.drag.start, this.drag.end, color, this.drag.valid ? 0.96 : 0.88)
    }
  }

  private drawOrbitalLine(startPoint: Point, endPoint: Point, color: number, alpha: number) {
    const start = cellCenter(startPoint)
    const end = cellCenter(endPoint)
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    if (length === 0) return

    const ux = dx / length
    const uy = dy / length
    const arrowLength = 13
    const arrowHalfWidth = 6.5
    const arrowTipX = end.x - ux * 9
    const arrowTipY = end.y - uy * 9
    const baseX = arrowTipX - ux * arrowLength
    const baseY = arrowTipY - uy * arrowLength

    this.lineGraphics.lineStyle(14, color, 0.10 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(7, color, 0.32 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(3.6, color, 0.98 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(1.15, 0xffffff, 0.70 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.fillStyle(color, 0.98 * alpha)
    this.lineGraphics.fillTriangle(
      arrowTipX,
      arrowTipY,
      baseX - uy * arrowHalfWidth,
      baseY + ux * arrowHalfWidth,
      baseX + uy * arrowHalfWidth,
      baseY - ux * arrowHalfWidth,
    )

    this.drawNode(start.x, start.y, color, alpha)
    this.drawNode(end.x, end.y, color, alpha)
  }

  private drawNode(x: number, y: number, color: number, alpha: number) {
    this.lineGraphics.fillStyle(color, 0.12 * alpha)
    this.lineGraphics.fillCircle(x, y, 15)
    this.lineGraphics.fillStyle(color, 0.34 * alpha)
    this.lineGraphics.fillCircle(x, y, 10)
    this.lineGraphics.fillStyle(color, 0.98 * alpha)
    this.lineGraphics.fillCircle(x, y, 6)
    this.lineGraphics.fillStyle(0xffffff, 0.94 * alpha)
    this.lineGraphics.fillCircle(x, y, 2.7)
  }

  private renderLiveValue() {
    if (!this.drag?.cells.length) {
      this.liveContainer.setVisible(false)
      return
    }

    const valid = this.drag.valid
    const result = valid ? formatScore(scoreCells(this.drag.cells, this.board)) : '×'
    this.liveText.setText(valid ? `= ${result}` : result).setColor(valid ? '#25180d' : '#6a1208')

    const width = Math.max(68, this.liveText.width + 28)
    const height = 38
    this.liveBackground.clear()
    this.liveBackground.fillStyle(valid ? PARCHMENT_LIGHT : 0xffb0a0, 0.98)
    this.liveBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 10)
    this.liveBackground.lineStyle(2, valid ? BRASS_LIGHT : ERROR, 0.92)
    this.liveBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)

    const x = Phaser.Math.Clamp(this.drag.pointerX, width / 2 + 8, STAGE_WIDTH - width / 2 - 8)
    const y = Phaser.Math.Clamp(this.drag.pointerY + 36, height / 2 + 8, HISTORY_Y - height / 2 - 5)
    this.liveContainer.setPosition(x, y).setVisible(true)
  }

  private renderHistory() {
    this.historyRows.forEach((row, index) => {
      const line = this.lines[index]
      const active = Boolean(line)

      // Empty rows are waiting/idle, not disabled: keep the parchment and
      // line identity clearly alive before the calculation exists.
      const next = !active && index === this.lines.length && this.lines.length < MAX_LINES
      row.background.setAlpha(active ? 1 : next ? 0.96 : 0.90)
      row.marker.setFillStyle(LINE_COLORS[index], active ? 0.94 : next ? 0.48 : 0.26)
      row.marker.setStrokeStyle(2, LINE_COLORS[index], active ? 1 : next ? 0.86 : 0.62)
      row.arrow.setAlpha(active ? 1 : next ? 0.82 : 0.62)

      if (!line) {
        row.formula.setText('')
        row.score.setText('')
        return
      }

      row.formula.setText(formulaFor(line.cells, this.board))
      row.score.setText(`= ${formatScore(line.score)}`)
    })

    this.totalText.setText(`Σ ${formatScore(this.totalScore())}`)
  }

  private renderControls() {
    const undoEnabled = this.undoEnabled()
    const validateEnabled = this.validateEnabled()

    const undoTexture = undoEnabled ? ASSETS.undoIdle[0] : ASSETS.undoDisabled[0]
    const validateTexture = validateEnabled ? ASSETS.validateReady[0] : ASSETS.validateDisabled[0]

    this.undoButton
      .setTexture(undoTexture)
      .setDisplaySize(this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE)
      .setAlpha(undoEnabled ? 1 : 0.76)

    this.validateButton
      .setTexture(validateTexture)
      .setDisplaySize(this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE)
      .setAlpha(validateEnabled ? 1 : 0.78)

    this.renderIndicators()
  }

  private renderIndicators() {
    this.indicatorGraphics.clear()

    for (let index = 0; index < MAX_LINES; index += 1) {
      const centerX = INDICATOR_CENTERS[index]
      const color = LINE_COLORS[index]
      const line = this.lines[index]
      const previewLine = this.drag && this.lines.length === index ? this.drag : null
      const lit = line?.cells.length ?? previewLine?.cells.length ?? 0
      const occupied = Boolean(line || previewLine)
      const next = !occupied && index === this.lines.length && this.lines.length < MAX_LINES
      const coreAlpha = occupied ? 0.98 : next ? 0.72 : 0.40

      if (occupied || next) {
        this.indicatorGraphics.fillStyle(color, occupied ? 0.14 : 0.07)
        this.indicatorGraphics.fillCircle(centerX, 780, occupied ? 15 : 13)
      }

      this.indicatorGraphics.fillStyle(INK_NAVY, 0.90)
      this.indicatorGraphics.fillCircle(centerX, 780, 11)
      this.indicatorGraphics.lineStyle(2, color, occupied ? 0.98 : next ? 0.68 : 0.40)
      this.indicatorGraphics.strokeCircle(centerX, 780, 11)
      this.indicatorGraphics.fillStyle(color, coreAlpha)
      this.indicatorGraphics.fillCircle(centerX, 780, occupied ? 7.2 : 5.2)
      this.indicatorGraphics.fillStyle(0xffffff, occupied ? 0.92 : 0.42)
      this.indicatorGraphics.fillCircle(centerX - 1.6, 777.8, occupied ? 2 : 1.4)

      for (let pip = 0; pip < MAX_LINE_CELLS; pip += 1) {
        const pipX = centerX - 10 + pip * 5
        const isLit = pip < lit
        this.indicatorGraphics.fillStyle(isLit ? color : 0x8b7147, isLit ? 1 : 0.48)
        this.indicatorGraphics.fillCircle(pipX, 812, 2.15)
        this.indicatorGraphics.lineStyle(0.8, isLit ? 0xffffff : BRASS_LIGHT, isLit ? 0.48 : 0.34)
        this.indicatorGraphics.strokeCircle(pipX, 812, 2.15)
      }
    }
  }

  private renderAmbient(time: number) {
    this.ambientGraphics.clear()

    for (const star of this.ambientStars) {
      if (star.y > 132 && star.y < 824) continue
      const alpha = 0.10 + (Math.sin(star.phase + time * star.speed) + 1) * 0.18
      this.ambientGraphics.fillStyle(PARCHMENT_LIGHT, alpha)
      this.ambientGraphics.fillCircle(star.x, star.y, star.radius)
    }
  }

  private renderEnergy(time: number) {
    this.energyGraphics.clear()

    this.lines.forEach((line, index) => {
      const start = cellCenter(line.start)
      const end = cellCenter(line.end)
      const travel = (time * 0.00042 + index * 0.29) % 1
      const x = start.x + (end.x - start.x) * travel
      const y = start.y + (end.y - start.y) * travel
      const color = LINE_COLORS[index]

      this.energyGraphics.fillStyle(color, 0.12)
      this.energyGraphics.fillCircle(x, y, 8)
      this.energyGraphics.fillStyle(color, 0.48)
      this.energyGraphics.fillCircle(x, y, 4.3)
      this.energyGraphics.fillStyle(0xffffff, 0.9)
      this.energyGraphics.fillCircle(x, y, 1.6)
    })
  }

  private renderControlPulse(time: number) {
    this.controlPulseGraphics.clear()

    if (!this.finished && !this.validating && this.lines.length < MAX_LINES) {
      const centerX = INDICATOR_CENTERS[this.lines.length]
      const alpha = 0.18 + (Math.sin(time * 0.0045) + 1) * 0.07
      this.controlPulseGraphics.lineStyle(1.5, LINE_COLORS[this.lines.length], alpha)
      this.controlPulseGraphics.strokeCircle(centerX, 780, 16)
    }

    if (!this.validateEnabled()) return

    const pulse = 0.18 + (Math.sin(time * 0.005) + 1) * 0.10
    this.controlPulseGraphics.lineStyle(3, EMERALD, pulse)
    this.controlPulseGraphics.strokeCircle(337, CONTROL_Y, 45)
    this.controlPulseGraphics.lineStyle(1, 0xffe69b, pulse * 0.82)
    this.controlPulseGraphics.strokeCircle(337, CONTROL_Y, 49)
  }
}
