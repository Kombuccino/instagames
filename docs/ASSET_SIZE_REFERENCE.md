# MiniFugg — Référence des tailles d’assets

Cette fiche complète `GAME_LAYOUT_SYSTEM.md` et `GAME_ART_PRODUCTION_PIPELINE.md`. Sa représentation interactive est disponible dans l’application avec :

`/?usr=moigod&lab=layout`

La page permet de télécharger les deux gabarits PNG de livraison, de simuler les écrans courants et de calculer la taille maximale d’un asset à partir de sa zone logique.

## Les deux cadres

| Usage | Stage logique | Dérivé raster runtime maximal à densité 2 |
| --- | ---: | ---: |
| gameplay portrait et cover | 390 × 844 | 780 × 1688 |
| gameplay paysage | 844 × 390 | 1688 × 780 |

Une cover du fil de découverte reste en portrait, quelle que soit l’orientation du jeu.

Le stage entier est la composition contractuelle. Phaser utilise `FIT` et une échelle uniforme : aucun déplacement interne ne dépend de l’écran. La zone centrale indiquée dans les gabarits est une zone sûre recommandée pour l’action et les sujets critiques, car le Core peut superposer son bouton Retour en gameplay et son rail, sa monnaie et son CTA sur une cover.

## Règle de dimensionnement

Pour un composant qui occupe `W × H` unités logiques :

- fichier runtime maximal : `ceil(W × 2) × ceil(H × 2)` pixels ;
- transparence recadrée au contenu utile ;
- master de travail éventuellement supérieur, archivé séparément ;
- le jeu ne charge pas le master surdimensionné ;
- une feuille d’atlas runtime reste de préférence sous 2048 × 2048, sinon elle est scindée.

Cette règle est un maximum, pas une cible obligatoire. Une texture volontairement franche, une forme procédurale ou un pixel art construit sur une grille plus basse peut utiliser moins de pixels. Le rapport avec la taille affichée doit rester volontaire et cohérent entre les assets du même jeu.

## État dynamique

Le fond permanent ne contient jamais score, vies, recette, clients, ingrédients, contrôle ou état mutable. Les panneaux authored peuvent fournir le cadre et la matière ; Phaser fournit les valeurs et les états. Les états visuels importants d’un bouton, personnage ou objet sont livrés séparément ou dans un atlas mesuré.

## Différences selon l’écran

Toujours visible et fixe : stage canonique, géométrie, gameplay, HUD authored dans la scène, hitboxes, caméra et rapports de taille.

Variable : échelle uniforme, densité physique, marges Core, sidecars optionnels et overscan décoratif. Aucun élément variable ne porte une information indispensable.

## Écarts de plateforme encore ouverts

- Les covers statiques utilisent actuellement un remplissage CSS par recadrage, alors que les covers Phaser conservent 390 × 844 en `FIT`. Le cadrage doit être unifié dans le Core.
- Les anciens masters 9:16 sont plus larges que 390 × 844. En plein cadre actuel, environ 18 % de leur largeur disparaît. Les originaux validés doivent rester intacts et recevoir un dérivé cadré avec une zone sûre.
- Les migrations doivent encore réduire plusieurs textures et atlases existants produits très au-dessus de leur taille d’affichage.
- L’overscan appartient uniquement à la surface décorative du jeu. Il ne doit jamais remplacer ou agrandir la scène canonique.
