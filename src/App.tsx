import { useState } from 'react'
import { GameFeed } from './core/GameFeed'
import { HomeSplash } from './core/HomeSplash'
import { gameRegistry } from './core/gameRegistry'

function opensDirectlyOnAGame() {
  if (typeof window === 'undefined') return false
  return Boolean(new URL(window.location.href).searchParams.get('game')?.trim())
}

export default function App() {
  const [entered, setEntered] = useState(() => opensDirectlyOnAGame())

  if (!entered) return <HomeSplash onComplete={() => setEntered(true)} />
  return <GameFeed games={gameRegistry} />
}
