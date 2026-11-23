import { Route, Routes } from 'react-router'
import Player from './components/Player'
import TTSPage from './pages/TTSPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Player />} />
      <Route path="/tts" element={<TTSPage />} />
    </Routes>
  )
}
