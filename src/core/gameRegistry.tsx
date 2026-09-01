import type { InstagameDefinition } from './types'
import { LineFugg } from '../games/linefugg/LineFugg'
import { ShootTheShooter } from '../games/shoot-the-shooter/ShootTheShooter'

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
        'Une ligne contient au maximum 5 cases.',
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
  {
    id: 'shoot-the-shooter',
    title: 'Shoot the Shooter',
    description: 'Bois, mémorise, tiens jusqu’au blackout',
    author: 'MiniFugg',
    component: ShootTheShooter,
    instructions: {
      goal: 'Bois le plus de shooters possible sans atteindre 100% d’alcool et sans laisser la ligne s’arrêter.',
      rules: [
        'Chaque partie contient seulement 3 à 5 recettes. Leur carte complète reste visible sous la ligne.',
        'Les effets restent inconnus jusqu’au premier verre bu : plusieurs faibles, un qui dégrise et un très violent.',
        'Les verres arrivent de gauche. Tape quand celui que tu veux boire croise le point de visée près de la main.',
        'Rater un verre ralentit immédiatement la ligne. Boire lui redonne de la vitesse.',
        'Le point de visée commence à dériver dès que l’alcool monte et devient imprévisible près du coma.',
        'Dès 30%, une vague colorée et une pixellisation mouvante brouillent progressivement les liquides.',
        'À 100% d’alcool : coma éthylique et fin immédiate. Si la ligne s’arrête : Last Call.',
      ],
      controls: ['Tape n’importe où sur la ligne au moment où le verre croise la cible', 'Clavier : Espace ou Entrée'],
    },
    features: {
      help: true,
      leaderboard: {
        enabled: true,
        scope: 'global',
        sort: 'desc',
        limit: 10,
      },
      share: false,
      comments: false,
      remix: false,
    },
  },
]
