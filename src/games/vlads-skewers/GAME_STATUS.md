# Les Brochettes de Vlad — Suivi

Mis à jour : 12 septembre 2026 à 11:39 Europe/Paris. Version de cette passe : `0.3.5`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Bras : le sprite décoratif reste décalé de `24` unités vers le bas afin que sa limite raster ne puisse pas apparaître au bord inférieur. La main, la zone de prise et la géométrie jouable ne bougent pas.
- Spawn : les ingrédients sont créés au-dessus du MASTER ; leur apparition n'est plus visible au bord supérieur avant leur chute dans la scène.
- Brochette : longueur `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`.
- Empilement `0.3.5` : le premier ingrédient glisse depuis son point d'impact jusqu'à la garde. Les suivants occupent les emplacements successifs au-dessus, vers la pointe. La pile ne se construit plus depuis le haut de la tige.
- Animation d'entrée : le point de perforation et l'orientation capturée sont conservés pendant tout le glissement. Les anciens offsets de poussée depuis la pointe sont neutralisés.
- Livraison : après la seconde de protection, la brochette part depuis cette disposition contre la garde ; le départ ne fait plus remonter artificiellement la pile vers l'apex.
- Validation : une recette complète reste dans la main pendant `1 s`. Pendant cette seconde, `findTipContact` est neutralisé et la pointe ne peut ni embrocher ni blesser un ingrédient supplémentaire.
- Patience : au moment de compléter la recette, le client reçoit au minimum `1,25 s` de patience restante pour éviter qu'une commande finie expire pendant le temps de présentation.
- Sang : grosse goutte construite sur grille de `2 px`, contour bordeaux très sombre, rouge saturé et reflet clair.
- Cohérence pixel : harpon, brochette, pile et bras sont quantifiés sur coordonnées entières ; les éléments procéduraux de cette passe restent sur la granularité commune.
- Collision : seule l'extrémité logique du harpon embroche. Aucune hitbox visible.
- Orientation : chaque ingrédient conserve l'angle capturé au percement.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

La fenêtre de gameplay `390 × 662` peut être ancrée `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. `center` reste le défaut ; Vlad déclare `bottom`.

## Passe `0.3.5`

Base inspectée avant travail : `81b4aa23830e3c7591da7b72b3ac7a03f84a4316` sur `main`.

Fichiers de production concernés :

- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- `src/games/vlads-skewers/definition.ts`
- `src/games/vlads-skewers/CHANGELOG.md`
- `src/games/vlads-skewers/GAME_STATUS.md`

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- un ingrédient seul termine près de la garde et non près de la pointe ;
- pour 4–5 ingrédients, les positions progressent de la garde vers l'apex dans l'ordre d'empalement ;
- pendant le glissement, le point de perforation et l'angle ne sont pas recentrés ;
- après le temps protégé d'une seconde, la livraison démarre sans saut de la pile vers le haut ;
- aucune régression sur les longueurs de broche, la protection de fin, l'ancrage bas ou le scoring.
