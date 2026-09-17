import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((file) =>
    /^(?:docs\/|src\/|\.agents\/|AGENTS\.md$|GAME_DEV_SPEC\.md$)/.test(file) &&
    /\.(?:md|tsx?|jsx?|css|json|mjs|yml|yaml)$/.test(file),
  )

const dimensionPair = /\b(?:360|390)\s*(?:×|x|X|:)\s*\d+(?:[.,]\d+)?\b/g
const keyNumber = /\b(?:704(?:[.,]17)?|844|850|710|662|650|656|712)\b/g
const contextWords = /master|viewport|logical|layout|gameplay|cover|screen|écran|stage|frame|cadre|zone|crop|safe|jouable|hauteur|height|width|dimension|format/i
const matches = []

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    const pairs = [...line.matchAll(dimensionPair)].map((m) => m[0])
    const nums = [...line.matchAll(keyNumber)].map((m) => m[0])
    const logicalViewport = /logicalViewport|referenceViewport|MASTER_|masterHeight|stageHeight|viewportHeight|coverHeight|SCREEN_HEIGHT/i.test(line)
    if (pairs.length || logicalViewport || (nums.length && contextWords.test(line))) {
      matches.push({ file, line: index + 1, text: line.trim(), pairs, nums })
    }
  })
}

let current = ''
for (const match of matches) {
  if (match.file !== current) {
    current = match.file
    console.log(`\n### ${current}`)
  }
  console.log(`${match.line}: ${match.text}`)
}

const oldTokens = matches.filter((m) => /(?:360\s*(?:×|x|X|:)\s*650|390\s*(?:×|x|X|:)\s*844|704(?:[.,]17)?|390\s*(?:×|x|X|:)\s*662)/.test(m.text))
console.log(`\nSUMMARY files=${new Set(matches.map((m) => m.file)).size} lines=${matches.length} old-token-lines=${oldTokens.length}`)
