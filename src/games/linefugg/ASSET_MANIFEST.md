# LineFugg — Production asset manifest

État canonique : 14 septembre 2026, version `0.7.0`, direction active **Solar Origami v2**. Appliquer `docs/GAME_ART_PRODUCTION_PIPELINE.md` et `docs/ASSET_PIPELINE.md`.

Les PNG approuvés et sources de travail sont conservés. **Le runtime gameplay charge uniquement les 13 dérivés WebP lossless Solar Origami nécessaires à la scène ; les grandes planches transparentes restent des sources de production.** Les quatre covers suivent le même principe, avec masters PNG distincts et dérivés WebP Core.

## Pack correctif Solar Origami v3 — préparé, non intégré

Le retour utilisateur sur le runtime v2 impose une reconstruction fidèle à la DA validée. Le lot source est `public/assets/generated/linefugg/solar-origami-v3/` et sa référence unique est conservée sous `references/`. Le script `scripts/build-linefugg-solar-origami-v3-boards.py` convertit les sources sur chroma uniforme en véritables PNG RGBA, assemble cinq planches de production, génère leurs aperçus sur bleu nuit et découpe chaque composant.

| Planche v3 | Contenu |
| --- | --- |
| Céleste | 3 astres actifs conformes aux silhouettes violet/rouge/jaune, les 3 mêmes astres inactifs ivoire, 1 soleil neutre |
| Cases | 4 diamants vides : ivoire, rouge, violet, jaune ; aucun glyphe incorporé |
| Glyphes | `0…9`, `−`, `+`, `×`, `÷`, `.`, `=` en fonte raster fine et élégante, sans support de case |
| Énergie | 7 modules par couleur rouge/violet/jaune : droit, diagonal, deux courbes, départ, arrivée et pulsation |
| Commandes | `UNDO` normal/enfoncé et `VALIDATE` inactif/prêt, quatre supports de même gabarit |

Les masters sont `masters/{celestial,cells,glyphs,energy,controls}-alpha-v3.png`; chaque élément isolé est sous `components/` et l'inventaire reproductible sous `solar-origami-v3-inventory.json`. La transparence est obtenue par chroma `#00FF00` uniforme puis démélange déterministe, jamais par damier peint. Les cinq masters ont de vrais pixels transparents, semi-transparents et opaques. Statut : **contrôle technique et visuel des planches effectué ; aucune URL runtime modifiée**.

La planche de revue `previews/review-catalog-v3.png` présente exactement les 52 composants découpés, regroupés par famille et identifiés par des codes stables `AST`, `CEL`, `GLY`, `ENG-R/V/Y` et `CTL`. Son damier sert uniquement à rendre l'alpha visible dans l'aperçu ; il n'appartient pas aux composants.

## Pack Solar Origami v2 — actif

Le premier pack `solar-origami/` est conservé uniquement comme trace d'une proposition refusée le 13 septembre : typographie trop éloignée de la maquette, boutons reconstruits, astres trop monochromes et flux insuffisamment détaillés. Il ne doit pas être intégré.

Le remplacement est `public/assets/generated/linefugg/solar-origami-v2/`. Trois grandes planches ImageGen ont été produites puis détourées en alpha réel : une planche générale, une planche des glyphes et une planche FX/sélection. Le script `scripts/build-linefugg-solar-origami-v2-assets.py` reconstruit tous les composants PNG/WebP, les atlases et leurs JSON sans redessiner les illustrations.

| Famille v2 | Contenu décomposé |
| --- | --- |
| Cases | 3 silhouettes neutres additif / multiplication / division ; 3 sélections rouge / violet / jaune ; 17 faces jouables |
| Glyphes | `0…9`, `−`, `+`, `×`, `÷`, `.`, `=` dans une fonte raster générée conforme à la maquette |
| Résultats | 3 astres ivoire inactifs et 3 astres actifs multicolores, chacun gardant ivoire, or et bleu en plus de sa couleur de ligne |
| Soleil | neutre, rouge, rouge+violet, final tricolore ; 2 grappes et 7 cailloux isolés ; 4 étincelles |
| Commandes | Undo normal/enfoncé et Validate inactif/prêt, quatre textures transparentes de même gabarit `512×160` |
| Sélection | 8 nœuds : neutre, survol, trois couleurs et trois partages bicolores ; 8 segments droits/diagonaux/coude |
| Flux | 8 frames rouges, 8 violettes, 8 jaunes ; impacts neutres/couleurs, éclats ivoire et poussières colorées |

Masters transparents : `masters/solar-origami-{mega-tileset,glyphs,fx}-alpha-v2.{png,webp}`. Chaque objet existe séparément sous `components/`; les atlases runtime et leurs frames nommées sont sous `runtime/`. La source corrigée des commandes est `sources/solar-origami-controls-english-alpha-v3.png`. `solar-origami-v2-inventory.json` donne les quantités, chemins et SHA-256. La planche de contrôle complète est `previews/solar-origami-complete-components-board-v2.png`. Statut : **intégré dans Phaser, techniquement vérifié, revue artistique finale utilisateur encore ouverte**.

