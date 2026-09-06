/** Core is the only owner of realtime Web Audio. Renderers never own its lifecycle. */
export type AudioBus = 'MUSIC' | 'SFX' | 'UI' | 'AMBIENCE'
export type AudioSource = OscillatorNode | AudioBufferSourceNode

const volume = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0

export function fadeGain(param: AudioParam, value: number, now: number, seconds = .025) {
  if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now)
  else {
    const current = param.value
    param.cancelScheduledValues(now)
    param.setValueAtTime(current, now)
  }
  param.linearRampToValueAtTime(value, now + Math.max(.005, seconds))
}

/** Every synth must release its complete note graph when the source ends. */
export function rememberAudioSource(sources: AudioSource[], source: AudioSource, nodes: AudioNode[] = []) {
  sources.push(source)
  source.addEventListener('ended', () => {
    const index = sources.indexOf(source)
    if (index >= 0) sources.splice(index, 1)
    source.disconnect()
    nodes.forEach((node) => node.disconnect())
  }, { once: true })
}

export class AudioVoice {
  readonly output: GainNode
  readonly sources: AudioSource[] = []
  private disposed = false
  private nodes: AudioNode[] = []
  private cleanupTimer: ReturnType<typeof setTimeout> | undefined
  constructor(readonly context: AudioContext, destination: AudioNode, gain = 1, fade = .04) {
    this.output = context.createGain()
    this.output.gain.setValueAtTime(0, context.currentTime)
    this.output.gain.linearRampToValueAtTime(gain, context.currentTime + Math.max(.005, fade))
    this.output.connect(destination)
  }
  own(...nodes: AudioNode[]) { this.nodes.push(...nodes) }
  stop(seconds = .03) {
    if (this.disposed) return
    const duration = this.context.state === 'running' ? Math.max(.005, seconds) : 0
    fadeGain(this.output.gain, 0, this.context.currentTime, duration)
    this.sources.slice().forEach((source) => {
      try { source.stop(this.context.currentTime + duration) } catch { /* already ended */ }
    })
    if (this.cleanupTimer !== undefined) clearTimeout(this.cleanupTimer)
    if (!duration) this.dispose()
    else this.cleanupTimer = setTimeout(() => this.dispose(), duration * 1000 + 30)
  }
  private dispose() {
    if (this.disposed) return
    this.disposed = true
    this.sources.slice().forEach((source) => {
      try { source.stop() } catch { /* already ended */ }
      source.disconnect()
    })
    this.sources.length = 0
    this.output.disconnect()
    this.nodes.forEach(node => node.disconnect())
    this.nodes = []
  }
}

/** Internal adapter contract: start synchronously, cancel timers synchronously on pause. */
export type MusicTransport = {
  start(voice: AudioVoice): void
  pause(): void
  reset(): void
}
export type MusicHandle = {
  start(): Promise<boolean>
  resume(): Promise<boolean>
  pause(): void
  stop(fadeSeconds?: number): void
  destroy(): void
  readonly requested: boolean
  readonly playing: boolean
}
type MusicRequest = {
  id: string
  transport: MusicTransport
  gain: number
  requested: boolean
  paused: boolean
  destroyed: boolean
  voice: AudioVoice | null
}

export class CoreAudioManager {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private buses = new Map<AudioBus, GainNode>()
  private volumes = { MASTER: .8, MUSIC: .72, SFX: .58, UI: .58, AMBIENCE: .5 }
  private muted = false
  private suspended = false
  private hidden = false
  private current: MusicRequest | null = null
  private tail: AudioVoice | null = null
  private installed = false
  private lastError: string | null = null
  private effects = new Map<AudioVoice, { owner?: string, timer: ReturnType<typeof setTimeout> }>()
  private mediaSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>()
  private previews = new Set<HTMLMediaElement>()

