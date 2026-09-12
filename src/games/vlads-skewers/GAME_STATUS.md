# Les Brochettes de Vlad — Suivi

Mis à jour : 12 septembre 2026 à 11:54 Europe/Paris. Version de cette passe : `0.3.6`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Brochette : longueur `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`; les ingrédients glissent depuis la pointe jusqu'à la garde puis s'empilent vers l'apex.
- Membres `0.3.6` : le vieux solveur angulaire maison est neutralisé. Chaque bras/jambe embroché utilise deux petits corps Matter reliés par deux contraintes, avec une épaule/hanche cinématique attachée au corps de l'aliment.
- Gravité : Matter applique la gravité en coordonnées monde ; les mains/pieds retombent vers le bas de l'écran même si l'aliment est embroché de travers ou tête en bas.
- Inertie : le déplacement réel de la broche déplace l'ancrage physique, et l'accélération souris/doigt injecte une impulsion opposée. Les membres doivent donc laguer, fouetter et changer de sens avec le geste au lieu de jouer une oscillation préfabriquée.
- Physique isolée : les corps de membres sont invisibles, sans collision (`mask: 0`) et n'interfèrent ni avec les aliments qui tombent, ni avec la hitbox de pointe, ni avec le score. Ils sont supprimés quand la pile est perdue ou livrée.
- Validation : une recette complète reste dans la main pendant `1 s`, protégée contre tout nouveau contact, puis part automatiquement.
- Sang : grosse goutte construite sur grille de `2 px`, contour bordeaux très sombre, rouge saturé et reflet clair.
- Collision : seule l'extrémité logique du harpon embroche. Aucune hitbox visible.
- Orientation : chaque ingrédient conserve l'angle capturé au percement.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

`PhaserGameHost` accepte désormais une configuration `physics` optionnelle. Les jeux qui n'en ont pas besoin restent inchangés ; Vlad active Matter explicitement avec gravité, contraintes renforcées et debug désactivé.

La fenêtre de gameplay `390 × 662` reste ancrable `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. Vlad reste `bottom`.

## Passe `0.3.6`

Base inspectée avant travail : `5b62f5926c2bdbe34bc8034d97f4c7dcae356199` sur `main`.

Fichiers de production concernés :

- `src/core/runtime/PhaserGameHost.tsx`
- `src/games/vlads-skewers/VladsSkewers.tsx`
- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- `src/games/vlads-skewers/definition.ts`
- `src/games/vlads-skewers/CHANGELOG.md`
- `src/games/vlads-skewers/GAME_STATUS.md`

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- au repos, les quatre membres pendent vers le bas du monde ;
- un grand mouvement horizontal fait partir mains/pieds en retard dans le sens opposé, puis les contraintes les ramènent sans téléportation ;
- un retournement brusque produit un vrai fouettement et non une sinusoïde répétitive ;
- aucun corps Matter de membre ne collisionne avec le gameplay ;
- perte et livraison nettoient tous les corps/contraintes ;
- aucune régression sur l'empilement à la garde, la seconde protégée, le score ou les longueurs de broche.
