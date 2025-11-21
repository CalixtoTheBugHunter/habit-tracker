import './App.css'
import { HabitProvider, useHabits } from './contexts/HabitContext'

function AppContent() {
  const { habits, isLoading, error } = useHabits()

  if (isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Habit Tracker</h1>
          <p>Loading...</p>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Habit Tracker</h1>
          <p className="error">Error: {error}</p>
        </header>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Habit Tracker</h1>
        <p>A simple, free and offline habit tracker</p>
        <p>Total habits: {habits.length}</p>
      </header>
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

