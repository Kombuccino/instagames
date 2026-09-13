# Les Brochettes de Vlad — Asset manifest

Base : `390 × 844` logical units. Production route: local Codex → `public/assets/generated/vlads-skewers/`.

The three approved DA files under `GFX/crea-chatgpt/game/` are **REFERENCE ONLY**. They contain mutable score/order/lives/gameplay and must never be loaded as flattened runtime backgrounds.

| Asset | Family | Logical use / bounds | Alpha | Motion / states | Owner above | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `backgrounds/pixel-grill-arena-unlit.png` | permanent environment | full stage `390×844`; widened fall field x `38..326`, y `118..690` | opaque | architecture, fixtures and grill only; no flame, HUD, client or skewer baked | Phaser fire layers, score, order, lives, clients, ingredients | integrated |
| `sprites/ingredient-bodies-v2.png` fixed 4×3 grid | gameplay characters | falling display ~`78×78`; stacked body ~`70×70` | real | 11 faceless/limbless foods + one empty cell; no state baked | Phaser eyes, mouths, arms, legs, cooked colour, grill marks, char/ash | integrated |
| `sprites/bone-in-beef.png` | gameplay character body | falling/stacked beef body, wider than the other foods | real | isolated bone-in rib steak; no face, limb, drool or cooked state baked | Phaser eyes, mouth, limbs, cooked colour and grill marks | integrated |
| `sprites/character-parts-v3.png` fixed 4×4 grid | stateful character pieces | food facial/limb overlays and customer drool | real | 4 eye states, 4 mouths, authored arms/legs, drool, grill marks, ash and juice | Phaser animation/physics; drool frame used only by customers | integrated |
| `sprites/customer-atlas.png` fixed 5×3 grid | animatable decoration / customers | right architecture portrait ~`96×96` | real | 15 distinct hungry/joyful clients; idle/cheer through pose, hop and mouth-anchored drool | Phaser order bubble, patience, queue state | integrated |
| `props/vlad-skewer-hand.png` frame `shaft` | animatable prop | runtime tige `10×110 / 150 / 190 / 230` selon recette 2 / 3 / 4 / 5 | real | taille liée à la commande ; l'apex du harpon est la seule collision ; aucune hitbox visible | Phaser stack, collision, hold de validation, livraison | integrated |
| `props/vlad-arm-grip.png` | canonical animatable prop | fixed `290×435` long arm; handle axis aligned to runtime shaft | real alpha | hand visibly wraps red/gold handle; guard above, pommel below, full sleeve to bottom | rigid shaft and food stack | integrated |
| `ui/life-skewer.png` | structural HUD prop | three vertical skewers at left x `25..48`, y `185..294` | real | full/lost; lost state created by fall/rotation, not separate baked score | Phaser life count | integrated |
| `ui/component-atlas.png` manually cropped components | structural UI | order board, score plaque and speech bubble | real | irregular authored bounds preserved; values and states remain dynamic | Phaser texts, food icons and patience | integrated |
| `fx/pixel-fire-atlas.png` fixed 4×2 crop grid, cells `443×443` | FX support | fixtures, rear room, lower grill and food fire | real alpha | 4 broad torch frames + 4 broad barbecue frames with white-yellow cores | Phaser dense rear/foreground sparks, smoke, juice and ash | integrated |
| procedural blood drop v2 | gameplay bonus | ~`24×42` autour du centre de chute | transparent | grosse goutte construite uniquement avec rectangles sur grille `2 px`, contour bordeaux sombre, rouge saturé, reflet clair ; aucune primitive lissée | Phaser rotation/chute/bonus de patience | integrated 0.3.4 |
| `ui/gothic-digits.png` fixed 12-glyph strip | structural UI | dynamic score | real alpha | digits `0..9`, `X`, `+` authored from the approved DA typography | Phaser dynamic values | integrated |
| `public/assets/imported/vlads-skewers/welcome/vlad-cover-c-graphic-poster-approved-2026-09-07.png` | validated static Cover C | Core Cover master, `941×1672` source | opaque | exact approved black/red/cream poster; never regenerate | Core overlay remains live | validated source, not integrated |
| articulated ingredient limbs | dynamic gameplay | four independent appendages around each body | procedural pixel graphics | two segments, elbow/knee, small hand/foot; gesture sets for joy, realization, panic and death | Phaser | integrated |
| impact drops and callouts | dynamic FX | large tapered juice pixels with 2.2–3.9 s life; stacked text callouts | procedural pixel graphics/text | progressive entry, persistent debris, displaced callouts and fade-out | Phaser | integrated |

