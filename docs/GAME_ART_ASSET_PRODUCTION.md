# MiniFugg game-art production procedure

This document defines how an approved game-art direction becomes production-ready gameplay art.

It exists because a validated concept image is a visual reference, not automatically a runtime asset.

## 1. Core rule: reference art is not runtime art

A validated DA/mockup establishes composition, materials, palette, shape language, typography direction and mood.

Do **not** put the flattened DA/mockup directly into gameplay when it contains anything that can change at runtime: grid contents, buttons, score, labels, paths, indicators, panels with data, highlights or interaction states.

The DA may remain archived as a reference/master, but production gameplay must be reconstructed from modular assets plus engine-rendered state.

## 2. One visible element, one owner

Every visible element in gameplay has exactly one owner:

- **authored asset** for stable illustrated/material surfaces;
- **engine** for dynamic/stateful content and effects.

Never bake an element into an asset and redraw the same function on top in Phaser.

Examples:

- brass board frame -> asset;
- 7x7 numbers -> Phaser;
- calculation-panel surface -> asset;
- calculation text/value -> Phaser;
- button bezel -> asset;
- button enabled/pressed glow -> Phaser or explicit state asset, but not both;
- line path and live drag -> Phaser;
- decorative planet -> asset;
- score -> Phaser.

## 3. Mandatory decomposition before production

Before generating final assets, decompose the approved DA into these families.

### A. Permanent environment

Background, scenery, textures and non-interactive decoration that can safely exist in every game state.

A background must not contain fake UI, fake score, fake controls, fake grid content or baked gameplay.

### B. Independently animatable decoration

Any object expected to move, rotate, float, pulse or parallax independently must be separated from the background whenever practical.

Examples: armillary rings, planets, hands, needles, moving props, foreground ornaments.

### C. Reusable functional surfaces

Illustrated surfaces that host runtime content.

Examples: board frame, panel frame, parchment strip, HUD dock, button bezel, indicator bezel.

They contain no runtime text or values.

### D. Dynamic gameplay state

Anything that can change during a run stays engine-owned.

Examples: numbers, operators, paths, node glows, cell highlights, score, progress pips, current selection, validation state, errors and particles.

## 4. State inventory is mandatory

For every interactive component, identify its required states before asset production.

Typical states:

- disabled;
- idle;
- hover/focus when relevant;
- pressed;
- active/ready;
- success;
- error.

Do not assume one static image can represent every state.

Prefer compositing when it reduces duplication cleanly: for example a common brass bezel + Phaser-controlled center fill/glow/icon can cover multiple states without exporting six near-identical raster files.

## 5. Runtime-state test matrix

A DA is not production-valid until it works across the important game states, not only one beauty shot.

At minimum inspect:

- empty run;
- first interaction in progress;
- one completed action;
- two completed actions;
- maximum completed actions before final validation;
- disabled/ready validation control;
- undo/revert state;
- invalid interaction;
- final validated state;
- short and long/negative/decimal values where applicable.

The composition must remain coherent in every state.

## 6. Asset manifest contract

Each game with authored raster art should maintain `ASSET_MANIFEST.md`.

The manifest is a production specification, not a wishlist. For each asset it should state:

- filename and Drive/repository/runtime path;
- visual role;
- whether it is static, reusable, animated or optional;
- transparent/opaque requirement;
- what must **not** be baked into it;
- runtime owner of text/state/effects around it;
- intended logical size/placement;
- required states if state-specific assets exist.

The manifest should also explicitly list engine-owned elements that must **not** become raster assets.

## 7. Image-generation procedure

When generating production assets from an approved DA:

1. Use the DA as style/composition reference only.
2. Generate **one runtime role per output file** whenever possible.
3. Do not generate contact sheets, labeled asset boards or presentation layouts as production files.
4. Do not include filenames, annotations, explanatory copy, game title or logo unless that exact text is itself the intended asset.
5. For a background request, explicitly exclude UI, gameplay, buttons, score, panels, grid contents and labels.
6. For transparent components, request isolated objects with clean alpha and no surrounding presentation frame.
7. If a generated result still contains baked runtime UI, reject it as a concept/reference and regenerate; never hide the mistake with runtime overlays.
8. Preserve style consistency by deriving all components from the same approved art language/reference set.

## 8. Pipeline integration

All production raster assets follow `docs/ASSET_PIPELINE.md`:

`private Drive Fugg/<game-id>/... -> GitHub Actions sync -> public/assets/imported/<game-id>/... -> /assets/imported/<game-id>/...`

Do not reference an asset from application code until its mirrored GitHub path has been verified.

Concept/contact sheets may be stored under a `concepts/` folder if useful, but gameplay code must never depend on them.

## 9. Phaser reconstruction order

Recommended order after assets are verified:

1. pure environment/background;
2. independently animated decorative layers;
3. functional authored surfaces;
4. gameplay geometry and hit areas;
5. dynamic state/text/paths;
6. controls and their states;
7. transient FX/particles;
8. state-matrix visual validation;
9. multi-screen normalized validation;
10. build/typecheck and obsolete-asset cleanup.

Do not polish around a flattened mockup. Reconstruct the scene from its proper layers first.

## 10. Definition of production-ready art integration

A gameplay DA is production-ready when:

- no flattened concept/mockup is used as a shortcut for runtime UI;
- every visible element has one clear owner;
- backgrounds contain no baked dynamic UI/gameplay;
- independently animated pieces are separable;
- interactive components have complete state behavior;
- authored surfaces and Phaser state visually belong to the same art direction;
- important runtime states have been inspected;
- canonical logical geometry is unchanged across devices;
- final assets are mirrored through the MiniFugg pipeline;
- obsolete/bad runtime assets and duplicate renderers are removed.

Git history and concept/reference folders are the archive; production runtime should remain clean and singular.
