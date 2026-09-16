import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = process.env.MINIFUGG_CAPTURE_URL || 'http://127.0.0.1:5175'
const outputDir = 'public/assets/generated/linefugg/production-lab'
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const output = (name) => `${outputDir}/proto-${name}.png`

try {
  await page.goto(`${baseUrl}/?usr=moigod&lab=gameplay-runtime&game=linefugg`, { waitUntil: 'networkidle' })
  const surface = page.locator('.mf-gameplay-runtime .game-surface')
  const canvas = surface.locator('canvas')
  await surface.waitFor({ state: 'visible' })
  await canvas.waitFor({ state: 'visible' })
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function')
  await page.waitForTimeout(500)

  const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()))
  const stagePoint = async (x, y) => {
    const box = await canvas.boundingBox()
    if (!box) throw new Error('LineFugg canvas is not measurable')
    return { x: box.x + x / 390 * box.width, y: box.y + y / 844 * box.height }
  }
  const drag = async (from, to, hold = false) => {
    const a = await stagePoint(from.x, from.y)
    const b = await stagePoint(to.x, to.y)
    await page.mouse.move(a.x, a.y)
    await page.mouse.down()
    await page.mouse.move(b.x, b.y, { steps: 10 })
    if (!hold) await page.mouse.up()
    await page.waitForTimeout(120)
  }
  const capture = async (name) => surface.screenshot({ path: output(name) })

  const line1 = { from: { x: 103, y: 408 }, to: { x: 287, y: 224 } }
  const line2 = { from: { x: 103, y: 178 }, to: { x: 103, y: 362 } }
  const line3 = { from: { x: 57, y: 270 }, to: { x: 241, y: 270 } }

  await capture('initial')

  await drag(line1.from, line1.to, true)
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).drag?.cells?.length >= 2)
  await capture('drag')
  await page.mouse.up()

  await page.waitForFunction(() => {
    const value = JSON.parse(window.render_game_to_text())
    return value.lines.length === 1 && !value.rerolling
  }, null, { timeout: 3000 })
  await page.waitForTimeout(80)
  await capture('after-line')

  await drag(line2.from, line2.to)
  await page.waitForFunction(() => {
    const value = JSON.parse(window.render_game_to_text())
    return value.lines.length === 2 && !value.rerolling
  }, null, { timeout: 3000 })

  await drag(line3.from, line3.to)
  await page.waitForFunction(() => {
    const value = JSON.parse(window.render_game_to_text())
    return value.lines.length === 3 && value.validateEnabled && !value.rerolling
  }, null, { timeout: 3000 })
  await page.waitForTimeout(80)
  await capture('three-lines')

  const finalState = await state()
  if (finalState.lines.length !== 3 || !finalState.validateEnabled) throw new Error('Three-line proof state was not reached')

  const files = ['initial', 'drag', 'after-line', 'three-lines']
  const hashes = []
  for (const name of files) {
    const bytes = await fs.readFile(output(name))
    hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'))
  }
  if (new Set(hashes).size !== hashes.length) throw new Error(`Production Lab proof screens are not distinct: ${hashes.join(', ')}`)
  console.log(JSON.stringify({ outputDir, hashes }, null, 2))
} finally {
  await context.close()
  await browser.close()
}
