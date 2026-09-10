import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'
import { OrbitalImageFile, artFrame, fitText, centerTextInk } from './orbitalArt'

export const LINEFUGG_SCENE_KEY = 'linefugg-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const GRID_SIZE = 7
const MAX_LINES = 3
const MAX_LINE_CELLS = 5
const GAME_ID = 'linefugg'

// Fixed logical composition. Generated grid spacing is never used for hit testing.
const BOARD_X = 34
const BOARD_Y = 155
const BOARD_SIZE = 322
const CELL_SIZE = BOARD_SIZE / GRID_SIZE
const BOARD_CENTER_X = BOARD_X + BOARD_SIZE / 2
const BOARD_CENTER_Y = BOARD_Y + BOARD_SIZE / 2

const HISTORY_Y = 520
const HISTORY_ROW_HEIGHT = 49
const TOTAL_Y = 698
const CONTROL_Y = 776
const CONTROL_BUTTON_SIZE = 72
// Shared canonical lower-console geometry, matched to DA2.
const INDICATOR_CENTERS = [137, 195, 253]
const INDICATOR_Y = CONTROL_Y - 12
const PIP_Y = CONTROL_Y + 15
const UNDO_X = 63
const VALIDATE_X = 327

const ASSET_ROOT = '/assets/imported/linefugg'

const ASSETS = {
  boardPanel: ['linefugg-orbital-board', `${ASSET_ROOT}/ui/orbital-board.png`],
  armillary: ['linefugg-armillary', `${ASSET_ROOT}/props/orbital-armillary-key.png`],
  cellMultiply: ['linefugg-orbital-cell-multiply', `${ASSET_ROOT}/ui/orbital-cell-multiply-v3.png`],
  cellDivide: ['linefugg-orbital-cell-divide', `${ASSET_ROOT}/ui/orbital-cell-divide-v3.png`],
  validateReady: ['linefugg-validate-ready', `${ASSET_ROOT}/ui/orbital-validate-ready-v5.png`],
  validateDisabled: ['linefugg-validate-disabled', `${ASSET_ROOT}/ui/orbital-validate-disabled-v5.png`],
  validateAmber: ['linefugg-validate-amber', '/assets/generated/linefugg/ui/validate-amber-source.png'],
  indicators: ['linefugg-glass-indicators', '/assets/generated/linefugg/ui/glass-indicators.png'],
  ledgerDecor: ['linefugg-ledger-decor', `${ASSET_ROOT}/ui/orbital-history-row-v5.png`],
  console: ['linefugg-accounting-panels', '/assets/generated/linefugg/ui/accounting-panels.png'],
} as const

const INK_NAVY = 0x061424
const BRASS_LIGHT = 0xd9a24a
const PARCHMENT_LIGHT = 0xf3e3bd
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

