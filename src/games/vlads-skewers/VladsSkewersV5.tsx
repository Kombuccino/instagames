import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { VladsSkewers as VladsSkewersV4 } from './VladsSkewersV4'
import './VladsSkewers.v5.css'

type LevelCard = {
  token: number
  level: number
} | null

const GORE_PER_IMPALEMENT = 9
const MAX_GORE_BITS = 72

function impactsInside(node: Node) {
  if (!(node instanceof HTMLElement)) return [] as HTMLElement[]
  const impacts: HTMLElement[] = []
  if (node.matches('.vlad-impact')) impacts.push(node)
  impacts.push(...Array.from(node.querySelectorAll<HTMLElement>('.vlad-impact')))
  return impacts
}

function deliveriesInside(node: Node) {
  if (!(node instanceof HTMLElement)) return 0
  let count = node.matches('.vlad-delivery') ? 1 : 0
  count += node.querySelectorAll('.vlad-delivery').length
  return count
}

export function VladsSkewers(props: GameComponentProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const goreLayerRef = useRef<HTMLDivElement | null>(null)
  const servedRef = useRef(0)
  const levelTimerRef = useRef<number | null>(null)
  const levelTokenRef = useRef(1)
  const [levelCard, setLevelCard] = useState<LevelCard>({ token: 1, level: 1 })

  const showLevel = (level: number) => {
    levelTokenRef.current += 1
    setLevelCard({ token: levelTokenRef.current, level })
    if (levelTimerRef.current !== null) window.clearTimeout(levelTimerRef.current)
    levelTimerRef.current = window.setTimeout(() => setLevelCard(null), 1250)
  }

  useEffect(() => {
    servedRef.current = 0
    showLevel(1)
    return () => {
      if (levelTimerRef.current !== null) window.clearTimeout(levelTimerRef.current)
    }
    // The replay token is intentionally the reset boundary for the cosmetic level tracker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.restartToken])

  useEffect(() => {
    const shell = shellRef.current
    const goreLayer = goreLayerRef.current
    if (!shell || !goreLayer) return

    const spawnGore = (impact: HTMLElement) => {
      const juice = impact.style.getPropertyValue('--juice').trim() || '#c9362b'
      const left = impact.style.left || '45%'
      const top = impact.style.top || '45%'
      const isMeat = impact.classList.contains('is-meat')
      const amount = GORE_PER_IMPALEMENT + (isMeat ? 3 : 0)

      for (let index = 0; index < amount; index += 1) {
        const bit = document.createElement('i')
        const chunk = index % 3 === 0
        bit.className = `vlad-gore-bit ${chunk ? 'is-chunk' : 'is-drop'}`
        bit.style.left = left
        bit.style.top = top
        bit.style.setProperty('--gore', juice)
        bit.style.setProperty('--gore-x', `${Math.round((Math.random() - 0.5) * (chunk ? 150 : 110))}px`)
        bit.style.setProperty('--gore-rot', `${Math.round((Math.random() - 0.5) * 600)}deg`)
        bit.style.setProperty('--gore-delay', `${Math.round(Math.random() * 180)}ms`)
        bit.style.setProperty('--gore-time', `${(2.15 + Math.random() * 1.65).toFixed(2)}s`)
        bit.style.setProperty('--gore-size', `${chunk ? 7 + Math.round(Math.random() * 9) : 4 + Math.round(Math.random() * 6)}px`)
        goreLayer.appendChild(bit)
        bit.addEventListener('animationend', () => bit.remove(), { once: true })
      }

      while (goreLayer.childElementCount > MAX_GORE_BITS) goreLayer.firstElementChild?.remove()
    }

    const observer = new MutationObserver((mutations) => {
      let deliveries = 0
      for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
          impactsInside(added).forEach(spawnGore)
          deliveries += deliveriesInside(added)
        }
      }

      for (let index = 0; index < deliveries; index += 1) {
        servedRef.current += 1
        if (servedRef.current % 3 === 0) showLevel(1 + Math.floor(servedRef.current / 3))
      }
    })

    observer.observe(shell, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={shellRef} className="vlad-v5-shell">
      <VladsSkewersV4 {...props} />
      <div ref={goreLayerRef} className="vlad-gore-rain" aria-hidden="true" />
      {levelCard && (
        <div className="vlad-level-card" key={levelCard.token} aria-hidden="true">
          <strong>NIVEAU {levelCard.level}</strong>
          <span>— 3 CLIENTS —</span>
        </div>
      )}
    </div>
  )
}
