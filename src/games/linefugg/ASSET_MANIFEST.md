# LineFugg — Production Asset Manifest

Status: canonical modular gameplay asset inventory for the approved **Orbital Accounting** direction.

Production method: `docs/GAME_ART_PRODUCTION_PIPELINE.md`.
Image transport: `docs/ASSET_PIPELINE.md`.

Canonical app prefix:

`/assets/imported/linefugg/`

## Critical correction

### `backgrounds/orbital-stage-master-v1.png`

Status: **REFERENCE ONLY — never render in gameplay**.

This is the flattened approved/concept master that exposed the production mistake: it contains baked board/UI/control state. It remains useful as a visual reference for composition/material language, but it must not be loaded by Phaser after the modular cutover.

No runtime mask/cover-up strategy is allowed for this master. Git history and this reference file preserve the approved source; production uses the isolated assets below.

---

# Runtime layer stack

## 1. Permanent environment

### `backgrounds/orbital-stage-bg-v3.png`

Family: permanent environment.

Drive: `Fugg/linefugg/backgrounds/orbital-stage-bg-v3.png`
GitHub: `public/assets/imported/linefugg/backgrounds/orbital-stage-bg-v3.png`
Runtime: `/assets/imported/linefugg/backgrounds/orbital-stage-bg-v3.png`

Purpose:
- pure celestial/astronomical background;
- no grid;
- no score;
- no calculation rows;
- no controls;
- no baked game state or translated copy.

Logical destination: complete `390×844` stage background using cover crop without gameplay geometry dependence.

Runtime depth: lowest game layer.

## 2. Animatable decoration

### `props/orbital-upper-ornament-v3.png`

Family: animatable decoration.

Drive: `Fugg/linefugg/props/orbital-upper-ornament-v3.png`
Runtime: `/assets/imported/linefugg/props/orbital-upper-ornament-v3.png`

Purpose: isolated upper armillary/observatory ornament.

Logical destination: upper third of stage, behind status/board.
Motion: very slow float/scale breathing; procedural Phaser rings/glints may animate independently above/below it.

No gameplay information is baked into this prop.

## 3. Structural gameplay surfaces

### `ui/orbital-board-frame-v4.png`

Family: structural surface.
Purpose: isolated brass frame around the exact dynamic 7×7 board.
Logical destination: board bounds, approximately `376×376` logical units including frame.
Transparency: transparent gameplay center.
Dynamic content above/inside: cell tiles, hit areas, paths, numbers/operators, glows.

### Cell family

- `ui/orbital-cell-neutral-v2.png`
- `ui/orbital-cell-multiply-v2.png`
- `ui/orbital-cell-divide-v2.png`

Family: reusable structural surfaces.
Logical destination: one 7×7 cell (`~52.86×52.86` logical units), slightly inset for frame gap.

Ownership:
- raster owns material/bezel only;
- Phaser owns every number/operator glyph;
- positive and negative additive numbers use the neutral material;
- multiplier/divisor material is visually distinct;
- selected/crossed/preview/error overlays remain Phaser-owned.

### `ui/orbital-calc-row-v3.png`

Family: reusable structural surface.
Purpose: blank parchment calculation strip.
Instances: exactly 3, one per possible line.
Logical destination: approximately `356×40` each.
Dynamic content above: line-color marker, formula, `=`, result.
No formula/value is baked.

### `ui/orbital-total-plate-v3.png`

Family: structural surface.
Purpose: blank brass/navy total plate.
Logical destination: approximately `210×42`.
Dynamic content above: sigma/total value.
No numeric total is baked.

### `ui/orbital-control-dock-v4.png`

Family: structural/decorative surface.
Purpose: lower observatory ornament connecting the controls into one physical instrument rather than floating UI blocks.
Logical destination: lower control zone, behind buttons and line indicators.
No button, icon, pip or state is baked into the dock.

## 4. Stateful line indicators

The three indicator sprites share one geometry/material family; only the celestial core color differs.

- `ui/orbital-indicator-red-v4.png`
- `ui/orbital-indicator-violet-v4.png`
- `ui/orbital-indicator-gold-v4.png`

Family: stateful component base.
Logical destination: ~`40×40` orb each.

Raster owns:
- brass bezel;
- colored celestial core.

Phaser owns:
- dim/active alpha;
- active pulse;
- 5 pips per orb;
- exact number of illuminated pips from line cell count;
- current-line glow.

Pips must never be baked into indicator files.

## 5. Stateful controls

Controls are isolated assets, never part of background/dock.

### Undo family

- `ui/orbital-undo-disabled-v4.png`
- `ui/orbital-undo-idle-v4.png`
- `ui/orbital-undo-pressed-v4.png`

States:
- disabled: no line can be undone;
- idle: at least one line exists and no press is active;
- pressed: pointer/touch is currently pressing the control.

Icon is universal and intentionally baked into the isolated state sprite. No translated copy.

### Validate family

- `ui/orbital-validate-disabled-v4.png`
- `ui/orbital-validate-ready-v4.png`
- `ui/orbital-validate-pressed-v4.png`

States:
- disabled: fewer than 3 valid lines;
- ready: exactly 3 lines exist;
- pressed: enabled Validate is being pressed.

**Validate is green only in ready/pressed enabled states.**

Only a pointer-up from the enabled control triggers `session.finish(...)`.

## 6. Phaser-owned dynamic gameplay

These are deliberately not baked assets:

- 7×7 geometry/hit areas;
- board numbers/operators;
- positive `+` grammar (implicit in board, attached token in formulas);
- negative signs;
- all three path shafts;
- arrowheads;
- luminous start/end nodes;
- active drag preview;
- invalid drag state;
- live score under finger/pointer;
- selected/crossed-cell overlays;
- path travel pulse;
- formulas/results;
- total numeric value;
- five indicator pips per line;
- transient glints/ripples/particles;
- slow procedural orbital rings/stars.

Numbers/operators remain above paths.

---

# Canonical 390×844 composition

One authored composition only; no device-specific rearrangement.

Recommended logical stack:

1. pure background;
2. upper ornament + ambient orbital FX;
3. board frame;
4. dynamic cell tiles/grid content;
5. path/glow layer;
6. cell glyphs above paths;
7. 3 calculation strips;
8. total plate;
9. control dock;
10. Undo — 3 indicators/pips — Validate;
11. transient live/feedback FX.

Core close-box clearance remains respected in the upper-left.

# Representative state validation

Before considering the visual implementation stable, inspect:

1. 0 lines;
2. active drag;
3. 1 line;
4. 2 lines;
5. 3 lines, before validation;
6. Validate ready/green;
7. invalid path;
8. Undo after 3 lines;
9. Validate press/submit transition.

There must be no ghost button, duplicate board, fake score or pre-baked path visible in any state.

# Gameplay contract preserved

- board: 7×7;
- max 3 lines;
- max 5 cells per line;
- pairwise crossing: max 1 shared cell;
- scoring unchanged;
- daily board unchanged;
- after line 3 the run remains editable;
- only Validate submits to Core/ladder;
- Undo remains available before submission.

# Cover

Cover remains **A METTRE A JOUR** until the gameplay art has stabilized. None of these runtime assets should be treated as the final cover by default.

# Definition of integrated

A raster asset is production-integrated only when:

1. final bytes are under the correct private Drive path;
2. Drive sync mirrors them into `public/assets/imported/linefugg/...` on `main`;
3. the mirror is explicitly verified;
4. Phaser references only `/assets/imported/linefugg/...`;
5. no flattened mockup is used to fake multiple runtime layers;
6. no obsolete runtime reference remains after the modular cutover.
