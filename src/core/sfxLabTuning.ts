export type SfxLabTuning = {
  volumePercent: number
  transposeSemitones: number
  durationPercent: number
  brightness: number
}

export const DEFAULT_SFX_TUNING: SfxLabTuning = {
  volumePercent: 100,
  transposeSemitones: 0,
  durationPercent: 100,
  brightness: 0,
}

const STORAGE_PREFIX = 'minifugg:audio-lab:sfx-tuning:v1:'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function normalizeSfxTuning(value?: Partial<SfxLabTuning> | null): SfxLabTuning {
  return {
    volumePercent: Math.round(clamp(Number(value?.volumePercent ?? 100), 0, 200)),
    transposeSemitones: Math.round(clamp(Number(value?.transposeSemitones ?? 0), -12, 12)),
    durationPercent: Math.round(clamp(Number(value?.durationPercent ?? 100), 40, 200)),
    brightness: Math.round(clamp(Number(value?.brightness ?? 0), -100, 100)),
  }
}

export function isDefaultSfxTuning(value?: Partial<SfxLabTuning> | null) {
  const tuning = normalizeSfxTuning(value)
  return tuning.volumePercent === 100
    && tuning.transposeSemitones === 0
    && tuning.durationPercent === 100
    && tuning.brightness === 0
}

export function readSfxLabTuning(soundId: string): SfxLabTuning {
  if (typeof window === 'undefined') return DEFAULT_SFX_TUNING
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${soundId}`)
    return raw ? normalizeSfxTuning(JSON.parse(raw) as Partial<SfxLabTuning>) : DEFAULT_SFX_TUNING
  } catch {
    return DEFAULT_SFX_TUNING
  }
}

export function writeSfxLabTuning(soundId: string, tuning: SfxLabTuning) {
  if (typeof window === 'undefined') return
  const normalized = normalizeSfxTuning(tuning)
  if (isDefaultSfxTuning(normalized)) {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${soundId}`)
    return
  }
  window.localStorage.setItem(`${STORAGE_PREFIX}${soundId}`, JSON.stringify(normalized))
}

export function tuningSummary(tuning: SfxLabTuning) {
  const normalized = normalizeSfxTuning(tuning)
  const parts: string[] = []
  if (normalized.volumePercent !== 100) parts.push(`volume ${normalized.volumePercent}%`)
  if (normalized.transposeSemitones !== 0) parts.push(`pitch ${normalized.transposeSemitones > 0 ? '+' : ''}${normalized.transposeSemitones}`)
  if (normalized.durationPercent !== 100) parts.push(`durée ${normalized.durationPercent}%`)
  if (normalized.brightness !== 0) parts.push(`brillance ${normalized.brightness > 0 ? '+' : ''}${normalized.brightness}`)
  return parts.join(' · ') || 'réglages source'
}

export function makeSfxConfigBlock(input: {
  soundId: string
  soundKey: string
  soundName: string
  event: string
  tuning: SfxLabTuning
}) {
  return [
    `MINIFUGG_SFX_CONFIG v1 — sound=${input.soundId}`,
    JSON.stringify({
      soundId: input.soundId,
      key: input.soundKey,
      name: input.soundName,
      event: input.event,
      ...normalizeSfxTuning(input.tuning),
    }, null, 2),
  ].join('\n')
}
