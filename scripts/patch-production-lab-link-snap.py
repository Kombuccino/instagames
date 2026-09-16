from pathlib import Path
import re

path = Path('src/core/ProductionLab.tsx')
text = path.read_text()

text = text.replace(
"""type EndpointDrag = {
  pointerId: number
  kind: 'canonical' | 'review'
  linkId: string
  sourceNodeId?: string
  side: 'source' | 'target'
  before: ReviewState
}
""",
"""type EndpointDrag = {
  pointerId: number
  kind: 'canonical' | 'review'
  linkId: string
  sourceNodeId?: string
  side: 'source' | 'target'
  before: ReviewState
  original: LinkEndpoint
  snapped: LinkEndpoint | null
}
"""
)

text = text.replace(
"const NODE_WIDTH = 310\nconst NODE_CENTER_Y = 85",
"const NODE_WIDTH = 310\nconst NODE_HEIGHT = 148\nconst SNAP_IN_PX = 24\nconst SNAP_OUT_PX = 46"
)

block = re.compile(r"  function nodeCenter\(nodeId: string\): Point \| null \{.*?\n  function visibleNode", re.S)
replacement = r'''  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {
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

  function linkGeometry(sourceEndpoint: LinkEndpoint, targetEndpoint: LinkEndpoint) {
    const sourceCenter = endpointCenter(sourceEndpoint)
    const targetCenter = endpointCenter(targetEndpoint)
    if (!sourceCenter || !targetCenter) return null
    const source = visualEndpoint(sourceEndpoint, targetCenter)
    const target = visualEndpoint(targetEndpoint, sourceCenter)
    return source && target ? { source, target } : null
  }

  function visibleNode'''
text, count = block.subn(replacement, text, count=1)
assert count == 1, 'node geometry block not found'

# Direct/nearby endpoint resolution with hysteresis-ready border magnets.
block = re.compile(r"  function resolveEndpointAt\(clientX: number, clientY: number\): LinkEndpoint \| null \{.*?\n  function startEndpointDrag", re.S)
replacement = r'''  function directEndpointAt(clientX: number, clientY: number): LinkEndpoint | null {
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

  function nearestMagnet(world: Point, thresholdPx: number, exclude?: LinkEndpoint) {
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
    return best
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

  function startEndpointDrag'''
text, count = block.subn(replacement, text, count=1)
assert count == 1, 'resolveEndpointAt block not found'

# Replace endpoint drag lifecycle.
block = re.compile(r"  function startEndpointDrag\(event: ReactPointerEvent<SVGCircleElement>, drag: Omit<EndpointDrag, 'pointerId' \| 'before'>\) \{.*?\n  function pointerDownCapture", re.S)
replacement = r'''  function startEndpointDrag(event: ReactPointerEvent<SVGCircleElement>, drag: Omit<EndpointDrag, 'pointerId' | 'before' | 'original' | 'snapped'>) {
    event.stopPropagation()
    if (endpointDragRef.current) return
    let original: LinkEndpoint | null = null
    if (drag.kind === 'canonical' && drag.sourceNodeId) {
      original = effectiveCanonicalLinks(drag.sourceNodeId).find((link) => link.id === drag.linkId)?.target ?? null
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
      const center = endpointCenter(drag.snapped)
      if (center && distance(world, center) <= SNAP_OUT_PX / camera.zoom) {
        setLinkGhost(visualEndpoint(drag.snapped, world) ?? center)
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
      commitReview((current) => {
        const base = current.linkOverrides[drag.sourceNodeId!] ?? canonicalNodesById.get(drag.sourceNodeId!)?.links ?? []
        return { ...current, linkOverrides: { ...current.linkOverrides, [drag.sourceNodeId!]: base.map((link) => link.id === drag.linkId ? { ...link, target: endpoint } : link) } }
      })
    } else {
      commitReview((current) => ({ ...current, reviewLinks: current.reviewLinks.map((link) => link.id === drag.linkId ? { ...link, [drag.side]: endpoint } : link) }))
    }
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* no-op */ }
  }

  function pointerDownCapture'''
