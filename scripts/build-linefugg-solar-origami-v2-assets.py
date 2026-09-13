#!/usr/bin/env python3
"""Build the reviewed LineFugg Solar Origami v2 asset kit.

ImageGen provides the authored chroma sheets. This script only removes their
uniform green backing, slices every item, normalizes runtime frames and writes
inspectable atlases/manifests. It never redraws the authored artwork.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "public/assets/generated/linefugg/solar-origami-v2"
SOURCES = PACK / "sources"
MASTERS = PACK / "masters"
COMPONENTS = PACK / "components"
RUNTIME = PACK / "runtime"
PREVIEWS = PACK / "previews"


def open_rgba(path: Path) -> Image.Image:
    with Image.open(path) as source:
        source.load()
        return source.convert("RGBA")


def chroma_to_alpha(source: Image.Image) -> Image.Image:
    """Reverse RGB compositing over pure green and decontaminate soft edges."""
    output = Image.new("RGBA", source.size)
    pixels = []
    for red, green, blue, _ in source.get_flattened_data():
        alpha = max(red, blue, 255 - green) / 255.0
        # ImageGen's chroma plate contains a faint compression halo even in
        # visually empty corners. Remove that residue while retaining authored
        # glows, whose recovered opacity is substantially higher.
        if alpha <= 0.10:
            pixels.append((0, 0, 0, 0))
            continue
        out_red = round(red / alpha)
        out_blue = round(blue / alpha)
        out_green = round((green - (1.0 - alpha) * 255) / alpha)
        pixels.append((min(255, out_red), max(0, min(255, out_green)), min(255, out_blue), round(alpha * 255)))
    output.putdata(pixels)
    return output


def save_image(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)
    image.save(path.with_suffix(".webp"), "WEBP", lossless=True, exact=True, method=6)


def save_json(value: object, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized(source: Image.Image, size: tuple[int, int], padding: int = 8) -> Image.Image:
    bbox = source.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("empty transparent component")
    cropped = source.crop(bbox)
    scale = min((size[0] - 2 * padding) / cropped.width, (size[1] - 2 * padding) / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    output = Image.new("RGBA", size, (0, 0, 0, 0))
    output.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return output


def equal_edges(length: int, count: int) -> list[int]:
    return [round(index * length / count) for index in range(count + 1)]


def slice_row(source: Image.Image, names: list[str], y: tuple[int, int], size: tuple[int, int],
              group: str, x_edges: list[int] | None = None, padding: int = 8) -> dict[str, Image.Image]:
    edges = x_edges or equal_edges(source.width, len(names))
    items = {}
    for index, name in enumerate(names):
        item = normalized(source.crop((edges[index], y[0], edges[index + 1], y[1])), size, padding)
        items[name] = item
        save_image(item, COMPONENTS / group / f"{name}-v2.png")
    return items


def make_atlas(groups: list[tuple[str, Image.Image]], columns: int, frame: tuple[int, int], path: Path,
               metadata: dict[str, dict] | None = None) -> dict:
    rows = (len(groups) + columns - 1) // columns
    atlas = Image.new("RGBA", (columns * frame[0], rows * frame[1]), (0, 0, 0, 0))
    frames = {}
    for index, (name, image) in enumerate(groups):
        col, row = index % columns, index // columns
        x, y = col * frame[0], row * frame[1]
        atlas.alpha_composite(image, (x, y))
        frames[name] = {
            "frame": {"x": x, "y": y, "w": frame[0], "h": frame[1]},
            **((metadata or {}).get(name, {})),
        }
    save_image(atlas, path)
    manifest = {"frames": frames, "meta": {"size": {"w": atlas.width, "h": atlas.height}, "scale": "1"}}
    save_json(manifest, path.with_suffix(".json"))
    return manifest


def compose_label(label: str, glyphs: dict[str, Image.Image], size: tuple[int, int]) -> Image.Image:
    parts = []
    for character in label:
        glyph = glyphs[character]
        bbox = glyph.getchannel("A").getbbox()
        parts.append(glyph.crop(bbox))
    target_h = round(size[1] * 0.48)
    scaled = []
    for part in parts:
        scale = target_h / part.height
        scaled.append(part.resize((max(1, round(part.width * scale)), target_h), Image.Resampling.LANCZOS))
    spacing = max(2, round(target_h * 0.05))
    width = sum(part.width for part in scaled) + spacing * (len(scaled) - 1)
    if width > size[0] * 0.72:
        scale = size[0] * 0.72 / width
        scaled = [part.resize((max(1, round(part.width * scale)), max(1, round(part.height * scale))), Image.Resampling.LANCZOS) for part in scaled]
        spacing = max(1, round(spacing * scale))
        width = sum(part.width for part in scaled) + spacing * (len(scaled) - 1)
    output = Image.new("RGBA", size, (0, 0, 0, 0))
    cursor = (size[0] - width) // 2
    for part in scaled:
        output.alpha_composite(part, (cursor, (size[1] - part.height) // 2))
        cursor += part.width + spacing
    return output


def build_cell_faces(cells: dict[str, Image.Image], glyphs: dict[str, Image.Image]) -> dict[str, Image.Image]:
    labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "−1", "−2", "−3", "−4", "×2", "×3", "÷2", "÷3"]
    faces = {}
    for label in labels:
        kind = "multiply" if label.startswith("×") else "divide" if label.startswith("÷") else "additive"
        face = cells[f"cell-{kind}-neutral"].copy()
        face.alpha_composite(compose_label(label, glyphs, face.size))
        name = {"−": "minus-", "×": "times-", "÷": "divide-"}.get(label[0], "") + label.lstrip("−×÷")
        faces[name] = face
        save_image(face, COMPONENTS / "cell-faces" / f"cell-{name}-v2.png")
    return faces


def preview_sheet(groups: list[tuple[str, Image.Image]], columns: int, frame: tuple[int, int]) -> Image.Image:
    rows = (len(groups) + columns - 1) // columns
    output = Image.new("RGBA", (columns * frame[0], rows * frame[1]), (5, 17, 31, 255))
    for index, (_, image) in enumerate(groups):
        col, row = index % columns, index // columns
        output.alpha_composite(image, (col * frame[0], row * frame[1]))
    return output


def main() -> None:
    mega_source = SOURCES / "solar-origami-mega-tileset-chroma-v2.png"
    glyph_source = SOURCES / "solar-origami-glyphs-chroma-v2.png"
    fx_source = SOURCES / "solar-origami-fx-chroma-v2.png"
    controls_source = SOURCES / "solar-origami-controls-english-alpha-v3.png"
    background_source = SOURCES / "solar-origami-background-source-v2.png"
    mega = chroma_to_alpha(open_rgba(mega_source))
    glyph_sheet = chroma_to_alpha(open_rgba(glyph_source))
    fx = chroma_to_alpha(open_rgba(fx_source))
    controls_sheet = open_rgba(controls_source)
    background = open_rgba(background_source)
    control_x = equal_edges(controls_sheet.width, 2)
    control_y = equal_edges(controls_sheet.height, 2)
    compact_controls = []
    for row in range(2):
        for col in range(2):
            compact_controls.append(normalized(
                controls_sheet.crop((control_x[col], control_y[row], control_x[col + 1], control_y[row + 1])),
                (300, 100), 4,
            ))
    # The first generated general sheet carried French labels. Keep it as a source
    # trace, but replace that entire authored row in the canonical alpha master.
    mega.paste((0, 0, 0, 0), (0, 740, mega.width, 880))
    for index, control in enumerate(compact_controls):
        mega.alpha_composite(control, (round(index * mega.width / 4) + 6, 755))
    save_image(mega, MASTERS / "solar-origami-mega-tileset-alpha-v2.png")
    save_image(glyph_sheet, MASTERS / "solar-origami-glyphs-alpha-v2.png")
    save_image(fx, MASTERS / "solar-origami-fx-alpha-v2.png")
    save_image(background, MASTERS / "solar-origami-background-master-v2.png")
    save_image(background.resize((780, 1688), Image.Resampling.LANCZOS), RUNTIME / "background/solar-origami-background-v2.png")

    cells = slice_row(mega, ["cell-additive-neutral", "cell-multiply-neutral", "cell-divide-neutral",
                             "cell-selected-red", "cell-selected-violet", "cell-selected-yellow"],
                      (25, 215), (192, 192), "cells")
    results = slice_row(mega, ["result-1-inactive", "result-1-active-red", "result-2-inactive",
                               "result-2-active-violet", "result-3-inactive", "result-3-active-yellow"],
                        (225, 480), (256, 256), "results")
    suns = slice_row(mega, ["sun-neutral", "sun-red", "sun-red-violet", "sun-final-tricolor",
                            "debris-cluster-warm", "debris-cluster-navy"],
                     (485, 725), (256, 256), "sun-and-clusters")
    buttons = slice_row(controls_sheet, ["button-undo-normal", "button-undo-pressed"],
                        (0, round(controls_sheet.height / 2)), (512, 160), "controls", control_x, 6)
    buttons.update(slice_row(controls_sheet, ["button-validate-disabled", "button-validate-ready"],
                             (round(controls_sheet.height / 2), controls_sheet.height),
                             (512, 160), "controls", control_x, 6))
    modules = slice_row(mega, ["selection-node-neutral", "selection-node-red", "selection-node-violet",
                               "selection-node-yellow", "flow-straight-neutral", "flow-straight-red",
                               "flow-straight-violet", "flow-straight-yellow", "flow-elbow-neutral",
                               "flow-end-cap", "flow-arrow", "energy-shard"],
                        (890, 1040), (160, 160), "modules")
    debris = slice_row(mega, [*[f"debris-{index:02d}" for index in range(1, 8)],
                              *[f"spark-{index:02d}" for index in range(1, 5)]],
                       (1045, 1235), (160, 160), "debris",
                       [0, 132, 250, 377, 497, 607, 722, 831, 936, 1042, 1140, 1254])

    glyph_labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "+", "×", "÷", ".", "="]
    glyphs = {}
    edges = equal_edges(1254, 4)
    for index, label in enumerate(glyph_labels):
        col, row = index % 4, index // 4
        glyph = normalized(glyph_sheet.crop((edges[col], edges[row], edges[col + 1], edges[row + 1])), (128, 128), 20)
        glyphs[label] = glyph
        safe = {"−": "minus", "+": "plus", "×": "times", "÷": "divide", ".": "dot", "=": "equals"}.get(label, label)
        save_image(glyph, COMPONENTS / "glyphs" / f"glyph-{safe}-v2.png")
    faces = build_cell_faces(cells, glyphs)

    fx_nodes = slice_row(fx, ["node-neutral", "node-hover", "node-red", "node-violet", "node-yellow",
                              "node-shared-red-violet", "node-shared-red-yellow", "node-shared-violet-yellow"],
                         (20, 220), (160, 160), "fx/nodes")
    fx_segments = slice_row(fx, ["segment-neutral", "segment-red", "segment-violet", "segment-yellow",
                                 "segment-diagonal-red", "segment-diagonal-violet", "segment-diagonal-yellow",
                                 "segment-elbow-neutral"],
                            (225, 405), (256, 128), "fx/segments", padding=5)
    transfer = {}
    for color, y in (("red", (410, 590)), ("violet", (595, 775)), ("yellow", (780, 960))):
        transfer.update(slice_row(fx, [f"transfer-{color}-{index:02d}" for index in range(1, 9)],
                                  y, (256, 128), f"fx/transfers/{color}", padding=5))
    arrivals = slice_row(fx, ["arrival-neutral-01", "arrival-neutral-02", "arrival-neutral-03",
                              "arrival-red", "arrival-violet", "arrival-yellow", "shard-ivory-01",
                              "shard-ivory-02", "shard-ivory-03", "dust-red", "dust-violet", "dust-yellow"],
                         (965, 1200), (160, 160), "fx/arrivals")

    make_atlas(list(cells.items()), 3, (192, 192), RUNTIME / "cells/cell-states-atlas-v2.png")
    make_atlas(list(faces.items()), 5, (192, 192), RUNTIME / "cells/cell-faces-atlas-v2.png")
    make_atlas(list(results.items()), 2, (256, 256), RUNTIME / "results/result-crafts-atlas-v2.png")
    make_atlas(list(suns.items()), 3, (256, 256), RUNTIME / "results/sun-and-clusters-atlas-v2.png")
    make_atlas(list(buttons.items()), 2, (512, 160), RUNTIME / "controls/control-buttons-atlas-v2.png")
    make_atlas(list(modules.items()), 4, (160, 160), RUNTIME / "fx/selection-modules-atlas-v2.png")
    make_atlas(list(debris.items()), 4, (160, 160), RUNTIME / "decor/debris-atlas-v2.png")
    make_atlas(list(glyphs.items()), 4, (128, 128), RUNTIME / "glyphs/gameplay-glyphs-atlas-v2.png")
    make_atlas(list(fx_nodes.items()), 4, (160, 160), RUNTIME / "fx/selection-nodes-atlas-v2.png")
    make_atlas(list(fx_segments.items()), 4, (256, 128), RUNTIME / "fx/selection-segments-atlas-v2.png")
    for color in ("red", "violet", "yellow"):
        frames = [(name, image) for name, image in transfer.items() if name.startswith(f"transfer-{color}")]
        make_atlas(frames, 4, (256, 128), RUNTIME / f"fx/transfer-{color}-atlas-v2.png")
    make_atlas(list(arrivals.items()), 4, (160, 160), RUNTIME / "fx/arrival-particles-atlas-v2.png")

    preview = Image.new("RGBA", (1254, 3762), (5, 17, 31, 255))
    preview.alpha_composite(mega, (0, 0))
    preview.alpha_composite(glyph_sheet, (0, 1254))
    preview.alpha_composite(fx, (0, 2508))
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    preview.save(PREVIEWS / "solar-origami-complete-components-board-v2.png", "PNG", optimize=True)

    files = sorted(path for path in PACK.rglob("*") if path.is_file() and path.name != "solar-origami-v2-inventory.json")
    save_json({
        "pack": "linefugg-solar-origami-v2",
        "status": "generated-and-technically-validated-pending-user-review",
        "authoredSources": [str(path.relative_to(ROOT)).replace("\\", "/") for path in
                            (mega_source, glyph_source, fx_source, controls_source, background_source)],
        "palette": {"red": "#FF5A36", "violet": "#A54DFF", "yellow": "#FFC72C"},
        "counts": {"cells": len(cells), "cellFaces": len(faces), "results": len(results), "sunAndClusters": len(suns),
                   "buttons": len(buttons), "modules": len(modules), "debris": len(debris), "glyphs": len(glyphs),
                   "fxNodes": len(fx_nodes), "fxSegments": len(fx_segments), "transferFrames": len(transfer),
                   "arrivalParticles": len(arrivals)},
        "files": [{"path": str(path.relative_to(ROOT)).replace("\\", "/"), "sha256": sha256(path)} for path in files],
    }, PACK / "solar-origami-v2-inventory.json")


if __name__ == "__main__":
    main()
