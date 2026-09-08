# Les Brochettes de Vlad — Direction artistique

Mise à jour : 8 septembre 2026. Ce fichier réconcilie les décisions acquises pour le gameplay et les covers. Les procédures de référence sont `docs/ACTIONS.md`, `docs/DA_CORE.md`, `docs/DA_GAME.md` et `docs/DA_COVER.md`.

## État des validations

- **Gameplay :** migration Phaser fonctionnelle, mais présentation visuelle actuelle refusée par l'utilisateur le 8 septembre 2026. Reprise de composition requise avant une nouvelle revue.
- **Cover C :** validée explicitement par l'utilisateur le 7 septembre 2026 (« vraiment superbe », à conserver absolument).
- **Covers A/B/D :** encore à explorer. Les versions trop proches du gameplay, trop riches ou trop « ChatGPT/mobile key art » sont rejetées.

## Références gameplay approuvées

- `GFX/crea-chatgpt/game/Vlad-DA1.png` : autorité pour la composition — grand panneau en haut, champ de chute central, loges à droite, main/broche partant du grill et ampleur des impacts.
- `GFX/crea-chatgpt/game/Vlad-DA-Piques.png` : autorité pour les trois piques de réserve dorées/rouges, placées à gauche ; une pique disparaît par client/brochette raté.
- `GFX/crea-chatgpt/game/VLAD-DA-pixelisee.png` : autorité pour les pixels construits, silhouettes nettes, flammes sans blur, clients affamés/joyeux et aliments embrochés aux yeux en croix.
- La capture de l'ancien jeu est une référence comportementale seulement, jamais une cible artistique.

Master gameplay archivé : `MiniFugg - Graphic Archive/Games/vlads-skewers/gameplay-references/vlad-gameplay-pixel-user-reference-2026-09-07.png`, Drive `15_dlZaGY-MUEIPeQmYCW0ODSYc4xs3Et`. Source : 853 × 1844, RGB PNG, 2 479 148 octets, SHA-256 `27f4dcaa7102c3b3a88eedd6e3a4295ceb04e8abcb18b4c91c386b4b43043b69`.

**Rôle : univers et matière du gameplay, pas gabarit de cover.** Ne pas reprendre automatiquement son cadrage, ses personnages, ses flammes, son UI ou sa composition dans les jaquettes.

## Identité gameplay

Street food infernale, vampire cuisinier, humour noir de dessin animé, barbecue très chaud, clients monstrueux ravis du spectacle. Pixel art franchement visible et cohérent en taille de pixel ; pierre, métal et bois par groupes de pixels ; masses sombres et contre-jours orange. Pas de rendu 3D plastique, de bloom permanent, de blur ou de filtres lissants.

Le stage logique reste 390 × 844 et se met à l'échelle uniformément. Aucun titre du jeu, bouton pause ou panneau explicatif décoratif n'est dessiné dans le gameplay. Le score local est à droite et les trois piques de réserve à gauche. La pointe dorée est la seule zone d'empalement.

Le client actif occupe le balcon du bas, dans la portée physique de la pointe. Lui seul affiche la commande. Les balcons/retraits architecturaux restent parfaitement fixes : seuls les clients bougent. Jusqu'à cinq clients en attente sont visibles, empilés depuis le bas ; toute la file du niveau existe dès son ouverture et la pile visible ne diminue qu'une fois passée sous cinq. Chaque client servi ou perdu disparaît sans remplacement. La banque contient au moins quinze personnages distincts, très affamés, joyeux, enthousiastes, capables de sautiller et de recevoir des gouttes de bave séparées précisément au bord de la bouche, jamais aux oreilles.

## Aliments et progression émotionnelle

Ingrédients de recette : bœuf, tomate, poivron, oignon, champignon, courgette, aubergine, puis poulet, tofu et poisson dans les niveaux tardifs. L'ail reste un danger et la goutte de sang un bonus de patience/ralenti distinct.

Les textures raster contiennent **uniquement les corps**. Yeux, bouche, bras, jambes et marques de grille sont des objets Phaser séparés. Le bœuf est une côte rouge avec un os ivoire immédiatement distincte de la tomate, jamais un cube. Les petits bras/jambes sont des fils sombres terminés par de petites mains/pieds clairs, pas une anatomie humaine modelée dans la nourriture. **La bave est réservée aux clients affamés : aucun aliment ne bave.**

