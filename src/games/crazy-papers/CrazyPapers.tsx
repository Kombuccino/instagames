import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { GameComponentProps } from '../../core/types'
import './CrazyPapers.css'

type Sector = 'accounting' | 'civil' | 'planning' | 'hr' | 'legal'
type CueKey = 'title' | 'color' | 'layout' | 'content' | 'mark'
type FormKind = 'ledger' | 'certificate' | 'plan' | 'personnel' | 'legal'

type DocumentModel = {
  key: string
  sector: Sector
  title: string
  form: FormKind
  mark: string
  fields: string[]
  unlock: number
}

type WorkDocument = DocumentModel & {
  instanceId: number
  cues: Record<CueKey, boolean>
  returnedFrom?: Sector
  urgent?: boolean
}

const MAX_BACKLOG = 24
const CUE_KEYS: CueKey[] = ['title', 'color', 'layout', 'content', 'mark']

const SECTORS: Array<{ kind: Sector; label: string; short: string }> = [
  { kind: 'accounting', label: 'COMPTABILITÉ', short: 'COMPTA' },
  { kind: 'civil', label: 'ÉTAT CIVIL', short: 'CIVIL' },
  { kind: 'planning', label: 'URBANISME', short: 'URBA' },
  { kind: 'hr', label: 'RESSOURCES HUMAINES', short: 'RH' },
  { kind: 'legal', label: 'AFFAIRES JURIDIQUES', short: 'JURID.' },
]

const GRADES = [
  'STAGIAIRE DE GUICHET',
  'ADJOINT ADMINISTRATIF',
  'RÉDACTEUR TERRITORIAL',
  'SECRÉTAIRE PRINCIPAL',
  'ATTACHÉ ADMINISTRATIF',
  'CHEF DE BUREAU',
  'SOUS-DIRECTEUR',
  'DIRECTEUR DES FORMULAIRES',
  'INSPECTEUR GÉNÉRAL DU PAPIER',
]

