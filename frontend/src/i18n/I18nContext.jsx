import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SUPPORTED_LANGUAGES, translations } from './translations'

const DEFAULT_LANGUAGE = 'fr'
const STORAGE_KEY = 'maccam-language'

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
})

function getNestedValue(object, path) {
  return path.split('.').reduce((current, segment) => current?.[segment], object)
}

function interpolate(template, params = {}) {
  if (typeof template !== 'string') return template
  return Object.entries(params).reduce(
    (result, [paramKey, paramValue]) => result.replaceAll(`{{${paramKey}}}`, String(paramValue)),
    template,
  )
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY)
  if (savedLanguage && SUPPORTED_LANGUAGES.some((language) => language.code === savedLanguage)) {
    return savedLanguage
  }
  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const contextValue = useMemo(() => {
    const t = (key, params = {}) => {
      const currentLanguageValue = getNestedValue(translations[language], key)
      const defaultLanguageValue = getNestedValue(translations[DEFAULT_LANGUAGE], key)
      const finalValue = currentLanguageValue ?? defaultLanguageValue ?? key
      return interpolate(finalValue, params)
    }

    return {
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }
  }, [language])

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
