import type { InstagameDefinition } from './types'
import { LineFugg } from '../games/linefugg/LineFugg'

export const gameRegistry: InstagameDefinition[] = [
  {
    id: 'linefugg',
    title: 'LineFugg',
    description: '3 traits · fais le plus gros score',
    author: 'MiniFugg',
    component: LineFugg,
  },
]
