# MiniFugg Game Development Contract v1.3

This file is the source of truth for every AI or developer creating a MiniFugg game. Read it completely before writing or modifying game code. Also read `docs/STYLE_SYSTEM.md`, `docs/INPUT_GESTURES.md` and `docs/ORIENTATION_LAYOUT.md`.

## 1. Product idea

MiniFugg is a vertical feed of tiny, instantly playable games. The user swipes up/down to move between games. Games must feel immediate, mobile-first and understandable in seconds.

A real game is designed and finished in a maximum of **10 user prompts**. Platform/Core work does **not** consume a game's 10 prompts.

## 2. The 10-prompt rule

When the user explicitly starts a new game, count user prompts starting at 1. Every answer while building that game must visibly include:

`🎮 <Game name> — Prompt N/10 — X prompts remaining`

Prompt 10 is the last development prompt. Do not quietly extend the budget. Bug fixes, polish and deployment requests during that game's active creation sequence count.

Do not count work about MiniFugg Core, shared UI, API, deployment, accounts, social features, leaderboards, style-kit/orientation infrastructure or this specification.

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

Reports the live score to MiniFugg. The platform owns the generic score chip. Do not duplicate a generic floating score UI unless gameplay itself requires a game-specific display.

### session.finish({ score, boardId?, metadata? })

Call once when a run is over. This hands the generic end flow to Core: final score, nickname, score submission, ladders and Replay.

Do not build generic nickname / save score / leaderboard / replay UI inside a new game.

Usually omit `boardId`: Core will publish the score to the leaderboard periods configured for the game. Use an explicit boardId only for a special level, season or challenge that intentionally overrides normal period boards.

## 5. Shared platform chrome and safe zones

The general MiniFugg interface is outside the game and owned by Core.

Current shared chrome includes:

- readable game title;
- clickable `@creator`;
- short game description;
- play count;
- action dock containing rules, love, comments and bookmark;
- generic score module;
- leaderboard sheet;
- common finish/replay flow;
- nickname persistence.

A game must not recreate these features or place essential content underneath them.

Core exposes global layout variables:

```css
--minifugg-core-top-reserved
--minifugg-core-bottom-reserved
--minifugg-core-left-reserved
--minifugg-core-right-reserved
--minifugg-swipe-gutter
```

In portrait, Core primarily reserves top + bottom. On a landscape phone, the action dock moves to the right and `--minifugg-core-right-reserved` becomes non-zero.

Background art, particles and non-interactive decoration may extend behind Core chrome. Essential game-owned content must stay outside it: buttons, important text, touch targets, drag endpoints, inventory, timers and critical HUD.

Example:

```css
.game-safe-layer {
  position: absolute;
  top: var(--minifugg-core-top-reserved);
  right: var(--minifugg-core-right-reserved);
  bottom: var(--minifugg-core-bottom-reserved);
  left: var(--minifugg-core-left-reserved);
}
```

A canvas may fill the viewport, but meaningful interactive coordinates should account for the reserved areas.

## 6. Registry declaration

Shared features and orientation are declared in `src/core/gameRegistry.tsx`.

