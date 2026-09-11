# DA CORE — Identité MiniFugg et méthode de commande graphique

Toute création emploie le vocabulaire et les contraintes de [Zones MiniFugg](MINIFUGG_ZONES.md). Les zones règlent le cadrage et l'occupation ; les références approuvées règlent le style.

## Autorité et périmètre

Ce fichier fixe les instructions communes aux demandes graphiques MiniFugg. Ce sont des exigences de travail, pas une liste d'inspirations facultatives. Lire sa dernière version sur `main`, puis le fichier correspondant au livrable : `DA_COVER.md` pour une jaquette ; `DA_GAME.md` pour les graphismes jouables ; `DA_WELCOME.md` pour l'entrée de l'application ; `DA_UI.md` pour les interfaces partagées. Les cinq fichiers sont dans `docs/`.

Ces fichiers gouvernent les briefs et l'acceptation artistique. Les documents spécialisés restent les autorités pour les moteurs, les données, les gestes et le transport des assets. Une DA ne permet pas de modifier ces contrats silencieusement. Les anciennes pistes exploratoires ne constituent pas des instructions de production actuelles.

La procédure d'exécution commune est le skill [minifugg-art](../.agents/skills/minifugg-art/SKILL.md). Il orchestre ces règles sans les recopier. Le modèle de micro-brief ci-dessous reste unique ; les fichiers de surface le spécialisent. La mise en place du 11 septembre 2026 n'active aucun bilan périodique.

## Identité recherchée

MiniFugg est une plateforme moderne de petits jeux singuliers, drôles, parfois absurdes, matures ou réflexifs. Elle doit donner une impression de qualité et de personnalité, pas de plateforme enfantine, de produit amateur ou de catalogue de retrogaming.

Le Core fournit une identité stable ; chaque jeu garde son univers ; chaque cover peut en proposer une interprétation éditoriale. Ne pas imposer la même esthétique aux trois. Le moteur technique ne détermine pas le style : « Phaser », « Three.js » ou « Unity » ne sont pas des directions artistiques.

Refuser le rendu interchangeable de jeu mobile, de pack générique ou de démo moteur : matériaux uniformément plastiques, héros central standard, objets symétriquement flottants, néon violet/cyan, faux HUD et effets accumulés sans intention. Une technique ou une couleur n'est pas interdite en soi ; elle doit être justifiée par une direction explicitement choisie.

Ne pas se contenter de « beau, premium, cinématique, pas IA ». Décrire les formes, les matières, les contrastes, le cadrage, les vides, la lumière, la typographie et le mouvement. Chercher une écriture identifiable plutôt qu'une démonstration de détails. Explorer aussi des traditions européennes et asiatiques, sans remplacer un cliché américain par un cliché national.

Une patte ne se prouve pas par un score « humain / IA ». Juger des choix visibles : silhouettes, omissions, traces d'outil, bords, contrastes, palette et composition. Ni gros cerne cartoon, ni surdétail, ni usure systématique par défaut. Une gouache peut garder des aplats mats et des réserves ; un pixel art peut innover par ses groupes de pixels, ses ruptures d'échelle ou sa palette sans devenir un filtre sur une peinture lisse. Ces exemples ouvrent des possibilités, pas une nouvelle recette obligatoire.

## Références et décisions

Récupérer les décisions acquises avant de créer. Une validation explicite ultérieure remplace seulement ce qu'elle modifie ; elle ne réouvre pas toute la DA. Une référence est autoritaire pour son objet : une planche de Fuggy ne valide pas le logo dessiné à côté ; une cover ne valide pas les panneaux Core.

Identifier le fichier exact, sa date, son statut et son rôle. Ouvrir réellement l'image avant une production qui doit s'y conformer. Un nom de fichier, un souvenir ou une image contenant des éléments ressemblants ne suffit pas. Ne jamais utiliser une étude rejetée comme référence de remplacement. Si l'image manque, signaler précisément laquelle et demander uniquement cet élément lorsque nécessaire.

Le logo et Fuggy sont verrouillés par `BRAND_ASSETS.md` et `FUGGY_MASCOT.md`. Utiliser leurs sources canoniques. Ne pas régénérer le wordmark, substituer une police ou inventer une nouvelle mascotte. Les scènes varient ; l'identité ne varie pas.

## Contexte ciblé : lire largement, transmettre étroitement

Le contexte de travail de l'agent et le brief du générateur sont deux choses différentes. L'agent lit les documents nécessaires, mais ne transmet pas tout le dépôt, toutes les maquettes et toute la conversation au générateur.

