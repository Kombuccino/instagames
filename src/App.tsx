import { GameFeed } from './core/GameFeed'
import { gameRegistry } from './core/gameRegistry'

export default function App() {
  return <GameFeed games={gameRegistry} />
}
