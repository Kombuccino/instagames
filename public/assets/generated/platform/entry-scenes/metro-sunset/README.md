# Metro sunset — production plate

Approved entry-scene plate selected on 12 September 2026.

- `camera-distance-20.png`: lossless authored master, active framing; revised with consistent faceted low-poly materials, Fuggy-inspired coral ear fins on the reader's headphones, and planar low-poly hair and shoes for the far-left schoolgirl.
- `camera-distance-20.webp`: lossless runtime derivative.
- `camera-distance-30.png`: lossless alternate master retained for the approved possible closer crop.
- `camera-distance-30.webp`: lossless runtime derivative.

The runtime defaults to the 20% closer camera. `?metroDistance=30` switches the entry pilot to the 30% alternate without changing layout or handoff geometry.

The existing MiniFugg phone shell and live projected phone screen remain independent Core layers. `arms/` and `arms-screen-cutout/` contain the eight production derivatives on a wider transparent canvas. The original 941-pixel-wide source remains pixel-identical. Only the missing right-side sleeve is extended, using mirrored raster material from that same arm and clipped to a continuous low-poly sleeve silhouette. No shared recoloured extension is used. PNG files are the lossless masters and lossless WebP files are served at runtime with PNG fallback.

`parallax/` contains the active 20% scene split:

- `sky.png` / `.webp`: full fixed sky and fixed sun, present behind every exterior layer;
- `skyline-far.png` / `.webp`: complete transparent distant silhouettes, slow loop;
- `skyline-near.png` / `.webp`: complete transparent foreground buildings, intermediate loop and sunlight occluders;
- `shore-bridge.png` / `.webp`: transparent water edge, bridge and lights;
- `water-base.png` / `.webp`: seamless moving sea without baked direct sun path;
- `water-reflection.png` / `.webp`: stationary direct reflection aligned below the fixed sun;
- `carriage-base.png` / `.webp`: exact approved carriage geometry with transparent windows and ambient light only;
- `carriage-sunlight.png` / `.webp`: transparent direct-sun facets used as a variable light plate.

Core moves these cutout layers in one direction with depth-ordered speeds and seamless horizontal joins. No layer boundary crosses a building. A shared occlusion cycle lowers only `carriage-sunlight` and `water-reflection` when foreground buildings pass the fixed sun. Reduced-motion freezes both parallax and exposure. V2 sources are documented under `concepts/metro-parallax-v2/`; `scripts/build-metro-entry-parallax-assets.py` deterministically rebuilds the production files and every arm derivative.
