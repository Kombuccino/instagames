# MiniFugg image asset pipeline

This file is the canonical contract for moving image assets into MiniFugg. Any MiniFugg conversation that creates or integrates images must read and follow it.

## Two entry routes — user decision, 2026-09-07

- **Codex with local repository access:** save generated/finalized artwork directly into the project, normally `public/assets/generated/<game-id>/<purpose>/...`, verify it, then commit it with its consuming code. No Drive upload or Actions wait is required. Preserve approved references and original sources; record source, dimensions, alpha, intended use and any optimized derivatives in the asset manifest.
- **ChatGPT without local repository access:** use the private Drive hierarchy and automated GitHub sync described below. Its output remains `public/assets/imported/...`.

Runtime uses local `/assets/generated/...` or `/assets/imported/...` URLs matching the route. Existing imported files need not be moved. The approval, decomposition, quality and security requirements apply to both routes. This distinction overrides older wording requiring every Codex-generated image to pass through Drive.

This document governs **transport, storage and verification of image bytes**. When an approved game-art mockup/DA must be converted into actual runtime components, also follow `docs/GAME_ART_PRODUCTION_PIPELINE.md`; a flattened concept board is not automatically a valid runtime asset.

## Source folder

Use the private Google Drive folder `Fugg` (ID `1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H`). Never make this folder public.

Production assets should be organized below `Fugg` by the actual MiniFugg game ID/slug, then by purpose. The importer mirrors the relative Drive hierarchy under `public/assets/imported/`.

Example:

```text
Drive
Fugg/tetramindfck/welcome/variants/v1-pulp-euro.webp

GitHub
public/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.webp

Application
/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.webp
```

Files directly at the root of `Fugg` remain supported for backward compatibility, but new game artwork should use a game folder.

## Recommended per-game structure

Create only the folders a game actually needs. Common names are:

```text
Fugg/<game-id>/
  welcome/
  sprites/
  backgrounds/
  ui/
  props/
  fx/
```

A feature may add a useful level below that, for example `welcome/variants/`. Avoid deep or decorative folder trees. New covers are static; do not create a new parallax layer folder for them.

`concepts/` and `production-boards/` belong in the private graphic archive, outside the synchronized `Fugg` root; see `GRAPHIC_ARCHIVE.md`. They may contain comparisons, annotated translation boards and FX/storyboard studies, not runtime textures. Explicitly approved public reference copies can be tracked separately when useful, but are never treated as runtime assets. Keep runtime-ready FX textures in `fx/` and link their clean sources and reference boards from `ASSET_MANIFEST.md`. Existing mirrored references are not deleted by this documentation change.

Use the game's real registry ID when one exists. Current IDs include `train-fighter`, `linefugg`, `shoot-the-shooter`, `vlads-skewers`, `hari-rotten-teeth`, `tetramindfck`, `crazy-papers` and `debth-of-life`.

## Naming

Folder names and filenames are normalized to lowercase ASCII. Use descriptive slugs with `a-z`, numbers, `-`, `_` and `.`. Do not rely on accents, spaces or punctuation to distinguish assets.

The importer sanitizes every folder segment and filename. If two different Drive items would collapse to the same normalized repository path, the sync refuses the collision instead of overwriting silently.

## Accepted files and production formats

The automatic importer accepts PNG, WebP, AVIF and legacy JPEG. It preserves the exact uploaded bytes: no resize, recompression or format conversion is performed.

For all new production:

- keep the approved master/source as PNG or another lossless working source;
- use **WebP lossless** as the normal runtime derivative for sprites, panels, atlases and backgrounds;
- use **AVIF** for large static covers/backgrounds only after visual comparison, size measurement and decode validation on web, Capacitor and Electron targets;
- keep a PNG or WebP fallback when AVIF is used;
- do not create new JPG/JPEG assets. Import support remains only so existing legacy files are not broken before migration.

Limits:

- maximum file size: 10 MiB
- maximum decoded image size: 40,000,000 pixels
- maximum folder nesting below `Fugg`: 8 levels
- SVG and other active/executable formats are rejected

