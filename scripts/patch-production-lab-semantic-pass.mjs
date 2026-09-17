import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}`)
  writeFileSync(path, text.replace(before, after))
}

function appendOnce(path, marker, addition) {
  let text = readFileSync(path, 'utf8')
  if (text.includes(marker)) return
  writeFileSync(path, `${text.trimEnd()}\n\n${addition.trim()}\n`)
}

const lab = 'src/core/ProductionLab.tsx'

replaceExact(lab,
  "type NodeKind = 'text' | 'image' | 'animation' | 'audio'\ntype Point = { x: number; y: number }\ntype Camera = { x: number; y: number; zoom: number }\ntype AnnotationType = 'point' | 'rect' | 'draw'",
  "type NodeKind = 'text' | 'image' | 'animation' | 'audio'\ntype NodeTag = 'GD' | 'IMAGE' | 'ANIMATION' | 'FX' | 'SON' | 'UI' | 'NOTE'\ntype NodeStatus = 'done' | 'review' | 'todo' | 'blocked'\ntype Point = { x: number; y: number }\ntype Camera = { x: number; y: number; zoom: number }\ntype AnnotationType = 'point' | 'rect' | 'draw'\ntype PlanMarker = { type: AnnotationType; x: number; y: number; w?: number; h?: number; points?: Point[] }"
)

replaceExact(lab,
  "  kind: NodeKind\n  body: string\n  facts: string[]\n  source: string\n  x: number\n  y: number\n  links: SemanticLink[]",
  "  kind: NodeKind\n  tags?: NodeTag[]\n  status?: NodeStatus\n  body: string\n  facts: string[]\n  source: string\n  image?: string\n  imagePosition?: string\n  marker?: PlanMarker\n  x: number\n  y: number\n  links: SemanticLink[]"
)

replaceExact(lab,
  "  title: string\n  text: string\n  reference: string\n  x: number\n  y: number\n}",
  "  title: string\n  text: string\n  reference: string\n  tags: NodeTag[]\n  x: number\n  y: number\n}"
)

replaceExact(lab,
  "const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; logicalHeight?: number }> = [",
  "const NODE_TAGS: NodeTag[] = ['GD', 'IMAGE', 'ANIMATION', 'FX', 'SON', 'UI', 'NOTE']\nconst REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; logicalHeight?: number }> = ["
)

replaceExact(lab,
  "      text: typeof node.text === 'string' ? node.text : '', reference: typeof node.reference === 'string' ? node.reference : '',\n      x: Number(node.x) || 0, y: Number(node.y) || 0,",
  "      text: typeof node.text === 'string' ? node.text : '', reference: typeof node.reference === 'string' ? node.reference : '',\n      tags: Array.isArray(node.tags) ? node.tags.filter((tag: unknown): tag is NodeTag => typeof tag === 'string' && NODE_TAGS.includes(tag as NodeTag)) : ['NOTE'],\n      x: Number(node.x) || 0, y: Number(node.y) || 0,"
)

replaceExact(lab,
  "      id: nodeId, ownerScreenId: screen.id, title, text: '', reference: '', x: placement.x, y: placement.y,",
  "      id: nodeId, ownerScreenId: screen.id, title, text: '', reference: '', tags: ['NOTE'], x: placement.x, y: placement.y,"
)
replaceExact(lab,
  "reviewNodes: [...current.reviewNodes, { id, title: 'Observation', text: '', reference: '', x: world.x - NODE_WIDTH / 2, y: world.y - 40 }]",
  "reviewNodes: [...current.reviewNodes, { id, title: 'Observation', text: '', reference: '', tags: ['NOTE'], x: world.x - NODE_WIDTH / 2, y: world.y - 40 }]"
)
replaceExact(lab,
  "reviewNodes: [...current.reviewNodes, { id, ownerScreenId: screen.id, title: 'Observation', text: '', reference: '', x: placement.x, y: placement.y }]",
  "reviewNodes: [...current.reviewNodes, { id, ownerScreenId: screen.id, title: 'Observation', text: '', reference: '', tags: ['NOTE'], x: placement.x, y: placement.y }]"
)

const daImage = "`${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850.webp`"

const nodeReplacements = [
  [
    "{ id: 'P-board', ownerScreenId: 'P1', title: 'Plateau quotidien', kind: 'text', body: 'La grille initiale est déterministe pour le jour courant.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 760, links: [screenLink('P-board-grid', 'P1', 195, 335, 'grille')] },",
    "{ id: 'P-board', ownerScreenId: 'P1', title: 'Plateau quotidien', kind: 'text', tags: ['GD'], status: 'done', body: 'La grille initiale est déterministe pour le jour courant.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 760, links: [screenLink('P-board-grid', 'P1', 195, 335, 'grille'), nodeLink('P-board-da', 'D-style', 'traduit par')] },"
  ],
  [
    "{ id: 'P-gesture', ownerScreenId: 'P2', title: 'Geste', kind: 'animation', body: 'Départ sur une case puis glissé vers une autre, aimanté sur une ligne droite de 2 à 5 cases.', facts: ['Horizontal / vertical / diagonal', 'Direction significative'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 1730, links: [screenLink('P-gesture-line', 'P2', 195, 430, 'tracé'), nodeLink('P-gesture-order', 'P-order', 'détermine')] },",
    "{ id: 'P-gesture', ownerScreenId: 'P2', title: 'Geste', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Départ sur une case puis glissé vers une autre, aimanté sur une ligne droite de 2 à 5 cases.', facts: ['Horizontal / vertical / diagonal', 'Direction significative'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 1730, links: [screenLink('P-gesture-line', 'P2', 195, 430, 'tracé'), nodeLink('P-gesture-order', 'P-order', 'détermine'), nodeLink('P-gesture-da', 'D-lines', 'traduit par'), nodeLink('P-gesture-sound', 'D-audio', 'événement son')] },"
  ],
  [
    "{ id: 'P-order', ownerScreenId: 'P2', title: 'Ordre du calcul', kind: 'text', body: 'Le score est évalué dans l’ordre traversé ; × et ÷ agissent sur le cumul déjà construit.', facts: ['Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1740, links: [screenLink('P-order-preview', 'P2', 195, 500, 'résultat courant')] },",
    "{ id: 'P-order', ownerScreenId: 'P2', title: 'Ordre du calcul', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score est évalué dans l’ordre traversé ; × et ÷ agissent sur le cumul déjà construit.', facts: ['Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1740, links: [screenLink('P-order-preview', 'P2', 195, 500, 'résultat courant'), nodeLink('P-order-da', 'D-ledger', 'traduit par')] },"
  ],
  [
    "{ id: 'P-reroll', ownerScreenId: 'P3', title: 'Retirage déterministe', kind: 'animation', body: 'Les cases jouées restent stables ; les autres sont recalculées à partir de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Cases engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 2970, links: [screenLink('P-reroll-board', 'P3', 195, 365, 'nouveau plateau')] },",
    "{ id: 'P-reroll', ownerScreenId: 'P3', title: 'Retirage déterministe', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Les cases jouées restent stables ; les autres sont recalculées à partir de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Cases engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 2970, links: [screenLink('P-reroll-board', 'P3', 195, 365, 'nouveau plateau'), nodeLink('P-reroll-cells', 'D-cell-states', 'demande des états'), nodeLink('P-reroll-da', 'D-reroll-motion', 'à traduire'), nodeLink('P-reroll-sound', 'D-audio', 'événement son')] },"
  ],
  [
    "{ id: 'P-ripple', ownerScreenId: 'P3', title: 'Flip en cascade', kind: 'animation', body: 'Le renouvellement apparaît comme une onde courte depuis la fin de ligne.', facts: ['Fold → changement caché → unfold'], source: 'rerollUnplayedCells()', x: 2140, y: 3000, links: [screenLink('P-ripple-board', 'P3', 250, 430)] },",
    "{ id: 'P-ripple', ownerScreenId: 'P3', title: 'Flip en cascade', kind: 'animation', tags: ['ANIMATION', 'FX'], status: 'done', body: 'Le renouvellement apparaît comme une onde courte depuis la fin de ligne.', facts: ['Fold → changement caché → unfold'], source: 'rerollUnplayedCells()', x: 2140, y: 3000, links: [screenLink('P-ripple-board', 'P3', 250, 430), nodeLink('P-ripple-da', 'D-reroll-motion', 'traduire le mouvement')] },"
  ],
  [
    "{ id: 'P-undo', ownerScreenId: 'P4', title: 'Undo = restauration', kind: 'text', body: 'Annuler retire la dernière ligne et restaure le plateau antérieur.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré'], source: 'PlayedLine / undo()', x: 2140, y: 4200, links: [screenLink('P-undo-control', 'P4', 65, 775, 'Undo')] },",
    "{ id: 'P-undo', ownerScreenId: 'P4', title: 'Undo = restauration', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Annuler retire la dernière ligne et restaure le plateau antérieur.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré'], source: 'PlayedLine / undo()', x: 2140, y: 4200, links: [screenLink('P-undo-control', 'P4', 65, 775, 'Undo'), nodeLink('P-undo-da', 'D-controls', 'traduit par')] },"
  ],
  [
    "{ id: 'P-validate', ownerScreenId: 'P4', title: 'Trois lignes puis choix', kind: 'text', body: 'La troisième ligne ne termine pas la partie. Le joueur choisit quand valider.', facts: ['Pas de résolution automatique', 'Validate actif à 3 lignes'], source: 'validateEnabled() / validateRun()', x: 1190, y: 4200, links: [screenLink('P-validate-control', 'P4', 325, 775, 'Validate'), nodeLink('P-validate-total', 'P-total', 'valide')] },",
    "{ id: 'P-validate', ownerScreenId: 'P4', title: 'Trois lignes puis choix', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'La troisième ligne ne termine pas la partie. Le joueur choisit quand valider.', facts: ['Pas de résolution automatique', 'Validate actif à 3 lignes'], source: 'validateEnabled() / validateRun()', x: 1190, y: 4200, links: [screenLink('P-validate-control', 'P4', 325, 775, 'Validate'), nodeLink('P-validate-total', 'P-total', 'valide'), nodeLink('P-validate-da', 'D-controls', 'traduit par'), nodeLink('P-validate-sound', 'D-audio', 'événement son')] },"
  ],
  [
    "{ id: 'P-total', ownerScreenId: 'P4', title: 'Total final', kind: 'text', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale'], source: 'totalScore() / session.finish()', x: 2140, y: 4510, links: [screenLink('P-total-value', 'P4', 195, 650, 'total')] },",
    "{ id: 'P-total', ownerScreenId: 'P4', title: 'Total final', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale'], source: 'totalScore() / session.finish()', x: 2140, y: 4510, links: [screenLink('P-total-value', 'P4', 195, 650, 'total'), nodeLink('P-total-da', 'D-total', 'traduit par')] },"
  ],
  [
    "{ id: 'D-style', ownerScreenId: 'D1', title: 'Découpe 1 · matière et grille', kind: 'image', body: 'Papier ivoire imprimé, trame et encre sèche. La grille 7×7 reste la masse dominante et les nombres conservent le contraste maximal.', facts: ['Pas de chrome futuriste', 'Texture matérielle sobre', 'Grille avant décor'], source: 'DA validée 17/09/2026', x: 3100, y: 560, links: [screenLink('D-style-grid', 'D1', 195, 275, 'grille + matière')] },",
    "{ id: 'D-style', ownerScreenId: 'D1', title: 'Découpe 1 · matière et grille', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Papier ivoire imprimé, trame et encre sèche. La grille 7×7 reste la masse dominante et les nombres conservent le contraste maximal.', facts: ['Pas de chrome futuriste', 'Texture matérielle sobre', 'Grille avant décor'], source: 'DA validée 17/09/2026', image: " + daImage + ", imagePosition: '50% 28%', marker: { type: 'rect', x: 18, y: 92, w: 354, h: 374 }, x: 3100, y: 560, links: [screenLink('D-style-grid', 'D1', 195, 275, 'grille + matière'), nodeLink('D-style-release', 'R-mini-slice', 'première traduction')] },"
  ],
  [
    "{ id: 'D-lines', ownerScreenId: 'D1', title: 'Découpe 2 · les trois tracés', kind: 'image', body: 'Les trois lignes sont des encres/transparences colorées qui traversent les cases sans masquer les valeurs. Les points et flèches rendent l’ordre immédiatement lisible.', facts: ['3 identités couleur', 'Direction visible', 'Intersection lisible'], source: 'DA validée 17/09/2026', x: 4000, y: 650, links: [screenLink('D-lines-board', 'D1', 195, 320, 'tracés')] },",
    "{ id: 'D-lines', ownerScreenId: 'D1', title: 'Découpe 2 · les trois tracés', kind: 'image', tags: ['IMAGE', 'ANIMATION', 'FX'], status: 'review', body: 'Les trois lignes sont des encres/transparences colorées qui traversent les cases sans masquer les valeurs. Les points et flèches rendent l’ordre immédiatement lisible.', facts: ['3 identités couleur', 'Direction visible', 'Intersection lisible'], source: 'DA validée 17/09/2026', image: " + daImage + ", imagePosition: '50% 31%', marker: { type: 'draw', x: 0, y: 0, points: [{ x: 91, y: 394 }, { x: 257, y: 158 }] }, x: 4000, y: 650, links: [screenLink('D-lines-board', 'D1', 195, 320, 'tracés'), nodeLink('D-lines-release', 'R-mini-slice', 'première traduction')] },"
  ],
  [
    "{ id: 'D-ledger', ownerScreenId: 'D1', title: 'Découpe 3 · registre des résultats', kind: 'image', body: 'Sous la grille, chaque ligne possède une rangée typographique compacte avec son identité couleur, sa formule et son résultat. Cette zone doit rester vivante et moteur-owned.', facts: ['3 lignes de résultat', 'Typographie fonctionnelle', 'Aucun faux texte décoratif'], source: 'DA validée 17/09/2026', x: 3100, y: 1040, links: [screenLink('D-ledger-rows', 'D1', 195, 545, 'résultats')] },",
    "{ id: 'D-ledger', ownerScreenId: 'D1', title: 'Découpe 3 · registre des résultats', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Sous la grille, chaque ligne possède une rangée typographique compacte avec son identité couleur, sa formule et son résultat. Cette zone doit rester vivante et moteur-owned.', facts: ['3 lignes de résultat', 'Typographie fonctionnelle', 'Aucun faux texte décoratif'], source: 'DA validée 17/09/2026', image: " + daImage + ", imagePosition: '50% 65%', marker: { type: 'rect', x: 20, y: 492, w: 350, h: 139 }, x: 3100, y: 1040, links: [screenLink('D-ledger-rows', 'D1', 195, 545, 'résultats'), nodeLink('D-ledger-release', 'R-mini-slice', 'première traduction')] },"
  ],
  [
    "{ id: 'D-total', ownerScreenId: 'D1', title: 'Découpe 4 · total', kind: 'image', body: 'Le total forme une rupture de hiérarchie nette entre le registre et les commandes, sans devenir plus important que la grille.', facts: ['Somme finale moteur-owned', 'Valeur large et isolée'], source: 'DA validée 17/09/2026', x: 4000, y: 1160, links: [screenLink('D-total-value', 'D1', 285, 655, 'total')] },",
    "{ id: 'D-total', ownerScreenId: 'D1', title: 'Découpe 4 · total', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Le total forme une rupture de hiérarchie nette entre le registre et les commandes, sans devenir plus important que la grille.', facts: ['Somme finale moteur-owned', 'Valeur large et isolée'], source: 'DA validée 17/09/2026', image: " + daImage + ", imagePosition: '50% 77%', marker: { type: 'rect', x: 188, y: 633, w: 179, h: 72 }, x: 4000, y: 1160, links: [screenLink('D-total-value', 'D1', 285, 655, 'total'), nodeLink('D-total-release', 'R-mini-slice', 'première traduction')] },"
  ],
  [
    "{ id: 'D-controls', ownerScreenId: 'D1', title: 'Découpe 5 · Undo / Validate', kind: 'image', body: 'Deux commandes physiques simples concluent la lecture : Undo à gauche, Validate à droite. Leur forme et matière peuvent être traduites en assets/états, mais leur logique reste celle du prototype.', facts: ['Undo toujours disponible avant validation', 'Validate explicite après 3 lignes', 'États interactifs à produire'], source: 'DA validée 17/09/2026', x: 3100, y: 1380, links: [screenLink('D-controls-undo', 'D1', 108, 770, 'Undo'), screenLink('D-controls-validate', 'D1', 280, 770, 'Validate')] },",
    "{ id: 'D-controls', ownerScreenId: 'D1', title: 'Découpe 5 · Undo / Validate', kind: 'image', tags: ['IMAGE', 'UI', 'ANIMATION', 'FX'], status: 'blocked', body: 'La forme générale est validée, mais les états interactifs ne sont pas encore dessinés séparément.', facts: ['Undo : normal / désactivé / pressé', 'Validate : désactivé / prêt / pressé', 'Feedback tactile/visuel à produire'], source: 'DA validée 17/09/2026 · états manquants', image: " + daImage + ", imagePosition: '50% 94%', marker: { type: 'rect', x: 38, y: 704, w: 316, h: 131 }, x: 3100, y: 1380, links: [screenLink('D-controls-undo', 'D1', 108, 770, 'Undo'), screenLink('D-controls-validate', 'D1', 280, 770, 'Validate'), nodeLink('D-controls-release', 'R-mini-slice', 'première traduction')] },"
  ],
  [
    "{ id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la planche de traduction devra reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },",
    "{ id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', tags: ['GD', 'NOTE'], status: 'todo', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la traduction doit reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },"
  ]
]
for (const [before, after] of nodeReplacements) replaceExact(lab, before, after)

replaceExact(lab,
  "    { id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', tags: ['GD', 'NOTE'], status: 'todo', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la traduction doit reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },\n  ]",
  "    { id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', tags: ['GD', 'NOTE'], status: 'todo', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la traduction doit reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },\n    { id: 'D-cell-states', ownerScreenId: 'D1', title: 'À produire · états de cellule', kind: 'image', tags: ['IMAGE', 'ANIMATION', 'FX'], status: 'blocked', body: 'La DA montre la cellule au repos, mais pas encore tous les états nécessaires au jeu.', facts: ['case normale / opérateur', 'case jouée/protégée', 'case prochaine dimension', 'intersection', 'fold/unfold de reroll'], source: 'manquant dans la DA validée', marker: { type: 'rect', x: 20, y: 96, w: 98, h: 98 }, x: 3100, y: 1710, links: [] },\n    { id: 'D-reroll-motion', ownerScreenId: 'D1', title: 'À produire · reroll papier', kind: 'animation', tags: ['ANIMATION', 'FX', 'SON'], status: 'todo', body: 'Le renouvellement du plateau doit recevoir une traduction papier/impression au lieu de reprendre simplement le flip Orbital.', facts: ['onde courte', 'information lisible pendant le changement', 'version reduced motion'], source: 'manquant · à storyboarder', marker: { type: 'draw', x: 0, y: 0, points: [{ x: 290, y: 170 }, { x: 230, y: 225 }, { x: 175, y: 280 }, { x: 115, y: 340 }] }, x: 4000, y: 1740, links: [nodeLink('D-reroll-release', 'R-mini-slice', 'premier essai à revoir')] },\n    { id: 'D-audio', ownerScreenId: 'D1', title: 'À produire · langage sonore', kind: 'audio', tags: ['SON', 'FX'], status: 'todo', body: 'Le Rebirth n’a pas encore de langage sonore propre à son papier imprimé.', facts: ['début de trait', 'passage de case', 'ligne acceptée', 'reroll', 'Undo', 'Validate / total'], source: 'à définir dans le système audio MiniFugg', x: 3100, y: 1940, links: [] },\n    { id: 'R-mini-slice', title: 'Mini-tranche live · Lab', kind: 'animation', tags: ['GD', 'IMAGE', 'ANIMATION', 'FX'], status: 'review', body: 'Première traduction jouable de la DA avec les vraies données LineFugg. Elle sert à comparer et corriger ; ce n’est pas encore la Release publique.', facts: ['skin=rebirth-editorial', '390×850', 'règles intactes', 'audio Rebirth absent'], source: 'GameplayCalibrationRuntime / LineFuggScene', x: 5120, y: 690, links: [] },\n  ]"
)

replaceExact(lab,
  "                <ScreenArtwork screen={screen} override={imageOverride} />\n                {imageOverride && <span className=\"mfpl-local-image-badge\">IMAGE LOCALE</span>}",
  "                <ScreenArtwork screen={screen} override={imageOverride} />\n                {project.nodes.filter((node) => node.ownerScreenId === screen.id && node.marker).map((node) => {\n                  const marker = node.marker!\n                  const selectNode = (event: React.MouseEvent) => { event.stopPropagation(); setSelection({ kind: 'node', id: node.id }) }\n                  if (marker.type === 'draw' && marker.points?.length) return <svg key={`marker:${node.id}`} className=\"mfpl-canonical-marker-draw\" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline data-node-id={node.id} points={marker.points.map((point) => `${point.x},${point.y}`).join(' ')} onClick={selectNode} /></svg>\n                  return <button key={`marker:${node.id}`} type=\"button\" data-node-id={node.id} className={`mfpl-canonical-marker is-${marker.type}`} style={{ left: marker.x, top: marker.y, width: marker.w, height: marker.h }} onClick={selectNode}>{marker.type === 'point' ? <span /> : null}</button>\n                })}\n                {imageOverride && <span className=\"mfpl-local-image-badge\">IMAGE LOCALE</span>}"
)

replaceExact(lab,
  "              className={`mfpl-node is-${node.kind} ${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}\n              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}",
  "              className={`mfpl-node is-${node.kind} ${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}\n              data-status={node.status ?? 'done'}\n              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}"
)
replaceExact(lab,
  "              <header><b className=\"mfpl-readable-title\" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>{deleteRequested ? 'SUPPRIMER ?' : node.kind}</small></header>\n              <p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}",
  "              <header><b className=\"mfpl-readable-title\" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>{deleteRequested ? 'SUPPRIMER ?' : `${node.status ?? 'done'} · ${node.kind}`}</small></header>\n              {node.image && <img className=\"mfpl-node-thumb\" src={node.image} alt=\"\" style={{ objectPosition: node.imagePosition ?? 'center' }} />}\n              {node.tags?.length ? <div className=\"mfpl-node-tags\">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}\n              <p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}"
)

