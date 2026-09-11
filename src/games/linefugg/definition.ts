import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES } from '../../core/gameDefinitionDefaults'
import { LineFugg } from './LineFugg'
import { LINEFUGG_WELCOME } from './welcome'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'linefugg',
  title: 'LineFugg',
  description: '3 traits · fais le plus gros score',
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
  welcome: LINEFUGG_WELCOME,
  component: LineFugg,
  release: {
    version: '0.5.2',
    updatedAt: '2026-09-11T20:01:00+02:00',
    changelogPath: 'src/games/linefugg/CHANGELOG.md',
  },
  instructions: {
    goal: 'Trace 3 lignes et fabrique le plus gros score possible.',
    rules: [
      'Chaque ligne peut faire jusqu’à 5 cases, en horizontal, vertical ou diagonal.',
      'Le calcul se fait dans le sens de la flèche.',
      'Deux lignes peuvent se croiser sur une seule case.',
      'Ton score final est la somme de tes 3 lignes.',
    ],
    controls: ['Glisse pour tracer une ligne', 'Relâche pour valider', 'Annule avant le 3e trait'],
  },
  features: STANDARD_FEATURES,
}
