# MiniFugg Drive -> GitHub image sync

MiniFugg uses a deliberately narrow, keyless import pipeline:

`ChatGPT -> private Google Drive folder Fugg -> GitHub Actions -> public/assets/imported/`

There is no public upload endpoint, no FTP, no VPS listener, no Google JSON key, and no long-lived GitHub token.

## Google identity

Service account:

`minifugg-assets@minifugg-assets.iam.gserviceaccount.com`

Drive folder:

`Fugg` (`1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H`)

Share the `Fugg` folder with the service-account email as **Viewer** only. This gives the machine identity read access to that folder without granting access to the rest of the user's Drive.

Do **not** disable the organization policy that blocks service-account key creation. No JSON service-account key is required.

## Keyless authentication

GitHub Actions authenticates to Google using OpenID Connect and Google Cloud Workload Identity Federation. Google issues temporary credentials for the service account. There is no permanent Google credential stored in GitHub or on a VPS.

The Google provider must only trust:

- GitHub repository numeric ID `1352769382` (`Kombuccino/instagames`)
- branch `refs/heads/main`

The numeric repository ID is intentional: unlike the repository name, GitHub does not reuse it.

## One-time Google Cloud setup

Project: `minifugg-assets`

Open Google Cloud Shell while the `minifugg-assets` project is selected and run:

```bash
set -euo pipefail

PROJECT_ID='minifugg-assets'
SERVICE_ACCOUNT='minifugg-assets@minifugg-assets.iam.gserviceaccount.com'
POOL_ID='github-actions'
PROVIDER_ID='instagames'
REPOSITORY_ID='1352769382'

# Required APIs. This leaves service-account key creation disabled.
gcloud services enable \
  drive.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project="$PROJECT_ID"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

# Create the GitHub workload identity pool.
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --display-name='MiniFugg GitHub Actions'

# Trust only this immutable GitHub repository ID and main branch.
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --workload-identity-pool="$POOL_ID" \
  --display-name='Kombuccino instagames' \
  --issuer-uri='https://token.actions.githubusercontent.com/' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref' \
  --attribute-condition="assertion.repository_id=='${REPOSITORY_ID}' && assertion.ref=='refs/heads/main'"

# Permit only that federated repository identity to impersonate the service account.
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" \
  --role='roles/iam.workloadIdentityUser' \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository_id/${REPOSITORY_ID}"

# Print the non-secret provider identifier needed by the GitHub workflow.
gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location='global' \
  --workload-identity-pool="$POOL_ID" \
  --format='value(name)'
```

The final line looks like:

`projects/123456789012/locations/global/workloadIdentityPools/github-actions/providers/instagames`

It is **not a secret**. It can safely be committed into the workflow.

## GitHub workflow

`.github/workflows/drive-asset-sync.yml` runs every 10 minutes and can also be launched manually. It has only:

- `id-token: write` so GitHub can mint the short-lived OIDC identity;
- `contents: write` so the workflow's own short-lived `GITHUB_TOKEN` can add validated images to this repository.

No personal access token is stored.

## Asset validation

The importer:

- is hard-locked to Drive folder `1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H`;
- is hard-locked to `Kombuccino/instagames`, branch `main`;
- writes only to `public/assets/imported/`;
- accepts only PNG, JPEG and WebP;
- decodes the image and verifies the actual format instead of trusting the filename;
- rejects files over 10 MiB;
- rejects images over 40 million pixels and decompression-bomb warnings;
- sanitizes filenames;
- never executes uploaded content;
- compares the image with the existing Git blob and does not create duplicate commits for unchanged files.

The current original home image should ultimately be imported as:

`public/assets/imported/minifugg-home-original.png`

## Security model

The Drive folder remains private. ChatGPT can add assets through the user's connected Drive. The service account can only read files explicitly shared with it. GitHub proves its repository identity to Google using an OIDC token, and Google returns short-lived credentials. The GitHub workflow also uses an automatically expiring repository token.

There are therefore no permanent Google or GitHub credentials to steal from a VPS, and this pipeline opens no inbound network service anywhere.