Pendant la chute : joie naïve → compréhension → inquiétude → panique et tentative désespérée. Les aliments peuvent tendre les bras, se tenir et se repousser, mais ne peuvent jamais échapper à Vlad ni à la grille. Les ingrédients embrochés ont des yeux `× ×`, une langue molle et quatre membres pendants dotés d'une inertie indépendante : chaque côté suit la broche avec retard, revient sous gravité et ne joue plus une pose de mort rigide.

Tout aliment embroché devient immédiatement doré et appétissant, avec couleur chaude et marques de grille nettes. Un aliment raté s'enflamme au contact de la grande grille, fume davantage, noircit, s'effondre en cendre et disparaît. Les projections restent du jus et de petits morceaux alimentaires colorés, jamais des organes réalistes.

## Gameplay, score et FX

La boucle et le scoring historique sont conservés : recette dans l'ordre, **validation automatique dès le dernier ingrédient embroché sans geste de livraison latérale**, sang = patience/ralenti, ail/mauvais ingrédient/patience = client perdu, fin au troisième client perdu. Valeurs historiques conservées : 2/4/6/10/15 points pour 2/3/4/5/6 aliments ; la valeur 6 reste compatible mais aucune recette de production ne peut désormais dépasser 5 ingrédients. La chaîne rapide et le meilleur multiplicateur de la brochette continuent de multiplier la valeur à la validation.

Le vocabulaire disponible grandit tous les deux niveaux, de 3 à 10 aliments. La recette passe progressivement de 2 à **5 ingrédients maximum**, avec un second verrou sur la pile réelle. L'ouverture reste lisible et l'avalanche véritable arrive tard.

Le percement a du poids : l'aliment entre visiblement sur la pointe pendant environ 0,8 seconde au lieu de se téléporter, tandis que chaque nouvel aliment repousse doucement les précédents vers la main. Le corps conserve exactement l'orientation qu'il avait au contact, sur la broche comme sur la grille. Les quatre membres embrochés sont extrêmement légers : vitesse, accélération et changements d'axe peuvent les faire tourner en grands arcs presque comme de petites hélices, puis la gravité les ramène. Les gerbes utilisent des gouttes, graines, éclats et fragments de tailles différentes qui restent plusieurs secondes et partent dans l'angle de perforation ; leur quantité augmente avec le palier. Les dernières paroles sont dans une petite bulle BD lisible, se décalent si une nouvelle arrive, puis disparaissent par un vrai fondu. La pointe balaie une hitbox légèrement intérieure à la silhouette de chaque aliment. **La tige, la main et le bras ne bloquent et ne poussent plus les aliments : ils les laissent traverser librement ; seule la pointe empale.** Les aliments se séparent entre eux, retombent sous gravité et rebondissent aux murs dans un champ élargi presque jusqu'aux architectures latérales. La pique et le bras authored restent rigides et fixes en taille ; la main enveloppe clairement la poignée rouge et or avec garde et pommeau, et le bras dépasse sous le stage lorsque Vlad monte. Seule la main accepte la prise, dans une ellipse sensiblement plus grande que son dessin. Sa pose naturelle est centrée, un peu relevée et laisse voir environ un tiers du bras ; la butée basse maintient la zone de prise dans CENTRE. Le décalage entre le pointeur et le point saisi reste constant pendant tout le geste, y compris hors canvas et après saturation d'une butée ; la main ne suit jamais le pointeur au-delà de ses limites et reste visible en bas. Un clic raté déclenche un clignotement pixel de la main, interrompu dès une prise valide. Au relâchement, l'ensemble revient automatiquement à cette pose naturelle. La présentation monte en cinq paliers visuels et sonores — normal, ×2, ×3, ×4, ×5 `BRUTALITY!` — sans modifier le calcul de score. Le bonus actif et le multiplicateur restent près de la main ; tout changement pulse fortement avant de se stabiliser. Une brochette complète reste exposée environ 2,35 secondes avant validation automatique pour laisser lire l'entrée et les impacts. Toute valeur de score supérieure reste intacte même si l'intensité artistique est plafonnée à ×5.

Les particules partent vers le haut/les côtés, retombent sous gravité, suivent le ralenti, passent derrière les ingrédients actifs, sont plafonnées et nettoyées. Le climax ×5 peut afficher un grand titre gothique et déclencher une pluie spectaculaire ; il n'est jamais permanent.

