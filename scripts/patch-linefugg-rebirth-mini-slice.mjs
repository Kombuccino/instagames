import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}: ${before.slice(0, 100)}`)
  writeFileSync(path, text.replace(before, after))
}

replaceExact(
  'src/games/linefugg/LineFugg.tsx',
  "import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'",
  "import { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT, MINIFUGG_MASTER_VIEWPORT } from '../../core/runtime/gameRuntimePolicy'",
)
replaceExact(
  'src/games/linefugg/LineFugg.tsx',
  "export function LineFugg({ active, seed, restartToken, session }: GameComponentProps) {\n  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current",
  "export function LineFugg({ active, seed, restartToken, session }: GameComponentProps) {\n  const query = new URL(window.location.href).searchParams\n  const rebirthLab = query.get('lab') === 'gameplay-runtime' && query.get('skin') === 'rebirth-editorial'\n  const renderPixelRatio = useRef(Math.min(2, Math.max(1, window.devicePixelRatio || 1))).current",
)
replaceExact(
  'src/games/linefugg/LineFugg.tsx',
  "    seed,\n    renderPixelRatio,\n    session:",
  "    seed,\n    renderPixelRatio,\n    visualMode: rebirthLab ? 'rebirth-editorial' : 'orbital',\n    session:",
)
replaceExact(
  'src/games/linefugg/LineFugg.tsx',
  "        backgroundColor: '#02070e',\n        backgroundImage: `linear-gradient(rgba(1, 5, 12, .10), rgba(1, 5, 12, .10)), url(${LINEFUGG_BACKGROUND})`,",
  "        backgroundColor: rebirthLab ? '#eee5d5' : '#02070e',\n        backgroundImage: rebirthLab ? 'none' : `linear-gradient(rgba(1, 5, 12, .10), rgba(1, 5, 12, .10)), url(${LINEFUGG_BACKGROUND})`,",
)
replaceExact(
  'src/games/linefugg/LineFugg.tsx',
  "        logicalViewport={MINIFUGG_LEGACY_PORTRAIT_VIEWPORT}",
  "        logicalViewport={rebirthLab ? MINIFUGG_MASTER_VIEWPORT : MINIFUGG_LEGACY_PORTRAIT_VIEWPORT}",
)

replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  console: ['linefugg-accounting-panels', '/assets/generated/linefugg/ui/runtime/accounting-panels.webp'],\n} as const",
  "  console: ['linefugg-accounting-panels', '/assets/generated/linefugg/ui/runtime/accounting-panels.webp'],\n  rebirthReference: ['linefugg-rebirth-editorial-reference', '/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp'],\n} as const",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "const LINE_COLORS = [0xff5a36, 0xa54dff, 0xffc72c] as const\nconst LINE_COLOR_STRINGS = ['#ff5a36', '#a54dff', '#ffc72c'] as const",
  "const LINE_COLORS = [0xff5a36, 0xa54dff, 0xffc72c] as const\nconst LINE_COLOR_STRINGS = ['#ff5a36', '#a54dff', '#ffc72c'] as const\nconst REBIRTH_LINE_COLORS = [0xc95a50, 0x2e82b5, 0x3f8554] as const\nconst REBIRTH_LINE_COLOR_STRINGS = ['#c95a50', '#2e82b5', '#3f8554'] as const\nconst REBIRTH_PAPER = 0xeee5d5\nconst REBIRTH_INK = 0x343330",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "export type LineFuggSceneBridge = {\n  seed: number\n  renderPixelRatio?: number\n  session: GameSessionApi\n}",
  "export type LineFuggVisualMode = 'orbital' | 'rebirth-editorial'\n\nexport type LineFuggSceneBridge = {\n  seed: number\n  renderPixelRatio?: number\n  visualMode?: LineFuggVisualMode\n  session: GameSessionApi\n}",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "export class LineFuggScene extends Phaser.Scene {\n  private readonly bridge: LineFuggSceneBridge",
  "export class LineFuggScene extends Phaser.Scene {\n  private readonly bridge: LineFuggSceneBridge\n\n  private get rebirthEditorial() { return this.bridge.visualMode === 'rebirth-editorial' }\n  private lineColor(index: number) { return this.rebirthEditorial ? REBIRTH_LINE_COLORS[index] ?? 0xffffff : LINE_COLORS[index] ?? 0xffffff }\n  private lineColorString(index: number) { return this.rebirthEditorial ? REBIRTH_LINE_COLOR_STRINGS[index] ?? '#333333' : LINE_COLOR_STRINGS[index] ?? '#ffffff' }",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "    game: GAME_ID, coordinateSystem: '390x844; origin top-left; x right, y down',",
  "    game: GAME_ID, coordinateSystem: `${this.rebirthEditorial ? '390x850' : '390x844'}; origin top-left; x right, y down`,",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private createBackground() {\n    // The illustrated observatory backdrop is CSS-owned by LineFugg.tsx so it can",
  "  private createBackground() {\n    if (this.rebirthEditorial) {\n      this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, ASSETS.rebirthReference[0]).setDisplaySize(390, 850).setDepth(1)\n      this.ambientGraphics = this.add.graphics().setDepth(3)\n      if (!this.textures.exists('linefugg-spark')) {\n        const stamp = this.make.graphics({ x: 0, y: 0 })\n        stamp.fillStyle(0xffffff).fillCircle(4, 4, 2)\n        stamp.generateTexture('linefugg-spark', 8, 8)\n        stamp.destroy()\n      }\n      this.sparks = this.add.particles(0, 0, 'linefugg-spark', { emitting: false, lifespan: 260, speed: { min: 8, max: 26 }, scale: { start: 0.55, end: 0 }, alpha: { start: 0.35, end: 0 }, maxParticles: 24, maxAliveParticles: 18 }).setDepth(24)\n      return\n    }\n    // The illustrated observatory backdrop is CSS-owned by LineFugg.tsx so it can",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private createBoardObjects() {\n    const [boardKey] = ASSETS.boardPanel",
  "  private ensureRebirthTextures() {\n    if (!this.textures.exists('linefugg-rebirth-cell')) {\n      const cell = this.make.graphics({ x: 0, y: 0 })\n      cell.fillStyle(REBIRTH_PAPER, 0.99).fillRect(0, 0, 64, 64)\n      cell.lineStyle(1.4, REBIRTH_INK, 0.62).strokeRect(0.7, 0.7, 62.6, 62.6)\n      cell.generateTexture('linefugg-rebirth-cell', 64, 64)\n      cell.destroy()\n    }\n    if (!this.textures.exists('linefugg-rebirth-blank')) {\n      const blank = this.make.graphics({ x: 0, y: 0 })\n      blank.generateTexture('linefugg-rebirth-blank', 8, 8)\n      blank.destroy()\n    }\n    if (!this.textures.exists('linefugg-rebirth-button')) {\n      const button = this.make.graphics({ x: 0, y: 0 })\n      button.fillStyle(0xe7e1d5, 1).fillCircle(48, 48, 45)\n      button.lineStyle(2, REBIRTH_INK, 0.42).strokeCircle(48, 48, 45)\n      button.generateTexture('linefugg-rebirth-button', 96, 96)\n      button.clear().fillStyle(0x3f8554, 1).fillCircle(48, 48, 45).lineStyle(2, 0x2e6240, 0.8).strokeCircle(48, 48, 45)\n      button.generateTexture('linefugg-rebirth-button-ready', 96, 96)\n      button.destroy()\n    }\n  }\n\n  private createBoardObjects() {\n    if (this.rebirthEditorial) {\n      this.ensureRebirthTextures()\n      const backing = this.add.graphics().setDepth(7)\n      backing.fillStyle(REBIRTH_PAPER, 0.995).fillRect(BOARD_X - 2, BOARD_Y - 2, BOARD_SIZE + 4, BOARD_SIZE + 4)\n      backing.lineStyle(2.2, REBIRTH_INK, 0.9).strokeRect(BOARD_X - 2, BOARD_Y - 2, BOARD_SIZE + 4, BOARD_SIZE + 4)\n      this.cellBaseImages = this.board.map((_cell, index) => {\n        const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })\n        return this.add.image(position.x, position.y, 'linefugg-rebirth-cell').setDisplaySize(CELL_SIZE, CELL_SIZE).setDepth(9)\n      })\n      this.cellMaterialImages = this.board.map((_cell, index) => {\n        const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })\n        return this.add.image(position.x, position.y, 'linefugg-rebirth-blank').setVisible(false).setDepth(10)\n      })\n      this.boardOverlayGraphics = this.add.graphics().setDepth(18)\n      this.lineGraphics = this.add.graphics().setDepth(20)\n      this.energyGraphics = this.add.graphics().setDepth(22)\n      this.cellTexts = this.board.map((cell, index) => {\n        const row = Math.floor(index / GRID_SIZE), col = index % GRID_SIZE\n        return this.add.text(BOARD_X + (col + 0.5) * CELL_SIZE, BOARD_Y + (row + 0.5) * CELL_SIZE, cell.label, {\n          fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', resolution: 2, color: '#343330',\n        }).setOrigin(0.5).setDepth(30)\n      })\n      return\n    }\n    const [boardKey] = ASSETS.boardPanel",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private createHistory() {\n    const key = ASSETS.console[0]",
  "  private createHistory() {\n    if (this.rebirthEditorial) {\n      this.ensureRebirthTextures()\n      const sheet = this.add.graphics().setDepth(39)\n      sheet.fillStyle(REBIRTH_PAPER, 0.995).fillRect(18, HISTORY_Y - 2, 354, HISTORY_ROW_HEIGHT * 3 + 4)\n      sheet.lineStyle(1, REBIRTH_INK, 0.35)\n      for (let row = 0; row <= 3; row++) sheet.lineBetween(24, HISTORY_Y + row * HISTORY_ROW_HEIGHT, 366, HISTORY_Y + row * HISTORY_ROW_HEIGHT)\n      for (let index = 0; index < MAX_LINES; index++) {\n        const y = HISTORY_Y + HISTORY_ROW_HEIGHT / 2 + index * HISTORY_ROW_HEIGHT\n        const container = this.add.container(0, y).setDepth(42)\n        const arrow = this.add.text(48, 0, '● →', { fontFamily: 'Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: this.lineColorString(index), resolution: 2 }).setOrigin(0.5)\n        const tiles = [], values = []\n        for (let slot = 0; slot < MAX_LINE_CELLS; slot++) {\n          const x = 86 + slot * 36\n          const tile = this.add.image(x, 0, 'linefugg-rebirth-blank').setVisible(false)\n          const value = this.add.text(x, 0, '', { fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#343330', resolution: 2 }).setOrigin(0.5)\n          container.add([tile, value]); tiles.push(tile); values.push(value)\n        }\n        const score = this.add.text(348, 0, '', { fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: '23px', fontStyle: 'bold', color: this.lineColorString(index), resolution: 2 }).setOrigin(1, 0.5)\n        container.add([arrow, score])\n        this.historyRows.push({ container, arrow, tiles, values, score })\n      }\n      sheet.fillStyle(0xd8d2c7, 0.92).fillRect(190, TOTAL_Y - 23, 176, 46)\n      const sigma = this.add.text(166, TOTAL_Y, '=', { fontFamily: 'Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#343330', resolution: 2 }).setOrigin(0.5).setDepth(42)\n      centerTextInk(sigma)\n      this.totalText = this.add.text(278, TOTAL_Y, '0', { fontFamily: 'Arial Narrow, Arial, sans-serif', fontSize: '38px', fontStyle: 'bold', color: '#343330', resolution: 2 }).setOrigin(0.5).setDepth(42)\n      return\n    }\n    const key = ASSETS.console[0]",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private createControls() {\n    const key = ASSETS.console[0]",
  "  private createControls() {\n    if (this.rebirthEditorial) {\n      this.ensureRebirthTextures()\n      const rule = this.add.graphics().setDepth(43)\n      rule.fillStyle(REBIRTH_PAPER, 0.995).fillRect(18, 729, 354, 115)\n      rule.lineStyle(1, REBIRTH_INK, 0.24).lineBetween(24, 733, 366, 733)\n      this.controlPulseGraphics = this.add.graphics().setDepth(47)\n      this.undoButton = this.add.image(UNDO_X, CONTROL_Y, 'linefugg-rebirth-button').setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE).setDepth(48).setInteractive({ useHandCursor: true })\n      this.validateButton = this.add.image(VALIDATE_X, CONTROL_Y, 'linefugg-rebirth-button').setDisplaySize(CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE).setDepth(48).setInteractive({ useHandCursor: true })\n      this.validateAmber = this.add.image(VALIDATE_X, CONTROL_Y, 'linefugg-rebirth-blank').setVisible(false).setDepth(49)\n      this.undoIcon = this.add.text(UNDO_X, CONTROL_Y - 1, '↶', { fontFamily: 'Arial, sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#343330', resolution: 2 }).setOrigin(0.5).setDepth(49)\n      this.add.text(VALIDATE_X, CONTROL_Y, '✓', { fontFamily: 'Arial, sans-serif', fontSize: '44px', fontStyle: 'bold', color: '#f0eadc', resolution: 2 }).setOrigin(0.5).setDepth(50)\n      this.undoButton.on('pointerover', this.handleUndoOver, this); this.undoButton.on('pointerdown', this.handleUndoDown, this); this.undoButton.on('pointerup', this.handleUndoUp, this); this.undoButton.on('pointerout', this.handleUndoOut, this)\n      this.validateButton.on('pointerover', this.handleValidateOver, this); this.validateButton.on('pointerdown', this.handleValidateDown, this); this.validateButton.on('pointerup', this.handleValidateUp, this); this.validateButton.on('pointerout', this.handleValidateOut, this)\n      return\n    }\n    const key = ASSETS.console[0]",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "      this.sparks.setParticleTint(LINE_COLORS[index])",
  "      this.sparks.setParticleTint(this.lineColor(index))",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "        const activeLineColor = LINE_COLORS[dimensionSlot]",
  "        const activeLineColor = this.lineColor(dimensionSlot)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "      ? LINE_COLORS[Math.min(this.lines.length, MAX_LINES - 1)]",
  "      ? this.lineColor(Math.min(this.lines.length, MAX_LINES - 1))",
  2,
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "      this.drawOrbitalLine(line.start, line.end, LINE_COLORS[index] ?? 0xffffff, 1)",
  "      this.drawOrbitalLine(line.start, line.end, this.lineColor(index), 1)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private drawOrbitalLine(startPoint: Point, endPoint: Point, color: number, alpha: number) {\n    const start = cellCenter(startPoint)",
  "  private drawOrbitalLine(startPoint: Point, endPoint: Point, color: number, alpha: number) {\n    const start = cellCenter(startPoint)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "    const baseY = arrowTipY - uy * arrowLength\n\n    this.lineGraphics.lineStyle(14, color, 0.10 * alpha)",
  "    const baseY = arrowTipY - uy * arrowLength\n\n    if (this.rebirthEditorial) {\n      this.lineGraphics.lineStyle(15, color, 0.25 * alpha)\n      this.lineGraphics.beginPath(); this.lineGraphics.moveTo(start.x, start.y); this.lineGraphics.lineTo(end.x, end.y); this.lineGraphics.strokePath()\n      this.lineGraphics.lineStyle(2.4, color, 0.92 * alpha)\n      this.lineGraphics.beginPath(); this.lineGraphics.moveTo(start.x, start.y); this.lineGraphics.lineTo(end.x, end.y); this.lineGraphics.strokePath()\n      this.lineGraphics.fillStyle(color, 0.92 * alpha)\n      this.lineGraphics.fillTriangle(arrowTipX, arrowTipY, baseX - uy * arrowHalfWidth, baseY + ux * arrowHalfWidth, baseX + uy * arrowHalfWidth, baseY - ux * arrowHalfWidth)\n      this.drawNode(start.x, start.y, color, alpha); this.drawNode(end.x, end.y, color, alpha)\n      return\n    }\n\n    this.lineGraphics.lineStyle(14, color, 0.10 * alpha)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private drawNode(x: number, y: number, color: number, alpha: number) {\n    this.lineGraphics.fillStyle(color, 0.08 * alpha)",
  "  private drawNode(x: number, y: number, color: number, alpha: number) {\n    if (this.rebirthEditorial) {\n      this.lineGraphics.fillStyle(color, 0.72 * alpha).fillCircle(x, y, 6.5)\n      this.lineGraphics.lineStyle(1.2, color, 0.95 * alpha).strokeCircle(x, y, 9)\n      return\n    }\n    this.lineGraphics.fillStyle(color, 0.08 * alpha)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "        if (cell.kind === 'multiply') tile.setTexture(ASSETS.cellMultiply[0])\n        else if (cell.kind === 'divide') tile.setTexture(ASSETS.cellDivide[0])\n        else tile.setTexture(ASSETS.boardPanel[0], 'ledger-chip')\n        tile.clearTint().setDisplaySize(31, 32)",
  "        if (!this.rebirthEditorial) {\n          if (cell.kind === 'multiply') tile.setTexture(ASSETS.cellMultiply[0])\n          else if (cell.kind === 'divide') tile.setTexture(ASSETS.cellDivide[0])\n          else tile.setTexture(ASSETS.boardPanel[0], 'ledger-chip')\n          tile.clearTint().setDisplaySize(31, 32)\n        }\n        if (this.rebirthEditorial) value.setColor('#343330')",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "      row.score.setText(line ? `= ${formatScore(line.score)}` : '')",
  "      row.score.setText(line ? `= ${formatScore(line.score)}` : '')\n      if (this.rebirthEditorial) row.score.setColor(this.lineColorString(index))",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private renderControls() {\n    const undoEnabled = this.undoEnabled()\n    const validateEnabled = this.validateEnabled()\n\n\n\n    this.undoButton",
  "  private renderControls() {\n    const undoEnabled = this.undoEnabled()\n    const validateEnabled = this.validateEnabled()\n\n    if (this.rebirthEditorial) {\n      this.undoButton.setTexture('linefugg-rebirth-button').setDisplaySize(this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.undoPressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE).setAlpha(undoEnabled ? 1 : 0.48).clearTint()\n      this.validateButton.setTexture(validateEnabled ? 'linefugg-rebirth-button-ready' : 'linefugg-rebirth-button').setDisplaySize(this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE, this.validatePressed ? CONTROL_BUTTON_SIZE - 6 : CONTROL_BUTTON_SIZE).setAlpha(validateEnabled ? 1 : 0.48).clearTint()\n      this.undoIcon.setAlpha(undoEnabled ? 1 : 0.42).setAngle(this.undoHovered && undoEnabled ? -10 : 0)\n      this.validateAmber.setVisible(false)\n      return\n    }\n\n    this.undoButton",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private renderIndicators() {\n    for (let index = 0; index < MAX_LINES; index++) {",
  "  private renderIndicators() {\n    if (this.rebirthEditorial) return\n    for (let index = 0; index < MAX_LINES; index++) {",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private renderAmbient(time: number) {\n    this.ambientGraphics.clear()",
  "  private renderAmbient(time: number) {\n    this.ambientGraphics.clear()\n    if (this.rebirthEditorial) return",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "  private renderEnergy(time: number) {\n    this.energyGraphics.clear()",
  "  private renderEnergy(time: number) {\n    this.energyGraphics.clear()\n    if (this.rebirthEditorial) return",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "      const color = LINE_COLORS[index]",
  "      const color = this.lineColor(index)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "          artDirection: 'orbital-accounting',",
  "          artDirection: this.rebirthEditorial ? 'rebirth-editorial-paper' : 'orbital-accounting',",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "    const material = this.cellMaterialImages[index]\n    if (material) {\n      if (cell.kind === 'add') material.setVisible(false)",
  "    const material = this.cellMaterialImages[index]\n    if (material) {\n      if (this.rebirthEditorial) material.setVisible(false)\n      else if (cell.kind === 'add') material.setVisible(false)",
)
replaceExact(
  'src/games/linefugg/LineFuggScene.ts',
  "    const color = cell.kind === 'multiply'\n      ? '#fff1c9'\n      : cell.kind === 'divide'\n        ? '#f9ebff'\n        : '#f5e6c1'\n    text.setText(cell.label).setColor(color)",
  "    const color = this.rebirthEditorial ? '#343330' : cell.kind === 'multiply'\n      ? '#fff1c9'\n      : cell.kind === 'divide'\n        ? '#f9ebff'\n        : '#f5e6c1'\n    text.setText(cell.label).setColor(color)",
)

replaceExact(
  'src/core/GameplayCalibrationRuntime.tsx',
  "  const scenario = useMemo(requestedLineFuggScenario, [])",
  "  const scenario = useMemo(requestedLineFuggScenario, [])",
)

console.log('LineFugg Rebirth mini-slice patch applied.')
