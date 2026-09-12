# TetraMindFck — Changelog

## 0.7.1 — 2026-09-12 21:44 Europe/Paris

- Rétablissement immédiat du cadrage `cover` validé pour les quatre affiches : elles remplissent de nouveau le cadre à leur échelle normale.
- Suppression du rendu `contain` et de ses marges diffuses, qui réduisaient visuellement les jaquettes sur PC.

## 0.7.0 — 2026-09-12 21:35 Europe/Paris

- Première mini-tranche de la refonte gameplay rétro portable / CRT directement dans la scène Phaser.
- Nouveau shell crème temporaire, écran principal vert, rail gauche `LEVEL / TARGET / NEXT / NEXT+1` et score total large au-dessus de la grille.
- Les chiffres `1–9` utilisent désormais une même famille phosphore vert lavé ; les multiplicateurs, diviseurs et bonus ne se distinguent que par des accents CRT retenus.
- Les cases restent strictement carrées et alignées sur la grille `10 × 20`; les previews sont centrées par leurs vraies dimensions et acceptent la pièce I de quatre cases.
- Les quatre commandes principales sont alignées sur une seule rangée basse avec espacement serré ; `DOWN` est plus petit et placé sous les déplacements.
- L’animation de clear conserve la grille figée pendant le calcul et reprend la palette CRT.
- Aucun nouvel asset raster runtime n’est introduit dans cette tranche : PNG reste réservé aux sources/masters et les futurs dérivés runtime seront WebP lossless par défaut.

## 0.6.1 — 2026-09-12 21:17 Europe/Paris

- Conservation intégrale des quatre affiches statiques sur les cadres PC plus larges, avec prolongement diffus à l’extérieur du master.
- Le titre et le personnage principal restent lisibles au-dessus de la nouvelle console Core pleine largeur.

## 0.6.0 — 2026-09-12 18:56 Europe/Paris

- Ajout de l’édition japonaise validée à la collection de covers statiques.
- Le master conserve uniquement le titre localisé `テトラマインドファック`, avec une composition manga violet/orange prolongée naturellement jusque dans BAS.
- La nouvelle édition utilise un master PNG `390 × 844` et un dérivé WebP lossless `780 × 1688`, sans CTA, logo Core, faux cadre ni animation.

## 0.5.0 — 2026-09-12

- Mise en production des trois covers statiques validées : pulp européen, boîte micro 90s et affiche graphique.
- Conservation des compositions d'origine, suppression de `SWIPE TO PLAY` et prolongement propre du bas pour le recadrage MiniFugg.
- Retrait des faux cadres et coins abîmés ; la matière papier ou peinture interne reste intacte.
- Suppression du runtime Phaser des covers animées et de leurs anciens calques.
- La quatrième direction japonaise est retrouvée comme référence, mais reste hors production tant que son master autonome manque.

## 0.4.0 — 2026-09-10

- Migration du gameplay vers une scène Phaser 4 en stage logique fixe `390 × 844`.
- Nouvelle progression : l'objectif doit être atteint par le **score total d'un seul clear** ; seuils `50`, `100`, puis `200`, `300`, `400`…
- Un gros clear peut franchir plusieurs objectifs d'un coup.
- Le score global de partie reste cumulatif pour le classement.
- Les cases numériques vont désormais uniquement de `1` à `9` ; suppression du `0`.
- Répartition des opérateurs : deux fois plus de multiplicateurs que de diviseurs (`2:1`).
- Conservation du 7-bag, des deux pièces suivantes, des bonus multi-lignes, du sens inversé, du lock en 3 ticks et de l'animation de calcul avant la chute des blocs.
