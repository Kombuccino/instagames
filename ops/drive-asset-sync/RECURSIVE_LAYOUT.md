# Recursive Drive layout

The importer mirrors the hierarchy below the private Drive folder `Fugg` into `public/assets/imported/`.

Example:

`Fugg/tetramindfck/welcome/variants/v1-pulp-euro.webp`

becomes:

`public/assets/imported/tetramindfck/welcome/variants/v1-pulp-euro.webp`

Game `concepts/` folders are mirrored by the same rule, but application runtime must not reference flattened concept/mockup files unless they are explicitly production assets.

Root-level files remain supported for backward compatibility. Folder and file path segments are normalized and collision-checked. The canonical production rules live in `docs/ASSET_PIPELINE.md` and `docs/GAME_ART_PRODUCTION_PIPELINE.md`.

Operational note: pushes that touch `ops/drive-asset-sync/**` also trigger the sync workflow. This is a safe way to request an immediate import when GitHub's scheduled run is delayed; the importer remains idempotent and skips unchanged asset blobs.
