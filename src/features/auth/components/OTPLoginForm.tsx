// src/features/auth/components/OTPLoginForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '../store/authStore'

type FormData = {
  phoneNumber?: string
  otpCode?: string
}

const COUNTDOWN_SECONDS = 120 // 2 minutes

export default function OTPLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirectedFrom') || '/'

  const { setPhoneNumber: setStorePhone, setAuthenticated } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>()

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'خطا در ارسال کد')
      }

      return data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'کد تایید ارسال شد')
      setCountdown(COUNTDOWN_SECONDS)
      
      // Show OTP in development
      if (data.debug?.otpCode) {
        toast.success(`کد تست: ${data.debug.otpCode}`, { 
          duration: 15000,
          icon: '🔐'
        })
      }
      
      setStep('otp')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در ارسال کد')
    }
  })

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async ({ phoneNumber, otpCode }: { phoneNumber: string; otpCode: string }) => {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطا در تایید کد')
      }

      return data
    },
    onSuccess: async (data) => {
      toast.success(data.message || 'ورود موفقیت‌آمیز')
      
      // Store session token in cookie
      document.cookie = `session_token=${data.sessionToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      
      // Update auth store
      setStorePhone(data.phoneNumber)
      setAuthenticated(true)
      
      // Store userId in localStorage for client-side use
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', data.userId)
      }

      // Determine redirect path
      const nextPath = data.profileCompleted ? redirect : '/profile'
      
      // Small delay for cookie to be set
      setTimeout(() => {
        router.replace(nextPath)
      }, 100)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'خطا در تایید کد')
    }
  })

  // Handle phone number submission
  const onPhoneSubmit = (data: FormData) => {
    const phone = data.phoneNumber!
    setPhoneNumber(phone)
    sendOTPMutation.mutate(phone)
  }

  // Handle OTP verification
  const onOTPSubmit = (data: FormData) => {
    verifyOTPMutation.mutate({
      phoneNumber,
      otpCode: data.otpCode!
    })
  }

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?redirectedFrom=${encodeURIComponent(redirect)}`
      }
    })

    if (error) {
      toast.error('خطا در ورود با گوگل')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {step === 'phone' ? (
        // Phone Number Step
        <form onSubmit={handleSubmit(onPhoneSubmit)} className="space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">ورود / ثبت‌نام</h2>
            <p className="text-gray-600 mt-2">با شماره موبایل وارد شوید</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره موبایل
            </label>
            <div className="relative">
              <Icon 
                icon="ph:phone-duotone" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
                width={20}
              />
              <input
                {...register('phoneNumber', {
                  required: 'شماره موبایل الزامی است',
                  pattern: {
                    value: /^09[0-9]{9}$/,
                    message: 'فرمت شماره موبایل باید 09XXXXXXXXX باشد'
                  }
                })}
                type="tel"
                placeholder="09123456789"
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir="ltr"
                maxLength={11}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={sendOTPMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sendOTPMutation.isPending ? (
              <>
                <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                در حال ارسال...
              </>
            ) : (
              <>
                <Icon icon="ph:paper-plane-tilt-duotone" width={20} />
                ارسال کد تایید
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">یا</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Icon icon="flat-color-icons:google" width={20} />
            <span className="font-medium">ورود با گوگل</span>
          </button>
        </form>
      ) : (
        // OTP Verification Step
        <form onSubmit={handleSubmit(onOTPSubmit)} className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:shield-check-duotone" className="text-blue-600" width={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">کد تایید</h2>
            <p className="text-gray-600 mt-2">
              کد ارسال شده به <span className="font-medium text-gray-800">{phoneNumber}</span> را وارد کنید
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              کد ۶ رقمی
            </label>
            <input
              {...register('otpCode', {
                required: 'کد تایید الزامی است',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'کد باید ۶ رقم باشد'
                }
              })}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="w-full text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-lg py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
              dir="ltr"
            />
            {errors.otpCode && (
              <p className="text-red-500 text-sm text-center mt-1">
                {errors.otpCode.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifyOTPMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {verifyOTPMutation.isPending ? (
              <>
                <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                در حال بررسی...
              </>
            ) : (
              <>
                <Icon icon="ph:check-circle-duotone" width={20} />
                تایید کد
              </>
            )}
          </button>

          {/* Timer and Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                ارسال مجدد کد در{' '}
                <span className="font-bold text-blue-600">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => sendOTPMutation.mutate(phoneNumber)}
                disabled={sendOTPMutation.isPending}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
              >
                ارسال مجدد کد تایید
              </button>
            )}
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setStep('phone')
              setCountdown(0)
              reset()
            }}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Icon icon="ph:arrow-right" width={20} />
            تغییر شماره موبایل
          </button>
        </form>
      )}
    </div>
  )
}