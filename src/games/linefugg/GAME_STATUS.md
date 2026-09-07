# LineFugg — Suivi de création

Mis à jour : 7 septembre 2026. Intégration artistique réalisée ; revue visuelle finale à faire.

Runtime Phaser 4.2.1, stage 390 × 844. Statut historique fugg conservé : il ne vaut pas acceptation de cette nouvelle réalisation. Cover : update-required.

## Décisions acquises

Validation utilisateur : « Proto, GD et équilibre sont trés bons, ils sont validés ». Règles et paramètres préservés : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation après trois lignes et validation explicite pour terminer.

DA Orbital Accounting : laiton, bleu encre, parchemin, nombres prioritaires ; trois indicateurs avec cinq points chacun. Conserver cette direction pour les animations et futures covers, sans nouveau rendu générique. Musiques acquises : MF-MUS-0008 et MF-MUS-0009.

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
| Cover / transition | À faire | Placeholder conservé ; après stabilisation du gameplay |
| Performance / QA | Vérifiées en émulation | Build et matrice navigateur réussis ; profilage physique restant |
| Livraison / curation | Livré sur main | Publication Git ; déploiement et acceptation artistique à vérifier séparément |

## Vérifications

Test reproductible : scripts/test-linefugg-browser.mjs. Captures et rapport locaux : artifacts/linefugg/. Six scénarios réussis : 360×640 DPR2, 390×844 DPR2, 430×932 DPR3, 768×1024 DPR2, 1440×900 DPR1 et mouvement réduit. Aucune erreur du jeu ; avertissement favicon404 plateforme séparé. Smoke test du skill web-game également exécuté.

Textures gameplay : estimation RGBA 10,62 Mio, hors fond CSS, textes et buffers. Ce n'est pas une mesure GPU totale. Intervalles rAF sur machine hôte : médiane environ16,7 ms et P95 environ16,8 ms ; aucune garantie matérielle mobile tirée de l'émulation. Densité plafonnée à2, géométrie inchangée. Sources préservées : la réduction à l'upload ne réduit pas leur poids réseau.

Build réussi avec avertissement existant sur la taille du bundle.

## Prochaines actions

1. Revue utilisateur du rendu par rapport au master conservé, ajustements ciblés si nécessaire.
2. Profilage sur téléphone physique et écoute du mix/feedback audio.
3. Cover fidèle via le runtime partagé, transition puis revue Fugg complète.

Aucun blocage technique connu. Ne pas remettre en attente le gameplay déjà validé.

## Enseignements

La capture initiale montrait une grille trop petite, des bandes écrasées et des ancrages désaccordés. Utiliser les régions utiles et extensibles des images, partager les coordonnées entre art et indicateurs, séparer environnement, pièces animables et état dynamique. Vérifier l'alpha réel ; refuser les fausses transparences.

Décision transport : Codex génère directement dans le dépôt puis commit ; Drive sert au transfert depuis ChatGPT. Les images déjà synchronisées gardent leurs chemins. Les anciens assets remplacés ne sont plus chargés et restent conservés comme sources.

