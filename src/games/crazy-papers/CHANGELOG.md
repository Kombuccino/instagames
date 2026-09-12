# CrazyPapers — Changelog

## 0.4.1 — 12 septembre 2026

- Correction du cadrage Phaser sur écrans haute densité : le gameplay logique `390 × 844` remplit de nouveau toute la largeur utile au lieu d'occuper seulement le quart supérieur gauche du canvas.
- CrazyPapers force provisoirement son backbuffer à `1×` tant que sa scène n'applique pas elle-même la compensation de DPR ; la géométrie, les hitboxes et le gameplay restent inchangés.
- Le scaling MiniFugg commun reste inchangé : largeur pilotée sur mobile, fenêtre de 662 unités pilotée par la hauteur sur desktop.

## 0.4.0 — 11 septembre 2026

- Gameplay migré de l’ancien renderer DOM/CSS vers Phaser 4 sur le stage logique `390 × 844`.
- Nouvelle pression hybride : piles physiques qui montent, feuilles qui débordent à forte charge, puis rideau de paperasse descendant sur CENTRE.
- À 24 dossiers en attente, les inputs sont gelés, la paperasse termine sa descente et recouvre la zone jouable avant la fin de partie.
- Conservation des cinq services, vingt familles de documents, indices dégressifs, niveaux/promotions, retours d’erreur et trois événements surprise.
- Ancien CSS gameplay supprimé ; React ne conserve que le host Phaser.
