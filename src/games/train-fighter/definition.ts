import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES, placeholderWelcome } from '../../core/gameDefinitionDefaults'
import { TrainFighter } from './TrainFighter'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'train-fighter',
  title: 'Train Fighter',
  description: 'Change de voie · équipe ton train · choisis tes bastons',
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
  welcome: placeholderWelcome('train-fighter'),
  component: TrainFighter,
  instructions: {
    goal: 'Traverse les 4 mondes avec le plus de wagons possible et transforme ta petite loco en machine à baffes.',
    rules: [
      'Ton train avance tout seul : LEFT et RIGHT servent uniquement à changer de voie.',
      'Les wagons derrière ta locomotive sont ta vie. Un combat trop difficile peut en décrocher plusieurs.',
      'Percute les pièces, armes, wagons, boucliers et turbos que tu veux récupérer.',
      'Les trains ennemis se battent automatiquement si tu restes sur leur voie. Une meilleure arme et l’armure réduisent les dégâts.',
      'Entre les mondes, la station te permet de dépenser tes pièces en wagon, arme ou armure.',
      'Traverse Mossy Forest, Red Canyon, Cloud Mountain puis Aurora Pass pour terminer la partie.',
    ],
    controls: ['LEFT / RIGHT pour changer de voie', 'Clavier : ← →, A/D ou Q/D'],
  },
  features: STANDARD_FEATURES,
}
