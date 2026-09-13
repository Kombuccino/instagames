from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
CONCEPT = ROOT / "public/assets/generated/platform/concepts/metro-parallax-v3"
LEGACY_SOURCE = ROOT / "public/assets/generated/platform/concepts/metro-parallax-v1/exterior-panorama-source.png"
RUNTIME = ROOT / "public/assets/generated/platform/entry-scenes/metro-sunset/parallax-v3"
SCENE = (1671, 941)


def normalize(image: Image.Image) -> Image.Image:
    image = image.crop((0, 0, min(image.width, SCENE[0]), min(image.height, SCENE[1])))
    if image.size != SCENE:
        image = image.resize(SCENE, Image.Resampling.LANCZOS)
    return image


def save(image: Image.Image, name: str) -> None:
    RUNTIME.mkdir(parents=True, exist_ok=True)
    image.save(RUNTIME / f"{name}.png", optimize=True)
    image.save(RUNTIME / f"{name}.webp", format="WEBP", lossless=True, method=6)


def atlas_groups() -> list[Image.Image]:
    atlas = Image.open(CONCEPT / "skyline-far-atlas-source.png").convert("RGBA")
    groups: list[Image.Image] = []
    for row in range(2):
        for column in range(5):
            x0 = round(column * atlas.width / 5)
            x1 = round((column + 1) * atlas.width / 5)
            y0 = round(row * atlas.height / 2)
            y1 = round((row + 1) * atlas.height / 2)
            cell = atlas.crop((x0, y0, x1, y1))
            alpha = np.array(cell.getchannel("A"))
            # Depth comes from colour and scale. Buildings remain solid objects;
            # transparency made the sky show through their faces.
            alpha = np.where(alpha >= 18, 255, 0).astype(np.uint8)
            cell.putalpha(Image.fromarray(alpha))
            bounds = cell.getbbox()
            if bounds:
                groups.append(cell.crop(bounds))
    if len(groups) != 10:
        raise ValueError(f"Expected 10 skyline groups, found {len(groups)}")
    return groups


