# MiniFugg — Orientation Layout

The previous responsive orientation rules are retired.

## Current production scope

As decided on 8 September 2026, MiniFugg currently produces new games, gameplay art and covers in portrait only. The canonical width is `390`, the art envelope is `390 × 844`, and the always-visible CENTRE is `390 × 662`. Do not create or request a landscape variant, second composition or landscape DA unless the user explicitly reopens that scope. Existing landscape games remain technically supported for maintenance and migration of their current behavior.

Canonical rule: portrait uses the named zones in `docs/MINIFUGG_ZONES.md`. Mobile scales uniformly from width; PC and big screens scale uniformly from height. Only HAUT and BAS may be revealed or cropped. The `both` value remains available only for maintenance of existing games with two deliberate compositions.

For all current implementation rules, use:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/INPUT_GESTURES.md`

Mobile is the complete reference experience. Extra desktop/tablet width belongs to Core and does not receive game-owned lateral decoration. Input controls may differ between touch, keyboard/mouse and gamepad without changing gameplay geometry.
