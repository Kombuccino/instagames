import type { InstagameDefinition } from './types'
import { gameDefinition as trainFighter } from '../games/train-fighter/definition'
import { gameDefinition as lineFugg } from '../games/linefugg/definition'
import { gameDefinition as shootTheShooter } from '../games/shoot-the-shooter/definition'
import { gameDefinition as vladsSkewers } from '../games/vlads-skewers/definition'
import { gameDefinition as hariRottenTeeth } from '../games/hari-rotten-teeth/definition'
import { gameDefinition as tetraMindFck } from '../games/calc-drop/definition'
import { gameDefinition as crazyPapers } from '../games/crazy-papers/definition'
import { gameDefinition as debthOfLife } from '../games/debth-of-life/definition'

// Stable catalog order. Edit a game in its own definition.ts, not in Core.
export const gameRegistry: InstagameDefinition[] = [
  trainFighter,
  lineFugg,
  shootTheShooter,
  vladsSkewers,
  hariRottenTeeth,
  tetraMindFck,
  crazyPapers,
  debthOfLife,
]
