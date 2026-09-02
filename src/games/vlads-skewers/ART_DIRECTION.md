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

## Motion language

The game should feel excessive rather than delicate: fast falling objects, spinning and oblique trajectories, escalating vegetable avalanches, brutal squash/stretch when the point penetrates an ingredient, a short comic slash, a large colored wet burst and many droplets at impact. Impalement is intentionally much more violent and readable than ordinary food-game feedback. Blood creates a very legible temporary slow-motion contrast.

The ongoing avalanche must remain cheap to render. Falling ingredients should move with compositor-friendly transforms; expensive visual effects are reserved for short impact moments instead of running continuously on every vegetable.

## Characters / props

Emoji ingredients and customers remain the current lightweight character vocabulary. Key props are the steel skewer, gold tip, descending client queue, blood drop and garlic hazard. The active client is the bottom client in the queue so serving is a natural continuation of the skewer movement.

## Layout note

The game intentionally uses a freeform full-surface falling-object field rather than the standard HUD/stage/controls DOM skeleton because the skewer is a continuous drag object moving across the lower playfield and into a customer delivery target. Critical UI and the local `touch-action: none` control surface must still respect MiniFugg Core safe zones and the bottom swipe gutter. Shared typography/spacing tokens should be used where practical.

The control boundary limits the skewer position, not pointer tracking: once a drag starts, moving the pointer outside the control area must keep sliding the skewer along the nearest boundary instead of freezing input.

## Avoid

- generic purple/cyan neon or glassmorphism as a new visual direction
- hiding the gold tip or making another part of the skewer interactive
- tiny critical labels
- permanent full-screen effects that hide the falling ingredients
- unbounded DOM growth during late-game avalanches
- placing the client delivery target under Core chrome
