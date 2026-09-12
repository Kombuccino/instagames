import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

// Self-contained: starts Vite, verifies preserved approved PNG references and
// exercises the full-height static WebP restorations. No production API writes.
const output = 'artifacts/linefugg-covers'
await fs.mkdir(output, { recursive: true })
const receipt = JSON.parse(await fs.readFile('ops/drive-asset-sync/imports/linefugg-covers-2026-09-07.json', 'utf8'))
const runtimeFile = edition => `linefugg-cover-${edition}.webp`
const expected = receipt.assets.map(asset => `/assets/generated/linefugg/welcome/variants/runtime/${runtimeFile(asset.edition)}`)
const vladExpected = [
  'vlad-cover-01-chaos.webp',
  'vlad-cover-02-still-life.webp',
  'vlad-cover-03-japanese-portrait.webp',
  'vlad-cover-04-castle-sign.webp',
  'vlad-cover-05-japanese-stall.webp',
].map(file => `/assets/generated/vlads-skewers/welcome/variants/runtime/${file}`)
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
  const { VLADS_SKEWERS_WELCOME } = await server.ssrLoadModule('/src/games/vlads-skewers/welcome.ts')
  assert.deepEqual(LINEFUGG_WELCOME.variants.map(variant => variant.image), expected)
  assert.equal(LINEFUGG_WELCOME.motion, 'none')
  assert.equal(LINEFUGG_WELCOME.selection, 'seeded')
  for (const variant of LINEFUGG_WELCOME.variants) {
    assert.equal(variant.runtime, 'static')
    assert.equal(variant.unlockScore, 0)
    assert.equal(variant.fit, 'cover')
    assert.equal(variant.objectPosition, 'top center')
    assert.ok(!variant.layers?.length)
    assert.match(variant.image, /\/runtime\/.*\.webp$/)
  }
  assert.deepEqual(VLADS_SKEWERS_WELCOME.variants.map(variant => variant.image), vladExpected)
  assert.equal(VLADS_SKEWERS_WELCOME.motion, 'none')
  assert.equal(VLADS_SKEWERS_WELCOME.selection, 'seeded')
  for (const variant of VLADS_SKEWERS_WELCOME.variants) {
    assert.equal(variant.runtime, 'static')
    assert.equal(variant.unlockScore, 0)
    assert.equal(variant.fit, 'cover')
    assert.equal(variant.objectPosition, 'top center')
    assert.ok(!variant.layers?.length)
  }
  await server.listen()
  browser = await chromium.launch({ headless: true })
  const formats = [
    { name: 'a54-brave', width: 360, height: 611, deviceScaleFactor: 2, hasTouch: true },
    { name: 'master', width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true },
    { name: 'desktop', width: 1280, height: 720, deviceScaleFactor: 1 },
  ]
  for (const format of formats) {
    const context = await browser.newContext({ viewport: { width: format.width, height: format.height },
      deviceScaleFactor: format.deviceScaleFactor, hasTouch: Boolean(format.hasTouch) })
    const page = await context.newPage()
    const coverRequests = []
    // Exercise the client's existing unavailable-API fallback, not live services.
    await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"isolated browser test"}' }))
    page.on('pageerror', error => report.errors.push(`${format.name}: ${error.message}`))
    page.on('request', request => {
      if (request.url().includes('/assets/generated/linefugg/welcome/variants/') || request.url().includes('/assets/generated/vlads-skewers/welcome/variants/')) coverRequests.push(request.url())
    })
    page.on('response', response => {
      if (response.status() >= 400 && (response.url().includes('/assets/generated/linefugg/welcome/variants/') || response.url().includes('/assets/generated/vlads-skewers/welcome/variants/'))) {
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
      const value = await art.evaluate(image => {
        const box = image.getBoundingClientRect()
        const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
        return { src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight,
          fit: getComputedStyle(image).objectFit, overflow: getComputedStyle(image.parentElement).overflow,
          paintedWidth: image.naturalWidth * scale, paintedHeight: image.naturalHeight * scale,
          boxWidth: box.width, boxHeight: box.height }
      })
      assert.ok(expected.includes(value.src), `Unexpected cover ${value.src}`)
      if (expectedSrc) assert.equal(value.src, expectedSrc)
      assert.deepEqual([value.width, value.height], [780, 1688])
      assert.equal(value.fit, 'cover', 'The authored 390 × 844 restoration must fill the Cover')
      assert.equal(value.overflow, 'hidden', 'The continuous lower escape stays inside the cover slot')
      assert.ok(value.paintedWidth + .01 >= value.boxWidth && value.paintedHeight + .01 >= value.boxHeight)
      assert.equal(await shell.getAttribute('data-cover-migration'), 'current')
      assert.ok(!/METTRE/i.test(await shell.evaluate(element => getComputedStyle(element, '::after').content)))
      assert.equal(await shell.locator('canvas').count(), 0, 'Static covers must not create a Phaser cover canvas')
      assert.equal(await art.evaluate(image => getComputedStyle(image).animationName), 'none')
      const playBox = await shell.locator('.mf-insert-coin').boundingBox()
      const coverBox = await art.boundingBox()
      assert.ok(playBox && coverBox && playBox.y > coverBox.y + coverBox.height * .72, 'JOUER must overlap only the expendable lower cover zone')
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
    assert.ok(coverRequests.some(url => url.endsWith('.webp')), 'Runtime must request optimized WebP covers')
    assert.equal(coverRequests.some(url => /approved-2026-09-07\.png(?:\?|$)/.test(url)), false, 'Runtime must not request preserved PNG masters')
    const box = await card.boundingBox()
    if (format.width >= 760) assert.ok(box.width <= 520.1, 'Do not widen the Core desktop column')
    await click(shell.locator('.mf-insert-coin'))
    await page.waitForFunction(() => document.querySelector('.game-card[aria-label="LineFugg"]')?.getAttribute('data-phase') === 'playing')
    await card.locator('.mf-phaser-host canvas').waitFor({ state: 'visible' })
    await click(card.getByRole('button', { name: 'Return to cover', exact: true }))
    await art.waitFor({ state: 'visible' })
    await assertArt()
    await page.goto('http://127.0.0.1:5176/?game=vlads-skewers')
    const vladCard = page.locator('.game-card[aria-label="Les Brochettes de Vlad"]').first()
    const vladShell = vladCard.locator('.mf-cover-shell')
    const vladArt = vladShell.locator('.mf-core-selected-cover > img')
    await vladArt.waitFor({ state: 'visible' })
    for (let index = 0; index < vladExpected.length; index++) {
      await click(vladShell.getByRole('button', { name: 'Info', exact: true }))
      const buttons = vladShell.locator('.mf-cover-grid button')
      assert.equal(await buttons.count(), 5)
      await click(buttons.nth(index))
      await click(vladShell.getByRole('button', { name: 'Close', exact: true }))
      await vladArt.evaluate(image => image.decode())
      const value = await vladArt.evaluate(image => ({
        src: image.getAttribute('src'),
        width: image.naturalWidth,
        height: image.naturalHeight,
        fit: getComputedStyle(image).objectFit,
        position: getComputedStyle(image).objectPosition,
      }))
      assert.equal(value.src, vladExpected[index])
      assert.deepEqual([value.width, value.height], [780, 1688])
      assert.equal(value.fit, 'cover')
      assert.equal(value.position, '50% 0%')
      assert.equal(await vladShell.locator('canvas').count(), 0)
      const playBox = await vladShell.locator('.mf-insert-coin').boundingBox()
      const coverBox = await vladArt.boundingBox()
      assert.ok(playBox && coverBox && playBox.y > coverBox.y + coverBox.height * .72, 'JOUER must overlap only the expendable lower cover zone')
      const path = `${output}/${format.name}-vlad-${index + 1}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }
    assert.ok(coverRequests.some(url => url.includes('/vlads-skewers/') && url.endsWith('.webp')), 'Vlad runtime must request full-height WebP covers')
    // Pending games retain their marker; the removal is not a global CSS hack.
    await page.goto('http://127.0.0.1:5176/?game=train-fighter')
    const pending = page.locator('.game-card[aria-label="Train Fighter"] .mf-cover-shell').first()
    await pending.waitFor({ state: 'visible' })
    assert.equal(await pending.getAttribute('data-cover-migration'), 'update-required')
    assert.match(await pending.evaluate(element => getComputedStyle(element, '::after').content), /A METTRE A JOUR/)
    assert.equal(await pending.locator('.mf-core-selected-cover > img').evaluate(image => getComputedStyle(image).objectFit), 'cover')
    report.scenarios.push({ name: format.name, passed: true, lineEditions: 4, vladEditions: 5, input: format.hasTouch ? 'touch' : 'mouse', launchAndReturn: true, otherBadgesPreserved: true, fullFramePreserved: true, playOverlapChecked: true, optimizedRuntime: true })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
