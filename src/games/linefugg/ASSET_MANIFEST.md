# LineFugg — Production Asset Manifest

Status: canonical modular gameplay asset inventory for the approved **Orbital Accounting** direction.

Production method: `docs/GAME_ART_PRODUCTION_PIPELINE.md`.
Image transport: `docs/ASSET_PIPELINE.md`.

Canonical app prefix: `/assets/imported/linefugg/`.

## Reference-only master

`concepts/orbital-stage-master-v1.png`

Status: **REFERENCE ONLY — never render in gameplay**.

This is the flattened approved DA/master. It may contain baked board/UI/control state and exists only to preserve the approved composition/material language. It must never be used as a runtime background or atlas. Production runtime uses only the isolated assets below.

## Runtime layer stack

### 1. Permanent environment

`backgrounds/orbital-stage-bg-v3.png`

- family: permanent environment;
- pure celestial/astronomical background;
- no grid, score, rows, controls, translated copy or baked gameplay state;
- authored for the complete `390×844` logical stage;
- runtime depth: lowest game layer.

### 2. Animatable decoration

`props/orbital-upper-ornament-v3.png`

- family: animatable decoration;
- isolated upper armillary/observatory ornament;
- no gameplay information baked in;
- may float/breathe slowly while procedural Phaser rings/glints animate independently.

### 3. Structural gameplay surfaces

`ui/orbital-board-frame-v4.png`

- isolated brass frame around the exact dynamic 7×7 board;
- transparent gameplay center;
- no numbers, paths or controls baked in.

Cell family:

- `ui/orbital-cell-neutral-v2.png`
- `ui/orbital-cell-multiply-v3.png`
- `ui/orbital-cell-divide-v3.png`

Raster owns only material/bezel. Phaser owns every number/operator glyph and every selected/crossed/preview/error state.

`ui/orbital-calc-row-v3.png`

- reusable blank parchment calculation strip;
- exactly 3 instances;
- Phaser owns marker, formula, equals sign and result.

`ui/orbital-total-plate-v3.png`

- blank brass/navy total plate;
- Phaser owns sigma and total value.

`ui/orbital-control-dock-v4.png`

- lower observatory ornament tying the controls into one instrument;
- contains no button, icon, pip or state.

### 4. Stateful line indicators

- `ui/orbital-indicator-red-v4.png`
- `ui/orbital-indicator-violet-v4.png`
- `ui/orbital-indicator-gold-v4.png`

Raster owns bezel + colored celestial core. Phaser owns dim/active alpha, pulse and the 5 pips per line. Pip count always equals the current line cell count and is never baked into an image.

### 5. Stateful controls

Undo:

- `ui/orbital-undo-disabled-v4.png`
- `ui/orbital-undo-idle-v4.png`
- `ui/orbital-undo-pressed-v4.png`

Validate:

- `ui/orbital-validate-disabled-v4.png`
- `ui/orbital-validate-ready-v4.png`
- `ui/orbital-validate-pressed-v4.png`

Rules:

- controls are isolated assets, never part of background/dock;
- universal icon is intentionally baked into each isolated state sprite;
- Validate is green only in ready/pressed enabled states;
- only pointer-up from enabled Validate may call `session.finish(...)`.

## Phaser-owned dynamic gameplay

Never bake these into raster production assets:

- exact 7×7 geometry/hit areas;
- all numbers/operators;
- positive/negative arithmetic tokens;
- all three path shafts and arrowheads;
- luminous start/end nodes;
- active drag preview and invalid drag state;
- live result under pointer/finger;
- selected/crossed-cell overlays;
- path travel pulse;
- formulas/results;
- total numeric value;
- five indicator pips per line;
- transient glints/ripples/particles;
- slow procedural orbital rings/stars.

Numbers/operators always render above paths.

## Canonical 390×844 composition

One authored composition only; no device-specific rearrangement.

Layer order:

1. pure background;
2. upper ornament + ambient orbital FX;
3. board frame;
4. dynamic cell surfaces/grid content;
5. path/glow layer;
6. cell glyphs above paths;
7. 3 calculation strips;
8. total plate;
9. control dock;
10. Undo — 3 indicators/pips — Validate;
11. transient live/feedback FX.

Core close-box clearance remains respected in the upper-left.

## Representative state validation

Before considering the visual implementation stable, inspect:

1. 0 lines;
2. active drag;
3. 1 line;
4. 2 lines;
5. 3 lines before validation;
6. Validate ready/green;
7. invalid path;
8. Undo after 3 lines;
9. Validate press/submit transition.

There must be no ghost button, duplicate board, fake score, baked path or hidden copy of mutable UI in any state.

## Gameplay contract preserved

- board: 7×7;
- max 3 lines;
- max 5 cells per line;
- pairwise crossing: max 1 shared cell;
- scoring unchanged;
- daily board unchanged;
- after line 3 the run remains editable;
- only Validate submits to Core/ladder;
- Undo remains available before submission.

## Cleanup policy

Runtime folders contain only the current production files. Superseded `multiply/divide v2` assets were removed after the v3 cutover. The flattened master was moved out of `backgrounds/` into `concepts/` so it cannot be mistaken for runtime art.

## Cover

Cover remains **A METTRE A JOUR** until gameplay art is visually stabilized.

## Definition of integrated

A raster asset is production-integrated only when:

1. final bytes are under the correct private Drive path;
2. Drive sync mirrors them into `public/assets/imported/linefugg/...` on `main`;
3. the mirror is explicitly verified;
4. Phaser references only `/assets/imported/linefugg/...`;
5. no flattened mockup fakes multiple runtime layers;
6. no obsolete runtime reference remains after cutover.
