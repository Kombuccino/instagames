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

## À explorer / idées