replaceExact(lab,
  "              <header><b className=\"mfpl-readable-title\" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>revue</small></header>\n              <p>{node.text || 'Écris ton observation dans le panneau.'}</p>{node.reference && <em>{node.reference}</em>}",
  "              <header><b className=\"mfpl-readable-title\" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>revue</small></header>\n              {node.tags.length > 0 && <div className=\"mfpl-node-tags\">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}\n              <p>{node.text || 'Écris ton observation dans le panneau.'}</p>{node.reference && <em>{node.reference}</em>}"
)

replaceExact(lab,
  "          <div className=\"mfpl-linked-list\"><b>Nœuds canoniques de cette situation ({selectedScreenNodes.length})</b>{selectedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.kind}</span></button>)}</div>",
  "          <div className=\"mfpl-linked-list\"><b>Nœuds canoniques de cette situation ({selectedScreenNodes.length})</b>{selectedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.status ?? 'done'} · {node.tags?.join(' / ') || node.kind}</span></button>)}</div>"
)

replaceExact(lab,
  "          <div className=\"mfpl-inspector-title\"><small>NŒUD · {selectedCanonicalNode.kind.toUpperCase()}</small><h2>{selectedCanonicalNode.title}</h2></div>\n          <p>{selectedCanonicalNode.body}</p>",
  "          <div className=\"mfpl-inspector-title\"><small>NŒUD · {(selectedCanonicalNode.status ?? 'done').toUpperCase()}</small><h2>{selectedCanonicalNode.title}</h2></div>\n          {selectedCanonicalNode.tags?.length ? <div className=\"mfpl-node-tags is-inspector\">{selectedCanonicalNode.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}\n          <p>{selectedCanonicalNode.body}</p>"
)

