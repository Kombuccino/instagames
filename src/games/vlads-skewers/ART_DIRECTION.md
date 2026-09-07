# Les Brochettes de Vlad — Direction artistique

Mise à jour : 7 septembre 2026. Décisions issues de la discussion du jeu, notamment de la demande de quatre covers à 14:15:20 UTC et du rejet à 14:26:30 UTC.

Ce document distingue les choix artistiques de leur réalisation. La DA gameplay pixel art est choisie ; sa migration/intégration n'est pas attestée par cette passe documentaire. Aucune cover de la dernière série n'est validée. Voir [GAME_STATUS.md](GAME_STATUS.md) pour l'état constaté.

## Autorités et portée des références

Lire `docs/ACTIONS.md`, `docs/DA_CORE.md`, puis `docs/DA_GAME.md` pour le gameplay ou `docs/DA_COVER.md` pour une cover. Le catalogue détaillé des covers est `docs/WELCOME_ART_STYLES.md`, pas le questionnaire des kits gameplay. Les prescriptions récentes de `DA_COVER.md` remplacent les anciennes mentions de CTA du catalogue : aucun `SWIPE TO PLAY` dans le raster.

Référence utilisateur fournie avec la demande de covers : `VLAD-DA-pixelisee.png`, 853 × 1844, RGB PNG, 2 479 148 octets. Image effectivement ouverte lors de cette reprise. SHA-256 local : `27f4dcaa7102c3b3a88eedd6e3a4295ceb04e8abcb18b4c91c386b4b43043b69`.

Original conservé sans transformation dans l'archive privée :

- `MiniFugg - Graphic Archive/Games/vlads-skewers/gameplay-references/vlad-gameplay-pixel-user-reference-2026-09-07.png` ;
- fichier Drive `15_dlZaGY-MUEIPeQmYCW0ODSYc4xs3Et` ; dossier `1_6i90ZySf3dOu7iHACJRjANIGZv5Q0tE`.

**Rôle : référence d'univers et de matière gameplay, pas gabarit des covers.** La demande explicite autorise des interprétations éditoriales de médiums, palettes et cadrages différents. L'image n'annule pas les corrections textuelles ultérieures : elle contient notamment un ancien bouton pause, des traînées et des indications qui ne sont pas des instructions à reproduire. Une erreur générée ne devient jamais une règle. Cette image aplatie reste une référence, pas un fond runtime ou un atlas.

## Identité à conserver

Un vampire transforme une chute d'ingrédients en brochettes pour des clients monstrueux ravis d'assister au spectacle. Street food infernale, humour noir de dessin animé, barbecue brûlant, cuisine et cruauté absurde ; pas des victimes humaines, ni une scène de combat à l'épée.

Vocabulaire alimentaire existant : viande, tomate, poivron, oignon, champignon, courgette, aubergine. Ne pas inventer d'autres aliments. L'ail est un danger et la goutte de sang un bonus de ralenti distinct ; ne pas les transformer en ingrédients de recette. Les projections des aliments sont du jus et de petits morceaux colorés, pas des organes réalistes.

Les aliments restent des aliments : visage dessiné en surimpression, petits fils noirs communs pour les bras/jambes et petites mains blanches, comme un gribouillage qui leur donne vie. Aucune anatomie humaine modelée dans la chair ou la peau. Les ingrédients en chute commencent joyeux puis paniquent progressivement. Une fois embrochés, **tous** ont des yeux en croix/fermés et des membres inertes ; ils ne sourient plus. La cuisson les brunit et marque leur surface.

Vlad se reconnaît à sa main de vampire travaillée : doigts longs, ongles sombres, peau pâle, manche noire et rouge, bijou. Le bras est attaché au bas de l'écran et s'allonge avec le geste, de façon inquiétante et comique. La pique doit rester une brochette, pas devenir une arme différente.

## Gameplay — choix acquis le 7 septembre

Pixel art construit, pixels franchement visibles et d'échelle cohérente, textures de pierre/métal/bois regroupées, détails choisis, contre-jours chauds de barbecue sur masses sombres. Ne pas lisser cette DA en rendu 3D plastique. La chaleur n'impose pas un bloom permanent. Les aliments doivent rester plus lisibles que le décor.

