import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { gameRegistry } from './gameRegistry'
import { CoinConsole90s } from './CoinConsole90s'
import { MINIFUGG_MASTER_VIEWPORT, MINIFUGG_PORTRAIT_CENTRE_HEIGHT, MINIFUGG_REFERENCE_VIEWPORT } from './runtime/gameRuntimePolicy'
import type { GameWelcomeVariant } from './types'
import './layoutLab.css'
import './coinConsole90s.css'
import './coverCalibrationLab.css'

const MASTER = MINIFUGG_MASTER_VIEWPORT
const MAX_WINDOW_TOP = MASTER.height - MINIFUGG_PORTRAIT_CENTRE_HEIGHT
const CENTER_WINDOW_TOP = MAX_WINDOW_TOP / 2
const CONSOLE_HEIGHT = MASTER.width * 534 / 2099
const STORAGE_KEY = 'minifugg-cover-calibration/v2'
const LEGACY_STORAGE_KEY = 'minifugg-cover-calibration/v1'
const LEGACY_MAX_WINDOW_TOP = 182
const SCHEMA = 'minifugg-cover-calibration/v2'

type CoverItem = {
  key: string
  gameId: string
  gameTitle: string
  gameStatus: string
  migrationCover: string
  variant: GameWelcomeVariant
}

type Calibration = {
  windowTop: number
  reviewed: boolean
  needsAdaptation: boolean
  adaptationComment: string
}

type CalibrationMap = Record<string, Calibration>

type ImportedCalibration = {
  key?: string
  gameId?: string
  variantId?: string
  windowTop?: number
  cropWindow?: { y?: number }
  reviewed?: boolean
  needsAdaptation?: boolean
  needsSourceAdaptation?: boolean
  adaptationComment?: string
}

const COVERS: CoverItem[] = gameRegistry.flatMap((game) => (game.welcome?.variants ?? []).map((variant) => ({
  key: `${game.id}/${variant.id}`,
  gameId: game.id,
  gameTitle: game.title,
  gameStatus: game.status,
  migrationCover: game.migration.cover,
  variant,
})))

function clampWindowTop(value: number) {
  return Math.min(MAX_WINDOW_TOP, Math.max(0, Math.round(value * 10) / 10))
}

function migrateLegacyWindowTop(value: number) {
  return clampWindowTop(value / LEGACY_MAX_WINDOW_TOP * MAX_WINDOW_TOP)
}

function objectPositionPercent(position?: string) {
  if (!position) return 50
  const normalized = position.toLowerCase()
  if (normalized.includes('top')) return 0
  if (normalized.includes('bottom')) return 100
  const percentages = normalized.match(/-?\d+(?:\.\d+)?%/g)
  if (percentages?.length) return Math.min(100, Math.max(0, Number.parseFloat(percentages.at(-1) ?? '50')))
  return 50
}

function defaultWindowTop(item: CoverItem) {
  return clampWindowTop(MAX_WINDOW_TOP * objectPositionPercent(item.variant.objectPosition) / 100)
}

function defaultCalibration(item: CoverItem): Calibration {
  return {
    windowTop: defaultWindowTop(item),
    reviewed: false,
    needsAdaptation: false,
    adaptationComment: '',
  }
}

function buildDefaults(): CalibrationMap {
  return Object.fromEntries(COVERS.map((item) => [item.key, defaultCalibration(item)]))
}

function loadCalibrations(): CalibrationMap {
  const defaults = buildDefaults()
  if (typeof window === 'undefined') return defaults
  try {
    const currentDraft = window.localStorage.getItem(STORAGE_KEY)
    const saved = JSON.parse(currentDraft ?? window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? '{}') as CalibrationMap
    const legacyDraft = currentDraft === null
    for (const item of COVERS) {
      const entry = saved[item.key]
      if (!entry) continue
      defaults[item.key] = {
        windowTop: legacyDraft
          ? migrateLegacyWindowTop(Number(entry.windowTop) || 0)
          : clampWindowTop(Number(entry.windowTop) || 0),
        reviewed: Boolean(entry.reviewed),
        needsAdaptation: Boolean(entry.needsAdaptation),
        adaptationComment: typeof entry.adaptationComment === 'string' ? entry.adaptationComment : '',
      }
    }
  } catch {
    // A corrupt local draft must not prevent the lab from opening.
  }
  return defaults
}

