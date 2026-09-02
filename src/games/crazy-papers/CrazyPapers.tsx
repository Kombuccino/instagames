import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { GameComponentProps } from '../../core/types'
import './CrazyPapers.css'

type Sector = 'accounting' | 'civil' | 'planning'
type CueKey = 'title' | 'color' | 'layout' | 'content' | 'mark'
type FormKind = 'ledger' | 'certificate' | 'plan'

type DocumentModel = {
  key: string
  sector: Sector
  title: string
  form: FormKind
  mark: string
  fields: string[]
}

type WorkDocument = DocumentModel & {
  instanceId: number
  cues: Record<CueKey, boolean>
  returnedFrom?: Sector
}

const MAX_BACKLOG = 18
const CUE_KEYS: CueKey[] = ['title', 'color', 'layout', 'content', 'mark']

const SECTORS: Array<{ kind: Sector; label: string; short: string }> = [
  { kind: 'accounting', label: 'COMPTABILITÉ', short: 'COMPTA' },
  { kind: 'civil', label: 'ÉTAT CIVIL', short: 'CIVIL' },
  { kind: 'planning', label: 'URBANISME', short: 'URBA' },
]

const DOCUMENT_MODELS: DocumentModel[] = [
  {
    key: 'invoice',
    sector: 'accounting',
    title: 'FACTURE FOURNISSEUR',
    form: 'ledger',
    mark: '€',
    fields: ['HT 1 284,50 €', 'TVA 20 % 256,90 €', 'TOTAL 1 541,40 €', 'IBAN FR76 3000 4000'],
  },
  {
    key: 'expenses',
    sector: 'accounting',
    title: 'NOTE DE FRAIS',
    form: 'ledger',
    mark: '€',
    fields: ['REPAS 42,80 €', 'TRANSPORT 118,00 €', 'TOTAL 160,80 €', 'CENTRE DE COÛT 04'],
  },
  {
    key: 'payment-order',
    sector: 'accounting',
    title: 'MANDAT DE PAIEMENT',
    form: 'ledger',
    mark: '€',
    fields: ['CRÉANCIER 00481', 'BUDGET 615-22', 'MONTANT 3 840,00 €', 'ÉCHÉANCE 30 JOURS'],
  },
  {
    key: 'refund',
    sector: 'accounting',
    title: 'AVOIR / REMBOURSEMENT',
    form: 'ledger',
    mark: '€',
    fields: ['RÉF. FACTURE 88-17', 'TROP-PERÇU 284,20 €', 'NET À RENDRE 236,84 €', 'TVA 47,36 €'],
  },
  {
    key: 'birth',
    sector: 'civil',
    title: 'ACTE DE NAISSANCE',
    form: 'certificate',
    mark: '✦',
    fields: ['NOM MARTIN', 'PRÉNOM LÉA', 'NÉ(E) LE 14 / 06 / 1998', 'COMMUNE SAINT-ROCH'],
  },
  {
    key: 'marriage',
    sector: 'civil',
    title: 'ACTE DE MARIAGE',
    form: 'certificate',
    mark: '✦',
    fields: ['ÉPOUX DURAND / SIMON', 'DATE 22 / 08 / 2024', 'TÉMOINS 2', 'OFFICIER D’ÉTAT CIVIL'],
  },
  {
    key: 'death',
    sector: 'civil',
    title: 'ACTE DE DÉCÈS',
    form: 'certificate',
    mark: '✦',
    fields: ['NOM BERNARD', 'DATE 03 / 11 / 2025', 'HEURE 06 : 42', 'COMMUNE VILLE-BASSE'],
  },
  {
    key: 'family-record',
    sector: 'civil',
    title: 'EXTRAIT DE LIVRET DE FAMILLE',
    form: 'certificate',
    mark: '✦',
    fields: ['FOYER MOREAU', 'PARENT 1 / PARENT 2', 'ENFANT 1 / ENFANT 2', 'COPIE CERTIFIÉE'],
  },
  {
    key: 'building-permit',
    sector: 'planning',
    title: 'PERMIS DE CONSTRUIRE',
    form: 'plan',
    mark: '⌂',
    fields: ['PARCELLE AB 314', 'SURFACE 148 m²', 'HAUTEUR 7,40 m', 'RUE DES TILLEULS 12'],
  },
  {
    key: 'works',
    sector: 'planning',
    title: 'DÉCLARATION PRÉALABLE DE TRAVAUX',
    form: 'plan',
    mark: '⌂',
    fields: ['FAÇADE NORD', 'OUVERTURE 120 × 90 cm', 'PARCELLE F 22', 'ZONE UA-3'],
  },
  {
    key: 'cadastre',
    sector: 'planning',
    title: 'RELEVÉ CADASTRAL',
    form: 'plan',
    mark: '⌂',
    fields: ['SECTION C', 'PARCELLE 0087', 'CONTENANCE 05 a 42 ca', 'LIMITE VOIR PLAN'],
  },
  {
    key: 'planning-certificate',
    sector: 'planning',
    title: 'CERTIFICAT D’URBANISME',
    form: 'plan',
    mark: '⌂',
    fields: ['TERRAIN 62 RUE HAUTE', 'ZONE UB', 'EMPRISE MAX 40 %', 'RÉSEAUX OUI / NON'],
  },
]

