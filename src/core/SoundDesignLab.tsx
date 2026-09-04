import { useMemo, useState } from 'react'
import { gameSfxPalettes, sfxCatalog, type SfxDefinition } from '../audio/sfxCatalog'
import { playGameSfx, previewSfxById } from '../audio/sfxEngine'
import {
  isDefaultSfxTuning,
  makeSfxConfigBlock,
  normalizeSfxTuning,
  readSfxLabTuning,
  tuningSummary,
  writeSfxLabTuning,
  type SfxLabTuning,
} from './sfxLabTuning'
import './soundDesignLab.css'

const TETRA = gameSfxPalettes.tetramindfck

type TuningMap = Record<string, SfxLabTuning>

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function previewOptions(tuning: SfxLabTuning) {
  const normalized = normalizeSfxTuning(tuning)
  return {
    transform: {
      gain: normalized.volumePercent / 100,
      duration: normalized.durationPercent / 100,
      transposeSemitones: normalized.transposeSemitones,
    },
    brightness: normalized.brightness,
    ignoreCooldown: true,
  }
}

function SoundCard({
  sound,
  tuning,
  settingsOpen,
  copied,
  onToggleSettings,
  onChange,
  onReset,
  onCopy,
}: {
  sound: SfxDefinition
  tuning: SfxLabTuning
  settingsOpen: boolean
  copied: boolean
  onToggleSettings(): void
  onChange(patch: Partial<SfxLabTuning>): void
  onReset(): void
  onCopy(): void
}) {
  const tetraUsesSound = Object.values(TETRA.events).includes(sound.key)
  const normalized = normalizeSfxTuning(tuning)
  const modified = !isDefaultSfxTuning(normalized)

  return (
    <article className="mf-sfx-card" data-scope={sound.scope} data-modified={modified ? 'true' : 'false'}>
      <div className="mf-sfx-card__main">
        <div className="mf-sfx-card__id">
          <b>{sound.id}</b>
          <span>{sound.scope === 'common' ? 'COMMUN' : sound.gameTitle}</span>
        </div>
        <div className="mf-sfx-card__copy">
          <small>{sound.event.toUpperCase()}</small>
          <h3>{sound.name}</h3>
          <p>{sound.summary}</p>
          {modified ? <em>{tuningSummary(normalized)}</em> : null}
        </div>
        <div className="mf-sfx-card__actions">
          <button type="button" onClick={() => void previewSfxById(sound.id, previewOptions(normalized))}>▶ BASE</button>
          {tetraUsesSound && sound.scope === 'common' ? (
            <button type="button" onClick={() => void playGameSfx('tetramindfck', sound.event, previewOptions(normalized))}>▶ TETRA</button>
          ) : null}
          <button type="button" className="settings" data-active={settingsOpen || modified} onClick={onToggleSettings}>⚙ RÉGLAGES</button>
        </div>
      </div>

      {settingsOpen ? (
        <div className="mf-sfx-card__settings">
          <label><span>VOLUME <b>{normalized.volumePercent}%</b></span><input type="range" min={0} max={200} step={1} value={normalized.volumePercent} onChange={(event) => onChange({ volumePercent: Number(event.target.value) })} /></label>
          <label><span>HAUTEUR <b>{normalized.transposeSemitones > 0 ? '+' : ''}{normalized.transposeSemitones}</b> demi-tons</span><input type="range" min={-12} max={12} step={1} value={normalized.transposeSemitones} onChange={(event) => onChange({ transposeSemitones: Number(event.target.value) })} /></label>
          <label><span>DURÉE <b>{normalized.durationPercent}%</b></span><input type="range" min={40} max={200} step={5} value={normalized.durationPercent} onChange={(event) => onChange({ durationPercent: Number(event.target.value) })} /></label>
          <label><span>BRILLANCE <b>{normalized.brightness > 0 ? '+' : ''}{normalized.brightness}</b></span><input type="range" min={-100} max={100} step={1} value={normalized.brightness} onChange={(event) => onChange({ brightness: Number(event.target.value) })} /></label>
          <div className="mf-sfx-card__settings-actions">
            <button type="button" disabled={!modified} onClick={onReset}>RESET SON</button>
            <button type="button" className="primary" onClick={onCopy}>{copied ? '✓ CONFIG COPIÉE' : '⧉ COPIER CE SON'}</button>
          </div>
          <small>Ces réglages restent dans ce navigateur. Le son de production ne change que lorsque tu me colles la config.</small>
        </div>
      ) : null}
    </article>
  )
}

