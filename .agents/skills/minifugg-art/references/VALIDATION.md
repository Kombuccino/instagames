# Validation de minifugg-art

Suivi du skill, pas une nouvelle autorité artistique. Mis à jour le 18 septembre 2026. Base de la validation initiale : `1c84696421a4c455a908a4e51a74c75fff0377ab`.

## État actuel — T02, raffinement et banc des composants

Base Git : `76e58a632b28acb911003d1ce1e329ad96b6cfaa`. **Pack et assemblage interactif de recette réalisés ; intégration complète au jeu Phaser publié non réalisée.** Aucune nouvelle DA canonique, aucune modification du jeu, du registre, des règles ou du Production Lab. L'acceptation artistique de T02 reste à recueillir.

### Décisions utilisateur qui remplacent l'interprétation trop stricte de T01

Le 18 septembre, l'utilisateur considère T01 comme une première séparation très satisfaisante à raffiner. Le fond peu informatif peut être un aplat proche ; son absence dans une superposition transparente n'invalide pas cette séparation. La conservation de la matière et de l'échelle relative importe davantage que l'alignement de calques plein cadre à (0,0). Les objets de production doivent être recadrés au plus près avec leurs coordonnées source, taille et pivot. Les variantes d'un même contrôle gardent toutefois un cadre commun pour éviter les sauts entre états.

Les nombres variables sont séparés. Le test emploie `0–9`, `+`, `×`, `÷`, `=`, sans signe moins. Un point décimal raster est ajouté pour afficher les résultats non entiers de divisions. Les cellules composent un nombre ou un préfixe `×n` / `÷n` ; ne pas générer chaque combinaison comme une image différente. Cette portée expérimentale ne supprime pas les valeurs négatives d'un jeu existant.

Le parcours normal est **exploration de cinq ou six DA → choix/retouches → gel du fichier approuvé → compréhension → décomposition → raffinement → intégration**. T01 a produit sa DA et ses premières couches dans le même échange : ce n'est pas une preuve de fonctionnement avec une DA externe, ni dans deux contextes indépendants. Finir ce pilote avant l'essai demandé sur une DA validée de Crazy Papers, dont le master exact sera à retrouver. Ne pas lancer ce second jeu en parallèle.

### Livrables et contrôles réalisés

- **47 PNG RGBA** : plateau vide, quatre groupes décoratifs, échantillon papier optionnel, 15 glyphes, registre vide, trois rangées réutilisables, total vide et libellé raster, huit états de boutons, six états de pastilles, six morceaux de tracés. Crops, transformations, pivots et SHA-256 figurent dans le manifeste. Les huit sources T01 sont conservées octet pour octet.
- Chiffres 1–9 extraits du calque numérique T01, 0 extrait du résultat 20, + et = extraits du registre. ×, ÷ et le point sont **construits localement**, pas présentés comme des originaux récupérés. Couverture raster neutralisée en blanc pour teinte/taille variables. Aucune police du système n'est embarquée.
- Registre/total : retrait masqué des valeurs, signes et disques puis réparation locale par inpainting. Les grandes surfaces illustrées restent issues de T01. Des zones légèrement lissées demeurent à examiner à taille native ; les pixels cachés ne sont pas prétendument récupérés à l'identique.
- Undo/Validate : `off/on/hover/pressed`, dérivés par teinte/contraste/luminance du même sprite, sans changement d'ancrage. Trois pastilles : `off/on`. Tracés : nœud et segment par couleur, rotation/extension longitudinale ; opacité appliquée au groupe dans le banc. Raccords fins et mouvement en Phaser restent à éprouver.
- Atlas **2048 × 1537**, PNG et WebP vérifié lossless, JSON de frames. Chaque frame PNG restitue exactement l'asset individuel ; les pixels visibles décodés du WebP et tous les alphas correspondent au PNG.
- **10 tests Python réussis**, avec sous-tests sur les fichiers : sources inchangées, PNG/RGBA/tailles, inventaire des glyphes, recoloration, géométrie/alpha des états, atlas réversible, WebP lossless.
- **38 vérifications Chromium réussies**, sans erreur JavaScript, fenêtres 390 et 1440 pixels : images chargées, formules/préfixes, résultats/décimales, désactivation, Undo, hover/pressed, relâchement extérieur sans activation, validation clavier/tactile émulée, reset et absence de débord horizontal. Le HTML local est rendu via `set_content` : ce n'est ni le site déployé, ni Safari, ni un téléphone physique.

