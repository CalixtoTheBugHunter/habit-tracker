import { useState, useEffect } from 'react'
import './App.css'
import { messages, formatMessage, getDefaultLocale } from './locale'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import { HabitList, HabitForm, OfflineIndicator, InstallPrompt, ErrorBoundary, SettingsButton, Settings } from './components'
import type { Habit } from './types/habit'

function AppContent() {
  const { isLoading, error } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)
  const [showSettings, setShowSettings] = useState(false)

  if (isLoading) {
    return (
      <div className="app">
        <OfflineIndicator />
        <header className="app-header">
          <h1 className="app-header__logo">{messages.app.title}</h1>
          <div role="status" aria-live="polite" aria-atomic="true">
            <p>{messages.app.loading}</p>
          </div>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <OfflineIndicator />
        <header className="app-header">
          <h1 className="app-header__logo">{messages.app.title}</h1>
          <div role="alert" aria-live="assertive" aria-atomic="true">
            <p className="error">{formatMessage(messages.app.error, { error })}</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <SettingsButton onClick={() => setShowSettings(true)} />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <header className="app-header">
        <div className="app-header__content">
          <div>
            <h1 className="app-header__logo">{messages.app.title}</h1>
          </div>
        </div>
        <InstallPrompt />
      </header>
      <main className="app-main">
        <HabitForm
          habit={editingHabit}
          onSuccess={() => setEditingHabit(undefined)}
          onCancel={() => setEditingHabit(undefined)}
        />
        <HabitList onEdit={setEditingHabit} />
      </main>
    </div>
  )
}

function App() {
  useEffect(() => {
    document.documentElement.lang = getDefaultLocale()
  }, [])
  return (
    <ErrorBoundary>
      <HabitProvider>
        <AppContent />
      </HabitProvider>
    </ErrorBoundary>
  )
}

export default App

