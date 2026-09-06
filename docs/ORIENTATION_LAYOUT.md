# MiniFugg — Orientation Layout

The previous responsive orientation rules are retired.

Canonical rule: orientation is an authored fixed logical stage, uniformly scaled on every device. Portrait defaults to `390 × 844`; landscape defaults to `844 × 390`. The `both` value is allowed only when two deliberate canonical orientations are genuinely required; it is not a generic responsive mode.

For all current implementation rules, use:

- `docs/GAME_ENGINE_ARCHITECTURE.md`
- `docs/GAME_LAYOUT_SYSTEM.md`
- `docs/INPUT_GESTURES.md`

Mobile is the complete reference experience. Extra desktop/tablet space may host optional Core side content or decorative overscan, but must never rearrange the canonical game composition. Input controls may differ between touch, keyboard/mouse and gamepad without changing gameplay geometry.
