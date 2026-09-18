import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { ART_SCALE, ATLAS_KEY, ATLAS_FALLBACK, BOARD, BOARD_ART, COLORS, CONTROLS, FRAMES, GLYPHS, INK, INKS, PAPER, STAGE } from './art'
import { RebirthModel, GRID, cell, format, formula, indexOf, snapEnd, type Point } from './model'

export const REBIRTH_SCENE_KEY = 'linefugg-rebirth-t02'
type Bridge = { seed: number; renderPixelRatio: number; session: GameSessionApi }
type Control = keyof typeof CONTROLS
type Drag = { id: number; start: Point; end: Point | null }

class RasterLabel extends Phaser.GameObjects.Container {
  private glyphImages: Phaser.GameObjects.Image[] = []
  value = ''
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    scene.add.existing(this)
  }
  setValue(value: string, cap: number, tint: number, maxWidth: number, align: 'left' | 'center' | 'right' = 'center') {
    this.value = value
    const items = [...value].map(char => {
      const glyph = GLYPHS[char]
      if (!glyph) throw new Error(`Missing Rebirth glyph: ${char}`)
      const frame = FRAMES[glyph[0]]
      const scale = /[0-9]/.test(char) ? cap / glyph[1] : cap / 52
      return { frame: glyph[0], width: frame[2] * scale, height: frame[3] * scale, char }
    })
    const gap = cap * 0.14
    const natural = items.reduce((n, item) => n + item.width, 0) + Math.max(0, items.length - 1) * gap
    const fit = Math.min(1, maxWidth / Math.max(1, natural))
    const width = natural * fit
    let x = align === 'left' ? 0 : align === 'right' ? -width : -width / 2
    items.forEach((item, i) => {
      let image = this.glyphImages[i]
      if (!image) { image = this.scene.add.image(0, 0, ATLAS_KEY); this.add(image); this.glyphImages.push(image) }
      const y = item.char === '.' ? (cap / 2 - item.height) * fit : -item.height * fit / 2
      image.setTexture(ATLAS_KEY, item.frame).setOrigin(0).setPosition(x, y)
        .setDisplaySize(item.width * fit, item.height * fit).setTint(tint).setVisible(true)
      x += (item.width + gap) * fit
    })
    this.glyphImages.slice(items.length).forEach(image => image.setVisible(false))
    this.setSize(width, cap * fit)
    return this
  }
}

