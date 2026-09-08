# MiniFugg — Parallax Lab (RETIRED)

The Parallax Lab was the desktop tuning tool for the old React/CSS layered-cover renderer. It was removed when TetraMindFck became the first canonical Phaser cover migration.

**Do not add new production cover capabilities to this system.**

The approved target is static cover art rendered by Core. The Phaser cover runtime is now legacy and must not receive new capabilities.

## What was preserved

The migration preserved the useful authored information from TetraMindFck:

- layer selection;
- scale/position/rotation/opacity;
- parallax amplitudes;
- motion intent;
- unlock scores;
- existing raster asset paths.

These decisions now live in `src/games/calc-drop/welcome.ts`.

The former Lab implementation and browser-only drafts are available through Git history. Current TetraMindFck layer data still renders through `src/core/runtime/PhaserCoverHost.tsx` only until static replacements are validated and the runtime can be removed.
