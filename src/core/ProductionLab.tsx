import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import type { InstagameDefinition } from './types'
import './ProductionLab.css'

type StateId = 'covers' | 'proto' | 'da' | 'release'
type ViewMode = 'simple' | 'exploded'
type ToolMode = 'select' | 'pan' | 'point' | 'rect' | 'draw' | 'note'
type ReferenceMode = 'off' | 'minimum' | 'a54' | 'iphone' | 'brave'
type AnchorMode = 'top' | 'center' | 'bottom'
type NodeKind = 'text' | 'image' | 'animation' | 'audio'
type Point = { x: number; y: number }
type Camera = { x: number; y: number; zoom: number }

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
}

type PlanNode = {
  id: string
  screenId: string
  title: string
  kind: NodeKind
  body: string
  facts: string[]
  source: string
  x: number
  y: number
  anchor?: Point
}

type PlanProject = { title: string; summary: string; screens: PlanScreen[]; nodes: PlanNode[] }
type Annotation = { id: string; screenId: string; type: 'point' | 'rect' | 'draw' | 'note'; x: number; y: number; w?: number; h?: number; points?: Point[]; text: string }
type ReviewNode = { id: string; screenId: string; title: string; text: string; x: number; y: number }
type Selection = { kind: 'screen' | 'node' | 'annotation' | 'review-node'; id: string } | null
type Gesture = { screenId: string; type: 'rect' | 'draw'; start: Point; current: Point; points: Point[] } | null

type PinchState = { distance: number; worldX: number; worldY: number; camera: Camera }

type TouchPanState = { pointerId: number; x: number; y: number; camera: Camera }

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

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
function projectTitle(game: InstagameDefinition) { return game.id === 'linefugg' ? 'LineFugg — Rebirth' : game.title }

function buildGenericPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover éditoriale existante. Elle reste volontairement séparée du flux Proto → DA → Release.',
    facts: ['Raster statique', 'Contrat Cover MiniFugg'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover', anchor: 'center',
  }))
  if (!covers.length) covers.push({ id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée.', facts: ['À produire plus tard'], source: '—', status: 'Absente', x: SCREEN_X.covers, y: 420, preview: 'cover', anchor: 'center' })
  const proto: PlanScreen = {
    id: 'P1', state: 'proto', title: 'Situation principale', context: 'Lecture fonctionnelle minimale du jeu existant.',
    facts: [game.instructions?.goal ?? game.description, ...(game.instructions?.rules ?? []).slice(0, 4)],
    source: `src/games/${game.id}/`, status: 'À approfondir', x: SCREEN_X.proto, y: 420, preview: 'proto', anchor: 'center',
  }
  return {
    title: projectTitle(game), summary: game.description, screens: [...covers, proto],
    nodes: [
      { id: 'P-goal', screenId: 'P1', title: 'But du joueur', kind: 'text', body: game.instructions?.goal ?? game.description, facts: game.instructions?.rules ?? [], source: 'definition.ts', x: 1240, y: 550 },
      { id: 'P-input', screenId: 'P1', title: 'Geste principal', kind: 'text', body: (game.instructions?.controls ?? []).join(' · ') || 'À extraire du prototype.', facts: [], source: 'definition.ts / runtime', x: 2100, y: 790 },
    ],
  }
}

function buildLineFuggPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover existante. Les covers ne décrivent pas la logique du jeu et restent hors du flux de conception Rebirth.',
    facts: ['390×844', 'Statique', 'Séparée de la future DA gameplay'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover', anchor: 'center',
  }))

  const screens: PlanScreen[] = [
    ...covers,
    {
      id: 'P1', state: 'proto', title: 'Boucle principale', status: 'Référence classique 0.5.3',
      context: 'Le prototype de référence est la version LineFugg classique du 11 septembre : le joueur cherche le meilleur total en construisant exactement trois calculs sur une grille qui évolue après chaque choix.',
      facts: ['Grille 7×7', 'Exactement 3 lignes', '2 à 5 cases par ligne', '8 directions droites possibles', 'Le sens de tracé change le calcul'],
      source: 'linefugg-classic-reference · LineFuggScene.ts / definition.ts', x: SCREEN_X.proto, y: 420, preview: 'proto', anchor: 'center',
    },
    {
      id: 'P2', state: 'proto', title: 'Après une ligne', status: 'Mécanique structurante',
      context: 'Une ligne validée modifie immédiatement le problème suivant : ses cases sont conservées et toutes les autres sont retirées de manière déterministe. Le joueur ne joue donc jamais trois fois sur le même plateau.',
      facts: ['Cases jouées protégées', 'Cases libres retirées', 'Retirage déterministe lié à la ligne', 'Flip en cascade depuis la fin de ligne', 'Cases libres annoncent la prochaine dimension/couleur'],
      source: 'linefugg-classic-reference · rerollUnplayedCells()', x: SCREEN_X.proto, y: 1710, preview: 'proto', anchor: 'center',
    },
    {
      id: 'P3', state: 'proto', title: 'Trois lignes / décision finale', status: 'Règle validée',
      context: 'Après la troisième ligne, le jeu ne termine pas automatiquement. Le joueur peut encore annuler pour reprendre sa dernière décision, puis choisit explicitement quand valider son total.',
      facts: ['Undo disponible après la 3e ligne', 'Undo restaure aussi le plateau précédent', 'Validate actif seulement à 3 lignes', 'Score final = somme des 3 résultats', 'Validation explicite avant fin de partie'],
      source: 'linefugg-classic-reference · undo() / validateRun()', x: SCREEN_X.proto, y: 3000, preview: 'proto', anchor: 'center',
    },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-goal', screenId: 'P1', title: 'Question du joueur', kind: 'text', body: 'Comment utiliser trois traits pour fabriquer le total le plus élevé possible ?', facts: ['Le plaisir vient du calcul local + anticipation des deux lignes suivantes', 'Le score est la somme des trois calculs'], source: 'definition.ts + règles validées', x: 1200, y: 520 },
    { id: 'P-board', screenId: 'P1', title: 'Plateau quotidien', kind: 'text', body: 'La grille initiale est déterministe pour le jour courant : deux joueurs le même jour peuvent partir du même problème.', facts: ['49 cases', 'Seed dérivé de linefugg + date UTC', 'Pas un plateau purement aléatoire à chaque restart'], source: 'currentUtcDayId() / createBoard()', x: 1200, y: 820, anchor: { x: 195, y: 360 } },
    { id: 'P-values', screenId: 'P1', title: 'Économie des cases', kind: 'text', body: 'Les cases ne valent pas toutes la même chose : elles ajoutent, multiplient ou divisent, avec une distribution volontairement asymétrique.', facts: ['68 % : +1…+9', '16 % : −1…−4', '12 % : ×2 ou ×3', '4 % : ÷2 ou ÷3'], source: 'createCell()', x: 2100, y: 520, anchor: { x: 240, y: 390 } },
    { id: 'P-gesture', screenId: 'P1', title: 'Geste', kind: 'animation', body: 'Le joueur part d’une case et glisse vers une autre. La fin est aimantée sur une ligne horizontale, verticale ou diagonale de 2 à 5 cases.', facts: ['Le sens départ→arrivée est visible', 'Ligne non droite refusée', 'Feedback invalide local, sans secouer la caméra'], source: 'handlePointer*() / snapEnd() / flashInvalid()', x: 2100, y: 850, anchor: { x: 195, y: 500 } },
    { id: 'P-order', screenId: 'P1', title: 'Ordre du calcul', kind: 'text', body: 'Le score de la ligne est évalué strictement dans l’ordre traversé. Une multiplication ou une division agit sur le cumul déjà construit.', facts: ['Cumul démarre à 0', 'Addition/soustraction puis × / ÷ selon le parcours', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1200, y: 1120 },
    { id: 'P-cross', screenId: 'P1', title: 'Croisement', kind: 'text', body: 'Une nouvelle ligne peut partager une case avec une ligne précédente, mais jamais deux avec la même ligne.', facts: ['1 intersection maximum par paire', 'Permet une construction tactique sans superposer deux segments'], source: 'overlapsMoreThanOnce()', x: 2100, y: 1160 },

    { id: 'P-reroll', screenId: 'P2', title: 'Retirage déterministe', kind: 'animation', body: 'Le contenu des cases libres est recalculé à partir de la ligne jouée : direction, valeurs traversées et score composent la clé de retirage.', facts: ['Même ligne → même candidat de plateau', 'Les cases déjà utilisées ne changent pas', 'Le prochain choix dépend donc du précédent'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 1830, anchor: { x: 195, y: 410 } },
    { id: 'P-ripple', screenId: 'P2', title: 'Flip en cascade', kind: 'animation', body: 'Le nouveau plateau apparaît par une onde courte qui part près de la fin de la ligne et se propage sur les cases libres.', facts: ['Fold → changement caché → unfold', 'Ordre par distance à la fin de ligne', 'Version réduite si prefers-reduced-motion'], source: 'rerollUnplayedCells()', x: 2100, y: 1830, anchor: { x: 250, y: 470 } },
    { id: 'P-next', screenId: 'P2', title: 'Préparer la ligne suivante', kind: 'text', body: 'Les cases libres reçoivent aussi un état de “dimension” correspondant à la prochaine ligne à jouer.', facts: ['Dimension 1 puis 2 puis 3', 'Le jeu annonce visuellement la prochaine étape', 'Ce signal devra être traduit par la future DA'], source: 'cellDimensionSlots / nextDimensionSlot', x: 2100, y: 2150 },

    { id: 'P-undo', screenId: 'P3', title: 'Undo = vraie restauration', kind: 'text', body: 'Annuler ne retire pas seulement un trait : le jeu restaure le plateau complet et les états de dimension tels qu’ils étaient avant cette ligne.', facts: ['boardBefore conservé', 'dimensionSlotsBefore conservé', 'Score recalculé immédiatement'], source: 'PlayedLine / undo()', x: 1180, y: 3120, anchor: { x: 70, y: 760 } },
    { id: 'P-validate', screenId: 'P3', title: 'Validation explicite', kind: 'text', body: 'Le troisième trait ouvre la possibilité de terminer, mais ne force pas la fin. Le joueur garde la maîtrise de sa dernière décision.', facts: ['Validate uniquement quand 3 lignes existent', 'Impossible pendant drag / reroll / validation', 'Fin après feedback court'], source: 'validateEnabled() / validateRun()', x: 2100, y: 3120, anchor: { x: 320, y: 760 } },
    { id: 'P-total', screenId: 'P3', title: 'Total', kind: 'text', body: 'Le score final est la somme des trois scores de lignes ; chaque ligne reste une décision autonome avant addition.', facts: ['Trois résultats intermédiaires', 'Somme finale', 'Métadonnées de run conservées'], source: 'totalScore() / session.finish()', x: 2100, y: 3420 },
    { id: 'P-view', screenId: 'P3', title: 'Contrat d’écran', kind: 'text', body: 'Toute future DA doit préserver la même logique sur le stage 390×844 et rester lisible dans la fenêtre minimale MiniFugg.', facts: ['MASTER 390×844', 'Fenêtre de contrôle 360×650', 'Pas de composition différente PC/mobile'], source: 'runtime policy + MINIFUGG_ZONES', x: 1180, y: 3420 },
  ]

  return {
    title: 'LineFugg — Rebirth',
    summary: 'Étape actuelle réelle : comprendre le prototype classique avant de demander la moindre nouvelle DA. Les zones DA et Release restent volontairement vides.',
    screens,
    nodes,
  }
}

function buildPlan(game: InstagameDefinition) { return game.id === 'linefugg' ? buildLineFuggPlan(game) : buildGenericPlan(game) }
function screenMap(project: PlanProject) { return new Map(project.screens.map((screen) => [screen.id, screen])) }
function nodeMap(project: PlanProject) { return new Map(project.nodes.map((node) => [node.id, node])) }
function itemCenter(item: PlanScreen | PlanNode | ReviewNode) {
  if ('state' in item) return { x: item.x + MASTER_WIDTH / 2, y: item.y + MASTER_HEIGHT / 2 }
  return { x: item.x + 155, y: item.y + 80 }
}
function screenAnchor(screen: PlanScreen, node: PlanNode | ReviewNode) {
  if ('anchor' in node && node.anchor) return { x: screen.x + node.anchor.x, y: screen.y + node.anchor.y }
  const center = itemCenter(node)
  const sc = itemCenter(screen)
  const dx = center.x - sc.x
  const dy = center.y - sc.y
  if (Math.abs(dx) > Math.abs(dy)) return { x: dx > 0 ? screen.x + MASTER_WIDTH : screen.x, y: clamp(center.y, screen.y + 24, screen.y + MASTER_HEIGHT - 24) }
  return { x: clamp(center.x, screen.x + 24, screen.x + MASTER_WIDTH - 24), y: dy > 0 ? screen.y + MASTER_HEIGHT : screen.y }
}
function viewportBand(reference: ReferenceMode, anchor: AnchorMode) {
  const option = REFERENCE_OPTIONS.find((item) => item.id === reference)
  if (!option?.cssHeight) return null
  const height = Math.min(MASTER_HEIGHT, MASTER_WIDTH * option.cssHeight / 360)
  const top = anchor === 'top' ? 0 : anchor === 'bottom' ? MASTER_HEIGHT - height : (MASTER_HEIGHT - height) / 2
  return { top, height, label: option.label }
}
function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midpoint(a: Point, b: Point) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
function isEditable(target: EventTarget | null) { return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) }
function loadReview(gameId: string) {
  const empty = { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string> }
  if (typeof window === 'undefined') return empty
  try {
    const parsed = JSON.parse(localStorage.getItem(`mf-production-review:${gameId}`) || '{}')
    return { annotations: parsed.annotations ?? [], reviewNodes: parsed.reviewNodes ?? [], comments: parsed.comments ?? {} }
  } catch { return empty }
}

