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
      const box = await page.locator('.mf-phaser-host canvas').boundingBox()
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
    await capture('empty')
    await trace({ row: 0, col: 0 }, { row: 0, col: 4 }, true)
    assert.equal((await state()).drag.cells.length, 5)
    await capture('drag')
    await release(); await page.waitForTimeout(350)
    assert.equal((await state()).lines.length, 1)
    await capture('one')
    await trace({ row: 0, col: 0 }, { row: 0, col: 4 })
    assert.equal((await state()).lines.length, 1, 'Reject overlapping duplicate line')
    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const full = await state()
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
    await clickControl('undo')
    assert.equal((await state()).lines.length, 2)
    assert.equal((await state()).validateEnabled, false)
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
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
    assert.equal(await page.locator('.mf-phaser-host canvas').count(), 1)
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
