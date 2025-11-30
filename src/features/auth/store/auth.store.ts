// store/auth.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types/auth.type';


/**
 * Zustand store for authentication state
 * - Persists refreshToken to localStorage
 * - Manages user data and authentication status
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setRefreshToken: (token) =>
        set({
          refreshToken: token,
        }),

      logout: () =>
        set({
          user: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        refreshToken: state.refreshToken, // Only persist refreshToken
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);