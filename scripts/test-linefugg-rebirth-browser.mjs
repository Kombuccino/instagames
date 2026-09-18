import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
const base = process.env.MINIFUGG_TEST_URL || 'http://127.0.0.1:5175'
const root = 'artifacts/linefugg-rebirth'
await fs.mkdir(root, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] })
const report = { checks: [], errors: [], screenshots: [], engine: null }
const configs = [
  { name: 'master', width: 390, height: 850, dpr: 2 },
  { name: 'a54', width: 360, height: 656, dpr: 2, touch: true },
  { name: 'iphone', width: 390, height: 712, dpr: 3, touch: true },
  { name: 'brave-degraded', width: 360, height: 611, dpr: 2, touch: true },
  { name: 'desktop', width: 1440, height: 900, dpr: 1 },
  { name: 'reduced-motion', width: 390, height: 712, dpr: 2, reduce: true },
]
let activePage
try {
  for (const config of configs.filter(item => !process.env.REBIRTH_CONFIG || item.name === process.env.REBIRTH_CONFIG)) {
    const context = await browser.newContext({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: config.dpr, hasTouch: !!config.touch, reducedMotion: config.reduce ? 'reduce' : 'no-preference' })
    context.setDefaultTimeout(12000); context.setDefaultNavigationTimeout(45000)
    console.log('Testing Rebirth:', config.name)
    const page = await context.newPage(); activePage = page
    page.on('pageerror', e => report.errors.push(`${config.name}: ${e.message}`))
    page.on('response', r => { if (r.url().includes('/linefugg/rebirth/') && r.status() >= 400) report.errors.push(`${r.status()}: ${r.url()}`) })
    await page.goto(`${base}/?usr=moigod&lab=gameplay-runtime&game=linefugg-rebirth`, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => typeof window.render_rebirth_to_text === 'function', null, { timeout: 30000 })
    const state = () => page.evaluate(() => JSON.parse(window.render_rebirth_to_text()))
    const canvas = page.locator('[data-testid=linefugg-rebirth] canvas')
    const capture = async name => {
      const path = `${root}/${config.name}-${name}.png`
      const pixels = await page.screenshot({ path, timeout: 15000 }); report.screenshots.push(path); return pixels
    }
    const world = async (x, y) => {
      const box = await canvas.boundingBox(); assert(box)
      return { x: box.x + x * box.width / 390, y: box.y + y * box.height / 850 }
    }
    const grid = async ([row, col]) => {
      const b = (await state()).boardBounds
      return world(b.x + (col + .5) * b.width / 7, b.y + (row + .5) * b.height / 7)
    }
    const cdp = config.touch ? await context.newCDPSession(page) : null
    const release = async () => cdp ? cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) : page.mouse.up()
    const trace = async (from, to, hold = false) => {
      const a = await grid(from), b = await grid(to)
      if (cdp) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
        for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + (b.x-a.x)*i/10, y: a.y+(b.y-a.y)*i/10, id: 1 }] })
      } else { await page.mouse.move(a.x,a.y); await page.mouse.down(); await page.mouse.move(b.x,b.y,{steps:10}) }
      if (!hold) { await release(); await page.waitForFunction(() => !JSON.parse(window.render_rebirth_to_text()).rerolling) }
    }
    const tap = async key => {
      const c = (await state()).controls[key], p = await world(c.x,c.y)
      if (config.touch) await page.touchscreen.tap(p.x,p.y); else await page.mouse.click(p.x,p.y)
      await page.waitForTimeout(60)
    }
    const initial = await state()
    report.engine = initial.renderer
    assert.equal(initial.game,'linefugg-rebirth'); assert.equal(initial.lines.length,0)
    assert.equal(initial.undoEnabled,false); assert.equal(initial.validateEnabled,false)
    assert.equal(initial.reducedMotion,!!config.reduce); assert.equal(initial.assetFailure,'')
    await capture('initial')
    await tap('validate'); assert.equal((await state()).finished,false)
    await trace([0,0],[0,4],true)
    assert.equal((await state()).drag.cells.length,5)
    await capture('drag'); await release()
    await page.waitForFunction(() => !JSON.parse(window.render_rebirth_to_text()).rerolling)
    console.log(config.name, 'first route released and rerolled')
    const first = await state()
    assert.equal(first.lines.length,1); assert.equal(first.undoEnabled,true)
    for (const p of first.lines[0].cells) assert.deepEqual(first.board[p.row*7+p.col],initial.board[p.row*7+p.col])
    assert.deepEqual(first.renderedLabels, first.board.map(c => c.label))
    await trace([0,0],[0,4]); assert.equal((await state()).lines.length,1)
    if (!config.touch) {
      const c = first.controls.undo, p = await world(c.x,c.y)
      await page.mouse.move(p.x,p.y); assert.equal((await state()).controls.undo.state,'hover')
      await page.mouse.down(); assert.equal((await state()).controls.undo.state,'pressed')
      await page.mouse.move(1,1); await page.mouse.up()
      assert.equal((await state()).lines.length,1)
    }
    await tap('undo'); assert.equal((await state()).lines.length,0)
    assert.deepEqual((await state()).board,initial.board)
    await trace([0,0],[0,4]); assert.deepEqual((await state()).board,first.board)
    await trace([2,0],[2,4]); await trace([4,0],[4,4])
    console.log(config.name, 'three routes reached')
    const full = await state()
    assert.equal(full.lines.length,3); assert.equal(full.validateEnabled,true); assert.equal(full.finished,false)
    for (let i=0;i<3;i++) {
      let result=0
      full.lines[i].values.forEach(v=>{result=v.kind==='add'?result+v.value:v.kind==='multiply'?result*v.value:result/v.value})
      assert.equal(full.lines[i].score,Math.round(result*100)/100)
      assert.match(full.formulas[i],/^[0-9+×÷.]+$/)
    }
    if (config.name!=='brave-degraded') {
      const host = await page.locator('[data-testid=linefugg-rebirth] .mf-phaser-host').boundingBox()
      const top=await world(0,full.essentialBounds.top),bottom=await world(0,full.essentialBounds.bottom)
      assert(top.y>=host.y-2,`${config.name} top inside host`)
      assert(bottom.y<=host.y+host.height+2,`${config.name} controls inside host`)
    }
    const proof = await capture('three-lines')
    const sample = await grid([0,0]); sample.x -= 12 * (await canvas.boundingBox()).width / 390
    const pixel = await page.evaluate(async ({ png, x, y, dpr }) => {
      const image = new Image(); image.src = `data:image/png;base64,${png}`
      await image.decode()
      const surface = document.createElement('canvas'); surface.width = image.width; surface.height = image.height
      const context = surface.getContext('2d'); context.drawImage(image, 0, 0)
      return [...context.getImageData(Math.round(x*dpr), Math.round(y*dpr), 1, 1).data]
    }, { png: proof.toString('base64'), x: sample.x, y: sample.y, dpr: config.dpr })
    assert(pixel[0] > pixel[1] + 20 && pixel[0] > pixel[2] + 20, `${config.name}: actual red route pixels must be visible, got ${pixel}`)
    report.checks.push(`${config.name}: rendered red route pixel ${pixel.join(',')}`)
    await tap('validate'); assert.equal((await state()).finished,true)
    const finished=await state();await tap('validate');assert.deepEqual((await state()).lines,finished.lines)
    await page.getByTestId('rebirth-restart').click()
    await page.waitForFunction(()=>JSON.parse(window.render_rebirth_to_text()).lines.length===0)
    assert.deepEqual((await state()).board,initial.board)
    assert.equal(await canvas.count(),1)
    report.checks.push(`${config.name}: draw, protected cells, deterministic reroll/undo, invalid duplicate, finish, restart, geometry`)
    await context.close()
  }
  if (!process.env.REBIRTH_CONFIG || process.env.REBIRTH_CONFIG === 'master') {
  const page=await browser.newPage({viewport:{width:390,height:850}});activePage=page
  page.setDefaultTimeout(12000); page.setDefaultNavigationTimeout(45000)
  await page.goto(`${base}/?usr=moigod&lab=gameplay-runtime&game=linefugg&skin=rebirth-editorial&scenario=operators`,{waitUntil:'networkidle'})
  await page.waitForFunction(()=>typeof window.render_rebirth_to_text==='function')
  await page.mouse.click(2,60)
  await page.keyboard.press('Space');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.keyboard.press('Space')
  await page.waitForFunction(()=>!JSON.parse(window.render_rebirth_to_text()).rerolling)
  const s=await page.evaluate(()=>JSON.parse(window.render_rebirth_to_text()))
  assert.equal(s.lines.length,1);assert.equal(s.lines[0].score,10);assert.equal(s.formulas[0],'8×2+4÷2')
  await page.screenshot({path:`${root}/operators-keyboard.png`});report.screenshots.push(`${root}/operators-keyboard.png`)
  report.checks.push('old Rebirth URL alias, keyboard route, ×/÷ actual result')
  // The unskinned route must still mount the original game, not Rebirth.
  const rebirthRequests=[];page.on('request',r=>{if(r.url().includes('/assets/imported/linefugg/rebirth/'))rebirthRequests.push(r.url())})
  await page.goto(`${base}/?usr=moigod&lab=gameplay-runtime&game=linefugg`,{waitUntil:'networkidle'})
  assert.equal(await page.getByTestId('linefugg-rebirth').count(),0)
  assert.equal(await page.getByTestId('rebirth-restart').count(),0)
  assert.equal(rebirthRequests.length,0)
  report.checks.push('classic route preserved, no Rebirth texture requested')
  }
  assert.deepEqual(report.errors,[])
} catch(error) {
  report.failure=String(error.stack||error)
  if(activePage&&!activePage.isClosed()) await activePage.screenshot({path:`${root}/failure-${process.env.REBIRTH_CONFIG || 'all'}.png`,timeout:10000}).catch(()=>{})
  throw error
} finally {
  await fs.writeFile(`${root}/report-${process.env.REBIRTH_CONFIG || 'all'}.json`,JSON.stringify(report,null,2))
  console.log(JSON.stringify(report,null,2))
  await browser.close()
}
