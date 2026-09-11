import Phaser from 'phaser'
import type { GameSessionApi } from '../../core/types'
import { DEFAULT_LOGICAL_VIEWPORTS } from '../../core/runtime/gameRuntimePolicy'

export const CRAZY_PAPERS_SCENE_KEY = 'crazy-papers-main'

const { width: STAGE_WIDTH, height: STAGE_HEIGHT } = DEFAULT_LOGICAL_VIEWPORTS.portrait
const MAX_BACKLOG = 24
const CENTER_TOP = 91
const CENTER_BOTTOM = 753
const CENTER_HEIGHT = CENTER_BOTTOM - CENTER_TOP
const PRESSURE_WAVE_START = 0.55

const DESK_X = 8
const DESK_Y = 128
const DESK_WIDTH = 374
const DESK_HEIGHT = 616
const DOC_X = 45
const DOC_Y = 198
const DOC_WIDTH = 300
const DOC_HEIGHT = 318

const COLORS = {
  wall: 0x504b3d,
  wallDark: 0x302d25,
  desk: 0x706145,
  deskDark: 0x4c402d,
  paper: 0xded2ae,
  ink: 0x1d1a14,
  inkSoft: 0x4b4333,
  red: 0xa62f27,
  accounting: 0xd4dcc1,
  civil: 0xdfcabb,
  planning: 0xbed0d5,
  hr: 0xdad39e,
  legal: 0xcbc4d0,
} as const

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

type SectorDefinition = {
  kind: Sector
  label: string
  short: string
  color: number
}

export type CrazyPapersSceneBridge = {
  seed: number
  session: GameSessionApi
}

