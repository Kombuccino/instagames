# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md` completely. It is the normative game-development contract for this repository.

## Mandatory rules

1. A newly started real game has a strict budget of 10 user prompts.
2. For every response during that game's creation, visibly show: `🎮 <Game> — Prompt N/10 — X prompts remaining`.
3. Platform/Core work does not consume a game's 10 prompts.
4. Keep game code inside `src/games/<game-id>/` plus its registry entry unless the user explicitly asks for Core changes.
5. Never reimplement generic platform features (leaderboard, nickname, rules sheet, generic final score/replay, share/comments/remix) inside a new game.
6. Use `GameComponentProps` and the shared session API from `src/core/types.ts`.
7. New games should finish runs with `session.finish(...)` and reset when `restartToken` changes.
8. Do not add dependencies, backend endpoints, secrets or external scripts casually.
9. Optimize for mobile portrait, immediate play, simple controls and fast understanding.
10. If existing game code conflicts with `GAME_DEV_SPEC.md`, treat the spec as the target architecture and preserve gameplay while migrating deliberately.
