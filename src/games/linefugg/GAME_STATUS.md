# LineFugg — Suivi de création

Mis à jour : 16 septembre 2026 à 15:44 Europe/Paris. Version : `0.8.2`. Changelog : `CHANGELOG.md`.

## État actuel

Le LineFugg publié revient volontairement au runtime **classique Orbital Accounting** qui servait de référence fonctionnelle avant Solar Origami. Les règles, l’équilibrage et les contrôles ne changent pas. Solar Origami est conservé dans Git et dans ses assets comme cas d’étude d’un pipeline DA/intégration raté ; ce n’est plus la direction active du jeu classique.

En parallèle, **LineFugg — Rebirth** est traité comme un nouveau chantier de production à partir de ce jeu classique pris comme prototype évolué. Rebirth n’a actuellement **ni DA ni Release** : le Production Lab doit d’abord décrire honnêtement le prototype, ses situations, ses règles, ses états et ses dépendances avant toute nouvelle recherche artistique.

## Prototype de référence

- stage logique Phaser : `390 × 844` ;
- grille `7 × 7`, déterministe par jour ;
- exactement trois lignes, de 2 à 5 cases, horizontales / verticales / diagonales ;
- calcul appliqué dans le sens du tracé ;
- une seule case partagée maximum par paire de lignes ;
- distribution : 68 % positifs `1…9`, 16 % négatifs `−1…−4`, 12 % multiplicateurs `×2/×3`, 4 % diviseurs `÷2/÷3` ;
- après chaque ligne : cases jouées protégées, cases libres retirées de manière déterministe, flip en cascade et préparation visuelle de la prochaine ligne ;
- après la troisième ligne : aucune résolution automatique, Undo reste possible, puis validation explicite ;
- Undo restaure aussi le plateau et les états de dimension antérieurs ;
- score final = somme des trois résultats.

Sources de référence : branche `linefugg-classic-reference`, `LineFuggScene.ts`, `definition.ts`, `ART_DIRECTION.md` et `ASSET_MANIFEST.md` restaurés pour le jeu classique.

## Production Lab / Rebirth

Le plan canonique doit être synchronisé à chaque décision sémantique ou visuelle significative. À ce stade :

- **Covers** : existantes, ensemble séparé ;
- **Proto** : en cours d’analyse détaillée dans le Lab ;
- **DA** : vide tant qu’aucune nouvelle direction n’est réellement produite ;
- **Release** : vide tant qu’aucune intégration Rebirth n’existe.

Prochaine action : finir la lecture sémantique du prototype dans le Lab, puis seulement lancer une nouvelle exploration DA Rebirth à partir de ce contrat visible.
