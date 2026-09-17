import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/core/ProductionLab.tsx'
let text = readFileSync(path, 'utf8')
const before = 'linefugg-rebirth-editorial-paper-lab-390x850.webp'
const after = 'linefugg-rebirth-editorial-paper-lab-390x850-r2.webp'
const count = text.split(before).length - 1
if (count < 2) throw new Error(`Expected multiple DA image references, found ${count}`)
text = text.split(before).join(after)
writeFileSync(path, text)
console.log(`Updated ${count} LineFugg DA image references to cache-busted r2 asset.`)