export function SoundDesignLab() {
  const [tunings, setTunings] = useState<TuningMap>(() => Object.fromEntries(
    sfxCatalog.sounds.map((sound) => [sound.id, readSfxLabTuning(sound.id)]),
  ))
  const [openSoundId, setOpenSoundId] = useState<string | null>(null)
  const [copiedSoundId, setCopiedSoundId] = useState<string | null>(null)
  const [bundleCopied, setBundleCopied] = useState(false)

  const common = sfxCatalog.sounds.filter((sound) => sound.scope === 'common')
  const tetra = sfxCatalog.sounds.filter((sound) => sound.gameId === 'tetramindfck')
  const modifiedSounds = useMemo(() => sfxCatalog.sounds.filter((sound) => !isDefaultSfxTuning(tunings[sound.id])), [tunings])

  const changeTuning = (soundId: string, patch: Partial<SfxLabTuning>) => {
    setTunings((current) => {
      const nextTuning = normalizeSfxTuning({ ...current[soundId], ...patch })
      const next = { ...current, [soundId]: nextTuning }
      writeSfxLabTuning(soundId, nextTuning)
      return next
    })
  }

  const resetTuning = (soundId: string) => {
    const reset = normalizeSfxTuning(null)
    writeSfxLabTuning(soundId, reset)
    setTunings((current) => ({ ...current, [soundId]: reset }))
  }

  const copyOne = async (sound: SfxDefinition) => {
    await copyText(makeSfxConfigBlock({
      soundId: sound.id,
      soundKey: sound.key,
      soundName: sound.name,
      event: sound.event,
      tuning: tunings[sound.id],
    }))
    setCopiedSoundId(sound.id)
    window.setTimeout(() => setCopiedSoundId(null), 1400)
  }

  const copyBundle = async () => {
    const configs = modifiedSounds.map((sound) => ({
      soundId: sound.id,
      key: sound.key,
      name: sound.name,
      event: sound.event,
      ...normalizeSfxTuning(tunings[sound.id]),
    }))
    await copyText([
      'MINIFUGG_SFX_CONFIG_BUNDLE v1',
      JSON.stringify({ sounds: configs }, null, 2),
    ].join('\n'))
    setBundleCopied(true)
    window.setTimeout(() => setBundleCopied(false), 1400)
  }

  const renderCard = (sound: SfxDefinition) => (
    <SoundCard
      sound={sound}
      tuning={tunings[sound.id]}
      settingsOpen={openSoundId === sound.id}
      copied={copiedSoundId === sound.id}
      onToggleSettings={() => setOpenSoundId((current) => current === sound.id ? null : sound.id)}
      onChange={(patch) => changeTuning(sound.id, patch)}
      onReset={() => resetTuning(sound.id)}
      onCopy={() => void copyOne(sound)}
      key={sound.id}
    />
  )

  return (
    <section className="mf-sfx-lab" aria-labelledby="mf-sfx-title">
      <header className="mf-sfx-lab__head">
        <div>
          <small>SOUND DESIGN / VOCABULAIRE MINIFUGG</small>
          <h2 id="mf-sfx-title">SFX LAB</h2>
          <p>Les sons communs forment un langage partagé. Chaque son peut maintenant être réglé localement puis exporté comme une config de travail, sans modifier directement la production.</p>
        </div>
        <div className="mf-sfx-lab__count"><b>{sfxCatalog.sounds.length}</b><span>SONS CONSERVÉS</span></div>
      </header>

      {modifiedSounds.length > 0 ? (
        <div className="mf-sfx-lab__draft">
          <span><b>{modifiedSounds.length}</b> son{modifiedSounds.length > 1 ? 's' : ''} modifié{modifiedSounds.length > 1 ? 's' : ''} localement</span>
          <button type="button" onClick={() => void copyBundle()}>{bundleCopied ? '✓ MODS COPIÉS' : '⧉ COPIER TOUS LES MODS'}</button>
        </div>
      ) : null}

      <div className="mf-sfx-lab__section-title"><strong>VOCABULAIRE COMMUN</strong><span>base + accent Tetra quand disponible</span></div>
      <div className="mf-sfx-lab__grid">{common.map(renderCard)}</div>

      <div className="mf-sfx-lab__section-title"><strong>TETRA MINDFUCK / SPÉCIFIQUE</strong><span>calcul, bonus et gros impacts</span></div>
      <div className="mf-sfx-lab__grid">{tetra.map(renderCard)}</div>

      <footer className="mf-sfx-lab__rule"><strong>RÈGLE SFX</strong><span>{sfxCatalog.rule}</span></footer>
    </section>
  )
}
