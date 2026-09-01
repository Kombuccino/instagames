# MiniFugg Input & Swipe Contract

MiniFugg is a vertical game feed. A player must never become trapped inside a game because gameplay captures touch input.

## Guaranteed exit gesture

Core reserves a bottom swipe gutter using:

```css
--minifugg-swipe-gutter
--minifugg-core-bottom-reserved
```

The strip at the very bottom of each feed slot belongs to Core and always keeps `touch-action: pan-y`. It exists so the player can swipe to the next/previous game even when the current game has aggressive pointer handling.

Do not place game buttons, drag targets, joysticks, sliders, cards, text inputs or other interactive controls inside `--minifugg-core-bottom-reserved`.

Decoration/background art may extend behind it.

## `touch-action` rule

Never put this on the root/fullscreen game container:

```css
.game-root {
  touch-action: none;
}
```

That disables the vertical feed gesture when a touch begins on the game.

Default root behavior should preserve vertical panning:

```css
.game-root {
  touch-action: pan-y;
}
```

Use `touch-action: none` only on the smallest gameplay element that genuinely requires exclusive pointer control, for example:

- a draggable joystick;
- a drawing canvas;
- a specific drag surface;
- a hold/aim control.

Buttons that only tap/click should generally use `touch-action: manipulation`.

## Pointer capture

`setPointerCapture()` is allowed only for a real drag/hold interaction and must always be released or cleaned up on:

- `pointerup`;
- `pointercancel`;
- component cleanup / loss of active state when relevant.

Do not capture pointers on a fullscreen wrapper merely to simplify controls.

## Feed gesture priority

A game may own local horizontal drag or precise gestures in its gameplay region, but Core must always retain a practical escape path.

When designing controls:

1. keep essential controls above `--minifugg-core-bottom-reserved`;
2. prefer local interactive zones rather than fullscreen pointer interception;
3. preserve `pan-y` outside those zones;
4. test that a user can swipe away from the game on a phone without hunting for a tiny gap.

## Definition of done

Before finishing a game on mobile, verify:

- swipe up/down can leave the game;
- the bottom Core gutter is not covered by game UI;
- no fullscreen `touch-action: none` remains;
- pointer capture cannot remain stuck after cancellation;
- the shared action dock and score do not hide gameplay controls.
