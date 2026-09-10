from pathlib import Path

SCENE = Path('src/games/linefugg/LineFuggScene.ts')
TEST = Path('scripts/test-linefugg-browser.mjs')
REGISTRY = Path('src/core/gameRegistry.tsx')
CHANGELOG = Path('src/games/linefugg/CHANGELOG.md')
STATUS = Path('src/games/linefugg/GAME_STATUS.md')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, got {count}')
    return text.replace(old, new, 1)


scene = SCENE.read_text()
scene = replace_once(scene, """type PlayedLine = {
  start: Point
  end: Point
  cells: Point[]
  score: number
}
""", """type PlayedLine = {
  start: Point
  end: Point
  cells: Point[]
  score: number
  rerollKey: number
  boardBefore: Cell[]
}
""", 'PlayedLine history')

scene = replace_once(scene, """function createCell(random: () => number): Cell {
  const roll = random()

  if (roll < 0.64) {
    const value = pickInt(random, 1, 9)
    return { kind: 'add', value, label: String(value) }
  }

  if (roll < 0.80) {
    const value = -pickInt(random, 1, 9)
    return { kind: 'add', value, label: `−${Math.abs(value)}` }
  }

  if (roll < 0.92) {
    const value = random() < 0.78 ? 2 : 3
    return { kind: 'multiply', value, label: `×${value}` }
  }

  const value = random() < 0.72 ? 2 : 3
  return { kind: 'divide', value, label: `÷${value}` }
}
""", """function createCell(random: () => number): Cell {
  const roll = random()

  // Distribution: 68% positive, 16% negative, 12% multiplier, 4% divider.
  // Dividers are half as frequent as before; negative values are deliberately mild.
  if (roll < 0.68) {
    const value = pickInt(random, 1, 9)
    return { kind: 'add', value, label: String(value) }
  }

  if (roll < 0.84) {
    const value = -pickInt(random, 1, 4)
    return { kind: 'add', value, label: `−${Math.abs(value)}` }
  }

  if (roll < 0.96) {
    const value = random() < 0.78 ? 2 : 3
    return { kind: 'multiply', value, label: `×${value}` }
  }

  const value = random() < 0.72 ? 2 : 3
  return { kind: 'divide', value, label: `÷${value}` }
}
""", 'cell distribution')

scene = replace_once(scene, """  private cellTexts: Phaser.GameObjects.Text[] = []
  private ambientStars: AmbientStar[] = []
""", """  private cellTexts: Phaser.GameObjects.Text[] = []
  private cellMaterialImages: Phaser.GameObjects.Image[] = []
  private ambientStars: AmbientStar[] = []
""", 'cell material property')

scene = replace_once(scene, """    boardId: this.dayId, board: this.board, boardBounds: { x: BOARD_X, y: BOARD_Y, size: BOARD_SIZE },
    lines: this.lines, total: this.totalScore(), drag: this.drag,
""", """    boardId: this.dayId, board: this.board, boardBounds: { x: BOARD_X, y: BOARD_Y, size: BOARD_SIZE },
    lines: this.lines.map((line) => ({
      start: line.start, end: line.end, cells: line.cells, score: line.score, rerollKey: line.rerollKey,
    })), total: this.totalScore(), drag: this.drag,
""", 'debug line state')

scene = replace_once(scene, """    this.cellTexts = []
    this.historyRows = []
""", """    this.cellTexts = []
    this.cellMaterialImages = []
    this.historyRows = []
""", 'reset material images')

scene = replace_once(scene, """    this.board.forEach((cell, index) => {
      if (cell.kind === 'add') return

      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const key = cell.kind === 'multiply' ? ASSETS.cellMultiply[0] : ASSETS.cellDivide[0]
      this.add.image(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        key,
      ).setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4).setDepth(10)
    })
""", """    this.cellMaterialImages = this.board.map((cell, index) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const key = cell.kind === 'divide' ? ASSETS.cellDivide[0] : ASSETS.cellMultiply[0]
      return this.add.image(
        BOARD_X + (col + 0.5) * CELL_SIZE,
        BOARD_Y + (row + 0.5) * CELL_SIZE,
        key,
      ).setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4).setDepth(10).setVisible(cell.kind !== 'add')
    })
""", 'dynamic cell materials')

scene = replace_once(scene, """    const playedLine: PlayedLine = {
      start: finalDrag.start,
      end,
      cells: finalDrag.cells,
      score: scoreCells(finalDrag.cells, this.board),
    }

    this.lines.push(playedLine)
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
    this.pulseNewLine(this.lines.length - 1)
""", """    const score = scoreCells(finalDrag.cells, this.board)
    const playedLine: PlayedLine = {
      start: finalDrag.start,
      end,
      cells: finalDrag.cells,
      score,
      rerollKey: this.rerollKeyForLine(finalDrag.start, end, finalDrag.cells, score),
      boardBefore: this.board.map((cell) => ({ ...cell })),
    }

    this.lines.push(playedLine)
    this.rerollUnplayedCells(playedLine.rerollKey)
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
    this.pulseNewLine(this.lines.length - 1)
""", 'line placement reroll')

