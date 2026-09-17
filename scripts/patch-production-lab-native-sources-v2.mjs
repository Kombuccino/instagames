import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const count = text.split(before).length - 1
  if (count !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${count}`)
  text = text.replace(before, after)
  writeFileSync(path, text)
}

function appendOnce(path, marker, block) {
  let text = readFileSync(path, 'utf8')
  if (text.includes(marker)) return
  writeFileSync(path, `${text.trimEnd()}\n\n${block.trim()}\n`)
}

const lab = 'src/core/ProductionLab.tsx'

replaceExact(lab,
  "  image?: string\n  imagePosition?: string\n  marker?: PlanMarker",
  "  image?: string\n  imagePosition?: string\n  imageWidth?: number\n  imageHeight?: number\n  marker?: PlanMarker"
)

replaceExact(lab,
  "const LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'",
  "const LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'\nconst LINEFUGG_REBIRTH_SOURCE_ROOT = '/assets/generated/linefugg/rebirth/sources'"
)

replaceExact(lab,
  "image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, preview: 'proto'",
  "image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/da-master-approved-390x850.png', preview: 'proto'"
)

let text = readFileSync(lab, 'utf8')
for (const id of ['D-style', 'D-lines', 'D-ledger', 'D-total', 'D-controls']) {
  const re = new RegExp(`(\\{ id: '${id}'[^\\n]*?source: [^,]+), image: [^,]+, imagePosition: '[^']+', marker:`)
  if (!re.test(text)) throw new Error(`Could not strip illustrative crop from ${id}`)
  text = text.replace(re, '$1, marker:')
}

const sourceNodes = `    { id: 'D-src-paper', ownerScreenId: 'D1', title: 'SOURCE · papier', kind: 'image', tags: ['IMAGE'], status: 'done', body: 'Texture papier réelle utilisée comme matière de base. Fichier source distinct, sans gameplay cuit.', facts: ['160×96 natif', 'texture répétable / extensible', 'fond et surfaces'], source: 'public/assets/generated/linefugg/rebirth/sources/paper-texture-source-160x96.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/paper-texture-source-160x96.png', imageWidth: 160, imageHeight: 96, x: 3070, y: 520, links: [nodeLink('D-src-paper-style', 'D-style', 'matière')] },
    { id: 'D-src-result-red', ownerScreenId: 'D1', title: 'SOURCE · plaque résultat rouge', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Plaque vide. Formule, signe égal et valeur restent moteur-owned.', facts: ['86×40 natif', 'aucun texte cuit'], source: 'public/assets/generated/linefugg/rebirth/sources/result-plate-red-86x40.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/result-plate-red-86x40.png', imageWidth: 86, imageHeight: 40, x: 3070, y: 760, links: [nodeLink('D-src-red-ledger', 'D-ledger', 'surface')] },
    { id: 'D-src-result-blue', ownerScreenId: 'D1', title: 'SOURCE · plaque résultat bleue', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Plaque vide pour la deuxième ligne.', facts: ['86×40 natif', 'aucun texte cuit'], source: 'public/assets/generated/linefugg/rebirth/sources/result-plate-blue-86x40.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/result-plate-blue-86x40.png', imageWidth: 86, imageHeight: 40, x: 3070, y: 930, links: [nodeLink('D-src-blue-ledger', 'D-ledger', 'surface')] },
    { id: 'D-src-result-green', ownerScreenId: 'D1', title: 'SOURCE · plaque résultat verte', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Plaque vide pour la troisième ligne.', facts: ['86×40 natif', 'aucun texte cuit'], source: 'public/assets/generated/linefugg/rebirth/sources/result-plate-green-86x40.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/result-plate-green-86x40.png', imageWidth: 86, imageHeight: 40, x: 3070, y: 1100, links: [nodeLink('D-src-green-ledger', 'D-ledger', 'surface')] },
    { id: 'D-src-total', ownerScreenId: 'D1', title: 'SOURCE · plaque total', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Surface vide du total final. Le chiffre est dessiné en live.', facts: ['140×62 natif', 'aucune valeur cuite'], source: 'public/assets/generated/linefugg/rebirth/sources/total-plate-140x62.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/total-plate-140x62.png', imageWidth: 140, imageHeight: 62, x: 3070, y: 1270, links: [nodeLink('D-src-total-layout', 'D-total', 'surface')] },
    { id: 'D-src-undo', ownerScreenId: 'D1', title: 'SOURCE · Undo', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Source isolée du contrôle Undo à l’échelle du stage. Les variantes pressé/désactivé restent à produire.', facts: ['118×118 natif', 'alpha réel', 'états manquants'], source: 'public/assets/generated/linefugg/rebirth/sources/control-undo-source-118.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/control-undo-source-118.png', imageWidth: 118, imageHeight: 118, x: 4010, y: 980, links: [nodeLink('D-src-undo-controls', 'D-controls', 'source contrôle')] },
    { id: 'D-src-validate', ownerScreenId: 'D1', title: 'SOURCE · Validate', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Source isolée du contrôle Validate à l’échelle du stage. Les variantes ready/pressed/disabled restent à produire.', facts: ['118×118 natif', 'alpha réel', 'états manquants'], source: 'public/assets/generated/linefugg/rebirth/sources/control-validate-source-118.png', image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/control-validate-source-118.png', imageWidth: 118, imageHeight: 118, x: 4250, y: 980, links: [nodeLink('D-src-validate-controls', 'D-controls', 'source contrôle')] },`