Le gameplay cible Phaser et son stage logique portrait 390 × 844. Préserver la géométrie réellement validée, pas les proportions improvisées des planches. Aucun titre du jeu, panneau explicatif latéral, slogan inventé ou bouton Core ajouté dans une étude gameplay. Les ingrédients circulent sur toute la largeur jouable et peuvent passer devant les clients, sans traînées de chute. Les déplacements latéraux et contacts doivent être lisibles ; pas de rebond ascendant des aliments.

La limite de déplacement est matérialisée par la portée du bras, **sans pointillés**. Clients spectateurs à droite, mains expressives, mêmes ouvertures structurelles. Client actif en bas, sans contour jaune ; lui seul possède une bulle BD avec une broche horizontale traversant de gauche à droite les ingrédients grillés. Prévoir cinq ingrédients lisibles dans cette bulle. Après service, les clients descendent d'une case ; une case vide se ferme avec une grille de prison.

Les trois emplacements de piques de réserve sont à **gauche**, selon le modèle montré par l'utilisateur, pas trois nouvelles lances décoratives à droite. Ils représentent les erreurs restantes. Le score local est à droite ; pas de bouton pause dessiné. Le panneau d'ouverture du niveau est assez grand et temporaire : `LEVEL XX`, icônes des ingrédients disponibles, `XX customers`. Le suivi des clients restants/objectif doit rester compréhensible après son départ.

La livraison redevient **automatique** quand la brochette est terminée, avec transfert visible et gain de points lisible en haut. Le meilleur multiplicateur de la brochette reste près de la main jusqu'à la fin/annulation ou un meilleur bonus ; maximum artistique demandé ×5. Un impact conserve l'orientation de pénétration de l'aliment et fait pendre/balancer les membres.

FX : percement franc, déformation brève, petite phrase de fin de vie, gerbe qui croît avec ×2/×3/×4/×5. Le jaillissement éjecte jus et fragments vers le haut/les côtés, puis la gravité les ramène vers le bas ; les débris passent derrière les ingrédients, suivent le ralenti, sont bornés et nettoyés. À ×5, un grand titre gothique de type `BRUTALITY!` peut apparaître dans la partie supérieure, sous la zone du panneau de niveau, et provoquer une pluie spectaculaire. Réserver cette intensité au déclencheur, pas à chaque frame. La main et la broche dégoulinent davantage quand la charge augmente.

Ces décisions ne prétendent pas être déjà codées. Le prototype conservait six ingrédients par recette et des règles plus anciennes ; toute migration devra réconcilier explicitement ces écarts sans déduire le GD d'une image. Les covers ne montrent ni compteurs ni recettes servant à décider ce point.

## Covers — demande et diagnostic du 7 septembre

**Livrable demandé : quatre études individuelles de jaquettes, pas quatre captures ni une planche gameplay.** Titre propre établi : `Les Brochettes de Vlad`. Très peu de texte hors titre ; choix de travail : aucun autre texte. Portrait plein cadre, format du contrat de cover à respecter ; ni boîte 3D photographiée, ni comparatif dans le master, ni interface ou faux éditeur.

La série précédente a été rejetée. Elle déclinait surtout la même scène de brochette dressée, donjon, flammes et public, en pixel, BD, papier et volume brillant. Il y avait des différences de médium, mais pas les quatre interprétations éditoriales demandées. Elle montrait aussi des aliments encore vivants sur des brochettes. Les fichiers mesurés sont en 1122 × 1402 : leur format n'est pas un master conforme au portrait allongé attendu.

Ne pas relancer une variation globale de cette série. Ne pas envoyer les quatre covers rejetées au générateur comme références positives. La référence gameplay transmet le sens du jeu, pas son cadrage, son éclairage exact, son château ou la position de ses clients. Ne pas rendre obligatoires la brochette centrale géante, le décor de donjon, la même palette orange/noir ou la même enseigne-titre dans chaque cover.

### Quatre briefs corrigés — propositions, pas validations

Les intitulés ci-dessous sont des noms de travail ; ils ne doivent pas apparaître dans les images. Chaque brief conserve les invariants alimentaires, la main vampirique et la vérité du jeu quand ces éléments sont représentés.