const SECTORS: SectorDefinition[] = [
  { kind: 'accounting', label: 'COMPTABILITÉ', short: 'COMPTA', color: 0x546f4c },
  { kind: 'civil', label: 'ÉTAT CIVIL', short: 'CIVIL', color: 0x9a554a },
  { kind: 'planning', label: 'URBANISME', short: 'URBA', color: 0x4d6f78 },
  { kind: 'hr', label: 'RESSOURCES HUMAINES', short: 'RH', color: 0x7b6d2b },
  { kind: 'legal', label: 'AFFAIRES JURIDIQUES', short: 'JURID.', color: 0x685a78 },
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

const CUE_KEYS: CueKey[] = ['title', 'color', 'layout', 'content', 'mark']

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

function cueCountForLevel(level: number) {
  if (level <= 1) return 5
  if (level <= 3) return 4
  if (level <= 5) return 3
  if (level <= 7) return 2
  return 1
}

function gradeFor(level: number) {
  return GRADES[level - 1] ?? `HAUT FONCTIONNAIRE — CLASSE ${level - GRADES.length}`
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
  const visible = new Set(shuffled.slice(0, Phaser.Math.Clamp(count, 1, 5)))
  return {
    title: visible.has('title'),
    color: visible.has('color'),
    layout: visible.has('layout'),
    content: visible.has('content'),
    mark: visible.has('mark'),
  }
}

function sectorLabel(sector: Sector) {
  return SECTORS.find((candidate) => candidate.kind === sector)?.label ?? sector
}

function documentColor(document: WorkDocument) {
  if (!document.cues.color) return COLORS.paper
  if (document.sector === 'accounting') return COLORS.accounting
  if (document.sector === 'civil') return COLORS.civil
  if (document.sector === 'planning') return COLORS.planning
  if (document.sector === 'hr') return COLORS.hr
  return COLORS.legal
}

export class CrazyPapersScene extends Phaser.Scene {
  private readonly bridge: CrazyPapersSceneBridge
  private random = mulberry32(1)
  private idCounter = 1
  private queue: WorkDocument[] = []
  private processed = 0
  private mistakes = 0
  private streak = 0
  private level = 1
  private remainingToArrive = 0
  private surpriseCooldown = 3
  private busy = false
  private promoting = false
  private finished = false
  private arrivalTimer: Phaser.Time.TimerEvent | null = null
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null
  private transientTimers: Phaser.Time.TimerEvent[] = []
  private pileGraphics!: Phaser.GameObjects.Graphics
  private overflowLayer!: Phaser.GameObjects.Container
  private floodCurtain!: Phaser.GameObjects.Container
  private documentContainer!: Phaser.GameObjects.Container
  private documentPlaceholder!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private gradeText!: Phaser.GameObjects.Text
  private pressureText!: Phaser.GameObjects.Text
  private metaText!: Phaser.GameObjects.Text
  private surprisePanel!: Phaser.GameObjects.Container
  private surpriseLabel!: Phaser.GameObjects.Text
  private bossPanel!: Phaser.GameObjects.Container
  private bossLabel!: Phaser.GameObjects.Text
  private promotionPanel!: Phaser.GameObjects.Container
  private promotionLabel!: Phaser.GameObjects.Text
  private stampButtons: Array<{ sector: SectorDefinition; container: Phaser.GameObjects.Container }> = []

  constructor(bridge: CrazyPapersSceneBridge) {
    super(CRAZY_PAPERS_SCENE_KEY)
    this.bridge = bridge
  }

  create() {
    this.resetRun()
    this.createBackground()
    this.createHud()
    this.createPiles()
    this.createDocumentLayer()
    this.createStampControls()
    this.createPressureCurtain()
    this.createTransientPanels()
    this.bindInput()
    this.loadLevel(1)
    this.bridge.session.setScore(0)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup())
  }

  private resetRun() {
    this.random = mulberry32(this.bridge.seed || 1)
    this.idCounter = 1
    this.queue = []
    this.processed = 0
    this.mistakes = 0
    this.streak = 0
    this.level = 1
    this.remainingToArrive = 0
    this.surpriseCooldown = 3
    this.busy = false
    this.promoting = false
    this.finished = false
    this.arrivalTimer = null
    this.transientTimers = []
    this.stampButtons = []
  }

  private createBackground() {
    this.add.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, STAGE_WIDTH, STAGE_HEIGHT, COLORS.wall)
    const wall = this.add.graphics().setDepth(1)
    wall.fillStyle(COLORS.wallDark, 0.32)
    for (let y = 0; y < STAGE_HEIGHT; y += 18) wall.fillRect(0, y, STAGE_WIDTH, 2)
    wall.fillStyle(0xeee4c9, 0.035)
    for (let x = 14; x < STAGE_WIDTH; x += 43) wall.fillRect(x, 0, 2, STAGE_HEIGHT)

    const desk = this.add.graphics().setDepth(2)
    desk.fillStyle(COLORS.desk, 1)
    desk.lineStyle(3, COLORS.ink, 1)
    desk.fillRect(DESK_X, DESK_Y, DESK_WIDTH, DESK_HEIGHT)
    desk.strokeRect(DESK_X, DESK_Y, DESK_WIDTH, DESK_HEIGHT)
    desk.lineStyle(2, COLORS.deskDark, 0.55)
    for (let x = 28; x < STAGE_WIDTH - 20; x += 52) desk.lineBetween(x, DESK_Y + 2, x + 9, DESK_Y + DESK_HEIGHT - 2)
  }

  private createHud() {
    this.levelText = this.add.text(18, 99, '', { fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#bdb497', fontStyle: 'bold' }).setDepth(12)
    this.gradeText = this.add.text(18, 113, '', { fontFamily: 'Courier New, monospace', fontSize: '16px', color: '#eee4c9', fontStyle: 'bold' }).setDepth(12)
    this.pressureText = this.add.text(372, 102, '', { fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#eee4c9', fontStyle: 'bold', align: 'right' }).setOrigin(1, 0).setDepth(12)
    this.metaText = this.add.text(195, 604, '', { fontFamily: 'Courier New, monospace', fontSize: '11px', color: '#eee4c9', fontStyle: 'bold', backgroundColor: '#302d25', padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(56)
  }

  private createPiles() {
    this.pileGraphics = this.add.graphics().setDepth(15)
    this.overflowLayer = this.add.container(0, 0).setDepth(54)
  }

  private createDocumentLayer() {
    this.documentContainer = this.add.container(DOC_X, DOC_Y).setDepth(50)
    this.documentPlaceholder = this.add.text(STAGE_WIDTH / 2, 356, '', { fontFamily: 'Courier New, monospace', fontSize: '16px', color: '#eee4c9', fontStyle: 'bold', backgroundColor: '#302d25', padding: { x: 10, y: 7 } }).setOrigin(0.5).setDepth(49).setVisible(false)
  }

  private createStampControls() {
    const layout = [
      { x: 22, y: 626, w: 106, h: 48 },
      { x: 142, y: 626, w: 106, h: 48 },
      { x: 262, y: 626, w: 106, h: 48 },
      { x: 48, y: 688, w: 136, h: 48 },
      { x: 206, y: 688, w: 136, h: 48 },
    ]
    SECTORS.forEach((sector, index) => {
      const slot = layout[index]
      const container = this.add.container(slot.x, slot.y).setDepth(61)
      const handle = this.add.rectangle(slot.w / 2, -6, Math.min(42, slot.w * 0.38), 14, 0x332b21).setStrokeStyle(2, COLORS.ink)
      const base = this.add.rectangle(slot.w / 2, slot.h / 2, slot.w, slot.h, sector.color).setStrokeStyle(3, COLORS.ink)
      const label = this.add.text(slot.w / 2, slot.h / 2 - 1, sector.short, { fontFamily: 'Courier New, monospace', fontSize: index < 3 ? '14px' : '15px', color: '#f2e7c8', fontStyle: 'bold' }).setOrigin(0.5)
      const key = this.add.text(slot.w - 8, slot.h - 6, String(index + 1), { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#1d1a14', fontStyle: 'bold' }).setOrigin(1)
      const hit = this.add.rectangle(slot.w / 2, slot.h / 2, slot.w, slot.h, 0xffffff, 0.001).setInteractive({ useHandCursor: true })
      hit.on('pointerdown', () => this.attemptStamp(sector.kind))
      container.add([handle, base, label, key, hit])
      this.stampButtons.push({ sector, container })
    })
  }

  private createPressureCurtain() {
    this.floodCurtain = this.add.container(0, CENTER_TOP - CENTER_HEIGHT).setDepth(80).setVisible(false)
    const sheet = this.add.graphics()
    sheet.fillStyle(0xd9cba5, 0.985)
    sheet.fillRect(0, 0, STAGE_WIDTH, CENTER_HEIGHT)
    sheet.fillStyle(0xb8a77e, 0.42)
    for (let y = 28; y < CENTER_HEIGHT; y += 33) sheet.fillRect(18, y, STAGE_WIDTH - 36, 2)
    sheet.fillStyle(0x6f6048, 0.14)
    for (let x = 24; x < STAGE_WIDTH; x += 72) sheet.fillRect(x, 0, 2, CENTER_HEIGHT)
    this.floodCurtain.add(sheet)
    for (let index = 0; index < 18; index += 1) {
      const x = 18 + ((index * 83) % 338)
      const y = 24 + ((index * 97) % 590)
      const paper = this.add.rectangle(x, y, 54, 72, index % 4 === 0 ? 0xcad3c1 : 0xeadfbd).setStrokeStyle(2, COLORS.inkSoft, 0.48).setAngle(((index % 5) - 2) * 4)
      const line = this.add.rectangle(x, y - 6, 36, 2, COLORS.inkSoft, 0.35).setAngle(paper.angle)
      this.floodCurtain.add([paper, line])
    }
  }

  private createTransientPanels() {
    this.surprisePanel = this.makePanel(62, 153, 266, 52, 0xb7a46e, 95)
    this.surpriseLabel = this.add.text(195, 179, '', { fontFamily: 'Courier New, monospace', fontSize: '14px', color: '#1d1a14', fontStyle: 'bold', align: 'center', wordWrap: { width: 246 } }).setOrigin(0.5).setDepth(96).setVisible(false)
    this.surprisePanel.setVisible(false)
    this.bossPanel = this.makePanel(30, 255, 330, 102, 0x2b2620, 110)
    this.bossLabel = this.add.text(195, 306, '', { fontFamily: 'Courier New, monospace', fontSize: '14px', color: '#f1ddbc', fontStyle: 'bold', align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5).setDepth(111).setVisible(false)
    this.bossPanel.setVisible(false)
    this.promotionPanel = this.makePanel(36, 270, 318, 118, 0xb7a46e, 115)
    this.promotionLabel = this.add.text(195, 329, '', { fontFamily: 'Courier New, monospace', fontSize: '15px', color: '#1d1a14', fontStyle: 'bold', align: 'center', wordWrap: { width: 286 } }).setOrigin(0.5).setDepth(116).setVisible(false)
    this.promotionPanel.setVisible(false)
  }

  private makePanel(x: number, y: number, width: number, height: number, color: number, depth: number) {
    const container = this.add.container(0, 0).setDepth(depth)
    container.add(this.add.rectangle(x + width / 2, y + height / 2, width, height, color).setStrokeStyle(3, COLORS.ink))
    return container
  }

  private bindInput() {
    this.keyboardHandler = (event: KeyboardEvent) => {
      if (event.repeat) return
      const index = Number(event.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < SECTORS.length) this.attemptStamp(SECTORS[index].kind)
    }
    this.input.keyboard?.on('keydown', this.keyboardHandler)
  }

  private cleanup() {
    if (this.keyboardHandler) this.input.keyboard?.off('keydown', this.keyboardHandler)
    this.keyboardHandler = null
    this.arrivalTimer?.remove(false)
    this.arrivalTimer = null
    this.transientTimers.forEach((timer) => timer.remove(false))
    this.transientTimers = []
  }

  private buildDocument(model: DocumentModel, urgent = false): WorkDocument {
    return { ...model, instanceId: this.idCounter++, cues: makeCueSet(cueCountForLevel(this.level), this.random), urgent }
  }

  private makeDocument(urgent = false) {
    const available = DOCUMENT_MODELS.filter((model) => model.unlock <= Math.min(4, this.level))
    return this.buildDocument(available[Math.floor(this.random() * available.length)], urgent)
  }

  private loadLevel(level: number) {
    this.arrivalTimer?.remove(false)
    this.arrivalTimer = null
    this.level = level
    this.queue = []
    this.remainingToArrive = levelBatch(level)
    this.busy = false
    this.promoting = false
    this.surpriseCooldown = Math.max(2, 4 - Math.floor(level / 3))
    this.hideBoss()
    this.hidePromotion()
    this.hideSurprise()
    const initial = initialPileSize(level)
    for (let index = 0; index < initial; index += 1) {
      this.queue.push(this.makeDocument())
      this.remainingToArrive -= 1
    }
    this.renderAll(true)
    this.scheduleArrival()
  }

  private scheduleArrival(delayOverride?: number) {
    if (this.finished || this.promoting || this.remainingToArrive <= 0) return
    this.arrivalTimer?.remove(false)
    const delay = delayOverride ?? (this.queue.length <= 1 ? 90 : arrivalDelay(this.level))
    this.arrivalTimer = this.time.delayedCall(delay, () => {
      this.arrivalTimer = null
      if (this.finished || this.promoting || this.remainingToArrive <= 0) return
      this.queue.push(this.makeDocument())
      this.remainingToArrive -= 1
      this.renderAll(this.queue.length === 1)
      if (!this.checkSubmersion()) this.scheduleArrival()
    })
  }

  private renderAll(animateDocument = false) {
    const cues = cueCountForLevel(this.level)
    this.levelText.setText(`NIVEAU ${this.level} · ${cues} INDICE${cues > 1 ? 'S' : ''}`)
    this.gradeText.setText(gradeFor(this.level))
    this.metaText.setText(`ERREURS ${this.mistakes} · SÉRIE ${this.streak} · PILE ${this.queue.length}`)
    this.renderPiles()
    this.renderOverflow()
    this.renderPressure()
    this.renderDocument(animateDocument)
    this.updateControls()
  }

  private renderPiles() {
    this.pileGraphics.clear()
    const backlog = Math.max(0, this.queue.length - 1)
    const counts = [0, 0, 0]
    for (let index = 0; index < backlog; index += 1) counts[index % 3] += 1
    const xs = [38, 148, 258]
    counts.forEach((count, pileIndex) => {
      const visible = Math.min(13, count)
      for (let index = 0; index < visible; index += 1) {
        const y = 185 - index * 5
        const color = [COLORS.accounting, COLORS.civil, COLORS.planning, COLORS.hr, COLORS.legal][index % 5]
        this.pileGraphics.fillStyle(color, 1)
        this.pileGraphics.lineStyle(2, COLORS.inkSoft, 0.8)
        this.pileGraphics.fillRect(xs[pileIndex], y, 94, 24)
        this.pileGraphics.strokeRect(xs[pileIndex], y, 94, 24)
      }
      this.pileGraphics.fillStyle(0x40382b, 1)
      this.pileGraphics.fillRect(xs[pileIndex] - 3, 188, 100, 12)
    })
  }

  private renderOverflow() {
    this.overflowLayer.removeAll(true)
    const visible = Math.min(14, Math.max(0, this.queue.length - 8))
    for (let index = 0; index < visible; index += 1) {
      const leftSide = index % 2 === 0
      const x = leftSide ? 18 + (index % 4) * 13 : 320 + (index % 4) * 12
      const y = 205 + ((index * 47) % 330)
      const paper = this.add.rectangle(x, y, 62, 78, index % 5 === 0 ? COLORS.hr : COLORS.paper, 0.97).setStrokeStyle(2, COLORS.inkSoft, 0.55).setAngle((leftSide ? -1 : 1) * (7 + (index % 3) * 5))
      const line = this.add.rectangle(x, y - 7, 40, 2, COLORS.inkSoft, 0.32).setAngle(paper.angle)
      this.overflowLayer.add([paper, line])
    }
  }

  private renderPressure() {
    const pressure = Phaser.Math.Clamp(this.queue.length / MAX_BACKLOG, 0, 1)
    this.pressureText.setText(`PRESSION ${Math.round(pressure * 100)}%`)
    if (pressure < 0.5) this.pressureText.setColor('#eee4c9')
    else if (pressure < 0.75) this.pressureText.setColor('#e2b56c')
    else this.pressureText.setColor('#e26b5d')
    const wave = Phaser.Math.Clamp((pressure - PRESSURE_WAVE_START) / (1 - PRESSURE_WAVE_START), 0, 1)
    if (wave <= 0) {
      this.floodCurtain.setVisible(false)
      return
    }
    this.floodCurtain.setVisible(true)
    this.floodCurtain.y = CENTER_TOP - CENTER_HEIGHT + wave * CENTER_HEIGHT
  }

  private renderDocument(animate = false) {
    this.documentContainer.removeAll(true)
    const document = this.queue[0]
    if (!document) {
      this.documentPlaceholder.setText(this.remainingToArrive > 0 ? 'LE COURRIER ARRIVE…' : 'BUREAU VIDE.').setVisible(true)
      return
    }
    this.documentPlaceholder.setVisible(false)
    const graphics = this.add.graphics()
    graphics.fillStyle(documentColor(document), 1)
    graphics.lineStyle(3, COLORS.ink, 1)
    graphics.fillRect(0, 0, DOC_WIDTH, DOC_HEIGHT)
    graphics.strokeRect(0, 0, DOC_WIDTH, DOC_HEIGHT)
    graphics.lineStyle(2, COLORS.inkSoft, 0.48)
    graphics.lineBetween(12, 34, DOC_WIDTH - 12, 34)
    if (document.cues.layout) {
      if (document.form === 'ledger') {
        for (let y = 116; y <= 224; y += 27) graphics.lineBetween(20, y, DOC_WIDTH - 20, y)
        graphics.lineBetween(188, 92, 188, 236)
        graphics.lineBetween(238, 92, 238, 236)
      } else if (document.form === 'certificate') {
        graphics.lineStyle(5, 0x7a554d, 0.42)
        graphics.strokeRect(14, 78, DOC_WIDTH - 28, 166)
      } else if (document.form === 'plan') {
        graphics.lineStyle(1, 0x45636b, 0.25)
        for (let x = 20; x < DOC_WIDTH - 10; x += 18) graphics.lineBetween(x, 82, x, 244)
        for (let y = 82; y < 244; y += 18) graphics.lineBetween(20, y, DOC_WIDTH - 20, y)
      } else if (document.form === 'personnel') {
        graphics.lineStyle(2, 0x6e6326, 0.5)
        graphics.strokeRect(20, 88, 72, 76)
        graphics.strokeRect(104, 88, 168, 76)
      } else {
        graphics.lineStyle(2, 0x65566f, 0.48)
        graphics.strokeRect(18, 82, DOC_WIDTH - 36, 162)
        graphics.lineBetween(28, 110, DOC_WIDTH - 28, 110)
      }
    }
    this.documentContainer.add(graphics)
    this.documentContainer.add(this.add.text(12, 11, 'RÉPUBLIQUE ADMINISTRATIVE', { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#3b3428', fontStyle: 'bold' }))
    this.documentContainer.add(this.add.text(DOC_WIDTH - 12, 11, `N° ${String(document.instanceId).padStart(5, '0')}`, { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#3b3428', fontStyle: 'bold' }).setOrigin(1, 0))
    if (document.urgent) this.documentContainer.add(this.add.text(14, 43, 'URGENT', { fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#f3e5c9', fontStyle: 'bold', backgroundColor: '#a62f27', padding: { x: 6, y: 3 } }))
    if (document.cues.mark) this.documentContainer.add(this.add.text(DOC_WIDTH - 24, 49, document.mark, { fontFamily: 'Courier New, monospace', fontSize: '21px', color: '#514638', fontStyle: 'bold' }).setOrigin(0.5))
    const title = document.cues.title ? document.title : `FORMULAIRE N° ${String(document.instanceId).padStart(5, '0')}`
    this.documentContainer.add(this.add.text(18, 54, title, { fontFamily: 'Courier New, monospace', fontSize: '18px', color: '#1d1a14', fontStyle: 'bold', wordWrap: { width: 238 } }))
    const fields = document.cues.content ? document.fields : GENERIC_LINES
    fields.forEach((field, index) => this.documentContainer.add(this.add.text(27, 124 + index * 31, field, { fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#3f382c', fontStyle: 'bold', wordWrap: { width: 245 } })))
    this.documentContainer.add(this.add.text(24, 286, 'SIGNATURE __________________', { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#4b4333', fontStyle: 'bold' }))
    if (document.returnedFrom) {
      this.documentContainer.add(this.add.text(DOC_WIDTH / 2, 247, `MAUVAIS SERVICE\nRETOUR DE ${sectorLabel(document.returnedFrom)}`, { fontFamily: 'Courier New, monospace', fontSize: '13px', color: '#a62f27', fontStyle: 'bold', align: 'center', backgroundColor: '#ded2ae', padding: { x: 7, y: 4 } }).setOrigin(0.5).setAngle(-7))
    }
    this.documentContainer.x = DOC_X
    this.documentContainer.y = animate ? DOC_Y - 40 : DOC_Y
    this.documentContainer.alpha = animate ? 0.25 : 1
    if (animate) this.tweens.add({ targets: this.documentContainer, y: DOC_Y, alpha: 1, duration: 140, ease: 'Linear' })
  }

  private updateControls() {
    const enabled = this.canStamp()
    this.stampButtons.forEach(({ container }) => container.setAlpha(enabled ? 1 : 0.48))
  }

  private canStamp() {
    return !this.finished && !this.promoting && !this.busy && Boolean(this.queue[0])
  }

  private attemptStamp(sector: Sector) {
    if (!this.canStamp()) return
    const document = this.queue[0]
    if (!document) return
    this.busy = true
    this.updateControls()
    this.queue.shift()
    this.renderPiles()
    this.renderOverflow()
    this.renderPressure()
    this.tweens.add({ targets: this.documentContainer, x: STAGE_WIDTH + 28, alpha: 0.55, duration: 150, ease: 'Linear', onComplete: () => {
      if (this.finished) return
      if (sector === document.sector) this.resolveCorrect(document)
      else this.resolveWrong(document, sector)
    } })
  }

  private resolveCorrect(document: WorkDocument) {
    this.processed += 1
    this.streak += 1
    this.bridge.session.setScore(this.processed)
    this.maybeTriggerSurprise(document)
    this.busy = false
    this.renderAll(true)
    if (!this.checkSubmersion()) {
      if (this.queue.length === 0 && this.remainingToArrive > 0) this.scheduleArrival(90)
      this.maybePromote()
    }
  }

  private resolveWrong(document: WorkDocument, selectedSector: Sector) {
    this.mistakes += 1
    this.streak = 0
    this.showBoss(`NON ! ${sectorLabel(selectedSector)} ≠ ${sectorLabel(document.sector)}.`)
    this.delay(140, () => {
      if (this.finished) return
      this.queue.push(this.makeDocument())
      this.renderPiles()
      this.renderOverflow()
      this.renderPressure()
      this.checkSubmersion()
    })
    const returnedDocument: WorkDocument = { ...document, returnedFrom: selectedSector, urgent: false }
    this.delay(360, () => {
      if (this.finished) return
      this.queue.unshift(returnedDocument)
      this.renderAll(false)
      this.documentContainer.x = -DOC_WIDTH - 12
      this.documentContainer.alpha = 1
      this.tweens.add({ targets: this.documentContainer, x: DOC_X, duration: 180, ease: 'Linear', onComplete: () => {
        this.busy = false
        this.hideBoss()
        this.updateControls()
        this.checkSubmersion()
      } })
    })
  }

  private maybeTriggerSurprise(document: WorkDocument) {
    if (this.level < 2) return
    if (this.surpriseCooldown > 0) {
      this.surpriseCooldown -= 1
      return
    }
    if (this.random() > Math.min(0.3, 0.12 + this.level * 0.025)) return
    const event = Math.floor(this.random() * 3)
    this.surpriseCooldown = 4 + Math.floor(this.random() * 3)
    if (event === 0) {
      this.queue.push(this.makeDocument(), this.makeDocument(), this.makeDocument())
      this.showSurprise('LIASSE DU COURRIER · +3')
    } else if (event === 1) {
      this.queue.unshift(this.makeDocument(true))
      this.showSurprise('DOSSIER URGENT')
    } else {
      const model = DOCUMENT_MODELS.find((candidate) => candidate.key === document.key)
      if (!model) return
      this.queue.push(this.buildDocument(model), this.buildDocument(model))
      this.showSurprise('PHOTOCOPIEUSE FOLLE · ×2')
    }
  }

  private maybePromote() {
    if (this.finished || this.promoting || this.busy || this.remainingToArrive > 0 || this.queue.length > 0) return
    this.promoting = true
    this.updateControls()
    this.showPromotion(`PILE ÉPUISÉE — PROMOTION\n${gradeFor(this.level + 1)}\nNIVEAU ${this.level + 1}`)
    this.delay(820, () => { if (!this.finished) this.loadLevel(this.level + 1) })
  }

  private checkSubmersion() {
    if (this.finished || this.queue.length < MAX_BACKLOG) return false
    this.finished = true
    this.busy = true
    this.promoting = false
    this.arrivalTimer?.remove(false)
    this.arrivalTimer = null
    this.updateControls()
    this.renderPiles()
    this.renderOverflow()
    this.renderPressure()
    this.floodCurtain.setVisible(true)
    this.tweens.add({ targets: this.floodCurtain, y: CENTER_TOP, duration: 520, ease: 'Cubic.In', onComplete: () => {
      this.bridge.session.finish({ score: this.processed, metadata: { mistakes: this.mistakes, streak: this.streak, level: this.level, grade: gradeFor(this.level), backlog: this.queue.length, pressureSystem: 'hybrid-paper-submersion' } })
    } })
    return true
  }

  private showSurprise(label: string) {
    this.surpriseLabel.setText(label).setVisible(true)
    this.surprisePanel.setVisible(true)
    this.delay(760, () => this.hideSurprise())
  }

  private hideSurprise() {
    if (!this.surprisePanel || !this.surpriseLabel) return
    this.surprisePanel.setVisible(false)
    this.surpriseLabel.setVisible(false)
  }

  private showBoss(label: string) {
    this.bossLabel.setText(label).setVisible(true)
    this.bossPanel.setVisible(true)
  }

  private hideBoss() {
    if (!this.bossPanel || !this.bossLabel) return
    this.bossPanel.setVisible(false)
    this.bossLabel.setVisible(false)
  }

  private showPromotion(label: string) {
    this.promotionLabel.setText(label).setVisible(true)
    this.promotionPanel.setVisible(true)
  }

  private hidePromotion() {
    if (!this.promotionPanel || !this.promotionLabel) return
    this.promotionPanel.setVisible(false)
    this.promotionLabel.setVisible(false)
  }

  private delay(ms: number, callback: () => void) {
    const timer = this.time.delayedCall(ms, () => {
      this.transientTimers = this.transientTimers.filter((candidate) => candidate !== timer)
      callback()
    })
    this.transientTimers.push(timer)
  }
}
