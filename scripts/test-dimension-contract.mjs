import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = (path) => readFileSync(resolve(root, path), 'utf8')

test('canonical portrait contract stays 390x850 with a 390x710 guaranteed window', () => {
  const runtime = read('src/core/runtime/gameRuntimePolicy.ts')
  assert.match(runtime, /MINIFUGG_MASTER_VIEWPORT = \{ width: 390, height: 850 \}/)
  assert.match(runtime, /MINIFUGG_REFERENCE_VIEWPORT = \{ width: 390, height: 710 \}/)
  assert.match(runtime, /MINIFUGG_LEGACY_PORTRAIT_VIEWPORT = \{ width: 390, height: 844 \}/)

  for (const path of [
    'docs/MINIFUGG_ZONES.md',
    'docs/GAME_LAYOUT_SYSTEM.md',
    'docs/ASSET_SIZE_REFERENCE.md',
    'docs/ORIENTATION_LAYOUT.md',
  ]) {
    const text = read(path)
    assert.match(text, /390\s*×\s*850/, `${path} must name the canonical MASTER`)
    assert.match(text, /390\s*×\s*710/, `${path} must name the guaranteed gameplay window`)
  }
})
