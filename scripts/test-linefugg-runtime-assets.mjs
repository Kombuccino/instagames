import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const assets = [
  'public/assets/generated/linefugg/solar-origami-v2/runtime/background/solar-origami-background-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/cells/cell-faces-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/results/result-crafts-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/results/sun-and-clusters-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/controls/control-buttons-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/glyphs/gameplay-glyphs-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/selection-nodes-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/selection-segments-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/arrival-particles-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/decor/debris-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/transfer-red-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/transfer-violet-atlas-v2.webp',
  'public/assets/generated/linefugg/solar-origami-v2/runtime/fx/transfer-yellow-atlas-v2.webp',
]
let total = 0
for (const file of assets) {
  const bytes = await fs.readFile(file)
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: RIFF`)
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: WEBP`)
  total += bytes.length
}
assert.ok(total < 4_600_000)
const scene = await fs.readFile('src/games/linefugg/LineFuggScene.ts', 'utf8')
assert.ok(!scene.includes('OrbitalImageFile'))
const start = scene.indexOf('const ASSETS = {')
const end = scene.indexOf('} as const', start)
assert.ok(start >= 0 && end > start)
const assetBlock = scene.slice(start, end)
assert.ok(!assetBlock.includes('.png'), 'active Phaser ASSETS must not reference PNG')
assert.ok(!assetBlock.toLowerCase().includes('orbital'), 'active Phaser ASSETS must not reference the superseded Orbital pack')
const shell = await fs.readFile('src/games/linefugg/LineFugg.tsx', 'utf8')
assert.match(shell, /solar-origami-background-v2\.webp/)
console.log(JSON.stringify({ files: assets.length, bytes: total, megabytes: total / 1e6, mebibytes: total / 1024 / 1024 }, null, 2))
