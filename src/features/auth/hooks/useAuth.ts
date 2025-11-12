// src/features/auth/hooks/useAuth.ts

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  getSession,
  getUserFromSession,
  autoRefreshToken,
  clearSession,
  isAuthenticated as checkIsAuthenticated,
} from '../services/sessionService'
import { logoutApi, getCurrentUserApi } from '../services/authServices'
import { showSuccessToast, showErrorToast } from '@/shared/utils/errors'

/**
 * Main Auth Hook
 * Provides authentication state and methods
 */
export function useAuth() {
  const router = useRouter()
  const { user, setUser, clearUser, isAuthenticated, setAuthenticated } =
    useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Auto-refresh token if needed
        await autoRefreshToken()

        // Get session info
        const session = getSession()

        if (session.isAuthenticated && session.user) {
          setAuthenticated(true)

          // Fetch full user profile if not in store
          if (!user || user.id !== session.user.id) {
            try {
              const userData = await getCurrentUserApi(session.user.id)
              setUser({
                id: userData.id,
                phoneNumber: userData.phone_number,
                email: userData.email,
                fullName: userData.full_name,
                role: userData.role,
                profileCompleted: userData.profile_completed,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at,
              })
            } catch (error) {
              console.error('Failed to fetch user data:', error)
            }
          }
        } else {
          setAuthenticated(false)
          clearUser()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthenticated(false)
        clearUser()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Auto-refresh token periodically (every 10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(
      () => {
        autoRefreshToken().catch((error) => {
          console.error('Auto refresh failed:', error)
        })
      },
      10 * 60 * 1000
    ) // 10 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear session
      clearSession()

      // Clear store
      clearUser()
      setAuthenticated(false)

      // Show success message
      showSuccessToast('خروج با موفقیت انجام شد')

      // Redirect to login
      router.push('/login')
    },
    onError: (error: Error) => {
      // Still clear session even on error
      clearSession()
      clearUser()
      setAuthenticated(false)

      showErrorToast(error, 'خطا در خروج')
      router.push('/login')
    },
  })

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Methods
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    
    // Helpers
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  }
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirectedFrom=${window.location.pathname}`)
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}

/**
 * Hook to require admin role
 * Redirects to home if not admin
 */
export function useRequireAdmin() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      showErrorToast('شما به این بخش دسترسی ندارید')
      router.replace('/')
    }
  }, [user, isLoading, router])

  return { isAdmin: user?.role === 'admin', isLoading }
}