Runtime texts and values stay dynamic: score, level, secondary client counter, order icons, patience, comic impact cry, multiplier, active bonus, `BRUTALITY!` and end state.

## Covers statiques remises aux normes — 12 septembre 2026

Les cinq PNG approuvés du 10 septembre sous `public/assets/imported/vlads-skewers/welcome/variants/` restent les références artistiques inchangées. Les nouveaux fichiers corrigent uniquement le format : prolongement authored vers le bas, suppression des bandes floues/mirroirs et, sur l'échoppe japonaise, retrait du petit texte secondaire `串焼き` pour ne conserver que le titre principal `ヴラッドの串焼き`.

| Édition | Source restaurée | Master exact | Dérivé Core actif |
| --- | --- | --- | --- |
| Chaos | `sources/vlad-cover-01-chaos-source.png` — 853×1844 | `masters/vlad-cover-01-chaos-master.png` — 390×844 | `runtime/vlad-cover-01-chaos.webp` — 780×1688, 2 202 142 octets |
| Nature morte | `sources/vlad-cover-02-still-life-source.png` — 853×1844 | `masters/vlad-cover-02-still-life-master.png` — 390×844 | `runtime/vlad-cover-02-still-life.webp` — 780×1688, 1 822 494 octets |
| Portrait japonais | `sources/vlad-cover-03-japanese-portrait-source.png` — 853×1844 | `masters/vlad-cover-03-japanese-portrait-master.png` — 390×844 | `runtime/vlad-cover-03-japanese-portrait.webp` — 780×1688, 2 052 080 octets |
| Château | `sources/vlad-cover-04-castle-sign-source.png` — 853×1844 | `masters/vlad-cover-04-castle-sign-master.png` — 390×844 | `runtime/vlad-cover-04-castle-sign.webp` — 780×1688, 2 209 820 octets |
| Échoppe japonaise | `sources/vlad-cover-05-japanese-stall-source.png` — 852×1846 | `masters/vlad-cover-05-japanese-stall-master.png` — 390×844 | `runtime/vlad-cover-05-japanese-stall.webp` — 780×1688, 2 186 958 octets |

Tous ces chemins sont relatifs à `public/assets/generated/vlads-skewers/welcome/variants/`. Les masters/sources sont des PNG opaques mono-frame ; les dérivés actifs sont des WebP opaques mono-frame au payload `VP8L` lossless. `welcome.ts` conserve cinq variantes statiques, ancrées en haut, sans animation ni couche supplémentaire.

Micro-brief fermé : conserver titre, personnages, scène, palette et technique de chaque original ; prolonger uniquement le manteau/feu, le velours de nature morte, la cape sérigraphiée, la vallée du château ou l'échoppe en bois. Rejets : bande vide/noire/floue, miroir, étirement, faux cadre abîmé, nouveau sujet, slogan, CTA ou UI.

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
- Procedural gameplay accents added or redrawn from `0.3.4` onward use an explicit coarse logical grid (normally `2 px`) and integer-aligned positions; do not mix smooth vector circles/triangles with the authored coarse pixel vocabulary.
- Fifteen customer frames are visibly distinct at game size.
- All eyes, mouths, arms and legs are separate Phaser pieces; no face or limb is baked into a body texture.
- Customer drool and food grill marks are separate, stateful overlays rather than baked pixels. Foods never receive drool.
- The blood bonus must read immediately as a blood drop at phone size: dark outline, saturated red body, light glint, no ambiguous red circle.
- Falling emotion reads joy → realization → worry → frantic last attempt; bodies first cook into appetizing marked food, then missed bodies burn black on the lower grate, ash and disappear.
- Nearby falling characters can visually grab or repel one another without escaping the bounded fall/grill outcome.
- Stack limbs are articulated in two readable segments with four independent low-mass angular states; acceleration and direction can make them whirl while bodies remain locked to the skewer.
- Food hitboxes are slightly inside their visible silhouettes. Foods separate, rebound with gravity, and are pushed directionally by walls; shaft/hand contact never impersonates the tip.
- Three left life skewers match the approved gold/red spear family and disappear one per missed customer.
- Normal→×5 impacts have five clearly different visual/audio intensities while scoring stays unchanged.
- The authored long arm keeps its fixed size and travels with the handle. The runtime shaft is deliberately shorter than before and its visual capacity follows the active recipe: `110 / 150 / 190 / 230` for `2 / 3 / 4 / 5` foods.
- A complete recipe enters a `1 s` protected presentation state: the full stack stays visible in Vlad's hand, the apex accepts no contact, then the automatic delivery begins. No manual delivery target or side gesture.
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
