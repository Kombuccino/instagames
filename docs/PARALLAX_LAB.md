# MiniFugg — Parallax Lab (LEGACY / MIGRATION ONLY)

The existing Parallax Lab is a transitional desktop tuning tool for the old React/CSS layered-cover renderer.

**Do not add new production cover capabilities to this system.**

The canonical future for advanced animated covers is the shared Phaser 4 cover runtime defined in `docs/GAME_ENGINE_ARCHITECTURE.md` and `docs/WELCOME_ILLUSTRATIONS.md`.

## Why this remains temporarily

The current Lab still contains useful authored/tuned information, especially for TetraMindFck:

- layer selection;
- scale/position/rotation/opacity;
- parallax amplitudes;
- motion intent;
- unlock scores;
- existing raster asset paths.

Use it only to inspect/preserve those decisions while translating a cover to the new runtime.

## Legacy access

Current workshop access remains:

`/?game=<game-id>&usr=moigod`

`usr=moigod` is a hidden workshop switch, not security.

The Lab stores drafts in browser localStorage and cannot publish to the repository.

## Legacy implementation

Transitional files include:

- `src/core/ParallaxLab.tsx`;
- `src/core/parallaxLab.css`;
- `src/core/welcomeTuning.ts`;
- `src/core/FuggWelcome.tsx`;
- the legacy layer fields in `src/core/types.ts`.

Do not use these files as the template for new cover effects.

## Migration rule

When the shared Phaser cover runtime reproduces the required existing behavior and the migrated covers are validated:

1. move canonical tuning into the new cover data/runtime;
2. remove unused legacy fields/tools;
3. delete superseded legacy renderer code;
4. keep only Git history as archive.

Until then, changes to this Lab should be limited to what is necessary to extract/preserve migration data or fix a blocking regression.