text, count = block.subn(replacement, text, count=1)
assert count == 1, 'endpoint drag block not found'

# One-shot tools.
text = text.replace("    setSelection({ kind: 'review-node', id })\n    setViewMode('exploded')\n  }\n\n  function addNodeLinkedToScreen", "    setSelection({ kind: 'review-node', id })\n    setViewMode('exploded')\n    setTool(null)\n  }\n\n  function addNodeLinkedToScreen", 1)
text = text.replace("    setSelection({ kind: 'review-node', id })\n    setViewMode('exploded')\n  }\n\n  function addPointObservation", "    setSelection({ kind: 'review-node', id })\n    setViewMode('exploded')\n    setTool(null)\n  }\n\n  function addPointObservation", 1)
text = text.replace("    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })\n    setViewMode('exploded')\n  }\n\n  function startOrFinishLink", "    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })\n    setViewMode('exploded')\n    setTool(null)\n  }\n\n  function startOrFinishLink", 1)
text = text.replace("    setLinkDraft(null)\n    setSelection({ kind: 'review-link', id })", "    setLinkDraft(null)\n    setTool(null)\n    setSelection({ kind: 'review-link', id })", 1)
text = text.replace("    setGesture(null)\n    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })", "    setGesture(null)\n    setTool(null)\n    if (nodeId) setSelection({ kind: 'review-node', id: nodeId })", 1)

# Reset local review function before export.
marker = "  async function copyForChatGPT() {"
reset = """  function resetLocalReview() {
    if (!window.confirm('Revenir au Plan canonique et supprimer toutes les modifications locales de ce jeu ?')) return
    try { localStorage.removeItem(`mf-production-review:${game.id}`) } catch { /* no-op */ }
    const next = emptyReview()
    assignReview(next)
    undoRef.current = []
    redoRef.current = []
    setSelection(null)
    setTool(null)
    setLinkDraft(null)
    setReferenceEditing(false)
  }

"""
assert marker in text
text = text.replace(marker, reset + marker, 1)

# Topbar reset button.
old = "      <button className={`mfpl-reference-edit ${referenceEditing ? 'is-active' : ''}`} title={referenceEditing ? 'Terminer le calage' : 'Éditer le calage'} disabled={!selectedScreen || reference === 'off'} onClick={() => setReferenceEditing((current) => !current)}>{referenceEditing ? '✓' : '✎'}</button>\n      <button className=\"mfpl-action\" onClick={copyForChatGPT}>"
new = "      <button className={`mfpl-reference-edit ${referenceEditing ? 'is-active' : ''}`} title={referenceEditing ? 'Terminer le calage' : 'Éditer le calage'} disabled={!selectedScreen || reference === 'off'} onClick={() => setReferenceEditing((current) => !current)}>{referenceEditing ? '✓' : '✎'}</button>\n      <button className=\"mfpl-reset-review\" title=\"Revenir au Plan canonique\" onClick={resetLocalReview}>↺</button>\n      <button className=\"mfpl-action\" onClick={copyForChatGPT}>"
assert old in text
text = text.replace(old, new, 1)

# Tool title explains one-shot behavior.
text = text.replace("        }} title={label}><b>{icon}</b><span>{label}</span></button>)}", "        }} title={`${label} · usage unique`}><b>{icon}</b><span>{label}</span></button>)}", 1)

# Node dimensions are deterministic so border anchors are exact.
text = text.replace("style={{ left: position.x, top: position.y, width: NODE_WIDTH }}", "style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}")
text = text.replace("style={{ left: node.x, top: node.y, width: NODE_WIDTH }}", "style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }}")

