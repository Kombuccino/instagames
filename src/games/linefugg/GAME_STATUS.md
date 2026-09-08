# LineFugg — Suivi de création

Mis à jour : 8 septembre 2026 à 16:34 Europe/Paris. Version livrée : `0.3.0`. Changelog : `CHANGELOG.md`. Base inspectée avant édition : `63f6f8680a38c398dfea4a9efdf7ea33102a3112`. Intégration artistique gameplay réalisée ; revue visuelle finale gameplay à faire. Les quatre covers approuvées sont intégrées en images statiques.

Runtime Phaser 4.2.1, stage 390 × 844. Statut historique fugg conservé : il ne vaut pas acceptation de cette nouvelle réalisation gameplay. Cover runtime : current ; quatre masters de jaquette validés, sauvegardés et actifs. Animation des covers reportée à une future demande.

## Décisions acquises

Validation utilisateur : « Proto, GD et équilibre sont trés bons, ils sont validés ». Règles et paramètres préservés : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation après trois lignes et validation explicite pour terminer.

DA Orbital Accounting : laiton, bleu encre, parchemin, nombres prioritaires ; trois indicateurs avec cinq points chacun. Conserver cette direction pour les animations gameplay, sans nouveau rendu générique. Les covers suivent DA_COVER.md : interprétations éditoriales distinctes, pas une copie du rendu gameplay. Musiques acquises : MF-MUS-0008 et MF-MUS-0009.

