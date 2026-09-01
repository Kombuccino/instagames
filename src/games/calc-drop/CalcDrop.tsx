import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import './CalcDrop.css'

type TileKind = 'number' | 'multiply' | 'divide' | 'reverse'
type BonusKind = 'reverse' | 'multiply4' | 'multiply6'
type ShapeId = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

type Tile = {
  kind: TileKind
  value: number
  label: string
  bonus?: BonusKind
}

type Coord = {
  x: number
  y: number
}

type Piece = {
  shape: ShapeId
  rotation: number
  x: number
  y: number
  tokens: Tile[]
}

type LineReport = {
  formula: string
  value: number
  points: number
  theoreticalMax: number
  reversed: boolean
}

type GameState = {
  seed: number
  board: Array<Array<Tile | null>>
  active: Piece
  pieceIndex: number
  score: number
  level: number
  stageProgress: number
  lines: number
  lockTicks: number
  lockResets: number
  gameOver: boolean
  clearSerial: number
  lastClear: {
    id: number
    text: string
  } | null
}

type Action =
  | { type: 'RESET'; seed: number }
  | { type: 'TICK' }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ROTATE'; direction: -1 | 1 }

type ShapeDefinition = {
  cells: Coord[]
  pivot: Coord
  rotates?: boolean
}

const COLS = 10
const ROWS = 20
const TARGET = 100_000
const MAX_NUMBER = 9
const BASE_MAX_MULTIPLIER = 3
const LOCK_TICKS = 4
const MAX_LOCK_RESETS = 12
const STANDARD_LINE_MAX = MAX_NUMBER * (BASE_MAX_MULTIPLIER ** (COLS - 1))

const SHAPES: Record<ShapeId, ShapeDefinition> = {
  I: { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], pivot: { x: 1.5, y: 1.5 } },
  O: { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1.5, y: 0.5 }, rotates: false },
  T: { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 0 }], pivot: { x: 1, y: 1 } },
  S: { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], pivot: { x: 1, y: 1 } },
  Z: { cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
  J: { cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
  L: { cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], pivot: { x: 1, y: 1 } },
}

const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[]

const BONUS_LABELS: Record<BonusKind, string> = {
  reverse: '⇄',
  multiply4: '×4',
  multiply6: '×6',
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

function seededShuffle<T>(items: T[], seed: number) {
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
  const bag = seededShuffle(SHAPE_IDS, (seed ^ Math.imul(bagIndex + 1, 0x45d9f3b)) >>> 0)
  return bag[withinBag]
}

function tokenFor(random: () => number, level: number): Tile {
  const operatorChance = Math.min(0.42, 0.24 + (level - 1) * 0.018)
  const roll = random()

  if (roll > operatorChance) {
    const value = Math.floor(random() * 10)
    return { kind: 'number', value, label: String(value) }
  }

  const isMultiply = random() < 0.68
  const value = random() < 0.72 ? 2 : 3
  return {
    kind: isMultiply ? 'multiply' : 'divide',
    value,
    label: `${isMultiply ? '×' : '÷'}${value}`,
  }
}

function bonusTile(kind: BonusKind): Tile {
  if (kind === 'reverse') return { kind: 'reverse', value: 0, label: BONUS_LABELS[kind], bonus: kind }
  const value = kind === 'multiply4' ? 4 : 6
  return { kind: 'multiply', value, label: BONUS_LABELS[kind], bonus: kind }
}

function bonusForClear(lineCount: number): BonusKind | null {
  if (lineCount >= 4) return 'multiply6'
  if (lineCount === 3) return 'multiply4'
  if (lineCount === 2) return 'reverse'
  return null
}

function createPiece(seed: number, index: number, level: number, bonus: BonusKind | null = null): Piece {
  const shape = shapeForIndex(seed, index)
  const random = mulberry32((seed ^ Math.imul(index + 17, 0x27d4eb2d) ^ Math.imul(level, 0x165667b1)) >>> 0)
  const tokens = Array.from({ length: 4 }, () => tokenFor(random, level))

  if (bonus) {
    const bonusIndex = Math.floor(random() * tokens.length)
    tokens[bonusIndex] = bonusTile(bonus)
  }

  return {
    shape,
    rotation: 0,
    x: 3,
    y: -1,
    tokens,
  }
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array<Tile | null>(COLS).fill(null))
}

