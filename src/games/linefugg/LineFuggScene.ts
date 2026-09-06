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
const BOARD_Y = 156
const BOARD_SIZE = 370
const CELL_SIZE = BOARD_SIZE / GRID_SIZE
const HISTORY_Y = 558
const HISTORY_ROW_HEIGHT = 42
const HISTORY_ROW_GAP = 8
const CONTROL_Y = 674

const LINE_COLORS = [0xff744f, 0x9d84ff, 0xffd466] as const
const LINE_COLOR_STRINGS = ['#ff744f', '#9d84ff', '#ffd466'] as const

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
  arrow: Phaser.GameObjects.Text
  formula: Phaser.GameObjects.Text
  score: Phaser.GameObjects.Text
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

  private boardGraphics!: Phaser.GameObjects.Graphics
  private lineGraphics!: Phaser.GameObjects.Graphics
  private turnGraphics!: Phaser.GameObjects.Graphics
  private messageText!: Phaser.GameObjects.Text
  private cellTexts: Phaser.GameObjects.Text[] = []

  private liveContainer!: Phaser.GameObjects.Container
  private liveBackground!: Phaser.GameObjects.Graphics
  private liveText!: Phaser.GameObjects.Text

  private historyRows: HistoryRow[] = []
  private historyEmptyTitle!: Phaser.GameObjects.Text
  private historyEmptyCopy!: Phaser.GameObjects.Text

  private undoButton!: Phaser.GameObjects.Rectangle
  private undoText!: Phaser.GameObjects.Text
  private helperText!: Phaser.GameObjects.Text

  constructor(bridge: LineFuggSceneBridge) {
    super({ key: LINEFUGG_SCENE_KEY })
    this.bridge = bridge
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

  private resetRunState() {
    this.dayId = currentUtcDayId()
    this.board = createBoard(hashString(`${GAME_ID}:${this.dayId}`))
    this.lines = []
    this.drag = null
    this.message = '3 traits · 5 cases maximum'
    this.finished = false
    this.cellTexts = []
    this.historyRows = []
  }

  private createBackground() {
    const graphics = this.add.graphics().setDepth(0)
    graphics.fillStyle(0x08080b, 1)
    graphics.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

    graphics.fillStyle(0xff6f48, 0.045)
    graphics.fillCircle(195, 270, 165)
    graphics.fillStyle(0x785bff, 0.035)
    graphics.fillCircle(68, 650, 180)

    graphics.lineStyle(1, 0xffffff, 0.02)
    for (let x = 0; x <= STAGE_WIDTH; x += 32) {
      graphics.beginPath()
      graphics.moveTo(x, 0)
      graphics.lineTo(x, STAGE_HEIGHT)
      graphics.strokePath()
    }
    for (let y = 0; y <= STAGE_HEIGHT; y += 32) {
      graphics.beginPath()
      graphics.moveTo(0, y)
      graphics.lineTo(STAGE_WIDTH, y)
      graphics.strokePath()
    }
  }

  private createStatus() {
    this.turnGraphics = this.add.graphics().setDepth(10)
    this.messageText = this.add.text(16, 92, this.message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: '600',
      color: '#aeb0b8',
    }).setDepth(10)
  }

  private createBoardObjects() {
    this.add.text(13, 132, `GRILLE DU JOUR · ${this.dayId}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: '700',
      color: '#777982',
    }).setDepth(10)

    this.boardGraphics = this.add.graphics().setDepth(20)

    this.cellTexts = this.board.map((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const color = cell.kind === 'multiply'
        ? '#ffc0a8'
        : cell.kind === 'divide'
          ? '#c9c0ff'
          : '#f7f7f8'

      return this.add.text(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        cell.label,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '23px',
          fontStyle: '700',
          color,
        },
      ).setOrigin(0.5).setDepth(22)
    })

    this.lineGraphics = this.add.graphics().setDepth(30)
  }

  private createLiveValue() {
    this.liveBackground = this.add.graphics()
    this.liveText = this.add.text(0, 0, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '21px',
      fontStyle: '700',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.liveContainer = this.add.container(0, 0, [this.liveBackground, this.liveText])
      .setDepth(40)
      .setVisible(false)
  }

  private createHistory() {
    this.historyEmptyTitle = this.add.text(14, HISTORY_Y + 12, 'Trace ton premier trait', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: '700',
      color: '#f3f3f5',
    }).setDepth(10)

    this.historyEmptyCopy = this.add.text(14, HISTORY_Y + 36, 'Le sens de la flèche donne l’ordre du calcul.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#858790',
    }).setDepth(10)

    for (let index = 0; index < 2; index += 1) {
      const y = HISTORY_Y + index * (HISTORY_ROW_HEIGHT + HISTORY_ROW_GAP)
      const background = this.add.rectangle(12, y, 366, HISTORY_ROW_HEIGHT, 0xffffff, 0.035)
        .setOrigin(0)
        .setStrokeStyle(1, 0xffffff, 0.08)
        .setDepth(10)
        .setVisible(false)
      const arrow = this.add.text(29, y + HISTORY_ROW_HEIGHT / 2, '→', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: '700',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(11).setVisible(false)
      const formula = this.add.text(52, y + HISTORY_ROW_HEIGHT / 2, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: '600',
        color: '#c1c2c8',
      }).setOrigin(0, 0.5).setDepth(11).setVisible(false)
      const score = this.add.text(366, y + HISTORY_ROW_HEIGHT / 2, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: '700',
        color: '#ffffff',
      }).setOrigin(1, 0.5).setDepth(11).setVisible(false)

      this.historyRows.push({ background, arrow, formula, score })
    }
  }

  private createControls() {
    this.undoButton = this.add.rectangle(12, CONTROL_Y, 112, 38, 0xffffff, 0.055)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff, 0.13)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })

    this.undoText = this.add.text(68, CONTROL_Y + 19, '↶ Annuler', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: '700',
      color: '#d3d4d8',
    }).setOrigin(0.5).setDepth(11)

    this.helperText = this.add.text(378, CONTROL_Y + 19, '1 croisement max · 5 cases max', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: '600',
      color: '#6f7179',
    }).setOrigin(1, 0.5).setDepth(10)

    this.undoButton.on('pointerup', this.handleUndoPointer, this)
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
  }

  private handleGamePause() {
    if (!this.drag) return
    this.drag = null
    const remaining = MAX_LINES - this.lines.length
    this.message = `${remaining} trait${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
    this.refreshPresentation()
  }

  private handleUndoPointer() {
    this.undo()
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.drag || this.lines.length >= MAX_LINES) return

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
    this.message = end && !this.drag.valid
      ? 'Une seule case de croisement maximum'
      : 'Relâche pour valider'
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
      this.refreshPresentation()
      return
    }

    if (!finalDrag.valid) {
      this.message = 'Refusé · une seule case de croisement max'
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
    const total = this.totalScore()
    this.bridge.session.setScore(total)

    if (this.lines.length >= MAX_LINES) {
      this.finished = true
      this.message = 'Partie terminée'
      this.refreshPresentation()
      this.bridge.session.finish({
        score: total,
        boardId: this.dayId,
        metadata: {
          board: this.dayId,
          gridSize: GRID_SIZE,
          lineLimit: MAX_LINE_CELLS,
          runtimeSeed: this.bridge.seed,
        },
      })
      this.scene.pause()
      return
    }

    this.message = this.remainingMessage()
    this.refreshPresentation()
  }

  private undo() {
    if (this.finished || this.drag || this.lines.length === 0) return

    this.lines.pop()
    this.bridge.session.setScore(this.totalScore())
    this.message = 'Dernier trait annulé'
    this.refreshPresentation()
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
    return `${remaining} trait${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
  }

  private totalScore() {
    return roundScore(this.lines.reduce((sum, line) => sum + line.score, 0))
  }

  private refreshPresentation() {
    this.renderTurns()
    this.messageText.setText(this.message)
    this.renderBoard()
    this.renderLines()
    this.renderLiveValue()
    this.renderHistory()
    this.renderControls()
  }

  private renderTurns() {
    this.turnGraphics.clear()
    for (let index = 0; index < MAX_LINES; index += 1) {
      const played = index < this.lines.length
      this.turnGraphics.fillStyle(played ? 0xffffff : 0x34343b, played ? 1 : 0.7)
      this.turnGraphics.fillRoundedRect(16 + index * 38, 66, 30, 7, 4)
      if (!played) {
        this.turnGraphics.lineStyle(1, 0xffffff, 0.3)
        this.turnGraphics.strokeRoundedRect(16 + index * 38, 66, 30, 7, 4)
      }
    }
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

    this.boardGraphics.clear()
    this.boardGraphics.fillStyle(0x09090d, 0.96)
    this.boardGraphics.fillRect(BOARD_X, BOARD_Y, BOARD_SIZE, BOARD_SIZE)

    this.board.forEach((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const x = BOARD_X + col * CELL_SIZE
      const y = BOARD_Y + row * CELL_SIZE
      const point = { row, col }
      const useCount = usedCounts.get(pointKey(point)) ?? 0

      if (cell.kind === 'multiply') {
        this.boardGraphics.fillStyle(0xff7d4b, 0.10)
        this.boardGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      } else if (cell.kind === 'divide') {
        this.boardGraphics.fillStyle(0x7e6bff, 0.09)
        this.boardGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      }

      if (useCount > 0) {
        this.boardGraphics.fillStyle(0xffffff, 0.085)
        this.boardGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      }
      if (useCount > 1) {
        this.boardGraphics.fillStyle(0xffd263, 0.18)
        this.boardGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      }
      if (preview.has(pointKey(point))) {
        this.boardGraphics.fillStyle(0xffffff, 0.15)
        this.boardGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      }
    })

    this.boardGraphics.lineStyle(1, 0xffffff, 0.07)
    for (let index = 1; index < GRID_SIZE; index += 1) {
      const offset = index * CELL_SIZE
      this.boardGraphics.beginPath()
      this.boardGraphics.moveTo(BOARD_X + offset, BOARD_Y)
      this.boardGraphics.lineTo(BOARD_X + offset, BOARD_Y + BOARD_SIZE)
      this.boardGraphics.strokePath()
      this.boardGraphics.beginPath()
      this.boardGraphics.moveTo(BOARD_X, BOARD_Y + offset)
      this.boardGraphics.lineTo(BOARD_X + BOARD_SIZE, BOARD_Y + offset)
      this.boardGraphics.strokePath()
    }

    this.boardGraphics.lineStyle(1, 0xffffff, this.drag?.end && !this.drag.valid ? 0.48 : 0.18)
    this.boardGraphics.strokeRect(BOARD_X, BOARD_Y, BOARD_SIZE, BOARD_SIZE)
  }

  private renderLines() {
    this.lineGraphics.clear()

    this.lines.forEach((line, index) => {
      this.drawArrowLine(line.start, line.end, LINE_COLORS[index] ?? 0xffffff, 5, 1)
    })

    if (this.drag?.end) {
      this.drawArrowLine(
        this.drag.start,
        this.drag.end,
        this.drag.valid ? 0xffffff : 0xff5555,
        4,
        this.drag.valid ? 0.94 : 1,
      )
    }
  }

  private drawArrowLine(startPoint: Point, endPoint: Point, color: number, width: number, alpha: number) {
    const start = cellCenter(startPoint)
    const end = cellCenter(endPoint)
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy)
    if (length === 0) return

    const ux = dx / length
    const uy = dy / length
    const arrowLength = 14
    const arrowHalfWidth = 7
    const baseX = end.x - ux * arrowLength
    const baseY = end.y - uy * arrowLength

    this.lineGraphics.lineStyle(width, color, alpha)
    this.lineGraphics.beginPath()
    this.lineGraphics.moveTo(start.x, start.y)
    this.lineGraphics.lineTo(baseX, baseY)
    this.lineGraphics.strokePath()

    this.lineGraphics.fillStyle(color, alpha)
    this.lineGraphics.fillTriangle(
      end.x,
      end.y,
      baseX - uy * arrowHalfWidth,
      baseY + ux * arrowHalfWidth,
      baseX + uy * arrowHalfWidth,
      baseY - ux * arrowHalfWidth,
    )
  }

  private renderLiveValue() {
    if (!this.drag?.cells.length) {
      this.liveContainer.setVisible(false)
      return
    }

    const valid = this.drag.valid
    const text = valid ? `= ${formatScore(scoreCells(this.drag.cells, this.board))}` : '×'
    this.liveText.setText(text).setColor(valid ? '#ffffff' : '#ff7777')

    const width = Math.max(72, this.liveText.width + 26)
    const height = 42
    this.liveBackground.clear()
    this.liveBackground.fillStyle(0x07070a, 0.94)
    this.liveBackground.fillRoundedRect(-width / 2, -height / 2, width, height, 12)
    this.liveBackground.lineStyle(1, valid ? 0xffffff : 0xff5555, valid ? 0.24 : 0.45)
    this.liveBackground.strokeRoundedRect(-width / 2, -height / 2, width, height, 12)

    const x = Phaser.Math.Clamp(this.drag.pointerX, width / 2 + 8, STAGE_WIDTH - width / 2 - 8)
    const y = Phaser.Math.Clamp(this.drag.pointerY + 34, height / 2 + 8, STAGE_HEIGHT - height / 2 - 8)
    this.liveContainer.setPosition(x, y).setVisible(true)
  }

  private renderHistory() {
    const history = this.lines.slice(-2)
    const empty = history.length === 0
    this.historyEmptyTitle.setVisible(empty)
    this.historyEmptyCopy.setVisible(empty)

    this.historyRows.forEach((row) => {
      row.background.setVisible(false)
      row.arrow.setVisible(false)
      row.formula.setVisible(false)
      row.score.setVisible(false)
    })

    history.forEach((line, historyIndex) => {
      const row = this.historyRows[historyIndex]
      if (!row) return
      const lineIndex = this.lines.length - history.length + historyIndex
      const color = LINE_COLOR_STRINGS[lineIndex] ?? '#ffffff'

      row.background.setVisible(true)
      row.arrow.setText('→').setColor(color).setVisible(true)
      row.formula.setText(formulaFor(line.cells, this.board)).setVisible(true)
      row.score.setText(`= ${formatScore(line.score)}`).setVisible(true)
    })
  }

  private renderControls() {
    const enabled = !this.finished && !this.drag && this.lines.length > 0
    this.undoButton.setAlpha(enabled ? 1 : 0.32)
    this.undoText.setAlpha(enabled ? 1 : 0.38)
    this.helperText.setAlpha(this.finished ? 0.35 : 1)
  }
}
