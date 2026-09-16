import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import type { InstagameDefinition } from './types'
import './ProductionLab.css'

type StateId = 'covers' | 'proto' | 'da' | 'release'
type ViewMode = 'simple' | 'exploded'
type ToolMode = 'select' | 'pan' | 'point' | 'rect' | 'draw' | 'note'
type ReferenceMode = 'off' | 'minimum' | 'a54' | 'iphone' | 'brave'
type AnchorMode = 'top' | 'center' | 'bottom'
type NodeKind = 'text' | 'image' | 'tileset' | 'animation' | 'audio'
type Point = { x: number; y: number }

type PlanScreen = {
  id: string
  state: StateId
  title: string
  context: string
  x: number
  y: number
  image?: string
  preview: 'cover' | 'game' | 'detail'
  anchor?: AnchorMode
  lineage?: string
}

type PlanNode = {
  id: string
  screenId: string
  title: string
  kind: NodeKind
  body: string
  x: number
  y: number
  w?: number
  h?: number
  anchor?: Point
  lineage?: string
  parentId?: string
}

type PlanProject = {
  title: string
  screens: PlanScreen[]
  nodes: PlanNode[]
}

type Annotation = {
  id: string
  screenId: string
  type: 'point' | 'rect' | 'draw' | 'note'
  x: number
  y: number
  w?: number
  h?: number
  points?: Point[]
  text: string
}

type ReviewNode = {
  id: string
  screenId: string
  title: string
  text: string
  x: number
  y: number
}

type Selection =
  | { kind: 'screen'; id: string }
  | { kind: 'node'; id: string }
  | { kind: 'annotation'; id: string }
  | { kind: 'review-node'; id: string }
  | null

type Gesture = {
  screenId: string
  type: 'rect' | 'draw'
  start: Point
  current: Point
  points: Point[]
} | null

const MASTER_WIDTH = 390
const MASTER_HEIGHT = 844
const WORLD_WIDTH = 6400
const WORLD_HEIGHT = 5200
const STATE_ORDER: StateId[] = ['proto', 'da', 'release']
const STATE_HEADER_X: Record<StateId, number> = { covers: 180, proto: 1250, da: 2850, release: 4700 }
const STATE_LABEL: Record<StateId, string> = { covers: 'COVERS', proto: 'PROTO', da: 'DA', release: 'RELEASE' }

