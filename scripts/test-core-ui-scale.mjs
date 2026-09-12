import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/core-ui-scale'
await fs.mkdir(output, { recursive: true })

const scenarios = [
  { name: 'phone', width: 390, height: 844, screenWidth: 390, screenHeight: 844, mobile: true, touch: true },
  { name: 'desktop-tall', width: 1920, height: 969, screenWidth: 1920, screenHeight: 1080, mobile: false, touch: false },
]

const closeTo = (actual, expected, message, tolerance = 0.8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, received ${actual}`)
}

const server = await createServer({ server: { host: '127.0.0.1', port: 5181, strictPort: true } })
let browser
const report = []

try {
  await server.listen()
  browser = await chromium.launch({ headless: true })

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      screen: { width: scenario.screenWidth, height: scenario.screenHeight },
      isMobile: scenario.mobile,
      hasTouch: scenario.touch,
    })
    const page = await context.newPage()
    await page.route('**/api/**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"error":"isolated browser test"}',
    }))
    await page.goto('http://127.0.0.1:5181/?game=linefugg')

    const card = page.locator('.game-card[aria-label="LineFugg"]').first()
    const railIcon = card.locator('.mf-cover-rail .mf-platform-icon').first()
    await railIcon.waitFor({ state: 'visible' })
    const cardBox = await card.boundingBox()
    const iconBox = await railIcon.boundingBox()
    assert.ok(cardBox && iconBox)
    const scale = Math.max(1, cardBox.width / 390)
    closeTo(iconBox.width, 28 * scale, `${scenario.name} rail icon`)
    await page.screenshot({ path: `${output}/${scenario.name}-cover.png` })

    await card.locator('.mf-cover-rail button[aria-label="Info"]').click()
    const infoBody = card.locator('.mf-info-description')
    const infoFont = Number.parseFloat(await infoBody.evaluate(node => getComputedStyle(node).fontSize))
    closeTo(infoFont, 13 * scale, `${scenario.name} Info body`)

    await card.getByRole('button', { name: /View leaderboard/i }).click()
    const leaderboardTitle = card.getByText('LEADERBOARD', { exact: true })
    await leaderboardTitle.waitFor({ state: 'visible' })
    const leaderboardFont = Number.parseFloat(await leaderboardTitle.evaluate(node => getComputedStyle(node).fontSize))
    closeTo(leaderboardFont, 17 * scale, `${scenario.name} leaderboard title`)
    await page.screenshot({ path: `${output}/${scenario.name}-leaderboard.png` })
    await card.getByRole('button', { name: 'Back' }).click()

    const gameOver = await card.evaluate(node => {
      const overlay = document.createElement('div')
      overlay.className = 'mf-run-finished'
      overlay.innerHTML = '<section class="mf-ui-panel"><small class="mf-ui-h3">LINEFUGG</small><span class="mf-ui-meta">FINAL SCORE</span><strong class="mf-ui-display">42</strong><div class="mf-run-finished-actions"><button class="mf-ui-action mf-ui-label">LEADERBOARD</button><button class="is-primary mf-ui-action mf-ui-label">INSERT COIN x2 · REPLAY</button><button class="mf-ui-action mf-ui-label">RAGE QUIT</button></div></section>'
      node.append(overlay)
      const action = overlay.querySelector('button')
      const panel = overlay.querySelector('section')
      const result = {
        actionFont: Number.parseFloat(getComputedStyle(action).fontSize),
        actionHeight: action.getBoundingClientRect().height,
        panelWidth: panel.getBoundingClientRect().width,
      }
      return result
    })
    closeTo(gameOver.actionFont, 12 * scale, `${scenario.name} Game Over action`)
    closeTo(gameOver.actionHeight, 42 * scale, `${scenario.name} Game Over action height`)
    closeTo(gameOver.panelWidth, Math.min(cardBox.width, 330 * scale), `${scenario.name} Game Over panel`)
    await page.screenshot({ path: `${output}/${scenario.name}-game-over.png` })
    await card.locator('.mf-run-finished').evaluate(node => node.remove())

    report.push({ name: scenario.name, cardWidth: cardBox.width, scale, infoFont, leaderboardFont, gameOver })
    await context.close()
  }
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}

console.log(JSON.stringify(report, null, 2))
