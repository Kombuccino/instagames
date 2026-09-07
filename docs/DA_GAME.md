# DA GAME — Recherche et refonte artistique du gameplay

## Mission et limites

Appliquer `DA_CORE.md`. Concevoir un vrai univers jouable, pas seulement un écran spectaculaire. Les jeux MiniFugg peuvent être très différents : pixel art, encre, papier, graphisme vectoriel, objets tactiles ou vraie 3D low-poly. Leur cohérence vient de leur propre DA, pas d'un habillage générique commun.

Une refonte graphique ne change pas les règles, le scoring, les contrôles ou la géométrie validée. Lire `ART_DIRECTION.md`, `GAME_STATUS.md`, le manifeste existant et le jeu réel. Vérifier ce qui est déjà choisi. Ne pas redemander une DA à chaque lot d'assets ; ouvrir seulement les décisions réellement manquantes.

Un prototype initial peut rester neutre. Une production artistique demandée ne peut pas être remplacée par ce prototype neutre rebaptisé « minimaliste ».

## Explorer avant de décliner

Si la DA n'est pas fixée, proposer normalement deux ou trois pistes réellement distinctes sur **le même jeu, le même cadrage et le même état fonctionnel**. Changer uniquement la palette d'un même dessin n'est pas une recherche suffisante.

Pour chaque piste, définir l'émotion, les silhouettes, la palette, la matière, le traitement des contours et des ombres, la typographie locale, le mouvement et la faisabilité de production. Préciser ce qui rend cette piste spécifique au jeu. Recommander une direction avec ses avantages et risques.

Partir de médiums et de traditions graphiques, pas d'une suite d'adjectifs. Quand une recherche externe est utile, chercher des références contextualisées et attribuées : illustration, édition, animation, objets, décors, jeux ou techniques. Ne pas attribuer une référence non consultée ni confondre inspiration et asset réutilisable. Aucune imitation d'un artiste précis n'est nécessaire pour définir une période ou un médium.

## Familles disponibles, non obligatoires

**Pixel Dungeon / pixel art construit :** silhouettes franches, grille et tailles de pixels cohérentes, palette contrainte, textures par groupes de pixels, tramage mesuré, animation par poses lisibles. Ce vocabulaire peut quitter le donjon et changer de palette. Refuser l'image lisse simplement passée au filtre pixel ; contrôler les raccords, les échelles et la lecture des sprites.

**Paper Cut :** papiers, carton, feutre, découpes et impressions superposées ; bords volontairement imparfaits, ombres de couches, manipulations tactiles. Les cartes et objets existent comme matière, pas comme cartes SaaS arrondies couvertes d'une texture papier.

**Ink Pulp :** contours d'encre, silhouettes anguleuses, aplats, trames, brosse sèche, légendes et impacts expressifs. Humour noir, étrangeté et grotesque sont possibles. Donner un rythme de bande dessinée sans multiplier les éclaboussures au détriment des cibles.

**Toybox :** objets épais, bois peint, mousse, caoutchouc ou plastique volontairement choisi ; poids, anticipation, collision et déformation lisibles. Ce n'est pas une permission de fabriquer un pack de jouets brillants interchangeable ou de rendre tous les jeux enfantins.

**Sports Broadcast :** chiffres nets, chronométrage, pistes, repères directionnels et transitions rapides. Priorité à l'information et au rythme ; pas de faux télémètres décoratifs. Cette famille reste locale au jeu, elle ne redessine pas le ladder Core.

**Editorial Grid :** composition typographique, colonnes, traits, index, diagrammes, grands nombres et palette retenue. Le vide et les proportions portent l'identité. Ne pas confondre sobriété et absence de travail graphique.

**Direction personnalisée, vectorielle ou low-poly :** autorisée et souvent souhaitable. Définir sa grammaire concrète : masses, facettes, perspective, matériaux mats, couleurs et lumière pour la 3D ; formes, épaisseurs, aplats et mouvement pour le vectoriel. Une 3D simple peut être chaleureuse et singulière sans photoréalisme ni éclairage de démo moteur.

Les kits détaillés sont dans `STYLE_SYSTEM.md`, `docs/style-kits/` et `src/style-kits/catalog.ts`. Ils servent de vocabulaire, pas de templates imposés. Limiter les mélanges à ceux qu'une intention cohérente justifie, normalement deux familles au plus.

