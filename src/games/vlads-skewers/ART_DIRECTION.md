# Les Brochettes de Vlad — Direction artistique

Mise à jour : 12 septembre 2026. Ce fichier réconcilie les décisions acquises pour le gameplay et les covers. Les procédures de référence sont `docs/ACTIONS.md`, `docs/DA_CORE.md`, `docs/DA_GAME.md` et `docs/DA_COVER.md`.

## État des validations

- **Gameplay :** migration Phaser fonctionnelle, mais présentation visuelle actuelle refusée par l'utilisateur le 8 septembre 2026. Reprise de composition requise avant une nouvelle revue.
- **Covers :** cinq jaquettes validées explicitement par l'utilisateur le 10 septembre 2026 et désormais branchées dans le feed MiniFugg. Elles sont figées comme références approuvées : pas de régénération globale, recoloration ou « nettoyage » automatique.

## Références gameplay approuvées

- `GFX/crea-chatgpt/game/Vlad-DA1.png` : autorité pour la composition — grand panneau en haut, champ de chute central, loges à droite, main/broche partant du grill et ampleur des impacts.
- `GFX/crea-chatgpt/game/Vlad-DA-Piques.png` : autorité pour les trois piques de réserve dorées/rouges, placées à gauche ; une pique disparaît par client/brochette raté.
- `GFX/crea-chatgpt/game/VLAD-DA-pixelisee.png` : autorité pour les pixels construits, silhouettes nettes, flammes sans blur, clients affamés/joyeux et aliments embrochés aux yeux en croix.
- La capture de l'ancien jeu est une référence comportementale seulement, jamais une cible artistique.

Master gameplay archivé : `MiniFugg - Graphic Archive/Games/vlads-skewers/gameplay-references/vlad-gameplay-pixel-user-reference-2026-09-07.png`, Drive `15_dlZaGY-MUEIPeQmYCW0ODSYc4xs3Et`. Source : 853 × 1844, RGB PNG, 2 479 148 octets, SHA-256 `27f4dcaa7102c3b3a88eedd6e3a4295ceb04e8abcb18b4c91c386b4b43043b69`.

**Rôle : univers et matière du gameplay, pas gabarit de cover.** Ne pas reprendre automatiquement son cadrage, ses personnages, ses flammes, son UI ou sa composition dans les jaquettes.

## Identité gameplay

Street food infernale, vampire cuisinier, humour noir de dessin animé, barbecue très chaud, clients monstrueux ravis du spectacle. Pixel art franchement visible et cohérent en taille de pixel ; pierre, métal et bois par groupes de pixels ; masses sombres et contre-jours orange. Pas de rendu 3D plastique, de bloom permanent, de blur ou de filtres lissants.

**Échelle de pixel :** les objets raster et procéduraux doivent partager une granularité apparente cohérente à taille de jeu. Les ajouts procéduraux utilisent une grille logique grossière, normalement `2 px`, et des positions entières. Un asset qui paraît nettement plus fin ou plus grossier que son voisin doit être redérivé/rééchantillonné proprement plutôt que lissé ou compensé par un filtre global.

Le stage logique reste `390 × 844` et se met à l'échelle uniformément. **Vlad est un jeu ancré en bas** dans le contrat Zones MiniFugg : les 390 unités de largeur restent fixes, le grill, la main, la prise et la zone basse restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées au-dessus. Sur un écran plus court, le haut du MASTER est donc recadré en priorité ; sur un écran plus haut, davantage de décor/chute peut apparaître au-dessus sans déplacer le gameplay principal. Aucun titre du jeu, bouton pause ou panneau explicatif décoratif n'est dessiné dans le gameplay. Le score local est à droite et les trois piques de réserve à gauche. **Seul l'apex invisible de la pointe-harpon est une hitbox d'empalement ; aucun carré, halo ou marqueur de hitbox jaune ne doit être visible.**

Le client actif occupe le balcon du bas, dans la portée physique de la pointe. Lui seul affiche la commande. Les balcons/retraits architecturaux restent parfaitement fixes : seuls les clients bougent. Jusqu'à cinq clients en attente sont visibles, empilés depuis le bas ; toute la file du niveau existe dès son ouverture et la pile visible ne diminue qu'une fois passée sous cinq. Chaque client servi ou perdu disparaît sans remplacement. La banque contient au moins quinze personnages distincts, très affamés, joyeux, enthousiastes, capables de sautiller et de recevoir des gouttes de bave séparées précisément au bord de la bouche, jamais aux oreilles.

