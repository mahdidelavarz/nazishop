"use client";

/**
 * Client-side utility to check auth state
 * Note: Refresh token is now in httpOnly cookie (not accessible to JS)
 */
export function checkAuthState() {
  if (typeof window === 'undefined') {
    console.log('[Auth Check] Running server-side, skipping');
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
  } catch (e) {
    console.error('[Auth Check] Error reading localStorage:', e);
  }

  console.log('[Auth Check] ===== AUTH STATE DIAGNOSTIC =====');
  console.log('[Auth Check] Zustand user:', !!user, user?.id);
  console.log('[Auth Check] localStorage auth-storage:', !!localStorageAuth);
  if (localStorageAuth) {
    console.log('[Auth Check] localStorage user:', !!localStorageAuth.state?.user);
  }
  console.log('[Auth Check] Refresh token: In httpOnly cookie (not accessible to JS)');
  console.log('[Auth Check] ===================================');

  return {
    hasUser: !!user,
    localStorageData: localStorageAuth,
  };
}

