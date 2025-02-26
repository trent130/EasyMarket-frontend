'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const publicPaths = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublicPath = publicPaths.includes(pathname);
      
      // Only redirect if:
      // 1. User is not authenticated and trying to access protected route
      // 2. User is authenticated and trying to access auth pages
      if (!isAuthenticated && !isPublicPath) {
        router.replace('/auth/signin');
      } else if (isAuthenticated && isPublicPath) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname]);

  // Don't render anything while loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Don't render sign-in page if already authenticated
  if (isAuthenticated && publicPaths.includes(pathname)) {
    return null;
  }

  // Don't render protected pages if not authenticated
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null;
  }

  return children;
} 