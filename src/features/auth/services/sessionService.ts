// src/features/auth/services/sessionService.ts

import {
  getAccessTokenClient,
  getRefreshTokenClient,
  clearAuthCookiesClient,
} from '@/shared/utils/cookies.client'
import {
  decodeTokenUnsafe,
  isTokenExpired,
  shouldRefreshToken,
  getUserIdFromToken,
} from '@/shared/lib/jwt/verify'
import { AuthUser, ClientSessionInfo } from '../types/authType'
import { refreshTokenApi } from './authServices'

/**
 * Get current session from cookies
 */
export function getSession(): ClientSessionInfo {
  const accessToken = getAccessTokenClient()

  if (!accessToken) {
    return {
      isAuthenticated: false,
      user: null,
      accessTokenExpiry: null,
      needsRefresh: false,
    }
  }

  // Check if token is expired
  if (isTokenExpired(accessToken)) {
    return {
      isAuthenticated: false,
      user: null,
      accessTokenExpiry: null,
      needsRefresh: true,
    }
  }

  // Decode token to get user info
  const payload = decodeTokenUnsafe(accessToken)
  if (!payload) {
    return {
      isAuthenticated: false,
      user: null,
      accessTokenExpiry: null,
      needsRefresh: false,
    }
  }

  const user: AuthUser = {
    id: payload.userId,
    phoneNumber: payload.phoneNumber,
    email: payload.email,
    role: payload.role,
  }

  return {
    isAuthenticated: true,
    user,
    accessTokenExpiry: payload.exp * 1000, // Convert to milliseconds
    needsRefresh: shouldRefreshToken(accessToken),
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSession()
  return session.isAuthenticated
}

/**
 * Get user from session
 */
export function getUserFromSession(): AuthUser | null {
  const session = getSession()
  return session.user
}

/**
 * Get user ID from session
 */
export function getUserIdFromSession(): string | null {
  const accessToken = getAccessTokenClient()
  if (!accessToken) return null
  return getUserIdFromToken(accessToken)
}

/**
 * Check if session needs refresh
 */
export function sessionNeedsRefresh(): boolean {
  const session = getSession()
  return session.needsRefresh
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<boolean> {
  try {
    await refreshTokenApi()
    return true
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return false
  }
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  clearAuthCookiesClient()

  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
    localStorage.removeItem('guest-cart')
  }
}

/**
 * Auto-refresh token if needed
 * Call this on app mount or route changes
 */
export async function autoRefreshToken(): Promise<void> {
  const session = getSession()

  if (session.needsRefresh && !session.isAuthenticated) {
    // Token expired, try to refresh
    const refreshToken = getRefreshTokenClient()
    if (refreshToken) {
      await refreshSession()
    }
  } else if (session.isAuthenticated && session.needsRefresh) {
    // Token expiring soon, refresh proactively
    await refreshSession()
  }
}

/**
 * Check if user has role
 */
export function hasRole(role: 'customer' | 'admin'): boolean {
  const user = getUserFromSession()
  return user?.role === role
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin')
}

/**
 * Check if user is customer
 */
export function isCustomer(): boolean {
  return hasRole('customer')
}