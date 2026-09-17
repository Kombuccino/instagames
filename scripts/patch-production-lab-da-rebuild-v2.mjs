import { readFileSync, writeFileSync } from 'node:fs'

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1
  if (count !== 1) throw new Error(`${label}: expected 1 occurrence, found ${count}`)
  return text.replace(before, after)
}

function replaceLine(text, id, line) {
  const lines = text.split('\n')
  const index = lines.findIndex((item) => item.includes(`{ id: '${id}'`))
  if (index < 0) throw new Error(`Missing node line ${id}`)
  lines[index] = line
  return lines.join('\n')
}

const labPath = 'src/core/ProductionLab.tsx'
let lab = readFileSync(labPath, 'utf8')

lab = replaceOnce(lab, 'const WORLD_WIDTH = 6900', 'const WORLD_WIDTH = 10200', 'world width')
lab = replaceOnce(lab,
`const ZONES: Array<{ id: StateId; x: number; width: number; subtitle: string }> = [
  { id: 'covers', x: 0, width: 1150, subtitle: 'ensemble éditorial séparé' },
  { id: 'proto', x: 1150, width: 1900, subtitle: 'référence fonctionnelle à comprendre' },
  { id: 'da', x: 3050, width: 1850, subtitle: 'à créer depuis le proto' },
  { id: 'release', x: 4900, width: 2000, subtitle: 'après intégration réelle' },
]
const SCREEN_X: Record<StateId, number> = { covers: 220, proto: 1650, da: 3450, release: 5350 }`,
`const ZONES: Array<{ id: StateId; x: number; width: number; subtitle: string }> = [
  { id: 'covers', x: 0, width: 1150, subtitle: 'ensemble éditorial séparé' },
  { id: 'proto', x: 1150, width: 1900, subtitle: 'référence fonctionnelle à comprendre' },
  { id: 'da', x: 3050, width: 4750, subtitle: 'inventaire visuel + production' },
  { id: 'release', x: 7800, width: 2400, subtitle: 'après intégration réelle' },
]
const SCREEN_X: Record<StateId, number> = { covers: 220, proto: 1650, da: 4450, release: 8300 }`, 'zones')
lab = lab.replace("const LINEFUGG_REBIRTH_SOURCE_ROOT = '/assets/generated/linefugg/rebirth/sources'\n", '')
lab = replaceOnce(lab,
"      source: 'ChatGPT image generation · 17 septembre 2026', x: SCREEN_X.da, y: 420, image: LINEFUGG_REBIRTH_SOURCE_ROOT + '/da-master-approved-390x850.png', preview: 'proto', anchor: 'center',",
"      source: 'DA validée · référence globale uniquement', x: SCREEN_X.da, y: 520, image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, preview: 'proto', anchor: 'center',", 'DA screen source')

