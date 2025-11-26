// hooks/useAuth.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '@/shared/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { User } from '../types/auth.type';

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, setRefreshToken, logout: clearAuth } = useAuthStore();

  // Fetch current user
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; user: User }>(
        '/auth/me'
      );
      return response.data.user;
    },
    enabled: false, // Manual fetch
    retry: 1, // Retry once on failure
    retryDelay: 1000,
  });

  // Initialize user on mount
  const initializeUser = async () => {
    try {
      const result = await refetch();
      if (result.data) {
        setUser(result.data);
      } else if (result.error) {
        // If fetch fails, clear auth state
        console.log('Failed to fetch user, clearing auth state');
        clearAuth();
      }
    } catch (error) {
      console.log('Error initializing user:', error);
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
    setRefreshToken,
  };
}