import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES } from '../../core/gameDefinitionDefaults'
import { VladsSkewers } from './VladsSkewers'
import { VLADS_SKEWERS_WELCOME } from './welcome'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'vlads-skewers',
  title: 'Les Brochettes de Vlad',
  description: 'Empale la commande · évite l’ail',
  author: 'MiniFugg',
  status: 'fugg',
  orientation: 'portrait',
  runtime: 'phaser-2d',
  logicalViewport: { width: 390, height: 844 },
  migration: {
    state: 'current',
    targetRuntime: 'phaser-2d',
    locked: false,
    cover: 'current',
  },
  welcome: VLADS_SKEWERS_WELCOME,
  component: VladsSkewers,
  release: {
    version: '0.3.2',
    updatedAt: '2026-09-11T23:06:00+02:00',
    changelogPath: 'src/games/vlads-skewers/CHANGELOG.md',
  },
  instructions: {
    goal: 'Prépare les brochettes demandées et sers le plus de clients possible.',
    rules: [
      'Empale les ingrédients dans l’ordre exact de la commande.',
      'Quand la brochette est complète, apporte-la au client.',
      'Un mauvais ingrédient ou de l’ail fait perdre le client.',
      'Le sang redonne de la patience et ralentit temporairement la chute.',
      'Au 3e client perdu, le service est terminé.',
    ],
    controls: ['Maintiens et glisse pour déplacer la brochette', 'Empale avec la pointe', 'Brochette complète : va jusqu’au client'],
  },
  features: STANDARD_FEATURES,
}
