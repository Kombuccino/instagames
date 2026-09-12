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
    version: '0.3.7',
    updatedAt: '2026-09-12T12:05:00+02:00',
    changelogPath: 'src/games/vlads-skewers/CHANGELOG.md',
  },
  instructions: {
    goal: 'Prépare les brochettes demandées et sers le plus de clients possible.',
    rules: [
      'Empale les ingrédients dans l’ordre exact de la commande.',
      'Chaque ingrédient glisse jusqu’à la garde puis la brochette s’empile vers la pointe.',
      'Les bras et jambes embrochés suivent la gravité Matter et réagissent aux déplacements de la brochette sans impulsion artificielle.',
      'Quand la brochette est complète, elle reste protégée une seconde avant de partir au client.',
      'Un mauvais ingrédient ou de l’ail fait perdre le client.',
      'Le sang redonne de la patience et ralentit temporairement la chute.',
      'Au 3e client perdu, le service est terminé.',
    ],
    controls: ['Maintiens et glisse pour déplacer la brochette', 'Empale avec la pointe', 'Brochette complète : observe-la puis elle part automatiquement'],
  },
  features: STANDARD_FEATURES,
}
