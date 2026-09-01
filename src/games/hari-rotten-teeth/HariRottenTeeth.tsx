import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { GameComponentProps } from '../../core/types'
import './HariRottenTeeth.css'

type CandyKind = 'strawberry' | 'lemon' | 'mint' | 'cola' | 'grape'
type Cell = CandyKind | null
type Orientation = 'vertical' | 'horizontal'
type Phase = 'playing' | 'level-clear' | 'game-over'

type FallingPiece = {
  candies: CandyKind[]
  x: number
  y: number
  orientation: Orientation
}

type Tooth = {
  id: number
  kind: CandyKind
  hp: number
  maxHp: number
  tilt: number
  size: number
}

type AttackBurst = {
  id: number
  kind: CandyKind
  count: number
  toothIndex: number
}

type World = {
  board: Cell[][]
  piece: FallingPiece | null
  teeth: Tooth[]
  level: number
  score: number
  combo: number
  phase: Phase
  nextBurstId: number
  attacks: AttackBurst[]
  random: () => number
}

type MatchedCell = {
  row: number
  col: number
}

type CandySpec = {
  kind: CandyKind
  label: string
  glyph: string
}

const ROWS = 12
const COLS = 7
const TOOTH_COUNT = 8

const candies: CandySpec[] = [
  { kind: 'strawberry', label: 'fraise', glyph: '●' },
  { kind: 'lemon', label: 'citron', glyph: '✦' },
  { kind: 'mint', label: 'menthe', glyph: '◆' },
  { kind: 'cola', label: 'cola', glyph: '■' },
  { kind: 'grape', label: 'raisin', glyph: '✿' },
]

const candyMap = new Map<CandyKind, CandySpec>(candies.map((candy) => [candy.kind, candy]))

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

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

function randomCandy(random: () => number): CandyKind {
  return candies[Math.floor(random() * candies.length)].kind
}

function makePiece(random: () => number): FallingPiece {
  return {
    candies: [randomCandy(random), randomCandy(random), randomCandy(random)],
    x: Math.floor(COLS / 2),
    y: -2,
    orientation: 'vertical',
  }
}

function makeTeeth(level: number, random: () => number): Tooth[] {
  const baseHp = 5 + Math.floor((level - 1) * 1.35)
  const guaranteed = candies.map((candy) => candy.kind)
  const kinds = Array.from({ length: TOOTH_COUNT }, (_, index) => guaranteed[index] ?? randomCandy(random))

  for (let index = kinds.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[kinds[index], kinds[swap]] = [kinds[swap], kinds[index]]
  }

  return kinds.map((kind, index) => {
    const maxHp = baseHp + Math.floor(random() * 4)
    return {
      id: level * 100 + index,
      kind,
      hp: maxHp,
      maxHp,
      tilt: (random() * 2 - 1) * 8,
      size: 0.88 + random() * 0.22,
    }
  })
}

function createWorld(seed: number): World {
  const random = mulberry32(seed || 1)
  return {
    board: emptyBoard(),
    piece: makePiece(random),
    teeth: makeTeeth(1, random),
    level: 1,
    score: 0,
    combo: 0,
    phase: 'playing',
    nextBurstId: 1,
    attacks: [],
    random,
  }
}

function pieceCells(piece: FallingPiece) {
  return piece.candies.map((kind, index) => ({
    kind,
    col: piece.x + (piece.orientation === 'horizontal' ? index : 0),
    row: piece.y + (piece.orientation === 'vertical' ? index : 0),
  }))
}

function canPlace(board: Cell[][], piece: FallingPiece) {
  for (const cell of pieceCells(piece)) {
    if (cell.col < 0 || cell.col >= COLS || cell.row >= ROWS) return false
    if (cell.row >= 0 && board[cell.row][cell.col]) return false
  }
  return true
}

function cloneBoard(board: Cell[][]) {
  return board.map((row) => [...row])
}

function applyGravity(board: Cell[][]) {
  const next = emptyBoard()
  for (let col = 0; col < COLS; col += 1) {
    let writeRow = ROWS - 1
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const cell = board[row][col]
      if (!cell) continue
      next[writeRow][col] = cell
      writeRow -= 1
    }
  }
  return next
}