**A — Pulp européen / franco-belge : « Le coup de feu ».** Une cuisine de rue vue de trois quarts, cadrée serré et en diagonale : le bras trop long de Vlad traverse le comptoir pour piquer une tomate paniquée tandis qu'un client réclame son repas. L'action et la maladresse du cuisinier racontent l'image, pas une présentation de trophée. Encre, gouache visible, noirs francs, crème, brique et verts locaux ; arrière-plan partiellement laissé au papier. Titre dessiné, pas enseigne de château automatique.

**B — Boîte de micro-ordinateur européen : « Le dernier ingrédient ».** Gros plan bas au niveau de la grille : une tomate encore libre regarde approcher la pointe argentée, guidée par quelques longs doigts pâles entrant du bord. En arrière-plan, une brochette déjà grillée reste inerte. Peinture/aérographe analogique, impression offset sur carton, ombres prune et acier, braise cuivrée ponctuelle ; titre structuré dans une large zone calme. Le médium évoque une jaquette de micro-ordinateur, pas un jeu en pixels ni un mockup de boîte. Aucun clavier ou faux schéma sans rapport avec Vlad.

**C — Affiche graphique / Europe de l'Est : « La brochette-croc ».** Une seule métaphore : le profil d'un sourire de vampire en aplat noir dont un croc très long devient une pique traversant trois petites silhouettes d'aliments grillés, inertes. Papier crème très présent, rouge tomate et noir, découpe/sérigraphie, asymétrie et titre intégré au rythme des formes. Aucun panorama de donjon, aucune galerie de clients, aucun feu photoréaliste ; le vide fait partie du dessin.

**D — Édition japonaise : « Le service de minuit ».** Réinterprétation d'une publicité imprimée de jeu d'arcade du début des années 1990 : vue plongeante sur le comptoir de Vlad, diagonales de baguettes/piques, main vampirique qui assemble la commande et ingrédients libres qui réalisent ce qui les attend. Trait nerveux d'édition manga, aplats et trames, blanc dominant, noir, vermillon et jaune acide ; composition asymétrique et hiérarchie différente des trois autres. Le titre propre latin reste exact ; aucun kanji inventé, aucun décor touristique. Une future localisation demanderait un texte réellement vérifié.

### Contrôle avant présentation

Comparer les quatre études : idée, point de vue, silhouette dominante, palette, médium, densité, position/traitement du titre. Une simple différence de texture ou d'étiquette échoue. Ne pas surcharger C pour la rapprocher des autres. Vérifier le titre, les aliments réellement disponibles et l'état inerte de toute nourriture déjà embrochée. Les membres noirs/mains blanches restent des ajouts graphiques, pas de l'anatomie.

Aucun score, niveau, CTA, prix, boutons, jauges ou logo MiniFugg régénéré. Produire un fichier par cover. Préserver les originaux ; après choix, préparer les couches sans régénérer globalement l'image validée. Le skill Phaser gouverne une éventuelle intégration/animation, pas la famille artistique d'une jaquette statique.

## Archives du lot rejeté

Dossier privé : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-rejected/`, ID `1dltj7yUcGScWUoiQwOKpkcIgz07cIrjL`. Originals PNG RGB 1122 × 1402 transférés sans modification ; noms, IDs et tailles relus dans Drive. Aucun de ces fichiers n'est placé dans `Fugg` ou dans le runtime.

| Fichier archivé | ID Drive | Taille |
| --- | --- | ---: |
| vlad-cover-rejected-01-pixel-reprise-2026-09-07.png | 1NYfqXAGhJQY80YsKmmx2_aO9LQikSi1G | 2515534 |
| vlad-cover-rejected-02-bd-surcharge-2026-09-07.png | 1ZT3G13BggkhkUQM1zrhmxI1mBmTzVInr | 3220486 |
| vlad-cover-rejected-03-paper-reprise-2026-09-07.png | 1UnxP5XzC9Zmb71-kh1C9gYzAabVyFuMB | 2835214 |
| vlad-cover-rejected-04-toy-reprise-2026-09-07.png | 1KsoH_1NVw9HZmfp5JYHbccXRyG2jUFMg | 2562850 |

Le rejet porte sur les études de covers, pas sur le choix pixel art du gameplay. Ne pas confondre archivage, validation, import production, intégration et test.
