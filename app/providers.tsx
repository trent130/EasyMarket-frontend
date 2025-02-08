'use client';

import { AppProvider } from './AppContext'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  )
}
