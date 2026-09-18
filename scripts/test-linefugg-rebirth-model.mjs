import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import ts from 'typescript'

const file = await fs.readFile('src/games/linefugg-rebirth/model.ts', 'utf8')
const output = ts.transpileModule(file, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { RebirthModel, cell, evaluate, formula, cellsBetween, snapEnd, indexOf } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)
const a = { row: 0, col: 0 }, b = { row: 0, col: 4 }
test('left-to-right arithmetic and prefixes, including decimal division', () => {
  const values = [cell('add', 8), cell('multiply', 2), cell('add', 4), cell('divide', 2)]
  assert.equal(evaluate(values), 10); assert.equal(formula(values), '8×2+4÷2')
  assert.equal(evaluate([cell('add', 3), cell('divide', 2), cell('add', 7), cell('multiply', 3)]), 25.5)
  assert.throws(() => cell('divide', 0)); assert.throws(() => cell('add', -1))
})
test('only straight two-to-five-cell routes, eight directions', () => {
  assert.equal(cellsBetween(a, b).length, 5)
  assert.deepEqual(cellsBetween(a, a), [])
  assert.deepEqual(cellsBetween(a, { row: 2, col: 3 }), [])
  assert.deepEqual(cellsBetween(a, { row: 0, col: 5 }), [])
  assert.equal(cellsBetween({ row: 5, col: 5 }, { row: 1, col: 1 }).length, 5)
  assert.equal(snapEnd(a, 0.1, 0.1), null)
  assert.deepEqual(snapEnd(a, 2.9, 3.1), { row: 3, col: 3 })
})
test('initial board, reroll and undo are repeatable', () => {
  for (let seed = 0; seed < 80; seed++) {
    const x = new RebirthModel('2026-09-18', seed), y = new RebirthModel('2026-09-18', seed)
    const before = structuredClone(x.board)
    assert.deepEqual(x.board, y.board)
    x.play(a, b); y.play(a, b)
    assert.deepEqual(x.board, y.board)
    assert.deepEqual(x.lines[0].values, before.slice(0, 5))
    for (const p of x.lines[0].cells) assert.deepEqual(x.board[indexOf(p)], before[indexOf(p)])
    const after = structuredClone(x.board)
    assert(x.undo()); assert.deepEqual(x.board, before); assert.equal(x.total, 0)
    x.play(a, b); assert.deepEqual(x.board, after)
  }
})
test('one intersection allowed, two or more forbidden', () => {
  const x = new RebirthModel('2026-09-18', 1)
  assert(x.play(a, b))
  assert.equal(x.play(a, b), null)
  assert(x.play(a, { row: 4, col: 0 }))
  const before = structuredClone(x.board)
  assert.equal(x.play({ row: 1, col: 0 }, { row: 4, col: 0 }), null)
  assert.deepEqual(x.board, before)
})
test('third line does not finish, undo restores, finish is one-shot', () => {
  const x = new RebirthModel('2026-09-18', 1)
  assert.equal(x.finish(), null)
  x.play(a, b); x.play({ row: 2, col: 0 }, { row: 2, col: 4 })
  const before = structuredClone(x.board), total = x.total
  x.play({ row: 4, col: 0 }, { row: 4, col: 4 })
  assert.equal(x.finished, false); assert.equal(x.canValidate, true)
  assert(x.undo()); assert.deepEqual(x.board, before); assert.equal(x.total, total)
  x.play({ row: 4, col: 0 }, { row: 4, col: 4 })
  assert.equal(x.finish(), x.total); assert.equal(x.finish(), null)
  assert.equal(x.undo(), false); assert.equal(x.play(a, b), null)
})
test('Rebirth cannot generate a glyph outside T02 numeric scope', () => {
  const kinds = new Set()
  for (let seed = 0; seed < 100; seed++) for (const v of new RebirthModel('2026-09-18', seed).board) {
    assert.match(v.label, /^[×÷]?[0-9]+$/); kinds.add(v.kind)
  }
  assert.deepEqual([...kinds].sort(), ['add','divide','multiply'])
})
test('all original LineFugg files remain byte-identical', async () => {
  const expected = {
    'LineFugg.tsx':'faf8464c3ff806e458e91fb8d340a4305dae4ccc',
    'LineFuggScene.ts':'b14de2afdea7a9472e5dfb843e6d4096d896f648',
    'definition.ts':'2a16d8c4e9f14529e025b12331e0b7c03d56356c',
    'welcome.ts':'7f3081d71bc73a58ca63ab898f6dc9001367bcb0',
    'orbitalArt.ts':'1a57c1830e9916172a6d0863fcac0cd012bc436e',
  }
  for (const [name, sha] of Object.entries(expected)) {
    const bytes = await fs.readFile(`src/games/linefugg/${name}`)
    assert.equal(crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'), sha, name)
  }
})
