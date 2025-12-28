// hooks/useAdminRoute.ts

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '@/shared/lib/api-client';

/**
 * Protects admin-only client routes.
 * - Fetches user data from /auth/me
 * - Redirects if no user or non-admin
 */
export function useAdminRoute() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        // Always fetch fresh user data to ensure role is current
        const response = await apiClient.get('/auth/me');
        
        if (!cancelled) {
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
            
            // Check if user is admin
            if (response.data.user.role !== 'admin') {
              router.replace('/');
            }
          } else {
            // No user data, redirect to login
            router.replace('/login');
          }
          setIsLoading(false);
        }
      } catch {
        // API call failed (401, network error, etc.)
        // The interceptor will try to refresh the token
        // If refresh fails, it will logout and redirect
        if (!cancelled) {
          setIsLoading(false);
          // If we reach here after interceptor, user is logged out
          if (!useAuthStore.getState().user) {
            router.replace('/login');
          }
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  return {
    user,
    isLoading,
  };
}