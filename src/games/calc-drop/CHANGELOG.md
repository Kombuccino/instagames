# TetraMindFck — Changelog

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
