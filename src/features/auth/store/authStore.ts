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
  setEmail: (email: string) => void;  // ← declared here
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
      setEmail: (email) => set({ email }), // ← ADD THIS LINE
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      setUserId: (id) => set({ userId: id }),
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          localStorage.removeItem('userId');
        }

        set({
          user: null,
          phoneNumber: null,
          email: null, // ← also clear email
          isAuthenticated: false,
          userId: null
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        phoneNumber: state.phoneNumber,
        email: state.email,        // ← include email in persistence
        isAuthenticated: state.isAuthenticated,
        userId: state.userId
      })
    }
  )
);