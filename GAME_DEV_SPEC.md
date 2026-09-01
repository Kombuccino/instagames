# MiniFugg Game Development Contract v1.1

This file is the source of truth for every AI or developer creating a MiniFugg game. Read it completely before writing or modifying game code.

## 1. Product idea

MiniFugg is a vertical feed of tiny, instantly playable games. The user swipes up/down to move between games. Games must feel immediate, mobile-first and understandable in seconds.

A real game is designed and finished in a maximum of **10 user prompts**. Platform/Core work does **not** consume a game's 10 prompts.

## 2. The 10-prompt rule

When the user explicitly starts a new game, count user prompts starting at 1. Every answer while building that game must visibly include:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

Prompt 10 is the last development prompt. Do not quietly extend the budget. Bug fixes, polish and deployment requests during that game's active creation sequence count.

Do not count work about MiniFugg Core, shared UI, API, deployment, accounts, social features, leaderboards or this specification.

## 3. Technical boundary

Current stack:

- React 18
- TypeScript
- Vite
- CSS
- browser APIs such as Canvas/WebGL/WebAudio when useful

A normal first-party game lives in `src/games/<game-id>/` and should normally modify only its directory plus its entry in `src/core/gameRegistry.tsx`.

Do **not** modify Core/runtime/platform files while building a game unless the user explicitly asks for a platform change. Avoid new npm dependencies unless genuinely necessary.

## 4. Runtime contract

Every game receives `GameComponentProps` from `src/core/types.ts`:

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

### active

`true` only while the game is active. Pause timers, animation loops and audio when false. Never keep expensive work running off-screen.

### seed

Use the feed seed when deterministic variation is useful. A daily challenge may derive deterministic gameplay from the UTC day.

### restartToken

The Core increments this when the common Replay action is used. A game using `session.finish()` must reset all run state when this value changes.

### session.setScore(score)

Reports the live score to MiniFugg. The platform owns the generic score chip. Do not duplicate a generic floating score UI unless the gameplay itself requires a game-specific display.

### session.finish({ score, boardId?, metadata? })

Call once when a run is over. This hands the generic end flow to Core: final score, nickname, score submission, ladders and Replay.

Do not build generic nickname / save score / leaderboard / replay UI inside a new game.

Usually omit `boardId`: Core will publish the score to the leaderboard periods configured for the game. Use an explicit boardId only for a special level, season or challenge that intentionally overrides normal period boards.

## 5. Shared platform chrome

The general MiniFugg interface is outside the game and is owned by Core.

Current shared chrome includes:

- game title
- clickable `@creator`
- short game description
- play count
- rules/help action
- love action + count
- comments action + count
- bookmark action
- generic score module
- leaderboard sheet
- common finish/replay flow
- nickname persistence

A game must not reserve its own UI for these features.

The creator panel is built from the registry/catalog today and will later be backed by creator/game database records.

## 6. Registry declaration

Shared features are declared in `src/core/gameRegistry.tsx`.

```ts
{
  id: 'my-game',
  title: 'My Game',
  description: 'One-line gameplay hook',
  author: 'creatorHandle',
  component: MyGame,
  instructions: {
    goal: 'Do the thing before time runs out.',
    rules: ['Rule one', 'Rule two'],
    controls: ['Tap', 'Swipe'],
  },
  features: {
    help: true,
    love: true,
    comments: true,
    bookmark: true,
    leaderboard: {
      enabled: true,
      periods: ['daily', 'weekly'],
      sort: 'desc',
      limit: 10,
    },
    share: false,
    remix: false,
  },
}
```

`love`, `comments` and `bookmark` are platform features. Never implement their persistence inside a game.

## 7. Score and leaderboard model

Games own scoring logic but **Core owns score storage and rankings**.

A finished run reports one score using `session.finish()`.

Leaderboard periods currently supported:

- `daily`
- `weekly`
- `global`

Core maps them to board ids such as:

