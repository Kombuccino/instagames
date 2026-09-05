# AI development instructions

Before creating or modifying any MiniFugg game, read `GAME_DEV_SPEC.md`, `docs/STYLE_SYSTEM.md`, `docs/INPUT_GESTURES.md`, `docs/ORIENTATION_LAYOUT.md`, `docs/GAME_LAYOUT_SYSTEM.md`, `docs/GAMEPLAY_SHELL.md` and `docs/PLATFORM_EXPORTS.md` completely. They are the normative game-development, visual-direction, input, orientation, layout, active-game-shell and distribution-portability contracts for this repository.

Before creating, importing or integrating image assets, also read `docs/ASSET_PIPELINE.md`. It is the normative Drive -> GitHub image pipeline. Use that pipeline instead of manual binary GitHub uploads, base64 chunking, public Drive links or FTP.

Before creating or modifying MiniFugg music, MIDI compositions, reactive game audio, sound design or SFX, also read `docs/MUSIC_LAB.md`. Every AI-created music proposal and authored SFX identity must be registered in the Audio Lab catalogs and preserved instead of being deleted.

Before creating or modifying the MiniFugg platform identity, global home/cold-open, shared Core chrome, mascot, logo, social sheets or the visual transition from the home into discovery, read `docs/PLATFORM_ART_DIRECTION.md` **and** `docs/PLATFORM_ENTRY_SCENES.md`. The main rotating entry-scene family is stylized warm low-poly / diorama 3D, not photorealistic lifestyle imagery. Use first-person arm/hand + phone grammar and transition seamlessly into the live MiniFugg viewport.

Before modifying the game-discovery feed, cover gestures, game-launch transition, status templates, or how coin state affects which games are surfaced, read `docs/DISCOVERY_NAVIGATION.md`. MiniFugg discovery is one full-screen cover at a time, not a generic grid/card storefront.

Before modifying the active in-game Core chrome, exit behavior, fullscreen allocation or end-of-run replay/quit shell, read `docs/GAMEPLAY_SHELL.md`. Active gameplay is almost fullscreen; Core normally keeps only a small close-box / return-to-cover control.

Before creating or modifying MiniFugg coins, game-launch/replay charging, Free Play/Lifetime UI, purchase/store flows, pricing presentation, coin rewards, out-of-coins states or any other monetization surface, read `docs/PLATFORM_ECONOMY.md`. The economy is Core-owned; games must not implement their own coin or storefront logic. Current session prices are Fugg=2 coins, Bêta=1 coin, Caca=free.

Before creating or modifying platform achievements, cross-game progression, trophy/reward UI, or rewards that unlock entry scenes or other Core content, read `docs/META_PROGRESSION.md`. Games should report achievement-relevant events/results to Core instead of reimplementing platform achievement state/UI locally.

