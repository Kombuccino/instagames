import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const output = 'artifacts/vlads-skewers'
const baseUrl = process.env.VLAD_URL || 'http://127.0.0.1:5173'
const quick = Boolean(process.env.VLAD_QUICK)
const configs = quick
  ? [{ name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, touch: true }]
  : [
      { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, touch: true },
      { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, touch: false },
    ]

await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: process.platform === 'win32' ? 'msedge' : undefined })
const report = { scenarios: [], errors: [], httpErrors: [], screenshots: [] }

try {
  for (const config of configs) {
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      deviceScaleFactor: config.deviceScaleFactor,
      hasTouch: config.touch,
    })
    const page = await context.newPage()
    const touchSession = config.touch ? await context.newCDPSession(page) : null
    page.on('pageerror', error => report.errors.push(`${config.name}: ${error.message}`))
    page.on('console', message => {
      if (message.type() !== 'error') return
      const url = message.location().url
      if (url.endsWith('/favicon.ico')) return
      report.errors.push(`${config.name}: ${message.text()} @ ${url}`)
    })
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() }) })
    await page.goto(`${baseUrl}/?game=vlads-skewers`, { waitUntil: 'domcontentloaded' })
    await page.locator('.mf-insert-coin').first().click()
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function' && typeof window.vlad_test_action === 'function')
    await page.waitForTimeout(500)

    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()))
    const advance = ms => page.evaluate(value => window.advanceTime(value), ms)
    const canvas = page.locator('.game-slot[data-index="0"] .mf-phaser-host canvas').first()
    const point = async (x, y) => {
      const box = await canvas.boundingBox()
      assert.ok(box, 'Gameplay canvas must be visible')
      return { x: box.x + x / 390 * box.width, y: box.y + y / 844 * box.height }
    }
    const capture = async name => {
      const path = `${output}/${config.name}-${name}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }

    const initial = await state()
    assert.equal(initial.lives, 3)
    assert.equal(initial.score, 0)
    assert.equal(initial.customerRosterSize, 15)
    assert.equal(initial.skewer.stack.length, 0)

    const probe = JSON.parse(await page.evaluate(() => window.vlad_test_action('tip-probe')))
    const probeId = probe.drops.find(drop => drop.kind === 'pepper')?.id
    assert.ok(probeId, 'Deterministic tip probe must exist')
    const pressAt = async (x, y) => {
      const grip = await point(x, y)
      if (touchSession) await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...grip, id: 1 }] })
      else { await page.mouse.move(grip.x, grip.y); await page.mouse.down() }
      await advance(34)
      if (touchSession) await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      else await page.mouse.up()
    }
    await pressAt(213, 765)
    assert.equal((await state()).skewer.stack.length, 0, 'A press beside the gold tip must not impale')
    assert.ok((await state()).drops.some(drop => drop.id === probeId), 'Near-tip miss must leave the food falling')
    await pressAt(195, 765)
    assert.equal((await state()).skewer.stack.length, 1, 'A press exactly at the gold tip must impale')
    assert.ok(!(await state()).drops.some(drop => drop.id === probeId), 'Exact-tip hit must remove the caught food')
    await page.waitForTimeout(430)
    assert.ok(Math.abs((await state()).skewer.y - 832) < 1, 'Released arm must spring back to the bottom')
    await capture('pointer-impale')

    await page.evaluate(() => window.vlad_test_action('brutality'))
    const brutality = await state()
    assert.equal(brutality.combo, 5)
    assert.equal(brutality.skewer.stack.length, 5)
    assert.ok(brutality.skewer.stack.every(item => item.cooked), 'Completed skewer must be golden/grill-marked')
    assert.equal(brutality.score, 0, 'Impalement presentation must not add score')
    await capture('brutality-x5')

    await page.evaluate(() => window.vlad_test_action('serve'))
    const served = await state()
    assert.equal(served.score, 50, 'Existing 5-food base 10 × combo 5 scoring must remain intact')
    assert.equal(served.served, 1)

    await page.evaluate(() => window.vlad_test_action('lose'))
    assert.equal((await state()).lives, 2)
    await page.waitForTimeout(180)
    await capture('one-life-lost')

    const grillingStart = JSON.parse(await page.evaluate(() => window.vlad_test_action('grill')))
    const grillingId = grillingStart.drops.find(drop => drop.state === 'grilling')?.id
    assert.ok(grillingId, 'Deterministic grill probe must exist')
    await advance(520)
    const cooked = await state()
    assert.ok(cooked.drops.some(drop => drop.state === 'grilling'))
    await capture('grill-appetizing')
    await advance(1250)
    await capture('grill-charred')
    await advance(700)
    await page.waitForTimeout(260)
    assert.ok(!(await state()).drops.some(drop => drop.id === grillingId), 'Overcooked food must ash and disappear')

    report.scenarios.push({
      name: config.name,
      passed: true,
      input: `${config.touch ? 'CDP touch' : 'mouse'} impalement + deterministic DEV art-state probes`,
      scorePreserved: served.score,
      logicalViewport: '390x844 uniform FIT',
    })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.httpErrors, [])
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}

console.log(JSON.stringify(report.scenarios, null, 2))
