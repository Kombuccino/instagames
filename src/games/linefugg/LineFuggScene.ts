import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'

export const LINEFUGG_SCENE_KEY = 'linefugg-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GRID_SIZE = 7
const MAX_LINES = 3
const MAX_LINE_CELLS = 5
const GAME_ID = 'linefugg'

// Fixed logical composition. Generated grid spacing is never used for hit testing.
const BOARD_X = 48
const BOARD_Y = 116
const BOARD_SIZE = 294
const CELL_SIZE = BOARD_SIZE / GRID_SIZE
const RESULT_Y = 510
// DA order is violet left, red centre, yellow right; gameplay line order remains red, violet, yellow.
const RESULT_POSITIONS = [195, 92, 298] as const
const RESULT_SIZES = [106, 112, 114] as const
const RESULT_SCORE_Y_OFFSETS = [5, 12, 10] as const
const RESULT_SCORE_COLORS = [0x071526, 0xffffff, 0xffffff] as const
const SUN_Y = 629
const SUN_SIZE = 124
const CONTROL_Y = 720
const CONTROL_BUTTON_SIZE = 48
const CONTROL_BUTTON_WIDTH = 160
const UNDO_X = 97
const VALIDATE_X = 293

const ASSET_ROOT = '/assets/generated/linefugg/solar-origami-v3/runtime'
const LEGACY_ASSET_ROOT = '/assets/generated/linefugg/solar-origami-v2/runtime'

const ASSETS = {
  cells: ['linefugg-solar-v3-cells', `${ASSET_ROOT}/cells/cell-states-atlas-v3.webp`, `${ASSET_ROOT}/cells/cell-states-atlas-v3.json`],
  results: ['linefugg-solar-v3-results', `${ASSET_ROOT}/results/result-crafts-atlas-v3.webp`, `${ASSET_ROOT}/results/result-crafts-atlas-v3.json`],
  suns: ['linefugg-solar-v3-suns', `${ASSET_ROOT}/results/sun-states-atlas-v3.webp`, `${ASSET_ROOT}/results/sun-states-atlas-v3.json`],
  controls: ['linefugg-solar-v3-controls', `${ASSET_ROOT}/controls/control-buttons-atlas-v3.webp`, `${ASSET_ROOT}/controls/control-buttons-atlas-v3.json`],
  glyphs: ['linefugg-solar-v3-glyphs', `${ASSET_ROOT}/glyphs/gameplay-glyphs-atlas-v3.webp`, `${ASSET_ROOT}/glyphs/gameplay-glyphs-atlas-v3.json`],
  nodes: ['linefugg-solar-v3-nodes', `${ASSET_ROOT}/fx/selection-nodes-atlas-v3.webp`, `${ASSET_ROOT}/fx/selection-nodes-atlas-v3.json`],
  segments: ['linefugg-solar-v3-segments', `${ASSET_ROOT}/fx/selection-segments-atlas-v3.webp`, `${ASSET_ROOT}/fx/selection-segments-atlas-v3.json`],
  arrivals: ['linefugg-solar-v3-arrivals', `${ASSET_ROOT}/fx/arrival-particles-atlas-v3.webp`, `${ASSET_ROOT}/fx/arrival-particles-atlas-v3.json`],
  debris: ['linefugg-solar-debris', `${LEGACY_ASSET_ROOT}/decor/debris-atlas-v2.webp`, `${LEGACY_ASSET_ROOT}/decor/debris-atlas-v2.json`],
  transferRed: ['linefugg-solar-v3-transfer-red', `${ASSET_ROOT}/fx/transfer-red-atlas-v3.webp`, `${ASSET_ROOT}/fx/transfer-red-atlas-v3.json`],
  transferViolet: ['linefugg-solar-v3-transfer-violet', `${ASSET_ROOT}/fx/transfer-violet-atlas-v3.webp`, `${ASSET_ROOT}/fx/transfer-violet-atlas-v3.json`],
  transferYellow: ['linefugg-solar-v3-transfer-yellow', `${ASSET_ROOT}/fx/transfer-yellow-atlas-v3.webp`, `${ASSET_ROOT}/fx/transfer-yellow-atlas-v3.json`],
} as const

const ERROR = 0xff5b3d

const LINE_COLORS = [0xff5a36, 0xa54dff, 0xffc72c] as const

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
  rerollKey: number
  boardBefore: Cell[]
  dimensionSlotsBefore: number[]
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

