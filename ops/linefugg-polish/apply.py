from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"Expected block not found in {path}: {old[:120]!r}")
    file.write_text(text.replace(old, new, 1))


# 1) Decorative background belongs to the Core-owned game surface, not the fixed Phaser canvas.
#    This makes narrow screens crop the art with CSS cover while gameplay stays 390x844.
replace_once(
    "src/games/linefugg/LineFugg.tsx",
    """    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#02070e',
      }}
      onPointerDownCapture={() => {
        if (active) void musicRef.current?.start()
      }}
    >
      <div
        aria-hidden=\"true\"
        style={{
          position: 'absolute',
          inset: '-4%',
          backgroundImage: `linear-gradient(rgba(1, 5, 12, .22), rgba(1, 5, 12, .22)), url(${LINEFUGG_BACKGROUND})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          filter: 'saturate(.92) brightness(.72)',
          transform: 'scale(1.04)',
          pointerEvents: 'none',
        }}
      />
      <PhaserGameHost
""",
    """    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#02070e',
        backgroundImage: `linear-gradient(rgba(1, 5, 12, .10), rgba(1, 5, 12, .10)), url(${LINEFUGG_BACKGROUND})`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
      onPointerDownCapture={() => {
        if (active) void musicRef.current?.start()
      }}
    >
      <PhaserGameHost
""",
)

# 2) The Phaser scene no longer owns a duplicate full-stage background image.
replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """  background: ['linefugg-orbital-bg-v5', `${ASSET_ROOT}/backgrounds/orbital-stage-bg-v5.png`],
""",
    """,
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """  private createBackground() {
    const [backgroundKey] = ASSETS.background
    const background = this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, backgroundKey).setDepth(0)
    const coverScale = Math.max(STAGE_WIDTH / background.width, STAGE_HEIGHT / background.height)
    background.setScale(coverScale)

    const shade = this.add.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, STAGE_WIDTH, STAGE_HEIGHT, INK_NAVY, 0.06)
      .setDepth(1)
    shade.setBlendMode(Phaser.BlendModes.MULTIPLY)

    this.ambientGraphics = this.add.graphics().setDepth(3)
  }
""",
    """  private createBackground() {
    // The illustrated observatory backdrop is CSS-owned by LineFugg.tsx so it can
    // cover/crop inside the Core game surface independently of the fixed 390x844 stage.
    // Keep Phaser transparent here: no second copy, no seams, no accidental contain-fit.
    this.ambientGraphics = this.add.graphics().setDepth(3)
  }
