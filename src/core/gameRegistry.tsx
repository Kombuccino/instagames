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
        'Tape quand un shooter arrive à portée de la main au centre.',
        'Chaque silhouette de verre et chaque liquide cache une recette et un effet alcool différent.',
        'L’effet d’une recette n’est révélé qu’après l’avoir bue une première fois.',
        'Les rares shooters qui dégrisent font baisser fortement le taux d’alcool.',
        'Chaque shoot relance la ligne. Si tu arrêtes de boire, elle ralentit progressivement jusqu’au Last Call.',
        'À 100% d’alcool : coma éthylique et fin immédiate.',
        'Plus le taux monte, plus les verres et la main bougent, la vision se dédouble et le timing devient précis.',
      ],
      controls: ['Tape n’importe où sur la ligne quand la main peut saisir le verre', 'Clavier : Espace ou Entrée'],
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
