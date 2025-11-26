// app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import OTPForm from '@/features/auth/components/OTPForm';
import VerifyOTPForm from '@/features/auth/components/VerifyOTPForm';



export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleOTPSent = (phone: string) => {
    setPhoneNumber(phone);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('phone');
    setPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Icon icon="mdi:shield-lock" className="text-blue-600" width={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ورود / ثبت‌نام
            </h1>
            <p className="text-gray-600">
              {step === 'phone'
                ? 'شماره موبایل خود را وارد کنید'
                : 'کد تایید را وارد کنید'}
            </p>
          </div>

          {step === 'phone' ? (
            <OTPForm onSuccess={handleOTPSent} />
          ) : (
            <VerifyOTPForm phoneNumber={phoneNumber} onBack={handleBack} />
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          با ورود به سایت، شما{' '}
          <a href="#" className="text-blue-600 hover:underline">
            قوانین و مقررات
          </a>{' '}
          را می‌پذیرید
        </p>
      </div>
    </div>
  );
}