# CrazyPapers — Suivi de création

Mis à jour : 11 septembre 2026 à 18:45 Europe/Paris. Version livrable : `0.4.0`. Base inspectée avant édition : `6e0b51c727fdb16fc47a2d8e4fcd08d65cca1e21` (`main`).

## Décision active

Le retour utilisateur du 11 septembre remplace la simple limite invisible de backlog par une pression **hybride et physique** : les piles montent, des feuilles débordent dans la zone de jeu, puis une masse de paperasse descend depuis le haut et recouvre progressivement CENTRE. À saturation, la paperasse couvre la zone jouable et empêche le tri avant l'écran de résultat.

## Runtime et migration

CrazyPapers était `legacy-dom` avec `migration.locked: true`. La nouvelle mécanique n'a pas été ajoutée au renderer legacy : le gameplay a été reconstruit en Phaser 4.2.1 sur le stage logique `390 × 844`, avec React limité au `PhaserGameHost`. L'ancien `CrazyPapers.css` est supprimé.

Mécaniques conservées : 5 services, 20 familles de documents, indices dégressifs, niveaux/promotions, arrivée accélérée quand la pile est vide, erreurs qui reviennent, pénalité de travail supplémentaire et trois événements surprise.

## Pression hybride implémentée

- trois piles visibles grandissent avec la queue ;
- au-delà de 8 dossiers, des feuilles débordent autour du document actif ;
- à partir d'environ 55 % de 24 dossiers, un rideau de paperasse descend sur CENTRE ;
- à 24 dossiers, les inputs sont gelés, le rideau finit de couvrir CENTRE en environ 0,5 s, puis `session.finish` est appelé ;
- la pression est dérivée de la queue réelle : erreurs, liasses, urgence et photocopieuse peuvent accélérer visuellement la submersion.

## Vérification

PR de validation : `#4`. Commit candidat : `a8c4754b0335243c80aaab426142f004f96a2fc7`.

GitHub Actions `Frontend Build` run `34624907789` : `npm install`, `npm run test:repository` et `npm run build` réussis. Cette passe n'a pas de navigateur interactif connecté au build ; la géométrie, le tactile et la sensation de la vague doivent encore être vérifiés dans l'application déployée avant de marquer la migration `current`.

Pour cette raison, le jeu est bien passé sur `runtime: phaser-2d` mais reste provisoirement `migration.state: in-progress` et `locked: true`. C'est un verrou de validation, pas un second renderer : le DOM/CSS legacy n'existe plus en production.

Cover : `update-required`, indépendamment de cette migration gameplay. La phase jaquettes reste séparée.

## Prochaine action

Test utilisateur du jeu en ligne : lisibilité du document, taille des 5 tampons, vitesse de la montée des piles, seuil de débordement et descente de la vague. Après validation de ces points, passer `migration.state` à `current` et `locked` à `false` sans réintroduire de renderer parallèle.
