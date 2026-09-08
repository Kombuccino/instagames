import { useMemo, useState } from 'react'
import './layoutLab.css'

type GuideMode = 'game' | 'cover' | 'combined'

type ScreenPreset = {
  id: string
  label: string
  width: number
  height: number
}

const STAGE = { width: 390, height: 844, label: 'PORTRAIT + COVER' } as const

const SCREENS: ScreenPreset[] = [
  { id: 'phone-small', label: 'Petit téléphone', width: 320, height: 568 },
  { id: 'phone-360-780', label: 'Mobile 19,5:9', width: 360, height: 780 },
  { id: 'phone-360-800', label: 'Mobile 20:9', width: 360, height: 800 },
  { id: 'phone-reference', label: 'Téléphone référence', width: 390, height: 844 },
  { id: 'phone-leading', label: 'Format mondial n°1', width: 414, height: 896 },
  { id: 'phone-large', label: 'Grand téléphone', width: 430, height: 932 },
  { id: 'tablet', label: 'Tablette', width: 768, height: 1024 },
  { id: 'desktop', label: 'PC 16:9', width: 1920, height: 1080 },
]

const ASSET_ROWS = [
  ['Fond complet portrait', '390 × 844', '780 × 1688', 'Opaque, sans état de jeu'],
  ['Cover plein cadre', '390 × 844', '780 × 1688', 'Titre possible, aucun contrôle Core'],
  ['Objet / personnage', 'zone réelle', 'zone × 2', 'Recadrer au contenu, alpha'],
  ['Bouton ou panneau', 'taille affichée', 'taille × 2', 'États séparés, texte dynamique'],
  ['Atlas', 'cellules mesurées', '≤ 2048 par feuille', 'Pas de vide géant, scinder si besoin'],
] as const

function round(value: number) {
  return Math.round(value * 100) / 100
}