const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; cssHeight?: number }> = [
  { id: 'off', label: 'Sans repère' },
  { id: 'minimum', label: 'Minimum 360×650', cssHeight: 650 },
  { id: 'a54', label: 'A54 Chrome 360×656', cssHeight: 656 },
  { id: 'iphone', label: 'iPhone 13 Pro ≈360×657', cssHeight: 657 },
  { id: 'brave', label: 'A54 Brave 360×611', cssHeight: 611 },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function projectTitle(game: InstagameDefinition) {
  return game.id === 'linefugg' ? 'LineFugg — Rebirth' : game.title
}

function coverImage(game: InstagameDefinition, index = 0) {
  const variants = game.welcome?.variants ?? []
  return variants[index % Math.max(variants.length, 1)]?.image
}

function buildGenericPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 4).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`,
    state: 'covers',
    title: variant.label || `Cover ${index + 1}`,
    context: 'Cover éditoriale. Cet ensemble reste séparé de la transformation Proto → DA → Release.',
    x: 180,
    y: 420 + index * 980,
    image: variant.image,
    preview: 'cover',
    anchor: 'center',
  }))

  if (covers.length === 0) {
    covers.push({ id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée pour ce jeu.', x: 180, y: 420, preview: 'cover', anchor: 'center' })
  }

  const screens: PlanScreen[] = [
    ...covers,
    { id: 'P1', state: 'proto', title: 'Jeu principal', context: 'Situation fonctionnelle de référence du prototype.', x: 1250, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'D1', state: 'da', title: 'Écran général', context: 'Vision générale de la direction artistique. Les situations complémentaires descendent sous cet écran.', x: 2850, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'D2', state: 'da', title: 'Situation complémentaire', context: 'Moment du jeu utile pour expliquer ce qui ne peut pas être montré dans l’écran général.', x: 2850, y: 1640, preview: 'detail', anchor: 'center' },
    { id: 'R1', state: 'release', title: 'Intégration principale', context: 'État intégré courant. Release signifie ici DA intégrée à améliorer, pas forcément version 1.0.', x: 4700, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-loop', screenId: 'P1', title: 'Boucle de jeu', kind: 'text', body: game.instructions?.goal ?? game.description, x: 900, y: 620, lineage: 'loop' },
    { id: 'D-visual', screenId: 'D1', title: 'Langage visuel', kind: 'image', body: 'Formes, matières, contrastes et hiérarchie à préciser pendant la DA.', x: 2400, y: 560, lineage: 'visual' },
    { id: 'D-states', screenId: 'D2', title: 'États à montrer', kind: 'animation', body: 'Situations, états et transitions nécessaires pour lever les ambiguïtés avant intégration.', x: 3370, y: 1840 },
    { id: 'R-visual', screenId: 'R1', title: 'Rendu intégré', kind: 'image', body: 'Correspondance visuelle de la DA dans le runtime réel.', x: 5230, y: 620, lineage: 'visual' },
    { id: 'R-audio', screenId: 'R1', title: 'Audio', kind: 'audio', body: 'Musique, SFX et réactions liées aux actions du joueur.', x: 5230, y: 900 },
  ]
  return { title: projectTitle(game), screens, nodes }
}

function buildLineFuggPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 4).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`,
    state: 'covers',
    title: variant.label || `Cover ${index + 1}`,
    context: 'Édition de cover indépendante du flux Proto → DA → Release.',
    x: 180,
    y: 420 + index * 980,
    image: variant.image,
    preview: 'cover',
    anchor: 'center',
  }))

  const screens: PlanScreen[] = [
    ...covers,
    { id: 'P1', state: 'proto', title: 'Jeu principal', context: 'Prototype fonctionnel : grille 7×7, cellules, trois lignes et score.', x: 1250, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'P2', state: 'proto', title: '3 lignes posées', context: 'Moment où les trois lignes sont posées mais restent ajustables avant validation.', x: 1250, y: 1660, preview: 'detail', anchor: 'center', lineage: 'three-lines' },
    { id: 'P3', state: 'proto', title: 'Résultat / reprise', context: 'Fin de boucle, score et reprise. Sert à préserver le comportement validé du proto.', x: 1250, y: 2900, preview: 'detail', anchor: 'center' },

    { id: 'D1', state: 'da', title: 'Écran général', context: 'DA générale. Cet écran donne la composition de référence sans devoir tout expliquer à lui seul.', x: 2850, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'D2', state: 'da', title: 'Interaction cellule / ligne', context: 'Situation dédiée pour préciser la sélection, le tracé, les états des cellules et la lisibilité des chiffres.', x: 2850, y: 1660, preview: 'detail', anchor: 'center', lineage: 'three-lines' },
    { id: 'D3', state: 'da', title: 'Validation / transfert', context: 'Situation dédiée aux FX, au transfert vers le résultat et au retour visuel après validation.', x: 2850, y: 2900, preview: 'detail', anchor: 'center' },

    { id: 'R1', state: 'release', title: 'Intégration principale', context: 'DA intégrée dans le jeu réel. Elle peut encore recevoir plusieurs révisions.', x: 4700, y: 420, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'R2', state: 'release', title: 'Résultat intégré', context: 'Situation intégrée pour vérifier la fin de boucle et les états non visibles dans l’écran principal.', x: 4700, y: 1660, preview: 'detail', anchor: 'center' },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-grid', screenId: 'P1', title: 'Grille 7×7', kind: 'image', body: 'Géométrie centrale du proto. Les nombres restent lisibles pendant le tracé.', x: 840, y: 560, anchor: { x: 195, y: 380 }, lineage: 'grid' },
    { id: 'P-line', screenId: 'P1', title: 'Ligne joueur', kind: 'animation', body: 'Glisser, direction, endpoints, croisement et résultat dans le sens de la flèche.', x: 840, y: 850, anchor: { x: 190, y: 500 }, lineage: 'line' },
    { id: 'P-control', screenId: 'P2', title: 'Valider / Undo', kind: 'text', body: 'Après trois lignes, le joueur peut encore ajuster puis doit valider.', x: 830, y: 1890, anchor: { x: 300, y: 730 }, lineage: 'controls' },
    { id: 'P-result', screenId: 'P3', title: 'Score final', kind: 'text', body: 'Somme des trois lignes et reprise de partie.', x: 850, y: 3140, anchor: { x: 195, y: 260 }, lineage: 'result' },

    { id: 'D-grid', screenId: 'D1', title: 'Grille / surface', kind: 'image', body: 'Cadre, cellules, proportions et matière. Le composant doit rester dominant.', x: 2360, y: 520, anchor: { x: 195, y: 390 }, lineage: 'grid' },
    { id: 'D-glyphs', screenId: 'D1', title: 'Chiffres & opérateurs', kind: 'tileset', body: 'Famille complète des glyphes : chiffres, négatifs, multiplication, division et score.', x: 2360, y: 820, anchor: { x: 200, y: 430 }, lineage: 'glyphs' },
    { id: 'D-line', screenId: 'D2', title: 'Ligne joueur', kind: 'animation', body: 'Idle, drag, valide, invalide, commit. Le langage graphique doit être défini ici avant intégration.', x: 2360, y: 1840, anchor: { x: 180, y: 450 }, lineage: 'line' },
    { id: 'D-cells', screenId: 'D2', title: 'États des cellules', kind: 'tileset', body: 'Neutre, survol, sélectionnée, trois identités de ligne, opérateur.', x: 3360, y: 1800, anchor: { x: 220, y: 380 }, lineage: 'cells' },
    { id: 'D-controls', screenId: 'D2', title: 'Contrôles', kind: 'tileset', body: 'Undo / Validate : disabled, idle, pressed, enabled. Canvas canonique commun pour les états.', x: 3360, y: 2070, anchor: { x: 300, y: 730 }, lineage: 'controls' },
    { id: 'D-fx', screenId: 'D3', title: 'FX / énergie', kind: 'animation', body: 'Départ, voyage, arrivée, succès, erreur. Recette visuelle et mouvement avant implémentation.', x: 2360, y: 3090, anchor: { x: 195, y: 480 }, lineage: 'fx' },
    { id: 'D-audio', screenId: 'D3', title: 'Son associé', kind: 'audio', body: 'Feedback du tracé, commit, erreur et validation finale.', x: 3360, y: 3100, lineage: 'audio' },
    { id: 'D-tiles', screenId: 'D3', title: 'Tilesets à produire', kind: 'tileset', body: 'Découpe de production attendue pour que l’intégration ne réinterprète pas la DA.', x: 3360, y: 3380 },

    { id: 'R-grid', screenId: 'R1', title: 'Grille intégrée', kind: 'image', body: 'Rendu runtime à comparer avec D-grid.', x: 5260, y: 530, anchor: { x: 195, y: 390 }, lineage: 'grid' },
    { id: 'R-line', screenId: 'R1', title: 'Ligne intégrée', kind: 'animation', body: 'Animation runtime réelle à comparer avec D-line.', x: 5260, y: 810, anchor: { x: 180, y: 490 }, lineage: 'line' },
    { id: 'R-controls', screenId: 'R1', title: 'Contrôles intégrés', kind: 'tileset', body: 'États réellement utilisés dans le jeu.', x: 5260, y: 1090, anchor: { x: 300, y: 730 }, lineage: 'controls' },
    { id: 'R-fx', screenId: 'R2', title: 'FX intégrés', kind: 'animation', body: 'Effets effectivement présents dans cette situation.', x: 5260, y: 1850, anchor: { x: 195, y: 480 }, lineage: 'fx' },
    { id: 'R-audio', screenId: 'R2', title: 'Audio runtime', kind: 'audio', body: 'Sons réellement déclenchés par cette situation.', x: 5260, y: 2140, lineage: 'audio' },
    { id: 'R-result', screenId: 'R2', title: 'Résultat', kind: 'text', body: 'Comportement final et score à comparer au proto.', x: 4340, y: 1900, lineage: 'result' },
  ]

  return { title: 'LineFugg — Rebirth', screens, nodes }
}