- `day:2026-09-01`
- `week:2026-W36`
- `global`

A game can expose multiple periods simultaneously. In production PostgreSQL should keep the raw score timestamp as the source of truth; day/week are query windows rather than separate game code.

Sort direction is declared per game (`desc` for higher-is-better, `asc` for lower-is-better).

## 8. Platform data/API boundary

Games never call a database directly. Games never own player identity, nickname, plays, loves, bookmarks or comments.

The platform transport lives in `src/core/platformApi.ts`.

When `VITE_MINIFUGG_API_URL` is absent, Core uses browser-local fallbacks for development. When present, Core can use the remote MiniFugg API.

Score API:

- `GET /v1/leaderboards/:gameId/:boardId?limit=10&sort=desc`
- `POST /v1/leaderboards/:gameId/:boardId`

Social API planned/consumed by Core:

- `GET /v1/games/:gameId/stats`
- `POST /v1/games/:gameId/plays`
- `PUT /v1/games/:gameId/love`
- `DELETE /v1/games/:gameId/love`
- `PUT /v1/games/:gameId/bookmark`
- `DELETE /v1/games/:gameId/bookmark`
- `GET /v1/games/:gameId/comments`
- `POST /v1/games/:gameId/comments`

See `docs/PLATFORM_DATA_MODEL.md` for the recommended PostgreSQL schema.

Client-only score validation is not secure. Competitive ladders will eventually require run proofs or game-specific server validation.

## 9. UX rules for games

Default target: portrait phone.

A MiniFugg game should:

- start almost immediately;
- require no account before play;
- be understandable quickly, with details available through the common rules panel;
- use touch as primary input;
- remain practical with mouse on desktop when possible;
- avoid tiny targets/text;
- avoid conflicting browser scroll/zoom gestures during gameplay;
- fit inside the game surface;
- survive pause/resume when swiping away and back;
- never assume a fixed phone resolution;
- keep essential game-owned UI clear of platform chrome and safe areas.

Prefer one strong mechanic over menus, progression trees or settings.

## 10. Performance rules

Only the active game and neighbours are mounted by the feed. A game must still clean up its own resources:

- intervals/timeouts
- requestAnimationFrame loops
- event listeners
- audio playback/AudioContext
- WebGL resources

Do not make continuous network requests from gameplay. Avoid large assets unless essential.

## 11. Ownership boundary

### The game owns

- gameplay
- game-specific visuals
- game-specific HUD strictly needed for the mechanic
- run state
- deterministic generation
- scoring logic
- win/lose/end condition

### MiniFugg Core owns

- feed/swiping
- title/creator/description/plays chrome
- generic score display
- rules panel
- daily/weekly/global ladders
- nickname and score transport
- love/bookmark/comments
- generic final score/replay flow
- accounts/profile later
- share/remix/follow/tips later

When in doubt, do not duplicate a generic platform feature inside the game.

## 12. Security constraints

First-party games are compiled with the app today, but code should remain compatible with a future sandboxed public-creation model.

Do not put secrets/API keys in game code. Do not access cookies/auth tokens/private platform state. Do not require arbitrary external scripts. Do not create custom backend endpoints for one game unless explicitly approved as a platform capability.

## 13. Definition of done

Before declaring a game finished, check:

- gameplay works on touch;
- gameplay is understandable quickly;
- no obvious desktop/mobile overflow;
- score updates through `session.setScore`;
- finished runs call `session.finish` when using the shared end flow;
- `restartToken` resets the run;
- timers/loops respect `active` and clean up;
- rules and platform feature flags are in the registry;
- generic platform UI has not been duplicated;
- TypeScript should build without errors;
- final code is on `main` when deployment was requested.

## 14. Migration note

Older games may predate this contract and still contain legacy leaderboard/final-score UI. Do not copy those legacy sections into new games. Preserve gameplay while migrating them deliberately toward the Core-owned flow.
