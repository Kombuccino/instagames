# LineFugg — Changelog

## [0.5.1] — 2026-09-10 10:23 Europe/Paris

- Les cases normales libres utilisent maintenant de façon nettement visible l'exacte couleur RGB de la ligne active : vermillon, violet ou or.
- La teinte émaillée est renforcée sans masquer les chiffres ni modifier les couleurs propres aux multiplicateurs/diviseurs ; le flip en cascade reste inchangé.

Vérifié : build/typecheck et smoke test LineFugg après correction de teinte.

## [0.5.0] — 2026-09-10 09:24 Europe/Paris

- Les cases normales encore libres portent une teinte légère liée à la prochaine ligne : vermillon pour la première dimension, violet pour la deuxième, or pour la troisième.
- Chaque retirage se joue désormais comme un flip rapide en cascade depuis l'extrémité de la ligne : la case se met sur la tranche, change de valeur/dimension à l'abri du regard, puis se rouvre. Le décalage est court et déterministe pour éviter un changement simultané de toute la grille.
- Les cases déjà prises par une ligne restent stables ; Annuler restaure aussi l'état exact des teintes de dimension. Après la troisième ligne, les cases libres redeviennent neutres pendant la validation.

Vérifié : cascade non simultanée, états rouge/violet/or/neutre, blocage des entrées pendant le flip, restauration par Annuler, tirage déterministe, six formats navigateur et build/typecheck.

## [0.4.0] — 2026-09-10 08:54 Europe/Paris

- Les cases négatives sont limitées à `−1`…`−4` et les diviseurs passent de 8 % à 4 % du tirage ; les 4 points libérés vont aux nombres positifs.
- Chaque ligne posée produit une clé déterministe issue de son sens, de ses valeurs ordonnées et de son score, puis retire toutes les cases encore libres.
- Les cases déjà engagées par une ligne restent stables pour préserver la lecture des calculs ; Annuler restaure exactement la grille précédant le dernier retirage, et redessiner la même ligne reproduit la même grille.

Vérifié : distribution négative, retirage hors lignes, reproductibilité de la clé, restauration par Annuler, scoring des trois lignes, replay et build/typecheck.

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
