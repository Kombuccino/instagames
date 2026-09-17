from pathlib import Path
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source_webp = ROOT / 'public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp'
out_dir = ROOT / 'public/assets/generated/linefugg/rebirth/sources'
out_dir.mkdir(parents=True, exist_ok=True)

img = Image.open(source_webp).convert('RGBA')
# The Lab derivative currently stored in Git is 260×567 despite its historical filename.
# Reproject it once to the canonical 390×850 DA canvas before making production cuts.
if img.size != (390, 850):
    img = img.resize((390, 850), Image.Resampling.LANCZOS)

outputs = {
    'linefugg-rebirth-editorial-paper-master-390x850.png': (0, 0, 390, 850),
    'grid-surface-source-354x374.png': (18, 92, 372, 466),
    'line-language-source-354x374.png': (18, 92, 372, 466),
    'ledger-source-350x139.png': (20, 492, 370, 631),
    'total-source-179x72.png': (188, 633, 367, 705),
    'controls-source-316x131.png': (38, 704, 354, 835),
    'cell-study-source-98x98.png': (20, 96, 118, 194),
    'paper-texture-source-120x80.png': (250, 5, 370, 85),
}
for name, box in outputs.items():
    img.crop(box).save(out_dir / name, format='PNG', optimize=False)

lab_path = ROOT / 'src/core/ProductionLab.tsx'
text = lab_path.read_text()

def replace_once(before, after):
    global text
    count = text.count(before)
    if count != 1:
        raise SystemExit(f'Expected 1 occurrence, found {count}: {before[:80]}')
    text = text.replace(before, after, 1)

replace_once(
    "  image?: string\n  imagePosition?: string\n  marker?: PlanMarker",
    "  image?: string\n  imagePosition?: string\n  sourceSize?: { width: number; height: number }\n  marker?: PlanMarker",
)
replace_once(
    "const LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'",
    "const LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'\nconst LINEFUGG_REBIRTH_SOURCE_ROOT = '/assets/generated/linefugg/rebirth/sources'",
)
text = text.replace(
    "image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850-r2.webp`, preview: 'proto'",
    "image: `${LINEFUGG_REBIRTH_SOURCE_ROOT}/linefugg-rebirth-editorial-paper-master-390x850.png`, preview: 'proto'",
    1,
)

asset_map = {
    'D-style': ('grid-surface-source-354x374.png', 354, 374),
    'D-lines': ('line-language-source-354x374.png', 354, 374),
    'D-ledger': ('ledger-source-350x139.png', 350, 139),
    'D-total': ('total-source-179x72.png', 179, 72),
    'D-controls': ('controls-source-316x131.png', 316, 131),
}
lines = text.splitlines()
for i, line in enumerate(lines):
    for node_id, (filename, width, height) in asset_map.items():
        if f"id: '{node_id}'" not in line:
            continue
        line = re.sub(
            r"image: `\$\{LINEFUGG_REBIRTH_DA_ROOT\}/[^`]+`, imagePosition: '[^']+',",
            f"image: `${{LINEFUGG_REBIRTH_SOURCE_ROOT}}/{filename}`, sourceSize: {{ width: {width}, height: {height} }},",
            line,
            count=1,
        )
        lines[i] = line
text = '\n'.join(lines) + '\n'

# Attach real source cuts to blocked/study nodes where the approved master contains usable evidence.
text = re.sub(
    r"(\{ id: 'D-cell-states'[^\n]*?source: 'manquant dans la DA validée',)( marker:)",
    r"\1 image: `${LINEFUGG_REBIRTH_SOURCE_ROOT}/cell-study-source-98x98.png`, sourceSize: { width: 98, height: 98 },\2",
    text,
    count=1,
)
text = re.sub(
    r"(\{ id: 'D-reroll-motion'[^\n]*?source: 'à définir depuis la DA validée',)( marker:)",
    r"\1 image: `${LINEFUGG_REBIRTH_SOURCE_ROOT}/line-language-source-354x374.png`, sourceSize: { width: 354, height: 374 },\2",
    text,
    count=1,
)

# Add one explicit clean material source node from a static paper area.
paper_node = "    { id: 'D-paper', ownerScreenId: 'D1', title: 'Source · papier / trame', kind: 'image', tags: ['IMAGE'], status: 'done', body: 'Échantillon raster réel issu d’une zone statique de la DA validée. C’est une source de matière, pas une vignette.', facts: ['120×80 px natifs', 'Pas de donnée gameplay cuite'], source: 'découpe source du master DA validé', image: `${LINEFUGG_REBIRTH_SOURCE_ROOT}/paper-texture-source-120x80.png`, sourceSize: { width: 120, height: 80 }, x: 3530, y: 360, links: [nodeLink('D-paper-style', 'D-style', 'matière')] },\n"
anchor = "    { id: 'D-style', ownerScreenId: 'D1'"
idx = text.find(anchor)
if idx < 0:
    raise SystemExit('D-style anchor not found')
text = text[:idx] + paper_node + text[idx:]

