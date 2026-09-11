# Les Brochettes de Vlad — Suivi

Mis à jour : 11 septembre 2026 à 19:48 Europe/Paris. Version livrée : `0.3.1`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Covers : 5 éditions validées et actives dans le feed MiniFugg. Le runtime utilise désormais les dérivés lossless **exactement `390 × 844`** de `public/assets/imported/vlads-skewers/welcome/variants/runtime/`, avec `fit: cover` ; les masters PNG restent conservés dans `variants/masters/`.
- Sélection cover : `seeded`, toutes les variantes disponibles immédiatement (`unlockScore: 0`), aucune animation de cover.
- Gameplay : correction `0.3.1` de l'orientation sur brochette. L'angle capturé est appliqué dès l'ajout de chaque ingrédient, avant une éventuelle livraison automatique dans la même frame ; tous les ingrédients gardent donc leur orientation d'impact.

## Covers runtime

1. `public/assets/imported/vlads-skewers/welcome/variants/runtime/vlad-cover-01-chaos.webp`
2. `public/assets/imported/vlads-skewers/welcome/variants/runtime/vlad-cover-02-still-life.webp`
3. `public/assets/imported/vlads-skewers/welcome/variants/runtime/vlad-cover-03-japanese-portrait.webp`
4. `public/assets/imported/vlads-skewers/welcome/variants/runtime/vlad-cover-04-castle-sign.webp`
5. `public/assets/imported/vlads-skewers/welcome/variants/runtime/vlad-cover-05-japanese-stall.webp`

Les cinq fichiers sont des WebP lossless `390 × 844` issus des masters validés. Les PNG source grand format synchronisés à la racine de `variants/` restent disponibles comme provenance, mais ne sont plus utilisés directement par le feed.

## Correctif brochette 0.3.1

Le moteur stockait déjà `baseRotation` pour chaque ingrédient. Le défaut apparaissait sur l'ingrédient terminant une recette : la livraison pouvait être déclenchée immédiatement après `addStackFood`, avant le prochain `updateSkewer()` qui appliquait normalement cette rotation au nouveau container. Le correctif applique donc l'angle capturé immédiatement à l'entrée dans la pile ; le comportement des autres ingrédients, du scoring et de la livraison reste inchangé.

## Vérification attendue

- Build CI de la livraison `0.3.1`.
- Contrôle visuel : les cinq covers remplissent le MASTER Cover sans letterbox/blur de `contain`.
- Contrôle gameplay : une recette de 2 à 5 ingrédients avec angles différents conserve chaque angle, y compris celui du dernier ingrédient avant le vol vers le client.
