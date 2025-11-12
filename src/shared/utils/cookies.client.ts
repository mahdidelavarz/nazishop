// src/shared/utils/cookies.client.ts

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const

/**
 * IMPORTANT: Client cannot read httpOnly cookies!
 * These functions are only for clearing cookies on logout
 */

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function clearAuthCookiesClient() {
  deleteCookie(COOKIE_CONFIG.ACCESS_TOKEN)
  deleteCookie(COOKIE_CONFIG.REFRESH_TOKEN)
}

// ❌ REMOVED: getCookie, getAccessTokenClient, getRefreshTokenClient
// Client CANNOT read httpOnly cookies!