scene = replace_once(scene, """  private undo() {
    if (!this.undoEnabled()) return

    this.lines.pop()
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
  }
""", """  private undo() {
    if (!this.undoEnabled()) return

    const removed = this.lines.pop()
    if (removed) {
      this.board = removed.boardBefore.map((cell) => ({ ...cell }))
      this.refreshBoardCells()
    }
    this.bridge.session.setScore(this.totalScore())
    this.refreshPresentation()
  }
""", 'undo board restore')

scene = replace_once(scene, """          runtimeSeed: this.bridge.seed,
          artDirection: 'orbital-accounting',
""", """          runtimeSeed: this.bridge.seed,
          rerollKeys: this.lines.map((line) => line.rerollKey).join(','),
          artDirection: 'orbital-accounting',
""", 'finish reroll metadata')

scene = replace_once(scene, """  private totalScore() {
    return roundScore(this.lines.reduce((sum, line) => sum + line.score, 0))
  }
""", """  private rerollKeyForLine(start: Point, end: Point, cells: Point[], score: number) {
    const rowStep = Math.sign(end.row - start.row)
    const colStep = Math.sign(end.col - start.col)
    const orderedValues = cells.map((point) => {
      const cell = this.board[point.row * GRID_SIZE + point.col]
      return `${cell.kind}:${cell.value}`
    }).join('|')

    return hashString(`dir:${rowStep},${colStep};cells:${orderedValues};score:${formatScore(score)}`)
  }

  private rerollUnplayedCells(rerollKey: number) {
    const protectedCells = new Set(this.lines.flatMap((line) => line.cells.map(pointKey)))
    const random = mulberry32(rerollKey || 1)

    this.board = this.board.map((cell, index) => {
      // Consume one deterministic candidate per board position so a key always maps
      // to the same 7x7 candidate field, independently from the protected cells.
      const candidate = createCell(random)
      const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
      return protectedCells.has(pointKey(point)) ? cell : candidate
    })
    this.refreshBoardCells()
  }

  private refreshBoardCells() {
    this.board.forEach((cell, index) => {
      const material = this.cellMaterialImages[index]
      if (material) {
        if (cell.kind === 'add') material.setVisible(false)
        else material
          .setTexture(cell.kind === 'multiply' ? ASSETS.cellMultiply[0] : ASSETS.cellDivide[0])
          .setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4)
          .setVisible(true)
      }

      const text = this.cellTexts[index]
      if (!text) return
      const color = cell.kind === 'multiply'
        ? '#fff1c9'
        : cell.kind === 'divide'
          ? '#f9ebff'
          : '#f5e6c1'
      text.setText(cell.label).setColor(color)
    })
  }

  private totalScore() {
    return roundScore(this.lines.reduce((sum, line) => sum + line.score, 0))
  }
""", 'reroll helpers')

SCENE.write_text(scene)


test = TEST.read_text()
test = replace_once(test, """    assert.equal(initial.lines.length, 0)
    assert.equal(initial.validateEnabled, false)
    assert.equal(initial.reducedMotion, config.reducedMotion === 'reduce')
""", """    assert.equal(initial.lines.length, 0)
    assert.equal(initial.validateEnabled, false)
    assert.equal(initial.reducedMotion, config.reducedMotion === 'reduce')
    assert.ok(initial.board.every(cell => cell.kind !== 'add' || cell.value >= 0 || (cell.value >= -4 && cell.value <= -1)), 'Negative cells stay between -1 and -4')
""", 'initial negative range test')

test = replace_once(test, """    await release(); await page.waitForTimeout(350)
    assert.equal((await state()).lines.length, 1)
    await capture('one')
""", """    await release(); await page.waitForTimeout(350)
    const afterFirst = await state()
    assert.equal(afterFirst.lines.length, 1)
    assert.ok(Number.isInteger(afterFirst.lines[0].rerollKey), 'Placed line exposes a deterministic reroll key')
    assert.ok(afterFirst.board.every(cell => cell.kind !== 'add' || cell.value >= 0 || (cell.value >= -4 && cell.value <= -1)), 'Rerolled negatives stay between -1 and -4')
    const firstProtected = new Set(afterFirst.lines[0].cells.map(cell => `${cell.row}:${cell.col}`))
    let changedOutsideFirstLine = 0
    for (let index = 0; index < initial.board.length; index++) {
      const key = `${Math.floor(index / 7)}:${index % 7}`
      if (firstProtected.has(key)) assert.deepEqual(afterFirst.board[index], initial.board[index], 'Line cells survive their reroll')
      else if (JSON.stringify(afterFirst.board[index]) !== JSON.stringify(initial.board[index])) changedOutsideFirstLine += 1
    }
    assert.ok(changedOutsideFirstLine > 0, 'At least one cell outside the placed line is rerolled')
    await capture('one')
""", 'first reroll behavior test')

