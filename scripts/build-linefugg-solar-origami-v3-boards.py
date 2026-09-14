from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path("public/assets/generated/linefugg/solar-origami-v3")
SOURCES = ROOT / "sources"
MASTERS = ROOT / "masters"
COMPONENTS = ROOT / "components"
PREVIEWS = ROOT / "previews"


def chroma_to_alpha(path: Path) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    border = np.concatenate((rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)))
    background = np.median(border, axis=0)
    scale = np.maximum(background, 255 - background)
    distance = np.max(np.abs(rgb - background) / np.maximum(scale, 1), axis=2)
    alpha = np.clip((distance - 0.025) / 0.94, 0, 1)
    alpha = alpha * alpha * (3 - 2 * alpha)
    safe_alpha = np.maximum(alpha[..., None], 1 / 255)
    foreground = (rgb - (1 - alpha[..., None]) * background) / safe_alpha
    rgba = np.concatenate((np.clip(foreground, 0, 255), (alpha * 255)[..., None]), axis=2).astype(np.uint8)
    rgba[rgba[..., 3] == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def trim(image: Image.Image, padding: int = 16) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 4 else 0).getbbox()
    if bbox is None:
        raise ValueError("empty alpha image")
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def save_component(name: str, image: Image.Image) -> dict[str, object]:
    path = COMPONENTS / f"{name}-v3.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    cleaned = trim(image)
    cleaned.save(path, optimize=True)
    return {"name": name, "path": path.as_posix(), "size": list(cleaned.size)}


def split_grid(image: Image.Image, names: list[str], columns: int, rows: int) -> list[dict[str, object]]:
    result = []
    for index, name in enumerate(names):
        column = index % columns
        row = index // columns
        left = round(column * image.width / columns)
        right = round((column + 1) * image.width / columns)
        top = round(row * image.height / rows)
        bottom = round((row + 1) * image.height / rows)
        result.append(save_component(name, image.crop((left, top, right, bottom))))
    return result


def fit(image: Image.Image, width: int, height: int) -> Image.Image:
    ratio = min(width / image.width, height / image.height)
    return image.resize((max(1, round(image.width * ratio)), max(1, round(image.height * ratio))), Image.Resampling.LANCZOS)


def assemble_celestial(images: list[Image.Image]) -> Image.Image:
    board = Image.new("RGBA", (2048, 2048))
    slots = [(0, 0, 680, 680), (684, 0, 680, 680), (1368, 0, 680, 680),
             (0, 684, 680, 680), (684, 684, 680, 680), (1368, 684, 680, 680),
             (512, 1368, 1024, 680)]
    for source, (x, y, width, height) in zip(images, slots):
        fitted = fit(trim(source), width - 32, height - 32)
        board.alpha_composite(fitted, (x + (width - fitted.width) // 2, y + (height - fitted.height) // 2))
    return board


def preview(image: Image.Image, path: Path) -> None:
    backdrop = Image.new("RGBA", image.size, (4, 18, 35, 255))
    backdrop.alpha_composite(image)
    backdrop.convert("RGB").save(path, optimize=True)


def main() -> None:
    for folder in (MASTERS, COMPONENTS, PREVIEWS):
        folder.mkdir(parents=True, exist_ok=True)

    source_names = {
        "cells": "cell-states-chroma-v3.png",
        "glyphs": "gameplay-glyphs-chroma-v3.png",
        "energy": "energy-modules-chroma-v3.png",
        "controls": "control-states-chroma-v3.png",
    }
    sheets = {name: chroma_to_alpha(SOURCES / filename) for name, filename in source_names.items()}
    for name, image in sheets.items():
        image.save(MASTERS / f"{name}-alpha-v3.png", optimize=True)
        preview(image, PREVIEWS / f"{name}-on-navy-v3.png")

    celestial_names = [
        "astre-violet-active", "astre-red-active", "astre-yellow-active",
        "astre-violet-inactive", "astre-red-inactive", "astre-yellow-inactive",
        "sun-neutral",
    ]
    celestial = [chroma_to_alpha(SOURCES / f"{name}-chroma-v3.png") for name in celestial_names]
    board = assemble_celestial(celestial)
    board.save(MASTERS / "celestial-alpha-v3.png", optimize=True)
    preview(board, PREVIEWS / "celestial-on-navy-v3.png")

    inventory: list[dict[str, object]] = []
    for name, image in zip(celestial_names, celestial):
        inventory.append(save_component(f"celestial/{name}", image))
    inventory += split_grid(sheets["cells"], ["cell/neutral", "cell/selected-red", "cell/selected-violet", "cell/selected-yellow"], 4, 1)
    inventory += split_grid(sheets["glyphs"], [
        "glyph/0", "glyph/1", "glyph/2", "glyph/3", "glyph/4", "glyph/5", "glyph/6", "glyph/7",
        "glyph/8", "glyph/9", "glyph/minus", "glyph/plus", "glyph/times", "glyph/divide", "glyph/dot", "glyph/equals",
    ], 4, 4)
    energy_names = []
    for color in ("red", "violet", "yellow"):
        energy_names.extend([f"energy/{color}-{kind}" for kind in ("straight", "diagonal", "curve-45", "curve-90", "start", "arrival", "pulse")])
    inventory += split_grid(sheets["energy"], energy_names, 7, 3)
    inventory += split_grid(sheets["controls"], ["control/undo-idle", "control/undo-pressed", "control/validate-disabled", "control/validate-ready"], 2, 2)

    payload = {
        "version": 3,
        "reference": "references/linefugg-da-validated-2026-09-14.png",
        "method": "ImageGen on measured pure-green chroma source, deterministic local alpha unmix, trim, then mechanical assembly",
        "textAllowlist": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "+", "×", "÷", ".", "=", "UNDO", "VALIDATE"],
        "components": inventory,
    }
    (ROOT / "solar-origami-v3-inventory.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
