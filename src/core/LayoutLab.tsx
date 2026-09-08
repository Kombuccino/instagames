import { useMemo, useState } from 'react'
import './layoutLab.css'

export type LayoutTemplate = 'home' | 'cover' | 'cover-beta' | 'cover-caca' | 'game' | 'game-over' | 'ladder'
type GuideMode = LayoutTemplate | 'combined'

const TEMPLATE_LINKS: Array<{ id: LayoutTemplate, label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'cover', label: 'Cover' },
  { id: 'cover-beta', label: 'CoverBeta' },
  { id: 'cover-caca', label: 'CoverCaca' },
  { id: 'game', label: 'Game' },
  { id: 'game-over', label: 'GameOver' },
  { id: 'ladder', label: 'Ladder' },
]

type ScreenPreset = {
  id: string
  label: string
  width: number
  height: number
}

const STAGE = { width: 390, height: 844, label: 'PORTRAIT + COVER' } as const

const SCREENS: ScreenPreset[] = [
  { id: 'a54-brave', label: 'A54 · Brave web', width: 360, height: 611 },
  { id: 'a54-chrome', label: 'A54 · Chrome web', width: 360, height: 656 },
  { id: 'phone-minimum', label: 'CENTRE seule', width: 390, height: 662 },
  { id: 'phone-reference', label: 'MASTER entier', width: 390, height: 844 },
  { id: 'phone-extra', label: 'Mobile très haut', width: 360, height: 820 },
  { id: 'tablet', label: 'Tablette', width: 768, height: 1024 },
  { id: 'desktop', label: 'PC 16:9', width: 1920, height: 1080 },
]

const ASSET_ROWS = [
  ['Fond complet portrait', '390 × 844', '780 × 1688', 'WebP lossless ; PNG de repli/source'],
  ['Cover statique', '390 × 844', '780 × 1688', 'AVIF ou WebP validé ; aucun contrôle Core'],
  ['Objet / personnage', 'zone réelle', 'zone × 2', 'WebP lossless avec alpha, recadré'],
  ['Bouton ou panneau', 'taille affichée', 'taille × 2', 'États séparés ; WebP/PNG avec alpha'],
  ['Atlas / masque / map', 'cellules mesurées', '≤ 2048 par feuille', 'PNG/WebP lossless ; scinder si besoin'],
] as const

function round(value: number) {
  return Math.round(value * 100) / 100
}

