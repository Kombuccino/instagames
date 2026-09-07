# LineFugg — Suivi de création

Mis à jour : 7 septembre 2026. Intégration artistique réalisée ; revue visuelle finale à faire.

Runtime Phaser 4.2.1, stage 390 × 844. Statut historique fugg conservé : il ne vaut pas acceptation de cette nouvelle réalisation. Cover runtime : update-required ; quatre masters de jaquette validés et sauvegardés, intégration distincte restant à faire.

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
| DA | Direction validée | Acceptation visuelle du nouveau rendu restant à recueillir |
| Assets / intégration | Réalisés | Fond calme, grille reconstruite depuis l'art, registre parchemin, textes et indicateurs alignés |
| Animations / FX | Réalisés | Mécanisme séparé, orbites lentes, reflets, énergie, particules bornées, mouvement réduit |
| SFX / musique / mix | À vérifier | Musiques conservées ; écoute finale et audit des événements audio restants |
| Cover / transition | Quatre masters validés et sauvegardés | Éditions A/B/C/D identifiées dans ASSET_MANIFEST.md ; placeholder conservé, sélection/animation/intégration au feed restantes |
| Performance / QA | Vérifiées en émulation | Build et matrice navigateur réussis ; profilage physique restant |
| Livraison / curation | Livré sur main | Publication Git ; déploiement et acceptation artistique à vérifier séparément |

## Vérifications

Test reproductible : scripts/test-linefugg-browser.mjs. Captures et rapport locaux : artifacts/linefugg/. Six scénarios réussis : 360×640 DPR2, 390×844 DPR2, 430×932 DPR3, 768×1024 DPR2, 1440×900 DPR1 et mouvement réduit. Aucune erreur du jeu ; avertissement favicon404 plateforme séparé. Smoke test du skill web-game également exécuté.

Textures gameplay : estimation RGBA 10,62 Mio, hors fond CSS, textes et buffers. Ce n'est pas une mesure GPU totale. Intervalles rAF sur machine hôte : médiane environ16,7 ms et P95 environ16,8 ms ; aucune garantie matérielle mobile tirée de l'émulation. Densité plafonnée à2, géométrie inchangée. Sources préservées : la réduction à l'upload ne réduit pas leur poids réseau.

Build réussi avec avertissement existant sur la taille du bundle.

## Prochaines actions

1. Revue utilisateur du rendu par rapport au master conservé, ajustements ciblés si nécessaire.
2. Profilage sur téléphone physique et écoute du mix/feedback audio.
3. Intégrer les covers approuvées via le runtime partagé, sans les régénérer ; transition puis revue Fugg complète.

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

La série individuelle approuvée à 12:50:57 UTC est celle du savant rouge qui trace, du cartographe de dos avec compas, des trois routes en affiche graphique et du jeune astronome en édition japonaise. La demande de 12:58:37 UTC porte sur leur enregistrement, pas sur une nouvelle génération ni une activation dans le feed.

Originaux PNG 941×1672 conservés sans modification dans Fugg/linefugg/welcome/variants/, avec copies dans MiniFugg - Graphic Archive/Games/linefugg/covers-validated/. Noms exacts, provenance et empreintes : [ASSET_MANIFEST.md](ASSET_MANIFEST.md) et [reçu d'import](../../../ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json). Vérifier le miroir public/assets/imported/linefugg/welcome/variants/ contre ces empreintes avant intégration.

Décisions cover : très peu de texte hors titre ; anglais par défaut, japonais pour l'édition concernée ; sujets, médiums et cadrages réellement distincts. Les premières études centrées sur le même astrolabe/planètes ne remplacent pas cette série approuvée. Les quatre fichiers sont des masters aplatis ; aucune couche animable ni édition par défaut n'est déclarée par cette passe de sauvegarde. Ne pas modifier le gameplay, les seuils de déblocage ou la migration cover à partir d'une simple opération de stockage.
