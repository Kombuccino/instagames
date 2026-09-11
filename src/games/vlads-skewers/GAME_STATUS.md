# Les Brochettes de Vlad — Suivi

Mis à jour : 11 septembre 2026 à 19:05 Europe/Paris. Version livrée : `0.3.0`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Gameplay : migration Phaser fonctionnelle et testée ; la présentation visuelle gameplay reste distincte du présent lot cover et conserve son historique dans `ART_DIRECTION.md` / `CHANGELOG.md`.
- Covers : **5 éditions validées par l'utilisateur le 10 septembre 2026 et branchées dans le feed MiniFugg**.
- Core sélectionne une édition de manière `seeded`. Toutes sont disponibles immédiatement (`unlockScore: 0`), statiques, avec `fit: contain` pour préserver les compositions et titres approuvés.

## Covers en production

Les fichiers ci-dessous proviennent du pipeline privé Drive → GitHub et sont utilisés tels quels dans le feed :

1. `public/assets/imported/vlads-skewers/welcome/variants/vlad-cover-01-chaos-approved-2026-09-10.png`
2. `public/assets/imported/vlads-skewers/welcome/variants/vlad-cover-02-still-life-approved-2026-09-10.png`
3. `public/assets/imported/vlads-skewers/welcome/variants/vlad-cover-03-japanese-portrait-approved-2026-09-10.png`
4. `public/assets/imported/vlads-skewers/welcome/variants/vlad-cover-04-castle-sign-approved-2026-09-10.png`
5. `public/assets/imported/vlads-skewers/welcome/variants/vlad-cover-05-japanese-stall-approved-2026-09-10.png`

Les dérivés `390 × 844` existent aussi sous `variants/masters/` et `variants/runtime/`, mais le feed utilise volontairement les PNG approuvés exacts afin de ne pas altérer le grain, la matière de papier/peinture ou la composition. Les anciens placeholders et études rejetées ne sont pas utilisés.

## Transport / incident résolu

Le 10 septembre, le sync Drive a d'abord échoué à cause de deux dossiers homonymes `vlads-skewers/welcome/variants`. La collision a été corrigée côté Drive ; le dossier canonique contient les cinq PNG approuvés ainsi que les sous-dossiers `masters/` et `runtime/`. La synchronisation GitHub est maintenant effective et les cinq PNG sont présents sous `public/assets/imported/`.

## Livraison 0.3.0

- nouveau `welcome.ts` propriétaire du jeu ;
- placeholder remplacé par les cinq covers validées ;
- `migration.cover` passé à `current` ;
- version produit passée à `0.3.0` avec date Europe/Paris ;
- aucun changement de gameplay dans ce lot.

Prochaine action cover : aucune. Toute future modification d'une cover validée doit repartir de l'original approuvé et nécessite une nouvelle validation utilisateur.
