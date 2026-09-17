import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const count = text.split(before).length - 1
  if (count !== expected) throw new Error(`${path}: expected ${expected}, found ${count}`)
  writeFileSync(path, text.replace(before, after))
}

function appendOnce(path, marker, block) {
  let text = readFileSync(path, 'utf8')
  if (text.includes(marker)) return
  writeFileSync(path, `${text.trimEnd()}\n\n${block.trim()}\n`)
}

const labDoc = 'docs/PRODUCTION_LAB_V1.md'
replaceExact(labDoc,
  'Les nœuds canoniques peuvent aussi porter un **repère visuel** Point, Zone ou Dessin sur leur écran propriétaire. Le type de repère suit le sens : Point pour un détail ponctuel, Zone pour une surface ou un composant, Dessin pour un mouvement, une trajectoire ou un FX. Quand une référence DA existe, un nœud peut afficher une petite découpe visuelle de cette référence au lieu de rester purement textuel.',
  'Les nœuds canoniques peuvent aussi porter un **repère visuel** Point, Zone ou Dessin sur leur écran propriétaire. Le type de repère suit le sens : Point pour un détail ponctuel, Zone pour une surface ou un composant, Dessin pour un mouvement, une trajectoire ou un FX. Une DA validée conserve son screen global, mais ses nœuds IMAGE doivent pointer vers de **vrais fichiers sources séparés** dès qu’ils existent ; ils sont affichés à leur taille native et le cadre du nœud s’adapte au contenu. Un élément encore absent reste `todo`/`blocked`, sans crop décoratif du master.'
)
appendOnce(labDoc, '## Sources de production après validation DA', `## Sources de production après validation DA

Après validation d’une DA gameplay, le nuage DA devient le plan de production visible : le screen montre la composition d’ensemble, tandis que les nœuds autour portent les sources raster réelles, les surfaces moteur, états, animations/FX, sons et manques à produire. Une découpe contaminée par des valeurs, chemins ou textes dynamiques reste une référence et n’est pas promue en asset.

Les sources raster sont montrées à leur dimension native dans l’espace vectoriel ; le nœud n’impose ni miniature, ni recadrage, ni hauteur fixe. Les liens vers les nœuds s’ancrent sur les dimensions réellement rendues.`)

appendOnce('src/games/linefugg/ASSET_MANIFEST.md', '## Rebirth — sources de production séparées', `## Rebirth — sources de production séparées

Première décomposition réelle de la DA éditoriale validée. Ces fichiers sont visibles dans le Production Lab à leur taille native ; ils ne sont pas tous encore branchés au runtime public.

| Source | Taille | Ownership | Statut |
| --- | ---: | --- | --- |
| \`rebirth/sources/da-master-approved-390x850.png\` | 390×850 | référence globale, **REFERENCE ONLY** | validée |
| \`rebirth/sources/paper-texture-source-160x96.png\` | 160×96 | matière/environnement | source produite |
| \`rebirth/sources/result-plate-red-86x40.png\` | 86×40 | surface structurelle ; formule/résultat Phaser | source produite |
| \`rebirth/sources/result-plate-blue-86x40.png\` | 86×40 | surface structurelle ; formule/résultat Phaser | source produite |
| \`rebirth/sources/result-plate-green-86x40.png\` | 86×40 | surface structurelle ; formule/résultat Phaser | source produite |
| \`rebirth/sources/total-plate-140x62.png\` | 140×62 | surface structurelle ; total Phaser | source produite |
| \`rebirth/sources/control-undo-source-118.png\` | 118×118 | contrôle stateful, alpha | source idle ; états complémentaires à produire |
| \`rebirth/sources/control-validate-source-118.png\` | 118×118 | contrôle stateful, alpha | source idle ; états complémentaires à produire |

Les tracés, nombres/opérateurs, formules, total et contenu de grille restent engine-owned. États de cellule, variantes pressé/désactivé, reroll/FX et son restent explicitement ouverts dans le Lab.`)

appendOnce('src/games/linefugg/GAME_STATUS.md', '## Passe Lab — sources natives 17 septembre 2026', `## Passe Lab — sources natives 17 septembre 2026

Le Lab ne traite plus les crops du master DA comme assets. Une première vraie décomposition produit des sources séparées pour papier, plaques de résultats, total, Undo et Validate ; elles sont affichées à leur taille native dans des nœuds auto-dimensionnés. Le master 390×850 reste la vue d’ensemble. États de cellule, variantes des contrôles, reroll/FX et son restent visibles comme éléments à produire.`)

console.log('Native-source documentation synchronized.')