## Verrouiller une direction exploitable

Après le choix, mettre à jour `src/games/<id>/ART_DIRECTION.md` avec la référence exacte, la validation datée, la palette, les silhouettes, matières, typographies, composition, mouvements/FX, liens avec le son, exclusions et marge de liberté. Les décisions propres à ce jeu restent dans ce fichier, pas dans une nouvelle DA globale concurrente.

Pour une modification locale, garder le reste intact. Si une contrainte technique rend une promesse impossible telle quelle, présenter le compromis concret plutôt que changer silencieusement de style.

## Concevoir pour le stage réel

Utiliser le viewport logique déclaré, normalement `390 × 844` en portrait ou `844 × 390` en paysage. Adapter par mise à l'échelle uniforme, pas par une composition PC différente. Les dimensions des textures peuvent être supérieures ; elles ne changent pas les coordonnées du jeu.

Vérifier tôt la place des textes, hitboxes, objets, HUD local, contrôles et du petit retour Core. Tester les états simples et chargés, les grandes valeurs et les gestes en cours. Les décors ne doivent pas gagner la bataille du contraste contre l'action.

La 2D nouvelle ou migrée utilise Phaser ; la vraie 3D utilise Three.js selon `GAME_ENGINE_ARCHITECTURE.md`. Ne pas ajouter un moteur ou une couche CSS legacy pour obtenir une variante visuelle plus rapidement.

## Du concept aux assets : un seul propriétaire par élément

Une maquette approuvée n'est pas automatiquement un fond runtime. Suivre `GAME_ART_PRODUCTION_PIPELINE.md` et créer/actualiser `ASSET_MANIFEST.md` avant la bascule.

Distinguer l'environnement permanent, la décoration animable, les surfaces structurelles, les contrôles à états et le contenu dynamique/FX. Une image de fond ne doit pas contenir les chiffres, chemins, sélections, jauges ou boutons que le moteur affichera de nouveau par-dessus.

Produire des composants propres : alpha réel, pivots, dimensions utiles, marges transparentes mesurées, profondeur, zones occultées reconstituées et états cohérents. Les éléments répétés partagent un gabarit ; une texture extensible conserve ses coins et ornements. Préparer spritesheets, atlas, tuiles ou masques seulement lorsqu'ils sont utiles.

Les scores, calculs, textes traduisibles et états restent dynamiques. Les objets artistiques promis restent de vrais assets ; ne pas les remplacer par des rectangles, emojis ou formes procédurales génériques. La géométrie moteur convient en revanche aux masques, sélections, effets ou objets réellement procéduraux.

## Mouvement, frontières et validation

Définir pour chaque animation son déclencheur, son pivot, sa durée, son amplitude, son interruption et sa version réduite. Donner du poids ou un caractère matériel ; ne pas appliquer le même flottement/rebond à tout. Les FX soutiennent une action. L'audio passe par le système Core existant.

Les styles du jeu restent dans son dossier et ne ciblent pas les interfaces, conteneurs ou variables globales du Core. Le Core ne dépend pas des classes privées du jeu. Plusieurs fichiers fonctionnels sont possibles ; des couches successives `fix/v2/final` ne le sont pas. Git conserve l'historique.

Intégrer d'abord un échantillon représentatif, le comparer à la référence, puis étendre le pack. Vérifier tous les états utiles et les écrans normalisés, la lisibilité tactile, l'absence de doubles dessins, les animations hors écran et le coût sur mobile. Un build vert ne prouve pas la fidélité artistique.

## Micro-brief à remplir

> Produire [étude de gameplay / asset précis / état] pour [jeu]. Mécanique et situation : [résumé utile]. Référence approuvée : [image disponible et rôle]. Conserver [géométrie, nombre d'objets, identité]. Traitement : [famille, palette, médium, silhouettes, lumière]. Zone logique : [dimensions/ancrages]. Partie dynamique laissée au moteur : [éléments]. Sortie : [composant isolé, alpha, états nécessaires]. Aucun overlay Core ni information variable dessinée dans le fond. Ne pas changer les règles ou produire une cover à la place.
