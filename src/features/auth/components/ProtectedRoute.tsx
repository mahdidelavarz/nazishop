// src/features/auth/components/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

/**
 * Protected Route Component
 * Wraps content that requires authentication
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const currentPath = window.location.pathname
      const loginUrl = `/login?redirectedFrom=${encodeURIComponent(
        redirectTo || currentPath
      )}`
      router.replace(loginUrl)
      return
    }

    // Requires admin but user is not admin
    if (requireAdmin && !isAdmin) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, isAdmin, requireAdmin, router, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="animate-spin text-blue-600 mx-auto mb-4"
            width={48}
          />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="ph:warning-duotone" className="text-red-600" width={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            دسترسی محدود
          </h2>
          <p className="text-gray-600 mb-6">
            شما به این بخش دسترسی ندارید
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  // Show protected content
  return <>{children}</>
}