# LineFugg — Production Asset Manifest

Status: canonical gameplay asset inventory for the approved orbital/astrolabe art direction.

All raster/illustrated production assets must use the private Drive pipeline in `docs/ASSET_PIPELINE.md`.

Canonical app prefix:

`/assets/imported/linefugg/`

## Production raster assets

### 1. `backgrounds/orbital-stage-bg-v1.webp`

Purpose: full 390×844 authored celestial environment behind gameplay.

Requirements:
- deep ink-blue star field;
- antique celestial-chart linework;
- brass/bronze observatory details near edges;
- decorative planets / astrolabe fragments;
- no game name/logo;
- no slogans or non-functional text;
- no baked numbers, grid, calculations or buttons;
- keep center clean enough for the 7×7 board and lower calculation stack;
- top-left must remain visually quiet enough for Core close control;
- may include decorative overscan-like edge elements inside the canonical stage, but nothing gameplay-critical.

Runtime: static image plus subtle Phaser parallax/twinkle overlays.

### 2. `ui/orbital-board-frame-v1.webp`

Purpose: transparent ornate brass frame around the 7×7 board.

Requirements:
- transparent center;
- square frame sized for the canonical ~370-unit board;
- crisp brass corners, engraved astronomical motifs;
- no grid lines or numbers baked in;
- visually rich but narrow enough not to reduce cell legibility.

Runtime: static Phaser image above background and below dynamic grid/text/lines.

### 3. `ui/orbital-parchment-strip-v1.webp`

Purpose: reusable transparent/isolated parchment calculation row.

Requirements:
- warm parchment with brass attachment/edge detail;
- no baked text, formula, arrows or score;
- horizontal and readable at small size;
- designed to tile/reuse for three rows.

Runtime: three instances, dynamic text rendered in Phaser.

### 4. `ui/orbital-total-plate-v1.webp`

Purpose: dark/brass total-score plate below calculation rows.

Requirements:
- no baked label or value;
- strong central readable area;
- restrained celestial engraving.

Runtime: static plate + dynamic sigma/total value.

### 5. `ui/orbital-control-ring-v1.webp`

Purpose: reusable brass circular bezel for Undo and Validate controls.

Requirements:
- transparent center or center suitable for dynamic tint/fill;
- no icon or text baked in;
- same geometry for both controls;
- supports dim/inactive and active green Validate states via Phaser tint/overlays.

Runtime: two instances with procedural icon and state glow.

### 6. `ui/orbital-orb-bezel-v1.webp`

Purpose: reusable small celestial/brass bezel for the three line indicators.

Requirements:
- transparent or dark center;
- no fixed color baked into the center;
- no pips/dots baked in;
- compact and readable between bottom buttons.

Runtime: three instances tinted/overlaid vermilion, violet, gold; five procedural pips below/around each orb.

## Optional enhancement asset

### 7. `props/orbital-armillary-v1.webp`

Purpose: independently animated upper armillary/planet mechanism if the full-stage background does not provide enough depth.

Requirements:
- transparent background;
- no text;
- brass rings and central planet;
- composition designed for very slow rotation/float without covering board/HUD.

This asset is optional. Do not create it if the background + procedural ring overlays already achieve the approved look cleanly.

## Procedural Phaser elements — no raster asset required

These must remain engine-rendered because they are stateful/dynamic:

- exact 7×7 grid geometry and cell hit areas;
- dynamic cell fills for positive / negative / × / ÷ state;
- all numbers/operators;
- three drawn line shafts and arrowheads;
- luminous start/end nodes;
- active drag preview;
- live result bubble below finger/pointer;
- selected-cell halos;
- line energy pulse;
- invalid-placement flare/recoil;
- three line-indicator colors and five cell-count pips each;
- Undo arrow icon;
- Validate check icon;
- enabled/disabled control glow;
- calculation formulas/results;
- total value;
- star twinkles, tiny particles, glints and low-cost orbit motion.

## Geometry / layering contract

Authored against one fixed `390×844` stage only.

Recommended layer order:

1. `orbital-stage-bg-v1.webp`;
2. low-cost ambient celestial FX;
3. board frame / parchment / total / control bezels;
4. grid cell backgrounds;
5. line shafts / node glows;
6. cell numbers/operators above lines;
7. calculations / total / icons / pips;
8. transient feedback FX / live result bubble.

Important: numbers/operators must remain visually above traced lines.

## File-format guidance

- Prefer WebP for illustrated opaque/semi-opaque backgrounds and frames when quality is visually equivalent.
- Preserve high-quality originals in Drive if an original PNG is generated; only create an optimized derivative when useful.
- No SVG through the Drive importer.
- Each file must remain below pipeline limits.

## Production paths

Drive:

`Fugg/linefugg/backgrounds/...`
`Fugg/linefugg/ui/...`
`Fugg/linefugg/props/...`

GitHub mirror:

`public/assets/imported/linefugg/backgrounds/...`
`public/assets/imported/linefugg/ui/...`
`public/assets/imported/linefugg/props/...`

Application:

`/assets/imported/linefugg/backgrounds/...`
`/assets/imported/linefugg/ui/...`
`/assets/imported/linefugg/props/...`

## Definition of integrated

An asset is production-integrated only when:

1. final bytes are uploaded under the correct private Drive folder;
2. the Drive sync has mirrored them into `public/assets/imported/linefugg/...` on `main`;
3. the mirrored file is verified in GitHub;
4. Phaser references only `/assets/imported/linefugg/...`;
5. no temporary local/public URL or duplicate legacy asset remains.
