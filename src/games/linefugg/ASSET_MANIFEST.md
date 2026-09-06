# LineFugg — Production Asset Manifest

Status: canonical modular gameplay asset inventory for the approved **Orbital Accounting** direction.

Production method: `docs/GAME_ART_PRODUCTION_PIPELINE.md`.
Image transport: `docs/ASSET_PIPELINE.md`.
Canonical app prefix: `/assets/imported/linefugg/`.

## Reference-only master

`concepts/orbital-stage-master-v1.png`

**REFERENCE ONLY — never render in gameplay.** It preserves the approved DA/composition and is only a style source.

## Runtime v5 layer stack

### 1. Permanent environment / overscan

`backgrounds/orbital-stage-bg-v5.png`

- pure celestial observatory environment;
- no grid, score, controls, text or baked mutable gameplay;
- rendered by the React LineFugg wrapper as the decorative backdrop of the Core-owned game surface;
- use CSS `cover`: narrow/tall screens crop non-critical left/right decoration instead of shrinking the backdrop to `contain`;
- Phaser remains transparent and owns the fixed 390×844 gameplay composition above it;
- the backdrop stops at the Core game-surface boundary; desktop gutters remain Core-owned/black.

### 2. Board instrument

`ui/orbital-board-panel-v5.png`

- single static board instrument containing brass chassis + dark celestial 7×7 interior;
- contains no numbers/operators, path, score or mutable state;
- replaces the previous split neutral-cell/frame composition;
- Phaser owns all glyphs, special ×/÷ emphasis, selection, crossings and path overlays.

### 3. Calculation / score surfaces

`ui/orbital-history-row-v5.png`

- reusable bright parchment calculation strip;
- exactly 3 runtime instances;
- empty rows remain fully present/legible rather than looking disabled;
- Phaser owns marker, formula and result.

`ui/orbital-total-plate-v5.png`

- blank navy/brass score plate;
- Phaser owns sigma and numeric total.

### 4. Control instrument

`ui/orbital-control-dock-v5.png`

- lower brass/navy dock with empty indicator wells/pip guides;
- no mutable state baked in;
- Phaser owns active line colors, 5 pips per line and pulse/glow.

Undo:

- `ui/orbital-undo-disabled-v5.png`
- `ui/orbital-undo-idle-v5.png`

Validate:

- `ui/orbital-validate-disabled-v5.png`
- `ui/orbital-validate-ready-v5.png`

Pressed feedback is Phaser-owned (scale/brightness/tween), so no redundant pressed raster is required.
Validate is green only in the ready state, when all 3 lines exist.

## Phaser-owned dynamic gameplay

Never bake these into raster production assets:

- all 49 values/operators;
- special × / ÷ state color overlays;
- all 3 paths, arrowheads and luminous start/end nodes;
- active drag preview and invalid state;
- live result under pointer/finger;
- selected/crossed-cell overlays;
- formulas/results and total numeric value;
- 5 line-length pips per line;
- transient glints/ripples/travel pulse.

Numbers/operators always render above paths.

## Canonical 390×844 composition

One authored composition only; no mobile/desktop gameplay variant.

Layer order:

1. environment background;
2. board instrument;
3. Phaser special-cell material overlays;
4. path/glow layer;
5. cell glyphs above paths;
6. 3 history strips;
7. total plate;
8. control dock;
9. Undo — 3 indicators/pips — Validate;
10. transient live/feedback FX.

The decorative background may cover/crop inside the Core game surface around the fitted 390×844 canvas, but it never paints into desktop gutters and no gameplay element moves or stretches.

## Representative state validation

Inspect at minimum:

1. 0 lines;
2. active drag;
3. 1 line;
4. 2 lines;
5. 3 lines / Validate ready green;
6. invalid path;
7. Undo after 3 lines;
8. Validate press/submit.

Empty calculation rows and inactive line indicators must look **idle**, not broken/disabled.

## Gameplay contract preserved

- board 7×7;
- max 3 lines;
- max 5 cells per line;
- pairwise crossing max 1 shared cell;
- scoring unchanged;
- daily board unchanged;
- after line 3 the run remains editable;
- only Validate submits to Core/ladder;
- Undo remains available before submission.

## Cleanup policy

After the v5 mirror is verified and Phaser is cut over, remove obsolete runtime v3/v4 files that are no longer referenced. Git keeps history; runtime folders should not contain competing implementations.

## Cover

Cover remains **A METTRE A JOUR** until gameplay art is visually stabilized.
