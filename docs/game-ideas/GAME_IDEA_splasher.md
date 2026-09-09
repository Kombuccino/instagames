# GAME IDEA — Splasher

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Splasher  
> **Genre:** Arcade shooting gallery / resource management / aim game  
> **Format:** Portrait  
> **Tech:** Open — likely Phaser 4

## 1. Concept d'origine

En bas de l'écran, le joueur contrôle un canon directionnel qui projette différentes matières liquides ou semi-liquides dans une scène remplie de cibles qui apparaissent et réapparaissent.

Le canon se joue avec deux gestes complémentaires :

- **Viser / tirer** : on attrape le canon et on tire vers le bas pour régler la puissance. Plus on tire loin, plus le splash part loin dans la scène. Le déplacement gauche/droite règle l'angle.
- **Pomper / recharger** : en parallèle, il faut effectuer de petits mouvements verticaux répétés pour maintenir la pression du canon. Tirer consomme la réserve ; pomper la recharge.

Le ton doit être volontairement crado et suggestif, avec un geste de pompage un peu équivoque, mais le gameplay doit rester immédiatement lisible.

Plusieurs munitions / canons peuvent exister : eau, lait, gélatine, boue ou autres textures absurdes. Chaque scène fonctionne comme un vieux shooting gallery : des cibles surgissent, bougent, disparaissent, reviennent ailleurs, et le joueur doit nettoyer / éliminer un maximum de menaces.

L'idée centrale est simple : **plus le joueur tire proprement et efficacement, moins il a besoin de pomper. Plus il arrose n'importe comment, plus il passe son temps à recharger comme un Shadok.**

## 2. Pitch

**Vise, splash, repompe.**

Splasher est un jeu de tir tactile où chaque tir vide la pression du canon. Il faut alterner précision et recharge manuelle pour tenir le rythme pendant que les cibles envahissent la scène.

## 3. Boucle de gameplay

1. Des cibles apparaissent dans le tableau.
2. Le joueur règle angle + puissance du canon.
3. Il tire un splash qui consomme une partie de la jauge de pression.
4. Un tir précis peut toucher une ou plusieurs cibles selon la zone d'impact.
5. Entre les tirs, le joueur pompe pour remonter la pression.
6. Les cibles continuent d'apparaître pendant qu'il recharge.
7. Le rythme monte progressivement : plus de cibles, déplacements plus rapides, fenêtres plus courtes.

Le jeu doit encourager les tirs efficaces plutôt que le spam.

## 4. Game design à tester

### Canon
- Angle horizontal réglable.
- Puissance liée à l'amplitude du tirage vers le bas.
- Jauge de pression visible et très réactive.
- Un tir à faible pression produit un jet court / faible / imprécis.
- Une pression haute permet un splash plus puissant et éventuellement plus large.

### Recharge
- Pompage par mouvement vertical répété dans une zone dédiée ou sur un second contrôle tactile.
- Le pompage doit avoir un rythme physique et satisfaisant, pas être un bouton répétitif.
- Il faut pouvoir pomper pendant que la scène continue à vivre.
- À tester : multitouch obligatoire ou alternance rapide entre visée et recharge si le multitouch rend le jeu trop difficile.

### Cibles
- Cibles simples : un impact suffit.
- Cibles mobiles : passent rapidement dans une fenêtre de tir.
- Cibles résistantes : demandent plusieurs impacts.
- Cibles de zone : groupes qu'un bon splash peut éliminer en une fois.
- Faux objets / innocents possibles pour empêcher de tirer partout sans réfléchir.

## 5. Score / progression

Le scoring reste à fixer, mais la meilleure direction semble être :

- points par cible ;
- bonus de combo pour plusieurs cibles dans un seul splash ;
- multiplicateur pour tirs consécutifs sans gaspillage ;
- bonus de pression restante / efficacité ;
- pénalité ou perte de rythme si le joueur tombe à zéro et doit repomper longtemps.

Des niveaux courts peuvent introduire progressivement de nouvelles textures de canon, nouvelles réactions de cibles et nouvelles scènes.

## 6. Direction artistique & son

### Visuel
- Cartoon crado, exagéré, tactile.
- Canon souple / mécanique avec forte animation de recul et de pression.
- Matières très différenciées visuellement : eau claire, lait opaque, gélatine visqueuse, boue épaisse, etc.
- Les impacts doivent éclabousser, couler, coller ou rebondir selon la matière.
- Tableaux très lisibles, façon stand de tir / shooting gallery moderne.

### Son
- Pompe : rythme mécanique humide / caoutchouteux, très satisfaisant.
- Tir : variation selon pression et matière.
- Impact : splash, slurp, splat, plop, gloups, etc.
- Jauge presque vide : bruit de pompe creuse / souffle / aspiration.
- Les sons peuvent renforcer le sous-entendu comique sans devenir explicites.

## 7. Assets principaux

Pour une V0 :
- canon directionnel ;
- animation visée / tension / tir / recul ;
- jauge de pression ;
- contrôle de pompe ;
- 1 type de matière ;
- 4 types de cibles ;
- 1 tableau fixe ;
- FX splash / éclaboussures / coulures ;
- SFX pompe / tir / impacts.

Toute production graphique future devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. Canon en bas de l'écran.
2. Drag gauche/droite + amplitude vers le bas pour angle et puissance.
3. Une jauge de pression.
4. Un geste de pompage séparé qui recharge la jauge.
5. Une seule matière : eau ou gélatine.
6. Trois types de cibles apparaissant dans une scène fixe.
7. Splash avec zone d'impact permettant les multi-kills.
8. Score simple + bonus d'efficacité.
9. Partie de 45–60 secondes.

**Question décisive du prototype :** est-ce que l'alternance viser / tirer / pomper crée une vraie tension drôle et physique, ou seulement une corvée supplémentaire ?

## 9. Points de vigilance

- Les deux gestes simultanés peuvent être excellents sur téléphone mais aussi trop exigeants : tester très tôt le multitouch réel.
- Le pompage doit récompenser la précision : un bon joueur doit vraiment pomper moins.
- Ne pas transformer le jeu en simple spam de splash ; la lecture de cible et la gestion de pression doivent compter.
- Le sous-entendu fonctionne mieux s'il reste dans le geste, les animations et les sons plutôt que dans des éléments sexuels explicites.
