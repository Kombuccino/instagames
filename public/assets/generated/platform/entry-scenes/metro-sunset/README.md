# Metro sunset — production plate

Approved entry-scene plate selected on 12 September 2026.

- `camera-distance-20.png`: lossless authored master, active framing; revised with consistent faceted low-poly materials, Fuggy-inspired coral ear fins on the reader's headphones, and planar low-poly hair and shoes for the far-left schoolgirl.
- `camera-distance-20.webp`: lossless runtime derivative.
- `camera-distance-30.png`: lossless alternate master retained for the approved possible closer crop.
- `camera-distance-30.webp`: lossless runtime derivative.

The runtime defaults to the 20% closer camera. `?metroDistance=30` switches the entry pilot to the 30% alternate without changing layout or handoff geometry.

The MiniFugg phone shell and live projected phone screen remain independent Core layers. `arms-v2-sources/` contains the eight newly authored complete phone/hand/forearm variants on chroma masters. They preserve the series identities (skin tones, clothing colours, beads, bangle and watch) while sharing one stable phone geometry. `arms/` contains their transparent PNG masters and lossless WebP runtime derivatives; `arms-screen-cutout/` additionally removes the glass so the live Core viewport can take over during the wide-screen handoff. Every sleeve is a complete authored garment that leaves through the bottom of the canvas; no extension, mirrored texture or CSS reconstruction remains.

The active Home uses `parallax-v3/` for the 20% composition:

- `sky`: fixed full-frame sky and sun;
- `skyline-far-strip`: five complete distant building groups;
- `skyline-near-strip`: four complete intermediate building groups;
- `shore-bridge-strip`: periodic bridge module;
- `water-strip`: reflection-free moving water texture;
- `water-sparkle-strip`: subtle moving facets whose opacity creates surface shimmer;
- `water-reflection`: fixed direct sun path;
- `carriage-base`: fixed carriage/passenger plate with its approved lighting.

Every runtime PNG has a lossless WebP derivative and PNG fallback. `scripts/build-metro-entry-parallax-v3.py` rebuilds these files from `concepts/metro-parallax-v3/`. `scripts/build-metro-entry-parallax-assets.py` rebuilds only the production arm derivatives. The 30% alternate stays a flat plate.
