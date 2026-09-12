# TetraMindFck — Asset Manifest

## Static cover pilot — 2026-09-12

The three imported flat posters remain the approved visual references. Generated files below are technical derivatives only: localized removal of non-title copy, continuous lower artwork for the exact MiniFugg Cover ratio, and removal of fake damaged perimeter treatments. The user accepted all three corrected covers on 2026-09-12.

| Edition | Approved reference | Edited source | Master | Runtime |
| --- | --- | --- | --- | --- |
| Pulp européen | `public/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v1-pulp-euro-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v1-pulp-euro-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v1-pulp-euro.webp` — 780×1688 WebP lossless |
| Micro Europe 90s | `public/assets/imported/tetramindfck/welcome/variants/v2-micro-euro.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v2-micro-euro-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v2-micro-euro-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v2-micro-euro.webp` — 780×1688 WebP lossless |
| Affiche graphique | `public/assets/imported/tetramindfck/welcome/variants/v3-graphic-poster.png` — 941×1672 | `public/assets/generated/tetramindfck/welcome/variants/sources/v3-graphic-poster-source.png` — 941×2037 PNG | `public/assets/generated/tetramindfck/welcome/variants/masters/v3-graphic-poster-master.png` — 390×844 PNG | `public/assets/generated/tetramindfck/welcome/variants/runtime/v3-graphic-poster.webp` — 780×1688 WebP lossless |

## Pilot constraints and validation state

- Text allowed in every final cover: `TetraMindFck` only.
- Original title, subject, palette, composition and medium remain authoritative; this pass does not approve reinterpretation.
- Static images use top anchoring. Lower decoration may be cropped or covered by JOUER; the title must remain above that button.
- `pulp-euro`: original/cleaned composition is retained above the lower-body blend; the correction continues coat anatomy and restrained Tetra fragments instead of a black void.
- `micro-euro`: the correction is limited to the lower-body blend and narrow perimeter; the torso, low green-grid environment and normal image surface replace the empty floor and fake old-box frame.
- `graphic-poster`: only the narrow perimeter is corrected; interior paper grain and the existing lower-body ending are retained while the distressed border/corners are removed.
- PNG masters and sources are opaque, single-frame and technically decoded. Runtime WebPs are opaque, single-frame and use a `VP8L` lossless payload.
- Build and nine browser cases passed: `360 × 611`, `390 × 844` and `1280 × 720` across all three variants, with no cover canvas/Phaser host or console error.
- Phaser layer bundles under `public/assets/imported/tetramindfck/welcome/parallax/` are superseded legacy assets. Remove them with the shared animated-cover runtime now that the static set is accepted.

## Japanese edition reference recovered — 2026-09-12

- Primary reference board: `GFX/crea-chatgpt/game/ChatGPT Image 5 sept. 2026, 19_27_48 (1).png`, top row, variant 4 “VARIANTE JAPONAISE”. This is the same board that contains the three directions from which the accepted set originates.
- The intended edition uses an energetic vertical manga composition: alarmed young character low in frame, dense diagonal fall of Tetra pieces, deep violet/blue ground, warm orange figure and large integrated Japanese title.
- Supporting boards in the same `19_27_48` series contain related Japanese explorations, but none is the standalone full-resolution original of that exact fourth image.
- Status: visual direction recovered, production master still missing. Do not crop or upscale the board into a runtime cover, and do not promote a fourth variant before a faithful standalone reconstruction is explicitly approved.
