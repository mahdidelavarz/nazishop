// src/features/auth/hooks/useGoogleLogin.ts

import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { loginWithGoogleApi } from '../services/authServices'
import { showErrorToast } from '@/shared/utils/errors'

/**
 * Hook for Google OAuth login
 */
export function useGoogleLogin() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectedFrom') || '/'

  return useMutation({
    mutationFn: () => loginWithGoogleApi(redirectTo),
    onError: (error: Error) => {
      showErrorToast(error, 'خطا در ورود با گوگل')
    },
  })
}