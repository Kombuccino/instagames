from pathlib import Path

path = Path('scripts/test-linefugg-browser.mjs')
text = path.read_text()
old = """    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const redrawn = await state()
    assert.equal(redrawn.lines[2].rerollKey, full.lines[2].rerollKey, 'Same ordered line produces the same reroll key')
"""
new = """    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const redrawn = await state()
    assert.equal(redrawn.lines[2].rerollKey, full.lines[2].rerollKey, 'Same ordered line produces the same reroll key')
"""
count = text.count(old)
if count != 1:
    raise RuntimeError(f'expected redraw comparison block once, got {count}')
path.write_text(text.replace(old, new, 1))
