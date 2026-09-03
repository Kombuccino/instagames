# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md`, `docs/STYLE_SYSTEM.md`, `docs/INPUT_GESTURES.md`, `docs/ORIENTATION_LAYOUT.md` and `docs/GAME_LAYOUT_SYSTEM.md` completely. They are the normative game-development, visual-direction, input, orientation and layout contracts for this repository.

Before creating, importing or integrating image assets, also read `docs/ASSET_PIPELINE.md`. It is the normative Drive -> GitHub image pipeline. Use that pipeline instead of manual binary GitHub uploads, base64 chunking, public Drive links or FTP.

Before creating or modifying MiniFugg music, MIDI compositions or reactive game audio, also read `docs/MUSIC_LAB.md`. Every AI-created music proposal must be registered in the Music Lab catalog and preserved through the candidate/selected/archived lifecycle instead of being deleted.

Before creating or modifying Fugg welcome covers / splash art, also read `docs/WELCOME_ILLUSTRATIONS.md`. It defines the collectible-cover system, Fugg/Bêta/Caca behavior, parallax asset bundles, unlocks and the `SWIPE TO PLAY ↑` interaction contract. Before tuning layer position, scale, parallax, motion, FX or unlock scores, also read `docs/PARALLAX_LAB.md`.

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
11. Use the shared MiniFugg layout grid from `src/core/gameLayout.css` for normal game HUD / stage / controls. Prefer `.mf-game-layout`, `.mf-game-hud`, `.mf-game-stage`, `.mf-game-controls` and shared `--mf-text-*`, `--mf-touch-*`, spacing and padding tokens over device-specific raw `vw`/`vh` positioning.
12. Keep the same semantic information hierarchy across supported screen sizes. Reflow when necessary, but do not create unrelated mobile and desktop compositions unless the mechanic genuinely requires it.
13. Respect Core safe zones on every supported layout. Essential gameplay UI and touch targets must stay outside `--minifugg-core-top-reserved`, `--minifugg-core-bottom-reserved`, `--minifugg-core-left-reserved` and `--minifugg-core-right-reserved`. Decoration may extend behind them.
14. Preserve the feed escape gesture. Never apply `touch-action: none` to the fullscreen/root game container. Keep root/default vertical interaction compatible with `pan-y`, and use `touch-action: none` only on the smallest local drag/hold surface that truly needs it.
15. Never cover or repurpose the bottom Core swipe gutter (`--minifugg-swipe-gutter`). A player must always be able to swipe away from the game.
16. Keyboard gameplay controls belong to the active game. Core/feed navigation must not intercept Arrow keys, Space, Enter, WASD/ZQSD or other common gameplay keys. Desktop feed navigation should use mouse wheel/trackpad or pointer/touch-style gestures.
17. Use pointer capture only for real local drag/hold interactions and always clean it up on pointer up/cancel and lifecycle cleanup where relevant.
18. Do not fall back to the generic AI aesthetic. Read the style kit catalog in `docs/style-kits/` and `src/style-kits/catalog.ts`. If visual direction is unclear, use the visual preflight from `docs/STYLE_SYSTEM.md`.
19. Once a visual direction is chosen, create/read `src/games/<game-id>/ART_DIRECTION.md` and preserve it across later prompts.
20. If existing game code conflicts with these contracts, treat the contracts as the target architecture and preserve gameplay while migrating deliberately.
21. For production image assets, use the `Fugg` Drive inbox documented in `docs/ASSET_PIPELINE.md`, wait for/verify the automatic sync into `public/assets/imported/`, and reference only `/assets/imported/...` from the app. Never hotlink Drive.
22. A Fugg welcome cover that claims parallax must use real generated raster layers (background / midground / foreground / overlay as appropriate), imported through the asset pipeline. Do not substitute CSS-drawn props or generic JS particles for the actual artwork. While a welcome cover is visible, its first forward swipe, wheel-down or `ArrowDown` gesture reveals the current game; only after the cover is gone does normal gameplay/feed behavior resume. The protected bottom swipe gutter remains untouched.
23. Use the desktop Parallax Lab (`/?game=<game-id>&usr=moigod`) to tune Fugg cover layers when practical. The Lab is preview-only: it may save drafts locally and copy a `MINIFUGG_PARALLAX_CONFIG` text block, but it must not write directly to GitHub or production. Apply validated copied configs through the normal repository workflow.
24. Every AI-created MiniFugg music proposal gets a permanent `MF-MUS-####` id, appears in `/?usr=moigod&lab=music`, keeps its symbolic MIDI source and stable MIDI export identity, and is never deleted. User decisions change catalog status to `selected` or `archived` according to `docs/MUSIC_LAB.md`.
