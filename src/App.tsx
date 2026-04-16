import { useState } from 'react'
import './App.css'
import { formatMessage } from './locale'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import {
  HabitList,
  HabitForm,
  OfflineIndicator,
  ErrorBoundary,
  AppHeader,
  SideMenu,
  Settings,
  StatisticsView,
} from './components'
import type { AppView } from './components'
import type { Habit } from './types/habit'

function AppContent() {
  const { messages } = useLanguage()
  const { isLoading, error } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<AppView>('home')

  const handleNavigate = (view: AppView) => {
    setActiveView(view)
    setEditingHabit(undefined)
  }

  if (isLoading) {
    return (
      <div className="app">
        <OfflineIndicator />
        <AppHeader onMenuToggle={() => setMenuOpen(prev => !prev)} menuOpen={menuOpen} />
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
        <div className="app-loading" role="status" aria-live="polite" aria-atomic="true">
          <p>{messages.app.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <OfflineIndicator />
        <AppHeader onMenuToggle={() => setMenuOpen(prev => !prev)} menuOpen={menuOpen} />
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
        <div className="app-error" role="alert" aria-live="assertive" aria-atomic="true">
          <p className="error">{formatMessage(messages.app.error, { error })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <AppHeader onMenuToggle={() => setMenuOpen(prev => !prev)} menuOpen={menuOpen} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
      <main className="app-main">
        {activeView === 'home' && (
          <>
            <HabitForm
              habit={editingHabit}
              onSuccess={() => setEditingHabit(undefined)}
              onCancel={() => setEditingHabit(undefined)}
            />
            <HabitList onEdit={setEditingHabit} />
          </>
        )}
        {activeView === 'settings' && (
          <Settings onClose={() => setActiveView('home')} />
        )}
        {activeView === 'statistics' && (
          <StatisticsView />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <HabitProvider>
          <AppContent />
        </HabitProvider>
      </ErrorBoundary>
    </LanguageProvider>
  )
}

export default App
