# MiniFugg image asset pipeline

This is the canonical pipeline for moving image assets created or prepared in ChatGPT into the MiniFugg repository.

## Source folder

Use the Google Drive folder `Fugg` as the upload inbox.

Drive folder ID:

`1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H`

When a conversation creates or prepares an image asset that should enter the product, upload the final file to this Drive folder. Do not make the Drive folder public.

## Accepted files

The automatic importer accepts only:

- PNG
- JPEG
- WebP

Limits:

- maximum file size: 10 MiB
- maximum decoded image size: 40,000,000 pixels
- SVG and other executable/active formats are intentionally rejected

Use a unique, descriptive filename. Filenames are normalized to lowercase ASCII with letters, numbers, `.`, `_` and `-`. Avoid relying on accents, spaces or punctuation to distinguish files.

## Automatic sync

GitHub Actions workflow:

`.github/workflows/drive-asset-sync.yml`

The workflow runs every 10 minutes and can also be started manually. It authenticates to Google using Workload Identity Federation. There is no Google service-account JSON key and no permanent Google credential stored in GitHub or on the VPS.

Google service account:

`minifugg-assets@minifugg-assets.iam.gserviceaccount.com`

Workload Identity provider:

`projects/484757798037/locations/global/workloadIdentityPools/github-actions/providers/instagames`

The Google identity is restricted to the immutable GitHub repository ID `1352769382` and the `main` branch.

## Destination

Validated images are committed automatically to:

`public/assets/imported/`

The public application URL is therefore:

`/assets/imported/<normalized-filename>`

Example:

Drive file:

`minifugg-home-original.png`

becomes:

`public/assets/imported/minifugg-home-original.png`

and is referenced in the application as:

`/assets/imported/minifugg-home-original.png`

## Required behavior for AI/game-development conversations

When the user asks to create an image that should be integrated into MiniFugg:

1. Generate or prepare the final image.
2. Give it a unique production filename before uploading it.
3. Upload that final image to the root of the Drive folder `Fugg` using the connected Google Drive tool.
4. Do not attempt binary GitHub uploads, base64 chunking, FTP, public Drive links or manual user upload when this pipeline is available.
5. Once the sync has run, verify the expected file exists under `public/assets/imported/` in `Kombuccino/instagames` before referencing it from code.
6. Reference only the repository-served `/assets/imported/...` URL in the application. Never hotlink the Google Drive file.
7. If the asset must be available immediately, check or trigger the GitHub Actions workflow when tooling permits; otherwise tell the user the normal sync interval is up to 10 minutes.
8. Keep source/original files lossless unless the user explicitly asks for optimization. Do not silently resize or recompress production artwork.

## Security boundaries

The importer validates the decoded image format, rejects non-image/unsupported MIME types, file-size excesses, decompression bombs and unsafe filename/path input. Repository, branch, Drive folder and GitHub destination prefix are hard-locked in the importer.

The Drive folder remains private. The application never fetches assets from Google Drive at runtime.