Le décor permanent ne contient aucune flamme figée. Des boucles raster pixel-art séparées animent les foyers, la salle embrasée au troisième plan et l'avant de la grille. Les petites flammes des appliques sont précisément ancrées sur leur coupelle et assez contenues pour que la lampe reste lisible. Les braises sont de petites formes effilées jaune/orange/rouge, jamais une pluie de gros rectangles bruns. Toute la DA du jeu reste dans le stage portrait canonique de 390 unités ; les espaces latéraux ordinateur appartiennent au Core et ne reçoivent aucun overscan propre au jeu.

La demande du client reprend la DA : grande bulle authored, broche horizontale rouge et or et aliments assez grands pour être identifiés sur petit écran, puis jauge d'impatience séparée. Tous les portraits sont calés par leur ligne de base sur les tablettes fixes de leurs loges, indépendamment des différences de silhouette dans l'atlas. Un petit compteur secondaire `RESTE ×N` suit le sommet de la pile sans masquer un visage.

Le panneau authored du haut pulse au changement de niveau sans couvrir le champ. Il montre uniquement le niveau et les aliments disponibles ; le nombre de clients n'y apparaît plus.

## Cover — titre et philosophie

Titre de jaquette par défaut : **`Vlad's Skewers`**. Utiliser le français uniquement pour une édition française explicitement conçue comme telle.

Les covers interprètent la **fantaisie** du jeu ; elles ne doivent pas prouver le gameplay. Elles peuvent être plus sérieuses, plus inquiétantes et plus premier degré. Elles ne doivent pas faire l'inventaire des ingrédients, clients, bras, recettes et FX.

Les aliments à yeux/pattes ne sont pas un motif obligatoire de cover. Ils peuvent être absents. S'ils apparaissent, ils sont rares et choisis pour l'idée de l'image. Éviter la foule qui crée un sentiment Disney/cartoon familial. Simplifier : une idée dominante, détails sélectifs, espace négatif, hiérarchie claire, impression/medium identifiable, vraie jaquette fin 80s/début 90s. Aucun UI, score, niveau, CTA, prix, bouton ou pseudo-interface dans le raster.

Les familles restent celles de `DA_COVER.md` : A pulp européen/franco-belge ; B boîte micro-ordinateur européenne ; C affiche graphique/éditoriale d'Europe de l'Est ; D réinterprétation culturelle.

## Cover C — VALIDÉE

Fichier exact : `vlad-cover-c-graphic-poster-approved-2026-09-07.png`, 941 × 1672 RGB PNG, 2 709 942 octets, SHA-256 `582db78b3abd6d9724cb6261fa6c1563f3e5a4542ed5a3d639c982dabb5c1872`.

Archive : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-validated/`, Drive fichier `1blXf0mUKernZn8eQpa8oWXEpFQTOehKM`, dossier `1o5SBto8zGF_fx7FaUTvn9wcEjBpaF7OZ`.

Sont validés : composition graphique, grands aplats noir/rouge/crème, contraste, respiration, qualité d'affiche imprimée, silhouette dominante de Vlad, château/pleine lune et titre intégré. Les petits aliments anthropomorphes présents sont acceptés dans cette cover précise seulement.

Ne pas régénérer ou « améliorer » ce master. Une future animation/décomposition doit partir de lui et produire des couches séparées sans le remplacer.

## Covers A/B/D — contrainte de recherche

Les premières propositions sont rejetées : trop proches du gameplay, mêmes personnages, même foule d'aliments, grill infernal, trop de détails et d'explication. Pour A/B/D, partir d'une métaphore, ambiance ou objet éditorial unique. Abandonner la brochette comme sujet central et ne pas montrer systématiquement les légumes.

A doit sentir l'illustration commerciale européenne faite à la main ; B une vraie boîte/annonce micro-ordinateur européenne de l'époque, sans pixel art ni UI fictive ; D une édition régionale précise sans pseudo-texte ni clichés touristiques. C reste la référence de force et de qualité, pas un template.

Les rejets sont archivés dans `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-rejected/` (Drive `1dltj7yUcGScWUoiQwOKpkcIgz07cIrjL`). Les planches comparatives produites par erreur sont dans `round3-generator-boards/` (`1jzIFuR4-xUJC-vJpsobIBCnnarLE4EJf`) et ne sont pas des masters.

## À éviter

- néon violet/cyan générique, glassmorphism, bloom permanent ou pseudo-pixel art filtré ;
- cacher la pointe dorée ou rendre une autre partie de la broche interactive ;
- effets plein écran permanents, particules non plafonnées ou labels critiques minuscules ;
- utiliser une référence aplatie comme fond avec score, vies, clients ou ingrédients déjà cuits ;
- restaurer les covers rejetées ou altérer le master C validé.
