import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GameRuntime } from './GameRuntime'
import { useCoreCoinBalance } from './platformEconomy'
import { buildRouletteBatch, type RouletteSlot } from './roulette'
import type { InstagameDefinition } from './types'

type GameFeedProps = {
  games: InstagameDefinition[]
}

const INITIAL_BATCHES = 4
const GAME_QUERY_KEY = 'game'
const GAME_ID_ALIASES: Record<string, string> = {
  'calc-drop': 'tetramindfck',
}

function requestedGameId() {
  if (typeof window === 'undefined') return null
  const requested = new URL(window.location.href).searchParams.get(GAME_QUERY_KEY)?.trim() || null
  if (!requested) return null
  return GAME_ID_ALIASES[requested] ?? requested
}

function buildInitialSlots(games: InstagameDefinition[], coinBalance: number) {
  let all: RouletteSlot[] = []
  let previous: string | undefined
  for (let index = 0; index < INITIAL_BATCHES; index += 1) {
    const batch = buildRouletteBatch(games, index, coinBalance, previous)
    all = [...all, ...batch]
    previous = batch.at(-1)?.game.id
  }

  const requested = requestedGameId()
  if (!requested) return all
  const requestedGame = games.find((game) => game.id === requested)
  if (!requestedGame) return all

  const existingIndex = all.findIndex((slot) => slot.game.id === requested)
  if (existingIndex === 0) return all
  if (existingIndex > 0) {
    const selected = all[existingIndex]
    return [selected, ...all.slice(0, existingIndex), ...all.slice(existingIndex + 1)]
  }

  return [{ key: `direct-${requestedGame.id}-${Date.now()}`, game: requestedGame, seed: Math.floor(Math.random() * 2_147_483_647) }, ...all]
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
  const { balance: coinBalance } = useCoreCoinBalance()
  const discoveryMode = coinBalance > 0 ? 'has-coins' : 'no-coins'
  const gameSignature = games.map((game) => `${game.id}:${game.status ?? 'fugg'}`).join('|')
  const [slots, setSlots] = useState<RouletteSlot[]>(() => buildInitialSlots(games, coinBalance))
  const slotCount = slots.length

  useLayoutEffect(() => {
    const firstGame = slots[0]?.game
    if (firstGame) updateGameUrl(firstGame)
  }, [])

  useEffect(() => {
    batchCounter.current = INITIAL_BATCHES
    setActiveIndex(0)
    setSlots(buildInitialSlots(games, coinBalance))
    if (containerRef.current) containerRef.current.scrollTop = 0
    // We intentionally rebuild only when the catalog or zero/non-zero coin mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSignature, discoveryMode])

  const appendBatch = useCallback(() => {
    setSlots((current) => {
      const previous = current.at(-1)?.game.id
      const batch = buildRouletteBatch(games, batchCounter.current, coinBalance, previous)
      batchCounter.current += 1
      return [...current, ...batch]
    })
  }, [coinBalance, games])

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
        <section
          className="game-slot"
          data-game-slot
          data-index={index}
          data-curation-status={slot.game.status ?? 'fugg'}
          key={slot.key}
        >
          <GameRuntime
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
