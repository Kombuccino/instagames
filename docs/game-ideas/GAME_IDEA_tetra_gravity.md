# GAME IDEA — Tetra Gravity

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Tetra Gravity  
> **Genre:** Tetris-like / gravity puzzle / arcade  
> **Format:** Portrait, square playfield inside the MiniFugg frame  
> **Core idea:** on ne pilote pas directement les pièces ; on change la direction de la gravité.

## 1. Concept d'origine

Le jeu reprend l'idée d'un Tetra / Tetris-like, mais avec des formes volontairement plus pénibles que les tétriminos classiques : grands U, grands S, formes avec recoins, crochets et pièces de 5–7 blocs.

Les pièces s'accumulent dans une zone de jeu carrée. Le joueur peut changer la gravité dans quatre directions : **haut, bas, gauche, droite**.

Quand la gravité change, toutes les pièces déjà présentes glissent / tombent vers le nouveau côté jusqu'à rencontrer un obstacle. Elles peuvent alors se réemboîter de manière complètement différente.

Le but reste de former et supprimer un maximum de lignes complètes.

Mais chaque changement de gravité a un coût : **il fait apparaître de nouvelles pièces**. Le joueur doit donc réorganiser la masse suffisamment efficacement pour détruire plus de matière qu'il n'en fait entrer.

## 2. Pitch

**Tourne la gravité, compacte le chaos, ferme des lignes — mais chaque rotation nourrit le monstre.**

Le jeu est un Tetris-like où le joueur ne place pas méticuleusement une pièce à la fois : il manipule tout le plateau en bloc en choisissant quelle direction devient le sol.

## 3. Boucle de gameplay

1. Le plateau contient plusieurs formes imbriquées.
2. Le joueur choisit une direction de gravité.
3. Toutes les pièces glissent jusqu'à collision.
4. De nouvelles pièces apparaissent en contrepartie du changement de gravité.
5. Toute ligne complète perpendiculaire à la gravité est supprimée.
6. Les pièces restantes retombent / se recomposent.
7. Le joueur enchaîne jusqu'à ce que le plateau soit trop encombré.

Le cœur du jeu est donc : **chaque action est à la fois une solution et une nouvelle menace.**

## 4. Règles à tester

### Gravité
- 4 directions seulement : haut / bas / gauche / droite.
- Transition très lisible : légère rotation visuelle du plateau ou flèche de gravité, mais la grille peut rester fixe à l'écran.
- Toutes les pièces se déplacent simultanément.
- Les pièces restent rigides ; elles ne tournent pas individuellement pendant la chute.

### Formes
Éviter les tétriminos classiques. Utiliser surtout :
- U larges ;
- S / Z allongés ;
- crochets ;
- C ;
- formes en escalier ;
- pièces avec cavités ;
- grandes formes irrégulières de 5–7 cellules.

Ces formes doivent créer des poches vides qui deviennent utiles ou catastrophiques selon la prochaine gravité.

### Apparition
À chaque changement de gravité, une ou plusieurs nouvelles pièces apparaissent depuis le côté opposé à la gravité.

Exemple : gravité vers le bas → nouvelles pièces arrivent par le haut.

La difficulté peut augmenter en faisant apparaître :
- plus de pièces par changement ;
- des formes plus grandes ;
- des pièces lourdes / verrouillées ;
- des blocs parasites difficiles à caser.

### Lignes
Piste recommandée : une ligne complète est toujours définie **perpendiculairement à la gravité actuelle**.

Donc :
- gravité bas / haut → lignes horizontales ;
- gravité gauche / droite → lignes verticales.

Cela rend chaque changement de gravité stratégiquement différent et permet de préparer des lignes dans plusieurs axes.

## 5. Score / progression

- Points par ligne supprimée.
- Gros bonus si un seul changement de gravité crée plusieurs lignes.
- Combo si une suppression entraîne une nouvelle chute puis une deuxième suppression sans nouvelle action.
- Bonus possible pour alterner les directions plutôt que spammer toujours la même.
- La partie se termine quand les pièces occupent une zone critique ou qu'aucun déplacement utile n'est possible.

Le vrai objectif n'est pas seulement de survivre : **éliminer plus de blocs que chaque changement de gravité n'en ajoute.**

## 6. Direction visuelle

- Plateau carré très lisible.
- Sensation physique forte quand toute la masse change de direction.
- Petites collisions, secousses, poussière / fragments lors des tassements.
- Les formes peuvent avoir une matière dense, industrielle ou minérale plutôt qu'un rendu Tetris classique.
- Le jeu doit donner l'impression de manipuler une boîte remplie de pièces mal rangées.

Son : gros glissements, impacts successifs, petits claquements de pièces qui se coincent, puis rupture satisfaisante lorsqu'une ligne disparaît.

## 7. V0 à construire quand le concept sortira de l'incubateur

1. Plateau carré de petite taille.
2. 6–8 formes irrégulières non-Tetris.
3. Quatre boutons / gestes de gravité.
4. Toutes les pièces tombent ensemble jusqu'à stabilisation.
5. Une nouvelle pièce apparaît après chaque changement.
6. Suppression des lignes perpendiculaires à la gravité.
7. Cascade après suppression.
8. Score + game over simple.

**Question décisive :** est-ce que le joueur arrive à anticiper suffisamment le résultat d'un changement global de gravité pour sentir qu'il prend une décision intelligente, plutôt qu'il ne secoue simplement une boîte au hasard ?

## 8. Points de vigilance

- La simulation doit être totalement déterministe et lisible : même état + même gravité = même résultat.
- Éviter des centaines de micro-collisions physiques ; une simulation grille/cellules suffit probablement et sera beaucoup plus propre.
- Les grandes formes irrégulières sont essentielles pour créer des recoins intéressants, mais elles ne doivent pas rendre le plateau illisible.
- Ne pas laisser une direction dominante devenir toujours optimale.
- Le nombre de nouvelles pièces par changement est le principal levier d'équilibrage : trop peu = jeu facile ; trop = impossibilité de planifier.