function rotateCoord(coord: Coord, pivot: Coord, direction: -1 | 1) {
  const dx = coord.x - pivot.x
  const dy = coord.y - pivot.y
  const x = direction === 1 ? pivot.x - dy : pivot.x + dy
  const y = direction === 1 ? pivot.y + dx : pivot.y - dx
  return { x: Math.round(x), y: Math.round(y) }
}

function pieceCells(piece: Piece) {
  const definition = SHAPES[piece.shape]
  let coords = definition.cells.map((cell) => ({ ...cell }))
  if (definition.rotates !== false) {
    const turns = ((piece.rotation % 4) + 4) % 4
    for (let turn = 0; turn < turns; turn += 1) {
      coords = coords.map((coord) => rotateCoord(coord, definition.pivot, 1))
    }
  }
  return coords.map((coord, tokenIndex) => ({
    x: piece.x + coord.x,
    y: piece.y + coord.y,
    tokenIndex,
  }))
}

function canPlace(board: GameState['board'], piece: Piece) {
  return pieceCells(piece).every(({ x, y }) => {
    if (x < 0 || x >= COLS || y >= ROWS) return false
    if (y < 0) return true
    return board[y][x] === null
  })
}

function isGrounded(board: GameState['board'], piece: Piece) {
  return !canPlace(board, { ...piece, y: piece.y + 1 })
}

function formatValue(value: number) {
  if (Number.isInteger(value)) return value.toLocaleString('fr-FR')
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')
}

function theoreticalMaxForRow(row: Tile[]) {
  const reverseCount = row.filter((tile) => tile.kind === 'reverse').length
  const arithmeticSlots = Math.max(0, row.length - reverseCount)
  if (arithmeticSlots === 0) return 0

  const strongMultipliers = row
    .filter((tile) => tile.kind === 'multiply' && tile.value > BASE_MAX_MULTIPLIER)
    .map((tile) => tile.value)
    .sort((a, b) => b - a)
    .slice(0, Math.max(0, arithmeticSlots - 1))

  const normalMultiplierSlots = Math.max(0, arithmeticSlots - 1 - strongMultipliers.length)
  return Math.round(
    MAX_NUMBER
    * strongMultipliers.reduce((product, multiplier) => product * multiplier, 1)
    * (BASE_MAX_MULTIPLIER ** normalMultiplierSlots),
  )
}

function evaluateRow(row: Tile[]): LineReport {
  const reversed = row.some((tile) => tile.kind === 'reverse')
  const ordered = reversed ? [...row].reverse() : row
  const theoreticalMax = theoreticalMaxForRow(row)
  let value = 0

  for (const tile of ordered) {
    if (tile.kind === 'reverse') continue
    if (tile.kind === 'number') value += tile.value
    if (tile.kind === 'multiply') value *= tile.value
    if (tile.kind === 'divide') value /= tile.value
    value = Math.min(theoreticalMax, Math.max(0, value))
  }

  const points = Math.max(0, Math.round(value))
  const formulaBody = ordered
    .filter((tile) => tile.kind !== 'reverse')
    .map((tile) => tile.kind === 'number' ? `+${tile.label}` : tile.label)
    .join(' ')
  const formula = `${reversed ? '←' : '→'} 0 ${formulaBody}${reversed ? ' · ⇄' : ''}`
  return { formula, value, points, theoreticalMax, reversed }
}

