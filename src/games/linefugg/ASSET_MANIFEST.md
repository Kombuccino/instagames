# LineFugg — Production asset manifest

Canonical implementation: 2026-09-07, Orbital Accounting. Follow docs/GAME_ART_PRODUCTION_PIPELINE.md and docs/ASSET_PIPELINE.md.

The approved concepts/orbital-stage-master-v1.png is reference-only. The user screenshot is the before comparison.

## Loaded assets

All paths relative to /assets/imported/linefugg/. New environment, board and armillary were verified through Drive/Actions before the local-transport clarification. Keep existing masters; future Codex art can go directly to public/assets/generated/linefugg/ and Git.

| Canonical source | Runtime derivative / preparation |
| --- | --- |
| backgrounds/orbital-environment.png | `backgrounds/orbital-environment.webp`, 844 × 1688 lossless; CSS cover crop; no mutable UI |
| ui/orbital-board.png | `ui/orbital-board.webp`, 1024² lossless with real alpha; cropped rails, corners and shared enamel tile reconstruct an exact 7×7 board |
| props/orbital-armillary-key.png | `props/orbital-armillary-key.webp`, 1024 × 512 lossless keyed sheet; separate ring and globe; native Phaser Key alpha 1, threshold .72, feather .14 |
| ui/orbital-cell-multiply-v3.png, ui/orbital-cell-divide-v3.png | same-size 128² lossless WebP runtime derivatives; special material overlays; dynamic glyphs |
| ui/orbital-history-row-v5.png | `ui/orbital-history-row-v5.webp`, 1024 × 341 lossless; cropped parchment ornaments used behind dynamic rows |
| ui/orbital-validate-ready-v5.png, ui/orbital-validate-disabled-v5.png | 256² lossless WebP derivatives; complete authored button states |
| generated accounting-panels.png, glass-indicators.png, validate-amber-source.png | still PNG on network; Phaser keeps the existing useful-resolution upload cap; separate local conversion remains possible later |

Previous background, board panel and unused control files are no longer loaded. They remain mirrored source material, not alternative runtime implementations. Preserve source originals; archive/retention of these Drive sources remains separate.

## Runtime derivative optimization — 2026-09-11

ChatGPT prepared and visually checked lossless WebP derivatives from the existing approved/source PNGs, then used the documented private Drive → Actions importer. The importer run succeeded before code cutover. No master PNG was overwritten or regenerated.

The 12 active imported images covered by this pass — background, board, armillary, ×/÷ cells, ready/disabled Validate, ledger ornament and four covers — totalled **21,578,385 bytes** as PNG sources and **9,083,568 bytes** as runtime WebP derivatives: **57.9 % less network transfer** for this set. This number is file-transfer size, not decoded GPU memory.

The Phaser derivatives intentionally match the dimensions the previous `OrbitalImageFile` loader was already uploading to the texture cache, so gameplay geometry and decoded texture footprint remain essentially unchanged while the browser stops downloading oversized imported PNGs first. `orbitalArt.ts` remaps only the seven known imported LineFugg Phaser sources; generated local PNGs are left untouched.

The four cover runtime derivatives are 780 × 1386 opaque WebP lossless files, preserving the approved 941 × 1672 compositions and aspect ratio at up to 2× a 390-wide cover column. `welcome.ts` points only to `welcome/variants/runtime/*.webp`; the approved PNGs remain the canonical art masters and archive references. The Core still uses `fit: contain`, seeded selection, no timed rotation and no cover animation.

Local checks confirmed decode, dimensions and `VP8L` lossless WebP chunks. Browser cover CI verifies that the runtime requests WebP derivatives, preserves all four selections/titles across phone/tablet/desktop and does not request the approved PNG masters during normal cover rendering.

## Geometry and dynamic ownership

Stage 390 × 844, uniform scaling only. Board (34,155), 322², cells 46². Ledger y520, row height49; total center y704; controls center y778. Exact source frames and anchors live in LineFuggScene.ts and orbitalArt.ts.

Phaser owns values, signs, paths, arrows, halos, calculations, totals, pips and enabled states. Numbers render above paths. Positive additions after the first calculation token retain their + sign. No mutable state is baked beneath live objects.

## Rendering and effects

Slow armillary tilt/orbits, local brass glints, line energy, short ledger reveal, pooled sparks capped at 32 particles / 24 alive. No fullscreen bloom or camera shake. Reduced motion disables nonessential ambient motion and placement particles. Scene cleanup removes listeners and development hooks.

Runtime textures are capped at the useful display size; scene restarts reuse the texture cache. Current source texture RGBA estimate after illustrated-state restoration remains 15,597,568 bytes (14.875 MiB), excluding CSS background, text and framebuffer/filter storage. WebP reduces transfer/storage, not the RGBA cost of the decoded textures. Render density remains capped at2 without changing logical coordinates or pointer geometry.

## Verification

Six browser scenarios passed historically: small/standard/tall phone, tablet, desktop, reduced motion. Touch traces on phones; tests cover invalid overlap, three lines without auto-submit, sequential scoring, undo, explicit submit, replay and return to cover. The optimized cover workflow also passed its WebP path/dimension/selection checks. Physical-device profiling and user acceptance of final gameplay art remain open. See GAME_STATUS.md.

Cover is current as a static collection. Validated gameplay and canonical music choices are preserved.

## DA2 lower-console replacement — 2026-09-07

