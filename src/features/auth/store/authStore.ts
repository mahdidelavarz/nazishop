// // store/authStore.ts
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { UserProfile } from "../types/authType";

// interface AuthState {
//   user: UserProfile | null;
//   setUser: (user: UserProfile) => void;
//   clearUser: () => void;
//   phoneNumber: string | null;
//   email: string | null;
//   isAuthenticated: boolean;
//   userId: string | null;
//   setPhoneNumber: (phone: string) => void;
//   setEmail: (email: string) => void;
//   setAuthenticated: (status: boolean) => void;
//   setUserId: (id: string) => void;
//   logout: () => void;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       phoneNumber: null,
//       email: null,
//       isAuthenticated: false,
//       userId: null,

//       setUser: (user) => set({ user }),
      
//       clearUser: () => set({ user: null }),
      
//       setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      
//       setEmail: (email) => set({ email: email }),
      
//       setAuthenticated: (status) => set({ isAuthenticated: status }),
      
//       setUserId: (id) => set({ userId: id }),
      
//       logout: () => {
//         // Clear cookies
//         if (typeof window !== 'undefined') {
//           document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
//           document.cookie = 'auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
//           localStorage.removeItem('userId')
          
//           // Clear guest cart on logout (important!)
//           localStorage.removeItem('guest-cart')
//         }
        
//         // Clear store
//         set({
//           user: null,
//           phoneNumber: null,
//           email: null,
//           isAuthenticated: false,
//           userId: null
//         })
//       }
//     }),
//     {
//       name: 'auth-storage', // localStorage key
//       partialize: (state) => ({
//         phoneNumber: state.phoneNumber,
//         email: state.email,
//         isAuthenticated: state.isAuthenticated,
//         userId: state.userId
//       })
//     }
//   )
// )

//!new version

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
  setAuthenticated: (status: boolean) => void
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

      // Set user
      setUser: (user) => set({ user, isAuthenticated: true }),

      // Clear user
      clearUser: () => set({ user: null, isAuthenticated: false }),

      // Set authenticated status
      setAuthenticated: (status) => set({ isAuthenticated: status }),

      // Set loading status
      setLoading: (loading) => set({ isLoading: loading }),

      // Logout
      logout: () => {
        // Clear cookies (handled by API)
        if (typeof window !== 'undefined') {
          document.cookie =
            'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie =
            'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
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