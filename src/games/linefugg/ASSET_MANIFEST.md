# LineFugg — Production asset manifest

Canonical implementation: 2026-09-07, Orbital Accounting. Follow docs/GAME_ART_PRODUCTION_PIPELINE.md and docs/ASSET_PIPELINE.md.

The approved concepts/orbital-stage-master-v1.png is reference-only. The user screenshot is the before comparison.

## Loaded assets

All paths relative to /assets/imported/linefugg/. New environment, board and armillary were verified through Drive/Actions before the local-transport clarification. Keep existing paths; future Codex art can go directly to public/assets/generated/linefugg/ and Git.

| Image | Preparation / ownership |
| --- | --- |
| backgrounds/orbital-environment.png | 887 × 1774 opaque quiet backdrop; Core surface cover crop; no mutable UI |
| ui/orbital-board.png | 1254², verified real alpha; cropped rails, corners and shared enamel tile reconstruct an exact 7×7 board |
| props/orbital-armillary-key.png | 1774 × 887 keyed sheet; separate ring and globe; native Phaser Key alpha 1, threshold .72, feather .14; small local filters; omitted in Canvas fallback |
| ui/orbital-cell-multiply-v3.png, ui/orbital-cell-divide-v3.png | Special material overlays; dynamic glyphs |
| ui/orbital-history-row-v5.png | Cropped NineSlice used as one parchment ledger, three dynamic chip rows and results |
| ui/orbital-total-plate-v5.png | Cropped NineSlice; live sigma and total |
| ui/orbital-control-dock-v5.png | Shared measured anchors for three orbs and five pips each |
| ui/orbital-undo-idle-v5.png, ui/orbital-validate-ready-v5.png | Single texture per control; disabled state via tint/alpha/grayscale |

Previous background, board panel and disabled button files are no longer loaded. They remain mirrored source material, not alternative runtime implementations. Preserve source originals; archive/retention of these Drive sources remains separate.

## Geometry and dynamic ownership

Stage 390 × 844, uniform scaling only. Board (34,155), 322², cells 46². Ledger y520, row height49; total center y704; controls center y778. Exact source frames and anchors live in LineFuggScene.ts and orbitalArt.ts.

Phaser owns values, signs, paths, arrows, halos, calculations, totals, pips and enabled states. Numbers render above paths. Positive additions after the first calculation token retain their + sign. No mutable state is baked beneath live objects.

## Rendering and effects

Slow armillary tilt/orbits, local brass glints, line energy, short ledger reveal, pooled sparks capped at 32 particles / 24 alive. No fullscreen bloom or camera shake. Reduced motion disables nonessential ambient motion and placement particles. Scene cleanup removes listeners and development hooks.

Runtime uploads capped at longest edge 1024, controls256; cache reused on restart. Sources and network bytes unchanged. Gameplay texture RGBA estimate: 11,137,024 bytes (10.62 MiB), excluding CSS background, text textures and render/filter buffers. This is not total GPU memory. Render density capped at2 without changing logical coordinates or pointer geometry.

## Verification

Six browser scenarios passed: small/standard/tall phone, tablet, desktop, reduced motion. Touch traces on phones; tests cover invalid overlap, three lines without auto-submit, sequential scoring, undo, explicit submit, replay and return to cover. Build and skill smoke test pass. Physical-device profiling and user acceptance of final art remain open. See GAME_STATUS.md.

Cover remains A METTRE A JOUR. Validated gameplay and canonical music choices are preserved.

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
