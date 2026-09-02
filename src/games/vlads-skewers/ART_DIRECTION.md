# Les Brochettes de Vlad — Art Direction

## Base direction

`custom` — Transylvanian grill / dark comic food arcade. The game keeps its ember-lit grill atmosphere rather than switching to a generic MiniFugg house style. Motion borrows the hard impact principle of Ink Pulp, but the game is not an Ink Pulp kit implementation.

## Palette

- charcoal / blood-brown background: `#110708`, `#21100d`, `#32160f`
- ember orange: `#ff6420`
- blood red: `#d93b34`
- warm metal / target gold: `#f4c34f`, `#ffe378`
- food juice colors follow the ingredient: tomato/meat red, pepper/zucchini green, onion purple, mushroom yellow/tan

## Typography

Use the inherited MiniFugg/system grotesk. Labels are short, heavy and readable. Important instructions use shared `--mf-text-*` tokens; avoid fly-print for gameplay-critical information.

## Material / texture language

Dark grill, smoke, ember light, rough metal skewer, hot food and wet splashes. The skewer tip is deliberately gold and luminous because it is the exact gameplay hit point.

The lower scene should visibly read as a barbecue: brighter flames/coals behind a dark metal rack. Ingredients already on Vlad's skewer are visibly browned/grilled and can carry subtle grill marks. As the skewer fills, juice increasingly stains the metal and Vlad's hand.

## Motion language

The game should feel excessive rather than delicate: fast falling objects, spinning and oblique trajectories, escalating vegetable avalanches, brutal squash/stretch when the point penetrates an ingredient, a short comic slash, a large colored wet burst and many droplets at impact. Impalement is intentionally much more violent and readable than ordinary food-game feedback. Blood creates a very legible temporary slow-motion contrast.

Impalement impacts use a varied bank of roughly fifteen disgusting comic onomatopoeias plus a second, smaller pain/horror line spoken by the ingredient. Meat and each vegetable family can have its own absurd reaction vocabulary. The joke should feel like a tiny horror cartoon, not realistic gore.

Impact juice does not vanish with the impact word. Each successful stab ejects a bounded set of colored droplets and small chunks into a persistent background gore layer. They fall beneath the live ingredients until leaving the bottom of the screen. Several rapid impalements should therefore create a temporary rain of vegetable/meat juice and fragments. This layer must be strictly capped and self-cleaning so it never undoes the avalanche performance work.

The ongoing avalanche must remain cheap to render. Falling ingredients should move with compositor-friendly transforms; expensive visual effects are reserved for short impact moments instead of running continuously on every vegetable.

## Progression

Difficulty is deliberately stepped rather than immediately aggressive. Three served customers advance one service tier. Early play is sparse and readable: two-ingredient recipes, very few simultaneous falling objects, slow vertical trajectories and almost no spin/oblique motion. Each tier can increase several dimensions together: recipe length, simultaneous-object ceiling, falling speed, spawn frequency, rotation, oblique trajectories and multi-object bursts. Five/six-ingredient recipes and true avalanches belong to late tiers, not the opening seconds.

Every tier begins with a short, central card: `NIVEAU N` / `— 3 CLIENTS —`. It is a visual beat, not a blocking modal. Difficulty changes belong to these three-client boundaries so the player understands why the service suddenly becomes harder.

Blood should become more strategically important as the screen gets denser and faster. Garlic also appears progressively instead of overwhelming beginners immediately.

## Characters / props

Emoji ingredients and customers remain the current lightweight character vocabulary. Key props are the steel skewer, gold tip, descending client queue, blood drop and garlic hazard. The active client is the bottom client in the queue so serving is a natural continuation of the skewer movement.

## Layout note

The game intentionally uses a freeform full-surface falling-object field rather than the standard HUD/stage/controls DOM skeleton because the skewer is a continuous drag object moving across the lower playfield and into a customer delivery target. Critical UI and the local `touch-action: none` control surface must still respect MiniFugg Core safe zones and the bottom swipe gutter. Shared typography/spacing tokens should be used where practical.

The active customer must sit immediately above the dotted control boundary, inside the physical vertical reach of the skewer tip. Waiting customers stack upward from there. This positioning is more important than vertically centering the queue.

The control boundary limits the skewer position, not pointer tracking: once a drag starts, moving the pointer outside the control area must keep sliding the skewer along the nearest boundary instead of freezing input. The old explanatory text inside the dotted control zone is intentionally removed once the mechanic is visually self-explanatory.

## Avoid

- generic purple/cyan neon or glassmorphism as a new visual direction
- hiding the gold tip or making another part of the skewer interactive
- tiny critical labels
- permanent full-screen effects that hide the falling ingredients
- unbounded DOM growth during late-game avalanches or gore rain
- making the opening seconds feel like the end-game avalanche
- placing the client delivery target outside the actual skewer-tip reach or under Core chrome
