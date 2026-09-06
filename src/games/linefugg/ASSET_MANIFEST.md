# LineFugg — Production Asset Manifest

Status: canonical gameplay asset inventory for the approved Orbital Accounting direction.

All raster/illustrated production assets follow `docs/ASSET_PIPELINE.md`.

Canonical app prefix:

`/assets/imported/linefugg/`

## Integrated production raster

### `backgrounds/orbital-stage-master-v1.png`

Status: **integrated on main**.

Drive source:

`Fugg/linefugg/backgrounds/orbital-stage-master-v1.png`

GitHub mirror:

`public/assets/imported/linefugg/backgrounds/orbital-stage-master-v1.png`

Runtime URL:

`/assets/imported/linefugg/backgrounds/orbital-stage-master-v1.png`

Purpose: approved Orbital Accounting master plate providing the authored celestial/brass environment and visual material reference.

Runtime treatment:
- loaded by Phaser at the fixed logical stage `390×844`;
- uniformly cover-scaled, never used as a responsive layout source;
- its concept-only baked close icon is occluded because Core owns the close affordance;
- every baked gameplay zone in the master is covered by opaque Phaser-owned surfaces before the live gameplay is drawn;
- only the celestial/brass environmental artwork remains visible from the raster;
- no baked number, operator, line, calculation, score or button is used as game state.

This is the only raster required by the current gameplay implementation. Do not keep or introduce duplicate legacy gameplay artwork beside it.

## Phaser-rendered production surfaces

The following elements are intentionally engine-rendered because they are stateful or need exact logical geometry. They are not missing raster assets:

- exact 7×7 board geometry and hit areas;
- brass board chassis and enamel cell surfaces;
- positive, negative, multiplier and divisor cell materials;
- all numbers/operators;
- three line shafts and arrowheads;
- identical glow grammar for vermilion, violet and gold lines;
- luminous start/end nodes;
- moving start→end energy pulse;
- active drag preview and invalid-state feedback;
- live result plate under pointer/finger;
- selected/crossed-cell halos;
- three calculation rows and their dynamic formulas/results;
- total plate and mathematically derived total;
- Undo icon/button state;
- Validate icon/button state;
- three orbital line indicators;
- five pips per line, lit from the actual number of cells used;
- emerald Validate pulse only at 3/3;
- star twinkles, armillary tracing, glints and low-cost ambient motion.

## Geometry / layering contract

Everything is authored against one fixed `390×844` stage.

Layer order:

1. `orbital-stage-master-v1.png`;
2. dark/opaque masks over concept-only baked gameplay;
3. ambient celestial FX;
4. live board/cell surfaces;
5. line shafts and node glows;
6. cell numbers/operators **above the lines**;
7. calculation rows, total, controls and line indicators;
8. transient feedback and live result plate.

The board remains approximately 370 logical units wide. No device-specific geometry or alternate desktop/mobile composition is permitted.

## End-state contract

The asset/UI implementation must preserve the gameplay rule:

- line 3 does not resolve the run automatically;
- at 3/3 the player may still Undo and redraw;
- Validate becomes emerald only at 3/3;
- only the enabled Validate check calls `session.finish(...)`.

## Cover

Cover: **A METTRE A JOUR** after gameplay visual stabilization. No gameplay asset in this manifest should be treated as the final cover.

## Definition of integrated

A raster asset is production-integrated only when:

1. its final bytes live in the correct private Drive folder;
2. Drive sync mirrors the exact bytes into `public/assets/imported/linefugg/...` on `main`;
3. the mirrored file is verified in GitHub;
4. application code references only `/assets/imported/linefugg/...`;
5. no temporary Drive/public URL, manual binary upload or duplicate legacy asset is used.
