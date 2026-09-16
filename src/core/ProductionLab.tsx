import { useMemo, useState } from 'react'
import './ProductionLab.css'

type StageStatus = 'ready' | 'active' | 'blocked' | 'later'
type ItemStatus = 'validated' | 'review' | 'todo' | 'blocked'
type PreviewMode = 'context' | 'solo' | 'exploded'

type ProductionItem = {
  id: string
  title: string
  kind: string
  status: ItemStatus
  states: string[]
  owner: string
  note: string
}

const stages: Array<{ id: string; title: string; status: StageStatus; detail: string }> = [
  { id: 'proto', title: 'PROTO', status: 'ready', detail: 'LineFugg classique devient la référence fonctionnelle.' },
  { id: 'requirements', title: 'REQUIREMENTS', status: 'active', detail: 'Extraire entités, états, transitions et moments spéciaux du vrai jeu.' },
  { id: 'da', title: 'DA + STATES', status: 'blocked', detail: 'Explorer la DA sans perdre les exigences du proto.' },
  { id: 'assembly', title: 'ASSEMBLY', status: 'blocked', detail: 'Layers, bounds, pivots, ownership, canvas canoniques.' },
  { id: 'slice', title: 'VERTICAL SLICE', status: 'later', detail: 'Une tranche représentative avant production en série.' },
  { id: 'production', title: 'PRODUCTION', status: 'later', detail: 'Assets et FX seulement après validation de la tranche.' },
  { id: 'integration', title: 'INTEGRATION', status: 'later', detail: 'Assemblage du jeu complet, sans réinterprétation silencieuse.' },
  { id: 'review', title: 'HUMAN REVIEW', status: 'later', detail: 'Comparaison DA ↔ runtime et retours visuels ciblés.' },
  { id: 'release', title: 'RELEASE', status: 'later', detail: 'QA, acceptation humaine et version publiée.' },
]

const initialItems: ProductionItem[] = [
  { id: 'LF-RB-GRID-01', title: 'Grille 7×7', kind: 'Gameplay surface', status: 'review', states: ['idle', 'drag', 'selected', 'committed'], owner: 'Phaser + authored surface', note: 'La géométrie et la lisibilité du proto sont à préserver.' },
  { id: 'LF-RB-CELL-01', title: 'Cellules / nombres', kind: 'State family', status: 'review', states: ['neutral', 'hover', 'line-1', 'line-2', 'line-3', 'operator'], owner: 'TBD', note: 'La future DA doit traiter la cellule et le glyphe comme deux responsabilités explicites.' },
  { id: 'LF-RB-LINE-01', title: 'Ligne joueur', kind: 'Dynamic FX', status: 'review', states: ['drag', 'valid', 'invalid', 'committed'], owner: 'Phaser', note: 'Doit rester lisible sous les chiffres et conserver direction + endpoints.' },
  { id: 'LF-RB-RESULT-01', title: 'Résultats ×3', kind: 'State family', status: 'review', states: ['empty', 'preview', 'committed', 'undo'], owner: 'TBD', note: 'Trois résultats, identité de ligne stable, retour immédiat après Undo.' },
  { id: 'LF-RB-CTRL-01', title: 'Undo / Validate', kind: 'Controls', status: 'review', states: ['disabled', 'idle', 'pressed', 'enabled'], owner: 'TBD', note: 'Les états interchangeables devront partager canvas, pivot et destination.' },
  { id: 'LF-RB-FLOW-01', title: 'Feedback / énergie', kind: 'FX family', status: 'todo', states: ['selection', 'commit', 'arrival', 'success', 'error'], owner: 'TBD', note: 'À concevoir avec la DA, pas à improviser pendant l’intégration.' },
]

const statusLabel: Record<ItemStatus, string> = { validated: 'VALIDÉ', review: 'À ANALYSER', todo: 'À FAIRE', blocked: 'BLOQUÉ' }