## Aliments et progression émotionnelle

Ingrédients de recette : bœuf, tomate, poivron, oignon, champignon, courgette, aubergine, puis poulet, tofu et poisson dans les niveaux tardifs. L'ail reste un danger et la goutte de sang un bonus de patience/ralenti distinct.

**Goutte de sang :** elle doit être immédiatement reconnue comme une grosse goutte de sang en pixel art, jamais comme une boule rouge ou une primitive vectorielle. Silhouette en goutte, contour bordeaux très sombre, masse rouge saturée et petit reflet clair ; construction sur grille `2 px`, sans cercle/triangle lissé.

Les textures raster contiennent **uniquement les corps**. Yeux, bouche, bras, jambes et marques de grille sont des objets Phaser séparés. Le bœuf est une côte rouge avec un os ivoire immédiatement distincte de la tomate, jamais un cube. Les petits bras/jambes sont des fils sombres terminés par de petites mains/pieds clairs, pas une anatomie humaine modelée dans la nourriture. **La bave est réservée aux clients affamés : aucun aliment ne bave.**

Les ingrédients naissent **hors du champ visible, au-dessus du MASTER**, puis tombent naturellement dans l'image. Leur création ne doit jamais être perceptible sur la première ligne de pixels, y compris dans le MASTER entier, un navigateur mobile haut ou une app installée. Pendant la chute : joie naïve → compréhension → inquiétude → panique et tentative désespérée. Les aliments peuvent tendre les bras, se tenir et se repousser, mais ne peuvent jamais échapper à Vlad ni à la grille. Les ingrédients embrochés ont des yeux `× ×`, une langue molle et quatre membres pendants dotés d'une inertie indépendante : chaque côté suit la broche avec retard, revient sous gravité et ne joue plus une pose de mort rigide.

Tout aliment embroché devient immédiatement doré et appétissant, avec couleur chaude et marques de grille nettes. Un aliment raté s'enflamme au contact de la grande grille, fume davantage, noircit, s'effondre en cendre et disparaît. Les projections restent du jus et de petits morceaux alimentaires colorés, jamais des organes réalistes.

## Gameplay, score et FX

La recette reste dans l'ordre : sang = patience/ralenti, ail/mauvais ingrédient/patience = client perdu, fin au troisième client perdu. Le scoring a été remplacé le 8 septembre 2026 à la demande explicite de l'utilisateur. Dans une chaîne rapide, les ingrédients valent cumulativement 1, 2, 6, 24 puis 120 points. Le total est multiplié par la moyenne de beauté de la brochette, puis arrondi à l'entier. La beauté de chaque ingrédient dépend de l'écart horizontal du point de perforation à son centre : ×3,5 jusqu'à 10 %, ×2,5 jusqu'à 25 %, ×2 jusqu'à 50 %, ×1,5 jusqu'à 70 %, ×1 jusqu'à 90 %, puis ×0,8. Une moyenne décimale telle que ×2,6 est donc normale.

Le vocabulaire disponible grandit tous les deux niveaux, de 3 à 10 aliments. La recette passe progressivement de 2 à **5 ingrédients maximum**, avec un second verrou sur la pile réelle. L'ouverture reste lisible et l'avalanche véritable arrive tard.

Le percement a du poids : **seul un balayage ascendant de l'apex du harpon peut embrocher**. Le point exact touché dans la silhouette devient l'ancrage ; il est quantifié sur une trentaine de positions possibles et n'est jamais recentré. L'aliment entre visiblement sur la pointe pendant environ 0,8 seconde, chaque nouvel aliment repousse doucement les précédents vers la main, et une prise latérale produit volontairement une brochette bancale. Le corps conserve exactement l'orientation qu'il avait au contact, sur la broche comme sur la grille. Un balayage descendant ne capture rien : il agit comme un coup de couteau, projette du jus et des morceaux selon l'angle, déclenche une panique extrême, accélère la chute et dévie fortement la trajectoire.

