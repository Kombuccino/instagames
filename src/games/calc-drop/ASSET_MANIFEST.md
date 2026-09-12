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
- Static images use top anchoring. Lower decoration may be cropped or covered by JOUER; the title must remain above that button.
- `pulp-euro`: original/cleaned composition is retained above the lower-body blend; the correction continues coat anatomy and restrained Tetra fragments instead of a black void.
- `micro-euro`: the correction is limited to the lower-body blend and narrow perimeter; the torso, low green-grid environment and normal image surface replace the empty floor and fake old-box frame.
- `graphic-poster`: only the narrow perimeter is corrected; interior paper grain and the existing lower-body ending are retained while the distressed border/corners are removed.
- PNG masters and sources are opaque, single-frame and technically decoded. Runtime WebPs are opaque, single-frame and use a `VP8L` lossless payload.
- The four-edition collection passed twelve browser cases on `360 × 611`, `390 × 844` and `1280 × 720`: static top anchoring, lossless `780 × 1688` WebP decoding, continuous fill, no cover canvas, no console/asset error and JOUER confined to the expendable lower zone.
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
