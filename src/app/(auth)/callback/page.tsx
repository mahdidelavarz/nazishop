// app/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { apiClient } from '@/shared/lib/api-client';


export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setRefreshToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for errors from OAuth
      const error = searchParams?.get('error');
      if (error) {
        toast.error('خطا در ورود با گوگل');
        router.push('/login');
        return;
      }

      try {
        // Get refresh token from cookie (set by API route)
        const refreshTokenCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('refreshToken='));

        if (refreshTokenCookie) {
          const refreshToken = refreshTokenCookie.split('=')[1];
          
          // Save refresh token to Zustand
          setRefreshToken(refreshToken);

          // Delete the refresh token cookie (we only needed it temporarily)
          document.cookie =
            'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }

        // Fetch user data
        const response = await apiClient.get('/auth/me');
        setUser(response.data.user);

        // Redirect to appropriate page
        const redirectedFrom = searchParams?.get('redirectedFrom') || '/';
        const profileCompleted = response.data.user.profile_completed;

        toast.success('ورود با گوگل موفقیت‌آمیز بود');
        router.push(profileCompleted ? redirectedFrom : '/profile');
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('خطا در دریافت اطلاعات کاربر');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setRefreshToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Icon
          icon="mdi:loading"
          className="animate-spin text-blue-600 mx-auto mb-4"
          width={48}
        />
        <p className="text-gray-600">در حال ورود...</p>
      </div>
    </div>
  );
}