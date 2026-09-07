import { useMemo, useState } from 'react'
import './layoutLab.css'

type Orientation = 'portrait' | 'landscape'

type ScreenPreset = {
  id: string
  label: string
  width: number
  height: number
}

const STAGES = {
  portrait: { width: 390, height: 844, label: 'PORTRAIT + COVER' },
  landscape: { width: 844, height: 390, label: 'PAYSAGE' },
} as const

const SCREENS: ScreenPreset[] = [
  { id: 'phone-short', label: 'Téléphone court', width: 360, height: 640 },
  { id: 'phone-reference', label: 'Téléphone référence', width: 390, height: 844 },
  { id: 'phone-large', label: 'Grand téléphone', width: 430, height: 932 },
  { id: 'tablet', label: 'Tablette', width: 768, height: 1024 },
  { id: 'desktop', label: 'Ordinateur', width: 1440, height: 900 },
  { id: 'phone-landscape', label: 'Téléphone paysage', width: 844, height: 390 },
]

const ASSET_ROWS = [
  ['Fond complet portrait', '390 × 844', '780 × 1688', 'Opaque, sans état de jeu'],
  ['Fond complet paysage', '844 × 390', '1688 × 780', 'Opaque, sans état de jeu'],
  ['Cover plein cadre', '390 × 844', '780 × 1688', 'Titre possible, aucun contrôle Core'],
  ['Objet / personnage', 'zone réelle', 'zone × 2', 'Recadrer au contenu, alpha'],
  ['Bouton ou panneau', 'taille affichée', 'taille × 2', 'États séparés, texte dynamique'],
  ['Atlas', 'cellules mesurées', '≤ 2048 par feuille', 'Pas de vide géant, scinder si besoin'],
] as const

function round(value: number) {
  return Math.round(value * 100) / 100
}