  install() {
    if (this.installed || typeof window === 'undefined') return
    this.installed = true
    this.hidden = document.hidden
    // No await, timeout, preventDefault or propagation cancellation before resume().
    window.addEventListener('pointerdown', this.onGesture, { capture: true, passive: true })
    window.addEventListener('pointerup', this.onGesture, { capture: true, passive: true })
    window.addEventListener('touchend', this.onGesture, { capture: true, passive: true })
    window.addEventListener('keydown', this.onGesture, true)
    document.addEventListener('visibilitychange', this.onVisibility)
    window.addEventListener('pageshow', this.onPageShow)
    window.addEventListener('pagehide', this.onPageHide)
    window.addEventListener('focus', this.onFocus)
  }
  private onGesture = (event: Event) => { if (event.isTrusted) void this.unlock() }
  private onVisibility = () => {
    this.hidden = document.hidden
    if (this.hidden) this.background()
    else void this.resumeContext()
  }
  private onPageHide = () => { this.hidden = true; this.background() }
  private onPageShow = () => { this.hidden = document.hidden; void this.resumeContext() }
  private onFocus = () => { if (!document.hidden) { this.hidden = false; void this.resumeContext() } }
  private background() {
    this.haltCurrent()
    this.stopEffects()
    if (this.context?.state === 'running') void this.suspendContext()
  }

