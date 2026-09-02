# Les Brochettes de Vlad — Art Direction

## Base direction

`custom` — Transylvanian grill / dark comic food arcade. The game keeps its ember-lit grill atmosphere rather than switching to a generic MiniFugg house style. Motion borrows the hard impact principle of Ink Pulp, but the game is not an Ink Pulp kit implementation.

## Palette

- charcoal / blood-brown background: `#110708`, `#21100d`, `#32160f`
- ember orange: `#ff6420`
- blood red: `#d93b34`
- warm metal / target gold: `#f4c34f`, `#ffe378`
- food juice colors follow the ingredient: tomato/meat red, pepper/zucchini green, onion purple, mushroom yellow/tan, eggplant purple

## Typography

Use the inherited MiniFugg/system grotesk. Labels are short, heavy and readable. Important instructions use shared `--mf-text-*` tokens; avoid fly-print for gameplay-critical information.

## Material / texture language

Dark grill, smoke, ember light, rough metal skewer, visible BBQ rack, hot food and wet splashes. Ingredients already on the skewer look browned/grilled. As the skewer fills, juice increasingly stains the metal and Vlad's hand. The skewer tip is deliberately gold and luminous because it is the exact gameplay hit point.

## Motion language

The game should feel excessive rather than delicate: fast falling objects, spinning and oblique trajectories, escalating vegetable avalanches, brutal squash/stretch when the point penetrates an ingredient, a short comic slash, a large colored wet burst and many droplets at impact. Impalement is intentionally much more violent and readable than ordinary food-game feedback. Blood creates a very legible temporary slow-motion contrast.

Impalement impacts use a varied bank of roughly fifteen disgusting comic onomatopoeias plus a second, smaller pain/horror line spoken by the ingredient. Meat and each vegetable family can have its own absurd reaction vocabulary. The joke should feel like a tiny horror cartoon, not realistic gore.

The short impact explosion is followed by a longer ballistic juice/chunk shower. Particles first eject upward and sideways like a small firework, then gravity pulls them down through the scene. Their falling motion inherits some of the current level's ingredient speed and the blood slow-motion factor. Persistent particles stay below falling ingredients and are strictly capped so repeated impalements can create a rain of debris without unbounded DOM growth.

Fast correct impalements create a visible multiplier attached to the skewer. The current chain can rise from ×2 to ×6; the best chain achieved on the current skewer multiplies that skewer's base value when it is delivered.

The ongoing avalanche must remain cheap to render. Falling ingredients and persistent gore use compositor-friendly direct transforms; expensive visual effects are reserved for short impact moments instead of running continuously on every vegetable.

## Progression

Progression is explicit by level, not derived from score. Level 1 requires 3 served clients, level 2 requires 4, level 3 requires 5, and each following level requires one additional served client. Losing a client does not advance the level.

The available ingredient vocabulary grows every two levels, from 3 ingredient types at levels 1–2 to a maximum of 7. The seventh normal ingredient is eggplant. Recipe length also grows every two levels: 2 ingredients at levels 1–2, 3 at levels 3–4, 4 at levels 5–6, 5 at levels 7–8, then the hard maximum of 6 ingredients from level 9 onward.

Base skewer values are deliberately nonlinear so difficult large recipes matter: 2 ingredients = 2 points, 3 = 4, 4 = 6, 5 = 10, 6 = 15. A fast-impalement multiplier can multiply that base value.

Difficulty increases every level across several dimensions: simultaneous-object ceiling, falling speed, spawn frequency, rotation, oblique trajectories and multi-object bursts. Early play stays sparse and readable; six-ingredient recipes and true avalanches are late-game states.

Blood should become more strategically important as the screen gets denser and faster. Garlic also appears progressively instead of overwhelming beginners immediately.

Level transitions get a readable high-screen card for roughly three seconds. It shows `NIVEAU N`, the currently unlocked ingredient icons, and the number of clients required. The client rail keeps a compact persistent level/progress label after the card disappears.

## Characters / props

Emoji ingredients and customers remain the current lightweight character vocabulary. Key props are the steel skewer, gold tip, descending client queue, blood drop and garlic hazard. The active client is the bottom client in the queue so serving is a natural continuation of the skewer movement.

## Layout note

The game intentionally uses a freeform full-surface falling-object field rather than the standard HUD/stage/controls DOM skeleton because the skewer is a continuous drag object moving across the lower playfield and into a customer delivery target. Critical UI and the local `touch-action: none` control surface must still respect MiniFugg Core safe zones and the bottom swipe gutter. Shared typography/spacing tokens should be used where practical.

The active client must sit immediately above the dotted control boundary and inside the physical vertical reach of the skewer tip. On short portrait phones the client rail is compacted so delivery remains practical.

The control boundary limits the skewer position, not pointer tracking: once a drag starts, moving the pointer outside the control area must keep sliding the skewer along the nearest boundary instead of freezing input. The old explanatory text inside the dotted control zone stays removed.

## Avoid

- generic purple/cyan neon or glassmorphism as a new visual direction
- hiding the gold tip or making another part of the skewer interactive
- tiny critical labels
- permanent full-screen effects that hide the falling ingredients
- unbounded DOM growth during late-game avalanches or juice showers
- making the opening seconds feel like the end-game avalanche
- placing the client delivery target outside the actual skewer-tip reach or under Core chrome
