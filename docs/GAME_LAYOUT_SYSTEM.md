# MiniFugg — Game Layout System

Ce document définit le comportement des jeux sur téléphone, tablette, navigateur PC et futurs wrappers. Les noms et coordonnées des surfaces sont dans [Zones MiniFugg](MINIFUGG_ZONES.md).

## 1. Portée actuelle

La production est portrait uniquement. La largeur logique canonique est `390`. Le master artistique maximal mesure `390 × 844`.

La fenêtre de gameplay minimale de référence mesure `390 × 662`, mais elle n'est plus obligatoirement centrée dans le MASTER. Chaque jeu Phaser peut choisir un ancrage vertical :

- `top` : fenêtre prioritaire `y 0→662` ;
- `center` : fenêtre prioritaire `y 91→753` ;
- `bottom` : fenêtre prioritaire `y 182→844`.

Le jeu garde malgré tout un seul monde logique `390 × 844`. L'ancrage change uniquement la partie visible lorsque le viewport est plus court que le MASTER mis à l'échelle. Il ne crée jamais un second layout.

EXTRA HAUT et EXTRA BAS sont hors MASTER. Ils n'existent que lorsque le viewport mobile utile est proportionnellement plus haut que le MASTER mis à l'échelle. Le cyan des guides leur est exclusivement réservé.

Le paysage reste une compatibilité de maintenance pour les jeux existants. Il ne reçoit plus de nouvelle DA ni de seconde composition sans décision explicite de l'utilisateur.

## 2. Règle d'échelle

L'échelle est toujours uniforme : X et Y utilisent le même facteur.

Sur mobile : `scale = largeur utile / 390`. Les 390 unités occupent toute la largeur utile. **La hauteur disponible ne réduit pas la largeur du jeu.** Si le MASTER dépasse en hauteur, le recadrage suit l'ancrage vertical choisi par le jeu. Une fenêtre de navigateur exceptionnellement courte peut donc rogner plus que la fenêtre de référence ; elle ne déclenche ni reflow ni miniaturisation horizontale.

Sur PC et grand écran : la hauteur utile d'une fenêtre de 662 unités pilote l'échelle, tout en restant plafonnée par la largeur disponible. Le MASTER déborde verticalement selon l'ancrage du jeu. L'espace latéral restant appartient au Core. Le jeu et sa DA ne créent pas de bandes décoratives latérales pour le remplir.

## 3. Géométrie stable

La géométrie utile reste exprimée dans le MASTER `390 × 844`. Le jeu choisit quelle fenêtre verticale de 662 unités doit rester prioritaire selon sa mécanique :

- jeu ancré bas : commandes/main/grill ou zone d'action basse restent stables, le haut absorbe la variation ;
- jeu ancré haut : plafond/ligne de départ ou zone d'action haute restent stables, le bas absorbe la variation ;
- jeu centré : la variation se répartit autour du CENTRE de référence.

Dans tous les cas, restent identiques entre appareils : positions relatives, proportions et silhouettes ; plateau/grille/piste/caméra ; hitboxes, distances, collisions et zones de geste ; informations indispensables et contrôles propres au jeu.

Un HUD flottant peut s'ancrer au bord visible s'il ne modifie pas la géométrie jouable. Les contrôles Core restent séparés du monde Phaser.

## 4. Limite Core

La largeur du contenu de Home, Cover et Game est limitée au même cadre logique de 390 unités. MONNAIE et JOUER ne dépassent jamais à gauche ou à droite. RAIL reste à gauche, superposé à la composition portrait, y compris sur PC. RETOUR appartient au Core et reste atteignable pendant le jeu.

Les marges latérales de bureau peuvent accueillir des menus de diagnostic, panneaux ou sidecars Core. Elles ne font pas partie de la cover ni du gameplay.

## 5. Phaser

Phaser travaille en coordonnées logiques fixes et reçoit une fenêtre visible conforme au contrat ci-dessus. `PhaserGameHost` possède un `verticalAnchor` (`top | center | bottom`, défaut `center`) ; il conserve la largeur logique 390 et décale seulement le MASTER verticalement.

Sur mobile, le host pilote l'échelle par la largeur. Sur PC, il pilote par la hauteur de 662 unités et plafonne par la largeur disponible. Le ScaleManager Phaser continue de gérer la densité/canvas ; il ne décide pas seul de la composition MiniFugg.

Ne pas utiliser `RESIZE` sans couche de conversion explicite : changer directement la taille du monde selon le navigateur déplace les objets et les entrées. La densité de rendu peut monter jusqu'à 2 sans modifier les coordonnées logiques. Les coordonnées du pointeur sont reconverties dans ce même espace, y compris lorsque le canvas déborde au-dessus ou au-dessous du viewport.

## 6. Three.js et anciens jeux

Three.js peut redimensionner son backbuffer, mais sa caméra préserve les 390 unités de largeur et applique le même principe d'ancrage vertical. Les anciens rendus DOM/CSS/Canvas gardent leurs correctifs uniquement jusqu'à leur migration ; ne pas ajouter une nouvelle stratégie responsive parallèle.

## 7. Assets

Un fond ou une cover peut remplir le MASTER `390 × 844`. Pour le gameplay, tout sujet, texte ou interaction indispensable reste dans la fenêtre prioritaire de 662 unités correspondant à l'ancrage choisi. Le reste du MASTER doit supporter le crop. EXTRA HAUT/BAS sont des prolongements facultatifs distincts. Les détails de dimensionnement et formats sont dans [ASSET_SIZE_REFERENCE](ASSET_SIZE_REFERENCE.md) et la décomposition artistique dans [GAME_ART_PRODUCTION_PIPELINE](GAME_ART_PRODUCTION_PIPELINE.md).

## 8. Validation

Avant de déclarer une intégration actuelle, vérifier au minimum :

- A54 Brave ou équivalent `360 × 611` utile ;
- A54 Chrome ou équivalent `360 × 656` utile ;
- téléphone plus haut ;
- PC 16:9 avec fenêtre de 662 unités pilotée par la hauteur ;
- haute densité ;
- touch et souris/clavier selon le jeu.

Résultat attendu : toute la largeur utile mobile sert au jeu, aucune variante PC/mobile ne recompose la géométrie, le crop vertical suit l'ancrage déclaré, EXTRA n'apparaît que hors MASTER et aucun contrôle Core ne sort du cadre de 390. Le laboratoire interactif `/?usr=moigod&lab=layout` reste la référence de mesure ; ses gabarits centrés décrivent le cas `center`, tandis que les jeux peuvent choisir `top` ou `bottom` lorsqu'une mécanique l'exige.
