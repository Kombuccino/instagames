# MiniFugg Graphic Archive

This document defines the archival rule for graphics generated during MiniFugg design and development.

## Purpose

All generated visual research should remain easy to find later, even when it is not a production asset.

The private Google Drive archive root is:

- folder: `MiniFugg - Graphic Archive`
- Drive folder ID: `1xEAvT7H1e7xUCnVnHS6KLIl0lISEhPEB`

Current top-level archive folders:

- `Platform`
- `Games`
- `Branding`

## Archive rule

For every new MiniFugg visual generated during concepting, art-direction exploration, UI studies, logo/branding exploration, platform boards, or game visual research:

1. keep the generated master/reference file;
2. give it a useful, unique filename;
3. upload or copy it into the appropriate folder inside `MiniFugg - Graphic Archive`;
4. do this even when the visual is rejected or only exploratory, unless it is a trivial duplicate;
5. preserve rejected studies rather than overwriting them, because they may be useful later for comparison or recovery.

## Production assets are separate

The archive is **not** the production asset pipeline.

If an image is approved for use by the app/game itself, it must still follow `docs/ASSET_PIPELINE.md` and be placed in the private production Drive tree under `Fugg/...`, then synced and verified in `public/assets/imported/...` before runtime use.

Do not place the general concept archive inside the production `Fugg` root merely for convenience, because doing so could cause exploratory boards and rejected artwork to be imported into the application repository.

## Suggested organization

- Platform UI, entry scenes, system boards -> `Platform`
- logo, mascot, wordmark and identity studies -> `Branding`
- game-specific visual research -> `Games/<game-id>/` when useful

Create deeper subfolders only when the archive becomes large enough to justify them.

## Existing archive seed

The archive was initialized with copies of the existing platform direction boards A/B/C where available on Drive.

## General rule for AI work

When generating a new MiniFugg image, treat archival as part of the task, not as an optional cleanup step afterward.
