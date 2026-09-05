# MiniFugg Game Layout System v2

MiniFugg games should keep stable proportions across screen sizes without wasting gameplay space on permanent platform chrome.

The shared implementation lives in `src/core/gameLayout.css`.

Read together with `docs/GAMEPLAY_SHELL.md`: active gameplay is now **almost fullscreen** and Core normally keeps only a small close-box / return-to-cover control.

---

## 1. Principle

Do not design separate arbitrary PC and mobile layouts from scratch.

Use the same semantic **game-owned** zones on every screen:

1. game HUD;
2. main stage/playfield;
3. game controls;
4. optional anchored game-specific elements.

The standard wrapper remains useful:

```html
<div class="mf-game-layout">
  <header class="mf-game-hud">...</header>
  <main class="mf-game-stage">...</main>
  <footer class="mf-game-controls">...</footer>
</div>
```

These are zones for the **game's own interface**, not permanent MiniFugg platform bars.

Under the new gameplay shell, `.mf-game-layout` should be able to use essentially the full active game container.

Do not preserve old top/bottom empty strips merely because previous MiniFugg versions reserved room for Core navigation, score or a swipe gutter.

---

## 2. Core exclusion while playing is minimal

During active gameplay, Core normally overlays only the compact close-box control defined in `docs/GAMEPLAY_SHELL.md`.

Games must:

- keep essential gameplay controls clear of that small local control;
- respect device safe-area/notch insets;
- otherwise use the available viewport.

Old broad Core reservations such as large persistent top/bottom bars should not dictate new game composition.

If existing CSS variables such as these remain for compatibility:

```css
--minifugg-core-top-reserved
--minifugg-core-right-reserved
--minifugg-core-bottom-reserved
--minifugg-core-left-reserved
```

they should not be assumed to represent large permanent chrome in the new shell. Migration may reduce/collapse them as Core implementation catches up.

---

## 3. Use container-relative tokens, not arbitrary viewport math

`gameLayout.css` defines stable design tokens such as:

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

Prefer container-relative bounded sizing over raw `vw` / `vh` combinations.

Example:

```css
.my-score-label {
  font-size: var(--mf-text-md);
}

.my-action {
  min-width: var(--mf-touch-md);
  min-height: var(--mf-touch-md);
}
```

The extra fullscreen space should improve the playfield, not cause uncontrolled scaling.

---

## 4. Positions should be semantic or proportional

Prefer CSS Grid/Flex inside the shared zones.

For fixed game overlays, use shared anchors where useful:

```text
mf-anchor-top-left
mf-anchor-top-center
mf-anchor-top-right
mf-anchor-center
mf-anchor-bottom-left
mf-anchor-bottom-center
mf-anchor-bottom-right
```

If an object belongs at 70% of a playfield, position it relative to `.mf-game-stage`, not the browser viewport.

---

## 5. Portrait and landscape

The semantic game hierarchy remains consistent across orientations, but there is no longer an architectural need to draw permanent Core bars above and below it.

Portrait target:

```text
┌───────────────────────┐
│ small Core close-box  │  ← overlay only
│                       │
│ GAME HUD              │
│                       │
│ MAIN STAGE            │
│                       │
│ GAME CONTROLS         │
│                       │
└───────────────────────┘
```

Landscape target:

```text
┌────────────────────────────────────┐
│ small Core close-box               │
│ GAME HUD      MAIN STAGE / HUD     │
│ GAME CONTROLS                      │
└────────────────────────────────────┘
```

Games declared `both` may rearrange internal Grid/Flex composition while preserving hierarchy and readable token sizes.

---

## 6. Text hierarchy

Use a limited hierarchy rather than one-off font sizes everywhere:

- `--mf-text-xs`: secondary, non-critical text;
- `--mf-text-sm`: normal game labels;
- `--mf-text-md`: important HUD labels;
- `--mf-text-lg`: major values / alerts;
- `--mf-text-xl`: exceptional score/combo/impact text.

Do not use `xs` for essential instructions or controls.

---

## 7. Touch hierarchy

Use:

- `--mf-touch-sm`: secondary compact action;
- `--mf-touch-md`: normal gameplay button;
- `--mf-touch-lg`: dominant primary action / joystick control.

The close-box control is Core-owned and should have its own accessible hit target independent of the game's visual styling.

---

## 8. Existing-game migration

Older games may still be laid out around the previous Core shell.

Migration should be deliberate:

1. remove large empty padding that existed only for old Core top/bottom chrome;
2. let `.mf-game-layout` expand into the reclaimed area;
3. keep game HUD in `.mf-game-hud` when semantically useful;
4. expand `.mf-game-stage` to use the newly available room;
5. keep game controls in `.mf-game-controls` or appropriate local overlays;
6. replace arbitrary text/touch sizes with shared tokens;
7. reserve only the small local area needed by the Core close-box control;
8. preserve gameplay and art direction.

Do not redesign a game's rules merely to adopt the new shell.

---

## 9. Freeform exceptions

A game may use a custom/freeform fullscreen layout when the mechanic genuinely requires it, for example:

- drawing canvas;
- physics world;
- runner;
- direct-manipulation board;
- full-screen swipe/drag mechanic.

Under the new gesture contract this is easier, because active games no longer need to preserve a feed escape swipe.

Even then:

- use shared typography/touch tokens where useful;
- keep the Core close-box control reachable;
- respect device safe areas;
- clean up pointer capture correctly;
- document significant layout exceptions in `ART_DIRECTION.md`.

---

## 10. Definition of done

A layout is ready when:

- the game uses nearly all useful screen space on phone and desktop;
- no obsolete Core top/bottom padding remains;
- the close-box control does not obstruct essential gameplay;
- the same hierarchy remains recognizable on narrow/tall phones and desktop;
- game-owned HUD/controls remain readable;
- orientation changes do not create a completely unrelated composition;
- gameplay gestures work without being intercepted by cover discovery navigation.
