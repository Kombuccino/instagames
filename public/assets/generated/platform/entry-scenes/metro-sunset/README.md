# Metro sunset — production plate

Approved entry-scene plate selected on 12 September 2026.

- `camera-distance-20.png`: lossless authored master, active framing; revised with consistent faceted low-poly materials, Fuggy-inspired coral ear fins on the reader's headphones, and planar low-poly hair and shoes for the far-left schoolgirl.
- `camera-distance-20.webp`: lossless runtime derivative.
- `camera-distance-30.png`: lossless alternate master retained for the approved possible closer crop.
- `camera-distance-30.webp`: lossless runtime derivative.

The runtime defaults to the 20% closer camera. `?metroDistance=30` switches the entry pilot to the 30% alternate without changing layout or handoff geometry.

The existing MiniFugg phone shell and live projected phone screen remain independent Core layers. `arms/` and `arms-screen-cutout/` contain the eight production derivatives on a wider transparent canvas. The original 941-pixel-wide source remains pixel-identical. Only the missing right-side sleeve is extended, using mirrored raster material from that same arm and clipped to a continuous low-poly sleeve silhouette. No shared recoloured extension is used. PNG files are the lossless masters and lossless WebP files are served at runtime with PNG fallback.

`parallax/` contains the active 20% scene split:

- `carriage-foreground.png` / `.webp`: exact approved carriage and passenger pixels with transparent window openings;
- `exterior-panorama.png` / `.webp`: independent low-poly sunset, skyline and water panorama.

Core clips the outdoor panorama into three bands while the carriage plate stays fixed: sky/sun remains stationary, city moves, and water moves faster. A shared occlusion cycle lowers the carriage exposure, the stationary floor-light strength and the water reflections when buildings pass in front of the sun. The light direction never moves. Reduced-motion freezes both parallax and exposure. Source studies and the alpha-matte extraction are documented under `concepts/metro-parallax-v1/`; `scripts/build-metro-entry-parallax-assets.py` deterministically rebuilds the production files and every arm derivative.
