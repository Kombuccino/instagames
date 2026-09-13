from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
IMPORTED = ROOT / "public/assets/imported/platform/entry-scenes/metro-moment-v1"
CONCEPT = ROOT / "public/assets/generated/platform/concepts/metro-parallax-v1"
RUNTIME = ROOT / "public/assets/generated/platform/entry-scenes/metro-sunset"
PARALLAX = RUNTIME / "parallax"

SCENE_WIDTH = 1671
SCENE_HEIGHT = 941
ARM_SOURCE_WIDTH = 941
ARM_WIDTH = 1255
ARM_HEIGHT = 1672


def normalize_scene(image: Image.Image, width: int, height: int) -> Image.Image:
    if image.height == height + 1:
        image = image.crop((0, 0, image.width, height))
    elif image.height != height:
        raise ValueError(f"Unexpected image height {image.height}; expected {height} or {height + 1}")
    if image.width == width:
        return image
    if image.width == width + 1:
        return image.crop((0, 0, width, image.height))
    if image.width != width - 1:
        raise ValueError(f"Unexpected image width {image.width}; expected {width - 1} or {width}")
    output = Image.new(image.mode, (width, image.height))
    output.paste(image, (0, 0))
    output.paste(image.crop((image.width - 1, 0, image.width, image.height)), (image.width, 0))
    return output


def save_master_and_runtime(image: Image.Image, name: str) -> None:
    PARALLAX.mkdir(parents=True, exist_ok=True)
    png_path = PARALLAX / f"{name}.png"
    image.save(png_path, optimize=True)
    image.save(png_path.with_suffix(".webp"), format="WEBP", lossless=True, method=6)


def position_alpha_layer(source: Image.Image, target_height: int, target_bottom: int) -> Image.Image:
    source = normalize_scene(source.convert("RGBA"), SCENE_WIDTH, SCENE_HEIGHT)
    alpha = source.getchannel("A").point(lambda value: 0 if value < 8 else value)
    source.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Generated parallax layer has no visible pixels")
    content = source.crop((0, bbox[1], SCENE_WIDTH, bbox[3]))
    content = content.resize((SCENE_WIDTH, target_height), Image.Resampling.LANCZOS)
    output = Image.new("RGBA", (SCENE_WIDTH, SCENE_HEIGHT))
    output.alpha_composite(content, (0, target_bottom - target_height))
    return output


def make_horizontal_tileable(image: Image.Image, blend_width: int = 96) -> Image.Image:
    mode = "RGBA" if "A" in image.getbands() else "RGB"
    pixels = np.array(image.convert(mode)).astype(np.float32)
    for offset in range(blend_width):
        strength = offset / max(1, blend_width - 1)
        left = pixels[:, offset, :].copy()
        right = pixels[:, -1 - offset, :].copy()
        midpoint = (left + right) * .5
        pixels[:, offset, :] = midpoint * (1 - strength) + left * strength
        pixels[:, -1 - offset, :] = midpoint * (1 - strength) + right * strength
    return Image.fromarray(np.clip(pixels, 0, 255).astype(np.uint8), mode)


