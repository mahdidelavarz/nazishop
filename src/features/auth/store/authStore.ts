// src/features/auth/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '../types/authType'

interface AuthState {
  // State
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: UserProfile) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user (automatically sets isAuthenticated to true)
      setUser: (user) => set({ user, isAuthenticated: true }),

      // Clear user (automatically sets isAuthenticated to false)
      clearUser: () => set({ user: null, isAuthenticated: false }),

      // Set loading status
      setLoading: (loading) => set({ isLoading: loading }),

      // Logout
      logout: () => {
        // Clear cookies
        if (typeof window !== 'undefined') {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          localStorage.removeItem('userId')
          localStorage.removeItem('guest-cart')
        }

        // Clear store
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)