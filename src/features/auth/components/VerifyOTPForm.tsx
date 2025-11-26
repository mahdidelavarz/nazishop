// components/auth/VerifyOTPForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';


interface VerifyOTPFormProps {
  phoneNumber: string;
  onBack: () => void;
}

export default function VerifyOTPForm({
  phoneNumber,
  onBack,
}: VerifyOTPFormProps) {
  const router = useRouter();
  const { setUser, setRefreshToken } = useAuthStore();
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyOTPMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post('/api/auth/verify-otp', {
        phone_number: phoneNumber,
        otp_code: code,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user);
      setRefreshToken(data.refreshToken);

      // Always redirect to profile page after login
      // Profile page will handle showing completion form or profile details
      router.push('/profile');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'کد تایید اشتباه است';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 4) {
      toast.error('کد تایید باید 4 رقم باشد');
      return;
    }

    verifyOTPMutation.mutate(otpCode);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          کد تایید به شماره <span className="font-bold">{phoneNumber}</span>{' '}
          ارسال شد
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline mt-2"
        >
          تغییر شماره
        </button>
      </div>

      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          کد تایید
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          placeholder="____"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
          disabled={verifyOTPMutation.isPending}
          maxLength={4}
          autoFocus
        />
      </div>

      <div className="text-center text-sm text-gray-600">
        {timer > 0 ? (
          <span>زمان باقی‌مانده: {formatTime(timer)}</span>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:underline"
          >
            ارسال مجدد کد
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={verifyOTPMutation.isPending || otpCode.length !== 4}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {verifyOTPMutation.isPending ? (
          <>
            <Icon icon="mdi:loading" className="animate-spin" width={20} />
            در حال بررسی...
          </>
        ) : (
          <>
            <Icon icon="mdi:check-circle" width={20} />
            تایید و ورود
          </>
        )}
      </button>
    </form>
  );
}