```ts
{
  id: 'my-game',
  title: 'My Game',
  description: 'One-line gameplay hook',
  author: 'creatorHandle',
  orientation: 'portrait', // 'portrait' | 'landscape' | 'both'
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

Love, comments and bookmark are platform features. Never implement their persistence inside a game.

## 7. Orientation

Every real game should declare a preferred orientation:

- `portrait`: designed primarily for an upright phone;
- `landscape`: designed primarily for a phone turned sideways;
- `both`: two deliberately designed responsive layouts.

Core remains functional in both physical orientations. The preference describes how the gameplay should be designed; do not fake landscape by rotating the DOM.

If the mechanic clearly implies an orientation, infer it. If genuinely unclear, include `portrait / landscape / both / decide for me` as one compact question in the same preflight as visual direction. Do not spend a whole game prompt only on orientation.

Landscape games must use the right-side safe-zone variable and should normally implement phone-landscape rules with a media query such as:

```css
@media (orientation: landscape) and (max-height: 650px) {
  /* deliberate phone-landscape layout */
}
```

See `docs/ORIENTATION_LAYOUT.md`. `Shoot the Shooter` is the first landscape reference implementation.

## 8. Visual direction and style kits

MiniFugg deliberately does **not** have one visual style for all games. Core is the consistent shell; each game should have its own art direction.

Before visual polish, read:

- `docs/STYLE_SYSTEM.md`
- `docs/style-kits/README.md`
- relevant kit file(s)
- `src/style-kits/catalog.ts`

If the user did not specify a clear style, use the visual preflight defined in `docs/STYLE_SYSTEM.md`. Do not default to dark backgrounds, purple/cyan gradients, glowing blobs, glass panels and tiny pale labels.

Prompt 1 should still advance gameplay. When visual answers are missing, use deliberately neutral temporary art and ask the visual QCM in the same response. If the user explicitly wants to choose art direction before coding, wait for the answers.

Once selected, create `src/games/<game-id>/ART_DIRECTION.md` containing:

- chosen style kit or `custom`;
- palette and any deviations;
- typography direction;
- material/texture language;
- motion language;
- reusable kit assets being used;
- custom characters/props;
- explicit references and things to avoid.

Future prompts and future agents must preserve this file unless the user asks to change direction.

Existing kits:

- Pixel Dungeon
- Paper Cut
- Ink Pulp
- Toybox
- Sports Broadcast
- Editorial Grid

Custom styles and deliberate combinations are allowed. Prefer at most two base kits in one game unless there is a strong art-direction reason.

## 9. Readability

Avoid the tiny-text syndrome. On a phone:

- important readable game text should generally be at least 14px equivalent;
- primary labels and scores should be substantially larger;
- prefer fewer strong labels over many tiny ones;
- touch targets should be comfortably tappable;
- game HUD should not visually compete with Core identity chrome.

## 10. Score and leaderboard model

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

A game can expose multiple periods simultaneously. In production PostgreSQL keeps the raw score timestamp as the source of truth; day/week are query windows, not duplicate score rows.

Sort direction is declared per game (`desc` for higher-is-better, `asc` for lower-is-better).

## 11. Platform data/API boundary

Games never call a database directly. Games never own player identity, nickname, plays, loves, bookmarks or comments.

The platform transport lives in `src/core/platformApi.ts`.

When `VITE_MINIFUGG_API_URL` is absent, Core uses browser-local fallbacks for development. When present, Core uses the remote MiniFugg API.

Finished-run score API:

- `POST /v1/scores` — insert the finished run once
- `GET /v1/leaderboards/:gameId/:boardId?limit=10&sort=desc`

Social API consumed by Core:

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

## 12. UX rules for games

Default target: phone in the orientation declared by the game.

A MiniFugg game should:

- start almost immediately;
- require no account before play;
- be understandable quickly, with details available through the common rules panel;
- use touch as primary input;
- remain practical with mouse on desktop when possible;
- avoid conflicting browser scroll/zoom gestures during gameplay;
- preserve the Core feed escape/swipe gutter;
- fit inside the game surface;
- survive pause/resume when swiping away and back;
- never assume a fixed phone resolution;
- respect Core safe zones and device safe areas in every supported orientation.

Never put `touch-action: none` on the fullscreen/root game surface. See `docs/INPUT_GESTURES.md`.

Prefer one strong mechanic over menus, progression trees or settings.

## 13. Performance rules

Only the active game and neighbours are mounted by the feed. A game must still clean up its own resources:

- intervals/timeouts
- requestAnimationFrame loops
- event listeners
- audio playback/AudioContext
- WebGL resources

Do not make continuous network requests from gameplay. Avoid large assets unless essential.

## 14. Ownership boundary

### The game owns

- gameplay
- game-specific visuals and art direction
- game-specific layout for its declared orientation(s)
- game-specific HUD strictly needed for the mechanic
- run state
- deterministic generation
- scoring logic
- win/lose/end condition

### MiniFugg Core owns

- feed/swiping
- responsive portrait/landscape shell
- title/creator/description/plays chrome
- action dock placement
- generic score display
- rules panel
- daily/weekly/global ladders
- nickname and score transport
- love/bookmark/comments
- generic final score/replay flow
- accounts/profile later
- share/remix/follow/tips later

When in doubt, do not duplicate a generic platform feature inside the game.

## 15. Security constraints

First-party games are compiled with the app today, but code should remain compatible with a future sandboxed public-creation model.

Do not put secrets/API keys in game code. Do not access cookies/auth tokens/private platform state. Do not require arbitrary external scripts. Do not create custom backend endpoints for one game unless explicitly approved as a platform capability.

## 16. Definition of done

Before declaring a game finished, check:

- gameplay works on touch;
- gameplay is understandable quickly;
- preferred orientation is declared in the registry;
- gameplay is deliberately laid out for that orientation;
- `both` games have genuinely tested portrait and landscape layouts;
- no important content is hidden by Core top/bottom/left/right reserved zones;
- the bottom swipe gutter remains usable;
- no obvious desktop/mobile overflow;
- art direction is intentional and recorded in `ART_DIRECTION.md` once selected;
- important text is readable on phone;
- score updates through `session.setScore`;
- finished runs call `session.finish` when using the shared end flow;
- `restartToken` resets the run;
- timers/loops respect `active` and clean up;
- rules and platform feature flags are in the registry;
- generic platform UI has not been duplicated;
- TypeScript should build without errors;
- final code is on `main` when deployment was requested.

## 17. Migration note

Older games may predate this contract and still contain legacy UI, portrait-only assumptions or generic AI visual patterns. Do not copy those sections into new games. Preserve gameplay while migrating them deliberately toward the Core-owned, orientation-aware and style-directed model.