# Canonical/review link rendering uses boundary-projected geometry.
old = """            {renderedCanonicalNodes.flatMap((node) => {
              const source = nodeCenter(node.id)
              if (!source) return []
              return effectiveCanonicalLinks(node.id).map((link) => {
                const drag = endpointDragRef.current
                let target = endpointPosition(link.target)
                if (drag?.kind === 'canonical' && drag.sourceNodeId === node.id && drag.linkId === link.id && linkGhost) target = linkGhost
                if (!target) return null
"""
new = """            {renderedCanonicalNodes.flatMap((node) => {
              const sourceEndpoint: LinkEndpoint = { kind: 'node', nodeId: node.id }
              return effectiveCanonicalLinks(node.id).map((link) => {
                const drag = endpointDragRef.current
                const geometry = linkGeometry(sourceEndpoint, link.target)
                if (!geometry) return null
                const source = geometry.source
                let target = geometry.target
                if (drag?.kind === 'canonical' && drag.sourceNodeId === node.id && drag.linkId === link.id && linkGhost) target = linkGhost
"""
assert old in text
text = text.replace(old, new, 1)

old = """            {review.reviewLinks.map((link) => {
              const drag = endpointDragRef.current
              let source = endpointPosition(link.source)
              let target = endpointPosition(link.target)
              if (drag?.kind === 'review' && drag.linkId === link.id && linkGhost) {
"""
new = """            {review.reviewLinks.map((link) => {
              const drag = endpointDragRef.current
              const geometry = linkGeometry(link.source, link.target)
              if (!geometry) return null
              let source = geometry.source
              let target = geometry.target
              if (drag?.kind === 'review' && drag.linkId === link.id && linkGhost) {
"""
assert old in text
text = text.replace(old, new, 1)
text = text.replace("              if (!source || !target) return null\n              const selected = reviewLinkHighlighted(link)", "              const selected = reviewLinkHighlighted(link)", 1)

path.write_text(text)

css_path = Path('src/core/ProductionLab.css')
css = css_path.read_text()
css += "\n/* Production Lab: visible border anchors + compact local reset. */\n.mfpl-links{z-index:15}.mfpl-node{z-index:12;overflow:hidden}.mfpl-annotation,.mfpl-annotation-draw{z-index:13}.mfpl-link-target,.mfpl-link-handle{pointer-events:all}.mfpl-reset-review{width:27px;height:27px;border:0;background:#eceff2;padding:0;font-size:15px;line-height:1;cursor:pointer}.mfpl-reset-review:hover{background:#dfe3e7}.mfpl-link-target{fill:#fff;stroke:#50565d;stroke-width:1.2}.mfpl-links g.is-selected .mfpl-link-target{fill:#e25834;stroke:#fff}.mfpl-node p,.mfpl-node ul{max-height:88px;overflow:hidden}\n"
css_path.write_text(css)

doc_path = Path('docs/PRODUCTION_LAB_V1.md')
doc = doc_path.read_text()
doc += """

## Ajustements d’édition locale — 16 septembre 2026

Les outils `Nœud`, `Point`, `Zone`, `Dessin` et `Lien` sont **à usage unique** : après création d’un objet, ou après le second clic d’un lien, le Lab revient automatiquement au mode normal sélection/déplacement.

Les liens sont calculés depuis le centre logique des objets mais leur point visible est projeté sur la **bordure** du nœud, de la zone ou du dessin. Lorsqu’une poignée de lien passe à proximité d’un de ces objets, elle s’y aimante ; le seuil de décrochage est volontairement plus large que le seuil d’accrochage pour éviter les changements accidentels de cible.

Le bouton compact `↺` de la barre supérieure **Réinitialise la revue locale** : il efface annotations, nœuds locaux, liens, déplacements, commentaires, remplacements d’image et calages locaux du jeu courant, puis revient exactement au Plan canonique. Un simple rechargement de page conserve au contraire la revue locale, par conception.

La suppression d’un repère local supprime son bundle sémantique associé et les liens qui le référencent ; le Plan ne doit jamais conserver de destination orpheline après `Delete`, `Backspace`, Undo/Redo ou recréation d’un lien.
"""
doc_path.write_text(doc)
