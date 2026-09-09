# GAME IDEA — Splasher

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Splasher  
> **Genre:** Arcade filling / aim / pressure-management game  
> **Format:** Portrait  
> **Tech:** Open — likely Phaser 4

## 1. Concept d'origine

En bas de l'écran, le joueur contrôle un canon directionnel qui projette différentes matières liquides ou semi-liquides.

Le canon se joue avec deux gestes complémentaires :

- **Viser / tirer** : on attrape le canon et on tire vers le bas pour régler la puissance. Plus on tire loin, plus le jet porte loin dans la scène. Le déplacement gauche/droite règle l'angle.
- **Pomper / recharger** : en parallèle, il faut effectuer de petits mouvements verticaux répétés pour maintenir la pression du canon. Tirer consomme la réserve ; pomper la recharge.

Le ton doit être volontairement crado et suggestif dans le geste, les animations et les sons, mais le gameplay reste simple à lire.

Le but n'est finalement pas de tuer des cibles : **il faut remplir des formes / récipients avant la fin du temps imparti**.

Les récipients peuvent être très absurdes :
- volcan à remplir jusqu'au cratère ;
- énorme visage avec bouche ouverte ;
- mug / cup de coffee ;
- baignoire, aquarium, seau, bouche d'égout, chaussure géante, etc.

Le jet n'est jamais parfaitement stable. Il dérive légèrement, oscille ou subit les mouvements du support sur lequel se trouve le canon. Le joueur doit donc corriger en permanence son orientation.

Tout ce qui tombe **dans** une zone utile augmente son remplissage. Tout ce qui tombe **autour** éclabousse et tache le décor : le gaspillage devient immédiatement visible.

Chaque niveau est chronométré. Le joueur doit remplir un maximum de zones avant zéro, tout en évitant de vider inutilement la pression dans le décor.

Plus le joueur vise proprement, moins il a besoin de pomper. Plus il arrose n'importe comment, plus il perd du temps à recharger comme un Shadok.

## 2. Pitch

**Remplis tout ce qui peut l'être avant zéro — et essaie d'en mettre le moins possible à côté.**

Splasher mélange précision, gestion de pression et jet volontairement instable. Le joueur alterne tir et pompage pendant qu'il tente de remplir des formes de plus en plus absurdes dans un temps très court.

## 3. Boucle de gameplay

1. Plusieurs récipients / zones à remplir sont visibles dans la scène.
2. Le chrono démarre immédiatement.
3. Le joueur pompe pour maintenir une bonne pression.
4. Il règle angle + puissance du canon.
5. Il projette la matière vers la cible choisie.
6. La matière qui entre dans la zone fait monter son niveau de remplissage.
7. La matière qui rate éclabousse le décor et représente du gaspillage.
8. Le jet dérive légèrement, obligeant à corriger pendant le niveau.
9. Une zone pleine donne un bonus et pousse à passer immédiatement à la suivante.
10. À zéro, score selon quantité remplie, zones complètes, précision et gaspillage.

## 4. Game design à tester

### Canon / jet
- Angle horizontal réglable.
- Portée liée à l'amplitude du tirage vers le bas.
- Jauge de pression visible et très réactive.
- Pression faible : jet court, mou et difficile à contrôler.
- Pression haute : jet plus long et plus stable, mais consommation plus forte.
- Oscillation légère permanente du canon / support pour empêcher un alignement parfait statique.

### Remplissage
Chaque cible possède :
- une forme de réception ;
- une capacité totale ;
- éventuellement une ouverture plus ou moins difficile à viser ;
- un niveau de remplissage visible en temps réel.

Les grandes ouvertures sont faciles mais rapportent peu. Les petites ouvertures / cibles lointaines sont plus rentables.

Certaines zones peuvent demander une matière spécifique plus tard, mais pas dans la V0.

### Gaspillage / salissure
- Les tirs ratés restent visibles sous forme de taches, coulures et flaques.
- Plus la scène devient sale, plus le joueur voit immédiatement qu'il a été imprécis.
- Le gaspillage peut réduire le multiplicateur de précision.
- Important : la salissure est surtout un feedback et une source de comédie, pas une punition qui rend l'écran illisible.

### Temps limité
Le chrono est central. La tension doit venir de la question : **est-ce que je prends le temps de bien viser, ou est-ce que j'arrose vite avant zéro ?**

Les niveaux doivent être courts, probablement 30 à 60 secondes.

## 5. Score / progression

Direction recommandée :

- points par volume réellement versé dans les zones utiles ;
- gros bonus lorsqu'un récipient atteint 100 % ;
- multiplicateur de précision selon ratio utile / gaspillé ;
- bonus pour plusieurs remplissages complets consécutifs ;
- bonus de pression restante / efficacité ;
- petit bonus si la scène reste relativement propre.

Progression possible :
- grosses zones faciles ;
- ouvertures plus petites ;
- cibles plus éloignées ;
- cibles mobiles ;
- canon installé sur un support qui tangue davantage ;
- plusieurs textures avec comportements différents : eau, lait, gélatine, boue, etc.

## 6. Direction artistique & son

### Visuel
- Cartoon crado, coloré, très tactile.
- Canon souple / mécanique avec forte animation de pression et de recul.
- Matières visqueuses et très lisibles : splash, coulure, remplissage, débordement.
- Les récipients doivent être des objets/scènes absurdes plutôt que de simples formes UI.
- Niveau de liquide visible à l'intérieur des cibles.
- Les tirs ratés tachent réellement le décor au fil de la partie.

### Son
- Pompe : rythme mécanique humide / caoutchouteux.
- Tir : intensité liée à la pression.
- Remplissage : glouglou / splash / slosh satisfaisants.
- 100 % : gros *gloup* / stinger de réussite.
- Raté : splat mouillé distinct sur le décor.
- Jauge presque vide : aspiration / pompe creuse.

Le sous-entendu comique reste dans le mouvement, le rythme et les sons, pas dans des éléments explicitement sexuels.

## 7. Assets principaux

Pour une V0 :
- canon directionnel ;
- animation visée / tension / tir / recul ;
- jauge de pression ;
- contrôle de pompe ;
- 1 matière ;
- 3 types de récipients avec formes différentes ;
- niveaux de remplissage visibles ;
- FX jet / splash / coulures / taches ;
- chrono ;
- SFX pompe / tir / remplissage / débordement.

Toute production graphique future devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. Canon en bas de l'écran.
2. Drag gauche/droite + amplitude vers le bas pour angle et portée.
3. Une jauge de pression.
4. Un geste de pompage séparé qui recharge la jauge.
5. Une seule matière : eau ou gélatine.
6. Trois zones à remplir : grande bouche, mug, volcan.
7. Jet avec légère dérive automatique.
8. Remplissage réel en fonction de la matière qui entre dans chaque zone.
9. Taches persistantes pour les tirs ratés.
10. Chrono de 45 secondes + score utile/gaspillé + bonus de récipient rempli.

**Question décisive du prototype :** est-ce que corriger un jet imparfait tout en gérant la pression et le chrono produit une tension suffisamment drôle pour donner envie de refaire immédiatement une partie ?

## 9. Points de vigilance

- Le jet doit être instable mais jamais arbitraire : le joueur doit pouvoir corriger et sentir qu'il maîtrise progressivement le canon.
- Le remplissage doit être très satisfaisant visuellement ; c'est désormais la récompense principale du jeu.
- Le pompage doit être une contrainte de rythme, pas une corvée permanente.
- Les taches doivent donner un historique visible de la performance sans masquer les cibles.
- Garder la règle très simple : **remplir un maximum avant zéro, avec le moins de gaspillage possible.**
