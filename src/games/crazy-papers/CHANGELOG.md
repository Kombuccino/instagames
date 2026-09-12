# CrazyPapers — Changelog

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
