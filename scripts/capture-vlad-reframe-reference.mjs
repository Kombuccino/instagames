import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'
import { chromium } from 'playwright'

// Reference capture only. This branch does not alter or deploy Vlad gameplay.
const out = 'artifacts/vlad-reframe-reference'
await fs.mkdir(out, { recursive: true })
const report = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), origin: 'current repository runtime in isolated Vite test, not a production capture', screens: [], errors: [] }
const server = await createServer({ server: { host: '127.0.0.1', port: 5186, strictPort: true } })
let browser
try {
  await server.listen()
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  for (const [name, width, height, dpr] of [['legacy-master',390,844,1], ['guaranteed',390,710,1], ['a54-chrome',360,656,2], ['a54-brave',360,611,2], ['desktop',1280,720,1]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: width < 600, hasTouch: width < 600 })
    const page = await context.newPage()
    page.on('pageerror', err => report.errors.push({ screen: name, message: err.message }))
    page.on('response', response => { if (response.status() >= 400 && response.url().includes('/assets/')) report.errors.push({ screen: name, message: `${response.status()} ${response.url()}` }) })
    await page.goto('http://127.0.0.1:5186/?usr=moigod&lab=gameplay-runtime&game=vlads-skewers', { waitUntil: 'networkidle' })
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function', { timeout: 30000 })
    await page.waitForTimeout(1600)
    const state = await page.evaluate(() => JSON.parse(window.render_game_to_text()))
    const geometry = await page.evaluate(() => {
      const rect = element => { const r = element?.getBoundingClientRect(); return r ? { x:r.x,y:r.y,width:r.width,height:r.height } : null }
      return { viewport: { width:innerWidth, height:innerHeight, dpr:devicePixelRatio }, canvas:rect(document.querySelector('canvas')), host:rect(document.querySelector('.mf-phaser-host')), authoredAnchor:document.querySelector('.mf-phaser-host')?.getAttribute('data-authored-vertical-anchor') }
    })
    await page.screenshot({ path: `${out}/${name}.png` })
    await fs.writeFile(`${out}/${name}.json`, JSON.stringify({ state, geometry }, null, 2))
    report.screens.push({ name, width, height, dpr, file:`${name}.png` })
    await context.close()
  }
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${out}/report.json`, JSON.stringify(report, null, 2))
}
if (report.errors.length) throw new Error(JSON.stringify(report.errors))
