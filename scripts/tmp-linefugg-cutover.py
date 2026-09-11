from pathlib import Path

scene_path = Path('src/games/linefugg/LineFuggScene.ts')
scene = scene_path.read_text()
scene = scene.replace("import { OrbitalImageFile, artFrame, fitText, centerTextInk } from './orbitalArt'", "import { artFrame, fitText, centerTextInk } from './orbitalArt'")
replacements = {
    "`${ASSET_ROOT}/ui/orbital-board.png`": "`${ASSET_ROOT}/ui/orbital-board.webp`",
    "`${ASSET_ROOT}/props/orbital-armillary-key.png`": "`${ASSET_ROOT}/props/orbital-armillary-key.webp`",
    "`${ASSET_ROOT}/ui/orbital-cell-multiply-v3.png`": "`${ASSET_ROOT}/ui/orbital-cell-multiply-v3.webp`",
    "`${ASSET_ROOT}/ui/orbital-cell-divide-v3.png`": "`${ASSET_ROOT}/ui/orbital-cell-divide-v3.webp`",
    "`${ASSET_ROOT}/ui/orbital-validate-ready-v5.png`": "`${ASSET_ROOT}/ui/orbital-validate-ready-v5.webp`",
    "`${ASSET_ROOT}/ui/orbital-validate-disabled-v5.png`": "`${ASSET_ROOT}/ui/orbital-validate-disabled-v5.webp`",
    "'/assets/generated/linefugg/ui/validate-amber-source.png'": "'/assets/generated/linefugg/ui/runtime/validate-amber-source.webp'",
    "'/assets/generated/linefugg/ui/glass-indicators.png'": "'/assets/generated/linefugg/ui/runtime/glass-indicators.webp'",
    "`${ASSET_ROOT}/ui/orbital-history-row-v5.png`": "`${ASSET_ROOT}/ui/orbital-history-row-v5.webp`",
    "'/assets/generated/linefugg/ui/accounting-panels.png'": "'/assets/generated/linefugg/ui/runtime/accounting-panels.webp'",
}
for old, new in replacements.items():
    if old not in scene:
        raise SystemExit(f'missing expected LineFuggScene source: {old}')
    scene = scene.replace(old, new)
old_preload = """  preload() {\n    this.load.maxParallelDownloads = 2\n    Object.entries(ASSETS).forEach(([name, [key, url]]) => {\n      if (!this.textures.exists(key)) this.load.addFile(new OrbitalImageFile(this.load, key, url, /undo|validate/i.test(name) ? 256 : 1024))\n    })\n  }"""
new_preload = """  preload() {\n    this.load.maxParallelDownloads = 2\n    Object.values(ASSETS).forEach(([key, url]) => {\n      if (!this.textures.exists(key)) this.load.image(key, url)\n    })\n  }"""
if old_preload not in scene:
    raise SystemExit('missing expected LineFugg preload block')
scene_path.write_text(scene.replace(old_preload, new_preload))

art_path = Path('src/games/linefugg/orbitalArt.ts')
art = art_path.read_text()
class_start = art.index('export class OrbitalImageFile')
block_start = art.find('const IMPORTED_WEBP_RUNTIME')
if block_start < 0 or block_start > class_start:
    block_start = art.rfind('/**', 0, class_start)
next_comment = art.index('/** Frame coordinates', class_start)
art_path.write_text(art[:block_start] + art[next_comment:])

definition_path = Path('src/games/linefugg/definition.ts')
definition = definition_path.read_text()
if "version: '0.5.2'" not in definition:
    raise SystemExit('unexpected LineFugg release version')
definition = definition.replace("version: '0.5.2'", "version: '0.5.3'")
definition = definition.replace("updatedAt: '2026-09-11T20:01:00+02:00'", "updatedAt: '2026-09-11T20:43:00+02:00'")
definition_path.write_text(definition)

changelog_path = Path('src/games/linefugg/CHANGELOG.md')
changelog = changelog_path.read_text()
entry = """## [0.5.3] — 2026-09-11 20:43 Europe/Paris

- Tous les visuels chargés au lancement du gameplay utilisent maintenant des WebP lossless déjà dimensionnés pour le runtime ; aucun gros PNG n'est téléchargé puis réduit dans le navigateur.
- Les trois dernières textures locales passent de 5,73 Mo de PNG à 1,44 Mo de WebP pré-dimensionnés. Le payload image du gameplay complet est maintenant de 4,57 Mo (4,36 Mio), fond compris ; les covers sont chargées séparément.
- Le chargeur Phaser de redimensionnement à la volée est supprimé pour LineFugg : les textures arrivent directement à leur taille de travail. Les masters PNG restent conservés comme sources et références.

Vérifié : pixels visibles/alpha des trois nouveaux dérivés lossless, budget de fichiers, build/typecheck et scénario navigateur LineFugg.

"""
marker = '# LineFugg — Changelog\n\n'
if '## [0.5.3]' not in changelog:
    changelog = changelog.replace(marker, marker + entry, 1)
changelog_path.write_text(changelog)

