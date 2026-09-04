# GAME IDEA — Kill Roro

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Kill Roro  
> **Genre:** Observation / reaction / arcade puzzle  
> **Format:** Portrait-first, browser/mobile  
> **Tech:** Open — 2D, 2.5D/isometric or lightweight 3D blockout

## 1. Concept d'origine

Hommage à un ancien jeu fait par un ami autour d'un simple bouton rouge.

Le principe est volontairement absurde : **il faut appuyer sur le bouton rouge pour tuer Roro avant que le compte à rebours arrive à zéro.**

Roro est visible quelque part dans la scène, toujours enfermé ou placé dans un dispositif ridicule qui explique visuellement pourquoi le bouton peut le tuer : cage, cocotte-minute, machine, piège, capsule, presse, etc. Un fil relie clairement le bon bouton au dispositif de Roro.

Au premier niveau, il n'y a qu'un bouton rouge : impossible de se tromper.

Puis les niveaux ajoutent progressivement des faux boutons et des difficultés de lecture : plusieurs couleurs, nuances proches du rouge, boutons qui clignotent, bougent, se déplacent, se chevauchent ou apparaissent partiellement cachés derrière des objets. Certains obstacles doivent être déplacés au doigt ou à la souris pour révéler ce qu'ils cachent.

Le joueur doit toujours retrouver **le vrai bouton rouge relié à Roro**, et le faire avant la fin du timer.

À la fin du jeu, malgré tous les efforts du joueur, Roro parvient finalement à s'échapper. Il survit donc encore une fois et peut continuer à créer des jeux à la con.

## 2. Pitch

**Trouve le bouton rouge. Tue Roro. Recommence.**

Une règle triviale répétée dans des niveaux de plus en plus absurdes où l'écran devient progressivement un enfer visuel, mécanique et temporel.

Le jeu repose sur un contraste : objectif extrêmement simple, exécution de plus en plus tordue.

## 3. Boucle de gameplay

1. Le niveau apparaît avec Roro, son piège et un ensemble de boutons.
2. Le compte à rebours démarre immédiatement.
3. Le joueur cherche visuellement le bon bouton rouge.
4. Si nécessaire, il déplace / écarte / révèle certains éléments de l'écran.
5. Il appuie sur le bouton.
6. Bon bouton : activation du piège, mort cartoonesque de Roro, niveau suivant.
7. Mauvais bouton ou timer à zéro : échec / réaction de Roro / pénalité à définir.

Le bouton rouge reste **la règle immuable** du jeu. La difficulté vient uniquement de ce qui rend son identification ou son accès plus difficile.

## 4. Progression et variations

### Début
- 1 bouton rouge évident.
- Puis 2 boutons.
- Puis 4, 8, etc.
- Couleurs très distinctes au départ.

### Milieu
- Rouge, bordeaux, rose, orange, magenta, brun rougeâtre.
- Boutons de tailles différentes.
- Faux boutons qui clignotent ou pulsent.
- Boutons qui se déplacent lentement.
- Boutons qui changent de place.
- Boutons partiellement masqués.
- Faux fils qui vont vers d'autres objets.

### Niveaux avancés
- Objets qu'il faut pousser / glisser pour voir dessous.
- Panneaux ou boîtes à ouvrir.
- Gros élément mobile qui traverse l'écran et cache temporairement les boutons.
- Bouton rouge minuscule parmi de gros leurres.
- Plusieurs boutons rouges visuellement identiques : seul le fil permet de trouver le bon.
- Boutons qui changent de couleur après quelques secondes.
- Disposition volontairement chaotique, mais toujours lisible et solvable.

Le jeu doit éviter les pièges arbitraires du type « le bon bouton n'était en fait pas rouge ». La blague vient de la complexification de la recherche, pas de la trahison de la règle.

## 5. Roro, pièges et direction artistique

Roro doit devenir le fil rouge comique du jeu.

Chaque niveau peut le placer dans un nouveau dispositif :
- cage électrifiée ;
- cocotte-minute ;
- presse industrielle ;
- canon ;
- capsule prête à exploser ;
- piège à ressort ;
- aquarium douteux ;
- énorme machine inutilement complexe.

La mise à mort doit rester **cartoonesque, rapide et absurde**, plus proche d'un gag visuel que d'une représentation réaliste de violence.

Visuellement, plusieurs pistes restent ouvertes :
- petite scène 3D isométrique en blockout stylisé ;
- faux diorama / jouet ;
- 2D très graphique avec gros boutons physiques ;
- style interface industrielle rétro.

Le bouton rouge doit toujours être très tactile et satisfaisant : profondeur, enfoncement, lumière, clic mécanique clair.

Le fil entre Roro et le bon bouton est un élément de gameplay important : visible au début, puis progressivement plus difficile à suivre dans le chaos.

## 6. Son / feedback

Le jeu doit être très sonore et tactile :
- gros **CLACK** satisfaisant quand un bouton est pressé ;
- petit buzz / erreur sur faux bouton ;
- timer de plus en plus oppressant ;
- bruit propre à chaque dispositif de Roro ;
- réactions vocales courtes de Roro ;
- silence ou mini pause juste avant l'activation du piège pour renforcer le gag.

La musique peut rester minimale : petite boucle absurde / tension légère, puis davantage de couches ou d'urgence à mesure que le timer et les niveaux deviennent agressifs.

## 7. Assets principaux

Pour une V0 :
- Roro + quelques réactions simples ;
- 1 dispositif de mort ;
- 1 bouton rouge principal ;
- 6–10 variantes de faux boutons ;
- câble / fil lisible reliant bouton et dispositif ;
- timer ;
- 2–3 objets pouvant masquer un bouton ;
- animations d'appui, mauvais choix, activation et échec.

Les assets graphiques devront suivre `docs/ASSET_PIPELINE.md` au moment de leur production.

## 8. V0 à construire quand le concept sortira de l'incubateur

Prototype très court :

1. Roro dans une cage / machine simple.
2. Timer de 5 à 10 secondes.
3. 1 bon bouton rouge + jusqu'à 15 faux boutons.
4. Distribution aléatoire des boutons à l'écran.
5. Plusieurs nuances proches du rouge.
6. Un fil visible reliant le bon bouton à Roro.
7. Un niveau où un objet doit être glissé pour révéler le bouton.
8. Animation comique de réussite et de défaite.

**Question décisive du prototype :** est-ce que chercher un unique bouton rouge sous pression reste drôle après plusieurs niveaux quand on ne change jamais l'objectif, seulement la manière de le cacher ?

## 9. Point de design à préserver

La meilleure structure semble être une **escalade de mauvaise foi visuelle**, mais avec une règle toujours honnête.

Le joueur doit pouvoir se dire : « évidemment que c'était là », jamais « le jeu m'a menti ».

Le gag final est que Roro échappe finalement à toutes les tentatives et repart libre, condamnant le monde à subir encore ses prochains jeux à la con.
