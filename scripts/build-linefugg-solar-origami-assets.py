#!/usr/bin/env python3
"""Build deterministic LineFugg Solar Origami runtime assets and previews.

The authored PNG sources stay untouched. This script normalizes their transparent
bounds, creates lossless runtime derivatives, and rasterizes every gameplay face.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "public/assets/generated/linefugg/solar-origami"
SOURCES = PACK / "sources"
RUNTIME = PACK / "runtime"
PREVIEWS = PACK / "previews"
INK = (8, 24, 38, 255)
IVORY = (246, 239, 221, 255)
RED = (255, 90, 54, 255)
VIOLET = (165, 77, 255, 255)
YELLOW = (255, 199, 44, 255)
COLORS = {"red": RED, "violet": VIOLET, "yellow": YELLOW}


def open_rgba(path: Path) -> Image.Image:
    with Image.open(path) as source:
        source.load()
        return source.convert("RGBA")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def save_webp(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", lossless=True, exact=True, method=6)


def contain_alpha(source: Image.Image, size: tuple[int, int], padding: int) -> Image.Image:
    bbox = source.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("source is fully transparent")
    cropped = source.crop(bbox)
    max_w, max_h = size[0] - padding * 2, size[1] - padding * 2
    scale = min(max_w / cropped.width, max_h / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return canvas


def tint_paper(source: Image.Image, color: tuple[int, int, int, int], amount: float = 0.78) -> Image.Image:
    alpha = source.getchannel("A")
    gray = source.convert("L")
    colored = Image.new("RGBA", source.size, color)
    shade = Image.merge("RGBA", (gray, gray, gray, alpha))
    mixed = Image.blend(shade, colored, amount)
    mixed.putalpha(alpha)
    return mixed


def remove_painted_checkerboard(source: Image.Image, min_component_pixels: int) -> Image.Image:
    """Recover alpha from ImageGen's neutral grey checker without redrawing glyphs."""
    rgba = list(source.get_flattened_data())
    width, height = source.size
    seeds = bytearray(1 if max(pixel[:3]) < 135 else 0 for pixel in rgba)
    seen = bytearray(width * height)
    components: list[list[int]] = []
    for origin, enabled in enumerate(seeds):
        if not enabled or seen[origin]:
            continue
        stack, component = [origin], []
        seen[origin] = 1
        while stack:
            index = stack.pop()
            component.append(index)
            x, y = index % width, index // width
            for neighbour in (index - 1 if x else -1, index + 1 if x + 1 < width else -1,
                              index - width if y else -1, index + width if y + 1 < height else -1):
                if neighbour >= 0 and seeds[neighbour] and not seen[neighbour]:
                    seen[neighbour] = 1
                    stack.append(neighbour)
        components.append(component)
    kept = [component for component in components if len(component) >= min_component_pixels]
    core = Image.new("L", source.size, 0)
    core_pixels = bytearray(width * height)
    for component in kept:
        for index in component:
            core_pixels[index] = 255
    core.frombytes(bytes(core_pixels))
    guard = core.filter(ImageFilter.MaxFilter(7))
    guard_pixels = guard.tobytes()
    pixels = []
    for index, (red, green, blue, _) in enumerate(rgba):
        alpha = max(0, min(255, (192 - max(red, green, blue)) * 5)) if guard_pixels[index] else 0
        pixels.append((red, green, blue, alpha))
    output = Image.new("RGBA", source.size)
    output.putdata(pixels)
    return output


def slice_generated_grid(source: Image.Image, columns: int, rows: int,
                         labels: list[str], frame: int, padding: int,
                         x_edges: list[int] | None = None,
                         y_edges: list[int] | None = None) -> dict[str, Image.Image]:
    if len(labels) > columns * rows:
        raise ValueError("more labels than generated cells")
    glyphs = {}
    for index, label in enumerate(labels):
        col, row = index % columns, index // columns
        left, right = ((x_edges[col], x_edges[col + 1]) if x_edges else
                       (round(col * source.width / columns), round((col + 1) * source.width / columns)))
        top, bottom = ((y_edges[row], y_edges[row + 1]) if y_edges else
                       (round(row * source.height / rows), round((row + 1) * source.height / rows)))
        glyphs[label] = contain_alpha(source.crop((left, top, right, bottom)), (frame, frame), padding)
    return glyphs


