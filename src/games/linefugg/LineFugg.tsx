import { useEffect, useId, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
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

type PointerPosition = {
  x: number
  y: number
}

type DragState = {
  pointerId: number
  start: Point
  end: Point | null
  cells: Point[]
  valid: boolean
  pointer: PointerPosition
}

const GRID_SIZE = 7
const MAX_LINES = 3
const MAX_LINE_CELLS = 5
const GAME_ID = 'linefugg'
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

function boardPointerPosition(event: ReactPointerEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  const localX = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
  const localY = Math.max(0, Math.min(rect.height, event.clientY - rect.top))
  return {
    gridX: (localX / rect.width) * GRID_SIZE - 0.5,
    gridY: (localY / rect.height) * GRID_SIZE - 0.5,
    pointer: {
      x: Math.max(10, Math.min(90, (localX / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (localY / rect.height) * 100)),
    },
  }
}

function pointFromPointer(event: ReactPointerEvent<HTMLDivElement>): Point {
  const { gridX, gridY } = boardPointerPosition(event)
  return {
    row: Math.max(0, Math.min(GRID_SIZE - 1, Math.round(gridY))),
    col: Math.max(0, Math.min(GRID_SIZE - 1, Math.round(gridX))),
  }
}

function snapEnd(start: Point, event: ReactPointerEvent<HTMLDivElement>) {
  const raw = boardPointerPosition(event)
  const distanceFromStart = Math.hypot(raw.gridX - start.col, raw.gridY - start.row)
  if (distanceFromStart < 0.62) return null
  let best: Point | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const [rowStep, colStep] of directions) {
    for (let step = 1; step < MAX_LINE_CELLS; step += 1) {
      const row = start.row + rowStep * step
      const col = start.col + colStep * step
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) break
      const distance = (raw.gridX - col) ** 2 + (raw.gridY - row) ** 2
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
  return cells.map((point, index) => {
    const cell = board[point.row * GRID_SIZE + point.col]
    if (cell.kind === 'add' && cell.value > 0 && index > 0) return `+${cell.label}`
    return cell.label
  }).join(' ')
}

function svgPoint(point: Point) {
  const step = 100 / GRID_SIZE
  return { x: (point.col + 0.5) * step, y: (point.row + 0.5) * step }
}

export function LineFugg({ active, restartToken, session }: GameComponentProps) {
  const dayId = useMemo(currentUtcDayId, [])
  const dailySeed = useMemo(() => hashString(`${GAME_ID}:${dayId}`), [dayId])
  const board = useMemo(() => createBoard(dailySeed), [dailySeed])
  const markerBase = useId().replace(/:/g, '')
  const [lines, setLines] = useState<PlayedLine[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  const [message, setMessage] = useState('3 traits · 5 cases maximum')

  const total = useMemo(() => roundScore(lines.reduce((sum, line) => sum + line.score, 0)), [lines])
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
  const history = lines.slice(-2)

  useEffect(() => {
    session.setScore(total)
  }, [session, total])

  useEffect(() => {
    setLines([])
    setDrag(null)
    setMessage('3 traits · 5 cases maximum')
    session.setScore(0)
  }, [restartToken, session])

  useEffect(() => {
    if (!active) setDrag(null)
  }, [active])

  const buildDrag = (pointerId: number, start: Point, end: Point | null, pointer: PointerPosition): DragState => {
    const cells = end ? cellsForLine(start, end) : []
    return {
      pointerId,
      start,
      end,
      cells,
      pointer,
      valid: cells.length >= 2 && cells.length <= MAX_LINE_CELLS && !overlapsMoreThanOnce(cells, lines),
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || lines.length >= MAX_LINES || event.button !== 0) return
    event.preventDefault()
    const start = pointFromPointer(event)
    const { pointer } = boardPointerPosition(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(buildDrag(event.pointerId, start, null, pointer))
    setMessage('Glisse en ligne droite · 5 cases max')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const end = snapEnd(drag.start, event)
    const { pointer } = boardPointerPosition(event)
    const next = buildDrag(event.pointerId, drag.start, end, pointer)
    setDrag(next)
    setMessage(end && !next.valid ? 'Une seule case de croisement maximum' : 'Relâche pour valider')
  }

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const end = snapEnd(drag.start, event)
    const { pointer } = boardPointerPosition(event)
    const finalDrag = buildDrag(event.pointerId, drag.start, end, pointer)
    setDrag(null)

    if (!end || finalDrag.cells.length < 2) {
      setMessage('Il faut au moins 2 cases')
      return
    }
    if (!finalDrag.valid) {
      setMessage('Refusé · une seule case de croisement max')
      return
    }

    const playedLine: PlayedLine = {
      start: finalDrag.start,
      end,
      cells: finalDrag.cells,
      score: scoreCells(finalDrag.cells, board),
    }
    const nextLines = [...lines, playedLine]
    const nextTotal = roundScore(nextLines.reduce((sum, line) => sum + line.score, 0))
    setLines(nextLines)
    session.setScore(nextTotal)

    if (nextLines.length >= MAX_LINES) {
      setMessage('Partie terminée')
      session.finish({
        score: nextTotal,
        boardId: dayId,
        metadata: { board: dayId, gridSize: GRID_SIZE, lineLimit: MAX_LINE_CELLS },
      })
      return
    }

    const remaining = MAX_LINES - nextLines.length
    setMessage(`${remaining} trait${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`)
  }

  const undo = () => {
    if (!active || lines.length === 0 || drag) return
    const nextLines = lines.slice(0, -1)
    setLines(nextLines)
    session.setScore(roundScore(nextLines.reduce((sum, line) => sum + line.score, 0)))
    setMessage('Dernier trait annulé')
  }

  return (
    <div className="linefugg-game">
      <div className="linefugg-glow" aria-hidden="true" />

      <section className="linefugg-status" aria-live="polite">
        <div className="linefugg-turns" aria-label={`${lines.length} trait sur ${MAX_LINES}`}>
          {Array.from({ length: MAX_LINES }, (_, index) => (
            <span key={index} className={index < lines.length ? 'is-played' : ''} />
          ))}
        </div>
        <p>{message}</p>
      </section>

      <main className="linefugg-play-area">
        <div className="linefugg-board-shell">
          <div className="linefugg-day">GRILLE DU JOUR · {dayId}</div>
          <div className="linefugg-board-wrap">
            <div
              className={`linefugg-board ${drag?.end && !drag.valid ? 'is-invalid' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finishPointer}
              onPointerCancel={() => {
                setDrag(null)
                const remaining = MAX_LINES - lines.length
                setMessage(`${remaining} trait${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`)
              }}
              role="application"
              aria-label="Grille 7 par 7. Trace trois lignes de cinq cases maximum, horizontales, verticales ou diagonales."
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
                return <div className={classes} key={key} aria-hidden="true"><span>{cell.label}</span></div>
              })}

              <svg className="linefugg-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <marker id={`${markerBase}-arrow-1`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-1" /></marker>
                  <marker id={`${markerBase}-arrow-2`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-2" /></marker>
                  <marker id={`${markerBase}-arrow-3`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-3" /></marker>
                  <marker id={`${markerBase}-arrow-preview`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-preview" /></marker>
                  <marker id={`${markerBase}-arrow-invalid`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-invalid" /></marker>
                </defs>

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
                      markerEnd={`url(#${markerBase}-arrow-${index + 1})`}
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
                      markerEnd={`url(#${markerBase}-arrow-${drag.valid ? 'preview' : 'invalid'})`}
                      className={`linefugg-preview-line ${drag.valid ? '' : 'is-invalid'}`}
                    />
                  )
                })()}
              </svg>
            </div>

            {drag?.cells.length ? (
              <div
                className={`linefugg-live-value ${drag.valid ? '' : 'is-invalid'}`}
                style={{ left: `${drag.pointer.x}%`, top: `${drag.pointer.y}%` }}
                aria-live="polite"
              >
                {drag.valid ? `= ${formatScore(previewScore ?? 0)}` : '×'}
              </div>
            ) : null}
          </div>

          <section className="linefugg-history" aria-label="Historique des traits">
            {history.length === 0 ? (
              <div className="linefugg-history-empty">
                <strong>Trace ton premier trait</strong>
                <span>Le sens de la flèche donne l’ordre du calcul.</span>
              </div>
            ) : history.map((line, historyIndex) => {
              const lineIndex = lines.length - history.length + historyIndex
              return (
                <div className={`linefugg-history-row line-${lineIndex + 1}`} key={`${pointKey(line.start)}-${pointKey(line.end)}-${lineIndex}`}>
                  <span className="linefugg-history-arrow">→</span>
                  <span className="linefugg-history-formula">{formulaFor(line.cells, board)}</span>
                  <strong>= {formatScore(line.score)}</strong>
                </div>
              )
            })}
          </section>

          <div className="linefugg-local-controls">
            <button type="button" onClick={undo} disabled={!active || lines.length === 0 || Boolean(drag)}>↶ Annuler</button>
            <span>1 croisement max · 5 cases max</span>
          </div>
        </div>
      </main>
    </div>
  )
}
