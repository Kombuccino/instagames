import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import type { InstagameDefinition } from './types'
import './ProductionLab.css'

type StateId = 'covers' | 'proto' | 'da' | 'release'
type ViewMode = 'simple' | 'exploded'
type ToolMode = 'node' | 'point' | 'rect' | 'draw' | 'link' | null
type ReferenceMode = 'off' | 'minimum' | 'a54' | 'iphone' | 'brave'
type AnchorMode = 'top' | 'center' | 'bottom'
type NodeKind = 'text' | 'image' | 'animation' | 'audio'
type NodeTag = 'GD' | 'IMAGE' | 'ANIMATION' | 'FX' | 'SON' | 'UI' | 'NOTE'
type NodeStatus = 'done' | 'review' | 'todo' | 'blocked'
type Point = { x: number; y: number }
type Camera = { x: number; y: number; zoom: number }
type AnnotationType = 'point' | 'rect' | 'draw'
type PlanMarker = { type: AnnotationType; x: number; y: number; w?: number; h?: number; points?: Point[] }

type LinkEndpoint =
  | { kind: 'screen'; screenId: string; point: Point }
  | { kind: 'annotation'; annotationId: string }
  | { kind: 'node'; nodeId: string }

type SemanticLink = {
  id: string
  target: LinkEndpoint
  label?: string
}

type ReviewLink = {
  id: string
  source: LinkEndpoint
  target: LinkEndpoint
  kind: 'attachment' | 'relation'
}

type PlanScreen = {
  id: string
  state: StateId
  title: string
  context: string
  facts: string[]
  source: string
  status: string
  x: number
  y: number
  image?: string
  preview: 'cover' | 'proto'
  anchor?: AnchorMode
  referenceBias?: number
}

type PlanNode = {
  id: string
  ownerScreenId?: string
  title: string
  kind: NodeKind
  tags?: NodeTag[]
  status?: NodeStatus
  body: string
  facts: string[]
  source: string
  image?: string
  imagePosition?: string
  marker?: PlanMarker
  x: number
  y: number
  links: SemanticLink[]
}

type PlanProject = { title: string; summary: string; screens: PlanScreen[]; nodes: PlanNode[] }

type Annotation = {
  id: string
  screenId: string
  nodeId: string
  type: AnnotationType
  x: number
  y: number
  w?: number
  h?: number
  points?: Point[]
}

type ReviewNode = {
  id: string
  ownerScreenId?: string
  title: string
  text: string
  reference: string
  tags: NodeTag[]
  x: number
  y: number
}

type ReferenceAdjustment = { bias: number }
type LocalImageOverride = { name: string; type: string; size: number; src: string }
type DeletionRequest = { kind: 'node' | 'canonical-link'; targetId: string; sourceNodeId?: string }

type ReviewState = {
  annotations: Annotation[]
  reviewNodes: ReviewNode[]
  reviewLinks: ReviewLink[]
  comments: Record<string, string>
  referenceAdjustments: Record<string, ReferenceAdjustment>
  linkOverrides: Record<string, SemanticLink[]>
  canonicalLinkSourceOverrides: Record<string, LinkEndpoint>
  nodePositionOverrides: Record<string, Point>
  deletionRequests: Record<string, DeletionRequest>
  screenImages: Record<string, LocalImageOverride>
}

type Selection =
  | { kind: 'screen'; id: string }
  | { kind: 'node'; id: string }
  | { kind: 'review-node'; id: string }
  | { kind: 'annotation'; id: string }
  | { kind: 'review-link'; id: string }
  | { kind: 'canonical-link'; sourceNodeId: string; linkId: string }
  | null

type Gesture = { screenId: string; type: 'rect' | 'draw'; start: Point; current: Point; points: Point[] } | null
type LinkDraft = { endpoint: LinkEndpoint; before: ReviewState } | null

type PanState = {
  pointerId: number
  startX: number
  startY: number
  camera: Camera
  moved: boolean
}

type PinchState = {
  distance: number
  worldX: number
  worldY: number
  camera: Camera
}

type NodeDrag = {
  pointerId: number
  nodeId: string
  review: boolean
  startX: number
  startY: number
  origin: Point
  before: ReviewState
  moved: boolean
}

type AnnotationDrag = {
  pointerId: number
  annotationId: string
  startX: number
  startY: number
  origin: Point
  before: ReviewState
  moved: boolean
}

type EndpointDrag = {
  pointerId: number
  kind: 'canonical' | 'review'
  linkId: string
  sourceNodeId?: string
  side: 'source' | 'target'
  before: ReviewState
  original: LinkEndpoint
  snapped: LinkEndpoint | null
}

