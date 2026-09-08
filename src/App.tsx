import { useState } from 'react'
import { GameFeed } from './core/GameFeed'
import { LayoutLab, type LayoutTemplate } from './core/LayoutLab'
import { MusicLab } from './core/MusicLab'
import { PlatformEntryScene } from './core/PlatformEntryScene'
import { gameRegistry } from './core/gameRegistry'

function opensDirectlyOnAGame() {
  if (typeof window === 'undefined') return false
  return Boolean(new URL(window.location.href).searchParams.get('game')?.trim())
}

function opensMusicLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'music'
}

function opensLayoutLab() {
  if (typeof window === 'undefined') return false
  const query = new URL(window.location.href).searchParams
  return query.get('usr') === 'moigod' && query.get('lab') === 'layout'
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
  const [entered, setEntered] = useState(() => opensDirectlyOnAGame())

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
