# MiniFugg — Orientation Layout

The previous responsive orientation rules are retired.

## Current production scope

As decided on 17 September 2026, MiniFugg currently produces new games, gameplay art and covers in portrait only. The canonical authored width is `390`, the new MASTER is `390 × 850`, and the guaranteed gameplay window is `390 × 710`. In the centered case this leaves exactly `70` logical units above and below the guaranteed window.

Canonical rule: mobile scales uniformly from width; PC and big screens scale the `390 × 710` guaranteed window to the useful height, capped by available width. Only HAUT and BAS inside MASTER may be cropped. EXTRA HAUT/BAS are outside MASTER and appear only on proportionally taller mobile viewports. On PC, remaining width belongs to Core.

Existing approved `390 × 844` portrait games and assets remain technically supported without stretching or regeneration. They keep their old logical coordinates until a game-specific migration. Existing landscape games likewise remain maintenance-only. Do not create or request a new landscape composition unless the user explicitly reopens that scope.

Physical device viewports such as `360 × 650`, `360 × 656`, `390 × 712` or `360 × 611` are diagnostic presets only; they no longer define the logical MiniFugg contract.

For all implementation rules, use:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/MINIFUGG_ZONES.md`
- `docs/INPUT_GESTURES.md`

Mobile remains the complete reference experience. Input controls may differ between touch, keyboard/mouse and gamepad without changing gameplay geometry.
