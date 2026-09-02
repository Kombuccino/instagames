# MiniFugg Game Layout System v1

MiniFugg games should not invent a completely different responsive geometry for every screen size. The goal is not to make every game look the same; it is to keep important information, controls and proportions stable while preserving each game's art direction.

The shared implementation lives in `src/core/gameLayout.css`.

## 1. Principle

Do not design separate arbitrary PC and mobile layouts from scratch.

Use the same semantic layout zones on every screen:

1. game HUD;
2. main stage/playfield;
3. game controls;
4. optional anchored game-specific elements inside those zones.

Core chrome remains outside those zones.

The standard wrapper is:

```html
<div class="mf-game-layout">
  <header class="mf-game-hud">...</header>
  <main class="mf-game-stage">...</main>
  <footer class="mf-game-controls">...</footer>
</div>
```

The wrapper automatically respects:

```css
--minifugg-core-top-reserved
--minifugg-core-right-reserved
--minifugg-core-bottom-reserved
--minifugg-core-left-reserved
```

Backgrounds and non-interactive art may still fill the complete game surface.

## 2. Use container-relative tokens, not arbitrary viewport math

`gameLayout.css` defines stable design tokens:

```css
--mf-pad-x
--mf-pad-y
--mf-gap-1
--mf-gap-2
--mf-gap-3
--mf-gap-4

--mf-text-xs
--mf-text-sm
--mf-text-md
--mf-text-lg
--mf-text-xl

--mf-touch-sm
--mf-touch-md
--mf-touch-lg
```

These values are calculated from the actual game container using container-query units and bounded with `clamp()`.

That means a very wide desktop window does not make game text absurdly large, and a narrow phone does not shrink important labels to fly-print.

Prefer:

```css
.my-score-label {
  font-size: var(--mf-text-md);
}

.my-action {
  min-width: var(--mf-touch-md);
  min-height: var(--mf-touch-md);
}
```

instead of:

```css
font-size: 2vw;
width: 13vw;
height: 7vh;
```

Raw `vw` / `vh` combinations are one of the main reasons the same game currently looks different across devices.

## 3. Positions should be semantic or proportional

Prefer CSS Grid/Flex inside the shared zones.

For fixed overlays, use the shared anchors:

```text
mf-anchor-top-left
mf-anchor-top-center
mf-anchor-top-right
mf-anchor-center
mf-anchor-bottom-left
mf-anchor-bottom-center
mf-anchor-bottom-right
```

If an object belongs at 70% of a playfield, position it relative to `.mf-game-stage`, not relative to the full browser viewport.

## 4. Portrait and landscape

The semantic zones remain the same in both orientations.

Portrait typically reads:

```text
CORE IDENTITY
-------------
GAME HUD

MAIN STAGE

GAME CONTROLS
-------------
CORE ACTION DOCK / SWIPE
```

Landscape typically reads:

```text
CORE IDENTITY                         CORE SCORE
-------------------------------------------------
GAME HUD              MAIN STAGE          CORE DOCK
                      / optional side HUD
GAME CONTROLS
-------------------------------------------------
SWIPE ESCAPE
```

The shared tokens use the short dimension in landscape so typography and touch controls do not inflate just because the screen became wider.

Games declared `both` may rearrange internal Grid/Flex composition, but should preserve the same hierarchy and token sizes.

## 5. Text hierarchy

Use a limited hierarchy rather than one-off font sizes everywhere:

- `--mf-text-xs`: secondary, non-critical text;
- `--mf-text-sm`: normal game labels;
- `--mf-text-md`: important HUD labels;
- `--mf-text-lg`: major values / alerts;
- `--mf-text-xl`: exceptional score/combo/impact text.

Do not use `xs` for essential instructions or controls.

## 6. Touch hierarchy

Use:

- `--mf-touch-sm`: secondary compact action;
- `--mf-touch-md`: normal gameplay button;
- `--mf-touch-lg`: dominant primary action / joystick control.

Do not shrink controls on desktop merely because a mouse is available; the same game should still read as the same product.

## 7. Existing games

Older games currently contain substantial custom responsive CSS. The shared grid does not magically rewrite them.

Migration should be incremental:

1. replace custom full-screen safe offsets with `.mf-game-layout`;
2. move game HUD into `.mf-game-hud`;
3. move the actual playfield into `.mf-game-stage`;
4. move controls into `.mf-game-controls`;
5. replace arbitrary text/touch sizes with shared tokens;
6. keep game-specific visual styling, shapes, colors and animation untouched;
7. remove device-specific media queries that only compensate for old absolute positioning.

Do not migrate gameplay logic merely to adopt the layout grid.

## 8. Exceptions

A game may use a custom/freeform layout when the mechanic genuinely requires it, for example a full-screen drawing canvas or physics world. Even then:

- use shared typography/touch tokens for readable HUD;
- respect Core safe zones;
- position important elements relative to the game container or playfield, not arbitrary browser viewport dimensions;
- document the reason in `ART_DIRECTION.md` or a game-specific layout note.

## 9. Debugging

During development, add `data-layout-debug` to the game root to show outlines for the shared safe layout, HUD, stage and controls.

Remove it before considering the game finished.

## 10. Definition of done

A layout is ready when the same hierarchy remains recognizable on:

- narrow portrait phone;
- tall portrait phone;
- wide portrait/desktop frame;
- supported landscape phone;
- desktop mouse viewport.

Positions may reflow, but information hierarchy, relative importance, text sizing and control sizing should not appear like a different game.
