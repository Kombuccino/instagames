# MiniFugg Drive -> GitHub image sync

This helper is intentionally narrow. It reads images from one Google Drive folder and writes them only to `public/assets/imported/` in `Kombuccino/instagames`.

It does **not** expose a web server, open a VPS port, execute uploaded files, accept URLs, delete Drive files, or write outside the imported-assets directory.

## What is a Google service account?

A service account is a Google identity for a machine instead of a human. It gets an email address such as:

`minifugg-assets@my-project.iam.gserviceaccount.com`

Share the Drive folder `Fugg` with that email as **Viewer**. The service account then sees only content explicitly shared with it; it does not need access to your whole personal Drive.

The VPS authenticates as that machine identity using a JSON key stored only on the VPS. Never commit that JSON file to GitHub.

## Google setup

1. Open Google Cloud Console and create/select a small project, for example `MiniFugg Assets`.
2. Enable **Google Drive API** for that project.
3. Go to **IAM & Admin -> Service Accounts** and create `minifugg-assets`.
4. The service account needs no broad Google Cloud role for this job.
5. Open the service account -> **Keys -> Add key -> Create new key -> JSON** and download the JSON key once.
6. In Google Drive, share the `Fugg` folder with the service account email as **Viewer** only.
7. Keep the JSON key private. It will be copied to `/etc/minifugg-drive-sync/service-account.json` on the VPS with restrictive permissions.

Drive folder currently used by MiniFugg:

`1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H`

## GitHub token

Create a **fine-grained personal access token** dedicated to this sync:

- Resource owner: the owner of `Kombuccino/instagames`
- Repository access: **Only select repositories -> `instagames`**
- Repository permission: **Contents: Read and write**
- Everything else: no access unless GitHub requires metadata read automatically
- Give it an expiry date and rotate it periodically

Treat this token like a password. It belongs only in `/etc/minifugg-drive-sync/env` on the VPS.

## VPS install

These commands assume Debian/Ubuntu and root access.

```bash
apt update
apt install -y python3 python3-venv ca-certificates

useradd --system --home /nonexistent --shell /usr/sbin/nologin minifugg-sync || true
install -d -o root -g minifugg-sync -m 0750 /etc/minifugg-drive-sync
install -d -o minifugg-sync -g minifugg-sync -m 0750 /var/lib/minifugg-drive-sync
install -d -o root -g root -m 0755 /opt/minifugg-drive-sync

curl -fsSL https://raw.githubusercontent.com/Kombuccino/instagames/main/ops/drive-asset-sync/sync_drive_assets.py \
  -o /opt/minifugg-drive-sync/sync_drive_assets.py
curl -fsSL https://raw.githubusercontent.com/Kombuccino/instagames/main/ops/drive-asset-sync/requirements.txt \
  -o /opt/minifugg-drive-sync/requirements.txt

python3 -m venv /opt/minifugg-drive-sync/venv
/opt/minifugg-drive-sync/venv/bin/pip install --no-cache-dir -r /opt/minifugg-drive-sync/requirements.txt
chmod 0755 /opt/minifugg-drive-sync/sync_drive_assets.py
```

Copy the Google JSON key to:

```text
/etc/minifugg-drive-sync/service-account.json
```

Then:

```bash
chown root:minifugg-sync /etc/minifugg-drive-sync/service-account.json
chmod 0640 /etc/minifugg-drive-sync/service-account.json
```

Create `/etc/minifugg-drive-sync/env` from `env.example`, replace `GITHUB_TOKEN`, then protect it:

```bash
chown root:minifugg-sync /etc/minifugg-drive-sync/env
chmod 0640 /etc/minifugg-drive-sync/env
```

Install the service and timer:

```bash
curl -fsSL https://raw.githubusercontent.com/Kombuccino/instagames/main/ops/drive-asset-sync/minifugg-drive-sync.service \
  -o /etc/systemd/system/minifugg-drive-sync.service
curl -fsSL https://raw.githubusercontent.com/Kombuccino/instagames/main/ops/drive-asset-sync/minifugg-drive-sync.timer \
  -o /etc/systemd/system/minifugg-drive-sync.timer

systemctl daemon-reload
systemctl enable --now minifugg-drive-sync.timer
```

Test immediately:

```bash
systemctl start minifugg-drive-sync.service
journalctl -u minifugg-drive-sync.service -n 100 --no-pager
```

The current original home image should appear as:

`public/assets/imported/minifugg-home-original.png`

## Security boundaries

The script:

- requests Google scope `drive.readonly` only;
- only sees Drive files shared with the service account;
- accepts only PNG, JPEG and WebP MIME types;
- decodes each image with Pillow and verifies declared MIME against actual image format;
- rejects images over 10 MiB;
- rejects images over 40 million pixels and Pillow decompression-bomb warnings;
- sanitizes filenames to ASCII `a-z`, numbers, `.`, `_`, `-`;
- hard-locks GitHub writes to `public/assets/imported/` even if environment variables are changed;
- never executes uploaded content;
- keeps a local file-ID/checksum state so unchanged images are not recommitted;
- uses a file lock so two timer runs cannot overlap;
- runs as the unprivileged `minifugg-sync` system user;
- uses systemd sandboxing and can only write to `/var/lib/minifugg-drive-sync` locally;
- exposes no TCP/HTTP listener and therefore adds no new inbound VPS port.

## Remaining risk

The GitHub token necessarily has `Contents: write` on the selected repository. If an attacker already compromises the VPS enough to steal that token, GitHub itself cannot restrict a personal access token to one repository subdirectory. The main mitigations are: repository-only fine-grained token, restrictive file permissions, unprivileged service, systemd sandboxing, no inbound network service, short token lifetime, and token rotation.

If MiniFugg later needs a stronger trust boundary, replace the PAT with a GitHub App plus a validation workflow. That is deliberately not part of this first simple version.
