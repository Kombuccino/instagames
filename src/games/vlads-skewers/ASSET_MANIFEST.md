# Les Brochettes de Vlad — Asset manifest

Base : `390 × 844` logical units. Production route: local Codex → `public/assets/generated/vlads-skewers/`.

The three approved DA files under `GFX/crea-chatgpt/game/` are **REFERENCE ONLY**. They contain mutable score/order/lives/gameplay and must never be loaded as flattened runtime backgrounds.

| Asset | Family | Logical use / bounds | Alpha | Motion / states | Owner above | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `backgrounds/pixel-grill-arena.png` | permanent environment | full stage `390×844`; central safe fall field x `58..313`, y `118..690` | opaque | authored crisp flames; no baked HUD/clients/skewer | Phaser score, order, lives, clients, ingredients, FX | integrated |
| `sprites/ingredient-bodies.png` fixed 4×3 grid | gameplay characters | falling display ~`46×46`; stacked body ~`42×38` | real | 11 faceless/limbless foods + one empty cell; no state baked | Phaser eyes, mouths, arms, legs, drool, cooked colour, grill marks, char/ash | generated |
| `sprites/customer-atlas.png` fixed 5×3 grid | animatable decoration / customers | right booth portrait ~`64×72` | real | 15 distinct hungry/joyful clients; idle/cheer through pose, hop and drool | Phaser order bubble, patience, queue state | integrated |
| `props/vlad-skewer-hand.png` | animatable prop | grip centered near x `195`, y `760`; usable tip offset measured in scene | real | held/impact shake; gold point is sole hit point | Phaser stack, limbs, multiplier | integrated |
| `ui/life-skewer.png` | structural HUD prop | three vertical skewers at left x `25..48`, y `185..294` | real | full/lost; lost state created by fall/rotation, not separate baked score | Phaser life count | integrated |
| `ui/component-atlas.png` fixed 2×2 grid | structural UI | order board, score plaque, speech bubble, booth | real | values and states remain dynamic | Phaser texts, food icons, patience, portraits | integrated |
| generated pixel particles | FX support | bounded play field | procedural texture | juice, chunks, sparks, embers and ash; strict pool caps | Phaser | integrated |

Runtime texts and values stay dynamic: score, level, clients remaining, order icons, patience, impact word/cry, multiplier, `BRUTALITY!` and end state.

## Layer order

1. Environment and crisp flames.
2. Audience booths / clients.
3. Persistent low-cost embers and old juice chunks.
4. Falling ingredients and hazards.
5. Skewer, stacked ingredient bodies and dangling limbs.
6. Impact bursts, camera shake and combo typography.
7. Dynamic HUD/order/lives/end state.

## Acceptance

- Texture filtering is nearest-neighbour; no blur/post-FX.
- Fifteen customer frames are visibly distinct at game size.
- All eyes, mouths, arms and legs are separate Phaser pieces; no face or limb is baked into a body texture.
- Drool and grill marks are also separate, stateful overlays rather than baked pixels.
- Falling emotion reads joy → realization → worry → frantic last attempt; bodies first cook into appetizing marked food, then missed bodies burn black on the lower grate, ash and disappear.
- Nearby falling characters can visually grab or repel one another without escaping the bounded fall/grill outcome.
- Stack limbs lag and settle under movement; bodies remain locked to the skewer.
- Three left life skewers match the approved gold/red spear family and disappear one per missed customer.
- Normal→×5 impacts have five clearly different visual/audio intensities while scoring stays unchanged.

## Built-in ImageGen production prompt set — 2026-09-07

- Environment: “production Transylvanian grill arena background only, portrait 390:844, central empty fall field, empty right booths, large lower grill, crisp coarse pixel art; no mutable UI, people, ingredients or skewer.”
- Customers: “exact 5×3 atlas of 15 distinct hungry, delighted fantasy adults, consistent booth portrait scale, hard pixel clusters, pure cyan key, no UI or text.”
- Vlad prop: “one isolated pale hand in black/red sleeve holding a long ornate gold/red vertical skewer, crisp pixel art, pure cyan key.”
- Life prop: “one isolated vertical gold point/red grip life skewer matching Vlad-DA-Piques, crisp pixel art, pure cyan key.”
- UI components: “strict 2×2 atlas: gothic order panel, score plaque, empty speech bubble, empty red-stone booth; no values or characters, pure cyan key.”
- Final food bodies: “strict 4×3 atlas: beef, pepper, mushroom, tomato / onion, zucchini, eggplant, garlic / chicken, tofu, salmon, empty; body silhouettes only, absolutely no face, limbs, drool, grill marks or cooked state, pure cyan key.”

The built-in generator originals remain in Codex generation storage; production-ready keyed derivatives are the six repository paths in the table. A first food sheet containing baked faces/limbs was rejected before integration and is not a production asset.