replaceExact(lab,
  "          <label className=\"mfpl-field\">Référence image / son / URL<input placeholder=\"URL, fichier, nom de référence…\" value={selectedReviewNode.reference} onChange={(event) => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, reference: event.target.value } : node) }))} /></label>\n          <div className=\"mfpl-link-summary\">",
  "          <label className=\"mfpl-field\">Référence image / son / URL<input placeholder=\"URL, fichier, nom de référence…\" value={selectedReviewNode.reference} onChange={(event) => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, reference: event.target.value } : node) }))} /></label>\n          <div className=\"mfpl-tag-picker\"><b>Tags</b><div>{NODE_TAGS.map((tag) => <button key={tag} type=\"button\" data-active={selectedReviewNode.tags.includes(tag)} onClick={() => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, tags: node.tags.includes(tag) ? node.tags.filter((item) => item !== tag) : [...node.tags, tag] } : node) }))}>{tag}</button>)}</div></div>\n          <div className=\"mfpl-link-summary\">"
)

appendOnce('src/core/ProductionLab.css', '/* Production Lab semantic tags + canonical markers. */', `
/* Production Lab semantic tags + canonical markers. */
.mfpl-node[data-status="todo"]{box-shadow:inset 4px 0 0 #d8a136}.mfpl-node[data-status="blocked"]{box-shadow:inset 4px 0 0 #bb4a3d}.mfpl-node[data-status="review"]{box-shadow:inset 4px 0 0 #4d76b8}.mfpl-node[data-status="blocked"] header small{color:#96382f}.mfpl-node[data-status="todo"] header small{color:#8b641e}.mfpl-node-thumb{float:right;width:86px;height:52px;margin:6px 0 4px 8px;object-fit:cover;border:1px solid rgba(23,25,29,.18);background:#cfd3d7}.mfpl-node-tags{display:flex;flex-wrap:wrap;gap:3px;margin-top:6px}.mfpl-node-tags span{padding:2px 4px;background:rgba(23,25,29,.08);font-size:7px;font-weight:800;line-height:1;letter-spacing:.04em}.mfpl-node-tags.is-inspector{margin:0 0 10px}.mfpl-canonical-marker{position:absolute;z-index:14;margin:0;padding:0;border:0;background:transparent;cursor:pointer}.mfpl-canonical-marker.is-point{width:14px;height:14px;border:2px solid #3f6fbc;border-radius:50%;background:rgba(255,255,255,.76);transform:translate(-50%,-50%)}.mfpl-canonical-marker.is-rect{box-shadow:inset 0 0 0 2px rgba(63,111,188,.9);background:rgba(63,111,188,.055)}.mfpl-canonical-marker-draw{position:absolute;inset:0;width:390px;height:850px;z-index:14;pointer-events:none}.mfpl-canonical-marker-draw polyline{fill:none;stroke:#3f6fbc;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:9 5;pointer-events:stroke;cursor:pointer}.mfpl-tag-picker{margin:12px 0;padding:9px;background:#eef0f2}.mfpl-tag-picker>b{display:block;margin-bottom:6px;font-size:9px}.mfpl-tag-picker>div{display:flex;flex-wrap:wrap;gap:4px}.mfpl-tag-picker button{border:1px solid #c7ccd2;background:#fff;padding:4px 6px;font-size:8px}.mfpl-tag-picker button[data-active="true"]{border-color:#315f9e;background:#dfe9f6;color:#244e87}
`)

