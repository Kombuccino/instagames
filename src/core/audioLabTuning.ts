export type TrackTuning = {
  enabled: boolean
  volumePercent: number
  transposeSemitones: number
  brightness: number
  noteLengthPercent: number
}

export type CompositionTrackTuning = Record<string, TrackTuning>

export const DEFAULT_TRACK_TUNING: TrackTuning = {
  enabled: true,
  volumePercent: 100,
  transposeSemitones: 0,
  brightness: 0,
  noteLengthPercent: 100,
}

const STORAGE_PREFIX = 'minifugg:audio-lab:track-tuning:v1:'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function normalizeTrackTuning(value?: Partial<TrackTuning> | null): TrackTuning {
  return {
    enabled: value?.enabled !== false,
    volumePercent: Math.round(clamp(Number(value?.volumePercent ?? 100), 0, 150)),
    transposeSemitones: Math.round(clamp(Number(value?.transposeSemitones ?? 0), -12, 12)),
    brightness: Math.round(clamp(Number(value?.brightness ?? 0), -100, 100)),
    noteLengthPercent: Math.round(clamp(Number(value?.noteLengthPercent ?? 100), 25, 200)),
  }
}

export function isDefaultTrackTuning(value?: Partial<TrackTuning> | null) {
  const tuning = normalizeTrackTuning(value)
  return tuning.enabled === DEFAULT_TRACK_TUNING.enabled
    && tuning.volumePercent === DEFAULT_TRACK_TUNING.volumePercent
    && tuning.transposeSemitones === DEFAULT_TRACK_TUNING.transposeSemitones
    && tuning.brightness === DEFAULT_TRACK_TUNING.brightness
    && tuning.noteLengthPercent === DEFAULT_TRACK_TUNING.noteLengthPercent
}

function storageKey(compositionId: string) {
  return `${STORAGE_PREFIX}${compositionId}`
}

export function readAudioLabTuning(compositionId: string): CompositionTrackTuning {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey(compositionId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<TrackTuning>>
    return Object.fromEntries(Object.entries(parsed).map(([trackId, value]) => [trackId, normalizeTrackTuning(value)]))
  } catch {
    return {}
  }
}

export function writeAudioLabTuning(compositionId: string, tuning: CompositionTrackTuning) {
  if (typeof window === 'undefined') return
  const changed = Object.fromEntries(Object.entries(tuning)
    .filter(([, value]) => !isDefaultTrackTuning(value))
    .map(([trackId, value]) => [trackId, normalizeTrackTuning(value)]))

  if (Object.keys(changed).length === 0) {
    window.localStorage.removeItem(storageKey(compositionId))
    return
  }
  window.localStorage.setItem(storageKey(compositionId), JSON.stringify(changed))
}

export function changedTrackCount(tuning: CompositionTrackTuning) {
  return Object.values(tuning).filter((value) => !isDefaultTrackTuning(value)).length
}

export function brightnessCutoff(brightness: number) {
  const normalized = clamp(brightness, -100, 100)
  return clamp(18000 * Math.pow(2, normalized / 50), 900, 20000)
}

export function makeAudioLabConfigBlock(input: {
  compositionId: string
  compositionName: string
  gameTitle: string
  tuning: CompositionTrackTuning
  trackNames: Record<string, string>
}) {
  const tracks = Object.fromEntries(Object.entries(input.tuning)
    .filter(([, value]) => !isDefaultTrackTuning(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([trackId, value]) => [trackId, {
      name: input.trackNames[trackId] ?? trackId,
      ...normalizeTrackTuning(value),
    }]))

  return [
    `MINIFUGG_AUDIO_CONFIG v1 — music=${input.compositionId}`,
    JSON.stringify({
      musicId: input.compositionId,
      musicName: input.compositionName,
      game: input.gameTitle,
      scope: 'composition',
      tracks,
    }, null, 2),
  ].join('\n')
}
