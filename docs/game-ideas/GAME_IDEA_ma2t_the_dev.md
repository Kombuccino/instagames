# GAME IDEA — Ma2t the Dev

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Ma2t the Dev  
> **Genre:** Arcade / attention-management / reaction game  
> **Format:** Mobile/browser, likely portrait or square  
> **Tech:** Open — 2D, isometric, lightweight 3D or stylised office scene

## 1. Concept d'origine

Ma2t est un développeur aux cheveux longs et à la belle barbe, installé devant son écran dans un bureau / open space. Il tape sur un clavier mécanique. Quand tout va bien, le code défile proprement à l'écran, très vert, très beau, avec une rythmique satisfaisante de frappes clavier.

Le problème est que son environnement ne cesse de le perturber : bugs, emails, demandes de features absurdes, collègues, gens qui parlent trop fort, nourriture, discussions qui ne le concernent pas, etc.

Le joueur doit identifier rapidement le type de perturbation et appliquer la bonne catégorie de réponse de développeur. Les réponses ne sont pas des phrases fixes : le joueur choisit un type de réaction, puis Ma2t prononce une réplique aléatoire adaptée issue d'une grande banque de réponses de développeur.

Exemples de familles de réponses :
- grogner / repousser ;
- « ce n'est pas ma faute » ;
- « c'est impossible » ;
- refuser / reporter / renvoyer ailleurs.

Si la mauvaise réponse est choisie, ou si une perturbation n'est pas traitée assez vite, elle affecte le travail. Le code devient progressivement moins propre : apparition de blocs bleus puis de couleurs plus agressives, jusqu'à des blocs rouges dégueulasses représentant du mauvais code et des bugs.

Le jeu doit rendre visible l'état de flow : plus Ma2t est protégé, plus le code est beau, rapide et fluide. Plus il est perturbé, plus la production ralentit et se dégrade.

Une jauge de qualité / bonheur / flow représente cet état. À haut niveau, par exemple au-dessus de 80–85 %, Ma2t entre en zone de performance : le code accélère, le clavier devient plus musical et des bonus de score apparaissent. Une interruption mal gérée casse le bonus, ralentit le code et fait perdre de la qualité.

L'objectif général est de maintenir Ma2t dans un monde merveilleux où il peut coder sans interruption et produire du code sublime.

## 2. Pitch

**Protégez le flow de Ma2t : filtrez les interruptions de l'open space avec la bonne mauvaise humeur de développeur avant qu'elles ne transforment son magnifique code vert en bouillie rouge.**

Le jeu est une satire de la vie de développeur et un jeu de reconnaissance rapide : le joueur ne programme pas, il protège les conditions nécessaires pour programmer correctement.

## 3. Boucle de gameplay

1. Ma2t code automatiquement et génère des points.
2. Des événements apparaissent dans le bureau ou sur ses écrans.
3. Le joueur décide si l'événement concerne Ma2t ou peut être ignoré.
4. S'il faut agir, il choisit parmi 3–4 catégories de réponse.
5. Bonne réponse : interruption neutralisée, Ma2t sort une réplique adaptée, le flow reste haut.
6. Mauvaise réponse / réaction tardive : baisse de jauge, apparition de défauts dans le code, vitesse de production réduite.
7. Maintenir une jauge élevée crée des séries, accélérations et bonus.

La pression augmente par la fréquence, la simultanéité et l'ambiguïté des perturbations, pas par l'ajout de dizaines de commandes.

## 4. Système de perturbations

### Familles principales
- **Bug / incident technique** : nécessite une réponse technique ou de prise en charge.
- **Feature absurde / demande produit** : refuser, reporter ou contester.
- **Interruption directe** : email, collègue, notification, demande immédiate.
- **Bruit ambiant** : dispute, réunion proche, gens parlant fort ; parfois ignorable, parfois à stopper.
- **Tentations / distractions** : nourriture, téléphone, événement amusant, etc.

Chaque événement possède :
- niveau d'urgence ;
- type de réponse attendu ;
- durée avant impact ;
- intensité de perturbation ;
- éventuellement caractère trompeur ou ambigu.

### Réponses de Ma2t
Le joueur choisit une **attitude**, pas une phrase exacte. Ensuite le jeu sélectionne une réplique dans une banque de punchlines.