function recommendedObjectPosition(windowTop: number) {
  if (windowTop <= 0) return 'top center'
  if (windowTop >= MAX_WINDOW_TOP) return 'bottom center'
  const percent = Math.round(windowTop / MAX_WINDOW_TOP * 1000) / 10
  return `center ${percent}%`
}

function exportPayload(calibrations: CalibrationMap) {
  return {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    instructions: 'Annotation de cadrage uniquement. Ne pas modifier les masters sans needsSourceAdaptation=true.',
    master: MASTER,
    minimumViewport: {
      ...MINIFUGG_REFERENCE_VIEWPORT,
      logicalEquivalent: { width: MASTER.width, height: MINIFUGG_PORTRAIT_CENTRE_HEIGHT },
      movableWindowTop: { min: 0, max: MAX_WINDOW_TOP },
    },
    playOverlay: {
      component: 'CoinConsole90s',
      sourceAspectRatio: '2099/534',
      anchor: 'bottom',
      logicalBoundsInViewport: {
        x: 0,
        y: Math.round((MINIFUGG_PORTRAIT_CENTRE_HEIGHT - CONSOLE_HEIGHT) * 100) / 100,
        width: MASTER.width,
        height: Math.round(CONSOLE_HEIGHT * 100) / 100,
      },
    },
    covers: COVERS.map((item) => {
      const calibration = calibrations[item.key] ?? defaultCalibration(item)
      return {
        key: item.key,
        gameId: item.gameId,
        gameTitle: item.gameTitle,
        gameStatus: item.gameStatus,
        coverMigration: item.migrationCover,
        variantId: item.variant.id,
        variantLabel: item.variant.label,
        image: item.variant.image,
        fit: item.variant.fit ?? 'cover',
        originalObjectPosition: item.variant.objectPosition ?? 'center',
        cropWindow: {
          x: 0,
          y: calibration.windowTop,
          width: MASTER.width,
          height: MINIFUGG_PORTRAIT_CENTRE_HEIGHT,
        },
        recommendedObjectPosition: recommendedObjectPosition(calibration.windowTop),
        reviewed: calibration.reviewed,
        needsSourceAdaptation: calibration.needsAdaptation,
        adaptationComment: calibration.adaptationComment.trim(),
      }
    }),
  }
}

