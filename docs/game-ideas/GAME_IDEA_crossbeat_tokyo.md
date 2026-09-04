# GAME IDEA — CrossBeat Tokyo

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** CrossBeat Tokyo  
> **Genre:** Rhythm / crowd-dodging / arcade 3D  
> **Format:** Portrait-first, browser/mobile  
> **Visual target:** Lightweight 3D blockout with restrained stylisation

## 1. Concept d'origine

Le jeu se passe au Japon et exploite la sensation très particulière des énormes passages piétons urbains bondés.

Le joueur doit rejoindre l'autre côté de la rue au milieu d'une foule dense qui arrive face à lui. Il ne peut progresser qu'en sautant d'une **bande blanche du passage piéton à la suivante**.

Les déplacements sont contraints par la musique : chaque saut doit se faire sur le rythme. Le joueur peut choisir sa direction — avant, gauche, droite — mais seulement aux moments autorisés par la mesure.

Au début, le tempo est lent et la lecture de la foule est facile. Plus la partie progresse, plus la musique accélère : le joueur peut donc se déplacer plus vite, mais la foule et les dangers gagnent eux aussi en vitesse et en complexité.

Le personnage reste visuellement vers le bas de l'écran ; c'est le décor et le passage piéton qui défilent pour donner la sensation de progression.

Les premières foules utilisent quelques archétypes simples : salaryman, écolière, femme et homme lambda. Puis arrivent progressivement des comportements particuliers : groupe de joggeurs à la queue leu leu, personne encombrante avec un sac, cycliste lancé à pleine vitesse qui pousse les autres, homme ivre au trajet erratique, gens traversant en diagonale, etc.

Les personnages ont de vraies hitboxes : ils ne se traversent pas. Ils peuvent se gêner, se dévier ou se pousser, ce qui crée des changements de trajectoire et oblige le joueur à anticiper la foule plutôt qu'à seulement mémoriser des patterns.

Chaque niveau correspond à un passage piéton / objectif urbain de plus en plus important : rejoindre un magasin, une rue, un musée, etc., jusqu'à un gigantesque carrefour final inspiré de Shibuya ou Shinjuku.

## 2. Pitch

**Traverser Tokyo une bande blanche à la fois, au rythme d'une musique qui accélère, pendant qu'une foule de plus en plus chaotique fonce vers vous.**

Le jeu mélange rythme, esquive et simulation légère de foule : chaque battement offre une décision rapide, mais les collisions entre piétons rendent la situation partiellement imprévisible.

## 3. Boucle de gameplay

1. Observer les trajectoires qui arrivent depuis le haut de l'écran.
2. Attendre / sentir le prochain beat autorisant un déplacement.
3. Choisir avant, gauche ou droite et sauter vers une bande blanche voisine.
4. Éviter les hitboxes et exploiter les espaces qui se créent dans la foule.
5. Progresser bande après bande jusqu'au trottoir opposé.
6. Enchaîner un nouveau croisement plus large, plus rapide et plus chaotique.

**Collision importante = échec du croisement / fin de run à définir lors du prototype.**

## 4. Principes de game design

### Rythme
- Le déplacement doit être réellement quantifié sur la musique, pas seulement accompagné par elle.
- Fenêtre de validation légèrement permissive sur mobile.
- Le tempo augmente progressivement au sein d'une run et/ou entre les croisements.
- Plus le tempo monte, plus les décisions sont fréquentes et la foule rapide.

### Déplacement
- Le joueur ne se déplace que de bande blanche en bande blanche.
- Trois intentions principales : avant / diagonale gauche / diagonale droite.
- Le personnage reste dans la partie basse de l'écran ; le monde défile sous lui.
- Pas de déplacement analogique libre : le rythme doit rester la règle centrale.

### Foule
Chaque PNJ combine :
- trajectoire ;
- vitesse ;
- taille de hitbox ;
- comportement en collision ;
- niveau de prévisibilité.

Archétypes de départ :
- Salaryman : rapide, ligne droite.
- Écolière : déplacement régulier, légèrement latéral.
- Piéton standard : lent et prévisible.
- Piéton encombrant : hitbox plus large / sac qui dépasse.

Archétypes avancés :
- Joggeurs : groupe en file, crée une longue barrière mobile.
- Cycliste : très rapide, pousse ou décale les autres PNJ.
- Homme ivre : trajectoire oscillante difficile à prévoir.
- Traversée diagonale : coupe plusieurs lignes de circulation.
- Groupe compact : plusieurs corps agissant presque comme un seul obstacle.

