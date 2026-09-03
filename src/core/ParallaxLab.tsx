import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { GameWelcomeLayer, GameWelcomeMotionType, GameWelcomeVariant } from './types'
import { resolveWelcomeLayer } from './welcomeTuning'
import './parallaxLab.css'

const DRAFT_PREFIX = 'minifugg:parallax-lab:v1:'

function productionFingerprint(variants: GameWelcomeVariant[]) {
  return JSON.stringify(variants)
}

export function readParallaxLabDraft(gameId: string, fallback: GameWelcomeVariant[]) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${gameId}`)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as { base?: string, variants?: GameWelcomeVariant[] }
    if (!parsed || parsed.base !== productionFingerprint(fallback) || !Array.isArray(parsed.variants)) return fallback
    return parsed.variants
  } catch {
    return fallback
  }
}

export function writeParallaxLabDraft(gameId: string, variants: GameWelcomeVariant[], productionVariants: GameWelcomeVariant[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${DRAFT_PREFIX}${gameId}`, JSON.stringify({
      base: productionFingerprint(productionVariants),
      variants,
    }))
  } catch {
    // A tuning tool must never break the actual game if storage is unavailable.
  }
}

export function clearParallaxLabDraft(gameId: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(`${DRAFT_PREFIX}${gameId}`)
  } catch {
    // Ignore storage failures.
  }
}

type Props = {
  gameId: string
  title: string
  variants: GameWelcomeVariant[]
  productionVariants: GameWelcomeVariant[]
  setVariants: Dispatch<SetStateAction<GameWelcomeVariant[]>>
  selectedVariantId: string
  onSelectedVariantId: (id: string) => void
  simulatedScore: number
  onSimulatedScore: (score: number) => void
  showGuides: boolean
  onShowGuides: (value: boolean) => void
}

type RangeProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

