# MiniFugg — Parallax Lab

Desktop tuning tool for Fugg welcome covers.

## Access

Use `/?game=<game-id>&usr=moigod` to open the selected game cover with the tuning panel on desktop.

Example: `/?game=tetramindfck&usr=moigod`.

`usr=moigod` is deliberately only a hidden workshop switch, not a security mechanism. The Lab cannot publish or write to the repository.

The panel is only rendered on desktop-width screens (currently 980 px+).

## Workspace rule

Parallax Lab is a **cover-only workshop**. It is not a gameplay preview.

While Lab mode is active:

- the selected cover occupies the entire viewport area left of the admin panel;
- the complete cover must remain visible inside that area;
- the right admin panel never overlays or crops the cover workspace;
- normal MiniFugg top bars, score chips and feed UI are hidden;
- the feed is frozen on the requested game;
- swipe, wheel and keyboard cannot dismiss the cover into gameplay;
- the underlying game remains paused and is irrelevant to tuning.

The purpose is to judge the actual cover composition and motion at the largest useful size while keeping every control visible beside it.

## Panel

The panel appears on the right and provides live controls for the selected cover and raster layer.

Per cover:
- choose any variant, including currently locked variants;
- edit unlock score;
- simulate a player score to preview locked/unlocked states;
- reset one variant or the whole local draft;
- copy the selected variant or the whole game's welcome configuration.

Per layer:
- scale in percent;
- X/Y position;
- rotation and opacity;
- parallax amplitude X/Y;
- autonomous motion type and parameters;
- subtle blur/glow FX;
- optional layer guides while tuning.

Initial autonomous motion presets:
- none;
- float;
- vibrate;
- breathe;
- drift;
- sway.

Motion parameters include intensity, speed, direction and irregularity. For example, the TetraMindFck character starts with a restrained irregular `vibrate`, while the tetromino burst starts with a slower `float`.

FX must not replace artwork that should exist as a real raster layer.

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
  rotation: 0,
  opacity: 100,
  parallaxX: 10,
  parallaxY: 7,
  motion: {
    type: 'vibrate',
    intensity: 3,
    speed: 1.4,
    direction: -90,
    irregularity: 0.7,
  },
  fx: {
    blur: 0,
    glow: 0,
  },
}
```

## Draft persistence

Lab changes are stored only in browser `localStorage` under a per-game draft key. This makes refreshes convenient but does not change production configuration.

`Reset variante` restores the selected variant from repository values.

`Reset tout` deletes the local draft and restores all repository values.

## Handoff workflow

The Lab intentionally has no backend/repository write access.

1. Tune the cover live in the browser.
2. Draft values are preserved in localStorage.
3. Press `Copier la variante` or `Copier tout le jeu`.
4. The panel generates a structured text block containing game id, variant ids, unlock scores, asset paths and layer settings.
5. Paste that block into the MiniFugg ChatGPT conversation.
6. ChatGPT applies the reviewed values to production configuration and updates the repository.

The repository remains the authoritative production configuration.

Copied blocks start with one of these markers:

`MINIFUGG_PARALLAX_CONFIG v1 — game=tetramindfck — variant=pulp-euro`

or

`MINIFUGG_PARALLAX_CONFIG v1 — game=tetramindfck — all-variants`

followed by formatted JSON.

## Current implementation

Core files:
- `src/core/ParallaxLab.tsx` — desktop editor and copy/reset workflow;
- `src/core/parallaxLab.css` — cover-only workspace plus right-side workshop UI;
- `src/core/welcomeTuning.ts` — shared defaults and motion timing;
- `src/core/FuggWelcome.tsx` — live cover interpreter;
- `src/core/types.ts` — production tuning data model.

The first implemented test case is TetraMindFck `pulp-euro`.

## Production rule

Every Fugg cover with parallax must first have its real raster layer bundle produced through `docs/ASSET_PIPELINE.md`, then be tuned with this tool, exported as text, and applied to the repository through the normal development workflow.
