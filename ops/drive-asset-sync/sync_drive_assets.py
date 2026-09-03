#!/usr/bin/env python3
import base64
import fcntl
import hashlib
import io
import json
import logging
import os
import re
import unicodedata
import warnings
from collections import deque
from pathlib import Path
from typing import Any

import google.auth
import requests
from google.auth.transport.requests import AuthorizedSession
from PIL import Image

DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
EXPECTED_DRIVE_FOLDER_ID = "1o7YIB4qEPYNJvOI9yPr_6tUPEW3dDF0H"
EXPECTED_GITHUB_REPOSITORY = "Kombuccino/instagames"
EXPECTED_GITHUB_BRANCH = "main"
EXPECTED_GITHUB_ASSET_PREFIX = "public/assets/imported"
DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder"
MAX_FOLDER_DEPTH = 8
MAX_FOLDER_COUNT = 500
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
    value = int(os.environ.get(name, str(default)))
    if value <= 0:
        raise RuntimeError(f"{name} must be > 0")
    return value


def normalize_name(value: str, fallback: str, max_length: int) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    normalized = SAFE_NAME_RE.sub("-", normalized).strip("-._").lower()
    if not normalized:
        normalized = fallback
    return normalized[:max_length]


def sanitize_folder_name(name: str) -> str:
    return normalize_name(name, "folder", 80)


def sanitize_filename(original_name: str, canonical_ext: str) -> str:
    stem = normalize_name(Path(original_name).stem, "image", 100)
    return f"{stem}{canonical_ext}"


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


def drive_session() -> AuthorizedSession:
    credentials, _ = google.auth.default(scopes=[DRIVE_SCOPE])
    return AuthorizedSession(credentials)


def list_drive_children(session: AuthorizedSession, folder_id: str) -> list[dict[str, Any]]:
    params: dict[str, Any] = {
        "q": f"'{folder_id}' in parents and trashed = false",
        "fields": "nextPageToken,files(id,name,mimeType,size,md5Checksum,modifiedTime)",
        "pageSize": 100,
        "orderBy": "createdTime asc",
        "supportsAllDrives": "true",
        "includeItemsFromAllDrives": "true",
    }
    items: list[dict[str, Any]] = []
    page_token: str | None = None
    while True:
        if page_token:
            params["pageToken"] = page_token
        elif "pageToken" in params:
            del params["pageToken"]
        response = session.get("https://www.googleapis.com/drive/v3/files", params=params, timeout=30)
        response.raise_for_status()
        payload = response.json()
        items.extend(payload.get("files", []))
        page_token = payload.get("nextPageToken")
        if not page_token:
            return items


def walk_drive_files(session: AuthorizedSession, root_folder_id: str) -> list[dict[str, Any]]:
    queue: deque[tuple[str, tuple[str, ...], int]] = deque([(root_folder_id, tuple(), 0)])
    visited_folder_ids: set[str] = set()
    normalized_folder_paths: dict[str, str] = {"": root_folder_id}
    files: list[dict[str, Any]] = []

    while queue:
        folder_id, relative_parts, depth = queue.popleft()
        if folder_id in visited_folder_ids:
            continue
        visited_folder_ids.add(folder_id)
        if len(visited_folder_ids) > MAX_FOLDER_COUNT:
            raise RuntimeError(f"Drive tree exceeds safety limit of {MAX_FOLDER_COUNT} folders")

        for item in list_drive_children(session, folder_id):
            item_id = str(item.get("id", ""))
            name = str(item.get("name", ""))
            mime = str(item.get("mimeType", ""))
            if not item_id or not name:
                continue

            if mime == DRIVE_FOLDER_MIME:
                if depth >= MAX_FOLDER_DEPTH:
                    log.warning("Skipping folder deeper than %d levels: %s", MAX_FOLDER_DEPTH, name)
                    continue
                safe_segment = sanitize_folder_name(name)
                next_parts = (*relative_parts, safe_segment)
                normalized_path = "/".join(next_parts)
                previous_id = normalized_folder_paths.get(normalized_path)
                if previous_id and previous_id != item_id:
                    raise RuntimeError(f"Drive folder collision after normalization: {normalized_path}")
                normalized_folder_paths[normalized_path] = item_id
                queue.append((item_id, next_parts, depth + 1))
                continue

            item["_relative_dir"] = "/".join(relative_parts)
            files.append(item)

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
        "User-Agent": "minifugg-drive-asset-sync/3.0",
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


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def github_put_image(owner_repo: str, path: str, branch: str, token: str, data: bytes, source_path: str) -> bool:
    url = f"https://api.github.com/repos/{owner_repo}/contents/{path}"
    current_sha = github_existing_sha(owner_repo, path, branch, token)
    expected_sha = git_blob_sha(data)
    if current_sha == expected_sha:
        log.info("Already identical in GitHub: %s", path)
        return False

    payload: dict[str, Any] = {
        "message": f"assets: sync {source_path} from Drive",
        "content": base64.b64encode(data).decode("ascii"),
        "branch": branch,
    }
    if current_sha:
        payload["sha"] = current_sha
    response = requests.put(url, headers=github_headers(token), json=payload, timeout=90)
    response.raise_for_status()
    return True


