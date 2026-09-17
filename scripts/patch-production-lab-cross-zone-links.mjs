import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}`)
  writeFileSync(path, text.replace(before, after))
}

const lab = 'src/core/ProductionLab.tsx'

replaceExact(
  lab,
  "  const renderedCanonicalNodes = project.nodes.filter((node) => visibleNode(node.ownerScreenId))\n  const renderedReviewNodes = review.reviewNodes.filter((node) => visibleNode(node.ownerScreenId))",
  "  const renderedCanonicalNodes = project.nodes.filter((node) => visibleNode(node.ownerScreenId))\n  const renderedReviewNodes = review.reviewNodes.filter((node) => visibleNode(node.ownerScreenId))\n\n  function nodeState(nodeId: string): StateId | null {\n    const node = project.nodes.find((candidate) => candidate.id === nodeId) ?? review.reviewNodes.find((candidate) => candidate.id === nodeId)\n    if (!node?.ownerScreenId) return null\n    return project.screens.find((screen) => screen.id === node.ownerScreenId)?.state ?? null\n  }\n\n  function isCrossZoneNodeLink(source: LinkEndpoint, target: LinkEndpoint) {\n    if (source.kind !== 'node' || target.kind !== 'node') return false\n    const sourceState = nodeState(source.nodeId)\n    const targetState = nodeState(target.nodeId)\n    return Boolean(sourceState && targetState && sourceState !== targetState)\n  }"
)

replaceExact(
  lab,
  "          {viewMode === 'exploded' && <svg className=\"mfpl-links\" width={WORLD_WIDTH} height={WORLD_HEIGHT}>\n            {renderedCanonicalNodes.flatMap((node) => {",
  "          {viewMode === 'exploded' && <svg className=\"mfpl-links mfpl-links-underlay\" width={WORLD_WIDTH} height={WORLD_HEIGHT}>\n            {renderedCanonicalNodes.flatMap((node) => effectiveCanonicalLinks(node.id).map((link) => {\n              const sourceEndpoint: LinkEndpoint = review.canonicalLinkSourceOverrides[`${node.id}:${link.id}`] ?? { kind: 'node', nodeId: node.id }\n              if (!isCrossZoneNodeLink(sourceEndpoint, link.target)) return null\n              const geometry = linkGeometry(sourceEndpoint, link.target)\n              return geometry ? <line key={`under:${node.id}:${link.id}`} className=\"mfpl-link mfpl-link-cross-zone\" x1={geometry.source.x} y1={geometry.source.y} x2={geometry.target.x} y2={geometry.target.y} /> : null\n            }))}\n            {review.reviewLinks.map((link) => {\n              if (!isCrossZoneNodeLink(link.source, link.target)) return null\n              const geometry = linkGeometry(link.source, link.target)\n              return geometry ? <line key={`under:${link.id}`} className=\"mfpl-link mfpl-link-cross-zone\" x1={geometry.source.x} y1={geometry.source.y} x2={geometry.target.x} y2={geometry.target.y} /> : null\n            })}\n          </svg>}\n\n          {viewMode === 'exploded' && <svg className=\"mfpl-links mfpl-links-foreground\" width={WORLD_WIDTH} height={WORLD_HEIGHT}>\n            {renderedCanonicalNodes.flatMap((node) => {"
)

replaceExact(
  lab,
  "                return <g key={`${node.id}:${link.id}`} className={`${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''}`}>",
  "                const crossZone = isCrossZoneNodeLink(sourceEndpoint, link.target)\n                return <g key={`${node.id}:${link.id}`} className={`${selected ? 'is-selected' : ''} ${deleteRequested ? 'is-delete-requested' : ''} ${crossZone ? 'is-cross-zone' : ''}`}>"
)

replaceExact(
  lab,
  "              const selected = reviewLinkHighlighted(link)\n              return <g key={link.id} className={`${selected ? 'is-selected' : ''} ${link.kind === 'attachment' ? 'is-attachment' : ''}`}>",
  "              const selected = reviewLinkHighlighted(link)\n              const crossZone = isCrossZoneNodeLink(link.source, link.target)\n              return <g key={link.id} className={`${selected ? 'is-selected' : ''} ${link.kind === 'attachment' ? 'is-attachment' : ''} ${crossZone ? 'is-cross-zone' : ''}`}>"
)

const css = 'src/core/ProductionLab.css'
let cssText = readFileSync(css, 'utf8')
const marker = '/* Cross-zone semantic links: lighter dashed underlay below screens and nodes. */'
if (!cssText.includes(marker)) {
  cssText = `${cssText.trimEnd()}\n\n${marker}\n.mfpl-links-underlay{z-index:1;pointer-events:none}.mfpl-links-underlay .mfpl-link-cross-zone{stroke:#8c949c;stroke-width:1;stroke-dasharray:8 8;opacity:.42}.mfpl-links-foreground{z-index:15}.mfpl-links-foreground g.is-cross-zone>.mfpl-link,.mfpl-links-foreground g.is-cross-zone>.mfpl-link-target{stroke:transparent;fill:transparent}.mfpl-links-foreground g.is-cross-zone.is-selected>.mfpl-link-target{stroke:#e25834;fill:#fff}\n`
  writeFileSync(css, cssText)
}

console.log('Production Lab cross-zone link styling applied.')