def compose_glyphs(label: str, glyphs: dict[str, Image.Image], size: tuple[int, int], padding: int = 4) -> Image.Image:
    trimmed = []
    for char in label:
        glyph = glyphs[char]
        bbox = glyph.getchannel("A").getbbox()
        if not bbox:
            raise ValueError(f"empty generated glyph: {char}")
        trimmed.append(glyph.crop(bbox))
    available_h = size[1] - padding * 2
    scaled = []
    for glyph in trimmed:
        scale = available_h / glyph.height
        scaled.append(glyph.resize((max(1, round(glyph.width * scale)), available_h), Image.Resampling.LANCZOS))
    spacing = max(1, round(available_h * 0.04))
    total_w = sum(g.width for g in scaled) + spacing * (len(scaled) - 1)
    if total_w > size[0] - padding * 2:
        scale = (size[0] - padding * 2) / total_w
        scaled = [g.resize((max(1, round(g.width * scale)), max(1, round(g.height * scale))), Image.Resampling.LANCZOS) for g in scaled]
        spacing = max(1, round(spacing * scale))
        total_w = sum(g.width for g in scaled) + spacing * (len(scaled) - 1)
    output = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - total_w) // 2
    for glyph in scaled:
        output.alpha_composite(glyph, (x, (size[1] - glyph.height) // 2))
        x += glyph.width + spacing
    return output


def paste_generated_label(canvas: Image.Image, label: str, glyphs: dict[str, Image.Image],
                          box: tuple[int, int, int, int], padding: int = 2) -> None:
    width, height = box[2] - box[0], box[3] - box[1]
    canvas.alpha_composite(compose_glyphs(label, glyphs, (width, height), padding), (box[0], box[1]))


def make_control_plate() -> Image.Image:
    image = Image.new("RGBA", (512, 160), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    outer = [(22, 80), (44, 24), (468, 24), (490, 80), (468, 136), (44, 136)]
    draw.polygon(outer, fill=(222, 190, 126, 255))
    draw.polygon([(44, 24), (468, 24), (438, 54), (74, 54)], fill=(255, 249, 228, 255))
    draw.polygon([(22, 80), (44, 24), (74, 54), (58, 108), (44, 136)], fill=(233, 219, 184, 255))
    draw.polygon([(490, 80), (468, 24), (438, 54), (454, 108), (468, 136)], fill=(217, 173, 91, 255))
    draw.polygon([(44, 136), (58, 108), (454, 108), (468, 136)], fill=(202, 151, 67, 255))
    draw.polygon([(74, 54), (438, 54), (454, 108), (58, 108)], fill=(247, 235, 205, 255))
    draw.line(outer + [outer[0]], fill=(255, 237, 188, 235), width=2, joint="curve")
    return image


def make_control_content_atlas(ui_glyphs: dict[str, Image.Image]) -> tuple[Image.Image, dict]:
    frame = 192
    atlas = Image.new("RGBA", (frame * 2, frame * 2), (0, 0, 0, 0))
    frames: dict[str, dict] = {}

    def add(name: str, col: int, row: int, image: Image.Image) -> None:
        x, y = col * frame, row * frame
        atlas.alpha_composite(image, (x, y))
        frames[name] = {"frame": {"x": x, "y": y, "w": frame, "h": frame}}

    add("undo-icon", 0, 0, contain_alpha(ui_glyphs["undo"], (frame, frame), 40))
    add("validate-icon", 1, 0, contain_alpha(ui_glyphs["check"], (frame, frame), 40))
    add("annuler-label", 0, 1, compose_glyphs("ANNULER", ui_glyphs, (frame, frame), 63))
    add("valider-label", 1, 1, compose_glyphs("VALIDER", ui_glyphs, (frame, frame), 63))
    return atlas, {"frames": frames, "meta": {"size": {"w": 384, "h": 384}, "scale": "1"}}


def make_glyph_atlas(glyphs: dict[str, Image.Image]) -> tuple[Image.Image, dict]:
    labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "+", "×", "÷", ".", "="]
    frame = 96
    atlas = Image.new("RGBA", (frame * 4, frame * 4), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    for index, label in enumerate(labels):
        x, y = (index % 4) * frame, (index // 4) * frame
        atlas.alpha_composite(glyphs[label], (x, y))
        frames[label] = {"frame": {"x": x, "y": y, "w": frame, "h": frame}}
    return atlas, {"frames": frames, "meta": {"size": {"w": 384, "h": 384}, "scale": "1"}}


def make_cell_face_atlas(cell_bases: dict[str, Image.Image], glyphs: dict[str, Image.Image]) -> tuple[Image.Image, dict]:
    labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "−1", "−2", "−3", "−4", "×2", "×3", "÷2", "÷3"]
    frame = 128
    atlas = Image.new("RGBA", (frame * 5, frame * 4), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    for index, label in enumerate(labels):
        kind = "multiply" if label.startswith("×") else "divide" if label.startswith("÷") else "additive"
        cell = cell_bases[kind].copy()
        cell.alpha_composite(compose_glyphs(label, glyphs, (76, 58), 5), (26, 35))
        x, y = (index % 5) * frame, (index // 5) * frame
        atlas.alpha_composite(cell, (x, y))
        frames[label] = {"frame": {"x": x, "y": y, "w": frame, "h": frame}, "kind": kind}
    return atlas, {"frames": frames, "meta": {"size": {"w": 640, "h": 512}, "scale": "1"}}


def make_result_atlas(crafts: list[Image.Image]) -> tuple[Image.Image, dict]:
    frame = 256
    atlas = Image.new("RGBA", (frame * 2, frame * 3), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    for row, (craft, color_name) in enumerate(zip(crafts, ("red", "violet", "yellow"), strict=True)):
        for col, (state, image) in enumerate((("neutral", craft), ("active", tint_paper(craft, COLORS[color_name])))):
            x, y = col * frame, row * frame
            atlas.alpha_composite(image, (x, y))
            frames[f"craft-{row + 1}-{state}"] = {
                "frame": {"x": x, "y": y, "w": frame, "h": frame},
                "lineColor": color_name if state == "active" else None,
            }
    return atlas, {"frames": frames, "meta": {"size": {"w": 512, "h": 768}, "scale": "1"}}


def make_energy_atlas(shard: Image.Image) -> tuple[Image.Image, dict]:
    frame = 96
    atlas = Image.new("RGBA", (frame * 4, frame), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    states = [("neutral", shard)] + [(name, tint_paper(shard, color, 0.9)) for name, color in COLORS.items()]
    for col, (name, image) in enumerate(states):
        x = col * frame
        atlas.alpha_composite(image, (x, 0))
        frames[name] = {"frame": {"x": x, "y": 0, "w": frame, "h": frame}}
    return atlas, {"frames": frames, "meta": {"size": {"w": 384, "h": 96}, "scale": "1"}}


def draw_preview(background: Image.Image, cells: dict[str, Image.Image], crafts: list[Image.Image],
                 star: Image.Image, plate: Image.Image, line_count: int,
                 score_glyphs: dict[str, Image.Image], ui_glyphs: dict[str, Image.Image],
                 shard: Image.Image | None = None, transfer_progress: float | None = None) -> Image.Image:
    canvas = background.copy()
    draw = ImageDraw.Draw(canvas, "RGBA")
    cell_size, gap = 34, 4
    board_w = cell_size * 7 + gap * 6
    x0, y0 = (390 - board_w) // 2, 122
    values = [
        ["2", "7", "1", "×2", "4", "3", "6"], ["5", "3", "8", "2", "1", "×3", "4"],
        ["6", "÷2", "4", "7", "3", "5", "1"], ["1", "9", "2", "5", "6", "8", "3"],
        ["4", "×2", "1", "3", "9", "2", "7"], ["8", "5", "6", "1", "×2", "4", "9"],
        ["7", "2", "3", "8", "5", "6", "1"],
    ]
    centers: list[list[tuple[int, int]]] = []
    for row in range(7):
        center_row = []
        for col in range(7):
            label = values[row][col]
            kind = "multiply" if label.startswith("×") else "divide" if label.startswith("÷") else "additive"
            x, y = x0 + col * (cell_size + gap), y0 + row * (cell_size + gap)
            tile = cells[kind].resize((cell_size, cell_size), Image.Resampling.LANCZOS)
            canvas.alpha_composite(tile, (x, y))
            canvas.alpha_composite(compose_glyphs(label, score_glyphs, (24, 20), 1), (x + 5, y + 7))
            center_row.append((x + cell_size // 2, y + cell_size // 2))
        centers.append(center_row)

    paths = [([(2, 0), (2, 1), (2, 2), (2, 3), (2, 4)], RED),
             ([(1, 1), (2, 1), (3, 1), (4, 1), (5, 1)], VIOLET),
             ([(6, 0), (6, 1), (6, 2), (6, 3), (6, 4)], YELLOW)]
    visible_paths = max(line_count, 1 if transfer_progress is not None else 0)
    if visible_paths:
        for coords, color in paths[:visible_paths]:
            points = [centers[r][c] for r, c in coords]
            draw.line(points, fill=color, width=6, joint="curve")
            for x, y in points:
                draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=color)

    craft_centers = [(86, 480), (195, 480), (304, 480)]
    scores = ["8", "19", "24"]
    colors = [RED, VIOLET, YELLOW]
    for index, ((cx, cy), score, color) in enumerate(zip(craft_centers, scores, colors, strict=True)):
        is_active = index < line_count
        craft = tint_paper(crafts[index], color) if is_active else crafts[index]
        scaled = contain_alpha(craft, (88, 88), 3)
        canvas.alpha_composite(scaled, (cx - 44, cy - 44))
        if is_active:
            paste_generated_label(canvas, score, score_glyphs, (cx - 25, cy - 18, cx + 25, cy + 24), 3)

    star_asset = contain_alpha(star, (112, 112), 2)
    canvas.alpha_composite(star_asset, (139, 548))
    totals = ["0", "8", "27", "51"]
    paste_generated_label(canvas, totals[line_count], score_glyphs, (162, 576, 228, 632), 4)
    if line_count:
        for (cx, cy), color in list(zip(craft_centers, colors, strict=True))[:line_count]:
            draw.line([(cx, cy + 36), (195, 573)], fill=color, width=3)

    if transfer_progress is not None and shard is not None:
        start = centers[2][4]
        end = (86, 443)
        control_a = (start[0] - 12, 408)
        control_b = (104, 420)
        particle = tint_paper(shard, RED, 0.92).resize((18, 18), Image.Resampling.LANCZOS)
        for trail in range(4):
            t = max(0.0, transfer_progress - trail * 0.075)
            inv = 1.0 - t
            x = inv**3 * start[0] + 3 * inv**2 * t * control_a[0] + 3 * inv * t**2 * control_b[0] + t**3 * end[0]
            y = inv**3 * start[1] + 3 * inv**2 * t * control_a[1] + 3 * inv * t**2 * control_b[1] + t**3 * end[1]
            p = particle.copy()
            p.putalpha(p.getchannel("A").point(lambda a: round(a * (1 - trail * 0.18))))
            canvas.alpha_composite(p, (round(x - 9), round(y - 9)))

    button = plate.resize((152, 48), Image.Resampling.LANCZOS)
    canvas.alpha_composite(button, (22, 687))
    canvas.alpha_composite(button, (216, 687))
    paste_generated_label(canvas, "ANNULER", ui_glyphs, (60, 700, 164, 723), 1)
    paste_generated_label(canvas, "VALIDER", ui_glyphs, (254, 700, 358, 723), 1)
    canvas.alpha_composite(contain_alpha(ui_glyphs["undo"], (30, 30), 2), (31, 696))
    canvas.alpha_composite(contain_alpha(ui_glyphs["check"], (30, 30), 2), (224, 696))
    return canvas


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    score_labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "+", "×", "÷", ".", "="]
    score_source = remove_painted_checkerboard(open_rgba(SOURCES / "glyphs-score-generated-source-v2.png"), 100)
    score_glyphs = slice_generated_grid(
        score_source, 4, 4, score_labels, 96, 16,
        x_edges=[0, 338, 622, 932, 1254], y_edges=[0, 397, 685, 962, 1254],
    )
    ui_labels = ["A", "D", "E", "I", "L", "N", "R", "U", "V", "undo", "check"]
    ui_glyphs = slice_generated_grid(open_rgba(SOURCES / "glyphs-ui-generated-source-v1.png"), 4, 3, ui_labels, 96, 14)

    background_source = open_rgba(SOURCES / "background/solar-origami-background-source-v1.png")
    background = background_source.resize((390, 844), Image.Resampling.LANCZOS)
    save_png(background, RUNTIME / "background/solar-origami-background-master-v1.png")
    save_webp(background.resize((780, 1688), Image.Resampling.LANCZOS), RUNTIME / "background/solar-origami-background-v1.webp")

    cell_sources = {
        "additive": open_rgba(SOURCES / "cells/cell-additive-source-v1.png"),
        "multiply": open_rgba(SOURCES / "cells/cell-multiply-source-v1.png"),
        "divide": open_rgba(SOURCES / "cells/cell-divide-source-v1.png"),
    }
    cells = {name: contain_alpha(image, (128, 128), 6) for name, image in cell_sources.items()}
    cell_atlas = Image.new("RGBA", (384, 128), (0, 0, 0, 0))
    cell_frames = {}
    for col, name in enumerate(("additive", "multiply", "divide")):
        cell_atlas.alpha_composite(cells[name], (col * 128, 0))
        cell_frames[name] = {"frame": {"x": col * 128, "y": 0, "w": 128, "h": 128}}
    save_png(cell_atlas, RUNTIME / "cells/cell-bases-atlas-v1.png")
    save_webp(cell_atlas, RUNTIME / "cells/cell-bases-atlas-v1.webp")
    write_json(RUNTIME / "cells/cell-bases-atlas-v1.json", {"frames": cell_frames, "meta": {"size": {"w": 384, "h": 128}, "scale": "1"}})

    face_atlas, face_data = make_cell_face_atlas(cells, score_glyphs)
    save_png(face_atlas, RUNTIME / "cells/cell-faces-atlas-v1.png")
    save_webp(face_atlas, RUNTIME / "cells/cell-faces-atlas-v1.webp")
    write_json(RUNTIME / "cells/cell-faces-atlas-v1.json", face_data)

    crafts = [contain_alpha(open_rgba(SOURCES / f"results/result-craft-{i}-source-v1.png"), (256, 256), 10) for i in range(1, 4)]
    result_atlas, result_data = make_result_atlas(crafts)
    save_png(result_atlas, RUNTIME / "results/result-crafts-atlas-v1.png")
    save_webp(result_atlas, RUNTIME / "results/result-crafts-atlas-v1.webp")
    write_json(RUNTIME / "results/result-crafts-atlas-v1.json", result_data)

    star = contain_alpha(open_rgba(SOURCES / "results/total-star-source-v1.png"), (256, 256), 8)
    save_png(star, RUNTIME / "results/total-star-v1.png")
    save_webp(star, RUNTIME / "results/total-star-v1.webp")

    shard = contain_alpha(open_rgba(SOURCES / "fx/energy-shard-source-v1.png"), (96, 96), 14)
    energy_atlas, energy_data = make_energy_atlas(shard)
    save_png(energy_atlas, RUNTIME / "fx/energy-shard-atlas-v1.png")
    save_webp(energy_atlas, RUNTIME / "fx/energy-shard-atlas-v1.webp")
    write_json(RUNTIME / "fx/energy-shard-atlas-v1.json", energy_data)

    plate = make_control_plate()
    save_png(plate, RUNTIME / "ui/control-plate-v1.png")
    save_webp(plate, RUNTIME / "ui/control-plate-v1.webp")
    controls, controls_data = make_control_content_atlas(ui_glyphs)
    save_png(controls, RUNTIME / "ui/control-content-atlas-v1.png")
    save_webp(controls, RUNTIME / "ui/control-content-atlas-v1.webp")
    write_json(RUNTIME / "ui/control-content-atlas-v1.json", controls_data)

    glyphs, glyph_data = make_glyph_atlas(score_glyphs)
    save_png(glyphs, RUNTIME / "glyphs/score-glyphs-atlas-v1.png")
    save_webp(glyphs, RUNTIME / "glyphs/score-glyphs-atlas-v1.webp")
    write_json(RUNTIME / "glyphs/score-glyphs-atlas-v1.json", glyph_data)

    for line_count, state in enumerate(("zero-lines", "one-line", "two-lines", "three-lines")):
        preview = draw_preview(background, cells, crafts, star, plate, line_count, score_glyphs, ui_glyphs)
        save_png(preview, PREVIEWS / f"solar-origami-{state}-master-v1.png")
        save_png(preview.crop((0, 91, 390, 753)), PREVIEWS / f"solar-origami-{state}-pc-centre-v1.png")

    storyboard = Image.new("RGBA", (390 * 4, 662), (0, 0, 0, 0))
    for index, progress in enumerate((0.0, 0.34, 0.68, 1.0)):
        completed = 1 if progress >= 1 else 0
        frame = draw_preview(background, cells, crafts, star, plate, completed, score_glyphs, ui_glyphs,
                             shard, progress if not completed else None)
        storyboard.alpha_composite(frame.crop((0, 91, 390, 753)), (index * 390, 0))
    save_png(storyboard, PREVIEWS / "solar-origami-transfer-storyboard-v1.png")

    recipe = {
        "version": 1,
        "stage": {"width": 390, "height": 844, "pcCentre": {"x": 0, "y": 91, "width": 390, "height": 662}},
        "lineColors": {name: "#%02x%02x%02x" % color[:3] for name, color in COLORS.items()},
        "ownership": {
            "background": "raster",
            "cellValuesAndOperators": "raster atlas",
            "selectionPaths": "Phaser Graphics from live cell centres",
            "selectionToResultTransfer": "temporary Phaser curve with energy-shard particles; remove after commit",
            "resultToTotalLinks": "persistent low-motion Phaser curves after commit",
            "resultInactive": "neutral atlas frame",
            "resultActive": "line-colored atlas frame",
            "reducedMotion": "instant frame swap; no moving particles",
        },
        "anchors": {
            "board": {"x": 62, "y": 122, "cell": 34, "gap": 4, "columns": 7, "rows": 7},
            "results": [{"x": 86, "y": 480}, {"x": 195, "y": 480}, {"x": 304, "y": 480}],
            "total": {"x": 195, "y": 604},
            "controls": [{"x": 22, "y": 687, "width": 152, "height": 48}, {"x": 216, "y": 687, "width": 152, "height": 48}],
        },
        "allowedText": ["ANNULER", "VALIDER", "board values/operators", "line scores", "total score"],
        "sourceGlyphs": {
            "score": "sources/glyphs-score-generated-source-v2.png",
            "ui": "sources/glyphs-ui-generated-source-v1.png",
            "note": "ImageGen-authored Solar Origami glyph tilesets; no system font is used in runtime derivatives",
        },
    }
    write_json(PACK / "solar-origami-runtime-recipe-v1.json", recipe)

    inventory = []
    for path in sorted(PACK.rglob("*")):
        if path.is_file() and path.name != "solar-origami-inventory-v1.json":
            inventory.append({"path": path.relative_to(ROOT).as_posix(), "bytes": path.stat().st_size, "sha256": sha256(path)})
    write_json(PACK / "solar-origami-inventory-v1.json", {"version": 1, "files": inventory})


if __name__ == "__main__":
    main()
