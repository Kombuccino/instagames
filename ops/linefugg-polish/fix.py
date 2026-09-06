from pathlib import Path

path = Path('ops/linefugg-polish/apply.py')
text = path.read_text()
old = '''replace_once(\n    "src/games/linefugg/LineFuggScene.ts",\n    """  background: ['linefugg-orbital-bg-v5', `${ASSET_ROOT}/backgrounds/orbital-stage-bg-v5.png`],\n""",\n    """,\n)\n'''
new = '''replace_once(\n    "src/games/linefugg/LineFuggScene.ts",\n    """  background: ['linefugg-orbital-bg-v5', `${ASSET_ROOT}/backgrounds/orbital-stage-bg-v5.png`],\n""",\n    "",\n)\n'''
if old not in text:
    raise SystemExit('malformed empty replacement block not found')
path.write_text(text.replace(old, new, 1))
print('temporary patch script repaired')
