# GAME IDEA — Reverse Tetris

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Reverse Tetris / Anti-Tetra — title not validated  
> **Genre:** Reverse falling-block puzzle / arcade  
> **Format:** Portrait  
> **Core idea:** le jeu construit des lignes / une masse depuis le haut ; le joueur la déconstruit.

## 1. Concept d'origine

Faire un jeu dans l'esprit de Tetra Mindfuck, mais réellement **à l'envers**.

Dans un falling-block classique, le joueur reçoit des briques, les empile et complète des lignes pour les faire disparaître. Ici, le jeu fabrique lui-même les lignes / la masse depuis le haut et les fait descendre vers le joueur. Le joueur ne construit rien : il doit **déconstruire ce que le jeu lui donne** avant d'être écrasé.

La mécanique précise reste ouverte. Le principe à préserver est donc :

**le jeu construit ; le joueur détruit.**

## 2. Six directions de gameplay

### A — VOID TETRIS / pièces négatives — piste recommandée

Le haut de l'écran est une masse pleine qui descend lentement. Depuis le bas, le joueur contrôle non pas des briques, mais des **tétriminos de vide**.

- Une pièce négative remonte depuis le bas.
- Gauche / droite / rotation fonctionnent comme dans un falling-block classique.
- Quand la pièce touche la masse, elle **creuse exactement sa forme** dans les blocs.
- Le but est de réussir à vider entièrement une ligne horizontale.
- Une ligne devenue entièrement vide disparaît et la masse remonte / recule d'un cran.
- Pendant ce temps, de nouvelles couches pleines apparaissent régulièrement en haut.

C'est le miroir le plus direct :

**pièces solides qui descendent dans le vide → pièces de vide qui remontent dans le solide.**

Intérêt : règles immédiatement compréhensibles, vraie planification spatiale, possibilité de combos en préparant plusieurs lignes de vide à la fois.

### B — DEMOLITION QUEUE / poser des gommes

Le jeu génère en haut des lignes complètes ou presque complètes qui descendent. Le joueur reçoit une file de 3 formes de démolition.

- Chaque forme peut être posée directement sur des blocs déjà présents.
- Les cases couvertes sont supprimées.
- Il faut vider les lignes avant qu'elles atteignent la zone critique du bas.
- Les trous déjà créés peuvent rendre certaines prochaines formes impossibles à placer proprement.

Plus puzzle tactile, moins proche du contrôle historique du Tetris. Très adapté au téléphone : sélectionner une forme puis taper / glisser où creuser.

### C — COLLAPSE / démolition structurelle

Au lieu d'effacer directement toute la matière, le joueur retire seulement quelques blocs stratégiques.

- La masse venant du haut possède des zones de soutien.
- Retirer un bloc peut faire tomber un morceau entier dans le vide inférieur.
- Les gros effondrements donnent des multiplicateurs.
- Une mauvaise destruction peut au contraire créer un énorme morceau compact qui descend très vite vers le joueur.

Le jeu devient un mélange de reverse Tetris et de mini-Jenga / démolition. Très spectaculaire, mais demanderait une physique discrète simplifiée plutôt qu'une vraie simulation lourde.

### D — ACID / réactions en chaîne

Les pièces négatives ne suppriment pas simplement quatre cases : elles injectent un type d'acide / virus dans la masse.

- Chaque matière ou couleur réagit différemment.
- Certaines cases se dissolvent immédiatement.
- D'autres propagent la corrosion aux voisines.
- Les chaînes longues donnent beaucoup de points mais peuvent détruire une zone que le joueur voulait conserver comme support.

Plus arcade / combo, moins pur puzzle spatial. Bon potentiel visuel : corrosion, mousse, pixels qui fondent, réactions en cascade.

### E — UNBUILD THE MISTAKE / puzzles courts

Chaque niveau commence avec une structure déjà construite : un “mauvais Tetris” compact et dangereux.

- Le joueur reçoit une séquence limitée de pièces négatives.
- Il doit démonter la structure avec le moins de coups possible.
- Certaines cases peuvent être verrouillées, blindées ou exploser.
- Une fois la structure suffisamment vidée, niveau suivant avec une forme plus vicieuse.

Pas d'endless : petits casse-têtes de 20–40 secondes. Très facile à équilibrer et à produire en V0, avec des niveaux authored.

### F — PRESSURE MODE / le plafond te construit dessus

La masse est générée en continu en haut, mais pas forcément sous forme de lignes propres : une “machine” construit automatiquement des pièces solides et les pousse vers le bas.

Le joueur possède une seule pièce négative active à la fois et doit choisir entre :
- creuser vite pour survivre ;
- préparer une ligne vide complète pour faire reculer toute la masse ;
- créer volontairement une cavité qui permettra un gros combo ensuite.

C'est la version la plus arcade : le vrai adversaire est la **pression verticale**. Plus longtemps le joueur survit, plus la machine construit vite.

## 3. Recommandation

Commencer par **A — VOID TETRIS**.

C'est la seule piste qui soit immédiatement lisible comme un vrai “Tetris inversé”, pas simplement comme un puzzle de démolition :

- la gravité est inversée ;
- la matière et le vide échangent leur rôle ;
- les mêmes familles de formes restent pertinentes ;
- la condition de ligne est inversée : on cherche une ligne totalement vide plutôt qu'une ligne totalement pleine.

On peut ensuite lui emprunter le meilleur des autres pistes : pression continue de F, blocs spéciaux de D, et petits niveaux authored de E.

## 4. V0 à tester plus tard

Prototype minimal recommandé :

1. Grille portrait étroite.
2. Masse pleine occupant le tiers supérieur.
3. Tétriminos de vide qui remontent depuis le bas.
4. Gauche / droite / rotation.
5. Contact avec la masse = les cellules de la pièce sont creusées.
6. Ligne complètement vide = suppression / recul d'une ligne de matière.
7. Nouvelle ligne pleine ajoutée périodiquement en haut.
8. Défaite si la matière atteint la zone basse critique.
9. Score par ligne vidée + combos de lignes préparées simultanément.

**Question décisive :** est-ce que créer des lignes de vide avec des formes négatives produit la même satisfaction mentale que compléter des lignes solides, tout en donnant réellement la sensation de jouer “à l'envers” ?

## 5. Points de vigilance

- Une ligne entièrement vide peut être plus difficile à lire mentalement qu'une ligne pleine : feedback visuel très fort nécessaire.
- Il faut éviter que le joueur puisse simplement creuser une grande cheminée verticale toujours au même endroit.
- Les formes négatives doivent être visibles même lorsqu'elles traversent la zone vide avant de toucher la masse.
- La montée de difficulté doit venir de la vitesse de construction, de la forme de la masse et éventuellement de blocs spéciaux, pas d'un ajout massif de commandes.
- Garder une identité MiniFugg propre plutôt qu'une simple copie visuelle du Tetris classique.
