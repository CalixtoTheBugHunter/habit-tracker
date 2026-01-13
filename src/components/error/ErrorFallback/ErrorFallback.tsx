import { useEffect, useRef } from 'react'
import type { AppError } from '../../../utils/error/errorTypes'
import './ErrorFallback.css'

interface ErrorFallbackProps {
  error: AppError
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Move focus to the error container when displayed for screen reader support
    containerRef.current?.focus()
  }, [])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div
      ref={containerRef}
      className="error-fallback"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <p className="error-fallback__message">{error.userMessage}</p>
      <button
        type="button"
        onClick={handleReload}
        className="error-fallback__button"
      >
        Reload Page
      </button>
    </div>
  )
}


