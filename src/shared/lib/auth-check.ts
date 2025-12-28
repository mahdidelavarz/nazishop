"use client";

/**
 * Client-side utility to check auth state (development only)
 * Note: Refresh token is now in httpOnly cookie (not accessible to JS)
 */
export function checkAuthState() {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const { useAuthStore } = require('@/features/auth/store/auth.store');
  const { user } = useAuthStore.getState();
  
  // Check localStorage for user data
  let localStorageAuth = null;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      localStorageAuth = JSON.parse(authStorage);
    }
  } catch {
    // Ignore localStorage errors
  }

  return {
    hasUser: !!user,
    localStorageData: localStorageAuth,
  };
}

