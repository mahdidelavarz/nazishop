// src/features/auth/hooks/useAuth.ts
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getCurrentUserApi, logoutApi } from '../services/authServices'
import { showSuccessToast, showErrorToast } from '@/shared/utils/errors'
import { clearSession, autoRefreshToken } from '../services/sessionService'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore()
  const hasInitialized = useRef(false)

  // Initialize auth state
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initAuth = async () => {
      if (user && isAuthenticated) {
        console.log('User already authenticated, skipping session check')
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
        })

        const session = await res.json()

        if (session?.isAuthenticated && session.user) {
          try {
            const userData = await getCurrentUserApi(session.user.id)
            setUser({
              id: userData.id,
              phoneNumber: userData.phone_number,
              email: userData.email,
              fullName: userData.full_name,
              role: userData.role,
              profileCompleted: userData.profile_completed,
              address: "",
              postalCode: "",
              birthday: ""
            })
          } catch (err) {
            console.error('Failed to fetch full user data', err)
            clearUser()
          }
        } else {
          clearUser()
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        clearUser()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [user, isAuthenticated])

  // Auto-refresh token - FIXED VERSION
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      autoRefreshToken().catch((err) => {
        console.error('Auto refresh failed:', err)
        // Don't logout on refresh failure - token might still be valid
      })
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearSession()
      useAuthStore.getState().logout()
      showSuccessToast('خروج با موفقیت انجام شد')
      router.push('/login')
    },
    onError: (err: Error) => {
      clearSession()
      useAuthStore.getState().logout()
      showErrorToast(err, 'خطا در خروج')
      router.push('/login')
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  }
}