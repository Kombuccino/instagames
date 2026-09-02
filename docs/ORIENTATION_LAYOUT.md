# MiniFugg Orientation & Layout Contract

MiniFugg Core supports phone portrait and phone landscape. Orientation is a game-design choice, not a platform limitation.

## 1. Game declaration

Every real game should declare a preferred orientation in `src/core/gameRegistry.tsx`:

```ts
orientation: 'portrait' // or 'landscape' or 'both'
```

Meanings:

- `portrait`: gameplay is designed primarily for an upright phone.
- `landscape`: gameplay is designed primarily for a phone turned sideways.
- `both`: both layouts are intentionally designed and equally supported.

Core itself remains responsive in either physical orientation. The preference is metadata for game design and future native orientation handling; it must not be implemented by rotating the DOM with transforms.

## 2. Core portrait layout

On a portrait phone:

- game identity: top left;
- score: top right;
- actions: one horizontal dock near the bottom center;
- a protected swipe gutter remains below the dock;
- the game uses the central area between Core safe zones.

## 3. Core landscape layout

On a landscape phone:

- game identity remains top left and can use a longer horizontal line;
- score remains top right;
- rules / love / comments / bookmark become one vertical dock on the right;
- the bottom is mostly returned to gameplay, except for the protected swipe gutter;
- the game must keep critical content out of the right Core reservation.

Do not rotate the icons themselves. The dock changes from a horizontal row to a vertical column; icon glyphs remain upright.

## 4. Global safe-zone variables

Core exposes:

```css
--minifugg-core-top-reserved
--minifugg-core-bottom-reserved
--minifugg-core-left-reserved
--minifugg-core-right-reserved
--minifugg-swipe-gutter
```

Portrait currently reserves primarily top + bottom. Landscape phone additionally reserves the right side for the vertical action dock.

A reusable safe game area can use:

```css
.game-safe-layer {
  position: absolute;
  top: var(--minifugg-core-top-reserved);
  right: var(--minifugg-core-right-reserved);
  bottom: var(--minifugg-core-bottom-reserved);
  left: var(--minifugg-core-left-reserved);
}
```

Backgrounds and non-interactive effects may extend behind Core chrome. Buttons, drag targets, readable instructions, timers, critical targets and required HUD may not.

## 5. Creation workflow

Orientation should be decided early in a game's 10-prompt creation sequence.

If the mechanic obviously implies an orientation, infer it and state the choice rather than wasting a prompt. Examples:

- falling-block / vertical stacking: usually portrait;
- horizontal conveyor / racing lane / side-view timing: often landscape;
- square grid puzzle: portrait or both depending on UI density.

If orientation is genuinely unclear, include one compact choice in the same preflight as the visual QCM:

`Orientation: A portrait · B landscape · C both · D decide for me`

Do not spend a whole game prompt only asking this question.

## 6. Game implementation rule

A game must be excellent in its declared preferred orientation. It should also avoid catastrophic breakage if the user rotates temporarily.

For `both`, create deliberate media-query layouts rather than simply scaling the portrait layout.

Landscape phone rules should normally be scoped with a media query similar to:

```css
@media (orientation: landscape) and (max-height: 650px) {
  /* phone-landscape layout */
}
```

This avoids treating an ordinary wide desktop browser as a rotated phone.

## 7. Reference implementation

`Shoot the Shooter` is the first landscape reference game.

Its landscape layout uses:

- the main shooter track as the large left gameplay region;
- alcohol/misses above the track;
- the five-recipe memory card as a compact right column;
- the Core action dock further right in its own reserved strip.

Future landscape games should copy the **layout principles and safe-zone use**, not its visual styling.
