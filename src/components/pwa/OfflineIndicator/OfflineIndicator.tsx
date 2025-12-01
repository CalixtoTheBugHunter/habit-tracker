import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import './OfflineIndicator.css'

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(!globalThis.navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <div
      className={`offline-indicator ${className || ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Offline status indicator"
    >
      <WifiOff className="offline-indicator__icon" aria-hidden="true" />
      <span className="offline-indicator__badge">offline</span>
    </div>
  )
}

