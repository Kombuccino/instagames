import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/tetramindfck-covers'
await fs.mkdir(output, { recursive: true })

const editions = [
  ['pulp-euro', 0, 'v1-pulp-euro.webp'],
  ['micro-euro', 5_000, 'v2-micro-euro.webp'],
  ['graphic-poster', 15_000, 'v3-graphic-poster.webp'],
  ['japanese-edition', 30_000, 'v4-japanese-edition.webp'],
].map(([id, unlockScore, file]) => ({
  id,
  unlockScore,
  file,
  src: `/assets/generated/tetramindfck/welcome/variants/runtime/${file}`,
}))

const report = { assets: [], scenarios: [], errors: [], screenshots: [] }
for (const edition of editions) {
  const bytes = await fs.readFile(`public${edition.src}`)
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', edition.file)
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', edition.file)
  assert.equal(bytes.toString('ascii', 12, 16), 'VP8L', `${edition.file} must be lossless WebP`)
  report.assets.push({ file: edition.file, losslessWebpVerified: true })
}

const server = await createServer({
  configFile: false,
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5177, strictPort: true },
})
let browser
try {
  const { TETRAMINDFCK_WELCOME } = await server.ssrLoadModule('/src/games/calc-drop/welcome.ts')
  assert.equal(TETRAMINDFCK_WELCOME.motion, 'none')
  assert.equal(TETRAMINDFCK_WELCOME.selection, 'seeded')
  assert.deepEqual(
    TETRAMINDFCK_WELCOME.variants.map(({ id, image, unlockScore }) => ({ id, src: image, unlockScore })),
    editions.map(({ id, src, unlockScore }) => ({ id, src, unlockScore })),
  )
  for (const variant of TETRAMINDFCK_WELCOME.variants) {
    assert.equal(variant.runtime, 'static')
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
    const context = await browser.newContext({
      viewport: { width: format.width, height: format.height },
      deviceScaleFactor: format.deviceScaleFactor,
      hasTouch: Boolean(format.hasTouch),
    })
    const page = await context.newPage()
    await page.route('**/api/**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"error":"isolated browser test"}',
    }))
    page.on('pageerror', error => report.errors.push(`${format.name}: ${error.message}`))
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/assets/generated/tetramindfck/welcome/variants/')) {
        report.errors.push(`${format.name}: ${response.status()} ${response.url()}`)
      }
    })

    await page.goto('http://127.0.0.1:5177/?game=tetramindfck')
    const card = page.locator('.game-card[aria-label="TetraMindFck"]').first()
    const shell = card.locator('.mf-cover-shell')
    const art = shell.locator('.mf-core-selected-cover > img')
    const click = locator => format.hasTouch ? locator.tap() : locator.click()
    await art.waitFor({ state: 'visible' })

    for (let index = 0; index < editions.length; index++) {
      await click(shell.getByRole('button', { name: 'Info', exact: true }))
      const buttons = shell.locator('.mf-cover-grid button')
      assert.equal(await buttons.count(), 4)
      assert.equal(await buttons.nth(index).isEnabled(), true)
      await click(buttons.nth(index))
      await click(shell.getByRole('button', { name: 'Close', exact: true }))
      await art.evaluate(image => image.decode())

      const value = await art.evaluate(image => {
        const box = image.getBoundingClientRect()
        const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
        return {
          src: image.getAttribute('src'),
          width: image.naturalWidth,
          height: image.naturalHeight,
          fit: getComputedStyle(image).objectFit,
          position: getComputedStyle(image).objectPosition,
          overflow: getComputedStyle(image.parentElement).overflow,
          animation: getComputedStyle(image).animationName,
          paintedWidth: image.naturalWidth * scale,
          paintedHeight: image.naturalHeight * scale,
          boxWidth: box.width,
          boxHeight: box.height,
        }
      })

      assert.equal(value.src, editions[index].src)
      assert.deepEqual([value.width, value.height], [780, 1688])
      assert.equal(value.fit, 'cover')
      assert.equal(value.position, '50% 0%')
      assert.equal(value.overflow, 'hidden')
      assert.equal(value.animation, 'none')
      assert.ok(value.paintedWidth + 0.01 >= value.boxWidth)
      assert.ok(value.paintedHeight + 0.01 >= value.boxHeight)
      assert.equal(await shell.getAttribute('data-cover-migration'), 'current')
      assert.equal(await shell.locator('canvas').count(), 0)

      const playBox = await shell.locator('.mf-insert-coin').boundingBox()
      const coverBox = await art.boundingBox()
      assert.ok(playBox && coverBox && playBox.y > coverBox.y + coverBox.height * 0.72,
        'JOUER must overlap only the expendable lower cover zone')

      const path = `${output}/${format.name}-${editions[index].id}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }

    const first = await art.getAttribute('src')
    await page.waitForTimeout(250)
    assert.equal(await art.getAttribute('src'), first, 'Static cover selection must not rotate on a timer')
    report.scenarios.push({
      name: format.name,
      passed: true,
      editions: 4,
      input: format.hasTouch ? 'touch' : 'mouse',
      topAnchoring: true,
      playOverlapChecked: true,
      noAnimatedCoverRuntime: true,
    })
    await context.close()
  }

  assert.deepEqual(report.errors, [])
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}

console.log(JSON.stringify(report, null, 2))
