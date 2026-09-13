# Les Brochettes de Vlad — Suivi

Mis à jour : 13 septembre 2026 à 14:36 Europe/Paris. Version de cette passe : `0.4.2`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad reste `bottom` ; largeur logique fixe `390`, variations de hauteur absorbées par le haut.
- Brochette : `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`, pile depuis la garde, validation protégée `1 s`.
- Membres : Matter à deux segments, gravité monde, aucune impulsion souris artificielle, vitesses bornées.
- Collision : seul l'apex du harpon embroche ; aucune hitbox visible.
- Covers : cinq éditions validées, statiques, plein cadre.

## Passe gameplay `0.4.2` — tour clients approuvée

- Base inspectée : `6ebbb81093fff984babfcfda2529bcdeb72aa640` sur `main`.
- Référence utilisateur : DA `853 × 1844` renvoyée le 13 septembre 2026 ; la bande droite avec les cinq personnages est l'autorité stricte pour cette passe. Les essais régénérés intermédiaires ne sont pas des références.
- Assets vérifiés dans le repo après le pipeline Drive → GitHub :
  - `public/assets/imported/vlads-skewers/backgrounds/vlad-customer-tower.png` (`188 × 1360` source) ;
  - `public/assets/imported/vlads-skewers/sprites/vlad-customer-atlas.png` (`192 × 1250`, 5 frames verticales `192 × 250`).
- Traduction mesurée de la DA vers le stage : tour `x=304`, `y=55`, `86 × 622`; lignes de base clients `184 / 297 / 416 / 529 / 645`.
- File inversée : `customers[0]`, le client actif, occupe désormais la loge du haut ; les suivants remplissent les cases en descendant.
- Personnages : le ratio source `192:250` est conservé (`88 × 114` logiques). Aucun angle animé, aucun scale pulsé, déplacement uniquement entier (`0/1/2 px`) pour éviter les pixels bleutés/halos pendant le mouvement.
- Tour : asset authored posé sous les clients ; les intérieurs des cinq niches sont assombris sous les sprites afin qu'aucun fragment de l'ancien détourage ne puisse apparaître dans une case vide.
- Commande : cartouche ramené dans la zone haute de la DA (`x=240`, `y=128`, `136 × 58`) ; jusqu'à cinq ingrédients sur une broche horizontale et horloge de patience intégrée à droite du même panneau.
- Bave : l'overlay Phaser reste ancré à la bouche des cinq portraits approuvés. La collecte vers le seau reste une animation/FX séparée à finaliser ; elle n'est pas baked dans l'architecture.
- Impacts : pas de phrase lors de l'embrochement ; petites remarques seulement au grill, comme décidé en `0.4.1`.
- Gameplay non modifié : score, recettes, vitesse, collisions, physique Matter, vies et livraison restent identiques.

## Vérification de livraison

- CI attendue : `npm run test:repository` et build TypeScript/Vite.
- À contrôler visuellement en jeu : tour droite alignée à la référence, client actif en haut, cinq silhouettes contenues dans leurs niches, aucun redimensionnement carré des portraits, aucun mouvement subpixel/rotation des clients, cartouche 2→5 ingrédients lisible avec timer intégré.
- Le build vert ne vaut pas validation artistique : la référence utilisateur reste l'autorité pour la revue à l'écran.

## Passe gameplay `0.4.1`

- Clients ramenés dans leurs loges, bave réancrée à la bouche, commande compactée, paroles d'embrochement supprimées, commentaires réservés au grill.
- Cette passe est partiellement remplacée visuellement par `0.4.2` pour la tour, les portraits, l'ordre des clients et le placement de la commande.

## Passe covers `0.4.0`

- Cinq sources approuvées du 10 septembre conservées ; masters `390×844` et runtime WebP lossless actifs dans le feed.
- Contrôles effectués sur mobile court, MASTER et bureau ; cette passe gameplay ne modifie aucune cover.
