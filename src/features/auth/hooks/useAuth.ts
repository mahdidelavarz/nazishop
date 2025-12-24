// hooks/useAuth.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '@/shared/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { User } from '../types/auth.type';
import { useWishlistStore } from '@/features/wishlist/store/wishlistStore';

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearAuth } = useAuthStore();
  const { clearWishlist } = useWishlistStore();

  // Fetch current user
  const { isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('[useAuth] Fetching user from /auth/me...');
      const response = await apiClient.get<{ success: boolean; user: User }>(
        '/auth/me'
      );
      console.log('[useAuth] User fetched successfully');
      return response.data.user;
    },
    enabled: false, // Manual fetch
    retry: false, // Don't retry - let interceptor handle refresh
  });

  // Initialize user on mount
  const initializeUser = async () => {
    try {
      console.log('[useAuth] Initializing user...');
      console.log('[useAuth] Refresh token is in httpOnly cookie (not accessible to JS)');
      
      const result = await refetch();
      
      if (result.data) {
        console.log('[useAuth] User initialized successfully');
        setUser(result.data);
      } else if (result.error) {
        // Check if error is 401
        const error = result.error as any;
        const is401 = error?.response?.status === 401;
        
        console.log('[useAuth] Fetch failed:', {
          status: error?.response?.status,
          errorMessage: error?.message,
        });
        
        // If 401, the interceptor should have tried to refresh using httpOnly cookie
        // If it still failed, it means refresh token is invalid/expired
        if (is401) {
          console.log('[useAuth] 401 error - refresh should have been attempted via interceptor');
          // Clear auth state - refresh token is likely expired or invalid
          clearAuth();
        } else {
          // Other errors - clear auth
          console.log('[useAuth] Non-401 error, clearing auth state');
          clearAuth();
        }
      }
    } catch (error: unknown) {
      console.error('[useAuth] Error initializing user:', error);
      // Clear auth on error
      clearAuth();
    }
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    },
    onSuccess: () => {
      clearAuth();
      clearWishlist();
      queryClient.clear();
      toast.success('خروج موفقیت‌آمیز');
      router.push('/login');
    },
    onError: () => {
      toast.error('خطا در خروج');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    initializeUser,
    logout: () => logoutMutation.mutate(),
    setUser,
    // setRefreshToken removed - refresh token is now in httpOnly cookie
  };
}