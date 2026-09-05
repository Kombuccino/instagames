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

The current visual direction is now more specific than a generic close control:

- use a small **edge tab** in the upper-left safe zone by default;
- the icon should evoke a cover/box sliding closed over the game;
- do **not** use a pause icon;
- do **not** use a plain browser-style `X` as the final visual metaphor;
- the tab may remain partially translucent at rest and become clearer on hover/focus/touch feedback.

Requirements:

- small but touch-accessible;
- visually quiet;
- fixed to a safe edge/corner;
- must not cover essential game controls;
- must remain readable over very different game art directions;
- translated tooltip/accessibility label, but the icon itself should not depend on language.

The control belongs to Core, not the game.

A first live CSS prototype is implemented in `src/core/platformGameLoop.css`; treat it as a refinement surface, not as permission for individual games to fork the control.

---

## 3. Closing the box

Activating the close-box control exits the current play session and returns to **the same game's cover**.

The preferred transition is the reverse of play entry:

1. active game freezes or cleanly exits its session;
2. the cover/box returns from the side it left during launch;
3. the box visually closes over the game;
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

Core owns the replay/quit decision after a game reports completion.

### Visual rule now locked

**Do not reuse any piece of the game's cover art in the end-of-run UI.**

The preferred continuity is:

1. freeze the actual game at its final frame;
2. keep that gameplay visible behind the result state;
3. apply only enough graphite dimming to make Core text/actions readable;
4. place a compact result plate over the frozen gameplay;
5. never turn the end screen into another poster or cover composition.

The result plate should prioritize:

- final score;
- personal best;
- a restrained `NEW BEST` indication when applicable;
- leaderboard access when enabled;
- replay with the correct coin cost;
- quit / close back to the same cover.

Replay treatment should reuse the already validated coin/cartouche vocabulary rather than a generic giant mobile-app button:

- Fugg: `REPLAY · x2` with two pixel coins;
- Bêta: `REPLAY · x1` with one pixel coin;
- Caca: `REPLAY · FREE`;
- equivalent no-cost treatment for Lifetime / Free Play where the economy contract says so.

The player's remaining coin balance may be shown here because another spending decision is being made.

### Reward moment

The end-of-run surface is also the natural place for very small reward notifications such as:

- a newly unlocked cover;
- a newly unlocked achievement;
- another meta-progression reward.

Do not let these turn the result state into a reward dashboard. Prefer one concise reward strip/notification and let the player inspect details later.

---

## 7. Leaderboard panel

Leaderboard is a **full Core panel**, not a half-sheet and not a storefront page.

Current direction:

- opened from the personal high-score row in Info;
- return should conceptually take the player back to Info rather than dumping them somewhere unrelated;
- show only leaderboard periods actually configured by the game (`DAY`, `WEEK`, `GLOBAL` as applicable);
- do not invent `Friends`, genre filters, platform filters or other tabs unless those systems genuinely exist;
- show a clean top list with rank, player identity and score;
- when the current player is outside the visible top list, keep a compact personal row pinned near the bottom when backend rank data is available;
- do not fabricate a rank when the backend cannot supply it;
- creator / `999` identity treatments may appear when useful, but ranking remains the visual priority;
- scrolling/loading additional ranks should be simple and progressive rather than a separate dashboard.

The current runtime already exposes leaderboard data; visual refinement belongs to shared Core.

---

## 8. In-game social and platform actions

Do not keep comments, favorites, profile or community controls permanently over gameplay merely because they existed in an older Core layout.

Game details/community are primarily reached from the cover-side navigation defined in `docs/DISCOVERY_NAVIGATION.md`.

Temporary contextual actions may exist later, but the default rule is:

> **When the game is active, let the game be the game.**

---

## 9. Responsive consequence

Because Core chrome no longer reserves large top/bottom strips, gameplay layouts should be migrated to use the additional viewport space.

Games should still respect:

- device safe-area insets / notches;
- the compact close-box control's local exclusion zone;
- their own HUD/control hierarchy;
- orientation rules;
- accessible touch sizes.

Do not preserve old empty padding merely because previous versions reserved space for MiniFugg bars.

---

## 10. Temporary catalog-cover pass

During Core navigation implementation, every current game may temporarily receive a single development cover so the real vertical catalog flow can be evaluated before final Fugg cover sets and Bêta/Caca templates are finished.

These development covers:

- are navigation placeholders, not visual validation of the game art;
- do not change a game's curation status;
- must not be interpreted as collectible Fugg cover variants for Bêta/Caca;
- should be replaced by final Fugg cover sets or the approved generic Bêta/Caca treatment later.

Current temporary asset convention:

`/assets/imported/<game-id>/welcome/cover-placeholder-v1.png`

---

## 11. Current product decisions locked

- active gameplay is almost fullscreen;
- no permanent top platform bar by default;
- no permanent bottom platform bar by default;
- no permanent discovery swipe gutter while playing;
- no persistent coin counter during active gameplay by default;
- Core keeps one small close-box / return-to-cover edge control;
- final close-box visual must not be a pause icon or plain `X`;
- closing returns to the **same** game cover;
- cover discovery gestures are suspended while gameplay is active;
- game input can use the full gesture vocabulary while active;
- end-of-run uses the **frozen gameplay**, never cover artwork;
- end-of-run shows Core-owned replay + quit actions;
- replay cost follows game status pricing unless the economy contract changes later;
- leaderboard is a full panel showing only real configured periods/features.
