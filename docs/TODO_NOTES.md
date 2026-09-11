# MiniFugg — Notes & TODO

Ce document définit le carnet de notes partagé entre les discussions MiniFugg.

## But

Permettre au user de noter une idée pendant qu'un autre travail est en cours, sans interrompre ce chantier et sans dépendre de la mémoire d'une discussion.

Sources de vérité :

- TODO d'un jeu : `src/games/<dossier>/TODO.md` ;
- TODO transversal / Core : `docs/CORE_TODO.md` ;
- état réellement livré / travail courant : `GAME_STATUS.md` ;
- historique livré : `CHANGELOG.md`.

Une TODO est un backlog d'idées et de tâches futures. Elle n'est ni une validation artistique, ni une décision technique canonique, ni la preuve qu'un changement a été livré.

## Discussion dédiée « MiniFugg — Notes & TODO »

Cette discussion sert par défaut uniquement à **capturer, classer, reformuler légèrement et sauvegarder** les notes. Elle ne lance pas de codage, de génération graphique ni de refonte sauf demande explicite du user.

Le user peut écrire naturellement, par exemple :

- `Vlad : faire crier les légumes avec plusieurs onomatopées` ;
- `Tetra : tester un mode où ...` ;
- `Core : réfléchir à ...` ;
- `Note pour LineFugg : ...`.

L'agent retrouve lui-même le bon dossier. Si le jeu est vraiment ambigu, poser une seule question courte. Une idée concernant plusieurs jeux ou la plateforme va dans `docs/CORE_TODO.md`.

Ne pas demander au user de choisir une catégorie. Classer la note dans la rubrique la plus logique du fichier.

## Dans une discussion de jeu

Quand le user demande « qu'est-ce qu'il y a dans la TODO ? », « qu'est-ce qu'on avait noté ? » ou équivalent :

1. relire le `TODO.md` du jeu sur le dernier `main` ;
2. le résumer brièvement, sans lancer le travail ;
3. si le user demande quoi faire ensuite, croiser avec `GAME_STATUS.md` et recommander une prochaine action.

Quand le user demande explicitement d'implémenter un item de TODO, travailler uniquement sur l'item choisi. Après livraison vérifiée, retirer l'item s'il est entièrement terminé ; s'il est partiel, le reformuler pour ne garder que le reste. Git conserve l'historique.

Un agent qui travaille sur le code **ne modifie pas la TODO pendant un chantier sans rapport**. Cela permet à la discussion Notes d'ajouter des idées pendant que Codex code avec beaucoup moins de conflits Git.

## Format des TODO

Les rubriques sont volontairement simples :

- Priorité / prochaine passe
- Gameplay / GD
- Graphismes / DA / FX
- Audio
- Covers / présentation
- Bugs / technique
- À explorer / idées

Utiliser des cases Markdown `- [ ]`. Garder les formulations courtes mais assez précises pour être comprises plusieurs semaines plus tard.

Ne pas recopier dans TODO les tâches déjà suivies comme travail actif dans `GAME_STATUS.md`, sauf si le user demande explicitement de les garder comme rappel futur.

## Jeux actuels

- TetraMindFck : `src/games/calc-drop/TODO.md`
- CrazyPapers : `src/games/crazy-papers/TODO.md`
- DebthOfLife : `src/games/debth-of-life/TODO.md`
- HARI les dents pourries : `src/games/hari-rotten-teeth/TODO.md`
- LineFugg : `src/games/linefugg/TODO.md`
- Shoot the Shooter : `src/games/shoot-the-shooter/TODO.md`
- Train Fighter : `src/games/train-fighter/TODO.md`
- Les Brochettes de Vlad : `src/games/vlads-skewers/TODO.md`

Lorsqu'un nouveau jeu est créé, créer son `TODO.md` avec le même modèle dès que la première note/backlog apparaît.
