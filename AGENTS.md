# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md`, `docs/STYLE_SYSTEM.md`, `docs/INPUT_GESTURES.md` and `docs/ORIENTATION_LAYOUT.md` completely. They are the normative game-development, visual-direction, input and orientation contracts for this repository.

## Mandatory rules

1. A newly started real game has a strict budget of 10 user prompts.
2. For every response during that game's creation, visibly show: `🎮 <Game> — Prompt N/10 — X prompts remaining`.
3. Platform/Core work does not consume a game's 10 prompts.
4. Keep game code inside `src/games/<game-id>/` plus its registry entry unless the user explicitly asks for Core changes.
5. Never reimplement generic platform features (leaderboard, nickname, rules sheet, final score/replay, love, comments, bookmarks, share/remix) inside a new game.
6. Use `GameComponentProps` and the shared session API from `src/core/types.ts`.
7. New games should finish runs with `session.finish(...)` and reset when `restartToken` changes.
8. Do not add dependencies, backend endpoints, secrets or external scripts casually.
9. Optimize for phone play, immediate interaction, simple controls and fast understanding. Explicitly declare each game's preferred `orientation` as `portrait`, `landscape` or `both` in the registry.
10. If orientation is genuinely unclear, include a compact portrait / landscape / both choice in the same preflight as the visual QCM. Do not spend a whole game prompt only asking orientation.
11. Respect Core safe zones on every supported layout. Essential gameplay UI and touch targets must stay outside `--minifugg-core-top-reserved`, `--minifugg-core-bottom-reserved`, `--minifugg-core-left-reserved` and `--minifugg-core-right-reserved`. Decoration may extend behind them.
12. Preserve the feed escape gesture. Never apply `touch-action: none` to the fullscreen/root game container. Keep root/default vertical interaction compatible with `pan-y`, and use `touch-action: none` only on the smallest local drag/hold surface that truly needs it.
13. Never cover or repurpose the bottom Core swipe gutter (`--minifugg-swipe-gutter`). A player must always be able to swipe away from the game.
14. Keyboard gameplay controls belong to the active game. Core/feed navigation must not intercept Arrow keys, Space, Enter, WASD/ZQSD or other common gameplay keys. Desktop feed navigation should use mouse wheel/trackpad or pointer/touch-style gestures.
15. Use pointer capture only for real local drag/hold interactions and always clean it up on pointer up/cancel and lifecycle cleanup where relevant.
16. Do not fall back to the generic AI aesthetic. Read the style kit catalog in `docs/style-kits/` and `src/style-kits/catalog.ts`. If visual direction is unclear, use the visual preflight from `docs/STYLE_SYSTEM.md`.
17. Once a visual direction is chosen, create/read `src/games/<game-id>/ART_DIRECTION.md` and preserve it across later prompts.
18. If existing game code conflicts with these contracts, treat the contracts as the target architecture and preserve gameplay while migrating deliberately.