export function ProductionLab() {
  const [selectedStage, setSelectedStage] = useState('requirements')
  const [selectedId, setSelectedId] = useState(initialItems[0].id)
  const [items, setItems] = useState(initialItems)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('context')
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId])
  const validatedCount = items.filter((item) => item.status === 'validated').length
  const reviewCount = items.filter((item) => item.status === 'review').length
  const stateCount = items.reduce((sum, item) => sum + item.states.length, 0)

  function setItemStatus(status: ItemStatus) {
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status } : item))
  }

  async function copyHandoff() {
    const changed = items.filter((item) => item.status !== 'todo')
    const text = [
      'MINIFUGG PRODUCTION HANDOFF',
      'Game: LineFugg — Rebirth',
      `Stage: ${selectedStage}`,
      '',
      ...changed.flatMap((item) => [
        `[${item.id}] ${item.title}`,
        `status: ${statusLabel[item.status]}`,
        `states: ${item.states.join(', ')}`,
        `owner: ${item.owner}`,
        `note: ${item.note}`,
        '',
      ]),
      'NEXT: relire ces décisions dans le Production Lab avant toute production dépendante.',
    ].join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <main className="production-lab">
      <header className="production-lab__header">
        <div><span className="production-lab__eyebrow">MINIFUGG / PRODUCTION LAB</span><h1>LineFugg <small>Rebirth</small></h1></div>
        <button onClick={copyHandoff}>Copier pour ChatGPT</button>
      </header>

      <section className="production-lab__summary" aria-label="Production summary">
        <div><b>{items.length}</b><span>objets à résoudre</span></div>
        <div><b>{stateCount}</b><span>états déjà recensés</span></div>
        <div><b>{reviewCount}</b><span>à analyser</span></div>
        <div><b>{validatedCount}</b><span>validés</span></div>
        <div className="is-live"><b>LIVE</b><span>proto visible dans le Workbench</span></div>
      </section>

      <section className="production-lab__graph" aria-label="Production graph">
        {stages.map((stage, index) => (
          <div className="production-lab__graph-node-wrap" key={stage.id}>
            <button className={`production-lab__graph-node is-${stage.status} ${selectedStage === stage.id ? 'is-selected' : ''}`} onClick={() => setSelectedStage(stage.id)}>
              <b>{stage.title}</b><span>{stage.detail}</span>
            </button>
            {index < stages.length - 1 && <span className="production-lab__arrow">→</span>}
          </div>
        ))}
      </section>

      <div className="production-lab__workspace">
        <aside className="production-lab__inventory">
          <h2>Inventaire du proto</h2>
          <p>Ce que la future DA devra réellement résoudre.</p>
          {items.map((item) => (
            <button key={item.id} className={selected.id === item.id ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)}>
              <span className={`production-lab__dot is-${item.status}`} />
              <span><b>{item.title}</b><small>{item.id} · {statusLabel[item.status]}</small></span>
            </button>
          ))}
        </aside>

        <section className="production-lab__detail">
          <div className="production-lab__detail-head"><div><span>{selected.kind}</span><h2>{selected.title}</h2><code>{selected.id}</code></div><strong className={`is-${selected.status}`}>{statusLabel[selected.status]}</strong></div>
          <div className="production-lab__preview">
            <div className="production-lab__preview-tools">
              <button className={previewMode === 'context' ? 'is-selected' : ''} onClick={() => setPreviewMode('context')}>IN CONTEXT</button>
              <button className={previewMode === 'solo' ? 'is-selected' : ''} onClick={() => setPreviewMode('solo')}>SOLO</button>
              <button className={previewMode === 'exploded' ? 'is-selected' : ''} onClick={() => setPreviewMode('exploded')}>EXPLODED</button>
              <button disabled>BOUNDS</button><button disabled>PIVOT</button>
            </div>
            {previewMode === 'context' ? (
              <div className="production-lab__runtime-shell">
                <div className="production-lab__runtime-label"><b>PROTO LIVE</b><span>runtime réel actuel · interactions possibles</span></div>
                <iframe className="production-lab__runtime-frame" src="/?game=linefugg" title="LineFugg live runtime" />
              </div>
            ) : (
              <div className="production-lab__mock-stage"><div className="production-lab__mock-object">{selected.title}<small>{previewMode === 'solo' ? 'Isolation du composant à brancher' : 'Vue éclatée à brancher'}</small></div></div>
            )}
          </div>
          <div className="production-lab__states"><h3>États attendus</h3>{selected.states.map((state) => <span key={state}>{state}</span>)}</div>
          <dl><div><dt>Owner</dt><dd>{selected.owner}</dd></div><div><dt>Note de production</dt><dd>{selected.note}</dd></div></dl>
          <div className="production-lab__actions"><button onClick={() => setItemStatus('validated')}>Valider</button><button onClick={() => setItemStatus('review')}>À revoir</button><button onClick={() => setItemStatus('blocked')}>Bloquer</button></div>
        </section>

        <aside className="production-lab__recipe">
          <h2>Recette / sources</h2>
          <p>Visible pour diagnostiquer, pas pour piloter au quotidien.</p>
          <code>ACTIONS.md</code><code>GAME_CREATION_PIPELINE.md</code><code>DA_CORE.md</code><code>DA_GAME.md</code><code>MINIFUGG_ZONES.md</code><code>GAME_ART_PRODUCTION_PIPELINE.md</code><code>ASSET_PIPELINE.md</code>
          <hr />
          <b>Principe V1</b><p>Le Lab est le cockpit humain. Le repo reste la source de vérité technique.</p>
        </aside>
      </div>
    </main>
  )
}
