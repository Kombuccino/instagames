# Les Brochettes de Vlad — Direction artistique

Mise à jour : 7 septembre 2026. Ce fichier conserve les décisions artistiques acquises pour le gameplay et les covers. Les procédures de référence sont `docs/ACTIONS.md`, `docs/DA_CORE.md`, `docs/DA_GAME.md` et `docs/DA_COVER.md`.

## État des validations

- **Gameplay :** DA pixel art construite validée comme direction à produire/migrer ; intégration Phaser non attestée par cette passe.
- **Cover C :** validée explicitement par l'utilisateur le 7 septembre 2026 (« vraiment superbe », à conserver absolument).
- **Covers A/B/D :** encore à explorer. Les versions trop proches du gameplay, trop riches ou trop « ChatGPT/mobile key art » sont rejetées.

## Référence gameplay

Référence utilisateur : `VLAD-DA-pixelisee.png`, 853 × 1844, RGB PNG, 2 479 148 octets, SHA-256 local `27f4dcaa7102c3b3a88eedd6e3a4295ceb04e8abcb18b4c91c386b4b43043b69`.

Archive privée : `MiniFugg - Graphic Archive/Games/vlads-skewers/gameplay-references/vlad-gameplay-pixel-user-reference-2026-09-07.png`, Drive `15_dlZaGY-MUEIPeQmYCW0ODSYc4xs3Et`.

**Rôle : univers et matière du gameplay, pas gabarit de cover.** Ne pas reprendre automatiquement son cadrage, ses personnages, ses flammes, son UI ou sa composition dans les jaquettes.

## Identité du jeu

Street food infernale, vampire cuisinier, humour noir de dessin animé, barbecue très chaud, clients monstrueux ravis du spectacle. Les aliments restent de vrais aliments sur lesquels sont dessinés des petits bras/jambes en fils noirs, petites mains blanches et expressions simples : ce sont des surimpressions graphiques, pas une anatomie humaine modelée dans la nourriture.

Ingrédients de recette existants uniquement : viande, tomate, poivron, oignon, champignon, courgette, aubergine. L'ail est un danger ; la goutte de sang est un bonus de ralenti distinct. Les projections sont du jus et de petits morceaux alimentaires colorés, jamais des organes réalistes.

En chute, les ingrédients sont d'abord joyeux puis paniquent progressivement. Une fois embrochés, **tous** ont yeux fermés/en croix, membres inertes et surface progressivement grillée. Ils ne restent jamais souriants sur la brochette.

Vlad : main de vampire très travaillée, doigts longs, ongles sombres, peau pâle, manche noire/rouge et bijou. Le bras part du bas de l'écran et s'allonge avec le geste. La pique reste une brochette, pas une épée ou une autre arme.

## Gameplay — langage visuel validé

Pixel art franchement visible et cohérent en taille de pixel ; pierre, métal et bois par groupes de pixels ; silhouettes nettes ; masses sombres et contre-jours orange de barbecue. Pas de rendu 3D plastique, pas de bloom permanent. L'action et les aliments doivent gagner la bataille du contraste contre le décor.

Stage logique portrait 390 × 844, composition identique sur les écrans par mise à l'échelle uniforme. Aucun titre du jeu ou panneau explicatif décoratif dans le gameplay. Les ingrédients utilisent toute la largeur jouable, peuvent passer devant les clients et n'ont pas de traînée de chute. Leur physique peut les pousser latéralement sans les faire remonter.

La portée maximale est donnée par la longueur du bras de Vlad : **aucune ligne pointillée**. Les clients sont dans des ouvertures à droite et regardent le spectacle avec les mains/gestes. Après service ils descendent d'une case ; une case vide se ferme par une grille de prison. Le client actif est celui du bas, sans contour jaune ; lui seul affiche une bulle BD avec une pique horizontale de gauche à droite traversant les ingrédients grillés demandés, prévue pour jusqu'à cinq ingrédients visibles.

Le score local est à droite. Pas de bouton pause dessiné dans le jeu. Les trois piques de réserve sont à **gauche**, selon la référence utilisateur, et représentent les erreurs restantes : à chaque brochette ratée Vlad consomme une nouvelle pique.

Le panneau de niveau n'existe qu'au début du niveau et doit être assez grand : `LEVEL XX`, icônes des ingrédients disponibles, `XX customers`. Une information compacte indique ensuite combien de clients restent à servir sur l'objectif.

La livraison est automatique lorsque la brochette est complète, avec transfert visible et gain de points lisible. Le meilleur multiplicateur de la brochette reste près de la main jusqu'à fin/annulation ou remplacement par un meilleur bonus ; maximum artistique validé ×5.

### Percement et FX

Le percement doit avoir du poids : anticipation très courte, squash/étirement, orientation d'entrée conservée, hit-stop bref possible, membres qui retombent et balancent ensuite. L'ingrédient peut afficher une petite phrase de fin de vie.

