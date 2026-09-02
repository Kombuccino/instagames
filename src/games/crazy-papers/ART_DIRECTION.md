# CrazyPapers — Art Direction

## Base direction

- Style kit: `pixel-dungeon`, heavily adapted into a bureaucratic desk / document game.
- Explicit reference: the oppressive low-resolution bureaucracy mood of *Papers, Please*.
- Do not copy *Papers, Please* interface layouts, assets, characters, emblems or exact palette. The reference is mood, density, hard pixel edges and administrative drabness.

## Palette

- Wall / office grime: `#504b3d`, `#302d25`
- Desk wood: `#706145`, `#4c402d`
- Paper: `#e7d9af`, `#d0c397`
- Ink: `#1d1a14`, `#4b4333`
- Approve: muted bureaucratic green `#52684a`
- Reject / supervisor: dried red `#8b4438`, `#a13930`
- Archive: steel blue-grey `#4d5d65`

Keep colors dirty, matte and printed. No neon, glass, bloom or modern SaaS cards.

## Typography

- Monospace / typewriter-first using system-safe `Courier New`, Courier, monospace.
- Uppercase administrative labels.
- Important document titles and warnings must remain large enough to read on a phone.
- Avoid decorative tiny metadata unless it is purely atmospheric.

## Geometry and texture

- Hard rectangular edges, 2–4px borders, offset pixel-like shadows.
- Paper grain and office-wall texture may use cheap repeating CSS patterns.
- Documents should feel physical and slightly misaligned, but never so rotated that text becomes hard to read.
- Stamps are large physical controls, not rounded UI buttons.

## Motion

- Dry, stepped, mechanical motion.
- Correct stamping: tiny immediate press/hit feedback.
- Wrong stamping: abrupt red return stamp plus short supervisor shake.
- Avoid long easing, floaty bounces and decorative particles.

## Gameplay-specific visual language

- The active document is the dominant object in the stage.
- The backlog is visible as layered papers behind it and through a compact workload meter.
- Training documents explicitly expose the expected destination stamp.
- Later documents remove the answer and rely on learned document families.
- Cryptic documents use recurring fixed codes/titles so difficulty becomes memory/recognition rather than pure randomness.
- Returned documents carry an obvious red `MAUVAIS TAMPON` mark.
- The supervisor interruption should feel annoying and funny while leaving the growing workload visible.

## Layout

- Preferred orientation: portrait.
- Use MiniFugg shared `.mf-game-layout`, `.mf-game-hud`, `.mf-game-stage`, `.mf-game-controls` and shared text/touch/gap tokens.
- Core safe zones and the bottom feed swipe gutter must remain unobstructed.
- Root keeps `touch-action: pan-y`; stamp buttons use `touch-action: manipulation`.