Les quatre membres embrochés sont de vrais ragdolls visuels à deux articulations indépendantes. Ils sont extrêmement légers : vitesse, accélération et changements d'axe peuvent les faire tourner en grands arcs presque comme de petites hélices. La gravité du monde les ramène toujours vers le bas de l'écran, quelle que soit l'orientation du corps ; un pied peut donc retomber devant le visage d'un ingrédient tête en bas. Les gerbes utilisent des gouttes, graines, éclats et fragments de tailles différentes qui restent plusieurs secondes et partent dans l'angle de perforation ; leur quantité augmente avec le palier. Les dernières paroles sont dans une petite bulle BD lisible, se décalent si une nouvelle arrive, puis disparaissent par un vrai fondu. **La tige, la main et le bras ne bloquent et ne poussent pas les aliments : seul l'apex du harpon interagit.**

Le bras et la main authored gardent leur taille ; **la tige adapte sa longueur à la commande active et ne montre pratiquement aucune capacité excédentaire** : `110` unités pour 2 ingrédients, `150` pour 3, `190` pour 4 et `230` pour 5. La tige mesure `10` unités de largeur. Sa tête est une petite pointe-harpon pixel art à barbes retournées, lisible comme objet mais sans surlignage de collision. La main enveloppe clairement la poignée rouge et or avec garde et pommeau, et le bras dépasse sous le stage lorsque Vlad monte. Seule la main accepte la prise, dans une ellipse sensiblement plus grande que son dessin. Sa pose naturelle est centrée et attachée au bas de la composition ; le recadrage de viewport ne coupe donc plus sa prise. Le décalage entre le pointeur et le point saisi reste constant pendant tout le geste, y compris hors canvas et après saturation d'une butée ; la main ne suit jamais le pointeur au-delà de ses limites. Un clic raté déclenche un clignotement pixel de la main, interrompu dès une prise valide. Au relâchement, l'ensemble revient automatiquement à cette pose naturelle. La présentation monte en cinq paliers visuels et sonores — normal, ×2, ×3, ×4, ×5 `BRUTALITY!`. Le bonus actif et le multiplicateur restent près de la main ; tout changement pulse fortement avant de se stabiliser.

**Validation d'une brochette complète :** le dernier ingrédient ne déclenche plus un départ instantané. La brochette complète reste visible dans la main pendant environ `1 s` afin que le joueur puisse réellement voir le résultat. Pendant ce délai, la recette est protégée : la pointe n'accepte aucun nouveau contact, ni empalement ni blessure, et la patience ne peut pas expirer avant le départ. Après ce temps de lecture, la brochette vole automatiquement vers le client. Une nouvelle pique devient jouable après le départ ; aucune livraison manuelle n'est demandée.

Les particules partent vers le haut/les côtés, retombent sous gravité, suivent le ralenti, passent derrière les ingrédients actifs, sont plafonnées et nettoyées. Le climax ×5 peut afficher un grand titre gothique et déclencher une pluie spectaculaire ; il n'est jamais permanent.

Le décor permanent ne contient aucune flamme figée. Des boucles raster pixel-art séparées animent les foyers, la salle embrasée au troisième plan et l'avant de la grille. Les petites flammes des appliques sont précisément ancrées sur leur coupelle et assez contenues pour que la lampe reste lisible. Les braises sont de petites formes effilées jaune/orange/rouge, jamais une pluie de gros rectangles bruns. Toute la DA du jeu reste dans le stage portrait canonique de 390 unités ; les espaces latéraux ordinateur appartiennent au Core et ne reçoivent aucun overscan propre au jeu. Le bas du MASTER contient le grill, les grandes flammes et la main et sert d'ancre visuelle ; le haut est la zone qui peut être davantage révélée ou recadrée selon la hauteur disponible.

La demande du client reprend la DA : bulle authored compacte, sans grands vides blancs, broche horizontale rouge et or et aliments assez grands pour être identifiés sur petit écran. La jauge linéaire est supprimée : une petite horloge en camembert, accompagnée des secondes restantes, perd ses secteurs et passe du vert à l'orange puis au rouge. Elle ne pulse que dans l'urgence. Tous les portraits sont calés par leur ligne de base sur les tablettes fixes de leurs loges, indépendamment des différences de silhouette dans l'atlas. Un petit compteur secondaire `RESTE ×N` suit le sommet de la pile sans masquer un visage.

Le panneau authored du haut pulse au changement de niveau sans couvrir le champ. Il montre uniquement le niveau et les aliments disponibles ; le nombre de clients n'y apparaît plus. Comme Vlad est ancré en bas, ce panneau reste secondaire vis-à-vis du gameplay et doit supporter le recadrage des viewports les plus courts ou être repositionné dans la fenêtre visible sans déplacer le monde.

## Cover — titre et philosophie

