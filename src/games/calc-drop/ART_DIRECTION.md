# TetraMindFck — Art Direction

## Gameplay surface

Preserve the current TetraMindFck gameplay visual language unless a later prompt explicitly asks for an in-game redesign. The welcome-screen work is a separate marketing/editorial layer in front of the game.

## Welcome illustration direction

TetraMindFck is the pilot for `docs/WELCOME_ILLUSTRATIONS.md`.

Core idea to communicate:

- tetromino-like pieces falling under pressure;
- arithmetic / mental overload;
- a person or mind breaking, fracturing or exploding;
- expressive human illustration rather than glossy generic AI rendering;
- late-80s / early-90s European game-cover credibility, with alternate editorial/cultural editions.

Approved full-resolution production directions so far:

1. `pulp-euro` — hand-painted / ink-pulp psychological overload;
2. `micro-euro` — believable European micro-computer cover language;
3. `graphic-poster` — authored graphic/poster interpretation.

Foreign-edition candidates being explored:

- Japanese edition;
- Chinese edition.

Only promote a cultural edition into the production variant list once a proper standalone full-resolution master has been created and imported through the Drive asset pipeline. Do not use cropped concept boards as production artwork.

## Motion

The welcome wrapper may add only subtle runtime motion:

- tiny camera/parallax drift;
- moving light / reflection;
- sparse floating tetromino motifs;
- animated upward play arrow.

Motion must pause when the feed slot is inactive and must respect `prefers-reduced-motion`.

## Interaction

Primary CTA: `SWIPE TO PLAY ↑`.

The local welcome swipe surface may capture the central artwork area, but the Core bottom swipe gutter must remain available so the player can still escape the feed slot.

## Unlocks

Current pilot thresholds:

- pulp-euro: default;
- micro-euro: 5,000 best score;
- graphic-poster: 15,000 best score;
- future foreign edition: target 30,000 best score.

The pilot currently stores best-score unlock state locally. A future platform/profile implementation may sync unlocks across devices.

## Asset rules

Follow `docs/ASSET_PIPELINE.md` exactly. Masters are uploaded untouched to the private Drive `Fugg` folder and referenced only after the synced file exists under `public/assets/imported/`.