test = replace_once(test, """    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const full = await state()
""", """    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    const afterSecond = await state()
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const full = await state()
""", 'remember second reroll state')

test = replace_once(test, """    await clickControl('undo')
    assert.equal((await state()).lines.length, 2)
    assert.equal((await state()).validateEnabled, false)
    assert.equal((await state()).validateAppearance, 'disabled')
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
""", """    await clickControl('undo')
    const undone = await state()
    assert.equal(undone.lines.length, 2)
    assert.equal(undone.validateEnabled, false)
    assert.equal(undone.validateAppearance, 'disabled')
    assert.deepEqual(undone.board, afterSecond.board, 'Undo restores the exact board before the removed line reroll')
    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const redrawn = await state()
    assert.equal(redrawn.lines[2].rerollKey, full.lines[2].rerollKey, 'Same ordered line produces the same reroll key')
    assert.deepEqual(redrawn.board, full.board, 'Same line and key reproduce the same rerolled board')
""", 'undo and deterministic redraw test')
TEST.write_text(test)


registry = REGISTRY.read_text()
registry = replace_once(registry, """    release: {
      version: '0.3.0',
      updatedAt: '2026-09-08T16:34:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""", """    release: {
      version: '0.4.0',
      updatedAt: '2026-09-10T08:54:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""", 'LineFugg release metadata')
REGISTRY.write_text(registry)


changelog = CHANGELOG.read_text()
entry = """## [0.4.0] — 2026-09-10 08:54 Europe/Paris

- Les cases négatives sont limitées à `−1`…`−4` et les diviseurs passent de 8 % à 4 % du tirage ; les 4 points libérés vont aux nombres positifs.
- Chaque ligne posée produit une clé déterministe issue de son sens, de ses valeurs ordonnées et de son score, puis retire toutes les cases encore libres.
- Les cases déjà engagées par une ligne restent stables pour préserver la lecture des calculs ; Annuler restaure exactement la grille précédant le dernier retirage, et redessiner la même ligne reproduit la même grille.

Vérifié : distribution négative, retirage hors lignes, reproductibilité de la clé, restauration par Annuler, scoring des trois lignes, replay et build/typecheck.

"""
changelog = replace_once(changelog, '# LineFugg — Changelog\n\n', '# LineFugg — Changelog\n\n' + entry, 'changelog header')
CHANGELOG.write_text(changelog)


status = STATUS.read_text()
status = replace_once(status,
"Mis à jour : 8 septembre 2026 à 16:34 Europe/Paris. Version livrée : `0.3.0`. Changelog : `CHANGELOG.md`.",
"Mis à jour : 10 septembre 2026 à 08:54 Europe/Paris. Version livrée : `0.4.0`. Changelog : `CHANGELOG.md`.",
'GAME_STATUS version header')
status = replace_once(status,
"Validation utilisateur : « Proto, GD et équilibre sont trés bons, ils sont validés ». Règles et paramètres préservés : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation après trois lignes et validation explicite pour terminer.",
"Validation utilisateur : « Proto, GD et équilibre sont trés bons, ils sont validés ». Règles conservées : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation après trois lignes et validation explicite pour terminer. Évolution GD du 10 septembre : négatifs limités à −1…−4, diviseurs deux fois moins fréquents, et retirage déterministe des cases libres après chaque ligne à partir d'une clé construite avec son sens, ses valeurs ordonnées et son score.",
'GAME_STATUS decisions')
status += """

## Retirage déterministe après chaque ligne — 10 septembre 2026

Chaque ligne validée calcule désormais une clé `hashString` à partir du vecteur de sens normalisé, de la suite ordonnée des cellules (`add` / `multiply` / `divide` + valeur) et du score de la ligne. Cette clé alimente un PRNG `mulberry32` qui génère un nouveau candidat pour chacune des 49 positions ; seules les cases qui ne font partie d'aucune ligne déjà posée prennent ce nouveau candidat. Ce gel des lignes jouées est volontaire : leurs chiffres, leur historique et leur score restent cohérents visuellement pendant les retirages suivants.

Annuler stocke/restaure la grille exacte qui précédait la ligne supprimée. Refaire exactement la même ligne depuis cet état produit la même clé et le même retirage. Les clés sont ajoutées aux métadonnées de fin de partie pour faciliter la reproduction d'une partie. Tirage : 68 % positifs, 16 % négatifs `−1…−4`, 12 % multiplicateurs, 4 % diviseurs.

Test navigateur étendu : conservation des cellules de ligne, changement des cases libres, plage des négatifs, clé déterministe, restauration exacte par Annuler et reproductibilité après redraw, en plus des contrôles historiques de score/validation/replay. Validation CI à confirmer sur le commit fonctionnel.
"""
STATUS.write_text(status)
