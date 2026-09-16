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
  facts?: string[]
  source?: string
  status?: string
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
  facts?: string[]
  source?: string
  image?: string
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
  summary: string
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

type Camera = { x: number; y: number; zoom: number }

type PinchState = {
  distance: number
  worldX: number
  worldY: number
  camera: Camera
}

const MASTER_WIDTH = 390
const MASTER_HEIGHT = 844
const WORLD_WIDTH = 7000
const WORLD_HEIGHT = 6200
const STATE_ORDER: StateId[] = ['proto', 'da', 'release']
const STATE_HEADER_X: Record<StateId, number> = { covers: 220, proto: 1500, da: 3300, release: 5350 }
const STATE_LABEL: Record<StateId, string> = { covers: 'COVERS', proto: 'PROTO', da: 'DA', release: 'RELEASE' }
const DA_REFERENCE = '/assets/generated/linefugg/solar-origami-v3/references/linefugg-da-validated-2026-09-14.png'

const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; cssHeight?: number }> = [
  { id: 'off', label: 'Sans repère' },
  { id: 'minimum', label: 'Minimum jouable 360×650', cssHeight: 650 },
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

function buildGenericPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`,
    state: 'covers',
    title: variant.label || `Cover ${index + 1}`,
    context: 'Cover éditoriale. Les covers forment un ensemble séparé avant le flux Proto → DA → Release.',
    facts: [`Variante ${index + 1}`, 'Image statique Core', 'Doit respecter les zones Cover MiniFugg'],
    source: variant.image,
    x: STATE_HEADER_X.covers,
    y: 430 + index * 980,
    image: variant.image,
    preview: 'cover',
    anchor: 'center',
  }))
  if (covers.length === 0) covers.push({ id: 'C1', state: 'covers', title: 'Cover', context: 'Aucune cover enregistrée.', facts: ['Livrable à produire'], x: STATE_HEADER_X.covers, y: 430, preview: 'cover', anchor: 'center' })

  const rules = game.instructions?.rules ?? []
  const controls = game.instructions?.controls ?? []
  const screens: PlanScreen[] = [
    ...covers,
    { id: 'P1', state: 'proto', title: 'Situation principale', context: 'Référence fonctionnelle du prototype.', facts: [game.instructions?.goal ?? game.description, ...rules.slice(0, 3)], source: `src/games/${game.id}/`, status: 'Fonctionnel', x: STATE_HEADER_X.proto, y: 430, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'D1', state: 'da', title: 'Vision générale', context: 'Écran principal de DA. Les situations supplémentaires existent seulement lorsqu’elles lèvent une ambiguïté.', facts: ['Composition générale', 'Langage de formes et matières', 'États visuels nécessaires'], status: 'À enrichir', x: STATE_HEADER_X.da, y: 430, preview: 'game', anchor: 'center', lineage: 'main' },
    { id: 'D2', state: 'da', title: 'Situation complémentaire', context: 'Moment particulier du jeu utile pour détailler un comportement ou un état invisible dans la vue générale.', facts: ['À créer uniquement si nécessaire'], status: 'À définir', x: STATE_HEADER_X.da, y: 1700, preview: 'detail', anchor: 'center' },
    { id: 'R1', state: 'release', title: 'Intégration courante', context: 'DA intégrée dans le runtime. Release signifie ici version intégrée en cours, pas nécessairement v1 finale.', facts: ['Comparer au proto et à la DA', 'Conserver les comportements validés'], status: 'À vérifier', x: STATE_HEADER_X.release, y: 430, preview: 'game', anchor: 'center', lineage: 'main' },
  ]
  const nodes: PlanNode[] = [
    { id: 'P-goal', screenId: 'P1', title: 'Intention de jeu', kind: 'text', body: game.instructions?.goal ?? game.description, facts: rules, x: STATE_HEADER_X.proto - 430, y: 560, lineage: 'goal' },
    { id: 'P-controls', screenId: 'P1', title: 'Interactions', kind: 'text', body: controls.join(' · ') || 'Interactions à extraire du prototype.', x: STATE_HEADER_X.proto + 500, y: 760, lineage: 'controls' },
    { id: 'D-visual', screenId: 'D1', title: 'Langage visuel', kind: 'image', body: 'Formes, matières, contrastes et hiérarchie à définir avant l’intégration.', x: STATE_HEADER_X.da - 500, y: 560, lineage: 'visual' },
    { id: 'D-states', screenId: 'D2', title: 'États / transitions', kind: 'animation', body: 'Ce qui doit changer visuellement pendant l’action.', x: STATE_HEADER_X.da + 500, y: 1880 },
    { id: 'R-visual', screenId: 'R1', title: 'Rendu intégré', kind: 'image', body: 'Correspondance réelle entre la DA et le runtime.', x: STATE_HEADER_X.release + 500, y: 560, lineage: 'visual' },
    { id: 'R-audio', screenId: 'R1', title: 'Audio intégré', kind: 'audio', body: 'Sons et musique liés aux actions ou aux situations.', x: STATE_HEADER_X.release + 500, y: 850 },
  ]
  return { title: projectTitle(game), summary: game.description, screens, nodes }
}

function buildLineFuggPlan(game: InstagameDefinition): PlanProject {
  const covers = (game.welcome?.variants ?? []).slice(0, 6).map<PlanScreen>((variant, index) => ({
    id: `C${index + 1}`,
    state: 'covers',
    title: variant.label || `Cover ${index + 1}`,
    context: 'Édition de cover indépendante de la transformation Proto → DA → Release.',
    facts: ['Cover raster statique 390×844', 'Titre et sujet dans la zone utile', 'Aucun HUD ou faux bouton dans l’image'],
    source: variant.image,
    x: STATE_HEADER_X.covers,
    y: 430 + index * 980,
    image: variant.image,
    preview: 'cover',
    anchor: 'center',
  }))

  const screens: PlanScreen[] = [
    ...covers,
    {
      id: 'P1', state: 'proto', title: 'Boucle principale', lineage: 'main', status: 'Référence fonctionnelle',
      context: 'Prototype évolué servant de base à Rebirth. Le joueur trace exactement trois lignes sur une grille 7×7.',
      facts: ['3 lignes maximum', '2 à 5 cases par ligne', 'Horizontal / vertical / diagonal', 'Le calcul suit la direction de la flèche', 'Deux lignes peuvent se croiser sur une seule case'],
      source: 'LineFugg classique / gameplay validé', x: STATE_HEADER_X.proto, y: 430, preview: 'game', anchor: 'center',
    },
    {
      id: 'P2', state: 'proto', title: 'Trois lignes posées', lineage: 'three-lines', status: 'Règle validée',
      context: 'Moment important : après avoir posé les trois lignes, la partie ne se résout pas automatiquement.',
      facts: ['Le joueur peut encore ajuster ses lignes', 'Undo reste pertinent', 'Validation manuelle obligatoire'],
      source: 'Règle gameplay canonique', x: STATE_HEADER_X.proto, y: 1720, preview: 'detail', anchor: 'center',
    },
    {
      id: 'P3', state: 'proto', title: 'Validation / score', status: 'Référence fonctionnelle',
      context: 'Fin de boucle : les trois calculs deviennent le score final et la partie peut repartir.',
      facts: ['Score final = somme des 3 lignes', 'Feedback de validation', 'Nouvelle partie après résolution'],
      source: 'Prototype classique', x: STATE_HEADER_X.proto, y: 3010, preview: 'detail', anchor: 'center',
    },

    {
      id: 'D1', state: 'da', title: 'Vision générale Rebirth', lineage: 'main', status: 'À reconstruire',
      context: 'Écran principal de la nouvelle DA. Il doit traduire toutes les fonctions essentielles du proto sans en changer la logique.',
      facts: ['Grille dominante', 'Trois identités de ligne', 'Trois résultats visibles', 'Total / score lisible', 'Undo et Validate accessibles', 'Décor compatible avec le viewport MiniFugg'],
      source: 'Nouvelle DA Rebirth — à produire', x: STATE_HEADER_X.da, y: 430, preview: 'game', anchor: 'center',
    },
    {
      id: 'D2', state: 'da', title: 'Interaction cellule / tracé', lineage: 'three-lines', status: 'À concevoir',
      context: 'Situation dédiée à tout ce qui est difficile à lire dans l’écran général : sélection, ligne en cours, états des cellules et valeurs.',
      facts: ['État neutre', 'Survol / départ', 'Sélection de 2 à 5 cases', 'Valide / invalide', 'Croisement autorisé', 'Chiffres toujours lisibles au-dessus du tracé'],
      source: 'Requirements du proto', x: STATE_HEADER_X.da, y: 1720, preview: 'detail', anchor: 'center',
    },
    {
      id: 'D3', state: 'da', title: 'Commit / résultat / énergie', status: 'À concevoir',
      context: 'Situation dédiée au moment où une ligne est commitée et où le jeu doit expliquer visuellement son résultat.',
      facts: ['Feedback au commit', 'Transfert vers le résultat', 'Résultat affecté à la bonne ligne', 'Undo remet l’état en arrière', 'Validation finale des trois lignes'],
      source: 'Requirements + future DA', x: STATE_HEADER_X.da, y: 3010, preview: 'detail', anchor: 'center',
    },
    {
      id: 'D4', state: 'da', title: 'Plan de production graphique', status: 'À dériver de la DA',
      context: 'Cette situation n’est pas un écran joueur : elle sert à visualiser les familles d’assets, tilesets, animations et états nécessaires avant intégration.',
      facts: ['Canvas canoniques par famille', 'États interchangeables de même taille', 'Tilesets / atlas', 'Animations et FX', 'Audio associé aux actions'],
      source: 'DA validée → découpe de production', x: STATE_HEADER_X.da, y: 4300, preview: 'detail', anchor: 'center',
    },

    {
      id: 'R1', state: 'release', title: 'Intégration Rebirth', lineage: 'main', status: 'Pas encore produite',
      context: 'Version intégrée de Rebirth. Elle sera la comparaison directe avec D1, pas une “release finale” au sens commercial.',
      facts: ['Gameplay du proto préservé', 'DA réellement intégrée', 'Assets et états utilisés dans le runtime', 'Écarts DA ↔ runtime visibles ici'],
      source: 'Future intégration Rebirth', x: STATE_HEADER_X.release, y: 430, preview: 'game', anchor: 'center',
    },
    {
      id: 'R2', state: 'release', title: 'Interaction intégrée', lineage: 'three-lines', status: 'Pas encore produite',
      context: 'Même situation que D2, mais rendue par le jeu réel pour comparer comportement et fidélité visuelle.',
      facts: ['Sélection réelle', 'Tracé réel', 'États réels des cellules', 'Hitboxes et feedback réels'],
      source: 'Future intégration Rebirth', x: STATE_HEADER_X.release, y: 1720, preview: 'detail', anchor: 'center',
    },
  ]

  const nodes: PlanNode[] = [
    { id: 'P-goal', screenId: 'P1', title: 'But', kind: 'text', body: 'Tracer trois lignes et fabriquer le plus gros score possible.', facts: ['Chaque ligne : 2 à 5 cases', 'Le sens du tracé définit le calcul'], x: STATE_HEADER_X.proto - 470, y: 520, lineage: 'goal' },
    { id: 'P-grid', screenId: 'P1', title: 'Grille 7×7', kind: 'image', body: 'Surface centrale et géométrie de référence du proto.', facts: ['49 cellules', 'Nombres / opérateurs', 'Croisement sur une seule case'], x: STATE_HEADER_X.proto - 470, y: 800, anchor: { x: 195, y: 390 }, lineage: 'grid' },
    { id: 'P-line', screenId: 'P1', title: 'Ligne joueur', kind: 'animation', body: 'Le geste de base : départ, direction, cases traversées, flèche et résultat.', facts: ['Horizontal / vertical / diagonal', 'Direction visible', 'Feedback invalide'], x: STATE_HEADER_X.proto + 500, y: 610, anchor: { x: 190, y: 500 }, lineage: 'line' },
    { id: 'P-calc', screenId: 'P1', title: 'Calcul', kind: 'text', body: 'Les valeurs sont appliquées dans l’ordre du tracé.', facts: ['Premier positif sans +', 'Négatifs attachés à la valeur', '× / ÷ modifient le calcul'], x: STATE_HEADER_X.proto + 500, y: 900, lineage: 'calc' },
    { id: 'P-controls', screenId: 'P2', title: 'Undo / Validate', kind: 'text', body: 'Après trois lignes : correction encore possible puis validation manuelle.', facts: ['Undo immédiat', 'Validate seulement quand le joueur décide'], x: STATE_HEADER_X.proto - 470, y: 1900, anchor: { x: 300, y: 730 }, lineage: 'controls' },
    { id: 'P-score', screenId: 'P3', title: 'Score final', kind: 'text', body: 'Somme des trois résultats.', facts: ['3 résultats intermédiaires', 'Total final'], x: STATE_HEADER_X.proto + 500, y: 3230, anchor: { x: 195, y: 260 }, lineage: 'score' },

    { id: 'D-requirements', screenId: 'D1', title: 'Contrat visuel', kind: 'text', body: 'La DA doit résoudre les fonctions du proto avant toute découpe technique.', facts: ['Lisibilité > décoration', 'Même composition logique sur tous les écrans', 'Pas d’élément gameplay oublié'], x: STATE_HEADER_X.da - 520, y: 460, lineage: 'goal' },
    { id: 'D-grid', screenId: 'D1', title: 'Grille / surface', kind: 'image', body: 'Cadre, cellules, rythme, densité et hiérarchie du plateau.', facts: ['Dominante visuelle', 'Carrés exacts', 'Doit rester lisible au minimum 360×650'], x: STATE_HEADER_X.da - 520, y: 760, anchor: { x: 195, y: 390 }, lineage: 'grid' },
    { id: 'D-results', screenId: 'D1', title: 'Résultats ×3', kind: 'image', body: 'Trois destinations stables correspondant aux trois lignes.', facts: ['État vide', 'État preview', 'État commit', 'Retour après Undo'], x: STATE_HEADER_X.da + 510, y: 520, lineage: 'results' },
    { id: 'D-current-failure', screenId: 'D1', title: 'Ancienne DA : cas d’étude', kind: 'image', body: 'Solar Origami reste une référence d’échec utile pour comprendre ce que le nouveau pipeline doit empêcher.', facts: ['Ne pas hériter comme DA de Rebirth', 'Comparer les écarts de découpe / intégration'], source: DA_REFERENCE, image: DA_REFERENCE, x: STATE_HEADER_X.da + 510, y: 830 },

    { id: 'D-cells', screenId: 'D2', title: 'Famille cellules', kind: 'tileset', body: 'Tous les états interchangeables nécessaires au runtime.', facts: ['Neutre', 'Hover / départ', 'Ligne 1', 'Ligne 2', 'Ligne 3', 'Opérateur'], x: STATE_HEADER_X.da - 520, y: 1810, anchor: { x: 220, y: 390 }, lineage: 'cells' },
    { id: 'D-glyphs', screenId: 'D2', title: 'Glyphes / valeurs', kind: 'tileset', body: 'Atlas ou système graphique cohérent pour toutes les valeurs visibles.', facts: ['1…9', '−1…−4', '×2 ×3', '÷2 ÷3', 'Score : 0…9 + signes'], x: STATE_HEADER_X.da - 520, y: 2110, lineage: 'glyphs' },
    { id: 'D-line', screenId: 'D2', title: 'Ligne joueur', kind: 'animation', body: 'État visuel du geste avant commit.', facts: ['Idle', 'Drag', 'Valide', 'Invalide', 'Endpoint', 'Direction'], x: STATE_HEADER_X.da + 510, y: 1810, anchor: { x: 180, y: 450 }, lineage: 'line' },
    { id: 'D-cross', screenId: 'D2', title: 'Croisement', kind: 'text', body: 'Cas particulier à montrer : deux lignes peuvent partager une seule cellule.', facts: ['Lisibilité des deux identités', 'Pas de confusion avec la sélection active'], x: STATE_HEADER_X.da + 510, y: 2110, lineage: 'cross' },

    { id: 'D-commit', screenId: 'D3', title: 'Commit d’une ligne', kind: 'animation', body: 'Le moment où le tracé cesse d’être provisoire.', facts: ['Ligne figée', 'Résultat affecté', 'Feedback bref'], x: STATE_HEADER_X.da - 520, y: 3120, lineage: 'commit' },
    { id: 'D-fx', screenId: 'D3', title: 'FX / énergie', kind: 'animation', body: 'Feedback visuel qui traduit le passage de la ligne vers son résultat.', facts: ['Départ', 'Voyage', 'Arrivée', 'Succès', 'Erreur'], x: STATE_HEADER_X.da + 510, y: 3120, anchor: { x: 195, y: 480 }, lineage: 'fx' },
    { id: 'D-audio', screenId: 'D3', title: 'Audio associé', kind: 'audio', body: 'Sons sémantiques liés aux actions, sans devenir une seconde musique.', facts: ['Move / draw', 'Commit', 'Erreur', 'Validation finale'], x: STATE_HEADER_X.da + 510, y: 3430, lineage: 'audio' },
    { id: 'D-controls', screenId: 'D3', title: 'Contrôles', kind: 'tileset', body: 'Undo / Validate avec états interchangeables.', facts: ['Disabled', 'Idle', 'Pressed', 'Enabled', 'Même canvas / même pivot / même destination'], x: STATE_HEADER_X.da - 520, y: 3430, anchor: { x: 300, y: 730 }, lineage: 'controls' },

    { id: 'D-production', screenId: 'D4', title: 'Découpe attendue', kind: 'text', body: 'Ce que l’intégrateur doit recevoir au lieu d’interpréter la DA lui-même.', facts: ['Éléments séparés', 'Bounds', 'Pivots', 'Z-order', 'États / animations', 'Ownership raster / Phaser / Core'], x: STATE_HEADER_X.da - 520, y: 4410 },
    { id: 'D-tiles', screenId: 'D4', title: 'Tilesets / atlas', kind: 'tileset', body: 'Familles produites dans leurs dimensions canoniques.', facts: ['Un canvas commun par famille', 'Glow / pressed gardent le même canvas', 'Alpha vide accepté'], x: STATE_HEADER_X.da + 510, y: 4410, lineage: 'assets' },
    { id: 'D-viewport', screenId: 'D4', title: 'Contrat de viewport', kind: 'text', body: 'MASTER 390×844 avec contrôle du minimum jouable MiniFugg.', facts: ['Fenêtre minimum 360×650', 'Ancrage top / center / bottom', 'Pas de reflow PC/mobile'], x: STATE_HEADER_X.da + 510, y: 4710, lineage: 'viewport' },

    { id: 'R-grid', screenId: 'R1', title: 'Grille intégrée', kind: 'image', body: 'À comparer directement au nœud D-grid.', facts: ['Dimensions réelles', 'Lisibilité réelle', 'Position réelle'], x: STATE_HEADER_X.release + 500, y: 520, anchor: { x: 195, y: 390 }, lineage: 'grid' },
    { id: 'R-line', screenId: 'R1', title: 'Ligne intégrée', kind: 'animation', body: 'Animation runtime réelle à comparer à D-line.', facts: ['Vitesse', 'Forme', 'Endpoints', 'Feedback invalide'], x: STATE_HEADER_X.release + 500, y: 820, anchor: { x: 180, y: 490 }, lineage: 'line' },
    { id: 'R-controls', screenId: 'R1', title: 'Contrôles intégrés', kind: 'tileset', body: 'États réellement utilisés dans le jeu.', facts: ['Même canvas entre états', 'Hitbox stable'], x: STATE_HEADER_X.release + 500, y: 1120, anchor: { x: 300, y: 730 }, lineage: 'controls' },
    { id: 'R-cells', screenId: 'R2', title: 'Cellules intégrées', kind: 'tileset', body: 'États du runtime à comparer à D-cells.', facts: ['Normal', 'Sélection', 'Trois lignes', 'Opérateur'], x: STATE_HEADER_X.release - 500, y: 1870, lineage: 'cells' },
    { id: 'R-fx', screenId: 'R2', title: 'FX intégrés', kind: 'animation', body: 'Effets réellement présents dans cette situation.', facts: ['Comparer forme / timing / densité à la DA'], x: STATE_HEADER_X.release + 500, y: 1870, anchor: { x: 195, y: 480 }, lineage: 'fx' },
    { id: 'R-audio', screenId: 'R2', title: 'Audio intégré', kind: 'audio', body: 'Sons réellement déclenchés par l’interaction.', facts: ['Tester contexte et mix'], x: STATE_HEADER_X.release + 500, y: 2170, lineage: 'audio' },
  ]

  return {
    title: 'LineFugg — Rebirth',
    summary: 'Le Plan suit la transformation du prototype fonctionnel vers une nouvelle DA puis vers son intégration, sans imposer une symétrie artificielle entre les états.',
    screens,
    nodes,
  }
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
  if ('kind' in item) return { x: item.x + (item.w ?? 310) / 2, y: item.y + (item.h ?? 190) / 2 }
  return { x: item.x + 160, y: item.y + 90 }
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

function viewportBand(reference: ReferenceMode, anchor: AnchorMode) {
  const option = REFERENCE_OPTIONS.find((item) => item.id === reference)
  if (!option?.cssHeight) return null
  const height = Math.min(MASTER_HEIGHT, MASTER_WIDTH * option.cssHeight / 360)
  const top = anchor === 'top' ? 0 : anchor === 'bottom' ? MASTER_HEIGHT - height : (MASTER_HEIGHT - height) / 2
  return { top, height, label: option.label }
}

function loadReview(gameId: string) {
  const empty = { annotations: [] as Annotation[], reviewNodes: [] as ReviewNode[], comments: {} as Record<string, string> }
  if (typeof window === 'undefined') return empty
  try {
    const raw = localStorage.getItem(`mf-production-review:${gameId}`)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<typeof empty>
    return { annotations: parsed.annotations ?? [], reviewNodes: parsed.reviewNodes ?? [], comments: parsed.comments ?? {} }
  } catch {
    return empty
  }
}

function GridPreview({ detail = false }: { detail?: boolean }) {
  const values = [2, 4, 1, 7, 3, 8, 5, 6, 9]
  return <div className={`mfpl-grid-preview ${detail ? 'is-detail' : ''}`}>
    {Array.from({ length: 49 }, (_, index) => <span key={index}>{index % 6 === 0 ? values[index % values.length] : ''}</span>)}
    <svg viewBox="0 0 280 280" aria-hidden="true"><polyline points="38,210 78,170 118,170 158,130 198,90 238,90" /></svg>
  </div>
}

function ScreenArtwork({ screen, game }: { screen: PlanScreen; game: InstagameDefinition }) {
  if (screen.image) return <img className="mfpl-screen-image" src={screen.image} alt="" />
  return <div className={`mfpl-generated-screen is-${screen.preview}`}>
    <div className="mfpl-generated-title">{projectTitle(game)}</div>
    <div className="mfpl-generated-subtitle">{screen.title}</div>
    <GridPreview detail={screen.preview === 'detail'} />
    <div className="mfpl-generated-footer">{screen.status ?? game.description}</div>
  </div>
}

function NodePreview({ node }: { node: PlanNode }) {
  if (node.image) return <img className="mfpl-node-reference" src={node.image} alt="" />
  if (node.kind === 'audio') return <div className="mfpl-wave" aria-hidden="true">{[12, 28, 18, 36, 24, 44, 20, 32, 16, 38, 22, 30].map((height, index) => <i key={index} style={{ height }} />)}</div>
  if (node.kind === 'tileset' || node.kind === 'animation') return <div className="mfpl-tiles" aria-hidden="true">{[0, 1, 2, 3].map((item) => <i key={item} />)}</div>
  if (node.kind === 'image') return <div className="mfpl-node-image" aria-hidden="true"><GridPreview detail /></div>
  return null
}

function annotationPoint(event: ReactPointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  return { x: clamp((event.clientX - rect.left) / rect.width * MASTER_WIDTH, 0, MASTER_WIDTH), y: clamp((event.clientY - rect.top) / rect.height * MASTER_HEIGHT, 0, MASTER_HEIGHT) }
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
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
  const [camera, setCamera] = useState<Camera>({ x: 34, y: 34, zoom: 0.34 })
  const [selection, setSelection] = useState<Selection>({ kind: 'screen', id: 'D1' })
  const [collapsedScreens, setCollapsedScreens] = useState<Set<string>>(new Set())
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadReview(gameId).annotations)
  const [reviewNodes, setReviewNodes] = useState<ReviewNode[]>(() => loadReview(gameId).reviewNodes)
  const [comments, setComments] = useState<Record<string, string>>(() => loadReview(gameId).comments)
  const [gesture, setGesture] = useState<Gesture>(null)
  const [exported, setExported] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<{ startX: number; startY: number; cameraX: number; cameraY: number } | null>(null)
  const touchesRef = useRef(new Map<number, Point>())
  const pinchRef = useRef<PinchState | null>(null)

  useEffect(() => {
    const review = loadReview(gameId)
    setAnnotations(review.annotations)
    setReviewNodes(review.reviewNodes)
    setComments(review.comments)
    setSelection({ kind: 'screen', id: gameId === 'linefugg' ? 'D1' : 'P1' })
    setCollapsedScreens(new Set())
    setCamera({ x: 34, y: 34, zoom: 0.34 })
  }, [gameId])

  useEffect(() => {
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
    setCamera({ x: 28, y: 36, zoom: 0.24 })
  }

  function zoomAt(clientX: number, clientY: number, nextZoom: number) {
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
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
    const factor = Math.exp(-event.deltaY * 0.0015)
    zoomAt(event.clientX, event.clientY, camera.zoom * factor)
  }

  function trackTouchDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') return
    touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touchesRef.current.size === 2) {
      const [a, b] = [...touchesRef.current.values()]
      const center = midpoint(a, b)
      const viewport = viewportRef.current?.getBoundingClientRect()
      if (!viewport) return
      const px = center.x - viewport.left
      const py = center.y - viewport.top
      pinchRef.current = {
        distance: Math.max(1, distance(a, b)),
        worldX: (px - camera.x) / camera.zoom,
        worldY: (py - camera.y) / camera.zoom,
        camera,
      }
    }
  }

  function trackTouchMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch' || !touchesRef.current.has(event.pointerId)) return
    touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touchesRef.current.size < 2 || !pinchRef.current) return
    const [a, b] = [...touchesRef.current.values()]
    const center = midpoint(a, b)
    const viewport = viewportRef.current?.getBoundingClientRect()
    if (!viewport) return
    const px = center.x - viewport.left
    const py = center.y - viewport.top
    const zoom = clamp(pinchRef.current.camera.zoom * distance(a, b) / pinchRef.current.distance, 0.08, 2.8)
    setCamera({ zoom, x: px - pinchRef.current.worldX * zoom, y: py - pinchRef.current.worldY * zoom })
  }

  function trackTouchEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') return
    touchesRef.current.delete(event.pointerId)
    if (touchesRef.current.size < 2) pinchRef.current = null
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return
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
    if (event.pointerType === 'touch' && touchesRef.current.size > 1) return
    event.stopPropagation()
    if (tool === 'select') return void setSelection({ kind: 'screen', id: screen.id })
    if (tool === 'pan') return
    const point = annotationPoint(event)
    if (tool === 'point' || tool === 'note') return void addAnnotation(screen, tool, point)
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
    const count = reviewNodes.filter((item) => item.screenId === screen.id).length
    const id = `N-${Date.now().toString(36)}`
    const node: ReviewNode = { id, screenId: screen.id, title: 'Nœud brouillon', text: 'Décrire ce qui manque, doit changer ou doit être produit.', x: screen.x + MASTER_WIDTH + 480, y: screen.y + 120 + count * 220 }
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
      kind: 'MINIFUGG_PRODUCTION_REVIEW_ALPHA', project: project.title, gameId: game.id, viewMode, reference,
      comments: Object.fromEntries(Object.entries(comments).filter(([, value]) => value.trim())), annotations,
      draftNodes: reviewNodes, simplifiedScreens: [...collapsedScreens],
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setExported(true)
    window.setTimeout(() => setExported(false), 1600)
  }

  const allVisibleNodes = [...project.nodes.filter(visibleNode), ...reviewNodes.filter(visibleNode)]
  const lineageGroups = new Map<string, PlanNode[]>()
  project.nodes.filter(visibleNode).forEach((node) => {
    if (!node.lineage) return
    lineageGroups.set(node.lineage, [...(lineageGroups.get(node.lineage) ?? []), node])
  })
  const linkedScreenNodes = selectedScreen ? project.nodes.filter((node) => node.screenId === selectedScreen.id) : []
  const selectedLineage = selectedNode?.lineage ? project.nodes.filter((node) => node.lineage === selectedNode.lineage) : []

  return <main className="mfpl">
    <header className="mfpl-topbar">
      <strong>MiniFugg Production Lab</strong>
      <label>Jeu<select value={game.id} onChange={(event) => setGameId(event.target.value)}>{gameRegistry.map((item) => <option key={item.id} value={item.id}>{projectTitle(item)}</option>)}</select></label>
      <div className="mfpl-project-summary">{project.summary}</div>
      <div className="mfpl-spacer" />
      <div className="mfpl-segmented"><button className={viewMode === 'simple' ? 'is-active' : ''} onClick={() => setViewMode('simple')}>Simplifiée</button><button className={viewMode === 'exploded' ? 'is-active' : ''} onClick={() => setViewMode('exploded')}>Éclatée</button></div>
      <label>Repère<select value={reference} onChange={(event) => setReference(event.target.value as ReferenceMode)}>{REFERENCE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <button className="mfpl-action" onClick={copyForChatGPT}>{exported ? 'Copié' : 'Copier pour ChatGPT'}</button>
    </header>

    <div className="mfpl-layout">
      <aside className="mfpl-tools" aria-label="Outils">
        {([['select','↖','Sélection'],['pan','✋','Déplacer'],['point','•','Point'],['rect','□','Zone'],['draw','✎','Dessin'],['note','N','Note']] as Array<[ToolMode,string,string]>).map(([id, icon, label]) => <button key={id} className={tool === id ? 'is-active' : ''} title={label} onClick={() => setTool(id)}><b>{icon}</b><span>{label}</span></button>)}
        <div className="mfpl-tool-spacer" />
        <button onClick={() => zoomAt((viewportRef.current?.getBoundingClientRect().left ?? 0) + (viewportRef.current?.clientWidth ?? 0) / 2, (viewportRef.current?.getBoundingClientRect().top ?? 0) + (viewportRef.current?.clientHeight ?? 0) / 2, camera.zoom * 1.2)}><b>+</b><span>Zoom</span></button>
        <button onClick={() => zoomAt((viewportRef.current?.getBoundingClientRect().left ?? 0) + (viewportRef.current?.clientWidth ?? 0) / 2, (viewportRef.current?.getBoundingClientRect().top ?? 0) + (viewportRef.current?.clientHeight ?? 0) / 2, camera.zoom / 1.2)}><b>−</b><span>Zoom</span></button>
        <button title="Vue globale" onClick={fitPlan}><b>⌗</b><span>Plan</span></button>
      </aside>

      <section
        ref={viewportRef}
        className="mfpl-viewport"
        onWheel={handleWheel}
        onPointerDownCapture={trackTouchDown}
        onPointerMoveCapture={trackTouchMove}
        onPointerUpCapture={trackTouchEnd}
        onPointerCancelCapture={trackTouchEnd}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="mfpl-camera-readout">{Math.round(camera.zoom * 100)}% · molette / pincement</div>
        <div className="mfpl-world" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
          {(Object.keys(STATE_HEADER_X) as StateId[]).map((state) => <div key={`guide-${state}`} className="mfpl-state-guide" style={{ left: STATE_HEADER_X[state] - 86, top: 105, height: WORLD_HEIGHT - 210 }} />)}
          <svg className="mfpl-links" width={WORLD_WIDTH} height={WORLD_HEIGHT} aria-hidden="true">
            <line className="mfpl-state-link" x1={STATE_HEADER_X.proto + 195} y1="175" x2={STATE_HEADER_X.da - 20} y2="175" />
            <line className="mfpl-state-link" x1={STATE_HEADER_X.da + 195} y1="175" x2={STATE_HEADER_X.release - 20} y2="175" />
            {project.screens.filter((screen) => screen.lineage === 'main').sort((a,b) => STATE_ORDER.indexOf(a.state)-STATE_ORDER.indexOf(b.state)).map((screen,index,list) => {
              const next = list[index + 1]
              if (!next) return null
              const a = itemCenter(screen), b = itemCenter(next)
              return <line key={`screen-lineage-${screen.id}`} className="mfpl-lineage-screen" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            })}
            {allVisibleNodes.map((node) => {
              const screen = screensById.get(node.screenId)
              if (!screen) return null
              const a = itemCenter(node), b = screenAnchor(screen, node)
              return <line key={`detail-${node.id}`} className="mfpl-detail-link" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            })}
            {[...lineageGroups.entries()].flatMap(([key, group]) => {
              const sorted = [...group].sort((a,b) => STATE_ORDER.indexOf(screensById.get(a.screenId)?.state ?? 'proto') - STATE_ORDER.indexOf(screensById.get(b.screenId)?.state ?? 'proto'))
              return sorted.slice(0,-1).map((node,index) => { const next=sorted[index+1]; const a=itemCenter(node), b=itemCenter(next); return <line key={`lineage-${key}-${index}`} className="mfpl-lineage-link" x1={a.x} y1={a.y} x2={b.x} y2={b.y} /> })
            })}
          </svg>

          {(Object.keys(STATE_HEADER_X) as StateId[]).map((state) => <div key={state} className="mfpl-state-title" style={{ left: STATE_HEADER_X[state], top: 110 }}><b>{STATE_LABEL[state]}</b><span>{state === 'covers' ? 'ensemble séparé' : state === 'proto' ? 'référence fonctionnelle' : state === 'da' ? 'conception / préparation' : 'DA intégrée'}</span></div>)}

          {project.screens.map((screen) => {
            const band = viewportBand(reference, screen.anchor ?? 'center')
            const isCollapsed = collapsedScreens.has(screen.id)
            const screenAnnotations = annotations.filter((item) => item.screenId === screen.id)
            const activeGesture = gesture?.screenId === screen.id ? gesture : null
            return <article key={screen.id} className={`mfpl-screen ${selection?.kind === 'screen' && selection.id === screen.id ? 'is-selected' : ''}`} style={{ left: screen.x, top: screen.y }}>
              <div className="mfpl-screen-heading"><button onClick={() => setSelection({ kind: 'screen', id: screen.id })}><b>{screen.id}</b> {screen.title}</button>{viewMode === 'exploded' && <button className="mfpl-collapse" title={isCollapsed ? 'Éclater cet écran' : 'Simplifier cet écran'} onClick={() => toggleScreen(screen.id)}>{isCollapsed ? '+' : '−'}</button>}</div>
              <div className="mfpl-screen-art" onPointerDown={(event) => onScreenPointerDown(event, screen)} onPointerMove={(event) => onScreenPointerMove(event, screen)} onPointerUp={(event) => onScreenPointerUp(event, screen)}>
                <ScreenArtwork screen={screen} game={game} />
                {band && <div className="mfpl-reference-mask" aria-hidden="true"><i className="top" style={{ height: band.top }} /><i className="window" style={{ top: band.top, height: band.height }}><span>{band.label}</span></i><i className="bottom" style={{ top: band.top + band.height }} /></div>}
                {screenAnnotations.map((annotation) => <button key={annotation.id} className={`mfpl-annotation is-${annotation.type}`} style={{ left: annotation.x, top: annotation.y, width: annotation.w, height: annotation.h }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setSelection({ kind:'annotation', id:annotation.id }) }}>{annotation.type === 'point' && <span />}{annotation.type === 'note' && <b>N</b>}{annotation.type === 'draw' && annotation.points && <svg viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={annotation.points.map((point)=>`${point.x},${point.y}`).join(' ')} /></svg>}</button>)}
                {activeGesture?.type === 'rect' && <div className="mfpl-gesture-rect" style={{ left:Math.min(activeGesture.start.x,activeGesture.current.x), top:Math.min(activeGesture.start.y,activeGesture.current.y), width:Math.abs(activeGesture.current.x-activeGesture.start.x), height:Math.abs(activeGesture.current.y-activeGesture.start.y) }} />}
                {activeGesture?.type === 'draw' && <svg className="mfpl-gesture-draw" viewBox={`0 0 ${MASTER_WIDTH} ${MASTER_HEIGHT}`}><polyline points={activeGesture.points.map((point)=>`${point.x},${point.y}`).join(' ')} /></svg>}
              </div>
              <small>{MASTER_WIDTH} × {MASTER_HEIGHT}{screen.status ? ` · ${screen.status}` : ''}</small>
            </article>
          })}

          {project.nodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-${node.kind} ${selection?.kind === 'node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left:node.x, top:node.y, width:node.w ?? 310, minHeight:node.h ?? 160 }} onClick={() => setSelection({ kind:'node', id:node.id })}><header><b>{node.title}</b><small>{node.kind}</small></header><NodePreview node={node} /><p>{node.body}</p>{node.facts?.length ? <ul>{node.facts.slice(0,4).map((fact)=><li key={fact}>{fact}</li>)}</ul> : null}</article>)}
          {reviewNodes.filter(visibleNode).map((node) => <article key={node.id} className={`mfpl-node is-review ${selection?.kind === 'review-node' && selection.id === node.id ? 'is-selected' : ''}`} style={{ left:node.x, top:node.y, width:320 }} onClick={() => setSelection({ kind:'review-node', id:node.id })}><header><b>{node.title}</b><small>REVUE LOCALE</small></header><p>{node.text}</p></article>)}
        </div>
      </section>

      <aside className="mfpl-inspector">
        {!selection && <div className="mfpl-empty-inspector"><b>Rien de sélectionné</b><p>Clique un écran, un nœud ou une annotation.</p></div>}
        {selectedScreen && <>
          <div className="mfpl-inspector-title"><small>{STATE_LABEL[selectedScreen.state]} · SITUATION</small><h2>{selectedScreen.title}</h2></div>
          <p>{selectedScreen.context}</p>
          {selectedScreen.facts?.length ? <div className="mfpl-semantic-block"><b>À comprendre dans cette situation</b><ul>{selectedScreen.facts.map((fact)=><li key={fact}>{fact}</li>)}</ul></div> : null}
          <dl><div><dt>Taille</dt><dd>390 × 844</dd></div><div><dt>Ancrage</dt><dd>{selectedScreen.anchor ?? 'center'}</dd></div><div><dt>Statut</dt><dd>{selectedScreen.status ?? '—'}</dd></div><div><dt>Source</dt><dd>{selectedScreen.source ?? '—'}</dd></div></dl>
          <div className="mfpl-linked-list"><b>Nœuds liés ({linkedScreenNodes.length})</b>{linkedScreenNodes.map((node)=><button key={node.id} onClick={() => setSelection({ kind:'node', id:node.id })}>{node.title}<span>{node.kind}</span></button>)}</div>
          <div className="mfpl-inspector-actions"><button onClick={() => toggleScreen(selectedScreen.id)}>{collapsedScreens.has(selectedScreen.id) ? 'Éclater cet écran' : 'Simplifier cet écran'}</button>{selectedScreen.state !== 'covers' && <button onClick={() => window.open(`/?game=${game.id}`, '_blank', 'noopener,noreferrer')}>Ouvrir le jeu</button>}<button onClick={() => addReviewNode(selectedScreen)}>+ Nœud brouillon</button></div>
          <label className="mfpl-field">Commentaire de revue<textarea value={comments[selectedKey] ?? ''} onChange={(event) => setComments((current)=>({ ...current, [selectedKey]:event.target.value }))} placeholder="Ce que ChatGPT doit comprendre ou corriger…" /></label>
        </>}
        {selectedNode && <>
          <div className="mfpl-inspector-title"><small>NŒUD · {selectedNode.kind.toUpperCase()}</small><h2>{selectedNode.title}</h2></div>
          <p>{selectedNode.body}</p>
          {selectedNode.facts?.length ? <div className="mfpl-semantic-block"><b>Détails</b><ul>{selectedNode.facts.map((fact)=><li key={fact}>{fact}</li>)}</ul></div> : null}
          <dl><div><dt>Écran lié</dt><dd>{selectedNode.screenId}</dd></div><div><dt>Continuité</dt><dd>{selectedNode.lineage ?? '—'}</dd></div><div><dt>Source</dt><dd>{selectedNode.source ?? '—'}</dd></div></dl>
          {selectedLineage.length > 1 && <div className="mfpl-linked-list"><b>Continuité Proto → DA → Release</b>{selectedLineage.map((node)=><button key={node.id} onClick={() => setSelection({ kind:'node', id:node.id })}>{STATE_LABEL[screensById.get(node.screenId)?.state ?? 'proto']} · {node.title}</button>)}</div>}
          <label className="mfpl-field">Commentaire de revue<textarea value={comments[selectedKey] ?? ''} onChange={(event)=>setComments((current)=>({ ...current, [selectedKey]:event.target.value }))} placeholder="Graphiquement, fonctionnellement, production…" /></label>
        </>}
        {selectedAnnotation && <><div className="mfpl-inspector-title"><small>ANNOTATION · {selectedAnnotation.type.toUpperCase()}</small><h2>{selectedAnnotation.id}</h2></div><dl><div><dt>Écran</dt><dd>{selectedAnnotation.screenId}</dd></div><div><dt>Position</dt><dd>{Math.round(selectedAnnotation.x)}, {Math.round(selectedAnnotation.y)}</dd></div></dl><label className="mfpl-field">Note<textarea value={selectedAnnotation.text} onChange={(event)=>setAnnotations((current)=>current.map((item)=>item.id===selectedAnnotation.id ? {...item,text:event.target.value}:item))} placeholder="Que se passe-t-il ici ?" /></label><button className="mfpl-danger" onClick={() => deleteAnnotation(selectedAnnotation.id)}>Supprimer l’annotation</button></>}
        {selectedReviewNode && <><div className="mfpl-inspector-title"><small>NŒUD BROUILLON · LOCAL</small><h2>{selectedReviewNode.title}</h2></div><label className="mfpl-field">Titre<input value={selectedReviewNode.title} onChange={(event)=>setReviewNodes((current)=>current.map((item)=>item.id===selectedReviewNode.id ? {...item,title:event.target.value}:item))} /></label><label className="mfpl-field">Contenu<textarea value={selectedReviewNode.text} onChange={(event)=>setReviewNodes((current)=>current.map((item)=>item.id===selectedReviewNode.id ? {...item,text:event.target.value}:item))} /></label><p className="mfpl-local-note">Ce nœud reste dans ton calque local. Il n’est appliqué au projet qu’après export vers le chat.</p><button className="mfpl-danger" onClick={() => deleteReviewNode(selectedReviewNode.id)}>Supprimer le nœud</button></>}
        {selection && <div className="mfpl-readonly"><b>COMMENT LE PLAN EST MIS À JOUR</b><span>Tes annotations restent locales. Tu exportes vers le chat ; ChatGPT/Codex met ensuite à jour le Plan canonique et le jeu dans le repo. Le navigateur ne peut rien casser.</span></div>}
      </aside>
    </div>
  </main>
}
