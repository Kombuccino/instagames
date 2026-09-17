import { readFileSync, writeFileSync } from 'node:fs'

const path = 'scripts/migrate-dimension-contract-v3.mjs'
let text = readFileSync(path, 'utf8')
const before = "'il représente exactement la fenêtre exploitable officielle 360 × 650', 'il représente exactement la zone de jeu garantie 390 × 710'"
const after = "'Il représente exactement la fenêtre exploitable officielle 360 × 650', 'Il représente exactement la zone de jeu garantie 390 × 710'"
if (text.includes(before)) {
  text = text.replace(before, after)
  writeFileSync(path, text)
} else if (!text.includes(after)) {
  throw new Error('Expected CoverCalibrationLab migration phrase was not found.')
}
