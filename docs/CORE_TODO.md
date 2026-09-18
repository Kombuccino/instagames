# MiniFugg Core — TODO

Backlog transversal de la plateforme. Voir `docs/TODO_NOTES.md`.

## Priorité / prochaine passe

## Produit / UX

- [ ] Prévoir un petit écran de loading au lancement des jeux lorsque le chargement réel provoque une attente perceptible, afin d’éviter les temps morts avant l’affichage du jeu.
- [ ] Faire défiler le feed de jeux Fugg comme une boucle complète sans répétition prématurée : chaque jeu Fugg doit être présenté une fois avant qu’un jeu déjà vu réapparaisse ; après le dernier jeu de la séquence, reboucler sur le premier.
- [ ] Intercaler dans le feed des publications éditoriales façon réseau social pour faire découvrir les jeux : tips, astuces, petites infos ou mécaniques à connaître sur un jeu, présentés comme de vrais posts explorables entre les entrées de jeux plutôt que comme de simples écrans de chargement.

## Core / architecture

- [ ] Mettre en place une vraie gestion de compte joueur Core : pseudo public + e-mail privé/vérifié ; création et reconnexion sans mot de passe par lien magique envoyé par e-mail ; session durable par défaut afin d’éviter les reconnexions répétées, mais révocable/rotatable côté serveur ; conserver l’identité anonyme actuelle uniquement comme identité pré-compte et la rattacher/fusionner proprement lors de l’inscription ; prévoir dès le schéma qu’un même compte puisse lier plusieurs fournisseurs d’identité, avec Steam et itch.io comme premières cibles, sans supposer qu’ils utilisent tous le même protocole.

## Audio

## Graphismes / UI / marque

- [ ] Finaliser la nouvelle famille MONNAIE + JOUER : direction 3 retenue le 12 septembre 2026, avec une pièce dorée pleine à pourtour faux low-poly, grand `1` et tête complète de Fuggy ciselée. Aucun noir, trou, émail, insert ni seconde matière. La console 90s graphite occupe toute la largeur du cadre Core ; son ratio suit le châssis réel `2099 × 534`, et les trois boutons sont centrés sur les cavités visibles plutôt que sur leurs anciens rectangles d’image. Dans le feed, console et compteur forment une couche Core fixe unique tandis que les covers glissent dessous ; le mode téléphone embarqué reste séparé. PLAY emploie un seul tileset de quatre cellules normalisées : cadre, texte et compteur ne bougent jamais, seuls la lumière et l’enfoncement intérieur évoluent. Le prix reste à droite, le compteur est dynamique et le retour gameplay affiche `← EXIT`. Le châssis ne bouge pas ; deux pièces locales, deux `-1` et deux `cling` accompagnent le débit. Build, cover→jeu→cover, navigation, 390 × 844 et PC sont à conserver dans la validation. Restent : arbitrage final Fuggy/pièce et restitution rare de trois ou quatre pièces.

## Distribution / économie

## Bugs / technique

- [ ] Revoir le flux de génération des conversations, encore instable et source de problèmes récurrents ; reproduire et observer précisément son comportement avec Codex ou Work avant de corriger.

## Méthode de production / outillage

Clarifications utilisateur du 18 septembre 2026 : le principal temps perdu est la traduction et l’intégration d’une DA, pas l’absence de tests du jeu. Le prototype est joué/testé dans MiniFugg pour nourrir les retours ; la DA puis les éléments produits doivent en conserver les fonctions et états. Le Lab accompagne ces essais uniquement lorsque la communication est difficile ; l’objectif est de pouvoir s’en passer, pas d’en faire un passage humain obligatoire. L’essai actuel porte sur un jeu existant. Pour un nouveau jeu, l’utilisateur souhaite demander son activation vers la fin de la conception du prototype ; ne pas en déduire une activation/publication automatique ni une suppression des tests de l’agent.

- [ ] Préciser et éprouver la route « traduction DA → éléments de jeu → intégration » du skill `minifugg-art`, en renforçant le pipeline existant plutôt qu’en ajoutant une autorité concurrente. Proposition à tester : correspondance de chaque fonction du proto avec sa traduction visuelle ; composants livrés avec les états utiles et leur branchement réel ; typographie choisie et contrôlée dans le moteur sur de vraies valeurs ; détourage sémantique/alpha, parties occultées reconstituées, pivots et familles cohérents ; assemblage comparé à la référence au même état puis vérification des interactions. Les trois preuves sont distinctes : comportement conservé, sources propres, restitution fidèle. Un crop, un PNG avec alpha ou un build vert ne suffisent pas. Les états peuvent être produits par des sprites ou par le moteur selon la DA ; ne pas imposer un fichier par état. Aucun changement du skill ou du runtime n’est livré par cette note.
- [ ] Définir une boucle de retour légère, utilisable depuis le chat comme depuis le Lab : observation/version de départ → attendu et critère vérifiable → correction ciblée → preuve sur la version corrigée + non-régression → résultat proposé à validation. Conserver l’identifiant du retour dans le suivi existant ; distinguer corrigé, vérifié par l’agent, accepté par l’utilisateur, partiel et bloqué. Ne jamais transformer une auto-déclaration en validation humaine. Après deux corrections infructueuses d’un même défaut, diagnostiquer et changer de méthode au lieu d’empiler des retouches. L’utilisateur a exprimé son intérêt pour cette boucle ; son détail reste une proposition, sans refonte du Lab engagée.

## À explorer / idées
