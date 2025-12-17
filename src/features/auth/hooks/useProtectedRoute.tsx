// hooks/useProtectedRoute.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useState } from 'react';

/**
 * Hook to protect routes from unauthorized access
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { user, isLoading, initializeUser } = useAuth();
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    initializeUser().finally(() => setInitDone(true));
  }, [initializeUser]);

  useEffect(() => {
    if (initDone && !isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, initDone, router]);

  return { user, isLoading };
}