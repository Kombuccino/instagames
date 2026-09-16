import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import type { InstagameDefinition } from './types'
import './ProductionLab.css'

type StateId = 'covers' | 'proto' | 'da' | 'release'
type ViewMode = 'simple' | 'exploded'
type ToolMode = 'rect' | 'draw' | 'note' | null
type ReferenceMode = 'off' | 'minimum' | 'a54' | 'iphone' | 'brave'
type AnchorMode = 'top' | 'center' | 'bottom'
type NodeKind = 'text' | 'image' | 'animation' | 'audio'
type Point = { x: number; y: number }
type Camera = { x: number; y: number; zoom: number }

type LinkTarget =
  | { kind: 'screen'; screenId: string; point: Point }
  | { kind: 'node'; nodeId: string }

type SemanticLink = {
  id: string
  target: LinkTarget
  label?: string
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
  body: string
  facts: string[]
  source: string
  x: number
  y: number
  links: SemanticLink[]
}

type PlanProject = { title: string; summary: string; screens: PlanScreen[]; nodes: PlanNode[] }
type Annotation = { id: string; screenId: string; type: 'point' | 'rect' | 'draw' | 'note'; x: number; y: number; w?: number; h?: number; points?: Point[]; text: string }
type ReviewNode = { id: string; ownerScreenId?: string; title: string; text: string; x: number; y: number; links: SemanticLink[] }
type ReferenceAdjustment = { bias: number }
type Selection = { kind: 'screen' | 'node' | 'annotation' | 'review-node'; id: string } | null
type Gesture = { screenId: string; type: 'rect' | 'draw'; start: Point; current: Point; points: Point[] } | null
type LinkEdit = { sourceNodeId: string; linkId?: string } | null

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

const MASTER_WIDTH = 390
const MASTER_HEIGHT = 844
const WORLD_WIDTH = 6900
const WORLD_HEIGHT = 5600
const STATE_LABEL: Record<StateId, string> = { covers: 'COVERS', proto: 'PROTO', da: 'DA', release: 'RELEASE' }
const ZONES: Array<{ id: StateId; x: number; width: number; subtitle: string }> = [
  { id: 'covers', x: 0, width: 1150, subtitle: 'ensemble éditorial séparé' },
  { id: 'proto', x: 1150, width: 1900, subtitle: 'référence fonctionnelle à comprendre' },
  { id: 'da', x: 3050, width: 1850, subtitle: 'à créer depuis le proto' },
  { id: 'release', x: 4900, width: 2000, subtitle: 'après intégration réelle' },
]
const SCREEN_X: Record<StateId, number> = { covers: 220, proto: 1650, da: 3450, release: 5350 }
const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; cssHeight?: number }> = [
  { id: 'off', label: 'Sans repère' },
  { id: 'minimum', label: 'Minimum jouable 360×650', cssHeight: 650 },
  { id: 'a54', label: 'A54 Chrome 360×656', cssHeight: 656 },
  { id: 'iphone', label: 'iPhone 13 Pro ≈360×657', cssHeight: 657 },
  { id: 'brave', label: 'A54 Brave 360×611', cssHeight: 611 },
]