function findMatches(board: Cell[][]): MatchedCell[] {
  const matched = new Map<string, MatchedCell>()
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const kind = board[row][col]
      if (!kind) continue

      for (const [dr, dc] of directions) {
        const beforeRow = row - dr
        const beforeCol = col - dc
        if (
          beforeRow >= 0 && beforeRow < ROWS &&
          beforeCol >= 0 && beforeCol < COLS &&
          board[beforeRow][beforeCol] === kind
        ) continue

        const run: MatchedCell[] = []
        let scanRow = row
        let scanCol = col
        while (
          scanRow >= 0 && scanRow < ROWS &&
          scanCol >= 0 && scanCol < COLS &&
          board[scanRow][scanCol] === kind
        ) {
          run.push({ row: scanRow, col: scanCol })
          scanRow += dr
          scanCol += dc
        }

        if (run.length >= 3) {
          for (const cell of run) matched.set(`${cell.row}:${cell.col}`, cell)
        }
      }
    }
  }

  return [...matched.values()]
}

function damageTeeth(
  teeth: Tooth[],
  damageByKind: Map<CandyKind, number>,
  nextBurstId: number,
) {
  const nextTeeth = teeth.map((tooth) => ({ ...tooth }))
  const bursts: AttackBurst[] = []
  let burstId = nextBurstId

  for (const [kind, rawDamage] of damageByKind) {
    let remaining = rawDamage
    while (remaining > 0) {
      const toothIndex = nextTeeth.findIndex((tooth) => tooth.kind === kind && tooth.hp > 0)
      if (toothIndex < 0) break
      const tooth = nextTeeth[toothIndex]
      const damage = Math.min(remaining, tooth.hp)
      tooth.hp -= damage
      remaining -= damage
      bursts.push({ id: burstId, kind, count: damage, toothIndex })
      burstId += 1
    }
  }

  return { teeth: nextTeeth, bursts, nextBurstId: burstId }
}

function resolveBoard(world: World, initialBoard: Cell[][]) {
  let board = initialBoard
  let teeth = world.teeth
  let score = world.score
  let cascade = 0
  let nextBurstId = world.nextBurstId
  const attacks = [...world.attacks]

  while (true) {
    const matched = findMatches(board)
    if (matched.length === 0) break

    cascade += 1
    const damageByKind = new Map<CandyKind, number>()
    const next = cloneBoard(board)

    for (const cell of matched) {
      const kind = next[cell.row][cell.col]
      if (!kind) continue
      damageByKind.set(kind, (damageByKind.get(kind) ?? 0) + 1)
      next[cell.row][cell.col] = null
    }

    score += matched.length * (10 + (cascade - 1) * 5)
    const damaged = damageTeeth(teeth, damageByKind, nextBurstId)
    teeth = damaged.teeth
    nextBurstId = damaged.nextBurstId
    attacks.push(...damaged.bursts)
    board = applyGravity(next)
  }

  const allRotten = teeth.every((tooth) => tooth.hp <= 0)
  return {
    ...world,
    board,
    teeth,
    score,
    combo: cascade,
    nextBurstId,
    attacks: attacks.slice(-12),
    phase: allRotten ? 'level-clear' as const : world.phase,
  }
}

function lockPiece(world: World) {
  const piece = world.piece
  if (!piece) return world
  const cells = pieceCells(piece)
  if (cells.some((cell) => cell.row < 0)) {
    return { ...world, piece: null, phase: 'game-over' as const }
  }

  const board = cloneBoard(world.board)
  for (const cell of cells) board[cell.row][cell.col] = cell.kind

  const resolved = resolveBoard(world, board)
  if (resolved.phase !== 'playing') return { ...resolved, piece: null }

  const nextPiece = makePiece(world.random)
  if (!canPlace(resolved.board, nextPiece)) {
    return { ...resolved, piece: null, phase: 'game-over' as const }
  }

  return { ...resolved, piece: nextPiece }
}

function dropDelay(level: number) {
  return Math.max(185, 760 - (level - 1) * 52)
}

function Candy({ kind, ghost = false }: { kind: CandyKind; ghost?: boolean }) {
  const spec = candyMap.get(kind)!
  return (
    <span className={`hari-candy is-${kind} ${ghost ? 'is-ghost' : ''}`} title={spec.label} aria-hidden="true">
      <i>{spec.glyph}</i>
    </span>
  )
}