function buildPlan(game: InstagameDefinition) {
  return game.id === 'linefugg' ? buildLineFuggPlan(game) : buildGenericPlan(game)
}

function screenMap(project: PlanProject) {
  return new Map(project.screens.map((screen) => [screen.id, screen]))
}

function nodeMap(project: PlanProject) {
  return new Map(project.nodes.map((node) => [node.id, node]))
}

function itemCenter(item: PlanScreen | PlanNode | ReviewNode) {
  if ('state' in item) return { x: item.x + MASTER_WIDTH / 2, y: item.y + MASTER_HEIGHT / 2 }
  if ('screenId' in item && 'kind' in item) return { x: item.x + (item.w ?? 300) / 2, y: item.y + (item.h ?? 180) / 2 }
  return { x: item.x + 150, y: item.y + 80 }
}

function screenAnchor(screen: PlanScreen, node: PlanNode | ReviewNode) {
  if ('anchor' in node && node.anchor) return { x: screen.x + node.anchor.x, y: screen.y + node.anchor.y }
  const center = itemCenter(node)
  const screenCenter = itemCenter(screen)
  const dx = center.x - screenCenter.x
  const dy = center.y - screenCenter.y
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? screen.x + MASTER_WIDTH : screen.x, y: clamp(center.y, screen.y + 24, screen.y + MASTER_HEIGHT - 24) }
  }
  return { x: clamp(center.x, screen.x + 24, screen.x + MASTER_WIDTH - 24), y: dy > 0 ? screen.y + MASTER_HEIGHT : screen.y }
}

