'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [mounted, setMounted] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedLanguage = localStorage.getItem('language') || 'en'
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    setMounted(true)
    
    // Apply theme
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme) => {
    const root = document.documentElement
    root.setAttribute('data-theme', newTheme)
    root.style.colorScheme = newTheme
  }

  const toggleTheme = (newTheme) => {
    const themes = ['light', 'dark']
    const nextTheme = newTheme || themes[(themes.indexOf(theme) + 1) % themes.length]
    
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    applyTheme(nextTheme)
  }

  const toggleLanguage = (newLanguage) => {
    const languages = ['en', 'ko']
    const nextLanguage = newLanguage || languages[(languages.indexOf(language) + 1) % languages.length]
    
    setLanguage(nextLanguage)
    localStorage.setItem('language', nextLanguage)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        toggleLanguage,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