const DOCUMENT_MODELS: DocumentModel[] = [
  { key: 'invoice', sector: 'accounting', title: 'FACTURE FOURNISSEUR', form: 'ledger', mark: '€', unlock: 1, fields: ['HT 1 284,50 €', 'TVA 20 % 256,90 €', 'TOTAL 1 541,40 €', 'IBAN FR76 3000 4000'] },
  { key: 'expenses', sector: 'accounting', title: 'NOTE DE FRAIS', form: 'ledger', mark: '€', unlock: 2, fields: ['REPAS 42,80 €', 'TRANSPORT 118,00 €', 'TOTAL 160,80 €', 'CENTRE DE COÛT 04'] },
  { key: 'payment-order', sector: 'accounting', title: 'MANDAT DE PAIEMENT', form: 'ledger', mark: '€', unlock: 3, fields: ['CRÉANCIER 00481', 'BUDGET 615-22', 'MONTANT 3 840,00 €', 'ÉCHÉANCE 30 JOURS'] },
  { key: 'refund', sector: 'accounting', title: 'AVOIR / REMBOURSEMENT', form: 'ledger', mark: '€', unlock: 4, fields: ['RÉF. FACTURE 88-17', 'TROP-PERÇU 284,20 €', 'NET À RENDRE 236,84 €', 'TVA 47,36 €'] },

  { key: 'birth', sector: 'civil', title: 'ACTE DE NAISSANCE', form: 'certificate', mark: '✦', unlock: 1, fields: ['NOM MARTIN', 'PRÉNOM LÉA', 'NÉ(E) LE 14 / 06 / 1998', 'COMMUNE SAINT-ROCH'] },
  { key: 'marriage', sector: 'civil', title: 'ACTE DE MARIAGE', form: 'certificate', mark: '✦', unlock: 2, fields: ['ÉPOUX DURAND / SIMON', 'DATE 22 / 08 / 2024', 'TÉMOINS 2', 'OFFICIER D’ÉTAT CIVIL'] },
  { key: 'death', sector: 'civil', title: 'ACTE DE DÉCÈS', form: 'certificate', mark: '✦', unlock: 3, fields: ['NOM BERNARD', 'DATE 03 / 11 / 2025', 'HEURE 06 : 42', 'COMMUNE VILLE-BASSE'] },
  { key: 'family-record', sector: 'civil', title: 'EXTRAIT DE LIVRET DE FAMILLE', form: 'certificate', mark: '✦', unlock: 4, fields: ['FOYER MOREAU', 'PARENT 1 / PARENT 2', 'ENFANT 1 / ENFANT 2', 'COPIE CERTIFIÉE'] },

  { key: 'building-permit', sector: 'planning', title: 'PERMIS DE CONSTRUIRE', form: 'plan', mark: '⌂', unlock: 1, fields: ['PARCELLE AB 314', 'SURFACE 148 m²', 'HAUTEUR 7,40 m', 'RUE DES TILLEULS 12'] },
  { key: 'works', sector: 'planning', title: 'DÉCLARATION PRÉALABLE DE TRAVAUX', form: 'plan', mark: '⌂', unlock: 2, fields: ['FAÇADE NORD', 'OUVERTURE 120 × 90 cm', 'PARCELLE F 22', 'ZONE UA-3'] },
  { key: 'cadastre', sector: 'planning', title: 'RELEVÉ CADASTRAL', form: 'plan', mark: '⌂', unlock: 3, fields: ['SECTION C', 'PARCELLE 0087', 'CONTENANCE 05 a 42 ca', 'LIMITE VOIR PLAN'] },
  { key: 'planning-certificate', sector: 'planning', title: 'CERTIFICAT D’URBANISME', form: 'plan', mark: '⌂', unlock: 4, fields: ['TERRAIN 62 RUE HAUTE', 'ZONE UB', 'EMPRISE MAX 40 %', 'RÉSEAUX OUI / NON'] },

  { key: 'leave', sector: 'hr', title: 'DEMANDE DE CONGÉ', form: 'personnel', mark: 'RH', unlock: 1, fields: ['AGENT 0418', 'SERVICE TECHNIQUE', 'DU 08 / 07 AU 19 / 07', 'SOLDE 14 JOURS'] },
  { key: 'sick-leave', sector: 'hr', title: 'ARRÊT DE TRAVAIL', form: 'personnel', mark: 'RH', unlock: 2, fields: ['MATRICULE 7721', 'AGENT B. ROUX', 'ABSENCE 5 JOURS', 'REPRISE PRÉVUE LUNDI'] },
  { key: 'assignment', sector: 'hr', title: 'FICHE D’AFFECTATION', form: 'personnel', mark: 'RH', unlock: 3, fields: ['AGENT 2280', 'POSTE B-14', 'SERVICE VOIRIE', 'PRISE DE FONCTION 01 / 10'] },
  { key: 'evaluation', sector: 'hr', title: 'ÉVALUATION ANNUELLE', form: 'personnel', mark: 'RH', unlock: 4, fields: ['AGENT 9934', 'OBJECTIFS 7 / 10', 'ANCIENNETÉ 11 ANS', 'AVIS DU SUPÉRIEUR'] },

  { key: 'contract', sector: 'legal', title: 'CONTRAT DE PRESTATION', form: 'legal', mark: '§', unlock: 1, fields: ['PARTIE A / PARTIE B', 'ARTICLE 1 — OBJET', 'DURÉE 24 MOIS', 'SIGNATURE DES PARTIES'] },
  { key: 'appeal', sector: 'legal', title: 'RECOURS GRACIEUX', form: 'legal', mark: '§', unlock: 2, fields: ['REQUÉRANT M. LENOIR', 'DÉCISION CONTESTÉE 24-118', 'DÉLAI 2 MOIS', 'MOTIFS EN ANNEXE'] },
  { key: 'notice', sector: 'legal', title: 'MISE EN DEMEURE', form: 'legal', mark: '§', unlock: 3, fields: ['DOSSIER J-208', 'DÉLAI 15 JOURS', 'À DÉFAUT : PROCÉDURE', 'ARTICLE L.221-3'] },
  { key: 'agreement', sector: 'legal', title: 'CONVENTION ADMINISTRATIVE', form: 'legal', mark: '§', unlock: 4, fields: ['ENTRE LES SOUSSIGNÉS', 'CLAUSE 4.2', 'DURÉE 36 MOIS', 'AVENANT POSSIBLE'] },
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

function gradeFor(level: number) {
  return GRADES[level - 1] ?? `HAUT FONCTIONNAIRE — CLASSE ${level - GRADES.length}`
}

function cueCountForLevel(level: number) {
  if (level <= 1) return 5
  if (level <= 3) return 4
  if (level <= 5) return 3
  if (level <= 7) return 2
  return 1
}

function phaseLabel(level: number) {
  const cues = cueCountForLevel(level)
  if (cues === 5) return 'DOSSIERS COMPLETS'
  if (cues >= 3) return `${cues} INDICES`
  if (cues === 2) return 'DOSSIERS INCOMPLETS'
  return 'UN SEUL INDICE'
}

function levelBatch(level: number) {
  return Math.min(30, 8 + level * 2)
}

function initialPileSize(level: number) {
  return Math.min(levelBatch(level), 6 + Math.min(level, 5))
}

function arrivalDelay(level: number) {
  return Math.max(430, 1750 - (level - 1) * 145)
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
      {Array.from({ length: Math.min(8, count) }, (_, index) => (
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
  const shownForm: FormKind | 'generic' = document.cues.layout ? document.form : 'generic'
  const title = document.cues.title ? document.title : `FORMULAIRE N° ${String(document.instanceId).padStart(5, '0')}`
  const fields = document.cues.content ? document.fields : GENERIC_LINES

  return (
    <article
      className={`crazy-papers-paper crazy-papers-paper-active ${document.cues.color ? `paper-${document.sector}` : 'paper-neutral'} form-${shownForm} ${document.urgent ? 'is-urgent' : ''} ${className}`}
    >
      <div className="crazy-papers-paper-topline">
        <span>RÉPUBLIQUE ADMINISTRATIVE</span>
        <b>N° {String(document.instanceId).padStart(5, '0')}</b>
      </div>

      {document.urgent && <div className="crazy-papers-urgent-ribbon">URGENT</div>}
      {document.cues.mark && <div className={`crazy-papers-sector-mark mark-${document.sector}`}>{document.mark}</div>}

      <h2>{title}</h2>

      <div className={`crazy-papers-document-form form-visual-${shownForm}`}>
        {shownForm === 'ledger' && <div className="crazy-papers-ledger-head"><i /><i /><i /></div>}
        {shownForm === 'certificate' && <div className="crazy-papers-certificate-seal">✦</div>}
        {shownForm === 'plan' && <div className="crazy-papers-mini-plan"><i /><i /><i /><i /></div>}
        {shownForm === 'personnel' && (
          <div className="crazy-papers-personnel-card"><i /><span>AGENT</span><b>••••••</b></div>
        )}
        {shownForm === 'legal' && (
          <div className="crazy-papers-legal-head"><b>§</b><span>VU LES ARTICLES ET DISPOSITIONS CI-APRÈS</span></div>
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
  const surpriseCooldownRef = useRef(3)

  const [queue, setQueue] = useState<WorkDocument[]>([])
  const [processed, setProcessed] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [remainingToArrive, setRemainingToArrive] = useState(0)
  const [scoldTicks, setScoldTicks] = useState(0)
  const [bossLine, setBossLine] = useState('TRIEZ. VITE. ET AU BON SERVICE.')
  const [lastCorrect, setLastCorrect] = useState<Sector | null>(null)
  const [departing, setDeparting] = useState<WorkDocument | null>(null)
  const [returning, setReturning] = useState<WorkDocument | null>(null)
  const [surprise, setSurprise] = useState<string | null>(null)
  const [isPromoting, setIsPromoting] = useState(false)
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

  const buildDocument = useCallback((model: DocumentModel, currentLevel: number, urgent = false): WorkDocument => ({
    ...model,
    instanceId: idRef.current++,
    cues: makeCueSet(cueCountForLevel(currentLevel), randomRef.current),
    urgent,
  }), [])

  const makeDocument = useCallback((currentLevel: number, urgent = false): WorkDocument => {
    const available = DOCUMENT_MODELS.filter((model) => model.unlock <= Math.min(4, currentLevel))
    const model = available[Math.floor(randomRef.current() * available.length)]
    return buildDocument(model, currentLevel, urgent)
  }, [buildDocument])

  const loadLevel = useCallback((nextLevel: number) => {
    const total = levelBatch(nextLevel)
    const initial = initialPileSize(nextLevel)
    setLevel(nextLevel)
    setQueue(Array.from({ length: initial }, () => makeDocument(nextLevel)))
    setRemainingToArrive(total - initial)
    setScoldTicks(0)
    setBossLine('TRIEZ. VITE. ET AU BON SERVICE.')
    setLastCorrect(null)
    setDeparting(null)
    setReturning(null)
    setSurprise(null)
    setIsPromoting(false)
    surpriseCooldownRef.current = Math.max(2, 4 - Math.floor(nextLevel / 3))
  }, [makeDocument])

  const reset = useCallback(() => {
    clearMotionTimers()
    randomRef.current = mulberry32((seed || 1) + restartToken * 9973)
    idRef.current = 1
    finishedRef.current = false
    surpriseCooldownRef.current = 3
    setProcessed(0)
    setMistakes(0)
    setStreak(0)
    setIsOver(false)
    loadLevel(1)
  }, [clearMotionTimers, loadLevel, restartToken, seed])

  useEffect(() => {
    reset()
    return clearMotionTimers
  }, [clearMotionTimers, reset])

  useEffect(() => {
    session.setScore(processed)
  }, [processed, session])

  useEffect(() => {
    if (!active || isOver || isPromoting || remainingToArrive <= 0) return
    const delay = queue.length <= 1 ? 90 : arrivalDelay(level)
    const timeout = window.setTimeout(() => {
      setQueue((current) => [...current, makeDocument(level)])
      setRemainingToArrive((value) => Math.max(0, value - 1))
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [active, isOver, isPromoting, level, makeDocument, queue.length, remainingToArrive])

  useEffect(() => {
    if (!active || scoldTicks <= 0) return
    const timeout = window.setTimeout(() => {
      setScoldTicks((ticks) => Math.max(0, ticks - 1))
    }, 180)
    return () => window.clearTimeout(timeout)
  }, [active, scoldTicks])

  useEffect(() => {
    if (
      !active ||
      isOver ||
      isPromoting ||
      remainingToArrive > 0 ||
      queue.length > 0 ||
      departing ||
      returning ||
      scoldTicks > 0
    ) return

    setIsPromoting(true)
    schedule(() => loadLevel(level + 1), 850)
  }, [active, departing, isOver, isPromoting, level, loadLevel, queue.length, remainingToArrive, returning, schedule, scoldTicks])

  useEffect(() => {
    if (queue.length < MAX_BACKLOG || finishedRef.current) return
    finishedRef.current = true
    setIsOver(true)
    session.finish({
      score: processed,
      metadata: {
        mistakes,
        streak,
        level,
        grade: gradeFor(level),
      },
    })
  }, [level, mistakes, processed, queue.length, session, streak])

  const activeDocument = queue[0]
  const backlogDocuments = queue.slice(1)
  const piles = useMemo(() => {
    const counts = [0, 0, 0]
    backlogDocuments.forEach((_, index) => {
      counts[index % 3] += 1
    })
    return counts
  }, [backlogDocuments])

  const announceSurprise = useCallback((label: string) => {
    setSurprise(label)
    schedule(() => setSurprise(null), 900)
  }, [schedule])

  const maybeTriggerSurprise = useCallback((document: WorkDocument) => {
    if (level < 2) return
    if (surpriseCooldownRef.current > 0) {
      surpriseCooldownRef.current -= 1
      return
    }

    const chance = Math.min(.3, .12 + level * .025)
    if (randomRef.current() > chance) return

    const event = Math.floor(randomRef.current() * 3)
    surpriseCooldownRef.current = 4 + Math.floor(randomRef.current() * 3)

    if (event === 0) {
      setQueue((current) => [
        ...current,
        makeDocument(level),
        makeDocument(level),
        makeDocument(level),
      ])
      announceSurprise('LIASSE DU COURRIER — +3 DOSSIERS')
      return
    }

    if (event === 1) {
      setQueue((current) => [makeDocument(level, true), ...current])
      announceSurprise('DOSSIER URGENT — TOUT DE SUITE')
      return
    }

    const model = DOCUMENT_MODELS.find((candidate) => candidate.key === document.key)
    if (!model) return
    setQueue((current) => [
      ...current,
      buildDocument(model, level),
      buildDocument(model, level),
    ])
    announceSurprise('PHOTOCOPIEUSE FOLLE — DOSSIER EN DOUBLE')
  }, [announceSurprise, buildDocument, level, makeDocument])

  const handleStamp = useCallback((sector: Sector) => {
    if (!active || isOver || isPromoting || scoldTicks > 0 || departing || returning) return
    const document = queue[0]
    if (!document) return

    setQueue((current) => current.slice(1))
    setDeparting(document)
    schedule(() => setDeparting(null), 180)

    if (sector === document.sector) {
      setProcessed((value) => value + 1)
      setStreak((value) => value + 1)
      setLastCorrect(sector)
      schedule(() => setLastCorrect(null), 120)
      maybeTriggerSurprise(document)
      return
    }

    const returnedDocument: WorkDocument = {
      ...document,
      returnedFrom: sector,
      urgent: false,
    }

    setMistakes((value) => value + 1)
    setStreak(0)
    setBossLine(`NON ! PAS ${sectorLabel(sector)} — CE DOSSIER VA À ${sectorLabel(document.sector)} !`)
    setScoldTicks(4)

    schedule(() => {
      setQueue((current) => [...current, makeDocument(level)])
    }, 150)

    schedule(() => {
      setReturning(returnedDocument)
    }, 260)

    schedule(() => {
      setReturning(null)
      setQueue((current) => [returnedDocument, ...current])
    }, 560)
  }, [active, departing, isOver, isPromoting, level, makeDocument, maybeTriggerSurprise, queue, returning, schedule, scoldTicks])

  useEffect(() => {
    if (!active || isOver) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === '1') handleStamp('accounting')
      if (event.key === '2') handleStamp('civil')
      if (event.key === '3') handleStamp('planning')
      if (event.key === '4') handleStamp('hr')
      if (event.key === '5') handleStamp('legal')
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
            <span>NIVEAU {level} · {phaseLabel(level)}</span>
            <strong>{gradeFor(level)}</strong>
          </div>
          <div className="crazy-papers-cue-note">
            <b>{cueCountForLevel(level)}</b>
            <span>INDICE{cueCountForLevel(level) > 1 ? 'S' : ''}</span>
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
                <DocumentCard key={activeDocument.instanceId} document={activeDocument} className="crazy-papers-paper-from-pile" />
              ) : (
                <div className="crazy-papers-empty">
                  {remainingToArrive > 0 ? 'LE COURRIER ARRIVE…' : 'BUREAU VIDE.'}
                </div>
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

          {surprise && <div className="crazy-papers-surprise" role="status">{surprise}</div>}

          {isPromoting && (
            <div className="crazy-papers-promotion" role="status">
              <small>PILE ÉPUISÉE — PROMOTION</small>
              <strong>{gradeFor(level + 1)}</strong>
              <span>NIVEAU {level + 1} · PLUS VITE · MOINS D’INDICES</span>
            </div>
          )}

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
                disabled={!activeDocument || scoldTicks > 0 || isOver || isPromoting || Boolean(departing) || Boolean(returning)}
                aria-label={`Envoyer à ${sector.label}. Touche ${index + 1}`}
              >
                <span className="crazy-papers-stamp-handle" aria-hidden="true" />
                <strong>{sector.short}</strong>
                <small>{index + 1}</small>
              </button>
            ))}
          </div>
          <div className="crazy-papers-desk-meta">
            <span>ERREURS {mistakes}</span>
            <span>SÉRIE {streak}</span>
            <span>PILE {queue.length}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
