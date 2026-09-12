import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES } from '../../core/gameDefinitionDefaults'
import { TetraMindFck } from './TetraMindFck'
import { TETRAMINDFCK_WELCOME } from './welcome'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'tetramindfck',
  title: 'TetraMindFck',
  description: 'Complète des lignes · fabrique des calculs monstrueux',
  author: 'MiniFugg',
  status: 'fugg',
  orientation: 'portrait',
  runtime: 'phaser-2d',
  logicalViewport: { width: 390, height: 844 },
  migration: {
    state: 'in-progress',
    targetRuntime: 'phaser-2d',
    locked: true,
    cover: 'current',
  },
  welcome: TETRAMINDFCK_WELCOME,
  component: TetraMindFck,
  release: {
    version: '0.5.0',
    updatedAt: '2026-09-12T11:20:13+02:00',
    changelogPath: 'src/games/calc-drop/CHANGELOG.md',
  },
  instructions: {
    goal: 'Atteins l’objectif avec le score total d’un seul clear : 50, puis 100, puis +100 à chaque niveau.',
    rules: [
      'Les cases numériques vont de 1 à 9 ; il y a deux fois plus de multiplicateurs que de diviseurs parmi les opérateurs.',
      'Complète une ou plusieurs lignes horizontales : chaque ligne est calculée puis les scores des lignes du même clear sont additionnés.',
      'Le calcul se lit de gauche à droite : les chiffres s’ajoutent, les × et ÷ modifient le total.',
      '⇄ inverse le sens du calcul. Effacer plusieurs lignes d’un coup peut créer des bonus plus puissants.',
      'Le score total d’un seul clear doit atteindre l’objectif courant. Un gros clear peut franchir plusieurs objectifs d’un coup.',
      'Premier objectif : 50. Deuxième : 100. Ensuite 200, 300, 400… La chute accélère avec les niveaux.',
      'Le score global de la partie reste la somme de tous les clears pour le classement.',
      'Si les pièces atteignent le haut de la grille, la partie est terminée.',
    ],
    controls: ['← → déplacer', '↓ accélérer la chute', '↺ ↻ tourner', 'Clavier : flèches, Z et X'],
  },
  features: STANDARD_FEATURES,
}
