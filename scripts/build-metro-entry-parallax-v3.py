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
            alpha = np.where(alpha >= 18, alpha, 0).astype(np.uint8)
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


def skyline_strip(groups: list[Image.Image], indices: list[int], height: int, ground: int, opacity: float) -> Image.Image:
    output = Image.new("RGBA", SCENE)
    spacing = SCENE[0] / len(indices)
    for slot, index in enumerate(indices):
        group = resize_to_height(groups[index], height)
        if group.width > spacing * .88:
            group = group.resize((round(spacing * .88), height), Image.Resampling.LANCZOS)
        alpha = group.getchannel("A").point(lambda value: round(value * opacity))
        group.putalpha(alpha)
        center = (slot + .5) * spacing
        output.alpha_composite(group, (round(center - group.width / 2), ground - group.height))
    return output


def bridge_strip(source: Image.Image) -> Image.Image:
    # Preserve the thin bridge language from the approved exterior, then make
    # a regular modular rail whose spacing also continues across the wrap.
    palette = np.array(source.convert("RGB"))
    rail_color = tuple(int(value) for value in palette[499, 300]) + (230,)
    dark_color = tuple(int(value) for value in palette[511, 300]) + (205,)
    output = Image.new("RGBA", SCENE)
    draw = ImageDraw.Draw(output)
    y = 350
    draw.rectangle((0, y - 5, SCENE[0], y - 2), fill=rail_color)
    draw.rectangle((0, y - 1, SCENE[0], y + 3), fill=dark_color)
    module = 139.25
    for index in range(12):
        x = round(index * module)
        draw.rectangle((x - 2, y - 13, x + 2, y + 5), fill=rail_color)
        draw.polygon(((x - 5, y - 12), (x, y - 17), (x + 5, y - 12)), fill=rail_color)
    return output


def water_layers(source: Image.Image) -> tuple[Image.Image, Image.Image]:
    water_top = 510
    water_height = SCENE[1] - 350
    water_source = source.crop((0, water_top, SCENE[0], SCENE[1])).resize((SCENE[0], water_height), Image.Resampling.LANCZOS)
    rgb = np.array(water_source.convert("RGB"), dtype=np.float32)
    red, green, blue = (rgb[:, :, channel] for channel in range(3))
    reflection = np.clip((red - blue - 24) / 125, 0, 1) * np.clip((green - 140) / 105, 0, 1)
    base = rgb.copy()
    strength = reflection[:, :, None] * .72
    neutral = np.stack((blue * .88 + 34, blue * .78 + 25, blue * 1.05), axis=2)
    base = base * (1 - strength) + neutral * strength

    half = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).crop((0, 0, 836, water_height))
    tile = Image.new("RGB", (1672, water_height))
    tile.paste(half, (0, 0))
    tile.paste(half.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (836, 0))
    water = Image.new("RGBA", SCENE)
    water.alpha_composite(tile.crop((0, 0, SCENE[0], tile.height)).convert("RGBA"), (0, 350))

    x = np.linspace(-1, 1, SCENE[0], dtype=np.float32)
    fixed_path = np.exp(-((x / .16) ** 2))[None, :]
    alpha = np.clip(reflection * fixed_path * 255, 0, 255).astype(np.uint8)
    reflection_crop = Image.fromarray(np.dstack((rgb.astype(np.uint8), alpha)))
    overlay = Image.new("RGBA", SCENE)
    overlay.alpha_composite(reflection_crop, (0, 350))
    return water, overlay


def carriage_light_layers() -> tuple[Image.Image, Image.Image]:
    carriage = np.array(Image.open(CONCEPT / "carriage-foreground-source.png").convert("RGBA"))
    red, green, blue = (carriage[:, :, channel].astype(np.float32) for channel in range(3))
    luma = red * .299 + green * .587 + blue * .114
    warmth = np.clip((red - blue - 16) / 125, 0, 1) * np.clip((luma - 100) / 145, 0, 1)
    base_rgb = carriage[:, :, :3].astype(np.float32)
    base_rgb[:, :, 0] *= 1 - warmth * .09
    base_rgb[:, :, 1] *= 1 - warmth * .045
    base_rgb[:, :, 2] *= 1 + warmth * .012
    base = Image.fromarray(np.dstack((np.clip(base_rgb, 0, 255).astype(np.uint8), carriage[:, :, 3])))
    light_alpha = np.clip(warmth * carriage[:, :, 3] * .58, 0, 255).astype(np.uint8)
    sunlight = Image.fromarray(np.dstack((carriage[:, :, :3], light_alpha)))
    return base, sunlight


def main() -> None:
    source = normalize(Image.open(LEGACY_SOURCE).convert("RGB"))
    sky_source = normalize(Image.open(CONCEPT / "sky-source.png").convert("RGB"))
    sky = Image.new("RGB", SCENE)
    sky.paste(sky_source.crop((0, 110, SCENE[0], SCENE[1])), (0, 0))
    sky.paste(sky_source.crop((0, SCENE[1] - 1, SCENE[0], SCENE[1])).resize((SCENE[0], 110)), (0, SCENE[1] - 110))

    groups = atlas_groups()
    far = skyline_strip(groups, [0, 2, 4, 6, 8], 112, 346, .68)
    near = skyline_strip(groups, [1, 5, 7, 9], 178, 349, .96)
    water, reflection = water_layers(source)
    carriage_base, carriage_sunlight = carriage_light_layers()

    save(sky, "sky")
    save(far.crop((0, 234, SCENE[0], 346)), "skyline-far-strip")
    save(near.crop((0, 171, SCENE[0], 349)), "skyline-near-strip")
    save(bridge_strip(source).crop((0, 333, SCENE[0], 356)), "shore-bridge-strip")
    save(water.crop((0, 350, SCENE[0], SCENE[1])), "water-strip")
    save(reflection.crop((562, 363, 1116, 886)), "water-reflection")
    save(carriage_base, "carriage-base")
    save(carriage_sunlight, "carriage-sunlight")


if __name__ == "__main__":
    main()
