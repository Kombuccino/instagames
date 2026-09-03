# Runtime image derivatives

MiniFugg keeps original production artwork intact and may additionally import optimized web derivatives.

Recommended pattern for illustrated welcome screens:

- keep the original PNG master unchanged;
- create a same-resolution WebP derivative only after visual validation;
- start around WebP quality 88 and inspect the result visually;
- use the WebP path at runtime when the visual difference is negligible;
- keep both master and derivative in the private `Fugg` Drive inbox so the canonical importer handles both;
- never replace or silently recompress the source master.

TetraMindFck pilot results at 941×1672:

- pulp: 3.24 MB PNG -> 0.54 MB WebP;
- micro-euro: 2.45 MB PNG -> 0.27 MB WebP;
- graphic poster: 3.00 MB PNG -> 0.43 MB WebP.

This file is operational documentation only. `docs/ASSET_PIPELINE.md` remains the canonical security and import contract.
