# Recursive Drive layout

The importer mirrors the hierarchy below the private Drive folder `Fugg` into `public/assets/imported/`.

Example:

`Fugg/tetramindfck/welcome/parallax/v1/bg.webp`

becomes:

`public/assets/imported/tetramindfck/welcome/parallax/v1/bg.webp`

Root-level files remain supported for backward compatibility. Folder and file path segments are normalized and collision-checked. The canonical production rules live in `docs/ASSET_PIPELINE.md`.
