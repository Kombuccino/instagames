import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/audio/coreAudioManager.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { CoreAudioManager } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

// Architectural guard: new clients cannot silently reintroduce independent contexts.
const srcRoot = new URL('../src/', import.meta.url)
for (const entry of fs.readdirSync(srcRoot, { recursive: true })) {
  if (!/\.tsx?$/.test(entry) || entry.replaceAll('\\', '/') === 'audio/coreAudioManager.ts') continue
  const text = fs.readFileSync(new URL(entry.replaceAll('\\', '/'), srcRoot), 'utf8')
  assert.equal(/new\s+(?:window\.)?(?:AudioContext|webkitAudioContext)\s*\(/.test(text), false, `${entry}: local AudioContext forbidden`)
  if (text.includes('new Phaser.Game(')) assert.match(text, /noAudio:\s*true/, `${entry}: Phaser must delegate audio to Core`)
}

class Events {
  listeners = new Map()
  addEventListener(name, fn) { const list = this.listeners.get(name) ?? []; list.push(fn); this.listeners.set(name, list) }
  removeEventListener(name, fn) { this.listeners.set(name, (this.listeners.get(name) ?? []).filter(item => item !== fn)) }
  fire(name, event = {}) { for (const fn of this.listeners.get(name) ?? []) fn(event) }
}
class Gain {
  value = 1
  events = []
  setValueAtTime(value, time) { this.value = value; this.events.push(['set', value, time]) }
  linearRampToValueAtTime(value, time) { this.value = value; this.events.push(['ramp', value, time]) }
  cancelAndHoldAtTime(time) { this.events.push(['hold', time]) }
}
class Node {
  gain = new Gain()
  disconnected = false
  connect(node) { return node }
  disconnect() { this.disconnected = true }
}
class Context extends Events {
  static count = 0
  state = 'suspended'
  currentTime = 3
  destination = new Node()
  resumes = 0
  allow = false
  constructor() { super(); Context.count++ }
  createGain() { return new Node() }
  resume() { this.resumes++; if (!this.allow) return new Promise(() => {}); this.state = 'running'; this.fire('statechange'); return Promise.resolve() }
  suspend() { this.state = 'suspended'; this.fire('statechange'); return Promise.resolve() }
}
globalThis.window = Object.assign(new Events(), { AudioContext: Context })
globalThis.document = Object.assign(new Events(), { hidden: false })
const core = new CoreAudioManager()
core.install(); core.install()
assert.equal(window.listeners.get('pointerdown').length, 1)
const stats = () => ({ starts: 0, pauses: 0, resets: 0, voices: [] })
const a = stats(), b = stats()
const transport = data => ({ start(voice) { data.starts++; data.voices.push(voice) }, pause() { data.pauses++ }, reset() { data.resets++ } })
const home = core.createMusic('home', transport(a))
await home.start()
assert.equal(core.getSnapshot().requested, true)
assert.equal(core.getSnapshot().playing, false)
const context = core.getContext()
const attempts = context.resumes
window.fire('pointerdown', { isTrusted: true })
window.fire('touchend', { isTrusted: true })
assert.equal(context.resumes, attempts + 2, 'Pending autoplay promises must not prevent later gesture attempts')
context.allow = true
window.fire('keydown', { isTrusted: true })
await Promise.resolve()
assert.equal(a.starts, 1)
await Promise.all([home.start(), home.start(), core.unlock()])
assert.equal(a.starts, 1, 'Concurrent starts are idempotent')
home.pause()
window.fire('pointerdown', { isTrusted: true })
assert.equal(a.starts, 1, 'Normal gestures must not undo explicit music pause')
await home.resume()
assert.equal(a.starts, 2)
context.state = 'interrupted'; context.fire('statechange')
assert.equal(home.requested, true)
assert.equal(home.playing, false)
window.fire('touchend', { isTrusted: true })
assert.equal(a.starts, 3)
document.hidden = true; document.fire('visibilitychange')
assert.equal(core.getSnapshot().playing, false)
document.hidden = false; document.fire('visibilitychange')
assert.equal(a.starts, 4)
window.fire('pagehide'); window.fire('pageshow')
assert.equal(a.starts, 5)
home.stop()
window.fire('focus'); window.fire('keydown', { isTrusted: true })
assert.equal(a.starts, 5, 'Stopped music must never resurrect')
await home.start()
const next = core.createMusic('game', transport(b))
await next.start()
assert.equal(home.requested, false)
assert.equal(core.getSnapshot().musicId, 'game')
home.destroy()
assert.equal(core.getSnapshot().musicId, 'game', 'Stale cleanup cannot stop a newer owner')
assert.equal(Context.count, 1)
core.setBusVolume('MUSIC', .4)
core.setMuted(true)
assert.equal(core.getSnapshot().volumes.MUSIC, .4)
assert.equal(core.getSnapshot().muted, true)
assert.equal(core.playEffect('UI', 1, () => {}, 'ui'), true)
assert.equal(core.getSnapshot().activeEffects, 1)
await core.suspend()
assert.equal(core.getSnapshot().activeEffects, 0)
window.fire('keydown', { isTrusted: true })
assert.equal(next.playing, false, 'Explicit Core suspension survives input')
await core.resume()
assert.equal(next.playing, true)
next.destroy()
await new Promise(resolve => setTimeout(resolve, 180))
assert.ok([...a.voices, ...b.voices].every(voice => voice.output.disconnected), 'Retired output graphs are disconnected after their fade')
assert.equal(core.getSnapshot().requested, false)
console.log('Core audio: autoplay intent, retry, idempotency, interruption, visibility, pageshow, pause, stop, ownership, buses, effects and fade cleanup passed.')