function viewportBand(reference: ReferenceMode, anchor: AnchorMode) {
  const option = REFERENCE_OPTIONS.find((item) => item.id === reference)
  if (!option?.cssHeight) return null
  const height = Math.min(MASTER_HEIGHT, MASTER_WIDTH * option.cssHeight / 360)
  const top = anchor === 'top' ? 0 : anchor === 'bottom' ? MASTER_HEIGHT - height : (MASTER_HEIGHT - height) / 2
  return { top, height, label: option.label }
}

function loadReview(gameId: string) {
  if (typeof window === 'undefined') return { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string> }
  try {
    const raw = localStorage.getItem(`mf-production-review:${gameId}`)
    if (!raw) return { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string> }
    const parsed = JSON.parse(raw) as { annotations?: Annotation[]; reviewNodes?: ReviewNode[]; comments?: Record<string, string> }
    return { annotations: parsed.annotations ?? [], reviewNodes: parsed.reviewNodes ?? [], comments: parsed.comments ?? {} }
  } catch {
    return { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string> }
  }
}

function GridPreview({ detail = false }: { detail?: boolean }) {
  const values = [2, 4, 1, 7, 3, 8, 5, 6, 9]
  return (
    <div className={`mfpl-grid-preview ${detail ? 'is-detail' : ''}`}>
      {Array.from({ length: 49 }, (_, index) => <span key={index}>{index % 6 === 0 ? values[index % values.length] : ''}</span>)}
      <svg viewBox="0 0 280 280" aria-hidden="true"><polyline points="38,210 78,170 118,170 158,130 198,90 238,90" /></svg>
    </div>
  )
}

function ScreenArtwork({ screen, game }: { screen: PlanScreen; game: InstagameDefinition }) {
  if (screen.preview === 'cover' && screen.image) return <img className="mfpl-screen-image" src={screen.image} alt="" />
  return (
    <div className={`mfpl-generated-screen is-${screen.preview}`}>
      <div className="mfpl-generated-title">{projectTitle(game)}</div>
      <div className="mfpl-generated-subtitle">{screen.title}</div>
      <GridPreview detail={screen.preview === 'detail'} />
      <div className="mfpl-generated-footer">{game.description}</div>
    </div>
  )
}

function NodePreview({ node }: { node: PlanNode }) {
  if (node.kind === 'audio') {
    return <div className="mfpl-wave" aria-hidden="true">{[12, 28, 18, 36, 24, 44, 20, 32, 16, 38, 22, 30].map((height, index) => <i key={index} style={{ height }} />)}</div>
  }
  if (node.kind === 'tileset' || node.kind === 'animation') {
    return <div className="mfpl-tiles" aria-hidden="true">{[0, 1, 2, 3].map((item) => <i key={item} />)}</div>
  }
  if (node.kind === 'image') return <div className="mfpl-node-image" aria-hidden="true"><GridPreview detail /></div>
  return null
}

