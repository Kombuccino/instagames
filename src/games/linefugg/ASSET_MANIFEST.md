# LineFugg — Production asset manifest

État canonique : 12 septembre 2026, version `0.5.5`, direction **Orbital Accounting**. Appliquer `docs/GAME_ART_PRODUCTION_PIPELINE.md` et `docs/ASSET_PIPELINE.md`.

Les PNG approuvés et sources de travail sont conservés. **Le runtime gameplay ne charge plus aucun de ces gros PNG : ses 11 images actives sont des dérivés WebP lossless pré-dimensionnés.** Les quatre covers suivent le même principe, avec masters PNG distincts et dérivés WebP Core.

## Assets gameplay actifs

| Fonction | Source conservée | URL runtime / dimensions | Octets runtime | Ownership / notes |
| --- | --- | --- | ---: | --- |
| Environnement | `imported/linefugg/backgrounds/orbital-environment.png` | `/assets/imported/linefugg/backgrounds/orbital-environment.webp` — 844×1688 | 1 504 348 | fond CSS opaque, crop cover ; aucun état mutable |
| Plateau | `imported/linefugg/ui/orbital-board.png` | `/assets/imported/linefugg/ui/orbital-board.webp` — 1024² | 827 128 | alpha réel ; rails/corners/cellule émail découpés par frames |
| Armillaire | `imported/linefugg/props/orbital-armillary-key.png` | `/assets/imported/linefugg/props/orbital-armillary-key.webp` — 1024×512 | 423 420 | sheet keyed ; ring/globe, filtre Key Phaser local |
| Case × | `imported/linefugg/ui/orbital-cell-multiply-v3.png` | `/assets/imported/linefugg/ui/orbital-cell-multiply-v3.webp` — 128² | 9 540 | matériau de case ; valeur/glyphe dynamique |
| Case ÷ | `imported/linefugg/ui/orbital-cell-divide-v3.png` | `/assets/imported/linefugg/ui/orbital-cell-divide-v3.webp` — 128² | 9 968 | matériau de case ; valeur/glyphe dynamique |
| Valider prêt | `imported/linefugg/ui/orbital-validate-ready-v5.png` | `/assets/imported/linefugg/ui/orbital-validate-ready-v5.webp` — 256² | 76 242 | bouton illustré, alpha réel ; cadre runtime recadré à la zone visible 244² |
| Valider inactif | `imported/linefugg/ui/orbital-validate-disabled-v5.png` | `/assets/imported/linefugg/ui/orbital-validate-disabled-v5.webp` — 256² | 69 864 | bouton illustré, alpha réel ; cadre runtime recadré à la zone visible 244² |
| Décor du registre | `imported/linefugg/ui/orbital-history-row-v5.png` | `/assets/imported/linefugg/ui/orbital-history-row-v5.webp` — 1024×341 | 209 858 | ornements gauche/droite ; calculs live au-dessus |
| Console basse | `generated/linefugg/ui/accounting-panels.png` | `/assets/generated/linefugg/ui/runtime/accounting-panels.webp` — 1024×683 | 681 024 | ledger, total, dock, bouton Undo ; masques géométriques pour les boutons |
| Indicateurs verre | `generated/linefugg/ui/glass-indicators.png` | `/assets/generated/linefugg/ui/runtime/glass-indicators.webp` — 1024² | 671 796 | trois globes + billes ; états et dimming Phaser |
| Verre Valider orange | `generated/linefugg/ui/validate-amber-source.png` | `/assets/generated/linefugg/ui/runtime/validate-amber-source.webp` — 256² | 89 910 | seul le verre central est cadré/masqué ; faux damier extérieur jamais affiché |

**Budget réseau image du gameplay : 4 573 098 octets = 4,57 Mo = 4,36 Mio.** Les covers ne sont pas incluses : elles appartiennent au feed Core et ne sont pas un prérequis du lancement Phaser.

Les trois dérivés locaux remplaçant les derniers PNG réseau pèsent ensemble **1 442 730 octets**, contre **5 725 987 octets** pour leurs sources PNG. Ils ont été fabriqués sans régénération artistique, en LANCZOS vers la taille déjà utilisée par l'ancien loader puis WebP lossless `exact`, avec vérification de l'alpha et des pixels visibles après décodage.

SHA-256 des trois nouveaux dérivés :

