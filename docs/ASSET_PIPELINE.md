# MiniFugg image asset pipeline

This file is the canonical contract for moving image assets created or prepared in ChatGPT into MiniFugg. Any MiniFugg conversation that creates or integrates images must read and follow it.

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
  concepts/
```

A feature may add a useful level below that, for example `welcome/variants/` or `welcome/parallax/v1/`. Avoid deep or decorative folder trees.

Use the game's real registry ID when one exists. Current IDs include `train-fighter`, `linefugg`, `shoot-the-shooter`, `vlads-skewers`, `hari-rotten-teeth`, `tetramindfck`, `crazy-papers` and `debth-of-life`.

## Naming

Folder names and filenames are normalized to lowercase ASCII. Use descriptive slugs with `a-z`, numbers, `-`, `_` and `.`. Do not rely on accents, spaces or punctuation to distinguish assets.

The importer sanitizes every folder segment and filename. If two different Drive items would collapse to the same normalized repository path, the sync refuses the collision instead of overwriting silently.

## Accepted files

The automatic importer accepts only PNG, JPEG and WebP. It preserves the exact uploaded bytes: no resize, recompression or format conversion is performed.

Limits:

- maximum file size: 10 MiB
- maximum decoded image size: 40,000,000 pixels
- maximum folder nesting below `Fugg`: 8 levels
- SVG and other active/executable formats are rejected

Keep the original/source quality unless the user explicitly asks for an optimized derivative. If both an original PNG and an optimized WebP are wanted, keep both as separate files.

## Automatic sync

Workflow: `.github/workflows/drive-asset-sync.yml`.

It runs every 10 minutes, can run manually, and also tests automatically when its importer code changes. Authentication uses Google Workload Identity Federation; there is no Google service-account JSON key or permanent Google credential on GitHub/the VPS.

Google service account: `minifugg-assets@minifugg-assets.iam.gserviceaccount.com`.

Workload Identity provider: `projects/484757798037/locations/global/workloadIdentityPools/github-actions/providers/instagames`.

The Google identity is restricted to immutable GitHub repository ID `1352769382` on `main`.

## Required behavior for MiniFugg conversations

When an image should enter MiniFugg:

1. Read this file before deciding where to put the asset.
2. Generate/finalize the image and give it its production name.
3. Upload the final file with the connected Google Drive into `Fugg/<game-id>/...` (or a documented Core folder for platform-wide artwork).
4. Do not use public Drive links, FTP, manual binary GitHub uploads, base64 chunking or runtime Drive hotlinks when this pipeline is available.
5. Wait for or verify the GitHub Actions sync.
6. Verify the file exists under the mirrored `public/assets/imported/...` path before changing code to reference it.
7. Reference only `/assets/imported/...` from application code.
8. During migrations, create/verify the new mirrored path before changing code references; keep the old repository path temporarily if needed, then delete it only after confirming nothing references it.

## Security boundaries

The importer recursively traverses only descendants of the hard-locked `Fugg` folder. It validates decoded image type and size, rejects unsupported files/decompression bombs, sanitizes each path segment, detects normalized-path collisions, limits recursion, never executes uploaded content, and can write only below the hard-locked `public/assets/imported/` prefix in `Kombuccino/instagames` on `main`.

The Drive folder remains private. The application never fetches assets from Google Drive at runtime.
