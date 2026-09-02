import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { GameComponentProps } from '../../core/types'
import './CrazyPapers.css'

type StampKind = 'approve' | 'reject' | 'archive'
type DocumentTier = 'training' | 'service' | 'cryptic'

type DocumentTemplate = {
  key: string
  title: string
  department: string
  stamp: StampKind
  tier: DocumentTier
  code?: string
}

type WorkDocument = DocumentTemplate & {
  instanceId: number
  returned?: boolean
  correction?: boolean
}

const MAX_BACKLOG = 10

const STAMPS: Array<{ kind: StampKind; label: string; short: string }> = [
  { kind: 'approve', label: 'VALIDÉ', short: 'V' },
  { kind: 'reject', label: 'REFUSÉ', short: 'R' },
  { kind: 'archive', label: 'ARCHIVÉ', short: 'A' },
]

const TRAINING_DOCUMENTS: DocumentTemplate[] = [
  { key: 'permit', title: 'DEMANDE DE PERMIS', department: 'Autorisations', stamp: 'approve', tier: 'training' },
  { key: 'renewal', title: 'RENOUVELLEMENT', department: 'Autorisations', stamp: 'approve', tier: 'training' },
  { key: 'incomplete', title: 'DOSSIER INCOMPLET', department: 'Contrôle', stamp: 'reject', tier: 'training' },
  { key: 'violation', title: "AVIS D'INFRACTION", department: 'Contrôle', stamp: 'reject', tier: 'training' },
  { key: 'receipt', title: 'ACCUSÉ DE RÉCEPTION', department: 'Archives', stamp: 'archive', tier: 'training' },
  { key: 'copy', title: 'COPIE CONFORME', department: 'Archives', stamp: 'archive', tier: 'training' },
]

const SERVICE_DOCUMENTS: DocumentTemplate[] = [
  { key: 'terrace', title: 'OCCUPATION TEMPORAIRE DE VOIRIE', department: 'Bureau 4', stamp: 'approve', tier: 'service' },
  { key: 'chimney', title: 'DÉCLARATION DE CONDUIT EXTÉRIEUR', department: 'Bureau 4', stamp: 'approve', tier: 'service' },
  { key: 'missing-bis', title: 'ANNEXE MANQUANTE — DOSSIER BIS', department: 'Bureau 9', stamp: 'reject', tier: 'service' },
  { key: 'signature', title: 'SIGNATURE NON CONCORDANTE', department: 'Bureau 9', stamp: 'reject', tier: 'service' },
  { key: 'minutes', title: 'PROCÈS-VERBAL DE TRANSMISSION', department: 'Sous-sol C', stamp: 'archive', tier: 'service' },
  { key: 'duplicate', title: 'DUPLICATA CERTIFIÉ', department: 'Sous-sol C', stamp: 'archive', tier: 'service' },
]

const CRYPTIC_DOCUMENTS: DocumentTemplate[] = [
  { key: 'b17', title: 'FORMULAIRE B-17/4', department: 'Section K', stamp: 'approve', tier: 'cryptic', code: '47-21-08' },
  { key: 'omega', title: 'ANNEXE Ω-6', department: 'Section K', stamp: 'approve', tier: 'cryptic', code: '06-41-88' },
  { key: 'cerfa', title: 'CERFA 88-K TER', department: 'Section N', stamp: 'reject', tier: 'cryptic', code: '19-00-13' },
  { key: 'r31', title: 'DOSSIER R/31', department: 'Section N', stamp: 'reject', tier: 'cryptic', code: '31-31-04' },
  { key: 'pvx', title: 'PV-XIII / FEUILLET 2', department: 'Dépôt 0', stamp: 'archive', tier: 'cryptic', code: '72-05-44' },
  { key: 'lila', title: 'REGISTRE LILA-9', department: 'Dépôt 0', stamp: 'archive', tier: 'cryptic', code: '09-62-10' },
]

