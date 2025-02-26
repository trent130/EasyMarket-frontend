'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { AppProvider } from './AppContext'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures correct hydration
  }, []);

  if (!mounted) return null; // Prevents hydration mismatch

  //<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  //Switch Theme
  //</button>

  return (
    <ThemeProvider >
      <AuthProvider>
        <AppProvider>
          {children}
        </AppProvider>
      </AuthProvider>

    </ThemeProvider>
  )
}