""",
)

# 3) Reinforce the board as a real dark-blue enamel instrument, not floating glyphs.
replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """  private createBoardObjects() {
    const [boardKey] = ASSETS.boardPanel
    this.add.image(BOARD_CENTER_X, BOARD_CENTER_Y, boardKey)
      .setDisplaySize(BOARD_PANEL_SIZE, BOARD_PANEL_SIZE)
      .setDepth(8)

    this.board.forEach((cell, index) => {
""",
    """  private createBoardObjects() {
    const [boardKey] = ASSETS.boardPanel

    // Deep backing is deliberately separate from the ornate frame. It guarantees
    // the 7x7 playfield always reads as one enamel calculation surface even when
    // the illustrated panel contains transparent/open celestial details.
    this.add.rectangle(BOARD_CENTER_X, BOARD_CENTER_Y + 2, BOARD_SIZE + 16, BOARD_SIZE + 16, 0x020914, 0.92)
      .setStrokeStyle(2, 0x6f431e, 0.84)
      .setDepth(6)

    this.add.image(BOARD_CENTER_X, BOARD_CENTER_Y, boardKey)
      .setDisplaySize(BOARD_PANEL_SIZE, BOARD_PANEL_SIZE)
      .setDepth(8)

    // Calm the interior so numbers and paths outrank the illustration.
    this.add.rectangle(BOARD_CENTER_X, BOARD_CENTER_Y, BOARD_SIZE + 2, BOARD_SIZE + 2, INK_NAVY, 0.26)
      .setDepth(8.5)

    // Every normal cell gets a subtle navy enamel plate. Special × / ÷ materials
    // sit above these plates, so all 49 cells share the same physical grammar.
    const cellBaseGraphics = this.add.graphics().setDepth(9)
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const x = BOARD_X + col * CELL_SIZE
        const y = BOARD_Y + row * CELL_SIZE
        cellBaseGraphics.fillStyle(0x071a2a, 0.72)
        cellBaseGraphics.fillRoundedRect(x + 2.2, y + 2.2, CELL_SIZE - 4.4, CELL_SIZE - 4.4, 4.5)
        cellBaseGraphics.lineStyle(1.05, BRASS_LIGHT, 0.34)
        cellBaseGraphics.strokeRoundedRect(x + 2.2, y + 2.2, CELL_SIZE - 4.4, CELL_SIZE - 4.4, 4.5)
      }
    }

    this.board.forEach((cell, index) => {
""",
)

# 4) Make history rows visibly idle/alive and improve readability on small screens.
replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      const background = this.add.image(195, y, rowKey)
        .setDisplaySize(372, HISTORY_ROW_HEIGHT)
        .setDepth(40)

      const marker = this.add.circle(28, y, 6.5, LINE_COLORS[index], 0.08)
""",
    """      this.add.rectangle(195, y + 2, 374, HISTORY_ROW_HEIGHT - 2, 0x020914, 0.54)
        .setDepth(38)

      this.add.rectangle(195, y, 366, HISTORY_ROW_HEIGHT - 8, 0xf0dfb6, 0.98)
        .setStrokeStyle(1.6, BRASS_LIGHT, 0.88)
        .setDepth(39)

      const background = this.add.image(195, y, rowKey)
        .setDisplaySize(372, HISTORY_ROW_HEIGHT)
        .setAlpha(0.84)
        .setDepth(40)

      const marker = this.add.circle(28, y, 6.5, LINE_COLORS[index], 0.28)
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """        fontSize: '14px',
""",
    """        fontSize: '16px',
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      const score = this.add.text(365, y, '', {
        fontFamily: 'Georgia, \"Times New Roman\", serif',
        fontSize: '16px',
""",
    """      const score = this.add.text(354, y, '', {
        fontFamily: 'Georgia, \"Times New Roman\", serif',
        fontSize: '17px',
""",
)

# 5) Give the total a guaranteed solid instrument plate even if raster ornament has transparent margins.
replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """    const [totalKey] = ASSETS.totalPlate
    this.add.image(195, TOTAL_Y, totalKey)
      .setDisplaySize(222, 49)
      .setDepth(40)
""",
    """    const [totalKey] = ASSETS.totalPlate
    this.add.rectangle(195, TOTAL_Y + 2, 232, 52, 0x020914, 0.64)
      .setDepth(38)
    this.add.rectangle(195, TOTAL_Y, 226, 48, INK_NAVY, 0.97)
      .setStrokeStyle(2, BRASS_LIGHT, 0.92)
      .setDepth(39)
    this.add.image(195, TOTAL_Y, totalKey)
      .setDisplaySize(222, 49)
      .setAlpha(0.86)
      .setDepth(40)
""",
)

# 6) Idle rows/orbs remain present; only genuinely unavailable controls read disabled.
replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      // Empty rows are waiting/idle, not disabled: keep the parchment visible.
      row.background.setAlpha(active ? 1 : 0.92)
      row.marker.setFillStyle(LINE_COLORS[index], active ? 0.94 : 0.08)
      row.marker.setStrokeStyle(2, LINE_COLORS[index], active ? 1 : 0.44)
      row.arrow.setAlpha(active ? 1 : 0.38)
""",
    """      // Empty rows are waiting/idle, not disabled: keep the parchment and
      // line identity clearly alive before the calculation exists.
      const next = !active && index === this.lines.length && this.lines.length < MAX_LINES
      row.background.setAlpha(active ? 1 : next ? 0.96 : 0.90)
      row.marker.setFillStyle(LINE_COLORS[index], active ? 0.94 : next ? 0.48 : 0.26)
      row.marker.setStrokeStyle(2, LINE_COLORS[index], active ? 1 : next ? 0.86 : 0.62)
      row.arrow.setAlpha(active ? 1 : next ? 0.82 : 0.62)
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      .setAlpha(undoEnabled ? 1 : 0.92)
""",
    """      .setAlpha(undoEnabled ? 1 : 0.76)
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      .setAlpha(validateEnabled ? 1 : 0.94)
""",
    """      .setAlpha(validateEnabled ? 1 : 0.78)
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      const coreAlpha = occupied ? 0.98 : next ? 0.52 : 0.24
""",
    """      const coreAlpha = occupied ? 0.98 : next ? 0.72 : 0.40
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """        this.indicatorGraphics.fillStyle(isLit ? color : 0x8b7147, isLit ? 1 : 0.30)
""",
    """        this.indicatorGraphics.fillStyle(isLit ? color : 0x8b7147, isLit ? 1 : 0.48)
""",
)

replace_once(
    "src/games/linefugg/LineFuggScene.ts",
    """      const alpha = 0.12 + (Math.sin(time * 0.0045) + 1) * 0.06
""",
    """      const alpha = 0.18 + (Math.sin(time * 0.0045) + 1) * 0.07
""",
)

# 7) Document the exact background policy learned from real PC/mobile captures.
replace_once(
    "src/games/linefugg/ASSET_MANIFEST.md",
    """- rendered inside the canonical 390×844 Phaser scene;
- the same image may also be used by the React game wrapper as decorative overscan outside the fitted Phaser canvas on wide screens;
- overscan never changes gameplay geometry.
""",
    """- rendered by the React LineFugg wrapper as the decorative backdrop of the Core-owned game surface;
- use CSS `cover`: narrow/tall screens crop non-critical left/right decoration instead of shrinking the backdrop to `contain`;
- Phaser remains transparent and owns the fixed 390×844 gameplay composition above it;
- the backdrop stops at the Core game-surface boundary; desktop gutters remain Core-owned/black.
""",
)

replace_once(
    "src/games/linefugg/ASSET_MANIFEST.md",
    """Wide screens may show decorative background overscan outside the fitted 390×844 canvas, but no gameplay element moves or stretches.
""",
    """The decorative background may cover/crop inside the Core game surface around the fitted 390×844 canvas, but it never paints into desktop gutters and no gameplay element moves or stretches.
""",
)

replace_once(
    "docs/GAME_LAYOUT_SYSTEM.md",
    """The game's own backdrop may fill or overscan its **game surface** so the authored stage does not look like a narrow object floating inside its slot, but it must stop at the game-surface boundary. It must not turn a portrait Fugg into a browser-wide experience on desktop.
""",
    """The game's own backdrop may fill or overscan its **game surface** so the authored stage does not look like a narrow object floating inside its slot, but it must stop at the game-surface boundary. It must not turn a portrait Fugg into a browser-wide experience on desktop. For decorative backdrops, `cover` + crop is preferred when preserving visual scale matters: narrow screens may lose non-critical left/right decoration rather than shrinking the backdrop with `contain`. Gameplay geometry still uses the fixed logical stage and uniform FIT.
""",
)

print("LineFugg visual polish patch applied")