lab = replaceLine(lab, 'P-board', "    { id: 'P-board', ownerScreenId: 'P1', title: 'Plateau quotidien', kind: 'text', tags: ['GD'], status: 'done', body: 'La grille initiale est déterministe pour le jour courant.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 760, links: [screenLink('P-board-grid', 'P1', 195, 335, 'grille'), nodeLink('P-board-da', 'D-grid-layout', 'traduction DA')] },")
lab = replaceLine(lab, 'P-gesture', "    { id: 'P-gesture', ownerScreenId: 'P2', title: 'Geste', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Départ sur une case puis glissé vers une autre, aimanté sur une ligne droite de 2 à 5 cases.', facts: ['Horizontal / vertical / diagonal', 'Direction significative'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 1730, links: [screenLink('P-gesture-line', 'P2', 195, 430, 'tracé'), nodeLink('P-gesture-order', 'P-order', 'détermine'), nodeLink('P-gesture-da', 'D-line-system', 'traduction DA')] },")
lab = replaceLine(lab, 'P-order', "    { id: 'P-order', ownerScreenId: 'P2', title: 'Ordre du calcul', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score est évalué dans l’ordre traversé ; × et ÷ agissent sur le cumul déjà construit.', facts: ['Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1740, links: [screenLink('P-order-preview', 'P2', 195, 500, 'résultat courant'), nodeLink('P-order-da', 'D-type-system', 'traduction DA')] },")
lab = replaceLine(lab, 'P-reroll', "    { id: 'P-reroll', ownerScreenId: 'P3', title: 'Retirage déterministe', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Les cases jouées restent stables ; les autres sont recalculées à partir de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Cases engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 2970, links: [screenLink('P-reroll-board', 'P3', 195, 365, 'nouveau plateau'), nodeLink('P-reroll-da', 'D-reroll-storyboard', 'traduction DA')] },")
lab = replaceLine(lab, 'P-ripple', "    { id: 'P-ripple', ownerScreenId: 'P3', title: 'Flip en cascade', kind: 'animation', tags: ['ANIMATION', 'FX'], status: 'done', body: 'Le renouvellement apparaît comme une onde courte depuis la fin de ligne.', facts: ['Fold → changement caché → unfold'], source: 'rerollUnplayedCells()', x: 2140, y: 3000, links: [screenLink('P-ripple-board', 'P3', 250, 430), nodeLink('P-ripple-da', 'D-reroll-storyboard', 'traduction DA')] },")
lab = replaceLine(lab, 'P-undo', "    { id: 'P-undo', ownerScreenId: 'P4', title: 'Undo = restauration', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Annuler retire la dernière ligne et restaure le plateau antérieur.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré'], source: 'PlayedLine / undo()', x: 2140, y: 4200, links: [screenLink('P-undo-control', 'P4', 65, 775, 'Undo'), nodeLink('P-undo-da', 'D-undo-states', 'traduction DA')] },")
lab = replaceLine(lab, 'P-validate', "    { id: 'P-validate', ownerScreenId: 'P4', title: 'Trois lignes puis choix', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'La troisième ligne ne termine pas la partie. Le joueur choisit quand valider.', facts: ['Pas de résolution automatique', 'Validate actif à 3 lignes'], source: 'validateEnabled() / validateRun()', x: 1190, y: 4200, links: [screenLink('P-validate-control', 'P4', 325, 775, 'Validate'), nodeLink('P-validate-total', 'P-total', 'valide'), nodeLink('P-validate-da', 'D-validate-states', 'traduction DA')] },")
lab = replaceLine(lab, 'P-total', "    { id: 'P-total', ownerScreenId: 'P4', title: 'Total final', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale'], source: 'totalScore() / session.finish()', x: 2140, y: 4510, links: [screenLink('P-total-value', 'P4', 195, 650, 'total'), nodeLink('P-total-da', 'D-score-layout', 'traduction DA')] },")

