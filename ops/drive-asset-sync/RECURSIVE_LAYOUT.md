# Recursive Drive layout

The importer mirrors the hierarchy below the private Drive folder `Fugg` into `public/assets/imported/`.

Example:

`Fugg/tetramindfck/welcome/parallax/v1/bg.webp`

becomes:

`public/assets/imported/tetramindfck/welcome/parallax/v1/bg.webp`

Root-level files remain supported for backward compatibility. Folder and file path segments are normalized and collision-checked. The canonical production rules live in `docs/ASSET_PIPELINE.md`.

Operational note: pushes that touch `ops/drive-asset-sync/**` also trigger the sync workflow. This is a safe way to request an immediate import when GitHub's scheduled run is delayed; the importer remains idempotent and skips unchanged asset blobs.