const BOSS_LINES = [
  'VOUS APPELEZ ÇA UN TAMPON ?!',
  'REPRENEZ CE DOSSIER DEPUIS LE DÉBUT !',
  'LE MINISTÈRE N’EST PAS UNE KERMESSE !',
  'ENCORE UNE ERREUR ET JE FAIS UN RAPPORT !',
  'FORMULAIRE. TAMPON. BON FORMULAIRE. BON TAMPON.',
  'MAGNIFIQUE. DEUX DOSSIERS DE PLUS À CAUSE DE VOUS.',
]

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

function phaseFor(processed: number): DocumentTier {
  if (processed < 7) return 'training'
  if (processed < 18) return 'service'
  return 'cryptic'
}

function phaseLabel(processed: number) {
  const phase = phaseFor(processed)
  if (phase === 'training') return 'FORMATION'
  if (phase === 'service') return 'SERVICE OUVERT'
  return 'PROCÉDURE 9-B'
}

function poolFor(processed: number) {
  const phase = phaseFor(processed)
  if (phase === 'training') return TRAINING_DOCUMENTS
  if (phase === 'service') return SERVICE_DOCUMENTS
  return CRYPTIC_DOCUMENTS
}

function stampLabel(kind: StampKind) {
  return STAMPS.find((stamp) => stamp.kind === kind)?.label ?? kind
}

