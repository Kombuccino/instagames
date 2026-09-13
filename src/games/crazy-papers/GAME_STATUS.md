# CrazyPapers — Suivi de création

Mis à jour : 13 septembre 2026 à 09:34 Europe/Paris. Version livrable : `0.5.2`.

## Calage final des six covers — 13 septembre 2026

- L’export `minifugg-cover-calibration/v1` validé par l’utilisateur est appliqué : positions `13.2%`, `26.4%`, `36%`, `bottom`, `bottom` et `55.4%` dans l’ordre de la collection.
- Les sources, masters PNG et WebP lossless restent octet pour octet inchangés. Pour les cinq crops qui coupaient le titre, Core conserve le bandeau supérieur exact du même raster et le fond suit la fenêtre choisie ; `Constructivist Clerk` utilise directement son ancrage BAS.
- Les 24 cas A54 Brave, A54 Chrome, MASTER et desktop passent pour les six éditions : largeur pleine, titre entier, personnage au-dessus de JOUER, sélection, lancement/retour et aucune erreur console.

## Correctif affichage 0.4.1 — 12 septembre 2026

Le screenshot utilisateur PC a révélé des bandes internes marron/jaunes à droite et en bas de la surface Phaser ; le même défaut est reproductible conceptuellement sur téléphone haute densité. Diagnostic : `PhaserGameHost` augmente la résolution du canvas selon le `devicePixelRatio` (plafonné à 2), mais CrazyPapers gardait une caméra à zoom 1. Le monde logique `390 × 844` n'occupait donc qu'une fraction du canvas DPR2/DPR3.

Correctif : CrazyPapers applique maintenant à sa caméra le même `renderPixelRatio` que le host et recentre explicitement le monde sur `195 × 422`. La géométrie logique, les hitboxes, les règles et le scoring restent inchangés. Le comportement attendu est celui des autres scènes Phaser haute densité : le monde logique remplit entièrement le canvas, puis le host applique uniquement le scaling/crop MiniFugg.

Vérification requise après CI : téléphone DPR2/DPR3 avec largeur utile entièrement remplie et aucune bande interne à droite/bas ; PC sans bande interne, seules les marges extérieures Core pouvant rester visibles. La migration reste `in-progress` / `locked: true` jusqu'à validation interactive finale.

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

Cover : `current`. Les six variantes validées sont désormais des images statiques rendues par Core ; la migration gameplay reste indépendante.

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

Validation utilisateur complémentaire, 12 septembre 2026 : les trois premières sources de ce lot sont explicitement validées — `crazy-papers-cover-a-pulp-source.png`, `crazy-papers-cover-b-micro-source.png` et `crazy-papers-cover-c-graphic-source.png`. La quatrième source japonaise n'est pas comprise dans cette validation. Les trois sources retenues ont ensuite été intégrées sans régénération avec les trois sources validées du lot suivant.

## Sélection cover — lot inspiré des archives historiques — 12 septembre 2026

Date / lot / base Git : 12 septembre 2026 à 22:54 Europe/Paris, lot `historical-inspired`, base `01a8158d0943fa7bcb0f8c329af560e4c42dec3b` (`origin/main`).

Demande et références : nouvelles covers inspirées des choix historiques 02, 07, 08, 13, 15, 16, 17/20, 23, 28 et 31, croisées avec les grammaires TetraMindFck validées. Intention confirmée : submersion et écrasement bureaucratiques, personnages ordinaires, corpulents, âgés ou épuisés, regards vides ou fous, sans traitement de star. Les anciens logos 13 et 23 ne sont pas retenus.

Brief / outil / contexte observable : quatre générations indépendantes, une par famille, avec les références exactes ouvertes. Cover statique plein cadre ; seul texte lisible autorisé : `CRAZYPAPERS` ; bas continu en corps, bureau, machine et papier ; aucun CTA, `SWIPE TO PLAY`, UI Core, faux cadre ou coins abîmés. Outil image de Codex avec trois références ciblées par direction.

Sorties locales originales, PNG opaques `853 × 1844` :

- `GFX/crea-chatgpt/game/crazy-papers/cover-research-2026-09-12-historical-inspired/crazy-papers-historical-inspired-a-pulp-clerk.png` — SHA-256 `d0e9e198426eca81407f56e06de73ef9b323e9715ea304a613d41d8f07c09126` — **retenue** ;
- `.../crazy-papers-historical-inspired-b-constructivist-clerk.png` — SHA-256 `135849abd66221ee913a2a8ffcc4f4f91e08a2d99f11e3134f89e20923e4cd03` — **retenue** ;
- `.../crazy-papers-historical-inspired-c-showa-paper-wave.png` — SHA-256 `179948b55f8e3ecda96d57d0110b7bda941d2eadec777361bcb7206c174c03a0` — **retenue** ;
- `.../crazy-papers-historical-inspired-d-micro-machine.png` — SHA-256 `90d1bfea63dfc57162e2bcff1cac8f935a64ee909a2fcca993d0d8266d460876` — non retenue dans ce lot, conservée comme bonne recherche.

