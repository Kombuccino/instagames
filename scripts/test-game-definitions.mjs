import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
}
function declaration(source, name) {
  return source.statements.filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(item => item.name.getText(source) === name)
}

test('Core registry only assembles explicit game-owned definitions', () => {
  const source = parse(resolve(root, 'src/core/gameRegistry.tsx'))
  const entries = declaration(source, 'gameRegistry')?.initializer
  assert.ok(entries && ts.isArrayLiteralExpression(entries))
  const imports = new Map()
  for (const item of source.statements.filter(ts.isImportDeclaration)) {
    if (item.importClause?.isTypeOnly) continue
    const specifier = item.moduleSpecifier.text
    assert.match(specifier, /^\.\.\/games\/[^/]+\/definition$/)
    const bindings = item.importClause.namedBindings
    assert.ok(ts.isNamedImports(bindings))
    for (const binding of bindings.elements) {
      assert.equal(binding.propertyName?.text ?? binding.name.text, 'gameDefinition')
      imports.set(binding.name.text, specifier)
    }
  }
  const ids = new Set()
  const used = new Set()
  for (const entry of entries.elements) {
    assert.ok(ts.isIdentifier(entry), 'Do not put a game object/spread in the central registry')
    assert.ok(!used.has(entry.text), 'Duplicate game import')
    used.add(entry.text)
    const specifier = imports.get(entry.text)
    assert.ok(specifier, 'Every entry must import a game definition')
    const file = resolve(root, 'src/core', `${specifier}.ts`)
    const def = declaration(parse(file), 'gameDefinition')?.initializer
    assert.ok(def && ts.isObjectLiteralExpression(def))
    const properties = new Map(def.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText(), p.initializer]))
    const id = properties.get('id')
    assert.ok(id && ts.isStringLiteral(id))
    assert.ok(!ids.has(id.text), `Duplicate id ${id.text}`)
    ids.add(id.text)
    assert.ok(properties.has('migration') && properties.has('logicalViewport'))
    const release = properties.get('release')
    if (release) {
      assert.ok(ts.isObjectLiteralExpression(release))
      const changelog = release.properties.find(p => p.name.getText() === 'changelogPath')?.initializer
      assert.ok(changelog && ts.isStringLiteral(changelog))
      const changelogFile = resolve(root, changelog.text)
      assert.equal(dirname(changelogFile), dirname(file), 'The release changelog belongs to its game folder')
      assert.ok(existsSync(changelogFile), `Missing ${changelog.text}`)
    }
  }
  assert.equal(used.size, imports.size, 'Unregistered game definition import')
  assert.ok(ids.size > 0)
})
