import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const output = 'artifacts/cover-calibration-lab'
await fs.mkdir(output, { recursive: true })

const server = await createServer({ server: { host: '127.0.0.1', port: 5184, strictPort: true } })
let browser
const report = { covers: 0, errors: [], screenshots: [], export: null }

const closeTo = (actual, expected, label, tolerance = 1) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, received ${actual}`)
}

try {
  await server.listen()
  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
  const page = await context.newPage()
  page.on('pageerror', error => report.errors.push(error.message))
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/assets/')) report.errors.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('http://127.0.0.1:5184/?usr=moigod&lab=layout&view=cover-calibration')
  await page.getByRole('heading', { name: 'Calage des covers.' }).waitFor()
  report.covers = await page.locator('[data-testid="cover-list"] > button').count()
  assert.equal(report.covers, 23)

  await page.locator('[data-testid="cover-game-filter"]').selectOption('crazy-papers')
  assert.equal(await page.locator('[data-testid="cover-list"] > button').count(), 6)
  await page.getByRole('button', { name: /CrazyPapers Constructivist Clerk/ }).click()

  const slider = page.locator('[data-testid="cover-window-top"]')
  closeTo(Number(await slider.inputValue()), 127.4, 'existing center 70% mapping', .1)

  const stage = page.locator('[data-testid="cover-calibration-stage"]')
  const windowFrame = page.locator('[data-testid="cover-calibration-window"]')
  const console = windowFrame.locator('.mf-coin-console-90s')
  const play = windowFrame.locator('.mf-console-play')
  const [stageBox, stageInterior, windowBox, consoleBox, playBox] = await Promise.all([
    stage.boundingBox(),
    stage.evaluate(element => ({ clientTop: element.clientTop, clientHeight: element.clientHeight })),
    windowFrame.boundingBox(), console.boundingBox(), play.boundingBox(),
  ])
  assert.ok(stageBox && windowBox && consoleBox && playBox)
  closeTo(windowBox.y, stageBox.y + stageInterior.clientTop + 127.4 / 844 * stageInterior.clientHeight, 'movable viewport y')
  closeTo(windowBox.height, stageInterior.clientHeight * 662 / 844, 'minimum viewport height')
  closeTo(consoleBox.height, consoleBox.width * 534 / 2099, 'real console aspect ratio')
  closeTo(consoleBox.y + consoleBox.height, windowBox.y + windowBox.height, 'console bottom anchor', 4)
  closeTo(playBox.x, consoleBox.x + consoleBox.width * .3349, 'PLAY x', 1.5)
  closeTo(playBox.y, consoleBox.y + consoleBox.height * .1442, 'PLAY y', 1.5)
  closeTo(playBox.width, consoleBox.width * .3249, 'PLAY width', 1.5)

  await page.mouse.move(windowBox.x + windowBox.width / 2, windowBox.y + windowBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(windowBox.x + windowBox.width / 2, windowBox.y + windowBox.height / 2 + 14, { steps: 3 })
  await page.mouse.up()
  assert.ok(Number(await slider.inputValue()) > 127.4, 'the green viewport must move with the mouse')

  await slider.evaluate(input => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setValue.call(input, '150')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  closeTo(Number(await slider.inputValue()), 150, 'custom crop after range input', .1)
  await page.locator('[data-testid="cover-needs-adaptation"]').check()
  await page.locator('[data-testid="cover-adaptation-comment"]').fill('Prolonger le corps sous le bouton PLAY sans modifier le style ni le titre.')
  await page.getByRole('button', { name: 'VALIDER & SUIVANTE →' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.locator('[data-testid="cover-export-json"]').click()
  const download = await downloadPromise
  const exportPath = `${output}/${download.suggestedFilename()}`
  await download.saveAs(exportPath)
  const exported = JSON.parse(await fs.readFile(exportPath, 'utf8'))
  assert.equal(exported.schema, 'minifugg-cover-calibration/v1')
  assert.deepEqual(exported.master, { width: 390, height: 844 })
  assert.equal(exported.minimumViewport.height, 662)
  assert.equal(exported.covers.length, 23)
  const constructivist = exported.covers.find(cover => cover.key === 'crazy-papers/constructivist-clerk')
  assert.ok(constructivist)
  assert.equal(constructivist.cropWindow.y, 150)
  assert.equal(constructivist.recommendedObjectPosition, 'center 82.4%')
  assert.equal(constructivist.reviewed, true)
  assert.equal(constructivist.needsSourceAdaptation, true)
  assert.match(constructivist.adaptationComment, /Prolonger le corps/)
  report.export = exportPath

  await page.reload()
  await page.locator('[data-testid="cover-game-filter"]').selectOption('crazy-papers')
  await page.getByRole('button', { name: /CrazyPapers Constructivist Clerk/ }).click()
  closeTo(Number(await page.locator('[data-testid="cover-window-top"]').inputValue()), 150, 'persisted crop', .1)
  assert.equal(await page.locator('[data-testid="cover-needs-adaptation"]').isChecked(), true)
  assert.match(await page.locator('[data-testid="cover-adaptation-comment"]').inputValue(), /Prolonger le corps/)

  await page.getByRole('button', { name: 'HAUT', exact: true }).click()
  closeTo(Number(await page.locator('[data-testid="cover-window-top"]').inputValue()), 0, 'temporary local edit', .1)
  await page.locator('[data-testid="cover-import-json"]').setInputFiles(exportPath)
  await page.getByText('23 réglages importés.').waitFor()
  closeTo(Number(await page.locator('[data-testid="cover-window-top"]').inputValue()), 150, 'crop restored by JSON import', .1)

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
