import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES, placeholderWelcome } from '../../core/gameDefinitionDefaults'
import { ShootTheShooter } from './ShootTheShooter'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'shoot-the-shooter',
  title: 'Shoot the Shooter',
  description: 'Bois, mémorise, tiens jusqu’au blackout',
  author: 'MiniFugg',
  status: 'trash',
  orientation: 'landscape',
  runtime: 'legacy-dom',
  logicalViewport: { width: 844, height: 390 },
  migration: {
    state: 'required',
    targetRuntime: 'phaser-2d',
    locked: true,
    cover: 'update-required',
  },
  welcome: placeholderWelcome('shoot-the-shooter'),
  component: ShootTheShooter,
  instructions: {
    goal: 'Bois un maximum de shooters sans finir à 100% d’alcool ni rater 3 verres.',
    rules: [
      'Les effets des shooters sont cachés jusqu’à ce que tu les goûtes.',
      'Tape quand le verre que tu veux boire passe sur la cible.',
      'Certains shooters font très mal, d’autres peuvent te dégriser.',
      '3 verres ratés ou 100% d’alcool : partie terminée.',
      'Si tu arrêtes de boire trop longtemps, c’est Last Call.',
    ],
    controls: ['Tape au bon moment', 'Clavier : Espace ou Entrée'],
  },
  features: STANDARD_FEATURES,
}
