import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { musicTrackLabel } from '../music/trackLabels'
import {
  changedTrackCount,
  isDefaultTrackTuning,
  makeAudioLabConfigBlock,
  normalizeTrackTuning,
  type CompositionTrackTuning,
  type TrackTuning,
} from './audioLabTuning'
import './musicScorePanel.css'

type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise'
type Note = [startBeat: number, durationBeats: number, midi: number, velocity: number]
type Track = { id: string, name: string, wave: Wave, gain: number, notes: Note[] }
type Stage = { label: string, bpm: number, variant: string, activeTracks: string[] }
type Composition = {
  id: string
  name: string
  gameTitle: string
  loopBeats: number
}

type Props = {
  composition: Composition
  stage: Stage
  tracks: Track[]
  allTracks: Track[]
  mutedTrackIds: Set<string>
  trackTunings: CompositionTrackTuning
  onToggleMute(trackId: string): void
  onChangeTuning(trackId: string, patch: Partial<TrackTuning>): void
  onResetTrack(trackId: string): void
  onResetComposition(): void
  onCommitPitchOrLength(): void
  playheadBeat: number
  isPlaying: boolean
  paused: boolean
}

const STEP = .25

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const rest = safe - minutes * 60
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`
}

function noteName(midi: number) {
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

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

function tuningSummary(tuning: TrackTuning) {
  const parts: string[] = []
  if (!tuning.enabled) parts.push('RETIRÉE')
  if (tuning.volumePercent !== 100) parts.push(`vol ${tuning.volumePercent}%`)
  if (tuning.transposeSemitones !== 0) parts.push(`${tuning.transposeSemitones > 0 ? '+' : ''}${tuning.transposeSemitones} demi-tons`)
  if (tuning.brightness !== 0) parts.push(`brillance ${tuning.brightness > 0 ? '+' : ''}${tuning.brightness}`)
  if (tuning.noteLengthPercent !== 100) parts.push(`longueur ${tuning.noteLengthPercent}%`)
  return parts.length ? parts.join(', ') : 'origine'
}

export function MusicScorePanel({
  composition,
  stage,
  tracks,
  allTracks,
  mutedTrackIds,
  trackTunings,
  onToggleMute,
  onChangeTuning,
  onResetTrack,
  onResetComposition,
  onCommitPitchOrLength,
  playheadBeat,
  isPlaying,
  paused,
}: Props) {
  const [open, setOpen] = useState(false)
  const [openTrackId, setOpenTrackId] = useState<string | null>(null)
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(() => new Set(tracks.map((track) => track.id)))
  const [rangeStart, setRangeStart] = useState(0)
  const [rangeEnd, setRangeEnd] = useState(Math.min(4, composition.loopBeats))
  const [copied, setCopied] = useState<'sequence' | 'config' | null>(null)
  const trackKey = tracks.map((track) => track.id).join('|')
  const modifiedCount = changedTrackCount(trackTunings)

  useEffect(() => {
    setSelectedTrackIds(new Set(tracks.map((track) => track.id)))
    setRangeStart(0)
    setRangeEnd(Math.min(4, composition.loopBeats))
    setOpenTrackId(null)
  }, [composition.id, composition.loopBeats, stage.label, stage.variant, trackKey])

  const pitchBounds = useMemo(() => {
    const pitched = tracks.filter((track) => track.wave !== 'noise').flatMap((track) => track.notes.map((note) => note[2]))
    if (pitched.length === 0) return { min: 48, max: 72 }
    return { min: Math.min(...pitched), max: Math.max(...pitched) }
  }, [trackKey, tracks])

  const beatSeconds = 60 / stage.bpm
  const startTime = rangeStart * beatSeconds
  const endTime = rangeEnd * beatSeconds
  const bars = Math.max(1, composition.loopBeats / 4)

  const toggleSelected = (trackId: string) => {
    setSelectedTrackIds((current) => {
      const next = new Set(current)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  const makeSelectionText = () => {
    const selected = tracks.filter((track) => selectedTrackIds.has(track.id))
    const lines = [
      'MINIFUGG_AUDIO_SELECTION',
      `music: ${composition.id} — ${composition.name}`,
      `game: ${composition.gameTitle}`,
      `stage: ${stage.label} — ${stage.bpm} BPM — variant ${stage.variant}`,
      `range: ${formatTime(startTime)} → ${formatTime(endTime)} | beats ${rangeStart.toFixed(2)} → ${rangeEnd.toFixed(2)}`,
      `tracks: ${selected.length ? selected.map((track) => {
        const tuning = normalizeTrackTuning(trackTunings[track.id])
        return `${musicTrackLabel(track.id, track.name)} [${track.id}]${mutedTrackIds.has(track.id) ? ' (MUTE)' : ''} {${tuningSummary(tuning)}}`
      }).join(' ; ') : 'aucune'}`,
      '',
      'events:',
    ]

    selected.forEach((track) => {
      const label = musicTrackLabel(track.id, track.name)
      const tuning = normalizeTrackTuning(trackTunings[track.id])
      const notes = track.notes.filter(([beat, duration]) => beat < rangeEnd && beat + duration > rangeStart)
      lines.push(`\n[${label} | ${track.id}${mutedTrackIds.has(track.id) ? ' | MUTE' : ''} | ${tuningSummary(tuning)}]`)
      if (notes.length === 0) {
        lines.push('(aucun événement dans cette plage)')
        return
      }
      notes.forEach(([beat, duration, midi, velocity]) => {
        const eventTime = beat * beatSeconds
        const tunedDuration = duration * (tuning.noteLengthPercent / 100)
        const durationSeconds = tunedDuration * beatSeconds
        const tunedMidi = track.wave === 'noise' ? midi : midi + tuning.transposeSemitones
        const pitch = track.wave === 'noise' ? `perc-midi-${midi}` : `${noteName(tunedMidi)} midi-${tunedMidi}`
        lines.push(`${formatTime(eventTime)} | beat ${beat.toFixed(2)} | ${pitch} | durée ${durationSeconds.toFixed(3)}s | vél ${velocity}`)
      })
    })

    lines.push('', 'feedback: ')
    return lines.join('\n')
  }

  const copySelection = async () => {
    await copyText(makeSelectionText())
    setCopied('sequence')
    window.setTimeout(() => setCopied(null), 1400)
  }

  const copyConfig = async () => {
    const trackNames = Object.fromEntries(allTracks.map((track) => [track.id, musicTrackLabel(track.id, track.name)]))
    await copyText(makeAudioLabConfigBlock({
      compositionId: composition.id,
      compositionName: composition.name,
      gameTitle: composition.gameTitle,
      tuning: trackTunings,
      trackNames,
    }))
    setCopied('config')
    window.setTimeout(() => setCopied(null), 1400)
  }

  const resetComposition = () => {
    onResetComposition()
    onCommitPitchOrLength()
  }

  return (
    <section className="mf-score-panel" data-open={open ? 'true' : 'false'}>
      <button type="button" className="mf-score-panel__toggle" onClick={() => setOpen((value) => !value)}>
        <span>{open ? '▾' : '▸'} PARTITION / MIX / SÉQUENCE</span>
        <small>{tracks.length} pistes · {stage.bpm} BPM{modifiedCount ? ` · ${modifiedCount} MOD` : ''}{isPlaying ? paused ? ' · PAUSE' : ' · LECTURE' : ''}</small>
      </button>

      {open ? (
        <div className="mf-score-panel__body">
          <div className="mf-score-panel__help">
            <b>M</b> = mute temporaire. <b>⚙</b> = réglage exportable. Les modifications sont sauvegardées uniquement dans ce navigateur jusqu’à <b>COPIER LA CONFIG</b>.
          </div>

          <div className="mf-score-track-list">
            {tracks.map((track) => {
              const label = musicTrackLabel(track.id, track.name)
              const tuning = normalizeTrackTuning(trackTunings[track.id])
              const modified = !isDefaultTrackTuning(tuning)
              const settingsOpen = openTrackId === track.id
              return (
                <div className="mf-score-track-card" data-disabled={tuning.enabled ? 'false' : 'true'} key={track.id}>
                  <div className="mf-score-track-control" data-muted={mutedTrackIds.has(track.id) ? 'true' : 'false'} data-modified={modified ? 'true' : 'false'}>
                    <label>
                      <input type="checkbox" checked={selectedTrackIds.has(track.id)} onChange={() => toggleSelected(track.id)} />
                      <span><b>{label}</b><small>{track.id}{modified ? ' · MODIFIÉE' : ''}</small></span>
                    </label>
                    <button type="button" data-active={mutedTrackIds.has(track.id)} onClick={() => onToggleMute(track.id)} aria-label={`Mute ${label}`}>M</button>
                    <button type="button" className="is-settings" data-active={settingsOpen || modified} onClick={() => setOpenTrackId(settingsOpen ? null : track.id)} aria-label={`Réglages ${label}`}>⚙</button>
                  </div>

                  {settingsOpen ? (
                    <div className="mf-score-track-settings">
                      <div className="mf-score-track-settings__head">
                        <button type="button" className="is-enable" data-active={tuning.enabled} onClick={() => onChangeTuning(track.id, { enabled: !tuning.enabled })}>{tuning.enabled ? '● PISTE INCLUSE' : '○ PISTE RETIRÉE'}</button>
                        <button type="button" disabled={!modified} onClick={() => { onResetTrack(track.id); onCommitPitchOrLength() }}>RESET PISTE</button>
                      </div>

                      <label><span>VOLUME <b>{tuning.volumePercent}%</b></span><input type="range" min={0} max={150} step={1} value={tuning.volumePercent} onChange={(event) => onChangeTuning(track.id, { volumePercent: Number(event.target.value) })} /></label>

                      {track.wave === 'noise' ? (
                        <div className="mf-score-track-settings__na"><span>TRANSPOSITION</span><b>— percussion —</b></div>
                      ) : (
                        <label><span>TRANSPOSITION <b>{tuning.transposeSemitones > 0 ? '+' : ''}{tuning.transposeSemitones}</b> demi-tons</span><input type="range" min={-12} max={12} step={1} value={tuning.transposeSemitones} onChange={(event) => onChangeTuning(track.id, { transposeSemitones: Number(event.target.value) })} onPointerUp={onCommitPitchOrLength} onKeyUp={onCommitPitchOrLength} /></label>
                      )}

                      <label><span>BRILLANCE / FILTRE <b>{tuning.brightness > 0 ? '+' : ''}{tuning.brightness}</b></span><input type="range" min={-100} max={100} step={1} value={tuning.brightness} onChange={(event) => onChangeTuning(track.id, { brightness: Number(event.target.value) })} /></label>

                      <label><span>LONGUEUR DES NOTES <b>{tuning.noteLengthPercent}%</b></span><input type="range" min={25} max={200} step={5} value={tuning.noteLengthPercent} onChange={(event) => onChangeTuning(track.id, { noteLengthPercent: Number(event.target.value) })} onPointerUp={onCommitPitchOrLength} onKeyUp={onCommitPitchOrLength} /></label>

                      <small className="mf-score-track-settings__summary">{tuningSummary(tuning)}</small>
                    </div>
                  ) : null}
                </div>
              )
            })}
            <div className="mf-score-track-list__bulk">
              <button type="button" onClick={() => setSelectedTrackIds(new Set(tracks.map((track) => track.id)))}>TOUTES</button>
              <button type="button" onClick={() => setSelectedTrackIds(new Set())}>AUCUNE</button>
            </div>
          </div>

          <div className="mf-score-timeline" style={{ '--score-bars': bars, '--score-beats': composition.loopBeats } as CSSProperties}>
            <div className="mf-score-ruler">
              {Array.from({ length: Math.floor(bars) + 1 }, (_, index) => (
                <span style={{ left: `${(index * 4 / composition.loopBeats) * 100}%` }} key={index}>{index + 1}</span>
              ))}
            </div>
            {tracks.map((track) => {
              const label = musicTrackLabel(track.id, track.name)
              const tuning = normalizeTrackTuning(trackTunings[track.id])
              return (
                <div className="mf-score-row" data-muted={mutedTrackIds.has(track.id) ? 'true' : 'false'} data-disabled={tuning.enabled ? 'false' : 'true'} data-selected={selectedTrackIds.has(track.id) ? 'true' : 'false'} key={track.id}>
                  <div className="mf-score-row__name"><b>{label}</b><small>{track.wave}{!tuning.enabled ? ' · RETIRÉE' : ''}</small></div>
                  <div className="mf-score-lane">
                    <i className="mf-score-selection" style={{ left: `${(rangeStart / composition.loopBeats) * 100}%`, width: `${((rangeEnd - rangeStart) / composition.loopBeats) * 100}%` }} />
                    {track.notes.map(([beat, duration, midi, velocity], index) => {
                      const pitchRange = Math.max(1, pitchBounds.max - pitchBounds.min)
                      const displayedMidi = track.wave === 'noise' ? midi : midi + tuning.transposeSemitones
                      const normalizedPitch = track.wave === 'noise' ? .5 : 1 - clamp((displayedMidi - pitchBounds.min) / pitchRange, 0, 1)
                      const displayedDuration = duration * (tuning.noteLengthPercent / 100)
                      return (
                        <span
                          className="mf-score-note"
                          title={`${label} · beat ${beat.toFixed(2)} · ${track.wave === 'noise' ? `perc ${midi}` : noteName(displayedMidi)} · vél ${velocity}`}
                          style={{
                            left: `${(beat / composition.loopBeats) * 100}%`,
                            width: `${Math.max(.25, displayedDuration / composition.loopBeats * 100)}%`,
                            top: `${8 + normalizedPitch * 38}px`,
                            opacity: .35 + velocity / 127 * .65,
                          }}
                          key={`${beat}-${midi}-${index}`}
                        />
                      )
                    })}
                    {isPlaying ? <i className="mf-score-playhead" style={{ left: `${(playheadBeat / composition.loopBeats) * 100}%` }} /> : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mf-score-range">
            <label><span>DÉBUT <b>{formatTime(startTime)}</b> · beat {rangeStart.toFixed(2)}</span><input type="range" min={0} max={Math.max(0, rangeEnd - STEP)} step={STEP} value={rangeStart} onChange={(event) => setRangeStart(Math.min(Number(event.target.value), rangeEnd - STEP))} /></label>
            <label><span>FIN <b>{formatTime(endTime)}</b> · beat {rangeEnd.toFixed(2)}</span><input type="range" min={Math.min(composition.loopBeats, rangeStart + STEP)} max={composition.loopBeats} step={STEP} value={rangeEnd} onChange={(event) => setRangeEnd(Math.max(Number(event.target.value), rangeStart + STEP))} /></label>
          </div>

          <div className="mf-score-copy">
            <button type="button" className="primary" disabled={selectedTrackIds.size === 0} onClick={() => void copySelection()}>{copied === 'sequence' ? '✓ SÉQUENCE COPIÉE' : '⧉ COPIER LA SÉQUENCE'}</button>
            <small>{formatTime(startTime)} → {formatTime(endTime)} · {selectedTrackIds.size} piste{selectedTrackIds.size > 1 ? 's' : ''} sélectionnée{selectedTrackIds.size > 1 ? 's' : ''}</small>
          </div>

          <div className="mf-score-config-export" data-dirty={modifiedCount > 0 ? 'true' : 'false'}>
            <div><strong>BROUILLON DE MIX</strong><span>{modifiedCount ? `${modifiedCount} piste${modifiedCount > 1 ? 's' : ''} modifiée${modifiedCount > 1 ? 's' : ''} · sauvegardé localement` : 'Aucune différence avec la version du repo'}</span></div>
            <div className="mf-score-config-export__actions">
              <button type="button" className="primary" onClick={() => void copyConfig()}>{copied === 'config' ? '✓ CONFIG COPIÉE — COLLE DANS LE CHAT' : '⧉ COPIER LA CONFIG'}</button>
              <button type="button" disabled={modifiedCount === 0} onClick={resetComposition}>RESET MORCEAU</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
