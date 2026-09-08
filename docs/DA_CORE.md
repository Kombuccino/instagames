# DA CORE — Identité MiniFugg et méthode de commande graphique

Toute création emploie le vocabulaire et les contraintes de [Zones MiniFugg](MINIFUGG_ZONES.md). Les zones règlent le cadrage et l'occupation ; les références approuvées règlent le style.

## Autorité et périmètre

Ce fichier fixe les instructions communes aux demandes graphiques MiniFugg. Ce sont des exigences de travail, pas une liste d'inspirations facultatives. Lire sa dernière version sur `main`, puis le fichier correspondant au livrable : `DA_COVER.md` pour une jaquette ; `DA_GAME.md` pour les graphismes jouables ; `DA_WELCOME.md` pour l'entrée de l'application ; `DA_UI.md` pour les interfaces partagées. Les cinq fichiers sont dans `docs/`.

Ces fichiers gouvernent les briefs et l'acceptation artistique. Les documents spécialisés restent les autorités pour les moteurs, les données, les gestes et le transport des assets. Une DA ne permet pas de modifier ces contrats silencieusement. Les anciennes pistes exploratoires ne constituent pas des instructions de production actuelles.

## Identité recherchée

MiniFugg est une plateforme moderne de petits jeux singuliers, drôles, parfois absurdes, matures ou réflexifs. Elle doit donner une impression de qualité et de personnalité, pas de plateforme enfantine, de produit amateur ou de catalogue de retrogaming.

Le Core fournit une identité stable ; chaque jeu garde son univers ; chaque cover peut en proposer une interprétation éditoriale. Ne pas imposer la même esthétique aux trois. Le moteur technique ne détermine pas le style : « Phaser », « Three.js » ou « Unity » ne sont pas des directions artistiques.

Refuser le rendu interchangeable de jeu mobile, de pack générique ou de démo moteur : matériaux uniformément plastiques, héros central standard, objets symétriquement flottants, néon violet/cyan, faux HUD et effets accumulés sans intention. Une technique ou une couleur n'est pas interdite en soi ; elle doit être justifiée par une direction explicitement choisie.

Ne pas se contenter de « beau, premium, cinématique, pas IA ». Décrire les formes, les matières, les contrastes, le cadrage, les vides, la lumière, la typographie et le mouvement. Chercher une écriture identifiable plutôt qu'une démonstration de détails. Explorer aussi des traditions européennes et asiatiques, sans remplacer un cliché américain par un cliché national.

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

**Livrable :** objet exact, usage, format et état attendu.

**Référence :** image réellement disponible et rôle précis ; sinon direction explicitement exploratoire.

**Vérité et invariants :** mécanique ou fonction représentée, composition à préserver, texte exact, identité verrouillée.

**Traitement positif :** médium, silhouettes, palette, matière, densité, cadrage et lumière propres à ce livrable.

**Modification ou liberté :** ce qui doit changer et ce qui ne doit pas changer.

**Exclusions et sortie :** quelques erreurs locales à éviter ; fond/alpha, couches ou états nécessaires ; aucun écran supplémentaire non demandé.

## Validation, fichiers et transmission

Examiner le résultat avant de le présenter : fidélité au sujet, référence respectée, lisibilité à taille téléphone, absence d'éléments inventés, possibilité réelle d'intégration. Rejeter ou corriger un résultat hors sujet avant de décliner tout un pack. Une validation de concept n'est pas une validation des assets ni du jeu intégré.

Pour toute image, appliquer `ASSET_PIPELINE.md`. Codex avec accès local au dépôt enregistre et vérifie les fichiers directement, puis les commit avec le code. ChatGPT sans cet accès utilise le Drive privé Fugg, vérifie la synchronisation et les chemins importés avant intégration. Un accès GitHub par connecteur ne signifie pas automatiquement un accès local au dépôt.

Conserver les originaux sans redimensionnement ni recompression non demandés. Préférer le PNG pour les maquettes UI et les masters avec transparence ; conserver séparément les dérivés optimisés autorisés. Vérifier l'alpha réel : un damier dessiné n'est pas de la transparence.

Toutes les créations graphiques doivent être conservées et classées selon `GRAPHIC_ARCHIVE.md` dans `MiniFugg - Graphic Archive` : `Games/<game-id>` pour les jeux, `Platform` pour les interfaces/scènes, `Branding` pour la marque, avec statut exploration, validé ou rejeté. Distinguer cette archive de la livraison runtime ; ne pas placer les études rejetées dans le dossier de synchronisation production. Si l'accès à l'archive manque, garder les fichiers locaux, noter l'archivage restant et ne pas annoncer un transfert inexistant ; la production locale Codex ne dépend pas d'une attente Drive. Une suppression explicitement demandée prime sur la conservation des essais concernés.

Mettre à jour le document canonique concerné, le manifeste et le suivi du jeu lorsque pertinent. Git conserve les versions du code et des consignes : pas de `DA_GAME_v2.md`, de copie `final-final` ou de moteur parallèle. Des éditions artistiques réellement distinctes peuvent naturellement coexister.

Décrire séparément ce qui est généré, archivé, importé, intégré et vérifié. Ne jamais appeler « terminé » un simple visuel quand la demande portait sur une intégration.
