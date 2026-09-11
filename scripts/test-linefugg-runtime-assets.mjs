import assert from 'node:assert/strict'
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
assert.match(shell, /orbital-environment\.webp/)
console.log(JSON.stringify({ files: assets.length, bytes: total, megabytes: total / 1e6, mebibytes: total / 1024 / 1024 }, null, 2))
