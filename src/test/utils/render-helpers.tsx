import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HabitProvider } from '../../contexts/HabitContext'

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <HabitProvider>{children}</HabitProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

