# Les Brochettes de Vlad — Suivi

Mis à jour : 12 septembre 2026 à 12:05 Europe/Paris. Version de cette passe : `0.3.7`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Brochette : longueur `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`; les ingrédients glissent depuis la pointe jusqu'à la garde puis s'empilent vers l'apex.
- Membres : chaque bras/jambe embroché utilise deux corps Matter et deux contraintes. La gravité reste en coordonnées monde et la pile/les collisions de gameplay restent séparées de ces corps invisibles.
- Correctif `0.3.7` : le mouvement excessif venait d'une double injection d'inertie. Le déplacement de l'ancrage physique suffisait déjà à créer le retard du membre, mais le runtime ajoutait en plus une force issue de l'accélération souris/doigt, avec des pics très élevés entre deux frames.
- Inertie `0.3.7` : cette force additionnelle est supprimée. L'ancrage est repositionné avec `updateVelocity=false`, donc un saut de pointeur ne crée plus une vélocité artificielle gigantesque dans Matter.
- Amortissement `0.3.7` : contraintes légèrement moins rigides et plus amorties (`.78/.72`, damping `.12/.10`) ; friction d'air relevée. Les vitesses des nœuds invisibles sont plafonnées à `5,5` (articulation) et `7` (extrémité) afin d'éviter les explosions numériques tout en gardant le fouettement naturel.
- Validation : une recette complète reste dans la main pendant `1 s`, protégée contre tout nouveau contact, puis part automatiquement.
- Sang : grosse goutte construite sur grille de `2 px`, contour bordeaux très sombre, rouge saturé et reflet clair.
- Collision : seule l'extrémité logique du harpon embroche. Aucune hitbox visible.
- Orientation : chaque ingrédient conserve l'angle capturé au percement.
- Covers : 5 éditions validées restent actives dans le feed ; cette passe ne les modifie pas.

## Architecture transversale

`PhaserGameHost` accepte une configuration `physics` optionnelle. Vlad active Matter explicitement ; les autres jeux ne sont pas affectés par ce correctif.

La fenêtre de gameplay `390 × 662` reste ancrable `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. Vlad reste `bottom`.

## Passe `0.3.7`

Base inspectée avant travail : `9977a383a0067840e3559db6c613964bd5960ad5` sur `main`.

Fichiers de production concernés :

- `src/games/vlads-skewers/VladsSkewersRuntime.ts`
- `src/games/vlads-skewers/definition.ts`
- `src/games/vlads-skewers/CHANGELOG.md`
- `src/games/vlads-skewers/GAME_STATUS.md`

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- au repos, relaxation identique à la bonne physique `0.3.6` ;
- déplacement horizontal rapide : retard/fouettement lisible, mais aucune rotation explosive ni emballement ;
- retournement brusque : changement de sens progressif via contraintes, sans « 40 milliards de newtons » ;
- `limbMaxSpeed` reste borné par les limites runtime ;
- aucune régression sur l'empilement à la garde, la seconde protégée, le score ou les longueurs de broche.