function downloadJson(calibrations: CalibrationMap) {
  const payload = JSON.stringify(exportPayload(calibrations), null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const day = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date())
  link.download = `minifugg-calage-covers-${day}.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

async function copyJson(calibrations: CalibrationMap) {
  const payload = JSON.stringify(exportPayload(calibrations), null, 2)
  await navigator.clipboard.writeText(payload)
}

export function CoverCalibrationLab() {
  const stageRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ pointerId: number, clientY: number, windowTop: number } | null>(null)
  const [calibrations, setCalibrations] = useState<CalibrationMap>(loadCalibrations)
  const [gameFilter, setGameFilter] = useState('all')
  const [selectedKey, setSelectedKey] = useState(COVERS[0]?.key ?? '')
  const [message, setMessage] = useState('Brouillon sauvegardé automatiquement dans ce navigateur.')
  const [imageDimensions, setImageDimensions] = useState<Record<string, string>>({})

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(calibrations))
  }, [calibrations])

  const filteredCovers = useMemo(
    () => gameFilter === 'all' ? COVERS : COVERS.filter((item) => item.gameId === gameFilter),
    [gameFilter],
  )
  const selected = COVERS.find((item) => item.key === selectedKey) ?? COVERS[0]
  const calibration = selected ? calibrations[selected.key] ?? defaultCalibration(selected) : null
  const filteredIndex = Math.max(0, filteredCovers.findIndex((item) => item.key === selected?.key))
  const reviewedCount = COVERS.filter((item) => calibrations[item.key]?.reviewed).length
  const adaptationCount = COVERS.filter((item) => calibrations[item.key]?.needsAdaptation).length

  useEffect(() => {
    if (filteredCovers.length && !filteredCovers.some((item) => item.key === selectedKey)) {
      setSelectedKey(filteredCovers[0].key)
    }
  }, [filteredCovers, selectedKey])

  if (!selected || !calibration) return null

  const patchCalibration = (patch: Partial<Calibration>) => {
    setCalibrations((current) => ({
      ...current,
      [selected.key]: { ...current[selected.key], ...patch },
    }))
  }

  const selectRelative = (delta: number) => {
    if (!filteredCovers.length) return
    const next = (filteredIndex + delta + filteredCovers.length) % filteredCovers.length
    setSelectedKey(filteredCovers[next].key)
  }

  const validateAndNext = () => {
    patchCalibration({ reviewed: true })
    setMessage(`${selected.gameTitle} · ${selected.variant.label} validée.`)
    selectRelative(1)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    dragRef.current = { pointerId: event.pointerId, clientY: event.clientY, windowTop: calibration.windowTop }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || drag.pointerId !== event.pointerId || !stage) return
    const scale = stage.getBoundingClientRect().height / MASTER.height
    patchCalibration({ windowTop: clampWindowTop(drag.windowTop + (event.clientY - drag.clientY) / scale) })
  }

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as { schema?: string, covers?: ImportedCalibration[] }
      if (parsed.schema && !['minifugg-cover-calibration/v1', SCHEMA].includes(parsed.schema)) throw new Error(`Format non reconnu : ${parsed.schema}`)
      const legacyImport = parsed.schema === 'minifugg-cover-calibration/v1'
      if (!Array.isArray(parsed.covers)) throw new Error('Liste covers absente')
      let imported = 0
      const entries = new Map<string, ImportedCalibration>()
      for (const entry of parsed.covers) {
        const key = entry.key ?? `${entry.gameId}/${entry.variantId}`
        if (!COVERS.some((item) => item.key === key)) continue
        entries.set(key, entry)
        imported += 1
      }
      setCalibrations((current) => {
        const next = { ...current }
        for (const [key, entry] of entries) {
          const windowTop = entry.windowTop ?? entry.cropWindow?.y
          next[key] = {
            ...next[key],
            windowTop: Number.isFinite(Number(windowTop))
              ? legacyImport ? migrateLegacyWindowTop(Number(windowTop)) : clampWindowTop(Number(windowTop))
              : next[key].windowTop,
            reviewed: typeof entry.reviewed === 'boolean' ? entry.reviewed : next[key].reviewed,
            needsAdaptation: Boolean(entry.needsSourceAdaptation ?? entry.needsAdaptation ?? next[key].needsAdaptation),
            adaptationComment: typeof entry.adaptationComment === 'string' ? entry.adaptationComment : next[key].adaptationComment,
          }
        }
        return next
      })
      setMessage(`${imported} réglage${imported > 1 ? 's' : ''} importé${imported > 1 ? 's' : ''}.`)
    } catch (error) {
      setMessage(`Import impossible : ${error instanceof Error ? error.message : 'JSON invalide'}.`)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const windowTopPercent = calibration.windowTop / MASTER.height * 100
  const viewportHeightPercent = MINIFUGG_PORTRAIT_CENTRE_HEIGHT / MASTER.height * 100
  const windowBottom = calibration.windowTop + MINIFUGG_PORTRAIT_CENTRE_HEIGHT
  const windowBottomPercent = windowBottom / MASTER.height * 100
  const consoleTopInMaster = calibration.windowTop + MINIFUGG_PORTRAIT_CENTRE_HEIGHT - CONSOLE_HEIGHT

  return (
    <main className="mf-layout-lab mf-cover-calibration-lab">
      <header className="mf-layout-hero mf-cover-calibration-hero">
        <div>
          <small>MINIFUGG · OUTIL DE CALAGE</small>
          <h1>Calage des covers.</h1>
          <p>Déplace le cadre vert verticalement sur chaque master. Il représente exactement la zone de jeu garantie 390 × 710 ; le pupitre JOUER affiché dedans est celui du Core actuel.</p>
        </div>
        <a href="?usr=moigod&lab=layout">RETOUR AUX GABARITS ↗</a>
      </header>

      <section className="mf-cover-calibration-summary" aria-label="Avancement">
        <span><b>{reviewedCount}</b> / {COVERS.length} cadrages validés</span>
        <span><b>{adaptationCount}</b> cover{adaptationCount > 1 ? 's' : ''} à adapter</span>
        <span><b>{Math.round(MAX_WINDOW_TOP * 10) / 10}</b> unités de débattement vertical</span>
      </section>

      <section className="mf-cover-calibration-workbench">
        <aside className="mf-cover-calibration-catalogue">
          <label>
            <span>JEU</span>
            <select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)} data-testid="cover-game-filter">
              <option value="all">Tous les jeux · {COVERS.length} covers</option>
              {gameRegistry.map((game) => <option key={game.id} value={game.id}>{game.title} · {game.welcome?.variants.length ?? 0}</option>)}
            </select>
          </label>

          <div className="mf-cover-calibration-list" data-testid="cover-list">
            {filteredCovers.map((item) => {
              const itemCalibration = calibrations[item.key] ?? defaultCalibration(item)
              return (
                <button key={item.key} type="button" data-active={item.key === selected.key} onClick={() => setSelectedKey(item.key)}>
                  <img src={item.variant.image} alt="" loading="lazy" />
                  <span><b>{item.gameTitle}</b><small>{item.variant.label}</small></span>
                  <i data-state={itemCalibration.needsAdaptation ? 'adapt' : itemCalibration.reviewed ? 'done' : 'todo'}>
                    {itemCalibration.needsAdaptation ? 'ADAPTER' : itemCalibration.reviewed ? 'OK' : 'À VOIR'}
                  </i>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="mf-cover-calibration-preview">
          <div className="mf-cover-calibration-preview-head">
            <button type="button" onClick={() => selectRelative(-1)} aria-label="Cover précédente">←</button>
            <span><b>{selected.gameTitle}</b><small>{selected.variant.label} · {filteredIndex + 1}/{filteredCovers.length}</small></span>
            <button type="button" onClick={() => selectRelative(1)} aria-label="Cover suivante">→</button>
          </div>

          <div className="mf-cover-calibration-stage" ref={stageRef} data-testid="cover-calibration-stage">
            <img
              key={selected.key}
              className="mf-cover-calibration-art"
              src={selected.variant.image}
              alt={`${selected.gameTitle} — ${selected.variant.label}`}
              draggable={false}
              onLoad={(event) => {
                const dimensions = `${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight}`
                setImageDimensions((current) => ({ ...current, [selected.key]: dimensions }))
              }}
            />
            <div className="mf-cover-calibration-dim is-top" style={{ height: `${windowTopPercent}%` }} />
            <div className="mf-cover-calibration-dim is-bottom" style={{ top: `${windowBottomPercent}%` }} />
            <div
              className="mf-cover-calibration-window"
              style={{ top: `${windowTopPercent}%`, height: `${viewportHeightPercent}%` }}
              role="slider"
              aria-label="Position verticale de la fenêtre minimale"
              aria-valuemin={0}
              aria-valuemax={MAX_WINDOW_TOP}
              aria-valuenow={calibration.windowTop}
              tabIndex={0}
              data-testid="cover-calibration-window"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              onKeyDown={(event) => {
                const amount = event.shiftKey ? 10 : 1
                if (event.key === 'ArrowUp') patchCalibration({ windowTop: clampWindowTop(calibration.windowTop - amount) })
                else if (event.key === 'ArrowDown') patchCalibration({ windowTop: clampWindowTop(calibration.windowTop + amount) })
                else return
                event.preventDefault()
              }}
            >
              <span className="mf-cover-calibration-grip">↕ GLISSER LE CADRE</span>
              <div className="mf-cover-calibration-console" ref={(node) => { if (node) node.inert = true }} aria-hidden="true">
                <CoinConsole90s
                  coins={500}
                  cost={selected.gameStatus === 'beta' ? 1 : 2}
                  free={selected.gameStatus === 'trash'}
                  launchError=""
                  onPlay={() => undefined}
                  onChangeGame={() => undefined}
                />
              </div>
            </div>
            <span className="mf-cover-calibration-master-label">CIBLE · 390 × 850</span>
          </div>

          <dl className="mf-cover-calibration-readout">
            <div><dt>Fenêtre visible</dt><dd>y {calibration.windowTop} → {Math.round(windowBottom * 10) / 10}</dd></div>
            <div><dt>Début de JOUER</dt><dd>y {Math.round(consoleTopInMaster * 10) / 10}</dd></div>
            <div><dt>Position proposée</dt><dd>{recommendedObjectPosition(calibration.windowTop)}</dd></div>
            <div><dt>Fichier affiché</dt><dd>{imageDimensions[selected.key] ?? 'chargement…'}</dd></div>
          </dl>
        </div>

        <aside className="mf-cover-calibration-controls">
          <div className="mf-cover-calibration-control-head">
            <small>RÉGLAGE ACTIF</small>
            <h2>{selected.variant.label}</h2>
            <p>{selected.variant.image}</p>
          </div>

          <div className="mf-cover-calibration-presets">
            <button type="button" onClick={() => patchCalibration({ windowTop: 0 })}>HAUT</button>
            <button type="button" onClick={() => patchCalibration({ windowTop: clampWindowTop(CENTER_WINDOW_TOP) })}>CENTRE</button>
            <button type="button" onClick={() => patchCalibration({ windowTop: clampWindowTop(MAX_WINDOW_TOP) })}>BAS</button>
          </div>

          <label className="mf-cover-calibration-range">
            <span>POSITION VERTICALE · {calibration.windowTop} unités</span>
            <input
              type="range"
              min={0}
              max={MAX_WINDOW_TOP}
              step={0.1}
              value={calibration.windowTop}
              onChange={(event) => patchCalibration({ windowTop: clampWindowTop(Number(event.target.value)) })}
              data-testid="cover-window-top"
            />
          </label>

          <label className="mf-cover-calibration-check">
            <input type="checkbox" checked={calibration.reviewed} onChange={(event) => patchCalibration({ reviewed: event.target.checked })} />
            <span><b>Décision enregistrée</b><small>Le cadrage est choisi ou l’adaptation est décrite.</small></span>
          </label>

          <label className="mf-cover-calibration-check is-adaptation">
            <input
              type="checkbox"
              checked={calibration.needsAdaptation}
              onChange={(event) => patchCalibration({ needsAdaptation: event.target.checked })}
              data-testid="cover-needs-adaptation"
            />
            <span><b>Adapter l’image</b><small>Cocher si le cadrage seul ne suffit pas.</small></span>
          </label>

          <label className="mf-cover-calibration-comment">
            <span>COMMENTAIRE D’ADAPTATION</span>
            <textarea
              value={calibration.adaptationComment}
              onChange={(event) => patchCalibration({ adaptationComment: event.target.value })}
              placeholder="Ex. prolonger le corps et les briques en bas, sans toucher au titre ni au style."
              rows={5}
              data-testid="cover-adaptation-comment"
            />
          </label>

          <div className="mf-cover-calibration-actions">
            <button type="button" className="is-primary" onClick={validateAndNext}>VALIDER & SUIVANTE →</button>
            <button type="button" onClick={() => patchCalibration(defaultCalibration(selected))}>REVENIR AU CADRAGE ACTUEL</button>
          </div>

          <div className="mf-cover-calibration-export">
            <small>FICHIER DE TRANSMISSION</small>
            <button type="button" onClick={() => downloadJson(calibrations)} data-testid="cover-export-json">EXPORTER LE JSON ↓</button>
            <button type="button" onClick={() => void copyJson(calibrations).then(() => setMessage('JSON copié dans le presse-papiers.')).catch(() => setMessage('Copie refusée par le navigateur : utilise Exporter.'))}>COPIER LE JSON</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>IMPORTER UN JSON</button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" hidden data-testid="cover-import-json" onChange={(event) => void importJson(event.target.files?.[0])} />
          </div>

          <p className="mf-cover-calibration-message" role="status">{message}</p>
        </aside>
      </section>
    </main>
  )
}
