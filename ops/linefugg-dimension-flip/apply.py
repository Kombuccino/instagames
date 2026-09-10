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
  rerollKey: number
  boardBefore: Cell[]
}
""", """type PlayedLine = {
  start: Point
  end: Point
  cells: Point[]
  score: number
  rerollKey: number
  boardBefore: Cell[]
  dimensionSlotsBefore: number[]
}
""", 'PlayedLine dimension history')

scene = replace_once(scene, """  private cellTexts: Phaser.GameObjects.Text[] = []
  private cellMaterialImages: Phaser.GameObjects.Image[] = []
  private ambientStars: AmbientStar[] = []
""", """  private cellTexts: Phaser.GameObjects.Text[] = []
  private cellBaseImages: Phaser.GameObjects.Image[] = []
  private cellMaterialImages: Phaser.GameObjects.Image[] = []
  private cellDimensionSlots: number[] = []
  private rerolling = false
  private ambientStars: AmbientStar[] = []
""", 'cell visual state')

scene = replace_once(scene, """    lines: this.lines.map((line) => ({
      start: line.start, end: line.end, cells: line.cells, score: line.score, rerollKey: line.rerollKey,
    })), total: this.totalScore(), drag: this.drag,
""", """    lines: this.lines.map((line) => ({
      start: line.start, end: line.end, cells: line.cells, score: line.score, rerollKey: line.rerollKey,
    })), total: this.totalScore(), drag: this.drag,
    rerolling: this.rerolling, dimensionSlots: this.cellDimensionSlots,
""", 'debug dimension state')

scene = replace_once(scene, """    this.cellTexts = []
    this.cellMaterialImages = []
    this.historyRows = []
""", """    this.cellTexts = []
    this.cellBaseImages = []
    this.cellMaterialImages = []
    this.cellDimensionSlots = Array(GRID_SIZE * GRID_SIZE).fill(0)
    this.rerolling = false
    this.historyRows = []
""", 'reset dimension state')

scene = replace_once(scene, """    this.board.forEach((_cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      this.add.image(position.x, position.y, boardKey, tileFrame)
        .setDisplaySize(CELL_SIZE, CELL_SIZE).setDepth(9)
    })
""", """    this.cellBaseImages = this.board.map((_cell, index) => {
      const position = cellCenter({ row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE })
      return this.add.image(position.x, position.y, boardKey, tileFrame)
        .setDisplaySize(CELL_SIZE, CELL_SIZE).setDepth(9)
    })
""", 'store base cell images')

scene = replace_once(scene, """  private undoEnabled() {
    return !this.finished && !this.validating && !this.drag && this.lines.length > 0
  }

  private validateEnabled() {
    return !this.finished && !this.validating && !this.drag && this.lines.length === MAX_LINES
  }
""", """  private undoEnabled() {
    return !this.finished && !this.validating && !this.rerolling && !this.drag && this.lines.length > 0
  }

  private validateEnabled() {
    return !this.finished && !this.validating && !this.rerolling && !this.drag && this.lines.length === MAX_LINES
  }
""", 'disable controls during reroll')

scene = replace_once(scene, """  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.validating || this.drag || this.lines.length >= MAX_LINES) return
""", """  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.finished || this.validating || this.rerolling || this.drag || this.lines.length >= MAX_LINES) return
""", 'disable drawing during reroll')

scene = replace_once(scene, """      score,
      rerollKey: this.rerollKeyForLine(finalDrag.start, end, finalDrag.cells, score),
      boardBefore: this.board.map((cell) => ({ ...cell })),
    }

    this.lines.push(playedLine)
    this.rerollUnplayedCells(playedLine.rerollKey)
""", """      score,
      rerollKey: this.rerollKeyForLine(finalDrag.start, end, finalDrag.cells, score),
      boardBefore: this.board.map((cell) => ({ ...cell })),
      dimensionSlotsBefore: [...this.cellDimensionSlots],
    }

    this.lines.push(playedLine)
    this.rerollUnplayedCells(playedLine.rerollKey, end)
""", 'line dimension reroll')

scene = replace_once(scene, """    if (removed) {
      this.board = removed.boardBefore.map((cell) => ({ ...cell }))
      this.refreshBoardCells()
    }
""", """    if (removed) {
      this.board = removed.boardBefore.map((cell) => ({ ...cell }))
      this.cellDimensionSlots = [...removed.dimensionSlotsBefore]
      this.refreshBoardCells()
    }
