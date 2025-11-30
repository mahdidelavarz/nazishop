// hooks/useGoogleLogin.ts


import { supabase } from '@/shared/lib/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Start Google OAuth login flow with implicit grant (tokens in URL)
 */
async function loginWithGoogle(redirectTo?: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback${
        redirectTo ? `?redirectedFrom=${encodeURIComponent(redirectTo)}` : ''
      }`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'خطا در ورود با گوگل');
  }
}

/**
 * Hook for Google OAuth login
 */
export function useGoogleLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectedFrom') || '/';

  return useMutation({
    mutationFn: () => loginWithGoogle(redirectTo),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}