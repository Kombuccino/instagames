# Les Brochettes de Vlad — Suivi

Mis à jour : 11 septembre 2026 à 23:06 Europe/Paris. Version de cette passe : `0.3.2`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise maintenant l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Spawn : les ingrédients sont créés plusieurs dizaines d'unités au-dessus du MASTER ; leur apparition n'est plus visible au bord supérieur avant leur chute dans la scène.
- Brochette : longueur liée à la commande active — `170 / 215 / 260 / 300` unités pour `2 / 3 / 4 / 5` ingrédients. La tige est ramenée à `14` unités de largeur et se termine par une petite tête de harpon pixel art.
- Collision : seule l'extrémité logique du harpon embroche. Le petit carré jaune de debug a disparu ; la hitbox existe toujours mais n'est plus dessinée.
- Orientation : chaque ingrédient conserve l'angle capturé au percement, y compris le dernier d'une recette qui part immédiatement en livraison.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

Cette demande a révélé que la fenêtre de gameplay `390 × 662` ne doit pas être implicitement centrée pour tous les Fuggs. Le Core expose désormais un ancrage `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. `center` reste le défaut ; Vlad déclare `bottom`.

Le contrat est documenté dans `docs/MINIFUGG_ZONES.md` et `docs/GAME_LAYOUT_SYSTEM.md`. Sur mobile, la largeur pilote toujours l'échelle ; la hauteur ne doit plus rétrécir silencieusement le jeu. Sur PC, la fenêtre de 662 unités pilote l'échelle, plafonnée par la largeur disponible.

## Passe `0.3.2`

Base inspectée avant travail : `ab8199a79fec5f5952c69b11223956b7133bc40c` sur `main`.

Fichiers de production concernés :

- `src/core/runtime/gameRuntimePolicy.ts`
- `src/core/runtime/PhaserGameHost.tsx`
- `src/games/vlads-skewers/VladsSkewers.tsx`
- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- documentation layout/DA/release associée.

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts sur la branche combinée ;
- A54 Brave `360 × 611` : largeur occupée intégralement et bas du jeu conservé ;
- A54 Chrome `360 × 656` : même largeur et davantage de haut révélé ;
- MASTER `390 × 844` : scène complète ;
- PC 16:9 : largeur plafonnée par le cadre MiniFugg et ancrage bas inchangé ;
- recette 2 ingrédients : pique courte `170`, recette 5 : pique `300` ;
- aucun marqueur jaune visible à la pointe, mais l'apex continue d'être la seule collision ;
- apparition des aliments entièrement hors écran.
