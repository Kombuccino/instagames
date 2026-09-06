# MiniFugg — Parallax Lab (RETIRED)

The Parallax Lab was the desktop tuning tool for the old React/CSS layered-cover renderer. It was removed when TetraMindFck became the first canonical Phaser cover migration.

**Do not add new production cover capabilities to this system.**

The canonical future for advanced animated covers is the shared Phaser 4 cover runtime defined in `docs/GAME_ENGINE_ARCHITECTURE.md` and `docs/WELCOME_ILLUSTRATIONS.md`.

## What was preserved

The migration preserved the useful authored information from TetraMindFck:

- layer selection;
- scale/position/rotation/opacity;
- parallax amplitudes;
- motion intent;
- unlock scores;
- existing raster asset paths.

These decisions now live in `src/games/calc-drop/welcome.ts`.

The former Lab implementation and browser-only drafts are available through Git history. Production tuning now lives in each game's cover data and is rendered by `src/core/runtime/PhaserCoverHost.tsx`.
