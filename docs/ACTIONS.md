# MiniFugg — Point d'entrée ChatGPT / Codex

Ce fichier organise le travail ; les documents liés portent les règles détaillées. À chaque nouvelle demande, identifier l'intention, le jeu ou la surface, puis suivre la route utile. Les instructions explicites de l'utilisateur priment. Ne pas transformer une question ou une idée à discuter en chantier non demandé.

## 1. Comprendre, retrouver, annoncer

Lire la version actuelle sur `main` de ce fichier et des [règles du projet](../AGENTS.md) au démarrage ; à chaque demande suivante, réévaluer la route et actualiser les sources si elles ont changé. Pour un simple échange, aucune lecture ni cérémonie inutile.

Pour un jeu, retrouver son entrée dans [le registre](../src/core/gameRegistry.tsx), qui renvoie désormais à son `src/games/<dossier>/definition.ts`, puis `GAME_STATUS.md`, `ART_DIRECTION.md` et `ASSET_MANIFEST.md` dans ce même dossier lorsqu'ils existent. TetraMindFck garde le dossier `calc-drop`. Ouvrir les images pertinentes et consulter les discussions liées pour récupérer les corrections non transcrites. Une affirmation ancienne de l'agent n'est pas une validation utilisateur ni une preuve de livraison.

Annoncer en une ou deux phrases le travail choisi, la procédure utilisée et pourquoi. Si deux interprétations changent réellement le livrable ou si les procédures se contredisent sans décision permettant de trancher, expliquer le doute et poser une question courte. Choisir soi-même les détails techniques courants ; ne pas demander de recopier un brief.

## 2. Choisir la route

| Demande naturelle | Lire et appliquer | Résultat attendu |
| --- | --- | --- |
| Créer un jeu, améliorer les règles, poursuivre une bêta | [Création et suivi](GAME_CREATION_PIPELINE.md), [spécification](../GAME_DEV_SPEC.md) | Prototype jouable, puis affinage ; compteur de dix prompts selon les règles existantes |
| Faire la DA du jeu | [DA commune](DA_CORE.md), [DA gameplay](DA_GAME.md) | Quatre ou cinq pistes si aucune direction n'est choisie, sur le vrai jeu et sa géométrie |
| Faire des covers / jaquettes | [DA commune](DA_CORE.md), [DA covers](DA_COVER.md), [Zones MiniFugg](MINIFUGG_ZONES.md) | Interprétations éditoriales distinctes, fidèles au sens du jeu et cadrées dans le modèle Cover |
| Intégrer une DA, animer, ajouter des FX | [Production artistique](GAME_ART_PRODUCTION_PIPELINE.md), [assets](ASSET_PIPELINE.md), DA de la surface | Planche de traduction DA → jeu validée, mini-tranche jouable, puis assets séparés, états et comparaison au master |
| Créer / corriger une interface ou une entrée MiniFugg | [Refonte par blockouts](PLATFORM_REDESIGN.md), [DA UI](DA_UI.md) ou [DA Welcome](DA_WELCOME.md), [DA commune](DA_CORE.md), [Zones MiniFugg](MINIFUGG_ZONES.md), [validation plateforme](PLATFORM_VISUAL_VALIDATION.md) | Blockout validé avant reprise générale, puis réutilisation des références, composants et zones canoniques |
| Coder, migrer ou corriger le gameplay / les contrôles | [Architecture](GAME_ENGINE_ARCHITECTURE.md), [migration](GAME_MIGRATION_PLAN.md), [layout](GAME_LAYOUT_SYSTEM.md), [Zones MiniFugg](MINIFUGG_ZONES.md), [gestes](INPUT_GESTURES.md), [orientation](ORIENTATION_LAYOUT.md) | Correction dans le moteur canonique, vérifiée sur les états et écrans utiles |
| Musique ou sons | [Core Audio](AUDIO_SYSTEM.md), [Music Lab](MUSIC_LAB.md), [validation audio](AUDIO_VALIDATION.md) | Références et pistes acquises conservées, écoute et cycle de vie vérifiés |
| Passer en Fugg, livrer, faire le bilan | [Création : revue finale et bilan](GAME_CREATION_PIPELINE.md), [curation](GAME_CURATION.md) ; [exports](PLATFORM_EXPORTS.md) si packaging | Qualité vérifiée, acceptation utilisateur et état de livraison explicites |
| Où en est le jeu ? | Sa fiche `GAME_STATUS.md` et preuves actuelles | Fait, reste et prochaine action, sans modifier le jeu |

Pour plusieurs besoins, enchaîner les routes nécessaires dans leur ordre de dépendance. Les documents référencés renvoient aux styles et contrats spécialisés ; ne pas charger tous les catalogues dans chaque tâche.

## 3. Choisir les outils disponibles

