import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'

const url = process.env.AUDIO_TEST_URL ?? 'http://127.0.0.1:5173'
const output = 'dist/audio-tests'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true, args: ['--autoplay-policy=document-user-activation-required', '--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
})
const report = { scenarios: [], signals: [], errors: [], warnings: [] }
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
await context.addInitScript(() => {
  const probe = window.__audioProbe = { contexts: 0, sources: 0, maxSources: 0 }
  const Original = window.AudioContext
  window.AudioContext = class extends Original {
    constructor(...args) {
      super(...args); probe.contexts++
      for (const method of ['createOscillator', 'createBufferSource']) {
        const create = this[method].bind(this)
        this[method] = (...values) => {
          const node = create(...values)
          const start = node.start.bind(node)
          node.start = (...times) => {
            start(...times)
            probe.sources++; probe.maxSources = Math.max(probe.maxSources, probe.sources)
            node.addEventListener('ended', () => probe.sources--, { once: true })
          }
          return node
        }
      }
    }
  }
})
const page = await context.newPage()
page.on('pageerror', error => report.errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') report.warnings.push(message.text())
})
const snapshot = () => page.evaluate(() => ({ ...globalThis[Symbol.for('minifugg.coreAudio')].getSnapshot(), probe: { ...window.__audioProbe } }))
const coreCall = (method, args = []) => page.evaluate(([method, args]) => globalThis[Symbol.for('minifugg.coreAudio')][method](...args), [method, args])
const waitPlaying = () => page.waitForFunction(() => globalThis[Symbol.for('minifugg.coreAudio')]?.getSnapshot().playing)
const signal = async (name) => {
  const measurement = await page.evaluate(async () => {
    const core = globalThis[Symbol.for('minifugg.coreAudio')]
    const analyser = core.getContext().createAnalyser()
    analyser.fftSize = 2048
    core.master.connect(analyser)
    const data = new Float32Array(analyser.fftSize)
    let peak = 0, energy = 0, count = 0
    for (let n = 0; n < 160; n++) {
      analyser.getFloatTimeDomainData(data)
      for (const sample of data) { peak = Math.max(peak, Math.abs(sample)); energy += sample * sample; count++ }
      await new Promise(resolve => setTimeout(resolve, 12))
    }
    core.master.disconnect(analyser)
    analyser.disconnect()
    return { peak, rms: Math.sqrt(energy / count) }
  })
  report.signals.push({ name, ...measurement })
  assert.ok(measurement.peak > .0001 && measurement.peak < .99, `${name}: non-silent, unclipped signal`)
}
try {
  await page.goto(url)
  await page.waitForTimeout(600)
  let state = await snapshot()
  assert.equal(state.requested, true)
  assert.equal(state.playing, false, 'Fresh document obeys blocked autoplay')
  assert.equal(state.probe.contexts, 1)
  await page.screenshot({ path: `${output}/home.png` })
  await page.keyboard.press('Shift')
  await waitPlaying()
  await signal('Home')
  report.scenarios.push('Fresh Home: blocked request retained, first keyboard unlock')
  await page.getByRole('button', { name: 'Tap to play MiniFugg', exact: true }).click()
  await page.waitForTimeout(1100)
  state = await snapshot()
  assert.equal(state.playing, false)
  assert.equal(state.probe.sources, 0)
  await page.getByRole('button', { name: /INSERT COIN/ }).first().click()
  await page.waitForTimeout(600)
  assert.equal((await snapshot()).probe.contexts, 1)
  await page.getByRole('button', { name: 'Return to cover', exact: true }).click()
  await page.waitForTimeout(300)
  assert.equal((await snapshot()).probe.sources, 0)
  report.scenarios.push('Home → random cover → gameplay → cover: one context, no ghost sources')

  // A fresh document, with pointer as the first activation instead of keyboard.
  await page.goto(url)
  await page.waitForTimeout(300)
  await page.mouse.move(195, 420); await page.mouse.down()
  await waitPlaying()
  await page.mouse.up()
  await page.waitForTimeout(1100)
  assert.equal((await snapshot()).probe.contexts, 1)
  report.scenarios.push('First pointer unlock and normal Home action share the gesture')
  await page.goto(`${url}/?game=tetramindfck`)
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Page.reload', { ignoreCache: true })
  await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(500)
  // GameFeed writes ?game= into history: reload intentionally opens that cover.
  await page.getByRole('button', { name: /INSERT COIN/ }).first().click()
  await waitPlaying()
  assert.equal((await snapshot()).probe.contexts, 1)
  report.scenarios.push('Cache-bypass reload: direct-cover route unlocks on play')

  for (const game of ['linefugg', 'tetramindfck']) {
    await page.goto(`${url}/?game=${game}`)
    await page.getByRole('button', { name: /INSERT COIN/ }).first().click()
    await waitPlaying()
    await signal(game)
    await page.screenshot({ path: `${output}/${game}.png` })
    state = await snapshot()
    assert.equal(state.probe.contexts, 1, 'Phaser never creates a second audio context')
    assert.ok(state.probe.maxSources < 100, 'No whole-loop source preallocation')
    if (game === 'tetramindfck') {
      await page.keyboard.press('ArrowLeft')
      assert.ok((await snapshot()).activeEffects <= 1, 'One control action does not multiply SFX')
      await page.waitForTimeout(180)
      assert.equal((await snapshot()).activeEffects, 0)
    }
    await coreCall('pauseMusic')
    await page.waitForTimeout(150)
    await page.keyboard.press('Shift')
    assert.equal((await snapshot()).playing, false)
    assert.equal((await snapshot()).probe.sources, 0)
    await coreCall('resumeMusic'); await waitPlaying()
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal((await snapshot()).playing, false)
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')))
    await waitPlaying()
    // Explicit stop must survive lifecycle and input retries.
    await coreCall('stopMusic')
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await page.keyboard.press('Shift'); await page.waitForTimeout(180)
    assert.equal((await snapshot()).requested, false)
    assert.equal((await snapshot()).probe.sources, 0)
    await page.getByRole('button', { name: 'Return to cover', exact: true }).click()
    for (let n = 0; n < 3; n++) {
      await page.getByRole('button', { name: /INSERT COIN/ }).first().click(); await waitPlaying()
      await page.getByRole('button', { name: 'Return to cover', exact: true }).click(); await page.waitForTimeout(250)
      assert.equal((await snapshot()).probe.sources, 0)
    }
    assert.equal((await snapshot()).probe.contexts, 1)
    report.scenarios.push(`${game}: pause, resume, page lifecycle, explicit stop, repeated reopen/close`)
  }

  await page.goto(`${url}/?usr=moigod&lab=music`)
  const card = page.locator('.mf-music-card').filter({ hasText: 'MF-MUS-0008' })
  await card.getByRole('button', { name: /ÉCOUTER/ }).click()
  await waitPlaying()
  await page.waitForTimeout(700)
  await card.getByRole('button', { name: /PAUSE/ }).click()
  await page.waitForTimeout(200)
  assert.equal((await snapshot()).contextState, 'running', 'Lab pause does not suspend SFX/UI')
  assert.equal((await snapshot()).playing, false)
  await page.keyboard.press('Space'); await waitPlaying()
  await signal('Audio Lab LineFugg')
  await card.getByRole('button', { name: /STOP/ }).click()
  await page.waitForTimeout(250)
  assert.equal((await snapshot()).probe.sources, 0)
  report.scenarios.push('Audio Lab: audition, pause/Space resume, stop; shared context retained')
  // Browser-provided fake device: no real microphone or personal audio is captured.
  await card.getByRole('button', { name: /IDÉE VOCALE/ }).click()
  await card.getByRole('button', { name: /ENREGISTRER UNE IDÉE/ }).click()
  await card.getByRole('button', { name: /STOP LA PRISE/ }).waitFor({ timeout: 15000 })
  await page.waitForTimeout(350)
  await card.getByRole('button', { name: /STOP LA PRISE/ }).click()
  const recording = card.locator('audio')
  await recording.waitFor()
  await recording.evaluate(element => element.play())
  await page.waitForTimeout(80)
  assert.equal((await snapshot()).probe.contexts, 1, 'Recording meter and preview reuse Core context')
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
  assert.equal(await recording.evaluate(element => element.paused), true)
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow')))
  assert.equal(await recording.evaluate(element => element.paused), true, 'Transient recorded take does not replay on foreground')
  await coreCall('stopMusic')
  report.scenarios.push('Fake microphone capture, shared analyser, routed native preview and background stop')
  assert.deepEqual(report.errors, [])
  report.status = 'passed'
} catch (error) {
  report.status = 'failed'; report.failure = error.stack
  await page.screenshot({ path: `${output}/failure.png` })
  throw error
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
