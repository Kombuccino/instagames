from pathlib import Path

path = Path('scripts/test-linefugg-browser.mjs')
text = path.read_text()
old = "page.locator('.mf-phaser-host canvas')"
new = "page.locator('.game-card[aria-label=\"LineFugg\"] .mf-phaser-host canvas')"
count = text.count(old)
if count != 2:
    raise RuntimeError(f'expected 2 unscoped LineFugg canvas locators, got {count}')
path.write_text(text.replace(old, new))