Pour chaque demande, choisir une seule tâche : exploration, modification ciblée, production d'un asset, décomposition ou intégration. Définir un livrable précis et les éléments intouchables. Une référence visuelle principale suffit normalement ; ajouter une seconde uniquement pour une fonction distincte indispensable, par exemple l'identité de Fuggy. Expliquer ce que chacune gouverne.

Ne joindre ni catalogue de placeholders, ni anciens essais, ni autres jeux, ni planche globale quand un composant isolé suffit. Pour une correction, transmettre l'image cible et le changement demandé, pas une nouvelle proposition complète. Ne modifier aucun élément non demandé.

Préférer quelques paragraphes précis aux longues listes d'adjectifs et d'interdictions. Ne pas prétendre avoir isolé techniquement l'historique si l'outil le transmet automatiquement ; préparer alors un brief autonome et un petit paquet de références réutilisables dans une session dédiée.

## Structure obligatoire du micro-brief

L'agent remplit ce modèle ; ce n'est pas un formulaire à faire remplir à l'utilisateur. Un brief par objet ou direction, avec uniquement les champs pertinents.

```text
Livrable : [surface Cover/Game/Welcome/UI ; exploration/édition/asset/planche/intégration ; objet et état uniques]
Références : [fichier exact réellement ouvert ; rôle style/composition/identité ; sinon exploration sans référence validée]
Vérité et invariants : [sens du jeu ou fonction, géométrie, zones, éléments intouchables]
Traitement : [médium, silhouettes, contours, palette, matière, lumière, densité et omissions]
Liberté / changement : [ce qui peut varier ou seul delta demandé]
Textes autorisés : [aucun, ou liste exhaustive de textes/symboles exacts + emplacement + propriétaire raster/moteur/Core]
Sortie : [format, dimensions, alpha requis/opaque, marges, pivots/états si utiles ; fichiers séparés attendus]
Rejet : [quelques défauts locaux bloquants et test concret de lisibilité/intégration]
```

**La liste des textes est fermée.** Pour un asset isolé elle est vide par défaut. Pour une cover, elle contient normalement le titre anglais exact ; pour une UI, uniquement les textes fonctionnels utiles à l'état demandé. Un symbole intrinsèque au jeu peut être autorisé. Toute enseigne, slogan, numéro, micro-légende, pseudo-écriture ou logo non listé est un défaut. Une permission artistique ancienne d'ajouter des « encarts » ou une petite signature n'autorise pas l'agent à inventer leur contenu. Un logo autorisé vient de son fichier canonique, pas d'une régénération.

Les notes de production restent hors du brief d'image : commit des règles lues, statut et preuve d'approbation des références, outil réellement employé, paramètres exposés, limites de contexte et chemins de sortie. Conserver le brief intentionnel ; conserver aussi la requête exacte et les pièces réellement envoyées seulement si l'outil les expose. Ne pas prétendre auditer un prompt interne ou un historique transmis implicitement.

## Images propres, planches utiles

Distinguer quatre livrables : **image indépendante**, **comparaison**, **asset isolé**, **planche technique annotée**. Le mot « board » ne donne pas carte blanche pour ajouter un habillage de présentation.

Produire les directions indépendamment. Assembler ensuite les comparaisons mécaniquement, sans nouveau dessin généré, titres, logos, cartouches ou flèches décoratives. Conserver chaque original accessible séparément. Une grille n'est pas un atlas utilisable sans coordonnées de frames et contrôle des marges.

Les éléments isolés et les espaces entre éléments d'une planche sont en **PNG avec alpha réel**. Les cadres complets conservent leur propre fond : ne pas détourer une cover ou rendre transparent un écran qui doit être opaque. Un PNG n'est pas un document multicouche.

La planche de traduction DA → jeu reste obligatoire quand le pipeline gameplay la demande. Ses repères techniques, états et légendes utiles sont ajoutés sur une **copie d'assemblage ou une couche/document séparé**. Les images sources et assets restent sans annotations. Une copie annotée est une référence de production, jamais une texture runtime. Les maquettes UI peuvent naturellement montrer leurs textes fonctionnels autorisés.

Pas de resize/crop/recompression silencieux pour faire tenir une planche : créer, si nécessaire et autorisé, des dérivés explicitement identifiés. Un découpage mesuré ne reconstitue pas un élément occulté ; produire cette partie proprement lorsque l'animation la révélera.

## Contrôles avant présentation

Trois contrôles séparés, avec résultat `conforme`, `à corriger` ou `non vérifié` :

