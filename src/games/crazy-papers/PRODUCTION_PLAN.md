# CrazyPapers — T03 : audit et production graphique

Date : 19 septembre 2026. Base de l'audit initial : `2c0c37a4024ac5475ddc2a25112593ee1c968197`. Base de l'enregistrement de la nouvelle validation : `760eae934dd1749cedd9dd6cc65f7f5636961f12`.

## État courant — DA principale compacte validée

**L'utilisateur a validé la dernière composition compacte et l'a désignée comme DA principale le 19 septembre 2026 à 10:22:10 UTC.** Le fichier exact est `crazy-papers-gameplay-da-main-compact-2026-09-19.png`, Drive privé `1Msvmzf6bU5Zw3TaV8thCrpzOIFWdcLi8`. Source de conversation : `bureaucratie_au_coucher_du_soleil.png`, génération `3033818c-cc4a-4f06-b395-e6b83fc11528`.

PNG RGB opaque, **849 × 1851 pixels**, **2 048 167 octets**, SHA-256 `cccc81028dc7e725bc25ce7ee7401a8f3dc6861be3b17facd4fe9b4239723e51`. Archivé dans `MiniFugg - Graphic Archive/Games/crazy-papers/Gameplay DA Validated - 2026-09-19`, puis retéléchargé et comparé octet pour octet : identique. Original non redimensionné, non retouché, non recompressé. Contrat d'approbation complet dans `ART_DIRECTION.md` ; fiche dans `ASSET_MANIFEST.md`.

La correction retenue récupère l'espace dans la bande des managers/enseignes puis remonte le reste du gameplay. La limite basse à préserver est le bas des bases tactiles des tampons ; sous cette limite, bureau et papiers sont décoratifs et recadrables. **Le montage technique précédent n'est pas le calage validé.** L'image exacte compacte le remplace ; ne pas rétablir ses anciens placements ni la grande bande supérieure.

La validation artistique et la composition sont acquises. La nouvelle image doit encore recevoir son contrôle mesuré de zone garantie et du masque réel Retour Core, distinct de cette validation. **Les 744,17 unités et les rectangles de l'audit ci-dessous appartiennent à l'ancienne image.** Ils ne démontrent ni un défaut ni une conformité de la nouvelle source. Aucun nouvel asset runtime, jeu intégré ou état de carrière n'est livré par cet enregistrement. Le code, sa version et son verrou de migration restent inchangés.

Suite active : compléter la planche de traduction depuis cette source figée, avec repères de découpe et états ; produire ensuite les compléments niveaux 1 et 5, deux ambiances de journée contrastées et une remontrance avant la déclinaison complète. Les familles et décisions ci-dessous restent acquises. Le rendu du Production Lab n'a pas été mis à jour dans cette passe documentaire ; rattacher cette référence et ses nouveaux états lors de la préparation visuelle, sans refondre l'éditeur.

La source initiale a été créée ailleurs, puis deux corrections graphiques ont eu lieu dans la conversation du pilote LineFugg. Cette reprise ne prouve donc ni l'indépendance à l'historique ni la portabilité inter-modèles. Aucune nouvelle génération n'a été demandée pendant la seule inscription de cette validation.

## Historique — premier audit et montage d'étude

La passe précédente a retrouvé et audité la première référence, préparé un calage d'étude et le plan des familles. Ses montages montrent des extraits et des emplacements réservés, pas des composants détourés prêts à intégrer. Cette étape n'avait livré aucune nouvelle DA finale, aucun asset runtime et aucune intégration. Le jeu et les deux LineFugg n'avaient pas été modifiés.

Le présent plan développe le manifeste du jeu ; les procédures générales restent celles de `minifugg-art` et `GAME_ART_PRODUCTION_PIPELINE.md`. L'ancienne attente de validation du montage est remplacée par la décision sur la DA compacte en tête de ce fichier.

## Référence et audit mesuré — ancienne composition

