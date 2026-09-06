# Third-party notices

## @breezystack/lamejs

- Version: `1.2.7`
- License: LGPL-3.0
- Purpose: browser-side MP3 encoding for Audio Lab exports
- Upstream: `https://github.com/breezystack/lamejs`

The package is loaded only when an MP3 export is requested. MiniFugg's WAV export and symbolic music sources do not depend on it.

## Phaser

- Production line: `4.x` (baseline added with `4.2.1`)
- License: MIT
- Purpose: canonical MiniFugg 2D gameplay and advanced animated-cover runtime
- Upstream: `https://github.com/phaserjs/phaser`

Phaser is a shared platform dependency. Games use it through the MiniFugg runtime conventions rather than inventing their own Canvas/WebGL engine layer.

## three.js

- Production line: `0.185.x` (baseline added with `0.185.1`)
- License: MIT
- Purpose: canonical MiniFugg 3D runtime for intentionally 3D low-poly/blockout games
- Upstream: `https://github.com/mrdoob/three.js`

Three.js is reserved for genuine 3D scenes. Normal 2D MiniFugg games use Phaser.
