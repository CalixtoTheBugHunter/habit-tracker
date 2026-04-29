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
  getPreferredTheme,
  setPreferredTheme as persistPreferredTheme,
  type ThemePreference,
} from '../services/themeStorage'

type ResolvedTheme = 'light' | 'dark'

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}

function getSystemResolvedTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'
}

function applyThemeAttribute(theme: ThemePreference): void {
  if (typeof document === 'undefined') return
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

interface ThemeProviderProps {
  children: ReactNode
  /** When set, skips IndexedDB and initializes synchronously (tests). */
  initialTheme?: ThemePreference
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(
    () => initialTheme ?? 'system'
  )
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(() =>
    getSystemResolvedTheme()
  )
  const mountedRef = useRef(true)

  useEffect(() => {
    if (initialTheme !== undefined) {
      applyThemeAttribute(initialTheme)
      return
    }

    mountedRef.current = true

    async function init() {
      try {
        const stored = await getPreferredTheme()
        if (mountedRef.current && stored !== undefined) {
          setThemeState(stored)
          applyThemeAttribute(stored)
        }
      } catch {
        // fall back to 'system'; no-op
      }
    }

    void init()
    return () => {
      mountedRef.current = false
    }
  }, [initialTheme])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mql = window.matchMedia(DARK_MEDIA_QUERY)
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemResolved(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback(async (next: ThemePreference) => {
    setThemeState(next)
    applyThemeAttribute(next)
    await persistPreferredTheme(next)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemResolved : theme

  const value = useMemo(
    (): ThemeContextValue => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