function summariseClear(reports: LineReport[], bonus: BonusKind | null) {
  const bonusCopy = bonus ? ` · BONUS ${BONUS_LABELS[bonus]} → PIÈCE SUIVANTE` : ''
  if (reports.length === 1) {
    const report = reports[0]
    return `${report.formula} = ${formatValue(report.value)}${bonusCopy}`
  }
  const total = reports.reduce((sum, report) => sum + report.points, 0)
  return `${reports.length} LIGNES · ${reports.map((report) => formatValue(report.value)).join(' + ')} = ${total.toLocaleString('fr-FR')}${bonusCopy}`
}

function advanceProgress(progress: number, level: number, gained: number) {
  let nextProgress = progress + gained
  let nextLevel = level
  while (nextProgress >= TARGET) {
    nextProgress -= TARGET
    nextLevel += 1
  }
  return { progress: nextProgress, level: nextLevel }
}

function lockPiece(state: GameState): GameState {
  const board = state.board.map((row) => [...row])
  let toppedOut = false

  for (const { x, y, tokenIndex } of pieceCells(state.active)) {
    if (y < 0) {
      toppedOut = true
      continue
    }
    board[y][x] = state.active.tokens[tokenIndex]
  }

  if (toppedOut) return { ...state, board, gameOver: true }

  const fullRows: number[] = []
  const reports: LineReport[] = []
  board.forEach((row, rowIndex) => {
    if (row.every((cell) => cell !== null)) {
      fullRows.push(rowIndex)
      reports.push(evaluateRow(row as Tile[]))
    }
  })

  const clearedBoard = fullRows.length > 0
    ? [
        ...Array.from({ length: fullRows.length }, () => Array<Tile | null>(COLS).fill(null)),
        ...board.filter((_, rowIndex) => !fullRows.includes(rowIndex)),
      ]
    : board

  const gained = reports.reduce((sum, report) => sum + report.points, 0)
  const progression = advanceProgress(state.stageProgress, state.level, gained)
  const nextIndex = state.pieceIndex + 1
  const earnedBonus = bonusForClear(fullRows.length)
  const nextPiece = createPiece(state.seed, nextIndex, progression.level, earnedBonus)
  const nextSerial = reports.length > 0 ? state.clearSerial + 1 : state.clearSerial
  const gameOver = !canPlace(clearedBoard, nextPiece)

  return {
    ...state,
    board: clearedBoard,
    active: nextPiece,
    pieceIndex: nextIndex,
    score: state.score + gained,
    level: progression.level,
    stageProgress: progression.progress,
    lines: state.lines + fullRows.length,
    lockTicks: 0,
    lockResets: 0,
    gameOver,
    clearSerial: nextSerial,
    lastClear: reports.length > 0 ? { id: nextSerial, text: summariseClear(reports, earnedBonus) } : state.lastClear,
  }
}

function resetLockAfterManipulation(state: GameState, piece: Piece) {
  const wasGrounded = isGrounded(state.board, state.active)
  if (!wasGrounded || state.lockResets >= MAX_LOCK_RESETS) {
    return { lockTicks: state.lockTicks, lockResets: state.lockResets }
  }
  return { lockTicks: 0, lockResets: state.lockResets + 1 }
}

function createInitialState(seed: number): GameState {
  const normalizedSeed = seed || 1
  return {
    seed: normalizedSeed,
    board: emptyBoard(),
    active: createPiece(normalizedSeed, 0, 1),
    pieceIndex: 0,
    score: 0,
    level: 1,
    stageProgress: 0,
    lines: 0,
    lockTicks: 0,
    lockResets: 0,
    gameOver: false,
    clearSerial: 0,
    lastClear: null,
  }
}

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'RESET') return createInitialState(action.seed)
  if (state.gameOver) return state

  if (action.type === 'TICK') {
    const moved = { ...state.active, y: state.active.y + 1 }
    if (canPlace(state.board, moved)) {
      return { ...state, active: moved, lockTicks: 0 }
    }
    const nextLockTicks = state.lockTicks + 1
    if (nextLockTicks >= LOCK_TICKS) return lockPiece(state)
    return { ...state, lockTicks: nextLockTicks }
  }

  if (action.type === 'MOVE') {
    const moved = { ...state.active, x: state.active.x + action.dx, y: state.active.y + action.dy }
    if (!canPlace(state.board, moved)) return state
    const lock = action.dy > 0
      ? { lockTicks: 0, lockResets: state.lockResets }
      : resetLockAfterManipulation(state, moved)
    return { ...state, active: moved, ...lock }
  }

  const definition = SHAPES[state.active.shape]
  if (definition.rotates === false) return state
  const nextRotation = state.active.rotation + action.direction
  const kickOffsets = [0, -1, 1, -2, 2]
  for (const kick of kickOffsets) {
    const rotated = { ...state.active, rotation: nextRotation, x: state.active.x + kick }
    if (!canPlace(state.board, rotated)) continue
    const lock = resetLockAfterManipulation(state, rotated)
    return { ...state, active: rotated, ...lock }
  }
  return state
}

