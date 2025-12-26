import { useState } from 'react'
import './App.css'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import { HabitList, HabitForm, OfflineIndicator, InstallPrompt } from './components'
import type { Habit } from './types/habit'

function AppContent() {
  const { isLoading, error } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)

  if (isLoading) {
    return (
      <div className="app">
        <OfflineIndicator />
        <header className="app-header">
          <h1 className="app-header__logo">Habit Tracker</h1>
          <div role="status" aria-live="polite" aria-atomic="true">
            <p>Loading...</p>
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
          <h1 className="app-header__logo">Habit Tracker</h1>
          <div role="alert" aria-live="assertive" aria-atomic="true">
            <p className="error">Error: {error}</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <header className="app-header">
        <div className="app-header__content">
          <div>
            <h1 className="app-header__logo">Habit Tracker</h1>
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
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  )
}

export default App

