// src/features/auth/services/authService.ts (no 's' at the end)
import {
  SendOTPResponse,
  VerifyOTPResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../types/authType'
import { supabase } from '@/shared/lib/supabase/client'

export async function sendOTPApi(phoneNumber: string): Promise<SendOTPResponse> {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در ارسال کد تایید')
  }

  return data.data
}

export async function verifyOTPApi(
  phoneNumber: string,
  otpCode: string
): Promise<VerifyOTPResponse> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otpCode }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در تایید کد')
  }

  return data.data
}

export async function refreshTokenApi(): Promise<RefreshTokenResponse> {
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در تازه‌سازی توکن')
  }

  return data.data
}

export async function logoutApi(): Promise<LogoutResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در خروج')
  }

  return data.data
}

export async function loginWithGoogleApi(redirectTo?: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/callback${
        redirectTo ? `?redirectedFrom=${encodeURIComponent(redirectTo)}` : ''
      }`,
    },
  })

  if (error) {
    throw new Error(error.message || 'خطا در ورود با گوگل')
  }
}

export async function getCurrentUserApi(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error('خطا در دریافت اطلاعات کاربر')
  }

  return data
}

export async function updateProfileApi(
  userId: string,
  updates: {
    full_name?: string
    email?: string | null
    profile_completed?: boolean
  }
) {
  const response = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Send cookies
    body: JSON.stringify(updates),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در بروزرسانی پروفایل')
  }

  return data.data
}