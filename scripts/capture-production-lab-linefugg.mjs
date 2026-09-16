import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = process.env.MINIFUGG_CAPTURE_URL || 'http://127.0.0.1:5175'
const outputDir = 'public/assets/generated/linefugg/production-lab'
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const scenarios = [
  { id: 'initial', wait: 900 },
  { id: 'drag', wait: 1100 },
  { id: 'after-line', wait: 1800 },
  { id: 'three-lines', wait: 3600 },
]

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    const url = `${baseUrl}/?usr=moigod&lab=gameplay-runtime&game=linefugg&scenario=${scenario.id}`
    await page.goto(url, { waitUntil: 'networkidle' })
    const surface = page.locator('.mf-gameplay-runtime .game-surface')
    await surface.waitFor({ state: 'visible' })
    await page.waitForTimeout(scenario.wait)
    await surface.screenshot({ path: `${outputDir}/proto-${scenario.id}.png` })
    await context.close()
  }
} finally {
  await browser.close()
}

console.log(`Production Lab captures written to ${outputDir}`)