function dropDelay(level: number) {
  return Math.max(110, 760 - (level - 1) * 65)
}

function cellKey(x: number, y: number) {
  return `${x}:${y}`
}

export function CalcDrop({ active, seed, restartToken, session }: GameComponentProps) {
  const [state, dispatch] = useReducer(reducer, seed, createInitialState)
  const repeatTimer = useRef<number | null>(null)
  const finishSent = useRef(false)

  useEffect(() => {
    dispatch({ type: 'RESET', seed })
    finishSent.current = false
    session.setScore(0)
  }, [restartToken, seed, session])

  useEffect(() => {
    session.setScore(state.score)
  }, [session, state.score])

  useEffect(() => {
    if (!state.gameOver || finishSent.current) return
    finishSent.current = true
    session.finish({
      score: state.score,
      metadata: {
        level: state.level,
        lines: state.lines,
        target: TARGET,
        standardLineMax: STANDARD_LINE_MAX,
      },
    })
  }, [session, state.gameOver, state.level, state.lines, state.score])

  useEffect(() => {
    if (!active || state.gameOver) return undefined
    const timer = window.setInterval(() => dispatch({ type: 'TICK' }), dropDelay(state.level))
    return () => window.clearInterval(timer)
  }, [active, state.gameOver, state.level])

  useEffect(() => {
    if (!active || state.gameOver) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'z', 'Z', 'x', 'X'].includes(event.key)) event.preventDefault()
      if (event.key === 'ArrowLeft') dispatch({ type: 'MOVE', dx: -1, dy: 0 })
      if (event.key === 'ArrowRight') dispatch({ type: 'MOVE', dx: 1, dy: 0 })
      if (event.key === 'ArrowDown') dispatch({ type: 'MOVE', dx: 0, dy: 1 })
      if (event.key === 'ArrowUp' || event.key === 'x' || event.key === 'X') dispatch({ type: 'ROTATE', direction: 1 })
      if (event.key === 'z' || event.key === 'Z') dispatch({ type: 'ROTATE', direction: -1 })
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, state.gameOver])

  useEffect(() => () => {
    if (repeatTimer.current !== null) window.clearInterval(repeatTimer.current)
  }, [])

  useEffect(() => {
    if (active && !state.gameOver) return
    if (repeatTimer.current !== null) {
      window.clearInterval(repeatTimer.current)
      repeatTimer.current = null
    }
  }, [active, state.gameOver])

  const activeMap = useMemo(() => {
    const map = new Map<string, Tile>()
    for (const { x, y, tokenIndex } of pieceCells(state.active)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) map.set(cellKey(x, y), state.active.tokens[tokenIndex])
    }
    return map
  }, [state.active])

  const ghostCells = useMemo(() => {
    let ghost = state.active
    while (canPlace(state.board, { ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 }
    return new Set(pieceCells(ghost).filter(({ y }) => y >= 0).map(({ x, y }) => cellKey(x, y)))
  }, [state.active, state.board])

  const grounded = isGrounded(state.board, state.active)
  const progressPercent = Math.min(100, (state.stageProgress / TARGET) * 100)

  const stopRepeat = () => {
    if (repeatTimer.current === null) return
    window.clearInterval(repeatTimer.current)
    repeatTimer.current = null
  }

  const startRepeat = (action: Extract<Action, { type: 'MOVE' }>) => {
    if (!active || state.gameOver) return
    stopRepeat()
    dispatch(action)
    repeatTimer.current = window.setInterval(() => dispatch(action), action.dy > 0 ? 65 : 105)
  }

  return (
    <div className="calc-drop-game">
      <div className="calc-drop-safe">
        <header className="calc-drop-hud">
          <div className="calc-drop-level">
            <span>NIVEAU</span>
            <strong>{state.level}</strong>
          </div>
          <div className="calc-drop-target">
            <div className="calc-drop-target-copy">
              <span>OBJECTIF</span>
              <strong>{state.stageProgress.toLocaleString('fr-FR')} / {TARGET.toLocaleString('fr-FR')}</strong>
            </div>
            <div className="calc-drop-progress" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
          </div>
        </header>

        <div className="calc-drop-board-shell">
          <div className="calc-drop-board" role="application" aria-label="Grille de calcul 10 colonnes par 20 lignes">
            {state.board.flatMap((row, y) => row.map((settled, x) => {
              const key = cellKey(x, y)
              const moving = activeMap.get(key)
              const tile = moving ?? settled
              const isGhost = !tile && ghostCells.has(key)
              return (
                <div
                  className={[
                    'calc-drop-cell',
                    tile ? `is-${tile.kind}` : '',
                    tile?.bonus ? 'is-bonus' : '',
                    moving ? 'is-active' : '',
                    settled ? 'is-settled' : '',
                    isGhost ? 'is-ghost' : '',
                  ].filter(Boolean).join(' ')}
                  key={key}
                  aria-hidden="true"
                >
                  {tile ? <span>{tile.label}</span> : null}
                </div>
              )
            }))}
          </div>

          <div className={`calc-drop-lock ${grounded ? 'is-visible' : ''}`} aria-hidden="true">
            {Array.from({ length: LOCK_TICKS }, (_, index) => <span key={index} className={index < state.lockTicks ? 'is-on' : ''} />)}
          </div>
        </div>

        <div className="calc-drop-equation" key={state.lastClear?.id ?? 0} aria-live="polite">
          {state.lastClear
            ? state.lastClear.text
            : `MAX STANDARD · 9 × 3⁹ = ${STANDARD_LINE_MAX.toLocaleString('fr-FR')}`}
        </div>

        <div className="calc-drop-controls" aria-label="Contrôles">
          <div className="calc-drop-move-controls">
            <button
              type="button"
              aria-label="Déplacer à gauche"
              onPointerDown={(event) => { event.preventDefault(); startRepeat({ type: 'MOVE', dx: -1, dy: 0 }) }}
              onPointerUp={stopRepeat}
              onPointerCancel={stopRepeat}
              onPointerLeave={stopRepeat}
            >←</button>
            <button
              type="button"
              className="is-down"
              aria-label="Descendre plus vite"
              onPointerDown={(event) => { event.preventDefault(); startRepeat({ type: 'MOVE', dx: 0, dy: 1 }) }}
              onPointerUp={stopRepeat}
              onPointerCancel={stopRepeat}
              onPointerLeave={stopRepeat}
            >↓</button>
            <button
              type="button"
              aria-label="Déplacer à droite"
              onPointerDown={(event) => { event.preventDefault(); startRepeat({ type: 'MOVE', dx: 1, dy: 0 }) }}
              onPointerUp={stopRepeat}
              onPointerCancel={stopRepeat}
              onPointerLeave={stopRepeat}
            >→</button>
          </div>

          <div className="calc-drop-rotate-controls">
            <button type="button" aria-label="Tourner à gauche" onClick={() => dispatch({ type: 'ROTATE', direction: -1 })}>↺</button>
            <button type="button" aria-label="Tourner à droite" onClick={() => dispatch({ type: 'ROTATE', direction: 1 })}>↻</button>
          </div>
        </div>
      </div>
    </div>
  )
}
