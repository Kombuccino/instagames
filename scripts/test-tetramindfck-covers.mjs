import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/tetramindfck-covers'
await fs.mkdir(output, { recursive: true })

const editions = [
  ['pulp-euro', 0, 'v1-pulp-euro.webp', '50% 20.7%', 150],
  ['micro-euro', 5_000, 'v2-micro-euro.webp', '50% 26.8%', 155],
  ['graphic-poster', 15_000, 'v3-graphic-poster.webp', '50% 28.1%', 148],
  ['japanese-edition', 30_000, 'v4-japanese-edition.webp', '50% 49.7%', 180],
].map(([id, unlockScore, file, position, titleHeight]) => ({
  id,
  unlockScore,
  file,
  position,
  titleHeight,
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
    const expected = editions.find(edition => edition.id === variant.id)
    assert.equal(variant.objectPosition, expected.position.replace('50%', 'center'))
    assert.equal(variant.preserveTitleHeight, expected.titleHeight)
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
    const fixedControls = page.locator('.mf-coin-console-system')
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
      assert.equal(value.position, editions[index].position)
      assert.equal(value.overflow, 'hidden')
      assert.equal(value.animation, 'none')
      assert.ok(value.paintedWidth + 0.01 >= value.boxWidth)
      assert.ok(value.paintedHeight + 0.01 >= value.boxHeight)
      assert.equal(await shell.getAttribute('data-cover-migration'), 'current')
      assert.equal(await shell.locator('canvas').count(), 0)
      const titlePreserver = shell.locator('.mf-static-cover-title-preserver')
      assert.equal(await titlePreserver.count(), 1)
      assert.equal(Number(await titlePreserver.getAttribute('data-preserved-title-height')), editions[index].titleHeight)

      const playBox = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
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

    const consoleBox = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
    assert.ok(consoleBox, 'coin console must be visible')
    assert.equal(await fixedControls.getAttribute('class'), 'mf-coin-console-system is-fixed')
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

    const counter = fixedControls.locator('.mf-coin-balance-90s')
    const counterBeforeScroll = await counter.boundingBox()
    const consoleBeforeScroll = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
    const coverBeforeScroll = await shell.boundingBox()
    await click(fixedControls.getByRole('button', { name: 'Next game', exact: true }))
    await page.waitForTimeout(90)
    const scrollTop = await page.locator('.game-feed').evaluate(element => element.scrollTop)
    const consoleDuringScroll = await fixedControls.locator('.mf-coin-console-90s').boundingBox()
    const counterDuringScroll = await counter.boundingBox()
    const coverDuringScroll = await shell.boundingBox()
    assert.ok(scrollTop > 0, 'the next-game control must move the cover feed')
    assert.ok(Math.abs(coverBeforeScroll.y - coverDuringScroll.y) > 1, 'the cover must slide below the fixed controls')
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(consoleBeforeScroll[key] - consoleDuringScroll[key]) < .1, `console ${key} must stay fixed while covers slide`)
      assert.ok(Math.abs(counterBeforeScroll[key] - counterDuringScroll[key]) < .1, `coin counter ${key} must stay fixed while covers slide`)
    }
    const scrollingPath = `${output}/${format.name}-cover-scroll-fixed.png`
    await page.screenshot({ path: scrollingPath })
    report.screenshots.push(scrollingPath)
    await page.locator('.game-feed').evaluate(element => element.scrollTo({ top: 0, behavior: 'auto' }))
    await page.waitForTimeout(160)
    assert.equal(await page.locator('.mf-coin-console-system').count(), 1, 'only the active fixed control layer may exist')

    const play = fixedControls.locator('.mf-console-play')
    const visual = play.locator('.mf-console-play-visual')
    const frames = play.locator('.mf-console-play-frame')
    const idleFrame = play.locator('.mf-console-play-frame.is-idle')
    const warmFrame = play.locator('.mf-console-play-frame.is-warm')
    const hotFrame = play.locator('.mf-console-play-frame.is-hot')
    assert.equal(await play.locator('img').count(), 0, 'PLAY must not swap independent image elements')
    assert.equal(await visual.count(), 1, 'PLAY must keep one fixed visual assembly')
    assert.equal(await frames.count(), 4, 'PLAY must crop four aligned states from one atlas')
    for (let index = 0; index < 4; index++) {
      assert.match(await frames.nth(index).evaluate(element => getComputedStyle(element).backgroundImage), /play-states-atlas\.webp/)
    }
    assert.match(await idleFrame.evaluate(element => getComputedStyle(element).filter), /brightness\(0\.29\)/,
      'PLAY must remain visibly amber while reading as unlit')
    assert.equal(await warmFrame.evaluate(element => getComputedStyle(element).animationName), 'mf-play-warm-lamp')
    assert.equal(await hotFrame.evaluate(element => getComputedStyle(element).animationName), 'mf-play-hot-lamp')
    assert.doesNotMatch(await warmFrame.evaluate(element => getComputedStyle(element).animationTimingFunction), /steps/,
      'PLAY ignition must use a short physical ramp instead of jumping between atlas cells')
    const lampCycle = await warmFrame.evaluate(element => {
      const animation = element.getAnimations()[0]
      return {
        duration: Number(animation.effect.getTiming().duration),
        keyframes: animation.effect.getKeyframes().map(frame => ({
          offset: frame.offset,
          opacity: Number(frame.opacity),
        })),
      }
    })
    assert.equal(lampCycle.duration, 2000)
    const hasLampState = (offset, opacity) => lampCycle.keyframes.some(frame =>
      Math.abs(frame.offset - offset) < .001 && Math.abs(frame.opacity - opacity) < .001)
    assert.ok(hasLampState(.726, 1), 'PLAY lamp must stay lit for about 1.5 seconds')
    assert.ok(hasLampState(.75, 0), 'PLAY lamp must switch off in about 48 milliseconds')
    assert.ok(hasLampState(.976, 0), 'PLAY lamp must stay off for about 0.5 seconds including transitions')
    assert.ok(hasLampState(1, 1), 'PLAY lamp must switch back on in about 48 milliseconds')
    const playBefore = await play.boundingBox()
    const counterBefore = await counter.boundingBox()
    const coinsBefore = Number.parseInt(await counter.getAttribute('aria-label'), 10)
    assert.ok(Number.isFinite(coinsBefore), 'the stationary counter must expose a numeric balance')
    await click(play)
    await page.waitForTimeout(40)
    assert.equal(await play.evaluate(element => element.classList.contains('is-pressed')), true)
    assert.notEqual(await visual.evaluate(element => getComputedStyle(element).transform), 'none')
    const playPressed = await play.boundingBox()
    const counterPressed = await counter.boundingBox()
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(playBefore[key] - playPressed[key]) < .1, `PLAY ${key} must not move when pressed`)
      assert.ok(Math.abs(counterBefore[key] - counterPressed[key]) < .1, `coin counter ${key} must stay fixed during PLAY`)
    }
    const pressedPath = `${output}/${format.name}-play-pressed.png`
    await page.screenshot({ path: pressedPath })
    report.screenshots.push(pressedPath)

    report.scenarios.push({
      name: format.name,
      passed: true,
      editions: 4,
      input: format.hasTouch ? 'touch' : 'mouse',
      calibratedCrop: true,
      playOverlapChecked: true,
      consoleControlsAligned: true,
      normalizedPlayAtlas: true,
      playAndCounterStationary: true,
      fixedControlsDuringCoverScroll: true,
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
