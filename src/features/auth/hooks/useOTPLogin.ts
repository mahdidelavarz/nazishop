// src/features/auth/hooks/useOTPLogin.ts

import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendOTPApi, verifyOTPApi } from '../services/authServices'
import { useAuthStore } from '../store/authStore'
import { showSuccessToast, showErrorToast } from '@/shared/utils/errors'
import { mergeLocalCartToServer } from '@/features/cart/utils/mergeLocalCartToServer';
import { useLocalCartStore } from '@/features/cart/store/localCartStore'



/**
 * Hook for sending OTP
 */
export function useSendOTP() {
  return useMutation({
    mutationFn: (phoneNumber: string) => sendOTPApi(phoneNumber),
    onSuccess: (data) => {
      showSuccessToast('کد تایید ارسال شد')

      // Show OTP in development
      if (data.debug?.otpCode) {
        showSuccessToast(`کد تست: ${data.debug.otpCode}`)
      }
    },
    onError: (error: Error) => {
      showErrorToast(error)
    },
  })
}

/**
 * Hook for verifying OTP
 */
export function useVerifyOTP() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectedFrom') || '/'
  const { setUser, user } = useAuthStore()
  const { items } = useLocalCartStore();

  console.log(user, "stored user")
  return useMutation({
    mutationFn: ({
      phoneNumber,
      otpCode,
    }: {
      phoneNumber: string
      otpCode: string
    }) => verifyOTPApi(phoneNumber, otpCode),
    onSuccess: async (data) => {
      // Set user in store
      setUser({
        id: data.userId,
        phoneNumber: data.phoneNumber,
        email: null,
        fullName: null,
        role: data.role,
        profileCompleted: data.profileCompleted,
        address: null,
        postalCode: null,
        birthday: null,
      })

      // Store userId in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', data.userId)
      }

      // Merge local cart to server
      try {
        await mergeLocalCartToServer(data.userId, items)
        showSuccessToast('سبد خرید شما همگام‌سازی شد')
      } catch (error) {
        console.error('Cart merge error:', error)
      }

      // Show success message
      showSuccessToast(
        data.isNewUser
          ? 'حساب کاربری شما ایجاد شد'
          : 'ورود موفقیت‌آمیز'
      )

      // Redirect
      const nextPath = data.profileCompleted ? redirectTo : '/profile'
      router.replace(nextPath)
    },
    onError: (error: Error) => {
      showErrorToast(error)
    },
  })
}

/**
 * Combined OTP Login Hook
 * Manages both send and verify in one hook
 */
export function useOTPLogin() {
  const sendOTP = useSendOTP()
  const verifyOTP = useVerifyOTP()

  return {
    sendOTP: sendOTP.mutate,
    verifyOTP: verifyOTP.mutate,
    isSendingOTP: sendOTP.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    sendOTPError: sendOTP.error,
    verifyOTPError: verifyOTP.error,
  }
}