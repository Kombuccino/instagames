from pathlib import Path

SCENE = Path('src/games/linefugg/LineFuggScene.ts')
REGISTRY = Path('src/core/gameRegistry.tsx')
CHANGELOG = Path('src/games/linefugg/CHANGELOG.md')
STATUS = Path('src/games/linefugg/GAME_STATUS.md')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, got {count}')
    return text.replace(old, new, 1)

scene = SCENE.read_text()
scene = replace_once(
    scene,
    """      if (_cell.kind === 'add' && useCount === 0 && dimensionSlot >= 0 && dimensionSlot < MAX_LINES) {
        // Normal free cells carry the color of the line/dimension currently being played.
        this.boardOverlayGraphics.fillStyle(LINE_COLORS[dimensionSlot], 0.115)
        this.boardOverlayGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
      }
""",
    """      if (_cell.kind === 'add' && useCount === 0 && dimensionSlot >= 0 && dimensionSlot < MAX_LINES) {
        // Use the exact RGB of the active line. The stronger translucent enamel wash
        // keeps the cell artwork readable while making the current dimension unmistakable.
        const activeLineColor = LINE_COLORS[dimensionSlot]
        this.boardOverlayGraphics.fillStyle(activeLineColor, 0.30)
        this.boardOverlayGraphics.fillRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
        this.boardOverlayGraphics.lineStyle(1.25, activeLineColor, 0.42)
        this.boardOverlayGraphics.strokeRoundedRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8, 6)
      }
""",
    'active line tint',
)
SCENE.write_text(scene)

registry = REGISTRY.read_text()
registry = replace_once(
    registry,
    """    release: {
      version: '0.5.0',
      updatedAt: '2026-09-10T09:24:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""",
    """    release: {
      version: '0.5.1',
      updatedAt: '2026-09-10T10:23:00+02:00',
      changelogPath: 'src/games/linefugg/CHANGELOG.md',
    },
""",
    'release metadata',
)
REGISTRY.write_text(registry)

changelog = CHANGELOG.read_text()
entry = """## [0.5.1] — 2026-09-10 10:23 Europe/Paris

- Les cases normales libres utilisent maintenant de façon nettement visible l'exacte couleur RGB de la ligne active : vermillon, violet ou or.
- La teinte émaillée est renforcée sans masquer les chiffres ni modifier les couleurs propres aux multiplicateurs/diviseurs ; le flip en cascade reste inchangé.

Vérifié : build/typecheck et smoke test LineFugg après correction de teinte.

"""
changelog = replace_once(changelog, '# LineFugg — Changelog\n\n', '# LineFugg — Changelog\n\n' + entry, 'changelog')
CHANGELOG.write_text(changelog)

status = STATUS.read_text()
status = replace_once(
    status,
    'Mis à jour : 10 septembre 2026 à 09:24 Europe/Paris. Version livrée : `0.5.0`.',
    'Mis à jour : 10 septembre 2026 à 10:23 Europe/Paris. Version livrée : `0.5.1`.',
    'status release',
)
status += """

## Ajustement couleur de dimension — 10 septembre 2026

Retour utilisateur : la teinte des cases normales doit être perçue comme exactement la couleur de la ligne en cours. Les cases libres utilisaient déjà `LINE_COLORS`, mais à 11,5 % d'opacité sur l'émail bleu, ce qui décalait fortement la perception. Passage à un lavis 30 % et un fin contour 42 %, toujours avec les RGB canoniques vermillon/violet/or. Aucun changement de logique de dimension, de reroll ou de flip.
"""
STATUS.write_text(status)
