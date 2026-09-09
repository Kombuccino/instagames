# GAME IDEA — Black Mines

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Black Mines  
> **Alt titles:** The Black Mines / Coal Descent / Below the Seam  
> **Genre:** Mining / extraction / exploration / atmospheric progression  
> **Format:** Portrait  
> **Tech:** Open — likely Phaser 4 for a 2D/2.5D treatment, Three.js only if genuine 3D later becomes essential

## 1. Concept d'origine

Jeu de mine inspiré du monde minier de la fin du XIXe / début du XXe siècle : travailleurs lents, silhouettes couvertes de charbon, puits, cages d'ascenseur, rails, chariots, lampes et extraction de la terre remontée vers la surface.

La direction visuelle doit être très contrastée : presque en ombres, sans être réellement noir et blanc. Beaucoup de charbon, noirs profonds, beiges sales, lumière chaude des lampes et quelques couleurs extrêmement limitées.

Le joueur descend, extrait, transporte et remonte les ressources. À force de creuser plus profondément, la mine finit par ouvrir sur un **autre monde** : une rupture visuelle et ludique, avec une nouvelle palette plus étrange et plus colorée, comme si le travail minier avait percé la frontière d'un univers caché.

## 2. Pitch

**Descendre pour extraire du charbon. Continuer à descendre jusqu'à découvrir que le monde ne s'arrêtait pas là.**

Black Mines commence comme un petit jeu industriel, sombre et humain, puis devient progressivement une exploration de l'inconnu enfoui sous le réel.

## 3. Boucle de gameplay

1. Descendre dans le puits.
2. Choisir une zone / galerie à exploiter.
3. Creuser / casser / extraire.
4. Charger les matériaux dans un wagonnet ou une benne.
5. Acheminer la charge vers l'ascenseur ou le convoyeur.
6. Remonter / vendre / utiliser les ressources.
7. Améliorer outils, éclairage, voie, profondeur ou capacité.
8. Descendre plus bas.
9. Découvrir cavités, fossiles, accidents, minerais rares, structures ou biomes inconnus.

La boucle doit rester simple et tactile, pas devenir une simulation complète d'exploitation minière.

## 4. Système d'extraction à tester

Pistes simples :
- choisir où creuser dans une grille / coupe verticale ;
- maintenir / rythmer l'outil pour casser la roche ;
- gérer une petite contrainte de lumière, oxygène ou stabilité ;
- pousser / tirer les wagonnets ;
- choisir quand continuer plus loin ou remonter une cargaison sûre.

Le joueur doit ressentir physiquement la lenteur, le poids et la répétition du travail sans que le contrôle soit pénible.

## 5. Risque, accidents et progression

La mine doit rester dangereuse mais lisible :
- éboulements ;
- galeries instables ;
- poches de gaz ;
- eau ;
- panne de lumière ;
- rail bloqué ;
- matériel trop lourd ;
- coût humain visible sans transformer le jeu en gore systématique.

La profondeur augmente à la fois la valeur des découvertes et le risque.

## 6. Le basculement vers l'autre monde

C'est le point fort à préserver.

La première partie du jeu :
- noire ;
- industrielle ;
- humaine ;
- sale ;
- presque monochrome ;
- structurée par rails, bois, acier, poussière et lumière chaude.

Puis une rupture :
- cristaux bleus ou rouges ;
- champignons géants ;
- mer souterraine ;
- ruines d'une civilisation enfouie ;
- organismes inconnus ;
- machines impossibles ;
- cavernes immenses où la mine humaine devient minuscule.

La découverte doit donner l'impression que **le jeu lui-même change de monde**, pas seulement qu'un nouveau minerai a été débloqué.

## 7. Direction artistique

### Surface / mine humaine
- noirs charbon, gris acier, beige papier / poussière, brun bois ;
- quelques lumières ambre / orange ;
- silhouettes très contrastées ;
- grands aplats d'ombre ;
- fumée, vapeur, poussière ;
- composition graphique proche de certaines affiches industrielles / constructivistes, mais sans les copier littéralement.

### Monde enfoui
La palette peut exploser mais rester limitée :
- bleu minéral + rouge profond ;
- vert toxique + pierre crème ;
- violet cristallin + noir ;
- cyan glacial + orange incandescent.

Le contraste entre les deux mondes doit être plus important que le nombre de couleurs.

### Audio
- pioche, métal, rail, treuil, cage d'ascenseur, souffle et échos ;
- rythme industriel lent et lourd ;
- musique qui s'efface ou se transforme lorsque l'on franchit la frontière du monde inférieur.

## 8. Assets principaux

Pour une V0 :
- 1 mineur ;
- 1 puits / cage d'ascenseur ;
- 1 réseau simple de galeries ;
- pioche / foreuse simple ;
- wagonnet ;
- charbon + 2 ressources supplémentaires ;
- 2 dangers ;
- 1 première cavité extraordinaire ;
- 2 palettes visuelles clairement opposées.

## 9. V0 à construire quand le concept sortira de l'incubateur

1. Une coupe verticale de mine.
2. Descente / extraction / chargement / remontée.
3. 3 profondeurs.
4. 3 ressources.
5. 2 risques simples.
6. 3 améliorations.
7. Une première rupture vers un mini-biome souterrain très coloré.
8. Une ambiance visuelle presque finale dès la V0 pour tester la force du contraste.

**Question décisive du prototype :** la boucle lente d'extraction donne-t-elle suffisamment de plaisir et de tension pour que la découverte du monde inférieur paraisse méritée plutôt que seulement décorative ?

## 10. Points de vigilance

- Ne pas transformer le jeu en Dwarf Fortress ou gestion industrielle lourde.
- La lenteur doit être une texture, pas une punition.
- L'autre monde ne doit pas arriver trop tard ; il faut en faire sentir la promesse assez tôt.
- Éviter une esthétique steampunk générique : le monde minier doit rester sale, humain et austère.

Toute production graphique future devra suivre `docs/ASSET_PIPELINE.md`.