export class LineFuggRebirthScene extends Phaser.Scene {
  private model!: RebirthModel
  private labels: RasterLabel[] = []
  private history: { formula: RasterLabel; score: RasterLabel; equal: RasterLabel; dot: Phaser.GameObjects.Image }[] = []
  private total!: RasterLabel
  private controlImages!: Record<Control, Phaser.GameObjects.Image>
  private indicators: Phaser.GameObjects.Image[] = []
  private paths: Phaser.GameObjects.RenderTexture[] = []
  private live!: RasterLabel
  private liveSurface!: Phaser.GameObjects.Image
  private cursorOutline!: Phaser.GameObjects.Graphics
  private focusPoint: Point = { row: 0, col: 0 }
  private keyboardFocus = false
  private drag: Drag | null = null
  private pressed: { control: Control; id: number } | null = null
  private hovered: Control | null = null
  private rerolling = false
  private reducedMotion = false
  private motionQuery: MediaQueryList | null = null
  private lastControlStates = { undo: 'off', validate: 'off' }
  private reportedFinish = false
  private routeDirty = true
  private failure = ''
  private pointerPosition = { x: 195, y: 450 }
  private readonly reader = () => JSON.stringify({
    game: 'linefugg-rebirth', art: 't02', coordinateSystem: '390x850; top-left',
    boardId: this.model?.boardId, board: this.model?.board, boardBounds: BOARD,
    lines: this.model?.lines.map(({ start, end, cells, values, score, rerollKey }) => ({ start, end, cells, values, score, rerollKey })),
    total: this.model?.total, finished: this.model?.finished, rerolling: this.rerolling,
    drag: this.drag ? { ...this.drag, ...this.model.preview(this.drag.start, this.drag.end) } : null,
    controls: Object.fromEntries(Object.entries(CONTROLS).map(([key, r]) => [key, { ...r, x: r.x + r.width / 2, y: r.y + r.height / 2, state: this.lastControlStates[key as Control] }])),
    undoEnabled: this.enabled('undo'), validateEnabled: this.enabled('validate'),
    renderedLabels: this.labels.map(label => label.value), formulas: this.history.map(row => row.formula.value),
    reducedMotion: this.reducedMotion, paused: this.game.isPaused, assetFailure: this.failure,
    sourceAtlas: ATLAS_FALLBACK, essentialBounds: { top: BOARD_ART.y, bottom: 779 },
  })
  constructor(private readonly bridge: Bridge) { super({ key: REBIRTH_SCENE_KEY }) }
  preload() {
    // PNG is the byte-preserving T02 fallback; only this Rebirth scene loads it.
    if (!this.textures.exists(ATLAS_KEY)) this.load.image(ATLAS_KEY, ATLAS_FALLBACK)
  }
  create() {
    this.model = new RebirthModel(undefined, this.bridge.seed)
    this.labels = []; this.history = []; this.indicators = []; this.paths = []
    this.drag = null; this.pressed = null; this.hovered = null; this.rerolling = false
    this.reportedFinish = false; this.failure = ''; this.focusPoint = { row: 0, col: 0 }; this.keyboardFocus = false
    this.cameras.main.setZoom(this.bridge.renderPixelRatio).centerOn(STAGE.width / 2, STAGE.height / 2)
    this.cameras.main.setBackgroundColor(PAPER)
    if (!this.textures.exists(ATLAS_KEY)) {
      this.failure = 'Atlas Rebirth indisponible'
      this.add.text(195, 425, `${this.failure}\nRecharge la page.`, { color: '#333333', fontSize: '20px', align: 'center' }).setOrigin(0.5)
      return
    }
    const texture = this.textures.get(ATLAS_KEY)
    for (const [name, [x, y, width, height]] of Object.entries(FRAMES)) {
      if (!texture.has(name)) texture.add(name, 0, x, y, width, height)
    }
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reducedMotion = this.motionQuery.matches
    this.motionQuery.addEventListener('change', this.motionChange)
    this.buildObjects()
    this.bindInput()
    this.refreshBoard()
    this.refresh()
    this.bridge.session.setScore(0)
    // Read-only observability in the isolated Lab, never injected into classic/public play.
    Object.assign(window, { render_rebirth_to_text: this.reader, render_game_to_text: this.reader })
    this.events.once('shutdown', this.cleanup, this)
    this.applyScenario()
  }
  private sprite(name: string, x: number, y: number, width?: number, depth = 1) {
    const image = this.add.image(x, y, ATLAS_KEY, name).setOrigin(0).setDepth(depth)
    image.setScale((width ?? FRAMES[name][2] * ART_SCALE) / FRAMES[name][2])
    return image
  }
  private buildObjects() {
    this.sprite('decor-top-left', 0, 0)
    this.sprite('decor-top-right', 390 - 305 * ART_SCALE, 0)
    this.sprite('decor-bottom-left', 0, 850 - 180 * ART_SCALE)
    this.sprite('decor-bottom-right', 390 - 392 * ART_SCALE, 850 - 153 * ART_SCALE)
    this.sprite('board', BOARD_ART.x, BOARD_ART.y, BOARD_ART.width, 3)
    const density = this.bridge.renderPixelRatio
    for (let i = 0; i < 4; i++) {
      this.paths.push(this.add.renderTexture(BOARD.x, BOARD.y, Math.ceil(BOARD.width * density), Math.ceil(BOARD.height * density))
        .setOrigin(0).setScale(1 / density).setAlpha(0.55).setDepth(5 + i))
    }
    for (let i = 0; i < 49; i++) {
      const p = this.center({ row: Math.floor(i / 7), col: i % 7 })
      this.labels.push(new RasterLabel(this, p.x, p.y).setDepth(12))
    }
    this.sprite('ledger-empty', 9, 471, 372, 15)
    for (let i = 0; i < 3; i++) {
      const y = 508 + i * 50.5
      const dot = this.sprite(`indicator-${COLORS[i]}-off`, 35, y - 13, 27, 16)
      this.history.push({ dot,
        formula: new RasterLabel(this, 81, y).setDepth(17),
        equal: new RasterLabel(this, 267, y).setDepth(17),
        score: new RasterLabel(this, 334, y).setDepth(17),
      })
    }
    this.sprite('total-empty', 19, 650, 352, 18)
    this.sprite('label-total', 105, 675, 68, 19).setTint(INK)
    new RasterLabel(this, 213, 690).setValue('=', 25, 0x375138, 22).setDepth(19)
    this.total = new RasterLabel(this, 283, 690).setDepth(19)
    this.controlImages = {
      undo: this.sprite('undo-off', CONTROLS.undo.x, CONTROLS.undo.y, CONTROLS.undo.width, 25),
      validate: this.sprite('validate-off', CONTROLS.validate.x, CONTROLS.validate.y, CONTROLS.validate.width, 25),
    }
    for (let i = 0; i < 3; i++) this.indicators.push(this.sprite(`indicator-${COLORS[i]}-off`, 146 + i * 31.8, 730, 30, 25))
    this.liveSurface = this.sprite('ledger-row-1', 120, 448, 150, 27).setVisible(false)
    this.live = new RasterLabel(this, 195, 458).setDepth(28).setVisible(false)
    this.cursorOutline = this.add.graphics().setDepth(30)
  }
  private center(point: Point) {
    return { x: BOARD.x + (point.col + 0.5) * BOARD.width / GRID, y: BOARD.y + (point.row + 0.5) * BOARD.height / GRID }
  }
  private at(x: number, y: number): Point | null {
    if (x < BOARD.x || y < BOARD.y || x >= BOARD.x + BOARD.width || y >= BOARD.y + BOARD.height) return null
    return { row: Math.floor((y - BOARD.y) * GRID / BOARD.height), col: Math.floor((x - BOARD.x) * GRID / BOARD.width) }
  }
  private snapped(start: Point, x: number, y: number) {
    return snapEnd(start, (x - BOARD.x) * GRID / BOARD.width - 0.5, (y - BOARD.y) * GRID / BOARD.height - 0.5)
  }
  private enabled(control: Control) {
    if (!this.model || this.rerolling || this.drag) return false
    return control === 'undo' ? this.model.canUndo : this.model.canValidate
  }
  private controlAt(x: number, y: number): Control | null {
    for (const key of ['undo', 'validate'] as const) {
      const r = CONTROLS[key]
      // Fixed logical hitboxes: trim/tonal state changes never alter input bounds.
      if (x >= r.x && y >= r.y && x <= r.x + r.width && y <= r.y + r.height) return key
    }
    return null
  }
  private world(pointer: Phaser.Input.Pointer) {
    pointer.updateWorldPoint(this.cameras.main)
    return { x: pointer.worldX, y: pointer.worldY }
  }
  private bindInput() {
    this.input.on('pointerdown', this.pointerDown, this)
    this.input.on('pointermove', this.pointerMove, this)
    this.input.on('pointerup', this.pointerUp, this)
    this.input.on('pointerupoutside', this.cancel, this)
    this.input.keyboard?.on('keydown', this.keyDown, this)
    this.input.keyboard?.on('keyup', this.keyUp, this)
    this.input.gamepad?.on('down', this.padDown, this)
    this.input.gamepad?.on('up', this.padUp, this)
    this.game.events.on('pause', this.cancel, this)
    window.addEventListener('blur', this.cancel)
    this.game.canvas.addEventListener('pointercancel', this.cancel)
  }
  private pointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.button !== 0 || this.model.finished || this.pressed || this.drag) return
    this.keyboardFocus = false
    const p = this.world(pointer)
    const control = this.controlAt(p.x, p.y)
    if (control) {
      if (this.enabled(control)) this.pressed = { control, id: pointer.id }
      this.refreshControls(); return
    }
    if (this.rerolling || this.model.lines.length >= 3) return
    const start = this.at(p.x, p.y)
    if (!start) return
    this.focusPoint = start; this.pointerPosition = p
    this.drag = { id: pointer.id, start, end: null }; this.routeDirty = true; this.refresh()
  }
  private pointerMove(pointer: Phaser.Input.Pointer) {
    const p = this.world(pointer)
    this.hovered = pointer.wasTouch ? null : this.controlAt(p.x, p.y)
    if (this.pressed?.id === pointer.id && this.controlAt(p.x, p.y) !== this.pressed.control) this.pressed = null
    if (this.drag?.id === pointer.id) {
      this.pointerPosition = p
      this.drag.end = this.snapped(this.drag.start, p.x, p.y)
      this.routeDirty = true; this.refresh()
    } else this.refreshControls()
  }
  private pointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer.wasCanceled) { this.cancel(); return }
    const p = this.world(pointer)
    if (this.pressed?.id === pointer.id) {
      const control = this.pressed.control; this.pressed = null
      if (this.controlAt(p.x, p.y) === control) this.act(control)
      this.refreshControls(); return
    }
    if (this.drag?.id !== pointer.id) return
    const { start } = this.drag
    const end = this.snapped(start, p.x, p.y)
    this.drag = null
    this.commitLine(start, end)
  }
  private readonly cancel = () => {
    this.drag = null; this.pressed = null; this.hovered = null
    if (this.controlImages) { this.routeDirty = true; this.refresh() }
  }
  private commitLine(start: Point, end: Point | null) {
    this.routeDirty = true
    const result = end ? this.model.play(start, end) : null
    if (!result) {
      const p = this.center(end ?? start)
      const flash = this.add.circle(p.x, p.y, 20, 0xad4434, 0.16).setDepth(26)
      this.time.delayedCall(this.reducedMotion ? 90 : 180, () => flash.destroy())
      this.refresh(); return
    }
    this.bridge.session.setScore(this.model.total)
    this.animateReroll(result.changed, result.line.end)
    this.refresh()
  }
  private animateReroll(indices: number[], anchor: Point) {
    if (this.reducedMotion || !indices.length) { this.refreshBoard(); return }
    this.rerolling = true
    const sorted = [...indices].sort((a, b) => Math.hypot(Math.floor(a / 7) - anchor.row, a % 7 - anchor.col) - Math.hypot(Math.floor(b / 7) - anchor.row, b % 7 - anchor.col))
    let remaining = sorted.length
    sorted.forEach((i, rank) => {
      const label = this.labels[i]
      this.tweens.add({ targets: label, scaleX: 0.03, duration: 55, delay: rank * 3, ease: 'Sine.easeIn', onComplete: () => {
        this.refreshCell(i)
        this.tweens.add({ targets: label, scaleX: 1, duration: 70, ease: 'Sine.easeOut', onComplete: () => {
          remaining--
          if (!remaining) { this.rerolling = false; this.refreshBoard(); this.refresh() }
        } })
      } })
    })
    // Already-played values keep their position/content; only their ink tint changes.
    this.labels.forEach((_label, i) => { if (!indices.includes(i)) this.refreshCell(i) })
  }
  private refreshCell(i: number) {
    let tint = INK
    for (let n = 0; n < this.model.lines.length; n++) if (this.model.lines[n].cells.some(p => indexOf(p) === i)) tint = INKS[n]
    this.labels[i].setValue(this.model.board[i].label, 23, tint, BOARD.width / 7 - 10)
  }
  private refreshBoard() { this.labels.forEach((_label, i) => { this.refreshCell(i); this.labels[i].setScale(1) }) }
  private renderRoute(target: Phaser.GameObjects.RenderTexture, points: Point[], color: number) {
    target.clear()
    if (!points.length) return
    const d = this.bridge.renderPixelRatio
    const positions = points.map(p => { const c = this.center(p); return { x: (c.x - BOARD.x) * d, y: (c.y - BOARD.y) * d } })
    const stamps: Phaser.GameObjects.Image[] = []
    for (let i = 1; i < positions.length; i++) {
      const a = positions[i - 1], b = positions[i]
      const segment = this.make.image({ x: a.x, y: a.y, key: ATLAS_KEY, frame: `path-${COLORS[color]}-segment`, add: false })
      segment.setOrigin(0, 0.5).setDisplaySize(Math.hypot(b.x - a.x, b.y - a.y), 19 * d).setRotation(Math.atan2(b.y - a.y, b.x - a.x))
      stamps.push(segment)
    }
    for (const p of positions) stamps.push(this.make.image({ x: p.x, y: p.y, key: ATLAS_KEY, frame: `path-${COLORS[color]}-node`, add: false }).setDisplaySize(39 * d, 39 * d))
    // The opacity is applied once to the composed route, not once per overlapping piece.
    target.draw(stamps)
    stamps.forEach(stamp => stamp.destroy())
  }
  private refresh() {
    if (!this.controlImages) return
    if (this.routeDirty) {
      for (let i = 0; i < 3; i++) this.renderRoute(this.paths[i], this.model.lines[i]?.cells ?? [], i)
      const preview = this.drag ? this.model.preview(this.drag.start, this.drag.end) : null
      this.renderRoute(this.paths[3], preview?.cells ?? [], Math.min(2, this.model.lines.length))
      this.paths[3].setAlpha(preview?.valid ? 0.62 : 0.22)
      this.live.setVisible(Boolean(preview?.valid)); this.liveSurface.setVisible(Boolean(preview?.valid))
      if (preview?.valid) {
        const x = Phaser.Math.Clamp(this.pointerPosition.x, 80, 310)
        const y = Phaser.Math.Clamp(this.pointerPosition.y + 36, 120, 454)
        this.liveSurface.setPosition(x - 75, y - 11)
        this.live.setPosition(x, y).setValue(`=${format(preview.score)}`, 18, INK, 112)
      }
      this.routeDirty = false
    }
    this.history.forEach((row, i) => {
      const line = this.model.lines[i]
      row.dot.setTexture(ATLAS_KEY, `indicator-${COLORS[i]}-${line ? 'on' : 'off'}`)
      row.formula.setValue(line ? formula(line.values) : '', 20, INK, 166, 'left')
      row.equal.setValue(line ? '=' : '', 22, INK, 16)
      row.score.setValue(line ? format(line.score) : '', 25, INKS[i], 59)
    })
    this.total.setValue(format(this.model.total), 39, 0x305125, 76)
    this.refreshControls()
    this.cursorOutline.clear()
    if (this.keyboardFocus) {
      const p = this.center(this.focusPoint)
      this.cursorOutline.lineStyle(1.3, INK, 0.75).strokeRoundedRect(p.x - BOARD.width / 14 + 3, p.y - BOARD.height / 14 + 3, BOARD.width / 7 - 6, BOARD.height / 7 - 6, 3)
    }
  }
  private refreshControls() {
    if (!this.controlImages) return
    for (const key of ['undo', 'validate'] as const) {
      const state = !this.enabled(key) ? 'off' : this.pressed?.control === key ? 'pressed' : this.hovered === key ? 'hover' : 'on'
      this.lastControlStates[key] = state
      this.controlImages[key].setTexture(ATLAS_KEY, `${key}-${state}`)
    }
    this.indicators.forEach((image, i) => image.setTexture(ATLAS_KEY, `indicator-${COLORS[i]}-${i < this.model.lines.length ? 'on' : 'off'}`))
  }
  private act(control: Control) {
    if (!this.enabled(control)) return
    if (control === 'undo') {
      this.model.undo(); this.refreshBoard(); this.routeDirty = true
      this.bridge.session.setScore(this.model.total); this.refresh(); return
    }
    const score = this.model.finish()
    if (score === null || this.reportedFinish) return
    this.reportedFinish = true
    this.bridge.session.setScore(score)
    this.bridge.session.finish({ score, boardId: this.model.boardId,
      metadata: { artDirection: 'rebirth-t02', runtimeSeed: this.bridge.seed, gridSize: 7, lineLimit: 5, rerollKeys: this.model.lines.map(line => line.rerollKey).join(',') } })
    this.refresh()
  }
  private keyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,button,[contenteditable=true]')) return
    const key = event.key.toLowerCase()
    if (!['arrowleft','arrowright','arrowup','arrowdown',' ','enter','backspace','u','escape'].includes(key)) return
    event.preventDefault()
    if (event.repeat || this.rerolling || this.model.finished) return
    if (key === 'escape') { this.cancel(); return }
    if (key === 'backspace' || key === 'u') { this.act('undo'); return }
    if (key === 'enter' && !this.drag) {
      if (this.enabled('validate')) { this.pressed = { control: 'validate', id: -2 }; this.refreshControls() }
      return
    }
    this.keyboardFocus = true
    if (key.startsWith('arrow')) {
      this.focusPoint = { row: Phaser.Math.Clamp(this.focusPoint.row + (key === 'arrowdown' ? 1 : key === 'arrowup' ? -1 : 0), 0, 6),
        col: Phaser.Math.Clamp(this.focusPoint.col + (key === 'arrowright' ? 1 : key === 'arrowleft' ? -1 : 0), 0, 6) }
      if (this.drag?.id === -1) { this.pointerPosition = this.center(this.focusPoint); this.drag.end = this.snapped(this.drag.start, this.pointerPosition.x, this.pointerPosition.y); this.routeDirty = true }
    } else if (key === ' ' || key === 'enter') this.keyboardPrimary()
    this.refresh()
  }
  private keyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.pressed?.id === -2) { this.pressed = null; this.act('validate'); this.refreshControls() }
  }
  private keyboardPrimary() {
    if (this.drag?.id === -1) { const drag = this.drag; this.drag = null; this.commitLine(drag.start, drag.end); return }
    if (this.model.lines.length >= 3 || this.drag) return
    this.drag = { id: -1, start: { ...this.focusPoint }, end: null }; this.routeDirty = true
  }
  private padDown(_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) {
    const keys: Record<number, string> = { 0: ' ', 1: 'u', 9: 'Enter', 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight' }
    if (keys[button.index]) this.keyDown(new KeyboardEvent('keydown', { key: keys[button.index] }))
  }
  private padUp(_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) {
    if (button.index === 9) this.keyUp(new KeyboardEvent('keyup', { key: 'Enter' }))
  }
  private readonly motionChange = (event: MediaQueryListEvent) => { this.reducedMotion = event.matches }
  private cleanup() {
    this.input.off('pointerdown', this.pointerDown, this); this.input.off('pointermove', this.pointerMove, this)
    this.input.off('pointerup', this.pointerUp, this); this.input.off('pointerupoutside', this.cancel, this)
    this.input.keyboard?.off('keydown', this.keyDown, this); this.input.keyboard?.off('keyup', this.keyUp, this)
    this.input.gamepad?.off('down', this.padDown, this); this.input.gamepad?.off('up', this.padUp, this)
    this.game.events.off('pause', this.cancel, this)
    this.motionQuery?.removeEventListener('change', this.motionChange)
    window.removeEventListener('blur', this.cancel); this.game.canvas.removeEventListener('pointercancel', this.cancel)
    const debug = window as unknown as Record<string, unknown>
    if (debug.render_rebirth_to_text === this.reader) delete debug.render_rebirth_to_text
    if (debug.render_game_to_text === this.reader) delete debug.render_game_to_text
  }
  private applyScenario() {
    const query = new URL(window.location.href).searchParams
    const scenario = query.get('scenario')
    if (!scenario || scenario === 'initial') return
    const pairs: [Point, Point][] = [
      [{ row: 5, col: 1 }, { row: 1, col: 5 }],
      [{ row: 0, col: 1 }, { row: 4, col: 1 }],
      [{ row: 2, col: 0 }, { row: 2, col: 4 }],
    ]
    // Explicit Lab-only test values; the ordinary entry always starts with its seeded board.
    if (scenario === 'operators') {
      this.model.board[0] = cell('add', 8); this.model.board[1] = cell('multiply', 2)
      this.model.board[2] = cell('add', 4); this.model.board[3] = cell('divide', 2)
      this.refreshBoard(); return
    }
    if (scenario === 'drag') {
      this.drag = { id: -1, start: pairs[0][0], end: pairs[0][1] }
      this.pointerPosition = this.center(pairs[0][1]); this.routeDirty = true; this.refresh(); return
    }
    const count = scenario === 'after-line' ? 1 : scenario === 'three-lines' ? 3 : 0
    for (let i = 0; i < count; i++) this.model.play(...pairs[i])
    this.refreshBoard(); this.routeDirty = true; this.refresh(); this.bridge.session.setScore(this.model.total)
  }
}
