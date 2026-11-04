'use client'

import { useState } from 'react'
import { useTheme } from '../lib/ThemeContext'
import { getTranslation } from '../lib/i18n'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { theme, toggleTheme, language, mounted } = useTheme()

  if (!mounted) return null

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.label}>
        {getTranslation(language, 'theme')}:
      </label>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${theme === 'light' ? styles.active : ''}`}
          onClick={() => toggleTheme('light')}
          aria-label="Light theme"
          title="Light theme"
        >
          ☀️
        </button>
        <button
          className={`${styles.button} ${theme === 'dark' ? styles.active : ''}`}
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
