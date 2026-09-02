import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './core/coreIcons.css'
import './core/actionDock.css'
import './core/curationBadges.css'
import './core/orientation.css'
import './core/gameLayout.css'
import './core/comments.css'
import './core/commentPlayerIcons.css'
import './core/profileLeaderboard.css'
import './core/desktopDock.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
