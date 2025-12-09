// hooks/useAdminRoute.ts

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Protects admin-only client routes.
 * - Waits for initializeUser() to finish once
 * - Then redirects if no user or non-admin
 */
export function useAdminRoute() {
  const router = useRouter();
  const { user, initializeUser } = useAuth();
  const [checked, setChecked] = useState(false); // have we finished one init round?

  // Run initializeUser once on mount
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await initializeUser(); // safe to call; it will just refetch /auth/me
      if (!cancelled) {
        setChecked(true);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  // After we've checked, decide what to do
  useEffect(() => {
    if (!checked) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'admin') {
      router.replace('/');
    }
  }, [checked, user, router]);

  return {
    user,
    isLoading: !checked, // you can use this to show "در حال بررسی دسترسی..."
  };
}