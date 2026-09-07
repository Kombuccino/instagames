import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

// Self-contained: starts Vite, checks original bytes and exercises the actual
// Core cover UI. No production API writes; no image generation or optimization.
const output = 'artifacts/linefugg-covers'
await fs.mkdir(output, { recursive: true })
const receipt = JSON.parse(await fs.readFile('ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json', 'utf8'))
const expected = receipt.assets.map(asset => `/assets/imported/linefugg/welcome/variants/${asset.file}`)
const report = { assets: [], scenarios: [], errors: [], screenshots: [] }
for (const asset of receipt.assets) {
  const bytes = await fs.readFile(`${receipt.repository_prefix}${asset.file}`)
  assert.equal(bytes.length, asset.bytes, asset.file)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.file)
  assert.equal(bytes.readUInt32BE(16), asset.width)
  assert.equal(bytes.readUInt32BE(20), asset.height)
  report.assets.push({ file: asset.file, originalBytesVerified: true })
}

const server = await createServer({ server: { host: '127.0.0.1', port: 5176, strictPort: true } })
let browser
try {
  const { LINEFUGG_WELCOME } = await server.ssrLoadModule('/src/games/linefugg/welcome.ts')
  assert.deepEqual(LINEFUGG_WELCOME.variants.map(variant => variant.image), expected)
  assert.equal(LINEFUGG_WELCOME.motion, 'none')
  assert.equal(LINEFUGG_WELCOME.selection, 'seeded')
  for (const variant of LINEFUGG_WELCOME.variants) {
    assert.equal(variant.runtime, 'static')
    assert.equal(variant.unlockScore, 0)
    assert.ok(!variant.layers?.length)
  }
  await server.listen()
  browser = await chromium.launch({ headless: true })
  const formats = [
    { name: 'small-phone', width: 360, height: 640, deviceScaleFactor: 2, hasTouch: true },
    { name: 'tall-phone', width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true },
    { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 2 },
    { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  ]
  for (const format of formats) {
    const context = await browser.newContext({ viewport: { width: format.width, height: format.height },
      deviceScaleFactor: format.deviceScaleFactor, hasTouch: Boolean(format.hasTouch) })
    const page = await context.newPage()
    // Exercise the client's existing unavailable-API fallback, not live services.
    await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"isolated browser test"}' }))
    page.on('pageerror', error => report.errors.push(`${format.name}: ${error.message}`))
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/assets/imported/linefugg/welcome/variants/')) {
        report.errors.push(`${format.name}: ${response.status()} ${response.url()}`)
      }
    })
    await page.goto('http://127.0.0.1:5176/?game=linefugg')
    const card = page.locator('.game-card[aria-label="LineFugg"]').first()
    const shell = card.locator('.mf-cover-shell')
    const art = shell.locator('.mf-core-selected-cover > img')
    const click = async locator => format.hasTouch ? locator.tap() : locator.click()
    const assertArt = async expectedSrc => {
      await art.evaluate(image => image.decode())
      const value = await art.evaluate(image => ({ src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight }))
      assert.ok(expected.includes(value.src), `Unexpected cover ${value.src}`)
      if (expectedSrc) assert.equal(value.src, expectedSrc)
      assert.deepEqual([value.width, value.height], [941, 1672])
      assert.equal(await shell.getAttribute('data-cover-migration'), 'current')
      assert.ok(!/METTRE/i.test(await shell.evaluate(element => getComputedStyle(element, '::after').content)))
      assert.equal(await shell.locator('canvas').count(), 0, 'Static covers must not create a Phaser cover canvas')
      assert.equal(await art.evaluate(image => getComputedStyle(image).animationName), 'none')
    }
    await art.waitFor({ state: 'visible' })
    await assertArt()
    const first = await art.getAttribute('src')
    await page.waitForTimeout(250)
    assert.equal(await art.getAttribute('src'), first, 'No timed rotation of still covers')
    for (let index = 0; index < expected.length; index++) {
      await click(shell.getByRole('button', { name: 'Info', exact: true }))
      const buttons = shell.locator('.mf-cover-grid button')
      assert.equal(await buttons.count(), 4)
      assert.equal(await buttons.nth(index).isEnabled(), true)
      await click(buttons.nth(index))
      await click(shell.getByRole('button', { name: 'Close', exact: true }))
      await assertArt(expected[index])
      const path = `${output}/${format.name}-${receipt.assets[index].edition}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }
    const box = await card.boundingBox()
    if (format.width >= 760) assert.ok(box.width <= 520.1, 'Do not widen the Core desktop column')
    await click(shell.locator('.mf-insert-coin'))
    await page.waitForFunction(() => document.querySelector('.game-card[aria-label="LineFugg"]')?.getAttribute('data-phase') === 'playing')
    await card.locator('.mf-phaser-host canvas').waitFor({ state: 'visible' })
    await click(card.getByRole('button', { name: 'Return to cover', exact: true }))
    await art.waitFor({ state: 'visible' })
    await assertArt()
    // Pending games retain their marker; the removal is not a global CSS hack.
    await page.goto('http://127.0.0.1:5176/?game=train-fighter')
    const pending = page.locator('.game-card[aria-label="Train Fighter"] .mf-cover-shell').first()
    await pending.waitFor({ state: 'visible' })
    assert.equal(await pending.getAttribute('data-cover-migration'), 'update-required')
    assert.match(await pending.evaluate(element => getComputedStyle(element, '::after').content), /A METTRE A JOUR/)
    report.scenarios.push({ name: format.name, passed: true, editions: 4, input: format.hasTouch ? 'touch' : 'mouse', launchAndReturn: true, otherBadgesPreserved: true })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