- `accounting-panels.webp` — `0ada9ee226774b44951f873c7f26e88b82c3a7fbd1e1c012979aa9f3df381f17` ;
- `glass-indicators.webp` — `83430edbe2c30fd55f2cf0a1e239f15be186c0978dea72150c32fd05264813c5` ;
- `validate-amber-source.webp` — `3ca900b3df58d5eeeccb128e628919586ca710c4584f20fbbfc7569aae69258e`.

## Géométrie et ownership dynamique

Stage logique `390×844`. Plateau `(55,180)`, taille `280²`, cellules `40²`. Registre `y=488`, trois lignes de `42` ; total centre `y=638` ; contrôles centre `y=695`, diamètre visuel `48`. Le bouton Retour Core adopte la même taille CSS effective que ces commandes sur PC. Les coordonnées exactes restent dans `LineFuggScene.ts`.

`artFrame()` reçoit toujours les largeurs des **sources de mesure** (plateau 1254, armillaire 1774, registre 2172, console 1536, indicateurs/verre 1254) et calcule le ratio vers le dérivé chargé. Le passage aux WebP n'altère donc ni les frames ni la géométrie du jeu.

Phaser possède valeurs, signes, chemins, flèches, halos, calculs, total, pips, états, hover et FX. Aucun score ou état mutable n'est cuit dans les fonds. L'armillaire conserve ses orbites lentes, les reflets locaux et les particules bornées ; mouvement réduit désactive les animations non essentielles.

`OrbitalImageFile` a été supprimé : LineFugg utilise maintenant le loader Phaser standard `load.image`. Le navigateur ne télécharge plus une source surdimensionnée avant de la réduire sur Canvas.

## Covers

Masters approuvés du 7 septembre, conservés sans régénération dans `Fugg/linefugg/welcome/variants/` et l'archive `Games/linefugg/covers-validated/` :

| Édition | Master canonique | Dérivé Core actif |
| --- | --- | --- |
| A — Pulp | `linefugg-cover-a-pulp-euro-approved-2026-09-07.png` — 941×1672 | `runtime/linefugg-cover-a-pulp-euro.webp` — 780×1386, 1 577 418 octets |
| B — Micro euro | `linefugg-cover-b-micro-euro-approved-2026-09-07.png` — 941×1672 | `runtime/linefugg-cover-b-micro-euro.webp` — 780×1386, 1 440 408 octets |
| C — Graphic poster | `linefugg-cover-c-graphic-poster-approved-2026-09-07.png` — 941×1672 | `runtime/linefugg-cover-c-graphic-poster.webp` — 780×1386, 1 402 038 octets |
| D — Japanese edition | `linefugg-cover-d-japanese-edition-approved-2026-09-07.png` — 941×1672 | `runtime/linefugg-cover-d-japanese-edition.webp` — 780×1386, 1 533 336 octets |

Les quatre covers WebP totalisent 5 953 200 octets mais sont des assets de feed, pas le payload Phaser du jeu. `welcome.ts` utilise `fit: contain`, sélection seedée, aucun slideshow et aucune animation cover. Les masters PNG restent les références artistiques canoniques ; leur provenance/empreinte initiale est dans `ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json`.

## Vérification

- `scripts/test-linefugg-runtime-assets.mjs` vérifie les 11 fichiers WebP actifs, leur signature, leur somme exacte `4 573 098` octets, le fond WebP et l'absence de PNG dans le bloc `ASSETS` Phaser.
- Passe finale : `npm run build` réussi.
- Scénario navigateur 390×844 DPR2 tactile réussi : tracé, reroll, trois lignes, Undo, Valider, replay/retour ; aucune erreur HTTP/JavaScript.
- Captures `empty`, `drag`, `reroll-cascade`, `one`, `three`, `submitted` produites. Contrôle visuel des états `empty` et `three` : rendu Orbital cohérent, textures présentes et lisibles, aucune dégradation évidente liée aux dérivés.
- Les matrices historiques de `scripts/test-linefugg-browser.mjs` et `scripts/test-linefugg-covers.mjs` restent les preuves multi-écrans. Profilage sur téléphone physique et acceptation artistique finale utilisateur restent distincts.

Le coût RGBA après décodage reste de l'ordre de la mesure précédente (~14,875 Mio hors fond CSS, textes et buffers) : WebP réduit le **transfert et le stockage**, pas mécaniquement la mémoire d'une texture décodée à dimensions identiques.
