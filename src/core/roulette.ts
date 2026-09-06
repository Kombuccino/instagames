import type { InstagameDefinition } from './types'

export type RouletteSlot = {
  key: string
  game: InstagameDefinition
  seed: number
}

const TARGET_BATCH_SIZE = 10

function randomSeed() {
  return Math.floor(Math.random() * 2_147_483_647)
}

function pickOne(games: InstagameDefinition[], previousGameId?: string) {
  if (games.length === 0) return undefined
  const withoutPrevious = games.length > 1 ? games.filter((game) => game.id !== previousGameId) : games
  const pool = withoutPrevious.length ? withoutPrevious : games
  return pool[Math.floor(Math.random() * pool.length)]
}

function weightedPick(games: InstagameDefinition[], coinBalance: number, previousGameId?: string) {
  const fugg = games.filter((game) => (game.status ?? 'fugg') === 'fugg')
  const beta = games.filter((game) => game.status === 'beta')
  const trash = games.filter((game) => game.status === 'trash')

  if (coinBalance > 0) {
    // Product target: approximately 90% Fugg / 10% Bêta while coins remain.
    const requestedPool = Math.random() < .1 ? beta : fugg
    return pickOne(requestedPool.length ? requestedPool : [...fugg, ...beta, ...trash], previousGameId)
  }

  // At zero coins, keep the real paid catalog visible while making roughly half
  // of discovery immediately playable through Caca titles.
  if (Math.random() < .5 && trash.length) return pickOne(trash, previousGameId)

  const paid = [...fugg, ...beta]
  return pickOne(paid.length ? paid : trash, previousGameId)
}

export function buildRouletteBatch(
  games: InstagameDefinition[],
  batchNumber: number,
  coinBalance: number,
  previousGameId?: string,
): RouletteSlot[] {
  if (games.length === 0) return []

  const slots: RouletteSlot[] = []
  let previous = previousGameId
  const count = Math.max(TARGET_BATCH_SIZE, games.length)

  for (let index = 0; index < count; index += 1) {
    const game = weightedPick(games, coinBalance, previous) ?? games[0]
    slots.push({
      key: `${batchNumber}-${index}-${game.id}-${randomSeed()}`,
      game,
      seed: randomSeed(),
    })
    previous = game.id
  }

  return slots
}
