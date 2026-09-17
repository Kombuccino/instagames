import { readFileSync, writeFileSync } from 'node:fs'

const path = 'scripts/migrate-dimension-contract-v3.mjs'
let text = readFileSync(path, 'utf8')

function replaceScriptSnippet(before, after, label) {
  if (text.includes(before)) {
    text = text.replace(before, after)
    return
  }
  if (!text.includes(after)) throw new Error(`Expected migration snippet not found: ${label}`)
}

replaceScriptSnippet(
  "'il représente exactement la fenêtre exploitable officielle 360 × 650', 'il représente exactement la zone de jeu garantie 390 × 710'",
  "'Il représente exactement la fenêtre exploitable officielle 360 × 650', 'Il représente exactement la zone de jeu garantie 390 × 710'",
  'CoverCalibrationLab capitalization',
)

replaceScriptSnippet(
  "replaceExact('src/core/ProductionLab.css', 'width:390px;height:844px', 'width:390px;height:850px', 1)\nreplaceExact('src/core/ProductionLab.css', 'width:390px;height:844px;z-index:17', 'width:390px;height:850px;z-index:17', 1)",
  "replaceExact('src/core/ProductionLab.css', '.mfpl-screen-art{position:relative;width:390px;height:844px', '.mfpl-screen-art{position:relative;width:390px;height:850px')\nreplaceExact('src/core/ProductionLab.css', '.mfpl-annotation-draw{position:absolute;inset:0;width:390px;height:844px;z-index:17', '.mfpl-annotation-draw{position:absolute;inset:0;width:390px;height:850px;z-index:17')",
  'ProductionLab.css selector-specific heights',
)

writeFileSync(path, text)
