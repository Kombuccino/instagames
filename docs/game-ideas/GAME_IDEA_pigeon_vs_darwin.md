# GAME IDEA — Pigeon versus Darwin

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Pigeon versus Darwin  
> **Genre:** Arcade / risk-reward / timing  
> **Format:** Portrait vertical, short levels  
> **Core controls:** Dash + Picorer

## 1. Concept d'origine

Le joueur contrôle un pigeon qui tente de manger des morceaux de nourriture placés dans des zones de plus en plus dangereuses.

Le jeu est construit verticalement : **le pigeon reste principalement dans la partie basse de l'écran et la zone de danger est située vers le haut**. Plus le joueur remonte vers cette zone, plus la nourriture devient intéressante et plus le risque augmente.

Comme dans la vraie vie, le meilleur morceau est souvent celui qui demande de s'approcher le plus d'un danger : humains sur une terrasse de café ou de boulangerie, circulation, animaux, etc.

Le pigeon possède seulement deux actions principales :
- **Dash** : déplacement rapide pour entrer plus haut dans la zone dangereuse ou revenir vers le bas.
- **Picorer** : action nécessaire pour récupérer la nourriture, donc moment où le pigeon s'expose.

Chaque morceau mangé donne des points et fait grossir le pigeon. Le niveau se gagne en allant chercher suffisamment loin / suffisamment risqué pour devenir le pigeon dominant.

Si le pigeon survit et réussit le niveau : **PIGEON WIN**.
S'il se fait attraper, écraser ou tuer par le danger : **DARWIN WIN**.

D'autres pigeons sont présents dans les niveaux. Certains prennent des risques, certains se font éliminer, et leur comportement sert à la fois de concurrence, d'indice et de mise en scène du danger.

La progression peut tenir sur environ une dizaine de niveaux, avec des environnements de plus en plus dangereux et des nourritures placées de plus en plus loin dans la zone de risque.

## 2. Pitch

**Deux boutons, un pigeon, une miette et une très mauvaise idée.**

Pigeon versus Darwin est un jeu de prise de risque vertical : plus la nourriture est placée haut et proche du danger, plus elle vaut cher. Le joueur doit décider jusqu'où pousser sa chance avant que la sélection naturelle ne tranche.

## 3. Boucle de gameplay

1. Le pigeon démarre dans la zone basse, relativement sûre.
2. Observer le danger situé plus haut et son rythme.
3. Repérer les morceaux de nourriture et leur valeur.
4. Dasher vers le haut dans la zone dangereuse.
5. Picorer au bon moment, ce qui immobilise ou ralentit brièvement le pigeon.
6. Redescendre / dasher vers la zone sûre avant l'impact.
7. Accumuler nourriture, score et masse.
8. Tenter progressivement des morceaux placés encore plus haut.
9. Atteindre l'objectif du niveau ou mourir : **Pigeon Win / Darwin Win**.

Le plaisir doit venir du moment où le joueur sait qu'il pourrait s'arrêter, mais tente quand même le morceau suivant.

## 4. Game design

### Risque / récompense
- La hauteur dans l'écran matérialise le risque : bas = sécurité relative, haut = danger / grosse récompense.
- Plus une nourriture est proche du danger, plus elle vaut de points.
- Les plus gros morceaux peuvent demander plusieurs coups de bec, donc plusieurs fractions de seconde exposées.
- Le pigeon grossit légèrement avec la nourriture : progression visuelle, score et éventuellement inertie / hitbox à tester.
- Les derniers morceaux d'un niveau doivent être réellement optionnels mais très tentants.

### Autres pigeons
- 5–6 pigeons peuvent être présents au début d'un niveau.
- Ils tentent eux aussi de remonter vers la nourriture.
- Certains sont prudents, d'autres suicidaires.
- Leur mort ou leur fuite indique indirectement au joueur le fonctionnement du danger.
- À mesure que le niveau avance, il peut ne rester que les pigeons les plus téméraires / costauds.

