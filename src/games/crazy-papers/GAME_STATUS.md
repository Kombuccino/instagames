# CrazyPapers — Suivi de création

Mis à jour : 11 septembre 2026, passe en cours. Base inspectée avant édition : `6e0b51c727fdb16fc47a2d8e4fcd08d65cca1e21` (`main`).

## Décision active

Le retour utilisateur du 11 septembre remplace la simple limite invisible de backlog par une pression **hybride et physique** : les piles montent, des feuilles débordent dans la zone de jeu, puis une masse de paperasse descend depuis le haut et recouvre progressivement CENTRE. À saturation, la paperasse couvre la zone jouable et empêche le tri avant l'écran de résultat.

## Migration runtime

CrazyPapers était encore `legacy-dom` et `migration.locked: true`. Les règles MiniFugg interdisent d'ajouter cette nouvelle mécanique au renderer legacy. Cette passe migre donc le gameplay complet vers Phaser 4.2.1 sur le stage logique `390 × 844`, avec React limité au `PhaserGameHost`.

Mécaniques à préserver pendant la migration : 5 services, 20 familles de documents, indices dégressifs, niveaux/promotions, arrivée accélérée quand la pile est vide, erreurs qui reviennent, pénalité de travail supplémentaire et trois événements surprise.

## Pression hybride implémentée dans la scène Phaser

- trois piles visibles grandissent avec la queue ;
- au-delà de 8 dossiers, des feuilles débordent autour du document actif ;
- à partir d'environ 55 % de 24 dossiers, un rideau de paperasse descend sur CENTRE ;
- à 24 dossiers, les inputs sont gelés, le rideau finit de couvrir CENTRE, puis `session.finish` est appelé ;
- la pression reste entièrement dérivée de la queue réelle, donc erreurs et surprises peuvent accélérer visuellement la submersion.

## État de cette branche

Migration candidate en cours de validation. Tant que le build GitHub n'est pas vert, `migration.state` reste `in-progress` et `locked: true`. Après validation, la même branche devra passer CrazyPapers en `migration.state: current`, ajouter la release/changelog puis être intégrée à `main`.

Cover : `update-required`, indépendamment de cette migration gameplay.
