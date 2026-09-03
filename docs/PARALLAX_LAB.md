# MiniFugg — Parallax Lab

Desktop tuning tool for Fugg welcome covers.

## Access

Use `/?game=<game-id>&usr=moigod` to open the selected game with the tuning panel on desktop.

Example: `/?game=tetramindfck&usr=moigod`.

## Panel

The panel appears on the right and provides live controls for the selected cover and raster layer.

Per cover:
- choose variant;
- edit unlock score;
- simulate a player score to preview locked/unlocked variants;
- reset values;
- copy the final configuration.

Per layer:
- scale in percent;
- X/Y position;
- optional rotation and opacity;
- parallax amplitude X/Y;
- autonomous motion type and parameters.

Initial autonomous motion presets:
- none;
- float;
- vibrate;
- breathe;
- drift;
- sway.

Motion parameters can include intensity, speed, direction and optional irregularity. For example, the TetraMindFck character can use a restrained irregular vibration while the tetromino burst uses a slower floating motion.

Optional visual FX may include subtle light, glow, blur or opacity pulse. FX must not replace artwork that should exist as a real raster layer.

## Data model

Parallax tuning belongs in structured cover data interpreted by the generic `FuggWelcome` engine, not in one-off CSS rules.

Representative layer settings:

```ts
{
  role: 'foreground',
  image: '/assets/imported/example-subject.webp',
  scale: 112,
  x: 0,
  y: 8,
  parallaxX: 10,
  parallaxY: 7,
  motion: {
    type: 'vibrate',
    intensity: 3,
    speed: 1.4,
  },
}
```

## Handoff workflow

The first version does not need direct repository saving.

1. Tune the cover live in the browser.
2. Draft values may be preserved in localStorage.
3. Press `Copy configuration`.
4. The panel generates one complete structured text block containing game id, variant id, unlock score, asset paths and all layer settings.
5. Paste that block into the MiniFugg ChatGPT conversation.
6. ChatGPT applies the values to the production configuration and updates the repository.

The repository remains the authoritative production configuration.

The copied block should start with a stable marker such as:

`MINIFUGG_PARALLAX_CONFIG v1 — game=tetramindfck — variant=pulp-euro`

followed by complete JSON or TypeScript-like structured data.

## Production rule

Every Fugg cover with parallax must first have its real raster layer bundle produced through `docs/ASSET_PIPELINE.md`, then be tuned with this tool, exported, and applied to the repository through the normal development workflow.
