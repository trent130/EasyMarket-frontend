'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Providers } from '../providers';
import Navigation from './Navigation';
import Layout from './Layout';
import DashboardLayout from './DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <AuthProvider>
      <SessionProvider>
        <Providers>
          <div className="mb-15">
            <Navigation />
          </div>
          <main className={`mx-auto mt-2 ${isDashboard ? 'bg-gray-100' : ''}`}>
            {isDashboard ? (
              <DashboardLayout>{children}</DashboardLayout>
            ) : (
              <Layout>{children}</Layout>
            )}
          </main>
        </Providers>
      </SessionProvider>
    </AuthProvider>
  );
} 