export function CrazyPapers({ active, seed, restartToken, session }: GameComponentProps) {
  const randomRef = useRef(mulberry32(seed || 1))
  const idRef = useRef(1)
  const finishedRef = useRef(false)
  const [queue, setQueue] = useState<WorkDocument[]>([])
  const [processed, setProcessed] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [scoldTicks, setScoldTicks] = useState(0)
  const [bossLine, setBossLine] = useState(BOSS_LINES[0])
  const [lastCorrect, setLastCorrect] = useState<StampKind | null>(null)
  const [isOver, setIsOver] = useState(false)

  const makeDocument = useCallback((progress: number): WorkDocument => {
    const pool = poolFor(progress)
    const template = pool[Math.floor(randomRef.current() * pool.length)]
    return { ...template, instanceId: idRef.current++ }
  }, [])

  const reset = useCallback(() => {
    randomRef.current = mulberry32((seed || 1) + restartToken * 9973)
    idRef.current = 1
    finishedRef.current = false
    setProcessed(0)
    setMistakes(0)
    setStreak(0)
    setScoldTicks(0)
    setBossLine(BOSS_LINES[0])
    setLastCorrect(null)
    setIsOver(false)
    const initial = Array.from({ length: 3 }, () => makeDocument(0))
    setQueue(initial)
  }, [makeDocument, restartToken, seed])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    session.setScore(processed)
  }, [processed, session])

  useEffect(() => {
    if (!active || isOver) return
    const delay = queue.length === 0
      ? 180
      : Math.max(850, 3000 - processed * 82)

    const timeout = window.setTimeout(() => {
      setQueue((current) => [...current, makeDocument(processed)])
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [active, isOver, makeDocument, processed, queue.length])

  useEffect(() => {
    if (!active || scoldTicks <= 0) return
    const timeout = window.setTimeout(() => {
      setScoldTicks((ticks) => Math.max(0, ticks - 1))
    }, 260)
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
        bestStreak: streak,
        phase: phaseFor(processed),
      },
    })
  }, [mistakes, processed, queue.length, session, streak])

  const activeDocument = queue[0]
  const phase = phaseFor(processed)
  const workload = Math.min(100, (queue.length / MAX_BACKLOG) * 100)

  const handleStamp = useCallback((kind: StampKind) => {
    if (!active || isOver || scoldTicks > 0) return
    const document = queue[0]
    if (!document) return

    if (kind === document.stamp) {
      setQueue((current) => current.slice(1))
      setProcessed((value) => value + 1)
      setStreak((value) => value + 1)
      setLastCorrect(kind)
      window.setTimeout(() => setLastCorrect(null), 140)
      return
    }

    const returnedDocument: WorkDocument = {
      ...document,
      returned: true,
      instanceId: idRef.current++,
    }
    const correctionDocument: WorkDocument = {
      ...document,
      title: `COPIE RECTIFICATIVE — ${document.title}`,
      department: 'Bureau du supérieur',
      returned: true,
      correction: true,
      instanceId: idRef.current++,
    }

    setQueue((current) => [...current.slice(1), returnedDocument, correctionDocument])
    setMistakes((value) => value + 1)
    setStreak(0)
    setBossLine(BOSS_LINES[Math.floor(randomRef.current() * BOSS_LINES.length)])
    setScoldTicks(6)
  }, [active, isOver, queue, scoldTicks])

  useEffect(() => {
    if (!active || isOver) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === '1') handleStamp('approve')
      if (event.key === '2') handleStamp('reject')
      if (event.key === '3') handleStamp('archive')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, handleStamp, isOver])

  const stack = useMemo(() => queue.slice(1, 5), [queue])

  return (
    <div className="crazy-papers-game">
      <div className="crazy-papers-wall" aria-hidden="true" />
      <div className="mf-game-layout crazy-papers-layout">
        <header className="mf-game-hud crazy-papers-hud">
          <div className="crazy-papers-status">
            <span>GUICHET 13</span>
            <strong>{phaseLabel(processed)}</strong>
          </div>
          <div className="crazy-papers-workload" aria-label={`Pile de travail ${queue.length} sur ${MAX_BACKLOG}`}>
            <div className="crazy-papers-workload-row">
              <span>PILE</span>
              <b>{queue.length}/{MAX_BACKLOG}</b>
            </div>
            <div className="crazy-papers-workload-track">
              <i style={{ width: `${workload}%` }} />
            </div>
          </div>
        </header>

        <main className="mf-game-stage crazy-papers-stage">
          <div className="crazy-papers-desk">
            <div className="crazy-papers-inbox-label">À TRAITER</div>
            <div className="crazy-papers-paper-stack" aria-live="polite">
              {stack.map((document, index) => (
                <div
                  className="crazy-papers-paper crazy-papers-paper-back"
                  key={document.instanceId}
                  style={{ '--stack-index': index + 1 } as CSSProperties}
                  aria-hidden="true"
                />
              ))}

              {activeDocument ? (
                <article className={`crazy-papers-paper crazy-papers-paper-active tier-${phase}`}>
                  <div className="crazy-papers-paper-topline">
                    <span>RÉPUBLIQUE ADMINISTRATIVE</span>
                    <b>N° {String(activeDocument.instanceId).padStart(5, '0')}</b>
                  </div>
                  <div className="crazy-papers-seal" aria-hidden="true">◆</div>
                  <p className="crazy-papers-department">{activeDocument.department}</p>
                  <h2>{activeDocument.title}</h2>
                  {activeDocument.code && <p className="crazy-papers-code">RÉF. {activeDocument.code}</p>}

                  {phase === 'training' && !activeDocument.returned && (
                    <div className={`crazy-papers-training-hint stamp-${activeDocument.stamp}`}>
                      DESTINATION : {stampLabel(activeDocument.stamp)}
                    </div>
                  )}

                  <div className="crazy-papers-form-lines" aria-hidden="true">
                    <i /><i /><i /><i />
                  </div>
                  <div className="crazy-papers-signature">X ________________</div>

                  {activeDocument.returned && (
                    <div className="crazy-papers-return-stamp">
                      <strong>MAUVAIS TAMPON</strong>
                      <span>{activeDocument.correction ? 'COPIE EXIGÉE' : 'À REVOIR'}</span>
                    </div>
                  )}
                </article>
              ) : (
                <div className="crazy-papers-empty">PROCHAINE LIASSE…</div>
              )}
            </div>
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
            {STAMPS.map((stamp, index) => (
              <button
                key={stamp.kind}
                type="button"
                className={`crazy-papers-stamp stamp-${stamp.kind} ${lastCorrect === stamp.kind ? 'is-hit' : ''}`}
                onClick={() => handleStamp(stamp.kind)}
                disabled={!activeDocument || scoldTicks > 0 || isOver}
                aria-label={`Tampon ${stamp.label}. Touche ${index + 1}`}
              >
                <span className="crazy-papers-stamp-handle" aria-hidden="true" />
                <strong>{stamp.label}</strong>
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
