// src/features/auth/services/authService.ts

import {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../types/authType'
import { supabase } from '@/shared/lib/supabase/client'

/**
 * Send OTP to phone number
 */
export async function sendOTPApi(
  phoneNumber: string
): Promise<SendOTPResponse> {
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

/**
 * Verify OTP code
 */
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

/**
 * Refresh access token
 */
export async function refreshTokenApi(): Promise<RefreshTokenResponse> {
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    credentials: 'include', // Important: send cookies
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'خطا در تازه‌سازی توکن')
  }

  return data.data
}

/**
 * Logout user
 */
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

/**
 * Login with Google OAuth
 */
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

/**
 * Get current user from database
 */
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

/**
 * Update user profile
 */
export async function updateProfileApi(
  userId: string,
  updates: {
    full_name?: string
    email: string | null
    phone_number?: string
    profile_completed?: boolean
    updated_at: string
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error('خطا در بروزرسانی پروفایل')
  }

  return data
}