const start = lab.indexOf("    { id: 'D-style'")
const end = lab.indexOf("  ]\n\n  return {", start)
if (start < 0 || end < 0) throw new Error('DA block markers not found')
const daNodes = `    { id: 'D-grid-layout', ownerScreenId: 'D1', title: 'Grille 7×7 · géométrie', kind: 'text', tags: ['GD', 'UI', 'NOTE'], status: 'review', body: 'Élément structurel principal. On fixe d’abord sa géométrie et ses marges avant de fabriquer une texture.', facts: ['7×7', 'alignement strict', 'zone dominante du screen', 'mesures exactes à relever sur le master'], source: 'DA validée + proto', marker: { type: 'rect', x: 18, y: 92, w: 354, h: 374 }, x: 3180, y: 420, links: [] },
    { id: 'D-grid-source', ownerScreenId: 'D1', title: 'À produire · source grille', kind: 'image', tags: ['IMAGE', 'UI'], status: 'todo', body: 'Vraie source propre de la grille/cadre, sans chiffres, opérateurs, lignes ni états cuits.', facts: ['alpha si utile', 'aucun contenu mutable', 'taille native de destination à définir après mesure'], source: 'à produire depuis le master approuvé / recréation propre', x: 3180, y: 760, links: [nodeLink('D-grid-source-layout', 'D-grid-layout', 'matérialise')] },
    { id: 'D-cell-face', ownerScreenId: 'D1', title: 'À produire · cellule de base', kind: 'image', tags: ['IMAGE', 'UI'], status: 'todo', body: 'Surface de cellule réutilisable. Les valeurs et opérateurs restent moteur-owned.', facts: ['état repos', 'géométrie commune', 'aucun chiffre cuit'], source: 'à produire', marker: { type: 'rect', x: 22, y: 101, w: 48, h: 48 }, x: 3180, y: 1100, links: [] },
    { id: 'D-type-system', ownerScreenId: 'D1', title: 'Chiffres + opérateurs · spécimen', kind: 'text', tags: ['GD', 'UI', 'NOTE'], status: 'review', body: 'Les chiffres sont indispensables même s’ils ne deviennent pas des PNG. Le Lab doit figer leur langage visuel avant intégration.', facts: ['0–9', '+ − × ÷', 'positif / négatif', 'taille / graisse / couleur / centrage', 'lisibilité à taille téléphone'], source: 'engine-owned · à spécifier visuellement', marker: { type: 'point', x: 98, y: 139 }, x: 3180, y: 1460, links: [] },
    { id: 'D-line-system', ownerScreenId: 'D1', title: 'Système des trois lignes', kind: 'animation', tags: ['GD', 'UI', 'ANIMATION', 'FX'], status: 'review', body: 'Une famille cohérente pour preview, ligne engagée, flèche de direction et intersection.', facts: ['rouge / bleu / vert', 'départ→arrivée visible', 'preview vs committed', 'intersection lisible', 'ne masque jamais les valeurs'], source: 'engine-owned + éventuels supports FX', marker: { type: 'draw', x: 0, y: 0, points: [{ x: 91, y: 394 }, { x: 257, y: 158 }] }, x: 3180, y: 1820, links: [] },
    { id: 'D-cell-states', ownerScreenId: 'D1', title: 'Matrice · états de cellule', kind: 'animation', tags: ['IMAGE', 'UI', 'ANIMATION', 'FX'], status: 'todo', body: 'À valider comme une petite planche d’états avant tout export final.', facts: ['repos', 'opérateur', 'jouée / protégée', 'prochaine dimension', 'intersection', 'fold', 'unfold'], source: 'à produire / storyboarder', x: 3700, y: 2360, links: [nodeLink('D-cell-states-base', 'D-cell-face', 'variantes')] },
    { id: 'D-results-layout', ownerScreenId: 'D1', title: 'Registre · 3 calculs', kind: 'text', tags: ['GD', 'UI', 'NOTE'], status: 'review', body: 'Trois rangées compactes. Les formules et résultats sont live ; seule la surface visuelle peut devenir un asset.', facts: ['3 identités couleur', 'formule complète lisible', 'résultat aligné', 'aucun faux texte'], source: 'engine-owned sur surface à produire', marker: { type: 'rect', x: 20, y: 492, w: 350, h: 139 }, x: 5000, y: 420, links: [] },
    { id: 'D-results-source', ownerScreenId: 'D1', title: 'À produire · surface registre', kind: 'image', tags: ['IMAGE', 'UI'], status: 'todo', body: 'Surface propre et vide du registre. Pas de formule ni valeur dans le fichier.', facts: ['réutilisable 3 fois ou famille partagée', 'couleurs cohérentes avec les lignes'], source: 'à produire', x: 5480, y: 760, links: [nodeLink('D-results-source-layout', 'D-results-layout', 'matérialise')] },
    { id: 'D-score-layout', ownerScreenId: 'D1', title: 'Total · hiérarchie', kind: 'text', tags: ['GD', 'UI', 'NOTE'], status: 'review', body: 'Le total sépare le registre des contrôles sans voler la priorité à la grille.', facts: ['valeur moteur-owned', 'grande mais secondaire à la grille', 'position fixe'], source: 'DA validée + règles', marker: { type: 'rect', x: 188, y: 633, w: 179, h: 72 }, x: 5000, y: 1100, links: [] },
    { id: 'D-undo-states', ownerScreenId: 'D1', title: 'Undo · matrice d’états', kind: 'animation', tags: ['IMAGE', 'UI', 'ANIMATION', 'FX'], status: 'todo', body: 'Un seul dessin n’est pas suffisant. On valide la famille d’états avant l’asset final.', facts: ['disabled', 'idle', 'pressed', 'retour idle', 'feedback tactile court'], source: 'à produire', marker: { type: 'rect', x: 43, y: 710, w: 128, h: 128 }, x: 5000, y: 1460, links: [] },
    { id: 'D-validate-states', ownerScreenId: 'D1', title: 'Validate · matrice d’états', kind: 'animation', tags: ['IMAGE', 'UI', 'ANIMATION', 'FX'], status: 'todo', body: 'Le bouton doit exprimer clairement disponibilité et validation sans changer de langage matériel.', facts: ['disabled', 'ready', 'pressed', 'validation', 'success / retour'], source: 'à produire', marker: { type: 'rect', x: 219, y: 710, w: 128, h: 128 }, x: 5480, y: 1460, links: [] },
    { id: 'D-reroll-storyboard', ownerScreenId: 'D1', title: 'Reroll · storyboard papier', kind: 'animation', tags: ['ANIMATION', 'FX', 'SON'], status: 'todo', body: 'Le changement du plateau doit être conçu comme une séquence, pas comme un simple effet ajouté après coup.', facts: ['repos', 'fold / retrait', 'changement caché', 'unfold / pose', 'onde courte', 'reduced motion'], source: 'à storyboarder', x: 5000, y: 1900, links: [] },
    { id: 'D-invalid-feedback', ownerScreenId: 'D1', title: 'Action invalide · feedback', kind: 'animation', tags: ['GD', 'ANIMATION', 'FX', 'SON'], status: 'todo', body: 'État absent de la maquette mais nécessaire au jeu réel.', facts: ['trait trop court / trop long', 'croisement invalide', 'retour rapide sans ambiguïté'], source: 'à concevoir', x: 5480, y: 1900, links: [] },
    { id: 'D-sound-events', ownerScreenId: 'D1', title: 'Carte sonore', kind: 'audio', tags: ['SON', 'FX'], status: 'todo', body: 'Les sons sont reliés aux événements du jeu, pas aux assets graphiques.', facts: ['début du trait', 'passage de case', 'ligne acceptée', 'reroll', 'Undo', 'Validate', 'total / fin'], source: 'AUDIO_SYSTEM.md · à définir', x: 6200, y: 760, links: [] },
    { id: 'D-production-gate', ownerScreenId: 'D1', title: 'Gate · avant production', kind: 'text', tags: ['NOTE', 'GD'], status: 'blocked', body: 'Aucun nouvel asset final ne doit être fabriqué tant que cet inventaire, les états et les ownerships ne sont pas jugés complets.', facts: ['chaque élément important visible possède un nœud', 'chaque composant interactif possède sa matrice d’états', 'chaque mouvement notable possède un storyboard', 'chaque élément sait s’il est IMAGE / moteur / FX / SON'], source: 'nouveau process DA → production · 18/09/2026', x: 6200, y: 1320, links: [] },
`
lab = lab.slice(0, start) + daNodes + lab.slice(end)
lab = replaceOnce(lab,
"    summary: 'Rebirth repart du vrai LineFugg classique. Le Proto reste la vérité fonctionnelle ; la première DA Rebirth est validée et découpée dans le Lab. Release reste vide tant qu’aucune mini-tranche intégrée n’existe.',",
"    summary: 'Rebirth repart du vrai LineFugg classique. Le Proto reste la vérité fonctionnelle ; la DA validée est maintenant traitée comme un inventaire visuel complet avant toute production d’assets. Release reste vide tant que cette planche n’est pas validée.',", 'summary')

