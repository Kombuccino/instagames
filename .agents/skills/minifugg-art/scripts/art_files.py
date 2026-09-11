#!/usr/bin/env python3
"""Read-only image checks and lossless, unlabelled comparison sheets.

Tooling only. Requires Pillow; no network, OCR, generation, crop, resize or upload.
A technical pass is never an artistic or user approval.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import warnings

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow is required for this local tool: python3 -m pip install Pillow")

MAX_PIXELS = 40_000_000
NEW_FORMATS = {"PNG", "WEBP", "AVIF"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_image(path: Path) -> tuple[Image.Image, str, int]:
    """Validate decoding before returning independent RGBA pixels."""
    with warnings.catch_warnings():
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        with Image.open(path) as source:
            if source.width * source.height > MAX_PIXELS:
                raise ValueError(f"Image exceeds the {MAX_PIXELS} pixel safety limit")
            source.verify()
        with Image.open(path) as source:
            fmt = source.format or "UNKNOWN"
            frames = getattr(source, "n_frames", 1)
            if frames != 1:
                raise ValueError(f"Animated/multi-frame source ({frames} frames); use explicit frames")
            if source.getexif().get(274, 1) != 1:
                raise ValueError("Non-normalized orientation; create an explicit derivative first")
            source.load()
            return source.convert("RGBA"), fmt, frames


def inspect_image(path: Path, *, expected_size: tuple[int, int] | None = None,
                  alpha: str = "any", expected_format: str | None = None,
                  max_bytes: int | None = None, clearance: int = 0) -> dict:
    """Return measurements; never change a source or infer visual correctness."""
    issues: list[str] = []
    result: dict = {"source": str(path), "technical_status": "failed",
                    "visual_status": "not_checked", "issues": issues}
    try:
        image, fmt, frames = read_image(path)
        width, height = image.size
        histogram = image.getchannel("A").histogram()
        total = width * height
        bbox = image.getchannel("A").getbbox()
        result.update({
            "sha256": sha256(path), "format": fmt, "size": [width, height],
            "frames": frames, "bytes": path.stat().st_size,
            "decoded_rgba_bytes_estimate": total * 4,
            "alpha": {"transparent_pixels": histogram[0],
                      "opaque_pixels": histogram[255],
                      "partial_pixels": sum(histogram[1:255])},
            "content_bbox": list(bbox) if bbox else None,
            "clearance": ([bbox[0], bbox[1], width-bbox[2], height-bbox[3]] if bbox else None),
        })
        if fmt not in NEW_FORMATS:
            issues.append(f"{fmt} is not a format for new MiniFugg production")
        if expected_format and fmt != expected_format.upper():
            issues.append(f"Expected {expected_format.upper()}, decoded {fmt}")
        if expected_size and image.size != expected_size:
            issues.append(f"Expected size {expected_size}, measured {image.size}")
        if not bbox:
            issues.append("Image is entirely transparent")
        if alpha == "required" and not histogram[0]:
            issues.append("No fully transparent pixels: isolated surrounding alpha is required")
        if alpha == "opaque" and histogram[255] != total:
            issues.append("Opaque full-frame artwork required")
        if max_bytes is not None and result["bytes"] > max_bytes:
            issues.append(f"File exceeds the selected {max_bytes} byte transport budget")
        if bbox and min(result["clearance"]) < clearance:
            issues.append(f"Content violates the selected {clearance}px clear margin")
        result["technical_status"] = "failed" if issues else "passed"
    except (OSError, ValueError, SyntaxError, RuntimeError, Image.DecompressionBombError,
            Image.DecompressionBombWarning) as exc:
        issues.append(f"Cannot inspect: {exc}")
    return result


def fresh_path(path: Path) -> None:
    if path.exists() or path.is_symlink():
        raise ValueError(f"Refusing to overwrite {path}")
    if not path.parent.is_dir():
        raise ValueError(f"Parent directory does not exist: {path.parent}")


def write_json(path: Path, data: dict) -> None:
    fresh_path(path)
    with path.open("x", encoding="utf-8") as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write("\n")


def assemble(paths: list[Path], output: Path, *, columns: int = 2,
             gap: int = 24, index: Path | None = None) -> dict:
    """Paste independent originals at native size; preserve their RGBA pixels."""
    if not paths or not 1 <= columns <= 64 or not 0 <= gap <= 1024:
        raise ValueError("Require sources, 1..64 columns and 0..1024px gap")
    if output.suffix.lower() != ".png":
        raise ValueError("Comparison output must be PNG")
    index = index or output.with_suffix(".json")
    resolved_sources = {p.resolve() for p in paths}
    if output.resolve() == index.resolve() or any(p.resolve() in resolved_sources for p in (output, index)):
        raise ValueError("Output/index must be separate from one another and all originals")
    fresh_path(output)
    fresh_path(index)
    images: list[Image.Image] = []
    records: list[dict] = []
    total_pixels = 0
    for path in paths:
        record = inspect_image(path)
        if record["technical_status"] != "passed":
            raise ValueError(f"Invalid source {path}: {'; '.join(record['issues'])}")
        total_pixels += record["size"][0] * record["size"][1]
        if total_pixels > MAX_PIXELS:
            raise ValueError("Combined source pixel budget exceeded; split the comparison")
        image, _, _ = read_image(path)
        images.append(image)
        records.append(record)
    profile = images[0].info.get("icc_profile")
    if any(image.info.get("icc_profile") != profile for image in images):
        raise ValueError("Different ICC profiles: make explicit normalized derivatives first")
    cols = min(columns, len(images))
    rows = math.ceil(len(images) / cols)
    cell_w = max(image.width for image in images)
    cell_h = max(image.height for image in images)
    size = (cols * cell_w + (cols + 1) * gap, rows * cell_h + (rows + 1) * gap)
    if size[0] * size[1] > MAX_PIXELS:
        raise ValueError("Sheet exceeds pixel budget; split it, do not silently resize originals")
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    frames = []
    for n, (image, record) in enumerate(zip(images, records)):
        col, row = n % cols, n // cols
        x = gap + col * (cell_w + gap) + (cell_w - image.width) // 2
        y = gap + row * (cell_h + gap) + (cell_h - image.height) // 2
        # No alpha mask: retain original straight-alpha samples, even soft edges.
        canvas.paste(image, (x, y))
        frames.append({"source": record["source"], "sha256": record["sha256"],
                       "frame": [x, y, image.width, image.height]})
    data = {"kind": "comparison_only", "output": str(output), "size": list(size),
            "labels": [], "resized": False, "cropped": False,
            "visual_status": "not_checked", "frames": frames}
    # Exclusive creation protects references even if another process writes meanwhile.
    with output.open("xb") as stream:
        canvas.save(stream, format="PNG", **({"icc_profile": profile} if profile else {}))
    write_json(index, data)
    return data


def positive(value: str) -> int:
    result = int(value)
    if result <= 0:
        raise argparse.ArgumentTypeError("Must be positive")
    return result


def nonnegative(value: str) -> int:
    result = int(value)
    if result < 0:
        raise argparse.ArgumentTypeError("Must be non-negative")
    return result


def size_arg(value: str) -> tuple[int, int]:
    try:
        w, h = value.lower().split("x")
        return positive(w), positive(h)
    except (ValueError, argparse.ArgumentTypeError):
        raise argparse.ArgumentTypeError("Use positive WIDTHxHEIGHT") from None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("inspect", help="Measure files without modifying them")
    check.add_argument("sources", nargs="+", type=Path)
    check.add_argument("--size", type=size_arg)
    check.add_argument("--alpha", choices=("any", "required", "opaque"), default="any")
    check.add_argument("--format", choices=sorted(NEW_FORMATS))
    check.add_argument("--max-bytes", type=positive)
    check.add_argument("--clearance", type=nonnegative, default=0)
    check.add_argument("--report", type=Path)
    sheet = sub.add_parser("assemble", help="Native-size, transparent, unlabelled sheet")
    sheet.add_argument("sources", nargs="+", type=Path)
    sheet.add_argument("--output", required=True, type=Path)
    sheet.add_argument("--index", type=Path)
    sheet.add_argument("--columns", type=positive, default=2)
    sheet.add_argument("--gap", type=nonnegative, default=24)
    args = parser.parse_args(argv)
    try:
        if args.command == "assemble":
            data = assemble(args.sources, args.output, columns=args.columns, gap=args.gap, index=args.index)
            status = 0
        else:
            records = [inspect_image(p, expected_size=args.size, alpha=args.alpha,
                        expected_format=args.format, max_bytes=args.max_bytes,
                        clearance=args.clearance) for p in args.sources]
            data = {"visual_status": "not_checked", "files": records}
            status = int(any(r["technical_status"] != "passed" for r in records))
            if args.report:
                write_json(args.report, data)
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return status
    except (OSError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
