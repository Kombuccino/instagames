from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


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


def review_id(name: str, counters: dict[str, int]) -> str:
    if name.startswith("celestial/"):
        prefix = "AST"
    elif name.startswith("cell/"):
        prefix = "CEL"
    elif name.startswith("glyph/"):
        prefix = "GLY"
    elif name.startswith("energy/red-"):
        prefix = "ENG-R"
    elif name.startswith("energy/violet-"):
        prefix = "ENG-V"
    elif name.startswith("energy/yellow-"):
        prefix = "ENG-Y"
    else:
        prefix = "CTL"
    counters[prefix] = counters.get(prefix, 0) + 1
    return f"{prefix}-{counters[prefix]:02d}"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    filename = "arialbd.ttf" if bold else "arial.ttf"
    path = Path("C:/Windows/Fonts") / filename
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


def checkerboard(width: int, height: int, square: int = 24) -> Image.Image:
    image = Image.new("RGBA", (width, height), (31, 45, 60, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, height, square):
        for x in range(0, width, square):
            if (x // square + y // square) % 2:
                draw.rectangle((x, y, min(width, x + square), min(height, y + square)), fill=(45, 62, 78, 255))
    return image


def review_catalog(inventory: list[dict[str, object]]) -> None:
    groups = [
        ("CELESTIAL / ASTRES", "celestial/", 3, 720, 620),
        ("CELLS / CASES VIDES", "cell/", 4, 540, 420),
        ("RASTER GLYPHS / CHIFFRES ET SIGNES", "glyph/", 8, 260, 300),
        ("ENERGY / FLUX MODULAIRES", "energy/", 7, 300, 380),
        ("CONTROLS / COMMANDES", "control/", 2, 1100, 360),
    ]
    width = 2400
    margin = 80
    gap = 24
    title_height = 190
    section_header = 78
    total_height = title_height + margin
    for _, prefix, columns, _, card_height in groups:
        count = sum(1 for item in inventory if str(item["name"]).startswith(prefix))
        total_height += section_header + ((count + columns - 1) // columns) * (card_height + gap) + 36

    board = Image.new("RGB", (width, total_height), (4, 18, 35))
    draw = ImageDraw.Draw(board)
    draw.text((margin, 48), "LINEFUGG · SOLAR ORIGAMI V3 · REVIEW CATALOG", font=font(52, True), fill=(246, 239, 225))
    draw.text((margin, 116), "Quote the short ID (for example AST-03 or GLY-14). Checkerboards are preview-only; component PNGs contain real alpha.", font=font(25), fill=(173, 193, 211))
    y = title_height

    for group_title, prefix, columns, card_width, card_height in groups:
        items = [item for item in inventory if str(item["name"]).startswith(prefix)]
        draw.text((margin, y), group_title, font=font(34, True), fill=(255, 199, 44))
        y += section_header
        content_width = columns * card_width + (columns - 1) * gap
        start_x = (width - content_width) // 2
        for index, item in enumerate(items):
            column = index % columns
            row = index // columns
            x = start_x + column * (card_width + gap)
            card_y = y + row * (card_height + gap)
            draw.rounded_rectangle((x, card_y, x + card_width, card_y + card_height), radius=18, fill=(12, 31, 49), outline=(65, 88, 108), width=2)
            label_height = 102
            art_width = card_width - 28
            art_height = card_height - label_height - 26
            backdrop = checkerboard(art_width, art_height)
            component = Image.open(Path(str(item["path"]))).convert("RGBA")
            fitted = fit(component, art_width - 28, art_height - 28)
            backdrop.alpha_composite(fitted, ((art_width - fitted.width) // 2, (art_height - fitted.height) // 2))
            board.paste(backdrop.convert("RGB"), (x + 14, card_y + 14))
            item_name = str(item["name"]).split("/", 1)[1]
            draw.text((x + 18, card_y + card_height - 88), str(item["reviewId"]), font=font(24, True), fill=(255, 199, 44))
            draw.text((x + 18, card_y + card_height - 50), item_name, font=font(20), fill=(242, 242, 240))
        rows = (len(items) + columns - 1) // columns
        y += rows * (card_height + gap) + 36

    board.crop((0, 0, width, y)).save(PREVIEWS / "review-catalog-v3.png", optimize=True)


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

    counters: dict[str, int] = {}
    for item in inventory:
        item["reviewId"] = review_id(str(item["name"]), counters)
    review_catalog(inventory)

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