const insertAfter = "  const selectedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.ownerScreenId === selectedScreen.id) : []\n"
const zoneCode = `\n  const displayZones = useMemo(() => ZONES.map((zone) => {\n    let right = zone.x + zone.width\n    const pad = 260\n    for (const screen of project.screens) {\n      if (screen.state === zone.id) right = Math.max(right, screen.x + MASTER_WIDTH + pad)\n    }\n    for (const node of project.nodes) {\n      const ownerState = node.ownerScreenId ? screensById.get(node.ownerScreenId)?.state : undefined\n      const inferredState = ownerState ?? ZONES.find((candidate) => node.x >= candidate.x && node.x < candidate.x + candidate.width)?.id\n      if (inferredState !== zone.id) continue\n      const x = review.nodePositionOverrides[node.id]?.x ?? node.x\n      const width = Math.max(NODE_WIDTH, (node.imageWidth ?? 0) + 24)\n      right = Math.max(right, x + width + pad)\n    }\n    for (const node of review.reviewNodes) {\n      const ownerState = node.ownerScreenId ? screensById.get(node.ownerScreenId)?.state : undefined\n      const inferredState = ownerState ?? ZONES.find((candidate) => node.x >= candidate.x && node.x < candidate.x + candidate.width)?.id\n      if (inferredState === zone.id) right = Math.max(right, node.x + NODE_WIDTH + pad)\n    }\n    return { ...zone, width: right - zone.x }\n  }), [project, review.nodePositionOverrides, review.reviewNodes, screensById])\n  const worldWidth = Math.max(WORLD_WIDTH, ...displayZones.map((zone) => zone.x + zone.width + 240))\n`
lab = replaceOnce(lab, insertAfter, insertAfter + zoneCode, 'dynamic zones')
lab = lab.replace('style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT,', 'style={{ width: worldWidth, height: WORLD_HEIGHT,')
lab = lab.replace('{ZONES.map((zone) => <div key={zone.id}', '{displayZones.map((zone) => <div key={zone.id}')
lab = lab.replaceAll('width={WORLD_WIDTH}', 'width={worldWidth}')
writeFileSync(labPath, lab)

