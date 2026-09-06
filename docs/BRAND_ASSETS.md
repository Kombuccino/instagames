# MiniFugg — Canonical Brand Assets

This file is the source-of-truth contract for MiniFugg brand assets. Read it before creating, placing, exporting or modifying the MiniFugg logo, mascot, app icon, favicon or other shared identity marks.

## Canonical wordmark visual reference

The approved MiniFugg wordmark is the exact user-supplied/reference image validated on 2026-09-06. Its geometry, proportions, letter shapes, spacing and red triangular accent are locked.

Do **not** ask an image model to redesign, reinterpret, improve or regenerate the wordmark. Do not substitute a similar font or recreate the letters from memory.

### Production raster master

Private Drive source:

`Fugg/platform/logo/minifugg-logo-canonical-2026-09-06.png`

Expected mirrored repository/runtime path after the normal asset sync:

`public/assets/imported/platform/logo/minifugg-logo-canonical-2026-09-06.png`

`/assets/imported/platform/logo/minifugg-logo-canonical-2026-09-06.png`

This PNG is currently the **canonical visual source of truth**. If a derived asset does not visually match it, the derived asset is wrong.

### Graphic archive copy

The approved reference is also preserved in the private graphic archive:

`MiniFugg - Graphic Archive / Branding / Logo - Canonical / minifugg-logo-canonical-user-approved-2026-09-06.png`

Keep rejected and exploratory logo studies elsewhere in the archive, but never treat them as production references.

## Wordmark vector status

A high-fidelity SVG trace derived from the canonical PNG is archived as:

`MiniFugg - Graphic Archive / Branding / Logo - Canonical / minifugg-logo-vector-trace-2026-09-06.svg`

It is a **derived vector trace**, not yet allowed to supersede the canonical PNG unless the user explicitly validates it as the vector master.

The production Drive importer intentionally rejects SVG. Therefore SVG source masters belong in the controlled branding source/archive workflow, while raster runtime derivatives continue through `docs/ASSET_PIPELINE.md`.

When a vector master is explicitly approved:

1. preserve that SVG exactly as the canonical vector geometry;
2. register its repository/archive path in this file;
3. derive favicon/app-icon/monochrome/lockup variants from that master rather than redrawing them;
4. keep the canonical PNG as a visual regression reference;
5. update `docs/PLATFORM_VISUAL_VALIDATION.md` accordingly.

## Fuggy mascot

Fuggy is now a **locked shared brand identity**, not an open mascot prompt.

Before generating, rendering, posing, animating, modelling or integrating Fuggy, read:

`docs/FUGGY_MASCOT.md`

The highest-authority source and approved reference boards are archived in:

`MiniFugg - Graphic Archive / Branding / Mascot - Canonical /`

Canonical files include:

- `fuggy-canonical-source-2026-09-06.afphoto` — user-supplied source;
- `fuggy-canonical-user-reference-preview-2026-09-06.png` — source preview;
- `fuggy-canonical-reference-board-v1-2026-09-06.png` — approved expanded 360°/pose/expression board;
- `3D/fuggy-canonical-base-v1.glb` — first editable low-poly 3D base;
- `3D/fuggy-canonical-base-v1.obj` — interchange version;
- `3D/fuggy-canonical-base-v1.zip` — packaged working set.

Do not generate a new mascot from a generic verbal description when these references are available. New scenes must use the canonical Fuggy geometry and face language defined in `docs/FUGGY_MASCOT.md`.

## Favicon / app icon status

The current approved exploration board is archived as:

`MiniFugg - Graphic Archive / Branding / Mascot - Canonical / minifugg-favicon-app-icon-exploration-v2-2026-09-06.png`

It is a **choice board**, not yet a selected canonical icon. Mascot-based and logo-based options remain open until the user explicitly chooses one.

Once an icon direction is approved:

1. create one canonical master for that icon family;
2. derive favicon, PWA, Android/iOS and social/avatar sizes from the same master;
3. register all final filenames here;
4. do not maintain unrelated icon designs for different platforms unless a platform constraint genuinely requires a crop/mask variant.

## Usage rules

- The wordmark text is exactly `MiniFugg`.
- Preserve the distinctive custom geometry; do not replace it with plain typography.
- Preserve the red triangular accent and its relationship to the wordmark unless the user explicitly requests a monochrome variant.
- Scaling is allowed; geometric distortion, stretching, skewing and independent letter repositioning are not.
- Cropping may change surrounding whitespace but must not crop the mark itself.
- A monochrome derivative must preserve the exact silhouette.
- Entry scenes, social graphics, covers, trailers, UI and marketing must all use this same identity rather than inventing local variants.
- A subtle MiniFugg publisher signature may be integrated into authored cover art, but the logo geometry itself remains the canonical one.
- Do not add a large persistent MiniFugg wordmark overlay over every game cover; follow `docs/PLATFORM_VISUAL_VALIDATION.md`.
- Fuggy may change pose, angle, lighting, scene and expression, but must remain the same mascot.

## Runtime integration rule

Core code should reference centralized brand asset paths/primitives rather than scattering hard-coded logo or mascot filenames across components. When the production raster has synced, use the canonical `/assets/imported/platform/logo/...` path above until an explicitly approved vector master becomes the runtime source.

If a future task finds another MiniFugg wordmark or Fuggy variant in Core, a mockup, an entry scene or a generated asset, compare it against these canonical references before keeping it. When in doubt, the approved source reference wins.
