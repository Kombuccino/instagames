import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES, placeholderWelcome } from '../../core/gameDefinitionDefaults'
import { HariRottenTeeth } from './HariRottenTeeth'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'hari-rotten-teeth',
  title: 'HARI les dents pourries',
  description: 'Aligne les bonbons · pourris toute la mâchoire',
  author: 'MiniFugg',
  status: 'beta',
  orientation: 'portrait',
  runtime: 'legacy-dom',
  logicalViewport: { width: 390, height: 844 },
  migration: {
    state: 'required',
    targetRuntime: 'phaser-2d',
    locked: true,
    cover: 'update-required',
  },
  welcome: placeholderWelcome('hari-rotten-teeth'),
  component: HariRottenTeeth,
  instructions: {
    goal: 'Aligne les bonbons pour pourrir toutes les dents de HARI.',
    rules: [
      'Les pièces contiennent 3 bonbons.',
      'Aligne au moins 3 bonbons identiques, dans n’importe quelle direction.',
      'Les bonbons détruits abîment les dents correspondantes.',
      'Pourris les 8 dents pour passer au niveau suivant.',
      'Si les bonbons atteignent le haut de la grille, la partie est terminée.',
    ],
    controls: ['← → déplacer', '↓ accélérer', '↔ changer l’orientation', '↻ changer l’ordre des bonbons'],
  },
  features: STANDARD_FEATURES,
}