const MASTER_WIDTH = 390
const MASTER_HEIGHT = 850
const WORLD_WIDTH = 6900
const WORLD_HEIGHT = 5600
const NODE_WIDTH = 310
const NODE_HEIGHT = 148
const SNAP_IN_PX = 24
const SNAP_OUT_PX = 46
const STATE_LABEL: Record<StateId, string> = { covers: 'COVERS', proto: 'PROTO', da: 'DA', release: 'RELEASE' }
const ZONES: Array<{ id: StateId; x: number; width: number; subtitle: string }> = [
  { id: 'covers', x: 0, width: 1150, subtitle: 'ensemble éditorial séparé' },
  { id: 'proto', x: 1150, width: 1900, subtitle: 'référence fonctionnelle à comprendre' },
  { id: 'da', x: 3050, width: 1850, subtitle: 'à créer depuis le proto' },
  { id: 'release', x: 4900, width: 2000, subtitle: 'après intégration réelle' },
]
const SCREEN_X: Record<StateId, number> = { covers: 220, proto: 1650, da: 3450, release: 5350 }
const NODE_TAGS: NodeTag[] = ['GD', 'IMAGE', 'ANIMATION', 'FX', 'SON', 'UI', 'NOTE']
const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; logicalHeight?: number }> = [
  { id: 'off', label: 'Sans repère' },
  { id: 'minimum', label: 'Zone garantie 390×710', logicalHeight: 710 },
  { id: 'a54', label: 'A54 Chrome 360×656', logicalHeight: MASTER_WIDTH * 656 / 360 },
  { id: 'iphone', label: 'iPhone 13 Pro 390×712', logicalHeight: 712 },
  { id: 'brave', label: 'A54 Brave 360×611', logicalHeight: MASTER_WIDTH * 611 / 360 },
]
const LINEFUGG_PROOF_ROOT = '/assets/generated/linefugg/production-lab'
const LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
function projectTitle(game: InstagameDefinition) { return game.id === 'linefugg' ? 'LineFugg — Rebirth' : game.title }
function anchorBias(anchor: AnchorMode = 'center') { return anchor === 'top' ? 0 : anchor === 'bottom' ? 1 : 0.5 }
function uid(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` }
function isEditable(target: EventTarget | null) { return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) }
function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midpoint(a: Point, b: Point) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
function deletionKey(request: DeletionRequest) { return request.kind === 'node' ? `node:${request.targetId}` : `link:${request.sourceNodeId}:${request.targetId}` }

function objectPositionBias(position?: string) {
  if (!position) return 0.5
  const normalized = position.toLowerCase()
  if (normalized.includes('top')) return 0
  if (normalized.includes('bottom')) return 1
  const percentages = normalized.match(/-?\d+(?:\.\d+)?%/g)
  if (percentages?.length) return clamp(Number.parseFloat(percentages.at(-1) ?? '50') / 100, 0, 1)
  return 0.5
}

function screenLink(id: string, screenId: string, x: number, y: number, label?: string): SemanticLink {
  return { id, target: { kind: 'screen', screenId, point: { x, y } }, label }
}
function nodeLink(id: string, nodeId: string, label?: string): SemanticLink {
  return { id, target: { kind: 'node', nodeId }, label }
}

function buildGenericPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover éditoriale existante. Elle reste séparée du flux Proto → DA → Release.',
    facts: ['Raster statique', 'Contrat Cover MiniFugg'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover',
    anchor: 'center', referenceBias: objectPositionBias(variant.objectPosition),
  }))
  if (!covers.length) covers.push({
    id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée.', facts: ['À produire plus tard'],
    source: '—', status: 'Absente', x: SCREEN_X.covers, y: 420, preview: 'cover', anchor: 'center', referenceBias: 0.5,
  })
  const proto: PlanScreen = {
    id: 'P1', state: 'proto', title: 'Situation principale', context: 'Capture statique de la situation fonctionnelle de référence.',
    facts: [game.instructions?.goal ?? game.description, ...(game.instructions?.rules ?? []).slice(0, 4)],
    source: `src/games/${game.id}/`, status: 'Capture à produire', x: SCREEN_X.proto, y: 420, preview: 'proto', anchor: 'center',
  }
  return {
    title: projectTitle(game), summary: game.description, screens: [...covers, proto],
    nodes: [
      { id: 'P-goal', ownerScreenId: 'P1', title: 'But du joueur', kind: 'text', body: game.instructions?.goal ?? game.description, facts: game.instructions?.rules ?? [], source: 'definition.ts', x: 1220, y: 540, links: [] },
      { id: 'P-input', ownerScreenId: 'P1', title: 'Geste principal', kind: 'text', body: (game.instructions?.controls ?? []).join(' · ') || 'À extraire du prototype.', facts: [], source: 'definition.ts / runtime', x: 2130, y: 780, links: [screenLink('P-input-main', 'P1', 195, 430)] },
    ],
  }
}

function buildLineFuggPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover existante. Les covers restent hors du flux de conception Rebirth.',
    facts: ['390×844', 'Statique', 'Séparée de la future DA gameplay'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover',
    anchor: 'center', referenceBias: objectPositionBias(variant.objectPosition),
  }))

  const screens: PlanScreen[] = [
    ...covers,
    {
      id: 'P1', state: 'proto', title: 'Départ · lecture du plateau', status: 'Capture du proto classique',
      context: 'Situation de départ du vrai LineFugg : lecture de la grille avant toute décision.',
      facts: ['Grille 7×7', 'Plateau quotidien déterministe', 'Nombres positifs/négatifs et opérateurs', 'Trois lignes à construire'],
      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 420, image: `${LINEFUGG_PROOF_ROOT}/proto-initial.png`, preview: 'proto', anchor: 'center',
    },
    {
      id: 'P2', state: 'proto', title: 'Tracé en cours', status: 'Capture du proto classique',
      context: 'Un vrai drag figé en image : ligne provisoire, cases traversées et résultat courant avant commit.',
      facts: ['2 à 5 cases', '8 directions droites', 'Ordre départ→arrivée significatif', 'Prévisualisation du calcul'],
      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 1640, image: `${LINEFUGG_PROOF_ROOT}/proto-drag.png`, preview: 'proto', anchor: 'center',
    },
    {
      id: 'P3', state: 'proto', title: 'Après une ligne · nouveau problème', status: 'Capture du proto classique',
      context: 'Une première ligne a été jouée. Son historique reste visible et le plateau suivant montre les conséquences de cette décision.',
      facts: ['Cases jouées protégées', 'Retirage déterministe des cases libres', 'Transition vers la ligne suivante'],
      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 2860, image: `${LINEFUGG_PROOF_ROOT}/proto-after-line.png`, preview: 'proto', anchor: 'center',
    },
    {
      id: 'P4', state: 'proto', title: 'Trois lignes · avant validation', status: 'Capture du proto classique',
      context: 'Les trois lignes sont posées mais la partie n’est pas encore validée.',
      facts: ['Trois résultats intermédiaires', 'Total visible', 'Undo encore disponible', 'Validation manuelle obligatoire'],
      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 4080, image: `${LINEFUGG_PROOF_ROOT}/proto-three-lines.png`, preview: 'proto', anchor: 'center',
    },
    {
      id: 'D1', state: 'da', title: 'DA validée · registre éditorial imprimé', status: 'Validée le 17 septembre 2026',
      context: 'Première DA Rebirth validée. Elle traduit l’état P4 en feuille imprimée tactile : grille dominante, trois tracés colorés, registre des résultats, total et deux actions finales.',
      facts: ['MASTER 390×850', 'Zone garantie 390×710', 'Grille 7×7 prioritaire', 'Trois tracés lisibles simultanément', 'Valeurs de la maquette = référence visuelle, pas données canoniques'],
      source: 'ChatGPT image generation · 17 septembre 2026', x: SCREEN_X.da, y: 420, image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, preview: 'proto', anchor: 'center',
    },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-goal', ownerScreenId: 'P1', title: 'Question du joueur', kind: 'text', body: 'Comment utiliser trois traits pour fabriquer le total le plus élevé possible ?', facts: ['Calcul local + anticipation des lignes suivantes', 'Score final = somme des trois calculs'], source: 'definition.ts + règles validées', x: 1190, y: 500, links: [] },
    { id: 'P-board', ownerScreenId: 'P1', title: 'Plateau quotidien', kind: 'text', tags: ['GD'], status: 'done', body: 'La grille initiale est déterministe pour le jour courant.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 760, links: [screenLink('P-board-grid', 'P1', 195, 335, 'grille'), nodeLink('P-board-da', 'D-style', 'traduit par')] },
    { id: 'P-values', ownerScreenId: 'P1', title: 'Économie des cases', kind: 'text', body: 'Les cases ajoutent, soustraient, multiplient ou divisent avec une distribution asymétrique.', facts: ['68 % : +1…+9', '16 % : −1…−4', '12 % : ×2 ou ×3', '4 % : ÷2 ou ÷3'], source: 'createCell()', x: 2140, y: 520, links: [screenLink('P-values-grid', 'P1', 260, 350, 'valeurs')] },
    { id: 'P-gesture', ownerScreenId: 'P2', title: 'Geste', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Départ sur une case puis glissé vers une autre, aimanté sur une ligne droite de 2 à 5 cases.', facts: ['Horizontal / vertical / diagonal', 'Direction significative'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 1730, links: [screenLink('P-gesture-line', 'P2', 195, 430, 'tracé'), nodeLink('P-gesture-order', 'P-order', 'détermine'), nodeLink('P-gesture-da', 'D-lines', 'traduit par'), nodeLink('P-gesture-sound', 'D-audio', 'événement son')] },
    { id: 'P-order', ownerScreenId: 'P2', title: 'Ordre du calcul', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score est évalué dans l’ordre traversé ; × et ÷ agissent sur le cumul déjà construit.', facts: ['Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1740, links: [screenLink('P-order-preview', 'P2', 195, 500, 'résultat courant'), nodeLink('P-order-da', 'D-ledger', 'traduit par')] },
    { id: 'P-cross', ownerScreenId: 'P2', title: 'Croisement', kind: 'text', body: 'Une nouvelle ligne peut partager une case avec une ligne précédente, mais jamais deux.', facts: ['1 intersection maximum par paire'], source: 'overlapsMoreThanOnce()', x: 2140, y: 2050, links: [screenLink('P-cross-grid', 'P2', 195, 390)] },
    { id: 'P-reroll', ownerScreenId: 'P3', title: 'Retirage déterministe', kind: 'animation', tags: ['GD', 'ANIMATION'], status: 'done', body: 'Les cases jouées restent stables ; les autres sont recalculées à partir de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Cases engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 2970, links: [screenLink('P-reroll-board', 'P3', 195, 365, 'nouveau plateau'), nodeLink('P-reroll-cells', 'D-cell-states', 'demande des états'), nodeLink('P-reroll-da', 'D-reroll-motion', 'à traduire'), nodeLink('P-reroll-sound', 'D-audio', 'événement son')] },
    { id: 'P-ripple', ownerScreenId: 'P3', title: 'Flip en cascade', kind: 'animation', tags: ['ANIMATION', 'FX'], status: 'done', body: 'Le renouvellement apparaît comme une onde courte depuis la fin de ligne.', facts: ['Fold → changement caché → unfold'], source: 'rerollUnplayedCells()', x: 2140, y: 3000, links: [screenLink('P-ripple-board', 'P3', 250, 430), nodeLink('P-ripple-da', 'D-reroll-motion', 'traduire le mouvement')] },
    { id: 'P-next', ownerScreenId: 'P3', title: 'Préparer la ligne suivante', kind: 'text', body: 'Les cases libres signalent aussi l’étape suivante.', facts: ['Dimension 1 puis 2 puis 3', 'La future DA devra traduire ce signal'], source: 'cellDimensionSlots', x: 1190, y: 3290, links: [screenLink('P-next-cells', 'P3', 120, 420)] },
    { id: 'P-undo', ownerScreenId: 'P4', title: 'Undo = restauration', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Annuler retire la dernière ligne et restaure le plateau antérieur.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré'], source: 'PlayedLine / undo()', x: 2140, y: 4200, links: [screenLink('P-undo-control', 'P4', 65, 775, 'Undo'), nodeLink('P-undo-da', 'D-controls', 'traduit par')] },
    { id: 'P-validate', ownerScreenId: 'P4', title: 'Trois lignes puis choix', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'La troisième ligne ne termine pas la partie. Le joueur choisit quand valider.', facts: ['Pas de résolution automatique', 'Validate actif à 3 lignes'], source: 'validateEnabled() / validateRun()', x: 1190, y: 4200, links: [screenLink('P-validate-control', 'P4', 325, 775, 'Validate'), nodeLink('P-validate-total', 'P-total', 'valide'), nodeLink('P-validate-da', 'D-controls', 'traduit par'), nodeLink('P-validate-sound', 'D-audio', 'événement son')] },
    { id: 'P-total', ownerScreenId: 'P4', title: 'Total final', kind: 'text', tags: ['GD', 'UI'], status: 'done', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale'], source: 'totalScore() / session.finish()', x: 2140, y: 4510, links: [screenLink('P-total-value', 'P4', 195, 650, 'total'), nodeLink('P-total-da', 'D-total', 'traduit par')] },
    { id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute nouvelle DA vise le MASTER 390×850 et garde le gameplay indispensable dans la zone garantie 390×710.', facts: ['390×710 garanti', 'Références 390×844 historiques compatibles', 'Pas de reflow PC/mobile'], source: 'MINIFUGG_ZONES.md', x: 1190, y: 1070, links: [] },
    { id: 'D-style', ownerScreenId: 'D1', title: 'Découpe 1 · matière et grille', kind: 'image', tags: ['IMAGE', 'UI'], status: 'done', body: 'Papier ivoire imprimé, trame et encre sèche. La grille 7×7 reste la masse dominante et les nombres conservent le contraste maximal.', facts: ['Pas de chrome futuriste', 'Texture matérielle sobre', 'Grille avant décor'], source: 'DA validée 17/09/2026', image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, imagePosition: '50% 28%', marker: { type: 'rect', x: 18, y: 92, w: 354, h: 374 }, x: 3100, y: 560, links: [screenLink('D-style-grid', 'D1', 195, 275, 'grille + matière'), nodeLink('D-style-release', 'R-mini-slice', 'première traduction')] },
    { id: 'D-lines', ownerScreenId: 'D1', title: 'Découpe 2 · les trois tracés', kind: 'image', tags: ['IMAGE', 'ANIMATION', 'FX'], status: 'review', body: 'Les trois lignes sont des encres/transparences colorées qui traversent les cases sans masquer les valeurs. Les points et flèches rendent l’ordre immédiatement lisible.', facts: ['3 identités couleur', 'Direction visible', 'Intersection lisible'], source: 'DA validée 17/09/2026', image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, imagePosition: '50% 31%', marker: { type: 'draw', x: 0, y: 0, points: [{ x: 91, y: 394 }, { x: 257, y: 158 }] }, x: 4000, y: 650, links: [screenLink('D-lines-board', 'D1', 195, 320, 'tracés'), nodeLink('D-lines-release', 'R-mini-slice', 'première traduction')] },
    { id: 'D-ledger', ownerScreenId: 'D1', title: 'Découpe 3 · registre des résultats', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Sous la grille, chaque ligne possède une rangée typographique compacte avec son identité couleur, sa formule et son résultat. Cette zone doit rester vivante et moteur-owned.', facts: ['3 lignes de résultat', 'Typographie fonctionnelle', 'Aucun faux texte décoratif'], source: 'DA validée 17/09/2026', image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, imagePosition: '50% 65%', marker: { type: 'rect', x: 20, y: 492, w: 350, h: 139 }, x: 3100, y: 1040, links: [screenLink('D-ledger-rows', 'D1', 195, 545, 'résultats'), nodeLink('D-ledger-release', 'R-mini-slice', 'première traduction')] },
    { id: 'D-total', ownerScreenId: 'D1', title: 'Découpe 4 · total', kind: 'image', tags: ['IMAGE', 'UI'], status: 'review', body: 'Le total forme une rupture de hiérarchie nette entre le registre et les commandes, sans devenir plus important que la grille.', facts: ['Somme finale moteur-owned', 'Valeur large et isolée'], source: 'DA validée 17/09/2026', image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, imagePosition: '50% 77%', marker: { type: 'rect', x: 188, y: 633, w: 179, h: 72 }, x: 4000, y: 1160, links: [screenLink('D-total-value', 'D1', 285, 655, 'total'), nodeLink('D-total-release', 'R-mini-slice', 'première traduction')] },
    { id: 'D-controls', ownerScreenId: 'D1', title: 'Découpe 5 · Undo / Validate', kind: 'image', tags: ['IMAGE', 'UI', 'ANIMATION', 'FX'], status: 'blocked', body: 'La forme générale est validée, mais les états interactifs ne sont pas encore dessinés séparément.', facts: ['Undo : normal / désactivé / pressé', 'Validate : désactivé / prêt / pressé', 'Feedback tactile/visuel à produire'], source: 'DA validée 17/09/2026 · états manquants', image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, imagePosition: '50% 94%', marker: { type: 'rect', x: 38, y: 704, w: 316, h: 131 }, x: 3100, y: 1380, links: [screenLink('D-controls-undo', 'D1', 108, 770, 'Undo'), screenLink('D-controls-validate', 'D1', 280, 770, 'Validate'), nodeLink('D-controls-release', 'R-mini-slice', 'première traduction')] },
    { id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', tags: ['GD', 'NOTE'], status: 'todo', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la traduction doit reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },
    { id: 'D-cell-states', ownerScreenId: 'D1', title: 'À produire · états de cellule', kind: 'image', tags: ['IMAGE', 'ANIMATION', 'FX'], status: 'blocked', body: 'La DA montre la cellule au repos, mais pas encore tous les états nécessaires au jeu.', facts: ['case normale / opérateur', 'case jouée/protégée', 'case prochaine dimension', 'intersection', 'fold/unfold de reroll'], source: 'manquant dans la DA validée', marker: { type: 'rect', x: 20, y: 96, w: 98, h: 98 }, x: 3100, y: 1710, links: [] },
    { id: 'D-reroll-motion', ownerScreenId: 'D1', title: 'À produire · reroll papier', kind: 'animation', tags: ['ANIMATION', 'FX', 'SON'], status: 'todo', body: 'Le renouvellement du plateau doit recevoir une traduction papier/impression au lieu de reprendre simplement le flip Orbital.', facts: ['onde courte', 'information lisible pendant le changement', 'version reduced motion'], source: 'manquant · à storyboarder', marker: { type: 'draw', x: 0, y: 0, points: [{ x: 290, y: 170 }, { x: 230, y: 225 }, { x: 175, y: 280 }, { x: 115, y: 340 }] }, x: 4000, y: 1740, links: [nodeLink('D-reroll-release', 'R-mini-slice', 'premier essai à revoir')] },
    { id: 'D-audio', ownerScreenId: 'D1', title: 'À produire · langage sonore', kind: 'audio', tags: ['SON', 'FX'], status: 'todo', body: 'Le Rebirth n’a pas encore de langage sonore propre à son papier imprimé.', facts: ['début de trait', 'passage de case', 'ligne acceptée', 'reroll', 'Undo', 'Validate / total'], source: 'à définir dans le système audio MiniFugg', x: 3100, y: 1940, links: [] },
    { id: 'R-mini-slice', title: 'Mini-tranche live · Lab', kind: 'animation', tags: ['GD', 'IMAGE', 'ANIMATION', 'FX'], status: 'review', body: 'Première traduction jouable de la DA avec les vraies données LineFugg. Elle sert à comparer et corriger ; ce n’est pas encore la Release publique.', facts: ['skin=rebirth-editorial', '390×850', 'règles intactes', 'audio Rebirth absent'], source: 'GameplayCalibrationRuntime / LineFuggScene', x: 5120, y: 690, links: [] },
  ]

  return {
    title: 'LineFugg — Rebirth',
    summary: 'Rebirth repart du vrai LineFugg classique. Le Proto reste la vérité fonctionnelle ; la première DA Rebirth est validée et découpée dans le Lab. Release reste vide tant qu’aucune mini-tranche intégrée n’existe.',
    screens,
    nodes,
  }
}

function buildPlan(game: InstagameDefinition) { return game.id === 'linefugg' ? buildLineFuggPlan(game) : buildGenericPlan(game) }

function referenceGeometry(reference: ReferenceMode) {
  const option = REFERENCE_OPTIONS.find((item) => item.id === reference)
  if (!option?.logicalHeight) return null
  const height = Math.min(MASTER_HEIGHT, option.logicalHeight)
  return { height, maxTop: Math.max(0, MASTER_HEIGHT - height), label: option.label }
}
function recommendedObjectPosition(bias: number) {
  if (bias <= 0.001) return 'top center'
  if (bias >= 0.999) return 'bottom center'
  return `center ${Math.round(bias * 1000) / 10}%`
}

function emptyReview(): ReviewState {
  return {
    annotations: [], reviewNodes: [], reviewLinks: [], comments: {}, referenceAdjustments: {}, linkOverrides: {},
    canonicalLinkSourceOverrides: {}, nodePositionOverrides: {}, deletionRequests: {}, screenImages: {},
  }
}

function endpointReferencesNode(endpoint: LinkEndpoint, nodeId: string, annotations: Annotation[]) {
  if (endpoint.kind === 'node') return endpoint.nodeId === nodeId
  if (endpoint.kind === 'annotation') return annotations.find((item) => item.id === endpoint.annotationId)?.nodeId === nodeId
  return false
}

function endpointReferencesAnnotation(endpoint: LinkEndpoint, annotationId: string) {
  return endpoint.kind === 'annotation' && endpoint.annotationId === annotationId
}

function loadReview(gameId: string, project: PlanProject): ReviewState {
  const base = emptyReview()
  if (typeof window === 'undefined') return base
  try {
    const raw = JSON.parse(localStorage.getItem(`mf-production-review:${gameId}`) || '{}') as any
    const nodes: ReviewNode[] = Array.isArray(raw.reviewNodes) ? raw.reviewNodes.map((node: any) => ({
      id: String(node.id), ownerScreenId: node.ownerScreenId ?? node.screenId,
      title: typeof node.title === 'string' ? node.title : 'Observation',
      text: typeof node.text === 'string' ? node.text : '', reference: typeof node.reference === 'string' ? node.reference : '',
      tags: Array.isArray(node.tags) ? node.tags.filter((tag: unknown): tag is NodeTag => typeof tag === 'string' && NODE_TAGS.includes(tag as NodeTag)) : ['NOTE'],
      x: Number(node.x) || 0, y: Number(node.y) || 0,
    })) : []
    const nodeIds = new Set(nodes.map((node) => node.id))
    const annotations: Annotation[] = []
    if (Array.isArray(raw.annotations)) {
      raw.annotations.forEach((annotation: any, index: number) => {
        const screen = project.screens.find((item) => item.id === annotation.screenId)
        if (!screen) return
        const nodeId = annotation.nodeId ? String(annotation.nodeId) : `N-migrated-${String(annotation.id)}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId, ownerScreenId: screen.id, title: annotation.type === 'note' ? 'Observation' : 'Annotation', text: annotation.text ?? '', reference: '', tags: ['NOTE'],
            x: screen.x + MASTER_WIDTH + 70, y: screen.y + 80 + index * 32,
          })
          nodeIds.add(nodeId)
        }
        annotations.push({
          id: String(annotation.id), screenId: screen.id, nodeId,
          type: annotation.type === 'draw' ? 'draw' : annotation.type === 'rect' ? 'rect' : 'point',
          x: Number(annotation.x) || 0, y: Number(annotation.y) || 0,
          w: annotation.w == null ? undefined : Number(annotation.w), h: annotation.h == null ? undefined : Number(annotation.h),
          points: Array.isArray(annotation.points) ? annotation.points : undefined,
        })
      })
    }

    const reviewLinks: ReviewLink[] = Array.isArray(raw.reviewLinks) ? raw.reviewLinks : []
    annotations.forEach((annotation) => {
      const exists = reviewLinks.some((link) =>
        (link.source.kind === 'node' && link.source.nodeId === annotation.nodeId && endpointReferencesAnnotation(link.target, annotation.id))
        || (link.target.kind === 'node' && link.target.nodeId === annotation.nodeId && endpointReferencesAnnotation(link.source, annotation.id)))
      if (!exists) reviewLinks.push({ id: uid('L'), source: { kind: 'node', nodeId: annotation.nodeId }, target: { kind: 'annotation', annotationId: annotation.id }, kind: 'attachment' })
    })

    // Migration from the previous per-node local link storage.
    if (Array.isArray(raw.reviewNodes)) {
      raw.reviewNodes.forEach((oldNode: any) => {
        if (!Array.isArray(oldNode.links)) return
        oldNode.links.forEach((link: any) => {
          if (!link?.target) return
          reviewLinks.push({ id: link.id ?? uid('L'), source: { kind: 'node', nodeId: String(oldNode.id) }, target: link.target, kind: 'relation' })
        })
      })
    }

    return {
      annotations,
      reviewNodes: nodes,
      reviewLinks,
      comments: raw.comments ?? {},
      referenceAdjustments: raw.referenceAdjustments ?? {},
      linkOverrides: raw.linkOverrides ?? {},
      canonicalLinkSourceOverrides: raw.canonicalLinkSourceOverrides ?? {},
      nodePositionOverrides: raw.nodePositionOverrides ?? {},
      deletionRequests: raw.deletionRequests ?? {},
      screenImages: raw.screenImages ?? {},
    }
  } catch {
    return base
  }
}

