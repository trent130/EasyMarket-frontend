"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ 
  children,
  redirectTo = '/auth/signin'
}: { 
  children: React.ReactNode,
  redirectTo?: string
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Function to check auth state
    const checkAuthState = async () => {
      setIsChecking(true);
      
      if (!isAuthenticated && !loading) {
        // Redirect to login if not authenticated
        router.push(redirectTo);
      }
      
      setIsChecking(false);
    };

    checkAuthState();
  }, [isAuthenticated, loading, router, redirectTo]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthState();
    };
    
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const checkAuthState = async () => {
    setIsChecking(true);
    
    if (!isAuthenticated && !loading) {
      // Redirect to login if not authenticated
      router.push(redirectTo);
    }
    
    setIsChecking(false);
  };

  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}