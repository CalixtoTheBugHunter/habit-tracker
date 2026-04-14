import { ReactElement, ReactNode, Component, ErrorInfo } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HabitProvider } from '../../contexts/HabitContext'
import { LanguageProvider } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  initialLocale?: LocaleCode
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialLocale = 'en', ...renderOptions } = options ?? {}

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LanguageProvider initialLocale={initialLocale}>
        <HabitProvider>{children}</HabitProvider>
      </LanguageProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

interface ErrorBoundaryProps {
  children: ReactNode
  onError: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

export function renderWithErrorBoundary(
  ui: ReactElement,
  onError: (error: Error, errorInfo: ErrorInfo) => void
) {
  return render(
    <ErrorBoundary onError={onError}>
      {ui}
    </ErrorBoundary>
  )
}
