// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "../types/authType";

interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  phoneNumber: string | null;
  email: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  setAuthenticated: (status: boolean) => void;
  setUserId: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      phoneNumber: null,
      email: null,
      isAuthenticated: false,
      userId: null,

      setUser: (user) => set({ user }),
      
      clearUser: () => set({ user: null }),
      
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      
      setEmail: (email) => set({ email: email }),
      
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      
      setUserId: (id) => set({ userId: id }),
      
      logout: () => {
        // Clear cookies
        if (typeof window !== 'undefined') {
          document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          document.cookie = 'auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          localStorage.removeItem('userId')
          
          // Clear guest cart on logout (important!)
          localStorage.removeItem('guest-cart')
        }
        
        // Clear store
        set({
          user: null,
          phoneNumber: null,
          email: null,
          isAuthenticated: false,
          userId: null
        })
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        phoneNumber: state.phoneNumber,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
        userId: state.userId
      })
    }
  )
)