La gerbe de jus/fragments croît avec le combo : normal, ×2, ×3, ×4, ×5. Les particules partent d'abord vers le haut/les côtés puis retombent sous gravité, passent derrière les ingrédients actifs, suivent le ralenti, sont plafonnées et nettoyées.

À ×5, un grand titre gothique type `BRUTALITY!`, `BLOODY BROCHETTE!` ou équivalent peut apparaître plus haut dans la zone de jeu et déclencher une pluie spectaculaire. Ce traitement est réservé au climax, pas présent en permanence. Plus une brochette grossit, plus la pique et la main se salissent/dégoulinent.

## Cover — titre et philosophie

Titre de jaquette par défaut : **`Vlad's Skewers`**. Utiliser le français uniquement pour une édition française explicitement conçue comme telle.

Les covers interprètent la **fantaisie** du jeu ; elles ne doivent pas prouver le gameplay. Elles peuvent être plus sérieuses, plus inquiétantes et plus premier degré que le jeu. Elles ne doivent pas faire l'inventaire des ingrédients, clients, bras, recettes et FX.

Règle désormais importante : **ne pas considérer les aliments à yeux/pattes comme un motif obligatoire de cover**. Ils peuvent être absents. S'ils apparaissent, ils sont rares, choisis pour l'idée de l'image et non copiés comme une galerie de sprites. Éviter le sentiment Disney/cartoon familial créé par une foule de légumes souriants ou paniqués.

Simplifier : une idée dominante, détails sélectifs, espace négatif, hiérarchie claire, impression/medium identifiable. Chercher une vraie jaquette de jeu ou affiche imprimée fin 80s/début 90s, pas une affiche contemporaine ultra-détaillée vieillie artificiellement. Aucun UI, score, niveau, CTA, prix, bouton ou pseudo-interface dans le raster.

Les familles de travail restent celles de `DA_COVER.md` : A pulp européen/franco-belge ; B boîte micro-ordinateur européenne ; C affiche graphique/éditoriale d'Europe de l'Est ; D réinterprétation culturelle. Elles doivent changer réellement d'idée, de point de vue, de densité et de médium.

## Cover C — VALIDÉE

Fichier exact : `vlad-cover-c-graphic-poster-approved-2026-09-07.png`, 941 × 1672 RGB PNG, 2 709 942 octets, SHA-256 local `582db78b3abd6d9724cb6261fa6c1563f3e5a4542ed5a3d639c982dabb5c1872`.

Archive : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-validated/`, Drive fichier `1blXf0mUKernZn8eQpa8oWXEpFQTOehKM`, dossier `1o5SBto8zGF_fx7FaUTvn9wcEjBpaF7OZ`.

Ce qui est validé : composition très graphique ; grands aplats noir/rouge/crème ; contraste fort ; respiration et espace négatif ; qualité d'affiche imprimée ; silhouette dominante de Vlad ; château/plein lune comme signes synthétiques ; titre `Vlad's Skewers` intégré à la composition. Les petits aliments anthropomorphes présents dans cette image sont **acceptés dans cette cover précise**, mais ne deviennent pas une contrainte pour les autres covers.

Ne pas régénérer ou « améliorer » cette image pour la rendre finale. Préserver exactement ce master. Une future animation/décomposition doit partir de ce master et produire des couches séparées sans le remplacer.

## Covers A/B/D — nouvelle contrainte de recherche

Les premières propositions étaient trop proches du gameplay : mêmes personnages, même foule d'aliments vivants, même grill infernal, trop de détails et trop d'explication. Elles sont rejetées.

Pour A/B/D, partir d'une métaphore, d'une ambiance ou d'un objet éditorial unique. **Abandonner la brochette comme sujet central** et ne pas montrer systématiquement les légumes. Une cover peut se contenter de Vlad, d'une cloche de service, d'une cuisine vide, d'un château, d'un signe de restaurant, d'une table après le service, d'une main vampirique, d'une ombre ou d'un détail alimentaire non anthropomorphe si cela suffit à raconter l'univers.

A doit sentir l'illustration commerciale européenne faite à la main, avec une situation ou un personnage fort mais pas une scène exhaustive. B doit ressembler à une vraie boîte/annonce micro-ordinateur européenne de l'époque, avec structure et retenue, pas un rendu pixel ni une UI fictive. D doit repenser la hiérarchie selon une édition régionale précise, sans pseudo-texte ni clichés touristiques. C reste la référence de niveau de qualité et de force de composition, pas un template à copier.

## Archives des rejets

Les covers rejetées sont conservées dans `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-rejected/` (Drive `1dltj7yUcGScWUoiQwOKpkcIgz07cIrjL`). Les planches comparatives produites par erreur sont archivées séparément dans `round3-generator-boards/` (`1jzIFuR4-xUJC-vJpsobIBCnnarLE4EJf`) et ne sont pas des masters.

Le rejet des covers ne remet pas en cause la DA pixel art du gameplay ni la cover C validée.
