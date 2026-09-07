# Les Brochettes de Vlad — Suivi

Mis à jour : 7 septembre 2026. Base initiale : `62947acacd03ecb3ae487160c9a2faa246417990`. Contrat réconcilié : `ART_DIRECTION.md`.

Phase gameplay : migration Phaser 4 et troisième passe corrective en validation. Les publications précédentes du 7 septembre ont reçu des retours négatifs précis et ne constituent pas des versions approuvées. La présente passe remplace le bras étiré et les flammes procédurales, recale le desktop sur la norme LineFugg et introduit les collisions physiques demandées avant une nouvelle revue web. Registre : `fugg`, stage 390 × 844, runtime `phaser-2d`, migration `current` déverrouillée. Phase cover : C validée et à préserver ; A/B/D encore à explorer ; intégration Core des covers non faite.

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
- Pique rigide séparée d'un nouveau bras authored très long : aucun étirement runtime, extension jusqu'au haut du champ et continuité sous le bas du stage. Le déplacement relatif continue hors canvas.
- Prise limitée à la silhouette de la main. Le point saisi reste invariant même lorsque le pointeur dépasse une butée ; revenir au point initial restaure exactement la pose initiale. Un clic raté fait clignoter la main jusqu'à la première prise valide.
- Brochette validée automatiquement au dernier ingrédient, sans livraison latérale. Chaque ingrédient embroché est immédiatement grillé.
- Décor authored éteint sans flamme figée ; trois plans de boucles de feu pixel-art dessinées (foyers, salle arrière, grille), braises et fumée de profondeur. Aliment raté enflammé avant charbon/cendres.
- Cinq balcons fixes maximum ; seule la pile d'acteurs bouge et diminue réellement jusqu'au changement de niveau. Bave recalée par bouche.
- HUD supérieur compacté, cartouche score agrandi/adaptatif et jauge d'impatience redessinée.
- Chiffres de score remplacés par des glyphes raster authored assortis à la DA.
- Hitboxes alimentaires calées légèrement dans la silhouette ; séparation aliment/aliment, rebonds muraux, gravité et collisions directionnelles avec la tige, la main et le bras. Seule la pointe empale.

## Validation gameplay

Le 7 septembre 2026 :

- build TypeScript/Vite réussi ;
- tests Core Audio réussis ;
- `scripts/test-vlads-skewers-browser.mjs` réussi sur téléphone tactile émulé et bureau souris ;
- véritable empalement par la pointe avec contre-test extérieur au corps, poussée latérale par la tige sans empalement, portée haute et retour automatique du bras, roster 15, pile ×5 cuite, perte de pique, cuisson/charbon/cendre et disparition validés ;
- clic hors main refusé et signal visuel vérifié ; dérive nulle après dépassement horizontal puis retour du pointeur au point de prise ; main visible et immobilisée aux butées haute/basse ;
- contrôle souris relatif vérifié après sortie du canvas ; file 3→2→1 et plafonnement visuel à cinq clients vérifiés ;
- score historique vérifié : brochette de 5 (base 10) × combo 5 = 50 ; l'empalement seul n'ajoute aucun point et la broche complète reste visible 1,65 s avant validation ;
- aucune erreur console ou ressource dans la matrice testée.

Captures locales : `artifacts/vlads-skewers/`. Limite : émulation navigateur, pas un GPU/tactile physique.

## Cover validée et travaux restants

**C — affiche graphique / éditoriale** est validée explicitement. Master exact : `vlad-cover-c-graphic-poster-approved-2026-09-07.png`, 941 × 1672 RGB PNG, SHA-256 `582db78b3abd6d9724cb6261fa6c1563f3e5a4542ed5a3d639c982dabb5c1872`.

Archive privée : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-validated/`, Drive fichier `1blXf0mUKernZn8eQpa8oWXEpFQTOehKM`, dossier `1o5SBto8zGF_fx7FaUTvn9wcEjBpaF7OZ`. Ne pas régénérer ce master.

A/B/D doivent être trois masters portrait individuels plus simples, éditoriaux et distincts du gameplay. Les rejets et planches 2×2 restent archivés ; ne pas les réutiliser comme références positives.

## Prochaines actions

1. Publier la deuxième passe corrective et faire sa revue utilisateur sur le web ; ne considérer le gameplay approuvé qu'après cette revue.
2. Intégrer la cover C exacte au Core quand son asset de production est disponible localement, puis poursuivre A/B/D séparément.
3. Valider gameplay et audio sur téléphone physique.

Aucun blocage gameplay. La cover du registre reste `update-required` tant que le master C n'est pas branché au runtime.
