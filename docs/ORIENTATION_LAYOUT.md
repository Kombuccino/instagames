# MiniFugg — Orientation Layout

The previous responsive orientation rules are retired.

## Current production scope

As decided on 17 September 2026, MiniFugg currently produces new games, gameplay art and covers in portrait only. The canonical authored width is `390`, the MASTER is `390 × 850`, and the guaranteed gameplay window is `390 × 710`. Do not create or request a landscape variant, second composition or landscape DA unless the user explicitly reopens that scope. Existing landscape games remain technically supported for maintenance and migration of their current behavior.

Canonical rule: portrait uses the named zones in `docs/MINIFUGG_ZONES.md`. Mobile scales uniformly from width; PC and big screens scale the `390 × 710` guaranteed window to the useful height. Only HAUT and BAS inside MASTER may be cropped. EXTRA HAUT/BAS are outside MASTER and appear only on proportionally taller mobile viewports. On PC, the guaranteed window fills the screen and HAUT/BAS are cropped. The `both` value remains available only for maintenance of existing games with two deliberate compositions.

Existing approved portrait games/assets authored at `390 × 844` remain valid and keep their coordinates until a dedicated migration. Do not stretch or regenerate them just to reach 850.

For all current implementation rules, use:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/INPUT_GESTURES.md`

Mobile is the complete reference experience. Extra desktop/tablet width belongs to Core and does not receive game-owned lateral decoration. Input controls may differ between touch, keyboard/mouse and gamepad without changing gameplay geometry.
