# TetraMindFck — Changelog

## 0.8.5 — 2026-09-17 13:05 Europe/Paris

- Les quatre covers actives appliquent le cadrage validé dans Cover Calibration pour la cible `390 × 850` et la fenêtre garantie `390 × 710` : `top / 4.3 % / 3.1 % / 2.5 %`.
- Les sources historiques `390 × 844` et leurs dérivés restent inchangés. Cette passe ne régénère aucune cover.
- Les quatre éditions restent marquées pour une adaptation de source : le logo est encore coupé sur chaque cover ; l’édition japonaise devra probablement aussi réduire légèrement son logo.

Vérifié : export Cover Calibration du 17 septembre 2026 puis `test:repository` et build Frontend Build sur le lot de livraison.

## 0.8.4 — 2026-09-14 08:55 Europe/Paris

- La coque de composition utilise désormais toute la largeur logique `390 px` sans bandes latérales de décor.
- Le grand CRT est élargi à `289 px`; le plateau passe réellement à des cellules de `25.2 px` et un cadrage `252 × 504`, au lieu d’être uniquement remaquetté par le skin.
- Le rail gauche est resserré à `72 px` de largeur pour maximiser la zone de jeu.
- Les quatre gros boutons utilisent des rectangles visibles identiques `87 × 62` sur une seule ligne; `DOWN` est centré sous le duo gauche/droite.
- Les hitboxes des cinq boutons sont maintenant construites exactement sur leurs rectangles d’affichage, et ne dépendent plus des dimensions source des textures.
- La géométrie de scène, les FX de clear, le lock meter et le skin utilisent désormais les mêmes coordonnées.
- Gameplay, scoring, RNG, vitesse, bonus et lock restent inchangés.

## 0.8.3 — 2026-09-14 01:10 Europe/Paris

- Reprise de la géométrie avant toute nouvelle passe artistique : le grand CRT passe à presque toute la largeur utile, le rail gauche est compacté et les marges décoratives sont réduites.
- Le plateau utilise désormais des cellules de `25 px` sur un cadrage `250 × 500`, recentré dans un CRT principal `290 px` de large.
- Les quatre gros boutons utilisent une seule ligne cohérente avec largeur identique et espacement régulier ; `DOWN` est aligné dessous sur la même logique de taille.
- `LEVEL`, `TARGET`, `NEXT` et `NEXT+1` sont repositionnés sur un rail plus étroit, avec previews agrandies.
- Cette passe reste un gabarit de composition : la matière finale de la DA sera réappliquée seulement après validation de cette géométrie.
- Gameplay, scoring, RNG, vitesse, bonus et lock restent inchangés.

## 0.8.2 — 2026-09-14 00:53 Europe/Paris

- Retrait du pack structurel incohérent coque + plate CRT du rendu final ; il reste archivé comme essai mais n’est plus utilisé pour définir la géométrie runtime.
- Reconstruction d’une console canonique unique directement sur le stage logique `390 × 844`, avec cinq ouvertures CRT cohérentes et une coque continue.
- Suppression des scanlines raster du grand écran : le seul motif linéaire conservé dans la zone de jeu est désormais le vrai quadrillage `10 × 20`.
- Conservation du fond décoratif, des boutons raster `up/down` et des atlas digits/opérateurs ; gameplay inchangé.

## 0.8.1 — 2026-09-13 23:31 Europe/Paris

- Remplacement des cases Phaser provisoires par les vrais atlas raster : chiffres `1–9`, multiplicateurs, diviseurs et bonus utilisent désormais les sprites CRT produits pour la DA.
- `NEXT` et `NEXT+1` utilisent les mêmes tuiles raster que le plateau, en taille plus lisible, au lieu de petits rectangles et textes reconstruits.
- Intégration de la vraie plate CRT et du fond décoratif séparé ; les cinq écrans restent alignés sur les ouvertures de la coque canonique.
- Les cinq contrôles utilisent désormais leurs deux états raster distincts `up/down` à emprise identique, sans compression artificielle ni cadre debug.
- Gameplay, RNG, scoring, objectifs, accélération, bonus et lock restent inchangés.

## 0.8.0 — 2026-09-13 10:48 Europe/Paris

- Intégration de la coque raster CRT dans la scène Phaser en remplacement du blockout géométrique temporaire.
- Tous les CRT sont désormais dimensionnés directement sur les ouvertures mesurées de la coque afin qu’aucun décor de fond n’apparaisse entre l’écran et son logement.
- Les cinq contrôles utilisent les assets de boutons importés et remplissent leurs logements réels ; l’état appuyé conserve exactement la même emprise avec une compression mécanique légère.
- La grille `10 × 20` est recalée à l’intérieur du grand CRT avec des cellules carrées, et le score reste dans la bande supérieure du même écran.
- `LEVEL`, `TARGET`, `NEXT` et `NEXT+1` utilisent les quatre ouvertures CRT latérales réelles ; les previews restent centrées et acceptent la pièce I de quatre cases.
- Gameplay, RNG, scoring, objectifs de clear, accélération, bonus et lock en 3 ticks restent inchangés.
