# LineFugg — Art Direction

Status: canonical gameplay art direction approved 2026-09-06.
Cover status remains A METTRE A JOUR. Do not use this document as permission to redesign the cover yet.

## Continuity contract — 2026-09-07

Follow [the unified creation notice](../../../docs/GAME_CREATION_PIPELINE.md) and [the current game status](GAME_STATUS.md) before each production pass. This document carries the retained choices; do not ask the user to repeat the DA when creating assets, animations or, once authorized, covers.

- Approved direction: **Orbital Accounting**, recorded 2026-09-06. The [reference master](../../../public/assets/imported/linefugg/concepts/orbital-stage-master-v1.png) is a visual reference, not a runtime background.
- Source conversation: [Game : LineFugg](https://chatgpt.com/c/6a96d2e6-ad54-83eb-9d9e-c74fe69d955d), project MiniFugg. Preserve the explicit rules and reference above when interpreting exploratory conversation variants.
- Preserve: celestial brass instrument, ink-blue depth, parchment calculations, clear numbers, three colored lines and restrained mechanical movement. Existing canonical music choices below remain acquired.
- Rejected: generic sci-fi/neon HUD, interchangeable generated mobile-game finish, distorted ornamental strips, duplicated or misaligned controls and decoration that shrinks or obscures gameplay. The user's 2026-09-07 instruction against generic “ChatGPT style” reinforces these constraints; it does not ban the specifically approved violet line or node glow.
- Agent autonomy: prepare asset decomposition, align geometry, select supported engine techniques and tune restrained feedback within this direction. Record significant compromises; ask only for unresolved GD or DA decisions. Do not reopen the whole visual exploration.
- Implemented 2026-09-07: 322-unit usable board, 46-unit square cells, one parchment ledger with three chip rows, shared dock anchors and a separate animated armillary. This enlarges the former 282-unit grid while keeping its brass frame and the complete controls visible on a small phone. Visual acceptance of this implementation remains distinct from the approved direction.

## Core concept

LineFugg is presented as a celestial calculation instrument: an ornate brass astrolabe / observatory console suspended in a deep ink-blue star field. The tone is elegant, tactile, mysterious and mechanical rather than generic sci-fi neon.

The gameplay itself remains the focus. The 7×7 grid is the central instrument surface; every decorative object must reinforce the feeling of a real astronomical mechanism without obscuring numbers, operators, lines, calculations or controls.

Do not place the LineFugg name, logo, slogans, lore copy or decorative prose inside the gameplay art. Core owns platform/game naming outside the scene. Any visible text inside the game must be functional and translatable; prefer icon-only controls where possible.

## Canonical geometry

- Runtime: Phaser 4.
- Logical stage: 390×844 portrait.
- The same authored composition is uniformly scaled on all devices.
- No PC/mobile reflow, no critical vw/vh, no media-query layout variants.
- Preserve Core close-box clearance at the upper-left; do not put essential game information underneath it.
- Grid remains visually dominant: 322 logical units of playable cells at (34, 155), approximately 370 including its brass frame. Cells remain exactly 46 × 46 units.

Target vertical composition:

1. upper celestial mechanism / armillary ambience;
2. central 7×7 board;
3. three readable calculation rows;
4. total plate;
5. bottom control cluster with Undo on the left, three line indicators in the center, Validate on the right.

## Visual family

Celestial cartography + antique scientific instrument + premium brass mechanics.

Avoid:

- black/purple/cyan generic neon HUD;
- glassmorphism;
- tiny pale UI copy;
- fake techno labels;
- slogans such as “Chart your numbers”, “Good math”, etc.;
- excessive decorative text;
- soft generic mobile-game bevels;
- cover-quality art that cannot be sustained in gameplay.

## Palette

Background:
- deep ink navy / near-black blue: #061424 to #0A1B30;
- parchment ivory: #E8D2A4 to #F3E3BD;
- warm brass: #B77928 / #D9A24A / pale gold highlights;
- dark oxidized brass / brown: #3A2414.

Gameplay accents:
- line 1: hot vermilion / orange-red;
- line 2: saturated violet;
- line 3: warm celestial gold/yellow;
- validation enabled: rich emerald green;
- error: red-orange, used briefly only.

Contrast rule: numbers/operators always outrank decoration. Operators must be distinguishable by both color/material and symbol.

## Board and cells

The board is an ornate brass-framed astronomical plate, not a floating web grid.

- 7×7 geometry remains exact and square.
- Base cells are dark blue enamel / lacquer with warm gold dividers.
- Positive numbers show the number only; their implicit `+` is not displayed in the grid.
- Negative numbers keep the minus attached to the number.
- Multipliers and divisors display `×n` / `÷n` and use special warm-brass / violet materials.
- Typography is large, high-contrast and serif/scholarly or engraved in spirit, but must remain highly readable on the smallest phone.
- Numbers must visually sit above traced lines when lines pass through their cells.

## Lines and nodes

There are exactly three possible lines per run, maximum five cells each.

Colors:
1. vermilion;
2. violet;
3. gold.

Every line uses the same visual grammar:

- luminous start node;
- luminous end node;
- solid glowing shaft;
- clear directional arrowhead at the end;
- the endpoint numbers remain visible above the line;
- subtle moving energy/spark along the line after validation.

The active drag uses the same grammar at reduced certainty: slightly brighter pulse, live endpoint glow, result bubble/plate following below the pointer/finger. Invalid placement changes to an error state and retracts/snaps back rather than becoming a different layout.

## Line indicators

The count of line slots appears only once, centered between Undo and Validate at the bottom.

There are three colored celestial orbs corresponding to the three line colors. Each orb has five small pips/dots that represent the actual number of cells currently used by that line.

- no duplicate line-count display elsewhere;
- unused line: dim orb, zero lit pips;
- 2–5 cell line: exactly that many pips lit;
- current/active line may pulse gently;
- after undo, the indicator updates immediately.

## Calculations and total

All three line calculations are visible below the grid in large, high-contrast parchment rows once they exist.

Formula grammar must mirror gameplay exactly:

- the first positive value appears without `+`;
- subsequent positive add values include a `+` attached to the number token (for example `+5`), never as a separate decorative token;
- negatives keep `−` attached to the number;
- multipliers/divisors stay `×2`, `÷3`, etc.;
- no extra operator boxes are inserted between number tokens.

Each row includes:
- line color/direction marker;
- readable formula;
- `=` and line result.

The total plate sits below the three rows and is the sum of the three line scores. It must always be mathematically correct.

## Controls and end-of-run rule

Controls should avoid translation when possible.

Undo:
- circular brass-framed button with universal back/undo arrow icon;
- inactive/dim when no undo is possible;
- active otherwise.

Validate:
- circular brass-framed button with checkmark icon only;
- NOT green while fewer than three lines exist;
- becomes clearly emerald green only when all three lines are placed;
- after line 3, the run does not finish automatically;
- the player may still undo/redraw lines;
- only pressing enabled Validate calls `session.finish(...)` and submits the resolved score to Core/ladder flow.

No textual “Valider calcul” label is required inside the gameplay if the checkmark affordance is clear.

## Motion / FX

Motion should make the instrument feel alive without harming readability or mobile performance.

Ambient:
- very slow armillary-ring rotation/parallax;
- tiny star twinkles;
- subtle planet/orb drift;
- occasional brass glint;
- restrained background chart movement.

Interaction:
- start/end nodes ignite when a line is drawn;
- active line breathes subtly;
- a small energy pulse travels start→end on placement;
- selected cells receive a short concentric halo;
- invalid line gives a brief red flare / mechanical recoil;
- calculation row reveals with a short parchment/ink slide;
- total ticks/snaps to the new value;
- line indicator pips light sequentially as the drag crosses cells;
- enabled Validate gets a restrained emerald pulse, never before the third valid line.

Avoid heavy full-screen post effects, constant camera shake or bloom that softens the numbers.

## Audio relationship

Existing LineFugg music remains canonical:
- MF-MUS-0008 Vector Rush — Three Lines;
- MF-MUS-0009 Quick Sum Bounce.

Visual rhythm may react subtly to kick/snare via orb or brass glints, but gameplay timing/scoring must not depend on music. SFX should feel mechanical/celestial and remain subordinate to the soundtrack.

## Asset rule

Raster/illustrated production assets follow `docs/ASSET_PIPELINE.md`: Codex-local artwork goes directly into `public/assets/generated/linefugg/...` and Git; artwork transferred from ChatGPT uses `Fugg/linefugg/...` → `public/assets/imported/linefugg/...`. Existing imported files retain their paths.

Important authored visual surfaces are real assets. Phaser primitives are appropriate for dynamic lines, node glows, particles, masks, hit feedback, pips, text and genuinely procedural celestial FX.

See `ASSET_MANIFEST.md` for the concrete production inventory.