type GlyphDisplay = {
  container: Phaser.GameObjects.Container
  images: Phaser.GameObjects.Image[]
  text: string
  styleKey: string
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
  renderPixelRatio?: number
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

  // Distribution: 68% positive, 16% negative, 12% multiplier, 4% divider.
  // Dividers are half as frequent as before; negative values are deliberately mild.
  if (roll < 0.68) {
    const value = pickInt(random, 1, 9)
    return { kind: 'add', value, label: String(value) }
  }

  if (roll < 0.84) {
    const value = -pickInt(random, 1, 4)
    return { kind: 'add', value, label: `−${Math.abs(value)}` }
  }

  if (roll < 0.96) {
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

function cellCenter(point: Point) {
  return {
    x: BOARD_X + (point.col + 0.5) * CELL_SIZE,
    y: BOARD_Y + (point.row + 0.5) * CELL_SIZE,
  }
}

function cellGlyphHeight(cell: Cell) {
  if (cell.kind !== 'add') return 17
  return cell.value < 0 ? 18 : 21
}

function fittedScoreHeight(value: string, normal: number, compact: number, minimum: number) {
  if (value.length <= 2) return normal
  if (value.length <= 4) return compact
  return minimum
}

export class LineFuggScene extends Phaser.Scene {
  private readonly bridge: LineFuggSceneBridge

  private dayId = ''
  private board: Cell[] = []
  private lines: PlayedLine[] = []
  private drag: DragState | null = null
  private finished = false
  private validating = false
  private undoHovered = false
  private undoPressed = false
  private validatePressed = false

  private boardOverlayGraphics!: Phaser.GameObjects.Graphics
  private lineGraphics!: Phaser.GameObjects.Graphics
  private energyGraphics!: Phaser.GameObjects.Graphics
  private ambientGraphics!: Phaser.GameObjects.Graphics
  private controlPulseGraphics!: Phaser.GameObjects.Graphics

  private cellBaseImages: Phaser.GameObjects.Image[] = []
  private cellGlyphs: GlyphDisplay[] = []
  private cellSelectionImages: Phaser.GameObjects.Image[] = []
  private lineSegmentImages: Phaser.GameObjects.Image[] = []
  private lineArrowImages: Phaser.GameObjects.Image[] = []
  private cellDimensionSlots: number[] = []
  private rerolling = false
  private ambientStars: AmbientStar[] = []

  private liveContainer!: Phaser.GameObjects.Container
  private liveBackground!: Phaser.GameObjects.Graphics
  private liveValue!: GlyphDisplay

  private validateHovered = false
  private resultCrafts: Phaser.GameObjects.Image[] = []
  private resultValues: GlyphDisplay[] = []
  private sun!: Phaser.GameObjects.Image
  private totalValue!: GlyphDisplay
  private flowShards: Phaser.GameObjects.Image[] = []

  private undoButton!: Phaser.GameObjects.Image
  private validateButton!: Phaser.GameObjects.Image
  private reducedMotion = false
  private motionQuery: MediaQueryList | null = null
  private effectTime = 0
  private stateReader = () => JSON.stringify({
    game: GAME_ID, coordinateSystem: '390x844; origin top-left; x right, y down',
    boardId: this.dayId, board: this.board, boardBounds: { x: BOARD_X, y: BOARD_Y, size: BOARD_SIZE },
    lines: this.lines.map((line) => ({
      start: line.start, end: line.end, cells: line.cells, score: line.score, rerollKey: line.rerollKey,
    })), total: this.totalScore(), drag: this.drag,
    rerolling: this.rerolling, dimensionSlots: this.cellDimensionSlots,
    validating: this.validating, finished: this.finished,
    undoHovered: this.undoHovered, validateHovered: this.validateHovered, validateAppearance: !this.validateEnabled() ? "disabled" : this.validateHovered ? "hover" : "ready", undoEnabled: this.undoEnabled(), validateEnabled: this.validateEnabled(),
    controls: {
      undo: { x: UNDO_X, y: CONTROL_Y, visualSize: CONTROL_BUTTON_SIZE },
      validate: { x: VALIDATE_X, y: CONTROL_Y, visualSize: CONTROL_BUTTON_SIZE },
    },
    essentialBounds: { top: BOARD_Y, bottom: CONTROL_Y + CONTROL_BUTTON_SIZE / 2 },
    reducedMotion: this.reducedMotion, paused: this.game.isPaused, effectTime: this.effectTime,
    textures: Object.values(ASSETS).map(([key]) => {
      const source = this.textures.get(key).getSourceImage()
      return { key, width: source.width, height: source.height }
    }),
  })

  constructor(bridge: LineFuggSceneBridge) {
    super({ key: LINEFUGG_SCENE_KEY })
    this.bridge = bridge
  }

  preload() {
    this.load.maxParallelDownloads = 4
    Object.values(ASSETS).forEach(([key, textureUrl, atlasUrl]) => {
      if (!this.textures.exists(key)) this.load.atlas(key, textureUrl, atlasUrl)
    })
  }

  create() {
    this.cameras.main.setZoom(this.bridge.renderPixelRatio ?? 1).centerOn(STAGE_WIDTH / 2, STAGE_HEIGHT / 2)
    this.resetRunState()
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reducedMotion = this.motionQuery.matches
    this.motionQuery.addEventListener('change', this.handleMotionChange)
    this.createBackground()
    this.createBoardObjects()
    this.createLiveValue()
    this.createHistory()
    this.createControls()
    this.registerInput()
    this.refreshPresentation()
    this.bridge.session.setScore(0)
    if (import.meta.env.DEV) {
      Object.assign(window, { render_game_to_text: this.stateReader, render_linefugg_to_text: this.stateReader })
    }
  }

  update(_time: number, delta: number) {
    if (!this.reducedMotion) this.effectTime += Math.min(delta, 50)
    this.renderAmbient(this.effectTime)
    this.renderEnergy(this.effectTime)
    this.renderControlPulse(this.effectTime)
  }

  private handleMotionChange = (event: MediaQueryListEvent) => { this.reducedMotion = event.matches }

  private lineColorName(index: number) {
    return (['red', 'violet', 'yellow'] as const)[Phaser.Math.Clamp(index, 0, 2)]
  }

  private transferTexture(index: number) {
    return [ASSETS.transferRed[0], ASSETS.transferViolet[0], ASSETS.transferYellow[0]][Phaser.Math.Clamp(index, 0, 2)]
  }

  private createGlyphDisplay(x: number, y: number): GlyphDisplay {
    return { container: this.add.container(x, y), images: [], text: '', styleKey: '' }
  }

  private setGlyphDisplay(display: GlyphDisplay, value: string, height: number, color: number) {
    const text = value.replaceAll('-', '−')
    const styleKey = `${height}:${color}`
    if (display.text === text && display.styleKey === styleKey) return
    display.images.forEach((image) => image.destroy())
    display.images = []
    display.text = text
    display.styleKey = styleKey
    const widths = Array.from(text).map((character) => character === '.' ? height * 0.30 : character === '−' ? height * 0.58 : height * 0.68)
    const totalWidth = widths.reduce((sum, width) => sum + width, 0)
    let cursor = -totalWidth / 2
    Array.from(text).forEach((character, index) => {
      const frame = character === ' ' ? null : character
      if (!frame || !this.textures.get(ASSETS.glyphs[0]).has(frame)) return
      const width = widths[index]
      const isDot = character === '.'
      const image = this.add.image(cursor + width / 2, isDot ? height * 0.28 : 0, ASSETS.glyphs[0], frame)
        .setDisplaySize(isDot ? height * 0.22 : width, isDot ? height * 0.22 : height)
        .setTint(color).setTintMode(Phaser.TintModes.FILL)
      display.container.add(image)
      display.images.push(image)
      cursor += width
    })
  }

  private resetRunState() {
    this.dayId = currentUtcDayId()
    this.board = createBoard(hashString(`${GAME_ID}:${this.dayId}`))
    this.lines = []
    this.drag = null
    this.finished = false
    this.validating = false
    this.undoHovered = false
    this.validateHovered = false
    this.undoPressed = false
    this.validatePressed = false
    this.cellBaseImages = []
    this.cellGlyphs = []
    this.cellSelectionImages = []
    this.lineSegmentImages = []
    this.lineArrowImages = []
    this.cellDimensionSlots = Array(GRID_SIZE * GRID_SIZE).fill(0)
    this.rerolling = false
    this.resultCrafts = []
    this.resultValues = []
    this.flowShards = []
    this.effectTime = 0

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
    // The static star field is CSS-owned so it crops with the Core game surface.
    // All independently moving rocks remain Phaser-owned below the gameplay.
    this.ambientGraphics = this.add.graphics().setDepth(3)
    const placements = [
      [22, 102, 1, 22], [365, 116, 4, 18], [25, 455, 6, 16], [366, 446, 2, 20],
      [30, 620, 3, 16], [360, 645, 7, 18], [30, 790, 5, 26], [360, 805, 0, 24],
    ] as const
    placements.forEach(([x, y, frameIndex, size], index) => {
      const rock = this.add.image(x, y, ASSETS.debris[0], `debris-${String((frameIndex % 7) + 1).padStart(2, '0')}`)
        .setDisplaySize(size, size).setAlpha(0.62).setDepth(4).setAngle(index * 29)
      if (!this.reducedMotion) this.tweens.add({ targets: rock, y: y + (index % 2 ? 5 : -5), angle: rock.angle + 8, duration: 2600 + index * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    })
  }

  private createBoardObjects() {
    this.cellBaseImages = this.board.map((_cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      return this.add.image(position.x, position.y, ASSETS.cells[0], 'cell-neutral')
        .setDisplaySize(CELL_SIZE - 2, CELL_SIZE - 2).setDepth(10)
    })
    this.cellGlyphs = this.board.map((cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      const glyph = this.createGlyphDisplay(position.x, position.y)
      glyph.container.setDepth(17)
      this.setGlyphDisplay(glyph, cell.label, cellGlyphHeight(cell), 0x071526)
      return glyph
    })
    this.cellSelectionImages = this.board.map((_cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      return this.add.image(position.x, position.y, ASSETS.nodes[0], 'node-neutral')
        .setDisplaySize(CELL_SIZE + 8, CELL_SIZE + 8).setDepth(9).setVisible(false)
    })

    this.boardOverlayGraphics = this.add.graphics().setDepth(18)
    this.lineGraphics = this.add.graphics().setDepth(19)
    this.energyGraphics = this.add.graphics().setDepth(22)
    for (let index = 0; index < MAX_LINES + 1; index += 1) {
      this.lineSegmentImages.push(this.add.image(0, 0, ASSETS.segments[0], 'segment-neutral').setDepth(8).setVisible(false))
      this.lineArrowImages.push(this.add.image(0, 0, ASSETS.arrivals[0], 'shard-ivory-01').setDepth(11).setVisible(false))
    }
  }

  private createLiveValue() {
    this.liveBackground = this.add.graphics()
    this.liveValue = this.createGlyphDisplay(0, 0)
    this.liveContainer = this.add.container(0, 0, [this.liveBackground, this.liveValue.container])
      .setDepth(60)
      .setVisible(false)
  }

  private createHistory() {
    for (let index = 0; index < MAX_LINES; index++) {
      this.resultCrafts.push(this.add.image(
        RESULT_POSITIONS[index], RESULT_Y, ASSETS.results[0], `result-${index + 1}-inactive`,
      ).setDisplaySize(RESULT_SIZES[index], RESULT_SIZES[index]).setDepth(31))
      this.resultValues.push(this.createGlyphDisplay(
        RESULT_POSITIONS[index], RESULT_Y + RESULT_SCORE_Y_OFFSETS[index],
      ))
      this.resultValues[index].container.setDepth(33)
      this.flowShards.push(this.add.image(0, 0, this.transferTexture(index), `transfer-${this.lineColorName(index)}-01`)
        .setDisplaySize(28, 14).setDepth(29).setVisible(false))
    }
    this.sun = this.add.image(195, SUN_Y, ASSETS.suns[0], 'sun-neutral').setDisplaySize(SUN_SIZE, SUN_SIZE).setDepth(32)
    this.totalValue = this.createGlyphDisplay(195, SUN_Y + 1)
    this.totalValue.container.setDepth(34)
  }

  private createControls() {
    this.controlPulseGraphics = this.add.graphics().setDepth(47)
    this.undoButton = this.add.image(UNDO_X, CONTROL_Y, ASSETS.controls[0], 'button-undo-normal')
      .setDisplaySize(CONTROL_BUTTON_WIDTH, CONTROL_BUTTON_SIZE).setDepth(48).setInteractive({ useHandCursor: true })
    this.validateButton = this.add.image(VALIDATE_X, CONTROL_Y, ASSETS.controls[0], 'button-validate-disabled')
      .setDisplaySize(CONTROL_BUTTON_WIDTH, CONTROL_BUTTON_SIZE).setDepth(48).setInteractive({ useHandCursor: true })
    this.undoButton.on('pointerover', this.handleUndoOver, this)
    this.undoButton.on('pointerdown', this.handleUndoDown, this)
    this.undoButton.on('pointerup', this.handleUndoUp, this)
    this.undoButton.on('pointerout', this.handleUndoOut, this)
    this.validateButton.on('pointerover', this.handleValidateOver, this)
    this.validateButton.on('pointerdown', this.handleValidateDown, this)
    this.validateButton.on('pointerup', this.handleValidateUp, this)
    this.validateButton.on('pointerout', this.handleValidateOut, this)
  }

  private registerInput() {
    this.input.on('gameout', this.handleUndoOut, this)
    this.input.on('gameout', this.handleValidateOut, this)
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.input.on('pointerupoutside', this.handlePointerUp, this)
    this.game.events.on('pause', this.handleGamePause, this)
    this.events.once('shutdown', this.handleShutdown, this)
    this.events.once('destroy', this.handleShutdown, this)
  }

  private handleShutdown() {
    this.input?.off('gameout', this.handleUndoOut, this)
    this.input?.off('gameout', this.handleValidateOut, this)
    this.events.off('destroy', this.handleShutdown, this)
    this.motionQuery?.removeEventListener('change', this.handleMotionChange)
    const debugWindow = window as Window & { render_game_to_text?: () => string; render_linefugg_to_text?: () => string }
    if (debugWindow.render_game_to_text === this.stateReader) delete debugWindow.render_game_to_text
    if (debugWindow.render_linefugg_to_text === this.stateReader) delete debugWindow.render_linefugg_to_text
    this.input?.off('pointerdown', this.handlePointerDown, this)
    this.input?.off('pointermove', this.handlePointerMove, this)
    this.input?.off('pointerup', this.handlePointerUp, this)
    this.input?.off('pointerupoutside', this.handlePointerUp, this)
    this.game.events.off('pause', this.handleGamePause, this)

    this.undoButton?.off('pointerover', this.handleUndoOver, this)
    this.undoButton?.off('pointerdown', this.handleUndoDown, this)
    this.undoButton?.off('pointerup', this.handleUndoUp, this)
    this.undoButton?.off('pointerout', this.handleUndoOut, this)
    this.validateButton?.off('pointerover', this.handleValidateOver, this)
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
    return !this.finished && !this.validating && !this.rerolling && !this.drag && this.lines.length > 0
  }

  private validateEnabled() {
    return !this.finished && !this.validating && !this.rerolling && !this.drag && this.lines.length === MAX_LINES
  }

  private handleUndoOver() {
    this.undoHovered = true
    this.renderControls()
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
    this.undoHovered = false
    this.undoPressed = false
    this.renderControls()
  }

  private handleValidateDown() {
    if (this.undoHovered && this.undoEnabled()) {
      this.controlPulseGraphics.lineStyle(2, 0xffdf8e, 0.85)
      this.controlPulseGraphics.strokeCircle(UNDO_X, CONTROL_Y, 26)
    }
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

  private handleValidateOver() {
    this.validateHovered = true
    this.renderControls()
  }

  private handleValidateOut() {
    this.validateHovered = false
    this.validatePressed = false
    this.renderControls()
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.validating || this.rerolling || this.drag || this.lines.length >= MAX_LINES) return

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

    const score = scoreCells(finalDrag.cells, this.board)
    const playedLine: PlayedLine = {
      start: finalDrag.start,
      end,
      cells: finalDrag.cells,
      score,
      rerollKey: this.rerollKeyForLine(finalDrag.start, end, finalDrag.cells, score),
      boardBefore: this.board.map((cell) => ({ ...cell })),
      dimensionSlotsBefore: [...this.cellDimensionSlots],
    }

    this.lines.push(playedLine)
    this.rerollUnplayedCells(playedLine.rerollKey, end)
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
    this.pulseNewLine(this.lines.length - 1)
  }

  private undo() {
    if (!this.undoEnabled()) return

    const removed = this.lines.pop()
    if (removed) {
      this.board = removed.boardBefore.map((cell) => ({ ...cell }))
      this.cellDimensionSlots = [...removed.dimensionSlotsBefore]
      this.refreshBoardCells()
    }
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
  }

  private validateRun() {
    if (this.undoHovered && this.undoEnabled()) {
      this.controlPulseGraphics.lineStyle(2, 0xffdf8e, 0.85)
      this.controlPulseGraphics.strokeCircle(UNDO_X, CONTROL_Y, 26)
    }
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
          rerollKeys: this.lines.map((line) => line.rerollKey).join(','),
          artDirection: 'solar-origami-v3',
        },
      })
      this.scene.pause()
    })
  }

  private pulseNewLine(index: number) {
    const end = this.lines[index]?.end
    if (!end) return
    const start = cellCenter(end)
    const target = { x: RESULT_POSITIONS[index], y: RESULT_Y }
    if (this.reducedMotion) { this.spawnArrival(index, target.x, target.y); return }
    const color = this.lineColorName(index)
    const sprite = this.add.image(start.x, start.y, this.transferTexture(index), `transfer-${color}-01`)
      .setDisplaySize(34, 17).setDepth(35)
    const progress = { value: 0 }
    this.tweens.add({
      targets: progress, value: 1, duration: 430, ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = progress.value
        const control = { x: (start.x + target.x) / 2, y: start.y + 48 }
        const oneMinus = 1 - t
        sprite.setPosition(
          oneMinus * oneMinus * start.x + 2 * oneMinus * t * control.x + t * t * target.x,
          oneMinus * oneMinus * start.y + 2 * oneMinus * t * control.y + t * t * target.y,
        ).setFrame(`transfer-${color}-${String(Math.min(8, Math.floor(t * 8) + 1)).padStart(2, '0')}`)
      },
      onComplete: () => { sprite.destroy(); this.spawnArrival(index, target.x, target.y) },
    })
  }

  private spawnArrival(index: number, x: number, y: number) {
    const color = this.lineColorName(index)
    const burst = this.add.image(x, y, ASSETS.arrivals[0], `arrival-${color}`).setDisplaySize(54, 54).setDepth(36)
    if (this.reducedMotion) { burst.setAlpha(0.75); this.time.delayedCall(90, () => burst.destroy()); return }
    burst.setScale(0.35)
    this.tweens.add({ targets: burst, scale: 1.25, alpha: 0, duration: 320, ease: 'Sine.easeOut', onComplete: () => burst.destroy() })
  }

  private flashInvalid(x: number, y: number) {
    // Invalid feedback stays local; no camera movement on a precision puzzle.
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

  private rerollKeyForLine(start: Point, end: Point, cells: Point[], score: number) {
    const rowStep = Math.sign(end.row - start.row)
    const colStep = Math.sign(end.col - start.col)
    const orderedValues = cells.map((point) => {
      const cell = this.board[point.row * GRID_SIZE + point.col]
      return `${cell.kind}:${cell.value}`
    }).join('|')

    return hashString(`dir:${rowStep},${colStep};cells:${orderedValues};score:${formatScore(score)}`)
  }

  private rerollUnplayedCells(rerollKey: number, anchor: Point) {
    const protectedCells = new Set(this.lines.flatMap((line) => line.cells.map(pointKey)))
    const random = mulberry32(rerollKey || 1)
    const nextBoard = this.board.map((cell, index) => {
      // Consume one deterministic candidate per board position so a key always maps
      // to the same 7x7 candidate field, independently from the protected cells.
      const candidate = createCell(random)
      const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
      return protectedCells.has(pointKey(point)) ? cell : candidate
    })
    const freeIndices = nextBoard
      .map((_cell, index) => index)
      .filter((index) => {
        const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
        return !protectedCells.has(pointKey(point))
      })
    if (!freeIndices.length) return

    // A short deterministic ripple starts near the line end. Cells fold to their edge,
    // swap dimension/value while hidden, then unfold. This keeps the board readable
    // while making the dimension change explicit without a simultaneous flash.
    const orderRandom = mulberry32((rerollKey ^ 0x9e3779b9) >>> 0)
    const ordered = freeIndices
      .map((index) => {
        const row = Math.floor(index / GRID_SIZE)
        const col = index % GRID_SIZE
        return { index, rank: Math.hypot(row - anchor.row, col - anchor.col) + orderRandom() * 0.7 }
      })
      .sort((a, b) => a.rank - b.rank)
      .map(({ index }) => index)
    const nextDimensionSlot = this.lines.length < MAX_LINES ? this.lines.length : -1
    const foldDuration = this.reducedMotion ? 24 : 52
    const unfoldDuration = this.reducedMotion ? 28 : 62
    const stagger = this.reducedMotion ? 1 : 4
    let remaining = ordered.length
    this.rerolling = true
    this.refreshPresentation()

    ordered.forEach((index, orderIndex) => {
      const fold = { value: 1 }
      this.tweens.add({
        targets: fold,
        value: 0.035,
        duration: foldDuration,
        delay: orderIndex * stagger,
        ease: 'Sine.easeIn',
        onUpdate: () => this.setCellFlip(index, fold.value),
        onComplete: () => {
          this.board[index] = nextBoard[index]
          this.cellDimensionSlots[index] = nextDimensionSlot
          this.refreshBoardCell(index)
          this.setCellFlip(index, 0.035)
          this.renderBoardOverlays()

          const unfold = { value: 0.035 }
          this.tweens.add({
            targets: unfold,
            value: 1,
            duration: unfoldDuration,
            ease: 'Sine.easeOut',
            onUpdate: () => this.setCellFlip(index, unfold.value),
            onComplete: () => {
              this.setCellFlip(index, 1)
              remaining -= 1
              if (remaining !== 0) return
              this.rerolling = false
              this.refreshPresentation()
            },
          })
        },
      })
    })
  }

  private setCellFlip(index: number, factor: number) {
    const widthFactor = Math.max(0.02, factor)
    const base = this.cellBaseImages[index]
    if (base) base.setScale(((CELL_SIZE - 2) / base.width) * widthFactor, (CELL_SIZE - 2) / base.height)
    const selection = this.cellSelectionImages[index]
    if (selection) selection.setScale(((CELL_SIZE + 5) / selection.width) * widthFactor, (CELL_SIZE + 5) / selection.height)
    this.cellGlyphs[index]?.container.setScale(widthFactor, 1)
  }

  private refreshBoardCell(index: number) {
    const cell = this.board[index]
    this.cellBaseImages[index]?.setTexture(ASSETS.cells[0], 'cell-neutral').setDisplaySize(CELL_SIZE - 2, CELL_SIZE - 2)
    const glyph = this.cellGlyphs[index]
    if (glyph) this.setGlyphDisplay(glyph, cell.label, cellGlyphHeight(cell), 0x071526)
  }

  private refreshBoardCells() {
    this.board.forEach((_cell, index) => {
      this.refreshBoardCell(index)
      this.setCellFlip(index, 1)
    })
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
    const usedBy = new Map<string, number[]>()
    this.lines.forEach((line, lineIndex) => {
      for (const point of line.cells) {
        const key = pointKey(point)
        usedBy.set(key, [...(usedBy.get(key) ?? []), lineIndex])
      }
    })

    const preview = new Set(this.drag?.cells.map(pointKey) ?? [])
    this.boardOverlayGraphics.clear()

    this.board.forEach((_cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const key = `${row}:${col}`
      const lineIndices = usedBy.get(key) ?? []
      const marker = this.cellSelectionImages[index]
      const base = this.cellBaseImages[index]
      let colorIndex = -1
      if (preview.has(key) && this.drag?.valid) colorIndex = this.lines.length
      else if (lineIndices.length) colorIndex = lineIndices[lineIndices.length - 1]
      // Free cells remain ivory. The next-line dimension is gameplay state, not a baked board wash.
      base.setFrame(colorIndex >= 0 ? `cell-selected-${this.lineColorName(colorIndex)}` : 'cell-neutral').setAlpha(1)

      const shared = lineIndices.length === 2
      const invalidPreview = preview.has(key) && !this.drag?.valid
      let frame = ''
      if (shared) frame = `node-shared-${this.lineColorName(lineIndices[0])}-${this.lineColorName(lineIndices[1])}`
      else if (invalidPreview) frame = 'node-hover'
      marker.setVisible(Boolean(frame)).setAlpha(shared ? 0.72 : 0.88)
      if (frame && this.textures.get(ASSETS.nodes[0]).has(frame)) marker.setFrame(frame)
    })
  }

  private renderLines() {
    this.lineGraphics.clear()
    const visible: Array<{ line: { start: Point; end: Point }; index: number; valid: boolean }> =
      this.lines.map((line, index) => ({ line, index, valid: true }))
    if (this.drag?.end) visible.push({ line: { start: this.drag.start, end: this.drag.end }, index: this.lines.length, valid: this.drag.valid })
    this.lineSegmentImages.forEach((segment, index) => {
      const item = visible[index]
      const arrow = this.lineArrowImages[index]
      if (!item) { segment.setVisible(false); arrow.setVisible(false); return }
      const start = cellCenter(item.line.start)
      const end = cellCenter(item.line.end)
      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.hypot(dx, dy)
      const angle = Math.atan2(dy, dx)
      const frame = item.valid ? `segment-${this.lineColorName(item.index)}` : 'segment-neutral'
      segment.setVisible(true).setFrame(frame).setPosition((start.x + end.x) / 2, (start.y + end.y) / 2)
        .setDisplaySize(length, 12).setRotation(angle).setTint(item.valid ? 0xffffff : ERROR)
      arrow.setVisible(true).setPosition(end.x, end.y).setDisplaySize(18, 18).setRotation(angle)
        .setTint(item.valid ? LINE_COLORS[Math.min(item.index, 2)] : ERROR).setTintMode(Phaser.TintModes.FILL)
    })
  }

  private renderLiveValue() {
    if (!this.drag?.cells.length) {
      this.liveContainer.setVisible(false)
      return
    }

    const valid = this.drag.valid
    const result = valid ? formatScore(scoreCells(this.drag.cells, this.board)) : '×'
    this.setGlyphDisplay(this.liveValue, valid ? `=${result}` : result, 24, valid ? 0x071526 : 0x6a1208)
    const width = Math.max(66, (valid ? result.length + 1 : 1) * 20 + 22)
    const height = 36
    this.liveBackground.clear()
    this.liveBackground.fillStyle(valid ? 0xf8efe8 : 0xffb0a0, 0.94)
    this.liveBackground.fillPoints([
      new Phaser.Math.Vector2(0, -height / 2), new Phaser.Math.Vector2(width / 2, 0),
      new Phaser.Math.Vector2(0, height / 2), new Phaser.Math.Vector2(-width / 2, 0),
    ], true)

    this.liveContainer.setPosition(STAGE_WIDTH / 2, BOARD_Y + BOARD_SIZE + 27).setVisible(true)
  }

  private renderHistory() {
    this.resultCrafts.forEach((craft, index) => {
      const line = this.lines[index]
      craft.setFrame(line ? `result-${index + 1}-active-${this.lineColorName(index)}` : `result-${index + 1}-inactive`)
        .setAlpha(line ? 1 : index === this.lines.length ? 0.92 : 0.58)
      this.resultValues[index].container.setVisible(Boolean(line))
      if (line) {
        const value = formatScore(line.score)
        this.setGlyphDisplay(
          this.resultValues[index], value, fittedScoreHeight(value, 19, 14, 11), RESULT_SCORE_COLORS[index],
        )
      }
    })
    const sunFrame = ['sun-neutral', 'sun-red', 'sun-red-violet', 'sun-final-tricolor'][this.lines.length]
    this.sun.setFrame(sunFrame)
    const total = formatScore(this.totalScore())
    this.setGlyphDisplay(this.totalValue, total, fittedScoreHeight(total, 29, 22, 18), 0x071526)
  }

  private renderControls() {
    const undoEnabled = this.undoEnabled()
    const validateEnabled = this.validateEnabled()



    this.undoButton
      .setFrame(this.undoPressed ? 'button-undo-pressed' : 'button-undo-normal')
      .setDisplaySize(this.undoPressed ? CONTROL_BUTTON_WIDTH - 6 : CONTROL_BUTTON_WIDTH, this.undoPressed ? CONTROL_BUTTON_SIZE - 3 : CONTROL_BUTTON_SIZE)
      .setTint(this.undoHovered && undoEnabled ? 0xffefff : 0xffffff)
      .setAlpha(undoEnabled ? 1 : 0.82)

    this.validateButton
      .setFrame(validateEnabled ? 'button-validate-ready' : 'button-validate-disabled')
      .setDisplaySize(this.validatePressed ? CONTROL_BUTTON_WIDTH - 6 : CONTROL_BUTTON_WIDTH, this.validatePressed ? CONTROL_BUTTON_SIZE - 3 : CONTROL_BUTTON_SIZE)
      .clearTint()
      .setAlpha(validateEnabled ? 1 : 0.78)
  }

  private renderAmbient(time: number) {
    this.ambientGraphics.clear()

    for (const star of this.ambientStars) {
      if (star.y > 112 && star.y < 780) continue
      const alpha = 0.10 + (Math.sin(star.phase + time * star.speed) + 1) * 0.18
      this.ambientGraphics.fillStyle(0xf8eee3, alpha)
      this.ambientGraphics.fillCircle(star.x, star.y, star.radius)
    }
  }

  private renderEnergy(time: number) {
    this.energyGraphics.clear()

    this.lines.forEach((_line, index) => {
      const start = new Phaser.Math.Vector2(RESULT_POSITIONS[index], RESULT_Y + RESULT_SIZES[index] * 0.38)
      const end = new Phaser.Math.Vector2(195, SUN_Y - SUN_SIZE * 0.42)
      const control = new Phaser.Math.Vector2(RESULT_POSITIONS[index] + (index - 1) * 22, 570)
      const curve = new Phaser.Curves.QuadraticBezier(start, control, end)
      const color = LINE_COLORS[index]
      const points = curve.getPoints(24)
      this.energyGraphics.lineStyle(10, color, 0.08).strokePoints(points)
      this.energyGraphics.lineStyle(4, color, 0.44).strokePoints(points)
      this.energyGraphics.lineStyle(1.2, 0xffffff, 0.62).strokePoints(points)
      const travel = this.reducedMotion ? 0.72 : (time * 0.00025 + index * 0.31) % 1
      const point = curve.getPoint(travel)
      const tangent = curve.getTangent(travel)
      const shard = this.flowShards[index]
      const frame = `transfer-${this.lineColorName(index)}-${String(Math.min(8, Math.floor(travel * 8) + 1)).padStart(2, '0')}`
      shard.setVisible(true).setFrame(frame).setPosition(point.x, point.y).setRotation(Math.atan2(tangent.y, tangent.x))
    })
    for (let index = this.lines.length; index < this.flowShards.length; index += 1) this.flowShards[index].setVisible(false)
  }

  private renderControlPulse(time: number) {
    this.controlPulseGraphics.clear()

    if (this.undoHovered && this.undoEnabled()) {
      this.controlPulseGraphics.lineStyle(2, 0xa54dff, 0.55)
      this.controlPulseGraphics.strokeRoundedRect(UNDO_X - CONTROL_BUTTON_WIDTH / 2, CONTROL_Y - CONTROL_BUTTON_SIZE / 2, CONTROL_BUTTON_WIDTH, CONTROL_BUTTON_SIZE, 10)
    }
    if (!this.validateEnabled()) return

    this.validateButton.setAlpha(this.reducedMotion ? 1 : 0.96 + Math.sin(time * 0.003) * 0.04)
  }
}
