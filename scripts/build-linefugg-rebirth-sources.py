from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path('public/assets/generated/linefugg/rebirth')
SOURCE = ROOT / 'da' / 'linefugg-rebirth-editorial-paper-lab-390x850-r2.webp'
OUT = ROOT / 'sources'
OUT.mkdir(parents=True, exist_ok=True)

img = Image.open(SOURCE).convert('RGBA')
if img.size != (390, 850):
    raise SystemExit(f'Unexpected DA source size: {img.size}')

# Lossless approved production reference. REFERENCE ONLY: dynamic values remain baked here.
img.save(OUT / 'da-master-approved-390x850.png', optimize=True)

# Real production texture source: clean paper sample, no gameplay values.
paper = img.crop((78, 0, 238, 96)).copy()
paper.save(OUT / 'paper-texture-source-160x96.png', optimize=True)


def tinted_plate(name, size, rgba):
    base = paper.resize(size, Image.Resampling.LANCZOS).convert('RGBA')
    tint = Image.new('RGBA', size, rgba)
    Image.alpha_composite(base, tint).save(OUT / name, optimize=True)

# Structural surfaces. Text/formulas are engine-owned and are not baked into these files.
tinted_plate('result-plate-red-86x40.png', (86, 40), (198, 82, 72, 55))
tinted_plate('result-plate-blue-86x40.png', (86, 40), (70, 145, 185, 55))
tinted_plate('result-plate-green-86x40.png', (86, 40), (74, 128, 80, 55))
tinted_plate('total-plate-140x62.png', (140, 62), (80, 80, 75, 35))


def circle_source(cx, cy, size, name):
    half = size // 2
    crop = img.crop((cx - half, cy - half, cx - half + size, cy - half + size)).copy()
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((2, 2, size - 3, size - 3), fill=255)
    crop.putalpha(mask.filter(ImageFilter.GaussianBlur(0.8)))
    crop.save(OUT / name, optimize=True)

# Isolated control sources at native scale. Further state variants remain explicit TODOs.
circle_source(107, 760, 118, 'control-undo-source-118.png')
circle_source(286, 760, 118, 'control-validate-source-118.png')

expected = {
    'da-master-approved-390x850.png': (390, 850),
    'paper-texture-source-160x96.png': (160, 96),
    'result-plate-red-86x40.png': (86, 40),
    'result-plate-blue-86x40.png': (86, 40),
    'result-plate-green-86x40.png': (86, 40),
    'total-plate-140x62.png': (140, 62),
    'control-undo-source-118.png': (118, 118),
    'control-validate-source-118.png': (118, 118),
}
for name, size in expected.items():
    actual = Image.open(OUT / name).size
    if actual != size:
        raise SystemExit(f'{name}: expected {size}, got {actual}')
print('LineFugg Rebirth production sources generated:', ', '.join(expected))
