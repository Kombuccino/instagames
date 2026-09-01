import type { InstagameDefinition } from './types'
import { LineFugg } from '../games/linefugg/LineFugg'

export const gameRegistry: InstagameDefinition[] = [
  {
    id: 'linefugg',
    title: 'LineFugg',
    description: '3 traits · fais le plus gros score',
    author: 'MiniFugg',
    component: LineFugg,
    instructions: {
      goal: 'Trace trois lignes pour fabriquer le plus gros score possible sur la grille du jour.',
      rules: [
        'Une ligne est horizontale, verticale ou diagonale.',
        'Une ligne contient au maximum 6 cases.',
        'Le calcul suit le sens de la flèche.',
        'Deux lignes peuvent partager au maximum une case.',
        'Ton score final est la somme des trois lignes.',
      ],
      controls: ['Glisse d’une case vers une autre', 'Relâche pour valider', 'Annuler avant le 3e trait'],
    },
    features: {
      help: true,
      leaderboard: {
        enabled: true,
        scope: 'daily',
        sort: 'desc',
        limit: 10,
      },
      share: false,
      comments: false,
      remix: false,
    },
  },
]
