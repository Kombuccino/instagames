# CrazyPapers — Suivi de création

Mis à jour : 12 septembre 2026 à 19:08 Europe/Paris. Version livrable : `0.4.0`. Base inspectée avant la passe cover : `4ac3928` (`origin/main`).

## Décision active

Le retour utilisateur du 11 septembre remplace la simple limite invisible de backlog par une pression **hybride et physique** : les piles montent, des feuilles débordent dans la zone de jeu, puis une masse de paperasse descend depuis le haut et recouvre progressivement CENTRE. À saturation, la paperasse couvre la zone jouable et empêche le tri avant l'écran de résultat.

## Runtime et migration

CrazyPapers était `legacy-dom` avec `migration.locked: true`. La nouvelle mécanique n'a pas été ajoutée au renderer legacy : le gameplay a été reconstruit en Phaser 4.2.1 sur le stage logique `390 × 844`, avec React limité au `PhaserGameHost`. L'ancien `CrazyPapers.css` est supprimé.

Mécaniques conservées : 5 services, 20 familles de documents, indices dégressifs, niveaux/promotions, arrivée accélérée quand la pile est vide, erreurs qui reviennent, pénalité de travail supplémentaire et trois événements surprise.

## Pression hybride implémentée

- trois piles visibles grandissent avec la queue ;
- au-delà de 8 dossiers, des feuilles débordent autour du document actif ;
- à partir d'environ 55 % de 24 dossiers, un rideau de paperasse descend sur CENTRE ;
- à 24 dossiers, les inputs sont gelés, le rideau finit de couvrir CENTRE en environ 0,5 s, puis `session.finish` est appelé ;
- la pression est dérivée de la queue réelle : erreurs, liasses, urgence et photocopieuse peuvent accélérer visuellement la submersion.

## Recherche DA gameplay — nouveau pipeline MiniFugg — 11 septembre 2026

Date / lot / base Git : 11 septembre 2026, recherche DA gameplay, base `2eb9b93ac82175a725f5139edaa698fb1ebf86b8`.

Demande et référence : relancer une recherche de DA gameplay avec `docs/DA_CORE.md`, `docs/DA_GAME.md`, `docs/MINIFUGG_ZONES.md` et `.agents/skills/minifugg-art/SKILL.md`. Aucune nouvelle DA gameplay n'est validée à ce stade. Géométrie de référence récupérée dans `CrazyPapersScene.ts` : stage `390 × 844`, document central `300 × 318`, cinq tampons `COMPTA / CIVIL / URBA / RH / JURID.` en `3 + 2`, piles physiques et vague de submersion.

Brief / outil / contexte observable : exploration uniquement ; même état fonctionnel et même géométrie entre pistes ; aucun titre de jeu, slogan, logo ou annotation décorative dans les études propres ; cinq services obligatoires ; pression visible par la matière papier. Génération effectuée avec l'outil image de ChatGPT, sans possibilité observable de lui imposer un prompt interne distinct du contexte de conversation.

Sorties : quatre planches générées pendant cette tentative et archivées dans `MiniFugg - Graphic Archive/Games/crazy-papers/Gameplay DA Explorations - 2026-09-11/` sous `crazy-papers-gameplay-da-research-rejected-01.png` à `-04.png`.

Essais et écarts : **4 générations rejetées par l'agent avant validation utilisateur**. Défauts récurrents : l'outil transforme la recherche en planche/collage, réintroduit le titre CrazyPapers et des slogans, remplace les cinq services par trois boutons de type approve/reject/review, ajoute des textes nationaux parasites et ne respecte pas suffisamment le même état fonctionnel. La cause probable est le contexte de génération trop large / l'inférence automatique de l'outil ; ce n'est pas une validation de ces visuels.

Contrôles : artistique `non conforme` ; technique `images PNG générées et archivées` ; usage `non conforme` car elles ne peuvent pas servir de référence de production du gameplay réel.

Validation utilisateur : **en attente** ; aucune des sorties de cette passe n'est candidate à validation.

Livraison : généré oui / archivé oui / importé production non / intégré non / testé gameplay non.

Suite : refaire les pistes comme **écrans indépendants** à partir d'un contexte de génération plus étroit ou d'une capture géométrique exploitable, puis seulement présenter 4–5 directions réellement comparables. Ne pas modifier `ART_DIRECTION.md` tant qu'une piste n'est pas choisie.

