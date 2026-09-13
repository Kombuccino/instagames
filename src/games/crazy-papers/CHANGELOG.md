# CrazyPapers — Changelog

## 0.5.2 — 13 septembre 2026

- Application des six cadrages validés dans l’outil de calage, dont deux ancrages BAS complets.
- Pour les cinq éditions dont le nouveau cadrage coupe le titre, Core conserve exactement le bandeau-titre de la source et le fond dans la position choisie.
- Les six sources, masters PNG et WebP lossless restent inchangés ; aucune cover n’est redessinée ou réinterprétée.

## 0.5.1 — 13 septembre 2026

- La cover `Constructivist Clerk` conserve son image approuvée intacte mais emploie désormais un cadrage focal : le personnage reste visible au-dessus du pupitre PLAY fixe sur mobile court comme sur PC.
- Les cinq autres covers gardent leur ancrage supérieur validé ; aucune illustration, aucun titre et aucun asset raster n'est modifié.
- La matrice de contrôle inspecte maintenant les six éditions dans chaque format et mesure le vrai pupitre Core fixe, après sa sortie de la cover individuelle.

## 0.5.0 — 12 septembre 2026

- Six covers illustrées validées intégrées comme collection statique Core.
- Masters PNG `390 × 844` et dérivés WebP lossless `780 × 1688`, fabriqués depuis les sources approuvées sans régénération.
- Sélection stable par emplacement du feed, recadrage ancré en haut et suppression de la cover provisoire.
- La migration cover passe à `current` ; aucun runtime de cover animé n'est ajouté.

## 0.4.1 — 12 septembre 2026

- Correction du rendu haute densité : la caméra Phaser applique maintenant le même facteur de densité que le canvas créé par `PhaserGameHost`.
- Le monde logique `390 × 844` remplit de nouveau toute la surface de jeu sur écrans DPR2/DPR3, sans bandes internes à droite ou en bas.
- Aucun changement de gameplay, de géométrie logique, de scoring ou de règles.

## 0.4.0 — 11 septembre 2026

- Gameplay migré de l’ancien renderer DOM/CSS vers Phaser 4 sur le stage logique `390 × 844`.
- Nouvelle pression hybride : piles physiques qui montent, feuilles qui débordent à forte charge, puis rideau de paperasse descendant sur CENTRE.
- À 24 dossiers en attente, les inputs sont gelés, la paperasse termine sa descente et recouvre la zone jouable avant la fin de partie.
- Conservation des cinq services, vingt familles de documents, indices dégressifs, niveaux/promotions, retours d’erreur et trois événements surprise.
- Ancien CSS gameplay supprimé ; React ne conserve que le host Phaser.
