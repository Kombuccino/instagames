import { useState } from 'react'
import { GameFeed } from './core/GameFeed'
import { HomeSplash } from './core/HomeSplash'
import { MusicLab } from './core/MusicLab'
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

export default function App() {
  const [entered, setEntered] = useState(() => opensDirectlyOnAGame())

  if (opensMusicLab()) return <MusicLab />
  if (!entered) return <HomeSplash onComplete={() => setEntered(true)} />
  return <GameFeed games={gameRegistry} />
}