  /** For Core synth/recorder adapters only. Games use the semantic facade. */
  getContext(): AudioContext {
    this.install()
    if (!this.context) {
      const Constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const context = new Constructor({ latencyHint: 'interactive' })
      this.context = context
      this.master = context.createGain()
      this.master.gain.value = this.muted ? 0 : this.volumes.MASTER
      this.master.connect(context.destination)
      for (const name of ['MUSIC', 'SFX', 'UI', 'AMBIENCE'] as const) {
        const bus = context.createGain()
        bus.gain.value = this.volumes[name]
        bus.connect(this.master)
        this.buses.set(name, bus)
      }
      context.addEventListener('statechange', this.onStateChange)
    }
    return this.context
  }
  getBus(bus: AudioBus) { this.getContext(); return this.buses.get(bus)! }
  private onStateChange = () => {
    if (this.context?.state === 'running' && !this.hidden && !this.suspended) this.reconcile()
    else { this.haltCurrent(); this.stopEffects() }
  }
  unlock() { return this.resumeContext() }
  resume() { this.suspended = false; return this.resumeContext() }
  suspend() {
    this.suspended = true
    this.haltCurrent()
    this.stopEffects()
    return this.suspendContext()
  }
  private suspendContext() {
    return this.context?.suspend().then(() => {
      // Foreground may arrive while the browser is still completing suspend().
      if (!this.hidden && !this.suspended) void this.resumeContext()
    }).catch(() => undefined) ?? Promise.resolve()
  }
  private resumeContext(): Promise<boolean> {
    if (this.hidden || this.suspended) return Promise.resolve(false)
    try {
      const context = this.getContext()
      if (context.state === 'running') { this.reconcile(); return Promise.resolve(true) }
      // Deliberately do not cache a pending resume promise: another real gesture must retry.
      const attempt = context.resume()
      void attempt.then(() => { this.lastError = null; this.reconcile() }, (error: unknown) => {
        this.lastError = String(error)
      })
      // Autoplay resume may remain pending indefinitely. Requests never await it.
      return Promise.resolve(false)
    } catch (error) { this.lastError = String(error); return Promise.resolve(false) }
  }
  private reconcile() {
    const request = this.current
    if (!request || !request.requested || request.paused || request.destroyed || request.voice
      || this.hidden || this.suspended || this.context?.state !== 'running') return
    const voice = new AudioVoice(this.context, this.getBus('MUSIC'), request.gain, .08)
    request.voice = voice
    try { request.transport.start(voice) }
    catch (error) { this.lastError = String(error); this.haltCurrent() }
  }
  private haltCurrent(fade = .03) {
    const request = this.current
    if (!request?.voice) return
    request.transport.pause()
    this.tail?.stop(.005)
    this.tail = request.voice
    request.voice.stop(fade)
    request.voice = null
  }
  createMusic(id: string, transport: MusicTransport, gain = 1): MusicHandle {
    const request: MusicRequest = { id, transport, gain, requested: false, paused: false, destroyed: false, voice: null }
    const start = () => {
      if (request.destroyed) return Promise.resolve(false)
      if (this.current !== request) {
        this.stopMusic(.12)
        this.current = request
      }
      request.requested = true
      request.paused = false
      void this.resumeContext()
      this.reconcile()
      return Promise.resolve(Boolean(request.voice))
    }
    const pause = () => {
      request.paused = true
      if (this.current === request) this.haltCurrent()
    }
    const stop = (fade = .08) => {
      request.requested = false
      request.paused = false
      if (this.current === request) { this.haltCurrent(fade); this.current = null }
      transport.reset()
    }
    return {
      start, resume: () => request.requested ? start() : Promise.resolve(false), pause, stop,
      destroy: () => { stop(); request.destroyed = true },
      get requested() { return request.requested },
      get playing() { return Boolean(request.voice) },
    }
  }
  setMusic(handle: MusicHandle) { return handle.start() }
  stopMusic(fade = .12) {
    if (!this.current) return
    const request = this.current
    request.requested = false
    this.haltCurrent(fade)
    request.transport.reset()
    this.current = null
  }
  pauseMusic() { if (this.current) { this.current.paused = true; this.haltCurrent() } }
  resumeMusic() {
    if (this.current?.requested) this.current.paused = false
    return this.resumeContext()
  }
  setBusVolume(bus: AudioBus | 'MASTER', value: number) {
    this.volumes[bus] = volume(value)
    const node = bus === 'MASTER' ? this.master : this.buses.get(bus)
    if (node && this.context) fadeGain(node.gain, bus === 'MASTER' && this.muted ? 0 : this.volumes[bus], this.context.currentTime)
  }
  setMuted(muted: boolean) { this.muted = muted; this.setBusVolume('MASTER', this.volumes.MASTER) }
  /** Internal synth adapter; short effects never retain an autoplay request. */
  playEffect(bus: AudioBus, seconds: number, synth: (voice: AudioVoice) => void, owner?: string) {
    void this.unlock()
    if (this.context?.state !== 'running' || this.hidden || this.suspended || this.effects.size >= 24) return false
    const voice = new AudioVoice(this.context, this.getBus(bus), 1, .005)
    try { synth(voice) } catch (error) { voice.stop(); this.lastError = String(error); return false }
    const timer = setTimeout(() => { voice.stop(); this.effects.delete(voice) }, Math.max(.05, seconds) * 1000)
    this.effects.set(voice, { owner, timer })
    return true
  }
  stopEffects(owner?: string) {
    if (owner === undefined) this.previews.forEach(element => element.pause())
    for (const [voice, entry] of this.effects) if (owner === undefined || entry.owner === owner) {
      clearTimeout(entry.timer)
      voice.stop()
      this.effects.delete(voice)
    }
  }
  /** Local recorded-take previews retain native controls but share the Core mix.
   * They are transient auditions: background stops them, without automatic replay. */
  connectMediaPreview(element: HTMLMediaElement) {
    let source = this.mediaSources.get(element)
    if (!source) {
      source = this.getContext().createMediaElementSource(element)
      this.mediaSources.set(element, source)
    }
    source.connect(this.getBus('UI'))
    this.previews.add(element)
    const unlock = () => { void this.unlock() }
    element.addEventListener('play', unlock)
    return () => {
      element.pause()
      element.removeEventListener('play', unlock)
      source.disconnect()
      this.previews.delete(element)
    }
  }
  getSnapshot() {
    return {
      contextState: this.context?.state ?? 'uninitialized', contextsCreated: this.context ? 1 : 0,
      musicId: this.current?.id ?? null, requested: this.current?.requested ?? false,
      paused: this.current?.paused ?? false, playing: Boolean(this.current?.voice),
      activeSources: this.current?.voice?.sources.length ?? 0,
      activeEffects: this.effects.size,
      muted: this.muted, hidden: this.hidden, suspended: this.suspended, volumes: { ...this.volumes }, lastError: this.lastError,
    }
  }
}

// Also survive duplicate module URLs during Vite HMR without another context/listener set.
const sessionKey = Symbol.for('minifugg.coreAudio')
const session = globalThis as unknown as Record<symbol, CoreAudioManager | undefined>
export const coreAudio = session[sessionKey] ??= new CoreAudioManager()