Original Drive privé `1csaKcsx62GvWuBa716fXelhI2NqE2ZTT`, dossier `1UGgUw1SPKimiTxQNhBy9uUxcelafpxRH`, nom `crazy-papers-gameplay-da-validated-2026-09-19.png`.
SHA-256 : `5d3384b040167f1c76ad5cf4bd8673997c07451a64878340bc606246ef8e90f1`.

- PNG RGB opaque, 849 × 1851 pixels, 2 012 759 octets. Signature, CRC des chunks et décodage vérifiés ; original inchangé.
- Définition : 2,1769 pixels par unité logique à largeur 390, supérieure à la cible minimale 780 × 1700.
- Ratio : hauteur logique 850,2827, écart de +0,2827 unité par rapport à 850, soit environ +0,0333 %. Ce faible écart ne justifie ni régénération ni étirement.
- Un PNG sans pertes à l'enregistrement ne prouve pas l'absence d'altérations antérieures. Aucune cause de compression générative n'est affirmée. La grille pixel-art et la police restent à contrôler à l'usage, indépendamment de l'approbation artistique.
- Rectangles source relevés visuellement, non masques : enseignes y=14..110 px ; baies managers 0..347 ; bases tactiles des tampons 1506..1634 ; banque complète 1418..1670.
- Les enseignes et bases tactiles occupent ensemble environ **744,17 unités de hauteur**, soit **34,17 de trop** pour une fenêtre de 710, avant réservation Core. Center coupe les enseignes, top coupe les bases des tampons, bottom perd les identités du haut. Une translation globale ne suffit pas.

### Écarts entre la maquette et le jeu

Le compteur dessiné vaut 47 alors que `MAX_BACKLOG = 24` dans `CrazyPapersScene.ts`. Remplacer par une valeur vivante ; ne pas changer le seuil pour justifier l'image. Les piles seront commandées par la queue, pas conservées comme décor d'un début de partie. La maquette montre trois mots TIC/TAC alors que le niveau 1 en demande deux.

Le casting mixte, la fenêtre déjà large et la lampe équipée ne sont pas les nouvelles variantes de niveau 1 demandées. Le cadre de vie/famille et la plaque du protagoniste sont absents : les créer, pas prétendre les extraire. Le contenu du formulaire est relativement fin à taille téléphone ; valider la typographie réelle dans la tranche, sans réduire le document pour sauver le décor.

Ces écarts n'annulent pas la validation de la matière et de la direction artistique. Une image de concept ne fixe pas les valeurs, le nombre de dossiers ni tous les états de jeu. Ils restent à traiter pour le contenu vivant de la version compacte, sans refaire sa DA générale.

## Ancien calage proposé — montage historique, non retenu comme DA principale

Les coordonnées suivantes décrivent uniquement le premier montage. Elles ne gouvernent pas l'image compacte validée ensuite.

MASTER 390 × 850, center, zone garantie y=70..780. Le calage conserve l'échelle source des baies managers, du compteur, de la feuille, du support et des tampons. Il récupère la hauteur principalement dans le décor intermédiaire. Horloge et métronome plus compacts : lisibilité à vérifier dans le moteur.

| Groupe | Cible logique approximative |
| --- | --- |
| Retour Core | Réservation conservatrice x=0..48, y=70..118 ; masque réel du host encore à mesurer |
| Photo personnelle | Emplacement protégé en haut, agrandissement possible à la promotion |
| Nom/grade | En haut, hors Retour ; texte anglais vivant, placement proposé |
| Cinq baies managers | y=118..277, ordre et échelle source conservés |
| Compteur/horloge/fenêtre/lampe | Bande vers y=280..375, composants indépendants |
| Métronome et TIC/TAC | À gauche de la feuille ; place pour 2→6 mots |
| Support et feuille | Support y≈377..675 ; feuille y≈407..654, taille conservée |
| Tampons | Banque y≈654..770, même échelle et proportions |
| HAUT/BAS | Atmosphère recadrable uniquement |

