'use client'

import { useTheme } from '../lib/ThemeContext'
import { getTranslation } from '../lib/i18n'
import styles from './ThemeToggle.module.css'

export default function LanguageToggle() {
  const { language, toggleLanguage, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.label}>
        {getTranslation(language, 'language')}:
      </label>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
          onClick={() => toggleLanguage('en')}
          aria-label="English"
          title="English"
        >
          EN
        </button>
        <button
          className={`${styles.button} ${language === 'ko' ? styles.active : ''}`}
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
