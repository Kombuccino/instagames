# Les Brochettes de Vlad — Changelog

## [0.3.5] — 2026-09-12 11:39 Europe/Paris

- Les ingrédients ne s'empilent plus à partir de la pointe : chaque nouvel aliment entre par l'apex puis **glisse jusqu'à la garde**.
- Le premier ingrédient reste contre la garde ; les suivants s'empilent progressivement vers le haut de la tige, comme une vraie brochette.
- Le déplacement d'entrée conserve le point de perforation et l'orientation propre de chaque aliment.
- La livraison après la seconde de protection part désormais directement depuis cette pile adossée à la garde, sans remontée visuelle vers la pointe.

## [0.3.4] — 2026-09-12 11:08 Europe/Paris

- La brochette est raccourcie beaucoup plus strictement : `110 / 150 / 190 / 230` unités pour des recettes de `2 / 3 / 4 / 5` ingrédients, avec une tige ramenée à `10` unités de largeur. Sa capacité visuelle correspond désormais réellement à la commande, sans place apparente pour un ou deux aliments supplémentaires.
- Une recette complète reste visible et protégée pendant `1 s` avant la livraison automatique. Durant cette seconde, la pointe n'accepte plus aucune collision : aucun ingrédient supplémentaire ne peut ruiner accidentellement une brochette déjà validée.
- La patience du client reçoit un minimum de sécurité pendant ce court temps de présentation afin qu'une recette terminée ne puisse pas expirer entre la validation et le départ.
- La goutte de sang est entièrement redessinée comme une grosse goutte pixel-art construite sur grille de `2 px`, avec contour sombre, masse rouge saturée et reflet clair ; les anciennes primitives lissées cercle/triangle sont supprimées.
- Le harpon, la pile et le bras sont davantage quantifiés sur des coordonnées entières pour éviter les décalages subpixel et rapprocher la granularité des éléments procéduraux du reste de la scène.

## [0.3.3] — 2026-09-11 23:38 Europe/Paris

- Le sprite décoratif du bras de Vlad est descendu de `24` unités pour que sa bordure basse reste masquée sous l'écran sur les viewports ancrés en bas.
- La main, la zone de prise, la brochette, les collisions et la portée de gameplay restent strictement inchangées.

## [0.3.2] — 2026-09-11 23:06 Europe/Paris

- Vlad est désormais ancré sur le bas du stage : la largeur logique reste fixe à `390`, tandis que les différences de hauteur navigateur/PWA/app sont absorbées au-dessus du grill et de la main.
- Les ingrédients apparaissent hors écran au-dessus du MASTER avant d'entrer naturellement dans le champ de chute.
- La pique adapte sa longueur à la recette (`170 / 215 / 260 / 300` pour `2 / 3 / 4 / 5` ingrédients), avec une tige plus fine et une pointe en petit harpon pixel art.
- Le marqueur jaune de hitbox a disparu : seule l'extrémité logique invisible du harpon conserve la collision d'empalement.
- Le Core Phaser accepte maintenant un ancrage vertical `top | center | bottom` réutilisable par les autres Fuggs sans changer leur monde logique ni leur largeur canonique.

## [0.3.1] — 2026-09-11 19:48 Europe/Paris

- Le feed utilise maintenant les cinq dérivés runtime lossless exactement `390 × 844` avec `fit: cover`, au lieu des sources grand format affichées en `contain`.
- Chaque ingrédient embroché reçoit immédiatement l'orientation qu'il avait au moment du percement ; le dernier ingrédient d'une recette complète ne peut plus être remis à plat avant la livraison automatique.

## [0.3.0] — 2026-09-11 19:05 Europe/Paris

- Mise en production des cinq covers validées le 10 septembre 2026 dans le feed MiniFugg.
- Les cinq éditions utilisent les PNG approuvés exacts synchronisés par le pipeline Drive → GitHub ; aucune régénération, recoloration ou compression destructive n'est appliquée.
- Présentation statique Core avec `fit: contain`, rotation `seeded`, toutes les éditions disponibles immédiatement.
- Migration cover passée de `update-required` à `current`.

## [0.2.0] — 2026-09-08 14:48 Europe/Paris

- L'embrochement ne fonctionne plus qu'en remontant par dessous et conserve exactement le point de pénétration : une prise excentrée produit une brochette visiblement bancale.
- Ajout du score cumulatif `1 + 2 + 6 + 24 + 120`, puis du multiplicateur moyen de beauté `×0,8` à `×3,5` calculé selon le centrage de chaque ingrédient.
- Les coups descendants lacèrent et affolent les ingrédients sans les capturer ; les membres embrochés deviennent des ragdolls à deux articulations soumis à la gravité.
- Une brochette terminée part immédiatement vers le client tandis qu'une nouvelle pique jouable apparaît ; la commande a été compactée et la patience remplacée par une petite horloge sectorielle.

Références : `Vlad-DA1.png`, `Vlad-DA-Piques.png`, `VLAD-DA-pixelisee.png` et décisions validées dans `ART_DIRECTION.md`.

Vérifié : build de production, scénarios navigateur téléphone tactile et bureau souris, score déterministe de `383`, puis contrôle du bundle déployé.

Livraison : `ec0c049` sur `main`.
