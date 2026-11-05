'use client'

import { useTheme } from '../lib/ThemeContext'
import { getTranslation } from '../lib/i18n'

export default function LanguageToggle() {
  const { language, toggleLanguage, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className="toggle-container">
      <label className="toggle-label">
        {getTranslation(language, 'language')}:
      </label>
      <div className="toggle-button-group">
        <button
          className={`toggle-button ${language === 'en' ? 'toggle-active' : ''}`}
          onClick={() => toggleLanguage('en')}
          aria-label="English"
          title="English"
        >
          EN
        </button>
        <button
          className={`toggle-button ${language === 'ko' ? 'toggle-active' : ''}`}
          onClick={() => toggleLanguage('ko')}
          aria-label="Korean"
          title="Korean"
        >
          KO
        </button>
      </div>
    </div>
  )
}