Before creating or modifying Fugg welcome covers / cover art, also read `docs/WELCOME_ILLUSTRATIONS.md` **and** `docs/WELCOME_ART_STYLES.md`. The first defines the collectible Fugg system, Bêta/Caca templates, internationalization and parallax asset bundles; the second is the reusable cover-style catalog. Before tuning layer position, scale, parallax, motion, FX or unlock scores, also read `docs/PARALLAX_LAB.md`.

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
13. Active gameplay should use almost the entire available viewport. Do not reserve large permanent top/bottom Core bars or preserve obsolete empty padding from the old feed shell. Respect device safe areas and only the small local exclusion needed by the Core close-box control.
14. Once gameplay is active, cover/feed discovery gestures are suspended. The game may use vertical/horizontal gestures it genuinely needs; do not force root `pan-y` merely to preserve the old feed escape gesture.
15. Core must keep one small, always reachable close-box / return-to-cover control during active gameplay. It returns to the same game cover. Do not rely on an invisible bottom swipe gutter as the only way to escape a game.
16. Keyboard gameplay controls belong to the active game. Core navigation must not intercept Arrow keys, Space, Enter, WASD/ZQSD or other common gameplay keys once gameplay is active.
17. Use pointer capture only for real local drag/hold interactions and always clean it up on pointer up/cancel and lifecycle cleanup where relevant. Never trap the Core close-box control behind a full-screen pointer layer.
18. Do not fall back to the generic AI aesthetic. Read the style kit catalog in `docs/style-kits/` and `src/style-kits/catalog.ts`. If visual direction is unclear, use the visual preflight from `docs/STYLE_SYSTEM.md`.
19. Once a visual direction is chosen, create/read `src/games/<game-id>/ART_DIRECTION.md` and preserve it across later prompts.
20. If existing game code conflicts with these contracts, treat the contracts as the target architecture and preserve gameplay while migrating deliberately.
21. For production image assets, use the `Fugg` Drive inbox documented in `docs/ASSET_PIPELINE.md`, wait for/verify the automatic sync into `public/assets/imported/`, and reference only `/assets/imported/...` from the app. Never hotlink Drive.
22. Game discovery uses one full-screen cover at a time. While a cover is active: finger up = previous cover, finger down = next cover, finger left = play/open current game, finger right = details/community. Do not replace this with a generic grid/card storefront unless the product contract is explicitly revised.
23. For free players, keep the unified coin balance visible while browsing covers. Core prices are Fugg=2 coins, Bêta=1 coin, Caca=0/free. With coins, heavily weight Fugg (~90%) with occasional Bêta (~10%); at zero coins, target roughly 50% Caca while continuing to show Fugg/Bêta in the other half.
24. Do not expose a compulsory Fugg badge. Finished Fugg games communicate quality through authored collectible covers. Bêta and Caca use reusable templates with a per-game title/logo and live translated explanatory copy/CTA above the artwork.
25. A Fugg cover that claims parallax must use real generated raster layers (background / midground / foreground / overlay as appropriate), imported through the asset pipeline. Do not substitute CSS-drawn props or generic JS particles for actual cover art.
26. Use the desktop Parallax Lab (`/?game=<game-id>&usr=moigod`) to tune Fugg cover layers when practical. The Lab is preview-only: it may save drafts locally and copy a `MINIFUGG_PARALLAX_CONFIG` text block, but it must not write directly to GitHub or production. Apply validated copied configs through the normal repository workflow.
27. Default authored Fugg cover language is English unless a cover is intentionally localized. Status explanations, prices, comments/help prompts and other mutable UI copy must stay live/localizable rather than baked into raster art.
28. The play-entry transition should feel like accepting a coin and opening a game object/box. Paid plays may use a short coin-clang SFX, then the cover/lid/sleeve opens laterally to reveal the actual game behind it. Closing the game should reverse that metaphor and return to the same cover. Keep both transitions short and tactile.
29. During active gameplay, the free-player coin balance, social actions and discovery navigation should not remain permanently over the game by default. Reintroduce relevant balance/cost only when the player is making a launch/replay decision.
30. End-of-run replay/quit belongs to Core. Replay normally costs the current game's status price (Fugg 2 / Bêta 1 / Caca free), while quit/close returns to the same cover. Games report completion; they do not implement MiniFugg spending UI themselves.
31. Every AI-created MiniFugg music proposal gets a permanent `MF-MUS-####` id, appears in `/?usr=moigod&lab=music`, keeps its symbolic MIDI source and stable MIDI export identity, and is never deleted. User decisions change catalog status to `selected` or `archived` according to `docs/MUSIC_LAB.md`.
32. Every authored MiniFugg SFX identity gets a permanent `MF-SFX-####` id and appears in the Audio Lab. Prefer the shared semantic vocabulary (`move`, `rotate`, `softDrop`, `land`, `levelUp`, `success`, `fail`) plus a per-game accent before inventing game-specific sounds. Never delete old SFX identities; archive or supersede them according to `docs/MUSIC_LAB.md`.
33. A game must remain distribution-agnostic. Never import Steam-, Google Play-, Android-, iOS-, itch.io- or host-specific SDKs directly inside a game. Platform capabilities belong behind MiniFugg Core adapters/export shells so the same game source can ship as web, static ZIP, standalone, desktop/Steam or mobile-store builds without per-game rewrites.
34. Platform entry scenes are collectible Core content. Their surroundings may vary widely, but the MiniFugg logo/mascot/Core identity stays stable. Prefer a small default scene set plus achievement-unlocked scenes instead of one permanent splash or an ever-growing unstructured random catalog.
