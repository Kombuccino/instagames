import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES, placeholderWelcome } from '../../core/gameDefinitionDefaults'
import { CrazyPapers } from './CrazyPapers'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'crazy-papers',
  title: 'CrazyPapers',
  description: 'Monte en grade · trie 5 services · survis aux liasses',
  author: 'MiniFugg',
  status: 'fugg',
  orientation: 'portrait',
  runtime: 'phaser-2d',
  logicalViewport: { width: 390, height: 844 },
  migration: {
    state: 'in-progress',
    targetRuntime: 'phaser-2d',
    locked: true,
    cover: 'update-required',
  },
  welcome: placeholderWelcome('crazy-papers'),
  component: CrazyPapers,
  release: {
    version: '0.4.0',
    updatedAt: '2026-09-11T18:45:00+02:00',
    changelogPath: 'src/games/crazy-papers/CHANGELOG.md',
  },
  instructions: {
    goal: 'Épuise chaque charge de travail, monte en grade et traite un maximum de documents avant que la paperasse ne recouvre le bureau.',
    rules: [
      'Cinq services existent : COMPTABILITÉ, ÉTAT CIVIL, URBANISME, RESSOURCES HUMAINES et AFFAIRES JURIDIQUES.',
      'Chaque service possède quatre familles de documents qui se débloquent progressivement.',
      'Un document peut être reconnu par son intitulé, sa couleur, sa mise en page, son contenu ou son symbole ; il garde toujours au moins un indice utile.',
      'Quand toute la charge d’un niveau est réellement épuisée, tu es promu : la pile suivante est plus grosse, le courrier arrive plus vite et les indices diminuent.',
      'Des événements peuvent ajouter une liasse, faire passer un dossier urgent devant les autres ou dupliquer un dossier avec la photocopieuse folle.',
      'Un mauvais service fait revenir le dossier avec un cachet rouge et ajoute du travail pendant que le supérieur t’engueule.',
      'La pression est physique : les piles montent, des feuilles débordent, puis une vague de paperasse descend sur la zone de jeu. À 24 dossiers, elle recouvre le bureau et la partie se termine.',
    ],
    controls: ['Tape sur l’un des 5 tampons de service', 'Clavier : 1 COMPTA · 2 CIVIL · 3 URBA · 4 RH · 5 JURIDIQUE'],
  },
  features: STANDARD_FEATURES,
}
