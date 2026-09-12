from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
VARIANTS = ROOT / "public/assets/generated/crazy-papers/welcome/variants"
SOURCES = VARIANTS / "sources"
MASTERS = VARIANTS / "masters"
RUNTIME = VARIANTS / "runtime"

EDITIONS = (
    ("v1-pulp-disaster-source.png", "v1-pulp-disaster-master.png", "v1-pulp-disaster.webp"),
    ("v2-micro-records-source.png", "v2-micro-records-master.png", "v2-micro-records.webp"),
    ("v3-graphic-collapse-source.png", "v3-graphic-collapse-master.png", "v3-graphic-collapse.webp"),
    ("v4-pulp-clerk-source.png", "v4-pulp-clerk-master.png", "v4-pulp-clerk.webp"),
    ("v5-constructivist-clerk-source.png", "v5-constructivist-clerk-master.png", "v5-constructivist-clerk.webp"),
    ("v6-showa-paper-wave-source.png", "v6-showa-paper-wave-master.png", "v6-showa-paper-wave.webp"),
)

SOURCE_SIZE = (853, 1844)
MASTER_SIZE = (390, 844)
RUNTIME_SIZE = (780, 1688)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_derivative(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    source_width, source_height = source.size
    target_ratio = size[0] / size[1]
    crop_width = source_height * target_ratio
    left = (source_width - crop_width) / 2
    box = (left, 0.0, left + crop_width, float(source_height))
    return source.resize(size, Image.Resampling.LANCZOS, box=box)


def main() -> None:
    MASTERS.mkdir(parents=True, exist_ok=True)
    RUNTIME.mkdir(parents=True, exist_ok=True)
    report: list[dict[str, object]] = []

    for source_name, master_name, runtime_name in EDITIONS:
        source_path = SOURCES / source_name
        master_path = MASTERS / master_name
        runtime_path = RUNTIME / runtime_name

        with Image.open(source_path) as opened:
            opened.load()
            if opened.size != SOURCE_SIZE:
                raise ValueError(f"{source_name}: expected {SOURCE_SIZE}, got {opened.size}")
            source = opened.convert("RGB")

        master = build_derivative(source, MASTER_SIZE)
        runtime = build_derivative(source, RUNTIME_SIZE)
        master.save(master_path, format="PNG", optimize=True)
        runtime.save(runtime_path, format="WEBP", lossless=True, method=6, exact=True)

        report.append(
            {
                "source": source_path.relative_to(ROOT).as_posix(),
                "source_sha256": sha256(source_path),
                "source_size": SOURCE_SIZE,
                "master": master_path.relative_to(ROOT).as_posix(),
                "master_sha256": sha256(master_path),
                "master_size": MASTER_SIZE,
                "runtime": runtime_path.relative_to(ROOT).as_posix(),
                "runtime_sha256": sha256(runtime_path),
                "runtime_size": RUNTIME_SIZE,
                "horizontal_crop_source_pixels": 853 - (1844 * 390 / 844),
            }
        )

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
