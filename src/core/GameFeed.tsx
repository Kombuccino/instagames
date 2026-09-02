import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  url.searchParams.set(GAME_QUERY_KEY, game.id)

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (currentUrl !== nextUrl) {
    window.history.replaceState({ ...(window.history.state ?? {}), gameId: game.id }, '', nextUrl)
  }

  document.title = `${game.title} · MiniFugg`
}

export function GameFeed({ games }: GameFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const batchCounter = useRef(INITIAL_BATCHES)
  const scrollFrame = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slots, setSlots] = useState<RouletteSlot[]>(() => buildInitialSlots(games))

  const slotCount = slots.length

  useLayoutEffect(() => {
    const firstGame = slots[0]?.game
    if (firstGame) updateGameUrl(firstGame)
  }, [])

  const appendBatch = useCallback(() => {
    setSlots((current) => {
      const previous = current.at(-1)?.game.id
      const batch = buildRouletteBatch(games, batchCounter.current, previous)
      batchCounter.current += 1
      return [...current, ...batch]
    })
  }, [games])

  const syncActiveGameFromScroll = useCallback(() => {
    const root = containerRef.current
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-game-slot]'))
    if (nodes.length === 0) return

    const rootRect = root.getBoundingClientRect()
    const centerY = rootRect.top + rootRect.height / 2

    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    for (const node of nodes) {
      const rect = node.getBoundingClientRect()
      const distance = Math.abs((rect.top + rect.bottom) / 2 - centerY)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = Number(node.dataset.index) || 0
      }
    }

    setActiveIndex((current) => current === bestIndex ? current : bestIndex)
    const activeGame = slots[bestIndex]?.game
    if (activeGame) updateGameUrl(activeGame)
  }, [slots])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const onScroll = () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      scrollFrame.current = window.requestAnimationFrame(() => {
        scrollFrame.current = null
        syncActiveGameFromScroll()
      })
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    syncActiveGameFromScroll()

    return () => {
      root.removeEventListener('scroll', onScroll)
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current)
      scrollFrame.current = null
    }
  }, [slotCount, syncActiveGameFromScroll])

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
