# MiniFugg Core — TODO

Backlog transversal de la plateforme. Voir `docs/TODO_NOTES.md`.

## Priorité / prochaine passe

## Produit / UX

- [ ] Prévoir un petit écran de loading au lancement des jeux lorsque le chargement réel provoque une attente perceptible, afin d’éviter les temps morts avant l’affichage du jeu.

## Core / architecture

- [ ] Mettre en place une vraie gestion de compte joueur Core : pseudo public + e-mail privé/vérifié ; création et reconnexion sans mot de passe par lien magique envoyé par e-mail ; session durable par défaut afin d’éviter les reconnexions répétées, mais révocable/rotatable côté serveur ; conserver l’identité anonyme actuelle uniquement comme identité pré-compte et la rattacher/fusionner proprement lors de l’inscription ; prévoir dès le schéma qu’un même compte puisse lier plusieurs fournisseurs d’identité, avec Steam et itch.io comme premières cibles, sans supposer qu’ils utilisent tous le même protocole.

## Audio

## Graphismes / UI / marque

## Distribution / économie

## Bugs / technique

- [ ] Revoir le flux de génération des conversations, encore instable et source de problèmes récurrents ; reproduire et observer précisément son comportement avec Codex ou Work avant de corriger.

## À explorer / idées
