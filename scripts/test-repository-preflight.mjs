import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('./repository-preflight.mjs', import.meta.url))
const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0' }
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'mf-repo-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const origin = join(root, 'origin.git')
  const local = join(root, 'codex')
  const other = join(root, 'chatgpt')
  git(root, 'init', '--bare', '--initial-branch=main', origin)
  git(root, 'clone', origin, local)
  const identity = dir => {
    git(dir, 'config', 'user.name', 'Repository Test')
    git(dir, 'config', 'user.email', 'test@example.invalid')
    git(dir, 'config', 'commit.gpgsign', 'false')
  }
  identity(local)
  writeFileSync(join(local, 'game.txt'), 'base\n')
  git(local, 'add', '--', 'game.txt')
  git(local, 'commit', '-m', 'base')
  git(local, 'push', 'origin', 'main')
  git(root, 'clone', origin, other)
  identity(other)
  return { root, local, other }
}
function commit(dir, file, text) {
  writeFileSync(join(dir, file), text)
  git(dir, 'add', '--', file)
  git(dir, 'commit', '-m', `change ${file}`)
}
function check(dir, publish = true) {
  const result = spawnSync(process.execPath, [script, ...(publish ? ['--publish'] : [])], { cwd: dir, env, encoding: 'utf8' })
  return { ...result, report: result.stdout.trim() ? JSON.parse(result.stdout) : null }
}
function localSnapshot(dir) {
  return [git(dir, 'rev-parse', 'HEAD'), git(dir, 'status', '--porcelain=v1'), git(dir, 'diff'), git(dir, 'diff', '--cached')]
}

test('clean synchronized checkout passes without touching HEAD or index', t => {
  const { local } = fixture(t)
  const before = localSnapshot(local)
  const result = check(local)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.report.readyForMainIntegration, true)
  assert.deepEqual(localSnapshot(local), before)
})

test('inspection identifies dirty/staged/untracked work; publish refuses, without losing it', t => {
  const { local } = fixture(t)
  writeFileSync(join(local, 'game.txt'), 'own edits\n')
  git(local, 'add', '--', 'game.txt')
  writeFileSync(join(local, 'foreign.txt'), 'another session\n')
  const before = localSnapshot(local)
  const inspection = check(local, false)
  assert.equal(inspection.status, 0)
  assert.deepEqual(inspection.report.staged, ['game.txt'])
  assert.deepEqual(inspection.report.untracked, ['foreign.txt'])
  assert.equal(check(local).status, 1)
  assert.deepEqual(localSnapshot(local), before)
  assert.equal(readFileSync(join(local, 'foreign.txt'), 'utf8'), 'another session\n')
})

test('unpublished committed work ahead of main passes', t => {
  const { local } = fixture(t)
  commit(local, 'game.txt', 'own committed changes\n')
  const result = check(local)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.report.aheadOfMain, 1)
  assert.equal(result.report.behindMain, 0)
})

test('concurrent disjoint commit blocks delivery until explicitly merged', t => {
  const { local, other } = fixture(t)
  commit(local, 'game.txt', 'local game change\n')
  commit(other, 'core.txt', 'remote core change\n')
  git(other, 'push', 'origin', 'main')
  const before = localSnapshot(local)
  const result = check(local)
  assert.equal(result.status, 1)
  assert.equal(result.report.behindMain, 1)
  assert.deepEqual(result.report.incomingFiles, ['core.txt'])
  assert.deepEqual(result.report.overlappingFiles, [])
  assert.deepEqual(localSnapshot(local), before)
  git(local, 'merge', '--no-edit', 'origin/main')
  assert.equal(check(local).status, 0)
  assert.equal(readFileSync(join(local, 'core.txt'), 'utf8'), 'remote core change\n')
  assert.equal(readFileSync(join(local, 'game.txt'), 'utf8'), 'local game change\n')
})

test('same-file concurrent changes are reported, never resolved automatically', t => {
  const { local, other } = fixture(t)
  commit(local, 'game.txt', 'local\n')
  commit(other, 'game.txt', 'remote\n')
  git(other, 'push', 'origin', 'main')
  const before = localSnapshot(local)
  const result = check(local)
  assert.equal(result.status, 1)
  assert.deepEqual(result.report.overlappingFiles, ['game.txt'])
  assert.deepEqual(localSnapshot(local), before)
  assert.throws(() => git(local, 'merge', '--no-edit', 'origin/main'))
  const conflicted = localSnapshot(local)
  const conflictCheck = check(local)
  assert.equal(conflictCheck.status, 1)
  assert.ok(conflictCheck.report.operations.includes('MERGE_HEAD'))
  assert.deepEqual(localSnapshot(local), conflicted)
})

test('detached HEAD blocks publication', t => {
  const { local } = fixture(t)
  git(local, 'checkout', '--detach', 'HEAD')
  const result = check(local)
  assert.equal(result.status, 1)
  assert.equal(result.report.branch, null)
})

test('a temporary branch is allowed once it integrates main', t => {
  const { local } = fixture(t)
  git(local, 'checkout', '-b', 'core/test')
  commit(local, 'core.txt', 'isolated change\n')
  assert.equal(check(local).status, 0)
})

test('fetch failure blocks checks instead of trusting stale origin/main', t => {
  const { local, root } = fixture(t)
  git(local, 'remote', 'set-url', 'origin', join(root, 'missing.git'))
  const before = localSnapshot(local)
  const result = check(local)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Repository check failed/)
  assert.deepEqual(localSnapshot(local), before)
})

test('unknown flags cannot silently weaken publication checks', t => {
  const { local } = fixture(t)
  const result = spawnSync(process.execPath, [script, '--force'], { cwd: local, env, encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Usage:/)
})
