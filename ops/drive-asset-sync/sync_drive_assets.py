#!/usr/bin/env python3
import base64
import fcntl
import hashlib
import io
import json
import logging
import os
import re
import sys
import unicodedata
import warnings
from pathlib import Path
from typing import Any

import requests
from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account
from PIL import Image

DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
EXPECTED_DRIVE_FOLDER_ID = "1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H"
EXPECTED_GITHUB_REPOSITORY = "Kombuccino/instagames"
EXPECTED_GITHUB_BRANCH = "main"
EXPECTED_GITHUB_ASSET_PREFIX = "public/assets/imported"
ALLOWED_MIME_TO_FORMAT = {
    "image/png": ("PNG", ".png"),
    "image/jpeg": ("JPEG", ".jpg"),
    "image/webp": ("WEBP", ".webp"),
}
SAFE_NAME_RE = re.compile(r"[^a-zA-Z0-9._-]+")

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("minifugg-drive-sync")


def env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if value is None or not value.strip():
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value.strip()


def positive_int(name: str, default: int) -> int:
    raw = os.environ.get(name, str(default))
    value = int(raw)
    if value <= 0:
        raise RuntimeError(f"{name} must be > 0")
    return value


def sanitize_filename(original_name: str, canonical_ext: str) -> str:
    stem = Path(original_name).stem
    normalized = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode("ascii")
    normalized = SAFE_NAME_RE.sub("-", normalized).strip("-._").lower()
    if not normalized:
        normalized = "image"
    return f"{normalized[:100]}{canonical_ext}"


def load_state(path: Path) -> dict[str, str]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, dict) else {}
    except FileNotFoundError:
        return {}
    except (json.JSONDecodeError, OSError):
        log.warning("State file unreadable; starting with empty state")
        return {}


def save_state(path: Path, state: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, indent=2, sort_keys=True)
        handle.write("\n")
    os.replace(tmp, path)


def drive_session(credentials_path: str) -> AuthorizedSession:
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=[DRIVE_SCOPE],
    )
    return AuthorizedSession(credentials)


def list_drive_images(session: AuthorizedSession, folder_id: str) -> list[dict[str, Any]]:
    query = f"'{folder_id}' in parents and trashed = false"
    params = {
        "q": query,
        "fields": "nextPageToken,files(id,name,mimeType,size,md5Checksum,modifiedTime)",
        "pageSize": 100,
        "orderBy": "createdTime asc",
        "supportsAllDrives": "true",
        "includeItemsFromAllDrives": "true",
    }
    files: list[dict[str, Any]] = []
    page_token: str | None = None
    while True:
        if page_token:
            params["pageToken"] = page_token
        response = session.get("https://www.googleapis.com/drive/v3/files", params=params, timeout=30)
        response.raise_for_status()
        payload = response.json()
        files.extend(payload.get("files", []))
        page_token = payload.get("nextPageToken")
        if not page_token:
            return files


def download_drive_file(session: AuthorizedSession, file_id: str, max_bytes: int) -> bytes:
    response = session.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}",
        params={"alt": "media", "supportsAllDrives": "true"},
        stream=True,
        timeout=60,
    )
    response.raise_for_status()
    chunks: list[bytes] = []
    total = 0
    for chunk in response.iter_content(chunk_size=1024 * 256):
        if not chunk:
            continue
        total += len(chunk)
        if total > max_bytes:
            raise ValueError(f"Downloaded file exceeds {max_bytes} bytes")
        chunks.append(chunk)
    return b"".join(chunks)


def verify_image(data: bytes, declared_mime: str, max_pixels: int) -> tuple[str, str, int, int]:
    expected_format, canonical_ext = ALLOWED_MIME_TO_FORMAT[declared_mime]
    Image.MAX_IMAGE_PIXELS = max_pixels
    with warnings.catch_warnings():
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        with Image.open(io.BytesIO(data)) as image:
            actual_format = (image.format or "").upper()
            width, height = image.size
            image.verify()
    if actual_format != expected_format:
        raise ValueError(f"Declared MIME {declared_mime} does not match decoded format {actual_format}")
    if width <= 0 or height <= 0 or width * height > max_pixels:
        raise ValueError(f"Image dimensions rejected: {width}x{height}")
    return actual_format, canonical_ext, width, height


def github_headers(token: str) -> dict[str, str]:
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "minifugg-drive-asset-sync/1.0",
    }


def github_existing_sha(owner_repo: str, path: str, branch: str, token: str) -> str | None:
    url = f"https://api.github.com/repos/{owner_repo}/contents/{path}"
    response = requests.get(url, headers=github_headers(token), params={"ref": branch}, timeout=30)
    if response.status_code == 404:
        return None
    response.raise_for_status()
    payload = response.json()
    if payload.get("type") != "file":
        raise RuntimeError(f"GitHub path is not a file: {path}")
    return payload.get("sha")


