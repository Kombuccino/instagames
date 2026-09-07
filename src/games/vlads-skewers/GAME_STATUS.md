# Les Brochettes de Vlad — Suivi

Mis à jour : 7 septembre 2026. Base initiale : `62947acacd03ecb3ae487160c9a2faa246417990`. Contrat réconcilié : `ART_DIRECTION.md`.

Phase gameplay : migration Phaser 4 et passe corrective de production artistique terminées, validation navigateur passée. La première publication web du 7 septembre a été rejetée visuellement par l'utilisateur (composition cassée, aliments minuscules et pièces procédurales inadéquates) ; elle ne constitue pas une version approuvée. Registre : `fugg`, stage 390 × 844, runtime `phaser-2d`, migration `current` déverrouillée. Phase cover : C validée et à préserver ; A/B/D encore à explorer ; intégration Core des covers non faite.

## Gameplay livré

- Composition inspirée de `Vlad-DA1.png`, piques de vie de `Vlad-DA-Piques.png` à gauche, pixel art de `VLAD-DA-pixelisee.png`.
- Ancien renderer DOM et ses cinq CSS supprimés au profit d'une scène Phaser unique, nearest-neighbour, Core Audio et `PhaserGameHost`.
- Onze corps d'aliments sans visage/membres intégrés : bœuf, poivron, champignon, tomate, oignon, courgette, aubergine, ail, poulet, tofu, poisson.
- Yeux, bouche, bras, jambes et marques de grille séparés et animés. Arc joie → compréhension → panique ; liens/repousses entre voisins ; yeux en croix et membres inertiels sur la broche. La bave séparée est exclusivement réservée aux clients.
- Cuisson appétissante avec couleur chaude et marques de grille, puis charbon/cendre/disparition pour les aliments ratés.
- Quinze clients distincts, salivants et sautillants dans les loges de droite.
- Cinq paliers visuels et sonores jusqu'à ×5 `BRUTALITY!`, sans changement du scoring.
- Trois piques de réserve à gauche ; une seule tombe par client/brochette raté.
- Pointe visible, collision et pile partagent exactement le même axe ; le bras reste raccordé au bas du stage et revient automatiquement en bas au relâchement.

## Validation gameplay

Le 7 septembre 2026 :

- build TypeScript/Vite réussi ;
- tests Core Audio réussis ;
- `scripts/test-vlads-skewers-browser.mjs` réussi sur téléphone tactile émulé et bureau souris ;
- véritable empalement par la pointe avec contre-test décalé de 18 px, retour automatique du bras, roster 15, pile ×5 cuite, perte de pique, cuisson/charbon/cendre et disparition validés ;
- score historique vérifié : brochette de 5 (base 10) × combo 5 = 50 ; l'empalement seul n'ajoute aucun point ;
- aucune erreur console ou ressource dans la matrice testée.

Captures locales : `artifacts/vlads-skewers/`. Limite : émulation navigateur, pas un GPU/tactile physique.

## Cover validée et travaux restants

**C — affiche graphique / éditoriale** est validée explicitement. Master exact : `vlad-cover-c-graphic-poster-approved-2026-09-07.png`, 941 × 1672 RGB PNG, SHA-256 `582db78b3abd6d9724cb6261fa6c1563f3e5a4542ed5a3d639c982dabb5c1872`.

Archive privée : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-validated/`, Drive fichier `1blXf0mUKernZn8eQpa8oWXEpFQTOehKM`, dossier `1o5SBto8zGF_fx7FaUTvn9wcEjBpaF7OZ`. Ne pas régénérer ce master.

A/B/D doivent être trois masters portrait individuels plus simples, éditoriaux et distincts du gameplay. Les rejets et planches 2×2 restent archivés ; ne pas les réutiliser comme références positives.

## Prochaines actions

1. Publier la passe corrective et faire sa revue utilisateur sur le web ; ne considérer le gameplay approuvé qu'après cette revue.
2. Intégrer la cover C exacte au Core quand son asset de production est disponible localement, puis poursuivre A/B/D séparément.
3. Valider gameplay et audio sur téléphone physique.

Aucun blocage gameplay. La cover du registre reste `update-required` tant que le master C n'est pas branché au runtime.
