import { useState } from 'react'
import { GameFeed } from './core/GameFeed'
import { CoverCalibrationLab } from './core/CoverCalibrationLab'
import { GameplayCalibrationLab } from './core/GameplayCalibrationLab'
import { GameplayCalibrationRuntime } from './core/GameplayCalibrationRuntime'
import { HomeBisLab } from './core/HomeBisLab'
import { LayoutLab, type LayoutTemplate } from './core/LayoutLab'
import { MusicLab } from './core/MusicLab'
import { PlatformEntryScene } from './core/PlatformEntryScene'
import { ProductionLab } from './core/ProductionLab'
import { gameRegistry } from './core/gameRegistry'

function opensDirectlyOnAGame() {
  if (typeof window === 'undefined') return false
  return Boolean(new URL(window.location.href).searchParams.get('game')?.trim())
}

function forcesPlatformEntryScene() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('entry') === '1'
}

function opensMusicLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'music'
}

function opensProductionLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'production'
}

function opensLayoutLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'layout'
}

function opensCoverCalibrationLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'layout' && query.get('view') === 'cover-calibration'
}

function opensGameplayCalibrationLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'layout' && query.get('view') === 'gameplay-calibration'
}

function opensGameplayCalibrationRuntime() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'gameplay-runtime'
}

function opensHomeBisLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'home-bis'
}

function opensHomeBisEntryTest() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'home-bis' && query.get('entry') === '1'
}

function layoutGuideView(): LayoutTemplate | null {
  if (typeof window === 'undefined') return null
  const query = new URL(window.location.href).searchParams
  if (query.get('usr') !== 'moigod' || query.get('lab') !== 'layout') return null
  const view = query.get('view')
  if (view === 'portrait') return 'cover'
  if (view === 'home' || view === 'cover' || view === 'cover-beta' || view === 'cover-caca' || view === 'game' || view === 'game-over' || view === 'ladder') return view
  return null
}

export default function App() {
  const [entered, setEntered] = useState(() => opensDirectlyOnAGame() && !forcesPlatformEntryScene())
  const [homeBisEntered, setHomeBisEntered] = useState(() => !opensHomeBisEntryTest())
  const [homeBisArm, setHomeBisArm] = useState<string | null>(null)

  if (opensGameplayCalibrationRuntime()) return <GameplayCalibrationRuntime />
  if (opensProductionLab()) return <ProductionLab />
  if (opensHomeBisLab()) return (
    <>
      <HomeBisLab handoffArm={homeBisArm} />
      {!homeBisEntered && <PlatformEntryScene handoff="home-bis" onLaunch={(arm) => { setHomeBisArm(arm); setHomeBisEntered(true) }} />}
    </>
  )
  if (opensCoverCalibrationLab()) return <CoverCalibrationLab />
  if (opensGameplayCalibrationLab()) return <GameplayCalibrationLab />
  const guideView = layoutGuideView()
  if (guideView) return <LayoutLab focus={guideView} />
  if (opensLayoutLab()) return <LayoutLab />
  if (opensMusicLab()) return <MusicLab />

  return (
    <>
      <GameFeed games={gameRegistry} />
      {!entered && <PlatformEntryScene onLaunch={() => setEntered(true)} />}
    </>
  )
}
