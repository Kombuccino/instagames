# MiniFugg Core — TODO

Backlog transversal de la plateforme. Voir `docs/TODO_NOTES.md`.

## Priorité / prochaine passe

Production de jeux — priorité exprimée le 18 septembre 2026 : résoudre la reconstruction de sources à calques depuis une DA aplatie, puis leur intégration fidèle. Le développement du Lab n’est pas une fin en soi. Essai proposé et non encore effectué : décomposer une DA existante avec un outil spécialisé, recomposer l’écran depuis les vrais éléments, puis éprouver un composant interactif. Voir le classement ci-dessous.

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

### Intentions acquises — 18 septembre 2026

Le principal temps perdu est la traduction/intégration d’une DA, pas l’absence de tests : le prototype est joué dans MiniFugg. Une image générée aplatie n’a pas de document source à calques récupérable ; il faut construire cet équivalent, avec éléments isolés, transparence, parties occultées et ordre de composition. Une liste d’éléments ou des crops rectangulaires ne constituent pas ce livrable.

L’utilisateur conçoit sur téléphone et donne des retours oraux naturels. L’agent interprète, recherche la cause, corrige, vérifie et tient le suivi ; aucun formulaire, critère de test ou compte rendu de cinquante lignes n’est demandé à l’utilisateur. Question courte seulement si une ambiguïté importante subsiste après examen. Le plan sert à maintenir un état présent, visuel et hiérarchisé des problèmes/décisions, pas à empiler la chronologie du chat. Le Lab reste optionnel pour la communication difficile ; une solution existante plus simple est préférable si elle résout le besoin.

L’essai actuel porte sur un jeu existant. Pour un nouveau jeu, l’utilisateur demande son activation vers la fin de la conception du prototype ; ne pas en déduire une activation/publication automatique ni la suppression des tests de l’agent.

### P1 — Sources à calques et intégration fidèle

- [ ] Éprouver la reconstruction d’une DA existante avec un outil spécialisé avant d’étendre l’éditeur du Lab. Premier candidat proposé : Qwen-Image-Layered (calques RGBA, décomposition récursive, exports PNG/PSD). Comparaison sans nouvel outil maison possible avec Canva Magic Layers (éléments et textes éditables). Recherche documentaire seulement : aucun de ces outils n’a encore été testé sur les DA MiniFugg ; aucun gain de durée ni fidélité au pixel n’est établi. Qwen ne permet pas d’imposer explicitement le contenu de chaque calque par le prompt ; les parties cachées sont reconstruites, pas récupérées à l’identique.
- [ ] À partir de cet essai, préciser la route existante `minifugg-art` / `GAME_ART_PRODUCTION_PIPELINE.md` : source recomposable avant intégration complète, conservation du master approuvé, masques propres et reconstruction localisée plutôt que régénération globale. Garder positions, ordre, dimensions et pivots avec les images ; l’export et le placement moteur doivent dériver de la même géométrie. Le texte dynamique reste une vraie typographie/glyphes exploitables, les composants répétitifs sont réutilisables, et les états utiles partagent ancrages et géométrie. Comparer la recomposition au master puis tester les interactions ; un build vert ou un PNG avec alpha ne suffisent pas. Pas de changement du skill livré par cette note.

Sources consultées le 18/09/2026 : [Qwen officiel](https://github.com/QwenLM/Qwen-Image-Layered), [API fal](https://fal.ai/models/fal-ai/qwen-image-layered/api), [Canva Magic Layers](https://www.canva.com/magic-layers/). Le choix d’un fournisseur et son accès restent à établir avant traitement d’assets ; aucune installation ni génération externe effectuée ici.

### P2 — Retours naturels, état courant non chronologique

- [ ] Tenir dans le suivi existant une synthèse courte regroupée par problème et importance : blocage courant, autres corrections ouvertes, décisions à conserver, sujets différés. Fusionner les reformulations au lieu de créer un nouveau point à chaque message ; un changement de sujet ne clôt pas un problème. L’agent porte en interne la boucle observation → attendu → correction → vérification ; l’utilisateur ne remplit rien. Distinguer corrigé/vérifié/accepté par l’utilisateur/partiel/bloqué, sans auto-validation humaine. Après deux corrections infructueuses du même défaut, diagnostiquer puis changer de méthode. Détails d’implémentation proposés, non livrés.

### En réserve — Améliorations du Lab déjà discutées

- [ ] Si le Lab reste utile : fiabiliser la sauvegarde et signaler ses échecs ; transporter les images réellement accessibles et la version d’origine dans l’export ; rendre visible le résultat du traitement des retours ; séparer données de production des jeux et code de l’éditeur avant généralisation. Propositions conservées, aucune refonte du Lab engagée. Reporter les raffinements du canvas qui ne débloquent pas le travail.

## À explorer / idées