Huit contrôles locaux réussis : original inchangé, PNG/CRC valide, minimum 2×, impossibilité des ancrages simples sur l'original, cible dans la zone garantie, réserve Core libre, absence de collision des emplacements essentiels, conservation d'échelle des principaux objets. Ce sont des contrôles de fichier et de rectangles, **pas des tests du jeu, du masque Core réel ou de lisibilité sur téléphone**.

Le PC ne garantit pas davantage de hauteur de monde que la fenêtre de 710. Les espaces latéraux appartiennent au Core. Une photo narrative importante ne doit donc pas être uniquement dans une extension décorative supposée visible sur PC. Une seconde photo hors zone peut enrichir la pièce, sans remplacer le repère protégé.

## Variables séparées

Séparer `rank` (1..5), `dayPhase`, `backlog`, `documentInstance`, `managerState` et `eventState`. Le grade ne déplace pas les cibles de tri. La variation d'heure n'implique pas un changement de rang ou de visage. Pas de produit combinatoire de trente scènes complètes.

La cible utilisateur est cinq niveaux ; le runtime actuel a neuf grades puis continue. Ses indices diminuent sur davantage de niveaux. Le passage à cinq doit être traité explicitement pendant l'intégration, pas présenté comme une simple retouche de texture.

Le calendrier reste à préciser avant de coder l'horloge : une journée continue pour toute la carrière ou une journée par niveau. Les sources restent compatibles avec les deux. Le vieillissement suit la progression narrative, pas directement les minutes. Le temps est celui du jeu, pas implicitement celui du téléphone.

## Inventaire des familles

| Famille | Fabrication | Variations et invariants |
| --- | --- | --- |
| Pièce et mobilier | Variantes à partir de la DA | 5 grades ; même aire de jeu, surfaces et objets évolutifs séparés |
| Fenêtre | Cadre/masque, reconstitution du fond | 5 ouvertures croissantes dans une enveloppe maximale commune |
| Ville | Source extérieure étendue et états temporels | 6 ambiances, horizon et bâtiments-repères communs ; couverture de tous les cadrages |
| Lampe | Famille illustrée cohérente | 5 modèles, ampoule au fil → lampe design ; lumière séparée |
| Photo et plaque | Nouvel élément narratif | 5 étapes d'âge/famille ; même identité et nom, grade vivant |
| Managers | Baies, portraits, expressions et gros plan | 5 slots fixes ; casting par grade ; repos/parole/colère |
| Documents | Support/papier vierge, champs, logos, portraits, marques | 20 modèles métier existants ; texte et indices variables par moteur |
| Tampons | Corps/base, face/logo, trace tampon | 5 identités ; idle/hover/pressed/release/disabled ; hitbox et ancrage fixes |
| Horloge/compteur/métronome | Surfaces séparées des informations mobiles | Aiguilles, secteur final, chiffres, TIC/TAC vivants ; son Core |
| Piles et submersion | Unités empilables, débordements, rideau | Quantités déterminées par la queue ; pas de piles fixes arbitraires |
| Remontrance et dossier retourné | Buste/bras/main/dossier/bulle distincts | Un acteur parlant ; même dossier avant/après, dos rouge et WRONG DEPARTMENT |
| Promotions/surprises/fin | Overlays et objets événementiels | Retour/résultat/score/rejouer Core ; ne pas les oublier comme sur le pilote initial Rebirth |

### Progression de carrière proposée

Les axes et extrêmes suivants viennent de l'utilisateur ; les transitions intermédiaires restent des propositions à voir avant déclinaison.

| Grade | Pièce et fenêtre | Lampe | Photo personnelle | Hiérarchie |
| --- | --- | --- | --- | --- |
| 1 | Bureau pauvre, petite grille/étage bas | Ampoule au fil | Enfance/jeunesse, interprétation exacte ouverte | Presque uniquement jeunes femmes |
| 2 | Bureau modeste, petite fenêtre dégagée | Lampe récupérée | Jeune adulte | Majorité de femmes, quelques hommes |
| 3 | Bureau établi, ouverture plus large | Lampe administrative soignée | Adulte, premiers changements familiaux | Groupe mixte plus âgé |
| 4 | Bureau privilégié, meilleure vue | Lampe de cadre | Famille et années visibles | Majorité d'hommes plus âgés |
| 5 | Bureau riche et grande baie dominante | Lampe design | Même protagoniste vieilli, cheveux raréfiés ou grande famille | Hommes âgés autoritaires |

