import { ReactElement, ReactNode, Component, ErrorInfo } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HabitProvider } from '../../contexts/HabitContext'

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <HabitProvider>{children}</HabitProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
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