function annotationPoint(event: ReactPointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH),
    y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT),
  }
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
  const [camera, setCamera] = useState({ x: 40, y: 42, zoom: 0.38 })
  const [selection, setSelection] = useState<Selection>({ kind: 'screen', id: 'D1' })
  const [collapsedScreens, setCollapsedScreens] = useState<Set<string>>(new Set())
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadReview(gameId).annotations)
  const [reviewNodes, setReviewNodes] = useState<ReviewNode[]>(() => loadReview(gameId).reviewNodes)
  const [comments, setComments] = useState<Record<string, string>>(() => loadReview(gameId).comments)
  const [gesture, setGesture] = useState<Gesture>(null)
  const [exported, setExported] = useState(false)
  const panRef = useRef<{ startX: number; startY: number; cameraX: number; cameraY: number } | null>(null)

  useEffect(() => {
    const review = loadReview(gameId)
    setAnnotations(review.annotations)
    setReviewNodes(review.reviewNodes)
    setComments(review.comments)
    setSelection({ kind: 'screen', id: gameId === 'linefugg' ? 'D1' : 'P1' })
    setCollapsedScreens(new Set())
    setCamera({ x: 40, y: 42, zoom: 0.38 })
  }, [gameId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`mf-production-review:${gameId}`, JSON.stringify({ annotations, reviewNodes, comments }))
  }, [gameId, annotations, reviewNodes, comments])

  const visibleNode = (node: PlanNode | ReviewNode) => viewMode === 'exploded' && !collapsedScreens.has(node.screenId)

  const selectedScreen = selection?.kind === 'screen' ? screensById.get(selection.id) : undefined
  const selectedNode = selection?.kind === 'node' ? nodesById.get(selection.id) : undefined
  const selectedAnnotation = selection?.kind === 'annotation' ? annotations.find((item) => item.id === selection.id) : undefined
  const selectedReviewNode = selection?.kind === 'review-node' ? reviewNodes.find((item) => item.id === selection.id) : undefined
  const selectedKey = selection ? `${selection.kind}:${selection.id}` : ''

  function toggleScreen(screenId: string) {
    setCollapsedScreens((current) => {
      const next = new Set(current)
      if (next.has(screenId)) next.delete(screenId)
      else next.add(screenId)
      return next
    })
  }

  function fitPlan() {
    setCamera({ x: 26, y: 38, zoom: 0.30 })
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    setCamera((current) => ({ ...current, zoom: clamp(current.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.16, 1.2) }))
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool !== 'pan' && event.button !== 1) return
    panRef.current = { startX: event.clientX, startY: event.clientY, cameraX: camera.x, cameraY: camera.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panRef.current) return
    const active = panRef.current
    setCamera((current) => ({ ...current, x: active.cameraX + event.clientX - active.startX, y: active.cameraY + event.clientY - active.startY }))
  }

  function endPan() {
    panRef.current = null
  }

  function addAnnotation(screen: PlanScreen, type: Annotation['type'], point: Point) {
    const id = `A-${Date.now().toString(36)}`
    const annotation: Annotation = { id, screenId: screen.id, type, x: point.x, y: point.y, text: type === 'note' ? 'Nouvelle note' : '' }
    setAnnotations((current) => [...current, annotation])
    setSelection({ kind: 'annotation', id })
  }

  function onScreenPointerDown(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    event.stopPropagation()
    if (tool === 'select') {
      setSelection({ kind: 'screen', id: screen.id })
      return
    }
    if (tool === 'pan') return
    const point = annotationPoint(event)
    if (tool === 'point' || tool === 'note') {
      addAnnotation(screen, tool, point)
      return
    }
    if (tool === 'rect' || tool === 'draw') {
      event.currentTarget.setPointerCapture(event.pointerId)
      setGesture({ screenId: screen.id, type: tool, start: point, current: point, points: [point] })
    }
  }

  function onScreenPointerMove(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = annotationPoint(event)
    setGesture((current) => current ? { ...current, current: point, points: current.type === 'draw' ? [...current.points, point] : current.points } : current)
  }

  function onScreenPointerUp(event: ReactPointerEvent<HTMLDivElement>, screen: PlanScreen) {
    if (!gesture || gesture.screenId !== screen.id) return
    const point = annotationPoint(event)
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
    const count = reviewNodes.filter((item) => item.screenId === screen.id).length
    const id = `N-${Date.now().toString(36)}`
    const node: ReviewNode = {
      id,
      screenId: screen.id,
      title: 'Nœud brouillon',
      text: 'Décrire ici ce qui manque, doit changer ou doit être produit.',
      x: screen.x + MASTER_WIDTH + 460,
      y: screen.y + 120 + count * 210,
    }
    setReviewNodes((current) => [...current, node])
    setSelection({ kind: 'review-node', id })
    setViewMode('exploded')
  }

  function deleteAnnotation(id: string) {
    setAnnotations((current) => current.filter((item) => item.id !== id))
    setSelection(null)
  }

  function deleteReviewNode(id: string) {
    setReviewNodes((current) => current.filter((item) => item.id !== id))
    setSelection(null)
  }

  async function copyForChatGPT() {
    const payload = {
      kind: 'MINIFUGG_PRODUCTION_REVIEW_ALPHA',
      project: project.title,
      gameId: game.id,
      viewMode,
      reference,
      comments: Object.fromEntries(Object.entries(comments).filter(([, value]) => value.trim())),
      annotations,
      draftNodes: reviewNodes,
      simplifiedScreens: [...collapsedScreens],
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setExported(true)
    window.setTimeout(() => setExported(false), 1600)
  }

  const allVisibleNodes = [...project.nodes.filter(visibleNode), ...reviewNodes.filter(visibleNode)]

  const lineageGroups = new Map<string, Array<PlanNode>>()
  project.nodes.filter(visibleNode).forEach((node) => {
    if (!node.lineage) return
    const group = lineageGroups.get(node.lineage) ?? []
    group.push(node)
    lineageGroups.set(node.lineage, group)
  })

  return (
    <main className="mfpl">
      <header className="mfpl-topbar">
        <strong>MiniFugg Production Lab</strong>
        <label>Jeu
          <select value={game.id} onChange={(event) => setGameId(event.target.value)}>
            {gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}
          </select>
        </label>
        <div className="mfpl-spacer" />
        <div className="mfpl-segmented">
          <button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Vue simplifiée</button>
          <button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Vue éclatée</button>
        </div>
        <label>Repère
          <select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>
            {REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
      </header>

      <div className="mfpl-layout">
        <aside className="mfpl-tools" aria-label="Outils">
          {([
            ['select', '↖', 'Sélection'],
            ['pan', '✋', 'Déplacer'],
            ['point', '•', 'Point'],
            ['rect', '□', 'Zone'],
            ['draw', '✎', 'Dessin'],
            ['note', 'N', 'Note'],
          ] as Array<[ToolMode, string, string]>).map(([id, icon, label]) => (
            <button key={id} className={tool === id ? 'is-active' : ''} title={label} onClick={() => setTool(id)}><b>{icon}</b><span>{label}</span></button>
          ))}
          <div className="mfpl-tool-spacer" />
          <button title="Vue globale" onClick={fitPlan}><b>⌗</b><span>Plan</span></button>
        </aside>

        <section className="mfpl-viewport" onWheel={handleWheel} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan}>
          <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}%</div>
          <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
            <svg className="mfpl-links" width={WORLD_WIDTH} height={WORLD_HEIGHT} aria-hidden="true">
              <line className="mfpl-state-link" x1={STATE_HEADER_X.proto + 180} y1="195" x2={STATE_HEADER_X.da - 30} y2="195" />
              <line className="mfpl-state-link" x1={STATE_HEADER_X.da + 180} y1="195" x2={STATE_HEADER_X.release - 30} y2="195" />

              {project.screens.filter((screen) => screen.lineage === 'main').sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state)).map((screen, index, list) => {
                const next = list[index + 1]
                if (!next) return null
                const a = itemCenter(screen); const b = itemCenter(next)
                return <line key={`screen-lineage-${screen.id}`} className="mfpl-lineage-screen" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              })}

              {allVisibleNodes.map((node) => {
                const screen = screensById.get(node.screenId)
                if (!screen) return null
                const a = itemCenter(node); const b = screenAnchor(screen, node)
                return <line key={`detail-${node.id}`} className={'mfpl-detail-link'} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              })}

              {[...lineageGroups.entries()].flatMap(([key, group]) => {
                const sorted = [...group].sort((a, b) => STATE_ORDER.indexOf(screensById.get(a.screenId)?.state ?? 'proto') - STATE_ORDER.indexOf(screensById.get(b.screenId)?.state ?? 'proto'))
                return sorted.slice(0, -1).map((node, index) => {
                  const next = sorted[index + 1]
                  const a = itemCenter(node); const b = itemCenter(next)
                  return <line key={`lineage-${key}-${index}`} className="mfpl-lineage-link" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                })
              })}
            </svg>

            {(Object.keys(STATE_HEADER_X) as StateId[]).map((state) => (
              <div key={state} className={`mfpl-state-title is-${state}`} style={{ left: STATE_HEADER_X[state], top: 120 }}>
                <b>{STATE_LABEL[state]}</b>
                <span>{state === 'covers' ? 'ensemble séparé' : state === 'proto' ? 'fonctionnel' : state === 'da' ? 'conception visuelle' : 'DA intégrée'}</span>
              </div>
            ))}

            {project.screens.map((screen) => {
              const band = viewportBand(reference, screen.anchor ?? 'center')
              const isCollapsed = collapsedScreens.has(screen.id)
              const screenAnnotations = annotations.filter((item) => item.screenId === screen.id)
              const activeGesture = gesture?.screenId === screen.id ? gesture : null
              return (
                <article key={screen.id} className={`mfpl-screen ${selection?.kind === 'screen' && selection.id === screen.id ? 'is-selected' : ''}`} style={{ left: screen.x, top: screen.y }}>
                  <div className="mfpl-screen-heading">
                    <button onClick={() => setSelection({ kind: 'screen', id: screen.id })}><b>{screen.id}</b> {screen.title}</button>
                    {viewMode === 'exploded' && <button className="mfpl-collapse" title={isCollapsed ? 'Éclater cet écran' : 'Simplifier cet écran'} onClick={() => toggleScreen(screen.id)}>{isCollapsed ? '+' : '−'}</button>}
                  </div>
                  <div className="mfpl-screen-art" onPointerDown={(event) => onScreenPointerDown(event, screen)} onPointerMove={(event) => onScreenPointerMove(event, screen)} onPointerUp={(event) => onScreenPointerUp(event, screen)}>
                    <ScreenArtwork screen={screen} game={game} />
                    {band && <div className="mfpl-reference-mask" aria-hidden="true"><i className="top" style={{ height: band.top }} /><i className="window" style={{ top: band.top, height: band.height }}><span>{band.label}</span></i><i className="bottom" style={{ top: band.top + band.height }} /></div>}
                    {screenAnnotations.map((annotation) => (
                      <button key={annotation.id} className={`mfpl-annotation is-${annotation.type}`} style={{ left: annotation.x, top: annotation.y, width: annotation.w, height: annotation.h }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setSelection({ kind: 'annotation', id: annotation.id }) }}>
                        {annotation.type === 'point' && <span />}
                        {annotation.type === 'note' && <b>N</b>}
                        {annotation.type === 'draw' && annotation.points && <svg viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={annotation.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}
                      </button>
                    ))}
                    {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left: Math.min(activeGesture.start.x, activeGesture.current.x), top: Math.min(activeGesture.start.y, activeGesture.current.y), width: Math.abs(activeGesture.current.x - activeGesture.start.x), height: Math.abs(activeGesture.current.y - activeGesture.start.y) }} />}
                    {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>}
                  </div>
                  <small>{MASTER_WIDTH} × {MASTER_HEIGHT}</small>
                </article>
              )
            })}

            {project.nodes.filter(visibleNode).map((node) => (
              <article key={node.id} className={`mfpl-node is-${node.kind} ${selection?.kind === 'node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: node.w ?? 300, minHeight: node.h ?? 150 }} onClick={() => setSelection({ kind: 'node', id: node.id })}>
                <header><b>{node.title}</b><small>{node.kind}</small></header>
                <NodePreview node={node} />
                <p>{node.body}</p>
              </article>
            ))}

            {reviewNodes.filter(visibleNode).map((node) => (
              <article key={node.id} className={`mfpl-node is-review ${selection?.kind === 'review-node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left: node.x, top: node.y, width: 320 }} onClick={() => setSelection({ kind: 'review-node', id: node.id })}>
                <header><b>{node.title}</b><small>REVUE LOCALE</small></header>
                <p>{node.text}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="mfpl-inspector">
          {!selection && <div className="mfpl-empty-inspector"><b>Rien de sélectionné</b><p>Clique un écran, un nœud ou une annotation.</p></div>}

          {selectedScreen && <>
            <div className="mfpl-inspector-title"><small>{STATE_LABEL[selectedScreen.state]} · ÉCRAN</small><h2>{selectedScreen.title}</h2></div>
            <p>{selectedScreen.context}</p>
            <dl><div><dt>Taille</dt><dd>390 × 844</dd></div><div><dt>Ancrage</dt><dd>{selectedScreen.anchor ?? 'center'}</dd></div><div><dt>Nœuds</dt><dd>{project.nodes.filter((node) => node.screenId === selectedScreen.id).length + reviewNodes.filter((node) => node.screenId === selectedScreen.id).length}</dd></div></dl>
            <div className="mfpl-inspector-actions"><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button>{selectedScreen.state !== 'covers' && <button onClick={() => window.open(`/?game=${game.id}`, '_blank', 'noopener,noreferrer')}>Ouvrir le jeu</button>}<button onClick={() => addReviewNode(selectedScreen)}>+ Nœud brouillon</button></div>
            <label className="mfpl-field">Commentaire de revue<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} placeholder="Ce que ChatGPT doit comprendre ou corriger…" /></label>
          </>}

          {selectedNode && <>
            <div className="mfpl-inspector-title"><small>NŒUD · {selectedNode.kind.toUpperCase()}</small><h2>{selectedNode.title}</h2></div>
            <p>{selectedNode.body}</p>
            <dl><div><dt>Écran lié</dt><dd>{selectedNode.screenId}</dd></div><div><dt>Continuité</dt><dd>{selectedNode.lineage ?? '—'}</dd></div></dl>
            <label className="mfpl-field">Commentaire de revue<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current) => ({ ...current, [selectedKey]: event.target.value }))} placeholder="Graphiquement, fonctionnellement, production…" /></label>
          </>}

          {selectedAnnotation && <>
            <div className="mfpl-inspector-title"><small>ANNOTATION · {selectedAnnotation.type.toUpperCase()}</small><h2>{selectedAnnotation.id}</h2></div>
            <dl><div><dt>Écran</dt><dd>{selectedAnnotation.screenId}</dd></div><div><dt>Position</dt><dd>{Math.round(selectedAnnotation.x)}, {Math.round(selectedAnnotation.y)}</dd></div></dl>
            <label className="mfpl-field">Note<textarea value={selectedAnnotation.text} onChange={(event) => setAnnotations((current) => current.map((item) => item.id === selectedAnnotation.id ? { ...item, text: event.target.value } : item))} placeholder="Que se passe-t-il ici ?" /></label>
            <button className="mfpl-danger" onClick={() => deleteAnnotation(selectedAnnotation.id)}>Supprimer l’annotation</button>
          </>}

          {selectedReviewNode && <>
            <div className="mfpl-inspector-title"><small>NŒUD BROUILLON · LOCAL</small><h2>{selectedReviewNode.title}</h2></div>
            <label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(event) => setReviewNodes((current) => current.map((item) => item.id === selectedReviewNode.id ? { ...item, title: event.target.value } : item))} /></label>
            <label className="mfpl-field">Contenu<textarea value={selectedReviewNode.text} onChange={(event) => setReviewNodes((current) => current.map((item) => item.id === selectedReviewNode.id ? { ...item, text: event.target.value } : item))} /></label>
            <p className="mfpl-local-note">Ce nœud reste dans ton calque local. Il n’est appliqué au projet qu’après export vers le chat.</p>
            <button className="mfpl-danger" onClick={() => deleteReviewNode(selectedReviewNode.id)}>Supprimer le nœud</button>
          </>}

          {selection && <div className="mfpl-readonly"><b>REVUE NON DESTRUCTIVE</b><span>Le Lab n’écrit ni le jeu ni les documents canoniques. Exporte tes retours vers ChatGPT pour appliquer les changements.</span></div>}
        </aside>
      </div>
    </main>
  )
}
