import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import './LineFugg.css'

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
}

const GRID_SIZE = 10
const MAX_LINES = 3
const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
] as const

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

function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col
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

function scoreCells(cells: Point[], board: Cell[]) {
  let score = 0

  for (const point of cells) {
    const cell = board[point.row * GRID_SIZE + point.col]
    if (cell.kind === 'add') score += cell.value
    if (cell.kind === 'multiply') score *= cell.value
    if (cell.kind === 'divide') score /= cell.value
  }

  return Math.round(score * 100) / 100
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

function pointerGridPosition(event: ReactPointerEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * GRID_SIZE - 0.5
  const y = ((event.clientY - rect.top) / rect.height) * GRID_SIZE - 0.5
  return { x, y }
}

function pointFromPointer(event: ReactPointerEvent<HTMLDivElement>): Point {
  const { x, y } = pointerGridPosition(event)
  return {
    row: Math.max(0, Math.min(GRID_SIZE - 1, Math.round(y))),
    col: Math.max(0, Math.min(GRID_SIZE - 1, Math.round(x))),
  }
}

function snapEnd(start: Point, event: ReactPointerEvent<HTMLDivElement>) {
  const raw = pointerGridPosition(event)
  const distanceFromStart = Math.hypot(raw.x - start.col, raw.y - start.row)
  if (distanceFromStart < 0.62) return null

  let best: Point | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (const [rowStep, colStep] of directions) {
    for (let step = 1; step < GRID_SIZE; step += 1) {
      const row = start.row + rowStep * step
      const col = start.col + colStep * step
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) break

      const distance = (raw.x - col) ** 2 + (raw.y - row) ** 2
      if (distance < bestDistance) {
        bestDistance = distance
        best = { row, col }
      }
    }
  }

  return best
}