Essais et écarts : quatre images initiales, puis une correction ciblée de la version micro car son premier rendu omettait le titre ; total connu : **5 appels image pour 4 sources finales**. La correction a conservé la scène et ajouté le masthead exact.

Contrôles : artistique — A/B/C acceptées par l'utilisateur au niveau concept/source, D appréciée mais écartée de la sélection ; technique — quatre PNG opaques, une frame, plein cadre, dimensions conformes à la matrice de génération et contrôlées dans `inspection-report.json` ; usage — les trois sources retenues font partie de la collection Core statique testée ci-dessous.

Validation utilisateur : le 12 septembre 2026, l'utilisateur garde explicitement **les trois premières propositions A, B et C** de ce lot, puis valide l'intégration de la collection complète de six covers. Cette validation ne s'étend pas à D.

Livraison : généré oui / sources préservées oui / master production oui / runtime lossless oui / intégré Core oui / testé en Cover oui.

Suite : conserver les trois sources non retenues hors production et ne pas régénérer les six éditions validées lors des futures passes techniques.

Collection validée après la décision complémentaire : **6 covers sources** au total — les trois premières du lot `cover-research-2026-09-12` et les trois premières du lot `cover-research-2026-09-12-historical-inspired`. Les deux quatrièmes propositions restent hors sélection.

## Intégration canonique des six covers — 12 septembre 2026

Les six sources validées sont conservées octet pour octet dans `public/assets/generated/crazy-papers/welcome/variants/sources/`. Le script `scripts/build-crazy-papers-covers.py` fabrique six masters PNG opaques exactement `390 × 844` et six WebP lossless `780 × 1688`. Il retire seulement environ `0,915` pixel source au total sur les côtés pour atteindre le ratio exact, sans étirement, peinture, prolongation ni réinterprétation.

Core expose les six éditions statiques avec sélection Alpha libre et scores futurs conservés. Cinq utilisent `cover` avec ancrage `top center`. `Constructivist Clerk` utilise le cadrage focal `center 70%` afin que l'employée, placée très bas dans la source approuvée, reste visible au-dessus du pupitre fixe. Aucun runtime animé, CSS multicouche ou Phaser de cover n'est ajouté ; les six rasters demeurent inchangés.

Contrôle navigateur : A54 Brave `360 × 611`, A54 Chrome `360 × 656`, MASTER `390 × 844` et PC `1280 × 720`, avec les six éditions à chaque format. Sur mobile la largeur utile est pleine ; les cinq compositions compatibles gardent leur haut fixe et l'exception constructiviste décale seulement sa fenêtre sur l'image intacte. MONNAIE, RAIL, vrai pupitre Core fixe, sélection d'édition, lancement du jeu et retour Cover sont vérifiés sans erreur console. Le contrôle générique gameplay confirme également le passage vers la scène Phaser.

## Correction du recouvrement PLAY — 13 septembre 2026

Le contrôle après l'intégration du pupitre Core fixe a montré que l'ancien test regardait encore le composant désormais absent de chaque cover. La matrice a donc été raccordée à la couche fixe réelle et étendue aux six éditions sur mobile court, mobile haut, MASTER et PC. L'audit visuel des 19 covers déclarées `current` confirme que LineFugg, TetraMindFck et Vlad conservent leurs points focaux ; le défaut franc concernait `Constructivist Clerk`, dont seul le sommet des cheveux restait visible.

La correction est exclusivement un cadrage runtime `center 70%` pour cette variante. Les sources, masters et WebP restent octet pour octet identiques ; aucun prolongement, effacement, redessin ou nouvel effet n'est introduit. Le titre et le personnage sont désormais tous deux lisibles au-dessus de JOUER dans les quatre formats de référence.

## Prochaine action

1. Vérifier le correctif `0.4.1` sur le screen mobile/PC réel : plus aucune bande interne due au DPR.
2. Refaire une vraie recherche DA gameplay conforme : 4–5 écrans indépendants, même géométrie et même état fonctionnel, sans titre/logo/texte parasite.
3. Puis test utilisateur du gameplay en ligne : lisibilité du document, taille des 5 tampons, vitesse de la montée des piles, seuil de débordement et descente de la vague.
4. Après validation technique de la migration, passer `migration.state` à `current` et `locked` à `false` sans réintroduire de renderer parallèle.
