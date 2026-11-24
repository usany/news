import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import { ThemeProvider } from './lib/ThemeContext'
import Player from './components/Player'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Player />
    </ThemeProvider>
  </StrictMode>,
)
