import { useEffect, useId, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { GameComponentProps } from '../../core/types'
import { getLeaderboard, getSavedNickname, submitLeaderboardScore, type LeaderboardEntry } from '../../core/leaderboard'
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
const MAX_LINE_CELLS = 6
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
    for (let step = 1; step < MAX_LINE_CELLS; step += 1) {
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

export function LineFugg({ active, session }: GameComponentProps) {
  const dayId = useMemo(currentUtcDayId, [])
  const dailySeed = useMemo(() => hashString(`${GAME_ID}:${dayId}`), [dayId])
  const board = useMemo(() => createBoard(dailySeed), [dailySeed])
  const markerBase = useId().replace(/:/g, '')
  const [lines, setLines] = useState<PlayedLine[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  const [message, setMessage] = useState('Trace une ligne droite · 6 cases max')
  const [nickname, setNickname] = useState(() => getSavedNickname())
  const [submitted, setSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard(GAME_ID, dayId, 5))

  const total = useMemo(
    () => Math.round(lines.reduce((sum, line) => sum + line.score, 0) * 100) / 100,
    [lines],
  )
  const finished = lines.length >= MAX_LINES

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
    if (!active) setDrag(null)
  }, [active])

  const buildDrag = (pointerId: number, start: Point, end: Point | null): DragState => {
    const cells = end ? cellsForLine(start, end) : []
    return {
      pointerId,
      start,
      end,
      cells,
      valid: cells.length >= 2 && cells.length <= MAX_LINE_CELLS && !overlapsMoreThanOnce(cells, lines),
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || finished || event.button !== 0) return
    event.preventDefault()
    const start = pointFromPointer(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag(buildDrag(event.pointerId, start, null))
    setMessage('Relâche pour valider · 6 cases max')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const end = snapEnd(drag.start, event)
    const next = buildDrag(event.pointerId, drag.start, end)
    setDrag(next)
    if (end && !next.valid) setMessage('Maximum 1 case de croisement')
    else setMessage('Relâche pour valider · 6 cases max')
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
    const nextCount = lines.length + 1
    setLines((current) => [
      ...current,
      {
        start: finalDrag.start,
        end,
        cells: finalDrag.cells,
        score,
      },
    ])

    if (nextCount >= MAX_LINES) setMessage('Partie terminée')
    else setMessage(`${MAX_LINES - nextCount} trait${MAX_LINES - nextCount > 1 ? 's' : ''} restant${MAX_LINES - nextCount > 1 ? 's' : ''}`)
  }

  const undo = () => {
    if (lines.length === 0 || finished) return
    setLines((current) => current.slice(0, -1))
    setMessage('Dernier trait annulé')
  }

  const replay = () => {
    setLines([])
    setDrag(null)
    setSubmitted(false)
    setMessage('Trace une ligne droite · 6 cases max')
    session.setScore(0)
  }

  const submitScore = () => {
    if (!finished || submitted) return
    const entry = submitLeaderboardScore({
      gameId: GAME_ID,
      boardId: dayId,
      nickname,
      score: total,
    })
    if (!entry) return
    setNickname(entry.nickname)
    setSubmitted(true)
    setLeaderboard(getLeaderboard(GAME_ID, dayId, 5))
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
          <span>{finished ? 'FINAL' : 'TOTAL'}</span>
          <strong>{formatScore(total)}</strong>
        </div>
        <p>{message}</p>
      </section>

      <div className="linefugg-board-shell">
        <div className="linefugg-day">GRILLE DU JOUR · {dayId}</div>
        <div
          className={`linefugg-board ${drag?.end && !drag.valid ? 'is-invalid' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={() => setDrag(null)}
          role="application"
          aria-label="Grille 10 par 10. Trace trois lignes de six cases maximum, horizontales, verticales ou diagonales."
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
            <defs>
              <marker id={`${markerBase}-arrow-1`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-1" />
              </marker>
              <marker id={`${markerBase}-arrow-2`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-2" />
              </marker>
              <marker id={`${markerBase}-arrow-3`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-3" />
              </marker>
              <marker id={`${markerBase}-arrow-preview`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-preview" />
              </marker>
              <marker id={`${markerBase}-arrow-invalid`} viewBox="0 0 5 5" refX="4" refY="2.5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 Z" className="linefugg-arrow-invalid" />
              </marker>
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

        <div className="linefugg-preview" aria-live="polite">
          {drag?.cells.length ? (
            <>
              <span>→ {formulaFor(drag.cells, board)}</span>
              <strong>{drag.valid ? `= ${formatScore(previewScore ?? 0)}` : '×'}</strong>
            </>
          ) : lines.length > 0 ? (
            <>
              <span>Trait {lines.length} → {formulaFor(lines.at(-1)!.cells, board)}</span>
              <strong>= {formatScore(lines.at(-1)!.score)}</strong>
            </>
          ) : (
            <>
              <span>Le sens de la flèche donne l’ordre du calcul</span>
              <strong>3 × 6 max</strong>
            </>
          )}
        </div>
      </div>

      <div className="linefugg-controls">
        <button type="button" onClick={undo} disabled={lines.length === 0 || Boolean(drag) || finished}>
          Annuler
        </button>
        <span>↔ ↕ ⤢</span>
        <small>6 cases max · une ligne peut en croiser une autre sur 1 case max.</small>
      </div>

      {finished && (
        <div className="linefugg-finish" role="dialog" aria-modal="true" aria-label="Score final">
          <div className="linefugg-finish-card">
            <span className="linefugg-finish-kicker">LINEFUGG · {dayId}</span>
            <strong className="linefugg-final-score">{formatScore(total)}</strong>
            <span className="linefugg-final-label">SCORE FINAL</span>

            <div className="linefugg-submit-row">
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value.slice(0, 20))}
                placeholder="Ton pseudo"
                maxLength={20}
                autoCapitalize="off"
                autoComplete="nickname"
                disabled={submitted}
                aria-label="Pseudo"
              />
              <button type="button" onClick={submitScore} disabled={!nickname.trim() || submitted}>
                {submitted ? 'Enregistré' : 'Enregistrer'}
              </button>
            </div>

            {leaderboard.length > 0 && (
              <div className="linefugg-ladder">
                <span>TOP DU JOUR</span>
                <ol>
                  {leaderboard.map((entry) => (
                    <li key={entry.id}>
                      <span>{entry.nickname}</span>
                      <strong>{formatScore(entry.score)}</strong>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button className="linefugg-replay" type="button" onClick={replay}>
              Rejouer la grille du jour
            </button>
            {submitted && <small>Score enregistré sur cet appareil pour cette V1.</small>}
          </div>
        </div>
      )}
    </div>
  )
}
