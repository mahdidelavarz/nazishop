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
        console.log('[useAdminRoute] Checking auth...');
        console.log('[useAdminRoute] Current user in store:', useAuthStore.getState().user);
        console.log('[useAdminRoute] Refresh token is in httpOnly cookie (not accessible to JS)');
        
        // Always fetch fresh user data to ensure role is current
        const response = await apiClient.get('/auth/me');
        
        if (!cancelled) {
          console.log('[useAdminRoute] API response:', response.data);
          
          if (response.data.success && response.data.user) {
            setUser(response.data.user);
            
            // Check if user is admin
            if (response.data.user.role !== 'admin') {
              console.log('[useAdminRoute] User role is:', response.data.user.role, '- redirecting to home');
              router.replace('/');
            } else {
              console.log('[useAdminRoute] User is admin, access granted');
            }
          } else {
            // No user data, redirect to login
            console.log('[useAdminRoute] No user data in response, redirecting to login');
            router.replace('/login');
          }
          setIsLoading(false);
        }
      } catch (error: unknown) {
        // API call failed (401, network error, etc.)
        // The interceptor will try to refresh the token
        // If refresh fails, it will logout and redirect
        if (!cancelled) {
          console.log('[useAdminRoute] Auth check failed:', error);
          console.log('[useAdminRoute] User after error:', useAuthStore.getState().user);
          setIsLoading(false);
          // Don't redirect here - let the interceptor handle it
          // If we reach here after interceptor, user is logged out
          if (!useAuthStore.getState().user) {
            console.log('[useAdminRoute] No user after error, redirecting to login');
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