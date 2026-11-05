'use client'

import { useTheme } from '../lib/ThemeContext'
import { getTranslation } from '../lib/i18n'

export default function ThemeToggle() {
  const { theme, toggleTheme, language, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className="toggle-container">
      <label className="toggle-label">
        {getTranslation(language, 'theme')}:
      </label>
      <div className="toggle-button-group">
        <button
          className={`toggle-button ${theme === 'light' ? 'toggle-active' : ''}`}
          onClick={() => toggleTheme('light')}
          aria-label="Light theme"
          title="Light theme"
        >
          ☀️
        </button>
        <button
          className={`toggle-button ${theme === 'dark' ? 'toggle-active' : ''}`}
          onClick={() => toggleTheme('dark')}
          aria-label="Dark theme"
          title="Dark theme"
        >
          🌙
        </button>
      </div>
    </div>
  )
}