Le runtime actif charge le fond spatial et douze atlases WebP/JSON : faces de cases, astres de résultat, soleils, commandes, glyphes, nœuds, segments, impacts, débris et trois flux colorés. Total image : **3 266 252 octets = 3,27 Mo = 3,11 Mio**. Aucune grande planche PNG ni texture Orbital n'est chargée par la scène.

## Pack de remplacement Solar Origami v1 — refusé, non intégré

| Fonction | Fichiers préparés | États / ownership |
| --- | --- | --- |
| Environnement spatial | `solar-origami/runtime/background/solar-origami-background-master-v1.png` — 390×844 ; WebP lossless 780×1688 | décor seul, opaque ; CENTRE calme ; aucune valeur, ligne, astre ou commande cuite |
| Trois familles de cases | `runtime/cells/cell-bases-atlas-v1.{png,webp,json}` — 384×128 | diamant additif, expansion × et scission ÷ ; sélection/partage/survol restent Phaser |
| Atlas des 17 faces | `runtime/cells/cell-faces-atlas-v1.{png,webp,json}` — 640×512 | `1…9`, `−1…−4`, `×2`, `×3`, `÷2`, `÷3`, frames nommées |
| Atlas score composable | `runtime/glyphs/score-glyphs-atlas-v1.{png,webp,json}` — 384×384 | seize glyphes ImageGen Solar Origami : `0…9`, `−`, `+`, `×`, `÷`, `.`, `=` ; aucune police système |
| Trois astres / voiles de résultat | `runtime/results/result-crafts-atlas-v1.{png,webp,json}` — 512×768 | six frames : ivoire inactif puis rouge / bleu-violet / jaune après commit ; Undo reprend la frame ivoire |
| Astre total | `runtime/results/total-star-v1.{png,webp}` — 256² | face centrale vide ; score composé depuis l'atlas ; les trois alimentations restent Phaser |
| Flux d'énergie | `runtime/fx/energy-shard-atlas-v1.{png,webp,json}` — 384×96 | éclat neutre + trois teintes ; courbes, progression, durée et extinction calculées par Phaser |
| Commandes | `runtime/ui/control-plate-v1.{png,webp}` — 512×160 ; `control-content-atlas-v1.{png,webp,json}` — 384² | un même châssis pour les deux boutons ; lettres et icônes issues d'un tileset ImageGen séparé |
| Recette / inventaire | `solar-origami-runtime-recipe-v1.json`, `solar-origami-inventory-v1.json` | ancres 390×844, ownership, couleurs, chemins et SHA-256 |

Couleurs exactes : `#ff5a36`, `#a54dff`, `#ffc72c`. Les aperçus `previews/solar-origami-{zero-lines,one-line,two-lines,three-lines}-{master,pc-centre}-v1.png` couvrent les quatre états ; `solar-origami-transfer-storyboard-v1.png` montre le transfert temporaire vers le premier astre. Les masters sont `390×844`, leurs crops PC exacts `390×662` à `y=91…753`, et les deux commandes ont le même gabarit. Toutes les textures runtime isolées ont un alpha réel ; le fond et les aperçus sont opaques. Le tileset numérique brut contenait un damier peint malgré la demande d'alpha : le build reproductible conserve cette source générée puis extrait uniquement les grandes composantes bleu nuit avant de produire l'atlas transparent. Les deux essais de support de bouton présentant le même défaut ont été rejetés hors dépôt ; le châssis final est géométrique et déterministe.

Le script `scripts/build-linefugg-solar-origami-assets.py` reconstruit les dérivés, atlases, métadonnées, états et planches sans modifier les sources. Le pack est **préparé pour revue et intégration**, mais aucun chemin n'est encore chargé par `LineFuggScene.ts` : le runtime public reste Orbital Accounting `0.6.0`.

## Assets Orbital Accounting — historiques, inactifs

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

## Géométrie et ownership dynamique active

Stage logique `390×844`. Plateau `(55,128)`, taille `280²`, cellules `40²`. Les trois astres sont centrés à `y=505`, le soleil-total à `y=628` et les deux commandes anglaises `150×48` à `y=714`. Tous les éléments essentiels tiennent dans le crop PC CENTRE `y=91…753`. Les coordonnées exactes restent dans `LineFuggScene.ts`.

`artFrame()` reçoit toujours les largeurs des **sources de mesure** (plateau 1254, armillaire 1774, registre 2172, console 1536, indicateurs/verre 1254) et calcule le ratio vers le dérivé chargé. Le passage aux WebP n'altère donc ni les frames ni la géométrie du jeu.

Phaser possède valeurs, chemins, flèches, scores, états, hover et FX. Aucun score ou état mutable n'est cuit dans le fond. Les faces et nombres proviennent des atlases raster, tandis que les segments sont tournés/mis à l'échelle depuis les centres de cases. Débris et flux restent bornés ; mouvement réduit désactive les trajets non essentiels.

