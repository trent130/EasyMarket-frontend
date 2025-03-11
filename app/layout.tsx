"use client";

import './globals.css';
import { SessionProvider } from 'next-auth/react'
import Navigation from './components/Navigation'
import { Providers } from './providers'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/dist/client/components/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  // checks if the route is associated with the dashboard route
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      <body className={isDashboard ? 'bg-gray-100' : ''}>
        <AuthProvider>
          <>
            <SessionProvider>
              <Providers>
                <div className="mb-15">
                  <Navigation />
                </div>
                <main className="mx-auto mt-2">
                  {/* conditional rendering of layouts */}
                  {isDashboard ? (
                    <DashboardLayout>{children}</DashboardLayout>
                  ) : (
                    <Layout>{children}</Layout>
                  )}
                </main>
              </Providers>
            </SessionProvider>
          </>
        </AuthProvider>
      </body>
    </html>
  );
}