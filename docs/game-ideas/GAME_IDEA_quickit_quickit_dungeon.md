# GAME IDEA — Quickit Quickit Dungeon

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Quickit Quickit Dungeon  
> **Genre:** Speedrun dungeon / arcade action / memory  
> **Format:** Portrait  
> **Tech:** Likely Phaser 4, procedural tilemap

## 1. Concept d'origine

Un mini-donjon généré procéduralement à chaque partie, construit à partir d'un tileset de dungeon existant et légalement réutilisable.

Le personnage est extrêmement rapide et le niveau est volontairement minuscule. Avant chaque run, le joueur bénéficie d'environ **10 secondes de prescience** : le donjon entier lui est révélé, avec les objectifs obligatoires, afin qu'il mémorise la géométrie et prépare sa route.

La mise en scène peut passer par un mage derrière un voile / miroir magique répétant quelque chose comme **« Je vois… je vois… »** pendant que le niveau apparaît.

Exemples d'objectifs :
- tuer 3 monstres ;
- trouver une clé ;
- ouvrir la porte verrouillée ;
- récupérer le trésor ;
- rejoindre la sortie ;
- éviter trous et pièges.

Après `10, 9, 8... 1`, la vision disparaît. **Le vrai run se joue alors sous brouillard de guerre** : le joueur ne voit que sa zone proche et doit foncer en se souvenant du plan aperçu quelques secondes plus tôt.

La prescience peut contenir **2–3 petites imprécisions** pour empêcher le pur par-cœur : position légèrement différente d'un monstre, état d'un piège, détail secondaire du chemin, etc. Les éléments indispensables doivent toutefois rester suffisamment fiables pour que la réussite repose sur mémoire + adaptation, pas sur la chance.

Un bon passage peut durer environ **8 à 15 secondes**. Tout doit être très rapide : déplacement, attaques, portes, collecte, mort et restart.

La musique est une jungle / breakbeat massive, très rapide, presque hystérique, qui donne l'impression que le donjon lui-même est lancé à pleine vitesse.

## 2. Pitch

**Dix secondes pour voir le futur. Dix secondes pour survivre à ce dont tu te souviens.**

Quickit Quickit Dungeon est un dungeon crawler joué comme un speedrun miniature : observer une vision complète, mémoriser, foncer dans le noir, improviser quand la vision ment légèrement, puis recommencer pour grappiller quelques dixièmes.

## 3. Boucle de gameplay

1. Vision complète du donjon pendant 10 secondes.
2. Objectifs obligatoires affichés pendant la prescience.
3. Le joueur mémorise positions, ordre des objectifs et raccourcis.
4. GO : la vision disparaît, le brouillard de guerre apparaît et le chrono démarre.
5. Le joueur exécute sa route de mémoire.
6. Il adapte sa trajectoire aux pièges mobiles et aux petites différences avec la vision.
7. Une fois les conditions remplies, il rejoint la sortie.
8. Temps final + rang.
9. Retry instantané du même niveau pour optimiser la route, ou passage à un nouveau seed.

Le joueur doit pouvoir refaire très facilement le même donjon jusqu'à sentir qu'il approche de sa limite personnelle. Son meilleur temps devient la vraie performance.

## 4. Game design

### Prescience
- environ 10 secondes fixes avant chaque tentative ;
- niveau entièrement visible ;
- objectifs obligatoires affichés clairement ;
- éléments importants très lisibles : clé, porte, trésor, sortie, monstres requis, pièges ;
- le joueur ne peut pas agir avant le GO ;
- présentation mystique / prophétique plutôt qu'une simple pause tactique.

Cette phase est une compétence : les meilleurs joueurs apprennent à mémoriser très vite une carte entière et à construire mentalement un itinéraire.

### Brouillard de guerre
Pendant le run :
- vision très limitée autour du héros ;
- éventuellement murs déjà visités gardés en silhouette très faible, à tester ;
- pas de mini-carte complète disponible ;
- les informations mémorisées doivent être plus importantes que l'exploration prudente.

Le brouillard ne doit pas ralentir le jeu : il transforme la mémoire du joueur en outil de navigation.

### Prescience imparfaite
La vision peut mentir légèrement, mais de façon bornée et compréhensible.

Bonnes variations :
- un ennemi quelques cases plus loin ;
- un piège dans une autre phase de son cycle ;
- une porte secondaire ouverte/fermée ;
- un petit obstacle absent ou ajouté ;
- une trajectoire mobile légèrement différente.