def build_parallax_layers() -> None:
    foreground_source = normalize_scene(
        Image.open(CONCEPT / "carriage-foreground-extraction-source.png").convert("RGB"),
        SCENE_WIDTH,
        SCENE_HEIGHT,
    )
    extraction = np.array(foreground_source.convert("RGBA"))
    # Keep the approved plate's pixels exactly. The generated extraction is
    # consumed only as a matte for locating the window openings.
    approved = np.array(Image.open(RUNTIME / "camera-distance-20.png").convert("RGBA"))

    # Image generation returned a painted neutral checkerboard in the panes.
    # Restrict removal to the five glass regions so pale clothes and interior
    # highlights remain intact.
    panes = Image.new("L", foreground_source.size, 0)
    draw = ImageDraw.Draw(panes)
    for box in ((0, 125, 70, 416), (122, 130, 220, 416), (303, 116, 770, 414), (821, 116, 1352, 414), (1465, 130, 1585, 416)):
        draw.rounded_rectangle(box, radius=12, fill=255)
    pane_mask = np.array(panes) > 0
    rgb = extraction[:, :, :3].astype(np.int16)
    neutral = (rgb.max(axis=2) - rgb.min(axis=2) <= 13) & (rgb.mean(axis=2) >= 178)
    foreground_alpha = np.where(pane_mask & neutral, 0, 255).astype(np.uint8)
    approved[:, :, 3] = foreground_alpha

    # Remove the baked golden sunlight from the permanent carriage plate while
    # retaining the exact approved geometry and raster detail. A separate
    # highlight plate restores only warm lit facets at a variable intensity.
    rgb_approved = approved[:, :, :3].astype(np.float32)
    red, green, blue = (rgb_approved[:, :, channel] for channel in range(3))
    luma = red * .299 + green * .587 + blue * .114
    warmth = np.clip((red - blue - 6) / 115, 0, 1) * np.clip((luma - 78) / 150, 0, 1)
    base = rgb_approved.copy()
    base[:, :, 0] *= .975 - warmth * .105
    base[:, :, 1] *= .985 - warmth * .055
    base[:, :, 2] *= .995 + warmth * .018
    base_rgba = np.dstack((np.clip(base, 0, 255).astype(np.uint8), foreground_alpha))
    save_master_and_runtime(Image.fromarray(base_rgba), "carriage-base")

    highlight = np.clip((red - blue - 10) / 125, 0, 1) * np.clip((luma - 92) / 145, 0, 1)
    highlight_alpha = (highlight * foreground_alpha * .82).astype(np.uint8)
    sunlight = np.dstack((approved[:, :, :3], highlight_alpha))
    save_master_and_runtime(Image.fromarray(sunlight), "carriage-sunlight")

    concept_v2 = CONCEPT.parent / "metro-parallax-v2"
    sky_source = normalize_scene(Image.open(concept_v2 / "sky-source.png").convert("RGB"), SCENE_WIDTH, SCENE_HEIGHT)
    sky = Image.new("RGB", (SCENE_WIDTH, SCENE_HEIGHT))
    sky.paste(sky_source.crop((0, 120, SCENE_WIDTH, SCENE_HEIGHT)), (0, 0))
    sky.paste(sky_source.crop((0, SCENE_HEIGHT - 1, SCENE_WIDTH, SCENE_HEIGHT)).resize((SCENE_WIDTH, 120)), (0, SCENE_HEIGHT - 120))
    water = normalize_scene(Image.open(concept_v2 / "water-base-source.png").convert("RGB"), SCENE_WIDTH, SCENE_HEIGHT)
    save_master_and_runtime(sky, "sky")
    save_master_and_runtime(make_horizontal_tileable(water), "water-base")
    save_master_and_runtime(make_horizontal_tileable(position_alpha_layer(Image.open(concept_v2 / "skyline-far-source.png"), 118, 336)), "skyline-far")
    save_master_and_runtime(make_horizontal_tileable(position_alpha_layer(Image.open(concept_v2 / "skyline-near-source.png"), 205, 338)), "skyline-near")
    save_master_and_runtime(make_horizontal_tileable(position_alpha_layer(Image.open(concept_v2 / "shore-bridge-source.png"), 32, 350)), "shore-bridge")

    # The direct sun path on the water stays fixed below the fixed sun. Only
    # its opacity changes when the moving near skyline occludes that source.
    exterior = np.array(normalize_scene(Image.open(CONCEPT / "exterior-panorama-source.png").convert("RGB"), SCENE_WIDTH, SCENE_HEIGHT))
    er, eg, eb = (exterior[:, :, channel].astype(np.float32) for channel in range(3))
    reflection_strength = np.clip((er - eb - 38) / 150, 0, 1) * np.clip((eg - 150) / 100, 0, 1)
    x = np.linspace(-1, 1, SCENE_WIDTH, dtype=np.float32)
    center_falloff = np.exp(-((x / .18) ** 2))[None, :]
    y_mask = (np.arange(SCENE_HEIGHT)[:, None] >= 505).astype(np.float32)
    reflection_alpha = np.clip(reflection_strength * center_falloff * y_mask * 255, 0, 255).astype(np.uint8)
    reflection_source = Image.fromarray(np.dstack((exterior, reflection_alpha)))
    reflection = Image.new("RGBA", (SCENE_WIDTH, SCENE_HEIGHT))
    reflection.alpha_composite(reflection_source.crop((0, 505, SCENE_WIDTH, SCENE_HEIGHT)), (0, 335))
    save_master_and_runtime(reflection, "water-reflection")


def extend_arm(source: Image.Image) -> Image.Image:
    source = source.convert("RGBA")
    if source.size != (ARM_SOURCE_WIDTH, ARM_HEIGHT):
        raise ValueError(f"Unexpected arm size {source.size}")
    output = Image.new("RGBA", (ARM_WIDTH, ARM_HEIGHT))
    output.paste(source, (0, 0))

    alpha = np.array(source.getchannel("A"))
    edge_rows = np.where(alpha[:, ARM_SOURCE_WIDTH - 1] > 16)[0]
    if not edge_rows.size:
        raise ValueError("Arm does not reach its source right edge")
    top = int(edge_rows[0])

    # Continue the existing sleeve itself, then let it leave through the
    # bottom. Repainting fresh polygons here creates an immediately visible
    # change of facet scale and colour at the source edge.
    exit_x = ARM_SOURCE_WIDTH + 188
    mask = Image.new("L", output.size, 0)
    ImageDraw.Draw(mask).polygon(
        [(ARM_SOURCE_WIDTH, top), (exit_x, ARM_HEIGHT), (ARM_SOURCE_WIDTH, ARM_HEIGHT)],
        fill=255,
    )

    extension_width = exit_x - ARM_SOURCE_WIDTH
    continuation = source.crop(
        (ARM_SOURCE_WIDTH - extension_width, 0, ARM_SOURCE_WIDTH, ARM_HEIGHT)
    ).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    layer = Image.new("RGBA", output.size)
    layer.alpha_composite(continuation, (ARM_SOURCE_WIDTH, 0))
    layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", output.size), mask))
    output.alpha_composite(layer)
    return output


def build_arms() -> None:
    for folder in ("arms", "arms-screen-cutout"):
        destination = RUNTIME / folder
        destination.mkdir(parents=True, exist_ok=True)
        for index in range(1, 9):
            name = f"arm-{index:02d}"
            image = extend_arm(Image.open(IMPORTED / folder / f"{name}.png"))
            image.save(destination / f"{name}.png", optimize=True)
            image.save(destination / f"{name}.webp", format="WEBP", lossless=True, method=6)


if __name__ == "__main__":
    build_arms()