function downloadStageGuide(mode: 'game' | 'cover') {
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
  context.fillText('CENTRE - 390 x 662', safe.x + safe.width / 2, safe.y + safe.height / 2)

  context.fillStyle = '#eef2e7'
  context.font = 'bold 9px monospace'
  context.fillText('HAUT', stage.width / 2, 48)
  context.fillText('BAS', stage.width / 2, 802)

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
    context.fillRect(11, 111, 60, 350); context.strokeRect(11, 111, 60, 350)
    context.fillRect(18, 758, 354, 68); context.strokeRect(18, 758, 354, 68)
    context.fillRect(286, 18, 86, 34); context.strokeRect(286, 18, 86, 34)
    context.setLineDash([])
    context.fillStyle = '#ff9f43'
    context.font = 'bold 8px monospace'
    context.fillText('RAIL', 41, 286)
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

function Zone({ className, name, detail }: { className: string, name: string, detail?: string }) {
  return <div className={className}><b>{name}</b>{detail && <small>{detail}</small>}</div>
}

function TemplateZones({ mode }: { mode: GuideMode }) {
  const cover = mode === 'cover' || mode === 'cover-beta' || mode === 'cover-caca' || mode === 'combined'
  return (
    <div className="mf-layout-guide__core-frame">
      {(mode === 'game' || mode === 'game-over' || mode === 'ladder' || mode === 'combined') && <Zone className="mf-layout-guide__close" name="RETOUR" detail="Core" />}
      {cover && (
        <>
          <Zone className="mf-layout-guide__cover-top" name="MONNAIE" detail="Core" />
          <Zone className="mf-layout-guide__cover-rail" name="RAIL" detail="Core" />
          <Zone className="mf-layout-guide__cover-bottom" name="JOUER" detail="Core" />
        </>
      )}
      {mode === 'home' && (
        <>
          <Zone className="mf-layout-guide__home-logo" name="MARQUE" />
          <Zone className="mf-layout-guide__home-scene" name="SCÈNE" detail="accueil animé" />
          <Zone className="mf-layout-guide__home-enter" name="ENTRER" detail="geste / CTA" />
        </>
      )}
      {(mode === 'cover-beta' || mode === 'cover-caca') && (
        <Zone className="mf-layout-guide__cover-message" name={mode === 'cover-beta' ? 'BÊTA' : 'CACA'} detail="état de la cover" />
      )}
      {mode === 'game-over' && (
        <div className="mf-layout-guide__result">
          <Zone className="mf-layout-guide__result-title" name="RÉSULTAT" />
          <Zone className="mf-layout-guide__result-score" name="SCORE" />
          <Zone className="mf-layout-guide__result-action" name="REJOUER" />
          <Zone className="mf-layout-guide__result-link" name="CLASSEMENT" />
        </div>
      )}
      {mode === 'ladder' && (
        <div className="mf-layout-guide__ladder">
          <Zone className="mf-layout-guide__ladder-title" name="CLASSEMENT" />
          <Zone className="mf-layout-guide__ladder-period" name="PÉRIODE" />
          <Zone className="mf-layout-guide__ladder-list" name="SCORES" detail="liste défilante" />
        </div>
      )}
    </div>
  )
}

function StageArtwork({ mode = 'combined', fullSurface = false }: { mode?: GuideMode, fullSurface?: boolean }) {
  const stage = STAGE
  return (
    <div className="mf-layout-guide__stage" data-full-surface={fullSurface} data-mode={mode} style={fullSurface ? undefined : { aspectRatio: `${stage.width} / ${stage.height}` }}>
      <div className="mf-layout-guide__extra-frame" aria-hidden="true">
        <Zone className="mf-layout-guide__extra is-top" name="EXTRA HAUT" />
        <Zone className="mf-layout-guide__extra is-bottom" name="EXTRA BAS" />
      </div>
      <div className="mf-layout-guide__artwork">
        <div className="mf-layout-guide__grid" aria-hidden="true" />
        <span className="mf-layout-guide__master">MASTER · 390 × 844</span>
        <Zone className="mf-layout-guide__band is-top" name="HAUT" detail="recadrable" />
        <div className="mf-layout-guide__critical">
          <b>CENTRE</b>
          <small>390 × 662 · zone minimale commune.</small>
        </div>
        <Zone className="mf-layout-guide__band is-bottom" name="BAS" detail="recadrable" />
        <span className="mf-layout-guide__axis is-x">{stage.width} unités logiques</span>
        <span className="mf-layout-guide__axis is-y">{stage.height} unités logiques</span>
      </div>
      <TemplateZones mode={mode} />
    </div>
  )
}

function StageGuide() {
  const stage = STAGE
  return (
    <figure className="mf-layout-guide" data-orientation="portrait">
      <figcaption>
        <span>{stage.label}</span>
        <span className="mf-layout-guide__actions"><strong>{stage.width} × {stage.height}</strong><a href="?usr=moigod&lab=layout&view=cover">VOIR COVER ↗</a><a href="?usr=moigod&lab=layout&view=game">VOIR GAME ↗</a></span>
      </figcaption>
      <StageArtwork />
      <div className="mf-layout-guide__downloads"><button type="button" onClick={() => downloadStageGuide('cover')}>PNG COVER ×2 ↓</button><button type="button" onClick={() => downloadStageGuide('game')}>PNG JEU ×2 ↓</button></div>
      <p>MASTER contient HAUT, CENTRE et BAS. Sur mobile court, HAUT/BAS sont recadrés. Les zones cyan EXTRA n’apparaissent qu’au-delà du MASTER sur un viewport plus haut.</p>
    </figure>
  )
}

function TemplateMenu({ active }: { active: LayoutTemplate }) {
  return (
    <nav className="mf-layout-template-menu" aria-label="Zones MiniFugg">
      <b>ZONES MINIFUGG</b>
      {TEMPLATE_LINKS.map((item) => <a key={item.id} data-active={active === item.id} href={`?usr=moigod&lab=layout&view=${item.id}`}>{item.label}</a>)}
      <a href="?usr=moigod&lab=layout">Guide complet</a>
    </nav>
  )
}

function ScreenSimulator() {
  const [screenId, setScreenId] = useState('a54-chrome')
  const stage = STAGE
  const screen = SCREENS.find((item) => item.id === screenId) ?? SCREENS[0]

  const geometry = useMemo(() => {
    const desktop = screen.width >= 760
    const surfaceHeight = screen.height
    const scale = desktop ? surfaceHeight / 662 : screen.width / stage.width
    const displayedWidth = stage.width * scale
    const displayedHeight = stage.height * scale
    const surfaceWidth = desktop ? displayedWidth : screen.width
    return {
      surfaceWidth,
      surfaceHeight,
      displayedWidth,
      displayedHeight,
      scale,
      lateralCore: Math.max(0, screen.width - displayedWidth),
      verticalDelta: surfaceHeight - displayedHeight,
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
              <small>{geometry.verticalDelta < 0 ? 'recadrage vertical' : geometry.verticalDelta > 0 ? 'MASTER + EXTRA' : 'MASTER entier'}</small>
            </div>
          </div>
        </div>
        <dl className="mf-layout-readout">
          <div><dt>Viewport utile</dt><dd>{screen.width} × {screen.height}</dd></div>
          <div><dt>Surface Core actuelle</dt><dd>{round(geometry.surfaceWidth)} × {round(geometry.surfaceHeight)}</dd></div>
          <div><dt>Stage affiché</dt><dd>{round(geometry.displayedWidth)} × {round(geometry.displayedHeight)}</dd></div>
          <div><dt>Échelle uniforme</dt><dd>× {round(geometry.scale)}</dd></div>
          <div><dt>Espace Core latéral</dt><dd>{round(geometry.lateralCore)} px</dd></div>
          <div><dt>{geometry.verticalDelta < 0 ? 'Recadrage vertical' : 'EXTRA vertical'}</dt><dd>{round(Math.abs(geometry.verticalDelta))} px</dd></div>
        </dl>
      </div>
      <p className="mf-layout-note"><b>Mobile :</b> la largeur pilote et la hauteur utile dépend aussi du navigateur ou du mode app. <b>PC :</b> CENTRE remplit la hauteur ; HAUT/BAS sont hors écran. Les côtés appartiennent au Core.</p>
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
        <article><b>1</b><h3>Échelle uniforme</h3><p>Le monde et le HUD gardent leurs coordonnées. La largeur pilote sur mobile ; la hauteur de CENTRE pilote sur PC.</p></article>
        <article><b>2</b><h3>Recadrage vertical</h3><p>L’action reste dans CENTRE. HAUT et BAS sont les seules parties du MASTER que le mobile peut couper.</p></article>
        <article><b>3</b><h3>Interface adaptative séparée</h3><p>Menus, boutique, commentaires et classements changent de disposition selon la fenêtre. Le canvas de gameplay, lui, reste stable.</p></article>
        <article><b>4</b><h3>Contrôles par plateforme</h3><p>Toucher sur mobile, souris/clavier ou manette sur PC. Les actions sont remappées sans déplacer les cibles ni changer l’équilibrage.</p></article>
      </div>
      <p className="mf-layout-verdict"><b>Choix MiniFugg :</b> production portrait uniquement pour le moment. Le téléphone contient l’expérience complète. Sur PC, CENTRE remplit la hauteur disponible ; les côtés restent au Core et ne demandent pas une seconde DA.</p>
    </section>
  )
}

function Vocabulary() {
  const words = [
    ['MASTER', 'Le cadre artistique complet 390 × 844.'],
    ['HAUT', 'Partie supérieure du MASTER, recadrable.'],
    ['CENTRE', 'Zone commune 390 × 662, toujours visible.'],
    ['BAS', 'Partie inférieure du MASTER, recadrable.'],
    ['EXTRA HAUT', 'Espace réel au-dessus du MASTER si le viewport est plus haut.'],
    ['EXTRA BAS', 'Espace réel sous le MASTER si le viewport est plus haut.'],
  ] as const
  return <section className="mf-layout-panel mf-layout-vocabulary"><div className="mf-layout-panel__head"><div><small>VOCABULAIRE</small><h2>Les mêmes mots partout</h2></div></div><div>{words.map(([name, detail]) => <article key={name}><b>{name}</b><p>{detail}</p></article>)}</div><p className="mf-layout-note">Les zones cyan signifient toujours EXTRA. Elles ne font jamais partie du MASTER. Sur PC, le template réel cadre CENTRE plein écran et recadre HAUT/BAS.</p></section>
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

export function LayoutLab({ focus }: { focus?: LayoutTemplate }) {
  if (focus) {
    return <main className="mf-layout-focus" data-mode={focus}><StageArtwork mode={focus} fullSurface /><TemplateMenu active={focus} /></main>
  }

  return (
    <main className="mf-layout-lab">
      <header className="mf-layout-hero">
        <small>MINIFUGG · ZONES MINIFUGG</small>
        <h1>Un cadre.<br />Une composition.</h1>
        <p>MiniFugg produit ses écrans en portrait sur une largeur logique de 390. Cette page sépare le MASTER, ses zones recadrables et les vrais espaces EXTRA, puis montre les zones Core avant toute création d’assets.</p>
      </header>

      <section className="mf-layout-guides" aria-label="Gabarits canoniques">
        <StageGuide />
      </section>

      <Vocabulary />

      <section className="mf-layout-panel">
        <div className="mf-layout-panel__head"><div><small>FICHIERS</small><h2>Dimensions et formats de livraison</h2></div><strong className="mf-layout-rule">runtime ≤ zone logique × 2</strong></div>
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
          <p><b>5.</b> Aucun nouveau JPG/JPEG. PNG pour les sources et replis ; WebP lossless par défaut, AVIF pour les grandes images validées.</p>
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
          <li><b>Covers :</b> la cible est désormais statique. Les covers Phaser animées actuelles restent legacy jusqu’à leur remplacement, puis leur runtime sera supprimé.</li>
          <li><b>Anciens masters 9:16 :</b> ils sont plus larges que 390 × 844 et perdent environ 18 % de leur largeur en plein cadre. Il faut les recadrer avec une vraie zone sûre, sans altérer les originaux validés.</li>
          <li><b>Atlases existants :</b> plusieurs feuilles et personnages dépassent largement leur taille affichée. Chaque migration doit mesurer la zone logique et produire un dérivé runtime à ×2 maximum.</li>
          <li><b>Anciens overscans PC :</b> ils doivent être retirés au fil des migrations. HAUT et BAS restent dans le MASTER ; EXTRA HAUT/BAS sont les seuls prolongements possibles. Les côtés appartiennent au Core.</li>
          <li><b>Refonte plateforme :</b> Home, Cover, mobile et PC seront d’abord testés avec ces templates en blockout. Les scènes et jeux ne migrent qu’après validation de ce modèle.</li>
          <li><b>Installation mobile :</b> les métadonnées iOS existent. Le manifeste PWA et la famille d’icônes MiniFugg doivent encore être reliés après identification du master d’icône approuvé.</li>
        </ol>
      </section>
    </main>
  )
}
