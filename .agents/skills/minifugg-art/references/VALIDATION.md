# Validation de minifugg-art

Suivi du skill et des essais, pas une nouvelle autorité artistique. Mis à jour le 18 septembre 2026. Les procédures restent dans `SKILL.md` et `docs/DA_*.md`.

## État courant — T02 intégré dans Rebirth

Le pack T02 a été accepté par l'utilisateur pour intégration, avec des réserves mineures sur les alignements et la taille des nombres. L'intégration est maintenant réalisée dans le **vrai runtime Phaser de LineFugg Rebirth**, séparé du classique. Aucun fichier `src/games/linefugg/` n'est modifié, aucun remplacement de son art ni de sa version publique.

Suivi détaillé, limites, tests et accès : [LineFugg Rebirth — GAME_STATUS](../../../../src/games/linefugg-rebirth/GAME_STATUS.md). Sources et empreintes des atlas : [ASSET_MANIFEST](../../../../src/games/linefugg-rebirth/ASSET_MANIFEST.md). Accès de test : `/?usr=moigod&lab=gameplay-runtime&game=linefugg-rebirth` ; ancien alias `game=linefugg&skin=rebirth-editorial` conservé dans ce Lab.

La CI [35346965448](https://github.com/Kombuccino/instagames/actions/runs/35346965448) a réussi sur six configurations Chromium, avec compilation complète, sept tests de règles et vérification des fichiers classiques inchangés. Les rapports/captures du vrai jeu vérifient aussi les pixels des tracés, pas seulement les valeurs internes. La dernière correction de visibilité du bouton Recommencer est suivie dans la CI [35347552664](https://github.com/Kombuccino/instagames/actions/runs/35347552664). Sa réussite et la présence du commit sur main doivent être vérifiées avant de déclarer la publication. Le déploiement et l'acceptation humaine du jeu intégré restent des vérifications distinctes.

**Ce que ce pilote établit :** des calques T01 ont pu devenir un pack de composants T02, puis des interactions dans Phaser. **Ce qu'il n'établit pas :** une réussite avec une DA créée ailleurs, un prompt unique suffisant, une qualité identique avec un autre modèle de conversation, un temps de production garanti ou une validation sur appareil physique. Pas de nouvelle génération ni de dépense fal/HF pendant l'intégration.

## Décisions acquises

- Le Lab est optionnel, utilisé pour une communication visuelle difficile, pas comme formulaire à remplir. L'agent interprète les retours oraux, diagnostique, vérifie et tient un état courant des problèmes ; une digression ne clôt pas un problème.
- Les objets recadrés doivent conserver matière, échelle relative, coordonnées source et pivots. Le vide transparent plein cadre n'est pas un format runtime obligatoire. Les états d'un même contrôle gardent un cadre commun.
- Le fond quasi uni de T01 peut être un aplat proche. Son absence dans la superposition brute n'invalide pas la bonne séparation des familles. Les fonds complexes restent à éprouver séparément.
- Le test utilise les glyphes raster `0–9`, `+`, `×`, `÷`, `=`, avec un point décimal, sans moins. Les préfixes `×n`/`÷n` sont composés par le moteur ; pas une image par combinaison. Cette portée Rebirth ne supprime pas les valeurs négatives du classique.
- Parcours normal : **cinq ou six DA indépendantes → choix/retouches → gel du fichier approuvé → compréhension → décomposition → raffinement → intégration**. La DA ne doit pas être créée en même temps que ses calques pour prétendre avoir validé l'indépendance de ces étapes.
- Finir ce pilote, puis retrouver le master exact de la DA externe validée de Crazy Papers et recommencer dans un contexte neuf. Ne pas ouvrir ce second jeu en parallèle.
- Aucun bilan hebdomadaire ni nouvelle récurrence n'est autorisé dans ce lot ; la décision du 11 septembre reste acquise. Aucun abonnement ou achat supplémentaire n'est déclenché.

## Protocole autonome à transmettre à un autre modèle — non encore éprouvé

Ce gabarit spécialise le micro-brief existant de DA_CORE ; l'agent le remplit, jamais l'utilisateur.

1. **DA séparée.** Une image indépendante par proposition ; référence fonctionnelle, invariants, traitement et liste fermée des textes. Original lossless à une résolution de travail au moins double du stage logique. Mesurer les pixels réels, ne pas se fier au nom de fichier. Attendre choix/retouches, figer fichier et hash. Pas de calques dans cette exploration.
2. **Entrée de décomposition.** Fichier approuvé réellement accessible, hash, géométrie, contenus dynamiques, inventaire avec identifiants et repères visuels, rectangles source, échelle, alpha et états. La copie annotée reste distincte de l'image propre. Le Lab peut fournir ces repères ; il n'est pas obligatoire.
3. **Commande unitaire.** « Édition de [fichier joint et id], composant [repère]. Livrer uniquement [élément], conserver [silhouette/matière/échelle], retirer [contenu précis], reconstituer seulement [surface occultée nécessaire]. Textes autorisés : [liste ou aucun]. PNG RGBA, extérieur transparent. Aucun titre, légende, asset sheet, faux damier ni nouvelle DA. » Préférer un masque déterministe pour les pixels visibles ; recadrage et ancrage contrôlés par l'agent. Mentionner un nom dans du texte ne prouve pas la transmission de l'image.
4. **Raffinement.** Glyphes/valeurs composables ; états dans un cadre/pivot commun ; morceaux de lignes et raccords contrôlés ; crops et manifeste de géométrie. Distinguer extrait, reconstruit, transformé et généré. Une image montrant du JSON n'est pas un manifeste.
5. **Recette.** Assembler les vrais fichiers, exercer les valeurs et états, vérifier art/fichiers/usage séparément. Après deux corrections infructueuses, diagnostiquer puis changer de méthode. Distinguer banc HTML et jeu intégré. Un build vert ne prouve pas que le tracé est visible ; une capture doit correspondre à un état réellement joué.

Pour comparer les modèles de conversation : même paquet source figé, mêmes critères, contexte neuf, même outil/version image quand contrôlable ; noter les paramètres effectivement exposés, essais, reprises et temps humain. La documentation [OpenAI Image generation](https://developers.openai.com/api/docs/guides/image-generation), consultée lors de T02, distingue modèle de conversation et modèle image ; elle ne prouve pas lequel a servi dans cette interface ni une qualité identique entre versions. Aucun test entre modèles n'a encore eu lieu.

## T02 — raffinement et banc de composants, résultats conservés

Base : `76e58a632b28acb911003d1ce1e329ad96b6cfaa`. Réalisation antérieure à l'intégration décrite plus haut. Le compte rendu historique complet est conservé [dans Git au commit 86c145a](https://github.com/Kombuccino/instagames/blob/86c145a34c86a66c6e81dfd1146bed2eb9e5ef21/.agents/skills/minifugg-art/references/VALIDATION.md) et dans l'archive ci-dessous ; cette synthèse remplace les anciens « non intégré » périmés en tête du journal.

- **47 PNG RGBA** : plateau, quatre groupes décoratifs, échantillon papier, 15 glyphes, registre vide, trois rangées, total vide et libellé, huit états de boutons, six états de pastilles et six morceaux de tracés. Crops, transformations, pivots et empreintes dans le manifeste ; huit sources T01 conservées octet pour octet.
- 1–9 extraits du calque numérique, 0 du résultat 20, +/= du registre. ×, ÷ et point construits localement, pas prétendument extraits. Alpha des glyphes neutralisé en blanc pour teinte/taille variables ; aucune police système embarquée.
- Valeurs, signes et disques retirés par masque puis réparation locale du registre/total. Matière illustrée préservée ; des zones lissées demeurent à examiner. Les pixels cachés ont été reconstruits, pas récupérés à l'identique.
- Boutons off/on/hover/pressed dérivés du même sprite par teinte/contraste/luminance ; pastilles off/on. Tracés nœud + segment par couleur avec rotation et extension longitudinale.
- Atlas **2048 × 1537** PNG et WebP vérifié lossless ; chaque frame PNG restitue son asset ; pixels visibles et alpha du WebP identiques au PNG.
- **10 tests Python** et **38 vérifications Chromium** réussis dans le banc HTML aux fenêtres 390 et 1440. Il ne testait ni le vrai drag Phaser, ni le renouvellement, ni le Core. Ces vérifications sont maintenant complétées, pas remplacées, par les tests Rebirth.
- Cas arithmétique du banc : `8×2+4÷2 = 10`, `3÷2+7×3 = 25.5`, `9+3×2÷3 = 8`, total `43.5`. Calcul de gauche à droite.
- Captures natives 853 × 1844, soit environ 843,10 unités haut à largeur 390. L'essai de composants ne revendiquait pas une conformité exacte au nouveau stage 390 × 850.

**Échecs et corrections T02 :** deux éditions ciblées ont produit des planches globales hors périmètre : `a7f255f7-ce2b-4fd8-bc65-ce8ece126881` et `cb00adbe-7178-425e-bf9d-3d348c3f0b27`. Rejetées, exclues des assets ; pas de preuve du prompt interne ni des références réellement transmises. Après deux échecs, arrêt des relances et raffinement des sources T01 par crops, masques, inpainting et transformations. Une réparation de disque trop claire a été corrigée ; le TOTAL blanc a reçu sa teinte au rendu ; une capture avec un pixel de largeur en trop dû au centrage fractionnaire a été refaite. **Résultat assisté par scripts et sélections de l'agent, pas preuve d'un prompt PSD-like universel.**

Archive privée : `MiniFugg - Graphic Archive/Games/linefugg/layer-refinement-tests`, [minifugg-t02-composants.zip](https://drive.google.com/file/d/1PjuYZnrv6vq-mYP-P6VKJw8D0YsGTMta/view), 26 542 390 octets ; SHA-256 local `b0f2cfba5ce68a5681382cca79b2d398f66db9ed5841656037bf2ba9abdab30e`. Transfert et taille vérifiés, pas de checksum distant exposé. Sources, 47 PNG, atlas, manifeste/layout, HTML, scripts, tests, captures, `docs/T02.md`, `docs/template-deux-phases.md`. Le dossier archive reste hors sync runtime ; les seuls atlas ont ensuite été importés sous `public/assets/imported/linefugg/rebirth/` pour cette intégration.

Reproduction du pack : `python build_assets.py`, `python build_atlas.py`, `python build_fixture.py`, `python tests/test_assets.py`, `python tests/test_fixture.py`, `python tests/capture_native.py`. Dépendances d'atelier et limites dans `proofs/environment.json`. L'HTML autonome ne fait aucune requête réseau.

## T01 — première séparation, interprétation corrigée

Master et sept couches : **853 × 1844** ; master PNG RGB opaque 2 130 954 octets, couches PNG RGBA. Cette résolution dépasse le double du stage logique ; elle ne garantit ni ratio exact ni fidélité des pixels. Master `grille_de_nombres_aux_chemins_colorés.png`, SHA-256 `68ed97869b22e806953b9bc465deaf18b3cbcb344303c7fd9d149e767ce17da0`.

L'audit brut a superposé à (0,0), sans correction : décor, plateau, tracés, chiffres, registre, total, commandes. Il a trouvé 34,5852 % de transparence, un papier de fond absent, des chiffres déplacés/redimensionnés, registre et total remontés, des variations de teinte, alpha souvent 253/255 et des pixels alpha faibles éloignés des objets. Le premier 8 était environ (93,245)–(122,289) dans le master contre (91,298)–(126,350) dans la couche. Les familles étaient néanmoins reconnues et les boutons gardaient leur matière illustrée.

**Correction utilisateur :** cette séparation est très satisfaisante comme base ; le fond simple n'est pas bloquant, l'alignement plein cadre n'est pas le principal critère, et les groupes doivent être raffinés en composants recadrés. Ne pas répéter l'ancien jugement « échec » sans cette nuance. Textes/valeurs étaient alors demandés dans les groupes ; leur présence ne prouvait pas un échec du prompt, mais nécessitait T02.

Archive `MiniFugg-T01-calques-analyse.zip`, SHA-256 `8f9576d8a2ec4acea375fd9f85b92eaba3a7912f34aad1ff182face4bd51db79`. Les huit originaux et leur table d'empreintes sont aussi dans T02 et dans le journal historique lié ci-dessus. La proposition initiale « T02 sur un seul Validate » a été remplacée par le raffinement complet autorisé. Aucun original n'est supprimé ou remplacé par cette synthèse.

## Historique d'accès — Qwen-Image-Layered

fal connecté ; upload refusé avec HTTP 403 `balance_exhausted` avant inférence. Le schéma `fal-ai/qwen-image-layered` acceptait URL image, 1–10 calques, description facultative, PNG. Prix alors affiché `0.05 USD / images`, pas un coût total démontré. Aucun coût d'inférence engagé par ces tentatives, aucune souscription faite. La démo HF n'a pas pu être exécutée par l'agent depuis son environnement ; l'utilisateur a ensuite signalé une limite de durée de requête. Ne pas confondre plafond par requête, quota consommé et coût effectif. Aucun résultat Qwen sur la DA MiniFugg n'est enregistré.

L'ancienne référence Rebirth éditoriale dans Git était un WebP 260 × 567 avec pertes, malgré le nom 390x850 ; sa conversion PNG n'améliorait pas les pixels. Deux chemins partageaient le blob `7f0171395341bed5e3c2db0dae9988b6c227294d`. Elle n'est pas la source du pack T02 intégré. Ni extension PNG ni demande de haute qualité ne remplacent l'inspection des bytes, dimensions et pixels. La cause exacte des artefacts antérieurs, entre génération et encodage, n'a pas été isolée.

Sources : [Qwen officiel](https://huggingface.co/Qwen/Qwen-Image-Layered), [Space](https://huggingface.co/spaces/Qwen/Qwen-Image-Layered), [API fal](https://fal.ai/models/fal-ai/qwen-image-layered/api). Canva non testé. La priorité acquise est de terminer le pilote direct sans nouvel achat, pas de relancer un circuit d'abonnements.

## Contrôles du skill antérieurs à T01

Base initiale `1c84696421a4c455a908a4e51a74c75fff0377ab`. **18 tests unittest** réussis localement, Python 3.13.5/Pillow 12.3.0 : pixels RGBA d'assemblage, alpha extérieur, coordonnées, absence de labels, sources inchangées, refus d'écrasement ; refus des faux PNG/JPEG, alpha manquant, fichier vide/corrompu/animé, mauvaise taille/marges/budget, profils ICC incompatibles et sorties conflictuelles. Premier défaut d'ordre EXIF/validation PNG corrigé avant passage des 18 tests. Ces tests n'évaluent ni style ni générateur ni déclenchement natif du skill.

```sh
python3 -m unittest discover -s .agents/skills/minifugg-art/scripts -p 'test_*.py' -v
```

Mesures historiques, sans changement de validation artistique :

| Fichier | Mesure | Interprétation |
| --- | --- | --- |
| `v2-micro-euro.png` | PNG opaque 941 × 1672 | Refus comme nouveau master 390 × 844, pas rejet de l'image historique |
| `logo_rétro_tetramindfck_sur_fond_transparent.png` | PNG 941 × 1672 ; 1 191 356 transparents, 381 046 partiels, 950 opaques | Alpha réel, bords et aptitude runtime encore à examiner |
| `UI Overlay sur jaquette.png` | PNG opaque 1448 × 1086 | Planche historique, pas asset transparent ni écran runtime validé |

## Routage à éprouver dans l'hôte qui charge le skill

Déclenchement natif Codex/ChatGPT non testé par ces scénarios seuls.

| Demande | Résultat attendu |
| --- | --- |
| Jaquettes d'un jeu | Cover ; références lues, images statiques indépendantes, titre seul sauf autorisation |
| Quatre styles de refonte | Game ; capture réelle, géométrie constante, écritures distinctes, pas recolorations |
| Isoler un personnage | Asset ; image cible ouverte, alpha/pivots/occultations ; pas d'appel si cible manquante |
| Corriger les yeux de Fuggy | Welcome ; identité exacte, rien changer au wagon/téléphone/logo |
| Décliner un composant UI | Primitives et référence actuelles, états cohérents et textes autorisés |
| Traduire DA en gameplay | Planche technique et sources propres ; annotations séparées, avant intégration complète |
| Demander l'état d'une cover ou expliquer un skill | Lecture/explication, pas de génération déclenchée |
| Corriger une collision | Code/moteur, pas de génération automatique |
| Bilan hebdomadaire | Hors périmètre actuel ; ne rien planifier au titre du skill |

## Restant à éprouver

Priorité : retour humain sur Rebirth intégré, puis **T03 sur une DA externe validée de Crazy Papers**, et comparaison de modèles de conversation avec le même paquet figé. Fond complexe, découpe de parties occultées et séquences FX plus ambitieuses non éprouvés. La réussite d'un seul jeu ne démontre pas une généralisation.

Les autres pilotes proposés restent en attente : recherche de cover sur un jeu réel sans remplacer ses masters approuvés ; asset isolé depuis une DA externe, alpha/ancrage/états dans une mini-tranche ; états d'un composant UI validé. Appliquer les contrats actuels, ne pas recycler une référence au nom ressemblant. Garder essais, sources, corrections, preuves et temps humain dans le suivi concerné, sans multiplier les autorités documentaires.

## Critère de clôture

Distinguer généré, archivé, importé, intégré, testé et accepté. Le jeu Rebirth peut être jouable et testé sans que la méthode générale soit validée. Une clôture du pilote nécessite le retour utilisateur ; la portabilité du processus nécessite les essais séparés ci-dessus. Ne pas revendiquer trois prompts prêts à intégrer ni un gain de jours en heures avant mesure. Le bilan hebdomadaire reste reporté.
