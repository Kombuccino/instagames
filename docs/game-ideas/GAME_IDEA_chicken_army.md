# GAME IDEA — Chicken Army

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Chicken Army  
> **Genre:** Short incremental / light arcade management  
> **Format:** Mobile/browser, orientation to decide  
> **Core tone:** Cute, absurd, militaristic parody with a hidden dark punchline

## 1. Concept d'origine

Le joueur commence avec un tout petit poussin dans une cour / ferme remplie de choses à picorer.

Au début, le poussin ne peut manger que de minuscules graines. En grandissant, il peut accéder à des aliments de plus en plus gros : grains plus riches, insectes, vers de terre, etc.

Une fois suffisamment développé, le poulet devient un **Chicken Soldier** et rejoint la **Chicken Army**.

Le but apparent est de faire grandir assez de poulets pour constituer une armée de plus en plus impressionnante, jusqu'à être prêt à affronter les humains.

Le joueur ne sait pas que cette guerre est perdue d'avance : à la fin, les humains gagnent toujours et l'armée entière finit transformée en wings / buckets de fast-food.

Le jeu doit rester court. Il peut être conçu comme un incremental simple : le joueur améliore l'accès à la nourriture, accélère la croissance et augmente le nombre de poulets produits.

## 2. Pitch

**Élevez une adorable armée de poussins, nourrissez-les, transformez-les en soldats et préparez la grande guerre contre l'humanité — sans savoir ce qui vous attend réellement au bout.**

Le plaisir vient de la montée en puissance très visible : un poussin ridicule devient une armée organisée, avec une conclusion brutale et absurde qui recontextualise toute la partie.

## 3. Boucle de gameplay

1. Faire picorer le poussin / générer de la nourriture.
2. Le faire grandir pour débloquer de nouvelles nourritures plus rentables.
3. Atteindre le stade poulet adulte puis Chicken Soldier.
4. Envoyer le soldat dans l'armée.
5. Utiliser les gains / ressources pour accélérer les prochains cycles de croissance.
6. Débloquer davantage de poussins, nourriture et capacité de production.
7. Construire progressivement une armée suffisamment grande pour lancer la bataille finale.

Le joueur doit sentir une vraie accélération : au début il s'occupe presque d'un seul poussin ; à la fin il gère une petite machine à produire des soldats-poulets.

## 4. Progression / mécanique incremental

Progression possible très simple :

- **Poussin** : petites graines uniquement.
- **Jeune poulet** : nourriture plus grosse / meilleure valeur.
- **Poulet adulte** : vers, insectes et ressources plus riches.
- **Chicken Soldier** : quitte la cour et rejoint l'armée.

Améliorations possibles :
- plus de grain disponible ;
- meilleure valeur nutritionnelle ;
- vitesse de picorage ;
- vitesse de croissance ;
- plusieurs poussins simultanés ;
- meilleure capacité de la cour ;
- recrutement / entraînement accéléré.

Éviter un arbre d'upgrade énorme : l'expérience doit rester immédiatement compréhensible et relativement courte.

## 5. Fin cachée

La bataille finale doit être présentée comme le grand accomplissement de la run : armée alignée, musique héroïque, marche militaire, sentiment de victoire imminente.

Puis rupture.

Les humains gagnent systématiquement.

Le résultat final révèle progressivement les Chicken Soldiers transformés en nourriture de fast-food : wings, buckets, cartons, comptoir ou iconographie générique de chaîne de poulet frit.

**Important : ne pas annoncer cette fin au joueur avant qu'elle arrive.** Toute l'interface et la progression doivent sincèrement vendre l'idée que l'armée est en train de devenir assez puissante pour gagner.

La chute doit être drôle et sèche, pas gore.

## 6. Direction artistique & son

### Visuel
- Univers très mignon et lisible au départ : petite cour, poussins ronds, aliments clairement reconnaissables.
- Transformation progressive de la ferme en mini-complexe militaire absurde : casques, petites formations, drapeaux, camp d'entraînement, armée qui grossit en arrière-plan.
- L'armée doit devenir visuellement disproportionnée par rapport au minuscule point de départ.
- Style possible : 2D illustrée, pixel art propre ou petite 3D stylisée ; technologie à choisir plus tard.
- La conclusion fast-food doit conserver le même langage graphique pour renforcer le gag.

### Son
- Picorage très satisfaisant : petits `tok/tik/pok` rapides.
- Poussins / caquètements courts et mignons.
- Musique légère de ferme au début.
- Ajout progressif de caisse claire, marche militaire et fanfare à mesure que l'armée grandit.
- Grand thème héroïque juste avant la bataille, puis coupure brutale / jingle absurde lors du reveal final.

## 7. Assets principaux

Pour une V0 :
- poussin ;
- jeune poulet ;
- poulet adulte ;
- Chicken Soldier ;
- 4–5 types de nourriture ;
- cour / ferme simple ;
- zone d'armée en arrière-plan ;
- quelques accessoires militaires miniatures ;
- compteur d'armée / progression ;
- écran / animation de bataille finale ;
- éléments génériques de fast-food pour le reveal.

Toute image produite devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. Un poussin dans une petite cour.
2. Trois stades de croissance + Chicken Soldier.
3. Trois types de nourriture de valeur croissante.
4. Picorage automatique ou semi-automatique.
5. Deux ou trois upgrades seulement.
6. Plusieurs poussins qui apparaissent progressivement.
7. Compteur visible de Chicken Soldiers rejoignant une armée au fond.
8. Objectif final d'armée à atteindre.
9. Petite séquence de marche vers la bataille puis révélation fast-food.

**Question décisive du prototype :** est-ce que la satisfaction de faire grossir très vite une armée de poulets suffit à porter une courte expérience jusqu'à la chute finale ?

## 9. Points de vigilance / pistes à tester

- Ne pas faire durer le jeu trop longtemps : la blague finale perdrait de sa force après une heure de grind.
- La croissance doit être très visuelle et très rapide à comprendre.
- Ne pas multiplier les monnaies et systèmes : probablement une seule ressource principale suffit.
- Le joueur doit croire sincèrement que la taille de son armée compte pour la bataille finale.
- La fin fonctionne mieux si elle arrive après un vrai crescendo héroïque.
- À tester : purement incremental automatique, ou légère interaction active de picorage / placement de nourriture pour éviter la passivité totale.
