# MiniFugg — Game Layout System

Ce document définit le comportement des jeux sur téléphone, tablette, navigateur PC et futurs wrappers. Les noms et coordonnées des surfaces sont dans [Zones MiniFugg](MINIFUGG_ZONES.md).

## 1. Portée actuelle

La production est portrait uniquement. La largeur logique canonique est `390`. Toute nouvelle production utilise :

- MASTER artistique : `390 × 850` ;
- zone de jeu garantie : `390 × 710`.

La zone garantie peut être ancrée verticalement :

- `top` : `y 0→710` ;
- `center` : `y 70→780` ;
- `bottom` : `y 140→850`.

Le jeu garde un seul monde logique. L'ancrage change uniquement la partie visible lorsque le viewport est plus court que le MASTER mis à l'échelle ; il ne crée jamais un second layout.

Les jeux et assets historiques approuvés en `390 × 844` restent compatibles sans étirement. Ils conservent leurs coordonnées jusqu'à leur migration individuelle, tout en utilisant la même zone garantie de 710 unités.

EXTRA HAUT et EXTRA BAS sont hors MASTER. Ils n'existent que lorsque le viewport mobile utile est proportionnellement plus haut que le MASTER mis à l'échelle. Le cyan des guides leur est exclusivement réservé.

Le paysage reste une compatibilité de maintenance pour les jeux existants. Il ne reçoit plus de nouvelle DA ni de seconde composition sans décision explicite de l'utilisateur.

## 2. Règle d'échelle

L'échelle est toujours uniforme : X et Y utilisent le même facteur.

Sur mobile : `scale = largeur utile / 390`. Les 390 unités occupent toute la largeur utile. **La hauteur disponible ne réduit pas la largeur du jeu.** Si le MASTER dépasse en hauteur, le recadrage suit l'ancrage vertical choisi par le jeu. Une fenêtre de navigateur exceptionnellement courte peut rogner davantage ; elle ne déclenche ni reflow ni miniaturisation horizontale.

Sur PC et grand écran : la hauteur utile est comparée à la zone garantie `390 × 710`, puis l'échelle reste plafonnée par la largeur disponible. Le MASTER déborde verticalement selon l'ancrage du jeu. L'espace latéral restant appartient au Core. Le jeu et sa DA ne créent pas de bandes décoratives latérales pour le remplir.

## 3. Géométrie stable

La géométrie utile reste exprimée dans le système logique du jeu. Toute nouvelle production portrait vise `390 × 850`; les productions historiques `390 × 844` restent valides pendant leur transition.

Le jeu choisit quelle fenêtre verticale de 710 unités doit rester prioritaire selon sa mécanique :

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

Sur mobile, le host pilote l'échelle par la largeur. Sur PC, il pilote par la hauteur garantie de 710 unités et plafonne par la largeur disponible. Le ScaleManager Phaser continue de gérer la densité/canvas ; il ne décide pas seul de la composition MiniFugg.

Ne pas utiliser `RESIZE` sans couche de conversion explicite : changer directement la taille du monde selon le navigateur déplace les objets et les entrées. La densité de rendu peut monter jusqu'à 2 sans modifier les coordonnées logiques. Les coordonnées du pointeur sont reconverties dans ce même espace, y compris lorsque le canvas déborde au-dessus ou au-dessous du viewport.

## 6. Three.js et anciens jeux

Three.js peut redimensionner son backbuffer, mais sa caméra préserve les 390 unités de largeur et applique le même principe d'ancrage vertical. Les anciens rendus DOM/CSS/Canvas gardent leurs correctifs uniquement jusqu'à leur migration ; ne pas ajouter une nouvelle stratégie responsive parallèle.

## 7. Assets

Un nouveau fond ou une nouvelle cover portrait peut remplir le MASTER `390 × 850`. Pour le gameplay, tout sujet, texte ou interaction indispensable reste dans la fenêtre prioritaire de `390 × 710` et dans l'ancrage choisi. Le reste du MASTER doit supporter le crop. EXTRA HAUT/BAS sont des prolongements facultatifs distincts.

Les masters existants `390 × 844` restent valides : ne pas les régénérer uniquement pour ajouter 6 pixels. Les calibrateurs et runtimes doivent afficher leur taille source réelle et les comparer au nouveau contrat.

Les détails de dimensionnement et formats sont dans [ASSET_SIZE_REFERENCE](ASSET_SIZE_REFERENCE.md) et la décomposition artistique dans [GAME_ART_PRODUCTION_PIPELINE](GAME_ART_PRODUCTION_PIPELINE.md).

## 8. Validation

Avant de déclarer une intégration actuelle, vérifier au minimum :

- zone garantie logique `390 × 710` ;
- A54 Chrome mesuré `360 × 656` utile ;
- iPhone 13 Pro Safari mesuré `390 × 712` utile ;
- A54 Brave `360 × 611` comme cas dégradé ;
- téléphone plus haut ;
- MASTER entier `390 × 850` ;
- PC 16:9 avec la zone `390 × 710` pilotée par la hauteur ;
- haute densité ;
- touch et souris/clavier selon le jeu.

Résultat attendu : toute la largeur utile mobile sert au jeu, aucune variante PC/mobile ne recompose la géométrie, le crop vertical suit l'ancrage déclaré, EXTRA n'apparaît que hors MASTER et aucun contrôle Core ne sort du cadre de 390. Les anciens jeux `390 × 844` sont testés tels quels jusqu'à leur migration dédiée.
