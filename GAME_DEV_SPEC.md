# MiniFugg Game Development Contract v1

This file is the source of truth for every AI or developer creating a MiniFugg game.
Read it completely before writing or modifying game code.

## 1. Product idea

MiniFugg is a vertical feed of tiny, instantly playable games. The user swipes up/down to move between games. Games must feel immediate, mobile-first and understandable in seconds.

A real game is designed and finished in a maximum of **10 user prompts**. The constraint is part of the product.

Platform/Core work does **not** consume a game's 10 prompts.

## 2. The 10-prompt rule

When the user explicitly starts a new game, count user prompts starting at 1.
Every answer while building that game must visibly include:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

Prompt 10 is the last development prompt. Do not quietly extend the budget.
Bug fixes, polish and deployment requests for that game count if they happen during its 10-prompt creation session.

Do not count discussion about MiniFugg Core, platform UI, shared API, deployment infrastructure or this specification as game prompts.

## 3. Technical boundary

Current stack:

- React 18
- TypeScript
- Vite
- CSS
- Browser APIs (Canvas/WebGL/WebAudio are allowed when useful)

A normal first-party game lives in:

`src/games/<game-id>/`

A game should normally only modify its own directory plus its single registration entry in `src/core/gameRegistry.tsx`.

Do **not** modify Core/runtime/platform files while building a game unless the user explicitly asks for a platform change.

Do not add a new npm dependency for a game unless it is genuinely necessary. Prefer browser APIs and existing dependencies.

## 4. Runtime contract

Every game component receives `GameComponentProps` from `src/core/types.ts`:

```ts
export type GameComponentProps = {
  active: boolean
  seed: number
  restartToken: number
  session: {
    setScore(score: number): void
    finish(payload: {
      score: number
      boardId?: string
      metadata?: Record<string, string | number | boolean>
    }): void
  }
}
```

### `active`

`true` only while the game is the active feed item.
Pause animation loops, timers and audio when `active === false`.
Never keep expensive work running off-screen.

### `seed`

A run seed supplied by the feed. Use it when deterministic generation is useful.
For a daily challenge, derive deterministic content from the UTC day (or use a documented daily seed strategy) so every player receives the same board that day.

### `restartToken`

The Core increments this when the player presses the common Replay button.
A game using `session.finish()` must reset all run state when `restartToken` changes.

### `session.setScore(score)`

Reports the live score to MiniFugg. Call it when the displayed score changes.
The platform owns the generic score chip.

### `session.finish({ score, boardId?, metadata? })`

Call exactly once when a run is finished.
This hands the end-of-run flow to MiniFugg Core: final score, nickname, leaderboard submission and Replay UI.

Do not build a custom generic “score saved / nickname / leaderboard / replay” modal inside a new game.

`boardId` is optional. For a daily leaderboard the Core can derive today's UTC board automatically. Use an explicit boardId only when the game has a special season/level/challenge identifier.

## 5. Shared platform features

Features are declared in `src/core/gameRegistry.tsx`, not reimplemented inside each game.

Example:

```ts
{
  id: 'my-game',
  title: 'My Game',
  description: 'One-line hook',
  author: 'MiniFugg',
  component: MyGame,
  instructions: {
    goal: 'Do the thing before time runs out.',
    rules: ['Rule one', 'Rule two'],
    controls: ['Tap', 'Swipe'],
  },
  features: {
    help: true,
    leaderboard: {
      enabled: true,
      scope: 'daily', // or 'global'
      sort: 'desc',
      limit: 10,
    },
    share: false,
    comments: false,
    remix: false,
  },
}
```

Current common features:

- MiniFugg brand chrome
- live score
- rules/help sheet
- leaderboard sheet
- common end-of-run modal for games using `session.finish()`
- nickname persistence
- Replay lifecycle

Reserved platform features (do not implement inside games yet):

- share
- comments
- likes/favorites
- remix/fork
- creator follow
- tips/revenue share
- player profile/account

## 6. Leaderboard and API

Games never call a database directly.
Games never own player identity or nickname storage.
Games only call `session.finish()`.

The platform client lives in `src/core/platformApi.ts`.

When `VITE_MINIFUGG_API_URL` is absent, leaderboard data falls back to local browser storage for development.
When it is present, the Core expects:

### Read leaderboard

`GET /v1/leaderboards/:gameId/:boardId?limit=10&sort=desc`

Response can be either an array or:

```json
{ "entries": [] }
```

### Submit score

`POST /v1/leaderboards/:gameId/:boardId`

```json
{
  "nickname": "Player",
  "score": 123,
  "metadata": {}
}
```

The server returns the created leaderboard entry.

Important: a public client can fake scores. The first remote API may be a casual leaderboard, but competitive ladders will require server-side validation/run proofs or game-specific verification. Do not pretend client-only anti-cheat is secure.

## 7. UX rules for games

Default target: portrait phone screen.

A MiniFugg game should:

- be playable almost immediately;
- require no account before play;
- explain itself through interaction plus the common `?` help panel;
- use touch as the primary input;
- remain playable with mouse on desktop when practical;
- avoid tiny targets and text;
- avoid browser scrolling/zoom gestures during gameplay when they conflict with controls;
- fit inside the game surface without relying on page navigation;
- survive pause/resume when the player swipes away and back;
- never assume a fixed phone resolution;
- respect safe areas when placing essential game-owned UI near screen edges.

Prefer one strong mechanic over menus, progression trees or settings.

## 8. Performance rules

Only the active game and its neighbours may be mounted by the feed.
The game must still clean up its own resources.

Always clean up:

- intervals/timeouts
- requestAnimationFrame loops
- event listeners
- AudioContext/audio playback where applicable
- WebGL resources where applicable

Do not make continuous network requests from gameplay.
Avoid large assets unless essential.

## 9. Platform ownership vs game ownership

### The game owns

- gameplay
- game-specific visuals
- game-specific HUD necessary to understand the mechanic
- run state
- deterministic generation
- scoring logic
- win/lose/end condition

### MiniFugg Core owns

- feed/swiping
- brand chrome
- generic score display
- rules panel
- leaderboard display
- nickname
- score submission transport
- generic final score/replay flow
- account/profile
- comments/share/remix in future

When in doubt, do not duplicate a generic platform feature inside the game.

## 10. Security constraints

First-party games are compiled with the app today, but code should already be compatible with a future sandboxed public-creation model.

Do not put secrets/API keys in game code.
Do not access cookies, auth tokens or private platform state.
Do not require arbitrary external scripts.
Do not create custom backend endpoints for an individual game unless the user explicitly approves a platform-level capability.

## 11. Definition of done

Before declaring a game finished, check:

- gameplay works on touch;
- gameplay is understandable quickly;
- no obvious desktop/mobile overflow;
- score updates through `session.setScore`;
- finished runs call `session.finish` when using the shared end flow;
- restartToken resets the run;
- timers/loops respect `active` and clean up;
- rules and feature flags are registered in `gameRegistry.tsx`;
- no generic platform UI has been duplicated;
- TypeScript should build without errors;
- the final code is on `main` when the user asked for deployment.

## 12. Current migration note

LineFugg is the first real MiniFugg game and predates the full shared finish API. It currently still contains part of its legacy local finish/leaderboard UI. New games must follow this contract instead of copying that legacy code. LineFugg can be migrated separately without changing its gameplay.
