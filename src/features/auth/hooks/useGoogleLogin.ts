// src/features/auth/hooks/useGoogleLogin.ts

import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/shared/lib/supabase/client'
import toast from 'react-hot-toast'


export async function loginWithGoogleApi(redirectTo?: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/callback${redirectTo ? `?redirectedFrom=${encodeURIComponent(redirectTo)}` : ''
        }`,
    },
  })

  if (error) {
    throw new Error(error.message || 'خطا در ورود با گوگل')
  }
}

export function useGoogleLogin() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectedFrom') || '/'

  return useMutation({
    mutationFn: () => loginWithGoogleApi(redirectTo),
    onError: (error: Error) => {
      toast.error(`${error.message} خطا در ورود با گوگل  ,`);
    },
  })
}