Le nom humoristique reste à choisir. La satire passe par l'institution, les répliques et les abus ; âge et genre ne deviennent pas des indices de tri. Le nombre de tampons reste cinq à cette étape : l'idée « peut-être plus ou moins » n'autorise pas à changer leur nombre sans nouvelle décision.

### Ville : six moments, pas six scènes complètes

Préparer une ville plus grande que la plus grande ouverture, son enveloppe de cadrages par grade et les déplacements éventuels. Fixer les dimensions à partir de ces besoins, pas du seul mot « grand ». La petite grille révèle peu ; la baie finale davantage, avec une vue plus haute. Le cadre et les murs masquent la ville.

Les six états sont des variantes d'un même monde : ouverture, matin, milieu de journée, après-midi, fin de journée, fermeture. Pas six villes sans correspondance de bâtiments. Séparer la lampe et la lumière intérieure ; ne pas repeindre bureau, portraits et piles dans chaque extérieur. Ne charger qu'un petit nombre d'états adjacents. Le raccord temporel doit éviter de superposer deux horizons fantômes.

### Remontrance : un état propre avec continuité

Un portrait miniature n'est pas un master suffisant pour un gros plan occupant l'écran. Pour le pilote, produire un acteur à une définition de travail suffisante, puis ses dérivés petit/grand.

Séquence proposée : repos → dossier quitte la zone → manager se détache → buste/bras/main/dossier envahissent le centre → dossier rouge atterrit → reprise. Le dossier/ensemble spectaculaire vise environ 60 % de l'espace utile, à régler avec la zone de tirade. Neutraliser temporairement le tri selon la pénalité, mais garder Retour Core accessible. La variante reduced motion conserve l'information et la pénalité sans grand mouvement.

Bulles courtes : 2–3 mots, un seul locuteur. Tirades : textes vivants, longueur bornée, pas des phrases incrustées dans les sprites. Portrait, buste, costume, bras et texte partagent le même `actorId`. Le dossier garde `instanceId`, contenu et indices à son retour ; ne pas le remplacer par un faux document rouge sans relation. L'inscription nouvelle est `WRONG DEPARTMENT`, pas l'ancienne mention française du prototype.

### Documents : variété sans arbitraire

Le code comporte 20 modèles, quatre par service. Réutiliser ces familles avant d'en ajouter. La feuille `HOUSING APPLICATION` dessinée ne crée pas automatiquement un vingt-et-unième modèle.

Assembler gabarit + papier/couleur + logo + champs + marque/annotation + indices. Noms, références, montants, dates civiles, surfaces, clauses et titres sont anglais et vivants. Il faudra une police pixel identifiée/licenciée ou un atlas alphabétique complet : le jeu de chiffres de LineFugg n'est pas suffisant.

Chaque instance connaît son service correct indépendamment de l'apparence. Retirer des indices et ajouter des distracteurs contrôlés est possible, mais il faut toujours au moins un indice suffisant et visible. Pas d'indices autoritaires contradictoires ni de réponse uniquement cachée. Les variations de champs ne doivent pas changer la solution à l'insu du joueur.

Recette à venir : pour chaque service, cas simple et cas difficile résoluble ; textes longs ; document revenu identique ; champs proches mais discriminants ; pression élevée ; cohérence du compteur et de la queue. Aucune recette de génération de documents n'a été exécutée pendant l'audit graphique.

## Ordre de production et points de revue

