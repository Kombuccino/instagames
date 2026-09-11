# DA COVER — Jaquettes illustrées et éditions de jeux

Avant tout brief ou toute intégration, choisir Cover, CoverBeta ou CoverCaca dans [Zones MiniFugg](MINIFUGG_ZONES.md). Le sujet et le titre restent dans CENTRE, hors de MONNAIE, RAIL et JOUER ; HAUT et BAS prolongent seulement le décor.

## Mission

Appliquer `DA_CORE.md`. Produire une jaquette qui donne envie d'ouvrir un petit jeu comme un objet éditorial précieux, étrange ou excessivement ambitieux. L'esprit recherché est celui des illustrations commerciales et affiches de jeux des années 1980–1990, interprété librement, notamment à travers des traditions européennes et asiatiques. Ce n'est ni une capture du jeu ni une fiche App Store.

La cover peut dramatiser la fantaisie du jeu et différer de son médium. Elle ne doit pas mentir sur sa mécanique ni excuser un gameplay laissé au stade de prototype générique. La plateforme reste moderne ; cette liberté rétro appartient aux jaquettes.

## Partir du vrai jeu

Lire son entrée de registre, son `ART_DIRECTION.md`, son `GAME_STATUS.md` et les références validées disponibles. Résumer en une phrase la situation à illustrer : geste, enjeu, émotion. Vérifier notamment qu'on ne représente pas l'inverse du but du jeu.

Pour TetraMindFck, le vocabulaire de référence est : pièces de type tetromino, calcul et surcharge mentale, personnage dont l'esprit se fracture ou explose. Le nom est **TetraMindFck**, pas CalcDrop. Ses familles `pulp-euro`, `micro-euro` et `graphic-poster` servent de référence de démarche, pas de composition à copier dans tous les jeux.

## Quatre familles artistiques à préserver

### A — Pulp européen / illustration franco-belge

Une situation expressive, narrative, parfois grotesque ou humoristique. Dessin à l'encre, ombres peintes, gouache ou acrylique perceptible, brosses irrégulières, noirs francs et couleurs locales choisies. Les visages et postures racontent quelque chose ; ils n'ont pas à être parfaitement beaux.

Construire une action dominante, éventuellement diagonale ou explosive, avec des accessoires utiles au récit et des zones moins décrites. Lettrage dessiné ou imprimé, hiérarchie assumée. Rechercher une illustration de petit éditeur ou de magazine, pas une affiche de superhéros, une peau photoréaliste ou une peinture numérique uniformément brillante.

### B — Boîte de micro-ordinateur européen

Imaginer une édition commerciale crédible de l'époque Amiga, Atari ST, DOS ou CPC, sans recopier une boîte existante. Illustration peinte ou aérographiée, titre fort, composition plus structurée que le pulp, papier/carton et impression offset perceptibles.

Des cadrages techniques, écrans, schémas ou repères éditoriaux peuvent intervenir si le jeu les justifie. Les dégradés doivent évoquer le médium retenu, pas une lumière RGB moderne. Éviter le cyberpunk par défaut, les interfaces techniques sans sens et le faux vieillissement consistant uniquement à poser du bruit sur un rendu récent.

### C — Affiche graphique / traditions éditoriales d'Europe de l'Est

Une idée visuelle ou métaphore forte plutôt qu'un inventaire d'objets. Palette réduite, aplats, silhouettes, découpes, collage, trame ou sérigraphie/offset. La typographie participe à la composition. Laisser du vide, accepter l'asymétrie, les proportions inhabituelles et les ruptures d'échelle.

La force vient du choix et de l'omission, pas du volume de détails. Ne pas ajouter du cyrillique décoratif, des symboles politiques automatiques ou des effets lumineux pour « enrichir » une image volontairement sobre.

### D — Édition étrangère / réinterprétation culturelle

Refaire la logique éditoriale, pas seulement traduire le titre de la version européenne. Choisir un contexte d'édition et d'impression précis ; ne pas prétendre qu'un pays possède un style unique.

**Piste japonaise :** rythme vertical nerveux, rapport énergique entre illustration et typographie, encarts utiles, dessin éventuellement proche de l'édition manga, couleurs imprimées maîtrisées. Pas de kanji aléatoires, torii, sakura ou yeux d'anime automatiques.

**Piste chinoise :** hiérarchie et cadrage affirmés, rapport texte/image construit, symboles et modules graphiques liés au sujet. Choisir le contexte commercial/historique plutôt qu'un décor touristique. Pas de dragons, lanternes, pagodes ou pseudo-calligraphie par défaut.

Les pistes coréennes ou d'autres cultures restent possibles : étudier leurs conventions éditoriales, leurs caractères et leurs rythmes, sans caricature. Tout texte localisé doit être réel et vérifiable ; sinon réserver sa place pour une composition typographique ultérieure.

## Collection et composition

