import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const output = 'artifacts/vlads-skewers'
const baseUrl = process.env.VLAD_URL || 'http://127.0.0.1:5173'
const quick = Boolean(process.env.VLAD_QUICK)
const configs = quick
  ? [{ name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, touch: true }]
  : [
      { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, touch: true },
      { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, touch: false },
    ]

await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, channel: process.platform === 'win32' ? 'msedge' : undefined })
const report = { scenarios: [], errors: [], httpErrors: [], screenshots: [] }

try {
  for (const config of configs) {
    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      deviceScaleFactor: config.deviceScaleFactor,
      hasTouch: config.touch,
    })
    const page = await context.newPage()
    const touchSession = config.touch ? await context.newCDPSession(page) : null
    page.on('pageerror', error => report.errors.push(`${config.name}: ${error.message}`))
    page.on('console', message => {
      if (message.type() !== 'error') return
      const url = message.location().url
      if (url.endsWith('/favicon.ico')) return
      report.errors.push(`${config.name}: ${message.text()} @ ${url}`)
    })
    page.on('response', response => { if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() }) })
    await page.goto(`${baseUrl}/?game=vlads-skewers`, { waitUntil: 'domcontentloaded' })
    await page.locator('.mf-insert-coin').first().click()
    await page.waitForFunction(() => typeof window.render_game_to_text === 'function' && typeof window.vlad_test_action === 'function')
    await page.waitForTimeout(500)

    const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()))
    const advance = ms => page.evaluate(value => window.advanceTime(value), ms)
    const canvas = page.locator('.game-slot[data-index="0"] .mf-phaser-host canvas').first()
    if (!config.touch) {
      const feedWidth = await page.locator('.game-feed').evaluate(element => element.getBoundingClientRect().width)
      assert.ok(feedWidth <= 521, 'Vlad desktop surface must keep the canonical LineFugg/Core feed width')
    }
    const point = async (x, y) => {
      const box = await canvas.boundingBox()
      assert.ok(box, 'Gameplay canvas must be visible')
      return { x: box.x + x / 390 * box.width, y: box.y + y / 844 * box.height }
    }
    const capture = async name => {
      const path = `${output}/${config.name}-${name}.png`
      await page.screenshot({ path })
      report.screenshots.push(path)
    }

    const initial = await state()
    assert.equal(initial.lives, 3)
    assert.equal(initial.score, 0)
    assert.equal(initial.customerRosterSize, 15)
    assert.equal(initial.maxSkewerIngredients, 5)
    assert.ok(initial.activeCustomer.order.length <= 5, 'Production recipes must never exceed five ingredients')
    assert.ok(initial.fx.ambientFlames >= 15, 'The scene must contain authored animated fire across fixtures, rear room and grill')
    assert.ok(initial.fx.embersAlive + initial.fx.foregroundEmbersAlive >= 12, 'Ambient fire must visibly shed a dense field of sparks')
    assert.ok(initial.fx.smokeAlive >= 3, 'The fire scene must carry visible depth smoke')
    assert.equal(initial.remainingCustomers, 3)
    assert.equal(initial.visibleCustomers, 3)
    assert.equal(initial.skewer.stack.length, 0)
    assert.ok(initial.fallArea.minX <= 40 && initial.fallArea.maxX >= 325, 'Food fall space must use the widened arena')
    const wrapperBackground = await page.locator('.vlad-skewers-game').evaluate(element => getComputedStyle(element).backgroundImage)
    assert.equal(wrapperBackground, 'none', 'Game-owned scenery must stay inside the canonical 390-wide stage')
    assert.ok(initial.input.hitRadiusX > 55 && initial.input.hitRadiusY > 65, 'The hand pickup area must be substantially larger than the visible hand')
    assert.ok(initial.skewer.y <= 780, 'The natural pose must expose roughly one third of Vlad’s arm')
    await capture('ambient-fire-particles')

    if (!touchSession) {
      const box = await canvas.boundingBox()
      assert.ok(box, 'Gameplay canvas must be visible for outside-canvas control probe')
      const miss = await point(90, 420)
      await page.mouse.click(miss.x, miss.y)
      await advance(100)
      assert.equal((await state()).input.handHint, true, 'A click outside the hand must trigger its visual hint')
      await capture('hand-hint')
      const gripState = await state()
      const grip = await point(gripState.input.gripX, gripState.input.gripY)
      await page.mouse.move(grip.x, grip.y)
      await page.mouse.down()
      assert.equal((await state()).input.handHint, false, 'The hand hint must stop as soon as the hand is grabbed')
      await page.mouse.move(box.x - 60, grip.y)
      await advance(17)
      const atLeftLimit = (await state()).skewer.x
      assert.ok(atLeftLimit <= 55, 'The hand must stop at its left gameplay limit while the pointer continues')
      await page.mouse.move(grip.x, grip.y)
      await advance(17)
      assert.ok(Math.abs((await state()).skewer.x - 195) < 1, 'Returning to the original pointer position must restore the exact grabbed point without drift')
      const highReach = await point(195, 420)
      await page.mouse.move(highReach.x, highReach.y)
      await advance(34)
      assert.ok((await state()).skewer.tipY < 170, 'Vlad must reach the upper gameplay field')
      await capture('arm-high-reach')
      await page.mouse.up()
      await page.waitForTimeout(430)
    }

    await page.evaluate(() => window.vlad_test_action('downward-probe'))
    const downwardStart = await state()
    const woundedId = downwardStart.drops.find(drop => drop.kind === 'tomato')?.id
    const gripDown = await point(downwardStart.input.gripX, downwardStart.input.gripY)
    const sideGrip = await point(100, downwardStart.input.gripY)
    const highSide = await point(100, downwardStart.input.gripY - 80)
    const highCentre = await point(195, downwardStart.input.gripY - 80)
    if (touchSession) {
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...gripDown, id: 2 }] })
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...sideGrip, id: 2 }] })
      await advance(17)
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...highSide, id: 2 }] })
      await advance(17)
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...highCentre, id: 2 }] })
      await advance(17)
      await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...gripDown, id: 2 }] })
    } else {
      await page.mouse.move(gripDown.x, gripDown.y)
      await page.mouse.down()
      await page.mouse.move(sideGrip.x, sideGrip.y)
      await advance(17)
      await page.mouse.move(highSide.x, highSide.y)
      await advance(17)
      await page.mouse.move(highCentre.x, highCentre.y)
      await advance(17)
      await page.mouse.move(gripDown.x, gripDown.y)
    }
    await advance(34)
    const downwardHit = await state()
    assert.equal(downwardHit.skewer.stack.length, 0, 'A descending tip must never impale food')
    const wounded = downwardHit.drops.find(drop => drop.id === woundedId)
    assert.ok(wounded && wounded.wounds === 1, 'A descending tip must wound and panic the ingredient')
    assert.equal(wounded.emotion, 'panic')
    assert.ok(wounded.speed > 50, 'A knife-like descending hit must accelerate the falling ingredient')
    if (touchSession) await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    else await page.mouse.up()
    await page.waitForTimeout(430)
    await capture('descending-wound')

    const probe = JSON.parse(await page.evaluate(() => window.vlad_test_action('tip-probe')))
    const probeId = probe.drops.find(drop => drop.kind === 'pepper')?.id
    assert.ok(probeId, 'Deterministic tip probe must exist')
    const pressAt = async (x, y) => {
      const before = await state()
      const grip = await point(before.skewer.x, before.skewer.y - 68)
      const horizontal = await point(before.skewer.x + (x - before.skewer.x), before.skewer.y - 68)
      const destination = await point(before.skewer.x + (x - before.skewer.x), before.skewer.y - 68 + (y - before.skewer.y))
      if (touchSession) {
        await touchSession.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...grip, id: 1 }] })
        await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...horizontal, id: 1 }] })
        await advance(17)
        await touchSession.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...destination, id: 1 }] })
      } else {
        await page.mouse.move(grip.x, grip.y)
        await page.mouse.down()
        await page.mouse.move(horizontal.x, horizontal.y)
        await advance(17)
        await page.mouse.move(destination.x, destination.y)
      }
      await advance(34)
      if (touchSession) await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      else await page.mouse.up()
      await page.waitForTimeout(430)
    }
    await pressAt(300, 765)
    assert.equal((await state()).skewer.stack.length, 0, 'A press beside the gold tip must not impale')
    assert.ok((await state()).drops.some(drop => drop.id === probeId), 'Near-tip miss must leave the food falling')
    await pressAt(195, 765)
    assert.equal((await state()).skewer.stack.length, 1, 'A press exactly at the gold tip must impale')
    assert.ok(Math.abs((await state()).skewer.stack[0].rotation - 0.401) < 0.03, 'Pierced food must preserve its incoming orientation')
    assert.ok((await state()).skewer.stack[0].entryProgress < 1, 'Caught food must still be visibly sliding onto the skewer after the initial impact')
    assert.ok(!(await state()).drops.some(drop => drop.id === probeId), 'Exact-tip hit must remove the caught food')
    await page.waitForTimeout(430)
    assert.ok(Math.abs((await state()).skewer.y - 780) < 1, 'Released arm must spring back to its centered natural pose')
    assert.equal((await state()).skewer.stack[0].entryProgress, 1, 'The food must settle progressively instead of teleporting')
    await capture('pointer-impale')

    const physicsProbe = JSON.parse(await page.evaluate(() => window.vlad_test_action('physics-probe')))
    const pushedId = physicsProbe.drops.find(drop => drop.kind === 'tomato')?.id
    await advance(80)
    const pushed = (await state()).drops.find(drop => drop.id === pushedId)
    assert.ok(pushed && Math.abs(pushed.x - (physicsProbe.skewer.x + 24)) < 3, 'The shaft and hand must let falling food pass through without blocking or pushing it')
    assert.equal((await state()).skewer.stack.length, 0, 'Only the gold point may impale')

    await page.evaluate(() => window.vlad_test_action('ragdoll'))
    const ragdoll = await state()
    assert.equal(ragdoll.combo, 4)
    assert.equal(ragdoll.skewer.stack.length, 4)
    assert.deepEqual(ragdoll.skewer.stack.map(item => item.chainPoints), [1, 2, 6, 24], 'Fast catches must use cumulative chain values')
    assert.ok(ragdoll.skewer.stack.some(item => item.centeringError > 50), 'Off-centre piercing must be retained instead of auto-centred')
    assert.ok(new Set(ragdoll.skewer.stack.map(item => item.x)).size > 1, 'Off-centre ingredients must visibly hang at different horizontal offsets')
    const whirled = JSON.parse(await page.evaluate(() => window.vlad_test_action('limb-whirl')))
    assert.ok(whirled.skewer.stack.some(item => item.limbAngles.some(angle => Math.abs(angle) > 0.65)), 'Fast skewer movement must send the light limbs into wide inertial arcs')
    assert.ok(whirled.skewer.stack.some(item => item.jointAngles.some(angle => Math.abs(angle) > 0.35)), 'Every limb must have an independently reacting second joint')
    await advance(650)
    await capture('ragdoll-off-centre')

    await page.evaluate(() => window.vlad_test_action('brutality'))
    const served = await state()
    assert.equal(served.skewer.stack.length, 0, 'A completed skewer must immediately free the player for the next order')
    assert.equal(served.score, 383, 'Chain 1+2+6+24+120 with average beauty ×2.5 must score 383 after rounding')
    assert.equal(served.served, 1)
    assert.equal(served.remainingCustomers, ragdoll.remainingCustomers - 1, 'A completed skewer must validate automatically and remove exactly one client')
    assert.equal(served.visibleCustomers, Math.min(5, served.remainingCustomers))
    await page.waitForTimeout(420)
    await capture('brutality-delivery')
    await page.waitForTimeout(600)
    await capture('customer-beauty-reaction')

    await page.evaluate(() => window.vlad_test_action('lose'))
    assert.equal((await state()).lives, 2)
    await page.waitForTimeout(180)
    await capture('one-life-lost')

    const grillingStart = JSON.parse(await page.evaluate(() => window.vlad_test_action('grill')))
    const grillingId = grillingStart.drops.find(drop => drop.state === 'grilling')?.id
    const grillingRotation = grillingStart.drops.find(drop => drop.id === grillingId)?.rotation
    assert.ok(grillingId, 'Deterministic grill probe must exist')
    await advance(520)
    const cooked = await state()
    assert.ok(cooked.drops.some(drop => drop.state === 'grilling'))
    assert.ok(Math.abs(cooked.drops.find(drop => drop.id === grillingId).rotation - grillingRotation) < 0.01, 'Food must keep its incoming orientation while grilling')
    await capture('grill-appetizing')
    await advance(1250)
    await capture('grill-charred')
    await advance(700)
    await page.waitForTimeout(260)
    assert.ok(!(await state()).drops.some(drop => drop.id === grillingId), 'Overcooked food must ash and disappear')

    const maximumRecipe = JSON.parse(await page.evaluate(() => window.vlad_test_action('max-recipe')))
    assert.equal(maximumRecipe.activeCustomer.order.length, 5, 'Late-game recipes must be hard-capped at five ingredients')
    const fullQueue = JSON.parse(await page.evaluate(() => window.vlad_test_action('queue-six')))
    assert.equal(fullQueue.remainingCustomers, 6)
    assert.equal(fullQueue.visibleCustomers, 5, 'At most five waiting floors should be occupied')
    await capture('five-customer-queue')

    report.scenarios.push({
      name: config.name,
      passed: true,
      input: `${config.touch ? 'CDP touch' : 'mouse'} impalement + deterministic DEV art-state probes`,
      scorePreserved: served.score,
      logicalViewport: '390x844 uniform FIT',
    })
    await context.close()
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.httpErrors, [])
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}

console.log(JSON.stringify(report.scenarios, null, 2))
