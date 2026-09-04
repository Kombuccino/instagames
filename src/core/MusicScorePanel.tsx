import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { musicTrackLabel } from '../music/trackLabels'
import {
  changedTrackCount,
  isDefaultTrackTuning,
  makeAudioLabConfigBlock,
  normalizeTrackTuning,
  type CompositionTrackTuning,
  type TrackTuning,
} from './audioLabTuning'
import { exportAudioLabWav } from './audioLabWavExport'
import { TrackMixerModal } from './TrackMixerModal'
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
  onSeek(beat: number): void
  onLoopRange(startBeat: number, endBeat: number): void
  onClearLoop(): void
  loopRange: { startBeat: number, endBeat: number } | null
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
  onSeek,
  onLoopRange,
  onClearLoop,
  loopRange,
  playheadBeat,
  isPlaying,
  paused,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mixerTrackId, setMixerTrackId] = useState<string | null>(null)
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(() => new Set(tracks.map((track) => track.id)))
  const [rangeStart, setRangeStart] = useState(0)
  const [rangeEnd, setRangeEnd] = useState(Math.min(4, composition.loopBeats))
  const [copied, setCopied] = useState<'sequence' | 'config' | null>(null)
  const [exporting, setExporting] = useState<'piece' | 'excerpt' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const trackKey = tracks.map((track) => track.id).join('|')
  const modifiedCount = changedTrackCount(trackTunings)
  const mixerTrack = tracks.find((track) => track.id === mixerTrackId) ?? null
  const loopingSelection = Boolean(loopRange
    && Math.abs(loopRange.startBeat - rangeStart) < .001
    && Math.abs(loopRange.endBeat - rangeEnd) < .001)

  useEffect(() => {
    setSelectedTrackIds(new Set(tracks.map((track) => track.id)))
    setRangeStart(0)
    setRangeEnd(Math.min(4, composition.loopBeats))
    setMixerTrackId(null)
    setExportError(null)
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

  const seekFromTimeline = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const maxBeat = Math.max(0, composition.loopBeats - STEP)
    const beat = clamp(Math.round((ratio * composition.loopBeats) / STEP) * STEP, 0, maxBeat)
    onSeek(beat)
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

  const exportWav = async (scope: 'piece' | 'excerpt') => {
    if (exporting) return
    setExporting(scope)
    setExportError(null)
    try {
      await exportAudioLabWav({
        compositionId: composition.id,
        compositionName: composition.name,
        stage,
        tracks,
        trackTunings,
        mutedTrackIds,
        startBeat: scope === 'piece' ? 0 : rangeStart,
        endBeat: scope === 'piece' ? composition.loopBeats : rangeEnd,
        scope,
      })
    } catch (error) {
      console.error('Audio Lab WAV export failed', error)
      setExportError('Export WAV impossible sur ce navigateur ou cet appareil.')
    } finally {
      setExporting(null)
    }
  }

  const resetComposition = () => {
    onResetComposition()
    onCommitPitchOrLength()
  }

  return (
    <section className="mf-score-panel" data-open={open ? 'true' : 'false'}>
      <button type="button" className="mf-score-panel__toggle" onClick={() => setOpen((value) => !value)}>
        <span>{open ? '▾' : '▸'} PARTITION / MIX / SÉQUENCE</span>
        <small>{tracks.length} pistes · {stage.bpm} BPM{modifiedCount ? ` · ${modifiedCount} MOD` : ''}{loopRange ? ' · BOUCLE' : ''}{isPlaying ? paused ? ' · PAUSE' : ' · LECTURE' : ''}</small>
      </button>

      {open ? (
        <div className="mf-score-panel__body">
          <div className="mf-score-panel__help">
            <b>CLIQUE DIRECTEMENT DANS LA TIMELINE</b> pour partir de cet endroit. Le clic est calé au quart de temps. Délimite ensuite DÉBUT / FIN et utilise <b>BOUCLE EXTRAIT</b> pour réécouter la même zone autant de fois que nécessaire.
          </div>

          <div className="mf-score-selection-toolbar">
            <span>SÉLECTION POUR LE RETOUR · {selectedTrackIds.size}/{tracks.length} pistes</span>
            <div className="mf-score-selection-toolbar__actions">
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
              const modified = !isDefaultTrackTuning(tuning)
              const muted = mutedTrackIds.has(track.id)
              return (
                <div className="mf-score-row" data-muted={muted ? 'true' : 'false'} data-disabled={tuning.enabled ? 'false' : 'true'} data-selected={selectedTrackIds.has(track.id) ? 'true' : 'false'} key={track.id}>
                  <div className="mf-score-row__strip">
                    <label title="Inclure cette piste dans le copier-coller de séquence">
                      <input type="checkbox" checked={selectedTrackIds.has(track.id)} onChange={() => toggleSelected(track.id)} aria-label={`Sélectionner ${label}`} />
                    </label>
                    <div className="mf-score-row__identity">
                      <b>{label}</b>
                      <small data-modified={modified ? 'true' : 'false'}>{track.wave} · {track.id}{!tuning.enabled ? ' · RETIRÉE' : modified ? ' · MOD' : ''}</small>
                    </div>
                    <button type="button" data-active={muted} onClick={() => onToggleMute(track.id)} aria-label={`Mute ${label}`} title="Mute temporaire">M</button>
                    <button type="button" className="is-settings" data-active={modified || mixerTrackId === track.id} onClick={() => setMixerTrackId(track.id)} aria-label={`Table de mixage ${label}`} title="Ouvrir la table de mixage">⚙</button>
                  </div>
                  <div className="mf-score-lane" onClick={seekFromTimeline} title="Cliquer pour lire depuis cet endroit">
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

          <div className="mf-score-audition" data-looping={loopingSelection ? 'true' : 'false'}>
            <button type="button" className="primary" onClick={() => loopingSelection ? onClearLoop() : onLoopRange(rangeStart, rangeEnd)}>{loopingSelection ? '■ QUITTER LA BOUCLE' : '↻ BOUCLE EXTRAIT'}</button>
            <small>{formatTime(startTime)} → {formatTime(endTime)} · {(rangeEnd - rangeStart).toFixed(2)} beats{loopRange && !loopingSelection ? ' · une autre boucle est actuellement active' : ''}</small>
          </div>

          <div className="mf-score-audio-export" data-busy={exporting ? 'true' : 'false'}>
            <div>
              <strong>EXPORT AUDIO WAV</strong>
              <span>Rendu hors-ligne 44,1 kHz / 16-bit mono · niveau {stage.label} / {stage.bpm} BPM · mix, réglages et MUTES actuels inclus.</span>
              {exportError ? <em>{exportError}</em> : null}
            </div>
            <div className="mf-score-audio-export__actions">
              <button type="button" className="primary" disabled={Boolean(exporting)} onClick={() => void exportWav('piece')}>{exporting === 'piece' ? 'RENDU WAV…' : '↓ EXPORT WAV MORCEAU'}</button>
              <button type="button" disabled={Boolean(exporting)} onClick={() => void exportWav('excerpt')}>{exporting === 'excerpt' ? 'RENDU WAV…' : '↓ EXPORT WAV EXTRAIT'}</button>
            </div>
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

      {mixerTrack ? (
        <TrackMixerModal
          label={musicTrackLabel(mixerTrack.id, mixerTrack.name)}
          trackId={mixerTrack.id}
          wave={mixerTrack.wave}
          tuning={normalizeTrackTuning(trackTunings[mixerTrack.id])}
          modified={!isDefaultTrackTuning(trackTunings[mixerTrack.id])}
          onChange={(patch) => onChangeTuning(mixerTrack.id, patch)}
          onReset={() => onResetTrack(mixerTrack.id)}
          onCommitScheduledTuning={onCommitPitchOrLength}
          onClose={() => setMixerTrackId(null)}
        />
      ) : null}
    </section>
  )
}