function GridPreview({ phase }: { phase: 1 | 2 | 3 }) {
  const values = ['7', '−2', '4', '×2', '9', '3', '÷2', '5', '8']
  return <div className="mfpl-grid-preview">
    {Array.from({ length: 49 }, (_, index) => <span key={index}>{index % 5 === 0 ? values[index % values.length] : ''}</span>)}
    <svg viewBox="0 0 280 280" aria-hidden="true">
      <polyline className="l1" points="38,210 78,170 118,130 158,90" />
      {phase >= 2 && <polyline className="l2" points="78,50 118,90 158,130 198,170" />}
      {phase >= 3 && <polyline className="l3" points="38,90 78,90 118,90 158,90 198,90" />}
    </svg>
  </div>
}
function ScreenArtwork({ screen, game }: { screen: PlanScreen; game: InstagameDefinition }) {
  if (screen.preview === 'cover' && screen.image) return <img className="mfpl-screen-image" src={screen.image} alt="" />
  const phase: 1 | 2 | 3 = screen.id === 'P1' ? 1 : screen.id === 'P2' ? 2 : 3
  return <div className="mfpl-proto-screen">
    <div className="mfpl-proto-kicker">PROTO CLASSIQUE · 0.5.3</div>
    <div className="mfpl-proto-title">{projectTitle(game)}</div>
    <GridPreview phase={phase} />
    <div className="mfpl-proto-history"><span>L1</span><span>L2</span><span>L3</span></div>
    <div className="mfpl-proto-controls"><b>UNDO</b><strong>{phase >= 3 ? 'VALIDATE' : '—'}</strong></div>
  </div>
}

