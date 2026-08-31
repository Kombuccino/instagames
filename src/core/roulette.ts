import type { InstagameDefinition } from './types'

export type RouletteSlot = {
  key: string
  game: InstagameDefinition
  seed: number
}

function randomSeed() {
  return Math.floor(Math.random() * 2_147_483_647)
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}

export function buildRouletteBatch(
  games: InstagameDefinition[],
  batchNumber: number,
  previousGameId?: string,
): RouletteSlot[] {
  if (games.length === 0) return []

  let shuffled = shuffle(games)
  if (games.length > 1 && shuffled[0]?.id === previousGameId) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }

  return shuffled.map((game, index) => ({
    key: `${batchNumber}-${index}-${game.id}-${randomSeed()}`,
    game,
    seed: randomSeed(),
  }))
}
