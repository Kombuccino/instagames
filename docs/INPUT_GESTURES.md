# MiniFugg Input & Gesture Contract

MiniFugg uses two different gesture contexts:

1. **cover discovery** — Core owns the spatial navigation grammar;
2. **active gameplay** — the game owns gameplay gestures and Core exposes an explicit close-box exit control.

Read together with:

- `docs/DISCOVERY_NAVIGATION.md` for cover browsing;
- `docs/GAMEPLAY_SHELL.md` for fullscreen gameplay and exit;
- `docs/GAME_LAYOUT_SYSTEM.md` for responsive game layout.

---

## 1. Cover discovery gesture grammar

While a full-screen game cover is active, Core owns these gestures:

- finger moves upward → previous game cover;
- finger moves downward → next game cover;
- finger moves left → play / open current game;
- finger moves right → details / community for current game.

The cover owns these gestures until the play-entry transition completes.

Desktop equivalents may use wheel/trackpad/pointer gestures when appropriate. Keyboard navigation must not steal common gameplay keys once a game is active.

---

## 2. Active gameplay gesture ownership

Once a game is open, the discovery grammar is suspended.

The game may use the full practical input vocabulary it needs:

- vertical swipe;
- horizontal swipe;
- drag;
- hold;
- wheel/trackpad when relevant;
- pointer capture on local interaction surfaces;
- keyboard controls.

There is **no longer a permanent bottom Core swipe gutter whose purpose is to leave the game**.

The player exits active gameplay using the explicit Core **close-box / return-to-cover** control defined in `docs/GAMEPLAY_SHELL.md`.

This change exists specifically so games can reclaim almost the whole viewport and use gestures without fighting the old vertical-feed escape rule.

---

## 3. Close-box control is the guaranteed escape path

Core must provide a small, always reachable control while gameplay is active.

Activating it:

1. exits/freezes the current session cleanly;
2. reverses the box-opening metaphor;
3. returns to the same game's cover;
4. restores cover discovery gestures.

Do not use an invisible edge gesture as the only exit mechanism.

Do not jump to another game when closing.

---

## 4. Keyboard ownership

Keyboard gameplay controls belong to the active game.

Core must not intercept common gameplay keys while a game is active, including:

- ArrowUp / ArrowDown / ArrowLeft / ArrowRight;
- Space;
- Enter;
- WASD / ZQSD;
- letter keys commonly used for actions.

Desktop cover browsing may use wheel/trackpad/pointer navigation rather than consuming these keys.

A dedicated `Escape` shortcut may later mirror the close-box button if Core adopts it globally, but this is optional and must not replace the visible control.

---

## 5. `touch-action` rules

The old requirement to preserve `pan-y` on every fullscreen game root is removed.

During active gameplay, a game may use the touch-action behavior its mechanic genuinely requires.

Still follow good input hygiene:

- use `touch-action: none` only when the mechanic benefits from exclusive touch handling;
- prefer `touch-action: manipulation` for simple tap buttons;
- avoid fullscreen pointer interception unless the gameplay surface itself is truly fullscreen;
- keep the Core close-box control outside game pointer interception.

The key invariant is no longer “feed swipe must always escape”. The invariant is:

> **The Core close-box control must always remain reachable.**

---

## 6. Pointer capture

`setPointerCapture()` is allowed for real drag/hold interactions and must be released or cleaned up on:

- `pointerup`;
- `pointercancel`;
- component cleanup / loss of active state when relevant.

Do not accidentally capture events that belong to the Core close-box control.

---

## 7. End-of-run input

After a run ends, Core may present replay/quit actions.

During that end state:

- replay may consume the game's normal play cost;
- quit returns to the same cover;
- gameplay input should no longer remain active underneath the end-state controls.

Exact visual treatment is defined separately from the gesture contract.

---

## 8. Definition of done

Before finishing a game, verify:

- cover gestures work before the game opens;
- leftward play gesture opens the current game rather than navigating away;
- once gameplay is active, gameplay gestures are not intercepted by cover/feed navigation;
- the close-box control is always reachable and usable on phone and desktop;
- close-box returns to the same cover;
- keyboard gameplay controls remain available to the active game;
- pointer capture cannot remain stuck after cancellation;
- old reserved bottom-feed escape padding/gutters are not unnecessarily reducing gameplay space.