export function ProductionLab() {
  const [gameId, setGameId] = useState('linefugg')
  const game = gameRegistry.find((item) => item.id === gameId) ?? gameRegistry[0]
  const project = useMemo(() => buildPlan(game), [game])
  const screensById = useMemo(() => screenMap(project), [project])
  const nodesById = useMemo(() => nodeMap(project), [project])
  const [viewMode, setViewMode] = useState<ViewMode>('exploded')
  const [tool, setTool] = useState<ToolMode>('select')
  const [reference, setReference] = useState<ReferenceMode>('minimum')
  const [camera, setCamera] = useState<Camera>({ x: 22, y: 36, zoom: 0.34 })
  const [selection, setSelection] = useState<Selection>(null)
  const [collapsedScreens, setCollapsedScreens] = useState<Set<string>>(new Set())
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadReview(gameId).annotations)
  const [reviewNodes, setReviewNodes] = useState<ReviewNode[]>(() => loadReview(gameId).reviewNodes)
  const [comments, setComments] = useState<Record<string, string>>(() => loadReview(gameId).comments)
  const [gesture, setGesture] = useState<Gesture>(null)
  const [exported, setExported] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const mousePanRef = useRef<{ startX: number; startY: number; camera: Camera } | null>(null)
  const touchPanRef = useRef<TouchPanState | null>(null)
  const touchesRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<PinchState | null>(null)

  useEffect(() => {
    const review = loadReview(gameId)
    setAnnotations(review.annotations); setReviewNodes(review.reviewNodes); setComments(review.comments)
    setSelection(null); setCollapsedScreens(new Set()); setCamera({ x: 22, y: 36, zoom: 0.34 })
  }, [gameId])
  useEffect(() => { localStorage.setItem(`mf-production-review:${gameId}`, JSON.stringify({ annotations, reviewNodes, comments })) }, [gameId, annotations, reviewNodes, comments])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return
      const step = event.shiftKey ? 240 : 72
      event.preventDefault()
      setCamera((current) => ({ ...current, x: current.x + (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0), y: current.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) }))
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visibleNode = (node: PlanNode | ReviewNode) => viewMode === 'exploded' && !collapsedScreens.has(node.screenId)
  const selectedScreen = selection?.kind === 'screen' ? screensById.get(selection.id) : undefined
  const selectedNode = selection?.kind === 'node' ? nodesById.get(selection.id) : undefined
  const selectedAnnotation = selection?.kind === 'annotation' ? annotations.find((item) => item.id === selection.id) : undefined
  const selectedReviewNode = selection?.kind === 'review-node' ? reviewNodes.find((item) => item.id === selection.id) : undefined
  const selectedKey = selection ? `${selection.kind}:${selection.id}` : ''

  function toggleScreen(id: string) { setCollapsedScreens((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next }) }
  function fitPlan() { setCamera({ x: 22, y: 36, zoom: 0.25 }) }
  function zoomAt(clientX: number, clientY: number, nextZoom: number) {
    const rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return
    const px = clientX - rect.left, py = clientY - rect.top
    setCamera((current) => { const zoom = clamp(nextZoom, 0.08, 2.8); const wx = (px - current.x) / current.zoom, wy = (py - current.y) / current.zoom; return { zoom, x: px - wx * zoom, y: py - wy * zoom } })
  }
  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) { event.preventDefault(); event.stopPropagation(); zoomAt(event.clientX, event.clientY, camera.zoom * Math.exp(-event.deltaY * 0.0015)) }

  function touchDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') return
    touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    event.currentTarget.setPointerCapture(event.pointerId)
    if (touchesRef.current.size === 1) touchPanRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, camera }
    if (touchesRef.current.size === 2) {
      touchPanRef.current = null
      const [a, b] = [...touchesRef.current.values()]
      const center = midpoint(a, b), rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return
      const px = center.x - rect.left, py = center.y - rect.top
      pinchRef.current = { distance: Math.max(1, distance(a, b)), worldX: (px - camera.x) / camera.zoom, worldY: (py - camera.y) / camera.zoom, camera }
    }
  }
  function touchMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch' || !touchesRef.current.has(event.pointerId)) return
    touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touchesRef.current.size === 1 && touchPanRef.current?.pointerId === event.pointerId) {
      const p = touchPanRef.current
      setCamera({ ...p.camera, x: p.camera.x + event.clientX - p.x, y: p.camera.y + event.clientY - p.y })
      return
    }
    if (touchesRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...touchesRef.current.values()]
      const center = midpoint(a, b), rect = viewportRef.current?.getBoundingClientRect(); if (!rect) return
      const px = center.x - rect.left, py = center.y - rect.top
      const zoom = clamp(pinchRef.current.camera.zoom * distance(a, b) / pinchRef.current.distance, 0.08, 2.8)
      setCamera({ zoom, x: px - pinchRef.current.worldX * zoom, y: py - pinchRef.current.worldY * zoom })
    }
  }
  function touchEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') return
    touchesRef.current.delete(event.pointerId)
    if (touchesRef.current.size < 2) pinchRef.current = null
    const remaining = [...touchesRef.current.entries()][0]
    touchPanRef.current = remaining ? { pointerId: remaining[0], x: remaining[1].x, y: remaining[1].y, camera } : null
  }
  function mouseDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return
    if (tool === 'select' && (event.target === event.currentTarget || event.target === event.currentTarget.firstElementChild)) setSelection(null)
    if (tool !== 'pan' && event.button !== 1) return
    mousePanRef.current = { startX: event.clientX, startY: event.clientY, camera }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function mouseMove(event: ReactPointerEvent<HTMLDivElement>) { if (!mousePanRef.current) return; const p = mousePanRef.current; setCamera({ ...p.camera, x: p.camera.x + event.clientX - p.startX, y: p.camera.y + event.clientY - p.startY }) }
  function mouseEnd() { mousePanRef.current = null }

  function pointInScreen(event: ReactPointerEvent<HTMLElement>) { const rect = event.currentTarget.getBoundingClientRect(); return { x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) } }
  function addAnnotation(screen: PlanScreen, type: Annotation['type'], point: Point) { const id = `A-${Date.now().toString(36)}`; setAnnotations((c) => [...c, { id, screenId: screen.id, type, x: point.x, y: point.y, text: type === 'note' ? 'Nouvelle note' : '' }]); setSelection({ kind: 'annotation', id }) }
  function screenDown(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (event.pointerType === 'touch') { if (touchesRef.current.size <= 1) setSelection({ kind: 'screen', id: screen.id }); return }
    event.stopPropagation()
    if (tool === 'select') return void setSelection({ kind: 'screen', id: screen.id })
    if (tool === 'pan') return
    const point = pointInScreen(event)
    if (tool === 'point' || tool === 'note') return void addAnnotation(screen, tool, point)
    if (tool === 'rect' || tool === 'draw') { event.currentTarget.setPointerCapture(event.pointerId); setGesture({ screenId: screen.id, type: tool, start: point, current: point, points: [point] }) }
  }
  function screenMove(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) { if (!gesture || gesture.screenId !== screen.id) return; const point = pointInScreen(event); setGesture((g) => g ? { ...g, current: point, points: g.type === 'draw' ? [...g.points, point] : g.points } : g) }
  function screenUp(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = pointInScreen(event), id = `A-${Date.now().toString(36)}`
    if (gesture.type === 'rect') { const x = Math.min(gesture.start.x, point.x), y = Math.min(gesture.start.y, point.y), w = Math.abs(point.x - gesture.start.x), h = Math.abs(point.y - gesture.start.y); if (w > 4 && h > 4) { setAnnotations((c) => [...c, { id, screenId: screen.id, type: 'rect', x, y, w, h, text: '' }]); setSelection({ kind: 'annotation', id }) } }
    else if (gesture.points.length > 1) { setAnnotations((c) => [...c, { id, screenId: screen.id, type: 'draw', x: 0, y: 0, points: [...gesture.points, point], text: '' }]); setSelection({ kind: 'annotation', id }) }
    setGesture(null)
  }
  function addReviewNode(screen: PlanScreen) { const id = `N-${Date.now().toString(36)}`, count = reviewNodes.filter((n) => n.screenId === screen.id).length; setReviewNodes((c) => [...c, { id, screenId: screen.id, title: 'Nœud brouillon', text: 'Décrire ce qui manque ou doit changer.', x: screen.x + 500, y: screen.y + 120 + count * 210 }]); setSelection({ kind: 'review-node', id }); setViewMode('exploded') }
  async function copyForChatGPT() {
    const payload = { kind: 'MINIFUGG_PRODUCTION_REVIEW_ALPHA', project: project.title, gameId: game.id, viewMode, reference, comments: Object.fromEntries(Object.entries(comments).filter(([, v]) => v.trim())), annotations, draftNodes: reviewNodes, simplifiedScreens: [...collapsedScreens] }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2)); setExported(true); window.setTimeout(() => setExported(false), 1400)
  }

  const allVisibleNodes = [...project.nodes.filter(visibleNode), ...reviewNodes.filter(visibleNode)]
  const linkedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.screenId === selectedScreen.id) : []

  return <main className="mfpl">
    <header className="mfpl-topbar">
      <strong>MiniFugg Production Lab</strong>
      <label>Jeu<select value={game.id} onChange={(event) => setGameId(event.target.value)}>{gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}</select></label>
      <div className="mfpl-project-summary">{project.summary}</div><div className="mfpl-spacer" />
      <div className="mfpl-segmented"><button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Simplifiée</button><button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Éclatée</button></div>
      <label>Repère<select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>{REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
    </header>

    <div className={`mfpl-layout ${selection ? 'has-inspector' : ''}`}>
      <aside className="mfpl-tools">{([['select','↖','Sélection'],['pan','✋','Déplacer'],['point','•','Point'],['rect','□','Zone'],['draw','✎','Dessin'],['note','N','Note']] as Array<[ToolMode,string,string]>).map(([id, icon, label]) => <button key={id} className={tool === id ? 'is-active' : ''} onClick={() => setTool(id)} title={label}><b>{icon}</b><span>{label}</span></button>)}<div className="mfpl-tool-spacer" /><button onClick={fitPlan} title="Vue globale"><b>⌗</b><span>Plan</span></button></aside>

      <section ref={viewportRef} className="mfpl-viewport" onWheel={handleWheel} onPointerDownCapture={touchDown} onPointerMoveCapture={touchMove} onPointerUpCapture={touchEnd} onPointerCancelCapture={touchEnd} onPointerDown={mouseDown} onPointerMove={mouseMove} onPointerUp={mouseEnd} onPointerCancel={mouseEnd}>
        <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}% · molette / pincement / flèches</div>
        <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }} onPointerDown={(event) => { if (event.target === event.currentTarget && tool === 'select') setSelection(null) }}>
          {ZONES.map((zone) => <div key={zone.id} className={`mfpl-zone is-${zone.id}`} style={{ left: zone.x, width: zone.width, height: WORLD_HEIGHT }}><div className="mfpl-state-title"><b>{STATE_LABEL[zone.id]}</b><span>{zone.subtitle}</span>{!project.screens.some((s) => s.state === zone.id) && <em>vide pour le moment</em>}</div></div>)}
          <svg className="mfpl-links" width={WORLD_WIDTH} height={WORLD_HEIGHT} aria-hidden="true">{allVisibleNodes.map((node) => { const screen = screensById.get(node.screenId); if (!screen) return null; const a = itemCenter(node), b = screenAnchor(screen, node); return <line key={node.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> })}</svg>

          {project.screens.map((screen) => {
            const band = viewportBand(reference, screen.anchor ?? 'center'), collapsed = collapsedScreens.has(screen.id), screenAnnotations = annotations.filter((a) => a.screenId === screen.id), activeGesture = gesture?.screenId === screen.id ? gesture : null
            return <article key={screen.id} className={`mfpl-screen ${selection?.kind === 'screen' && selection.id === screen.id ? 'is-selected' : ''}`} style={{ left: screen.x, top: screen.y }}>
              <div className="mfpl-screen-heading"><button onClick={() => setSelection({ kind: 'screen', id: screen.id })}><b>{screen.id}</b> {screen.title}</button>{viewMode === 'exploded' && <button className="mfpl-collapse" onClick={() => toggleScreen(screen.id)}>{collapsed ? '+' : '−'}</button>}</div>
              <div className="mfpl-screen-art" onPointerDown={(e) => screenDown(e, screen)} onPointerMove={(e) => screenMove(e, screen)} onPointerUp={(e) => screenUp(e, screen)}>
                <ScreenArtwork screen={screen} game={game} />
                {band && <div className="mfpl-reference-mask"><i className="top" style={{ height: band.top }} /><i className="window" style={{ top: band.top, height: band.height }}><span>{band.label}</span></i><i className="bottom" style={{ top: band.top + band.height }} /></div>}
                {screenAnnotations.map((a) => <button key={a.id} className={`mfpl-annotation is-${a.type}`} style={{ left: a.x, top: a.y, width: a.w, height: a.h }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setSelection({ kind: 'annotation', id: a.id }) }}>{a.type === 'point' && <span />}{a.type === 'note' && <b>N</b>}{a.type === 'draw' && a.points && <svg viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={a.points.map((p) => `${p.x},${p.y}`).join(' ')} /></svg>}</button>)}
                {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left: Math.min(activeGesture.start.x, activeGesture.current.x), top: Math.min(activeGesture.start.y, activeGesture.current.y), width: Math.abs(activeGesture.current.x - activeGesture.start.x), height: Math.abs(activeGesture.current.y - activeGesture.start.y) }} />}
                {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((p) => `${p.x},${p.y}`).join(' ')} /></svg>}
              </div><small>390 × 844 · {screen.status}</small>
            </article>
          })}

          {project.nodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-${node.kind} ${selection?.kind === 'node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: 310 }} onClick={(e) => { e.stopPropagation(); setSelection({ kind: 'node', id: node.id }) }}><header><b>{node.title}</b><small>{node.kind}</small></header><p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}</article>)}
          {reviewNodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-review ${selection?.kind === 'review-node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: 310 }} onClick={(e) => { e.stopPropagation(); setSelection({ kind: 'review-node', id: node.id }) }}><header><b>{node.title}</b><small>revue locale</small></header><p>{node.text}</p></article>)}
        </div>
      </section>

      {selection && <aside className="mfpl-inspector">
        {selectedScreen && <><div className="mfpl-inspector-title"><small>{STATE_LABEL[selectedScreen.state]} · SITUATION</small><h2>{selectedScreen.title}</h2></div><p>{selectedScreen.context}</p><div className="mfpl-semantic-block"><b>Ce qu’il faut comprendre</b><ul>{selectedScreen.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><dl><div><dt>Source</dt><dd>{selectedScreen.source}</dd></div><div><dt>Statut</dt><dd>{selectedScreen.status}</dd></div></dl><div className="mfpl-linked-list"><b>Nœuds liés ({linkedScreenNodes.length})</b>{linkedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.kind}</span></button>)}</div><div className="mfpl-inspector-actions"><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button><button onClick={() => addReviewNode(selectedScreen)}>+ Nœud brouillon</button>{selectedScreen.state === 'proto' && <button onClick={() => window.open(`/?game=${game.id}`, '_blank', 'noopener,noreferrer')}>Ouvrir le jeu courant</button>}</div><label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(e) => setComments((c) => ({ ...c, [selectedKey]: e.target.value }))} /></label></>}
        {selectedNode && <><div className="mfpl-inspector-title"><small>NŒUD · {selectedNode.kind.toUpperCase()}</small><h2>{selectedNode.title}</h2></div><p>{selectedNode.body}</p>{selectedNode.facts.length > 0 && <div className="mfpl-semantic-block"><b>Détails</b><ul>{selectedNode.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>}<dl><div><dt>Écran</dt><dd>{selectedNode.screenId}</dd></div><div><dt>Source</dt><dd>{selectedNode.source}</dd></div></dl><label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(e) => setComments((c) => ({ ...c, [selectedKey]: e.target.value }))} /></label></>}
        {selectedAnnotation && <><div className="mfpl-inspector-title"><small>ANNOTATION</small><h2>{selectedAnnotation.id}</h2></div><label className="mfpl-field">Note<textarea value={selectedAnnotation.text} onChange={(e) => setAnnotations((c) => c.map((a) => a.id === selectedAnnotation.id ? { ...a, text: e.target.value } : a))} /></label><button className="mfpl-danger" onClick={() => { setAnnotations((c) => c.filter((a) => a.id !== selectedAnnotation.id)); setSelection(null) }}>Supprimer</button></>}
        {selectedReviewNode && <><div className="mfpl-inspector-title"><small>NŒUD BROUILLON · LOCAL</small><h2>{selectedReviewNode.title}</h2></div><label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(e) => setReviewNodes((c) => c.map((n) => n.id === selectedReviewNode.id ? { ...n, title: e.target.value } : n))} /></label><label className="mfpl-field">Contenu<textarea value={selectedReviewNode.text} onChange={(e) => setReviewNodes((c) => c.map((n) => n.id === selectedReviewNode.id ? { ...n, text: e.target.value } : n))} /></label><button className="mfpl-danger" onClick={() => { setReviewNodes((c) => c.filter((n) => n.id !== selectedReviewNode.id)); setSelection(null) }}>Supprimer</button></>}
        <div className="mfpl-readonly"><b>REVUE NON DESTRUCTIVE</b><span>Les notes restent locales jusqu’à « Copier pour ChatGPT ».</span></div>
      </aside>}
    </div>
  </main>
}