type HistoryRow = {
  container: Phaser.GameObjects.Container
  arrow: Phaser.GameObjects.Text
  tiles: Phaser.GameObjects.Image[]
  values: Phaser.GameObjects.Text[]
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
  private indicatorOrbs: Phaser.GameObjects.Image[] = []
  private indicatorPips: Phaser.GameObjects.Image[][] = []
  private controlPulseGraphics!: Phaser.GameObjects.Graphics

  private cellTexts: Phaser.GameObjects.Text[] = []
  private cellBaseImages: Phaser.GameObjects.Image[] = []
  private cellMaterialImages: Phaser.GameObjects.Image[] = []
  private cellDimensionSlots: number[] = []
  private rerolling = false
  private ambientStars: AmbientStar[] = []

  private liveContainer!: Phaser.GameObjects.Container
  private liveBackground!: Phaser.GameObjects.Graphics
  private liveText!: Phaser.GameObjects.Text

  private historyRows: HistoryRow[] = []
  private undoIcon!: Phaser.GameObjects.Text
  private validateAmber!: Phaser.GameObjects.Image
  private validateHovered = false
  private totalText!: Phaser.GameObjects.Text

  private undoButton!: Phaser.GameObjects.Image
  private validateButton!: Phaser.GameObjects.Image
  private reducedMotion = false
  private motionQuery: MediaQueryList | null = null
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter
  private orbitRing?: Phaser.GameObjects.Image
  private satellites: Phaser.GameObjects.Image[] = []
  private effectTime = 0
  private stateReader = () => JSON.stringify({
    game: GAME_ID, coordinateSystem: '390x844; origin top-left; x right, y down',
    boardId: this.dayId, board: this.board, boardBounds: { x: BOARD_X, y: BOARD_Y, size: BOARD_SIZE },
    lines: this.lines.map((line) => ({
      start: line.start, end: line.end, cells: line.cells, score: line.score, rerollKey: line.rerollKey,
    })), total: this.totalScore(), drag: this.drag,
    rerolling: this.rerolling, dimensionSlots: this.cellDimensionSlots,
    validating: this.validating, finished: this.finished,
    undoHovered: this.undoHovered, validateHovered: this.validateHovered, validateAppearance: !this.validateEnabled() ? "disabled" : this.validateHovered ? "amber" : "green", undoEnabled: this.undoEnabled(), validateEnabled: this.validateEnabled(),
    controls: { undo: { x: UNDO_X, y: CONTROL_Y }, validate: { x: VALIDATE_X, y: CONTROL_Y } },
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
    this.load.maxParallelDownloads = 2
    Object.entries(ASSETS).forEach(([name, [key, url]]) => {
      if (!this.textures.exists(key)) this.load.addFile(new OrbitalImageFile(this.load, key, url, /undo|validate/i.test(name) ? 256 : 1024))
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
      Object.assign(window, { render_game_to_text: this.stateReader })
    }
  }

  update(_time: number, delta: number) {
    if (!this.reducedMotion) this.effectTime += Math.min(delta, 50)
    this.renderAmbient(this.effectTime)
    this.renderEnergy(this.effectTime)
    this.renderControlPulse(this.effectTime)
    const phase = this.effectTime * 0.00018
    if (this.orbitRing) this.orbitRing.angle = Math.sin(phase * 0.45) * 3
    this.satellites.forEach((satellite, i) => {
      const angle = phase + i * Math.PI
      satellite.setPosition(195 + Math.cos(angle) * 107, 73 + Math.sin(angle) * 35)
        .setDepth(Math.sin(angle) > 0 ? 5 : 3)
    })
  }

  private handleMotionChange = (event: MediaQueryListEvent) => { this.reducedMotion = event.matches }

  private resetRunState() {
    this.dayId = currentUtcDayId()
    this.board = createBoard(hashString(`${GAME_ID}:${this.dayId}`))
    this.lines = []
    this.drag = null
    this.finished = false
    this.validating = false
    this.undoHovered = false
    this.validateHovered = false
    this.indicatorOrbs = []
    this.indicatorPips = []
    this.undoPressed = false
    this.validatePressed = false
    this.cellTexts = []
    this.cellBaseImages = []
    this.cellMaterialImages = []
    this.cellDimensionSlots = Array(GRID_SIZE * GRID_SIZE).fill(0)
    this.rerolling = false
    this.historyRows = []
    this.satellites = []
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
    // The illustrated observatory backdrop is CSS-owned by LineFugg.tsx so it can
    // cover/crop inside the Core game surface independently of the fixed 390x844 stage.
    // Keep Phaser transparent here: no second copy, no seams, no accidental contain-fit.
    this.ambientGraphics = this.add.graphics().setDepth(3)
    if (!this.textures.exists('linefugg-spark')) {
      const stamp = this.make.graphics({ x: 0, y: 0 })
      stamp.fillStyle(0xffffff).fillCircle(4, 4, 2)
      stamp.generateTexture('linefugg-spark', 8, 8)
      stamp.destroy()
    }
    this.sparks = this.add.particles(0, 0, 'linefugg-spark', {
      emitting: false, lifespan: { min: 240, max: 480 }, speed: { min: 12, max: 45 },
      scale: { start: 0.8, end: 0 }, alpha: { start: 0.65, end: 0 },
      maxParticles: 32, maxAliveParticles: 24, blendMode: Phaser.BlendModes.ADD,
    }).setDepth(24)
    // Color key is a native Phaser 4 filter on small object-local areas only.
    // Canvas fallback omits this optional ornament instead of showing magenta.
    if (this.renderer.type === Phaser.WEBGL) {
      const key = ASSETS.armillary[0]
      artFrame(this, key, 'ring', [64, 175, 1052, 510], 1774)
      artFrame(this, key, 'globe', [1298, 220, 403, 400], 1774)
      const piece = (frame: string, x: number, y: number, width: number) => {
        const object = this.add.image(x, y, key, frame)
        object.setScale(width / object.width).setDepth(4)
        object.enableFilters()
        object.filters?.internal.addKey({ color: '#ff00ff', alpha: 1, threshold: 0.72, feather: 0.14 })
        return object
      }
      this.orbitRing = piece('ring', 195, 73, 282)
      piece('globe', 195, 73, 58).setDepth(5)
      this.satellites = [piece('globe', 88, 73, 19), piece('globe', 302, 73, 12)]
    }
  }

  private createBoardObjects() {
    const [boardKey] = ASSETS.boardPanel

    // Authored brass pieces surround exact engine geometry. No stretched baked grid.
    const piece = (name: string, rect: readonly number[], x: number, y: number, width: number, height: number) => {
      const frame = artFrame(this, boardKey, name, rect, 1254)
      return this.add.image(x, y, boardKey, frame).setDisplaySize(width, height).setDepth(8)
    }
    piece('rail-top', [171, 66, 912, 68], BOARD_CENTER_X, BOARD_Y - 11, BOARD_SIZE, 24)
    piece('rail-bottom', [171, 1115, 912, 64], BOARD_CENTER_X, BOARD_Y + BOARD_SIZE + 11, BOARD_SIZE, 24)
    piece('rail-left', [84, 150, 75, 952], BOARD_X - 12, BOARD_CENTER_Y, 25, BOARD_SIZE)
    piece('rail-right', [1095, 150, 75, 952], BOARD_X + BOARD_SIZE + 12, BOARD_CENTER_Y, 25, BOARD_SIZE)
    const corners = [
      { rect: [54, 44, 123, 115], x: BOARD_X - 9, y: BOARD_Y - 9 },
      { rect: [1078, 44, 123, 115], x: BOARD_X + BOARD_SIZE + 9, y: BOARD_Y - 9 },
      { rect: [54, 1082, 123, 115], x: BOARD_X - 9, y: BOARD_Y + BOARD_SIZE + 9 },
      { rect: [1078, 1082, 123, 115], x: BOARD_X + BOARD_SIZE + 9, y: BOARD_Y + BOARD_SIZE + 9 },
    ]
    corners.forEach((corner, index) => piece(`corner-${index}`, corner.rect, corner.x, corner.y, 43, 40))
    const tileFrame = artFrame(this, boardKey, 'enamel-cell', [158, 133, 139, 142], 1254)
    this.cellBaseImages = this.board.map((_cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      return this.add.image(position.x, position.y, boardKey, tileFrame)
        .setDisplaySize(CELL_SIZE, CELL_SIZE).setDepth(9)
    })

    this.cellMaterialImages = this.board.map((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const key = cell.kind === 'divide' ? ASSETS.cellDivide[0] : ASSETS.cellMultiply[0]
      return this.add.image(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        key,
      ).setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4).setDepth(10).setVisible(cell.kind !== 'add')
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
          fontSize: '26px',
          resolution: 2,
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
    const key = ASSETS.console[0]
    const panel = artFrame(this, key, 'ledger', [92, 8, 1354, 491], 1536)
    this.add.image(195, HISTORY_Y + 73.5, key, panel).setDisplaySize(342, 153).setDepth(40)
    const decorKey = ASSETS.ledgerDecor[0]
    const leftDecor = artFrame(this, decorKey, 'left-ornament', [8, 167, 235, 367], 2172)
    const rightDecor = artFrame(this, decorKey, 'right-ornament', [1928, 167, 235, 367], 2172)
    for (let index = 0; index < MAX_LINES; index++) {
      const y = HISTORY_Y + HISTORY_ROW_HEIGHT / 2 + index * HISTORY_ROW_HEIGHT
      this.add.image(25, y, decorKey, leftDecor).setDisplaySize(26, 41).setDepth(41)
      this.add.image(365, y, decorKey, rightDecor).setDisplaySize(26, 41).setDepth(41)
    }
    const cellKey = ASSETS.boardPanel[0]
    const chipFrame = artFrame(this, cellKey, 'ledger-chip', [158, 133, 139, 142], 1254)
    for (let index = 0; index < MAX_LINES; index++) {
      const y = HISTORY_Y + HISTORY_ROW_HEIGHT / 2 + index * HISTORY_ROW_HEIGHT
      const container = this.add.container(0, y).setDepth(42)
      const arrow = this.add.text(48, 0, '➜', {
        fontFamily: 'Georgia, serif', fontSize: '26px', fontStyle: 'bold',
        color: LINE_COLOR_STRINGS[index], stroke: '#5c341d', strokeThickness: 0.5, resolution: 2,
      }).setOrigin(0.5)
      const tiles: Phaser.GameObjects.Image[] = []
      const values: Phaser.GameObjects.Text[] = []
      for (let slot = 0; slot < MAX_LINE_CELLS; slot++) {
        const x = 83 + slot * 34
        const tile = this.add.image(x, 0, cellKey, chipFrame).setDisplaySize(31, 32).setVisible(false)
        const value = this.add.text(x, 0, '', {
          fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f5e6c1', resolution: 2,
        }).setOrigin(0.5)
        container.add([tile, value]); tiles.push(tile); values.push(value)
      }
      const score = this.add.text(345, 0, '', {
        fontFamily: 'Georgia, serif', fontSize: '22px', fontStyle: 'bold', color: '#21170d', resolution: 2,
      }).setOrigin(1, 0.5)
      container.add([arrow, score])
      this.historyRows.push({ container, arrow, tiles, values, score })
    }
    const totalFrame = artFrame(this, key, 'total', [80, 518, 1376, 176], 1536)
    this.add.image(195, TOTAL_Y, key, totalFrame).setDisplaySize(342, 49).setDepth(40)
    const sigma = this.add.text(151, TOTAL_Y, 'Σ', {
      fontFamily: 'Georgia, serif', fontSize: '34px', color: '#f5e5b9', resolution: 2,
    }).setOrigin(0.5).setDepth(42)
    centerTextInk(sigma)
    this.totalText = this.add.text(226, TOTAL_Y, '0', {
      fontFamily: 'Georgia, serif', fontSize: '34px', color: '#f5e5b9', resolution: 2,
    }).setOrigin(0.5).setDepth(42)
  }

  private createControls() {
    const key = ASSETS.console[0]
    const dock = artFrame(this, key, 'dock', [116, 724, 570, 249], 1536)
    this.add.image(195, CONTROL_Y, key, dock).setDisplaySize(194, 72).setDepth(44)
    this.createGlassIndicators()
    this.controlPulseGraphics = this.add.graphics().setDepth(47)
    const button = (x: number, name: string, rect: number[]) => {
      const frame = artFrame(this, key, name, rect, 1536)
      const source = this.textures.getFrame(key, frame)
      const image = this.add.image(x, CONTROL_Y, key, frame)
        .setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE).setDepth(48)
        .setInteractive(new Phaser.Geom.Circle(source.width / 2, source.height / 2, Math.min(source.width, source.height) / 2), Phaser.Geom.Circle.Contains)
      if (image.input) image.input.cursor = 'pointer'
      const mask = this.make.graphics({ x: 0, y: 0 })
      mask.fillStyle(0xffffff).fillCircle(x, CONTROL_Y, CONTROL_BUTTON_SIZE / 2)
      image.setMask(mask.createGeometryMask())
      this.events.once('shutdown', () => mask.destroy())
      this.events.once('destroy', () => mask.destroy())
      return image
    }
    this.undoButton = button(UNDO_X, 'undo', [761, 714, 274, 272])
    this.validateButton = this.add.image(VALIDATE_X, CONTROL_Y, ASSETS.validateDisabled[0])
      .setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE).setDepth(48)
      .setInteractive({ useHandCursor: true })
    const amberFrame = artFrame(this, ASSETS.validateAmber[0], 'amber-glass', [252, 250, 748, 748], 1254)
    this.validateAmber = this.add.image(VALIDATE_X, CONTROL_Y, ASSETS.validateAmber[0], amberFrame)
      .setDisplaySize(43, 43).setDepth(49).setVisible(false)
    const amberMask = this.make.graphics({ x: 0, y: 0 })
    amberMask.fillStyle(0xffffff).fillCircle(VALIDATE_X, CONTROL_Y, 21.5)
    this.validateAmber.setMask(amberMask.createGeometryMask())
    this.events.once('shutdown', () => amberMask.destroy())
    this.events.once('destroy', () => amberMask.destroy())
    this.undoIcon = this.add.text(UNDO_X, CONTROL_Y - 1, '↶', {
      fontFamily: 'Arial, sans-serif', fontSize: '51px', fontStyle: 'bold', color: '#fff0c8', resolution: 2,
    }).setOrigin(0.5).setDepth(49)
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
    const debugWindow = window as Window & { render_game_to_text?: () => string }
    if (debugWindow.render_game_to_text === this.stateReader) delete debugWindow.render_game_to_text
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
      this.controlPulseGraphics.strokeCircle(UNDO_X, CONTROL_Y, 38)
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
      this.controlPulseGraphics.strokeCircle(UNDO_X, CONTROL_Y, 38)
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
          artDirection: 'orbital-accounting',
        },
      })
      this.scene.pause()
    })
  }

  private pulseNewLine(index: number) {
    const row = this.historyRows[index]
    if (!row) return

    if (this.reducedMotion) return
    this.tweens.killTweensOf(row.container)
    row.container.setX(-5).setAlpha(0.5)
    this.tweens.add({ targets: row.container, x: 0, alpha: 1, duration: 180, ease: 'Sine.easeOut' })
    const end = this.lines[index]?.end
    if (end) {
      const position = cellCenter(end)
      this.sparks.setParticleTint(LINE_COLORS[index])
      this.sparks.explode(9, position.x, position.y)
    }

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
    if (base) base.setScale((CELL_SIZE / base.width) * widthFactor, CELL_SIZE / base.height)
    const material = this.cellMaterialImages[index]
    if (material) material.setScale(((CELL_SIZE - 4) / material.width) * widthFactor, (CELL_SIZE - 4) / material.height)
    const text = this.cellTexts[index]
    if (text) text.setScale(widthFactor, 1)
  }

  private refreshBoardCell(index: number) {
    const cell = this.board[index]
    const material = this.cellMaterialImages[index]
    if (material) {
      if (cell.kind === 'add') material.setVisible(false)
      else material
        .setTexture(cell.kind === 'multiply' ? ASSETS.cellMultiply[0] : ASSETS.cellDivide[0])
        .setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4)
        .setVisible(true)
    }

    const text = this.cellTexts[index]
    if (!text) return
    const color = cell.kind === 'multiply'
      ? '#fff1c9'
      : cell.kind === 'divide'
        ? '#f9ebff'
        : '#f5e6c1'
    text.setText(cell.label).setColor(color)
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
      const dimensionSlot = this.cellDimensionSlots[index] ?? -1

      if (_cell.kind === 'add' && useCount === 0 && dimensionSlot >= 0 && dimensionSlot < MAX_LINES) {
        // Use the exact RGB of the active line. The stronger translucent enamel wash
        // keeps the cell artwork readable while making the current dimension unmistakable.
        const activeLineColor = LINE_COLORS[dimensionSlot]
        this.boardOverlayGraphics.fillStyle(activeLineColor, 0.30)
        this.boardOverlayGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
        this.boardOverlayGraphics.lineStyle(1.25, activeLineColor, 0.42)
        this.boardOverlayGraphics.strokeRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
      }

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
    this.lineGraphics.fillStyle(color, 0.08 * alpha)
    this.lineGraphics.fillCircle(x, y, 21)
    this.lineGraphics.lineStyle(6, color, 0.16 * alpha)
    this.lineGraphics.strokeCircle(x, y, 16)
    this.lineGraphics.lineStyle(1.7, color, alpha)
    this.lineGraphics.strokeCircle(x, y, 16)
    this.lineGraphics.lineStyle(1, 0xffedbe, 0.65 * alpha)
    this.lineGraphics.strokeCircle(x, y, 18)
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
      row.arrow.setAlpha(line ? 1 : index === this.lines.length ? 0.75 : 0.35)
      row.tiles.forEach((tile, slot) => {
        const point = line?.cells[slot]
        tile.setVisible(Boolean(point))
        const value = row.values[slot]
        if (!point) { value.setText(''); return }
        const cell = this.board[point.row * GRID_SIZE + point.col]
        if (cell.kind === 'multiply') tile.setTexture(ASSETS.cellMultiply[0])
        else if (cell.kind === 'divide') tile.setTexture(ASSETS.cellDivide[0])
        else tile.setTexture(ASSETS.boardPanel[0], 'ledger-chip')
        tile.clearTint().setDisplaySize(31, 32)
        value.setText(slot > 0 && cell.kind === 'add' && cell.value > 0 ? `+${cell.value}` : cell.label)
        fitText(value, 27)
      })
      row.score.setText(line ? `= ${formatScore(line.score)}` : '')
      fitText(row.score, 94)
    })
    this.totalText.setText(formatScore(this.totalScore()))
    fitText(this.totalText, 112)
    centerTextInk(this.totalText)
  }

  private renderControls() {
    const undoEnabled = this.undoEnabled()
    const validateEnabled = this.validateEnabled()



    this.undoButton
      .setDisplaySize(this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE)
      .setTint(undoEnabled ? this.undoHovered ? 0xffdd8b : 0xffffff : 0x807569)
      .setAlpha(undoEnabled ? 1 : 0.72)

    this.validateButton
      .setTexture(validateEnabled ? ASSETS.validateReady[0] : ASSETS.validateDisabled[0])
      .setDisplaySize(this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE)
      .clearTint().setAlpha(1)

    this.undoIcon.setAlpha(undoEnabled ? 1 : 0.45).setAngle(this.undoHovered && undoEnabled ? -12 : 0)
    this.validateAmber.setVisible(validateEnabled && this.validateHovered).setDisplaySize(this.validatePressed ? 39.4 : 43, this.validatePressed ? 39.4 : 43)
    this.renderIndicators()
  }

  private createGlassIndicators() {
    const key = ASSETS.indicators[0]
    const maskArt = this.make.graphics({ x: 0, y: 0 })
    maskArt.fillStyle(0xffffff)
    const mask = maskArt.createGeometryMask()
    for (let index = 0; index < MAX_LINES; index++) {
      const x = INDICATOR_CENTERS[index]
      const sourceX = [82, 460, 838][index]
      const orb = artFrame(this, key, `orb-${index}`, [sourceX, 312, 338, 338], 1254)
      const bead = artFrame(this, key, `bead-${index}`, [[167, 543, 921][index], 774, 168, 168], 1254)
      maskArt.fillCircle(x, INDICATOR_Y, 16)
      this.indicatorOrbs.push(this.add.image(x, INDICATOR_Y, key, orb)
        .setDisplaySize(32, 32).setDepth(47).setMask(mask))
      const pips: Phaser.GameObjects.Image[] = []
      for (let pip = 0; pip < MAX_LINE_CELLS; pip++) {
        const px = x + (pip - 2) * 8
        maskArt.fillCircle(px, PIP_Y, 3.7)
        pips.push(this.add.image(px, PIP_Y, key, bead).setDisplaySize(7.4, 7.4).setDepth(47).setMask(mask))
      }
      this.indicatorPips.push(pips)
    }
    this.events.once('shutdown', () => maskArt.destroy())
    this.events.once('destroy', () => maskArt.destroy())
  }

  private renderIndicators() {
    for (let index = 0; index < MAX_LINES; index++) {
      const line = this.lines[index]
      const previewLine = this.drag && this.lines.length === index ? this.drag : null
      const lit = line?.cells.length ?? previewLine?.cells.length ?? 0
      const occupied = Boolean(line || previewLine)
      const next = !occupied && index === this.lines.length && this.lines.length < MAX_LINES
      this.indicatorOrbs[index].setAlpha(occupied ? 1 : next ? 0.7 : 0.38)
      this.indicatorPips[index].forEach((pip, n) => pip.setAlpha(n < lit ? 1 : 0.22))
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
    // Slow traveling brass reflection, away from cell contents. No full-screen FX.
    if (!this.reducedMotion) {
      const phase = (time * 0.00008) % 1
      const x = BOARD_X + BOARD_SIZE * phase
      const y = BOARD_Y - 13
      const alpha = Math.sin(phase * Math.PI) * 0.5
      this.energyGraphics.lineStyle(1, PARCHMENT_LIGHT, alpha)
      this.energyGraphics.lineBetween(x - 7, y, x + 7, y)
      this.energyGraphics.lineBetween(x, y - 3, x, y + 3)
    }
  }

  private renderControlPulse(time: number) {
    this.controlPulseGraphics.clear()

    if (this.undoHovered && this.undoEnabled()) {
      this.controlPulseGraphics.lineStyle(2, 0xffdf8e, 0.85)
      this.controlPulseGraphics.strokeCircle(UNDO_X, CONTROL_Y, 38)
    }
    if (!this.validateEnabled()) return

    // Let the authored glass carry the light; no flat rings over the artwork.
    this.validateButton.setAlpha(this.reducedMotion ? 1 : 0.96 + Math.sin(time * 0.003) * 0.04)
  }
}