def resize_to_height(image: Image.Image, height: int) -> Image.Image:
    width = max(1, round(image.width * height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def skyline_strip(
    groups: list[Image.Image],
    indices: list[int],
    height: int,
    ground: int,
    opacity: float,
    haze: float = 0,
) -> Image.Image:
    output = Image.new("RGBA", SCENE)
    spacing = SCENE[0] / len(indices)
    for slot, index in enumerate(indices):
        group = resize_to_height(groups[index], height)
        if group.width > spacing * .88:
            group = group.resize((round(spacing * .88), height), Image.Resampling.LANCZOS)
        if haze:
            pixels = np.array(group, dtype=np.float32)
            haze_color = np.array((128, 116, 178), dtype=np.float32)
            pixels[:, :, :3] = pixels[:, :, :3] * (1 - haze) + haze_color * haze
            group = Image.fromarray(np.clip(pixels, 0, 255).astype(np.uint8))
        alpha = group.getchannel("A").point(lambda value: round(value * opacity))
        group.putalpha(alpha)
        center = (slot + .5) * spacing
        output.alpha_composite(group, (round(center - group.width / 2), ground - group.height))
    return output


def bridge_strip(source: Image.Image) -> Image.Image:
    # A shallow modular bridge: substantial enough to read as infrastructure,
    # but still behind the water and carriage rather than as a moving horizon line.
    palette = np.array(source.convert("RGB"))
    rail_color = tuple(int(value) for value in palette[499, 300]) + (230,)
    dark_color = tuple(int(value) for value in palette[511, 300]) + (235,)
    shadow_color = (72, 77, 151, 220)
    output = Image.new("RGBA", SCENE)
    draw = ImageDraw.Draw(output)
    y = 350
    draw.rectangle((0, y - 7, SCENE[0], y - 4), fill=rail_color)
    draw.rectangle((0, y - 3, SCENE[0], y + 5), fill=dark_color)
    draw.rectangle((0, y + 5, SCENE[0], y + 10), fill=shadow_color)
    module = 139.25
    for index in range(12):
        x = round(index * module)
        draw.rectangle((x - 2, y - 18, x + 2, y + 6), fill=rail_color)
        draw.line((x, y - 4, x + round(module / 2), y + 9), fill=shadow_color, width=3)
        draw.line((x + round(module / 2), y + 9, x + round(module), y - 4), fill=shadow_color, width=3)
    return output


def water_layers(source: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    water_top = 510
    water_height = SCENE[1] - 350
    water_source = source.crop((0, water_top, SCENE[0], SCENE[1])).resize((SCENE[0], water_height), Image.Resampling.LANCZOS)
    rgb = np.array(water_source.convert("RGB"), dtype=np.float32)
    red, green, blue = (rgb[:, :, channel] for channel in range(3))
    reflection = np.clip((red - blue - 24) / 125, 0, 1) * np.clip((green - 140) / 105, 0, 1)
    # The moving texture comes only from a side sample without the sun path.
    # The direct reflection is rebuilt below as a separate fixed overlay.
    clean_sample = Image.fromarray(rgb.astype(np.uint8)).crop((40, 0, 690, water_height))
    half = clean_sample.resize((836, water_height), Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (1672, water_height))
    tile.paste(half, (0, 0))
    tile.paste(half.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (836, 0))
    water = Image.new("RGBA", SCENE)
    water.alpha_composite(tile.crop((0, 0, SCENE[0], tile.height)).convert("RGBA"), (0, 350))

    tile_rgb = np.array(tile.crop((0, 0, SCENE[0], tile.height)), dtype=np.float32)
    tr, tg, tb = (tile_rgb[:, :, channel] for channel in range(3))
    sparkle_strength = np.clip((tr * .38 + tg * .44 + tb * .18 - 145) / 90, 0, 1)
    sparkle_strength *= np.clip((tr - tb + 30) / 115, 0, 1)
    # Retain small authored water facets with restrained alpha so their pulse
    # reads as surface shimmer rather than a second moving sun path.
    sparkle_alpha = np.clip(sparkle_strength * 118, 0, 118).astype(np.uint8)
    sparkle_rgb = np.clip(tile_rgb * np.array((1.13, 1.08, 1.02), dtype=np.float32), 0, 255).astype(np.uint8)
    sparkle = Image.new("RGBA", SCENE)
    sparkle.alpha_composite(Image.fromarray(np.dstack((sparkle_rgb, sparkle_alpha))), (0, 350))

    x = np.linspace(-1, 1, SCENE[0], dtype=np.float32)
    fixed_path = np.exp(-((x / .16) ** 2))[None, :]
    alpha = np.clip(reflection * fixed_path * 255, 0, 255).astype(np.uint8)
    reflection_crop = Image.fromarray(np.dstack((rgb.astype(np.uint8), alpha)))
    overlay = Image.new("RGBA", SCENE)
    overlay.alpha_composite(reflection_crop, (0, 350))
    return water, overlay, sparkle


def main() -> None:
    source = normalize(Image.open(LEGACY_SOURCE).convert("RGB"))
    sky_source = normalize(Image.open(CONCEPT / "sky-source.png").convert("RGB"))
    sky = Image.new("RGB", SCENE)
    sky.paste(sky_source.crop((0, 110, SCENE[0], SCENE[1])), (0, 0))
    sky.paste(sky_source.crop((0, SCENE[1] - 1, SCENE[0], SCENE[1])).resize((SCENE[0], 110)), (0, SCENE[1] - 110))

    groups = atlas_groups()
    far = skyline_strip(groups, [0, 2, 4, 6, 8], 88, 338, 1, haze=.42)
    near = skyline_strip(groups, [1, 5, 7, 9], 190, 349, 1)
    water, reflection, sparkle = water_layers(source)
    carriage_base = Image.open(CONCEPT / "carriage-foreground-source.png").convert("RGBA")

    save(sky, "sky")
    save(far.crop((0, 250, SCENE[0], 338)), "skyline-far-strip")
    save(near.crop((0, 159, SCENE[0], 349)), "skyline-near-strip")
    save(bridge_strip(source).crop((0, 332, SCENE[0], 361)), "shore-bridge-strip")
    save(water.crop((0, 350, SCENE[0], SCENE[1])), "water-strip")
    save(sparkle.crop((0, 350, SCENE[0], SCENE[1])), "water-sparkle-strip")
    save(reflection.crop((562, 363, 1116, 886)), "water-reflection")
    save(carriage_base, "carriage-base")
    for obsolete in (RUNTIME / "carriage-sunlight.png", RUNTIME / "carriage-sunlight.webp"):
        obsolete.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