replaceExact('docs/PRODUCTION_LAB_V1.md',
  "Un **nœud** est une unité sémantique de conception, pas un objet de code. Il peut contenir une observation, une règle, une référence visuelle/sonore, un tileset à produire, un comportement ou tout autre détail utile à la compréhension. Les nœuds locaux sont directement déplaçables sur le Plan.",
  "Un **nœud** est une unité sémantique de conception, pas un objet de code. Il peut contenir une observation, une règle, une référence visuelle/sonore, un tileset à produire, un comportement ou tout autre détail utile à la compréhension. Un nœud peut porter plusieurs tags simples (`GD`, `IMAGE`, `ANIMATION`, `FX`, `SON`, `UI`, `NOTE`) et un statut léger (`done`, `review`, `todo`, `blocked`) ; ces marqueurs servent à lire le Plan, pas à recréer un logiciel de gestion de projet. Les nœuds locaux sont directement déplaçables sur le Plan.\n\nLes nœuds canoniques peuvent aussi porter un **repère visuel** Point, Zone ou Dessin sur leur écran propriétaire. Le type de repère suit le sens : Point pour un détail ponctuel, Zone pour une surface ou un composant, Dessin pour un mouvement, une trajectoire ou un FX. Quand une référence DA existe, un nœud peut afficher une petite découpe visuelle de cette référence au lieu de rester purement textuel."
)
replaceExact('docs/PRODUCTION_LAB_V1.md',
  "Un nœud peut avoir zéro, un ou plusieurs liens. Les liens ne reproduisent pas les dépendances du code ; ils expriment ce que l’humain et l’agent doivent comprendre.",
  "Un nœud peut avoir zéro, un ou plusieurs liens. Les liens ne reproduisent pas les dépendances du code ; ils expriment ce que l’humain et l’agent doivent comprendre. Quand cela éclaire réellement la production, ils traversent les états : une règle Proto peut pointer vers sa traduction DA, puis la DA vers son implémentation Release. Les éléments encore absents restent volontairement sans faux équivalent Release."
)

replaceExact('src/games/linefugg/GAME_STATUS.md',
  "- **Release** : vide tant que cette mini-tranche n’a pas été revue et acceptée pour bascule.\n\nProchaine action : revoir la mini-tranche dans le Lab, noter les corrections visuelles/fonctionnelles, puis seulement décider de l’étendre au runtime Rebirth complet.",
  "- **Release** : la mini-tranche Lab est maintenant représentée comme première traduction à revoir, sans prétendre qu’elle est la Release publique ;\n- **Manques DA visibles dans le Lab** : états de cellule complets (**bloqué**), états Undo/Validate (**bloqué**), mouvement de reroll papier (**à faire**), langage sonore Rebirth (**à faire**). Les nœuds existants affichent désormais des tags multi-domaines et des repères Point/Zone/Dessin quand ils ont un sens.\n\nProchaine action : revoir ces manques directement dans le Lab et produire en priorité les états de cellule et de contrôles avant d’étendre la mini-tranche au runtime Rebirth complet."
)

console.log('Production Lab semantic pass applied.')
