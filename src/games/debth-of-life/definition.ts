import type { InstagameDefinition } from '../../core/types'
import { STANDARD_FEATURES, placeholderWelcome } from '../../core/gameDefinitionDefaults'
import { DebthOfLife } from './DebthOfLife'

/** Game-owned catalog data. Core only assembles these definitions. */
export const gameDefinition: InstagameDefinition = {
  id: 'debth-of-life',
  title: 'DebthOfLife',
  description: 'Cours ta vie · signe tes choix en sautant · meurs avec le meilleur bilan',
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
  welcome: placeholderWelcome('debth-of-life'),
  component: DebthOfLife,
  instructions: {
    goal: 'Atteins 85 ans avec le meilleur patrimoine net possible.',
    rules: [
      'Tu cours automatiquement et tu ne peux que sauter.',
      'Chaque grand panneau propose deux choix de vie : rester au sol signe le contrat du bas, sauter signe celui du haut.',
      'Aucun choix n’est simplement bon ou mauvais : dette, salaire, cash et actifs peuvent évoluer en même temps.',
      'Les factures dans la route coûtent de l’argent ; les pièces en euros génèrent du revenu et remboursent automatiquement une partie de la dette.',
      'Plus tu vieillis, moins tu cours vite et moins tu sautes haut : certains choix deviennent mécaniquement plus difficiles à atteindre.',
      'Plus la dette pèse lourd, plus la zone rouge te rattrape depuis la gauche. Le score final est banque + actifs − dette.',
    ],
    controls: ['Maintiens SAUTER pour viser le contrat du haut', 'Relâche tôt pour rester plus bas', 'Clavier : Espace, ↑, W ou Z'],
  },
  features: STANDARD_FEATURES,
}
