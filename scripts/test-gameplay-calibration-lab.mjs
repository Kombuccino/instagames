import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/gameplay-calibration-lab'
await fs.mkdir(output, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 5185, strictPort: true } })
let browser
const report = { sources: 0, errors: [], screenshots: [], export: null }

try {
  await server.listen()
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true })
  const page = await context.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/assets/')) report.errors.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('http://127.0.0.1:5185/?usr=moigod&lab=layout&view=gameplay-calibration')
  await page.getByRole('heading', { name: 'Caler une DA. Vérifier un jeu.' }).waitFor()
  report.sources = await page.locator('[data-testid="gameplay-source-list"] > button').count()
  assert.equal(report.sources, 9)

  await page.getByRole('button', { name: /Les Brochettes de Vlad/ }).click()
  await page.getByRole('button', { name: 'BAS', exact: true }).click()
  const runtimeFrame = page.frameLocator('[data-testid="gameplay-runtime-frame"]')
  await runtimeFrame.locator('[data-testid="gameplay-runtime"]').waitFor()
  assert.equal(await runtimeFrame.locator('.mf-phaser-host').getAttribute('data-authored-vertical-anchor'), 'bottom')
  assert.equal(await runtimeFrame.locator('.mf-phaser-host').getAttribute('data-effective-vertical-anchor'), 'bottom')
  const frameSize = await page.locator('[data-testid="gameplay-runtime-frame"]').evaluate(frame => ({ width: frame.contentWindow.innerWidth, height: frame.contentWindow.innerHeight }))
  assert.deepEqual(frameSize, { width: 360, height: 650 })

  await page.getByRole('button', { name: 'HAUT', exact: true }).click()
  await page.frameLocator('[data-testid="gameplay-runtime-frame"]').locator('.mf-phaser-host[data-effective-vertical-anchor="top"]').waitFor()
  await page.locator('[data-testid="gameplay-needs-adaptation"]').check()
  await page.locator('[data-testid="gameplay-comment"]').fill('Le HUD haut disparaît avec l’ancrage bas ; reprendre la composition interne sans réduire la largeur.')
  const vladScreenshot = `${output}/vlad-a54-top.png`
  await page.screenshot({ path: vladScreenshot, fullPage: true })
  report.screenshots.push(vladScreenshot)

  const fixture = path.resolve('public/assets/imported/linefugg/concepts/orbital-stage-master-v1.png')
  await page.locator('[data-testid="gameplay-da-input"]').setInputFiles(fixture)
  await page.getByText('1 DA ajoutée et conservée dans ce navigateur.').waitFor()
  assert.equal(await page.locator('[data-testid="gameplay-source-list"] > button').count(), 10)

  const downloadPromise = page.waitForEvent('download')
  await page.locator('[data-testid="gameplay-export-json"]').click()
  const download = await downloadPromise
  const exportPath = `${output}/${download.suggestedFilename()}`
  await download.saveAs(exportPath)
  const exported = JSON.parse(await fs.readFile(exportPath, 'utf8'))
  assert.equal(exported.schema, 'minifugg-gameplay-calibration/v2')
  assert.deepEqual(exported.master, { width: 390, height: 844 })
  assert.deepEqual(exported.minimumViewport, { width: 360, height: 650 })
  assert.equal(Math.round(exported.minimumViewportInMaster.height * 100) / 100, 704.17)
  const vlad = exported.items.find(item => item.key === 'game:vlads-skewers')
  assert.equal(vlad.anchor, 'top')
  assert.equal(vlad.needsAdaptation, true)
  assert.match(vlad.comment, /HUD haut disparaît/)
  report.export = exportPath

  const screenshot = `${output}/desktop-workbench.png`
  await page.screenshot({ path: screenshot, fullPage: true })
  report.screenshots.push(screenshot)
  assert.deepEqual(report.errors, [])
  await context.close()
} finally {
  await browser?.close()
  await server.close()
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
}

console.log(JSON.stringify(report, null, 2))