function downloadStageGuide(orientation: Orientation) {
  const stage = STAGES[orientation]
  const density = 2
  const canvas = document.createElement('canvas')
  canvas.width = stage.width * density
  canvas.height = stage.height * density
  const context = canvas.getContext('2d')
  if (!context) return

  context.scale(density, density)
  context.fillStyle = '#11191e'
  context.fillRect(0, 0, stage.width, stage.height)
  context.strokeStyle = 'rgba(238, 242, 231, .12)'
  context.lineWidth = .5
  const grid = Math.min(stage.width, stage.height) / 10
  for (let x = grid; x < stage.width; x += grid) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, stage.height); context.stroke() }
  for (let y = grid; y < stage.height; y += grid) { context.beginPath(); context.moveTo(0, y); context.lineTo(stage.width, y); context.stroke() }

  const safe = orientation === 'portrait'
    ? { x: 78, y: 68, width: 280, height: 674 }
    : { x: 68, y: 34, width: 708, height: 322 }
  context.fillStyle = 'rgba(146, 255, 101, .055)'
  context.fillRect(safe.x, safe.y, safe.width, safe.height)
  context.strokeStyle = '#92ff65'
  context.lineWidth = 2
  context.strokeRect(safe.x, safe.y, safe.width, safe.height)
  context.fillStyle = '#92ff65'
  context.font = 'bold 11px monospace'
  context.textAlign = 'center'
  context.fillText('ZONE SURE POUR LE CONTENU CRITIQUE', safe.x + safe.width / 2, safe.y + safe.height / 2)

  context.fillStyle = 'rgba(255, 92, 88, .18)'
  context.strokeStyle = '#ff5c58'
  context.fillRect(8, 8, 48, 48)
  context.strokeRect(8, 8, 48, 48)
  context.fillStyle = '#ff5c58'
  context.font = 'bold 8px monospace'
  context.fillText('RETOUR', 32, 34)

  if (orientation === 'portrait') {
    context.setLineDash([4, 3])
    context.strokeStyle = '#ff9f43'
    context.fillStyle = 'rgba(255, 159, 67, .10)'
    context.fillRect(11, 245, 60, 350); context.strokeRect(11, 245, 60, 350)
    context.fillRect(18, 758, 354, 68); context.strokeRect(18, 758, 354, 68)
    context.fillRect(286, 18, 86, 34); context.strokeRect(286, 18, 86, 34)
    context.setLineDash([])
    context.fillStyle = '#ff9f43'
    context.font = 'bold 8px monospace'
    context.fillText('RAIL CORE', 41, 420)
    context.fillText('CTA CORE', 195, 794)
    context.fillText('MONNAIE', 329, 39)
  }

  context.strokeStyle = '#eef2e7'
  context.lineWidth = 2
  context.strokeRect(1, 1, stage.width - 2, stage.height - 2)
  context.fillStyle = '#eef2e7'
  context.font = 'bold 10px monospace'
  context.textAlign = 'left'
  context.fillText(`${stage.width} x ${stage.height} LOGIQUE / PNG ${canvas.width} x ${canvas.height}`, 10, stage.height - 10)

  const link = document.createElement('a')
  link.download = `minifugg-gabarit-${orientation}-${canvas.width}x${canvas.height}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function StageGuide({ orientation }: { orientation: Orientation }) {
  const stage = STAGES[orientation]
  const portrait = orientation === 'portrait'

  return (
    <figure className="mf-layout-guide" data-orientation={orientation}>
      <figcaption>
        <span>{stage.label}</span>
        <span className="mf-layout-guide__actions"><strong>{stage.width} × {stage.height}</strong><button type="button" onClick={() => downloadStageGuide(orientation)}>PNG ×2 ↓</button></span>
      </figcaption>
      <div className="mf-layout-guide__stage" style={{ aspectRatio: `${stage.width} / ${stage.height}` }}>
        <div className="mf-layout-guide__grid" aria-hidden="true" />
        <div className="mf-layout-guide__critical">
          <b>ZONE SÛRE CRITIQUE</b>
          <small>Action, HUD et sujet principal restent lisibles ici.</small>
        </div>
        <div className="mf-layout-guide__close"><b>CORE</b><small>48 × 48</small></div>
        {portrait && (
          <>
            <div className="mf-layout-guide__cover-top"><b>COVER</b><small>monnaie Core</small></div>
            <div className="mf-layout-guide__cover-rail"><b>RAIL</b><small>actions</small></div>
            <div className="mf-layout-guide__cover-bottom"><b>CTA CORE</b><small>laisser cette zone calme</small></div>
          </>
        )}
        <span className="mf-layout-guide__axis is-x">{stage.width} unités logiques</span>
        <span className="mf-layout-guide__axis is-y">{stage.height} unités logiques</span>
      </div>
      <p>{portrait
        ? 'Même gabarit pour le gameplay portrait et la cover. En gameplay, seul le carré Retour du Core recouvre la scène. En cover, le rail, la monnaie et le CTA sont ajoutés par le Core.'
        : 'Gabarit réservé au gameplay paysage. Les covers du fil de découverte restent en portrait 390 × 844.'}</p>
    </figure>
  )
}

function ScreenSimulator() {
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [screenId, setScreenId] = useState('phone-short')
  const stage = STAGES[orientation]
  const screen = SCREENS.find((item) => item.id === screenId) ?? SCREENS[0]

  const geometry = useMemo(() => {
    const shortLandscape = screen.width > screen.height && screen.height <= 650
    const surfaceWidth = !shortLandscape && screen.width >= 760 ? Math.min(screen.width, 520) : screen.width
    const surfaceHeight = screen.height
    const scale = Math.min(surfaceWidth / stage.width, surfaceHeight / stage.height)
    const displayedWidth = stage.width * scale
    const displayedHeight = stage.height * scale
    return {
      surfaceWidth,
      surfaceHeight,
      displayedWidth,
      displayedHeight,
      scale,
      horizontalGap: Math.max(0, surfaceWidth - displayedWidth),
      verticalGap: Math.max(0, surfaceHeight - displayedHeight),
    }
  }, [screen, stage])

  const previewScale = Math.min(360 / screen.width, 430 / screen.height)

  return (
    <section className="mf-layout-panel mf-layout-simulator">
      <div className="mf-layout-panel__head">
        <div><small>SIMULATEUR</small><h2>Ce que voit chaque écran</h2></div>
        <div className="mf-layout-segmented" aria-label="Orientation du jeu">
          {(['portrait', 'landscape'] as Orientation[]).map((value) => (
            <button key={value} type="button" data-active={orientation === value} onClick={() => setOrientation(value)}>{value === 'portrait' ? 'PORTRAIT' : 'PAYSAGE'}</button>
          ))}
        </div>
      </div>
      <div className="mf-layout-screen-tabs">
        {SCREENS.map((item) => <button key={item.id} type="button" data-active={screenId === item.id} onClick={() => setScreenId(item.id)}>{item.label}<small>{item.width} × {item.height}</small></button>)}
      </div>
      <div className="mf-layout-simulator__body">
        <div className="mf-layout-device" style={{ width: screen.width * previewScale, height: screen.height * previewScale }}>
          <div className="mf-layout-device__surface" style={{ width: geometry.surfaceWidth * previewScale, height: geometry.surfaceHeight * previewScale }}>
            <div className="mf-layout-device__stage" style={{ width: geometry.displayedWidth * previewScale, height: geometry.displayedHeight * previewScale }}>
              <b>{stage.width} × {stage.height}</b>
              <small>composition intacte</small>
            </div>
          </div>
        </div>
        <dl className="mf-layout-readout">
          <div><dt>Écran</dt><dd>{screen.width} × {screen.height}</dd></div>
          <div><dt>Surface Core actuelle</dt><dd>{round(geometry.surfaceWidth)} × {round(geometry.surfaceHeight)}</dd></div>
          <div><dt>Stage affiché</dt><dd>{round(geometry.displayedWidth)} × {round(geometry.displayedHeight)}</dd></div>
          <div><dt>Échelle uniforme</dt><dd>× {round(geometry.scale)}</dd></div>
          <div><dt>Espace horizontal</dt><dd>{round(geometry.horizontalGap)} px</dd></div>
          <div><dt>Espace vertical</dt><dd>{round(geometry.verticalGap)} px</dd></div>
        </dl>
      </div>
      <p className="mf-layout-note"><b>Vert :</b> toujours visible et interactif. <b>Hachures :</b> espace Core ou overscan décoratif ; il peut apparaître ou disparaître sans modifier le jeu.</p>
    </section>
  )
}

function AssetCalculator() {
  const [width, setWidth] = useState(96)
  const [height, setHeight] = useState(96)
  const runtimeWidth = Math.max(1, Math.ceil(width * 2))
  const runtimeHeight = Math.max(1, Math.ceil(height * 2))
  const memoryMb = runtimeWidth * runtimeHeight * 4 / 1024 / 1024

  return (
    <section className="mf-layout-panel">
      <div className="mf-layout-panel__head"><div><small>CALCULATEUR</small><h2>Taille maximale d’un asset</h2></div></div>
      <p className="mf-layout-intro">Entre la taille réellement occupée dans la scène. La livraison runtime maximale est calculée à ×2, puisque MiniFugg plafonne aujourd’hui la densité de rendu à 2.</p>
      <div className="mf-layout-calculator">
        <label>Largeur logique<input type="number" min="1" max="844" value={width} onChange={(event) => setWidth(Math.max(1, Number(event.target.value) || 1))} /></label>
        <span>×</span>
        <label>Hauteur logique<input type="number" min="1" max="844" value={height} onChange={(event) => setHeight(Math.max(1, Number(event.target.value) || 1))} /></label>
        <output><small>PNG / WebP runtime max</small><b>{runtimeWidth} × {runtimeHeight}</b><em>≈ {memoryMb < .1 ? memoryMb.toFixed(2) : memoryMb.toFixed(1)} Mo en mémoire GPU</em></output>
      </div>
      <p className="mf-layout-note">Pour un master de travail, ×4 reste possible. Il est archivé séparément ; il ne doit pas être chargé tel quel dans le jeu. En pixel art, produire sur une grille cohérente puis agrandir en nearest-neighbour.</p>
    </section>
  )
}

export function LayoutLab() {
  return (
    <main className="mf-layout-lab">
      <header className="mf-layout-hero">
        <small>MINIFUGG · CONTRAT VISUEL</small>
        <h1>Deux cadres.<br />Une seule composition.</h1>
        <p>Cette page fixe les tailles de création, montre les zones recouvertes par le Core et simule la mise à l’échelle. Une DA doit tenir dans l’un de ces deux cadres avant toute génération d’assets.</p>
      </header>

      <section className="mf-layout-guides" aria-label="Gabarits canoniques">
        <StageGuide orientation="portrait" />
        <StageGuide orientation="landscape" />
      </section>

      <section className="mf-layout-panel">
        <div className="mf-layout-panel__head"><div><small>FICHIERS</small><h2>Dimensions de livraison</h2></div><strong className="mf-layout-rule">runtime = zone logique × 2</strong></div>
        <div className="mf-layout-table-wrap">
          <table>
            <thead><tr><th>Asset</th><th>Zone logique</th><th>Fichier runtime max</th><th>Règle</th></tr></thead>
            <tbody>{ASSET_ROWS.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="mf-layout-principles">
          <p><b>1.</b> Un grand fichier réduit à 8 % reste un grand téléchargement.</p>
          <p><b>2.</b> La transparence vide compte dans la texture : recadrer chaque objet.</p>
          <p><b>3.</b> Score, vies, commandes et états restent séparés du fond.</p>
          <p><b>4.</b> Phaser anime et éclaire les assets ; il ne répare pas une composition incohérente.</p>
        </div>
      </section>

      <AssetCalculator />
      <ScreenSimulator />

      <section className="mf-layout-panel mf-layout-open">
        <div className="mf-layout-panel__head"><div><small>RESTE À NORMALISER</small><h2>Les écarts encore présents</h2></div></div>
        <ol>
          <li><b>Covers statiques et animées :</b> le Core étire aujourd’hui les images statiques en <i>cover</i>, tandis que Phaser conserve le cadre 390 × 844 en <i>FIT</i>. Leur cadrage doit devenir identique.</li>
          <li><b>Anciens masters 9:16 :</b> ils sont plus larges que 390 × 844 et perdent environ 18 % de leur largeur en plein cadre. Il faut les recadrer avec une vraie zone sûre, sans altérer les originaux validés.</li>
          <li><b>Atlases existants :</b> plusieurs feuilles et personnages dépassent largement leur taille affichée. Chaque migration doit mesurer la zone logique et produire un dérivé runtime à ×2 maximum.</li>
          <li><b>Overscan :</b> il doit rester décoratif, appartenir à la surface du jeu et ne jamais contenir de cible, HUD ou information indispensable.</li>
        </ol>
      </section>
    </main>
  )
}