status_path = Path('src/games/linefugg/GAME_STATUS.md')
status = status_path.read_text()
status = status.replace("Mis à jour : 11 septembre 2026 à 20:01 Europe/Paris. Version livrée : `0.5.2`.", "Mis à jour : 11 septembre 2026 à 20:43 Europe/Paris. Version livrée : `0.5.3`.")
note = """
## Optimisation images runtime terminée — 11 septembre 2026

Le gameplay ne référence plus de PNG lourds. Fond CSS, plateau, armillaire, cases spéciales, boutons Valider, ornements du registre, console, indicateurs et verre orange sont tous servis en WebP lossless pré-dimensionné. Les PNG sources restent conservés hors chemin actif. Le payload image nécessaire au gameplay est de **4 573 098 octets (4,57 Mo / 4,36 Mio)**, covers exclues car elles appartiennent au feed et sont chargées séparément.

Les trois derniers assets locaux ont été dérivés sans régénération : `accounting-panels.webp` 681 024 octets (1024×683), `glass-indicators.webp` 671 796 octets (1024²), `validate-amber-source.webp` 89 910 octets (256²). Leur alpha et leurs pixels visibles après décodage sont identiques à la version runtime redimensionnée avant encodage. Le redimensionnement navigateur `OrbitalImageFile` est retiré ; Phaser charge directement les textures préparées.
"""
if '## Optimisation images runtime terminée — 11 septembre 2026' not in status:
    status += note
status_path.write_text(status)

manifest_path = Path('src/games/linefugg/ASSET_MANIFEST.md')
manifest = manifest_path.read_text()
section = """
## Runtime WebP cutover — 2026-09-11

Tous les assets actuellement chargés par le gameplay utilisent désormais un dérivé WebP lossless dimensionné pour l'usage réel. Les PNG documentés plus haut restent des sources conservées, pas des URLs runtime. Chemins actifs principaux : `backgrounds/orbital-environment.webp`, `ui/orbital-board.webp`, `props/orbital-armillary-key.webp`, `ui/orbital-cell-*-v3.webp`, `ui/orbital-validate-*-v5.webp`, `ui/orbital-history-row-v5.webp` et `public/assets/generated/linefugg/ui/runtime/*.webp`.

Budget réseau des 11 images gameplay actives : **4 573 098 octets (4,57 Mo / 4,36 Mio)**. Les quatre covers WebP sont exclues de ce budget : elles appartiennent au feed et ne sont pas un prérequis du chargement Phaser. Les trois dérivés `generated/ui/runtime/` sont 1024×683 / 681 024 octets, 1024×1024 / 671 796 octets et 256×256 / 89 910 octets. La génération technique a vérifié alpha et pixels visibles après décodage lossless. `OrbitalImageFile` n'est plus utilisé : aucune source surdimensionnée n'est téléchargée pour être réduite côté client.
"""
if '## Runtime WebP cutover — 2026-09-11' not in manifest:
    manifest += section
manifest_path.write_text(manifest)

test_path = Path('scripts/test-linefugg-runtime-assets.mjs')
test_path.write_text("""import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const assets = [
  'public/assets/imported/linefugg/backgrounds/orbital-environment.webp',
  'public/assets/imported/linefugg/ui/orbital-board.webp',
  'public/assets/imported/linefugg/props/orbital-armillary-key.webp',
  'public/assets/imported/linefugg/ui/orbital-cell-multiply-v3.webp',
  'public/assets/imported/linefugg/ui/orbital-cell-divide-v3.webp',
  'public/assets/imported/linefugg/ui/orbital-validate-ready-v5.webp',
  'public/assets/imported/linefugg/ui/orbital-validate-disabled-v5.webp',
  'public/assets/imported/linefugg/ui/orbital-history-row-v5.webp',
  'public/assets/generated/linefugg/ui/runtime/validate-amber-source.webp',
  'public/assets/generated/linefugg/ui/runtime/glass-indicators.webp',
  'public/assets/generated/linefugg/ui/runtime/accounting-panels.webp',
]
let total = 0
for (const file of assets) {
  const bytes = await fs.readFile(file)
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: RIFF`)
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: WEBP`)
  total += bytes.length
}
assert.equal(total, 4_573_098)
assert.ok(total < 4_600_000)
const scene = await fs.readFile('src/games/linefugg/LineFuggScene.ts', 'utf8')
assert.ok(!scene.includes('OrbitalImageFile'))
const start = scene.indexOf('const ASSETS = {')
const end = scene.indexOf('} as const', start)
assert.ok(start >= 0 && end > start)
const assetBlock = scene.slice(start, end)
assert.ok(!assetBlock.includes('.png'), 'active Phaser ASSETS must not reference PNG')
const shell = await fs.readFile('src/games/linefugg/LineFugg.tsx', 'utf8')
assert.match(shell, /orbital-environment\\.webp/)
console.log(JSON.stringify({ files: assets.length, bytes: total, megabytes: total / 1e6, mebibytes: total / 1024 / 1024 }, null, 2))
""")
