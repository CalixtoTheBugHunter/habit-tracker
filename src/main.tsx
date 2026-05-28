import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadScript } from './analytics/umami'
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
loadScript()

// Register service worker for PWA functionality
registerServiceWorker({
  onUpdate: (registration) => {
    window.dispatchEvent(new CustomEvent('sw-update-ready', { detail: { registration } }))
  },
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
  import('./utils/dev/seedMockHabits').then(({ seedMockHabits, seedGoalDaysStreakAcceptance }) => {
    const devWindow = window as unknown as {
      seedMockHabits: () => Promise<void>
      seedGoalDaysStreakAcceptance: () => Promise<void>
    }
    devWindow.seedMockHabits = seedMockHabits
    devWindow.seedGoalDaysStreakAcceptance = seedGoalDaysStreakAcceptance
    console.log('💡 Dev utilities: window.seedMockHabits(), window.seedGoalDaysStreakAcceptance()')
  })
}

