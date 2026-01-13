import type { AppError } from '../../../utils/error/errorTypes'
import './ErrorFallback.css'

interface ErrorFallbackProps {
  error: AppError
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="error-fallback" role="alert" aria-live="assertive">
      <p className="error-fallback__message">{error.userMessage}</p>
    </div>
  )
}


