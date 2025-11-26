// hooks/useProtectedRoute.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to protect routes from unauthorized access
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { user, isLoading, initializeUser } = useAuth();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}