from pathlib import Path

from PIL import Image


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


def contain(image: Image.Image, bounds: tuple[int, int]) -> Image.Image:
    width, height = bounds
    ratio = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    return image.resize(size, Image.Resampling.LANCZOS)


for name, bounds in SPECS.items():
    source = Image.open(MASTERS / f"{name}.png").convert("RGBA")
    contain(source, bounds).save(OUTPUT / f"{name}.webp", "WEBP", lossless=True, method=6)

print(f"Built {len(SPECS)} lossless runtime assets in {OUTPUT}")
