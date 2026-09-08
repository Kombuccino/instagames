# MiniFugg — Game Layout System

Ce document définit le comportement des jeux sur téléphone, tablette, navigateur PC et futurs wrappers. Les noms et coordonnées des surfaces sont dans [Zones MiniFugg](MINIFUGG_ZONES.md).

## 1. Portée actuelle

La production est portrait uniquement. La largeur logique canonique est `390`. Le master artistique maximal mesure `390 × 844` et contient :

- HAUT : `390 × 91`, partie du MASTER recadrable ;
- CENTRE : `390 × 662`, zone minimale toujours visible ;
- BAS : `390 × 91`, partie du MASTER recadrable.

EXTRA HAUT et EXTRA BAS sont hors MASTER. Ils n'existent que lorsque le viewport mobile utile est proportionnellement plus haut que le MASTER mis à l'échelle. Le cyan des guides leur est exclusivement réservé.

Le paysage reste une compatibilité de maintenance pour les jeux existants. Il ne reçoit plus de nouvelle DA ni de seconde composition sans décision explicite de l'utilisateur.

## 2. Règle d'échelle

L'échelle est toujours uniforme : X et Y utilisent le même facteur.

Sur mobile : `scale = largeur utile / 390`. Les 390 unités occupent toute la largeur utile. La hauteur disponible détermine quelle partie de HAUT et BAS est visible. CENTRE ne doit jamais être réduit par des marges internes ajoutées par le jeu.

Sur PC et grand écran : `scale = hauteur utile / 844`. Le portrait occupe la hauteur disponible et obtient sa plus grande largeur proportionnelle. L'espace latéral restant appartient au Core. Le jeu et sa DA ne créent pas de bandes décoratives latérales pour le remplir.

Pour les fenêtres exceptionnellement plus courtes que CENTRE après mise à l'échelle par largeur, Core réduit uniformément l'ensemble juste assez pour garder CENTRE complète. Ce cas doit être signalé par les tests plutôt que traité avec une composition différente.

## 3. Géométrie stable

Dans CENTRE, les relations suivantes restent identiques entre appareils :

- positions relatives, proportions et silhouettes ;
- plateau, grille, piste et caméra de gameplay ;
- hitboxes, distances, collisions et zones de geste ;
- informations indispensables et contrôles propres au jeu.

Un HUD flottant peut s'ancrer au bord visible ou employer HAUT/BAS quand il reste secondaire et ne modifie pas la géométrie jouable. Il ne dépend jamais d'EXTRA. Les contrôles Core restent séparés du monde Phaser.

## 4. Limite Core

La largeur du contenu de Home, Cover et Game est limitée au même cadre de 390 unités. MONNAIE et JOUER ne dépassent jamais à gauche ou à droite. RAIL reste à gauche, superposé à CENTRE, y compris sur PC. RETOUR appartient au Core et reste atteignable pendant le jeu.

Les marges latérales de bureau peuvent accueillir des menus de diagnostic, panneaux ou sidecars Core. Elles ne font pas partie de la cover ni du gameplay.

## 5. Phaser

Phaser travaille en coordonnées logiques et reçoit une caméra/zone visible conforme au contrat ci-dessus. Selon l'hôte, employer les capacités Phaser `WIDTH_CONTROLS_HEIGHT`, `HEIGHT_CONTROLS_WIDTH`, `FIT`, une caméra ou un viewport calculé ; le choix d'API doit reproduire le contrat MiniFugg plutôt que dicter le cadrage.

Ne pas utiliser `RESIZE` sans couche de conversion explicite : changer directement la taille du monde selon le navigateur déplace les objets et les entrées. La densité de rendu peut monter jusqu'à 2 sans modifier les coordonnées logiques. Les coordonnées du pointeur sont reconverties dans ce même espace.

## 6. Three.js et anciens jeux

Three.js peut redimensionner son backbuffer, mais sa caméra préserve CENTRE et le cadrage portrait. Les anciens rendus DOM/CSS/Canvas gardent leurs correctifs uniquement jusqu'à leur migration ; ne pas ajouter une nouvelle stratégie responsive parallèle.

## 7. Assets

Un fond ou une cover peut remplir le MASTER `390 × 844`. Tout sujet, texte ou interaction indispensable reste dans CENTRE et hors des masques Core du modèle concerné. HAUT et BAS contiennent du décor recadrable ; EXTRA HAUT/BAS sont des prolongements facultatifs distincts. Les détails de dimensionnement et formats sont dans [ASSET_SIZE_REFERENCE](ASSET_SIZE_REFERENCE.md) et la décomposition artistique dans [GAME_ART_PRODUCTION_PIPELINE](GAME_ART_PRODUCTION_PIPELINE.md).

## 8. Validation

Avant de déclarer une intégration actuelle, vérifier au minimum :

- A54 Brave ou équivalent `360 × 611` utile ;
- A54 Chrome ou équivalent `360 × 656` utile ;
- téléphone plus haut ;
- PC 16:9 avec cadrage commandé par la hauteur ;
- haute densité ;
- touch et souris/clavier selon le jeu.

Résultat attendu : toute la largeur utile mobile sert au jeu, CENTRE reste complète, seules HAUT/BAS peuvent être coupées, EXTRA n'apparaît que hors MASTER et aucun contrôle Core ne sort du cadre de 390. Sur PC, le MASTER entier remplit la hauteur sans bande cyan. Le laboratoire interactif `/?usr=moigod&lab=layout` expose Home, Cover, CoverBeta, CoverCaca, Game, GameOver et Ladder avec un menu extérieur visible sur PC.