const anchor = "    { id: 'D-corrections', ownerScreenId: 'D1'"
if (!text.includes(anchor)) throw new Error('D-corrections anchor missing')
text = text.replace(anchor, `${sourceNodes}\n${anchor}`)
writeFileSync(lab, text)

replaceExact(lab,
  "  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {\n    const position = nodePosition(nodeId)\n    return position ? { x: position.x, y: position.y, w: NODE_WIDTH, h: NODE_HEIGHT } : null\n  }",
  "  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {\n    const position = nodePosition(nodeId)\n    if (!position) return null\n    const element = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>(`[data-node-id=\\\"${CSS.escape(nodeId)}\\\"]`)\n    return { x: position.x, y: position.y, w: element?.offsetWidth ?? NODE_WIDTH, h: element?.offsetHeight ?? NODE_HEIGHT }\n  }"
)

replaceExact(lab,
  "              className={`mfpl-node is-${node.kind} ${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}\n              data-status={node.status ?? 'done'}\n              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}",
  "              className={`mfpl-node is-${node.kind} ${node.image ? 'has-native-source' : ''} ${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}\n              data-status={node.status ?? 'done'}\n              style={{ left: position.x, top: position.y, ...(node.image ? {} : { width: NODE_WIDTH, minHeight: NODE_HEIGHT }) }}"
)

replaceExact(lab,
  "              {node.image && <img className=\"mfpl-node-thumb\" src={node.image} alt=\"\" style={{ objectPosition: node.imagePosition ?? 'center' }} />}",
  "              {node.image && <img className=\"mfpl-node-thumb\" src={node.image} alt=\"\" width={node.imageWidth} height={node.imageHeight} />}"
)

replaceExact(lab,
  "              style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }}",
  "              style={{ left: node.x, top: node.y, width: NODE_WIDTH, minHeight: NODE_HEIGHT }}"
)

appendOnce('src/core/ProductionLab.css', '/* Native production source nodes. */', `/* Native production source nodes. */
.mfpl-node{height:auto!important;overflow:visible}.mfpl-node p,.mfpl-node ul{max-height:none;overflow:visible}.mfpl-node.has-native-source{width:max-content;min-width:0;max-width:none;padding:10px}.mfpl-node.has-native-source header,.mfpl-node.has-native-source p,.mfpl-node.has-native-source ul,.mfpl-node.has-native-source .mfpl-node-tags{max-width:390px}.mfpl-node.has-native-source .mfpl-node-thumb{display:block;float:none;width:auto;height:auto;max-width:none;margin:8px 0 6px;object-fit:contain;border:1px solid rgba(23,25,29,.18);background:transparent}`)

console.log('Production Lab native source code pass applied.')
