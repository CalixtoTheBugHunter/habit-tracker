import { Component, type ReactNode, type ErrorInfo } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { ReactError, createAppError } from '../../../utils/error/errorTypes'
import { logError } from '../../../utils/error/errorLogger'
import { ErrorFallback } from '../ErrorFallback/ErrorFallback'

interface ErrorBoundaryInnerProps {
  children: ReactNode
  reactRenderErrorMessage: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: ReactError | null
}

function buildReactError(
  reactRenderErrorMessage: string,
  error: unknown,
  errorInfo?: ErrorInfo
): ReactError {
  const appError = createAppError(
    error,
    'REACT_RENDER_ERROR',
    reactRenderErrorMessage,
    errorInfo
      ? {
          componentStack: errorInfo.componentStack,
        }
      : undefined
  )
  return new ReactError(
    appError.code as 'REACT_RENDER_ERROR',
    appError.userMessage,
    appError.technicalDetails,
    appError.context
  )
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryInnerProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    const reactError = buildReactError(
      this.props.reactRenderErrorMessage,
      error,
      errorInfo
    )
    this.setState({ error: reactError })
    logError(reactError, { componentStack: errorInfo.componentStack })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />
    }
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

interface ErrorBoundaryProps {
  children: ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const { messages } = useLanguage()
  return (
    <ErrorBoundaryInner
      reactRenderErrorMessage={messages.errorBoundary.reactRenderError}
    >
      {children}
    </ErrorBoundaryInner>
  )
}