function downloadStageGuide(mode: Exclude<GuideMode, 'combined'>) {
  const stage = STAGE
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

  const safe = { x: 0, y: 91, width: 390, height: 662 }
  context.fillStyle = 'rgba(146, 255, 101, .055)'
  context.fillRect(safe.x, safe.y, safe.width, safe.height)
  context.strokeStyle = '#92ff65'
  context.lineWidth = 2
  context.strokeRect(safe.x, safe.y, safe.width, safe.height)
  context.fillStyle = '#92ff65'
  context.font = 'bold 11px monospace'
  context.textAlign = 'center'
  context.fillText('ZONE MINIMALE COMMUNE A54 - 390 x 662', safe.x + safe.width / 2, safe.y + safe.height / 2)

  if (mode === 'game') {
    context.fillStyle = 'rgba(255, 92, 88, .18)'
    context.strokeStyle = '#ff5c58'
    context.fillRect(8, 8, 48, 48)
    context.strokeRect(8, 8, 48, 48)
    context.fillStyle = '#ff5c58'
    context.font = 'bold 8px monospace'
    context.fillText('RETOUR', 32, 34)
  } else {
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
  link.download = `minifugg-gabarit-portrait-${mode}-${canvas.width}x${canvas.height}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function StageArtwork({ mode = 'combined', fullSurface = false }: { mode?: GuideMode, fullSurface?: boolean }) {
  const stage = STAGE
  return (
    <div className="mf-layout-guide__stage" data-full-surface={fullSurface} data-mode={mode} style={fullSurface ? undefined : { aspectRatio: `${stage.width} / ${stage.height}` }}>
      <div className="mf-layout-guide__artwork">
        <div className="mf-layout-guide__grid" aria-hidden="true" />
        <div className="mf-layout-guide__critical">
          <b>ZONE MINIMALE COMMUNE · A54</b>
          <small>390 × 662 · toute cette surface est jouable dans Brave et Chrome.</small>
        </div>
        <span className="mf-layout-guide__axis is-x">{stage.width} unités logiques</span>
        <span className="mf-layout-guide__axis is-y">{stage.height} unités logiques</span>
      </div>
      {(mode === 'game' || mode === 'combined') && <div className="mf-layout-guide__close"><b>CORE</b><small>48 × 48</small></div>}
      {(mode === 'cover' || mode === 'combined') && (
        <>
          <div className="mf-layout-guide__cover-top"><b>COVER</b><small>monnaie Core</small></div>
          <div className="mf-layout-guide__cover-rail"><b>RAIL</b><small>actions</small></div>
          <div className="mf-layout-guide__cover-bottom"><b>CTA CORE</b><small>laisser cette zone calme</small></div>
        </>
      )}
    </div>
  )
}

function StageGuide() {
  const stage = STAGE
  return (
    <figure className="mf-layout-guide" data-orientation="portrait">
      <figcaption>
        <span>{stage.label}</span>
        <span className="mf-layout-guide__actions"><strong>{stage.width} × {stage.height}</strong><a href="?usr=moigod&lab=layout&view=cover">VOIR COVER ↗</a><a href="?usr=moigod&lab=layout&view=game">VOIR JEU ↗</a></span>
      </figcaption>
      <StageArtwork />
      <div className="mf-layout-guide__downloads"><button type="button" onClick={() => downloadStageGuide('cover')}>PNG COVER ×2 ↓</button><button type="button" onClick={() => downloadStageGuide('game')}>PNG JEU ×2 ↓</button></div>
      <p>Le master artistique garde 390 × 844. La zone verte 390 × 662 est la surface minimale commune mesurée sur l’A54 ; les navigateurs et le mode app peuvent révéler davantage en hauteur.</p>
    </figure>
  )
}

function ScreenSimulator() {
  const [screenId, setScreenId] = useState('phone-360-800')
  const stage = STAGE
  const screen = SCREENS.find((item) => item.id === screenId) ?? SCREENS[0]

  const geometry = useMemo(() => {
    const surfaceWidth = screen.width >= 760 ? Math.min(screen.width, 520) : screen.width
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
      <div className="mf-layout-panel__head"><div><small>SIMULATEUR PORTRAIT</small><h2>Ce que voit chaque écran</h2></div></div>
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

const MOBILE_STATS = [
  { size: '414 × 896', share: 13.63 },
  { size: '360 × 800', share: 9.25 },
  { size: '390 × 844', share: 6.81 },
  { size: '393 × 873', share: 5.27 },
  { size: '384 × 832', share: 4.35 },
  { size: '360 × 780', share: 3.17 },
]

const PC_STATS = [
  { size: '1920 × 1080', share: 50.52 },
  { size: '2560 × 1440', share: 21.86 },
  { size: '2560 × 1600', share: 5.71 },
  { size: '3840 × 2160', share: 4.98 },
  { size: '3440 × 1440', share: 3.14 },
  { size: '1920 × 1200', share: 2.76 },
]

function StatBars({ rows, max }: { rows: Array<{ size: string, share: number }>, max: number }) {
  return <div className="mf-layout-stat-bars">{rows.map((row) => <div key={row.size}><span>{row.size}</span><i><b style={{ width: `${row.share / max * 100}%` }} /></i><strong>{row.share.toFixed(2).replace('.', ',')} %</strong></div>)}</div>
}

function ScreenMarketData() {
  return (
    <section className="mf-layout-panel mf-layout-market">
      <div className="mf-layout-panel__head"><div><small>MONDE · AOÛT 2026</small><h2>Les écrans réellement utilisés</h2></div></div>
      <div className="mf-layout-market__columns">
        <article><h3>Web mobile</h3><StatBars rows={MOBILE_STATS} max={13.63} /><p>Les six premières résolutions représentent 42,48 % des pages vues mobiles mesurées. Elles forment surtout deux familles très proches : environ 19,5:9 et 20:9. Le cadre MiniFugg 390 × 844 appartient exactement à la première.</p><a href="https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide" target="_blank" rel="noreferrer">StatCounter Global Stats ↗</a></article>
        <article><h3>Joueurs PC</h3><StatBars rows={PC_STATS} max={50.52} /><p>Le 16:9 reste massif : 1080p, 1440p et 4K dominent. Le 16:10 progresse et l’ultrawide existe, sans justifier d’étirer un jeu portrait sur toute la largeur.</p><a href="https://store.steampowered.com/hwsurvey" target="_blank" rel="noreferrer">Steam Hardware Survey ↗</a></article>
      </div>
      <div className="mf-layout-trends"><h3>Tendance à préparer</h3><p>Les appareils pliables, le multi-fenêtrage et le mode bureau rendent la <b>fenêtre disponible</b> plus importante que le modèle du téléphone. Android 16 impose même davantage de redimensionnement sur les grands écrans. Le Core doit donc s’adapter à la fenêtre, tandis que le jeu garde sa composition portrait.</p><a href="https://developer.android.com/develop/adaptive-apps/guides/support-different-display-sizes" target="_blank" rel="noreferrer">Guide Android officiel ↗</a></div>
    </section>
  )
}

function PortingStrategy() {
  return (
    <section className="mf-layout-panel">
      <div className="mf-layout-panel__head"><div><small>MOBILE → PC</small><h2>Comment les jeux résolvent le problème</h2></div></div>
      <div className="mf-layout-strategies">
        <article><b>1</b><h3>Cadre fixe + FIT</h3><p>Le monde et le HUD gardent leurs coordonnées. On agrandit uniformément et on accepte des marges. C’est la base choisie pour MiniFugg.</p></article>
        <article><b>2</b><h3>Zone sûre + décor extensible</h3><p>L’action reste dans le cadre vert. Sur PC, un overscan, une ambiance ou des panneaux Core occupent les côtés sans modifier le jeu.</p></article>
        <article><b>3</b><h3>Interface adaptative séparée</h3><p>Menus, boutique, commentaires et classements changent de disposition selon la fenêtre. Le canvas de gameplay, lui, reste stable.</p></article>
        <article><b>4</b><h3>Contrôles par plateforme</h3><p>Toucher sur mobile, souris/clavier ou manette sur PC. Les actions sont remappées sans déplacer les cibles ni changer l’équilibrage.</p></article>
      </div>
      <p className="mf-layout-verdict"><b>Choix MiniFugg :</b> production portrait uniquement pour le moment. Le téléphone contient l’expérience complète. Le portage PC ajoute confort, contrôles et décor autour du même jeu ; il ne demande pas une seconde DA.</p>
    </section>
  )
}

function AppModeGuide() {
  const installed = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))

  const requestFullscreen = async () => {
    if (!document.documentElement.requestFullscreen) return
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
  }

  return (
    <section className="mf-layout-panel mf-layout-app-mode">
      <div className="mf-layout-panel__head"><div><small>TEST MOBILE</small><h2>Voir MiniFugg comme une app</h2></div><strong data-ready={installed}>{installed ? 'MODE APP ACTIF' : 'MODE NAVIGATEUR'}</strong></div>
      <div className="mf-layout-app-mode__columns">
        <article><h3>Android · Chrome</h3><ol><li>Ouvrir le site HTTPS dans Chrome.</li><li>Menu ⋮ puis « Ajouter à l’écran d’accueil » ou « Installer l’application ».</li><li>Lancer MiniFugg depuis son icône, pas depuis l’onglet Chrome.</li></ol></article>
        <article><h3>iPhone · Safari</h3><ol><li>Ouvrir le site dans Safari.</li><li>Partager □↑ puis « Sur l’écran d’accueil ».</li><li>Lancer MiniFugg depuis l’icône. iOS utilise le mode app autonome, sans barre d’adresse.</li></ol></article>
      </div>
      <button className="mf-layout-fullscreen-button" type="button" disabled={!document.documentElement.requestFullscreen} onClick={() => void requestFullscreen()}>ESSAYER LE PLEIN ÉCRAN DU NAVIGATEUR</button>
      <p className="mf-layout-note">Ce bouton donne un aperçu rapide sur les navigateurs compatibles. L’installation sur l’écran d’accueil est le test fiable. MiniFugg possède déjà les métadonnées iOS, mais son manifeste PWA et sa famille d’icônes doivent encore être branchés avant de garantir l’installation Android complète.</p>
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

export function LayoutLab({ focus }: { focus?: Exclude<GuideMode, 'combined'> }) {
  if (focus) {
    return <main className="mf-layout-focus" data-mode={focus}><StageArtwork mode={focus} fullSurface /></main>
  }

  return (
    <main className="mf-layout-lab">
      <header className="mf-layout-hero">
        <small>MINIFUGG · CONTRAT VISUEL</small>
        <h1>Un cadre.<br />Une composition.</h1>
        <p>MiniFugg produit désormais ses jeux et ses covers en portrait 390 × 844. Cette page fixe les tailles de création, montre les zones recouvertes par le Core et simule la mise à l’échelle avant toute génération d’assets.</p>
      </header>

      <section className="mf-layout-guides" aria-label="Gabarits canoniques">
        <StageGuide />
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
      <ScreenMarketData />
      <PortingStrategy />
      <AppModeGuide />

      <section className="mf-layout-panel mf-layout-open">
        <div className="mf-layout-panel__head"><div><small>RESTE À NORMALISER</small><h2>Les écarts encore présents</h2></div></div>
        <ol>
          <li><b>Covers statiques et animées :</b> le Core étire aujourd’hui les images statiques en <i>cover</i>, tandis que Phaser conserve le cadre 390 × 844 en <i>FIT</i>. Leur cadrage doit devenir identique.</li>
          <li><b>Anciens masters 9:16 :</b> ils sont plus larges que 390 × 844 et perdent environ 18 % de leur largeur en plein cadre. Il faut les recadrer avec une vraie zone sûre, sans altérer les originaux validés.</li>
          <li><b>Atlases existants :</b> plusieurs feuilles et personnages dépassent largement leur taille affichée. Chaque migration doit mesurer la zone logique et produire un dérivé runtime à ×2 maximum.</li>
          <li><b>Overscan PC :</b> il doit rester décoratif, appartenir à la surface du jeu et ne jamais contenir de cible, HUD ou information indispensable.</li>
          <li><b>Installation mobile :</b> les métadonnées iOS existent. Le manifeste PWA et la famille d’icônes MiniFugg doivent encore être reliés après identification du master d’icône approuvé.</li>
        </ol>
      </section>
    </main>
  )
}
