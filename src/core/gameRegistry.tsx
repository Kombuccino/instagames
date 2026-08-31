import type { InstagameDefinition } from './types'
import { DriftDot, HoldZone, NeonTap } from '../games/demo/DemoGames'

// Temporary smoke-test games. Real 10-prompt games will replace these entries.
export const gameRegistry: InstagameDefinition[] = [
  {
    id: 'demo-neon-tap',
    title: 'Void Tap',
    description: 'Prototype runtime · tap to score',
    author: 'instagames',
    component: NeonTap,
  },
  {
    id: 'demo-hold-zone',
    title: 'Hold',
    description: 'Prototype runtime · press and survive',
    author: 'instagames',
    component: HoldZone,
  },
  {
    id: 'demo-drift-dot',
    title: 'Signal',
    description: 'Prototype runtime · catch the moving dot',
    author: 'instagames',
    component: DriftDot,
  },
]