- **Codex local :** lire le dépôt, inspecter le code, lancer le jeu et prendre les captures utiles. Utiliser les skills disponibles correspondant à la tâche : `imagegen` pour produire/éditer des images, `develop-web-game` pour la boucle de tests. Pour Phaser, lire obligatoirement [phaser-minifugg](../.agents/skills/phaser-minifugg/SKILL.md), puis les seules références officielles pertinentes.
- **ChatGPT :** utiliser le connecteur GitHub pour les mêmes sources sur `main`, les discussions et images accessibles, puis les outils de génération, navigateur et Drive disponibles. Un skill présent dans le dépôt reste lisible comme procédure même sans mécanisme d'activation natif ; il ne crée pas d'outil absent.
- **Images :** appliquer [ASSET_PIPELINE](ASSET_PIPELINE.md) et [l'archive graphique](GRAPHIC_ARCHIVE.md). Génération locale Codex et transfert depuis ChatGPT ont des routes distinctes. Ne pas imposer Drive à Codex local.
- Vérifier les accès avant de les déclarer absents. S'il manque une référence ou un moyen indispensable, nommer exactement le manque ; avancer sur le reste sans prétendre avoir exécuté une étape inaccessible.

## 4. Contrôler avant de présenter ou livrer

Avant une recherche de DA gameplay, capturer le jeu réel et fixer la composition fonctionnelle. Préparer dès l'étude les couches, zones recadrables, états et mouvements ; ne pas imposer ces contraintes de plateau à une cover. L'agent rassemble le contexte ; le générateur ne reçoit que le brief ciblé et les références dont le rôle est explicite.

Avant présentation, vérifier : bonne référence, contenu demandé, textes autorisés, lisibilité et faisabilité. Comparer aussi les propositions entre elles : idée, cadrage, médium, hiérarchie. Des étiquettes de styles différentes ne suffisent pas ; des motifs communs ne rendent pas automatiquement les images identiques. Corriger les erreurs manifestes sans faire porter ce contrôle à l'utilisateur. En cas d'échecs répétés, diagnostiquer le brief ou l'outil plutôt que régénérer indéfiniment.

Après validation d'une DA gameplay, produire la **planche de traduction DA → jeu** avant l'intégration complète : composition annotée, couches, états, storyboard des interactions et planche FX/mouvement dans le style de la DA. La montrer avec une légende courte (recette Phaser, déclencheur, coût, priorité). Ne pas remplacer cette étape par une longue description ou par une intégration aveugle.

Après validation, conserver les originaux et noter la portée du choix. Ne pas régénérer une série approuvée pour la rendre « finale ». Réaliser et vérifier une mini-tranche représentative en jeu avant de décliner toute la production. Avant livraison, comparer aux références et tester les états, écrans et interactions utiles ; un build vert ne valide pas l'art.

## 5. Transmettre et apprendre

Après une décision ou une passe significative, actualiser la fiche et le document concernés : choix daté, référence exacte et rôle, refus, réalisé / reste, preuves, prochaine action. Séparer proposition, validation artistique, fichier sauvegardé, intégration et test. GitHub partage ces traces, pas automatiquement toute la mémoire des conversations.

À chaque livraison d'un jeu qui atteint `main`, mettre à jour ses métadonnées produit dans son `definition.ts` : version, date/heure Europe/Paris et entrée de changelog dans son dossier. La fiche Information doit lire cette source unique, jamais une valeur écrite en dur. Une passe non livrée reste un travail en cours : elle ne doit pas annoncer une fausse version au joueur. Une réorganisation purement technique du catalogue à valeurs identiques ne crée pas une nouvelle version de chaque jeu.

**Avant modification et avant chaque commit/publication**, même dans une discussion déjà ouverte, appliquer [REPOSITORY_WORKFLOW.md](REPOSITORY_WORKFLOW.md), section 0. Codex inspecte avec `npm run repo:check`, sélectionne uniquement ses changements, sauvegarde son lot, intègre le dernier `main`, teste le résultat combiné puis utilise `npm run repo:check -- --publish` avant livraison. Ne jamais embarquer/effacer le travail inachevé d'une autre session ou forcer un push. Une publication concurrente impose une nouvelle synchronisation, pas une consigne supplémentaire demandée à l'utilisateur.

ChatGPT relit les fichiers et SHA actuels avant ses écritures ; un lot de fichiers interdépendants arrive en un seul commit avec mise à jour de ref sans force. Un SHA obsolète impose de réconcilier le contenu, pas de republier une vieille copie. Signaler les lots actifs dans le suivi existant, sans imposer une branche permanente par jeu ni un nouvel orchestrateur. Vérifier la publication Git et la distinguer du déploiement de l'application.

En fin de réalisation, noter brièvement ce qui a réussi, échoué et pourquoi. Garder les détails dans le jeu ; corriger la procédure existante seulement si l'enseignement est général. Ne pas fabriquer une nouvelle procédure concurrente à chaque incident.

## 6. Communication

Français naturel, direct et chaleureux. Commencer par le résultat ou la décision. Par défaut : un à trois courts paragraphes, ou quelques points si plus lisibles ; développer seulement à la demande ou si une décision l'exige. Éviter répétitions, longs préambules, emphase systématique, flatterie, conclusions récapitulatives et offres « si tu veux » lorsque le travail est déjà demandé.

Pendant le travail : dire brièvement ce qui est fait et pourquoi, puis signaler les découvertes ou changements de direction importants. À la fin : résultat, vérification utile et éventuel reste. Donner une recommandation et sa raison, pas toutes les possibilités. La concision ne doit masquer ni blocage ni compromis important. Appliquer ce style sans rappeler constamment cette consigne.

Préférence utilisateur du 7 septembre 2026, cohérente avec le style « Concise » décrit par [Anthropic](https://support.anthropic.com/en/articles/10181068-configuring-and-using-styles) : réponses plus courtes et plus directes. Ce réglage appartient au projet, pas aux paramètres globaux du compte.
