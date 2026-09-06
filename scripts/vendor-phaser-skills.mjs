import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PHASER_VERSION = 'v4.2.1'
const PHASER_COMMIT = '41be1e462bc600064e498cba370bfa8c5c055a22'
const SOURCE_REPO = 'phaserjs/phaser'
const SOURCE_ROOT = 'skills'
const OUTPUT_ROOT = path.resolve('vendor/phaser-skills/4.2.1')
const API_ROOT = `https://api.github.com/repos/${SOURCE_REPO}/contents`

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'MiniFugg-Phaser-Skills-Vendor',
  'X-GitHub-Api-Version': '2022-11-28',
}

if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function fetchJson(url) {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.text()
}

async function copyDirectory(sourcePath, destinationPath) {
  const entries = await fetchJson(`${API_ROOT}/${sourcePath}?ref=${PHASER_VERSION}`)
  if (!Array.isArray(entries)) throw new Error(`Expected directory listing for ${sourcePath}`)

  await mkdir(destinationPath, { recursive: true })

  for (const entry of entries) {
    const destination = path.join(destinationPath, entry.name)
    if (entry.type === 'dir') {
      await copyDirectory(entry.path, destination)
      continue
    }
    if (entry.type !== 'file' || !entry.download_url) continue
    const content = await fetchText(entry.download_url)
    await writeFile(destination, content, 'utf8')
    process.stdout.write(`vendored ${entry.path}\n`)
  }
}

async function assertPackageVersion() {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
  const installed = packageJson.dependencies?.phaser ?? packageJson.devDependencies?.phaser
  if (!installed || !String(installed).includes('4.2.1')) {
    throw new Error(`MiniFugg expects Phaser 4.2.1 for this vendor snapshot; package.json currently declares ${installed ?? 'no Phaser dependency'}. Update this script only together with the Phaser runtime.`)
  }
}

async function main() {
  await assertPackageVersion()
  await rm(OUTPUT_ROOT, { recursive: true, force: true })
  await mkdir(OUTPUT_ROOT, { recursive: true })

  await copyDirectory(SOURCE_ROOT, OUTPUT_ROOT)

  const license = await fetchText(`https://raw.githubusercontent.com/${SOURCE_REPO}/${PHASER_VERSION}/LICENSE.md`)
  await writeFile(path.join(OUTPUT_ROOT, 'LICENSE.md'), license, 'utf8')

  const source = {
    package: 'phaser',
    sourceRepository: `https://github.com/${SOURCE_REPO}`,
    sourceTag: PHASER_VERSION,
    sourceCommit: PHASER_COMMIT,
    runtimeVersion: '4.2.1',
    license: 'MIT',
    generatedBy: 'scripts/vendor-phaser-skills.mjs',
    note: 'Vendored upstream AI-agent skills. MiniFugg project rules remain authoritative over generic Phaser guidance.',
  }
  await writeFile(path.join(OUTPUT_ROOT, 'SOURCE.json'), `${JSON.stringify(source, null, 2)}\n`, 'utf8')

  process.stdout.write(`\nPhaser ${PHASER_VERSION} skills vendored to ${path.relative(process.cwd(), OUTPUT_ROOT)}\n`)
  process.stdout.write('Review the diff, then commit the generated vendor directory.\n')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
