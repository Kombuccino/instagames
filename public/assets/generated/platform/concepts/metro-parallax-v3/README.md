# Metro parallax V3 — sources

V3 keeps the approved carriage and reconstructs the exterior from the original low-poly skyline language without using a flattened repeating panorama.

- `carriage-foreground-source.png`: exact approved carriage/passenger pixels with transparent panes;
- `sky-source.png`: fixed low-poly sky and sun;
- `skyline-far-atlas-source.png`: ten independent alpha-cut skyline groups generated from the approved scene;
- the moving water is extracted from the approved exterior reference so its low-poly facets and palette remain exact.

The builder selects and distributes separate groups into two periodic rings. The first and last object spacing is the same as every internal interval. Distant buildings remain opaque and gain depth through a lighter palette, smaller scale and slower motion. Water uses a mirrored texture period plus a restrained sparkle layer, while the bridge is a code-built modular rail. The direct reflection remains separate and the carriage keeps one constant approved exposure. The discarded checkerboard near-atlas was not retained.

Do not replace these rings with horizontal crops or a single generated skyline. Validate several animation phases, the actual wrap, water shimmer and constant carriage exposure before activation.
