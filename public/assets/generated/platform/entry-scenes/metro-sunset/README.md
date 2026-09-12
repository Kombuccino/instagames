# Metro sunset — production plate

Approved entry-scene plate selected on 12 September 2026.

- `camera-distance-20.png`: lossless authored master, active framing; revised with consistent faceted low-poly materials, Fuggy-inspired coral ear fins on the reader's headphones, and planar low-poly hair and shoes for the far-left schoolgirl.
- `camera-distance-20.webp`: lossless runtime derivative.
- `camera-distance-30.png`: lossless alternate master retained for the approved possible closer crop.
- `camera-distance-30.webp`: lossless runtime derivative.

The runtime defaults to the 20% closer camera. `?metroDistance=30` switches the entry pilot to the 30% alternate without changing layout or handoff geometry.

The existing MiniFugg phone shell and live projected phone screen remain independent Core layers. `arms/` and `arms-screen-cutout/` contain the eight production derivatives on a wider transparent canvas. The original 941-pixel-wide source remains pixel-identical. Only the missing right-side sleeve is extended, using mirrored raster material from that same arm and clipped to a continuous low-poly sleeve silhouette. No shared recoloured extension is used. PNG files are the lossless masters and lossless WebP files are served at runtime with PNG fallback.

The active Home uses `parallax-v3/` for the 20% composition:

- `sky`: fixed full-frame sky and sun;
- `skyline-far-strip`: five complete distant building groups;
- `skyline-near-strip`: four complete intermediate building groups;
- `shore-bridge-strip`: periodic bridge module;
- `water-strip`: reflection-free moving water texture;
- `water-reflection`: fixed direct sun path;
- `carriage-base`: carriage/passenger plate with ambient light;
- `carriage-sunlight`: separate direct-sun facets.

Every runtime PNG has a lossless WebP derivative and PNG fallback. `scripts/build-metro-entry-parallax-v3.py` rebuilds these files from `concepts/metro-parallax-v3/`. `scripts/build-metro-entry-parallax-assets.py` rebuilds only the production arm derivatives. The 30% alternate stays a flat plate.
