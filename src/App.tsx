import './App.css'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import { HabitList } from './components/HabitList'

function AppContent() {
  const { habits, isLoading, error } = useHabits()

  if (isLoading) {
    return (
      <div className="app">
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
      <header className="app-header">
        <h1>Habit Tracker</h1>
        <p>A simple, free and offline habit tracker</p>
        <p>Total habits: {habits.length}</p>
      </header>
      <main className="app-main">
        <HabitList />
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

