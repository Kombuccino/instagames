# Les Brochettes de Vlad — Asset manifest

Base : `390 × 844` logical units. Production route: local Codex → `public/assets/generated/vlads-skewers/`.

The three approved DA files under `GFX/crea-chatgpt/game/` are **REFERENCE ONLY**. They contain mutable score/order/lives/gameplay and must never be loaded as flattened runtime backgrounds.

| Asset | Family | Logical use / bounds | Alpha | Motion / states | Owner above | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `backgrounds/pixel-grill-arena.png` | permanent environment | full stage `390×844`; central safe fall field x `58..313`, y `118..690` | opaque | authored crisp flames; no baked HUD/clients/skewer | Phaser score, order, lives, clients, ingredients, FX | integrated |
| `sprites/ingredient-bodies-v2.png` fixed 4×3 grid | gameplay characters | falling display ~`78×78`; stacked body ~`70×70` | real | 11 faceless/limbless foods + one empty cell; no state baked | Phaser eyes, mouths, arms, legs, cooked colour, grill marks, char/ash | integrated |
| `sprites/character-parts-v3.png` fixed 4×4 grid | stateful character pieces | food facial/limb overlays and customer drool | real | 4 eye states, 4 mouths, authored arms/legs, drool, grill marks, ash and juice | Phaser animation/physics; drool frame used only by customers | integrated |
| `sprites/customer-atlas.png` fixed 5×3 grid | animatable decoration / customers | right balcony portrait ~`84×84` | real | 15 distinct hungry/joyful clients; idle/cheer through pose, hop and mouth-anchored drool | Phaser order bubble, patience, queue state | integrated |
| `props/vlad-skewer-hand.png` | animatable prop | grip centered near x `195`, y `760`; usable tip offset measured in scene | real | held/impact shake; gold point is sole hit point | Phaser stack, limbs, multiplier | integrated |
| `ui/life-skewer.png` | structural HUD prop | three vertical skewers at left x `25..48`, y `185..294` | real | full/lost; lost state created by fall/rotation, not separate baked score | Phaser life count | integrated |
| `ui/component-atlas.png` manually cropped components | structural UI | order board, score plaque and speech bubble | real | irregular authored bounds preserved; values and states remain dynamic | Phaser texts, food icons and patience | integrated |
| generated pixel flames / particles | FX support | lower grill, six authored fire sources and bounded play field | procedural pixel textures/graphics | stepped animated flames, juice, sparks, embers, stronger smoke and ash; strict pool caps | Phaser | integrated |
| articulated ingredient limbs | dynamic gameplay | four independent appendages around each body | procedural pixel graphics | two segments, elbow/knee, small hand/foot; gesture sets for joy, realization, panic and death | Phaser | integrated |
| desktop decorative overscan | permanent environment support | game surface outside the canonical 390×844 canvas | same opaque background, `cover` crop | static support behind the canonical stage; never owns gameplay geometry | Core surface + canonical Phaser canvas | integrated |

Runtime texts and values stay dynamic: score, level, clients remaining, order icons, patience, impact word/cry, multiplier, `BRUTALITY!` and end state.

## Layer order

1. Environment and crisp flames.
2. Fixed audience balconies, then independently animated clients.
3. Persistent low-cost embers and old juice chunks.
4. Falling ingredients and hazards.
5. Skewer, stacked ingredient bodies and dangling limbs.
6. Impact bursts, camera shake and combo typography.
7. Dynamic HUD/order/lives/end state.

## Acceptance

- Texture filtering is nearest-neighbour; no blur/post-FX.
- Fifteen customer frames are visibly distinct at game size.
- All eyes, mouths, arms and legs are separate Phaser pieces; no face or limb is baked into a body texture.
- Customer drool and food grill marks are separate, stateful overlays rather than baked pixels. Foods never receive drool.
- Falling emotion reads joy → realization → worry → frantic last attempt; bodies first cook into appetizing marked food, then missed bodies burn black on the lower grate, ash and disappear.
- Nearby falling characters can visually grab or repel one another without escaping the bounded fall/grill outcome.
- Stack limbs are articulated in two readable segments, lag and settle under movement; bodies remain locked to the skewer.
- Three left life skewers match the approved gold/red spear family and disappear one per missed customer.
- Normal→×5 impacts have five clearly different visual/audio intensities while scoring stays unchanged.
- The skewer/hand remains fixed-size; only a separately drawn sleeve extension reaches the bottom. Pointer capture keeps relative control outside the canvas.
- A complete recipe validates automatically; there is no delivery target or side gesture.
- Customer architecture is fixed, at most five actors are visible, and mouth offsets own drool placement per portrait.

## Built-in ImageGen production prompt set — 2026-09-07

- Environment: “production Transylvanian grill arena background only, portrait 390:844, central empty fall field, empty right booths, large lower grill, crisp coarse pixel art; no mutable UI, people, ingredients or skewer.”
- Customers: “exact 5×3 atlas of 15 distinct hungry, delighted fantasy adults, consistent booth portrait scale, hard pixel clusters, pure cyan key, no UI or text.”
- Vlad prop: “one isolated pale hand in black/red sleeve holding a long ornate gold/red vertical skewer, crisp pixel art, pure cyan key.” Its runtime horizontal origin is the authored tip pixel (`128.5/512`), not the transparent image center.
- Life prop: “one isolated vertical gold point/red grip life skewer matching Vlad-DA-Piques, crisp pixel art, pure cyan key.”
- UI components: “strict 2×2 atlas: gothic order panel, score plaque, empty speech bubble, empty red-stone booth; no values or characters, pure cyan key.”
- Final food bodies: “strict 4×3 atlas: beef, pepper, mushroom, tomato / onion, zucchini, eggplant, garlic / chicken, tofu, salmon, empty; body silhouettes only, absolutely no face, limbs, drool, grill marks or cooked state, transparent background.”
- Character parts: “strict 4×4 transparent atlas with expressions, mouths, arms/legs, customer drool, grill marks, ash and juice; crisp coarse pixel clusters.”

The built-in generator originals remain in Codex generation storage; production-ready assets are the repository paths in the table. Earlier sheets with baked faces/limbs, painted checkerboards, or the rejected cage-like customer booth were removed from production.
