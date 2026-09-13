import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/core-mobile-layout'
await fs.mkdir(output, { recursive: true })

const scenarios = [
  { name: 'a54-brave', width: 360, height: 611, screenWidth: 360, screenHeight: 800, touch: true, mobile: true, desktop: false },
  { name: 'a54-chrome', width: 360, height: 656, screenWidth: 360, screenHeight: 800, touch: true, mobile: true, desktop: false },
  // Reproduces a phone browser exposing a desktop-sized CSS layout viewport.
  { name: 'touch-desktop-viewport', width: 980, height: 1663, screenWidth: 360, screenHeight: 800, touch: true, mobile: true, dpr: 1, desktop: false },
  { name: 'tablet', width: 1024, height: 768, screenWidth: 1024, screenHeight: 768, touch: true, mobile: true, dpr: 1, desktop: true },
  { name: 'desktop', width: 1280, height: 720, screenWidth: 1280, screenHeight: 720, touch: false, mobile: false, desktop: true },
]

const closeTo = (actual, expected, message, tolerance = 1) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, received ${actual}`)
}

const server = await createServer({ server: { host: '127.0.0.1', port: 5179, strictPort: true } })
let browser
const report = { scenarios: [], errors: [], screenshots: [] }

try {
  await server.listen()
  browser = await chromium.launch({ headless: true })

  for (const scenario of scenarios) {
    const expectedFeedWidth = scenario.desktop
      ? Math.min(scenario.width, scenario.height / 662 * 390)
      : scenario.width
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      screen: { width: scenario.screenWidth, height: scenario.screenHeight },
      deviceScaleFactor: scenario.dpr ?? (scenario.touch ? 2 : 1),
      hasTouch: scenario.touch,
      isMobile: scenario.mobile,
    })
    await context.addInitScript(() => {
      let fullscreenElement = null
      Object.defineProperty(Document.prototype, 'fullscreenEnabled', { configurable: true, get: () => true })
      Object.defineProperty(Document.prototype, 'fullscreenElement', { configurable: true, get: () => fullscreenElement })
      Element.prototype.requestFullscreen = async function requestFullscreen() {
        fullscreenElement = this
        window.__minifuggFullscreenTarget = this === document.documentElement ? 'document' : this.tagName.toLowerCase()
        document.dispatchEvent(new Event('fullscreenchange'))
      }
      Document.prototype.exitFullscreen = async function exitFullscreen() {
        fullscreenElement = null
        window.__minifuggFullscreenExited = true
        document.dispatchEvent(new Event('fullscreenchange'))
      }
    })
    const page = await context.newPage()
    await page.route('**/api/**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"error":"isolated browser test"}',
    }))
    page.on('pageerror', error => report.errors.push(`${scenario.name}: ${error.message}`))

    await page.goto('http://127.0.0.1:5179/?game=tetramindfck')
    const feed = page.locator('.game-feed')
    const tetra = page.locator('.game-card[aria-label="TetraMindFck"]').first()
    const cover = tetra.locator('.mf-cover-shell')
    const art = cover.locator('.mf-core-selected-cover > img')
    await art.waitFor({ state: 'visible' })
    await art.evaluate(image => image.decode())

    const media = await page.evaluate(() => ({
      desktopLayout: matchMedia('(min-width: 760px) and (min-device-width: 760px)').matches,
      finePointer: matchMedia('(pointer: fine)').matches,
      hover: matchMedia('(hover: hover)').matches,
      touchPoints: navigator.maxTouchPoints,
    }))
    assert.equal(media.desktopLayout, scenario.desktop)

    const feedBox = await feed.boundingBox()
    const cardBox = await tetra.boundingBox()
    const coverBox = await cover.boundingBox()
    assert.ok(feedBox && cardBox && coverBox)
    closeTo(feedBox.width, expectedFeedWidth, `${scenario.name} feed width`)
    closeTo(cardBox.width, expectedFeedWidth, `${scenario.name} card width`)
    closeTo(coverBox.width, expectedFeedWidth, `${scenario.name} cover width`)
    closeTo(feedBox.x, scenario.desktop ? (scenario.width - expectedFeedWidth) / 2 : 0, `${scenario.name} feed x`)
    closeTo(cardBox.y, 0, `${scenario.name} card top`)
    assert.equal(await art.evaluate(image => getComputedStyle(image).objectFit), 'cover')
    assert.ok(
      ['50% 20.7%', '50% 26.8%', '50% 28.1%', '50% 49.7%'].includes(
        await art.evaluate(image => getComputedStyle(image).objectPosition),
      ),
      `${scenario.name} must use one of the four calibrated TetraMindFck crops`,
    )
    assert.equal(await cover.locator('.mf-static-cover-title-preserver').count(), 1)

    const screenshot = `${output}/${scenario.name}-tetramindfck.png`
    await page.screenshot({ path: screenshot })
    report.screenshots.push(screenshot)

    await page.goto('http://127.0.0.1:5179/?game=linefugg')
    const line = page.locator('.game-card[aria-label="LineFugg"]').first()
    const play = line.locator('[data-testid="coin-console-play"]')
    await play.waitFor({ state: 'visible' })
    if (scenario.touch) await play.tap()
    else await play.click()
    await page.waitForFunction(() => document.querySelector('.game-card[aria-label="LineFugg"]')?.getAttribute('data-phase') === 'playing')

    const exitControl = line.locator('.mf-game-close-box')
    const fullscreenControl = line.locator('.mf-game-fullscreen-box')
    const exitControlBox = await exitControl.boundingBox()
    const fullscreenControlBox = await fullscreenControl.boundingBox()
    assert.ok(exitControlBox && fullscreenControlBox)
    closeTo(fullscreenControlBox.width, exitControlBox.width, `${scenario.name} fullscreen width matches Exit`)
    closeTo(fullscreenControlBox.height, exitControlBox.height, `${scenario.name} fullscreen height matches Exit`)
    assert.ok(fullscreenControlBox.x > exitControlBox.x + exitControlBox.width, `${scenario.name} fullscreen sits next to Exit`)
    assert.equal(await fullscreenControl.getAttribute('aria-label'), 'Enter fullscreen')
    if (scenario.touch) await fullscreenControl.tap()
    else await fullscreenControl.click()
    await page.waitForFunction(() => document.querySelector('.mf-game-fullscreen-box')?.getAttribute('aria-label') === 'Exit fullscreen')
    assert.equal(await page.evaluate(() => window.__minifuggFullscreenTarget), 'document')
    if (scenario.touch) await fullscreenControl.tap()
    else await fullscreenControl.click()
    await page.waitForFunction(() => document.querySelector('.mf-game-fullscreen-box')?.getAttribute('aria-label') === 'Enter fullscreen')
    assert.equal(await page.evaluate(() => window.__minifuggFullscreenExited), true)

    const viewport = line.locator('.mf-phaser-host')
    const stage = viewport.locator(':scope > div')
    await viewport.locator('canvas').waitFor({ state: 'visible' })
    const viewportBox = await viewport.boundingBox()
    const stageBox = await stage.boundingBox()
    assert.ok(viewportBox && stageBox)
    closeTo(viewportBox.width, expectedFeedWidth, `${scenario.name} gameplay viewport width`)
    if (!scenario.desktop) {
      closeTo(stageBox.width, expectedFeedWidth, `${scenario.name} width-driven Phaser stage`)
      closeTo(stageBox.x, 0, `${scenario.name} Phaser stage x`)
    } else {
      const expectedStageWidth = scenario.height / 662 * 390
      closeTo(stageBox.width, expectedStageWidth, `${scenario.name} height-driven Phaser stage`)
      closeTo(stageBox.x, feedBox.x, `${scenario.name} Phaser stage x`)
    }

    const gameplayScreenshot = `${output}/${scenario.name}-linefugg-gameplay-controls.png`
    await page.screenshot({ path: gameplayScreenshot })
    report.screenshots.push(gameplayScreenshot)

    report.scenarios.push({
      name: scenario.name,
      passed: true,
      viewport: `${scenario.width}x${scenario.height}`,
      input: scenario.touch ? 'touch' : 'fine-pointer',
      feedWidth: feedBox.width,
      phaserStageWidth: stageBox.width,
      scaleAxis: scenario.desktop ? 'height' : 'width',
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
