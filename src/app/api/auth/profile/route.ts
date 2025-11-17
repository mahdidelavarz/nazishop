// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/server'
import { verifyAccessToken } from '@/shared/lib/jwt/verify'
import { getAccessTokenFromCookie } from '@/shared/utils/cookies'
import { errorResponse, successResponse } from '@/shared/utils/response'

export async function PATCH(request: NextRequest) {
  try {
    // Get and verify access token
    const accessToken = await getAccessTokenFromCookie()
    console.log('Access token:', accessToken)
    if (!accessToken) {
      return errorResponse('توکن یافت نشد', 401)
    }

    const payload = await verifyAccessToken(accessToken)
    const userId = payload.userId

    // Get update data from request
    const body = await request.json()
    const { full_name, email, profile_completed } = body

    // Update user in database (bypasses RLS with service role)
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        email: email || null,
        profile_completed,
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return errorResponse(error.message || 'خطا در بروزرسانی پروفایل', 500)
    }

    return successResponse(data, 'پروفایل با موفقیت به‌روزرسانی شد')

  } catch (error: any) {
    console.error('Profile update API error:', error)
    return errorResponse(error.message || 'خطای سرور', 500)
  }
}