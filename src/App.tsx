import { useState } from 'react'
import './App.css'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import { HabitList } from './components/HabitList'
import { HabitForm } from './components/HabitForm'
import { OfflineIndicator } from './components/OfflineIndicator'
import type { Habit } from './types/habit'

function AppContent() {
  const { habits, isLoading, error } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)

  if (isLoading) {
    return (
      <div className="app">
        <OfflineIndicator />
        <header className="app-header">
          <h1>Habit Tracker</h1>
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
          <h1>Habit Tracker</h1>
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
        <h1>Habit Tracker</h1>
        <p>A simple, free and offline habit tracker</p>
        <p>Total habits: {habits.length}</p>
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

