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
      love: true,
      comments: true,
      bookmark: true,
      leaderboard: {
        enabled: true,
        periods: ['daily', 'weekly'],
        sort: 'desc',
        limit: 10,
      },
      share: false,
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
      goal: 'Bois le plus de shooters possible sans atteindre 100% d’alcool et sans faire trois erreurs.',
      rules: [
        'Chaque partie contient exactement 5 recettes : trois faibles, une qui dégrise et une très violente.',
        'La carte complète reste visible, mais l’effet d’un shoot reste ??? jusqu’à ce que tu l’aies goûté.',
        'Les cinq silhouettes de verre sont différentes : même si les couleurs deviennent douteuses, tu peux encore apprendre leurs formes.',
        'Les verres arrivent de gauche. Tape quand celui que tu veux boire croise le point de visée près de la main.',
        'Tu as trois erreurs possibles. Au troisième verre raté, la partie s’arrête.',
        'Boire régulièrement maintient la vitesse de croisière. La ligne ne ralentit que si tu arrêtes réellement de boire pendant plusieurs secondes.',
        'Le point de visée commence à dériver dès que l’alcool monte ; dès 30%, vague colorée et pixellisation brouillent les liquides.',
        'À 100% d’alcool : coma éthylique et fin immédiate. Si tu ne bois plus assez longtemps : Last Call.',
      ],
      controls: ['Tape n’importe où sur la ligne au moment où le verre croise la cible', 'Clavier : Espace ou Entrée'],
    },
    features: {
      help: true,
      love: true,
      comments: true,
      bookmark: true,
      leaderboard: {
        enabled: true,
        periods: ['daily', 'weekly'],
        sort: 'desc',
        limit: 10,
      },
      share: false,
      remix: false,
    },
  },
]