Keep the original/source quality unless the user explicitly asks for an optimized derivative. Masters and runtime derivatives are separate files. A smaller transfer does not imply lower decoded memory: ordinary browser textures still approach width × height × 4 bytes after decoding.

## External packs and reusable FX

Before recreating a prominent visual effect from scratch, the agent may look for a high-quality external asset or pack. It must verify that the asset is usable in MiniFugg's targets and preserve the source URL, creator, licence, proof of purchase when applicable, allowed usage and required attribution in the game's `ASSET_MANIFEST.md`. A package made for another Phaser version is not automatically a compatible code plugin; prefer its image/sprite resources unless its Phaser 4.2.1 compatibility is verified.

An imported pack is material to adapt, not a visual direction. Recolor, animate and combine it only in ways that preserve the approved game's palette, pixel density, line/matter language and performance budget. Do not import a realistic/VFX-heavy asset into a pixel, paper or editorial game just because it looks impressive in isolation.

## Automatic sync

Workflow: `.github/workflows/drive-asset-sync.yml`.

It runs every 10 minutes, can run manually, and also tests automatically when its importer code changes. Authentication uses Google Workload Identity Federation; there is no Google service-account JSON key or permanent Google credential on GitHub/the VPS.

Google service account: `minifugg-assets@minifugg-assets.iam.gserviceaccount.com`.

Workload Identity provider: `projects/484757798037/locations/global/workloadIdentityPools/github-actions/providers/instagames`.

The Google identity is restricted to immutable GitHub repository ID `1352769382` on `main`.

## Required behavior for MiniFugg conversations

When an image enters MiniFugg **from ChatGPT through Drive**:

1. Read this file before deciding where to put the asset.
2. If this image is derived from an approved gameplay DA/mockup, first perform the decomposition/state ownership pass from `docs/GAME_ART_PRODUCTION_PIPELINE.md`.
3. Generate/finalize the image and give it its production name.
4. Upload the final file with the connected Google Drive into `Fugg/<game-id>/...` (or a documented Core folder for platform-wide artwork).
5. Do not use public Drive links, FTP, manual binary GitHub uploads, base64 chunking or runtime Drive hotlinks when this pipeline is available.
6. Wait for or verify the GitHub Actions sync.
7. Verify the file exists under the mirrored `public/assets/imported/...` path before changing code to reference it.
8. Reference only `/assets/imported/...` from application code.
9. During migrations, create/verify the new mirrored path before changing code references; keep the old repository path temporarily if needed, then delete it only after confirming nothing references it.

## Security boundaries

The importer recursively traverses only descendants of the hard-locked `Fugg` folder. It validates decoded image type and size, rejects unsupported files/decompression bombs, sanitizes each path segment, detects normalized-path collisions, limits recursion, never executes uploaded content, and can write only below the hard-locked `public/assets/imported/` prefix in `Kombuccino/instagames` on `main`.

The Drive folder remains private. The application never fetches assets from Google Drive at runtime.

## Runtime backgrounds and transparency

Prefer genuine alpha for isolated art, especially soft edges and glow; PNG and WebP can carry alpha. Opaque images also work in Phaser. If an asset needs its surrounding background removed, use a deliberately uniform key color with a supported local filter, or an appropriate measured geometry mask for a simple silhouette. Do not mistake a painted checkerboard for transparency. When only a clean interior region is consumed, exclude all background pixels through explicit source frames/masks and document that choice. The source image format alone does not guarantee transparency.

## Local checks before transport

Follow the three distinct checks in `DA_CORE.md` and the `minifugg-art` skill. Its optional `art_files.py inspect` measures decoding, dimensions, alpha, content bounds and file size without changing the source; `assemble` creates an unlabelled PNG comparison with separate source coordinates. This does not replace importer validation, visual review, proof of lossless encoding or shell decode tests. Keep technical reports with the existing pass trace, not in the runtime texture tree.
