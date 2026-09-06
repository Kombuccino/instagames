# MiniFugg — Gameplay Shell

This document defines MiniFugg Core chrome and exit/result behavior while a game is active.

Read with `docs/DISCOVERY_NAVIGATION.md`, `docs/INPUT_GESTURES.md`, `docs/GAME_LAYOUT_SYSTEM.md`, `docs/PLATFORM_ECONOMY.md` and `docs/PLATFORM_UI_SYSTEM.md`.

This is a Core contract. Games do not rebuild it.

## 1. Gameplay is visually dominant

During active gameplay, do not keep large permanent platform bars, social rails, coin counters or discovery chrome over the game.

Core should leave the canonical game stage visually dominant.

## 2. Persistent close-box control

Core keeps one small persistent escape/return control near the upper-left edge of the central host.

It should:

- evoke a cover/box sliding closed rather than a pause icon;
- remain touch accessible and visually quiet;
- stay outside the game input capture layer;
- avoid covering essential game content;
- return to the same game's cover.

The control belongs to Core. Individual games do not fork it.

## 3. Closing the box

Preferred spatial continuity:

1. game freezes/ends cleanly;
2. cover/box returns;
3. player lands on the same cover;
4. discovery navigation becomes active again.

Do not jump to another game merely because gameplay closed.

## 4. Gesture ownership

Cover/discovery: Core owns discovery navigation.

Active gameplay: the game owns interaction inside its canonical stage; Core discovery gestures are suspended. The explicit close-box remains available.

See `docs/INPUT_GESTURES.md` for semantic action/device mapping.

## 5. Canonical stage inside the shell

The shell provides an available central host. The game itself keeps its fixed logical viewport and is **uniformly scaled** to fit.

Core must not ask games to reflow their internal geometry around desktop/tablet dimensions. Extra wide-screen area may be used for optional Core sidecars outside the canonical game composition.

The close-box exclusion is a shell concern. Do not reintroduce old large reserved top/bottom gameplay padding.

## 6. Coin counter during play

Default:

- cover/discovery: balance visible;
- active gameplay: balance hidden;
- replay/end-of-run: relevant cost/balance may reappear.

The player sees economic information when making a spending decision, not as permanent gameplay clutter.

## 7. End-of-run shell

Core owns replay/quit/leaderboard after `session.finish(...)`.

Visual rule:

- freeze the actual final gameplay frame;
- dim only enough for readability;
- overlay a compact Core result plate;
- never reuse the game cover artwork as the result background;
- do not put the MiniFugg logo in the result plate.

Useful content:

- end-of-run title;
- final score;
- personal best;
- valid rank summary (`TOP N`, `> TOP 100`) when available;
- restrained `NEW BEST` state;
- leaderboard action;
- replay with correct coin cost;
- `RAGE QUIT` back to the same cover;
- at most a concise newly unlocked cover/achievement reward note.

Never fabricate rank data.

Replay vocabulary follows Core economy, for example Fugg `REPLAY · x2`, Bêta `REPLAY · x1`, Caca `REPLAY · FREE`.

Offline purchased-game runs do not become official ladder runs.

## 8. Leaderboard panel

Leaderboard is a full Core panel using the shared platform UI system.

Product tabs: `DAY`, `WEEK`, `FRIENDS`.

The ranking list may show/scroll the first 100 players. Use spacing/alignment rather than separator-line clutter. When the current player's real row is off-screen, a compact pinned personal row may appear; remove the duplicate when the real row is visible again.

Back returns to the actual originating Core surface (Info, Game Over, etc.).

## 9. No permanent social chrome during gameplay

Comments, favorites, profile/community actions normally live around cover/details surfaces, not permanently over gameplay.

On wide desktop/tablet layouts, Core may optionally use outside-stage side areas for non-critical information. The central mobile gameplay remains complete without them.

## 10. Current cover migration state

All existing covers are currently marked **A METTRE A JOUR**. Temporary placeholder covers and the existing TetraMindFck layered system are migration references, not final confirmation of the future Phaser cover runtime.

Final static covers may remain normal raster Core assets. Advanced animated covers target Phaser 4.

## 11. Locked product decisions

- active gameplay is almost fullscreen inside the canonical central host;
- no permanent large Core top/bottom bars while playing;
- no permanent discovery swipe gutter while playing;
- no persistent coin counter during active gameplay by default;
- one small Core close-box returns to the same cover;
- discovery gestures are suspended during gameplay;
- game input may use the required gesture vocabulary while active;
- end-of-run uses frozen gameplay, never cover art;
- `RAGE QUIT` is the playful quit action;
- leaderboard is Core-owned and shows only valid server ranking data;
- gameplay geometry is fixed logical geometry and never responsively reflowed by the shell.
