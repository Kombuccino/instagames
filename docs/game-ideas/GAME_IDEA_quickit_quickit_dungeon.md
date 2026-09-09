# GAME IDEA — Quickit Quickit Dungeon

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Quickit Quickit Dungeon  
> **Genre:** Speedrun dungeon / arcade action  
> **Format:** Portrait  
> **Tech:** Likely Phaser 4, procedural tilemap

## 1. Concept d'origine

Un mini-donjon généré procéduralement à chaque partie, construit à partir d'un tileset de dungeon existant et légalement réutilisable.

Le personnage est extrêmement rapide et le niveau est volontairement minuscule. Le joueur ne découvre pas le donjon en jouant : **tout le niveau est visible dès le départ, sans brouillard de guerre**.

Avant chaque run, un compte à rebours d'environ **10 secondes** affiche le donjon complet et les objectifs obligatoires. Ce temps sert à observer le plan, mémoriser les positions importantes et préparer mentalement la route la plus rapide.

Exemples d'objectifs :
- tuer 3 monstres ;
- trouver une clé ;
- ouvrir la porte verrouillée ;
- récupérer le trésor ;
- rejoindre la sortie ;
- éviter trous et pièges.

Après `10, 9, 8... 1`, le run commence immédiatement. Un bon passage peut durer environ **8 à 15 secondes**. Tout doit être très rapide : déplacement, attaques, portes, collecte, mort et restart.

La route préparée n'est toutefois pas totalement sûre : des pièges mobiles, ennemis ou éléments temporisés peuvent modifier les fenêtres de passage et obliger le joueur à adapter son plan pendant l'exécution.

La musique est une jungle / breakbeat massive, très rapide, presque hystérique, qui donne l'impression que le donjon lui-même est lancé à pleine vitesse.

## 2. Pitch

**Dix secondes pour comprendre le donjon. Dix secondes pour l'exécuter parfaitement.**

Quickit Quickit Dungeon est un dungeon crawler joué comme un speedrun miniature : observer, planifier, foncer, rater, recommencer et grappiller encore quelques dixièmes.

## 3. Boucle de gameplay

1. Le donjon complet apparaît.
2. Compte à rebours de 10 secondes : objectifs affichés + lecture libre du niveau.
3. Le joueur prépare mentalement son itinéraire.
4. GO : le chrono du run démarre.
5. Il tue les monstres obligatoires en passant, récupère clé / trésor et ouvre la porte.
6. Il adapte sa trajectoire aux pièges mobiles et événements temporisés.
7. Une fois les conditions remplies, il rejoint la sortie.
8. Temps final + score / rang.
9. **Retry instantané du même niveau** pour optimiser la route, ou passage à un nouveau niveau / seed.

Le joueur doit pouvoir refaire très facilement le même donjon jusqu'à sentir qu'il approche de sa limite personnelle. Son meilleur temps devient alors la vraie performance.

## 4. Game design

### Phase de reconnaissance
- environ 10 secondes fixes avant chaque tentative ;
- aucune menace active pendant cette phase ;
- niveau entièrement visible ;
- objectifs obligatoires affichés clairement ;
- éléments importants très lisibles : clé, porte, trésor, sortie, monstres requis, pièges ;
- le joueur ne peut pas agir avant le GO.

Cette phase ne doit pas être un tutoriel : c'est déjà une compétence du jeu. Les meilleurs joueurs apprennent à lire très vite la géométrie et à construire une route optimale.

### Génération procédurale
Le générateur ne doit pas faire du hasard pur. Chaque niveau doit garantir :
- chemin solvable ;
- clé accessible avant la porte ;
- objectifs réalisables dans le temps prévu ;
- trésor accessible ;
- sortie atteignable ;
- aucune situation demandant d'attendre longtemps ;
- plusieurs routes ou micro-choix intéressants quand possible.

Bonne approche : générer d'abord un petit graphe logique des objectifs, puis habiller ce graphe avec des salles et couloirs du tileset.

### Pièges dynamiques
Le plan visible au départ ne doit pas rendre l'exécution automatique.

Exemples :
- lames qui balayent un couloir ;
- piques cycliques ;
- blocs qui tombent ;
- portes qui s'ouvrent / ferment ;
- monstres qui patrouillent ;
- plateformes ou ponts temporisés.

Ils doivent être télégraphiés et déterministes ou semi-déterministes : le joueur doit pouvoir apprendre leur rythme et améliorer son temps, pas subir une loterie.

### Combat
- contact / attaque très rapide ;
- monstres simples, lisibles en une fraction de seconde ;
- idéalement 1 ou 2 coups maximum ;
- ennemis conçus comme obstacles de trajectoire plus que comme vrais combats RPG.

### Score / maîtrise
Le score principal doit être le **meilleur temps valide** sur un donjon donné.

Le run n'est valide que si tous les objectifs obligatoires sont remplis. Les bonus secondaires peuvent distinguer :
- zéro dégât ;
- zéro erreur ;
- route parfaite ;
- trésors facultatifs ;
- kills supplémentaires.

Le cœur reste cependant le chrono, pas une soupe de multiplicateurs.

### Rejouabilité
- retry du même niveau en un geste ;
- meilleure performance conservée par seed ;
- nouveau niveau généré quand le joueur décide de passer à autre chose ;
- potentiel de **seed quotidienne commune** avec leaderboard au meilleur temps.

## 5. Direction artistique & son

### Visuel
- petit tileset dungeon très lisible ;
- personnages et monstres simples, silhouettes nettes ;
- caméra suffisamment large pour voir presque ou totalement le niveau pendant la reconnaissance ;
- pendant le run, conserver une lecture globale forte ;
- FX courts : slash, poussière, clé aspirée, porte ouverte, trésor flashé ;
- aucun ralentissement cinématique : le jeu doit rester nerveux.

### Musique / SFX
- jungle / breakbeat très rapide, basse massive, breaks agressifs ;
- la reconnaissance peut commencer par une boucle plus tendue ou filtrée, puis **drop massif sur GO** ;
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
2. Donjon entièrement visible dès le chargement.
3. Phase de reconnaissance de 10 secondes avec objectifs affichés.
4. Déplacement très rapide et attaque instantanée.
5. Objectifs fixes : 3 monstres + clé + porte + trésor + sortie.
6. Deux pièges mobiles déterministes.
7. Timer de run autour de 8–15 secondes à calibrer.
8. Restart instantané du même seed.
9. Meilleur temps conservé + nouveau seed accessible immédiatement.
10. Une piste jungle très rapide avec gros drop au GO.

**Question décisive du prototype :** est-ce que le cycle `observer → planifier → exécuter → retry` donne envie de refaire immédiatement le même donjon pour gagner quelques dixièmes ?

## 8. Point de vigilance

Le jeu doit être rapide, pas confus. La reconnaissance doit permettre au joueur de comprendre réellement le niveau, et les pièges dynamiques doivent seulement forcer l'adaptation pendant le run. Si le hasard détermine davantage le chrono que la préparation et l'exécution du joueur, le concept perd son intérêt de speedrun.
