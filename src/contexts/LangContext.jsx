import { createContext, useContext, useState } from 'react'
import { TRANSLATIONS, LANG_STORAGE_KEY } from '../lib/lang'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_STORAGE_KEY) || 'uk')

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem(LANG_STORAGE_KEY, l)
  }

  const t = (path, vars = {}) => {
    const keys = path.split('.')
    let val = keys.reduce((obj, key) => obj?.[key], TRANSLATIONS[lang])
    if (val == null) return path
    return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), val)
  }

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