### Dangers possibles
- Terrasse : pieds de clients, chaises déplacées, serveur, chien.
- Boulangerie : porte automatique, clients, poussette.
- Route : voitures, vélo, bus traversant la partie haute / zone d'exposition.
- Parc : chien, enfant qui court, tondeuse.
- Zoo / environnement absurde : lion ou autre prédateur, pour pousser le concept au-delà du réalisme.

Chaque danger doit avoir un comportement lisible plutôt qu'aléatoire : rythme, télégraphie, fenêtre sûre.

## 5. Progression envisagée

Une dizaine de niveaux courts :
1. Terrasse calme, humains lents.
2. Terrasse plus dense avec chaises / pieds mobiles.
3. Boulangerie avec passages fréquents.
4. Parc avec chien.
5. Petite rue avec vélo.
6. Route avec voitures espacées.
7. Route dense / bus.
8. Environnement animal dangereux.
9. Mélange de plusieurs menaces.
10. Niveau final extrêmement tentant où la meilleure nourriture est presque suicidaire à récupérer.

La difficulté monte surtout par la lecture du timing et la tentation, pas par l'ajout de commandes.

## 6. Direction artistique & son

### Visuel
- Composition portrait très verticale : pigeon(s) en bas, nourriture répartie vers le haut, danger dominant la partie supérieure.
- Ton cartoon / grotesque plutôt que réaliste.
- Pigeons très expressifs, gras, nerveux, sales et attachants.
- Le grossissement du pigeon doit être immédiatement visible.
- Dangers lisibles avec télégraphie forte avant impact.
- Les morts peuvent être exagérées et absurdes, notamment le pigeon écrasé sur la route, sans chercher un rendu réaliste gore.
- Écran de résultat sec et drôle : **PIGEON WIN** ou **DARWIN WIN**.

### Son
- Roucoulements, battements d'ailes, petits pas rapides.
- Picorage très sec et satisfaisant.
- Dash accompagné d'un flap / whoosh bref.
- Sons de danger très identifiables : moteur, klaxon, aboiement, chaise, freinage.
- Mort : impact caricatural + silence / stinger comique.

## 7. Assets principaux

Pour une V0 :
- pigeon joueur + idle / marche / dash / picorage / mort ;
- 3–4 variations de pigeons concurrents ;
- nourriture en plusieurs valeurs ;
- un premier décor vertical de terrasse ou de route ;
- un danger principal animé dans la partie haute ;
- feedback de valeur / score ;
- écrans PIGEON WIN / DARWIN WIN ;
- SFX de picorage, dash, danger et impact.

Toute production graphique devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :
1. Un écran portrait avec zone sûre en bas et zone dangereuse en haut.
2. Deux boutons seulement : Dash / Picorer.
3. Un danger cyclique clairement télégraphié, idéalement une voiture ou un pied humain dans la zone haute.
4. Trois nourritures placées à trois hauteurs / niveaux de risque différents.
5. Picorer immobilise brièvement le joueur.
6. Un ou deux pigeons IA qui tentent aussi leur chance.
7. Score selon la valeur de la nourriture.
8. Échec instantané sur collision et écran DARWIN WIN.
9. Objectif simple donnant PIGEON WIN.

**Question décisive du prototype :** est-ce que le joueur choisit volontairement de remonter chercher une récompense plus risquée alors qu'il pourrait déjà sécuriser sa victoire ?

## 9. Points de vigilance

- Le dash ne doit pas permettre d'annuler toute erreur : cooldown ou fenêtre d'engagement à tester.
- Le danger doit sembler juste : anticipation possible, pas de morts arbitraires.
- Le grossissement du pigeon est drôle, mais peut aussi augmenter légèrement le risque si la hitbox / inertie évolue.
- Les pigeons IA doivent créer du spectacle sans voler toute la nourriture au joueur de manière frustrante.
- La violence fonctionne mieux en cartoon noir et sec qu'en gore réaliste.
- Garder le jeu très simple : deux actions, lecture du danger, gourmandise et mauvais jugement.
