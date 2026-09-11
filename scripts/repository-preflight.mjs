import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Agent-facing inspection only: never stage, commit, merge, reset or push.
// Fetch updates origin/main, but never changes the index or working files.
const args = process.argv.slice(2)
const publishing = args.includes('--publish')

function git(args, cwd, allowFailure = false) {
  const result = spawnSync('git', args, {
    cwd, encoding: 'utf8', timeout: 30_000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' },
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    if (allowFailure) return null
    throw new Error(`git ${args.join(' ')}: ${(result.stderr || result.stdout).trim()}`)
  }
  return result.stdout
}

const paths = output => output.split('\0').filter(Boolean)

try {
  if (args.some(arg => arg !== '--publish') || args.length > 1) {
    throw new Error('Usage: node scripts/repository-preflight.mjs [--publish]')
  }
  const root = git(['rev-parse', '--show-toplevel']).trim()
  const head = git(['rev-parse', '--verify', 'HEAD'], root).trim()
  const branch = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], root, true)?.trim() ?? null
  const operations = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']
    .filter(name => existsSync(resolve(root, git(['rev-parse', '--git-path', name], root).trim())))
  const status = git(['status', '--porcelain=v1', '--untracked-files=all'], root).trimEnd()
  const staged = paths(git(['diff', '--cached', '--name-only', '-z'], root))
  const working = paths(git(['diff', 'HEAD', '--name-only', '-z'], root))
  const untracked = paths(git(['ls-files', '--others', '--exclude-standard', '-z'], root))
  const unresolved = git(['ls-files', '--unmerged', '-z'], root).length > 0

  // Deliberately no force, prune, autostash, pull, or automatic conflict handling.
  git(['fetch', '--no-tags', 'origin', 'refs/heads/main:refs/remotes/origin/main'], root)
  const main = git(['rev-parse', '--verify', 'refs/remotes/origin/main'], root).trim()
  const base = git(['merge-base', head, main], root, true)?.trim()
  if (!base) throw new Error('No common ancestor with origin/main. Check shallow history before proceeding; do not force or reset.')
  const [behindMain, aheadOfMain] = git(['rev-list', '--left-right', '--count', `${main}...${head}`], root)
    .trim().split(/\s+/).map(Number)
  const incoming = paths(git(['diff', '--name-only', '-z', base, main], root))
  const local = new Set([
    ...paths(git(['diff', '--name-only', '-z', base, head], root)), ...working, ...untracked,
  ])
  const blockers = []
  if (!branch) blockers.push('Detached HEAD: use a named temporary branch before delivery.')
  if (operations.length || unresolved) blockers.push('A merge/rebase/cherry-pick/revert or unresolved conflict is still in progress.')
  if (status) blockers.push('Working tree/index is not clean: preserve and isolate unrelated work before integration/delivery.')
  if (behindMain) blockers.push('origin/main contains changes not integrated into HEAD: save scoped work, integrate, and retest.')

  console.log(JSON.stringify({
    mode: publishing ? 'publish-check' : 'inspect', root, branch, head, main, base,
    aheadOfMain, behindMain, status, staged, untracked, operations,
    incomingFiles: incoming,
    overlappingFiles: incoming.filter(file => local.has(file)),
    readyForMainIntegration: blockers.length === 0,
    blockers,
    note: 'Inspection is not a lock or a test certificate. Review scoped changes and run tests on the combined state. A normal push may still reject a concurrent update; never force it.',
  }, null, 2))
  if (publishing && blockers.length) process.exitCode = 1
} catch (error) {
  console.error(`Repository check failed: ${error.message}`)
  process.exitCode = 1
}