Le fichier autonome `banc-composants.html` est un **banc HTML de recette des composants**, pas un nouveau moteur de jeu. Les sélecteurs montrent 0–3 lignes et une situation avec ×/÷ ; Undo retire une ligne et Validate agit uniquement à trois lignes. Calcul de gauche à droite : `8 ×2 +4 ÷2 = 10`, `3 ÷2 +7 ×3 = 25.5`, `9 +3 ×2 ÷3 = 8`, total `43.5`. Ni drag de grille, ni reroll, ni session/score Core, ni audio ne sont validés par ce banc.

Les captures natives sont **853 × 1844**, comme T01. À largeur 390 cela représente environ 843,10 unités de hauteur ; aucune conformité nouvelle au stage Core 390 × 850 / zone garantie 390 × 710 n'est revendiquée. Les positions du banc sont des ajustements mesurés de cette étude, pas une nouvelle géométrie canonique.

### Échecs enregistrés et changement de méthode

Deux demandes d'édition ciblée ont retourné des planches globales hors périmètre au lieu du seul registre vidé. Sorties rejetées : `a7f255f7-ce2b-4fd8-bc65-ce8ece126881` et `cb00adbe-7178-425e-bf9d-3d348c3f0b27`. Elles n'alimentent aucun asset du pack. Les métadonnées ne montrent pas un prompt interne exploitable ni la référence effectivement transmise : ne pas prétendre que le contexte était isolé. Après deux échecs, arrêt des relances ; raffinement déterministe des fichiers T01 par crops, masques, inpainting local, transformations et assemblage.

Une première réparation de disque trop claire a été corrigée. Le libellé TOTAL extrait comme masque blanc a reçu sa teinte sombre au rendu. Une capture native initiale avait un pixel de largeur supplémentaire à cause du centrage fractionnaire ; elle a été refaite à coordonnées entières. Les défauts observés ne sont pas masqués par une régénération générale.

Ce résultat est **assisté par scripts**, avec régions T01 choisies et contrôlées par l'agent. Il ne prouve pas qu'un prompt unique PSD-like suffit, ni que ces coordonnées sont transposables à une autre DA. Aucun appel payant fal/HF, aucune souscription ou nouvelle dépendance runtime dans le dépôt.

### Archive et reprise

