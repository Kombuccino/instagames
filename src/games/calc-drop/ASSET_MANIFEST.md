# TetraMindFck — Asset Manifest

## Static cover pilot — 2026-09-12

The three imported flat posters remain the approved visual references for their editions. Generated files below are technical derivatives only: localized removal of non-title copy, continuous lower artwork for the exact MiniFugg Cover ratio, and removal of fake damaged perimeter treatments. The user accepted all three corrected covers on 2026-09-12. The independently reconstructed Japanese edition was accepted later the same day and is now the fourth production cover.

| Edition | Approved reference | Edited source | Master | Runtime |
| --- | --- | --- | --- | --- |
| Pulp européen | `public/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v1-pulp-euro-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v1-pulp-euro-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v1-pulp-euro.webp` — 780×1688 WebP lossless |
| Micro Europe 90s | `public/assets/imported/tetramindfck/welcome/variants/v2-micro-euro.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v2-micro-euro-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v2-micro-euro-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v2-micro-euro.webp` — 780×1688 WebP lossless |
| Affiche graphique | `public/assets/imported/tetramindfck/welcome/variants/v3-graphic-poster.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v3-graphic-poster-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v3-graphic-poster-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v3-graphic-poster.webp` — 780×1688 WebP lossless |
| Édition japonaise | `GFX/crea-chatgpt/game/ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, top-row variant 4 — approved style/composition reference | `public/assets/generated/tetramindfck/welcome/variants/sources/v4-japanese-edition-source.png` — 853×1844 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v4-japanese-edition-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v4-japanese-edition.webp` — 780×1688 WebP lossless |

## Pilot constraints and validation state

- Text allowed in every final cover: the game title only — `TetraMindFck` for the first three editions and the exact localized title `テトラマインドファック` for the Japanese edition.
- Original title, subject, palette, composition and medium remain authoritative; this pass does not approve reinterpretation.
- The user-calibrated runtime positions are `20.7%`, `26.8%`, `28.1%` and `49.7%`. Core reads the untouched title strip from the same static raster above the calibrated base crop, so no title or illustration is regenerated.
- `pulp-euro`: original/cleaned composition is retained above the lower-body blend; the correction continues coat anatomy and restrained Tetra fragments instead of a black void.
- `micro-euro`: the correction is limited to the lower-body blend and narrow perimeter; the torso, low green-grid environment and normal image surface replace the empty floor and fake old-box frame.
- `graphic-poster`: only the narrow perimeter is corrected; interior paper grain and the existing lower-body ending are retained while the distressed border/corners are removed.
- PNG masters and sources are opaque, single-frame and technically decoded. Runtime WebPs are opaque, single-frame and use a `VP8L` lossless payload.
- The four-edition collection passed twelve browser cases on `360 × 611`, `390 × 844` and `1280 × 720`: calibrated static crops, lossless `780 × 1688` WebP decoding, continuous fill, preserved titles, no cover canvas, no console/asset error and JOUER confined to the expendable lower zone.
- The superseded Phaser layer bundles and shared animated-cover runtime were removed after acceptance. Git history preserves the experiment; production contains only the static set.

## Japanese edition reference recovered — 2026-09-12

