import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Expose dev utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/dev/seedMockHabits').then(({ seedMockHabits }) => {
    ;(window as unknown as { seedMockHabits: () => Promise<void> }).seedMockHabits = seedMockHabits
    console.log('💡 Dev utility available: window.seedMockHabits()')
  })
}

