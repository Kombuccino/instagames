# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md`, `docs/STYLE_SYSTEM.md` and `docs/INPUT_GESTURES.md` completely. They are the normative game-development, visual-direction and input contracts for this repository.

## Mandatory rules

1. A newly started real game has a strict budget of 10 user prompts.
2. For every response during that game's creation, visibly show: `🎮 <Game> — Prompt N/10 — X prompts remaining`.
3. Platform/Core work does not consume a game's 10 prompts.
4. Keep game code inside `src/games/<game-id>/` plus its registry entry unless the user explicitly asks for Core changes.
5. Never reimplement generic platform features (leaderboard, nickname, rules sheet, final score/replay, love, comments, bookmarks, share/remix) inside a new game.
6. Use `GameComponentProps` and the shared session API from `src/core/types.ts`.
7. New games should finish runs with `session.finish(...)` and reset when `restartToken` changes.
8. Do not add dependencies, backend endpoints, secrets or external scripts casually.
9. Optimize for mobile portrait, immediate play, simple controls and fast understanding.
10. Respect Core safe zones. Essential gameplay UI and touch targets must stay outside `--minifugg-core-top-reserved` and `--minifugg-core-bottom-reserved`. Decoration may extend behind them.
11. Preserve the feed escape gesture. Never apply `touch-action: none` to the fullscreen/root game container. Keep root/default vertical interaction compatible with `pan-y`, and use `touch-action: none` only on the smallest local drag/hold surface that truly needs it.
12. Never cover or repurpose the bottom Core swipe gutter (`--minifugg-swipe-gutter`). A player must always be able to swipe away from the game.
13. Use pointer capture only for real local drag/hold interactions and always clean it up on pointer up/cancel and lifecycle cleanup where relevant.
14. Do not fall back to the generic AI aesthetic. Read the style kit catalog in `docs/style-kits/` and `src/style-kits/catalog.ts`. If visual direction is unclear, use the visual preflight from `docs/STYLE_SYSTEM.md`.
15. Once a visual direction is chosen, create/read `src/games/<game-id>/ART_DIRECTION.md` and preserve it across later prompts.
16. If existing game code conflicts with these contracts, treat the contracts as the target architecture and preserve gameplay while migrating deliberately.
