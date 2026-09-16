import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import type { InstagameDefinition } from './types'
import './ProductionLab.css'

type StateId = 'covers' | 'proto' | 'da' | 'release'
type ViewMode = 'simple' | 'exploded'
type ToolMode = 'point' | 'rect' | 'draw' | 'note' | null
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
  referenceBias?: number
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
type ReferenceAdjustment = { bias: number }
type Selection = { kind: 'screen' | 'node' | 'annotation' | 'review-node'; id: string } | null
type Gesture = { screenId: string; type: 'rect' | 'draw'; start: Point; current: Point; points: Point[] } | null

type PanState = {
  pointerId: number
  startX: number
  startY: number
  camera: Camera
  moved: boolean
  pointerType: string
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

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
function projectTitle(game: InstagameDefinition) { return game.id === 'linefugg' ? 'LineFugg — Rebirth' : game.title }
function anchorBias(anchor: AnchorMode = 'center') { return anchor === 'top' ? 0 : anchor === 'bottom' ? 1 : 0.5 }

function objectPositionBias(position?: string) {
  if (!position) return 0.5
  const normalized = position.toLowerCase()
  if (normalized.includes('top')) return 0
  if (normalized.includes('bottom')) return 1
  const percentages = normalized.match(/-?\d+(?:\.\d+)?%/g)
  if (percentages?.length) return clamp(Number.parseFloat(percentages.at(-1) ?? '50') / 100, 0, 1)
  return 0.5
}

function buildGenericPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover éditoriale existante. Elle reste volontairement séparée du flux Proto → DA → Release.',
    facts: ['Raster statique', 'Contrat Cover MiniFugg'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover',
    anchor: 'center', referenceBias: objectPositionBias(variant.objectPosition),
  }))
  if (!covers.length) covers.push({ id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée.', facts: ['À produire plus tard'], source: '—', status: 'Absente', x: SCREEN_X.covers, y: 420, preview: 'cover', anchor: 'center', referenceBias: 0.5 })
  const proto: PlanScreen = {
    id: 'P1', state: 'proto', title: 'Situation principale', context: 'Le vrai runtime du jeu sert de référence fonctionnelle.',
    facts: [game.instructions?.goal ?? game.description, ...(game.instructions?.rules ?? []).slice(0, 4)],
    source: `src/games/${game.id}/`, status: 'Runtime réel', x: SCREEN_X.proto, y: 420, preview: 'proto', anchor: 'center',
  }
  return {
    title: projectTitle(game), summary: game.description, screens: [...covers, proto],
    nodes: [
      { id: 'P-goal', screenId: 'P1', title: 'But du joueur', kind: 'text', body: game.instructions?.goal ?? game.description, facts: game.instructions?.rules ?? [], source: 'definition.ts', x: 1220, y: 540 },
      { id: 'P-input', screenId: 'P1', title: 'Geste principal', kind: 'text', body: (game.instructions?.controls ?? []).join(' · ') || 'À extraire du prototype.', facts: [], source: 'definition.ts / runtime', x: 2130, y: 780, anchor: { x: 195, y: 430 } },
    ],
  }
}

function buildLineFuggPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`, state: 'covers', title: variant.label || `Cover ${index + 1}`,
    context: 'Cover existante. Les covers ne décrivent pas la logique du jeu et restent hors du flux de conception Rebirth.',
    facts: ['390×844', 'Statique', 'Séparée de la future DA gameplay'], source: variant.image, status: 'Existante',
    x: SCREEN_X.covers, y: 420 + index * 980, image: variant.image, preview: 'cover',
    anchor: 'center', referenceBias: objectPositionBias(variant.objectPosition),
  }))

  const screens: PlanScreen[] = [
    ...covers,
    {
      id: 'P1', state: 'proto', title: 'Proto classique jouable', status: 'Runtime classique restauré',
      context: 'Ceci est le vrai LineFugg fonctionnel utilisé comme prototype de référence pour Rebirth. La carte décrit sa logique sans inventer de DA future.',
      facts: ['Grille 7×7', 'Exactement 3 lignes', '2 à 5 cases par ligne', '8 directions droites possibles', 'Le sens de tracé change le calcul', 'Validation finale explicite'],
      source: 'linefugg-classic-reference · runtime Phaser restauré', x: SCREEN_X.proto, y: 420, preview: 'proto', anchor: 'center',
    },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-goal', screenId: 'P1', title: 'Question du joueur', kind: 'text', body: 'Comment utiliser trois traits pour fabriquer le total le plus élevé possible ?', facts: ['Calcul local + anticipation des deux lignes suivantes', 'Le score final est la somme des trois calculs'], source: 'definition.ts + règles validées', x: 1190, y: 490 },
    { id: 'P-board', screenId: 'P1', title: 'Plateau quotidien', kind: 'text', body: 'La grille initiale est déterministe pour le jour courant : le problème de départ est reproductible.', facts: ['49 cases', 'Seed dérivé de LineFugg + date UTC', 'Le plateau initial n’est pas relancé au hasard à chaque restart'], source: 'currentUtcDayId() / createBoard()', x: 1190, y: 780, anchor: { x: 195, y: 335 } },
    { id: 'P-values', screenId: 'P1', title: 'Économie des cases', kind: 'text', body: 'Les cases ajoutent, soustraient, multiplient ou divisent avec une distribution volontairement asymétrique.', facts: ['68 % : +1…+9', '16 % : −1…−4', '12 % : ×2 ou ×3', '4 % : ÷2 ou ÷3'], source: 'createCell()', x: 2140, y: 500, anchor: { x: 260, y: 350 } },
    { id: 'P-gesture', screenId: 'P1', title: 'Geste', kind: 'animation', body: 'On part d’une case et on glisse vers une autre ; la fin est aimantée sur une ligne horizontale, verticale ou diagonale de 2 à 5 cases.', facts: ['Direction départ→arrivée significative', 'Ligne non droite refusée', 'Feedback invalide local'], source: 'handlePointer*() / snapEnd()', x: 2140, y: 820, anchor: { x: 195, y: 430 } },
    { id: 'P-order', screenId: 'P1', title: 'Ordre du calcul', kind: 'text', body: 'Le score est évalué strictement dans l’ordre traversé. × et ÷ agissent sur le cumul déjà construit.', facts: ['Cumul démarre à 0', 'Ordre du tracé important', 'Résultat arrondi à 2 décimales'], source: 'scoreCells()', x: 1190, y: 1080, anchor: { x: 195, y: 500 } },
    { id: 'P-cross', screenId: 'P1', title: 'Croisement', kind: 'text', body: 'Une nouvelle ligne peut partager une case avec une ligne précédente, mais jamais deux avec la même ligne.', facts: ['1 intersection maximum par paire', 'Permet un choix tactique sans superposer deux segments'], source: 'overlapsMoreThanOnce()', x: 2140, y: 1130, anchor: { x: 195, y: 390 } },
    { id: 'P-reroll', screenId: 'P1', title: 'Après chaque ligne', kind: 'animation', body: 'Les cases jouées restent stables ; toutes les cases libres sont retirées à partir d’une clé déterministe issue de la ligne jouée.', facts: ['Le problème suivant dépend du choix précédent', 'Même ligne → même candidat de plateau', 'Cases déjà engagées protégées'], source: 'rerollKeyForLine() / rerollUnplayedCells()', x: 1180, y: 1430, anchor: { x: 195, y: 365 } },
    { id: 'P-ripple', screenId: 'P1', title: 'Flip en cascade', kind: 'animation', body: 'Le nouveau plateau apparaît par une onde courte partant près de la fin de ligne.', facts: ['Fold → changement caché → unfold', 'Ordre par distance à la fin de ligne', 'Mouvement réduit pris en charge'], source: 'rerollUnplayedCells()', x: 2140, y: 1470, anchor: { x: 250, y: 430 } },
    { id: 'P-next', screenId: 'P1', title: 'Préparer la ligne suivante', kind: 'text', body: 'Les cases libres portent aussi l’état associé à la prochaine ligne à jouer.', facts: ['Dimension 1 puis 2 puis 3', 'La prochaine étape doit être perceptible', 'La future DA devra traduire ce signal'], source: 'cellDimensionSlots', x: 1190, y: 1770, anchor: { x: 120, y: 420 } },
    { id: 'P-undo', screenId: 'P1', title: 'Undo = restauration', kind: 'text', body: 'Annuler retire la dernière ligne et restaure le plateau complet tel qu’il était avant cette décision.', facts: ['boardBefore restauré', 'dimensionSlotsBefore restauré', 'Score recalculé immédiatement'], source: 'PlayedLine / undo()', x: 2140, y: 1810, anchor: { x: 65, y: 775 } },
    { id: 'P-validate', screenId: 'P1', title: 'Trois lignes puis choix', kind: 'text', body: 'La troisième ligne ne termine pas la partie. Undo reste possible, puis le joueur choisit explicitement quand valider.', facts: ['Validate actif seulement à 3 lignes', 'Pas de résolution automatique', 'Fin après feedback court'], source: 'validateEnabled() / validateRun()', x: 1190, y: 2110, anchor: { x: 325, y: 775 } },
    { id: 'P-total', screenId: 'P1', title: 'Total final', kind: 'text', body: 'Le score final est la somme des trois scores de lignes.', facts: ['3 résultats intermédiaires', 'Somme finale', 'Métadonnées du run conservées'], source: 'totalScore() / session.finish()', x: 2140, y: 2150, anchor: { x: 195, y: 650 } },
    { id: 'P-viewport', screenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute future DA doit préserver la logique du stage 390×844 et rester jouable dans la fenêtre minimale MiniFugg.', facts: ['MASTER 390×844', 'Fenêtre officielle 360×650 = 390×704,17', 'Pas de reflow PC/mobile'], source: 'MINIFUGG_ZONES.md', x: 1650, y: 2460 },
  ]

  return {
    title: 'LineFugg — Rebirth',
    summary: 'Rebirth repart du vrai LineFugg classique. DA et Release restent vides tant qu’elles n’existent pas.',
    screens,
    nodes,
  }
}

function buildPlan(game: InstagameDefinition) { return game.id === 'linefugg' ? buildLineFuggPlan(game) : buildGenericPlan(game) }
function screenMap(project: PlanProject) { return new Map(project.screens.map((screen) => [screen.id, screen])) }
function nodeMap(project: PlanProject) { return new Map(project.nodes.map((node) => [node.id, node])) }
function itemCenter(item: PlanScreen | PlanNode | ReviewNode) {
  if ('state' in item) return { x: item.x + MASTER_WIDTH / 2, y: item.y + MASTER_HEIGHT / 2 }
  return { x: item.x + 155, y: item.y + 85 }
}
function screenAnchor(screen: PlanScreen, node: PlanNode | ReviewNode) {
  if ('anchor' in node && node.anchor) return { x: screen.x + node.anchor.x, y: screen.y + node.anchor.y }
  const center = itemCenter(node)
  const screenCenter = itemCenter(screen)
  const dx = center.x - screenCenter.x
  const dy = center.y - screenCenter.y
  if (Math.abs(dx) > Math.abs(dy)) return { x: dx > 0 ? screen.x + MASTER_WIDTH : screen.x, y: clamp(center.y, screen.y + 24, screen.y + MASTER_HEIGHT - 24) }
  return { x: clamp(center.x, screen.x + 24, screen.x + MASTER_WIDTH - 24), y: dy > 0 ? screen.y + MASTER_HEIGHT : screen.y }
}
function isEditable(target: EventTarget | null) { return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) }
function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midpoint(a: Point, b: Point) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }

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
  const empty = { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string>, referenceAdjustments: {} as Record<string, ReferenceAdjustment> }
  if (typeof window === 'undefined') return empty
  try {
    const parsed = JSON.parse(localStorage.getItem(`mf-production-review:${gameId}`) || '{}')
    return {
      annotations: parsed.annotations ?? [],
      reviewNodes: parsed.reviewNodes ?? [],
      comments: parsed.comments ?? {},
      referenceAdjustments: parsed.referenceAdjustments ?? {},
    }
  } catch { return empty }
}

function ScreenArtwork({ screen, game }: { screen: PlanScreen; game: InstagameDefinition }) {
  if (screen.preview === 'cover' && screen.image) return <img className="mfpl-screen-image" src={screen.image} alt="" draggable={false} />
  return <iframe className="mfpl-runtime-preview" title={`${game.title} — proto réel`} src={`/?usr=moigod&lab=gameplay-runtime&game=${encodeURIComponent(game.id)}`} tabIndex={-1} />
}

export function ProductionLab() {
  const [gameId, setGameId] = useState('linefugg')
  const game = gameRegistry.find((item) => item.id === gameId) ?? gameRegistry[0]
  const project = useMemo(() => buildPlan(game), [game])
  const screensById = useMemo(() => screenMap(project), [project])
  const nodesById = useMemo(() => nodeMap(project), [project])
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
  const [gesture, setGesture] = useState<Gesture>(null)
  const [exported, setExported] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<PanState | null>(null)
  const touchesRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<PinchState | null>(null)
  const suppressClickRef = useRef(false)
  const referenceDragRef = useRef<{ pointerId: number; startY: number; bias: number; screenId: string; maxTop: number; screenHeight: number } | null>(null)

  useEffect(() => {
    const review = loadReview(gameId)
    setAnnotations(review.annotations)
    setReviewNodes(review.reviewNodes)
    setComments(review.comments)
    setReferenceAdjustments(review.referenceAdjustments)
    setSelection(null)
    setCollapsedScreens(new Set())
    setReferenceEditing(false)
    setTool(null)
    setCamera({ x: 22, y: 36, zoom: 0.34 })
  }, [gameId])

  useEffect(() => {
    localStorage.setItem(`mf-production-review:${gameId}`, JSON.stringify({ annotations, reviewNodes, comments, referenceAdjustments }))
  }, [gameId, annotations, reviewNodes, comments, referenceAdjustments])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && tool) { setTool(null); return }
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
  }, [tool])

  const visibleNode = (node: PlanNode | ReviewNode) => viewMode === 'exploded' && !collapsedScreens.has(node.screenId)
  const selectedScreen = selection?.kind === 'screen' ? screensById.get(selection.id) : undefined
  const selectedNode = selection?.kind === 'node' ? nodesById.get(selection.id) : undefined
  const selectedAnnotation = selection?.kind === 'annotation' ? annotations.find((item) => item.id === selection.id) : undefined
  const selectedReviewNode = selection?.kind === 'review-node' ? reviewNodes.find((item) => item.id === selection.id) : undefined
  const selectedKey = selection ? `${selection.kind}:${selection.id}` : ''
  const linkedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.screenId === selectedScreen.id) : []
  const allVisibleNodes = [...project.nodes.filter(visibleNode), ...reviewNodes.filter(visibleNode)]

  function toggleScreen(id: string) {
    setCollapsedScreens((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function fitPlan() { setCamera({ x: 22, y: 36, zoom: 0.25 }) }
  function zoomAt(clientX: number, clientY: number, nextZoom: number) {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = clientX - rect.left
    const py = clientY - rect.top
    setCamera((current) => {
      const zoom = clamp(nextZoom, 0.08, 2.8)
      const worldX = (px - current.x) / current.zoom
      const worldY = (py - current.y) / current.zoom
      return { zoom, x: px - worldX * zoom, y: py - worldY * zoom }
    })
  }
  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (event.ctrlKey || event.metaKey) {
      zoomAt(event.clientX, event.clientY, camera.zoom * Math.exp(-event.deltaY * 0.008))
      return
    }
    const dx = event.shiftKey && Math.abs(event.deltaX) < 0.1 ? event.deltaY : event.deltaX
    const dy = event.shiftKey && Math.abs(event.deltaX) < 0.1 ? 0 : event.deltaY
    setCamera((current) => ({ ...current, x: current.x - dx, y: current.y - dy }))
  }

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
        pinchRef.current = {
          distance: Math.max(1, distance(a, b)),
          worldX: (px - camera.x) / camera.zoom,
          worldY: (py - camera.y) / camera.zoom,
          camera,
        }
        return
      }
    }

    panRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, camera, moved: false, pointerType: event.pointerType }
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
      try { viewportRef.current?.setPointerCapture(event.pointerId) } catch { /* pointer capture is an enhancement */ }
    }
    if (!pan.moved) return
    setCamera({ ...pan.camera, x: pan.camera.x + dx, y: pan.camera.y + dy })
  }

  function pointerEndCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') {
      touchesRef.current.delete(event.pointerId)
      if (touchesRef.current.size < 2) pinchRef.current = null
      const remaining = [...touchesRef.current.entries()][0]
      if (remaining) panRef.current = { pointerId: remaining[0], startX: remaining[1].x, startY: remaining[1].y, camera, moved: false, pointerType: 'touch' }
    }
    if (panRef.current?.pointerId === event.pointerId) panRef.current = null
    window.setTimeout(() => { suppressClickRef.current = false }, 0)
  }

  function ignoreClickAfterPan() {
    if (!suppressClickRef.current) return false
    suppressClickRef.current = false
    return true
  }

  function pointInScreen(event: ReactPointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) }
  }
  function addAnnotation(screen: PlanScreen, type: Annotation['type'], point: Point) {
    const id = `A-${Date.now().toString(36)}`
    setAnnotations((current) => [...current, { id, screenId: screen.id, type, x: point.x, y: point.y, text: type === 'note' ? 'Nouvelle note' : '' }])
    setSelection({ kind: 'annotation', id })
  }
  function screenPointerDown(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!tool) return
    event.stopPropagation()
    const point = pointInScreen(event)
    if (tool === 'point' || tool === 'note') return void addAnnotation(screen, tool, point)
    event.currentTarget.setPointerCapture(event.pointerId)
    setGesture({ screenId: screen.id, type: tool, start: point, current: point, points: [point] })
  }
  function screenPointerMove(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = pointInScreen(event)
    setGesture((current) => current ? { ...current, current: point, points: current.type === 'draw' ? [...current.points, point] : current.points } : current)
  }
  function screenPointerUp(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = pointInScreen(event)
    const id = `A-${Date.now().toString(36)}`
    if (gesture.type === 'rect') {
      const x = Math.min(gesture.start.x, point.x)
      const y = Math.min(gesture.start.y, point.y)
      const w = Math.abs(point.x - gesture.start.x)
      const h = Math.abs(point.y - gesture.start.y)
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
    const id = `N-${Date.now().toString(36)}`
    const count = reviewNodes.filter((node) => node.screenId === screen.id).length
    setReviewNodes((current) => [...current, { id, screenId: screen.id, title: 'Nœud brouillon', text: 'Décrire ce qui manque ou doit changer.', x: screen.x + 500, y: screen.y + 120 + count * 210 }])
    setSelection({ kind: 'review-node', id })
    setViewMode('exploded')
  }

  function screenReferenceBias(screen: PlanScreen) {
    return clamp(referenceAdjustments[screen.id]?.bias ?? screen.referenceBias ?? anchorBias(screen.anchor), 0, 1)
  }
  function referenceWindow(screen: PlanScreen) {
    const geometry = referenceGeometry(reference)
    if (!geometry) return null
    const bias = screenReferenceBias(screen)
    return { ...geometry, bias, top: geometry.maxTop * bias }
  }
  function setReferenceBias(screenId: string, bias: number) {
    setReferenceAdjustments((current) => ({ ...current, [screenId]: { bias: clamp(bias, 0, 1) } }))
  }
  function startReferenceDrag(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen, maxTop: number) {
    if (!referenceEditing || !selectedScreen || selectedScreen.id !== screen.id || maxTop <= 0) return
    event.stopPropagation()
    const rect = event.currentTarget.parentElement?.getBoundingClientRect()
    referenceDragRef.current = { pointerId: event.pointerId, startY: event.clientY, bias: screenReferenceBias(screen), screenId: screen.id, maxTop, screenHeight: rect?.height ?? MASTER_HEIGHT }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveReferenceDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = referenceDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const logicalDelta = (event.clientY - drag.startY) / Math.max(1, drag.screenHeight) * MASTER_HEIGHT
    setReferenceBias(drag.screenId, drag.bias + logicalDelta / Math.max(1, drag.maxTop))
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
      annotations, draftNodes: reviewNodes, referenceAdjustments, simplifiedScreens: [...collapsedScreens],
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setExported(true)
    window.setTimeout(() => setExported(false), 1400)
  }

  return <main className="mfpl">
    <header className="mfpl-topbar">
      <strong>MiniFugg Production Lab</strong>
      <label>Jeu<select value={game.id} onChange={(event) => setGameId(event.target.value)}>{gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}</select></label>
      <div className="mfpl-project-summary">{project.summary}</div>
      <div className="mfpl-spacer" />
      <div className="mfpl-segmented"><button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Simplifiée</button><button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Éclatée</button></div>
      <label>Repère<select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>{REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className={`mfpl-reference-edit ${referenceEditing ? 'is-active' : ''}`} disabled={!selectedScreen || reference === 'off'} onClick={() => setReferenceEditing((current) => !current)}>{referenceEditing ? 'Fin édition' : 'Éditer'}</button>
      <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
    </header>

    <div className={`mfpl-layout ${selection ? 'has-inspector' : ''}`}>
      <aside className="mfpl-tools" aria-label="Annotations">
        {([['point','•','Point'],['rect','□','Zone'],['draw','✎','Dessin'],['note','N','Note']] as Array<[Exclude<ToolMode, null>, string, string]>).map(([id, icon, label]) => <button key={id} className={tool === id ? 'is-active' : ''} onClick={() => setTool((current) => current === id ? null : id)} title={label}><b>{icon}</b><span>{label}</span></button>)}
        <div className="mfpl-tool-spacer" />
        <button onClick={fitPlan} title="Vue globale"><b>⌗</b><span>Plan</span></button>
      </aside>

      <section
        ref={viewportRef}
        className="mfpl-viewport"
        onWheel={handleWheel}
        onPointerDownCapture={pointerDownCapture}
        onPointerMoveCapture={pointerMoveCapture}
        onPointerUpCapture={pointerEndCapture}
        onPointerCancelCapture={pointerEndCapture}
        onClick={(event) => {
          if (ignoreClickAfterPan()) return
          if (!(event.target instanceof Element)) return
          if (event.target.closest('.mfpl-screen,.mfpl-node,.mfpl-annotation,.mfpl-reference-window')) return
          setSelection(null)
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}% · glisser / flèches / molette · Ctrl+molette ou pincement = zoom</div>
        <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
          {ZONES.map((zone) => <div key={zone.id} className={`mfpl-zone is-${zone.id}`} style={{ left: zone.x, width: zone.width, height: WORLD_HEIGHT }}><div className="mfpl-state-title"><b>{STATE_LABEL[zone.id]}</b><span>{zone.subtitle}</span>{!project.screens.some((screen) => screen.state === zone.id) && <em>vide pour le moment</em>}</div></div>)}

          <svg className="mfpl-links" width={WORLD_WIDTH} height={WORLD_HEIGHT} aria-hidden="true">
            {allVisibleNodes.map((node) => {
              const screen = screensById.get(node.screenId)
              if (!screen) return null
              const a = itemCenter(node)
              const b = screenAnchor(screen, node)
              return <g key={node.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />{'anchor' in node && node.anchor ? <circle cx={b.x} cy={b.y} r="5" /> : null}</g>
            })}
          </svg>

          {project.screens.map((screen) => {
            const referenceWindowData = referenceWindow(screen)
            const collapsed = collapsedScreens.has(screen.id)
            const screenAnnotations = annotations.filter((annotation) => annotation.screenId === screen.id)
            const activeGesture = gesture?.screenId === screen.id ? gesture : null
            const selected = selection?.kind === 'screen' && selection.id === screen.id
            return <article key={screen.id} className={`mfpl-screen ${selected ? 'is-selected' : ''}`} style={{ left: screen.x, top: screen.y }} onClick={(event) => { event.stopPropagation(); if (ignoreClickAfterPan()) return; setSelection({ kind: 'screen', id: screen.id }) }}>
              <div className="mfpl-screen-heading"><button><b>{screen.id}</b> {screen.title}</button>{viewMode === 'exploded' && <button className="mfpl-collapse" onClick={(event) => { event.stopPropagation(); toggleScreen(screen.id) }}>{collapsed ? '+' : '−'}</button>}</div>
              <div className="mfpl-screen-art" onPointerDown={(event) => screenPointerDown(event, screen)} onPointerMove={(event) => screenPointerMove(event, screen)} onPointerUp={(event) => screenPointerUp(event, screen)}>
                <ScreenArtwork screen={screen} game={game} />
                {referenceWindowData && <div className={`mfpl-reference-window ${referenceEditing && selected ? 'is-editing' : ''}`} data-reference-drag={referenceEditing && selected ? 'true' : 'false'} style={{ top: referenceWindowData.top, height: referenceWindowData.height }} onPointerDown={(event) => startReferenceDrag(event, screen, referenceWindowData.maxTop)} onPointerMove={moveReferenceDrag} onPointerUp={endReferenceDrag} onPointerCancel={endReferenceDrag}>{referenceEditing && selected ? <span>{referenceWindowData.label}</span> : null}</div>}
                {screenAnnotations.map((annotation) => <button key={annotation.id} className={`mfpl-annotation is-${annotation.type}`} style={{ left: annotation.x, top: annotation.y, width: annotation.w, height: annotation.h }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (ignoreClickAfterPan()) return; setSelection({ kind: 'annotation', id: annotation.id }) }}>{annotation.type === 'point' && <span />}{annotation.type === 'note' && <b>N</b>}{annotation.type === 'draw' && annotation.points && <svg viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={annotation.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}</button>)}
                {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left: Math.min(activeGesture.start.x, activeGesture.current.x), top: Math.min(activeGesture.start.y, activeGesture.current.y), width: Math.abs(activeGesture.current.x - activeGesture.start.x), height: Math.abs(activeGesture.current.y - activeGesture.start.y) }} />}
                {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}
              </div>
              <small>390 × 844 · {screen.status}</small>
            </article>
          })}

          {project.nodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-${node.kind} ${selection?.kind === 'node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: 310 }} onClick={(event) => { event.stopPropagation(); if (ignoreClickAfterPan()) return; setSelection({ kind: 'node', id: node.id }) }}><header><b>{node.title}</b><small>{node.kind}</small></header><p>{node.body}</p>{node.facts.length > 0 && <ul>{node.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}</article>)}
          {reviewNodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-review ${selection?.kind === 'review-node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: 310 }} onClick={(event) => { event.stopPropagation(); if (ignoreClickAfterPan()) return; setSelection({ kind: 'review-node', id: node.id }) }}><header><b>{node.title}</b><small>revue locale</small></header><p>{node.text}</p></article>)}
        </div>
      </section>

      {selection && <aside className="mfpl-inspector">
        {selectedScreen && <>
          <div className="mfpl-inspector-title"><small>{STATE_LABEL[selectedScreen.state]} · SITUATION</small><h2>{selectedScreen.title}</h2></div>
          <p>{selectedScreen.context}</p>
          <div className="mfpl-semantic-block"><b>Ce qu’il faut comprendre</b><ul>{selectedScreen.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>
          <dl><div><dt>Source</dt><dd>{selectedScreen.source}</dd></div><div><dt>Statut</dt><dd>{selectedScreen.status}</dd></div></dl>
          {referenceEditing && reference !== 'off' && <div className="mfpl-calibration"><b>Calage du repère</b><div className="mfpl-calibration-buttons"><button onClick={() => setReferenceBias(selectedScreen.id, 0)}>Haut</button><button onClick={() => setReferenceBias(selectedScreen.id, 0.5)}>Centre</button><button onClick={() => setReferenceBias(selectedScreen.id, 1)}>Bas</button></div><label>Position verticale <input type="range" min="0" max="100" value={Math.round(screenReferenceBias(selectedScreen) * 100)} onChange={(event) => setReferenceBias(selectedScreen.id, Number(event.target.value) / 100)} /></label><small>{Math.round(screenReferenceBias(selectedScreen) * 1000) / 10}%{selectedScreen.state === 'covers' ? ` · ${recommendedObjectPosition(screenReferenceBias(selectedScreen))}` : ''}</small><button className="mfpl-calibration-reset" onClick={() => setReferenceAdjustments((current) => { const next = { ...current }; delete next[selectedScreen.id]; return next })}>Réglage canonique</button></div>}
          <div className="mfpl-linked-list"><b>Nœuds liés ({linkedScreenNodes.length})</b>{linkedScreenNodes.map((node) => <button key={node.id} onClick={() => setSelection({ kind: 'node', id: node.id })}>{node.title}<span>{node.kind}</span></button>)}</div>
          <div className="mfpl-inspector-actions"><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button><button onClick={() => addReviewNode(selectedScreen)}>+ Nœud brouillon</button>{selectedScreen.state === 'proto' && <button onClick={() => window.open(`/?usr=moigod&lab=gameplay-runtime&game=${game.id}`, '_blank', 'noopener,noreferrer')}>Ouvrir le proto réel</button>}</div>
          <label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} /></label>
        </>}
        {selectedNode && <><div className="mfpl-inspector-title"><small>NŒUD · {selectedNode.kind.toUpperCase()}</small><h2>{selectedNode.title}</h2></div><p>{selectedNode.body}</p>{selectedNode.facts.length > 0 && <div className="mfpl-semantic-block"><b>Détails</b><ul>{selectedNode.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>}<dl><div><dt>Écran</dt><dd>{selectedNode.screenId}</dd></div><div><dt>Source</dt><dd>{selectedNode.source}</dd></div></dl><label className="mfpl-field">Commentaire<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} /></label></>}
        {selectedAnnotation && <><div className="mfpl-inspector-title"><small>ANNOTATION</small><h2>{selectedAnnotation.id}</h2></div><label className="mfpl-field">Note<textarea value={selectedAnnotation.text} onChange={(event) => setAnnotations((current) => current.map((annotation) => annotation.id === selectedAnnotation.id ? { ...annotation, text: event.target.value } : annotation))} /></label><button className="mfpl-danger" onClick={() => { setAnnotations((current) => current.filter((annotation) => annotation.id !== selectedAnnotation.id)); setSelection(null) }}>Supprimer</button></>}
        {selectedReviewNode && <><div className="mfpl-inspector-title"><small>NŒUD BROUILLON · LOCAL</small><h2>{selectedReviewNode.title}</h2></div><label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(event) => setReviewNodes((current) => current.map((node) => node.id === selectedReviewNode.id ? { ...node, title: event.target.value } : node))} /></label><label className="mfpl-field">Contenu<textarea value={selectedReviewNode.text} onChange={(event) => setReviewNodes((current) => current.map((node) => node.id === selectedReviewNode.id ? { ...node, text: event.target.value } : node))} /></label><button className="mfpl-danger" onClick={() => { setReviewNodes((current) => current.filter((node) => node.id !== selectedReviewNode.id)); setSelection(null) }}>Supprimer</button></>}
        <div className="mfpl-readonly"><b>REVUE LOCALE</b><span>Annotations et calages restent dans ce navigateur jusqu’à l’export vers ChatGPT/Codex.</span></div>
      </aside>}
    </div>
  </main>
}