const GENERIC_LINES = ['RÉF. ____________', 'DOSSIER ____________', 'DATE ____ / ____ / ____', 'SIGNATURE ____________']

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

function sectorLabel(sector: Sector) {
  return SECTORS.find((item) => item.kind === sector)?.label ?? sector
}

function cueCountFor(processed: number) {
  if (processed < 5) return 5
  if (processed < 12) return 4
  if (processed < 22) return 3
  if (processed < 34) return 2
  return 1
}

function phaseLabel(processed: number) {
  const cues = cueCountFor(processed)
  if (cues === 5) return 'DOSSIERS COMPLETS'
  if (cues >= 3) return `${cues} INDICES PAR DOSSIER`
  if (cues === 2) return 'DOSSIERS INCOMPLETS'
  return 'UN SEUL INDICE'
}

function makeCueSet(count: number, random: () => number): Record<CueKey, boolean> {
  const shuffled = [...CUE_KEYS]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  const visible = new Set(shuffled.slice(0, Math.max(1, Math.min(5, count))))
  return {
    title: visible.has('title'),
    color: visible.has('color'),
    layout: visible.has('layout'),
    content: visible.has('content'),
    mark: visible.has('mark'),
  }
}

function renderPile(count: number, key: string) {
  return (
    <div className={`crazy-papers-pile pile-${key}`} aria-hidden="true">
      <div className="crazy-papers-pile-tray" />
      {Array.from({ length: count }, (_, index) => (
        <i
          key={index}
          className="crazy-papers-pile-sheet"
          style={{ '--sheet': index } as CSSProperties}
        />
      ))}
    </div>
  )
}

function DocumentCard({ document, className = '' }: { document: WorkDocument; className?: string }) {
  const shownForm = document.cues.layout ? document.form : 'generic'
  const title = document.cues.title ? document.title : `FORMULAIRE N° ${String(document.instanceId).padStart(5, '0')}`
  const fields = document.cues.content ? document.fields : GENERIC_LINES

  return (
    <article
      className={`crazy-papers-paper crazy-papers-paper-active ${document.cues.color ? `paper-${document.sector}` : 'paper-neutral'} form-${shownForm} ${className}`}
    >
      <div className="crazy-papers-paper-topline">
        <span>RÉPUBLIQUE ADMINISTRATIVE</span>
        <b>N° {String(document.instanceId).padStart(5, '0')}</b>
      </div>

      {document.cues.mark && <div className={`crazy-papers-sector-mark mark-${document.sector}`}>{document.mark}</div>}

      <h2>{title}</h2>

      <div className={`crazy-papers-document-form form-visual-${shownForm}`} aria-hidden={!document.cues.layout}>
        {shownForm === 'ledger' && (
          <div className="crazy-papers-ledger-head"><i /><i /><i /></div>
        )}
        {shownForm === 'certificate' && (
          <div className="crazy-papers-certificate-seal">✦</div>
        )}
        {shownForm === 'plan' && (
          <div className="crazy-papers-mini-plan"><i /><i /><i /><i /></div>
        )}

        <div className="crazy-papers-fields">
          {fields.map((field, index) => <p key={`${field}-${index}`}>{field}</p>)}
        </div>
      </div>

      <div className="crazy-papers-signature">SIGNATURE __________________</div>

      {document.returnedFrom && (
        <div className="crazy-papers-return-stamp">
          <strong>MAUVAIS SERVICE</strong>
          <span>RETOUR DE {sectorLabel(document.returnedFrom)}</span>
        </div>
      )}
    </article>
  )
}