Titre de jaquette par défaut : **`Vlad's Skewers`**. Utiliser le français uniquement pour une édition française explicitement conçue comme telle.

Les covers interprètent la **fantaisie** du jeu ; elles ne doivent pas prouver le gameplay. Elles peuvent être plus sérieuses, plus inquiétantes et plus premier degré. Elles ne doivent pas faire l'inventaire des ingrédients, clients, bras, recettes et FX.

Les aliments à yeux/pattes ne sont pas un motif obligatoire de cover. Ils peuvent être absents. S'ils apparaissent, ils sont rares et choisis pour l'idée de l'image. Éviter la foule qui crée un sentiment Disney/cartoon familial. Simplifier : une idée dominante, détails sélectifs, espace négatif, hiérarchie claire, impression/medium identifiable, vraie jaquette fin 80s/début 90s. Aucun UI, score, niveau, CTA, prix, bouton ou pseudo-interface dans le raster.

Les familles restent celles de `DA_COVER.md` : A pulp européen/franco-belge ; B boîte micro-ordinateur européenne ; C affiche graphique/éditoriale d'Europe de l'Est ; D réinterprétation culturelle.

## Covers du feed — VALIDÉES

Validation utilisateur : 10 septembre 2026 (« Très bien je valide tout ça. Tu peux les implémenter dans notre feed. »). Les cinq fichiers exacts ci-dessous sont les références de production :

1. `vlad-cover-01-chaos-approved-2026-09-10.png` — cover explosive / brochette jaillissante ;
2. `vlad-cover-02-still-life-approved-2026-09-10.png` — nature morte gothique, peinture ancienne ;
3. `vlad-cover-03-japanese-portrait-approved-2026-09-10.png` — portrait japonais graphique ;
4. `vlad-cover-04-castle-sign-approved-2026-09-10.png` — scène classique de film de vampire avec enseigne de brochettes ;
5. `vlad-cover-05-japanese-stall-approved-2026-09-10.png` — estampe japonaise / comptoir nocturne.

Les cinq PNG approuvés restent intacts sous `public/assets/imported/vlads-skewers/welcome/variants/` et gouvernent toujours le style, le sujet et la composition. La demande du 12 septembre 2026 autorise leur remise aux normes sans réinterprétation : chaque image est prolongée vers le bas dans son propre médium jusqu'au cadre Cover `390 × 844`. Les anciens masters à bandes floues ne sont plus utilisés.

Production active : `public/assets/generated/vlads-skewers/welcome/variants/`. Le feed emploie les dérivés WebP lossless `780 × 1688` avec `fit: cover`, `objectPosition: 'top center'`, `runtime: static`, `selection: seeded` et `unlockScore: 0`. Le titre et la scène approuvée restent en haut ; JOUER recouvre seulement le décor continu ajouté en bas.

Textes autorisés : `Vlad's Skewers` pour les quatre éditions occidentales ; `ヴラッドの串焼き` pour l'échoppe japonaise. Sur cette dernière, le petit panneau secondaire `串焼き` est retiré afin de garder uniquement le titre principal. Aucun `SWIPE TO PLAY`, CTA, score, signature MiniFugg ou pseudo-texte.

Conserver la matière du médium : grain de papier, irrégularités d'impression, trame, coups de pinceau, accidents d'encre ou texture picturale propres à chaque édition. **Ne pas ajouter d'usure artificielle aux coins ou bords** ; la patine peut vivre dans le papier ou l'impression, pas comme un effet de cadre systématique.

Le précédent master C du 7 septembre reste archivé comme étape validée historique, mais la collection de feed canonique est désormais le lot des cinq covers approuvées le 10 septembre. Les rejets restent archivés dans `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-rejected/` et ne doivent pas être réintroduits.

## À éviter

- néon violet/cyan générique, glassmorphism, bloom permanent ou pseudo-pixel art filtré ;
- afficher une hitbox, un carré jaune ou un halo de debug sur la pointe-harpon, ou rendre une autre partie de la broche interactive ;
- effets plein écran permanents, particules non plafonnées ou labels critiques minuscules ;
- mélanger volontairement plusieurs granularités de pixels entre objets voisins sans raison artistique ;
- utiliser une référence aplatie comme fond avec score, vies, clients ou ingrédients déjà cuits ;
- restaurer les covers rejetées ou traiter les cinq références validées comme de simples inspirations ; toute adaptation reste un prolongement fidèle et localisé.