Runtime now uses /assets/generated/linefugg/ui/accounting-panels.png instead of the five former history/total/dock/button textures. Generated locally using LineFugg-DA2.png as reference; original source preserved. Sheet is 1536×1024 RGB, with opaque brown outside components (no alpha). A preceding fake-checker export was rejected and never imported. Measured Phaser texture frames isolate ledger, total, dock and two blank circular buttons; geometric circle masks remove button surroundings. Symbols, scores, arrows, orbs and pips remain engine-owned. Panel corners retain the source's small bronze surround. No keyed filter is needed for this console.

The atlas is uploaded at 1024 longest edge. Current gameplay texture RGBA estimate is 9,220,096 bytes (8.79 MiB), with the same exclusions noted above; this replaces the earlier 10.62 MiB estimate. See ART_DIRECTION.md's DA2 section for the authoritative lower coordinates, superseding earlier geometry. Old five UI source files are no longer loaded.

DA2 reference preserved byte-for-byte at public/assets/generated/linefugg/references/lower-console-da2.png (reference only, never loaded at runtime). It is user-supplied art, not generated art; location groups this local production pass. Final six-format matrix, mouse hover enter/leave including canvas exit, touch play and build passed.

## Illustrated-state restoration — supersedes flat console states

Restored runtime assets: orbital-validate-ready-v5.png and orbital-validate-disabled-v5.png (complete authored button, no substituted check glyph or grayscale approximation); orbital-history-row-v5.png supplies measured left/right ornaments for the three parchment rows. Ledger ×/÷ use the existing special-cell textures instead of tinting the navy tile.

Local generated glass-indicators.png: 1254² opaque navy sheet with three illustrated glass orbs and three bead sources. Measured frames plus circular Phaser geometry masks remove surrounding pixels; 3 orbs and 15 stateful pips reuse this texture. Never repaint these as flat circles. Inactive beads dim the same illustrated source.

Local validate-amber-source.png: 1254² RGB generated hover variant from the existing ready button. The generator painted a checker outside the silhouette: that region is NOT displayed. Only the clean central glass region [252,250,748,748] is used, clipped to a circle and laid over the original transparent ready button. This preserves the original metal frame and excludes all fake transparency. Preserve original sources. No color-key filter or full-screen effect is required for these components.

The previous atlas's plain green button is no longer used. Sigma and total are optically centered by measuring visible glyph alpha only when score changes, never per animation frame. Hover orange is enabled only after three lines; leaving the canvas clears it, and hover never submits. The active button's existing glass supplies the light rather than procedural rings over its frame.

Final verification: all six browser scenarios passed, including amber hover/leave, no hover submission, undo restoring the authored disabled state, touch tracing and replay. Build/typecheck and skill smoke passed. Current source texture RGBA estimate 15,597,568 bytes (14.875 MiB), excluding CSS background, text and framebuffer/filter storage; supersedes prior lower estimates after restoring authored textures. User art acceptance and physical-device profiling remain open.

## Four approved cover masters — 2026-09-07

The user approved the four individual covers with « VOILA !!! CA C'est GENIAL !!!! » at 12:50:57 UTC, then requested their storage at 12:58:37 UTC. Preserve these exact images, not the earlier central-planets/astrolabe studies or comparative boards. Their editorial treatments follow docs/DA_COVER.md and are intentionally different from gameplay art.

Production Drive: Fugg/linefugg/welcome/variants/ (folder 1raVfVGgBAKULJXtrxPWD2Nk9mlLXSQxW).
Validated archive: MiniFugg - Graphic Archive/Games/linefugg/covers-validated/ (folder 1zeF2Sx-Ci0-vQCwh1QCCG1esUw9XTuvq).
Repository destination: public/assets/imported/linefugg/welcome/variants/.

| Edition | Exact filename | Recognizable subject |
| --- | --- | --- |
| A — Pulp / narrative | linefugg-cover-a-pulp-euro-approved-2026-09-07.png | Red-coated astronomer leaning over his chart with a pen |
| B — European micro edition | linefugg-cover-b-micro-euro-approved-2026-09-07.png | Cartographer seen over the shoulder, compass and circular chart |
| C — Graphic poster | linefugg-cover-c-graphic-poster-approved-2026-09-07.png | Red/blue/yellow paths over a numbered world; flat observatory silhouette |
| D — Japanese edition | linefugg-cover-d-japanese-edition-approved-2026-09-07.png | Young illustrated astronomer on a balcony above clouds |

All four originals are 941×1672 RGB PNGs, opaque, stored without resize, crop, recompression or regeneration. At the time of their 7 September archival pass no optimized derivative had yet been produced. Source filenames, generation IDs, Drive/archive file IDs, byte lengths and expected SHA-256/Git blob hashes are recorded in [the import receipt](../../../ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json).

The initial storage pass did not activate the covers. The later explicit integration request at 13:31:32 UTC authorized the static cutover; it did not authorize replacing or regenerating these masters.

## Active static cover collection

[welcome.ts](welcome.ts) exports LINEFUGG_WELCOME, consumed by the LineFugg registry entry. The four approved artworks remain the canonical collection, but runtime now loads the lossless WebP derivatives in `welcome/variants/runtime/` rather than downloading the 941×1672 PNG masters. All four remain available at score zero; Core's seed-based selection chooses a stable edition for each feed slot, and the first edition supplies the creator/catalog thumbnail. No timed slideshow, animation layers or Phaser cover instance is added.

The registry marks only LineFugg's cover migration current. The shared CSS keys the migration marker to that metadata, so no global badge removal or game-specific CSS override is needed. The historical placeholder is not referenced by the registry.

The reproducible browser check is scripts/test-linefugg-covers.mjs. It verifies preserved PNG master SHA-256/dimensions, WebP runtime paths and natural dimensions, all four selections, still rendering, marker removal, launch/return and unchanged pending-game markers. No gameplay rule, Core column sizing or music changed in the optimization pass.
