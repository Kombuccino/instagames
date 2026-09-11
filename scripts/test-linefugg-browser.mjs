import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const output = 'artifacts/linefugg'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: process.platform === 'win32' ? 'msedge' : undefined })
const report = { scenarios: [], errors: [], warnings: [], httpErrors: [], screenshots: [] }
const configs = process.env.LINEFUGG_QUICK ? [{ name: 'phone', width: 390, height: 844, deviceScaleFactor: 2 }]
  : [{ name: 'small-phone', width: 360, height: 640, deviceScaleFactor: 2 },
    { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2 },
    { name: 'long-phone', width: 430, height: 932, deviceScaleFactor: 3 },
    { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
    { name: 'reduced-motion', width: 390, height: 844, deviceScaleFactor: 2, reducedMotion: 'reduce' }]
try {
  for (const config of configs) {
    const context = await browser.newContext({ viewport: { width: config.width, height: config.height },
      deviceScaleFactor: config.deviceScaleFactor, reducedMotion: config.reducedMotion, hasTouch: config.name.includes('phone') })
    const page = await context.newPage()
    const touch = config.name.includes('phone') ? await context.newCDPSession(page) : null
    const release = async () => {
      if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      else await page.mouse.up()
    }
    page.on('pageerror', error => report.errors.push(`${config.name}: ${error.message}`))
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() }) })
    page.on('console', message => {
      if (message.type() !== 'error') return
      const record = `${config.name}: ${message.text()} @ ${message.location().url}`
      // Existing Core favicon request is unrelated to game resources; report it.
      if (message.location().url.endsWith('/favicon.ico')) report.warnings.push(record)
      else report.errors.push(record)
    })
    await page.goto('http://127.0.0.1:5175/?game=linefugg')
    await page.locator('.mf-insert-coin').first().click()
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function')
    await page.waitForTimeout(600)
    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()))
    const capture = async (name) => {
      const path = `${output}/${config.name}-${name}.png`
      await page.screenshot({ path }); report.screenshots.push(path)
    }
    const pixel = async (x, y) => {
      const box = await page.locator('.game-card[aria-label="LineFugg"] .mf-phaser-host canvas').boundingBox()
      return { x: box.x + x / 390 * box.width, y: box.y + y / 844 * box.height }
    }
    const trace = async (start, end, hold = false) => {
      const { boardBounds: b } = await state()
      const a = await pixel(b.x + (start.col + 0.5) * b.size / 7, b.y + (start.row + 0.5) * b.size / 7)
      const z = await pixel(b.x + (end.col + 0.5) * b.size / 7, b.y + (end.row + 0.5) * b.size / 7)
      if (touch) {
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
        for (let step = 1; step <= 8; step++) await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: a.x + (z.x - a.x) * step / 8, y: a.y + (z.y - a.y) * step / 8, id: 1 }],
        })
      } else {
        await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(z.x, z.y, { steps: 8 })
      }
      if (!hold) await release()
      await page.waitForTimeout(240)
    }
    const clickControl = async (name) => {
      const control = (await state()).controls[name]
      const point = await pixel(control.x, control.y)
      if (touch) await page.touchscreen.tap(point.x, point.y)
      else await page.mouse.click(point.x, point.y)
      await page.waitForTimeout(260)
    }
    const initial = await state()
    assert.equal(initial.lines.length, 0)
    assert.equal(initial.validateEnabled, false)
    assert.equal(initial.reducedMotion, config.reducedMotion === 'reduce')
    assert.ok(initial.board.every(cell => cell.kind !== 'add' || cell.value >= 0 || (cell.value >= -4 && cell.value <= -1)), 'Negative cells stay between -1 and -4')
    const canvasBox = await page.locator('.game-card[aria-label="LineFugg"] .mf-phaser-host canvas').boundingBox()
    const hostBox = await page.locator('.game-card[aria-label="LineFugg"] .mf-phaser-host').boundingBox()
    assert.ok(canvasBox && hostBox, 'Gameplay host and canvas are measurable')
    const logicalY = y => canvasBox.y + y / 844 * canvasBox.height
    assert.ok(logicalY(initial.essentialBounds.top) >= hostBox.y - 1, `${config.name}: board stays inside the visible MiniFugg zone`)
    assert.ok(logicalY(initial.essentialBounds.bottom) <= hostBox.y + hostBox.height + 1, `${config.name}: lower controls stay inside the visible MiniFugg zone`)
    await capture('empty')
    await trace({ row: 0, col: 0 }, { row: 0, col: 4 }, true)
    assert.equal((await state()).drag.cells.length, 5)
    await capture('drag')
    await release()
    if (config.reducedMotion !== 'reduce') {
      await page.waitForFunction(() => {
        const value = JSON.parse(window.render_game_to_text())
        return value.rerolling && value.dimensionSlots.includes(1) && value.dimensionSlots.includes(0)
      }, null, { timeout: 1500 })
      await capture('reroll-cascade')
    }
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    await page.waitForTimeout(80)
    const afterFirst = await state()
    assert.equal(afterFirst.lines.length, 1)
    assert.ok(Number.isInteger(afterFirst.lines[0].rerollKey), 'Placed line exposes a deterministic reroll key')
    assert.ok(afterFirst.board.every(cell => cell.kind !== 'add' || cell.value >= 0 || (cell.value >= -4 && cell.value <= -1)), 'Rerolled negatives stay between -1 and -4')
    const firstProtected = new Set(afterFirst.lines[0].cells.map(cell => `${cell.row}:${cell.col}`))
    let changedOutsideFirstLine = 0
    for (let index = 0; index < initial.board.length; index++) {
      const key = `${Math.floor(index / 7)}:${index % 7}`
      if (firstProtected.has(key)) assert.deepEqual(afterFirst.board[index], initial.board[index], 'Line cells survive their reroll')
      else if (JSON.stringify(afterFirst.board[index]) !== JSON.stringify(initial.board[index])) changedOutsideFirstLine += 1
    }
    assert.ok(changedOutsideFirstLine > 0, 'At least one cell outside the placed line is rerolled')
    for (let index = 0; index < afterFirst.dimensionSlots.length; index++) {
      const key = `${Math.floor(index / 7)}:${index % 7}`
      if (!firstProtected.has(key)) assert.equal(afterFirst.dimensionSlots[index], 1, 'Free cells move to violet dimension after line one')
    }
    await capture('one')
    if (!touch) {
      const control = (await state()).controls.undo
      const position = await pixel(control.x, control.y)
      await page.mouse.move(position.x, position.y)
      await page.waitForTimeout(100)
      assert.equal((await state()).undoHovered, true)
      await capture('undo-hover')
      await page.mouse.move(0, 0)
      await page.waitForTimeout(100)
      assert.equal((await state()).undoHovered, false)
      assert.equal((await state()).lines.length, 1, 'Hover never undoes a line')
    }
    await trace({ row: 0, col: 0 }, { row: 0, col: 4 })
    assert.equal((await state()).lines.length, 1, 'Reject overlapping duplicate line')
    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const afterSecond = await state()
    assert.ok(afterSecond.dimensionSlots.includes(2), 'Free cells move to gold dimension after line two')
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const full = await state()
    assert.ok(full.dimensionSlots.includes(-1), 'Free cells return neutral after the third line')
    assert.equal(full.lines.length, 3)
    assert.equal(full.validateEnabled, true)
    assert.equal(full.finished, false, 'Third line does not auto-submit')
    for (const line of full.lines) {
      let expected = 0
      for (const cell of line.cells) {
        const value = full.board[cell.row * 7 + cell.col]
        expected = value.kind === 'add' ? expected + value.value : value.kind === 'multiply' ? expected * value.value : expected / value.value
      }
      assert.equal(line.score, Math.round(expected * 100) / 100)
    }
    await capture('three')
    if (!touch) {
      const control = (await state()).controls.validate
      const position = await pixel(control.x, control.y)
      await page.mouse.move(position.x, position.y)
      await page.waitForTimeout(120)
      assert.equal((await state()).validateAppearance, 'amber')
      assert.equal((await state()).finished, false, 'Hover is not submission')
      await capture('validate-hover')
      await page.mouse.move(0, 0)
      await page.waitForTimeout(120)
      assert.equal((await state()).validateAppearance, 'green')
    }
    await clickControl('undo')
    const undone = await state()
    assert.equal(undone.lines.length, 2)
    assert.equal(undone.validateEnabled, false)
    assert.equal(undone.validateAppearance, 'disabled')
    assert.deepEqual(undone.board, afterSecond.board, 'Undo restores the exact board before the removed line reroll')
    assert.deepEqual(undone.dimensionSlots, afterSecond.dimensionSlots, 'Undo restores the previous dimension tint state')
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const redrawn = await state()
    assert.equal(redrawn.lines[2].rerollKey, full.lines[2].rerollKey, 'Same ordered line produces the same reroll key')
    assert.deepEqual(redrawn.board, full.board, 'Same line and key reproduce the same rerolled board')
    const frameIntervals = await page.evaluate(() => new Promise(resolve => {
      const samples = []; let previous
      const step = t => { if (previous) samples.push(t - previous); previous = t
        if (samples.length < 90) requestAnimationFrame(step); else resolve(samples.sort((a, b) => a - b)) }
      requestAnimationFrame(step)
    }))
    await clickControl('validate'); await page.waitForTimeout(550)
    await capture('submitted')
    // Core owns results; closing remounts an inactive game behind its cover.
    await page.getByRole('button', { name: /REPLAY/ }).click()
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function')
    await page.waitForTimeout(350)
    assert.equal((await state()).lines.length, 0)
    assert.deepEqual((await state()).board, initial.board, 'Daily board unchanged by restart/art')
    await page.getByRole('button', { name: 'Return to cover', exact: true }).click()
    await page.waitForTimeout(600)
    assert.equal(await page.locator('.game-card[aria-label="LineFugg"] .mf-phaser-host canvas').count(), 1)
    assert.equal(await page.locator('.game-card[data-phase="playing"]').count(), 0)
    assert.equal(await page.evaluate(() => typeof window.render_game_to_text), 'undefined', 'Destroyed scene removes its debug hook')
    report.scenarios.push({ name: config.name, passed: true, logicalBoard: initial.boardBounds,
      textureRGBABytes: initial.textures.reduce((sum, t) => sum + t.width * t.height * 4, 0),
      browserFrameMedianMs: frameIntervals[45], browserFrameP95Ms: frameIntervals[85],
      input: touch ? 'CDP touch start/move/end + touchscreen taps' : 'mouse',
      note: 'Browser emulation on host, not physical mobile GPU.' })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report.scenarios, null, 2))