function ScreenArtwork({ screen, override }: { screen: PlanScreen; override?: LocalImageOverride }) {
  const src = override?.src ?? screen.image
  if (src) return <img className="mfpl-screen-image" src={src} alt="" draggable={false} />
  return <div className="mfpl-screen-missing"><b>CAPTURE STATIQUE À PRODUIRE</b><span>{screen.title}</span></div>
}

export function ProductionLab() {
  const [gameId, setGameId] = useState('linefugg')
  const game = gameRegistry.find((item) => item.id === gameId) ?? gameRegistry[0]
  const project = useMemo(() => buildPlan(game), [game])
  const screensById = useMemo(() => new Map(project.screens.map((screen) => [screen.id, screen])), [project])
  const canonicalNodesById = useMemo(() => new Map(project.nodes.map((node) => [node.id, node])), [project])

  const [viewMode, setViewMode] = useState<ViewMode>('exploded')
  const [tool, setTool] = useState<ToolMode>(null)
  const [reference, setReference] = useState<ReferenceMode>('minimum')
  const [referenceEditing, setReferenceEditing] = useState(false)
  const [camera, setCamera] = useState<Camera>({ x: 22, y: 36, zoom: 0.34 })
  const [selection, setSelection] = useState<Selection>(null)
  const [collapsedScreens, setCollapsedScreens] = useState<Set<string>>(new Set())
  const [review, setReviewState] = useState<ReviewState>(() => loadReview(game.id, project))
  const [gesture, setGesture] = useState<Gesture>(null)
  const [linkDraft, setLinkDraft] = useState<LinkDraft>(null)
  const [linkGhost, setLinkGhost] = useState<Point | null>(null)
  const [exported, setExported] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const reviewRef = useRef(review)
  const undoRef = useRef<ReviewState[]>([])
  const redoRef = useRef<ReviewState[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<PanState | null>(null)
  const touchesRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<PinchState | null>(null)
  const suppressClickRef = useRef(false)
  const referenceDragRef = useRef<{ pointerId: number; startY: number; bias: number; key: string; maxTop: number; screenHeight: number; before: ReviewState } | null>(null)
  const nodeDragRef = useRef<NodeDrag | null>(null)
  const annotationDragRef = useRef<AnnotationDrag | null>(null)
  const endpointDragRef = useRef<EndpointDrag | null>(null)

  const reviewNodesById = useMemo(() => new Map(review.reviewNodes.map((node) => [node.id, node])), [review.reviewNodes])
  const annotationsById = useMemo(() => new Map(review.annotations.map((annotation) => [annotation.id, annotation])), [review.annotations])

  function assignReview(next: ReviewState) {
    reviewRef.current = next
    setReviewState(next)
  }

  function commitReview(mutator: (current: ReviewState) => ReviewState) {
    const before = reviewRef.current
    const next = mutator(before)
    if (next === before) return
    undoRef.current.push(before)
    if (undoRef.current.length > 120) undoRef.current.shift()
    redoRef.current = []
    assignReview(next)
  }

  function transientReview(mutator: (current: ReviewState) => ReviewState) {
    const current = reviewRef.current
    const next = mutator(current)
    if (next !== current) assignReview(next)
  }

  function recordTransient(before: ReviewState) {
    if (before === reviewRef.current) return
    undoRef.current.push(before)
    if (undoRef.current.length > 120) undoRef.current.shift()
    redoRef.current = []
  }

  function undo() {
    const previous = undoRef.current.pop()
    if (!previous) return
    redoRef.current.push(reviewRef.current)
    assignReview(previous)
    setSelection(null)
    setLinkDraft(null)
  }

  function redo() {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(reviewRef.current)
    assignReview(next)
    setSelection(null)
    setLinkDraft(null)
  }

  useEffect(() => {
    const next = loadReview(game.id, project)
    reviewRef.current = next
    setReviewState(next)
    undoRef.current = []
    redoRef.current = []
    setSelection(null)
    setCollapsedScreens(new Set())
    setReferenceEditing(false)
    setTool(null)
    setLinkDraft(null)
    setCamera({ x: 22, y: 36, zoom: 0.34 })
  }, [game.id, project])

  useEffect(() => {
    try { localStorage.setItem(`mf-production-review:${game.id}`, JSON.stringify(review)) } catch { /* local review can exceed storage with large temporary images */ }
  }, [game.id, review])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isEditable(event.target)) return
      const command = event.ctrlKey || event.metaKey
      if (command && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (command && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (event.key === 'Escape') {
        if (linkDraft) {
          assignReview(linkDraft.before)
          setLinkDraft(null)
          return
        }
        if (tool) { setTool(null); return }
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!selection) return
        event.preventDefault()
        deleteSelection(selection)
        return
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey) return
      const step = event.shiftKey ? 240 : 72
      event.preventDefault()
      setCamera((current) => ({
        ...current,
        x: current.x + (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0),
        y: current.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0),
      }))
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      if (isEditable(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.ctrlKey || event.metaKey) return
      if (event.shiftKey) {
        const rect = viewport.getBoundingClientRect()
        const px = event.clientX - rect.left
        const py = event.clientY - rect.top
        setCamera((current) => {
          const zoom = clamp(current.zoom * Math.exp(-event.deltaY * 0.0024), 0.08, 2.8)
          const worldX = (px - current.x) / current.zoom
          const worldY = (py - current.y) / current.zoom
          return { zoom, x: px - worldX * zoom, y: py - worldY * zoom }
        })
        return
      }
      setCamera((current) => ({ ...current, x: current.x - event.deltaX, y: current.y - event.deltaY }))
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [])

  const selectedScreen = selection?.kind === 'screen' ? screensById.get(selection.id) : undefined
  const selectedCanonicalNode = selection?.kind === 'node' ? canonicalNodesById.get(selection.id) : undefined
  const selectedReviewNode = selection?.kind === 'review-node' ? reviewNodesById.get(selection.id) : undefined
  const selectedAnnotation = selection?.kind === 'annotation' ? annotationsById.get(selection.id) : undefined
  const selectedReviewLink = selection?.kind === 'review-link' ? review.reviewLinks.find((link) => link.id === selection.id) : undefined
  const selectedCanonicalLink = selection?.kind === 'canonical-link'
    ? effectiveCanonicalLinks(selection.sourceNodeId).find((link) => link.id === selection.linkId)
    : undefined
  const selectedKey = selection?.kind === 'canonical-link'
    ? `canonical-link:${selection.sourceNodeId}:${selection.linkId}`
    : selection ? `${selection.kind}:${selection.id}` : ''

  function effectiveCanonicalLinks(nodeId: string) {
    return reviewRef.current.linkOverrides[nodeId] ?? canonicalNodesById.get(nodeId)?.links ?? []
  }

  function canonicalNodePosition(node: PlanNode) {
    return review.nodePositionOverrides[node.id] ?? { x: node.x, y: node.y }
  }

  function reviewNodePosition(node: ReviewNode) { return { x: node.x, y: node.y } }

  function nodePosition(nodeId: string): Point | null {
    const canonical = canonicalNodesById.get(nodeId)
    if (canonical) return canonicalNodePosition(canonical)
    const local = reviewNodesById.get(nodeId)
    return local ? reviewNodePosition(local) : null
  }

  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {
    const position = nodePosition(nodeId)
    return position ? { x: position.x, y: position.y, w: NODE_WIDTH, h: NODE_HEIGHT } : null
  }

  function annotationBounds(annotationId: string): { x: number; y: number; w: number; h: number } | null {
    const annotation = annotationsById.get(annotationId)
    const screen = annotation ? screensById.get(annotation.screenId) : undefined
    if (!annotation || !screen) return null
    if (annotation.type === 'rect') return { x: screen.x + annotation.x, y: screen.y + annotation.y, w: Math.max(1, annotation.w ?? 1), h: Math.max(1, annotation.h ?? 1) }
    if (annotation.type === 'draw' && annotation.points?.length) {
      const xs = annotation.points.map((point) => point.x)
      const ys = annotation.points.map((point) => point.y)
      const x = Math.min(...xs), y = Math.min(...ys)
      return { x: screen.x + x, y: screen.y + y, w: Math.max(12, Math.max(...xs) - x), h: Math.max(12, Math.max(...ys) - y) }
    }
    return { x: screen.x + annotation.x - 5, y: screen.y + annotation.y - 5, w: 10, h: 10 }
  }

  function rectCenter(rect: { x: number; y: number; w: number; h: number }) {
    return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }
  }

  function borderPoint(rect: { x: number; y: number; w: number; h: number }, toward: Point): Point {
    const center = rectCenter(rect)
    const dx = toward.x - center.x, dy = toward.y - center.y
    if (Math.abs(dx) < .0001 && Math.abs(dy) < .0001) return center
    const sx = Math.abs(dx) < .0001 ? Infinity : rect.w / 2 / Math.abs(dx)
    const sy = Math.abs(dy) < .0001 ? Infinity : rect.h / 2 / Math.abs(dy)
    const scale = Math.min(sx, sy)
    return { x: center.x + dx * scale, y: center.y + dy * scale }
  }

  function closestPointOnRect(point: Point, rect: { x: number; y: number; w: number; h: number }): Point {
    const inside = point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h
    if (!inside) return { x: clamp(point.x, rect.x, rect.x + rect.w), y: clamp(point.y, rect.y, rect.y + rect.h) }
    const candidates = [
      { d: Math.abs(point.x - rect.x), p: { x: rect.x, y: point.y } },
      { d: Math.abs(point.x - rect.x - rect.w), p: { x: rect.x + rect.w, y: point.y } },
      { d: Math.abs(point.y - rect.y), p: { x: point.x, y: rect.y } },
      { d: Math.abs(point.y - rect.y - rect.h), p: { x: point.x, y: rect.y + rect.h } },
    ].sort((a, b) => a.d - b.d)
    return candidates[0].p
  }

  function endpointCenter(endpoint: LinkEndpoint): Point | null {
    if (endpoint.kind === 'node') {
      const rect = nodeBounds(endpoint.nodeId)
      return rect ? rectCenter(rect) : null
    }
    if (endpoint.kind === 'annotation') {
      const rect = annotationBounds(endpoint.annotationId)
      return rect ? rectCenter(rect) : null
    }
    const screen = screensById.get(endpoint.screenId)
    return screen ? { x: screen.x + endpoint.point.x, y: screen.y + endpoint.point.y } : null
  }

  function visualEndpoint(endpoint: LinkEndpoint, toward: Point): Point | null {
    if (endpoint.kind === 'node') {
      const rect = nodeBounds(endpoint.nodeId)
      return rect ? borderPoint(rect, toward) : null
    }
    if (endpoint.kind === 'annotation') {
      const annotation = annotationsById.get(endpoint.annotationId)
      const rect = annotationBounds(endpoint.annotationId)
      if (!rect) return null
      return annotation?.type === 'point' ? rectCenter(rect) : borderPoint(rect, toward)
    }
    return endpointCenter(endpoint)
  }

  function magneticPoint(endpoint: LinkEndpoint, toward: Point): Point | null {
    if (endpoint.kind === 'node') {
      const rect = nodeBounds(endpoint.nodeId)
      return rect ? closestPointOnRect(toward, rect) : null
    }
    if (endpoint.kind === 'annotation') {
      const annotation = annotationsById.get(endpoint.annotationId)
      const rect = annotationBounds(endpoint.annotationId)
      if (!rect) return null
      return annotation?.type === 'point' ? rectCenter(rect) : closestPointOnRect(toward, rect)
    }
    return endpointCenter(endpoint)
  }

  function linkGeometry(sourceEndpoint: LinkEndpoint, targetEndpoint: LinkEndpoint) {
    const sourceCenter = endpointCenter(sourceEndpoint)
    const targetCenter = endpointCenter(targetEndpoint)
    if (!sourceCenter || !targetCenter) return null
    const source = visualEndpoint(sourceEndpoint, targetCenter)
    const target = visualEndpoint(targetEndpoint, sourceCenter)
    return source && target ? { source, target } : null
  }

  function visibleNode(ownerScreenId?: string) {
    return viewMode === 'exploded' && (!ownerScreenId || !collapsedScreens.has(ownerScreenId))
  }

  const renderedCanonicalNodes = project.nodes.filter((node) => visibleNode(node.ownerScreenId))
  const renderedReviewNodes = review.reviewNodes.filter((node) => visibleNode(node.ownerScreenId))

  function nodeState(nodeId: string): StateId | null {
    const node = project.nodes.find((candidate) => candidate.id === nodeId) ?? review.reviewNodes.find((candidate) => candidate.id === nodeId)
    if (!node?.ownerScreenId) return null
    return project.screens.find((screen) => screen.id === node.ownerScreenId)?.state ?? null
  }

  function isCrossZoneNodeLink(source: LinkEndpoint, target: LinkEndpoint) {
    if (source.kind !== 'node' || target.kind !== 'node') return false
    const sourceState = nodeState(source.nodeId)
    const targetState = nodeState(target.nodeId)
    return Boolean(sourceState && targetState && sourceState !== targetState)
  }

  function referenceKey(screen: PlanScreen) { return screen.state === 'covers' ? `screen:${screen.id}` : `state:${screen.state}` }
  function defaultReferenceBias(screen: PlanScreen) {
    if (screen.state === 'covers') return screen.referenceBias ?? anchorBias(screen.anchor)
    const first = project.screens.find((candidate) => candidate.state === screen.state)
    return first?.referenceBias ?? anchorBias(first?.anchor)
  }
  function screenReferenceBias(screen: PlanScreen) { return clamp(review.referenceAdjustments[referenceKey(screen)]?.bias ?? defaultReferenceBias(screen), 0, 1) }
  function referenceWindow(screen: PlanScreen) {
    const geometry = referenceGeometry(reference)
    if (!geometry) return null
    const bias = screenReferenceBias(screen)
    return { ...geometry, bias, top: geometry.maxTop * bias }
  }

  function setReferenceBias(screen: PlanScreen, bias: number) {
    const key = referenceKey(screen)
    commitReview((current) => ({ ...current, referenceAdjustments: { ...current.referenceAdjustments, [key]: { bias: clamp(bias, 0, 1) } } }))
  }

  function resetReference(screen: PlanScreen) {
    const key = referenceKey(screen)
    commitReview((current) => {
      if (!(key in current.referenceAdjustments)) return current
      const next = { ...current.referenceAdjustments }
      delete next[key]
      return { ...current, referenceAdjustments: next }
    })
  }

  function startReferenceDrag(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen, maxTop: number) {
    if (!referenceEditing || !selectedScreen || selectedScreen.id !== screen.id || maxTop <= 0) return
    event.stopPropagation()
    const rect = event.currentTarget.parentElement?.getBoundingClientRect()
    referenceDragRef.current = {
      pointerId: event.pointerId, startY: event.clientY, bias: screenReferenceBias(screen), key: referenceKey(screen), maxTop,
      screenHeight: rect?.height ?? MASTER_HEIGHT, before: reviewRef.current,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveReferenceDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = referenceDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const logicalDelta = (event.clientY - drag.startY) / Math.max(1, drag.screenHeight) * MASTER_HEIGHT
    transientReview((current) => ({ ...current, referenceAdjustments: { ...current.referenceAdjustments, [drag.key]: { bias: clamp(drag.bias + logicalDelta / Math.max(1, drag.maxTop), 0, 1) } } }))
  }

  function endReferenceDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = referenceDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    referenceDragRef.current = null
    recordTransient(drag.before)
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  function clientToWorld(clientX: number, clientY: number): Point | null {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: (clientX - rect.left - camera.x) / camera.zoom, y: (clientY - rect.top - camera.y) / camera.zoom }
  }

  function pointInElement(event: { currentTarget: HTMLElement; clientX: number; clientY: number }) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) }
  }

  function nodePlacementForScreen(screen: PlanScreen, point: Point, state: ReviewState) {
    const count = state.reviewNodes.filter((node) => node.ownerScreenId === screen.id).length
    const onLeft = point.x < MASTER_WIDTH / 2
    return {
      x: onLeft ? screen.x - NODE_WIDTH - 75 : screen.x + MASTER_WIDTH + 75,
      y: screen.y + clamp(point.y - 70 + (count % 5) * 22, 36, MASTER_HEIGHT - 190),
    }
  }

  function addAnnotationBundle(state: ReviewState, screen: PlanScreen, type: AnnotationType, geometry: Partial<Annotation>, title = 'Observation') {
    const nodeId = uid('N')
    const annotationId = uid('A')
    const linkId = uid('L')
    const point = type === 'rect'
      ? { x: Number(geometry.x) + Number(geometry.w) / 2, y: Number(geometry.y) + Number(geometry.h) / 2 }
      : type === 'draw' && geometry.points?.length
        ? geometry.points[Math.floor(geometry.points.length / 2)]
        : { x: Number(geometry.x), y: Number(geometry.y) }
    const placement = nodePlacementForScreen(screen, point, state)
    const annotation: Annotation = {
      id: annotationId, screenId: screen.id, nodeId, type,
      x: Number(geometry.x) || 0, y: Number(geometry.y) || 0,
      w: geometry.w, h: geometry.h, points: geometry.points,
    }
    const node: ReviewNode = {
      id: nodeId, ownerScreenId: screen.id, title, text: '', reference: '', tags: ['NOTE'], x: placement.x, y: placement.y,
    }
    const link: ReviewLink = {
      id: linkId, source: { kind: 'node', nodeId }, target: { kind: 'annotation', annotationId }, kind: 'attachment',
    }
    return {
      state: { ...state, annotations: [...state.annotations, annotation], reviewNodes: [...state.reviewNodes, node], reviewLinks: [...state.reviewLinks, link] },
      annotation, node, endpoint: { kind: 'annotation', annotationId } as LinkEndpoint,
    }
  }

  function addNodeAtWorld(world: Point) {
    const id = uid('N')
    commitReview((current) => ({ ...current, reviewNodes: [...current.reviewNodes, { id, title: 'Observation', text: '', reference: '', tags: ['NOTE'], x: world.x - NODE_WIDTH / 2, y: world.y - 40 }] }))
    setSelection({ kind: 'review-node', id })
    setViewMode('exploded')
    setTool(null)
  }

  function addNodeLinkedToScreen(screen: PlanScreen, point: Point) {
    const id = uid('N')
    const linkId = uid('L')
    commitReview((current) => {
      const placement = nodePlacementForScreen(screen, point, current)
      return {
        ...current,
        reviewNodes: [...current.reviewNodes, { id, ownerScreenId: screen.id, title: 'Observation', text: '', reference: '', tags: ['NOTE'], x: placement.x, y: placement.y }],
        reviewLinks: [...current.reviewLinks, { id: linkId, source: { kind: 'node', nodeId: id }, target: { kind: 'screen', screenId: screen.id, point }, kind: 'attachment' }],
      }
    })
    setSelection({ kind: 'review-node', id })
    setViewMode('exploded')
    setTool(null)
  }

  function addPointObservation(screen: PlanScreen, point: Point, title = 'Observation') {
    let nodeId = ''
    commitReview((current) => {
      const result = addAnnotationBundle(current, screen, 'point', point, title)
      nodeId = result.node.id
      return result.state
    })
    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })
    setViewMode('exploded')
    setTool(null)
  }

  function startOrFinishLink(endpoint: LinkEndpoint, nextState?: ReviewState) {
    if (!linkDraft) {
      const before = reviewRef.current
      if (nextState) assignReview(nextState)
      setLinkDraft({ endpoint, before })
      return
    }
    const current = nextState ?? reviewRef.current
    const id = uid('L')
    const finalState: ReviewState = { ...current, reviewLinks: [...current.reviewLinks, { id, source: linkDraft.endpoint, target: endpoint, kind: 'relation' }] }
    undoRef.current.push(linkDraft.before)
    if (undoRef.current.length > 120) undoRef.current.shift()
    redoRef.current = []
    assignReview(finalState)
    setLinkDraft(null)
    setTool(null)
    setSelection({ kind: 'review-link', id })
  }

  function linkScreenPoint(screen: PlanScreen, point: Point) {
    const result = addAnnotationBundle(reviewRef.current, screen, 'point', point, 'Point de lien')
    startOrFinishLink(result.endpoint, result.state)
  }

  function linkEndpoint(endpoint: LinkEndpoint) { startOrFinishLink(endpoint) }

  function screenPointerDown(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (tool !== 'rect' && tool !== 'draw') return
    event.stopPropagation()
    const point = pointInElement(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    setGesture({ screenId: screen.id, type: tool, start: point, current: point, points: [point] })
  }

  function screenPointerMove(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = pointInElement(event)
    setGesture((current) => current ? { ...current, current: point, points: current.type === 'draw' ? [...current.points, point] : current.points } : current)
  }

  function screenPointerUp(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = pointInElement(event)
    let nodeId = ''
    if (gesture.type === 'rect') {
      const x = Math.min(gesture.start.x, point.x), y = Math.min(gesture.start.y, point.y)
      const w = Math.abs(point.x - gesture.start.x), h = Math.abs(point.y - gesture.start.y)
      if (w > 4 && h > 4) commitReview((current) => {
        const result = addAnnotationBundle(current, screen, 'rect', { x, y, w, h }, 'Observation de zone')
        nodeId = result.node.id
        return result.state
      })
    } else if (gesture.points.length > 1) {
      commitReview((current) => {
        const result = addAnnotationBundle(current, screen, 'draw', { x: 0, y: 0, points: [...gesture.points, point] }, 'Observation dessinée')
        nodeId = result.node.id
        return result.state
      })
    }
    setGesture(null)
    setTool(null)
    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })
    setViewMode('exploded')
  }

  function screenClick(event: React.MouseEvent<HTMLDivElement>, screen: PlanScreen) {
    event.stopPropagation()
    if (ignoreClickAfterPan()) return
    const point = pointInElement(event)
    if (tool === 'link') return void linkScreenPoint(screen, point)
    if (tool === 'point') return void addPointObservation(screen, point)
    if (tool === 'node') return void addNodeLinkedToScreen(screen, point)
    if (tool === 'rect' || tool === 'draw') return
    setSelection({ kind: 'screen', id: screen.id })
  }

  function annotationClick(event: React.MouseEvent, annotation: Annotation) {
    event.stopPropagation()
    if (ignoreClickAfterPan()) return
    if (tool === 'link') return void linkEndpoint({ kind: 'annotation', annotationId: annotation.id })
    setSelection({ kind: 'annotation', id: annotation.id })
  }

  function nodePointerDown(event: ReactPointerEvent<HTMLElement>, nodeId: string, isReview: boolean) {
    if (tool === 'link') return
    if (event.button !== 0 || tool) return
    event.stopPropagation()
    const position = nodePosition(nodeId)
    if (!position) return
    nodeDragRef.current = {
      pointerId: event.pointerId, nodeId, review: isReview, startX: event.clientX, startY: event.clientY,
      origin: position, before: reviewRef.current, moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function nodePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = nodeDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = (event.clientX - drag.startX) / camera.zoom
    const dy = (event.clientY - drag.startY) / camera.zoom
    if (!drag.moved && Math.hypot(dx, dy) > 3 / camera.zoom) drag.moved = true
    if (!drag.moved) return
    transientReview((current) => {
      if (drag.review) return { ...current, reviewNodes: current.reviewNodes.map((node) => node.id === drag.nodeId ? { ...node, x: drag.origin.x + dx, y: drag.origin.y + dy } : node) }
      return { ...current, nodePositionOverrides: { ...current.nodePositionOverrides, [drag.nodeId]: { x: drag.origin.x + dx, y: drag.origin.y + dy } } }
    })
  }

  function nodePointerUp(event: ReactPointerEvent<HTMLElement>, nodeId: string, isReview: boolean) {
    const drag = nodeDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    nodeDragRef.current = null
    if (drag.moved) {
      recordTransient(drag.before)
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    } else setSelection({ kind: isReview ? 'review-node' : 'node', id: nodeId })
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  function annotationPointerDown(event: ReactPointerEvent<HTMLElement>, annotation: Annotation) {
    if (tool || annotation.type !== 'point' || event.button !== 0) return
    event.stopPropagation()
    annotationDragRef.current = {
      pointerId: event.pointerId, annotationId: annotation.id, startX: event.clientX, startY: event.clientY,
      origin: { x: annotation.x, y: annotation.y }, before: reviewRef.current, moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function annotationPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = annotationDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = (event.clientX - drag.startX) / camera.zoom
    const dy = (event.clientY - drag.startY) / camera.zoom
    if (!drag.moved && Math.hypot(dx, dy) > 3 / camera.zoom) drag.moved = true
    if (!drag.moved) return
    transientReview((current) => ({ ...current, annotations: current.annotations.map((annotation) => annotation.id === drag.annotationId ? { ...annotation, x: clamp(drag.origin.x + dx, 0, MASTER_WIDTH), y: clamp(drag.origin.y + dy, 0, MASTER_HEIGHT) } : annotation) }))
  }

  function annotationPointerUp(event: ReactPointerEvent<HTMLElement>, annotation: Annotation) {
    const drag = annotationDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    annotationDragRef.current = null
    if (drag.moved) {
      recordTransient(drag.before)
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    } else setSelection({ kind: 'annotation', id: annotation.id })
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  function directEndpointAt(clientX: number, clientY: number): LinkEndpoint | null {
    const elements = document.elementsFromPoint(clientX, clientY)
    for (const element of elements) {
      const nodeElement = element.closest<HTMLElement>('[data-node-id]')
      if (nodeElement?.dataset.nodeId) return { kind: 'node', nodeId: nodeElement.dataset.nodeId }
      const annotationElement = element.closest<HTMLElement>('[data-annotation-id]')
      if (annotationElement?.dataset.annotationId) return { kind: 'annotation', annotationId: annotationElement.dataset.annotationId }
    }
    return null
  }

  function screenEndpointAt(clientX: number, clientY: number): LinkEndpoint | null {
    const elements = document.elementsFromPoint(clientX, clientY)
    for (const element of elements) {
      const screenElement = element.closest<HTMLElement>('[data-screen-id]')
      if (!screenElement?.dataset.screenId) continue
      const rect = screenElement.getBoundingClientRect()
      return {
        kind: 'screen', screenId: screenElement.dataset.screenId,
        point: { x: clamp((clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) },
      }
    }
    return null
  }

  function nearestMagnet(world: Point, thresholdPx: number, exclude?: LinkEndpoint): { endpoint: LinkEndpoint; point: Point; distance: number } | null {
    const threshold = thresholdPx / camera.zoom
    let best: { endpoint: LinkEndpoint; point: Point; distance: number } | null = null
    const same = (a: LinkEndpoint, b: LinkEndpoint) => a.kind === b.kind && (
      a.kind === 'node' && b.kind === 'node' ? a.nodeId === b.nodeId
        : a.kind === 'annotation' && b.kind === 'annotation' ? a.annotationId === b.annotationId
          : false)
    const consider = (endpoint: LinkEndpoint, point: Point) => {
      if (exclude && same(endpoint, exclude)) return
      const d = distance(world, point)
      if (d <= threshold && (!best || d < best.distance)) best = { endpoint, point, distance: d }
    }
    for (const node of [...project.nodes, ...reviewRef.current.reviewNodes]) {
      const rect = nodeBounds(node.id)
      if (rect) consider({ kind: 'node', nodeId: node.id }, closestPointOnRect(world, rect))
    }
    for (const annotation of reviewRef.current.annotations) {
      const rect = annotationBounds(annotation.id)
      if (!rect) continue
      consider({ kind: 'annotation', annotationId: annotation.id }, annotation.type === 'point' ? rectCenter(rect) : closestPointOnRect(world, rect))
    }
    return best as { endpoint: LinkEndpoint; point: Point; distance: number } | null
  }

  function resolveEndpointAt(clientX: number, clientY: number, exclude?: LinkEndpoint): LinkEndpoint | null {
    const direct = directEndpointAt(clientX, clientY)
    if (direct) return direct
    const world = clientToWorld(clientX, clientY)
    if (world) {
      const magnet = nearestMagnet(world, SNAP_IN_PX, exclude)
      if (magnet) return magnet.endpoint
    }
    return screenEndpointAt(clientX, clientY)
  }

  function startEndpointDrag(event: ReactPointerEvent<SVGCircleElement>, drag: Omit<EndpointDrag, 'pointerId' | 'before' | 'original' | 'snapped'>) {
    event.stopPropagation()
    if (endpointDragRef.current) return
    let original: LinkEndpoint | null = null
    if (drag.kind === 'canonical' && drag.sourceNodeId) {
      const key = `${drag.sourceNodeId}:${drag.linkId}`
      const link = effectiveCanonicalLinks(drag.sourceNodeId).find((item) => item.id === drag.linkId)
      original = drag.side === 'source'
        ? reviewRef.current.canonicalLinkSourceOverrides[key] ?? { kind: 'node', nodeId: drag.sourceNodeId }
        : link?.target ?? null
    } else {
      const link = reviewRef.current.reviewLinks.find((item) => item.id === drag.linkId)
      original = link ? link[drag.side] : null
    }
    if (!original) return
    endpointDragRef.current = { ...drag, pointerId: event.pointerId, before: reviewRef.current, original, snapped: original }
    setLinkGhost(clientToWorld(event.clientX, event.clientY))
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveEndpointDrag(event: ReactPointerEvent<SVGCircleElement>) {
    const drag = endpointDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const world = clientToWorld(event.clientX, event.clientY)
    if (!world) return

    if (drag.snapped) {
      const snapPoint = magneticPoint(drag.snapped, world)
      if (snapPoint && distance(world, snapPoint) <= SNAP_OUT_PX / camera.zoom) {
        setLinkGhost(snapPoint)
        return
      }
      drag.snapped = null
    }

    const direct = directEndpointAt(event.clientX, event.clientY)
    if (direct) {
      drag.snapped = direct
      setLinkGhost(visualEndpoint(direct, world) ?? endpointCenter(direct))
      return
    }
    const magnet = nearestMagnet(world, SNAP_IN_PX, drag.original)
    if (magnet) {
      drag.snapped = magnet.endpoint
      setLinkGhost(magnet.point)
      return
    }
    setLinkGhost(world)
  }

  function endEndpointDrag(event: ReactPointerEvent<SVGCircleElement>) {
    const drag = endpointDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    endpointDragRef.current = null
    setLinkGhost(null)
    const endpoint = drag.snapped ?? resolveEndpointAt(event.clientX, event.clientY, drag.original)
    if (!endpoint) return
    if (drag.kind === 'canonical' && drag.sourceNodeId) {
      if (drag.side === 'source') {
        const key = `${drag.sourceNodeId}:${drag.linkId}`
        commitReview((current) => ({ ...current, canonicalLinkSourceOverrides: { ...current.canonicalLinkSourceOverrides, [key]: endpoint } }))
      } else {
        commitReview((current) => {
          const base = current.linkOverrides[drag.sourceNodeId!] ?? canonicalNodesById.get(drag.sourceNodeId!)?.links ?? []
          return { ...current, linkOverrides: { ...current.linkOverrides, [drag.sourceNodeId!]: base.map((link) => link.id === drag.linkId ? { ...link, target: endpoint } : link) } }
        })
      }
    } else {
      commitReview((current) => ({ ...current, reviewLinks: current.reviewLinks.map((link) => link.id === drag.linkId ? { ...link, [drag.side]: endpoint } : link) }))
    }
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  function pointerDownCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool || (event.target instanceof Element && event.target.closest('.mfpl-node,.mfpl-annotation-hit,.mfpl-link-handle,[data-reference-drag="true"]'))) return
    if (event.pointerType !== 'touch' && event.button !== 0 && event.button !== 1) return
    if (event.pointerType === 'touch') {
      touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchesRef.current.size === 2) {
        panRef.current = null
        const [a, b] = [...touchesRef.current.values()]
        const center = midpoint(a, b)
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return
        const px = center.x - rect.left
        const py = center.y - rect.top
        pinchRef.current = { distance: Math.max(1, distance(a, b)), worldX: (px - camera.x) / camera.zoom, worldY: (py - camera.y) / camera.zoom, camera }
        return
      }
    }
    panRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, camera, moved: false }
  }

  function pointerMoveCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' && touchesRef.current.has(event.pointerId)) {
      touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (touchesRef.current.size >= 2 && pinchRef.current) {
        const [a, b] = [...touchesRef.current.values()]
        const center = midpoint(a, b)
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return
        const px = center.x - rect.left
        const py = center.y - rect.top
        const zoom = clamp(pinchRef.current.camera.zoom * distance(a, b) / pinchRef.current.distance, 0.08, 2.8)
        setCamera({ zoom, x: px - pinchRef.current.worldX * zoom, y: py - pinchRef.current.worldY * zoom })
        suppressClickRef.current = true
        return
      }
    }
    const pan = panRef.current
    if (!pan || pan.pointerId !== event.pointerId) return
    const dx = event.clientX - pan.startX
    const dy = event.clientY - pan.startY
    if (!pan.moved && Math.hypot(dx, dy) > 4) {
      pan.moved = true
      suppressClickRef.current = true
      try { viewportRef.current?.setPointerCapture(event.pointerId) } catch { /* enhancement only */ }
    }
    if (pan.moved) setCamera({ ...pan.camera, x: pan.camera.x + dx, y: pan.camera.y + dy })
  }

  function pointerEndCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') {
      touchesRef.current.delete(event.pointerId)
      if (touchesRef.current.size < 2) pinchRef.current = null
      const remaining = [...touchesRef.current.entries()][0]
      if (remaining) panRef.current = { pointerId: remaining[0], startX: remaining[1].x, startY: remaining[1].y, camera, moved: false }
    }
    if (panRef.current?.pointerId === event.pointerId) panRef.current = null
    window.setTimeout(() => { suppressClickRef.current = false }, 0)
  }

  function ignoreClickAfterPan() {
    if (!suppressClickRef.current) return false
    suppressClickRef.current = false
    return true
  }

  function removeLocalNode(state: ReviewState, nodeId: string) {
    const annotationIds = new Set(state.annotations.filter((annotation) => annotation.nodeId === nodeId).map((annotation) => annotation.id))
    return {
      ...state,
      reviewNodes: state.reviewNodes.filter((node) => node.id !== nodeId),
      annotations: state.annotations.filter((annotation) => annotation.nodeId !== nodeId),
      reviewLinks: state.reviewLinks.filter((link) =>
        !endpointReferencesNode(link.source, nodeId, state.annotations)
        && !endpointReferencesNode(link.target, nodeId, state.annotations)
        && !(link.source.kind === 'annotation' && annotationIds.has(link.source.annotationId))
        && !(link.target.kind === 'annotation' && annotationIds.has(link.target.annotationId))),
    }
  }

  function requestCanonicalDeletion(request: DeletionRequest) {
    commitReview((current) => {
      const key = deletionKey(request)
      const next = { ...current.deletionRequests }
      if (next[key]) delete next[key]
      else next[key] = request
      return { ...current, deletionRequests: next }
    })
  }

  function deleteSelection(target: NonNullable<Selection>) {
    if (target.kind === 'review-node') {
      commitReview((current) => removeLocalNode(current, target.id))
      setSelection(null)
      return
    }
    if (target.kind === 'annotation') {
      const annotation = reviewRef.current.annotations.find((item) => item.id === target.id)
      if (!annotation) return
      commitReview((current) => removeLocalNode(current, annotation.nodeId))
      setSelection(null)
      return
    }
    if (target.kind === 'review-link') {
      commitReview((current) => ({ ...current, reviewLinks: current.reviewLinks.filter((link) => link.id !== target.id) }))
      setSelection(null)
      return
    }
    if (target.kind === 'node') {
      requestCanonicalDeletion({ kind: 'node', targetId: target.id })
      return
    }
    if (target.kind === 'canonical-link') {
      requestCanonicalDeletion({ kind: 'canonical-link', targetId: target.linkId, sourceNodeId: target.sourceNodeId })
      return
    }
    if (target.kind === 'screen' && reviewRef.current.screenImages[target.id]) {
      commitReview((current) => {
        const images = { ...current.screenImages }
        delete images[target.id]
        return { ...current, screenImages: images }
      })
    }
  }

  function setScreenImageFile(screenId: string, file?: File) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      if (!src) return
      commitReview((current) => ({ ...current, screenImages: { ...current.screenImages, [screenId]: { name: file.name, type: file.type, size: file.size, src } } }))
      setSelection({ kind: 'screen', id: screenId })
    }
    reader.readAsDataURL(file)
  }

  function resetLocalReview() {
    if (!window.confirm('Revenir exactement au Plan canonique initial et supprimer toutes les modifications locales de ce jeu ?')) return
    const next = emptyReview()
    try { localStorage.setItem(`mf-production-review:${game.id}`, JSON.stringify(next)) } catch { /* no-op */ }
    assignReview(next)
    undoRef.current = []
    redoRef.current = []
    panRef.current = null
    pinchRef.current = null
    nodeDragRef.current = null
    annotationDragRef.current = null
    endpointDragRef.current = null
    touchesRef.current.clear()
    setSelection(null)
    setTool(null)
    setLinkDraft(null)
    setLinkGhost(null)
    setGesture(null)
    setReferenceEditing(false)
    setReference('minimum')
    setViewMode('exploded')
    setCollapsedScreens(new Set())
    setCamera({ x: 22, y: 36, zoom: 0.34 })
    setExported(false)
    setResetDone(true)
    window.setTimeout(() => setResetDone(false), 1400)
  }

  async function copyForChatGPT() {
    const screenImages = Object.fromEntries(Object.entries(review.screenImages).map(([id, image]) => [id, { name: image.name, type: image.type, size: image.size }]))
    const payload = {
      kind: 'MINIFUGG_PRODUCTION_REVIEW_ALPHA', project: project.title, gameId: game.id, viewMode, reference,
      comments: Object.fromEntries(Object.entries(review.comments).filter(([, value]) => value.trim())),
      annotations: review.annotations, draftNodes: review.reviewNodes, reviewLinks: review.reviewLinks,
      referenceAdjustments: review.referenceAdjustments, linkOverrides: review.linkOverrides,
      canonicalLinkSourceOverrides: review.canonicalLinkSourceOverrides,
      nodePositionOverrides: review.nodePositionOverrides, deletionRequests: Object.values(review.deletionRequests),
      screenImages, simplifiedScreens: [...collapsedScreens],
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setExported(true)
    window.setTimeout(() => setExported(false), 1400)
  }

  function toggleScreen(id: string) {
    setCollapsedScreens((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function fitPlan() { setCamera({ x: 22, y: 36, zoom: 0.25 }) }

  function endpointSelected(endpoint: LinkEndpoint) {
    if (selection?.kind === 'annotation' && endpoint.kind === 'annotation') return endpoint.annotationId === selection.id
    if (selection?.kind === 'review-node' || selection?.kind === 'node') return endpointReferencesNode(endpoint, selection.id, review.annotations)
    return false
  }

  function reviewLinkHighlighted(link: ReviewLink) {
    if (selection?.kind === 'review-link') return selection.id === link.id
    if (selection?.kind === 'review-node' || selection?.kind === 'node') {
      return endpointReferencesNode(link.source, selection.id, review.annotations) || endpointReferencesNode(link.target, selection.id, review.annotations)
    }
    if (selection?.kind === 'annotation') return endpointSelected(link.source) || endpointSelected(link.target)
    return false
  }

  const labelScale = clamp(1 / Math.max(camera.zoom, 0.22), 1, 4.5)
  const selectedNodeId = selection?.kind === 'node' || selection?.kind === 'review-node' ? selection.id : null
  const selectedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.ownerScreenId === selectedScreen.id) : []

  return <main className="mfpl">
    <header className="mfpl-topbar">
      <strong>MiniFugg Production Lab</strong>
      <label>Jeu<select value={game.id} onChange={(event) => setGameId(event.target.value)}>{gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}</select></label>
      <div className="mfpl-project-summary">{project.summary}</div>
      <div className="mfpl-spacer" />
      <div className="mfpl-segmented"><button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Simplifiée</button><button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Éclatée</button></div>
      <label>Repère<select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>{REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className={`mfpl-reference-edit ${referenceEditing ? 'is-active' : ''}`} title={referenceEditing ? 'Terminer le calage' : 'Éditer le calage'} disabled={!selectedScreen || reference === 'off'} onClick={() => setReferenceEditing((current) => !current)}>{referenceEditing ? '✓' : '✎'}</button>
      <button className="mfpl-reset-review" title="Réinitialiser complètement la revue locale" onClick={resetLocalReview}>{resetDone ? '✓' : '↺'}</button>
      <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
    </header>

    <div className={`mfpl-layout ${selection ? 'has-inspector' : ''}`}>
      <aside className="mfpl-tools" aria-label="Outils de revue">
        {([['node','N','Nœud'],['point','•','Point'],['rect','□','Zone'],['draw','✎','Dessin'],['link','↗','Lien']] as Array<[Exclude<ToolMode, null>, string, string]>).map(([id, icon, label]) => <button key={id} className={tool === id ? 'is-active' : ''} onClick={() => {
          if (linkDraft) { assignReview(linkDraft.before); setLinkDraft(null) }
          setTool((current) => current === id ? null : id)
        }} title={`${label} · usage unique`}><b>{icon}</b><span>{label}</span></button>)}
        <div className="mfpl-tool-spacer" />
        <button onClick={fitPlan} title="Vue globale"><b>⌗</b><span>Plan</span></button>
      </aside>

      <section
        ref={viewportRef}
        className={`mfpl-viewport ${tool === 'link' ? 'is-linking' : ''}`}
        onPointerDownCapture={pointerDownCapture}
        onPointerMoveCapture={pointerMoveCapture}
        onPointerUpCapture={pointerEndCapture}
        onPointerCancelCapture={pointerEndCapture}
        onClick={(event) => {
          if (ignoreClickAfterPan()) return
          if (!(event.target instanceof Element)) return
          if (event.target.closest('.mfpl-screen,.mfpl-node,.mfpl-annotation-hit,.mfpl-link-hit,.mfpl-link-handle,.mfpl-reference-window')) return
          if (tool === 'node') {
            const world = clientToWorld(event.clientX, event.clientY)
            if (world) addNodeAtWorld(world)
            return
          }
          if (!tool) setSelection(null)
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}% · molette = déplacer · Maj+molette / pincement = zoom · Ctrl+Z = annuler</div>
        {tool === 'link' && <div className="mfpl-link-hint">{linkDraft ? '2/2 · choisis la seconde extrémité' : '1/2 · clique un nœud, une zone, un dessin ou un endroit dans un écran'}<span>Échap annule</span></div>}
        <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
          {ZONES.map((zone) => <div key={zone.id} className={`mfpl-zone is-${zone.id}`} style={{ left: zone.x, width: zone.width, height: WORLD_HEIGHT }}><div className="mfpl-state-title"><b>{STATE_LABEL[zone.id]}</b><span>{zone.subtitle}</span>{!project.screens.some((screen) => screen.state === zone.id) && <em>vide pour le moment</em>}</div></div>)}

          {viewMode === 'exploded' && <svg className="mfpl-links mfpl-links-underlay" width={WORLD_WIDTH} height={WORLD_HEIGHT}>
            {renderedCanonicalNodes.flatMap((node) => effectiveCanonicalLinks(node.id).map((link) => {
              const sourceEndpoint: LinkEndpoint = review.canonicalLinkSourceOverrides[`${node.id}:${link.id}`] ?? { kind: 'node', nodeId: node.id }
              if (!isCrossZoneNodeLink(sourceEndpoint, link.target)) return null
              const geometry = linkGeometry(sourceEndpoint, link.target)
              return geometry ? <line key={`under:${node.id}:${link.id}`} className="mfpl-link mfpl-link-cross-zone" x1={geometry.source.x} y1={geometry.source.y} x2={geometry.target.x} y2={geometry.target.y} /> : null
            }))}
            {review.reviewLinks.map((link) => {
              if (!isCrossZoneNodeLink(link.source, link.target)) return null
              const geometry = linkGeometry(link.source, link.target)
              return geometry ? <line key={`under:${link.id}`} className="mfpl-link mfpl-link-cross-zone" x1={geometry.source.x} y1={geometry.source.y} x2={geometry.target.x} y2={geometry.target.y} /> : null
            })}
          </svg>}

          {viewMode === 'exploded' && <svg className="mfpl-links mfpl-links-foreground" width={WORLD_WIDTH} height={WORLD_HEIGHT}>
            {renderedCanonicalNodes.flatMap((node) => {
              return effectiveCanonicalLinks(node.id).map((link) => {
                const drag = endpointDragRef.current
                const sourceEndpoint: LinkEndpoint = review.canonicalLinkSourceOverrides[`${node.id}:${link.id}`] ?? { kind: 'node', nodeId: node.id }
                const geometry = linkGeometry(sourceEndpoint, link.target)
                if (!geometry) return null
                let source = geometry.source
                let target = geometry.target
                if (drag?.kind === 'canonical' && drag.sourceNodeId === node.id && drag.linkId === link.id && linkGhost) {
                  if (drag.side === 'source') source = linkGhost
                  else target = linkGhost
                }
                const selected = selection?.kind === 'node' && selection.id === node.id
                  || selection?.kind === 'canonical-link' && selection.sourceNodeId === node.id && selection.linkId === link.id
                const deleteRequested = Boolean(review.deletionRequests[`link:${node.id}:${link.id}`])
                const crossZone = isCrossZoneNodeLink(sourceEndpoint, link.target)
                return <g key={`${node.id}:${link.id}`} className={`${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''} ${crossZone ? 'is-cross-zone' : ''}`}>
                  <line className="mfpl-link" x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                  <line className="mfpl-link-hit" x1={source.x} y1={source.y} x2={target.x} y2={target.y} onClick={(event) => { event.stopPropagation(); setSelection({ kind: 'canonical-link', sourceNodeId: node.id, linkId: link.id }) }} />
                  {selected && <circle className="mfpl-link-target-halo" cx={target.x} cy={target.y} r="18" />}
                  <circle className="mfpl-link-target" cx={source.x} cy={source.y} r={selected ? 6 : 4} />
                  <circle className="mfpl-link-target" cx={target.x} cy={target.y} r={selected ? 6 : 4} />
                  {selected && <>
                    <circle className="mfpl-link-handle" cx={source.x} cy={source.y} r="9" onPointerDown={(event) => startEndpointDrag(event, { kind: 'canonical', linkId: link.id, sourceNodeId: node.id, side: 'source' })} onPointerMove={moveEndpointDrag} onPointerUp={endEndpointDrag} onPointerCancel={endEndpointDrag} />
                    <circle className="mfpl-link-handle" cx={target.x} cy={target.y} r="9" onPointerDown={(event) => startEndpointDrag(event, { kind: 'canonical', linkId: link.id, sourceNodeId: node.id, side: 'target' })} onPointerMove={moveEndpointDrag} onPointerUp={endEndpointDrag} onPointerCancel={endEndpointDrag} />
                  </>}
                </g>
              })
            })}

            {review.reviewLinks.map((link) => {
              const drag = endpointDragRef.current
              const geometry = linkGeometry(link.source, link.target)
              if (!geometry) return null
              let source = geometry.source
              let target = geometry.target
              if (drag?.kind === 'review' && drag.linkId === link.id && linkGhost) {
                if (drag.side === 'source') source = linkGhost
                else target = linkGhost
              }
              const selected = reviewLinkHighlighted(link)
              const crossZone = isCrossZoneNodeLink(link.source, link.target)
              return <g key={link.id} className={`${selected ? 'is-selected' : ''} ${link.kind === 'attachment' ? 'is-attachment' : ''} ${crossZone ? 'is-cross-zone' : ''}`}>
                <line className="mfpl-link" x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                <line className="mfpl-link-hit" x1={source.x} y1={source.y} x2={target.x} y2={target.y} onClick={(event) => { event.stopPropagation(); setSelection({ kind: 'review-link', id: link.id }) }} />
                <circle className="mfpl-link-target" cx={source.x} cy={source.y} r={selected ? 6 : 4} />
                <circle className="mfpl-link-target" cx={target.x} cy={target.y} r={selected ? 6 : 4} />
                {selected && <>
                  <circle className="mfpl-link-handle" cx={source.x} cy={source.y} r="9" onPointerDown={(event) => startEndpointDrag(event, { kind: 'review', linkId: link.id, side: 'source' })} onPointerMove={moveEndpointDrag} onPointerUp={endEndpointDrag} onPointerCancel={endEndpointDrag} />
                  <circle className="mfpl-link-handle" cx={target.x} cy={target.y} r="9" onPointerDown={(event) => startEndpointDrag(event, { kind: 'review', linkId: link.id, side: 'target' })} onPointerMove={moveEndpointDrag} onPointerUp={endEndpointDrag} onPointerCancel={endEndpointDrag} />
                </>}
              </g>
            })}
          </svg>}

          {project.screens.map((screen) => {
            const referenceWindowData = referenceWindow(screen)
            const collapsed = collapsedScreens.has(screen.id)
            const screenAnnotations = review.annotations.filter((annotation) => annotation.screenId === screen.id)
            const activeGesture = gesture?.screenId === screen.id ? gesture : null
            const selected = selection?.kind === 'screen' && selection.id === screen.id
            const imageOverride = review.screenImages[screen.id]
            return <article key={screen.id} className={`mfpl-screen ${selected ? 'is-selected' : ''} ${imageOverride ? 'has-local-image' : ''}`} style={{ left: screen.x, top: screen.y }}>
              <div className="mfpl-screen-heading"><button onClick={(event) => { event.stopPropagation(); if (!ignoreClickAfterPan()) setSelection({ kind: 'screen', id: screen.id }) }}><span className="mfpl-readable-title" style={{ transform: `scale(${labelScale})` }}><b>{screen.id}</b> {screen.title}</span></button>{viewMode === 'exploded' && <button className="mfpl-collapse" onClick={(event) => { event.stopPropagation(); toggleScreen(screen.id) }}>{collapsed ? '+' : '−'}</button>}</div>
              <div
                className="mfpl-screen-art"
                data-screen-id={screen.id}
                onClick={(event) => screenClick(event, screen)}
                onPointerDown={(event) => screenPointerDown(event, screen)} onPointerMove={(event) => screenPointerMove(event, screen)} onPointerUp={(event) => screenPointerUp(event, screen)}
                onDragOver={(event) => { if ([...event.dataTransfer.items].some((item) => item.kind === 'file' && item.type.startsWith('image/'))) event.preventDefault() }}
                onDrop={(event) => { event.preventDefault(); event.stopPropagation(); setScreenImageFile(screen.id, event.dataTransfer.files[0]) }}
              >
                <ScreenArtwork screen={screen} override={imageOverride} />
                {project.nodes.filter((node) => node.ownerScreenId === screen.id && node.marker).map((node) => {
                  const marker = node.marker!
                  const selectNode = (event: React.MouseEvent) => { event.stopPropagation(); setSelection({ kind: 'node', id: node.id }) }
                  if (marker.type === 'draw' && marker.points?.length) return <svg key={`marker:${node.id}`} className="mfpl-canonical-marker-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline data-node-id={node.id} points={marker.points.map((point) => `${point.x},${point.y}`).join(' ')} onClick={selectNode} /></svg>
                  return <button key={`marker:${node.id}`} type="button" data-node-id={node.id} className={`mfpl-canonical-marker is-${marker.type}`} style={{ left: marker.x, top: marker.y, width: marker.w, height: marker.h }} onClick={selectNode}>{marker.type === 'point' ? <span /> : null}</button>
                })}
                {imageOverride && <span className="mfpl-local-image-badge">IMAGE LOCALE</span>}
                {referenceWindowData && <div className={`mfpl-reference-window ${referenceEditing && selected ? 'is-editing' : ''}`} data-reference-drag={referenceEditing && selected ? 'true' : 'false'} style={{ top: referenceWindowData.top, height: referenceWindowData.height }} onPointerDown={(event) => startReferenceDrag(event, screen, referenceWindowData.maxTop)} onPointerMove={moveReferenceDrag} onPointerUp={endReferenceDrag} onPointerCancel={endReferenceDrag}>{referenceEditing && selected ? <span>{referenceWindowData.label}</span> : null}</div>}

                {screenAnnotations.map((annotation) => {
                  const annotationSelected = selection?.kind === 'annotation' && selection.id === annotation.id
                  if (annotation.type === 'draw' && annotation.points?.length) return <svg key={annotation.id} className={`mfpl-annotation-draw ${annotationSelected ? 'is-selected' : ''}`} viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline data-annotation-id={annotation.id} className="mfpl-annotation-hit" points={annotation.points.map((point) => `${point.x},${point.y}`).join(' ')} onClick={(event) => annotationClick(event, annotation)} /></svg>
                  return <button
                    key={annotation.id}
                    data-annotation-id={annotation.id}
                    className={`mfpl-annotation-hit mfpl-annotation is-${annotation.type} ${annotationSelected ? 'is-selected' : ''}`}
                    style={{ left: annotation.x, top: annotation.y, width: annotation.w, height: annotation.h }}
                    onPointerDown={(event) => annotationPointerDown(event, annotation)} onPointerMove={annotationPointerMove} onPointerUp={(event) => annotationPointerUp(event, annotation)} onPointerCancel={(event) => annotationPointerUp(event, annotation)}
                    onClick={(event) => annotationClick(event, annotation)}
                  >{annotation.type === 'point' && <span />}</button>
                })}

                {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left: Math.min(activeGesture.start.x, activeGesture.current.x), top: Math.min(activeGesture.start.y, activeGesture.current.y), width: Math.abs(activeGesture.current.x - activeGesture.start.x), height: Math.abs(activeGesture.current.y - activeGesture.start.y) }} />}
                {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}
              </div>
              <small>390 × 850 cible · {screen.status}</small>
            </article>
          })}

          {viewMode === 'exploded' && renderedCanonicalNodes.map((node) => {
            const position = canonicalNodePosition(node)
            const selected = selection?.kind === 'node' && selection.id === node.id
            const deleteRequested = Boolean(review.deletionRequests[`node:${node.id}`])
            return <article
              key={node.id}
              data-node-id={node.id}
              className={`mfpl-node is-${node.kind} ${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}
              data-status={node.status ?? 'done'}
              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
              onPointerDown={(event) => nodePointerDown(event, node.id, false)} onPointerMove={nodePointerMove} onPointerUp={(event) => nodePointerUp(event, node.id, false)} onPointerCancel={(event) => nodePointerUp(event, node.id, false)}
              onClick={(event) => {
                event.stopPropagation()
                if (ignoreClickAfterPan()) return
                if (tool === 'link') return void linkEndpoint({ kind: 'node', nodeId: node.id })
                setSelection({ kind: 'node', id: node.id })
              }}
            >
              <header><b className="mfpl-readable-title" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>{deleteRequested ? 'SUPPRIMER ?' : `${node.status ?? 'done'} · ${node.kind}`}</small></header>
              {node.image && <img className="mfpl-node-thumb" src={node.image} alt="" style={{ objectPosition: node.imagePosition ?? 'center' }} />}
              {node.tags?.length ? <div className="mfpl-node-tags">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
              <p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
            </article>
          })}

          {viewMode === 'exploded' && renderedReviewNodes.map((node) => {
            const selected = selection?.kind === 'review-node' && selection.id === node.id
            return <article
              key={node.id}
              data-node-id={node.id}
              className={`mfpl-node is-review ${selected ? 'is-selected' : ''}`}
              style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
              onPointerDown={(event) => nodePointerDown(event, node.id, true)} onPointerMove={nodePointerMove} onPointerUp={(event) => nodePointerUp(event, node.id, true)} onPointerCancel={(event) => nodePointerUp(event, node.id, true)}
              onClick={(event) => {
                event.stopPropagation()
                if (ignoreClickAfterPan()) return
                if (tool === 'link') return void linkEndpoint({ kind: 'node', nodeId: node.id })
                setSelection({ kind: 'review-node', id: node.id })
              }}
            >
              <header><b className="mfpl-readable-title" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>revue</small></header>
              {node.tags.length > 0 && <div className="mfpl-node-tags">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
              <p>{node.text || 'Écris ton observation dans le panneau.'}</p>{node.reference && <em>{node.reference}</em>}
            </article>
          })}
        </div>
      </section>

      {selection && <aside className="mfpl-inspector">
        {selectedScreen && <>
          <div className="mfpl-inspector-title"><small>{STATE_LABEL[selectedScreen.state]} · SITUATION</small><h2>{selectedScreen.title}</h2></div>
          <p>{selectedScreen.context}</p>
          <div className="mfpl-semantic-block"><b>Ce qu’il faut comprendre</b><ul>{selectedScreen.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>
          <dl><div><dt>Source</dt><dd>{selectedScreen.source}</dd></div><div><dt>Statut</dt><dd>{selectedScreen.status}</dd></div></dl>

          <label className="mfpl-file-field">Image affichée<input type="file" accept="image/*" onChange={(event) => { setScreenImageFile(selectedScreen.id, event.target.files?.[0]); event.currentTarget.value = '' }} /></label>
          <small className="mfpl-help">Tu peux aussi déposer une image directement sur l’écran. {review.screenImages[selectedScreen.id] ? `Image locale : ${review.screenImages[selectedScreen.id].name}. Delete/Backspace revient à l’image canonique.` : 'Le remplacement reste local jusqu’à l’export.'}</small>

          {referenceEditing && reference !== 'off' && <div className="mfpl-calibration"><b>{selectedScreen.state === 'covers' ? 'Calage de cette cover' : `Calage commun ${STATE_LABEL[selectedScreen.state]}`}</b><small>{selectedScreen.state === 'covers' ? 'Ce réglage ne touche que cette jaquette.' : `Ce réglage s’applique à tous les écrans ${STATE_LABEL[selectedScreen.state]}.`}</small><div className="mfpl-calibration-buttons"><button onClick={() => setReferenceBias(selectedScreen, 0)}>Haut</button><button onClick={() => setReferenceBias(selectedScreen, 0.5)}>Centre</button><button onClick={() => setReferenceBias(selectedScreen, 1)}>Bas</button></div><label>Position verticale <input type="range" min="0" max="100" value={Math.round(screenReferenceBias(selectedScreen) * 100)} onChange={(event) => setReferenceBias(selectedScreen, Number(event.target.value) / 100)} /></label><small>{Math.round(screenReferenceBias(selectedScreen) * 1000) / 10}%{selectedScreen.state === 'covers' ? ` · ${recommendedObjectPosition(screenReferenceBias(selectedScreen))}` : ''}</small><button className="mfpl-calibration-reset" onClick={() => resetReference(selectedScreen)}>Réglage canonique</button></div>}

          <div className="mfpl-linked-list"><b>Nœuds canoniques de cette situation ({selectedScreenNodes.length})</b>{selectedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.status ?? 'done'} · {node.tags?.join(' / ') || node.kind}</span></button>)}</div>
          <div className="mfpl-inspector-actions"><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button></div>
          <label className="mfpl-field">Commentaire<textarea value={review.comments[selectedKey] ?? ''} onChange={(event) => transientReview((current) => ({ ...current, comments: { ...current.comments, [selectedKey]: event.target.value } }))} /></label>
        </>}

        {selectedCanonicalNode && <>
          <div className="mfpl-inspector-title"><small>NŒUD · {(selectedCanonicalNode.status ?? 'done').toUpperCase()}</small><h2>{selectedCanonicalNode.title}</h2></div>
          {selectedCanonicalNode.tags?.length ? <div className="mfpl-node-tags is-inspector">{selectedCanonicalNode.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
          <p>{selectedCanonicalNode.body}</p>{selectedCanonicalNode.facts.length > 0 && <div className="mfpl-semantic-block"><b>Détails</b><ul>{selectedCanonicalNode.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>}
          <div className="mfpl-link-summary"><b>{effectiveCanonicalLinks(selectedCanonicalNode.id).length} lien(s)</b><span>Tous les liens canoniques utilisent les mêmes poignées : clique le nœud puis glisse l’extrémité de départ ou d’arrivée directement sur une autre cible.</span></div>
          {review.deletionRequests[`node:${selectedCanonicalNode.id}`] && <div className="mfpl-delete-request">Suppression demandée. Le nœud reste visible pour que ChatGPT puisse comprendre et traiter la demande.</div>}
          <label className="mfpl-field">Commentaire<textarea value={review.comments[selectedKey] ?? ''} onChange={(event) => transientReview((current) => ({ ...current, comments: { ...current.comments, [selectedKey]: event.target.value } }))} /></label>
          <div className="mfpl-key-help">Glisser = déplacer le nœud · Delete/Backspace = demander sa suppression</div>
        </>}

        {selectedReviewNode && <>
          <div className="mfpl-inspector-title"><small>NŒUD · REVUE LOCALE</small><h2>{selectedReviewNode.title}</h2></div>
          <label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(event) => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, title: event.target.value } : node) }))} /></label>
          <label className="mfpl-field">Observation<textarea autoFocus value={selectedReviewNode.text} onChange={(event) => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, text: event.target.value } : node) }))} /></label>
          <label className="mfpl-field">Référence image / son / URL<input placeholder="URL, fichier, nom de référence…" value={selectedReviewNode.reference} onChange={(event) => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, reference: event.target.value } : node) }))} /></label>
          <div className="mfpl-tag-picker"><b>Tags</b><div>{NODE_TAGS.map((tag) => <button key={tag} type="button" data-active={selectedReviewNode.tags.includes(tag)} onClick={() => transientReview((current) => ({ ...current, reviewNodes: current.reviewNodes.map((node) => node.id === selectedReviewNode.id ? { ...node, tags: node.tags.includes(tag) ? node.tags.filter((item) => item !== tag) : [...node.tags, tag] } : node) }))}>{tag}</button>)}</div></div>
          <div className="mfpl-link-summary"><b>{review.reviewLinks.filter((link) => endpointReferencesNode(link.source, selectedReviewNode.id, review.annotations) || endpointReferencesNode(link.target, selectedReviewNode.id, review.annotations)).length} lien(s)</b><span>Outil Lien = deux clics. Une fois le lien visible, glisse simplement ses poignées pour le recaler.</span></div>
          <div className="mfpl-key-help">Glisser = déplacer · Delete/Backspace = supprimer · Ctrl+Z = annuler</div>
        </>}

        {selectedAnnotation && <>
          <div className="mfpl-inspector-title"><small>REPÈRE · {selectedAnnotation.type.toUpperCase()}</small><h2>{selectedAnnotation.type === 'point' ? 'Point' : selectedAnnotation.type === 'rect' ? 'Zone' : 'Dessin'}</h2></div>
          <p>Ce repère est toujours associé à un nœud d’observation. Il ne vit jamais seul dans le Plan.</p>
          <button className="mfpl-jump" onClick={() => setSelection({ kind: 'review-node', id: selectedAnnotation.nodeId })}>Voir le nœud associé</button>
          <div className="mfpl-key-help">{selectedAnnotation.type === 'point' ? 'Glisse le point pour le déplacer · ' : ''}Delete/Backspace supprime le repère et son nœud · Ctrl+Z annule</div>
        </>}

        {selectedReviewLink && <>
          <div className="mfpl-inspector-title"><small>LIEN · REVUE LOCALE</small><h2>{selectedReviewLink.kind === 'attachment' ? 'Lien d’observation' : 'Relation sémantique'}</h2></div>
          <p>Pas de bouton « changer » : glisse directement l’une des deux poignées orange vers un nœud, une zone, un dessin ou un autre endroit d’écran.</p>
          <div className="mfpl-key-help">Delete/Backspace supprime le lien · Ctrl+Z annule</div>
        </>}

        {selectedCanonicalLink && selection?.kind === 'canonical-link' && <>
          <div className="mfpl-inspector-title"><small>LIEN · CANONIQUE</small><h2>{selectedCanonicalLink.label || selectedCanonicalLink.id}</h2></div>
          <p>Glisse la poignée orange pour proposer une autre destination. La modification reste locale jusqu’à l’export.</p>
          {review.deletionRequests[`link:${selection.sourceNodeId}:${selection.linkId}`] && <div className="mfpl-delete-request">Suppression de ce lien demandée à ChatGPT.</div>}
          <div className="mfpl-key-help">Delete/Backspace = demander sa suppression · Ctrl+Z = annuler</div>
        </>}

        <div className="mfpl-readonly"><b>REVUE LOCALE</b><span>Tout ce que tu ajoutes, déplaces, relies, remplaces ou demandes de supprimer ici reste local jusqu’à « Copier pour ChatGPT ».</span></div>
      </aside>}
    </div>
  </main>
}
