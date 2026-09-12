# Metro parallax V2 — production sources

These source plates replace the rejected horizontal-band experiment. They share the active metro scene's low-poly sunset palette and are authored as independent objects:

- `sky-source.png`: opaque sky and fixed sun, with no skyline or water;
- `skyline-far-source.png`: transparent distant city silhouettes;
- `skyline-near-source.png`: transparent sparse foreground buildings;
- `shore-bridge-source.png`: transparent embankment, bridge and small lights;
- `water-base-source.png`: opaque sea without a strong direct sun path.

The generation brief required clean faceted low-poly masses, no text, no people, no train interior, full object silhouettes and real alpha on every cutout plate. The build script scales and positions the plates against the approved carriage windows, normalizes both horizontal edges for a seamless one-way loop, extracts the stationary water reflection, and separates ambient carriage color from direct sunlight. PNG files remain the lossless sources; lossless WebP derivatives are served at runtime with PNG fallback.

Do not flatten these plates back into a panorama. A future art correction must preserve their independent depth, motion and lighting roles.
