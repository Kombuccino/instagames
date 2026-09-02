# Les Brochettes de Vlad — Art Direction

## Base direction

`custom` — Transylvanian grill / dark comic food arcade. The current game keeps its existing ember-lit grill atmosphere rather than switching to a generic MiniFugg house style. Motion borrows the hard, juicy impact principle of Ink Pulp, but the game is not an Ink Pulp kit implementation.

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

Fast falling objects, occasional spinning and oblique trajectories, short squash/impact on impalement, colored juice splashes, accelerating crowd/avalanche rhythm. Blood creates a very legible temporary slow-motion contrast.

## Characters / props

Emoji ingredients and customers remain the current lightweight character vocabulary. Key props are the steel skewer, gold tip, customer order cards, blood drop and garlic hazard.

## Layout note

The game intentionally uses a freeform full-surface falling-object field rather than the standard HUD/stage/controls DOM skeleton because the skewer is a continuous drag object moving across the lower playfield and into a customer delivery target. Critical UI and the local `touch-action: none` control surface must still respect MiniFugg Core safe zones and the bottom swipe gutter. Shared typography/spacing tokens should be used where practical.

## Avoid

- generic purple/cyan neon or glassmorphism as a new visual direction
- hiding the gold tip or making another part of the skewer interactive
- tiny critical labels
- effects so large that they obscure falling ingredients
- placing the client delivery target under Core chrome
