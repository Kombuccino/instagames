# Les Brochettes de Vlad — Suivi

Mis à jour : 11 septembre 2026 à 23:38 Europe/Paris. Version de cette passe : `0.3.3`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Bras : correctif `0.3.3` — le sprite décoratif est décalé de `24` unités vers le bas afin que sa limite raster ne puisse plus apparaître au bord inférieur. La main, la zone de prise et la géométrie jouable ne bougent pas.
- Spawn : les ingrédients sont créés plusieurs dizaines d'unités au-dessus du MASTER ; leur apparition n'est plus visible au bord supérieur avant leur chute dans la scène.
- Brochette : longueur liée à la commande active — `170 / 215 / 260 / 300` unités pour `2 / 3 / 4 / 5` ingrédients. La tige est ramenée à `14` unités de largeur et se termine par une petite tête de harpon pixel art.
- Collision : seule l'extrémité logique du harpon embroche. Le petit carré jaune de debug a disparu ; la hitbox existe toujours mais n'est plus dessinée.
- Orientation : chaque ingrédient conserve l'angle capturé au percement, y compris le dernier d'une recette qui part immédiatement en livraison.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

La fenêtre de gameplay `390 × 662` peut être ancrée `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. `center` reste le défaut ; Vlad déclare `bottom`.

Le contrat est documenté dans `docs/MINIFUGG_ZONES.md` et `docs/GAME_LAYOUT_SYSTEM.md`. Sur mobile, la largeur pilote toujours l'échelle ; la hauteur ne doit pas rétrécir silencieusement le jeu. Sur PC, la fenêtre de 662 unités pilote l'échelle, plafonnée par la largeur disponible.

## Passe `0.3.3`

Base inspectée avant travail : `ccaf019e60a90e88eeba208f268b1ae399f03f9e` sur `main`.

Fichiers concernés :

- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- `src/games/vlads-skewers/definition.ts`
- `src/games/vlads-skewers/CHANGELOG.md`
- `src/games/vlads-skewers/GAME_STATUS.md`

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- A54 Brave / Chrome : aucune bordure basse du sprite de bras visible ;
- main et grip visuellement au même endroit qu'en `0.3.2` ;
- portée, harpon, hitbox invisible, longueur variable de pique et scoring inchangés.
