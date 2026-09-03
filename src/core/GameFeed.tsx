import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GameRuntimeV2 } from './GameRuntimeV2'
import { getGameSocialStats } from './platformApi'
import { buildRouletteBatch, type RouletteSlot } from './roulette'
import type { FeedPreference, InstagameDefinition } from './types'

type GameFeedProps = {
  games: InstagameDefinition[]
}

const INITIAL_BATCHES = 4
const GAME_QUERY_KEY = 'game'
const FEED_PREFERENCE_KEY = 'minifugg:feed-preference:v1'
const GAME_ID_ALIASES: Record<string, string> = {
  'calc-drop': 'tetramindfck',
}
export const BETA_PUBLIC_LOVE_THRESHOLD = 50

function requestedGameId() {
  if (typeof window === 'undefined') return null
  const requested = new URL(window.location.href).searchParams.get(GAME_QUERY_KEY)?.trim() || null
  if (!requested) return null
  return GAME_ID_ALIASES[requested] ?? requested
}

function readFeedPreference(): FeedPreference {
  if (typeof window === 'undefined') return 'fugg'
  const saved = window.localStorage.getItem(FEED_PREFERENCE_KEY)
  return saved === 'beta' || saved === 'all' ? saved : 'fugg'
}

function writeFeedPreference(value: FeedPreference) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FEED_PREFERENCE_KEY, value)
  } catch {
    // Feed curation must never block gameplay.
  }
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
  const [feedPreference, setFeedPreference] = useState<FeedPreference>(() => readFeedPreference())
  const [betaLoves, setBetaLoves] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    const betaGames = games.filter((game) => game.status === 'beta')
    if (betaGames.length === 0) return

    void Promise.all(betaGames.map(async (game) => {
      const stats = await getGameSocialStats(game.id)
      return [game.id, stats.loves] as const
    })).then((pairs) => {
      if (!cancelled) setBetaLoves(Object.fromEntries(pairs))
    })

    return () => { cancelled = true }
  }, [games])

  const visibleGames = useMemo(() => {
    const requested = requestedGameId()
    const filtered = games.filter((game) => {
      const status = game.status ?? 'fugg'
      if (game.id === requested) return true
      if (status === 'fugg') return true
      if (status === 'trash') return feedPreference === 'all'
      if (feedPreference === 'beta' || feedPreference === 'all') return true
      return (betaLoves[game.id] ?? 0) >= BETA_PUBLIC_LOVE_THRESHOLD
    })
    return filtered.length > 0 ? filtered : games.slice(0, 1)
  }, [betaLoves, feedPreference, games])

  const visibleSignature = visibleGames.map((game) => game.id).join('|')
  const [slots, setSlots] = useState<RouletteSlot[]>(() => buildInitialSlots(visibleGames))
  const slotCount = slots.length

  useLayoutEffect(() => {
    const firstGame = slots[0]?.game
    if (firstGame) updateGameUrl(firstGame)
  }, [])

  useEffect(() => {
    batchCounter.current = INITIAL_BATCHES
    setActiveIndex(0)
    setSlots(buildInitialSlots(visibleGames))
    if (containerRef.current) containerRef.current.scrollTop = 0
  // visibleSignature is the intentional stable dependency for the curated catalog.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSignature])

  const changeFeedPreference = useCallback((value: FeedPreference) => {
    writeFeedPreference(value)
    setFeedPreference(value)
  }, [])

  const appendBatch = useCallback(() => {
    setSlots((current) => {
      const previous = current.at(-1)?.game.id
      const batch = buildRouletteBatch(visibleGames, batchCounter.current, previous)
      batchCounter.current += 1
      return [...current, ...batch]
    })
  }, [visibleGames])

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
    if (slots.length > 0 && activeIndex >= slots.length - Math.max(2, visibleGames.length)) appendBatch()
  }, [activeIndex, appendBatch, slots.length, visibleGames.length])

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
          <GameRuntimeV2
            game={slot.game}
            catalog={games}
            seed={slot.seed}
            active={index === activeIndex}
            mounted={Math.abs(index - activeIndex) <= 1}
            feedPreference={feedPreference}
            onFeedPreferenceChange={changeFeedPreference}
          />
        </section>
      ))}
    </main>
  )
}
