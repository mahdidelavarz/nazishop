// src/features/auth/hooks/useAuth.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getCurrentUserApi, logoutApi } from '../services/authServices'
import { showSuccessToast, showErrorToast } from '@/shared/utils/errors'
import { clearSession, autoRefreshToken } from '../services/sessionService'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        // Fetch session from secure API route
        const res = await fetch('/api/auth/session', {
          credentials: 'include', // include httpOnly cookies
        })
        if (!res.ok) throw new Error('Session fetch failed')

        const session = await res.json()

        if (session?.isAuthenticated && session.user) {
          // Sync store user if not set or different
          if (!user || user.id !== session.user.id) {
            try {
              const userData = await getCurrentUserApi(session.user.id)
              setUser({
                id: userData.id,
                fullName: userData.full_name,
                email: userData.email,
                phoneNumber: userData.phone_number,
                role: userData.role,
                profileCompleted: userData.profile_completed,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at,
              })
            } catch (err) {
              console.error('Failed to fetch full user data', err)
              clearUser()
            }
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
  }, [])

  // Auto-refresh token periodically (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      autoRefreshToken().catch((err) => console.error('Auto refresh failed:', err))
    }, 10 * 60 * 1000)

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

// Hook to require auth
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

// Hook to require admin
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