function formatScore(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function formulaFor(cells: Point[], board: Cell[]) {
  const labels = cells.map((point, index) => {
    const cell = board[point.row * GRID_SIZE + point.col]
    if (cell.kind === 'add' && cell.value > 0 && index > 0) return `+${cell.label}`
    return cell.label
  })
  return labels.join(' ')
}

function svgPoint(point: Point) {
  return {
    x: point.col * 10 + 5,
    y: point.row * 10 + 5,
  }
}

export function LineFugg({ active, seed, session }: GameComponentProps) {
  const board = useMemo(() => createBoard(seed), [seed])
  const [lines, setLines] = useState<PlayedLine[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  const [message, setMessage] = useState('Trace une ligne droite')

  const total = useMemo(
    () => Math.round(lines.reduce((sum, line) => sum + line.score, 0) * 100) / 100,
    [lines],
  )

  const usedCells = useMemo(() => {
    const counts = new Map<string, number>()
    for (const line of lines) {
      for (const point of line.cells) {
        const key = pointKey(point)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return counts
  }, [lines])

  const previewCells = useMemo(() => new Set(drag?.cells.map(pointKey) ?? []), [drag])
  const previewScore = drag?.cells.length ? scoreCells(drag.cells, board) : null

  useEffect(() => {
    session.setScore(total)
  }, [session, total])

  useEffect(() => {
    setLines([])
    setDrag(null)
    setMessage('Trace une ligne droite')
  }, [seed])

  useEffect(() => {
    if (!active) setDrag(null)
  }, [active])

  const buildDrag = (pointerId: number, start: Point, end: Point | null): DragState => {
    const cells = end ? cellsForLine(start, end) : []
    return {
      pointerId,
      start,
      end,
      cells,
      valid: cells.length >= 2 && !overlapsMoreThanOnce(cells, lines),
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || lines.length >= MAX_LINES || event.button !== 0) return
    event.preventDefault()
    const start = pointFromPointer(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(buildDrag(event.pointerId, start, null))
    setMessage('Relâche pour valider')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const end = snapEnd(drag.start, event)
    const next = buildDrag(event.pointerId, drag.start, end)
    setDrag(next)
    if (end && !next.valid) setMessage('Maximum 1 case de croisement')
    else setMessage('Relâche pour valider')
  }

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()

    const end = snapEnd(drag.start, event)
    const finalDrag = buildDrag(event.pointerId, drag.start, end)
    setDrag(null)

    if (!end || finalDrag.cells.length < 2) {
      setMessage('Trace au moins 2 cases')
      return
    }

    if (!finalDrag.valid) {
      setMessage('Refusé : 2 cases communes ou plus')
      return
    }

    const score = scoreCells(finalDrag.cells, board)
    setLines((current) => [
      ...current,
      {
        start: finalDrag.start,
        end,
        cells: finalDrag.cells,
        score,
      },
    ])

    const nextCount = lines.length + 1
    if (nextCount >= MAX_LINES) setMessage('Terminé — swipe pour une nouvelle grille')
    else setMessage(`${MAX_LINES - nextCount} trait${MAX_LINES - nextCount > 1 ? 's' : ''} restant${MAX_LINES - nextCount > 1 ? 's' : ''}`)
  }

  const undo = () => {
    if (lines.length === 0) return
    setLines((current) => current.slice(0, -1))
    setMessage('Dernier trait annulé')
  }

  return (
    <div className="linefugg-game">
      <div className="linefugg-glow" aria-hidden="true" />

      <section className="linefugg-hud" aria-live="polite">
        <div className="linefugg-turns">
          {Array.from({ length: MAX_LINES }, (_, index) => (
            <span key={index} className={index < lines.length ? 'is-played' : ''} />
          ))}
        </div>
        <div className="linefugg-scoreline">
          <span>{lines.length >= MAX_LINES ? 'FINAL' : 'TOTAL'}</span>
          <strong>{formatScore(total)}</strong>
        </div>
        <p>{message}</p>
      </section>

      <div className="linefugg-board-shell">
        <div
          className={`linefugg-board ${drag?.end && !drag.valid ? 'is-invalid' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={() => setDrag(null)}
          role="application"
          aria-label="Grille 10 par 10. Trace jusqu'à trois lignes horizontales, verticales ou diagonales."
        >
          {board.map((cell, index) => {
            const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
            const key = pointKey(point)
            const useCount = usedCells.get(key) ?? 0
            const classes = [
              'linefugg-cell',
              `is-${cell.kind}`,
              useCount > 0 ? 'is-used' : '',
              useCount > 1 ? 'is-crossing' : '',
              previewCells.has(key) ? 'is-preview' : '',
            ].filter(Boolean).join(' ')

            return (
              <div className={classes} key={key} aria-hidden="true">
                <span>{cell.label}</span>
              </div>
            )
          })}

          <svg className="linefugg-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {lines.map((line, index) => {
              const start = svgPoint(line.start)
              const end = svgPoint(line.end)
              return (
                <line
                  key={`${pointKey(line.start)}-${pointKey(line.end)}-${index}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  className={`linefugg-played-line line-${index + 1}`}
                />
              )
            })}
            {drag?.end && (() => {
              const start = svgPoint(drag.start)
              const end = svgPoint(drag.end)
              return (
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  className={`linefugg-preview-line ${drag.valid ? '' : 'is-invalid'}`}
                />
              )
            })()}
          </svg>
        </div>

        <div className="linefugg-preview" aria-live="polite">
          {drag?.cells.length ? (
            <>
              <span>{formulaFor(drag.cells, board)}</span>
              <strong>{drag.valid ? `= ${formatScore(previewScore ?? 0)}` : '×'}</strong>
            </>
          ) : lines.length > 0 ? (
            <>
              <span>Trait {lines.length} : {formulaFor(lines.at(-1)!.cells, board)}</span>
              <strong>= {formatScore(lines.at(-1)!.score)}</strong>
            </>
          ) : (
            <>
              <span>Les nombres s'ajoutent · calcul de gauche à droite</span>
              <strong>3 traits</strong>
            </>
          )}
        </div>
      </div>

      <div className="linefugg-controls">
        <button type="button" onClick={undo} disabled={lines.length === 0 || Boolean(drag)}>
          Annuler
        </button>
        <span>↔ ↕ ⤢</span>
        <small>Une ligne peut en croiser une autre sur 1 case max.</small>
      </div>
    </div>
  )
}