function Board({ board, piece }: { board: Cell[][]; piece: FallingPiece | null }) {
  const falling = useMemo(() => {
    const map = new Map<string, CandyKind>()
    if (!piece) return map
    for (const cell of pieceCells(piece)) {
      if (cell.row >= 0 && cell.row < ROWS && cell.col >= 0 && cell.col < COLS) {
        map.set(`${cell.row}:${cell.col}`, cell.kind)
      }
    }
    return map
  }, [piece])

  return (
    <div className="hari-board" role="grid" aria-label="Grille de bonbons">
      {Array.from({ length: ROWS * COLS }, (_, index) => {
        const row = Math.floor(index / COLS)
        const col = index % COLS
        const fixed = board[row][col]
        const active = falling.get(`${row}:${col}`)
        return (
          <span className="hari-cell" role="gridcell" key={`${row}-${col}`}>
            {fixed && <Candy kind={fixed} />}
            {active && <Candy kind={active} ghost />}
          </span>
        )
      })}
    </div>
  )
}

export function HariRottenTeeth({ active, seed, restartToken, session }: GameComponentProps) {
  const [world, setWorld] = useState<World>(() => createWorld(seed))
  const finishedRef = useRef(false)
  const softDropRef = useRef<number | null>(null)
  const sessionRef = useRef(session)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const clearSoftDrop = useCallback(() => {
    if (softDropRef.current !== null) {
      window.clearInterval(softDropRef.current)
      softDropRef.current = null
    }
  }, [])

  useEffect(() => () => clearSoftDrop(), [clearSoftDrop])

  useEffect(() => {
    clearSoftDrop()
    finishedRef.current = false
    const next = createWorld(seed)
    setWorld(next)
    sessionRef.current.setScore(0)
  }, [restartToken, seed, clearSoftDrop])

  useEffect(() => {
    sessionRef.current.setScore(world.score)
  }, [world.score])

  useEffect(() => {
    if (world.phase !== 'game-over' || finishedRef.current) return
    finishedRef.current = true
    sessionRef.current.finish({
      score: world.score,
      metadata: { level: world.level },
    })
  }, [world.phase, world.score, world.level])

  const moveHorizontal = useCallback((direction: -1 | 1) => {
    setWorld((current) => {
      if (current.phase !== 'playing' || !current.piece) return current
      const piece = { ...current.piece, x: current.piece.x + direction }
      return canPlace(current.board, piece) ? { ...current, piece } : current
    })
  }, [])

  const stepDown = useCallback(() => {
    setWorld((current) => {
      if (current.phase !== 'playing' || !current.piece) return current
      const piece = { ...current.piece, y: current.piece.y + 1 }
      if (canPlace(current.board, piece)) return { ...current, piece, combo: 0 }
      return lockPiece(current)
    })
  }, [])

  const toggleOrientation = useCallback(() => {
    setWorld((current) => {
      if (current.phase !== 'playing' || !current.piece) return current
      const orientation: Orientation = current.piece.orientation === 'vertical' ? 'horizontal' : 'vertical'
      let piece = { ...current.piece, orientation }

      if (piece.orientation === 'horizontal') {
        piece = { ...piece, x: Math.max(0, Math.min(COLS - 3, piece.x)) }
      } else {
        piece = { ...piece, x: Math.max(0, Math.min(COLS - 1, piece.x)) }
      }

      return canPlace(current.board, piece) ? { ...current, piece } : current
    })
  }, [])

  const cycleCandies = useCallback(() => {
    setWorld((current) => {
      if (current.phase !== 'playing' || !current.piece) return current
      const [a, b, c] = current.piece.candies
      return { ...current, piece: { ...current.piece, candies: [c, a, b] } }
    })
  }, [])

  useEffect(() => {
    if (!active || world.phase !== 'playing') return
    const timer = window.setInterval(stepDown, dropDelay(world.level))
    return () => window.clearInterval(timer)
  }, [active, world.level, world.phase, stepDown])

  useEffect(() => {
    if (!active || world.phase !== 'level-clear') return
    clearSoftDrop()
    const timer = window.setTimeout(() => {
      setWorld((current) => {
        if (current.phase !== 'level-clear') return current
        const level = current.level + 1
        return {
          ...current,
          board: emptyBoard(),
          piece: makePiece(current.random),
          teeth: makeTeeth(level, current.random),
          level,
          combo: 0,
          phase: 'playing',
          attacks: [],
        }
      })
    }, 1250)
    return () => window.clearTimeout(timer)
  }, [active, world.phase, clearSoftDrop])

  useEffect(() => {
    if (!active) {
      clearSoftDrop()
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveHorizontal(-1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveHorizontal(1)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        stepDown()
      } else if (event.key === ' ' || event.key === 'ArrowUp') {
        event.preventDefault()
        toggleOrientation()
      } else if (event.key.toLowerCase() === 'x') {
        event.preventDefault()
        cycleCandies()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, moveHorizontal, stepDown, toggleOrientation, cycleCandies, clearSoftDrop])

  const startSoftDrop = useCallback(() => {
    if (!active || world.phase !== 'playing') return
    clearSoftDrop()
    stepDown()
    softDropRef.current = window.setInterval(stepDown, 58)
  }, [active, world.phase, clearSoftDrop, stepDown])

  const liveTeeth = world.teeth.filter((tooth) => tooth.hp > 0).length

  return (
    <div className={`hari-game phase-${world.phase}`}>
      <div className="hari-wall" aria-hidden="true" />

      <header className="hari-mouth" aria-label={`${liveTeeth} dents encore saines sur ${TOOTH_COUNT}`}>
        <div className="hari-level">NIVEAU <strong>{world.level}</strong></div>
        <div className="hari-gum" aria-hidden="true" />
        <div className="hari-teeth">
          {world.teeth.map((tooth, index) => {
            const decay = tooth.hp <= 0 ? 100 : Math.round((1 - tooth.hp / tooth.maxHp) * 88)
            return (
              <div
                className={`hari-tooth ${tooth.hp <= 0 ? 'is-rotten' : ''}`}
                key={tooth.id}
                style={{
                  '--decay': `${decay}%`,
                  '--tilt': `${tooth.tilt}deg`,
                  '--tooth-scale': tooth.size,
                  '--drop-delay': `${index * 55}ms`,
                } as CSSProperties}
              >
                <span className="hari-tooth-body">
                  <span className="hari-candy-mark"><Candy kind={tooth.kind} /></span>
                </span>
              </div>
            )
          })}
        </div>
      </header>

      <div className="hari-board-shell">
        <Board board={world.board} piece={world.piece} />
        {world.combo > 1 && <div className="hari-combo" key={`${world.score}-${world.combo}`}>CASCADE ×{world.combo}</div>}
      </div>

      <div className="hari-attacks" aria-hidden="true">
        {world.attacks.map((attack) => (
          <div
            className={`hari-attack is-${attack.kind}`}
            key={attack.id}
            style={{ '--target-x': `${((attack.toothIndex + 0.5) / TOOTH_COUNT) * 100}%` } as CSSProperties}
          >
            <Candy kind={attack.kind} />
            {attack.count > 1 && <b>×{attack.count}</b>}
          </div>
        ))}
      </div>

      <div className="hari-controls" aria-label="Contrôles du bloc de bonbons">
        <div className="hari-move-controls">
          <button type="button" onPointerDown={(event) => { event.preventDefault(); moveHorizontal(-1) }} aria-label="Déplacer à gauche">←</button>
          <button
            type="button"
            className="is-drop"
            onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); startSoftDrop() }}
            onPointerUp={(event) => { clearSoftDrop(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
            onPointerCancel={clearSoftDrop}
            aria-label="Descendre rapidement"
          >↓</button>
          <button type="button" onPointerDown={(event) => { event.preventDefault(); moveHorizontal(1) }} aria-label="Déplacer à droite">→</button>
        </div>

        <div className="hari-action-controls">
          <button type="button" onPointerDown={(event) => { event.preventDefault(); toggleOrientation() }} aria-label="Changer vertical horizontal">
            <span className="hari-orientation-icon">↔</span>
          </button>
          <button type="button" onPointerDown={(event) => { event.preventDefault(); cycleCandies() }} aria-label="Faire tourner les bonbons dans le bloc">
            <span className="hari-cycle-icon">↻</span>
          </button>
        </div>
      </div>

      <div className="hari-control-hint" aria-hidden="true">
        <span>← ↓ →</span>
        <span>FORME · ORDRE</span>
      </div>

      {world.phase === 'level-clear' && (
        <div className="hari-level-clear" aria-hidden="true">
          <strong>HARI</strong>
          <span>LES DENTS POURRIES !</span>
          <small>NIVEAU {world.level + 1}</small>
        </div>
      )}

      {world.phase === 'game-over' && (
        <div className="hari-game-over" aria-hidden="true">
          <strong>TROP DE SUCRE</strong>
          <span>Niveau {world.level}</span>
        </div>
      )}
    </div>
  )
}
