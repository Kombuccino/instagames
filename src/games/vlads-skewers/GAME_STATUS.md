# Les Brochettes de Vlad — Suivi

Mis à jour : 12 septembre 2026 à 11:08 Europe/Paris. Version de cette passe : `0.3.4`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Bras : le sprite décoratif reste décalé de `24` unités vers le bas afin que sa limite raster ne puisse pas apparaître au bord inférieur. La main, la zone de prise et la géométrie jouable ne bougent pas.
- Spawn : les ingrédients sont créés au-dessus du MASTER ; leur apparition n'est plus visible au bord supérieur avant leur chute dans la scène.
- Brochette `0.3.4` : longueur resserrée à `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`. La longueur est calculée au plus près des centres de pile (`54 + 43 × rang`) afin que la capacité visuelle corresponde réellement au nombre demandé.
- Validation `0.3.4` : une recette complète reste dans la main pendant `1 s`. Pendant cette seconde, `findTipContact` est neutralisé et la pointe ne peut ni embrocher ni blesser un ingrédient supplémentaire. La livraison automatique démarre seulement après ce temps de lecture.
- Patience : au moment de compléter la recette, le client reçoit au minimum `1,25 s` de patience restante pour éviter qu'une commande finie expire pendant le temps de présentation.
- Sang `0.3.4` : l'ancien dessin cercle/triangle est remplacé par une grosse goutte construite sur grille de `2 px`, contour bordeaux très sombre, rouge saturé et reflet clair. Aucun lissage géométrique.
- Cohérence pixel : harpon, brochette, pile et bras sont davantage quantifiés sur coordonnées entières ; les éléments procéduraux ajoutés dans cette passe utilisent une granularité commune de `2 px`. Les assets raster existants restent inchangés ; une harmonisation artistique plus large de leurs tailles de pixels relève d'une passe assets dédiée si elle reste nécessaire après contrôle en jeu.
- Collision : seule l'extrémité logique du harpon embroche. Aucune hitbox visible.
- Orientation : chaque ingrédient conserve l'angle capturé au percement.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

La fenêtre de gameplay `390 × 662` peut être ancrée `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. `center` reste le défaut ; Vlad déclare `bottom`.

## Passe `0.3.4`

Base inspectée avant travail : `242d2d45ab720994218a2c89f043d7329c0ceb65` sur `main`.

Fichiers de production concernés :

- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- `src/games/vlads-skewers/definition.ts`
- `src/games/vlads-skewers/CHANGELOG.md`
- `src/games/vlads-skewers/GAME_STATUS.md`
- `src/games/vlads-skewers/ART_DIRECTION.md`
- `src/games/vlads-skewers/ASSET_MANIFEST.md`
- test navigateur Vlad si nécessaire.

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- recette 2 ingrédients : pique `110`, recette 5 : pique `230`, sans impression d'espace pour deux aliments supplémentaires ;
- immédiatement après le 5e ingrédient : pile encore visible, `completedLock=true`, aucun nouveau contact possible ;
- après environ `1 s` : livraison automatique, score/client mis à jour une seule fois ;
- goutte de sang immédiatement lisible comme telle en capture téléphone et PC ;
- aucune régression sur l'ancrage bas, la main, les angles d'ingrédients ou le scoring.
