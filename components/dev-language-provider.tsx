'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type DevLanguage = 'en' | 'ko'
export const DEV_LANGUAGE_SELECTOR_ENABLED = process.env.NODE_ENV === 'development'

const DevLanguageContext = createContext<{
  language: DevLanguage
  setLanguage: (language: DevLanguage) => void
}>({ language: 'en', setLanguage: () => {} })

export function DevLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<DevLanguage>('en')

  function setLanguage(next: DevLanguage) {
    if (!DEV_LANGUAGE_SELECTOR_ENABLED) return
    setLanguageState(next)
  }

  return (
    <DevLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </DevLanguageContext.Provider>
  )
}

export function useDevLanguage() {
  return useContext(DevLanguageContext)
}
