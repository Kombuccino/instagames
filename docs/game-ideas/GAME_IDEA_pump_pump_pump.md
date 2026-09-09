# GAME IDEA — Pump! Pump! Pump!

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Pump! Pump! Pump!  
> **Genre:** Grotesque arcade runner / dodge game  
> **Format:** Portrait vertical runner  
> **Tech:** Open — likely Phaser 4 unless a genuine 3D treatment is chosen later

## 1. Concept d'origine

Le jeu commence avant la course avec un personnage caricatural et trois boutons **PUMP**. Chaque bouton gonfle exagérément une zone différente de son corps ou de sa silhouette.

Le personnage n'est pas forcément une femme : le jeu peut proposer toute une galerie de personnages humains ou animaux, chacun basé sur trois gonflages absurdes différents et sur la caricature de ses propres stéréotypes.

Exemples :
- femme cartoon : fesses / poitrine / lèvres ;
- homme cartoon : slip / biceps / lèvres ou menton ;
- chien : joues / ventre / queue ou autre trio volontairement idiot.

Le joueur peut pomper chaque zone jusqu'à rendre le personnage volontairement absurde, disproportionné et grotesque. Une fois les trois zones gonflées au maximum, la course commence.

Le gameplay est un **runner vertical portrait** : le personnage reste principalement dans la partie basse de l'écran, tandis que le parcours et les dangers arrivent depuis le haut. Le niveau est rempli de cactus, pointes et autres obstacles piquants.

Lorsqu'un obstacle touche une zone gonflée, elle se dégonfle brutalement. Les trois zones constituent donc les trois chances du joueur. Quand elles ont toutes été perdues, la tentative est terminée.

Les niveaux deviennent progressivement plus difficiles : plus d'obstacles, passages plus étroits et combinaisons nécessitant de déplacer rapidement la silhouette dans l'axe horizontal.

## 2. Pitch

**Choisissez votre victime, gonflez trois morceaux de sa silhouette jusqu'à l'absurde, puis remontez un parcours vertical couvert de trucs qui ne demandent qu'à tout crever.**

Le gag repose sur deux choses : la préparation grotesque différente pour chaque personnage et une course où les énormes proportions deviennent directement un problème de collision.

## 3. Boucle de gameplay

1. Choisir / recevoir un personnage.
2. Pomper ses trois zones avant le départ.
3. Démarrer le niveau avec trois réserves intactes.
4. Le personnage reste en bas ; obstacles et décor descendent depuis le haut.
5. Se décaler pour éviter cactus, aiguilles, branches et objets pointus.
6. Une collision fait perdre / dégonfler la zone touchée.
7. Continuer avec une silhouette modifiée et donc des hitboxes différentes.
8. Atteindre l'arrivée avec au moins une zone encore gonflée.

La difficulté peut venir autant du placement des obstacles que de la silhouette volontairement encombrante du personnage.

## 4. Game design à tester

- **Trois vies physiques plutôt qu'une barre de vie** : chaque zone correspond à une chance visible.
- Les trois zones changent selon le personnage ; elles doivent être définies comme données de gameplay et non codées en dur pour un seul avatar.
- Les hitboxes doivent suivre suffisamment la silhouette pour que le gag soit lisible, sans devenir injustes.
- Après dégonflage, la silhouette change immédiatement et peut rendre certains passages suivants plus faciles.
- Les niveaux doivent être courts, lisibles et rejouables.
- Progression possible : obstacles fixes → objets mobiles → séries de cactus → passages très étroits → patterns ciblant une zone particulière.
- Éviter un simple endless runner générique : privilégier de petits parcours construits autour des trois volumes du personnage.
- La variété des personnages doit renouveler la lecture du même parcours : un trio large en haut, en bas ou au centre n'offre pas les mêmes trajectoires sûres.

## 5. Direction artistique & son

### Visuel
- Ton **cartoon grotesque, irréaliste et assumé** ; pas de rendu anatomique réaliste.
- Galerie de personnages très différents : humains adultes, animaux et créatures absurdes possibles.
- Chaque personnage exagère des stéréotypes visuels différents sans chercher le réalisme.
- Gonflage façon ballon / jouet gonflable plutôt que chirurgie réaliste.
- Déformation élastique, squash/stretch, rebond et dégonflage instantané comique.
- Silhouettes extrêmement lisibles sur téléphone, notamment parce que le gameplay est vertical.
- Décors eux aussi absurdes : désert, jardin hostile, serre à cactus, fête foraine piquante, etc.

### Son
- Chaque pression sur **PUMP** produit un son de pompe / caoutchouc qui monte en tension.
- Gonflage maximum : petit couinement ou stinger ridicule.
- Collision : *pshhhht*, pop étouffé, fuite d'air.
- Les trois zones doivent avoir des variations sonores pour rendre immédiatement identifiable ce qui vient d'être perdu.

## 6. Assets principaux

Pour une V0 :
- un premier personnage adulte ou animal, état normal ;
- 3 zones gonflables propres à ce personnage ;
- 3 niveaux de gonflage ou déformation procédurale par zone ;
- états après dégonflage ;
- animation de course ;
- cactus et 2–3 familles d'obstacles piquants ;
- boutons PUMP de préparation ;
- FX gonflage / fuite d'air / collision ;
- petite ligne d'arrivée et décor vertical simple.

Pour la version complète, prévoir plusieurs personnages avec des trios de zones différents plutôt qu'une seule silhouette déclinée.

Toute production graphique future devra suivre `docs/ASSET_PIPELINE.md`.

## 7. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :
1. Un seul personnage mais système prévu pour pouvoir changer ses trois zones.
2. Phase de préparation avec trois boutons PUMP.
3. Trois volumes gonflables visibles.
4. Runner vertical portrait : personnage en bas, obstacles venant du haut.
5. Déplacement gauche/droite simple.
6. Collision localisée sur l'une des trois zones.
7. Déformation / dégonflage immédiat après impact.
8. Échec après perte des trois zones.
9. Trois niveaux courts avec densité croissante.

**Question décisive du prototype :** est-ce que perdre progressivement les trois volumes change suffisamment la lecture du parcours pour que le jeu soit drôle au-delà du gag initial ?

## 8. Point de vigilance

Le concept repose sur la caricature corporelle volontairement absurde. Pour que cela fonctionne visuellement et reste cohérent avec MiniFugg, traiter tous les personnages comme des figures cartoon gonflables et irréalistes. L'humour doit venir du sur-gonflage, de la silhouette et du dégonflage, pas d'un rendu corporel réaliste ou sexualisé.
