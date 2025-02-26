"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, refreshSession } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Function to check auth state and attempt refresh if needed
    const checkAuthState = async () => {
      setIsChecking(true);
      
      if (!isAuthenticated && !loading) {
        // Try to refresh the session before redirecting
        const refreshed = await refreshSession();
        if (!refreshed) {
          router.push('/auth/signin');
        }
      }
      
      setIsChecking(false);
    };

    checkAuthState();
  }, [isAuthenticated, loading, refreshSession, router]);

  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}