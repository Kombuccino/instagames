# Train Fighter — Asset Manifest

All source art is authored as crisp SVG so it can be previewed in Git, scaled without blur during development and later rasterized to integer pixel sizes if needed.

## Runtime sheets

### `assets/train-fighter-sprites.svg`

Use external SVG symbols with `<use href="...#symbol-id" />`.

| Symbol ID | Role | Native viewBox | Notes |
| --- | --- | --- | --- |
| `tf-hero` | player locomotive | 96×96 | default expression, arms included |
| `tf-wagon` | life wagon | 72×56 | coupler included |
| `tf-enemy-punk` | fast enemy | 80×72 | spikes + mohawk stack |
| `tf-enemy-jaw` | bruiser enemy | 88×76 | jaw bumper |
| `tf-enemy-tank` | heavy enemy | 92×76 | armor plates |
| `tf-enemy-scrap` | weird enemy | 88×80 | asymmetric junk body |
| `tf-weapon-glove` | weapon | 48×48 | red boxing glove |
| `tf-weapon-wrench` | weapon | 48×48 | taped wrench |
| `tf-weapon-hammer` | weapon | 48×48 | spring hammer |
| `tf-weapon-saw` | weapon | 48×48 | guarded buzz saw |
| `tf-weapon-cannon` | weapon | 48×48 | scrap pop cannon |
| `tf-weapon-spring-fist` | weapon | 48×48 | fist on coil |
| `tf-pickup-coin` | pickup | 48×48 | rail-wheel coin |
| `tf-pickup-wagon` | pickup | 48×48 | wagon + plus |
| `tf-pickup-shield` | pickup | 48×48 | solid-pixel bubble |
| `tf-pickup-turbo` | pickup | 48×48 | engine lightning badge |
| `tf-pickup-weapon` | pickup | 48×48 | tool crate |
| `tf-fx-impact` | combat FX | 48×48 | impact star + bolts |
| `tf-fx-smoke` | locomotion FX | 48×48 | 3-puff soot cluster |
| `tf-ui-left` | control icon | 48×48 | railway switch arrow |
| `tf-ui-right` | control icon | 48×48 | railway switch arrow |

## Environment sheet

### `assets/train-fighter-biomes.svg`

| Symbol ID | Biome / role |
| --- | --- |
| `tf-rail-segment` | common rail segment |
| `tf-junction-sign-left` | common rail signage |
| `tf-junction-sign-right` | common rail signage |
| `tf-forest-tree` | Mossy Forest |
| `tf-forest-signal` | Mossy Forest |
| `tf-forest-hut` | Mossy Forest |
| `tf-desert-cactus-scrap` | Red Canyon |
| `tf-desert-pole` | Red Canyon |
| `tf-desert-drum-stack` | Red Canyon |
| `tf-mountain-peak` | Cloud Mountain |
| `tf-mountain-tunnel` | Cloud Mountain |
| `tf-mountain-crane` | Cloud Mountain |
| `tf-snow-pine` | Aurora Pass |
| `tf-snow-signal` | Aurora Pass |
| `tf-snow-junk` | Aurora Pass |
| `tf-station` | safe station hub |
| `tf-station-lamp` | safe station prop |
| `tf-station-crates` | safe station prop |

## Reference board

### `assets/train-fighter-styleboard.svg`

A self-contained art target showing:

- hero proportions and palette;
- enemy silhouette language;
- equipment scale;
- four biome color strips;
- UI material language;
- a portrait gameplay keyframe.

This file is reference art, not a runtime dependency.

## Implementation policy

- Keep sprites free of baked text.
- Prefer `<svg><use /></svg>` during implementation; rasterize only if profiling proves useful.
- Preserve `shape-rendering="crispEdges"`.
- Do not recolor the hero by CSS filters; use intentional variants if a skin is needed later.
- Environmental props may be mirrored or palette-shifted only inside their biome family.
- Important sprites should render at integer multiples of their native art scale whenever possible.