const prodPath = 'docs/PRODUCTION_LAB_V1.md'
let prod = readFileSync(prodPath, 'utf8')
const prodAnchor = '## Sources de production après validation DA\n\n'
const prodText = `## Sources de production après validation DA\n\nAprès validation d’une DA gameplay, le premier livrable du nuage DA est un **inventaire visuel exhaustif**, pas une série de crops. Chaque élément important visible dans la DA doit posséder un nœud, même lorsqu’il est moteur-owned et ne produira jamais de fichier : grille, cellules, chiffres/opérateurs, tracés, calculs, total, contrôles, états, mouvements, FX et sons.\n\nAvant tout asset final, les composants interactifs reçoivent leur matrice d’états et les mouvements notables leur storyboard. Les nœuds IMAGE restent \`todo\` tant qu’un vrai fichier propre n’existe pas ; une découpe de maquette ou une source dégradée ne sert pas à remplir artificiellement le Lab. Les liens sont volontairement rares : Proto → traduction DA, puis DA → Release seulement quand cette traduction existe réellement.\n\nL’espace de chaque État est extensible : le fond de zone s’agrandit à partir du bounding-box des écrans et nœuds canoniques ou locaux avec une marge de respiration. Un nouveau nœud ne doit pas être tassé pour tenir dans une largeur historique fixe.\n\n`
if (!prod.includes(prodAnchor)) throw new Error('Production Lab anchor missing')
prod = prod.replace(prodAnchor, prodText)
writeFileSync(prodPath, prod)

const pipelinePath = 'docs/GAME_ART_PRODUCTION_PIPELINE.md'
let pipeline = readFileSync(pipelinePath, 'utf8')
const pipelineAnchor = '## 3. Single-owner rule\n'
const inventoryGate = `### 2.1 Inventory gate before asset production\n\nAprès validation de la DA et avant toute découpe/export, faire un inventaire visuel complet dans le Production Lab. **Tout élément important visible doit avoir un nœud**, même si son owner final est Phaser et qu’aucun fichier ne sera produit. Cet inventaire inclut au minimum structure, surfaces, chiffres/glyphes, états interactifs, mouvement/FX et événements sonores.\n\nPour chaque composant interactif, définir sa matrice d’états avant export. Pour chaque mouvement notable, définir une séquence courte repos → action → pic → retour. Tant que l’inventaire est incomplet, les assets concernés restent \`todo\`/\`blocked\` : ne pas fabriquer des crops ou textures provisoires uniquement pour donner l’impression que le pack existe déjà.\n\nUne source de production doit provenir du master approuvé original ou d’une recréation propre. Une preview, vignette, image recompressée ou source agrandie n’est jamais une base acceptable pour fabriquer les assets finaux.\n\n`
if (!pipeline.includes('### 2.1 Inventory gate before asset production')) pipeline = replaceOnce(pipeline, pipelineAnchor, inventoryGate + pipelineAnchor, 'pipeline gate')
writeFileSync(pipelinePath, pipeline)

const manifestPath = 'src/games/linefugg/ASSET_MANIFEST.md'
let manifest = readFileSync(manifestPath, 'utf8')
const manifestStart = manifest.indexOf('## Rebirth — sources de production séparées')
if (manifestStart >= 0) manifest = manifest.slice(0, manifestStart).trimEnd() + `\n\n## Rebirth — production en reconstruction\n\nLa première passe de sources séparées du 17 septembre est annulée : elle provenait d’une source de preview dégradée et ne constitue pas un pack de production. Ces fichiers sont retirés. La DA validée reste une référence globale.\n\nLe 18 septembre, le Lab repart par l’inventaire visuel complet : grille, cellule, chiffres/opérateurs, système de lignes, registre, total, matrices Undo/Validate, états de cellules, storyboard reroll, feedback invalide et carte sonore. Aucun nouvel asset Rebirth n’est considéré produit tant que cette planche n’est pas revue.\n`
writeFileSync(manifestPath, manifest)

const statusPath = 'src/games/linefugg/GAME_STATUS.md'
let status = readFileSync(statusPath, 'utf8')
const statusNote = `\n\n## Rebirth — reset production DA (18 septembre 2026)\n\nLa première décomposition en petits assets/crops est annulée : qualité source insuffisante, inventaire incomplet et états interactifs absents. Le Production Lab repart du screen DA validé avec un inventaire visuel exhaustif avant production : structure, chiffres/opérateurs, lignes, états, FX/mouvements et sons. Release Rebirth reste vide jusqu’à validation de cette planche.\n`
if (!status.includes('## Rebirth — reset production DA (18 septembre 2026)')) status += statusNote
writeFileSync(statusPath, status)

console.log('Production Lab DA rebuild v2 applied')