`OrbitalImageFile` a été supprimé : LineFugg utilise maintenant le loader Phaser standard `load.image`. Le navigateur ne télécharge plus une source surdimensionnée avant de la réduire sur Canvas.

## Covers — remise aux normes du 12 septembre 2026

Les quatre PNG approuvés du 7 septembre restent intacts sous `public/assets/imported/linefugg/welcome/variants/` et demeurent les autorités de style, de sujet et de composition. Le lot du 12 septembre prolonge chaque jaquette vers le bas dans le même dessin afin d'obtenir un vrai cadre plein écran, sans bande noire ou floue et sans réinterprétation volontaire.

| Édition | Référence approuvée | Source restaurée | Master exact | Dérivé Core actif |
| --- | --- | --- | --- | --- |
| A — Pulp | `linefugg-cover-a-pulp-euro-approved-2026-09-07.png` — 941×1672 | `generated/linefugg/welcome/variants/sources/linefugg-cover-a-pulp-euro-source.png` — 853×1844 | `masters/linefugg-cover-a-pulp-euro-master.png` — 390×844 | `runtime/linefugg-cover-a-pulp-euro.webp` — 780×1688, 1 827 684 octets |
| B — Micro euro | `linefugg-cover-b-micro-euro-approved-2026-09-07.png` — 941×1672 | `generated/linefugg/welcome/variants/sources/linefugg-cover-b-micro-euro-source.png` — 853×1844 | `masters/linefugg-cover-b-micro-euro-master.png` — 390×844 | `runtime/linefugg-cover-b-micro-euro.webp` — 780×1688, 1 705 350 octets |
| C — Graphic poster | `linefugg-cover-c-graphic-poster-approved-2026-09-07.png` — 941×1672 | `generated/linefugg/welcome/variants/sources/linefugg-cover-c-graphic-poster-source.png` — 853×1844 | `masters/linefugg-cover-c-graphic-poster-master.png` — 390×844 | `runtime/linefugg-cover-c-graphic-poster.webp` — 780×1688, 1 694 510 octets |
| D — Japanese edition | `linefugg-cover-d-japanese-edition-approved-2026-09-07.png` — 941×1672 | `generated/linefugg/welcome/variants/sources/linefugg-cover-d-japanese-edition-source.png` — 853×1844 | `masters/linefugg-cover-d-japanese-edition-master.png` — 390×844 | `runtime/linefugg-cover-d-japanese-edition.webp` — 780×1688, 1 820 564 octets |

Micro-brief fermé : conserver chaque titre et composition approuvés ; prolonger uniquement le décor bas — table/carte et instruments, manteau/livres, trois routes sérigraphiées ou armillaire/architecture — sans `SWIPE TO PLAY`, CTA, signature, texte ajouté, faux cadre, miroir, étirement ou remplissage flou. Le sous-titre japonais déjà intégré à l'édition D appartient à son traitement de titre localisé.

Les sources et masters sont des PNG opaques, mono-frame. Les quatre WebP actifs sont opaques, `780×1688`, mono-frame et utilisent un payload `VP8L` lossless. `welcome.ts` emploie `fit: cover`, `objectPosition: 'top center'`, sélection seedée et aucune animation ; la variation de hauteur ne révèle que le prolongement décoratif bas. Les empreintes des quatre références approuvées restent dans `ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json`.

## Vérification

- `scripts/test-linefugg-runtime-assets.mjs` vérifie les 13 fichiers WebP actifs, leur signature, leur budget cumulé inférieur à 4,6 Mo, le fond Solar Origami et l'absence de PNG ou de référence Orbital dans les chemins actifs.
- Passe finale : `npm run build` réussi.
- Scénario navigateur 390×844 DPR2 tactile réussi : tracé, reroll, trois lignes, Undo, Valider, replay/retour ; aucune erreur HTTP/JavaScript.
- Captures `empty`, `drag`, `reroll-cascade`, `one`, `three`, `submitted` produites. Contrôle visuel téléphone et PC : grille, scores, astres, soleil, flux et commandes anglaises présents, lisibles et entièrement contenus dans le canvas utile.
- Les matrices historiques de `scripts/test-linefugg-browser.mjs` et `scripts/test-linefugg-covers.mjs` restent les preuves multi-écrans. Profilage sur téléphone physique et acceptation artistique finale utilisateur restent distincts.
- Remise aux normes cover : les quatre sources prolongées, masters `390×844` et dérivés `780×1688` sont décodés, opaques et mono-frame ; les WebP sont lossless. Le contrôle d'usage vérifie le plein cadre statique, l'ancrage haut et le chevauchement du bouton JOUER sur la seule zone décorative basse.

Le coût RGBA après décodage reste de l'ordre de la mesure précédente (~14,875 Mio hors fond CSS, textes et buffers) : WebP réduit le **transfert et le stockage**, pas mécaniquement la mémoire d'une texture décodée à dimensions identiques.