const LINEFUGG_PROOF_ROOT = '/assets/generated/linefugg/production-lab'

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
function projectTitle(game: InstagameDefinition) { return game.id === 'linefugg' ? 'LineFugg — Rebirth' : game.title }
function anchorBias(anchor: AnchorMode = 'center') { return anchor === 'top' ? 0 : anchor === 'bottom' ? 1 : 0.5 }
function uid(prefix: string) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }

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
  if (!covers.length) covers.push({ id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée.', facts: ['À produire plus tard'], source: '—', status: 'Absente', x: SCREEN_X.covers, y: 420, preview: 'cover', anchor: 'center', referenceBias: 0.5 })
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
  ]

  const nodes: PlanNode[] = [
    { id: 'P-goal', ownerScreenId: 'P1', title: 'Question du joueur', kind: 'text', body: 'Comment utiliser trois traits pour fabriquer le total le plus élevé possible ?', facts: ['Calcul local + anticipation des lignes suivantes', 'Score final = somme des trois calculs'], source: 'definition.ts + règles validées', x: 1190, y: 500, links: [] },
    { id: 'P-board', ownerScreenId: 'P1', title: 'Plateau quotidien', kind: 'text', body: 'La grille initiale est déterministe pour le jour courant.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 760, links: [screenLink('P-board-grid', 'P1', 195, 335, 'grille')] },
    { id: 'P-values', ownerScreenId: 'P1', title: 'Économie des cases', kind: 'text', body: 'Les cases ajoutent, soustraient, multiplient ou divisent avec une distribution asymétrique.', facts: ['68 % : +1…+9', '16 % : −1…−4', '12 % : ×2 ou ×3', '4 % : ÷2 ou ÷3'], source: 'createCell()', x: 2140, y: 520, links: [screenLink('P-values-grid', 'P1', 260, 350, 'valeurs')] },

    { id: 'P-gesture', ownerScreenId: 'P2', title: 'Geste', kind: 'animation', body: 'Départ sur une case puis glissé vers une autre, aimanté sur une ligne droite de 2 à 5 cases.', facts: ['Horizontal / vertical / diagonal', 'Direction significative'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 1730, links: [screenLink('P-gesture-line', 'P2', 195, 430, 'tracé'), nodeLink('P-gesture-order', 'P-order', 'détermine')] },
    { id: 'P-order', ownerScreenId: 'P2', title: 'Ordre du calcul', kind: 'text', body: 'Le score est évalué dans l’ordre traversé ; × et ÷ agissent sur le cumul déjà construit.', facts: ['Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1740, links: [screenLink('P-order-preview', 'P2', 195, 500, 'résultat courant')] },
    { id: 'P-cross', ownerScreenId: 'P2', title: 'Croisement', kind: 'text', body: 'Une nouvelle ligne peut partager une case avec une ligne précédente, mais jamais deux.', facts: ['1 intersection maximum par paire'], source: 'overlapsMoreThanOnce()', x: 2140, y: 2050, links: [screenLink('P-cross-grid', 'P2', 195, 390)] },

    { id: 'P-reroll', ownerScreenId: 'P3', title: 'Retirage déterministe', kind: 'animation', body: 'Les cases jouées restent stables ; les autres sont recalculées à partir de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Cases engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 2970, links: [screenLink('P-reroll-board', 'P3', 195, 365, 'nouveau plateau')] },
    { id: 'P-ripple', ownerScreenId: 'P3', title: 'Flip en cascade', kind: 'animation', body: 'Le renouvellement apparaît comme une onde courte depuis la fin de ligne.', facts: ['Fold → changement caché → unfold'], source: 'rerollUnplayedCells()', x: 2140, y: 3000, links: [screenLink('P-ripple-board', 'P3', 250, 430)] },
    { id: 'P-next', ownerScreenId: 'P3', title: 'Préparer la ligne suivante', kind: 'text', body: 'Les cases libres signalent aussi l’étape suivante.', facts: ['Dimension 1 puis 2 puis 3', 'La future DA devra traduire ce signal'], source: 'cellDimensionSlots', x: 1190, y: 3290, links: [screenLink('P-next-cells', 'P3', 120, 420)] },

    { id: 'P-undo', ownerScreenId: 'P4', title: 'Undo = restauration', kind: 'text', body: 'Annuler retire la dernière ligne et restaure le plateau antérieur.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré'], source: 'PlayedLine / undo()', x: 2140, y: 4200, links: [screenLink('P-undo-control', 'P4', 65, 775, 'Undo')] },
    { id: 'P-validate', ownerScreenId: 'P4', title: 'Trois lignes puis choix', kind: 'text', body: 'La troisième ligne ne termine pas la partie. Le joueur choisit quand valider.', facts: ['Pas de résolution automatique', 'Validate actif à 3 lignes'], source: 'validateEnabled() / validateRun()', x: 1190, y: 4200, links: [screenLink('P-validate-control', 'P4', 325, 775, 'Validate'), nodeLink('P-validate-total', 'P-total', 'valide')] },
    { id: 'P-total', ownerScreenId: 'P4', title: 'Total final', kind: 'text', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale'], source: 'totalScore() / session.finish()', x: 2140, y: 4510, links: [screenLink('P-total-value', 'P4', 195, 650, 'total')] },
    { id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute future DA conserve le stage 390×844 et la fenêtre minimale MiniFugg.', facts: ['Fenêtre officielle 360×650 = 390×704,17', 'Pas de reflow PC/mobile'], source: 'MINIFUGG_ZONES.md', x: 1190, y: 1070, links: [] },
  ]

  return {
    title: 'LineFugg — Rebirth',
    summary: 'Rebirth repart du vrai LineFugg classique. Le Plan montre des captures statiques de situations réelles ; DA et Release restent vides.',
    screens,
    nodes,
  }
}

function buildPlan(game: InstagameDefinition) { return game.id === 'linefugg' ? buildLineFuggPlan(game) : buildGenericPlan(game) }
function isEditable(target: EventTarget | null) { return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) }
function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midpoint(a: Point, b: Point) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
function itemCenter(item: { x: number; y: number }) { return { x: item.x + 155, y: item.y + 85 } }

function referenceGeometry(reference: ReferenceMode) {
  const option = REFERENCE_OPTIONS.find((item) => item.id === reference)
  if (!option?.cssHeight) return null
  const height = Math.min(MASTER_HEIGHT, MASTER_WIDTH * option.cssHeight / 360)
  return { height, maxTop: Math.max(0, MASTER_HEIGHT - height), label: option.label }
}

function recommendedObjectPosition(bias: number) {
  if (bias <= 0.001) return 'top center'
  if (bias >= 0.999) return 'bottom center'
  return `center ${Math.round(bias * 1000) / 10}%`
}

function loadReview(gameId: string) {
  const empty = {
    annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string>,
    referenceAdjustments: {} as Record<string, ReferenceAdjustment>, linkOverrides: {} as Record<string, SemanticLink[]>,
  }
  if (typeof window === 'undefined') return empty
  try {
    const parsed = JSON.parse(localStorage.getItem(`mf-production-review:${gameId}`) || '{}')
    return {
      annotations: parsed.annotations ?? [], reviewNodes: (parsed.reviewNodes ?? []).map((node: ReviewNode) => ({ ...node, links: node.links ?? [] })),
      comments: parsed.comments ?? {}, referenceAdjustments: parsed.referenceAdjustments ?? {}, linkOverrides: parsed.linkOverrides ?? {},
    }
  } catch { return empty }
}

function ScreenArtwork({ screen }: { screen: PlanScreen }) {
  if (screen.image) return <img className="mfpl-screen-image" src={screen.image} alt="" draggable={false} />
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
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadReview(gameId).annotations)
  const [reviewNodes, setReviewNodes] = useState<ReviewNode[]>(() => loadReview(gameId).reviewNodes)
  const [comments, setComments] = useState<Record<string, string>>(() => loadReview(gameId).comments)
  const [referenceAdjustments, setReferenceAdjustments] = useState<Record<string, ReferenceAdjustment>>(() => loadReview(gameId).referenceAdjustments)
  const [linkOverrides, setLinkOverrides] = useState<Record<string, SemanticLink[]>>(() => loadReview(gameId).linkOverrides)
  const [gesture, setGesture] = useState<Gesture>(null)
  const [linkEdit, setLinkEdit] = useState<LinkEdit>(null)
  const [exported, setExported] = useState(false)

  const viewportRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<PanState | null>(null)
  const touchesRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<PinchState | null>(null)
  const suppressClickRef = useRef(false)
  const referenceDragRef = useRef<{ pointerId: number; startY: number; bias: number; key: string; maxTop: number; screenHeight: number } | null>(null)

  const reviewNodesById = useMemo(() => new Map(reviewNodes.map((node) => [node.id, node])), [reviewNodes])

  useEffect(() => {
    const review = loadReview(gameId)
    setAnnotations(review.annotations)
    setReviewNodes(review.reviewNodes)
    setComments(review.comments)
    setReferenceAdjustments(review.referenceAdjustments)
    setLinkOverrides(review.linkOverrides)
    setSelection(null)
    setCollapsedScreens(new Set())
    setReferenceEditing(false)
    setTool(null)
    setLinkEdit(null)
    setCamera({ x: 22, y: 36, zoom: 0.34 })
  }, [gameId])

  useEffect(() => {
    localStorage.setItem(`mf-production-review:${gameId}`, JSON.stringify({ annotations, reviewNodes, comments, referenceAdjustments, linkOverrides }))
  }, [gameId, annotations, reviewNodes, comments, referenceAdjustments, linkOverrides])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (linkEdit) { setLinkEdit(null); return }
        if (tool) { setTool(null); return }
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return
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
  }, [tool, linkEdit])

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
  const selectedAnnotation = selection?.kind === 'annotation' ? annotations.find((item) => item.id === selection.id) : undefined
  const selectedKey = selection ? `${selection.kind}:${selection.id}` : ''
  const selectedAnyNodeId = selectedCanonicalNode?.id ?? selectedReviewNode?.id

  function effectiveLinks(nodeId: string) {
    const review = reviewNodesById.get(nodeId)
    if (review) return review.links
    return linkOverrides[nodeId] ?? canonicalNodesById.get(nodeId)?.links ?? []
  }

  function mutateLinks(nodeId: string, updater: (links: SemanticLink[]) => SemanticLink[]) {
    if (reviewNodesById.has(nodeId)) {
      setReviewNodes((current) => current.map((node) => node.id === nodeId ? { ...node, links: updater(node.links) } : node))
      return
    }
    setLinkOverrides((current) => {
      const base = current[nodeId] ?? canonicalNodesById.get(nodeId)?.links ?? []
      return { ...current, [nodeId]: updater(base) }
    })
  }

  function setLinkTarget(sourceNodeId: string, linkId: string | undefined, target: LinkTarget) {
    mutateLinks(sourceNodeId, (links) => {
      if (!linkId) return [...links, { id: uid('L'), target }]
      return links.map((link) => link.id === linkId ? { ...link, target } : link)
    })
    setLinkEdit(null)
  }

  function findNodePosition(nodeId: string) {
    const canonical = canonicalNodesById.get(nodeId)
    if (canonical) return itemCenter(canonical)
    const review = reviewNodesById.get(nodeId)
    return review ? itemCenter(review) : null
  }

  function visibleNode(ownerScreenId?: string) {
    return viewMode === 'exploded' && (!ownerScreenId || !collapsedScreens.has(ownerScreenId))
  }

  const renderedNodes = [
    ...project.nodes.filter((node) => visibleNode(node.ownerScreenId)).map((node) => ({ ...node, review: false as const })),
    ...reviewNodes.filter((node) => visibleNode(node.ownerScreenId)).map((node) => ({ ...node, kind: 'text' as NodeKind, body: node.text, facts: [] as string[], source: 'revue locale', review: true as const })),
  ]

  const renderedNodeIds = new Set(renderedNodes.map((node) => node.id))
  const selectedTargetNodeIds = new Set<string>()
  if (selectedAnyNodeId) {
    for (const link of effectiveLinks(selectedAnyNodeId)) if (link.target.kind === 'node') selectedTargetNodeIds.add(link.target.nodeId)
  }

  function toggleScreen(id: string) {
    setCollapsedScreens((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function fitPlan() { setCamera({ x: 22, y: 36, zoom: 0.25 }) }

  function pointerDownCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool || (event.target instanceof Element && event.target.closest('[data-reference-drag="true"]'))) return
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

  function pointInElement(event: ReactPointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) }
  }

  function screenPointerDown(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!tool) return
    event.stopPropagation()
    const point = pointInElement(event)
    if (tool === 'note') {
      const id = uid('A')
      setAnnotations((current) => [...current, { id, screenId: screen.id, type: 'note', x: point.x, y: point.y, text: 'Nouvelle note' }])
      setSelection({ kind: 'annotation', id })
      return
    }
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
    const id = uid('A')
    if (gesture.type === 'rect') {
      const x = Math.min(gesture.start.x, point.x), y = Math.min(gesture.start.y, point.y)
      const w = Math.abs(point.x - gesture.start.x), h = Math.abs(point.y - gesture.start.y)
      if (w > 4 && h > 4) {
        setAnnotations((current) => [...current, { id, screenId: screen.id, type: 'rect', x, y, w, h, text: '' }])
        setSelection({ kind: 'annotation', id })
      }
    } else if (gesture.points.length > 1) {
      setAnnotations((current) => [...current, { id, screenId: screen.id, type: 'draw', x: 0, y: 0, points: [...gesture.points, point], text: '' }])
      setSelection({ kind: 'annotation', id })
    }
    setGesture(null)
  }

  function addReviewNode(screen: PlanScreen) {
    const count = reviewNodes.filter((node) => node.ownerScreenId === screen.id).length
    const id = uid('N')
    const node: ReviewNode = {
      id, ownerScreenId: screen.id, title: 'Nouveau nœud', text: 'Décris ici ce que ce nœud doit représenter.',
      x: screen.x + 500, y: screen.y + 110 + count * 210,
      links: [screenLink(uid('L'), screen.id, MASTER_WIDTH / 2, MASTER_HEIGHT / 2)],
    }
    setReviewNodes((current) => [...current, node])
    setSelection({ kind: 'review-node', id })
    setViewMode('exploded')
  }

  function referenceKey(screen: PlanScreen) { return screen.state === 'covers' ? `screen:${screen.id}` : `state:${screen.state}` }
  function defaultReferenceBias(screen: PlanScreen) {
    if (screen.state === 'covers') return screen.referenceBias ?? anchorBias(screen.anchor)
    const first = project.screens.find((candidate) => candidate.state === screen.state)
    return first?.referenceBias ?? anchorBias(first?.anchor)
  }
  function screenReferenceBias(screen: PlanScreen) { return clamp(referenceAdjustments[referenceKey(screen)]?.bias ?? defaultReferenceBias(screen), 0, 1) }
  function referenceWindow(screen: PlanScreen) {
    const geometry = referenceGeometry(reference)
    if (!geometry) return null
    const bias = screenReferenceBias(screen)
    return { ...geometry, bias, top: geometry.maxTop * bias }
  }
  function setReferenceBias(screen: PlanScreen, bias: number) {
    const key = referenceKey(screen)
    setReferenceAdjustments((current) => ({ ...current, [key]: { bias: clamp(bias, 0, 1) } }))
  }
  function resetReference(screen: PlanScreen) {
    const key = referenceKey(screen)
    setReferenceAdjustments((current) => { const next = { ...current }; delete next[key]; return next })
  }
  function startReferenceDrag(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen, maxTop: number) {
    if (!referenceEditing || !selectedScreen || selectedScreen.id !== screen.id || maxTop <= 0) return
    event.stopPropagation()
    const rect = event.currentTarget.parentElement?.getBoundingClientRect()
    referenceDragRef.current = { pointerId: event.pointerId, startY: event.clientY, bias: screenReferenceBias(screen), key: referenceKey(screen), maxTop, screenHeight: rect?.height ?? MASTER_HEIGHT }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveReferenceDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = referenceDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const logicalDelta = (event.clientY - drag.startY) / Math.max(1, drag.screenHeight) * MASTER_HEIGHT
    setReferenceAdjustments((current) => ({ ...current, [drag.key]: { bias: clamp(drag.bias + logicalDelta / Math.max(1, drag.maxTop), 0, 1) } }))
  }
  function endReferenceDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (referenceDragRef.current?.pointerId !== event.pointerId) return
    referenceDragRef.current = null
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  async function copyForChatGPT() {
    const payload = {
      kind: 'MINIFUGG_PRODUCTION_REVIEW_ALPHA', project: project.title, gameId: game.id, viewMode, reference,
      comments: Object.fromEntries(Object.entries(comments).filter(([, value]) => value.trim())),
      annotations, draftNodes: reviewNodes, referenceAdjustments, linkOverrides, simplifiedScreens: [...collapsedScreens],
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setExported(true)
    window.setTimeout(() => setExported(false), 1400)
  }

  const labelScale = clamp(1 / Math.max(camera.zoom, 0.12), 1, 7)
  const linkedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.ownerScreenId === selectedScreen.id) : []
  const selectedNodeLinks = selectedAnyNodeId ? effectiveLinks(selectedAnyNodeId) : []

  function targetLabel(target: LinkTarget) {
    if (target.kind === 'screen') return `${target.screenId} · ${Math.round(target.point.x)}, ${Math.round(target.point.y)}`
    return canonicalNodesById.get(target.nodeId)?.title ?? reviewNodesById.get(target.nodeId)?.title ?? target.nodeId
  }

  return <main className="mfpl">
    <header className="mfpl-topbar">
      <strong>MiniFugg Production Lab</strong>
      <label>Jeu<select value={game.id} onChange={(event) => setGameId(event.target.value)}>{gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}</select></label>
      <div className="mfpl-project-summary">{project.summary}</div>
      <div className="mfpl-spacer" />
      <div className="mfpl-segmented"><button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Simplifiée</button><button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Éclatée</button></div>
      <label>Repère<select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>{REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className={`mfpl-reference-edit ${referenceEditing ? 'is-active' : ''}`} title={referenceEditing ? 'Terminer le calage' : 'Éditer le calage'} disabled={!selectedScreen || reference === 'off'} onClick={() => setReferenceEditing((current) => !current)}>{referenceEditing ? '✓' : '✎'}</button>
      <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
    </header>

    <div className={`mfpl-layout ${selection ? 'has-inspector' : ''}`}>
      <aside className="mfpl-tools" aria-label="Annotations">
        {([['rect','□','Zone'],['draw','✎','Dessin'],['note','N','Note']] as Array<[Exclude<ToolMode, null>, string, string]>).map(([id, icon, label]) => <button key={id} className={tool === id ? 'is-active' : ''} onClick={() => setTool((current) => current === id ? null : id)} title={label}><b>{icon}</b><span>{label}</span></button>)}
        <div className="mfpl-tool-spacer" />
        <button onClick={fitPlan} title="Vue globale"><b>⌗</b><span>Plan</span></button>
      </aside>

      <section
        ref={viewportRef}
        className={`mfpl-viewport ${linkEdit ? 'is-linking' : ''}`}
        onPointerDownCapture={pointerDownCapture}
        onPointerMoveCapture={pointerMoveCapture}
        onPointerUpCapture={pointerEndCapture}
        onPointerCancelCapture={pointerEndCapture}
        onClick={(event) => {
          if (ignoreClickAfterPan()) return
          if (!(event.target instanceof Element)) return
          if (event.target.closest('.mfpl-screen,.mfpl-node,.mfpl-annotation,.mfpl-reference-window')) return
          if (!linkEdit) setSelection(null)
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}% · molette = déplacer · Maj+molette / pincement = zoom</div>
        {linkEdit && <div className="mfpl-link-hint">Choisis une cible : clique dans un écran pour viser un endroit précis, ou clique sur un autre nœud. <button onClick={() => setLinkEdit(null)}>Annuler</button></div>}
        <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
          {ZONES.map((zone) => <div key={zone.id} className={`mfpl-zone is-${zone.id}`} style={{ left: zone.x, width: zone.width, height: WORLD_HEIGHT }}><div className="mfpl-state-title"><b>{STATE_LABEL[zone.id]}</b><span>{zone.subtitle}</span>{!project.screens.some((screen) => screen.state === zone.id) && <em>vide pour le moment</em>}</div></div>)}

          {viewMode === 'exploded' && <svg className="mfpl-links" width={WORLD_WIDTH} height={WORLD_HEIGHT} aria-hidden="true">
            {renderedNodes.flatMap((node) => {
              const source = itemCenter(node)
              return effectiveLinks(node.id).map((link) => {
                let target: Point | null = null
                if (link.target.kind === 'screen') {
                  const screen = screensById.get(link.target.screenId)
                  if (screen) target = { x: screen.x + link.target.point.x, y: screen.y + link.target.point.y }
                } else if (renderedNodeIds.has(link.target.nodeId)) target = findNodePosition(link.target.nodeId)
                if (!target) return null
                const selected = selectedAnyNodeId === node.id
                return <g key={`${node.id}:${link.id}`} className={selected ? 'is-selected' : ''}>
                  <line className="mfpl-link" x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                  {selected && link.target.kind === 'screen' && <circle className="mfpl-link-target-halo" cx={target.x} cy={target.y} r="18" />}
                  {link.target.kind === 'screen' && <circle className="mfpl-link-target" cx={target.x} cy={target.y} r={selected ? 6 : 4} />}
                </g>
              })
            })}
          </svg>}

          {project.screens.map((screen) => {
            const referenceWindowData = referenceWindow(screen)
            const collapsed = collapsedScreens.has(screen.id)
            const screenAnnotations = annotations.filter((annotation) => annotation.screenId === screen.id)
            const activeGesture = gesture?.screenId === screen.id ? gesture : null
            const selected = selection?.kind === 'screen' && selection.id === screen.id
            return <article key={screen.id} className={`mfpl-screen ${selected ? 'is-selected' : ''}`} style={{ left: screen.x, top: screen.y }}>
              <div className="mfpl-screen-heading"><button onClick={(event) => { event.stopPropagation(); if (!ignoreClickAfterPan()) setSelection({ kind: 'screen', id: screen.id }) }}><span className="mfpl-readable-title" style={{ transform: `scale(${labelScale})` }}><b>{screen.id}</b> {screen.title}</span></button>{viewMode === 'exploded' && <button className="mfpl-collapse" onClick={(event) => { event.stopPropagation(); toggleScreen(screen.id) }}>{collapsed ? '+' : '−'}</button>}</div>
              <div
                className="mfpl-screen-art"
                onClick={(event) => {
                  event.stopPropagation()
                  if (ignoreClickAfterPan()) return
                  if (linkEdit) return void setLinkTarget(linkEdit.sourceNodeId, linkEdit.linkId, { kind: 'screen', screenId: screen.id, point: pointInElement(event) })
                  setSelection({ kind: 'screen', id: screen.id })
                }}
                onPointerDown={(event) => screenPointerDown(event, screen)} onPointerMove={(event) => screenPointerMove(event, screen)} onPointerUp={(event) => screenPointerUp(event, screen)}
              >
                <ScreenArtwork screen={screen} />
                {referenceWindowData && <div className={`mfpl-reference-window ${referenceEditing && selected ? 'is-editing' : ''}`} data-reference-drag={referenceEditing && selected ? 'true' : 'false'} style={{ top: referenceWindowData.top, height: referenceWindowData.height }} onPointerDown={(event) => startReferenceDrag(event, screen, referenceWindowData.maxTop)} onPointerMove={moveReferenceDrag} onPointerUp={endReferenceDrag} onPointerCancel={endReferenceDrag}>{referenceEditing && selected ? <span>{referenceWindowData.label}</span> : null}</div>}
                {screenAnnotations.map((annotation) => <button key={annotation.id} className={`mfpl-annotation is-${annotation.type}`} style={{ left: annotation.x, top: annotation.y, width: annotation.w, height: annotation.h }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (!ignoreClickAfterPan()) setSelection({ kind: 'annotation', id: annotation.id }) }}>{annotation.type === 'point' && <span />}{annotation.type === 'note' && <b>N</b>}{annotation.type === 'draw' && annotation.points && <svg viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={annotation.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}</button>)}
                {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left: Math.min(activeGesture.start.x, activeGesture.current.x), top: Math.min(activeGesture.start.y, activeGesture.current.y), width: Math.abs(activeGesture.current.x - activeGesture.start.x), height: Math.abs(activeGesture.current.y - activeGesture.start.y) }} />}
                {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}
              </div>
              <small>390 × 844 · {screen.status}</small>
            </article>
          })}

          {viewMode === 'exploded' && renderedNodes.map((node) => {
            const selected = selectedAnyNodeId === node.id
            const isTarget = selectedTargetNodeIds.has(node.id)
            return <article key={node.id} className={`mfpl-node is-${node.kind} ${node.review ? 'is-review' : ''} ${selected ? 'is-selected' : ''} ${isTarget ? 'is-link-target' : ''}`} style={{ left: node.x, top: node.y, width: 310 }} onClick={(event) => {
              event.stopPropagation()
              if (ignoreClickAfterPan()) return
              if (linkEdit && linkEdit.sourceNodeId !== node.id) return void setLinkTarget(linkEdit.sourceNodeId, linkEdit.linkId, { kind: 'node', nodeId: node.id })
              setSelection({ kind: node.review ? 'review-node' : 'node', id: node.id })
            }}>
              <header><b className="mfpl-readable-title" style={{ transform: `scale(${labelScale})` }}>{node.title}</b><small>{node.review ? 'revue' : node.kind}</small></header>
              <p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
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
          {referenceEditing && reference !== 'off' && <div className="mfpl-calibration"><b>{selectedScreen.state === 'covers' ? 'Calage de cette cover' : `Calage commun ${STATE_LABEL[selectedScreen.state]}`}</b><small>{selectedScreen.state === 'covers' ? 'Ce réglage ne touche que cette jaquette.' : `Ce réglage s’applique à tous les écrans ${STATE_LABEL[selectedScreen.state]}.`}</small><div className="mfpl-calibration-buttons"><button onClick={() => setReferenceBias(selectedScreen, 0)}>Haut</button><button onClick={() => setReferenceBias(selectedScreen, 0.5)}>Centre</button><button onClick={() => setReferenceBias(selectedScreen, 1)}>Bas</button></div><label>Position verticale <input type="range" min="0" max="100" value={Math.round(screenReferenceBias(selectedScreen) * 100)} onChange={(event) => setReferenceBias(selectedScreen, Number(event.target.value) / 100)} /></label><small>{Math.round(screenReferenceBias(selectedScreen) * 1000) / 10}%{selectedScreen.state === 'covers' ? ` · ${recommendedObjectPosition(screenReferenceBias(selectedScreen))}` : ''}</small><button className="mfpl-calibration-reset" onClick={() => resetReference(selectedScreen)}>Réglage canonique</button></div>}
          <div className="mfpl-linked-list"><b>Nœuds de cette situation ({linkedScreenNodes.length})</b>{linkedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.kind}</span></button>)}</div>
          <div className="mfpl-inspector-actions"><button onClick={() => addReviewNode(selectedScreen)}>+ Nouveau nœud</button><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button></div>
          <label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} /></label>
        </>}

        {(selectedCanonicalNode || selectedReviewNode) && <>
          <div className="mfpl-inspector-title"><small>NŒUD {selectedReviewNode ? '· REVUE LOCALE' : `· ${selectedCanonicalNode?.kind.toUpperCase()}`}</small><h2>{selectedReviewNode?.title ?? selectedCanonicalNode?.title}</h2></div>
          {selectedReviewNode ? <><label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(event) => setReviewNodes((current) => current.map((node) => node.id === selectedReviewNode.id ? { ...node, title: event.target.value } : node))} /></label><label className="mfpl-field">Contenu<textarea value={selectedReviewNode.text} onChange={(event) => setReviewNodes((current) => current.map((node) => node.id === selectedReviewNode.id ? { ...node, text: event.target.value } : node))} /></label></> : <><p>{selectedCanonicalNode?.body}</p>{selectedCanonicalNode?.facts.length ? <div className="mfpl-semantic-block"><b>Détails</b><ul>{selectedCanonicalNode.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div> : null}</>}

          <div className="mfpl-link-editor"><div className="mfpl-link-editor-head"><b>Liens ({selectedNodeLinks.length})</b><button onClick={() => selectedAnyNodeId && setLinkEdit({ sourceNodeId: selectedAnyNodeId })}>+ Lien</button></div>{selectedNodeLinks.length === 0 && <p>Ce nœud n’a aucun lien. C’est autorisé.</p>}{selectedNodeLinks.map((link) => <div className={`mfpl-link-row ${linkEdit?.linkId === link.id ? 'is-editing' : ''}`} key={link.id}><span>{link.target.kind === 'screen' ? 'ÉCRAN' : 'NŒUD'} · {targetLabel(link.target)}</span><div><button onClick={() => selectedAnyNodeId && setLinkEdit({ sourceNodeId: selectedAnyNodeId, linkId: link.id })}>Changer</button><button onClick={() => selectedAnyNodeId && mutateLinks(selectedAnyNodeId, (links) => links.filter((item) => item.id !== link.id))}>×</button></div></div>)}{linkEdit?.sourceNodeId === selectedAnyNodeId && <div className="mfpl-link-pick">Clique maintenant dans un écran pour choisir un point exact, ou sur un autre nœud. <button onClick={() => setLinkEdit(null)}>Annuler</button></div>}</div>

          {!selectedReviewNode && <label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} /></label>}
          {selectedReviewNode && <button className="mfpl-danger" onClick={() => { setReviewNodes((current) => current.filter((node) => node.id !== selectedReviewNode.id)); setSelection(null); setLinkEdit(null) }}>Supprimer le nœud</button>}
        </>}

        {selectedAnnotation && <><div className="mfpl-inspector-title"><small>ANNOTATION</small><h2>{selectedAnnotation.type === 'point' ? 'Ancienne annotation point' : selectedAnnotation.type}</h2></div><label className="mfpl-field">Note<textarea value={selectedAnnotation.text} onChange={(event) => setAnnotations((current) => current.map((annotation) => annotation.id === selectedAnnotation.id ? { ...annotation, text: event.target.value } : annotation))} /></label><button className="mfpl-danger" onClick={() => { setAnnotations((current) => current.filter((annotation) => annotation.id !== selectedAnnotation.id)); setSelection(null) }}>Supprimer</button></>}

        <div className="mfpl-readonly"><b>REVUE LOCALE</b><span>Les nœuds, liens, annotations et calages que tu modifies ici restent locaux jusqu’à l’export vers ChatGPT/Codex.</span></div>
      </aside>}
    </div>
  </main>
}