1. **A — validation visuelle acquise :** audit initial puis correction compacte choisie par l'utilisateur. La source principale est figée. Vérifier son calage technique et les dégagements Core avant les exports ; ne pas refaire valider l'ancien montage.
2. **B — à produire depuis cette source :** niveaux 1 et 5 dans la même géométrie, deux instants lumineux contrastés et un événement de remontrance. Ces extrêmes éprouvent les promesses absentes de la source avant de produire les intermédiaires.
3. **C — mini-tranche :** un bureau, une ville, un acteur, cinq tampons, cinq familles de feuilles, une erreur/retour, une variation de pile et une promotion. Phaser et Core réels, pas seulement un collage.
4. **D — déclinaison :** grades 2–4, six moments, casting et vingt modèles, petits lots avec mêmes échelles/pivots.
5. **E — recette :** grade × moment × pression, documents et erreurs, entrée/fin/score quotidien/retour/rejouer, tactile/clavier, reduced motion, mémoire/nettoyage. Brave court reste un cas dégradé distinct de la fenêtre garantie.

À chaque jalon : ce qui est produit, contrôlé, encore ouvert et l'expérience suivante. L'utilisateur fait un retour naturel ; l'agent entretient le suivi. Après deux corrections ratées du même défaut, diagnostiquer et changer de méthode.

## Enseignements observés

Une bonne source à plus de 2× ne garantit pas un bon cadrage. L'écart de ratio de 0,28 unité est mineur ; la hauteur occupée par les informations est le vrai sujet. Les valeurs peintes d'un concept ne doivent pas devenir des règles.

Le premier montage local faisait passer le métronome devant le compteur : l'examen visuel l'a détecté, un test d'intersection a été ajouté et la position corrigée. « Dans la zone » n'est pas synonyme de « lisible ».

La correction retenue par l'utilisateur a ciblé les portraits/enseignes trop hauts puis remonté les éléments inférieurs. Une révision locale de composition peut préserver l'identité validée sans relancer toute la recherche. Le résultat visuel a été accepté ; le gain géométrique exact sur cette nouvelle source reste à mesurer.

Un jeu riche demande des contrats de variantes et des états événementiels en plus du détourage du master. Cette passe ne mesure encore ni taux de réussite des découpes ni gain de durée d'intégration.

## Archive et reprise

**Source principale actuelle :** Drive privé `1Msvmzf6bU5Zw3TaV8thCrpzOIFWdcLi8`, dossier `1UGgUw1SPKimiTxQNhBy9uUxcelafpxRH`, nom et empreinte en tête du document. Upload puis contrôle aller-retour réussi. Les anciennes références ne sont pas effacées.

**Archive historique du premier audit :** `MiniFugg - Graphic Archive/Games/crazy-papers/Gameplay Translation Review - T03/crazy-papers-t03-review.zip`, Drive file `17PY_6aMUfEfvAVwQ-3iZpS359vSZsXAR`, dossier `1KDXvfbcsc4ksMe1NP_YTEvfIprQijqY0`.
Taille locale : 6 086 375 octets ; SHA-256 local `087d4d17f4521429058c3cd9346319bba2dc840833b9336d6d0478c528e56709`. Upload confirmé ; ne pas prétendre avoir obtenu un checksum distant pour cette ancienne archive.

Contenu historique : master original, `audit.py`, `audit.json`, `checks.json`, référence annotée, comparaison master/center/top, calage proposé, développement détaillé de ce plan et index des fichiers. Pas de police incluse. Reproduction : `python audit.py master-original.png preuves` avec Pillow. Copies réduites/annotées et montage sont des dérivés de revue, jamais des textures runtime. Les mesures de cette archive ne sont pas celles du nouveau PNG.

Le Production Lab a déjà un plan CrazyPapers mais ses images et nouveaux axes de carrière restent à synchroniser avec la nouvelle source. **Le rendu du Lab n'est pas modifié dans cette passe.** Le complément de plan est enregistré ici ; le rattachement des images et nœuds doit accompagner la préparation visuelle suivante, sans refonte de l'éditeur. Les copies d'étude restent hors sync runtime.

Le runtime lu lors de l'audit demeure en migration verrouillée, version 0.5.3 d'après `definition.ts`. Cet enregistrement artistique ne lève pas le verrou et ne publie pas de nouvelle version. Le test inter-modèles demeure non exécuté.
