# MiniFugg — Canonical Brand Assets

This file is the source-of-truth contract for the MiniFugg logo/wordmark assets. Read it before creating, placing, exporting or modifying any MiniFugg logo.

## Canonical visual reference

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

## Vector status

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

## Runtime integration rule

Core code should reference a centralized brand asset path/primitive rather than scattering hard-coded logo filenames across components. When the production raster has synced, use the canonical `/assets/imported/platform/logo/...` path above until an explicitly approved vector master becomes the runtime source.

If a future task finds another MiniFugg wordmark in Core, a mockup, an entry scene or a generated asset, compare it against this canonical reference before keeping it. When in doubt, the approved PNG wins.