Le système envisagé pour un Fugg comporte quatre éditions complémentaires : narrative, micro-ordinateur, graphique et culturelle. Ce n'est pas une obligation de générer quatre images à chaque demande. Finir la principale avant de multiplier les variantes ; respecter les éditions et seuils déjà définis. Déblocages et sélection appartiennent au Core et ne changent pas les règles du jeu.

Les Bêta/Caca n'utilisent pas automatiquement cette collection premium. Employer leur template commun, un titre/logo de jeu et éventuellement un petit élément spécifique. L'explication du statut et le CTA restent des textes traduisibles, hors image.

Pour une cover finale : illustration autonome portrait, plein cadre, master PNG lossless exactement `390 × 844` (pas un 9:16 approximatif). Un sujet dominant, titre lisible, détails sélectifs, espace négatif volontaire. Varier les fonds, couleurs et cadrages entre jeux et éditions. Ni sunset universel, ni cartouche physique obligatoire, ni même composition répétée.

Une planche comparative ou une boîte/cartouche en volume est un livrable de recherche distinct, seulement lorsqu'il est demandé. Ce n'est pas le master de production.

## Texte et interface : ne pas les confondre

Les jaquettes sont en anglais par défaut, sauf édition localisée ou titre propre déjà établi. Respecter l'orthographe exacte du jeu. Le titre peut être illustré et séparé en couche. Une petite signature MiniFugg canonique peut être conservée lorsqu'elle est explicitement approuvée et listée dans les textes/éléments autorisés du brief. Ne pas l'ajouter par défaut ni redessiner son logo.

Ne pas dessiner dans le raster les coins du joueur, boutons sociaux, compteurs, prix, `INSERT COIN`, `CHANGE GAME` ou autres contrôles. **Ne plus inscrire `SWIPE TO PLAY`**, malgré les anciennes formulations du catalogue. Prévoir l'espace des overlays validés sans ajouter de bande noire permanente. Leur composition dépend de `DA_UI.md`.

## Fabrication statique

La cover finale est une composition raster statique. Produire un master lossless `390 × 844`, garder titre et sujet dans les zones sûres du modèle Cover, puis fabriquer les dérivés runtime prévus par `ASSET_SIZE_REFERENCE.md`.

Exprimer le mouvement dans l'image par le cadrage, les lignes de force, la posture, la lumière et les matières. La cover ne dépend plus d'un découpage en couches animées.

Ne pas créer de nouvelle cover animée. Les covers Phaser/CSS existantes sont legacy : conserver leur rendu jusqu'à validation d'un remplacement statique, puis supprimer leur runtime. Core affiche les covers finales.

## Micro-brief à remplir

Remplir le modèle unique de [DA_CORE.md](DA_CORE.md#structure-obligatoire-du-micro-brief), notamment la liste fermée des textes. Exemple de spécialisation :

> Produire [une cover finale / une étude précise] pour [titre exact]. Le jeu consiste à [mécanique réelle] ; l'image doit exprimer [idée unique]. Référence principale : [image disponible, rôle]. Famille [A/B/C/D], réalisée visuellement en [médium], avec [palette, cadrage, matière, zones calmes]. Préserver [identités et invariants]. Texte illustré autorisé : [texte exact]. Aucun contrôle Core ni SWIPE TO PLAY dans l'image. Sortie statique : master PNG lossless `390 × 844`, puis dérivé WebP lossless ou AVIF validé. Ne pas produire de mockup, couche animée, autre jeu ou écran supplémentaire non demandé.

## Acceptation et sources

Pour une recherche comparative, contrôler la diversité avant présentation : idée centrale, point de vue, médium et hiérarchie. Les familles guident l'exploration sans imposer de refaire une image approuvée pour satisfaire une étiquette. Finir la principale avant de multiplier les variantes concerne la production finale, pas les études demandées.

Cas réussi : les [quatre masters LineFugg approuvés](../src/games/linefugg/ASSET_MANIFEST.md), décision conservée dans [GAME_STATUS.md](../src/games/linefugg/GAME_STATUS.md). Savant en action, instrument contemplé, affiche de trajectoires et aventure illustrée partagent un univers mais changent d'intention. Conserver ces originaux ; ne pas recopier leur astronomie sur les autres jeux. La densité et les motifs communs sont acceptables quand le regard reste guidé. Ne pas imposer le style gameplay à la cover ; ne pas imposer non plus une rupture artificielle si l'utilisateur valide une parenté.

Après validation, sauvegarder l'image exacte et la portée du choix avant toute préparation technique. La fabrication de dérivés statiques conserve le master ; elle ne justifie pas une nouvelle génération globale ni un lot de couches animées.

Vérifier à taille téléphone : sujet juste, titre lisible, parti pris identifiable, fond spécifique, absence de finition générique, overlays compatibles et fichiers statiques exploitables. Une patine ne suffit pas à rendre une image personnelle.

Catalogue détaillé des médiums : `WELCOME_ART_STYLES.md`. Contrat runtime : `WELCOME_ILLUSTRATIONS.md`. Transport et archive : `ASSET_PIPELINE.md` et `DA_CORE.md`. Les anciennes instructions de CTA du catalogue ne s'appliquent plus.
