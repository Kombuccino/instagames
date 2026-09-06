import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'

export const LINEFUGG_SCENE_KEY = 'linefugg-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GRID_SIZE = 7
const MAX_LINES = 3
const MAX_LINE_CELLS = 5
const GAME_ID = 'linefugg'

const BOARD_X = 10
const BOARD_Y = 140
const BOARD_SIZE = 370
const CELL_SIZE = BOARD_SIZE / GRID_SIZE

const HISTORY_Y = 523
const HISTORY_ROW_HEIGHT = 40
const HISTORY_ROW_GAP = 4
const TOTAL_Y = 680
const CONTROL_Y = 765

const MASTER_ASSET_KEY = 'linefugg-orbital-stage-master'
const MASTER_ASSET_URL = '/assets/imported/linefugg/backgrounds/orbital-stage-master-v1.png'

const INK_NAVY = 0x061424
const DEEP_NAVY = 0x0a1b30
const ENAMEL = 0x081a2c
const BRASS_DARK = 0x3a2414
const BRASS = 0xb77928
const BRASS_LIGHT = 0xd9a24a
const PARCHMENT = 0xe8d2a4
const PARCHMENT_LIGHT = 0xf3e3bd
const EMERALD = 0x1f9d57
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
  background: Phaser.GameObjects.Rectangle
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
  private message = '3 traits · 5 cases maximum'
  private finished = false
  private validating = false

  private boardGraphics!: Phaser.GameObjects.Graphics
  private lineGraphics!: Phaser.GameObjects.Graphics
  private energyGraphics!: Phaser.GameObjects.Graphics
  private ambientGraphics!: Phaser.GameObjects.Graphics
  private indicatorGraphics!: Phaser.GameObjects.Graphics
  private controlGraphics!: Phaser.GameObjects.Graphics
  private controlPulseGraphics!: Phaser.GameObjects.Graphics

  private messageText!: Phaser.GameObjects.Text
  private cellTexts: Phaser.GameObjects.Text[] = []
  private ambientStars: AmbientStar[] = []

  private liveContainer!: Phaser.GameObjects.Container
  private liveBackground!: Phaser.GameObjects.Graphics
  private liveText!: Phaser.GameObjects.Text

  private historyRows: HistoryRow[] = []
  private totalText!: Phaser.GameObjects.Text

  private undoButton!: Phaser.GameObjects.Arc
  private undoText!: Phaser.GameObjects.Text
  private validateButton!: Phaser.GameObjects.Arc
  private validateText!: Phaser.GameObjects.Text

  constructor(bridge: LineFuggSceneBridge) {
    super({ key: LINEFUGG_SCENE_KEY })
    this.bridge = bridge
  }

  preload() {
    this.load.image(MASTER_ASSET_KEY, MASTER_ASSET_URL)
  }

  create() {
    this.resetRunState()
    this.createBackground()
    this.createStatus()
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
    this.message = '3 traits · 5 cases maximum'
    this.finished = false
    this.validating = false
    this.cellTexts = []
    this.historyRows = []

    const random = mulberry32(hashString(`linefugg-stars:${this.bridge.seed}:${this.dayId}`))
    this.ambientStars = Array.from({ length: 34 }, () => ({
      x: random() * STAGE_WIDTH,
      y: random() * STAGE_HEIGHT,
      radius: 0.45 + random() * 1.15,
      phase: random() * Math.PI * 2,
      speed: 0.00055 + random() * 0.0011,
    }))
  }

  private createBackground() {
    const master = this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, MASTER_ASSET_KEY).setDepth(0)
    const coverScale = Math.max(STAGE_WIDTH / master.width, STAGE_HEIGHT / master.height)
    master.setScale(coverScale).setAlpha(0.88)

    const shade = this.add.graphics().setDepth(1)
    shade.fillStyle(INK_NAVY, 0.28)
    shade.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

    // Hide the baked close icon from the concept plate; Core owns this affordance.
    shade.fillStyle(INK_NAVY, 0.96)
    shade.fillRoundedRect(-3, -3, 72, 96, 18)

    // Completely occlude baked gameplay. Only the validated celestial/brass decor remains visible.
    shade.fillStyle(INK_NAVY, 0.985)
    shade.fillRoundedRect(BOARD_X - 7, BOARD_Y - 8, BOARD_SIZE + 14, BOARD_SIZE + 16, 10)
    shade.fillRoundedRect(7, BOARD_Y + BOARD_SIZE - 2, 376, 166, 12)
    shade.fillRoundedRect(86, TOTAL_Y - 27, 218, 55, 14)
    shade.fillRoundedRect(5, 713, 380, 116, 20)

    this.ambientGraphics = this.add.graphics().setDepth(2)
  }

  private createStatus() {
    const plate = this.add.rectangle(195, 113, 286, 31, DEEP_NAVY, 0.92)
      .setStrokeStyle(1, BRASS_LIGHT, 0.54)
      .setDepth(12)

    plate.setAlpha(0.92)

    this.messageText = this.add.text(195, 113, this.message, {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f3e3bd',
      align: 'center',
    }).setOrigin(0.5).setDepth(13)
  }

  private createBoardObjects() {
    this.boardGraphics = this.add.graphics().setDepth(20)
    this.lineGraphics = this.add.graphics().setDepth(24)
    this.energyGraphics = this.add.graphics().setDepth(26)

    this.cellTexts = this.board.map((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const color = cell.kind === 'multiply'
        ? '#ffe0ad'
        : cell.kind === 'divide'
          ? '#f1ddff'
          : '#f3e3bd'

      return this.add.text(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        cell.label,
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '22px',
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
      ).setOrigin(0.5).setDepth(32)
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
      .setDepth(50)
      .setVisible(false)
  }

  private createHistory() {
    for (let index = 0; index < MAX_LINES; index += 1) {
      const y = HISTORY_Y + index * (HISTORY_ROW_HEIGHT + HISTORY_ROW_GAP)
      const background = this.add.rectangle(12, y, 366, HISTORY_ROW_HEIGHT, PARCHMENT, 0.78)
        .setOrigin(0)
        .setStrokeStyle(2, BRASS, 0.84)
        .setDepth(10)

      const marker = this.add.circle(28, y + HISTORY_ROW_HEIGHT / 2, 7, LINE_COLORS[index], 0.18)
        .setStrokeStyle(2, LINE_COLORS[index], 0.42)
        .setDepth(11)

      const arrow = this.add.text(43, y + HISTORY_ROW_HEIGHT / 2, '→', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: LINE_COLOR_STRINGS[index],
      }).setOrigin(0.5).setDepth(12)

      const formula = this.add.text(58, y + HISTORY_ROW_HEIGHT / 2, '', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#251a10',
      }).setOrigin(0, 0.5).setDepth(12)

      const score = this.add.text(366, y + HISTORY_ROW_HEIGHT / 2, '', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#1c140d',
      }).setOrigin(1, 0.5).setDepth(12)

      this.historyRows.push({ background, marker, arrow, formula, score })
    }

    this.add.rectangle(195, TOTAL_Y, 204, 46, DEEP_NAVY, 0.98)
      .setStrokeStyle(2, BRASS_LIGHT, 0.94)
      .setDepth(10)

    this.totalText = this.add.text(195, TOTAL_Y, 'Σ 0', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#f3e3bd',
    }).setOrigin(0.5).setDepth(12)
  }

  private createControls() {
    this.controlGraphics = this.add.graphics().setDepth(10)
    this.indicatorGraphics = this.add.graphics().setDepth(11)
    this.controlPulseGraphics = this.add.graphics().setDepth(12)

    this.undoButton = this.add.circle(54, CONTROL_Y, 35, 0x17140f, 0.98)
      .setStrokeStyle(4, BRASS_LIGHT, 0.96)
      .setDepth(13)
      .setInteractive({ useHandCursor: true })

    this.undoText = this.add.text(54, CONTROL_Y - 1, '↶', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '37px',
      fontStyle: 'bold',
      color: '#f3e3bd',
    }).setOrigin(0.5).setDepth(14)

    this.validateButton = this.add.circle(336, CONTROL_Y, 35, 0x17202a, 0.98)
      .setStrokeStyle(4, BRASS_LIGHT, 0.78)
      .setDepth(13)
      .setInteractive({ useHandCursor: true })

    this.validateText = this.add.text(336, CONTROL_Y - 1, '✓', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '35px',
      fontStyle: 'bold',
      color: '#a49b84',
    }).setOrigin(0.5).setDepth(14)

    this.undoButton.on('pointerup', this.handleUndoPointer, this)
    this.validateButton.on('pointerup', this.handleValidatePointer, this)
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
    this.undoButton?.off('pointerup', this.handleUndoPointer, this)
    this.validateButton?.off('pointerup', this.handleValidatePointer, this)
  }

  private handleGamePause() {
    if (!this.drag) return
    this.drag = null
    this.message = this.remainingMessage()
    this.refreshPresentation()
  }

  private handleUndoPointer() {
    this.undo()
  }

  private handleValidatePointer() {
    this.validateRun()
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.validating || this.drag || this.lines.length >= MAX_LINES) return

    const nativeEvent = pointer.event
    if (typeof MouseEvent !== 'undefined' && nativeEvent instanceof MouseEvent && nativeEvent.button !== 0) return

    const world = this.pointerWorld(pointer)
    const start = this.pointFromWorld(world.x, world.y)
    if (!start) return

    this.drag = this.buildDrag(pointer.id, start, null, world.x, world.y)
    this.message = 'Glisse en ligne droite · 5 cases max'
    this.refreshPresentation()
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.drag || this.drag.pointerId !== pointer.id) return

    const world = this.pointerWorld(pointer)
    const end = this.snapEnd(this.drag.start, world.x, world.y)
    this.drag = this.buildDrag(pointer.id, this.drag.start, end, world.x, world.y)

    if (end && !this.drag.valid) {
      this.message = 'Une seule case de croisement maximum'
    } else if (end) {
      this.message = `${this.drag.cells.length} case${this.drag.cells.length > 1 ? 's' : ''}`
    } else {
      this.message = 'Glisse en ligne droite · 5 cases max'
    }

    this.refreshPresentation()
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.drag || this.drag.pointerId !== pointer.id) return

    if (pointer.wasCanceled) {
      this.drag = null
      this.message = this.remainingMessage()
      this.refreshPresentation()
      return
    }

    const world = this.pointerWorld(pointer)
    const end = this.snapEnd(this.drag.start, world.x, world.y)
    const finalDrag = this.buildDrag(pointer.id, this.drag.start, end, world.x, world.y)
    this.drag = null

    if (!end || finalDrag.cells.length < 2) {
      this.message = 'Il faut au moins 2 cases'
      this.flashInvalid()
      this.refreshPresentation()
      return
    }

    if (!finalDrag.valid) {
      this.message = 'Refusé · un seul croisement par ligne'
      this.flashInvalid()
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
    this.message = this.remainingMessage()
    this.refreshPresentation()
    this.pulseNewLine(this.lines.length - 1)
  }

  private undo() {
    if (this.finished || this.validating || this.drag || this.lines.length === 0) return

    this.lines.pop()
    this.bridge.session.setScore(this.totalScore())
    this.message = 'Dernier trait annulé'
    this.refreshPresentation()
  }

  private validateRun() {
    if (this.finished || this.validating || this.drag || this.lines.length !== MAX_LINES) return

    this.validating = true
    this.message = 'Calcul validé'
    this.refreshPresentation()

    const total = this.totalScore()
    this.bridge.session.setScore(total)

    this.tweens.add({
      targets: [this.validateButton, this.validateText],
      scale: 1.12,
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
          artDirection: 'orbital-accounting-v1',
        },
      })
      this.scene.pause()
    })
  }

  private pulseNewLine(index: number) {
    const row = this.historyRows[index]
    if (!row) return

    row.background.setScale(0.985, 0.92)
    this.tweens.add({
      targets: row.background,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut',
    })

    this.cellTexts.forEach((text) => text.setScale(1))
    for (const point of this.lines[index]?.cells ?? []) {
      const text = this.cellTexts[point.row * GRID_SIZE + point.col]
      if (!text) continue
      text.setScale(1.12)
      this.tweens.add({
        targets: text,
        scale: 1,
        duration: 210,
        ease: 'Sine.easeOut',
      })
    }
  }

  private flashInvalid() {
    this.cameras.main.shake(90, 0.0024)
    const flare = this.add.rectangle(195, BOARD_Y + BOARD_SIZE / 2, BOARD_SIZE, BOARD_SIZE, ERROR, 0.09)
      .setDepth(45)

    this.tweens.add({
      targets: flare,
      alpha: 0,
      duration: 150,
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

  private remainingMessage() {
    const remaining = MAX_LINES - this.lines.length
    if (remaining <= 0) return '3/3 · ajuste avec ↶ ou valide ✓'
    return `${remaining} trait${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
  }

  private totalScore() {
    return roundScore(this.lines.reduce((sum, line) => sum + line.score, 0))
  }

  private refreshPresentation() {
    this.messageText.setText(this.message)
    this.renderBoard()
    this.renderLines()
    this.renderLiveValue()
    this.renderHistory()
    this.renderControls()
  }

  private renderBoard() {
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

    this.boardGraphics.clear()

    this.boardGraphics.fillStyle(BRASS_DARK, 0.98)
    this.boardGraphics.fillRoundedRect(BOARD_X - 7, BOARD_Y - 7, BOARD_SIZE + 14, BOARD_SIZE + 14, 11)
    this.boardGraphics.fillStyle(BRASS_LIGHT, 0.96)
    this.boardGraphics.fillRoundedRect(BOARD_X - 4, BOARD_Y - 4, BOARD_SIZE + 8, BOARD_SIZE + 8, 8)
    this.boardGraphics.fillStyle(ENAMEL, 1)
    this.boardGraphics.fillRect(BOARD_X, BOARD_Y, BOARD_SIZE, BOARD_SIZE)

    this.board.forEach((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const x = BOARD_X + col * CELL_SIZE
      const y = BOARD_Y + row * CELL_SIZE
      const point = { row, col }
      const key = pointKey(point)
      const useCount = usedCounts.get(key) ?? 0

      let fill = ENAMEL
      let alpha = 0.985
      if (cell.kind === 'multiply') {
        fill = 0x7e310f
        alpha = 0.97
      } else if (cell.kind === 'divide') {
        fill = 0x32175b
        alpha = 0.97
      } else if (cell.value < 0) {
        fill = 0x0d2134
      }

      this.boardGraphics.fillStyle(fill, alpha)
      this.boardGraphics.fillRoundedRect(x + 1.6, y + 1.6, CELL_SIZE - 3.2, CELL_SIZE - 3.2, 5)

      this.boardGraphics.lineStyle(1.2, BRASS_LIGHT, 0.58)
      this.boardGraphics.strokeRoundedRect(x + 1.7, y + 1.7, CELL_SIZE - 3.4, CELL_SIZE - 3.4, 5)

      if (useCount > 0) {
        this.boardGraphics.fillStyle(0xffffff, 0.055 + Math.min(useCount, 2) * 0.025)
        this.boardGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 7)
      }

      if (useCount > 1) {
        this.boardGraphics.lineStyle(2, BRASS_LIGHT, 0.85)
        this.boardGraphics.strokeCircle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.34)
      }

      if (preview.has(key)) {
        this.boardGraphics.fillStyle(previewColor, this.drag?.valid ? 0.15 : 0.20)
        this.boardGraphics.fillRoundedRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 7)
        this.boardGraphics.lineStyle(2, previewColor, 0.72)
        this.boardGraphics.strokeCircle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.31)
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
    const arrowLength = 16
    const arrowHalfWidth = 7.5
    const arrowTipX = end.x - ux * 12
    const arrowTipY = end.y - uy * 12
    const baseX = arrowTipX - ux * arrowLength
    const baseY = arrowTipY - uy * arrowLength

    this.lineGraphics.lineStyle(16, color, 0.11 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(9, color, 0.30 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(4, color, 0.96 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.lineStyle(1.4, 0xffffff, 0.74 * alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(end.x, end.y)
    this.lineGraphics.strokePath()

    this.lineGraphics.fillStyle(color, 0.96 * alpha)
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
    this.lineGraphics.fillCircle(x, y, 18)
    this.lineGraphics.fillStyle(color, 0.30 * alpha)
    this.lineGraphics.fillCircle(x, y, 12)
    this.lineGraphics.fillStyle(color, 0.95 * alpha)
    this.lineGraphics.fillCircle(x, y, 7)
    this.lineGraphics.fillStyle(0xffffff, 0.92 * alpha)
    this.lineGraphics.fillCircle(x, y, 3.2)
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

      row.background.setFillStyle(active ? PARCHMENT_LIGHT : PARCHMENT, active ? 0.97 : 0.48)
      row.background.setStrokeStyle(2, active ? BRASS_LIGHT : BRASS, active ? 0.96 : 0.42)
      row.marker.setFillStyle(LINE_COLORS[index], active ? 0.88 : 0.12)
      row.marker.setStrokeStyle(2, LINE_COLORS[index], active ? 0.95 : 0.34)
      row.arrow.setAlpha(active ? 1 : 0.22)

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
    const undoEnabled = !this.finished && !this.validating && !this.drag && this.lines.length > 0
    const validateEnabled = !this.finished && !this.validating && !this.drag && this.lines.length === MAX_LINES

    this.controlGraphics.clear()
    this.controlGraphics.fillStyle(BRASS_DARK, 0.96)
    this.controlGraphics.fillRoundedRect(104, 724, 182, 88, 18)
    this.controlGraphics.lineStyle(2, BRASS_LIGHT, 0.76)
    this.controlGraphics.strokeRoundedRect(104, 724, 182, 88, 18)

    this.undoButton
      .setFillStyle(0x17140f, undoEnabled ? 0.98 : 0.78)
      .setStrokeStyle(4, BRASS_LIGHT, undoEnabled ? 0.96 : 0.36)
      .setAlpha(undoEnabled ? 1 : 0.55)
    this.undoText.setAlpha(undoEnabled ? 1 : 0.38)

    this.validateButton
      .setFillStyle(validateEnabled ? EMERALD : 0x17202a, 0.98)
      .setStrokeStyle(4, validateEnabled ? 0xf3d77e : BRASS_LIGHT, validateEnabled ? 1 : 0.44)
      .setAlpha(this.finished ? 0.7 : 1)
    this.validateText
      .setColor(validateEnabled ? '#fff0b4' : '#8f8978')
      .setAlpha(validateEnabled ? 1 : 0.62)

    this.renderIndicators()
  }

  private renderIndicators() {
    this.indicatorGraphics.clear()

    const centers = [132, 195, 258]
    for (let index = 0; index < MAX_LINES; index += 1) {
      const centerX = centers[index]
      const color = LINE_COLORS[index]
      const line = this.lines[index]
      const lit = line?.cells.length ?? (this.drag && this.lines.length === index ? this.drag.cells.length : 0)
      const active = Boolean(line) || Boolean(this.drag && this.lines.length === index)

      this.indicatorGraphics.fillStyle(BRASS_DARK, 0.98)
      this.indicatorGraphics.fillCircle(centerX, 755, 18)
      this.indicatorGraphics.lineStyle(2, BRASS_LIGHT, 0.82)
      this.indicatorGraphics.strokeCircle(centerX, 755, 18)

      this.indicatorGraphics.fillStyle(color, active ? 0.18 : 0.06)
      this.indicatorGraphics.fillCircle(centerX, 755, 13)
      this.indicatorGraphics.fillStyle(color, active ? 0.82 : 0.18)
      this.indicatorGraphics.fillCircle(centerX, 755, active ? 7.5 : 5)
      if (active) {
        this.indicatorGraphics.fillStyle(0xffffff, 0.78)
        this.indicatorGraphics.fillCircle(centerX - 2.2, 752.5, 2.1)
      }

      for (let pip = 0; pip < MAX_LINE_CELLS; pip += 1) {
        const pipX = centerX - 12 + pip * 6
        const isLit = pip < lit
        this.indicatorGraphics.fillStyle(isLit ? color : 0x5b4b36, isLit ? 1 : 0.62)
        this.indicatorGraphics.fillCircle(pipX, 787, 2.5)
        if (isLit) {
          this.indicatorGraphics.lineStyle(1, 0xffffff, 0.46)
          this.indicatorGraphics.strokeCircle(pipX, 787, 2.5)
        }
      }
    }
  }

  private renderAmbient(time: number) {
    this.ambientGraphics.clear()

    const orbitAlpha = 0.10 + (Math.sin(time * 0.00035) + 1) * 0.025
    this.ambientGraphics.lineStyle(1, BRASS_LIGHT, orbitAlpha)
    this.ambientGraphics.strokeEllipse(195, 58, 264, 74)
    this.ambientGraphics.strokeEllipse(195, 58, 194, 50)
    this.ambientGraphics.strokeCircle(195, 58, 26)

    for (const star of this.ambientStars) {
      if (star.y > BOARD_Y - 12 && star.y < 828) continue
      const alpha = 0.18 + (Math.sin(star.phase + time * star.speed) + 1) * 0.24
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
      this.energyGraphics.fillCircle(x, y, 10)
      this.energyGraphics.fillStyle(color, 0.42)
      this.energyGraphics.fillCircle(x, y, 5)
      this.energyGraphics.fillStyle(0xffffff, 0.9)
      this.energyGraphics.fillCircle(x, y, 1.8)
    })
  }

  private renderControlPulse(time: number) {
    this.controlPulseGraphics.clear()

    if (this.lines.length !== MAX_LINES || this.finished) return

    const pulse = 0.18 + (Math.sin(time * 0.005) + 1) * 0.10
    this.controlPulseGraphics.lineStyle(3, EMERALD, pulse)
    this.controlPulseGraphics.strokeCircle(336, CONTROL_Y, 41)
    this.controlPulseGraphics.lineStyle(1, 0xffe69b, pulse * 0.8)
    this.controlPulseGraphics.strokeCircle(336, CONTROL_Y, 45)
  }
}