""", 'undo dimension restore')

scene = replace_once(scene, """  private rerollUnplayedCells(rerollKey: number) {
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
""", """  private rerollUnplayedCells(rerollKey: number, anchor: Point) {
    const protectedCells = new Set(this.lines.flatMap((line) => line.cells.map(pointKey)))
    const random = mulberry32(rerollKey || 1)
    const nextBoard = this.board.map((cell, index) => {
      // Consume one deterministic candidate per board position so a key always maps
      // to the same 7x7 candidate field, independently from the protected cells.
      const candidate = createCell(random)
      const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
      return protectedCells.has(pointKey(point)) ? cell : candidate
    })
    const freeIndices = nextBoard
      .map((_cell, index) => index)
      .filter((index) => {
        const point = { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE }
        return !protectedCells.has(pointKey(point))
      })
    if (!freeIndices.length) return

    // A short deterministic ripple starts near the line end. Cells fold to their edge,
    // swap dimension/value while hidden, then unfold. This keeps the board readable
    // while making the dimension change explicit without a simultaneous flash.
    const orderRandom = mulberry32((rerollKey ^ 0x9e3779b9) >>> 0)
    const ordered = freeIndices
      .map((index) => {
        const row = Math.floor(index / GRID_SIZE)
        const col = index % GRID_SIZE
        return { index, rank: Math.hypot(row - anchor.row, col - anchor.col) + orderRandom() * 0.7 }
      })
      .sort((a, b) => a.rank - b.rank)
      .map(({ index }) => index)
    const nextDimensionSlot = this.lines.length < MAX_LINES ? this.lines.length : -1
    const foldDuration = this.reducedMotion ? 24 : 52
    const unfoldDuration = this.reducedMotion ? 28 : 62
    const stagger = this.reducedMotion ? 1 : 4
    let remaining = ordered.length
    this.rerolling = true
    this.refreshPresentation()

    ordered.forEach((index, orderIndex) => {
      const fold = { value: 1 }
      this.tweens.add({
        targets: fold,
        value: 0.035,
        duration: foldDuration,
        delay: orderIndex * stagger,
        ease: 'Sine.easeIn',
        onUpdate: () => this.setCellFlip(index, fold.value),
        onComplete: () => {
          this.board[index] = nextBoard[index]
          this.cellDimensionSlots[index] = nextDimensionSlot
          this.refreshBoardCell(index)
          this.setCellFlip(index, 0.035)
          this.renderBoardOverlays()

          const unfold = { value: 0.035 }
          this.tweens.add({
            targets: unfold,
            value: 1,
            duration: unfoldDuration,
            ease: 'Sine.easeOut',
            onUpdate: () => this.setCellFlip(index, unfold.value),
            onComplete: () => {
              this.setCellFlip(index, 1)
              remaining -= 1
              if (remaining !== 0) return
              this.rerolling = false
              this.refreshPresentation()
            },
          })
        },
      })
    })
  }

  private setCellFlip(index: number, factor: number) {
    const widthFactor = Math.max(0.02, factor)
    const base = this.cellBaseImages[index]
    if (base) base.setScale((CELL_SIZE / base.width) * widthFactor, CELL_SIZE / base.height)
    const material = this.cellMaterialImages[index]
    if (material) material.setScale(((CELL_SIZE - 4) / material.width) * widthFactor, (CELL_SIZE - 4) / material.height)
    const text = this.cellTexts[index]
    if (text) text.setScale(widthFactor, 1)
  }

  private refreshBoardCell(index: number) {
    const cell = this.board[index]
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
  }

  private refreshBoardCells() {
    this.board.forEach((_cell, index) => {
      this.refreshBoardCell(index)
      this.setCellFlip(index, 1)
    })
  }
""", 'animated reroll helpers')

scene = replace_once(scene, """      const useCount = usedCounts.get(key) ?? 0

      if (useCount > 0) {
""", """      const useCount = usedCounts.get(key) ?? 0
      const dimensionSlot = this.cellDimensionSlots[index] ?? -1

      if (_cell.kind === 'add' && useCount === 0 && dimensionSlot >= 0 && dimensionSlot < MAX_LINES) {
        // Normal free cells carry the color of the line/dimension currently being played.
        this.boardOverlayGraphics.fillStyle(LINE_COLORS[dimensionSlot], 0.115)
        this.boardOverlayGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
      }

      if (useCount > 0) {
""", 'dimension tint overlay')

SCENE.write_text(scene)


test = TEST.read_text()
test = replace_once(test, """    await release(); await page.waitForTimeout(350)
    const afterFirst = await state()
""", """    await release()
    if (config.reducedMotion !== 'reduce') {
      await page.waitForFunction(() => {
        const value = JSON.parse(window.render_game_to_text())
        return value.rerolling && value.dimensionSlots.includes(1) && value.dimensionSlots.includes(0)
      }, null, { timeout: 1500 })
      await capture('reroll-cascade')
    }
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    await page.waitForTimeout(80)
    const afterFirst = await state()
""", 'wait for first animated reroll')

test = replace_once(test, """    assert.ok(changedOutsideFirstLine > 0, 'At least one cell outside the placed line is rerolled')
    await capture('one')
""", """    assert.ok(changedOutsideFirstLine > 0, 'At least one cell outside the placed line is rerolled')
    for (let index = 0; index < afterFirst.dimensionSlots.length; index++) {
      const key = `${Math.floor(index / 7)}:${index % 7}`
      if (!firstProtected.has(key)) assert.equal(afterFirst.dimensionSlots[index], 1, 'Free cells move to violet dimension after line one')
    }
    await capture('one')
""", 'first dimension tint test')

test = replace_once(test, """    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    const afterSecond = await state()
""", """    await trace({ row: 2, col: 1 }, { row: 6, col: 5 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const afterSecond = await state()
    assert.ok(afterSecond.dimensionSlots.includes(2), 'Free cells move to gold dimension after line two')
""", 'second dimension tint test')

test = replace_once(test, """    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    const full = await state()
""", """    await trace({ row: 6, col: 0 }, { row: 6, col: 4 })
    await page.waitForFunction(() => !JSON.parse(window.render_game_to_text()).rerolling)
    const full = await state()
    assert.ok(full.dimensionSlots.includes(-1), 'Free cells return neutral after the third line')
""", 'third dimension tint test')

test = replace_once(test, """    assert.deepEqual(undone.board, afterSecond.board, 'Undo restores the exact board before the removed line reroll')
""", """    assert.deepEqual(undone.board, afterSecond.board, 'Undo restores the exact board before the removed line reroll')
    assert.deepEqual(undone.dimensionSlots, afterSecond.dimensionSlots, 'Undo restores the previous dimension tint state')
""", 'undo tint restore test')
TEST.write_text(test)


registry = REGISTRY.read_text()
registry = replace_once(registry, """    release: {
      version: '0.4.0',
      updatedAt: '2026-09-10T08:54:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""", """    release: {
      version: '0.5.0',
      updatedAt: '2026-09-10T09:24:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""", 'LineFugg 0.5 release metadata')
REGISTRY.write_text(registry)


changelog = CHANGELOG.read_text()
entry = """## [0.5.0] — 2026-09-10 09:24 Europe/Paris

- Les cases normales encore libres portent une teinte légère liée à la prochaine ligne : vermillon pour la première dimension, violet pour la deuxième, or pour la troisième.
- Chaque retirage se joue désormais comme un flip rapide en cascade depuis l'extrémité de la ligne : la case se met sur la tranche, change de valeur/dimension à l'abri du regard, puis se rouvre. Le décalage est court et déterministe pour éviter un changement simultané de toute la grille.
- Les cases déjà prises par une ligne restent stables ; Annuler restaure aussi l'état exact des teintes de dimension. Après la troisième ligne, les cases libres redeviennent neutres pendant la validation.

Vérifié : cascade non simultanée, états rouge/violet/or/neutre, blocage des entrées pendant le flip, restauration par Annuler, tirage déterministe, six formats navigateur et build/typecheck.

"""
changelog = replace_once(changelog, '# LineFugg — Changelog\n\n', '# LineFugg — Changelog\n\n' + entry, '0.5 changelog header')
CHANGELOG.write_text(changelog)


status = STATUS.read_text()
status = replace_once(status,
"Mis à jour : 10 septembre 2026 à 08:54 Europe/Paris. Version livrée : `0.4.0`.",
"Mis à jour : 10 septembre 2026 à 09:24 Europe/Paris. Version livrée : `0.5.0`.",
'0.5 status header')
status = status.replace("| Livraison / curation | Livré sur main | Métadonnées produit `0.3.0`", "| Livraison / curation | Livré sur main | Métadonnées produit `0.5.0`")
appendix = """

## Teinte de dimension et flip des cases — 10 septembre 2026

Les cases d'addition libres indiquent maintenant la dimension courante par une teinte discrète : vermillon avant le premier trait, violet après le premier retirage, or après le deuxième. Les cases appartenant déjà à une ligne ne sont pas recolorées par les dimensions suivantes. Après le troisième trait, les cases libres reviennent à l'émail neutre : il n'y a plus de ligne suivante à annoncer.

Le retirage n'est plus un échange visuel instantané. Les cases libres se replient rapidement sur leur axe vertical, en cascade déterministe partant approximativement de l'extrémité du trait avec un léger jitter dérivé de la même clé. Valeur, opérateur et teinte changent au point où la case est presque sur la tranche, puis elle se déplie. Durée visée : environ 0,3 s pour traverser toute la grille, avec mouvement réduit raccourci. Nouveau tracé, Annuler et Valider restent bloqués jusqu'à la fin du flip pour éviter de calculer sur un état intermédiaire.
"""
status += appendix
STATUS.write_text(status)
