# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md` and `docs/STYLE_SYSTEM.md` completely. They are the normative game-development and visual-direction contracts for this repository.

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
11. Do not fall back to the generic AI aesthetic. Read the style kit catalog in `docs/style-kits/` and `src/style-kits/catalog.ts`. If visual direction is unclear, use the visual preflight from `docs/STYLE_SYSTEM.md`.
12. Once a visual direction is chosen, create/read `src/games/<game-id>/ART_DIRECTION.md` and preserve it across later prompts.
13. If existing game code conflicts with these contracts, treat the contracts as the target architecture and preserve gameplay while migrating deliberately.
