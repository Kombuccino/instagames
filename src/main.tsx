import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './core/coreIcons.css'
import './core/actionDock.css'
import './core/orientation.css'
import './core/gameLayout.css'
import './core/comments.css'
import './core/profileLeaderboard.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
