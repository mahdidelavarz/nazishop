// store/auth.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types/auth.type';


/**
 * Zustand store for authentication state
 * - Refresh token is now stored in httpOnly cookie (more secure)
 * - Manages user data and authentication status
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      refreshToken: null, // Deprecated: kept for backward compatibility, but not used
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setRefreshToken: (token) => {
        // Deprecated: Refresh token is now in httpOnly cookie
        // This function is kept for backward compatibility but does nothing
        console.warn('[AuthStore] setRefreshToken is deprecated - refresh token is now in httpOnly cookie');
      },

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
        // Don't persist refreshToken anymore - it's in httpOnly cookie
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);