### Physique légère
- Les PNJ ne doivent pas se traverser.
- Les collisions PNJ/PNJ provoquent de petits décalages plutôt qu'une physique réaliste lourde.
- Certains archétypes peuvent volontairement pousser les autres.
- Le chaos doit être lisible : jamais une simulation incontrôlable au point de sembler injuste.

## 5. Progression envisagée

- **Niveau 1 :** petit passage piéton, tempo calme, 2–3 types de PNJ.
- **Niveau 2 :** passage plus large, plus de densité et premiers mouvements diagonaux.
- **Niveau 3 :** apparition des groupes et personnages à comportement spécial.
- **Niveau 4 :** vélo, ivrogne, interactions PNJ/PNJ plus fréquentes.
- **Final :** immense crossing inspiré de Shibuya/Shinjuku, tempo élevé, avalanche organisée de tous les comportements appris.

Chaque traversée doit idéalement durer peu de temps : tension immédiate, réussite nette, puis nouveau décor / nouvel objectif.

## 6. Direction artistique & son

### Visuel
- 3D très légère, géométrique, presque maquette / blockout assumé.
- Le Japon doit être immédiatement identifiable sans nécessiter énormément d'assets : signalétique, marquages au sol, façades, passages piétons, écrans lumineux, mobilier urbain.
- Personnages simples mais fortement identifiables par silhouette et animation.
- Caméra haute / légèrement inclinée permettant de lire plusieurs bandes et les trajectoires arrivant au joueur.
- Priorité absolue à la lisibilité des obstacles sur petit écran.

### Musique
- Bande-son nerveuse et répétitive, pensée comme une horloge de gameplay.
- Beat extrêmement clair.
- Accélération progressive sans casser la lisibilité rythmique.
- Chaque niveau peut enrichir l'arrangement plutôt que simplement augmenter le BPM.

### SFX
- Petit son satisfaisant à chaque saut correctement calé.
- Son distinct pour perfect / late / early si ce système est retenu.
- Impacts et réactions de foule très courts.
- Sonnette / freinage du vélo, exclamations de piétons, signal sonore de passage piéton japonais comme éléments d'ambiance.

## 7. Assets principaux

Pour une première version, rester minimal :

- joueur 3D simple + animation de saut ;
- 4 silhouettes de piétons de base ;
- 3–4 silhouettes spéciales (jogger, vélo, ivrogne, personne encombrante) ;
- passage piéton modulaire ;
- trottoirs / bordures ;
- façades urbaines low-detail ;
- quelques panneaux / feux / props japonais ;
- animations simples de marche / course / déséquilibre ;
- feedback visuel du beat et des collisions.

Les assets graphiques devront suivre `docs/ASSET_PIPELINE.md` au moment de leur production.

## 8. V0 à construire quand le concept sortira de l'incubateur

Ne pas commencer par Shibuya ni par une simulation complète de foule.

Prototype minimum :

1. Un passage piéton de 5–7 bandes.
2. Joueur fixe en bas de l'écran.
3. Saut avant / gauche / droite quantifié sur un beat simple.
4. Trois types de PNJ descendant vers le joueur.
5. Hitboxes PNJ/joueur + PNJ/PNJ.
6. Petit déplacement latéral des PNJ lorsqu'ils se percutent.
7. Tempo qui accélère pendant 45–60 secondes.
8. Objectif : atteindre l'autre trottoir.

**Question décisive du prototype :** est-ce qu'anticiper une foule qui se déforme entre deux beats est amusant ?

Si oui, seulement ensuite ajouter niveaux, variété de PNJ, décors japonais et progression complète.

## 9. Points de vigilance / pistes à tester

- Le rythme ne doit pas rendre les contrôles frustrants : fenêtre de beat généreuse et feedback très clair.
- Les collisions entre PNJ sont la meilleure singularité du concept, mais aussi son principal risque technique et d'injustice.
- Éviter que le joueur puisse simplement rester sur une seule colonne et spammer « avant ».
- Tester des zones temporairement sûres / dangereuses créées naturellement par les flux de foule.
- Potentiel intéressant de bonus de score pour les sauts parfaitement calés, passages très proches des PNJ ou longues séries sans rupture de rythme.
- Le design 3D doit rester volontairement minimal pour que la densité de personnages reste fluide sur téléphone.