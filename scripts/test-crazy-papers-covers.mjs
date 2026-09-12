import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = process.env.CRAZY_PAPERS_COVER_OUTPUT || 'artifacts/crazy-papers-covers'
await fs.mkdir(output, { recursive: true })

const editions = [
  ['pulp-disaster', 0, 'v1-pulp-disaster.webp', '50% 0%'],
  ['micro-records', 5_000, 'v2-micro-records.webp', '50% 0%'],
  ['graphic-collapse', 15_000, 'v3-graphic-collapse.webp', '50% 0%'],
  ['pulp-clerk', 30_000, 'v4-pulp-clerk.webp', '50% 0%'],
  ['constructivist-clerk', 50_000, 'v5-constructivist-clerk.webp', '50% 70%'],
  ['showa-paper-wave', 75_000, 'v6-showa-paper-wave.webp', '50% 0%'],
].map(([id, unlockScore, file, position]) => ({
  id,
  unlockScore,
  file,
  position,
  src: `/assets/generated/crazy-papers/welcome/variants/runtime/${file}`,
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
  server: { host: '127.0.0.1', port: 5178, strictPort: true },
})
let browser
try {
  const { CRAZY_PAPERS_WELCOME } = await server.ssrLoadModule('/src/games/crazy-papers/welcome.ts')
  assert.equal(CRAZY_PAPERS_WELCOME.motion, 'none')
  assert.equal(CRAZY_PAPERS_WELCOME.selection, 'seeded')
  assert.deepEqual(
    CRAZY_PAPERS_WELCOME.variants.map(({ id, image, unlockScore }) => ({ id, src: image, unlockScore })),
    editions.map(({ id, src, unlockScore }) => ({ id, src, unlockScore })),
  )
  for (const variant of CRAZY_PAPERS_WELCOME.variants) {
    assert.equal(variant.runtime, 'static')
    assert.equal(variant.fit, 'cover')
    assert.equal(variant.objectPosition, variant.id === 'constructivist-clerk' ? 'center 70%' : 'top center')
    assert.ok(!variant.layers?.length)
  }

  await server.listen()
  browser = await chromium.launch({ headless: true })
  const formats = [
    { name: 'a54-brave', width: 360, height: 611, deviceScaleFactor: 2, hasTouch: true, inspectCollection: true },
    { name: 'a54-chrome', width: 360, height: 656, deviceScaleFactor: 2, hasTouch: true, inspectCollection: true },
    { name: 'master', width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, inspectCollection: true },
    { name: 'desktop', width: 1280, height: 720, deviceScaleFactor: 1, inspectCollection: true },
  ]

  const readArt = async (art) => {
    await art.evaluate(image => image.decode())
    return art.evaluate(image => {
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
  }

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
      if (response.status() >= 400 && response.url().includes('/assets/generated/crazy-papers/welcome/variants/')) {
        report.errors.push(`${format.name}: ${response.status()} ${response.url()}`)
      }
    })

    await page.goto('http://127.0.0.1:5178/?game=crazy-papers')
    const card = page.locator('.game-card[aria-label="CrazyPapers"]').first()
    const shell = card.locator('.mf-cover-shell')
    const art = shell.locator('.mf-core-selected-cover > img')
    const fixedControls = page.locator('.mf-coin-console-system.is-fixed')
    const click = locator => format.hasTouch ? locator.tap() : locator.click()
    await art.waitFor({ state: 'visible' })

    const inspectCurrentArt = async () => {
      const value = await readArt(art)
      assert.ok(editions.some(edition => edition.src === value.src), `unexpected source ${value.src}`)
      assert.deepEqual([value.width, value.height], [780, 1688])
      assert.equal(value.fit, 'cover')
      assert.equal(value.position, editions.find(edition => edition.src === value.src).position)
      assert.equal(value.overflow, 'hidden')
      assert.equal(value.animation, 'none')
      assert.ok(value.paintedWidth + 0.01 >= value.boxWidth)
      assert.ok(value.paintedHeight + 0.01 >= value.boxHeight)
      assert.equal(await shell.getAttribute('data-cover-migration'), 'current')
      assert.equal(await shell.locator('canvas').count(), 0)
      return value
    }

    if (format.inspectCollection) {
      for (let index = 0; index < editions.length; index++) {
        await click(shell.getByRole('button', { name: 'Info', exact: true }))
        const buttons = shell.locator('.mf-cover-grid button')
        assert.equal(await buttons.count(), editions.length)
        assert.equal(await buttons.nth(index).isEnabled(), true)
        await click(buttons.nth(index))
        await click(shell.getByRole('button', { name: 'Close', exact: true }))
        const value = await inspectCurrentArt()
        assert.equal(value.src, editions[index].src)
        const path = `${output}/${format.name}-${editions[index].id}.png`
        await page.screenshot({ path })
        report.screenshots.push(path)
      }
    } else {
      await inspectCurrentArt()
      const path = `${output}/${format.name}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }

    const playBox = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
    const coverBox = await art.boundingBox()
    assert.ok(playBox && coverBox && playBox.y > coverBox.y + coverBox.height * 0.72,
      'JOUER must overlap only the expendable lower cover zone')

    const consoleBox = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
    assert.ok(consoleBox, 'coin console must be visible')
    const expectedControls = [
      ['.mf-console-nav.is-prev', .0705, .1854, .1968, .2959],
      ['.mf-console-nav.is-next', .0705, .5056, .1968, .2959],
      ['.mf-console-play', .3349, .1442, .3249, .6910],
    ]
    for (const [selector, x, y, width, height] of expectedControls) {
      const box = await fixedControls.locator(selector).boundingBox()
      assert.ok(box, `${selector} must be visible`)
      const actual = [
        (box.x - consoleBox.x) / consoleBox.width,
        (box.y - consoleBox.y) / consoleBox.height,
        box.width / consoleBox.width,
        box.height / consoleBox.height,
      ]
      for (let coordinate = 0; coordinate < actual.length; coordinate++) {
        assert.ok(Math.abs(actual[coordinate] - [x, y, width, height][coordinate]) < .006,
          `${selector} must stay locked to its measured chassis well`)
      }
    }

    await click(fixedControls.locator('[data-testid="coin-console-play"]'))
    await page.waitForFunction(() => document.querySelector('.game-card[aria-label="CrazyPapers"]')?.getAttribute('data-phase') === 'playing')
    const close = card.getByRole('button', { name: 'Exit game and return to cover' })
    await close.waitFor({ state: 'visible' })
    await click(close)
    await shell.waitFor({ state: 'visible' })

    report.scenarios.push({
      name: format.name,
      passed: true,
      editionsInspected: format.inspectCollection ? editions.length : 1,
      input: format.hasTouch ? 'touch' : 'mouse',
      focalCropChecked: true,
      playOverlapChecked: true,
      playFlowChecked: true,
      consoleControlsAligned: true,
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
