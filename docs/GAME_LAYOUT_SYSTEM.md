# MiniFugg — Game Layout System

Ce document définit le comportement des jeux sur téléphone, tablette, navigateur PC et futurs wrappers. Les noms et coordonnées des surfaces sont dans [Zones MiniFugg](MINIFUGG_ZONES.md).

## 1. Portée actuelle

La production est portrait uniquement. La largeur logique canonique est `390`. Depuis le 17 septembre 2026, le MASTER des nouvelles productions mesure `390 × 850` et la fenêtre de gameplay garantie `390 × 710`.

Dans le cas centré, cela donne exactement :

- `HAUT` : `y 0→70` ;
- `CENTRE` : `y 70→780` ;
- `BAS` : `y 780→850`.

Chaque jeu peut choisir un ancrage vertical :

- `top` : fenêtre prioritaire `y 0→710` ;
- `center` : fenêtre prioritaire `y 70→780` ;
- `bottom` : fenêtre prioritaire `y 140→850`.

Le jeu garde un seul monde logique. L’ancrage change uniquement la partie visible lorsque le viewport est plus court que le MASTER mis à l’échelle ; il ne crée jamais de second layout.

Les jeux déjà produits en `390 × 844` restent explicitement compatibles. Ils conservent leurs coordonnées et assets jusqu’à une migration propre au jeu. Avec la fenêtre garantie `710`, leur cas centré laisse `67` unités de réserve en haut et en bas. Ne pas étirer un monde `844` vers `850` pour satisfaire le nouveau défaut.

Le paysage reste une compatibilité de maintenance pour les jeux existants. Il ne reçoit plus de nouvelle DA ni de seconde composition sans décision explicite.

## 2. Règle d’échelle

L’échelle est toujours uniforme : X et Y utilisent le même facteur.

Sur mobile : `scale = largeur utile / 390`. Les 390 unités occupent toute la largeur utile. **La hauteur disponible ne réduit pas la largeur du jeu.** Si le MASTER dépasse en hauteur, le recadrage suit l’ancrage choisi.

Sur PC et grand écran : la hauteur utile de la fenêtre garantie `390 × 710` pilote l’échelle, tout en restant plafonnée par la largeur disponible. Le MASTER déborde verticalement selon l’ancrage. L’espace latéral restant appartient au Core.

Les résolutions réelles comme `360 × 650`, `360 × 656`, `390 × 712` ou `360 × 611` sont des presets de diagnostic. Elles ne sont plus converties en une géométrie canonique du jeu.

## 3. Géométrie stable

La géométrie utile d’une nouvelle production reste exprimée dans le MASTER `390 × 850`. Dans tous les cas restent identiques entre appareils : positions relatives, proportions et silhouettes ; plateau/grille/piste/caméra ; hitboxes, distances, collisions et zones de geste ; informations indispensables et contrôles propres au jeu.

Un HUD flottant peut s’ancrer au bord visible s’il ne modifie pas la géométrie jouable. Les contrôles Core restent séparés du monde Phaser.

## 4. Limite Core

La largeur du contenu de Home, Cover et Game est limitée au même cadre logique de `390` unités. MONNAIE et JOUER ne dépassent jamais à gauche ou à droite. RAIL reste à gauche, superposé à la composition portrait, y compris sur PC. RETOUR appartient au Core et reste atteignable pendant le jeu.

Les marges latérales de bureau peuvent accueillir des menus de diagnostic, panneaux ou sidecars Core. Elles ne font pas partie de la cover ni du gameplay.

## 5. Phaser

Phaser travaille en coordonnées logiques fixes. `PhaserGameHost` possède un `verticalAnchor` (`top | center | bottom`, défaut `center`).

Le défaut des nouvelles productions est `390 × 850`. Le host reconnaît également le monde legacy `390 × 844` afin qu’un jeu déjà approuvé conserve sa géométrie sans réécriture. Dans les deux cas, la fenêtre garantie vaut `710` unités de haut.

Sur mobile, le host pilote l’échelle par la largeur. Sur PC, il pilote par la hauteur des `710` unités garanties, plafonnée par la largeur disponible. Le ScaleManager Phaser continue de gérer la densité/canvas ; il ne décide pas seul de la composition MiniFugg.

Ne pas utiliser `RESIZE` sans couche de conversion explicite. La densité de rendu peut monter jusqu’à 2 sans modifier les coordonnées logiques.

## 6. Three.js et anciens jeux

Three.js peut redimensionner son backbuffer, mais sa caméra préserve les `390` unités de largeur et le même principe d’ancrage vertical. Les anciens rendus DOM/CSS/Canvas gardent leurs correctifs uniquement jusqu’à leur migration ; ne pas ajouter une stratégie responsive parallèle.

## 7. Assets

Un nouveau fond ou une cover peut remplir le MASTER `390 × 850`. Pour le gameplay, tout sujet, texte ou interaction indispensable reste dans la fenêtre garantie `390 × 710` choisie par le jeu. HAUT/BAS doivent supporter le crop ; EXTRA HAUT/BAS sont facultatifs.

Les masters `390 × 844` déjà approuvés sont des assets legacy valides. Les conserver tels quels ; fabriquer un master `850` seulement si une vraie reprise graphique est décidée.

## 8. Validation

Avant de déclarer une intégration actuelle, vérifier au minimum :

- fenêtre logique garantie `390 × 710` ;
- MASTER entier `390 × 850` pour une nouvelle production ;
- plusieurs navigateurs/téléphones réels, dont un viewport court ;
- PC 16:9 piloté par les `710` unités garanties ;
- haute densité ;
- touch et souris/clavier selon le jeu ;
- pour un jeu legacy `390 × 844`, absence d’étirement ou de déplacement de sa géométrie.

Résultat attendu : toute la largeur utile mobile sert au jeu, aucune variante PC/mobile ne recompose la géométrie, le crop vertical suit l’ancrage déclaré et aucun contrôle Core ne sort du cadre de 390.
