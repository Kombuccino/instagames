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

Keep each clean source separately from its comparison sheet and any annotated technical copy. Record source/derivative relationships, the exact reference, approval scope and known attempts in the existing game/surface follow-up using `docs/DA_CORE.md`. A contact sheet is not a replacement for its independent originals. Do not publish private conversations, private reference bytes or secrets in GitHub merely to document an attempt.

An explicit user deletion overrides preservation for the named material. When archive access is unavailable, preserve the local sources, record the exact pending transfer and do not report an upload that has not happened. This does not block Codex-local production delivery through its authorized route.

## Production assets are separate

The archive is **not** the production asset pipeline.

If an image is approved for use by the app/game itself, follow `docs/ASSET_PIPELINE.md`: Codex with local repository access writes verified assets to `public/assets/generated/...` and commits them with consuming code; ChatGPT without local access uses private `Fugg/...` then verifies the Actions mirror in `public/assets/imported/...`. Archiving and runtime delivery are distinct; do not require Drive for Codex-local delivery.

Do not place the general concept archive inside the production `Fugg` root merely for convenience, because doing so could cause exploratory boards and rejected artwork to be imported into the application repository.

## Suggested organization

- Platform UI, entry scenes, system boards -> `Platform`
- logo, mascot, wordmark and identity studies -> `Branding`
- canonical approved MiniFugg logo masters/references -> `Branding/Logo - Canonical`
- game-specific visual research -> `Games/<game-id>/` when useful

The `Branding/Logo - Canonical` folder is reserved for assets explicitly registered by `docs/BRAND_ASSETS.md`. Rejected/exploratory wordmarks must remain outside that canonical folder so they cannot be mistaken for the current brand reference.

Create deeper subfolders only when the archive becomes large enough to justify them.

## Existing archive seed

The archive was initialized with copies of the existing platform direction boards A/B/C where available on Drive.

## General rule for AI work

When generating a new MiniFugg image, treat archival as part of the task, not as an optional cleanup step afterward.
