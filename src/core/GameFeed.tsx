import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameRuntimeV2 } from './GameRuntimeV2'
import { buildRouletteBatch, type RouletteSlot } from './roulette'
import type { InstagameDefinition } from './types'

type GameFeedProps = {
  games: InstagameDefinition[]
}

const INITIAL_BATCHES = 4
const GAME_QUERY_KEY = 'game'

function requestedGameId() {
  if (typeof window === 'undefined') return null
  return new URL(window.location.href).searchParams.get(GAME_QUERY_KEY)?.trim() || null
}

function buildInitialSlots(games: InstagameDefinition[]) {
  let all: RouletteSlot[] = []
  let previous: string | undefined
  for (let index = 0; index < INITIAL_BATCHES; index += 1) {
    const batch = buildRouletteBatch(games, index, previous)
    all = [...all, ...batch]
    previous = batch.at(-1)?.game.id
  }

  const requested = requestedGameId()
  if (!requested) return all
  const requestedIndex = all.findIndex((slot) => slot.game.id === requested)
  if (requestedIndex <= 0) return all

  const selected = all[requestedIndex]
  return [selected, ...all.slice(0, requestedIndex), ...all.slice(requestedIndex + 1)]
}

function updateGameUrl(game: InstagameDefinition) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (url.searchParams.get(GAME_QUERY_KEY) !== game.id) {
    url.searchParams.set(GAME_QUERY_KEY, game.id)
    window.history.replaceState({ gameId: game.id }, '', url)
  }
  document.title = `${game.title} · MiniFugg`
}

export function GameFeed({ games }: GameFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const batchCounter = useRef(INITIAL_BATCHES)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slots, setSlots] = useState<RouletteSlot[]>(() => buildInitialSlots(games))

  const slotCount = slots.length

  const appendBatch = useCallback(() => {
    setSlots((current) => {
      const previous = current.at(-1)?.game.id
      const batch = buildRouletteBatch(games, batchCounter.current, previous)
      batchCounter.current += 1
      return [...current, ...batch]
    })
  }, [games])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | undefined
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry
        }
        if (!best) return
        const index = Number((best.target as HTMLElement).dataset.index)
        if (Number.isNaN(index)) return
        setActiveIndex(index)
      },
      { root, threshold: [0.55, 0.75, 0.95] },
    )

    root.querySelectorAll<HTMLElement>('[data-game-slot]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [slotCount])

  useEffect(() => {
    const activeGame = slots[activeIndex]?.game
    if (activeGame) updateGameUrl(activeGame)
  }, [activeIndex, slots])

  useEffect(() => {
    if (slots.length > 0 && activeIndex >= slots.length - Math.max(2, games.length)) appendBatch()
  }, [activeIndex, appendBatch, games.length, slots.length])

  const emptyState = useMemo(
    () => (
      <main className="empty-state">
        <strong>Aucun jeu enregistré.</strong>
        <span>Ajoute un jeu dans src/core/gameRegistry.tsx.</span>
      </main>
    ),
    [],
  )

  if (games.length === 0) return emptyState

  return (
    <main ref={containerRef} className="game-feed" aria-label="MiniFugg game feed">
      {slots.map((slot, index) => (
        <section className="game-slot" data-game-slot data-index={index} key={slot.key}>
          <GameRuntimeV2
            game={slot.game}
            catalog={games}
            seed={slot.seed}
            active={index === activeIndex}
            mounted={Math.abs(index - activeIndex) <= 1}
          />
        </section>
      ))}
    </main>
  )
}
