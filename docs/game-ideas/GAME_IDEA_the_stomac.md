# GAME IDEA — The Stomac

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** The Stomac  
> **Genre:** Arcade collection / dexterity / sorting  
> **Format:** Portrait  
> **Tech:** Likely Phaser 4

## 1. Concept d'origine

Le joueur incarne en quelque sorte l'estomac d'un humain. Des aliments arrivent en permanence et doivent être digérés. Chaque aliment libère un mélange de choses utiles à l'organisme et de saloperies qu'il vaut mieux ne pas envoyer au reste du corps.

Le jeu consiste donc à **récupérer ce qui est bon** tout en évitant, filtrant ou éliminant ce qui est mauvais. La difficulté vient du fait que l'humain continue à envoyer de nouveaux aliments, parfois très mauvais, et que chaque type d'aliment produit un mélange différent.

L'idée n'est pas de faire une simulation médicale réaliste, mais un jeu d'adresse et de collecte très lisible, grotesque et vivant.

## 2. Pitch

**Ton humain mange n'importe quoi. À toi, pauvre estomac, de sauver ce qui peut encore l'être.**

The Stomac transforme la digestion en arcade : casser les aliments, attraper les nutriments utiles, laisser partir les déchets au bon endroit et survivre aux repas de plus en plus catastrophiques.

## 3. Boucle de gameplay

1. Un aliment tombe / arrive dans l'estomac.
2. Il se désagrège ou est digéré en plusieurs éléments.
3. Des éléments utiles et nuisibles apparaissent simultanément.
4. Le joueur collecte / dirige les bons éléments vers l'organisme.
5. Il évite ou expulse les mauvais éléments vers une sortie déchets.
6. Les aliments arrivent de plus en plus vite et produisent des mélanges plus complexes.
7. Le score dépend de la quantité utile réellement récupérée et du niveau de pollution évité.

## 4. Game design à tester

### Types d'éléments
La V0 peut rester volontairement symbolique :
- **utile** : énergie, protéines, vitamines, eau ;
- **mauvais / surcharge** : excès de sucre, gras, alcool, déchets irritants ou éléments toxiques cartoon.

Il ne faut pas chercher une exactitude nutritionnelle poussée : chaque aliment doit surtout avoir une personnalité de gameplay immédiatement compréhensible.

Exemples :
- fruit : beaucoup de bons éléments, peu de déchets ;
- burger : énergie facile mais pluie de gras / déchets ;
- bonbon : énormément de sucre rapide, presque rien d'autre ;
- alcool : éléments perturbateurs qui rendent les contrôles plus instables ;
- plat ultra-épicé : vague agressive qui secoue tout l'estomac.

### Adresse / collecte
Pistes possibles à tester :
- déplacer l'estomac / un collecteur pour attraper les bons éléments ;
- orienter des contractions qui poussent les particules vers différentes sorties ;
- tracer de courts gestes pour capturer des groupes utiles ;
- faire éclater / digérer les aliments au bon moment pour éviter de mélanger plusieurs vagues.

La meilleure mécanique devra permettre de lire instantanément : **ça, je prends / ça, je jette**.

### État de l'estomac
Une jauge simple peut représenter l'état global :
- bon tri → organisme content, score et multiplicateur augmentent ;
- trop de déchets absorbés → inflammation / nausée / perte de précision ;
- saturation → fin de partie ou vomissement cartoon qui remet partiellement le système à zéro.

## 5. Progression

- Début : aliments simples avec séparation très claire.
- Puis : aliments composites qui éclatent en plusieurs familles.
- Ensuite : repas qui arrivent en rafales, boissons, sauces et effets temporaires.
- Plus tard : combinaisons absurdes de malbouffe qui saturent tout l'écran.

Le joueur doit progressivement apprendre non pas une table nutritionnelle, mais les **comportements visuels** propres aux aliments du jeu.

## 6. Direction artistique & son

### Visuel
- Intérieur d'estomac cartoon, organique, visqueux mais mignon / grotesque plutôt que réaliste.
- Aliments immédiatement reconnaissables avant digestion.
- Nutriments représentés comme petites particules / capsules colorées et expressives.
- Déchets plus sales, huileux, collants ou agressifs.
- L'estomac peut réagir : gargouiller, se contracter, rougir, gonfler, trembler.

### Son
- Gargouillis rythmiques, gloups, petits plops et bruits de digestion.
- Son propre et satisfaisant quand un bon élément est collecté.
- Sons gras / collants / acides pour les déchets.
- La musique peut devenir progressivement plus chaotique selon l'état de l'estomac.

## 7. V0 à construire quand le concept sortira de l'incubateur

1. Un estomac unique à l'écran.
2. 5 aliments avec profils de digestion très différents.
3. Deux familles seulement : bon / mauvais.
4. Un contrôle simple de collecte / orientation.
5. Jauge de santé digestive.
6. Score selon bons éléments récupérés moins déchets absorbés.
7. Partie de 60–90 secondes avec accélération progressive.

**Question décisive du prototype :** est-ce que trier très vite les produits d'une digestion devient satisfaisant et lisible, ou est-ce que cela ressemble seulement à un jeu de collecte générique ?

## 8. Point fort / vigilance

La singularité vient du fait que **chaque aliment est une petite bombe de gameplay** : le joueur sait ce qu'il vient d'avaler et anticipe déjà ce que cela va libérer. Il faut donc donner à chaque nourriture un comportement fort et amusant, plutôt que multiplier des particules abstraites.
