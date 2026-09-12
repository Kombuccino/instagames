from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "generated" / "platform" / "ui" / "coin-console-90s"
MASTERS = OUTPUT / "masters"

SPECS = {
    "console-chassis": (780, 264),
    "play-idle": (224, 140),
    "play-glow-medium": (224, 140),
    "play-glow-peak": (224, 140),
    "play-pressed": (224, 140),
    "prev-idle": (164, 76),
    "prev-pressed": (164, 76),
    "next-idle": (164, 76),
    "next-pressed": (164, 76),
    "return-exit-idle": (100, 100),
    "return-exit-focus": (100, 100),
    "return-exit-pressed": (100, 100),
    "coin-counter-frame": (224, 92),
    "coin-front": (68, 68),
    "coin-yaw-30": (68, 68),
    "coin-yaw-65": (68, 68),
    "coin-edge": (68, 68),
}

PLAY_ATLAS_STATES = (
    "play-idle",
    "play-glow-medium",
    "play-glow-peak",
    "play-pressed",
)
PLAY_ATLAS_CELL = (545, 357)
PLAY_RUNTIME_CELL = (224, 140)


def contain(image: Image.Image, bounds: tuple[int, int]) -> Image.Image:
    width, height = bounds
    ratio = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    return image.resize(size, Image.Resampling.LANCZOS)


def play_state_atlas() -> Image.Image:
    """Normalize independently generated states around one immutable bezel."""
    width, height = PLAY_ATLAS_CELL
    base = Image.open(MASTERS / "play-idle.png").convert("RGBA").resize(
        PLAY_ATLAS_CELL, Image.Resampling.LANCZOS
    )
    glow_mask = Image.new("L", PLAY_ATLAS_CELL, 0)
    glow_mask.paste(255, (72, 72, 473, 290))
    glow_mask = glow_mask.filter(ImageFilter.GaussianBlur(18))
    pressed_mask = Image.new("L", PLAY_ATLAS_CELL, 0)
    pressed_mask.paste(255, (54, 54, 491, 307))
    pressed_mask = pressed_mask.filter(ImageFilter.GaussianBlur(5))

    frames = []
    glow_levels = {
        "play-glow-medium": 1.20,
        "play-glow-peak": 1.42,
    }
    for index, name in enumerate(PLAY_ATLAS_STATES):
        if name == "play-idle":
            frame = base.copy()
        elif name in glow_levels:
            state = ImageEnhance.Brightness(base).enhance(glow_levels[name])
            frame = Image.composite(state, base, glow_mask)
        else:
            state = Image.open(MASTERS / f"{name}.png").convert("RGBA").resize(
                PLAY_ATLAS_CELL, Image.Resampling.LANCZOS
            )
            frame = Image.composite(state, base, pressed_mask)
        frames.append(frame)

    atlas = Image.new("RGBA", (width * len(frames), height), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.paste(frame, (index * width, 0))
    return atlas


for name, bounds in SPECS.items():
    source = Image.open(MASTERS / f"{name}.png").convert("RGBA")
    contain(source, bounds).save(OUTPUT / f"{name}.webp", "WEBP", lossless=True, method=6)

atlas = play_state_atlas()
atlas.save(MASTERS / "play-states-atlas.png", "PNG", optimize=True)
atlas.resize(
    (PLAY_RUNTIME_CELL[0] * len(PLAY_ATLAS_STATES), PLAY_RUNTIME_CELL[1]),
    Image.Resampling.LANCZOS,
).save(OUTPUT / "play-states-atlas.webp", "WEBP", lossless=True, method=6)

print(f"Built {len(SPECS)} lossless runtime assets and the normalized PLAY atlas in {OUTPUT}")