def github_put_image(owner_repo: str, path: str, branch: str, token: str, data: bytes, source_name: str) -> None:
    url = f"https://api.github.com/repos/{owner_repo}/contents/{path}"
    current_sha = github_existing_sha(owner_repo, path, branch, token)
    payload: dict[str, Any] = {
        "message": f"assets: sync {source_name} from Drive",
        "content": base64.b64encode(data).decode("ascii"),
        "branch": branch,
    }
    if current_sha:
        payload["sha"] = current_sha
    response = requests.put(url, headers=github_headers(token), json=payload, timeout=90)
    response.raise_for_status()


def fingerprint(file_info: dict[str, Any], data: bytes | None = None) -> str:
    checksum = file_info.get("md5Checksum")
    if checksum:
        return f"md5:{checksum}"
    if data is not None:
        return "sha256:" + hashlib.sha256(data).hexdigest()
    return f"modified:{file_info.get('modifiedTime', '')}:size:{file_info.get('size', '')}"


def main() -> int:
    folder_id = env("DRIVE_FOLDER_ID")
    credentials_path = env("GOOGLE_SERVICE_ACCOUNT_JSON", "/etc/minifugg-drive-sync/service-account.json")
    github_token = env("GITHUB_TOKEN")
    github_repository = env("GITHUB_REPOSITORY", EXPECTED_GITHUB_REPOSITORY)
    github_branch = env("GITHUB_BRANCH", EXPECTED_GITHUB_BRANCH)
    github_prefix = env("GITHUB_ASSET_PREFIX", EXPECTED_GITHUB_ASSET_PREFIX).strip("/")
    state_path = Path(env("STATE_FILE", "/var/lib/minifugg-drive-sync/state.json"))
    lock_path = Path(env("LOCK_FILE", "/var/lib/minifugg-drive-sync/sync.lock"))
    max_bytes = positive_int("MAX_FILE_BYTES", 10 * 1024 * 1024)
    max_pixels = positive_int("MAX_IMAGE_PIXELS", 40_000_000)

    # Deliberately hard-coded safety boundaries: environment variables cannot redirect the sync.
    if folder_id != EXPECTED_DRIVE_FOLDER_ID:
        raise RuntimeError("DRIVE_FOLDER_ID is intentionally locked to the MiniFugg Fugg folder")
    if github_repository != EXPECTED_GITHUB_REPOSITORY:
        raise RuntimeError("GITHUB_REPOSITORY is intentionally locked to Kombuccino/instagames")
    if github_branch != EXPECTED_GITHUB_BRANCH:
        raise RuntimeError("GITHUB_BRANCH is intentionally locked to main")
    if github_prefix != EXPECTED_GITHUB_ASSET_PREFIX:
        raise RuntimeError("GITHUB_ASSET_PREFIX is intentionally locked to public/assets/imported")

    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open("w", encoding="utf-8") as lock_handle:
        try:
            fcntl.flock(lock_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            log.info("Another sync is already running; exiting")
            return 0

        session = drive_session(credentials_path)
        state = load_state(state_path)
        changed = False
        seen_targets: dict[str, str] = {}

        for item in list_drive_images(session, folder_id):
            file_id = str(item.get("id", ""))
            name = str(item.get("name", ""))
            mime = str(item.get("mimeType", ""))
            size_raw = item.get("size")

            if not file_id or not name:
                continue
            if mime not in ALLOWED_MIME_TO_FORMAT:
                log.warning("Skipping %s: MIME %s is not allowed", name, mime)
                continue
            if size_raw is not None and int(size_raw) > max_bytes:
                log.warning("Skipping %s: %s bytes exceeds limit", name, size_raw)
                continue

            quick_fp = fingerprint(item)
            if state.get(file_id) == quick_fp and item.get("md5Checksum"):
                continue

            try:
                data = download_drive_file(session, file_id, max_bytes)
                _, canonical_ext, width, height = verify_image(data, mime, max_pixels)
                final_fp = fingerprint(item, data)
                if state.get(file_id) == final_fp:
                    continue

                safe_name = sanitize_filename(name, canonical_ext)
                previous_id = seen_targets.get(safe_name)
                if previous_id and previous_id != file_id:
                    raise ValueError(f"Filename collision after sanitization: {safe_name}")
                seen_targets[safe_name] = file_id
                github_path = f"{github_prefix}/{safe_name}"
                github_put_image(github_repository, github_path, github_branch, github_token, data, safe_name)
                state[file_id] = final_fp
                changed = True
                log.info("Synced %s (%dx%d, %d bytes) -> %s", name, width, height, len(data), github_path)
            except Exception as exc:
                log.exception("Failed to sync %s: %s", name, exc)

        if changed:
            save_state(state_path, state)
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        log.error("Fatal error: %s", exc)
        raise