Références : [ART_DIRECTION.md](ART_DIRECTION.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [notice commune](../../../docs/GAME_CREATION_PIPELINE.md), discussion [Game : LineFugg](https://chatgpt.com/c/6a96d2e6-ad54-83eb-9d9e-c74fe69d955d).

## Avancement

| Lot | État | Réalisé / reste |
| --- | --- | --- |
| Prototype, GD, équilibre | Validés utilisateur | Conservés |
| Core / non-régression | Vérifiés navigateur | Tracé, refus de chevauchement invalide, score, annulation, validation, replay, retour cover |
| Composition / inputs | Réalisés et testés | Grille de 282 à 322 unités, cases46² ; même géométrie sur six configurations, tracé tactile sur téléphones émulés |
| DA | Direction validée | Acceptation visuelle du nouveau rendu gameplay restant à recueillir |
| Assets / intégration | Réalisés | Fond calme, grille reconstruite depuis l'art, registre parchemin, textes et indicateurs alignés |
| Animations / FX | Réalisés | Mécanisme séparé, orbites lentes, reflets, énergie, particules bornées, mouvement réduit |
| SFX / musique / mix | À vérifier | Musiques conservées ; écoute finale et audit des événements audio restants |
| Cover / transition | Quatre covers statiques intégrées et testées | A/B/C/D dans Info → Cover selection ; placeholder débranché, badge retiré pour LineFugg ; animation ultérieure |
| Performance / QA | Vérifiées en émulation | Build et matrices navigateur réussis ; profilage physique restant |
| Livraison / curation | Livré sur main | Métadonnées produit `0.3.0` et changelog canonique inclus dans cette livraison ; déploiement et acceptation artistique gameplay à vérifier séparément |

## Vérifications gameplay

Test reproductible : scripts/test-linefugg-browser.mjs. Captures et rapport locaux : artifacts/linefugg/. Six scénarios réussis : 360×640 DPR2, 390×844 DPR2, 430×932 DPR3, 768×1024 DPR2, 1440×900 DPR1 et mouvement réduit. Aucune erreur du jeu ; avertissement favicon404 plateforme séparé. Smoke test du skill web-game également exécuté lors de la passe gameplay.

Textures gameplay : estimation initiale RGBA 10,62 Mio, hors fond CSS, textes et buffers, remplacée par les mesures de restauration ci-dessous. Ce n'est pas une mesure GPU totale. Intervalles rAF sur machine hôte : médiane environ16,7 ms et P95 environ16,8 ms ; aucune garantie matérielle mobile tirée de l'émulation. Densité plafonnée à2, géométrie inchangée. Sources préservées : la réduction à l'upload ne réduit pas leur poids réseau.

Build réussi avec avertissement existant sur la taille du bundle.

## Prochaines actions

1. Revue utilisateur du rendu gameplay par rapport au master conservé, ajustements ciblés si nécessaire.
2. Profilage sur téléphone physique et écoute du mix/feedback audio.
3. Sur demande ultérieure, préparer l'animation des covers à partir des quatre masters exacts, avec couches séparées et runtime Phaser partagé. La livraison statique est terminée ; ne pas la remettre en attente de l'animation.

Aucun blocage technique connu. Ne pas remettre en attente le gameplay déjà validé.

## Enseignements

La capture initiale montrait une grille trop petite, des bandes écrasées et des ancrages désaccordés. Utiliser les régions utiles et extensibles des images, partager les coordonnées entre art et indicateurs, séparer environnement, pièces animables et état dynamique. Vérifier l'alpha réel ; refuser les fausses transparences.

Décision transport : Codex génère directement dans le dépôt puis commit ; Drive sert au transfert depuis ChatGPT. Les images déjà synchronisées gardent leurs chemins. Les anciens assets remplacés ne sont plus chargés et restent conservés comme sources.

## Reprise du bas selon DA2 — 7 septembre 2026

Retour utilisateur : cartouche total trop ornementé, calculs peu lisibles et mauvaise disposition des commandes. Nouvelle référence LineFugg-DA2.png enregistrée dans ART_DIRECTION.md. Fond et grille conservés. Nouveau parchemin à trois rangées, total sobre avec sigma fixe, boutons rapprochés autour du panneau des trois indicateurs. Survol Annuler : teinte/contour dorés et rotation légère de la flèche quand l'action est disponible. Aucun changement de calcul ou d'équilibrage.

Nouvel atlas produit directement dans public/assets/generated/linefugg/ui/accounting-panels.png. Estimation RGBA gameplay désormais 8,79 Mio, mêmes exclusions ; remplace la mesure précédente. Test tactile de la boucle réussi. Matrice complète des six formats et survol souris vérifiés ; build et smoke test réussis. Acceptation visuelle utilisateur toujours distincte.

## Correction de fidélité illustrée

Après retour utilisateur, restauration des boutons Valider illustrés actif/inactif ; ajout du verre orange au survol. Nouveaux globes et billes raster, décors latéraux du parchemin restaurés, chips × orange / ÷ violet avec leurs textures réelles. Total centré sur les pixels visibles. Les formes plates ne sont plus la représentation des indicateurs. Six configurations navigateur réussies, tactile et survol orange compris ; build/typecheck et smoke test réussis. Estimation textures gameplay : 14,875 Mio RGBA, hors fond CSS, textes et buffers, remplaçant la mesure précédente. Acceptation artistique utilisateur toujours ouverte.

## Covers validées — conservation du 7 septembre 2026

La série individuelle approuvée à 12:50:57 UTC est celle du savant rouge qui trace, du cartographe de dos avec compas, des trois routes en affiche graphique et du jeune astronome en édition japonaise. La demande de 12:58:37 UTC portait sur leur enregistrement ; la demande ultérieure de 13:31:32 UTC autorise leur intégration statique et la suppression du marqueur provisoire.

Originaux PNG 941×1672 conservés sans modification dans Fugg/linefugg/welcome/variants/, avec copies dans MiniFugg - Graphic Archive/Games/linefugg/covers-validated/. Noms exacts, provenance et empreintes : [ASSET_MANIFEST.md](ASSET_MANIFEST.md) et [reçu d'import](../../../ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json). Miroir public/assets/imported/linefugg/welcome/variants/ vérifié contre ces empreintes avant intégration.

Décisions cover : très peu de texte hors titre ; anglais par défaut, japonais pour l'édition concernée ; sujets, médiums et cadrages réellement distincts. Les premières études centrées sur le même astrolabe/planètes ne remplacent pas cette série approuvée. Les quatre fichiers sont des masters aplatis ; aucune couche animable n'a été produite.

## Intégration statique — 7 septembre 2026

[welcome.ts](welcome.ts) remplace placeholderWelcome('linefugg') dans le registre. Les quatre éditions sont statiques, accessibles dans le sélecteur Core existant, sans nouveau palier de score. Aucun seuil spécifique à LineFugg n'était défini ; unlockScore reste à zéro pour les quatre. Sélection initiale par la graine de l'emplacement du feed, sans diaporama ni changement automatique dans une cover ouverte. La sélection manuelle utilise le comportement Core existant ; cette passe ne crée pas de préférence persistante supplémentaire.

migration.cover passe à current pour LineFugg uniquement : le badge A METTRE A JOUR disparaît par le mécanisme conditionnel commun. Le placeholder historique n'est plus chargé par son entrée de registre. Aucun autre jeu, règle, son ou dimension du Core n'est modifié.

Le premier test a révélé que le cover-crop global amputait les titres sur téléphone long. Correction locale au mode de présentation des masters : fit:'contain' conserve l'image opaque entière, uniformément réduite ; un fond très diffus tiré du même visuel remplit uniquement l'extérieur, en cover/crop, et reste découpé aux limites de la colonne Core. Aucun pixel du PNG n'est modifié, aucune géométrie gameplay n'est touchée. Les autres covers conservent leur cadrage existant.

Validation reproductible : `node scripts/test-linefugg-covers.mjs`. CI [34143179734](https://github.com/Kombuccino/instagames/actions/runs/34143179734) réussie sur le commit 240c215f7543239e01a3f222ca9c9f88c56969fc, avec build/typecheck. Contrôles : intégrité SHA-256 et dimensions des quatre PNG, 16 affichages (4 éditions × 360×640, 390×844, 768×1024, 1440×900), sélections tactiles/souris, titre non recadré, absence de canvas/animation cover, entrée dans le jeu puis retour, conservation du marqueur de Train Fighter et de la largeur desktop 520px. Aucune erreur JavaScript ni ressource cover manquante. Captures téléchargées et inspectées après correction, notamment les quatre sur téléphone long. Tests en émulation Chromium, pas sur appareil physique.

Le workflow `.github/workflows/linefugg-covers.yml` conserve captures/rapport en artifact `linefugg-static-covers` et protège ces comportements lors des prochaines modifications. Publication sur main vérifiée ; déploiement Dokploy non contrôlé par cette passe.
