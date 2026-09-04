import { useEffect, useMemo, useRef, useState } from 'react'
import './voiceIdeaRecorder.css'

type Stage = { label: string, bpm: number, variant: string }
type Composition = {
  id: string
  name: string
  gameTitle: string
  loopBeats: number
}

type Props = {
  composition: Composition
  stage: Stage
  isPlaying: boolean
  paused: boolean
  playheadBeat: number
  onStartMusic(): Promise<void> | void
  onResumeMusic(): Promise<void> | void
}

type Take = {
  url: string
  blob: Blob
  mimeType: string
  startBeat: number
  durationSeconds: number
  createdAt: string
}

const BARS_COUNT_IN = 1
const BEATS_PER_BAR = 4

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const rest = safe - minutes * 60
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`
}

function mimeChoice() {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? ''
}

function extensionFor(mimeType: string) {
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
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

export function VoiceIdeaRecorder({ composition, stage, isPlaying, paused, playheadBeat, onStartMusic, onResumeMusic }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'permission' | 'countin' | 'recording' | 'error'>('idle')
  const [countIn, setCountIn] = useState(0)
  const [take, setTake] = useState<Take | null>(null)
  const [copied, setCopied] = useState(false)
  const [levels, setLevels] = useState<number[]>([])
  const [error, setError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const startBeatRef = useRef(0)
  const countTimerRef = useRef<number | null>(null)
  const recordTimerRef = useRef<number | null>(null)
  const analyserContextRef = useRef<AudioContext | null>(null)
  const analyserRafRef = useRef<number | null>(null)

  const supported = typeof navigator !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof MediaRecorder !== 'undefined'
  const beatSeconds = 60 / stage.bpm
  const oneBarSeconds = BEATS_PER_BAR * beatSeconds
  const startTime = take ? take.startBeat * beatSeconds : 0
  const endTime = take ? startTime + take.durationSeconds : 0

  const cleanupAnalyser = () => {
    if (analyserRafRef.current !== null) cancelAnimationFrame(analyserRafRef.current)
    analyserRafRef.current = null
    if (analyserContextRef.current) void analyserContextRef.current.close()
    analyserContextRef.current = null
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    cleanupAnalyser()
  }

  const clearTimers = () => {
    if (countTimerRef.current !== null) window.clearInterval(countTimerRef.current)
    if (recordTimerRef.current !== null) window.clearTimeout(recordTimerRef.current)
    countTimerRef.current = null
    recordTimerRef.current = null
  }

  useEffect(() => () => {
    clearTimers()
    stopStream()
  }, [])

  useEffect(() => {
    if (!take) return
    return () => URL.revokeObjectURL(take.url)
  }, [take])

  const startMeter = (stream: MediaStream) => {
    cleanupAnalyser()
    const context = new AudioContext({ latencyHint: 'interactive' })
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = .72
    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)
    analyserContextRef.current = context
    const data = new Uint8Array(analyser.fftSize)

    const sample = () => {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let index = 0; index < data.length; index += 1) {
        const value = (data[index] - 128) / 128
        sum += value * value
      }
      const rms = Math.sqrt(sum / data.length)
      setLevels((current) => [...current.slice(-95), clamp(rms * 4, .025, 1)])
      analyserRafRef.current = requestAnimationFrame(sample)
    }
    sample()
  }

  const beginRecording = (stream: MediaStream, startBeat: number) => {
    const mimeType = mimeChoice()
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    chunksRef.current = []
    recorderRef.current = recorder
    startedAtRef.current = performance.now()
    startBeatRef.current = startBeat
    setLevels([])
    startMeter(stream)

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    })
    recorder.addEventListener('stop', () => {
      const durationSeconds = Math.max(.01, (performance.now() - startedAtRef.current) / 1000)
      const actualType = recorder.mimeType || mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: actualType })
      const url = URL.createObjectURL(blob)
      setTake((previous) => {
        if (previous?.url) URL.revokeObjectURL(previous.url)
        return {
          url,
          blob,
          mimeType: actualType,
          startBeat: startBeatRef.current,
          durationSeconds,
          createdAt: new Date().toISOString(),
        }
      })
      recorderRef.current = null
      setStatus('idle')
      stopStream()
    }, { once: true })

    recorder.start(120)
    setStatus('recording')
  }

  const startIdea = async () => {
    if (!supported || status !== 'idle') return
    setError('')
    setStatus('permission')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      })
      streamRef.current = stream

      let baseBeat = playheadBeat
      if (!isPlaying) {
        await onStartMusic()
        baseBeat = 0
      } else if (paused) {
        await onResumeMusic()
      }

      const countBeats = BARS_COUNT_IN * BEATS_PER_BAR
      const targetBeat = (baseBeat + countBeats) % composition.loopBeats
      setStatus('countin')
      setCountIn(countBeats)

      let remaining = countBeats
      countTimerRef.current = window.setInterval(() => {
        remaining -= 1
        setCountIn(Math.max(0, remaining))
        if (remaining <= 0 && countTimerRef.current !== null) {
          window.clearInterval(countTimerRef.current)
          countTimerRef.current = null
        }
      }, beatSeconds * 1000)

      recordTimerRef.current = window.setTimeout(() => {
        recordTimerRef.current = null
        beginRecording(stream, targetBeat)
      }, oneBarSeconds * 1000)
    } catch (cause) {
      stopStream()
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'Microphone indisponible')
    }
  }

  const stopIdea = () => {
    clearTimers()
    if (status === 'countin') {
      stopStream()
      setStatus('idle')
      return
    }
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }

  const deleteTake = () => {
    if (take?.url) URL.revokeObjectURL(take.url)
    setTake(null)
    setLevels([])
  }

  const exportAudio = () => {
    if (!take) return
    const anchor = document.createElement('a')
    anchor.href = take.url
    anchor.download = `${composition.id}_vocal-idea_stage-${stage.label}_beat-${take.startBeat.toFixed(2)}.${extensionFor(take.mimeType)}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  const metadataText = useMemo(() => {
    if (!take) return ''
    return [
      `MINIFUGG_VOCAL_IDEA v1 — music=${composition.id}`,
      `music: ${composition.id} — ${composition.name}`,
      `game: ${composition.gameTitle}`,
      `stage: ${stage.label} — ${stage.bpm} BPM — variant ${stage.variant}`,
      `start: beat ${take.startBeat.toFixed(2)} — ${formatTime(startTime)}`,
      `duration: ${take.durationSeconds.toFixed(3)}s`,
      `end approx: ${formatTime(endTime)}`,
      `recorded: ${take.createdAt}`,
      `audio: fichier micro séparé, sans mix MiniFugg`,
      '',
      'intention: ',
    ].join('\n')
  }, [composition.gameTitle, composition.id, composition.name, endTime, stage.bpm, stage.label, stage.variant, startTime, take])

  const copyMetadata = async () => {
    if (!metadataText) return
    await copyText(metadataText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <section className="mf-voice-idea" data-open={open ? 'true' : 'false'}>
      <button type="button" className="mf-voice-idea__toggle" onClick={() => setOpen((value) => !value)}>
        <span>{open ? '▾' : '▸'} IDÉE VOCALE</span>
        <small>{take ? `${take.durationSeconds.toFixed(1)}s enregistrées` : 'fredonne une mélodie au casque'}</small>
      </button>

      {open ? (
        <div className="mf-voice-idea__body">
          <p><b>Casque conseillé.</b> La musique reste dans tes oreilles ; le fichier enregistré contient uniquement ton micro. Une mesure de décompte te laisse te caler avant la prise.</p>

          {!supported ? <div className="mf-voice-idea__error">Ce navigateur ne fournit pas MediaRecorder + microphone.</div> : null}
          {status === 'error' ? <div className="mf-voice-idea__error">Micro : {error}</div> : null}

          <div className="mf-voice-idea__transport">
            {status === 'idle' ? <button type="button" className="record" disabled={!supported} onClick={() => void startIdea()}>● ENREGISTRER UNE IDÉE</button> : null}
            {status === 'permission' ? <button type="button" disabled>MICRO…</button> : null}
            {status === 'countin' ? <button type="button" className="count" onClick={stopIdea}>DÉCOMPTE {countIn || 'GO'} · ANNULER</button> : null}
            {status === 'recording' ? <button type="button" className="stop" onClick={stopIdea}>■ STOP LA PRISE</button> : null}
          </div>

          {(status === 'recording' || levels.length > 0) ? (
            <div className="mf-voice-wave" aria-label="Niveau du microphone">
              {Array.from({ length: 96 }, (_, index) => {
                const level = levels[Math.max(0, levels.length - 96) + index] ?? .025
                return <i style={{ height: `${Math.max(3, level * 100)}%` }} key={index} />
              })}
            </div>
          ) : null}

          {take ? (
            <div className="mf-voice-take">
              <div className="mf-voice-take__meta"><b>PRISE MICRO SÉPARÉE</b><span>beat {take.startBeat.toFixed(2)} · {formatTime(startTime)} · {take.durationSeconds.toFixed(2)}s</span></div>
              <audio controls preload="metadata" src={take.url} />
              <div className="mf-voice-take__actions">
                <button type="button" onClick={exportAudio}>⇩ EXPORTER L’AUDIO</button>
                <button type="button" onClick={() => void copyMetadata()}>{copied ? '✓ INFOS COPIÉES' : '⧉ COPIER LES INFOS'}</button>
                <button type="button" className="danger" onClick={deleteTake}>SUPPRIMER LA PRISE</button>
              </div>
              <small>Pour me transmettre réellement la mélodie : exporte ce fichier audio, joins-le dans le chat, et colle les infos de la prise. Je pourrai alors reconstruire ta proposition en nouvelle piste.</small>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