Archive privée vérifiée présente dans `MiniFugg - Graphic Archive/Games/linefugg/layer-refinement-tests` : [minifugg-t02-composants.zip](https://drive.google.com/file/d/1PjuYZnrv6vq-mYP-P6VKJw8D0YsGTMta/view). Taille 26 542 390 octets, SHA-256 local `b0f2cfba5ce68a5681382cca79b2d398f66db9ed5841656037bf2ba9abdab30e`. L'archive contient sources, 47 PNG, atlas, manifeste/layout, HTML autonome, scripts de reconstruction, tests, captures et deux documents `docs/T02.md` et `docs/template-deux-phases.md`. Le transfert Drive et sa taille sont confirmés ; aucun checksum distant n'a été exposé par le connecteur. Ce dossier est hors de la synchronisation d'assets runtime Fugg. Les fichiers ne sont pas importés dans le jeu : seul ce journal est modifié dans GitHub.

Reproduire avec les dépendances d'atelier disponibles : `python build_assets.py`, `python build_atlas.py`, `python build_fixture.py`, `python tests/test_assets.py`, `python tests/test_fixture.py`, `python tests/capture_native.py`. Versions réellement employées et limites dans `proofs/environment.json`. L'HTML embarque ses images et ne fait aucune requête réseau. Les deux images génératives rejetées sont exclues du pack.

**Suite de T02 :** revue des composants raffinés, puis branchement et vérification dans le vrai runtime Phaser avant de dire que l'intégration est complète. **T03 ensuite :** repartir du master externe validé de Crazy Papers, dans un contexte neuf. Pas de boucle indéfinie, pas de refonte du Lab et pas de nouvel abonnement.

### Template autonome et portabilité — non encore éprouvée

Ce gabarit spécialise le micro-brief existant de DA_CORE ; l'agent le remplit, jamais l'utilisateur.

1. **Phase DA séparée :** une image indépendante par proposition, référence fonctionnelle, invariants/traitement, liste fermée des textes, original lossless à une résolution de travail au moins double. Mesurer les pixels réels. Attendre choix/retouches puis figer fichier et hash. Ne pas faire les calques dans cette exploration.
2. **Paquet d'entrée de décomposition :** fichier approuvé effectivement accessible, hash, géométrie, contenus dynamiques et inventaire avec identifiants/repères visuels, rectangles source, échelle, transparence et états. Une copie annotée est distincte de l'image propre. La sélection du Lab peut alimenter ces repères ; le Lab reste optionnel.
3. **Commande unitaire :** « Édition de [fichier joint et id], composant [repère]. Livrer uniquement [élément], conserver [silhouette/matière/échelle], retirer [contenu précis], reconstituer seulement [surface occultée nécessaire]. Textes autorisés : [liste ou aucun]. PNG RGBA, extérieur transparent. Aucun titre, légende, asset sheet, faux damier ni nouvelle DA. » Préférer un masque déterministe pour les pixels visibles ; le recadrage et l'ancrage sont contrôlés par l'agent. Un nom de fichier dans un texte ne prouve pas que l'image a été transmise.
4. **Raffinement :** glyphes et valeurs composables ; états d'un même contrôle dans un cadre/pivot commun ; composants de lignes avec opacité/raccords vérifiés ; fichiers recadrés et manifeste de géométrie. Distinguer extrait, reconstruit, transformé et nouvellement généré. Ne pas appeler une planche contenant du JSON un vrai manifeste.
5. **Recette :** assembler les vrais fichiers, exercer les valeurs et états, vérifier les critères visuels/techniques/fonctionnels séparément. Après deux corrections infructueuses, diagnostiquer et changer de méthode. Distinguer banc de composants et jeu intégré.

**Aucun autre modèle de conversation n'a été testé.** La documentation [OpenAI Image generation](https://developers.openai.com/api/docs/guides/image-generation), consultée le 18 septembre 2026, distingue modèle de conversation et modèle image et décrit la révision du prompt par le premier. Cela ne garantit ni le modèle image utilisé dans cette interface, ni une qualité identique entre versions de ChatGPT. Fixer source/hash, périmètre, critères et fournisseur/version image quand contrôlable ; refaire le même paquet dans des contextes neufs et avec d'autres modèles de conversation. Enregistrer paramètres réellement exposés, essais, corrections et temps humain. Ne pas revendiquer trois prompts prêts à intégrer ni un gain de durée avant cette mesure.

## Historique — T01, DA et calques générés dans ChatGPT

Base Git inspectée pour cet audit : `main` à `8d1989fb79716c49032b3231bbb9e4b3414ab5a6`. L'utilisateur demande une expérience de méthode indépendante de la conformité stricte au game design : une nouvelle DA de résolution au moins double, puis des PNG transparents dont la superposition restitue cette DA. Pas de fichier PSD obligatoire, pas de nouvelle souscription, pas de refonte du Lab. Le retour « pas totalement parfait, mais pas mal » invite à analyser ; ce n'est pas une acceptation finale.

**Bilan de l'audit initial : production de grandes familles reconnaissables et de vrais fichiers RGBA réussie ; superposition brute non fidèle.** La portée de cette conclusion a été corrigée par l'utilisateur : voir décisions T02 ci-dessus. Ne pas promouvoir les sorties T01 en nouvelle DA canonique. La génération précédente a livré un master et sept calques distincts ; cette passe a inspecté ces huit fichiers et les a réellement superposés, sans nouvelle génération.

### Fichiers et méthode réellement contrôlés

Tous les fichiers reçus mesurent **853 × 1844 pixels**. Le master est un PNG RGB opaque de 2 130 954 octets ; les sept couches sont des PNG RGBA avec un vrai canal alpha, pas un damier peint. Cette définition dépasse le double du stage logique 390 × 850, mais n'est pas une preuve de ratio exact, de fidélité artistique ni d'absence d'une dégradation antérieure des pixels. Les originaux sont conservés sans redimensionnement ni retouche.

Superposition native à (0,0) avec `Pillow.Image.alpha_composite`, sans déplacement, recalage, correction de couleur ou d'opacité. Ordre du fond au premier plan : décor, plateau, tracés, chiffres, registre, total, commandes. Les fonds blanc/noir/damier sont uniquement des diagnostics, jamais des calques de production.

| Source de conversation | Rôle | SHA-256 |
| --- | --- | --- |
| `grille_de_nombres_aux_chemins_colorés.png` | Master T01 | `68ed97869b22e806953b9bc465deaf18b3cbcb344303c7fd9d149e767ce17da0` |
| `cadre_de_papeterie_vintage_aux_feuillages.png` | Décor, papier de fond manquant | `20b437c97b8b922959d358fefd9b79ef8dd6ce099d4fc949d5316c5c79deab9d` |
| `plateau_en_bois_avec_grille_7_7.png` | Plateau sans chiffres/tracés | `0719607348cb94a6714d36c66360b0803b463127bc8894157ad41141858f3ceb` |
| `grille_de_chiffres_flottants_en_transparence.png` | Chiffres | `e186dd01cea7da1f806bfd04821649299fe679ec5d246034c4e6b2570305b929` |
| `chemins_colorés_translucides_sur_fond_transparent.png` | Trois tracés | `fe8ecc2768621a814277b7e6fe671696a1f4e5e0f39b7f87960687f6175eaf85` |
| `panneau_de_résultats_en_parchemin.png` | Registre et valeurs | `913399016a36319f1049d7e5521f6736a8ef6255dfaa763d9b369219808d98e4` |
| `plaque_total_65_aux_feuillages_délicats.png` | Total et feuillage | `ce2a0751760c4bfcb7cb9ce9cee515a3a8cd2ea5f05d45f6ce49ccf31cd45b19` |
| `commandes_de_jeu_vintage_sur_fond_transparent.png` | Deux boutons et trois indicateurs | `a58e7ca609b7fbb1e275cff8c213db57b38d997afe230cf93149babfdb9002ce` |

### Résultats observés

- Les familles sont visuellement reconnues ; les boutons gardent une matière illustrée convaincante. Le plateau existe sans nombres ni tracésés. Contrôles examinés aussi sur blanc et noir : découpes et ombres réelles.
- **34,5852 % de la recomposition reste entièrement transparent.** Le fond papier complet n'a pas été produit : le calque dit de fond ne contient que les décors de coins.
- Géométrie non conservée : chiffres descendus, registre remonté sur la grille, total remonté sur le registre. Exemple mesuré par seuillage dans une zone ciblée, sans OCR : boîte du premier 8 environ (93,245)–(122,289) dans le master, contre (91,298)–(126,350) dans son calque. La taille change aussi légèrement ; ce n'est pas uniquement une translation.
- Des différences de dessin et de teinte demeurent ; les chiffres sélectionnés perdent notamment les couleurs du master. Les aplats quasi opaques sont souvent à alpha 253/255 ; ce défaut léger est distinct de la semi-transparence intentionnelle plus forte des tracés. Des pixels alpha très faibles éloignés des objets rendent insuffisant un simple bounding-box alpha > 0.
- Le registre, le total et les commandes gardent des textes/valeurs intégrés et plusieurs objets partagent un calque. Ces regroupements étaient demandés dans les prompts de l'essai : ils ne constituent pas à eux seuls un échec du test de recomposition, mais ne sont pas des composants runtime terminés. États interactifs et typographie dynamique ne sont pas testés dans T01.

Preuves jointes à la conversation : comparaison native original/recomposition, recomposition RGBA brute, contrôles sur blanc/noir, JSON de mesures, script reproductible et huit originaux dans `MiniFugg-T01-calques-analyse.zip` (SHA-256 `8f9576d8a2ec4acea375fd9f85b92eaba3a7912f34aad1ff182face4bd51db79`). **À cette étape, les images et l'archive n'étaient pas importées dans GitHub/Drive ni dans le jeu ; seuls ce compte rendu et les identifiants/empreintes étaient publiés dans le dépôt.** Aucun build/runtime testé pour cet audit documentaire et graphique. Ne pas convertir cette analyse en statut Release du Lab. Les sources T01 sont maintenant aussi conservées dans l'archive T02.

### Diagnostic et proposition historique

Le brief demandait de « recréer » chaque famille tout en conservant exactement son alignement. Le résultat suggère une reconstruction visuelle, pas une extraction contrainte. L'agent a aussi mélangé fond papier et décor dans une demande de calque transparent, au lieu de réserver explicitement un fond complet opaque. La formulation explique une partie des erreurs ; ce test unique ne prouve pas qu'un prompt seul peut garantir les pixels/coordonnées.

**Proposition initiale de T02, remplacée par la portée autorisée ci-dessus : un seul Validate sur le master T01 inchangé.** Référence + sélection/masque visuel + coordonnées mesurées ; tester une extraction par masque de silhouette qui conserve les pixels existants plutôt qu'une régénération libre du bouton. Le fond occulté est reconstruit séparément. Export et placement dans la toile d'origine sont déterministes. Vérifier recomposition et contours avant extension. Masques, bords antialiasés et couleurs déjà mélangées au fond peuvent eux-mêmes demander une correction ; les éléments semi-transparents devront être traités séparément. Aucun succès promis avant mesure.

Le Lab reste optionnel : sa sélection doit pouvoir devenir un repère/masque et une référence de fichier réellement transmis, pas seulement le nom d'un élément dans un long texte. Une passe ciblée puis bilan ; pas sept régénérations simultanées. Non éprouvés à ce stade : répétabilité sur plusieurs DA, décomposition plus fine, états de boutons, intégration moteur et temps jusqu'à acceptation. Aucun gain « deux heures au lieu de plusieurs jours » n'est encore établi.

## Historique — accès à Qwen-Image-Layered, avant T01

Base de reprise inspectée : `main` à `d710a97267d64b9b0ccaa4eb73155b1e2d8b2f2f`. L'utilisateur demande de mettre en place les outils existants et d'essayer la décomposition, sans développer davantage le Lab ni lui imposer un formulaire.

- **État lors de cet essai : fal est connecté ; l'essai est bloqué par le crédit du compte, pas par l'installation.** Le catalogue et le schéma de `fal-ai/qwen-image-layered` ont été lus via le connecteur. Il accepte une image URL, 1 à 10 calques, une description facultative de l'image et des sorties PNG. Le catalogue de prix consulté retourne `0.05 USD / images` ; ne pas en déduire un coût total par décomposition sans confirmer le décompte des sorties.
- L'unique tentative `upload_file` depuis l'URL de la référence GitHub a été refusée à l'étape d'initialisation : HTTP 403, `balance_exhausted`. Aucun transfert réussi et aucune requête d'inférence soumise. Le service demande de créditer le compte fal connecté dans Dashboard → Billing. Aucun achat, changement de compte ou nouvel essai automatique effectué ; ne pas demander de clé secrète dans le chat.
- Autre route examinée lors de la passe précédente : démonstration officielle Qwen sur Hugging Face. Les appels réseau depuis le conteneur échouent à la résolution DNS ; l'accès à la configuration/API de la Space n'a pas abouti via les outils disponibles. Cela ne prouve pas que la Space est en panne. Aucun GPU CUDA ni variable `FAL_KEY`/`HF_TOKEN` utilisable n'avait été trouvé dans ce conteneur.
- Référence du pilote retrouvée dans `src/games/linefugg/ART_DIRECTION.md` : DA Rebirth registre éditorial/papier tactile. Les deux fichiers `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp` et `linefugg-rebirth-editorial-paper-lab-390x850-r2.webp` partageaient à l'inspection précédente le blob `7f0171395341bed5e3c2db0dae9988b6c227294d`. Les tentatives de récupération des pixels dans cette reprise n'ont pas abouti ; leur encodage n'a pas été vérifié. Retrouver/ouvrir le master approuvé lossless avant une production finale, ne pas promouvoir une preview en source finale. Le refus fal à l'initialisation ne prouve pas que son serveur a pu lire l'URL GitHub.
- **Résultat réel de cette passe d'accès : connexion et modèle confirmés, transfert bloqué ; zéro décomposition, zéro calque généré, aucun SDK ou adaptateur ajouté, aucune intégration ni comparaison visuelle effectuée.** Aucun coût d'inférence engagé.
- Reprise éventuelle après crédit du compte, uniquement sur nouvelle décision utilisateur : récupérer et ouvrir la référence exacte, vérifier son accessibilité au fournisseur, lancer un petit essai PNG, sauvegarder les calques RGBA, contrôler alpha/géométrie et recomposer pour comparaison. Les pertes et regroupements incorrects doivent être examinés avant toute modification du jeu. Ne pas annoncer de gain de temps ni de fidélité sans cet essai. Pas de tâche de fond ni de notification ultérieure programmée. Depuis T01, la priorité est l'essai direct dans ChatGPT ci-dessus, pas un nouvel achat.

Sources : [Qwen officiel](https://huggingface.co/Qwen/Qwen-Image-Layered), [Space officielle](https://huggingface.co/spaces/Qwen/Qwen-Image-Layered), [API fal](https://fal.ai/models/fal-ai/qwen-image-layered/api). Canva reste une alternative non installée et non testée ; ne pas demander plusieurs connexions avant d'avoir évalué le premier candidat.

## Périmètre autorisé

L'utilisateur a validé la reprise des consignes, du skill graphique, des contrôles, des essais et des traces de résultat. Le bilan hebdomadaire est **reporté** : aucun skill de revue, tâche récurrente ou changement de paramètres de compte n'est inclus. Le lieu éventuel de cette future revue sera rediscuté ; ne pas supposer les accès d'un autre environnement.

Aucune DA, image canonique, règle de jeu, version produit ou interface runtime n'est remplacée par cette passe documentaire/outillage. Les modifications de consignes restent ciblées : covers statiques, frontière Welcome, sources propres vs annotations et transport local/Drive.

## Contrôles exécutés avant T01

| Contrôle | Résultat observé | Limite |
| --- | --- | --- |
| Bases des documents modifiés | Empreintes Git des sources reconstruites contrôlées contre les blobs lus sur GitHub | Lecture ciblée, pas audit exhaustif de tout le dépôt ou de toutes les conversations |
| Outillage Python | 18 tests `unittest` réussis localement, Python 3.13.5 / Pillow 12.3.0 | Ne teste pas le chargement natif dans Codex ni un générateur |
| Export de comparaison | Tests de pixels RGBA exacts, alpha extérieur, coordonnées, absence de labels, sources inchangées et refus d'écrasement | Comparaison technique, pas choix artistique |
| Tests négatifs | Faux PNG/JPEG, absence d'alpha, fichier vide/corrompu/animé, mauvaise taille, marges/budget, profils ICC incompatibles et sorties conflictuelles refusés | Aucun OCR ni classifieur de style |
| Fichiers historiques de cette discussion | Trois inspections réelles, détails ci-dessous | Pas des contrôles du build actuellement déployé |

Commande reproductible depuis la racine du dépôt :

```sh
python3 -m unittest discover -s .agents/skills/minifugg-art/scripts -p 'test_*.py' -v
```

Premier essai local du script : l'ordre de lecture EXIF/validation PNG causait une erreur ; corrigé en vérifiant avant la seconde ouverture et le décodage. Les 18 tests ont ensuite réussi. Cet incident d'outillage ne compte pas comme une reprise de génération graphique.

### Mesures de fichiers historiques accessibles

Ces fichiers proviennent des pièces de la conversation. Leur présence n'accorde aucune nouvelle validation artistique ; aucun n'a été modifié.

| Fichier | Mesure | Résultat du contrôle choisi |
| --- | --- | --- |
| `v2-micro-euro.png` | PNG opaque, 941 × 1672 | Refusé **comme nouveau master 390 × 844**, pas rejet de l'illustration historique |
| `logo_rétro_tetramindfck_sur_fond_transparent.png` | PNG, 941 × 1672 ; 1 191 356 pixels totalement transparents ; 381 046 partiels ; 950 opaques | Alpha réellement présent ; bords, texte et aptitude runtime restent à examiner visuellement |
| `UI Overlay sur jaquette.png` | PNG opaque, 1448 × 1086 | Format PNG conforme comme planche historique ; ce n'est ni un asset isolé transparent ni un écran runtime validé |

## Routage : scénarios de recette

Scénarios à utiliser dans l'environnement qui charge le skill. Ils fixent les sorties attendues ; leur présence ne prouve pas qu'un hôte a invoqué le skill. **Déclenchement natif Codex/ChatGPT non testé ici.**

| Demande | Route et résultat attendus |
| --- | --- |
| « Fais les jaquettes de ce jeu » | Cover ; lire registre/références ; images statiques indépendantes ; titre seul sauf autre texte expressément autorisé |
| « Cherche quatre styles pour la refonte de ce jeu » | Game ; capture réelle, géométrie constante, quatre écritures visibles, pas quatre simples recolorations |
| « Isole ce personnage pour l'animer » | Game/asset ; image cible accessible, alpha réel, pivots/occultations ; aucune génération si la cible manque |
| « Corrige seulement les yeux de Fuggy dans le Welcome » | Welcome/édition ; image et identité exactes ; ne pas changer wagon, téléphone ou logo |
| « Décline ce composant UI actif/inactif » | UI ; primitive et référence actuelles, deux états cohérents, textes fonctionnels listés, aucun habillage de board |
| « Montre comment cette DA devient du gameplay » | Game/planche technique ; vignettes propres + annotations séparées ; pas d'intégration complète avant validation |
| « Où en est cette cover ? » | Lecture du suivi ; pas de génération ni de modification de la DA |
| « Quelle différence entre un MD et un skill ? » | Explication ; pas de pipeline de production déclenché |
| « Corrige une collision du jeu » | Code/moteur ; pas de génération graphique automatique |
| « Programme un bilan hebdomadaire » | Hors de ce skill et hors du périmètre actuel ; ne rien planifier au titre de minifugg-art |

## Pilotes graphiques restant à éprouver

T01 est un essai réel de génération/décomposition et T02 une préparation/recette des composants ; aucun ne vaut validation du jeu intégré. Les propositions suivantes restent non exécutées dans ce suivi. Aucun gain de qualité artistique, de temps d'intégration ou de taux d'acceptation n'est revendiqué à partir des seuls tests techniques. Utiliser le dernier `main` et les références réellement ouvertes au moment de l'essai.

1. **Cover :** choisir un jeu réel et préparer un petit comparatif d'écritures distinctes, hors de son catalogue publié. Une image par appel, texte exact listé, PNG statique, règles de cadrage ; assembler sans décor de présentation. Ne pas régénérer/remplacer ses masters déjà approuvés.
2. **Asset gameplay :** choisir un élément d'une DA validée, retrouver le master exact, produire ou extraire proprement l'élément et tester alpha/ancrage/états dans une mini-tranche sans changer le gameplay. Une boîte englobante automatique ne vaut pas détourage sémantique.
3. **UI :** choisir un composant déjà validé, réutiliser ses primitives et référence actuelles, produire seulement les états utiles. L'interface complète/étendue dépend du contrat actuel ; ne pas reprendre une vieille planche au nom ressemblant.

Pour chaque essai, remplir la trace de `docs/DA_CORE.md` dans le suivi concerné : sources, brief et paramètres accessibles, sorties, nombre d'essais connu, textes parasites observés, contrôle technique, examen visuel, coût de préparation effectivement mesuré et retour utilisateur. Les résultats du pilote permettront une correction ciblée du skill, pas la création de quatre procédures concurrentes.

## Critère de clôture

Le lot outillage est vérifiable par ses tests. Le pilote ne sera terminé qu'après production réelle, inspection des fichiers, usage représentatif et retour utilisateur sur les propositions. La découverte native du skill devra être vérifiée dans Codex. Le bilan hebdomadaire reste reporté, indépendamment de cette clôture.