replace_once(
    "  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {\n    const position = nodePosition(nodeId)\n    return position ? { x: position.x, y: position.y, w: NODE_WIDTH, h: NODE_HEIGHT } : null\n  }",
    "  function canonicalNodeVisualSize(node: PlanNode) {\n    if (!node.sourceSize) return { w: NODE_WIDTH, h: NODE_HEIGHT }\n    return { w: Math.max(NODE_WIDTH, node.sourceSize.width + 24), h: Math.max(NODE_HEIGHT, node.sourceSize.height + 178) }\n  }\n\n  function nodeBounds(nodeId: string): { x: number; y: number; w: number; h: number } | null {\n    const position = nodePosition(nodeId)\n    if (!position) return null\n    const canonical = canonicalNodesById.get(nodeId)\n    const size = canonical ? canonicalNodeVisualSize(canonical) : { w: NODE_WIDTH, h: NODE_HEIGHT }\n    return { x: position.x, y: position.y, w: size.w, h: size.h }\n  }",
)
replace_once(
    "              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}",
    "              style={{ left: position.x, top: position.y, ...canonicalNodeVisualSize(node) }}",
)
replace_once(
    "              {node.image && <img className=\"mfpl-node-thumb\" src={node.image} alt=\"\" style={{ objectPosition: node.imagePosition ?? 'center' }} />}",
    "              {node.image && <figure className=\"mfpl-node-source\"><img src={node.image} alt=\"\" width={node.sourceSize?.width} height={node.sourceSize?.height} /><figcaption>{node.sourceSize ? `${node.sourceSize.width} × ${node.sourceSize.height} px · source réelle` : 'source réelle'}</figcaption></figure>}",
)
lab_path.write_text(text)

css_path = ROOT / 'src/core/ProductionLab.css'
css = css_path.read_text()
css += "\n\n/* DA production sources: native-size assets inside content-sized vector nodes. */\n.mfpl-node{height:auto;min-height:148px;overflow:visible}.mfpl-node p,.mfpl-node ul{max-height:none;overflow:visible}.mfpl-node-source{margin:8px 0 6px;padding:0;display:block;width:max-content;max-width:none}.mfpl-node-source img{display:block;width:auto;height:auto;max-width:none;object-fit:none;border:1px solid rgba(23,25,29,.2);background:#cfd3d7}.mfpl-node-source figcaption{margin-top:4px;font-size:8px;color:#6d747d}.mfpl-node-thumb{display:none}\n"
css_path.write_text(css)

manifest_path = ROOT / 'src/games/linefugg/ASSET_MANIFEST.md'
manifest = manifest_path.read_text()
block = """
### Rebirth — sources de découpe visibles dans le Production Lab

Le master DA validé est désormais matérialisé sur le canevas `390×850` sous `public/assets/generated/linefugg/rebirth/sources/linefugg-rebirth-editorial-paper-master-390x850.png`. Les nœuds DA du Lab montrent les **fichiers sources à leur taille native**, pas des miniatures recadrées.

Sources découpées depuis ce master : `paper-texture-source-120x80.png`, `grid-surface-source-354x374.png`, `line-language-source-354x374.png`, `ledger-source-350x139.png`, `total-source-179x72.png`, `controls-source-316x131.png`, `cell-study-source-98x98.png`.

Ces découpes servent à la production et à la revue. Elles ne sont pas toutes runtime-ready : grille, tracés, registre, total et étude cellule contiennent encore des données dynamiques de la maquette et restent donc **SOURCE / REFERENCE CUT** jusqu’à nettoyage ou reconstruction. L’échantillon papier est statique ; les contrôles sont une base visuelle mais leurs états séparés restent à produire.
"""
if '### Rebirth — sources de découpe visibles dans le Production Lab' not in manifest:
    insert_at = manifest.find('\nÉtat canonique classique')
    manifest = manifest[:insert_at] + '\n' + block.strip() + '\n' + manifest[insert_at:]
manifest_path.write_text(manifest)

lab_doc = ROOT / 'docs/PRODUCTION_LAB_V1.md'
doc = lab_doc.read_text()
addition = """
### Sources DA dans les nœuds

Après validation d’une DA, les nœuds `IMAGE` ne doivent pas afficher un simple aperçu recadré du master. Ils pointent vers de **vrais fichiers de production ou de découpe**, affichés à leur taille native ; leur cadre s’agrandit avec leur contenu dans l’espace vectoriel. Le master complet reste un écran/référence séparé. Une découpe contaminée par des valeurs ou états dynamiques est explicitement marquée comme source de travail, jamais comme asset runtime final.
"""
if '### Sources DA dans les nœuds' not in doc:
    doc += '\n' + addition.strip() + '\n'
lab_doc.write_text(doc)

status_path = ROOT / 'src/games/linefugg/GAME_STATUS.md'
status = status_path.read_text()
needle = '- **DA** : direction validée — registre éditorial imprimé'
if needle in status and 'sources de découpe natives' not in status:
    status = status.replace(needle, '- **DA** : direction validée — registre éditorial imprimé ; le Lab expose maintenant les sources de découpe natives et leurs dimensions réelles')
status_path.write_text(status)

print('DA source extraction + adaptive Lab nodes applied.')