À éviter : déplacer aléatoirement la clé, la sortie ou rendre le chemin prévu impossible. Le joueur doit pouvoir dire « ma vision était un peu fausse », pas « le jeu m'a piégé arbitrairement ».

### Génération procédurale
Le générateur doit garantir :
- chemin solvable ;
- clé accessible avant la porte ;
- objectifs réalisables dans le temps prévu ;
- trésor accessible ;
- sortie atteignable ;
- aucune situation demandant d'attendre longtemps ;
- plusieurs routes ou micro-choix intéressants quand possible.

Bonne approche : générer d'abord un petit graphe logique des objectifs, puis habiller ce graphe avec des salles et couloirs du tileset.

### Pièges dynamiques
Exemples :
- lames qui balayent un couloir ;
- piques cycliques ;
- blocs qui tombent ;
- portes temporisées ;
- monstres qui patrouillent ;
- plateformes ou ponts temporisés.

Ils doivent être télégraphiés et déterministes ou semi-déterministes : la mémorisation donne un plan, mais l'exécution reste vivante.

### Combat
- attaque très rapide ;
- monstres simples, lisibles en une fraction de seconde ;
- idéalement 1 ou 2 coups maximum ;
- ennemis conçus comme obstacles de trajectoire plus que comme vrais combats RPG.

### Score / maîtrise
Le score principal est le **meilleur temps valide** sur un donjon donné.

Le run n'est valide que si tous les objectifs obligatoires sont remplis. Bonus secondaires possibles : zéro dégât, zéro erreur, trésors facultatifs, route parfaite.

Le cœur reste le chrono.

### Rejouabilité
- retry du même niveau en un geste ;
- meilleure performance conservée par seed ;
- nouveau niveau généré quand le joueur décide de passer à autre chose ;
- potentiel de **seed quotidienne commune** avec leaderboard au meilleur temps.

## 5. Direction artistique & son

### Visuel
- petit tileset dungeon très lisible ;
- héros et monstres simples, silhouettes nettes ;
- pendant la prescience : vue complète avec voile, aura ou filtre magique ;
- au GO : fermeture brutale de la vision et apparition du brouillard ;
- FX courts : slash, poussière, clé aspirée, porte ouverte, trésor flashé ;
- aucun ralentissement cinématique pendant le run.

### Musique / SFX
- jungle / breakbeat très rapide, basse massive, breaks agressifs ;
- prescience : boucle filtrée / suspendue ;
- **drop massif sur GO** ;
- SFX extrêmement courts et percussifs ;
- mort / restart presque intégrés au rythme.

## 6. Assets / tilesets

Le concept est volontairement adapté à l'utilisation de **tilesets dungeon existants** plutôt qu'à une production graphique complète depuis zéro.

Au moment de la production :
- choisir uniquement des assets avec licence commerciale compatible ;
- conserver auteur, URL/source et conditions d'attribution ;
- importer les fichiers retenus via le pipeline MiniFugg approprié ;
- ne jamais dépendre d'un hotlink ou d'un asset dont la licence est ambiguë.

Pour une V0 : 1 tileset, 1 héros, 2 monstres, clé, porte, coffre, sortie, trous et 2 pièges suffisent.

## 7. V0 à construire quand le concept sortira de l'incubateur

1. Un générateur de petits donjons toujours solvables.
2. Phase de prescience de 10 secondes avec carte complète + objectifs.
3. Fermeture de la vision au GO + brouillard de guerre local.
4. Déplacement très rapide et attaque instantanée.
5. Objectifs fixes : 3 monstres + clé + porte + trésor + sortie.
6. Deux pièges mobiles déterministes.
7. Une petite erreur de prescience contrôlée par run.
8. Timer autour de 8–15 secondes à calibrer.
9. Restart instantané du même seed.
10. Meilleur temps conservé + piste jungle avec gros drop au GO.

**Question décisive du prototype :** est-ce que `voir → mémoriser → courir dans le noir → corriger` donne plus envie de retry que la version où le niveau reste visible ?

## 8. Point de vigilance

La prescience imparfaite est potentiellement excellente mais dangereuse : elle doit créer de l'adaptation, jamais invalider la préparation. Le joueur doit perdre parce qu'il a mal mémorisé, mal exécuté ou mal réagi — pas parce que le jeu a secrètement déplacé l'objectif essentiel.