## Vérification migration

PR de validation : `#4`. Commit candidat : `a8c4754b0335243c80aaab426142f004f96a2fc7`.

GitHub Actions `Frontend Build` run `34624907789` : `npm install`, `npm run test:repository` et `npm run build` réussis. Cette passe n'a pas de navigateur interactif connecté au build ; la géométrie, le tactile et la sensation de la vague doivent encore être vérifiés dans l'application déployée avant de marquer la migration `current`.

Pour cette raison, le jeu est bien passé sur `runtime: phaser-2d` mais reste provisoirement `migration.state: in-progress` et `locked: true`. C'est un verrou de validation, pas un second renderer : le DOM/CSS legacy n'existe plus en production.

Cover : `update-required`, indépendamment de cette migration gameplay. La phase jaquettes reste séparée.

## Recherche cover — quatre écritures TetraMindFck transposées — 12 septembre 2026

Demande : reprendre pour CrazyPapers le niveau d'écriture, l'écart au rendu générique et la diversité des meilleures recherches TetraMindFck, sans reprendre leurs pièces, personnages ni compositions. La fiction reste celle d'un employé submergé par une bureaucratie physique.

Micro-brief commun : cover verticale plein cadre, pensée pour un recadrage final `390 × 844` ancré en haut ; titre `CrazyPapers` seul ; personnage, menace papier et point focal dans CENTRE ; bureau, corps, dossiers et feuilles poursuivis naturellement dans BAS. Interdits : CTA, `SWIPE TO PLAY`, logo MiniFugg, UI Core, texte lisible sur les formulaires, faux cadre de vieille boîte, coins abîmés, néon et key art numérique générique.

Sorties locales, une génération indépendante par piste :

- `GFX/crea-chatgpt/game/crazy-papers/cover-research-2026-09-12/crazy-papers-cover-a-pulp-source.png` — encre/gouache pulp européenne ; SHA-256 `724fe85692ee303a02f1095c3b4eed8df7eb44a6e54b62dd0b1a2b0a0b56bbe3` ;
- `.../crazy-papers-cover-b-micro-source.png` — boîte micro européenne et machine d'archives ; SHA-256 `26046bd8f2d74404fddcd4a52c164892b10a6df24b83cce952173c23c4304ebe` ;
- `.../crazy-papers-cover-c-graphic-source.png` — affiche éditoriale graphique ; SHA-256 `3a533a3c98191852169ee4fa88f629d476cfe992d675802e8069f958280df7f3` ;
- `.../crazy-papers-cover-d-japanese-source.png` — manga commercial nerveux ; SHA-256 `98e032d1e27d92bc31b5b6061e39a2f193634776d4c42c0c393739c131d15ef4`.

Contrôle technique : les quatre sources sont des PNG opaques, plein cadre, une seule image, `853 × 1844`; aucune source n'a été redimensionnée ou recadrée. Une comparaison sans labels ni redimensionnement est conservée sous `.../crazy-papers-cover-comparison.png`.

Contrôle visuel agent : les quatre pistes sont propres, autonomes et nettement différenciées ; le titre est exact et aucun CTA, logo, UI ou faux cadre n'est présent. Les traits de formulaires restent abstraits. Statut artistique : **candidates à la validation utilisateur**, non validées. Statut d'usage : **hors production** ; aucun fichier n'est ajouté au runtime et `migration.cover` reste `update-required`.

Essais connus : **4 générations pour 4 pistes présentables**. L'archive locale est faite ; la copie vers la Graphic Archive privée reste en attente faute de connexion Drive dans cette passe.

## Prochaine action

1. Faire choisir/valider séparément les nouvelles pistes cover ; adapter seulement la ou les retenues en master `390 × 844` et dérivé runtime lossless avant intégration Core.
2. Refaire une vraie recherche DA gameplay conforme : 4–5 écrans indépendants, même géométrie et même état fonctionnel, sans titre/logo/texte parasite.
3. Puis test utilisateur du gameplay en ligne : lisibilité du document, taille des 5 tampons, vitesse de la montée des piles, seuil de débordement et descente de la vague.
4. Après validation technique de la migration, passer `migration.state` à `current` et `locked` à `false` sans réintroduire de renderer parallèle.
