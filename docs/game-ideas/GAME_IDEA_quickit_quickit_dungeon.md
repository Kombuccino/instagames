# GAME IDEA — Quickit Quickit Dungeon

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Quickit Quickit Dungeon  
> **Genre:** Speedrun dungeon / arcade action  
> **Format:** Portrait  
> **Tech:** Likely Phaser 4, procedural tilemap

## 1. Concept d'origine

Un mini-donjon généré procéduralement à chaque partie, construit à partir d'un tileset de dungeon existant et légalement réutilisable.

Le personnage est extrêmement rapide et le niveau est volontairement minuscule. Le joueur n'a pas le temps de réfléchir longtemps : il doit lire la pièce, prendre une décision immédiate et continuer à courir.

Chaque donjon impose quelques objectifs obligatoires avant de pouvoir sortir, par exemple :

- tuer 3 monstres ;
- trouver une clé ;
- ouvrir la porte verrouillée ;
- récupérer le trésor ;
- retrouver la sortie ;
- éviter trous et pièges.

Le chrono est brutal : un bon run peut durer environ **8 à 15 secondes**. Tout doit être très rapide : déplacement, attaques, portes, collecte, mort et restart.

La musique est une jungle / breakbeat massive, très rapide, presque hystérique, qui donne l'impression que le donjon lui-même est lancé à pleine vitesse.

## 2. Pitch

**Un dungeon crawler qu'on joue comme un 100 mètres.**

Quickit Quickit Dungeon compresse exploration, combat, clé, trésor et sortie dans quelques secondes. Le joueur doit comprendre un donjon généré à la volée avant que le chrono ne l'enterre.

## 3. Boucle de gameplay

1. Le donjon apparaît et le chrono démarre immédiatement.
2. Le joueur part à pleine vitesse.
3. Il tue les monstres obligatoires en passant, sans combat long.
4. Il repère clé, porte, trésor et raccourcis.
5. Il évite trous et pièges.
6. Une fois les conditions remplies, il rejoint la sortie.
7. Temps final, score / rang, puis nouveau donjon instantané.

Le restart doit être quasi immédiat pour encourager le réflexe « encore une ».

## 4. Game design

### Génération procédurale
Le générateur ne doit pas faire du hasard pur. Chaque niveau doit garantir :

- chemin solvable ;
- clé accessible avant la porte ;
- nombre exact de monstres obligatoires ;
- trésor accessible ;
- sortie atteignable ;
- aucune situation demandant d'attendre longtemps.

Bonne approche : générer d'abord un petit graphe logique des objectifs, puis habiller ce graphe avec des salles et couloirs du tileset.

### Combat
- contact / attaque très rapide ;
- monstres simples, lisibles en une fraction de seconde ;
- idéalement 1 ou 2 coups maximum ;
- ennemis conçus comme obstacles de trajectoire plus que comme vrais combats RPG.

### Pression
- chrono extrêmement court ;
- bonus possibles pour kills propres, trésor, zéro dégât et temps restant ;
- mort ou chute = restart immédiat ;
- raccourcis risqués pour les joueurs qui apprennent à lire les layouts.

### Rejouabilité
Les seeds peuvent devenir intéressantes : même donjon pour tous pendant une période, avec classement au meilleur temps, tout en gardant des runs procéduraux normaux à côté.

## 5. Direction artistique & son

### Visuel
- petit tileset dungeon très lisible ;
- personnages et monstres simples, silhouettes nettes ;
- caméra serrée mais assez large pour anticiper la pièce suivante ;
- FX courts : slash, poussière, clé aspirée, porte explosée / ouverte, trésor flashé ;
- aucun ralentissement cinématique : le jeu doit rester nerveux.

### Musique / SFX
- jungle / breakbeat très rapide, basse massive, breaks agressifs ;
- musique pensée pour pousser le joueur en avant ;
- SFX extrêmement courts et percussifs ;
- mort / restart presque intégrés au rythme.

## 6. Assets / tilesets

Le concept est volontairement adapté à l'utilisation de **tilesets dungeon existants** plutôt qu'à une production graphique complète depuis zéro.

Au moment de la production :
- choisir uniquement des assets avec licence commerciale compatible ;
- conserver auteur, URL/source et conditions d'attribution ;
- importer ensuite les fichiers retenus via le pipeline MiniFugg approprié ;
- ne jamais dépendre d'un hotlink ou d'un asset dont la licence est ambiguë.

Pour une V0 : 1 tileset, 1 héros, 2 monstres, clé, porte, coffre, sortie, trous et 2 pièges suffisent.

## 7. V0 à construire quand le concept sortira de l'incubateur

1. Un générateur de petits donjons toujours solvables.
2. Déplacement très rapide et attaque instantanée.
3. Objectifs fixes : 3 monstres + clé + porte + trésor + sortie.
4. Un piège et des trous.
5. Timer autour de 12 secondes à calibrer.
6. Restart instantané.
7. Temps final + rang simple.
8. Une piste jungle très rapide pour tester la sensation globale.

**Question décisive du prototype :** peut-on lire, décider et traverser un donjon procédural en quelques secondes sans que les échecs paraissent aléatoires ?

## 8. Point de vigilance

Le jeu doit être rapide, pas confus. La génération procédurale doit produire des décisions immédiatement lisibles et des distances comparables entre runs. Si le hasard détermine davantage le chrono que l'exécution du joueur, le concept perd son intérêt de speedrun.
