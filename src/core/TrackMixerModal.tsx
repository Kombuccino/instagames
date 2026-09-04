import { useEffect, useState } from 'react'
import type { TrackTuning } from './audioLabTuning'
import './trackMixerModal.css'

type MixerProfile = '8bit' | 'electro' | 'generic'
type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'

type Props = {
  label: string
  trackId: string
  wave: Wave
  tuning: TrackTuning
  modified: boolean
  onChange(patch: Partial<TrackTuning>): void
  onReset(): void
  onCommitScheduledTuning(): void
  onClose(): void
}

const PROFILES: Array<{ id: MixerProfile, label: string, description: string }> = [
  { id: '8bit', label: '8-BIT', description: 'Contrôles pensés comme une petite console chiptune : niveau, pitch, bite et gate.' },
  { id: 'electro', label: 'ÉLECTRO', description: 'Lecture plus synthé : niveau, pitch, cutoff et enveloppe.' },
  { id: 'generic', label: 'GÉNÉRIQUE', description: 'Réglages neutres utilisables pour n’importe quel type de piste.' },
]

function labelsFor(profile: MixerProfile) {
  if (profile === '8bit') return { brightness: 'BITE / FILTRE', length: 'GATE / LONGUEUR' }
  if (profile === 'electro') return { brightness: 'CUTOFF / BRILLANCE', length: 'ENVELOPPE / LONGUEUR' }
  return { brightness: 'BRILLANCE / FILTRE', length: 'LONGUEUR DES NOTES' }
}

export function TrackMixerModal({
  label,
  trackId,
  wave,
  tuning,
  modified,
  onChange,
  onReset,
  onCommitScheduledTuning,
  onClose,
}: Props) {
  const [profile, setProfile] = useState<MixerProfile>('8bit')
  const labels = labelsFor(profile)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="mf-track-mixer-backdrop" role="presentation" onPointerDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="mf-track-mixer" role="dialog" aria-modal="true" aria-label={`Table de mixage ${label}`} data-profile={profile}>
        <header className="mf-track-mixer__head">
          <div>
            <small>PISTE / {wave.toUpperCase()}</small>
            <h3>{label}</h3>
            <span>{trackId}{modified ? ' · MODIFIÉE' : ''}</span>
          </div>
          <button type="button" className="mf-track-mixer__close" onClick={onClose} aria-label="Fermer la table de mixage">×</button>
        </header>

        <nav className="mf-track-mixer__profiles" aria-label="Type de table de mixage">
          {PROFILES.map((item) => (
            <button type="button" data-active={profile === item.id} onClick={() => setProfile(item.id)} key={item.id}>{item.label}</button>
          ))}
        </nav>
        <p className="mf-track-mixer__description">{PROFILES.find((item) => item.id === profile)?.description}</p>

        <div className="mf-track-mixer__status">
          <button type="button" data-active={tuning.enabled} onClick={() => onChange({ enabled: !tuning.enabled })}>
            {tuning.enabled ? '● PISTE INCLUSE' : '○ PISTE RETIRÉE'}
          </button>
          <button type="button" disabled={!modified} onClick={() => { onReset(); onCommitScheduledTuning() }}>RESET PISTE</button>
        </div>

        <div className="mf-track-mixer__controls">
          <label>
            <span>VOLUME <b>{tuning.volumePercent}%</b></span>
            <input type="range" min={0} max={180} step={1} value={tuning.volumePercent} onChange={(event) => onChange({ volumePercent: Number(event.target.value) })} />
          </label>

          {wave === 'noise' ? (
            <div className="mf-track-mixer__na"><span>TRANSPOSITION</span><b>— PERCUSSION —</b></div>
          ) : (
            <label>
              <span>TRANSPOSITION <b>{tuning.transposeSemitones > 0 ? '+' : ''}{tuning.transposeSemitones}</b></span>
              <input type="range" min={-12} max={12} step={1} value={tuning.transposeSemitones} onChange={(event) => onChange({ transposeSemitones: Number(event.target.value) })} onPointerUp={onCommitScheduledTuning} onKeyUp={onCommitScheduledTuning} />
            </label>
          )}

          <label>
            <span>{labels.brightness} <b>{tuning.brightness > 0 ? '+' : ''}{tuning.brightness}</b></span>
            <input type="range" min={-100} max={100} step={1} value={tuning.brightness} onChange={(event) => onChange({ brightness: Number(event.target.value) })} />
          </label>

          <label>
            <span>{labels.length} <b>{tuning.noteLengthPercent}%</b></span>
            <input type="range" min={25} max={200} step={5} value={tuning.noteLengthPercent} onChange={(event) => onChange({ noteLengthPercent: Number(event.target.value) })} onPointerUp={onCommitScheduledTuning} onKeyUp={onCommitScheduledTuning} />
          </label>
        </div>

        <footer>
          <span>Les changements restent locaux au Lab jusqu’à COPIER LA CONFIG.</span>
          <button type="button" onClick={onClose}>FERMER</button>
        </footer>
      </section>
    </div>
  )
}