- **Artistique :** référence et sujet justes, écriture visible, textes limités à la liste, composition lisible ; comparer les pistes par idée, point de vue, médium et hiérarchie, pas uniquement par couleur.
- **Technique :** format décodé, dimensions, contenu non vide, alpha réel, bords/marges, poids, ancrages et états. Le script du skill mesure ces propriétés sans altérer les sources. Il ne reconnaît ni une mauvaise DA, ni un texte parasite, ni un damier peint à l'intérieur d'une image partiellement transparente : examen visuel requis.
- **Usage :** original récupérable séparément ; cadrage testé ; pour les composants gameplay, mini-tranche comparée avant déclinaison ; pour l'UI, états et textes vivants non cuits dans un fond.

Le contrôle technique ne vaut jamais validation artistique. La validation de l'agent ne vaut jamais acceptation utilisateur. Après deux corrections ciblées infructueuses du même défaut, arrêter la régénération répétitive : identifier la cause probable (référence, brief, format, outil, géométrie), changer de méthode ou poser la seule question bloquante. Ne pas repartir sur une nouvelle DA par défaut.

## Validation, fichiers et transmission

Examiner le résultat avant de le présenter : fidélité au sujet, référence respectée, lisibilité à taille téléphone, absence d'éléments inventés, possibilité réelle d'intégration. Rejeter ou corriger un résultat hors sujet avant de décliner tout un pack. Une validation de concept n'est pas une validation des assets ni du jeu intégré.

Pour toute image, appliquer `ASSET_PIPELINE.md`. Codex avec accès local au dépôt enregistre et vérifie les fichiers directement, puis les commit avec le code. ChatGPT sans cet accès utilise le Drive privé Fugg, vérifie la synchronisation et les chemins importés avant intégration. Un accès GitHub par connecteur ne signifie pas automatiquement un accès local au dépôt.

Conserver les originaux sans redimensionnement ni recompression non demandés. Utiliser PNG pour les maquettes et masters lossless, WebP lossless pour les dérivés runtime courants, et AVIF seulement pour de grandes images statiques après validation visuelle et technique avec repli PNG/WebP. Ne créer aucun nouveau JPG/JPEG. Vérifier l'alpha réel : un damier dessiné n'est pas de la transparence.

Toutes les créations graphiques doivent être conservées et classées selon `GRAPHIC_ARCHIVE.md` dans `MiniFugg - Graphic Archive` : `Games/<game-id>` pour les jeux, `Platform` pour les interfaces/scènes, `Branding` pour la marque, avec statut exploration, validé ou rejeté. Distinguer cette archive de la livraison runtime ; ne pas placer les études rejetées dans le dossier de synchronisation production. Si l'accès à l'archive manque, garder les fichiers locaux, noter l'archivage restant et ne pas annoncer un transfert inexistant ; la production locale Codex ne dépend pas d'une attente Drive. Une suppression explicitement demandée prime sur la conservation des essais concernés.

Mettre à jour le document canonique concerné, le manifeste et le suivi du jeu lorsque pertinent. Git conserve les versions du code et des consignes : pas de `DA_GAME_v2.md`, de copie `final-final` ou de moteur parallèle. Des éditions artistiques réellement distinctes peuvent naturellement coexister.

Décrire séparément ce qui est généré, archivé, importé, intégré et vérifié. Ne jamais appeler « terminé » un simple visuel quand la demande portait sur une intégration.

## Trace courte par passe

Ajouter dans le suivi existant du jeu (`GAME_STATUS.md` et manifeste) ou de la surface Core une note de ce type, sans copier les conversations privées dans le dépôt :

```text
Date / lot / base Git : ...
Demande et référence : ... [rôle, preuve de validation ou statut exploratoire]
Brief / outil / contexte observable : ... [lien durable ; limites connues]
Sorties : ... [chemins, format/taille, empreinte si utile ; original ou dérivé]
Essais et écarts : ... [nombre connu, défaut observé ; cause seulement supposée si non démontrée]
Contrôles : artistique ... / technique ... / usage ... [preuves ; non vérifié si absent]
Validation utilisateur : ... [portée exacte, date ou en attente]
Livraison : généré ... / archivé ... / importé ... / intégré ... / testé ...
Suite : ... [une action, critère de sortie, responsable ou discussion]
```

Les essais techniques, les générations graphiques et les corrections sont comptés séparément. Ne pas déduire un taux de réussite d'un historique incomplet. Les décisions artistiques restent dans leur document canonique ; le journal pointe vers elles, il n'en crée pas une copie concurrente. Le bilan hebdomadaire est reporté par l'utilisateur le 11 septembre 2026 ; aucune tâche, skill de revue ou récurrence n'est activée.