function RangeControl({ label, value, min, max, step = 1, unit = '', onChange }: RangeProps) {
  return (
    <label className="mf-lab-range">
      <span><b>{label}</b><em>{Number(value.toFixed(2))}{unit}</em></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function cloneVariant(variant: GameWelcomeVariant) {
  return JSON.parse(JSON.stringify(variant)) as GameWelcomeVariant
}

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // Fall through to the old synchronous clipboard path.
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function updateLayerInVariant(
  variants: GameWelcomeVariant[],
  variantId: string,
  layerIndex: number,
  updater: (layer: GameWelcomeLayer) => GameWelcomeLayer,
) {
  return variants.map((variant) => {
    if (variant.id !== variantId || !variant.layers?.[layerIndex]) return variant
    const layers = variant.layers.map((layer, index) => index === layerIndex ? updater(layer) : layer)
    return { ...variant, layers }
  })
}

export function ParallaxLab({
  gameId,
  title,
  variants,
  productionVariants,
  setVariants,
  selectedVariantId,
  onSelectedVariantId,
  simulatedScore,
  onSimulatedScore,
  showGuides,
  onShowGuides,
}: Props) {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const [copyState, setCopyState] = useState('')
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0]
  const productionVariant = productionVariants.find((variant) => variant.id === selectedVariant?.id)
  const selectedLayer = selectedVariant?.layers?.[selectedLayerIndex]
  const tuning = selectedLayer ? resolveWelcomeLayer(selectedLayer) : null
  const unlockedCount = useMemo(
    () => variants.filter((variant) => simulatedScore >= (variant.unlockScore ?? 0)).length,
    [simulatedScore, variants],
  )

  useEffect(() => {
    setSelectedLayerIndex(0)
  }, [selectedVariantId])

  const updateVariant = (patch: Partial<GameWelcomeVariant>) => {
    if (!selectedVariant) return
    setVariants((current) => current.map((variant) => variant.id === selectedVariant.id ? { ...variant, ...patch } : variant))
  }

  const updateLayer = (patch: Partial<GameWelcomeLayer>) => {
    if (!selectedVariant || !selectedLayer) return
    setVariants((current) => updateLayerInVariant(current, selectedVariant.id, selectedLayerIndex, (layer) => ({ ...layer, ...patch })))
  }

  const updateMotion = (patch: NonNullable<GameWelcomeLayer['motion']>) => {
    if (!selectedLayer || !tuning) return
    updateLayer({ motion: { ...tuning.motion, ...patch } })
  }

  const updateFx = (patch: NonNullable<GameWelcomeLayer['fx']>) => {
    if (!selectedLayer || !tuning) return
    updateLayer({ fx: { ...tuning.fx, ...patch } })
  }

  const resetVariant = () => {
    if (!selectedVariant || !productionVariant) return
    setVariants((current) => current.map((variant) => variant.id === selectedVariant.id ? cloneVariant(productionVariant) : variant))
  }

  const resetAll = () => {
    clearParallaxLabDraft(gameId)
    setVariants(productionVariants.map(cloneVariant))
    onSelectedVariantId(productionVariants[0]?.id ?? '')
    onSimulatedScore(0)
  }

  const copyConfig = async (all = false) => {
    const payload = all
      ? { gameId, variants }
      : { gameId, variant: selectedVariant }
    const marker = all
      ? `MINIFUGG_PARALLAX_CONFIG v1 — game=${gameId} — all-variants`
      : `MINIFUGG_PARALLAX_CONFIG v1 — game=${gameId} — variant=${selectedVariant?.id ?? 'unknown'}`
    await writeClipboard(`${marker}\n${JSON.stringify(payload, null, 2)}`)
    setCopyState(all ? 'Tout copié' : 'Variante copiée')
    window.setTimeout(() => setCopyState(''), 1600)
  }

  return (
    <aside className="mf-parallax-lab" data-mf-parallax-lab onPointerDown={(event) => event.stopPropagation()}>
      <header className="mf-lab-head">
        <div><small>MiniFugg · Parallax Lab</small><strong>{title}</strong></div>
        <label className="mf-lab-guides"><input type="checkbox" checked={showGuides} onChange={(event) => onShowGuides(event.target.checked)} /> Guides</label>
      </header>

      <section className="mf-lab-section">
        <div className="mf-lab-section-title"><strong>Jaquettes</strong><span>{unlockedCount}/{variants.length} simulées</span></div>
        <div className="mf-lab-variants">
          {variants.map((variant, index) => {
            const unlocked = simulatedScore >= (variant.unlockScore ?? 0)
            return (
              <button
                type="button"
                className={variant.id === selectedVariant?.id ? 'is-active' : ''}
                onClick={() => onSelectedVariantId(variant.id)}
                key={variant.id}
              >
                <b>{index + 1}</b><span>{variant.label}</span><em>{unlocked ? '●' : '○'} {(variant.unlockScore ?? 0).toLocaleString()}</em>
              </button>
            )
          })}
        </div>
        <RangeControl label="Score simulé" value={simulatedScore} min={0} max={100000} step={500} onChange={onSimulatedScore} />
        {selectedVariant && (
          <label className="mf-lab-number-row">
            <span>Score de déblocage</span>
            <input type="number" min={0} step={500} value={selectedVariant.unlockScore ?? 0} onChange={(event) => updateVariant({ unlockScore: Math.max(0, Number(event.target.value) || 0) })} />
          </label>
        )}
      </section>

      <section className="mf-lab-section">
        <div className="mf-lab-section-title"><strong>Calques</strong><span>{selectedVariant?.layers?.length ?? 0}</span></div>
        {selectedVariant?.layers?.length ? (
          <>
            <div className="mf-lab-layers">
              {selectedVariant.layers.map((layer, index) => (
                <button type="button" className={selectedLayerIndex === index ? 'is-active' : ''} onClick={() => setSelectedLayerIndex(index)} key={`${layer.role}-${index}`}>
                  <b>{layer.role}</b><small>{layer.image.split('/').at(-1)}</small>
                </button>
              ))}
            </div>

            {selectedLayer && tuning && (
              <div className="mf-lab-controls">
                <h4>Transform</h4>
                <RangeControl label="Taille" value={tuning.scale} min={60} max={160} step={.5} unit="%" onChange={(scale) => updateLayer({ scale })} />
                <RangeControl label="Position X" value={tuning.x} min={-40} max={40} step={.25} unit="%" onChange={(x) => updateLayer({ x })} />
                <RangeControl label="Position Y" value={tuning.y} min={-40} max={40} step={.25} unit="%" onChange={(y) => updateLayer({ y })} />
                <RangeControl label="Rotation" value={tuning.rotation} min={-20} max={20} step={.25} unit="°" onChange={(rotation) => updateLayer({ rotation })} />
                <RangeControl label="Opacité" value={tuning.opacity} min={0} max={100} unit="%" onChange={(opacity) => updateLayer({ opacity })} />

                <h4>Parallax</h4>
                <RangeControl label="Amplitude X" value={tuning.parallaxX} min={0} max={35} step={.25} unit="px" onChange={(parallaxX) => updateLayer({ parallaxX })} />
                <RangeControl label="Amplitude Y" value={tuning.parallaxY} min={0} max={35} step={.25} unit="px" onChange={(parallaxY) => updateLayer({ parallaxY })} />

                <h4>Mouvement autonome</h4>
                <label className="mf-lab-select-row"><span>Type</span><select value={tuning.motion.type} onChange={(event) => updateMotion({ ...tuning.motion, type: event.target.value as GameWelcomeMotionType })}>
                  {(['none', 'float', 'vibrate', 'breathe', 'drift', 'sway'] as GameWelcomeMotionType[]).map((type) => <option value={type} key={type}>{type}</option>)}
                </select></label>
                <RangeControl label="Intensité" value={tuning.motion.intensity} min={0} max={20} step={.25} unit="px" onChange={(intensity) => updateMotion({ ...tuning.motion, intensity })} />
                <RangeControl label="Vitesse" value={tuning.motion.speed} min={.1} max={4} step={.05} unit="×" onChange={(speed) => updateMotion({ ...tuning.motion, speed })} />
                <RangeControl label="Direction" value={tuning.motion.direction} min={-180} max={180} step={1} unit="°" onChange={(direction) => updateMotion({ ...tuning.motion, direction })} />
                <RangeControl label="Irrégularité" value={tuning.motion.irregularity} min={0} max={1} step={.05} onChange={(irregularity) => updateMotion({ ...tuning.motion, irregularity })} />

                <h4>FX</h4>
                <RangeControl label="Flou" value={tuning.fx.blur} min={0} max={12} step={.25} unit="px" onChange={(blur) => updateFx({ ...tuning.fx, blur })} />
                <RangeControl label="Glow" value={tuning.fx.glow} min={0} max={40} step={1} unit="px" onChange={(glow) => updateFx({ ...tuning.fx, glow })} />
              </div>
            )}
          </>
        ) : (
          <p className="mf-lab-empty">Cette jaquette est encore plate. Il faut générer son bundle raster avant de régler le parallaxe.</p>
        )}
      </section>

      <footer className="mf-lab-footer">
        <div className="mf-lab-reset-row"><button type="button" onClick={resetVariant}>Reset variante</button><button type="button" onClick={resetAll}>Reset tout</button></div>
        <button type="button" className="mf-lab-copy" onClick={() => void copyConfig(false)}>Copier la variante</button>
        <button type="button" className="mf-lab-copy secondary" onClick={() => void copyConfig(true)}>Copier tout le jeu</button>
        {copyState && <strong className="mf-lab-copied">{copyState}</strong>}
        <small>Réglages brouillon sauvegardés localement. Rien n’est publié depuis ce panneau.</small>
      </footer>
    </aside>
  )
}
