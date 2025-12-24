// app/callback/page.tsx

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { apiClient } from '@/shared/lib/api-client';

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <CallbackPageContent />
    </Suspense>
  );
}

function CallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

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
        // Refresh token is now in httpOnly cookie (set by API route)
        // No need to read it client-side - server will use it automatically

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
  }, [searchParams, router, setUser]);

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
