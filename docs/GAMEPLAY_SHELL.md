# MiniFugg — Gameplay Shell

This document defines the MiniFugg Core chrome and exit behavior **while a game is actively being played**.

Read together with:

- `docs/DISCOVERY_NAVIGATION.md` for cover browsing and play entry;
- `docs/INPUT_GESTURES.md` for gesture ownership;
- `docs/GAME_LAYOUT_SYSTEM.md` for responsive in-game layout;
- `docs/PLATFORM_ECONOMY.md` for replay cost and coin rules.

This is a Core-level contract. Individual games must not rebuild the platform shell locally.

---

## 1. Core principle: gameplay is almost fullscreen

The new MiniFugg navigation model removes the need for permanent top and bottom platform bars while playing.

Once a player opens a game from its cover, the game should receive **almost the entire available viewport**.

By default, do not keep persistent platform UI such as:

- a large top header;
- a bottom navigation bar;
- permanent social buttons;
- permanent comments/favorites controls;
- a persistent coin counter;
- a permanent feed navigation gutter;
- large Core score/title areas that reduce the playfield.

The game owns the screen.

This is especially important on phones, where old Core chrome consumed valuable gameplay space.

---

## 2. The one persistent Core control

During active gameplay, Core keeps only one small persistent escape control:

> **Close box / return to cover**

The exact icon is still open to visual design. It should communicate returning/closing rather than generic browser navigation.

Possible visual metaphors:

- a small back/close-box icon;
- a lid/cover closing mark;
- a compact chevron combined with the MiniFugg box metaphor.

Requirements:

- small but touch-accessible;
- visually quiet;
- fixed to a safe edge/corner;
- must not cover essential game controls;
- must remain readable over very different game art directions;
- translated tooltip/accessibility label, but the icon itself should not depend on language.

The control belongs to Core, not the game.

---

## 3. Closing the box

Activating the close-box control exits the current play session and returns to **the same game's cover**.

The preferred transition is the reverse of play entry:

1. active game freezes or cleanly exits its session;
2. the cover/box returns over the game;
3. the box visually closes;
4. the player lands on the same full-screen cover;
5. vertical discovery navigation becomes active again.

Do not jump directly to another game when closing.

The metaphor is:

- cover → open box → game;
- game → close box → same cover.

This spatial continuity is part of the MiniFugg identity.

---

## 4. Gesture ownership changes once inside a game

While browsing covers, Core owns the discovery gestures defined in `docs/DISCOVERY_NAVIGATION.md`.

Once gameplay begins, that discovery gesture grammar is suspended.

The active game may use:

- vertical swipes;
- horizontal swipes;
- drag;
- pointer capture where appropriate;
- wheel/trackpad if the game genuinely needs it;
- keyboard controls.

A player exits through the explicit Core close-box control rather than by hunting for a reserved swipe gutter.

This is a deliberate change from the older MiniFugg feed model.

---

## 5. No permanent coin counter during gameplay by default

Free-player coin balance must remain visible while browsing covers, because it affects the decision to launch a game.

It does **not** need to remain permanently visible while the game is running.

Default behavior:

- cover/discovery: balance visible;
- active gameplay: balance hidden unless a specific temporary Core event requires it;
- replay/end-of-run: relevant cost/balance may reappear because the player is making a new spending decision.

This gives the game maximum visual space without hiding economic information at the moment it matters.

---

## 6. End-of-run shell

The persistent gameplay shell stays minimal, but Core may present a compact end-of-run state after the game reports completion.

Minimum actions to explore:

- `REPLAY · 2 COINS` for Fugg;
- `REPLAY · 1 COIN` for Bêta;
- `REPLAY · FREE` for Caca;
- equivalent unlimited treatment for Lifetime / Free Play;
- `QUIT` / `CLOSE` returning to the same cover.

Replay is another play and normally uses the same cost as launching that game's current curation status, as defined in `docs/PLATFORM_ECONOMY.md`.

The exact end-screen composition is intentionally not finalized yet. It should be designed separately per the shared Core system without forcing every game to build its own monetization UI.

Individual games should report the end of a run and let Core own replay/quit economics and presentation.

---

## 7. In-game social and platform actions

Do not keep comments, favorites, profile or community controls permanently over gameplay merely because they existed in an older Core layout.

Game details/community are primarily reached from the cover-side navigation defined in `docs/DISCOVERY_NAVIGATION.md`.

Temporary contextual actions may exist later, but the default rule is:

> **When the game is active, let the game be the game.**

---

## 8. Responsive consequence

Because Core chrome no longer reserves large top/bottom strips, gameplay layouts should be migrated to use the additional viewport space.

Games should still respect:

- device safe-area insets / notches;
- the compact close-box control's local exclusion zone;
- their own HUD/control hierarchy;
- orientation rules;
- accessible touch sizes.

Do not preserve old empty padding merely because previous versions reserved space for MiniFugg bars.

---

## 9. Current product decisions locked

- active gameplay is almost fullscreen;
- no permanent top platform bar by default;
- no permanent bottom platform bar by default;
- no permanent discovery swipe gutter while playing;
- no persistent coin counter during active gameplay by default;
- Core keeps one small close-box / return-to-cover control;
- closing returns to the **same** game cover;
- cover discovery gestures are suspended while gameplay is active;
- game input can use the full gesture vocabulary while active;
- end-of-run may show Core-owned replay + quit actions;
- replay cost follows game status pricing unless the economy contract changes later.
