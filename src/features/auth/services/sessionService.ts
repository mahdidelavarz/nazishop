// src/features/auth/services/sessionService.ts

import { clearAuthCookiesClient } from '@/shared/utils/cookies.client'
import { AuthUser, ClientSessionInfo } from '../types/authType'
import { refreshTokenApi } from './authServices'


/**
 * Get session from server
 * This is the ONLY way to read session on client
 */
export async function getSession(): Promise<ClientSessionInfo> {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include', // Send cookies
      cache: 'no-store',
    })

    const data = await res.json()

    if (!data.isAuthenticated) {
      return { 
        isAuthenticated: false, 
        user: null, 
        accessTokenExpiry: null, 
        needsRefresh: false 
      }
    }

    return {
      isAuthenticated: true,
      user: data.user as AuthUser,
      accessTokenExpiry: data.accessTokenExpiry,
      needsRefresh: false,
    }
  } catch (error) {
    console.error('Failed to get session:', error)
    return { 
      isAuthenticated: false, 
      user: null, 
      accessTokenExpiry: null, 
      needsRefresh: false 
    }
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session.isAuthenticated
}

export async function getUserFromSession(): Promise<AuthUser | null> {
  const session = await getSession()
  return session.user
}

// ❌ REMOVED: getUserIdFromSession (can't access token on client)

export async function refreshSession(): Promise<boolean> {
  try {
    await refreshTokenApi()
    return true
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return false
  }
}

export function clearSession() {
  clearAuthCookiesClient()
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
    localStorage.removeItem('guest-cart')
  }
}

export async function autoRefreshToken(): Promise<void> {
  const session = await getSession()
  
  if (!session.isAuthenticated) {
    // Try to refresh if we have refresh token
    await refreshSession()
  }
}

export async function hasRole(role: 'customer' | 'admin'): Promise<boolean> {
  const user = await getUserFromSession()
  return user?.role === role
}

export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin')
}

export async function isCustomer(): Promise<boolean> {
  return await hasRole('customer')
}