# Les Brochettes de Vlad — Asset manifest

Base : `390 × 844` logical units.

Production routes actives :

- assets locaux historiques : `public/assets/generated/vlads-skewers/` ;
- assets issus de ChatGPT/Drive : `public/assets/imported/vlads-skewers/` après vérification de la synchro GitHub.

Les DA aplaties restent **REFERENCE ONLY** dès qu'elles contiennent score, personnages, commandes, ingrédients, vies ou autre état mutable. Elles ne sont jamais chargées telles quelles comme écran de gameplay.

## Gameplay — assets canoniques

| Asset | Famille | Usage logique | Alpha | Mouvement / état | Owner dynamique au-dessus | Statut |
| --- | --- | --- | --- | --- | --- | --- |
| `public/assets/generated/vlads-skewers/backgrounds/pixel-grill-arena-unlit.png` | environnement permanent | stage `390×844`, décor central/grill | opaque | fixe | flammes, clients, ingrédients, HUD Phaser | integrated |
| `public/assets/imported/vlads-skewers/backgrounds/vlad-customer-tower.png` | environnement / structure clients | bande droite `x=304`, `y=55`, `86×622` ; source PNG `188×1360` | oui/selon source | fixe ; 5 niches | portraits variables + bave + commande | integrated `0.4.2` |
| `public/assets/imported/vlads-skewers/backgrounds/vlad-customer-tower-master.png` | master source | master PNG de la tour droite | oui/selon source | source uniquement | aucun | source preserved |
| `public/assets/imported/vlads-skewers/sprites/vlad-customer-atlas.png` | personnages / décoration animable | 5 frames verticales `192×250`; rendu `88×114` logiques | réel | portrait variable par client ; position entière, aucune rotation | bave Phaser | integrated `0.4.2` |
| `public/assets/imported/vlads-skewers/sprites/vlad-customer-atlas-master.png` | master source | atlas PNG original `192×1250` | réel | source uniquement | aucun | source preserved |
| `public/assets/generated/vlads-skewers/sprites/ingredient-bodies-v2.png` | personnages gameplay | chute ~`78×78`, pile ~`70×70` | réel | corps seuls | yeux, bouche, membres, grill marks, feu | integrated |
| `public/assets/generated/vlads-skewers/sprites/bone-in-beef.png` | corps gameplay | bœuf, plus large | réel | corps seul | visage/membres/cuisson | integrated |
| `public/assets/generated/vlads-skewers/sprites/character-parts-v3.png` | pièces état/FX | expressions, membres, marques | réel | états Phaser | animation/physics | integrated |
| `public/assets/generated/vlads-skewers/props/vlad-skewer-hand.png` | prop animable | tige runtime `10×110/150/190/230` | réel | longueur selon recette | pile, collision, livraison | integrated |
| `public/assets/generated/vlads-skewers/props/vlad-arm-grip.png` | prop animable | bras fixe `290×435` | réel | suit la poignée | tige + pile | integrated |
| `public/assets/generated/vlads-skewers/ui/life-skewer.png` | HUD structural | 3 vies à gauche | réel | full/lost | compteur Phaser | integrated |
| `public/assets/generated/vlads-skewers/ui/component-atlas.png` | UI structurale | panneaux/bulle authored | réel | surface fixe | valeurs, recette, timer Phaser | integrated |
| `public/assets/generated/vlads-skewers/ui/gothic-digits.png` | UI structurale | score dynamique | réel | chiffres | valeur Phaser | integrated |
| `public/assets/generated/vlads-skewers/fx/pixel-fire-atlas.png` | FX support | torches/grill/food fire | réel | animation courte | particules/smoke | integrated |
| goutte de sang procédurale | gameplay bonus | ~`24×42` | transparent | chute/rotation | bonus patience/slow | integrated |
| membres articulés Matter | gameplay dynamique | 4 appendages à 2 segments | procédural pixel | gravité monde, vitesse bornée | Phaser Matter | integrated |
| impacts / jus / commentaires grill | FX dynamique | chute/grill/impact | procédural | borné et nettoyé | Phaser | integrated |

## Tour clients approuvée — contrat `0.4.2`

Référence utilisateur : DA `853×1844` renvoyée le 13 septembre 2026. **Seule la bande droite de cette version** est l'autorité pour la tour et les cinq personnages ; les régénérations intermédiaires ne doivent pas être réintroduites.

Mesures récupérées sur la référence :

- crop tour source : `x=665`, `y=120`, `w=188`, `h=1360` ;
- traduction stage : `x=304`, `y=55`, `w=86`, `h=622` ;
- lignes de base des cinq loges : `184 / 297 / 416 / 529 / 645` ;
- atlas : `192×1250`, 5 frames `192×250` ;
- rendu en jeu : `88×114` logiques, ratio source conservé ;
- aucun angle animé et aucun scale pulsé : uniquement des positions entières pour protéger la finesse pixel-art.

Ordre de file : client actif en haut, suivants vers le bas. Le décor de tour est statique ; les personnages sont des objets Phaser séparés et variables. La bave reste un overlay dynamique ancré à la bouche, jamais propriétaire de l'architecture.

Les intérieurs de niches sont assombris sous les portraits pour neutraliser les fragments résiduels du détourage de la tour dans une case vide. Ce masque est structurel et reste derrière les personnages.

## Commande client — contrat `0.4.2`

Le panneau de commande reste un composant authored avec contenu mutable Phaser :

- position stage `x=240`, `y=128` ;
- gabarit `136×58` ;
- maximum 5 ingrédients ;
- broche horizontale dynamique ;
- timer circulaire intégré à droite dans le même cartouche ;
- aucune valeur/timer/recette baked dans un raster de décor.

## Covers statiques

Les cinq PNG approuvés du 10 septembre restent les références artistiques. Production active sous `public/assets/generated/vlads-skewers/welcome/variants/` : masters `390×844` et dérivés WebP lossless `780×1688`, sélection `seeded`, runtime statique.

## Layer order

1. Environment et décor permanent.
2. Tour clients fixe + fonds de niches.
3. Portraits clients variables + bave.
4. Embers/FX arrière.
5. Ingrédients/hazards.
6. Brochette + pile + membres Matter.
7. Impacts/FX/combo.
8. HUD dynamique, cartouche commande/timer, score et fin.

## Acceptance

- Nearest-neighbour / `pixelArt` actif ; pas de blur/post-FX global.
- La tour approuvée doit tomber sur la bande droite sans changement de largeur du monde `390`.
- Les cinq portraits gardent leur ratio `192:250` et restent contenus dans leur loge.
- Le client actif est la loge du haut.
- Aucun mouvement client par rotation fractionnaire ou scaling animé.
- La bave part de la bouche et reste une couche Phaser séparée ; les aliments ne bavent jamais.
- Commande lisible de 2 à 5 ingrédients, timer intégré, aucune valeur mutable baked.
- Aucun changement de scoring, collision, physique Matter ou logique de recette dans cette passe.
