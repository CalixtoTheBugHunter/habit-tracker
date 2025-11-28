import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './utils/pwa/registerServiceWorker'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA functionality
registerServiceWorker({
  onSuccess: () => {
    if (import.meta.env.DEV) {
      console.log('Service Worker registered successfully')
    }
  },
  onError: (error) => {
    if (import.meta.env.DEV) {
      console.error('Service Worker registration failed:', error)
    }
  },
})

// Expose dev utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/dev/seedMockHabits').then(({ seedMockHabits }) => {
    ;(window as unknown as { seedMockHabits: () => Promise<void> }).seedMockHabits = seedMockHabits
    console.log('💡 Dev utility available: window.seedMockHabits()')
  })
}