- Primary reference board: `GFX/crea-chatgpt/game/ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, top row, variant 4 “VARIANTE JAPONAISE”. This is the same board that contains the three directions from which the accepted set originates.
- The intended edition uses an energetic vertical manga composition: alarmed young character low in frame, dense diagonal fall of Tetra pieces, deep violet/blue ground, warm orange figure and large integrated Japanese title.
- Supporting boards in the same `19_27_48` series contain related Japanese explorations, but none is the standalone full-resolution original of that exact fourth image.
- The historical gap was resolved by a faithful standalone reconstruction rather than by cropping or upscaling the concept board. That exact reconstruction was explicitly approved before production promotion.

## Japanese edition production promotion — 2026-09-12

The primary Japanese tile and five supporting studies were isolated as reference-only crops under `GFX/crea-chatgpt/game/tetramindfck/japanese-research/`. These crops preserve the concept-board pixels; they are not production masters and were not sent together to the generator. The sole generation reference was `japanese-violet-orange-manga-reference.png`, isolated from board `(1)`.

| Role | Production file | Technical state |
| --- | --- | --- |
| Generated source | `sources/v4-japanese-edition-source.png` | 853×1844 opaque PNG; SHA-256 `d1569e44c1967298ffeca131a03b35557daea6599ad38478a49317ba301cc8c3` |
| Exact Cover master | `masters/v4-japanese-edition-master.png` | 390×844 opaque PNG; SHA-256 `e58cf8ddc5a6275d05454e372a4b6a4c55cca51ae426921b1fa851b81bc76db9` |
| Runtime derivative | `runtime/v4-japanese-edition.webp` | 780×1688 opaque single-frame WebP; `VP8L` lossless payload; SHA-256 `aee59498f084d8030c7a3f52ce0ac7350ec241d0f1c92e247fc52ffccff23f4c` |

Micro-brief: faithful standalone reconstruction of the violet/orange Japanese tile; nervous late-80s/early-90s commercial manga ink, alarmed black-haired young adult low on a diagonal, orange clothing continuing through BAS, hard-perspective colored-piece avalanche, indigo/violet printed ground and coarse halftone. Closed text list: `テトラマインドファック` only. Explicit removals: side copy, `SWIPE TO PLAY`, arrow, MiniFugg mark, physical frame, blank lower band, glossy anime polish and modern cyberpunk treatment.

Control state: artistic `accepté par l’utilisateur` on 2026-09-12 for the exact standalone master; technical `conforme` for format, dimensions, opacity and lossless runtime payload. The three verified files are copied unchanged into the production tree and the runtime derivative is registered in `welcome.ts`. The live Core overlay passed the three-height browser matrix with no lower title/logo conflict. Private Graphic Archive upload remains pending because no archive connection is available in this local pass.

---

# Gameplay CRT production — 2026-09-19

This section replaces the former SCORE-led 2026-09-12 production plan. The approved gameplay contract is in `ART_DIRECTION.md`. Scope of this pass: reference preservation, layer inventory, review specimens and visual translation boards. **No final pack, public import, Lab UI wiring or runtime integration is claimed.**

## Approved reference and archive

Private archive folder: `MiniFugg - Graphic Archive/Games/tetramindfck/gameplay-production-2026-09-19`, Drive `1cVoRYkEmFleYRc9PVnzdZiM_HFXc3W43`.

| Deliverable | Identity / dimensions | Status |
| --- | --- | --- |
| Exact approved gameplay image | `tetramindfck-gameplay-da-approved-2026-09-19.png`; Drive `1uwp0dczINJlFOX1eMle5xtjXZNLBuxo7`; 853×1844 opaque PNG; SHA-256 `25b66ea0292439a32047cdd7d544ca4e553f1f8855ec68cab156e45c231b9a83` | User-approved style reference; byte-preserved; not runtime art |
| Composition and ownership board | `01-composition.png`; Drive `171vEdyI1uP5KvjBtK6iSTP5S5VtoHHnU`; 2340×2000 | Technical annotated copy; review |
| Raster glyphs and button states | `02-glyphes-commandes.png`; Drive `11zSXtChhQ5RmP1qw3n6enoINIhSvSiLM`; 2340×2000 | Specimen/state proposal; review |
| Calculation storyboard | `03-calcul-mouvement.png`; Drive `1EnHa2W5LfydmzgFqejMcigi18hCOssV8`; 2340×2000 | Engine-state proposal; review |
| Preparation package | `tetramindfck-production-preparation.zip`; Drive `129nDDEw_OXC2UI4T9MLCvsJ6zZ4JiHu_` | Private package: original, boards, offline HTML, inventory, glyph specimens, metadata and verification |

The review boards are documents, not full-stage textures. Do not confuse their dimensions with the ×2 runtime specification. The original remains unmodified; annotations live only on separate copies.

## Format and coordinate contract

- Stage target: 390×850 **logical units**; full-stage production export at ×2: 780×1700 **pixels**.
- Bottom anchoring; guaranteed logical window y140–850. Existing 390×844 runtime stays unchanged until the dedicated migration.
- PNG source/master; WebP lossless runtime derivatives. No JPEG. AVIF only for a measured large opaque background with fallback.
- Proposed board: x124, y206, 230×460 logical units, 10×20 cells of23×23. These are blockout proposals pending mini-slice validation, not measured final assets.
- Proposed TARGET field: x116, y153, 248×30; proposed separate calculation band: x116, y184, 248×20. Never hide TARGET or use the tenth board column for a result.
- Proposed main-button boxes: x18/106/194/282, y699, each82×66; DOWN x63, y793, 80×42. Test actual hitboxes and labels with Core RETOUR before promotion.
- ChatGPT runtime transport, when final derivatives exist: private Drive Fugg → Actions mirror → verified `public/assets/imported/tetramindfck/...`. Archive studies are not silently promoted through this route.

## Inventory — 25 production responsibilities

This is the inventory to mirror into the Tetra Production Lab plan. Missing clean images stay `todo`; proposals stay `review`. A reference crop is not a clean asset.

| ID | Element | Owner | Status / requirement |
| --- | --- | --- | --- |
| D-environment | Room ambience | Raster | todo; opaque, no console, text or live content; extra height above only |
| D-shell | Cream console shell | Raster | todo; alpha, clean apertures, title only; no grid/HUD/buttons baked |
| D-crt | Empty CRT surfaces / glass | Raster + Phaser | todo; restrained glass optional; never obscure digits |
| D-grid | Exact10×20 grid | Phaser | review;200 square cells; authoritative coordinates |
| D-cell | Shared tile face | Raster + Phaser | todo; same square template; green numbers, warm ×, amber ÷, cyan ⇄ |
| D-cell-glyphs | Cell digits / operators | Raster atlas + Phaser | review;1–9 contour specimen exists; ×, ÷, ⇄ and final atlas still to produce |
| D-hud-glyphs | TARGET / LEVEL / result glyphs | Raster atlas + Phaser | review;0–9 broad-segment specimen; punctuation and final metrics still to produce |
| D-target | Wide TARGET readout | Phaser + atlas | review;replaces SCORE; test50/50000/100000/170000/9999999 without squashing |
| D-level | LEVEL readout | Phaser + atlas | review;minimum two digits; test09/10/99/100 without truncation |
| D-brand | Small MiniFugg mark | Canonical brand source | todo;one mark only; no new invented Fuggy |
| D-next | NEXT / NEXT+1 and marker | Phaser + atlas | review;center actual bounds; horizontal I has four full cells |
| D-active | Active piece / movement | Phaser | review;square cells and restrained edge lift |
| D-ghost | Landing projection | Phaser | review;low-alpha outline; collision-derived location |
| D-lock | Lock / landing feedback | Phaser | review;preserve three-tick rule; short local edge pulse |
| D-buttons | Four main physical controls | Raster + Phaser | todo;equal silhouettes; anticlockwise left, clockwise right |
| D-down | Smaller DOWN control | Raster + Phaser | todo;under movement pair; full touch target visible |
| D-button-states | Control state matrix | Phaser + raster bases | review;idle/focus/pressed/held/released/blocked/cancel |
| D-clear | Arithmetic scan | Phaser + atlas | review;full rows only; frozen board; direction and intermediate totals |
| D-result | Separate calculation band | Phaser + atlas | review;new proposal below TARGET, outside board; long values visible |
| D-collapse | Cleared-row collapse | Phaser | review;after final result only; no premature fall |
| D-level-up | Level / target transition | Phaser + Core audio | review;compare single-clear total then update; local pulse only |
| D-audio | Semantic sounds / music | Core | review;reuse established identities and reactive arrangements |
| D-lifecycle | Pause / return / end / resume | Core + Phaser | review;stop inputs, tweens and audio when inactive; Core owns terminal UI |
| D-layout | Bottom anchor / ×2 scaling | Core + Phaser | review;single composition, canonical viewport matrix, no horizontal shrink |
| D-metric | Leaderboard / cover-unlock metric | Product + Core | blocked;no silent migration from cumulative score to level-based persistence |

## Raster specimens actually produced

Files below are inside the private preparation ZIP. No new runtime path is registered.

| Specimen | Dimensions / frames | Provenance and validation |
| --- | --- | --- |
| `cell-digits-specimen.png` / `.webp` / `.json` | 432×48 RGBA; nine48×48 frames | Dark1–9 contours isolated from exact approved raster; source sampling positions retained; review only |
| `hud-digits-specimen.png` / `.webp` / `.json` | 400×60 RGBA; ten40×60 frames; advance44 | Custom rasterized seven-segment proposal0–9, not a system font and not exact extraction; review only |

Both WebPs are single-frame VP8L lossless; decoded RGBA pixels equal the corresponding PNG. Transparent margins are real. Atlas frame dimensions include padding and do not redefine the23×23 logical board cell. No font binaries are distributed.

Cell atlas PNG SHA-256: `2bf4829eaf43fd472d081c4ad791c3584b529eb9fac75550487685bf6735c554`; WebP: `c4d7520eef47e057c71ff1a4ac4adf63f1b692464256c1623f0d679094f4993b`.

HUD atlas PNG SHA-256: `a1c1bae6ab75e4e6ece8f3849bf792501e9a98ebf1be9cbba174bda49c91dc9c`; WebP: `dbc3c6c409065f0a1d89bf6be0f008e1c109c8b744bab6ee9dba78746786c0f3`.

The green tile faces in the technical diagrams are illustrative engine-state supports, not final authored tile surfaces. Button-state vignettes use explicitly identified reference crops; they are not clean button exports. Previously imported gameplay files must be audited against this new contract before reuse; their mere presence on main is not approval of the new pack.

## State and motion recipes — review proposals

- Controls: same physical base;idle → pressed approximately2 logical units over70ms → stable held → return over90ms. Focus outline for keyboard. Blocked state dims locally. Pointercancel, blur, return and deactivation reset visual and logical hold. Reduced motion changes brightness instead of travel. Budget: light.
- Active / ghost / lock: exact shared cells, weak ghost outline at collision projection, local lock edge pulse approximately100ms. No generic floating or camera shake. The pulse does not replace the three-tick lock rule. Budget: light / punctual.
- Clear: ten occupied cells → board frozen → directional scan with intermediate values → final result in proposed separate calculation strip → wipe → collapse → next piece. Storyboard example is ten5 cells, sum50, subtotal25 after the fifth cell. Initial timing reference approximately1.18s. Multiple completed rows preserve operation order and compare the sum for the same clear. Reduced motion shows result then wipe without sweep. Budget: punctual.
- Level: after clear comparison, update LEVEL and TARGET; one proposed local180ms pulse and existing Core level-up sound. Keep long values readable. Budget: light.
- Audio: reuse move, rotate, deliberate soft drop, landing, arithmetic scan, bonus, large result, level-up and end; no new audio files or music arrangement changes in this pass.

## Gates and remaining work

1. Wire the prepared inventory into the canonical Production Lab UI. Keep DA source identity explicit, missing source images honest and Release empty; do not use private Drive hotlinks as runtime image paths.
2. Validate the three technical boards, particularly the new result-strip placement and HUD segment specimen. Global DA approval does not automatically approve these new proposals.
3. Produce/recover clean shell, room, button, tile, operator and brand sources. Complete glyph punctuation, metrics and states. Only then export final lossless derivatives and verify the import route.
4. Integrate one representative slice, preserving the approved material look rather than replacing the shell with permanent generic geometry.
5. Test390×850, A54 Chrome360×656, iPhone390×712, degraded Brave360×611 and desktop16:9, with bottom anchoring and Core RETOUR; inspect glyphs at actual phone size, large values, I previews, both rotations, line completeness, simultaneous clears and lifecycle.
6. Run typecheck/build and actual gameplay checks before marking migration current. This preparation pass ran only file/image checks, not build, runtime or deployment validation.

## Playable TARGET slice — 2026-09-19

- Runtime HUD atlas: `public/assets/generated/tetramindfck/gameplay/ui/tetramindfck-hud-digits.webp` — 400×60, ten frames 40×60, VP8L lossless. It renders LEVEL, TARGET and calculation values.
- Historical `*-down.webp` variants are not used by this slice because at least one changes the icon direction. Clean `*-up.webp` faces remain authored sources; Phaser owns press/hold/release/blocked motion.
- Orange rotate-left and cyan rotate-right are horizontally mirrored in Phaser to restore counterclockwise / clockwise semantics without repainting the accepted material.
- MiniFugg rail animation is engine-owned pixel graphics with discrete Game & Watch poses.
- Intermediate and final arithmetic values render in the CALC strip separate from the exact 10×20 board.
- The cream shell remains a representative structural slice. A final clean authored shell/background source is still required before the art pack can be called complete.
