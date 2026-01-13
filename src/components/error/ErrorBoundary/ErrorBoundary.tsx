import { Component, type ReactNode, type ErrorInfo } from 'react'
import { ReactError, createAppError } from '../../../utils/error/errorTypes'
import { logError } from '../../../utils/error/errorLogger'
import { ErrorFallback } from '../ErrorFallback/ErrorFallback'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: ReactError | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  private static createReactError(
    error: unknown,
    errorInfo?: ErrorInfo
  ): ReactError {
    const appError = createAppError(
      error,
      'REACT_RENDER_ERROR',
      'Something went wrong. Please refresh the page.',
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

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const reactError = ErrorBoundary.createReactError(error)
    return { hasError: true, error: reactError }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const reactError = ErrorBoundary.createReactError(error, errorInfo)
    logError(reactError, { componentStack: errorInfo.componentStack })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}


