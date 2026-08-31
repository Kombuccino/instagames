import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameRuntime } from './GameRuntime'
import { buildRouletteBatch, type RouletteSlot } from './roulette'
import type { InstagameDefinition } from './types'

type GameFeedProps = {
  games: InstagameDefinition[]
}

const INITIAL_BATCHES = 4

export function GameFeed({ games }: GameFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const batchCounter = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slots, setSlots] = useState<RouletteSlot[]>(() => {
    let all: RouletteSlot[] = []
    let previous: string | undefined
    for (let index = 0; index < INITIAL_BATCHES; index += 1) {
      const batch = buildRouletteBatch(games, index, previous)
      all = [...all, ...batch]
      previous = batch.at(-1)?.game.id
    }
    batchCounter.current = INITIAL_BATCHES
    return all
  })

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
    if (slots.length > 0 && activeIndex >= slots.length - Math.max(2, games.length)) appendBatch()
  }, [activeIndex, appendBatch, games.length, slots.length])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const target = Math.max(0, Math.min(activeIndex + direction, slots.length - 1))
      containerRef.current?.children[target]?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, slots.length])

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
    <main ref={containerRef} className="game-feed" aria-label="Instagames feed">
      {slots.map((slot, index) => (
        <section
          className="game-slot"
          data-game-slot
          data-index={index}
          key={slot.key}
        >
          <GameRuntime
            game={slot.game}
            seed={slot.seed}
            active={index === activeIndex}
            mounted={Math.abs(index - activeIndex) <= 1}
          />
        </section>
      ))}
    </main>
  )
}
