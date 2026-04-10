import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultLanguage,
  isSupportedLocale,
  supportedLanguages,
} from '../config/supportedLanguages'
import type { LocaleCode } from '../locale/types'
import { getMessagesForLocale } from '../locale'
import { getDeviceLocale } from '../locale/defaultLocale'
import {
  getPreferredLanguage,
  setPreferredLanguage as persistPreferredLanguage,
} from '../services/languageStorage'

const LOADING_LOCALE: LocaleCode = defaultLanguage

interface LanguageContextValue {
  locale: LocaleCode
  messages: ReturnType<typeof getMessagesForLocale>
  setLanguage: (locale: LocaleCode) => Promise<void>
  supportedLanguages: typeof supportedLanguages
  isReady: boolean
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

interface LanguageProviderProps {
  children: ReactNode
  /** When set, skips IndexedDB and enables the provider synchronously (tests). */
  initialLocale?: LocaleCode
}

export function LanguageProvider({
  children,
  initialLocale,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(
    () => initialLocale ?? LOADING_LOCALE
  )
  const [isReady, setIsReady] = useState(() => initialLocale !== undefined)
  const mountedRef = useRef(true)

  const loadingMessages = useMemo(
    () => getMessagesForLocale(LOADING_LOCALE),
    []
  )

  useEffect(() => {
    if (initialLocale !== undefined) {
      document.documentElement.lang = initialLocale
      return
    }

    mountedRef.current = true

    async function init() {
      try {
        const stored = await getPreferredLanguage()
        let next: LocaleCode
        if (stored !== undefined) {
          next = stored
        } else {
          next = getDeviceLocale()
          await persistPreferredLanguage(next)
        }
        if (mountedRef.current) {
          setLocaleState(next)
          setIsReady(true)
        }
      } catch {
        if (mountedRef.current) {
          setLocaleState(defaultLanguage)
          setIsReady(true)
        }
      }
    }

    void init()
    return () => {
      mountedRef.current = false
    }
  }, [initialLocale])

  useEffect(() => {
    if (isReady) {
      document.documentElement.lang = locale
    }
  }, [locale, isReady])

  const setLanguage = useCallback(async (code: string) => {
    if (!isSupportedLocale(code)) return
    setLocaleState(code)
    await persistPreferredLanguage(code)
  }, [])

  const messages = useMemo(() => getMessagesForLocale(locale), [locale])

  const value = useMemo(
    (): LanguageContextValue => ({
      locale,
      messages,
      setLanguage,
      supportedLanguages,
      isReady,
    }),
    [locale, messages, setLanguage, isReady]
  )

  if (!isReady) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-header__logo">{loadingMessages.app.title}</h1>
          <div role="status" aria-live="polite" aria-atomic="true">
            <p>{loadingMessages.app.loading}</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
