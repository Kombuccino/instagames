# LineFugg — Suivi de création

Mis à jour : 17 septembre 2026 à 12:41 Europe/Paris. Version publique : `0.8.2`. Changelog : `CHANGELOG.md`.

## État actuel

Le LineFugg publié reste volontairement le runtime **classique Orbital Accounting** qui servait de référence fonctionnelle avant Solar Origami. Les règles, l’équilibrage et les contrôles ne changent pas. Solar Origami est conservé dans Git et dans ses assets comme cas d’étude d’un pipeline DA/intégration raté ; ce n’est plus la direction active du jeu classique.

En parallèle, **LineFugg — Rebirth** est traité comme un chantier de production à partir de ce jeu classique pris comme prototype évolué. Le 17 septembre 2026, l’utilisateur a validé la première DA Rebirth : **registre éditorial imprimé / papier tactile**, sur l’état fonctionnel P4. Le Production Lab contient cette DA et son découpage sémantique. Une première **mini-tranche live réservée au Lab** traduit maintenant cette direction avec les vraies valeurs, lignes, résultats et contrôles du moteur ; elle ne remplace pas encore le jeu public.

## Prototype de référence

- stage logique Phaser public : `390 × 844` ;
- grille `7 × 7`, déterministe par jour ;
- exactement trois lignes, de 2 à 5 cases, horizontales / verticales / diagonales ;
- calcul appliqué dans le sens du tracé ;
- une seule case partagée maximum par paire de lignes ;
- distribution : 68 % positifs `1…9`, 16 % négatifs `−1…−4`, 12 % multiplicateurs `×2/×3`, 4 % diviseurs `÷2/÷3` ;
- après chaque ligne : cases jouées protégées, cases libres retirées de manière déterministe, flip en cascade et préparation visuelle de la prochaine ligne ;
- après la troisième ligne : aucune résolution automatique, Undo reste possible, puis validation explicite ;
- Undo restaure aussi le plateau et les états de dimension antérieurs ;
- score final = somme des trois résultats.

Sources de référence : branche `linefugg-classic-reference`, `LineFuggScene.ts`, `definition.ts`, `ART_DIRECTION.md` et `ASSET_MANIFEST.md` restaurés pour le jeu classique.

## Production Lab / Rebirth

Le plan canonique doit être synchronisé à chaque décision sémantique ou visuelle significative. À ce stade :

- **Covers** : existantes, ensemble séparé ;
- **Proto** : quatre situations réelles P1 → P4 ;
- **DA** : direction validée — registre éditorial imprimé, référence Lab `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp`, découpée en grille/matière, tracés, registre des résultats, total et contrôles ;
- **Mini-tranche** : disponible uniquement via le runtime de Lab avec `skin=rebirth-editorial` ; le stage Rebirth utilise `390 × 850` tandis que le jeu public reste explicitement legacy `390 × 844` ;
- **Release** : la mini-tranche Lab est maintenant représentée comme première traduction à revoir, sans prétendre qu’elle est la Release publique ;
- **Manques DA visibles dans le Lab** : états de cellule complets (**bloqué**), états Undo/Validate (**bloqué**), mouvement de reroll papier (**à faire**), langage sonore Rebirth (**à faire**). Les nœuds existants affichent désormais des tags multi-domaines et des repères Point/Zone/Dessin quand ils ont un sens.

Prochaine action : revoir ces manques directement dans le Lab et produire en priorité les états de cellule et de contrôles avant d’étendre la mini-tranche au runtime Rebirth complet.

## Passe Lab — sources natives 17 septembre 2026

Le Lab ne traite plus les crops du master DA comme assets. Une première vraie décomposition produit des sources séparées pour papier, plaques de résultats, total, Undo et Validate ; elles sont affichées à leur taille native dans des nœuds auto-dimensionnés. Le master 390×850 reste la vue d’ensemble. États de cellule, variantes des contrôles, reroll/FX et son restent visibles comme éléments à produire.


## Rebirth — reset production DA (18 septembre 2026)

La première décomposition en petits assets/crops est annulée : qualité source insuffisante, inventaire incomplet et états interactifs absents. Le Production Lab repart du screen DA validé avec un inventaire visuel exhaustif avant production : structure, chiffres/opérateurs, lignes, états, FX/mouvements et sons. Release Rebirth reste vide jusqu’à validation de cette planche.
