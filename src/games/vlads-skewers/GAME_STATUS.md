# Les Brochettes de Vlad — Suivi

Mis à jour : 7 septembre 2026. Base inspectée : `62947acacd03ecb3ae487160c9a2faa246417990`. Contrat artistique repris dans `2eeca739178b8ff0cbe12158bec73b797e4ba0f8`.

Phase : recadrage documentaire des quatre études de covers demandées. La DA gameplay pixel art est choisie ; les covers précédentes sont rejetées, aucune nouvelle cover n'est validée.

Registre constaté : `status: fugg`, `runtime: legacy-dom`, stage 390 × 844, migration Phaser requise et verrouillée, cover `update-required` avec placeholder. Ce statut publié ne prouve pas une finition artistique. Aucun changement de registre, gameplay, code ou déploiement dans cette passe.

Séquence initiale : boucle jouable historique, puis affinage et recherche artistique. Pas de redémarrage du compteur des dix prompts pour cette reprise.

## Demande et décisions

Discussion : Les Brochettes de Vlad, messages du 7 septembre 2026. La demande de quatre covers à 14:15:20 UTC fournit `VLAD-DA-pixelisee.png` pour comprendre l'univers, **pas pour en copier le rendu**. À 14:26:30 UTC, l'utilisateur rejette les quatre images et demande la lecture du plugin GitHub, des skills et des fichiers MD.

Le contrat des covers est `docs/DA_COVER.md` : A pulp européen/franco-belge ; B boîte de micro-ordinateur européen ; C affiche graphique/traditions éditoriales d'Europe de l'Est ; D réinterprétation culturelle. `WELCOME_ART_STYLES.md` détaille les médiums. Ne pas substituer les familles gameplay Pixel Dungeon/Paper Cut/Toybox à ces quatre intentions éditoriales.

Les décisions gameplay récentes, la portée exacte de la référence, les rejets et les quatre micro-briefs proposés sont dans [ART_DIRECTION.md](ART_DIRECTION.md). Ne pas produire une nouvelle illustration à partir de la seule ancienne description d'emojis.

Règles historiques à préserver ou réconcilier explicitement avant migration : objectif de clients par niveau = niveau + 2 ; types disponibles = 3 puis +1 tous les deux niveaux, maximum 7 ; recettes historiques = 2 puis +1 tous les deux niveaux, jusqu'à 6. Barème demandé : 2 ingrédients → 2 points ; 3 → 4 ; 4 → 6 ; 5 → 10 ; 6 → 15. La passe artistique suivante a demandé une bulle prévue pour cinq ingrédients et un bonus maximal ×5 ; trancher la limite des recettes dans le travail de GD/migration, pas par une cover. Livraison automatique et affichage persistant du meilleur multiplicateur sont des décisions utilisateur du 7 septembre, pas une preuve d'intégration dans le renderer legacy.

## Réalisé et preuves

- Lecture sur `main` : `ACTIONS.md`, `AGENTS.md`, `DA_CORE.md`, `DA_COVER.md`, `WELCOME_ART_STYLES.md`, `WELCOME_ILLUSTRATIONS.md`, sections DA/cover/suivi de `GAME_CREATION_PIPELINE.md`, skill `.agents/skills/phaser-minifugg/SKILL.md`, `ASSET_PIPELINE.md`, `GRAPHIC_ARCHIVE.md`, registre et ancienne DA de Vlad. Le manifeste LineFugg a été consulté comme exemple de diversité approuvée, sans utiliser son astronomie comme brief pour Vlad.
- La référence utilisateur a été ouverte, mesurée et conservée intacte dans l'archive privée. Drive : `15_dlZaGY-MUEIPeQmYCW0ODSYc4xs3Et`, 2 479 148 octets. Rôle : univers gameplay, référence seulement, aucun import runtime.
- Les quatre PNG rejetés ont été revus puis archivés sans modification dans `Games/vlads-skewers/covers-rejected/`, dossier `1dltj7yUcGScWUoiQwOKpkcIgz07cIrjL`. IDs, noms et tailles vérifiés par relecture Drive ; détails dans ART_DIRECTION.md. Les hash serveur n'ont pas été renvoyés par l'action metadata, donc aucune vérification cryptographique distante n'est revendiquée.
- Quatre briefs réellement distincts sont proposés dans la DA : scène narrative de service ; gros plan d'illustration commerciale ; métaphore de la brochette-croc ; vue plongeante d'édition japonaise imprimée. Ce sont des propositions de travail, pas des choix utilisateur.
- L'ancienne DA ne comportait pas les corrections du 7 septembre ; elles sont désormais transcrites avec leur portée. Pas de nouveau fichier de procédure globale ni de renderer parallèle.

## Reste

| Lot | État | Critère de sortie |
| --- | --- | --- |
| Nouvelles études de covers A/B/C/D | À faire | Quatre images individuelles, idées/cadrages/médiums/hiérarchies distincts, titre exact, pas d'UI |
| Sélection des covers | À faire | Choix utilisateur sur les nouvelles études ; aucune présélection automatique |
| Masters et couches de production | À faire après choix | Originaux conservés, ratio/overlays vérifiés, décomposition fidèle selon la procédure |
| Migration et DA gameplay Phaser | À faire / à vérifier dans la passe dédiée | Runtime canonique, règles réconciliées, géométrie validée et tests réels |
| Import/runtime/déploiement des nouvelles covers | Non effectué | Assets vérifiés, branchement Core autorisé, état de publication distinct du déploiement |

L'outil de génération/édition d'images n'est pas exposé dans le tour de reprise documentaire ; aucune nouvelle génération n'a été exécutée. Le skill du dépôt explique la procédure mais ne rend pas un outil absent disponible. Ne pas qualifier les briefs ou les archives de nouvelles covers livrées.

Prochaine action : produire les quatre études à partir des micro-briefs ciblés avec un outil image disponible, puis contrôler leur diversité avant présentation. Ne joindre ni le lot rejeté ni toutes les anciennes planches au brief. Aucun besoin de redemander à l'utilisateur de réexpliquer l'univers.

Travaux parallèles : autres chantiers MiniFugg présents ; aucune modification concurrente constatée sur la DA de Vlad durant cette passe. Relire `main` avant toute écriture suivante.

## Vérifications et limites

Passe documentaire et archivage uniquement. Aucun build, test de gameplay, profilage mobile, animation ou nouvelle intégration exécuté. Pas de nouvel asset de production ; pas de référence ajoutée au dossier synchronisé `Fugg`. Le manifeste de production de Vlad reste à créer lors d'une véritable décomposition d'assets.

Enseignement : changer le médium d'une brochette centrale sur le même décor ne répond pas à une recherche éditoriale A/B/C/D. Le sens du jeu est invariant, son illustration de cover ne l'est pas. Les aliments déjà embrochés doivent rester inertes, y compris sur les jaquettes.