def fingerprint(file_info: dict[str, Any], relative_path: str, data: bytes | None = None) -> str:
    checksum = file_info.get("md5Checksum")
    if checksum:
        identity = f"md5:{checksum}"
    elif data is not None:
        identity = "sha256:" + hashlib.sha256(data).hexdigest()
    else:
        identity = f"modified:{file_info.get('modifiedTime', '')}:size:{file_info.get('size', '')}"
    return f"path:{relative_path}|{identity}"


def main() -> int:
    folder_id = env("DRIVE_FOLDER_ID", EXPECTED_DRIVE_FOLDER_ID)
    github_token = env("GITHUB_TOKEN")
    github_repository = env("GITHUB_REPOSITORY", EXPECTED_GITHUB_REPOSITORY)
    github_branch = env("GITHUB_BRANCH", EXPECTED_GITHUB_BRANCH)
    github_prefix = env("GITHUB_ASSET_PREFIX", EXPECTED_GITHUB_ASSET_PREFIX).strip("/")
    state_path = Path(env("STATE_FILE", "/tmp/minifugg-drive-sync-state.json"))
    lock_path = Path(env("LOCK_FILE", "/tmp/minifugg-drive-sync.lock"))
    max_bytes = positive_int("MAX_FILE_BYTES", 10 * 1024 * 1024)
    max_pixels = positive_int("MAX_IMAGE_PIXELS", 40_000_000)

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

        session = drive_session()
        state = load_state(state_path)
        changed = False
        seen_targets: dict[str, str] = {}

        for item in walk_drive_files(session, folder_id):
            file_id = str(item.get("id", ""))
            name = str(item.get("name", ""))
            mime = str(item.get("mimeType", ""))
            relative_dir = str(item.get("_relative_dir", "")).strip("/")
            size_raw = item.get("size")

            if not file_id or not name:
                continue
            source_path = f"{relative_dir}/{name}" if relative_dir else name
            if mime not in ALLOWED_MIME_TO_FORMAT:
                log.warning("Skipping %s: MIME %s is not allowed", source_path, mime)
                continue
            if size_raw is not None and int(size_raw) > max_bytes:
                log.warning("Skipping %s: %s bytes exceeds limit", source_path, size_raw)
                continue

            try:
                _, canonical_ext = ALLOWED_MIME_TO_FORMAT[mime]
                safe_name = sanitize_filename(name, canonical_ext)
                relative_path = f"{relative_dir}/{safe_name}" if relative_dir else safe_name

                previous_id = seen_targets.get(relative_path)
                if previous_id and previous_id != file_id:
                    raise ValueError(f"File collision after path normalization: {relative_path}")
                seen_targets[relative_path] = file_id

                quick_fp = fingerprint(item, relative_path)
                if state.get(file_id) == quick_fp and item.get("md5Checksum"):
                    continue

                data = download_drive_file(session, file_id, max_bytes)
                _, canonical_ext, width, height = verify_image(data, mime, max_pixels)
                safe_name = sanitize_filename(name, canonical_ext)
                relative_path = f"{relative_dir}/{safe_name}" if relative_dir else safe_name
                final_fp = fingerprint(item, relative_path, data)

                github_path = f"{github_prefix}/{relative_path}"
                uploaded = github_put_image(github_repository, github_path, github_branch, github_token, data, source_path)
                state[file_id] = final_fp
                changed = changed or uploaded
                if uploaded:
                    log.info("Synced %s (%dx%d, %d bytes) -> %s", source_path, width, height, len(data), github_path)
            except Exception as exc:
                log.exception("Failed to sync %s: %s", source_path, exc)

        save_state(state_path, state)
        if not changed:
            log.info("No GitHub asset changes needed")
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        log.error("Fatal error: %s", exc)
        raise
