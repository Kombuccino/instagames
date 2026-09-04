import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

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
  mutedTrackIds: Set<string>
  onToggleMute(trackId: string): void
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

export function MusicScorePanel({ composition, stage, tracks, mutedTrackIds, onToggleMute, playheadBeat, isPlaying, paused }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(() => new Set(tracks.map((track) => track.id)))
  const [rangeStart, setRangeStart] = useState(0)
  const [rangeEnd, setRangeEnd] = useState(Math.min(4, composition.loopBeats))
  const [copied, setCopied] = useState(false)
  const trackKey = tracks.map((track) => track.id).join('|')

  useEffect(() => {
    setSelectedTrackIds(new Set(tracks.map((track) => track.id)))
    setRangeStart(0)
    setRangeEnd(Math.min(4, composition.loopBeats))
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
      `tracks: ${selected.length ? selected.map((track) => `${track.name} [${track.id}]${mutedTrackIds.has(track.id) ? ' (MUTE)' : ''}`).join(' ; ') : 'aucune'}`,
      '',
      'events:',
    ]

    selected.forEach((track) => {
      const notes = track.notes.filter(([beat, duration]) => beat < rangeEnd && beat + duration > rangeStart)
      lines.push(`\n[${track.name} | ${track.id}${mutedTrackIds.has(track.id) ? ' | MUTE' : ''}]`)
      if (notes.length === 0) {
        lines.push('(aucun événement dans cette plage)')
        return
      }
      notes.forEach(([beat, duration, midi, velocity]) => {
        const eventTime = beat * beatSeconds
        const durationSeconds = duration * beatSeconds
        const pitch = track.wave === 'noise' ? `perc-midi-${midi}` : `${noteName(midi)} midi-${midi}`
        lines.push(`${formatTime(eventTime)} | beat ${beat.toFixed(2)} | ${pitch} | durée ${durationSeconds.toFixed(3)}s | vél ${velocity}`)
      })
    })

    lines.push('', 'feedback: ')
    return lines.join('\n')
  }

  const copySelection = async () => {
    await copyText(makeSelectionText())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <section className="mf-score-panel" data-open={open ? 'true' : 'false'}>
      <button type="button" className="mf-score-panel__toggle" onClick={() => setOpen((value) => !value)}>
        <span>{open ? '▾' : '▸'} PARTITION / SÉQUENCE</span>
        <small>{tracks.length} pistes · {stage.bpm} BPM{isPlaying ? paused ? ' · PAUSE' : ' · LECTURE' : ''}</small>
      </button>

      {open ? (
        <div className="mf-score-panel__body">
          <div className="mf-score-panel__help">Coche les pistes à inclure dans ton retour. <b>M</b> coupe seulement l’écoute. La zone acidulée est l’extrait copié.</div>

          <div className="mf-score-track-list">
            {tracks.map((track) => (
              <div className="mf-score-track-control" data-muted={mutedTrackIds.has(track.id) ? 'true' : 'false'} key={track.id}>
                <label>
                  <input type="checkbox" checked={selectedTrackIds.has(track.id)} onChange={() => toggleSelected(track.id)} />
                  <span><b>{track.name}</b><small>{track.id}</small></span>
                </label>
                <button type="button" data-active={mutedTrackIds.has(track.id)} onClick={() => onToggleMute(track.id)} aria-label={`Mute ${track.name}`}>M</button>
              </div>
            ))}
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
            {tracks.map((track) => (
              <div className="mf-score-row" data-muted={mutedTrackIds.has(track.id) ? 'true' : 'false'} data-selected={selectedTrackIds.has(track.id) ? 'true' : 'false'} key={track.id}>
                <div className="mf-score-row__name"><b>{track.name}</b><small>{track.wave}</small></div>
                <div className="mf-score-lane">
                  <i className="mf-score-selection" style={{ left: `${(rangeStart / composition.loopBeats) * 100}%`, width: `${((rangeEnd - rangeStart) / composition.loopBeats) * 100}%` }} />
                  {track.notes.map(([beat, duration, midi, velocity], index) => {
                    const pitchRange = Math.max(1, pitchBounds.max - pitchBounds.min)
                    const normalizedPitch = track.wave === 'noise' ? .5 : 1 - clamp((midi - pitchBounds.min) / pitchRange, 0, 1)
                    return (
                      <span
                        className="mf-score-note"
                        title={`${track.name} · beat ${beat.toFixed(2)} · ${track.wave === 'noise' ? `perc ${midi}` : noteName(midi)} · vél ${velocity}`}
                        style={{
                          left: `${(beat / composition.loopBeats) * 100}%`,
                          width: `${Math.max(.25, duration / composition.loopBeats * 100)}%`,
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
            ))}
          </div>

          <div className="mf-score-range">
            <label><span>DÉBUT <b>{formatTime(startTime)}</b> · beat {rangeStart.toFixed(2)}</span><input type="range" min={0} max={Math.max(0, rangeEnd - STEP)} step={STEP} value={rangeStart} onChange={(event) => setRangeStart(Math.min(Number(event.target.value), rangeEnd - STEP))} /></label>
            <label><span>FIN <b>{formatTime(endTime)}</b> · beat {rangeEnd.toFixed(2)}</span><input type="range" min={Math.min(composition.loopBeats, rangeStart + STEP)} max={composition.loopBeats} step={STEP} value={rangeEnd} onChange={(event) => setRangeEnd(Math.max(Number(event.target.value), rangeStart + STEP))} /></label>
          </div>

          <div className="mf-score-copy">
            <button type="button" className="primary" disabled={selectedTrackIds.size === 0} onClick={() => void copySelection()}>{copied ? '✓ COPIÉ — COLLE DANS LE CHAT' : '⧉ COPIER LA SÉQUENCE'}</button>
            <small>{formatTime(startTime)} → {formatTime(endTime)} · {selectedTrackIds.size} piste{selectedTrackIds.size > 1 ? 's' : ''} sélectionnée{selectedTrackIds.size > 1 ? 's' : ''}</small>
          </div>
        </div>
      ) : null}
    </section>
  )
}