Exemples de catégories :
- `NOPE` — refus sec ;
- `NOT MY BUG` — responsabilité rejetée ;
- `IMPOSSIBLE` — contradiction technique ;
- `FIX IT` — accepter et corriger.

Les formulations peuvent varier énormément afin de garder Ma2t vivant et drôle sans modifier les règles.

## 5. Flow, code et score

La jauge centrale doit être très lisible et surtout visible à travers **le code lui-même**.

- 85–100 % : code propre, vert, fluide, animations parfaites, frappes musicales, multiplicateur actif.
- 60–85 % : quelques blocs bleus / jaunes, rythme légèrement cassé.
- 30–60 % : erreurs visibles, code plus lent, rouge qui apparaît, clavier moins harmonieux.
- 0–30 % : écran sale, blocs rouges, warnings, Ma2t agacé, production fortement ralentie.

Le score vient du code produit dans le temps. Le joueur continue à gagner même en mauvais état, mais beaucoup moins vite.

À haut flow pendant une durée continue, déclencher un **focus streak** : accélération du code, montée du multiplicateur et embellissement sonore. Une perturbation mal gérée casse immédiatement cette série.

## 6. Direction artistique & son

### Visuel
- Ma2t doit être le centre affectif : cheveux longs, barbe, posture de développeur heureux quand tout roule.
- Bureau lisible avec plusieurs zones d'apparition de perturbations : écran, porte, collègues, téléphone, boîte mail, table, fond sonore.
- Le code n'a pas besoin d'être réel : il doit surtout être graphiquement beau, animé et immédiatement lisible comme propre ou catastrophique.
- Contraste visuel fort entre paradis du flow et dégradation : vert propre → couleurs parasites → blocs rouges agressifs.
- Éviter une interface chargée : les événements doivent être compris par silhouette, icône, couleur et animation.

### Son
Le clavier mécanique est fondamental.

Quand Ma2t est en flow, ses frappes forment presque une petite musique rythmique. Plus la jauge monte, plus le pattern devient dense et satisfaisant. Les interruptions cassent cette musique.

SFX :
- switches mécaniques nets ;
- notifications volontairement agaçantes ;
- soupirs, grognements et courtes répliques ;
- sons d'erreur / compilation ratée ;
- petits stingers lors des focus streaks.

Prévoir une grande banque de courtes répliques humoristiques plutôt qu'une poignée répétée en boucle.

## 7. Assets principaux

Pour une V0 :
- Ma2t assis + quelques états visage/posture ;
- bureau, écran et clavier ;
- rendu animé du code propre / dégradé ;
- 4 types de perturbations visuelles ;
- 4 boutons / gestes de réponse ;
- jauge de flow ;
- animations de clavier / colère / soulagement ;
- quelques collègues / éléments de fond ;
- banques SFX clavier, notifications et répliques.

Toute image produite devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. Ma2t + écran de code animé.
2. Une jauge de flow de 0 à 100.
3. Quatre types de perturbations clairement distincts.
4. Quatre réponses possibles.
5. Bonne/mauvaise association avec feedback immédiat.
6. Dégradation graphique du code selon la jauge.
7. Production automatique de score dépendant du flow.
8. Focus streak au-dessus d'environ 85 % pendant plusieurs secondes.
9. Une vingtaine de petites répliques aléatoires de développeur.

**Question décisive du prototype :** est-ce que reconnaître une interruption et choisir rapidement la bonne attitude est assez drôle et lisible pour soutenir une partie entière ?

## 9. Points de vigilance / pistes à tester

- Ne pas transformer le jeu en QCM textuel : l'identification doit être rapide et visuelle.
- La vraie récompense doit être sensorielle : beau code, clavier parfait, Ma2t heureux, rythme fluide.
- Les événements sans rapport avec Ma2t sont intéressants : ils obligent le joueur à apprendre à **ne pas réagir**.
- La difficulté peut venir de plusieurs perturbations simultanées et de fausses urgences.
- Prévoir une banque importante de répliques, mais garder seulement 3–4 mécaniques de réponse stables.
- Le code rouge ne doit pas être qu'un indicateur abstrait : il doit rendre l'écran visiblement plus laid et frustrant, afin que le joueur ait envie de restaurer le flow.
