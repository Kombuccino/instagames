# GAME IDEA — Pump! Pump! Pump!

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Pump! Pump! Pump!  
> **Genre:** Grotesque arcade runner / dodge game  
> **Format:** Portrait-first  
> **Tech:** Open — likely Phaser 4 unless a genuine 3D treatment is chosen later

## 1. Concept d'origine

Le jeu commence avant la course avec une femme adulte très caricaturale et trois boutons **PUMP**. Chaque bouton gonfle exagérément une zone différente :

- fesses ;
- poitrine ;
- lèvres.

Le joueur peut pomper chaque zone jusqu'à rendre le personnage volontairement absurde, disproportionné et grotesque. Une fois les trois zones gonflées au maximum, la course commence.

Le niveau est rempli de cactus, pointes et autres obstacles piquants. Le but est d'éviter les contacts : lorsqu'un obstacle touche une zone gonflée, elle se dégonfle brutalement.

Les trois zones constituent donc les trois chances du joueur. Quand elles ont toutes été perdues, la tentative est terminée.

Les niveaux deviennent progressivement plus difficiles : plus d'obstacles, passages plus étroits, combinaisons nécessitant de choisir rapidement où faire passer le personnage.

## 2. Pitch

**Gonflez trois parties d'un personnage jusqu'à l'absurde, puis essayez de traverser un parcours couvert de cactus sans tout dégonfler.**

Le gag repose sur le contraste entre une phase de préparation ridicule et une course où les proportions énormes deviennent directement un handicap de collision.

## 3. Boucle de gameplay

1. Pomper les trois zones avant le départ.
2. Démarrer le niveau avec trois réserves intactes.
3. Courir automatiquement ou progresser dans un parcours court.
4. Esquiver cactus, aiguilles, branches et objets pointus.
5. Une collision fait perdre / dégonfler la zone touchée.
6. Continuer avec une silhouette modifiée et donc éventuellement des hitboxes différentes.
7. Atteindre l'arrivée avec au moins une zone encore gonflée.

La difficulté peut venir autant du placement des obstacles que de la silhouette volontairement encombrante du personnage.

## 4. Game design à tester

- **Trois vies physiques plutôt qu'une barre de vie** : chaque zone correspond à une chance visible.
- Les hitboxes doivent suivre suffisamment la silhouette pour que le gag soit lisible, sans devenir injustes.
- Après dégonflage, la silhouette change immédiatement et peut rendre certains passages suivants plus faciles.
- Les niveaux doivent être courts, lisibles et rejouables.
- Progression possible : obstacles fixes → alternances haut/bas → objets mobiles → séries de cactus → passages très étroits.
- Éviter un simple endless runner générique : privilégier de petits parcours construits autour des trois volumes du personnage.

## 5. Direction artistique & son

### Visuel
- Ton **cartoon grotesque, irréaliste et assumé** ; pas de rendu anatomique réaliste.
- Silhouette très expressive et lisible sur téléphone.
- Gonflage façon ballon / jouet gonflable plutôt que chirurgie réaliste.
- Déformation élastique, squash/stretch, rebond et dégonflage instantané comique.
- Décors eux aussi absurdes : désert, jardin hostile, serre à cactus, fête foraine piquante, etc.

### Son
- Chaque pression sur **PUMP** produit un son de pompe / caoutchouc qui monte en tension.
- Gonflage maximum : petit couinement ou stinger ridicule.
- Collision : *pshhhht*, pop étouffé, fuite d'air.
- Les trois zones doivent avoir des variations sonores pour rendre immédiatement identifiable ce qui vient d'être perdu.

## 6. Assets principaux

Pour une V0 :

- personnage adulte, état normal ;
- 3 niveaux de gonflage ou déformation procédurale pour chaque zone ;
- états après dégonflage ;
- animation de course ;
- cactus et 2–3 familles d'obstacles piquants ;
- boutons PUMP de préparation ;
- FX gonflage / fuite d'air / collision ;
- petite ligne d'arrivée et décor simple.

Toute production graphique future devra suivre `docs/ASSET_PIPELINE.md`.

## 7. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. Phase de préparation avec trois boutons PUMP.
2. Trois volumes gonflables visibles.
3. Un parcours court avec cactus fixes.
4. Déplacement gauche/droite ou changement de lane très simple.
5. Collision localisée sur l'une des trois zones.
6. Déformation / dégonflage immédiat après impact.
7. Échec après perte des trois zones.
8. Trois niveaux courts avec densité croissante.

**Question décisive du prototype :** est-ce que perdre progressivement les trois volumes change suffisamment la lecture du parcours pour que le jeu soit drôle au-delà du gag initial ?

## 8. Point de vigilance

Le concept repose sur une caricature corporelle volontairement absurde. Pour que cela fonctionne visuellement et reste cohérent avec MiniFugg, traiter le personnage comme une figure cartoon adulte, non réaliste, presque gonflable, et faire porter l'humour sur la mécanique de sur-gonflage / dégonflage plutôt que sur un rendu sexualisé réaliste.