export function CrazyPapers({ active, seed, restartToken, session }: GameComponentProps) {
  const randomRef = useRef(mulberry32(seed || 1))
  const idRef = useRef(1)
  const finishedRef = useRef(false)
  const motionTimersRef = useRef<number[]>([])
  const [queue, setQueue] = useState<WorkDocument[]>([])
  const [processed, setProcessed] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [scoldTicks, setScoldTicks] = useState(0)
  const [bossLine, setBossLine] = useState('TRIEZ. VITE. ET AU BON SERVICE.')
  const [lastCorrect, setLastCorrect] = useState<Sector | null>(null)
  const [departing, setDeparting] = useState<WorkDocument | null>(null)
  const [returning, setReturning] = useState<WorkDocument | null>(null)
  const [isOver, setIsOver] = useState(false)

  const clearMotionTimers = useCallback(() => {
    motionTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    motionTimersRef.current = []
  }, [])

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      motionTimersRef.current = motionTimersRef.current.filter((value) => value !== timer)
      callback()
    }, delay)
    motionTimersRef.current.push(timer)
  }, [])

  const makeDocument = useCallback((progress: number): WorkDocument => {
    const model = DOCUMENT_MODELS[Math.floor(randomRef.current() * DOCUMENT_MODELS.length)]
    return {
      ...model,
      instanceId: idRef.current++,
      cues: makeCueSet(cueCountFor(progress), randomRef.current),
    }
  }, [])

  const reset = useCallback(() => {
    clearMotionTimers()
    randomRef.current = mulberry32((seed || 1) + restartToken * 9973)
    idRef.current = 1
    finishedRef.current = false
    setProcessed(0)
    setMistakes(0)
    setStreak(0)
    setScoldTicks(0)
    setBossLine('TRIEZ. VITE. ET AU BON SERVICE.')
    setLastCorrect(null)
    setDeparting(null)
    setReturning(null)
    setIsOver(false)
    setQueue(Array.from({ length: 7 }, () => makeDocument(0)))
  }, [clearMotionTimers, makeDocument, restartToken, seed])

  useEffect(() => {
    reset()
    return clearMotionTimers
  }, [clearMotionTimers, reset])

  useEffect(() => {
    session.setScore(processed)
  }, [processed, session])

  useEffect(() => {
    if (!active || isOver) return
    const delay = Math.max(820, 3300 - processed * 70)
    const timeout = window.setTimeout(() => {
      setQueue((current) => [...current, makeDocument(processed)])
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [active, isOver, makeDocument, processed, queue.length])

  useEffect(() => {
    if (!active || scoldTicks <= 0) return
    const timeout = window.setTimeout(() => {
      setScoldTicks((ticks) => Math.max(0, ticks - 1))
    }, 220)
    return () => window.clearTimeout(timeout)
  }, [active, scoldTicks])

  useEffect(() => {
    if (queue.length < MAX_BACKLOG || finishedRef.current) return
    finishedRef.current = true
    setIsOver(true)
    session.finish({
      score: processed,
      metadata: {
        mistakes,
        streak,
        cues: cueCountFor(processed),
      },
    })
  }, [mistakes, processed, queue.length, session, streak])

  const activeDocument = queue[0]
  const backlogDocuments = queue.slice(1)
  const piles = useMemo(() => {
    const counts = [0, 0, 0]
    backlogDocuments.forEach((_, index) => {
      counts[index % 3] += 1
    })
    return counts
  }, [backlogDocuments])

  const handleStamp = useCallback((sector: Sector) => {
    if (!active || isOver || scoldTicks > 0 || departing || returning) return
    const document = queue[0]
    if (!document) return

    setQueue((current) => current.slice(1))
    setDeparting(document)
    schedule(() => setDeparting(null), 260)

    if (sector === document.sector) {
      setProcessed((value) => value + 1)
      setStreak((value) => value + 1)
      setLastCorrect(sector)
      schedule(() => setLastCorrect(null), 150)
      return
    }

    const returnedDocument: WorkDocument = {
      ...document,
      returnedFrom: sector,
    }

    setMistakes((value) => value + 1)
    setStreak(0)
    setBossLine(`NON ! PAS ${sectorLabel(sector)} — CE DOSSIER VA À ${sectorLabel(document.sector)} !`)
    setScoldTicks(5)

    schedule(() => {
      setQueue((current) => [...current, makeDocument(processed)])
    }, 190)

    schedule(() => {
      setReturning(returnedDocument)
    }, 330)

    schedule(() => {
      setReturning(null)
      setQueue((current) => [returnedDocument, ...current])
    }, 720)
  }, [active, departing, isOver, makeDocument, processed, queue, returning, schedule, scoldTicks])

  useEffect(() => {
    if (!active || isOver) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === '1') handleStamp('accounting')
      if (event.key === '2') handleStamp('civil')
      if (event.key === '3') handleStamp('planning')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, handleStamp, isOver])

  return (
    <div className="crazy-papers-game">
      <div className="crazy-papers-wall" aria-hidden="true" />

      <div className="mf-game-layout crazy-papers-layout">
        <header className="mf-game-hud crazy-papers-hud">
          <div className="crazy-papers-status">
            <span>GUICHET DE TRI 13</span>
            <strong>{phaseLabel(processed)}</strong>
          </div>
          <div className="crazy-papers-cue-note">
            <b>{cueCountFor(processed)}</b>
            <span>INDICE{cueCountFor(processed) > 1 ? 'S' : ''}</span>
          </div>
        </header>

        <main className="mf-game-stage crazy-papers-stage">
          <div className="crazy-papers-desk">
            <div className="crazy-papers-inbox-label">ARRIVÉE</div>
            <div className="crazy-papers-outbox-label">DÉPART →</div>

            <div className="crazy-papers-backlog" aria-label={`${backlogDocuments.length} documents visibles sur le bureau`}>
              {renderPile(piles[0], 'left')}
              {renderPile(piles[1], 'middle')}
              {renderPile(piles[2], 'right')}
            </div>

            <div className="crazy-papers-active-slot" aria-live="polite">
              {activeDocument ? (
                <DocumentCard document={activeDocument} />
              ) : (
                <div className="crazy-papers-empty">PLUS RIEN… POUR L’INSTANT.</div>
              )}
            </div>

            {departing && (
              <div className="crazy-papers-flight crazy-papers-flight-out" aria-hidden="true">
                <DocumentCard document={departing} />
              </div>
            )}

            {returning && (
              <div className="crazy-papers-flight crazy-papers-flight-return" aria-hidden="true">
                <DocumentCard document={returning} />
              </div>
            )}
          </div>

          {scoldTicks > 0 && (
            <div className="crazy-papers-boss" role="status">
              <div className="crazy-papers-boss-face" aria-hidden="true">
                <span>▰</span><span>▰</span><b>▄</b>
              </div>
              <p>{bossLine}</p>
            </div>
          )}
        </main>

        <footer className="mf-game-controls crazy-papers-controls">
          <div className="crazy-papers-stamp-row">
            {SECTORS.map((sector, index) => (
              <button
                key={sector.kind}
                type="button"
                className={`crazy-papers-stamp sector-${sector.kind} ${lastCorrect === sector.kind ? 'is-hit' : ''}`}
                onClick={() => handleStamp(sector.kind)}
                disabled={!activeDocument || scoldTicks > 0 || isOver || Boolean(departing) || Boolean(returning)}
                aria-label={`Envoyer à ${sector.label}. Touche ${index + 1}`}
              >
                <span className="crazy-papers-stamp-handle" aria-hidden="true" />
                <strong>{sector.label}</strong>
                <small>{index + 1}</small>
              </button>
            ))}
          </div>
          <div className="crazy-papers-desk-meta">
            <span>ERREURS {mistakes}</span>
            <span>SÉRIE {streak}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
