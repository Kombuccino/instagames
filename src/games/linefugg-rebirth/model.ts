/** Rebirth-only test rules. Nothing imports or mutates the classic LineFugg scene. */
export type Cell = { kind: 'add' | 'multiply' | 'divide'; value: number; label: string }
export type Point = { row: number; col: number }
export type PlayedLine = {
  start: Point; end: Point; cells: Point[]; values: Cell[]; score: number;
  rerollKey: number; boardBefore: Cell[]; dimensionsBefore: number[];
}
export const GRID = 7
export const MAX_LINES = 3
export const MAX_CELLS = 5
export function hash(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619)
  return h >>> 0
}
export function randomFrom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let v = state
    v = Math.imul(v ^ (v >>> 15), v | 1)
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61)
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296
  }
}
export const round = (value: number) => Math.round(value * 100) / 100
export function format(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error('Invalid Rebirth value')
  return String(round(value))
}
export function cell(kind: Cell['kind'], value: number): Cell {
  if (!Number.isFinite(value) || value < 0 || (kind === 'divide' && value === 0)) throw new Error('Invalid cell')
  return { kind, value, label: `${kind === 'multiply' ? '×' : kind === 'divide' ? '÷' : ''}${value}` }
}
export function createCell(random: () => number): Cell {
  const roll = random()
  // User's T02 scope: no minus glyph/no negative cells. Classic 68/16/12/4 stays untouched.
  if (roll < 0.84) return cell('add', 1 + Math.floor(random() * 9))
  if (roll < 0.96) return cell('multiply', random() < 0.78 ? 2 : 3)
  return cell('divide', random() < 0.72 ? 2 : 3)
}
export function evaluate(values: readonly Cell[]): number {
  let result = 0
  for (const value of values) {
    if (value.kind === 'add') result += value.value
    else if (value.kind === 'multiply') result *= value.value
    else result /= value.value
  }
  return round(result)
}
export function formula(values: readonly Cell[]) {
  return values.map((value, i) => (i > 0 && value.kind === 'add' ? '+' : '') + value.label).join('')
}
export const indexOf = (point: Point) => point.row * GRID + point.col
export const validPoint = (p: Point) => Number.isInteger(p.row) && Number.isInteger(p.col) && p.row >= 0 && p.row < GRID && p.col >= 0 && p.col < GRID
export function cellsBetween(start: Point, end: Point): Point[] {
  if (!validPoint(start) || !validPoint(end)) return []
  const dy = end.row - start.row, dx = end.col - start.col
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  if (!steps || steps >= MAX_CELLS || (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy))) return []
  return Array.from({ length: steps + 1 }, (_, i) => ({ row: start.row + Math.sign(dy) * i, col: start.col + Math.sign(dx) * i }))
}
export function intersectsTwice(points: Point[], lines: PlayedLine[]) {
  const ids = new Set(points.map(indexOf))
  return lines.some(line => line.cells.filter(p => ids.has(indexOf(p))).length > 1)
}
/** Same eight-way nearest-end snapping as the classic prototype, in grid coordinates. */
export function snapEnd(start: Point, col: number, row: number): Point | null {
  if (!Number.isFinite(col) || !Number.isFinite(row) || Math.hypot(col - start.col, row - start.row) < 0.62) return null
  let best: Point | null = null, distance = Infinity
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dy && !dx) continue
    for (let n = 1; n < MAX_CELLS; n++) {
      const p = { row: start.row + n * dy, col: start.col + n * dx }
      if (!validPoint(p)) break
      const d = (row - p.row) ** 2 + (col - p.col) ** 2
      if (d < distance) { best = p; distance = d }
    }
  }
  return best
}
export class RebirthModel {
  board: Cell[]
  lines: PlayedLine[] = []
  dimensions: number[] = Array(49).fill(0)
  finished = false
  readonly boardId: string
  constructor(dayId = new Date().toISOString().slice(0, 10), seed = 0) {
    this.boardId = `linefugg-rebirth:${dayId}:${seed}`
    const random = randomFrom(hash(this.boardId))
    this.board = Array.from({ length: 49 }, () => createCell(random))
  }
  get total() { return round(this.lines.reduce((sum, line) => sum + line.score, 0)) }
  get canUndo() { return this.lines.length > 0 && !this.finished }
  get canValidate() { return this.lines.length === MAX_LINES && !this.finished }
  preview(start: Point, end: Point | null) {
    const cells = end ? cellsBetween(start, end) : []
    const valid = !this.finished && this.lines.length < MAX_LINES && cells.length >= 2 && !intersectsTwice(cells, this.lines)
    return { cells, valid, score: valid ? evaluate(cells.map(p => this.board[indexOf(p)])) : 0 }
  }
  play(start: Point, end: Point): { line: PlayedLine; changed: number[] } | null {
    const preview = this.preview(start, end)
    if (!preview.valid) return null
    const values = preview.cells.map(p => ({ ...this.board[indexOf(p)] }))
    const rerollKey = hash(`dir:${Math.sign(end.row - start.row)},${Math.sign(end.col - start.col)};cells:${values.map(v => `${v.kind}:${v.value}`).join('|')};score:${format(preview.score)}`)
    const line: PlayedLine = { start: { ...start }, end: { ...end }, cells: preview.cells, values,
      score: preview.score, rerollKey, boardBefore: this.board.map(v => ({ ...v })), dimensionsBefore: [...this.dimensions] }
    this.lines.push(line)
    const protectedIds = new Set(this.lines.flatMap(l => l.cells.map(indexOf)))
    const random = randomFrom(rerollKey || 1), changed: number[] = []
    this.board = this.board.map((old, i) => {
      const candidate = createCell(random)
      if (protectedIds.has(i)) return old
      changed.push(i)
      this.dimensions[i] = this.lines.length < MAX_LINES ? this.lines.length : -1
      return candidate
    })
    return { line, changed }
  }
  undo() {
    if (!this.canUndo) return false
    const removed = this.lines.pop()!
    this.board = removed.boardBefore.map(v => ({ ...v }))
    this.dimensions = [...removed.dimensionsBefore]
    return true
  }
  finish() {
    if (!this.canValidate) return null
    this.finished = true
    return this.total
  }
}
