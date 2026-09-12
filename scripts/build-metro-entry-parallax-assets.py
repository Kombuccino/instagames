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
    approved[:, :, 3] = np.where(pane_mask & neutral, 0, 255).astype(np.uint8)
    save_master_and_runtime(Image.fromarray(approved), "carriage-foreground")

    exterior = normalize_scene(
        Image.open(CONCEPT / "exterior-panorama-source.png").convert("RGB"),
        SCENE_WIDTH,
        SCENE_HEIGHT,
    )
    save_master_and_runtime(exterior, "exterior-panorama")


def extend_arm(source: Image.Image) -> Image.Image:
    source = source.convert("RGBA")
    if source.size != (ARM_SOURCE_WIDTH, ARM_HEIGHT):
        raise ValueError(f"Unexpected arm size {source.size}")
    output = Image.new("RGBA", (ARM_WIDTH, ARM_HEIGHT))
    output.alpha_composite(source)

    extension_width = ARM_WIDTH - ARM_SOURCE_WIDTH
    texture = source.crop((ARM_SOURCE_WIDTH - extension_width, 0, ARM_SOURCE_WIDTH, ARM_HEIGHT))
    texture = texture.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    layer = Image.new("RGBA", output.size)
    layer.alpha_composite(texture, (ARM_SOURCE_WIDTH, 0))

    # The upper silhouette continues the real cuff edge and slopes down toward
    # the lower-right viewport. The mirrored pixels make the seam exact while
    # retaining every variant's own facets, palette and material.
    mask = Image.new("L", output.size, 0)
    ImageDraw.Draw(mask).polygon(
        [(ARM_SOURCE_WIDTH, 1302), (ARM_WIDTH, 1505), (ARM_WIDTH, ARM_HEIGHT), (ARM_SOURCE_WIDTH, ARM_HEIGHT)],
        fill=255,
    )
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
    build_parallax_layers()
    build_arms()
