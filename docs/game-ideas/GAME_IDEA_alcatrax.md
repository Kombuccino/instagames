# GAME IDEA — Alcatrax

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Alcatrax  
> **Genre:** Hide-and-seek inversé / observation / arcade  
> **Format:** Mobile/browser, probablement portrait ou carré  
> **Tech:** Ouverte — 2D stylisée, diorama ou légère 3D

## 1. Concept d'origine

Le jeu se déroule dans un camp de prisonniers volontairement indéfini. Le joueur n'incarne pas un prisonnier qui cherche à s'évader : il contrôle **le projecteur de surveillance** et doit repérer les détenus qui tentent de s'échapper dans l'obscurité.

Le terrain est rempli de faux signaux et de mouvements parasites : prisonniers, animaux, tanukis, branches, feuilles qui bougent, objets animés, silhouettes douteuses, etc. Tout peut attirer l'attention.

Quand le joueur éclaire / valide une cible, le spot entre en **recharge pendant quelques secondes**. Pendant ce temps, impossible d'attraper quelqu'un d'autre. Une erreur de jugement devient donc coûteuse, surtout lorsque plusieurs vraies tentatives d'évasion se produisent en même temps.

Les prisonniers deviennent progressivement plus malins : immobilité quand la lumière passe, détours, camouflage, déplacement derrière d'autres éléments, travail en groupe ou leurres.

Le but est d'attraper le maximum d'évadés avant qu'ils ne sortent de la zone.

## 2. Pitch

**Vous tenez le projecteur d'Alcatrax : balayez la nuit, distinguez les évadés des faux mouvements et choisissez bien quand frapper, car chaque capture met votre lumière hors service quelques secondes.**

C'est un hide-and-seek inversé où la difficulté vient moins de la vitesse pure que de la lecture de scène, du doute et du coût d'un mauvais choix.

## 3. Boucle de gameplay

1. Balayer la zone avec le faisceau.
2. Observer les mouvements suspects dans l'obscurité.
3. Identifier si la cible est un prisonnier, un leurre ou un élément innocent.
4. Cliquer / taper pour verrouiller la cible.
5. Bonne cible : prisonnier capturé, points gagnés, spot en recharge.
6. Mauvaise cible : spot quand même indisponible, pénalité éventuelle.
7. Pendant la recharge, d'autres évadés continuent à bouger.
8. La densité, l'intelligence des prisonniers et les faux signaux augmentent avec le temps.

## 4. Principes de game design

### Projecteur
- Le faisceau suit directement le doigt / curseur.
- L'éclairage révèle mieux les silhouettes mais ne doit pas rendre tout trivial.
- Après chaque tentative validée : cooldown visible d'environ 2–3 secondes au départ.
- La recharge est la ressource stratégique centrale du jeu.

### Évadés
Archétypes possibles :
- **Basique** : court tout droit vers la sortie.
- **1, 2, 3 soleil** : s'immobilise quand le faisceau passe sur lui puis repart.
- **Rase-mur** : longe les bords / zones sombres.
- **Camouflage** : se fond près d'un décor ou d'un groupe.
- **Leurre** : provoque volontairement un mouvement ailleurs.
- **Binôme** : un prisonnier attire la lumière pendant qu'un autre avance.
- **Sprinter** : attend longtemps puis tente une sortie très rapide.

### Faux signaux
- tanuki / animaux ;
- feuilles et branches ;
- linge qui bouge ;
- ombres ;
- objets roulant ou oscillant ;
- personnel / silhouettes autorisées ;
- événements absurdes servant uniquement à attirer le regard.

La lisibilité doit rester juste : le joueur doit pouvoir se tromper, mais comprendre après coup pourquoi.

## 5. Progression

- Début : petite zone, très peu de faux signaux, prisonniers naïfs.
- Ensuite : plusieurs chemins d'évasion et davantage d'activité nocturne.
- Puis : prisonniers qui réagissent au projecteur et exploitent son cooldown.
- Niveau avancé : plusieurs tentatives coordonnées, leurres et zones partiellement masquées.
- Fin de run : surcharge visuelle contrôlée où le joueur doit choisir quels suspects valent réellement une utilisation du spot.

Le score peut combiner : captures, séries sans erreur, vitesse de détection et pourcentage d'évadés stoppés.

## 6. Direction artistique & son

### Visuel
- Nuit très lisible avec contraste fort entre zones sombres et faisceau lumineux.
- Ambiance de camp caricaturale / légèrement absurde plutôt que réaliste ou sinistre.
- Les silhouettes doivent être identifiables sur petit écran par animation et comportement davantage que par détail.
- Beaucoup de vie secondaire dans le décor pour nourrir le doute.

### Son
- ronronnement / clic mécanique du projecteur ;
- signal sonore clair de recharge ;
- petits bruits suspects hors champ : branche, pas, animal, métal ;
- réactions courtes lors d'une capture ou d'une erreur ;
- ambiance nocturne qui devient progressivement plus nerveuse.

## 7. Assets principaux

Pour une V0 :
- décor de camp nocturne ;
- faisceau / projecteur + état de recharge ;
- 3 silhouettes de prisonniers ;
- 3 faux signaux (animal, feuille/branche, silhouette innocente) ;
- animations déplacement / immobilité / fuite ;
- points de sortie ;
- feedback capture / erreur ;
- quelques SFX d'ambiance et de projecteur.

Toute image produite devra suivre `docs/ASSET_PIPELINE.md`.

## 8. V0 à construire quand le concept sortira de l'incubateur

1. Une seule cour nocturne.
2. Projecteur contrôlé au doigt / curseur.
3. Trois prisonniers avec trajectoires simples.
4. Trois types de faux signaux.
5. Clic pour capturer la cible sous le faisceau.
6. Recharge du spot pendant 2–3 secondes après chaque tentative.
7. Prisonniers qui continuent de bouger pendant la recharge.
8. Un type avancé qui s'immobilise quand il est éclairé.
9. Score simple sur 60–90 secondes.

**Question décisive du prototype :** est-ce que le joueur ressent un vrai doute amusant avant d'utiliser son spot, plutôt qu'un simple jeu de clic sur des silhouettes ?

## 9. Points de vigilance

- Le cooldown doit créer une décision, pas seulement une frustration.
- Éviter que le faisceau serve simplement de scanner permanent : la scène doit rester partiellement ambiguë.
- Les faux signaux doivent avoir des comportements distincts et apprenables, sinon les erreurs sembleront arbitraires.
- Très bon potentiel pour les prisonniers qui exploitent volontairement les erreurs du joueur ou la recharge du projecteur.
- Le jeu gagnerait probablement à rester court, dense et arcade plutôt qu'à devenir une longue simulation de surveillance.
