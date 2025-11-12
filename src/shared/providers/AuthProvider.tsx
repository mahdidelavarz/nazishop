// src/features/auth/components/AuthProvider.tsx
'use client'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEffect } from 'react'


interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth Provider Component
 * Initializes auth state and handles auto-refresh
 * Wrap your app with this component
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading } = useAuth()

  // You can add a global loading screen here if needed
  // For now, we'll just render children

  return <>{children}</>
}