import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = (path) => readFileSync(resolve(root, path), 'utf8')

test('canonical portrait contract is 390x850 with a 390x710 guaranteed window', () => {
  const policy = read('src/core/runtime/gameRuntimePolicy.ts')
  assert.match(policy, /MINIFUGG_MASTER_VIEWPORT\s*=\s*\{\s*width:\s*390,\s*height:\s*850\s*\}/)
  assert.match(policy, /MINIFUGG_REFERENCE_VIEWPORT\s*=\s*\{\s*width:\s*390,\s*height:\s*710\s*\}/)
  assert.match(policy, /MINIFUGG_LEGACY_PORTRAIT_VIEWPORT\s*=\s*\{\s*width:\s*390,\s*height:\s*844\s*\}/)
  assert.equal((850 - 710) / 2, 70)
})

test('current 390x844 Phaser productions opt into the legacy viewport explicitly', () => {
  for (const file of [
    'src/games/linefugg/LineFugg.tsx',
    'src/games/calc-drop/TetraMindFck.tsx',
    'src/games/crazy-papers/CrazyPapers.tsx',
    'src/games/vlads-skewers/VladsSkewers.tsx',
  ]) {
    const source = read(file)
    assert.match(source, /MINIFUGG_LEGACY_PORTRAIT_VIEWPORT/, file)
    assert.doesNotMatch(source, /logicalViewport=\{DEFAULT_LOGICAL_VIEWPORTS\.portrait\}/, file)
  }
})

test('canonical layout surfaces expose the new dimensions', () => {
  assert.match(read('src/core/gameLayout.css'), /--minifugg-layout-reference-portrait:\s*390\s*\/\s*850/)
  assert.match(read('src/styles.css'), /aspect-ratio:\s*390\s*\/\s*710/)
  assert.match(read('docs/MINIFUGG_ZONES.md'), /390\s*×\s*850/)
  assert.match(read('docs/MINIFUGG_ZONES.md'), /390\s*×\s*710/)
})
