# LineFugg — Changelog

## [0.3.0] — 2026-09-08 16:34 Europe/Paris

- Les quatre jaquettes approuvées A/B/C/D remplacent le placeholder et sont sélectionnables dans Information, sans badge « A METTRE A JOUR ».
- Leur affichage conserve désormais chaque master entier sur téléphone étroit ou haut, avec un prolongement diffus limité à la colonne Core.
- La version, la date de mise à jour et ce changelog deviennent les métadonnées canoniques affichées par la fiche Information.

Références : `ART_DIRECTION.md`, `ASSET_MANIFEST.md` et `welcome.ts`.

Vérifié : 4 éditions × téléphone, tablette et bureau ; sélection tactile/souris, ouverture/retour du jeu, build et typecheck.

Livraison fonctionnelle : `dcd6d6d` à `35b1d63` sur `main` ; traçabilité ajoutée par la livraison courante.

## [0.2.0] — 2026-09-07 02:39 Europe/Paris

- La DA « Orbital Accounting » remplace le prototype visuel : plateau en laiton et émail, registre parchemin, mécanisme céleste, lignes et FX bornés.
- Le pipeline d'assets devient modulaire : décor, plateau, panneaux, contrôles illustrés, globes et états dynamiques ont chacun un propriétaire unique.
- La console basse et le plateau sont agrandis puis corrigés pour garder calculs, total, boutons et indicateurs lisibles sur les formats téléphone, tablette et PC.

Références : master Orbital, correction `LineFugg-DA2.png`, `ART_DIRECTION.md` et `ASSET_MANIFEST.md`.

Vérifié : six configurations navigateur, tactile et souris, mouvement réduit, états actif/inactif/survol, build et typecheck.

Livraison fonctionnelle : `0e2397f` à `5afd5fc` sur `main`.

## [0.1.0] — 2026-09-07 00:06 Europe/Paris

- Migration du gameplay React/DOM/CSS vers une scène Phaser 4.2.1 en stage logique fixe `390 × 844`, avec cycle de vie et score gérés par Core.
- Les trois lignes restent modifiables après leur pose : la partie se termine seulement après validation manuelle explicite.
- La musique symbolique et les SFX passent par l'audio partagé du Core, sans contexte audio propre à Phaser.

Références : règles de jeu validées et première migration Phaser consignées dans `GAME_STATUS.md`.

Vérifié : tracé, croisements refusés, score, annulation, validation, replay, retour cover et build.

Livraison fonctionnelle : `24feae2`, `f0b43bd` et `f6aa0d6` sur `main`.
