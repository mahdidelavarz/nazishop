// app/api/auth/refresh-token/route.ts

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { verifyRefreshToken } from '@/shared/lib/jwt/verify'
import { signAccessToken, signRefreshToken } from '@/shared/lib/jwt/sign'
import { supabaseAdmin } from '@/shared/lib/supabase/server'
import {
  getRefreshTokenFromCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '@/shared/utils/cookies'
import { successResponse, errorResponse } from '@/shared/utils/response'
import {
  createUnauthorizedError,
  createRefreshTokenError,
  createServerError,
  logError,
  ErrorCode,
} from '@/shared/utils/errors'

/**
 * Hash token for comparison
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = await getRefreshTokenFromCookie()

    if (!refreshToken) {
      throw createUnauthorizedError('توکن تازه‌سازی یافت نشد')
    }

    // Verify refresh token signature
    const payload = await verifyRefreshToken(refreshToken)

    // Hash token for database lookup
    const tokenHash = hashToken(refreshToken)

    // Check if token exists and is valid in database
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('refresh_tokens')
      .select('revoked, expires_at')
      .eq('token_hash', tokenHash)
      .single()

    if (tokenError || !tokenRecord) {
      throw createRefreshTokenError(
        ErrorCode.REFRESH_TOKEN_INVALID,
        'توکن تازه‌سازی نامعتبر است'
      )
    }

    // Check if token is revoked
    if (tokenRecord.revoked) {
      throw createRefreshTokenError(
        ErrorCode.REFRESH_TOKEN_REVOKED,
        'توکن تازه‌سازی باطل شده است'
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenRecord.expires_at)
    if (expiresAt < now) {
      throw createRefreshTokenError(
        ErrorCode.REFRESH_TOKEN_EXPIRED,
        'زمان اعتبار توکن تازه‌سازی به پایان رسیده است'
      )
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, phone_number, email, role')
      .eq('id', payload.userId)
      .single()

    if (userError || !user) {
      throw createServerError('کاربر یافت نشد')
    }

    // Generate new access token
    const newAccessToken = await signAccessToken({
      userId: user.id,
      phoneNumber: user.phone_number,
      email: user.email,
      role: user.role,
    })

    // Optional: Rotate refresh token (recommended for security)
    const shouldRotate = process.env.ROTATE_REFRESH_TOKENS === 'true'
    let newRefreshToken: string | undefined

    if (shouldRotate) {
      // Revoke old refresh token
      await supabaseAdmin
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('token_hash', tokenHash)

      // Generate new refresh token
      const { token, jti } = await signRefreshToken({
        userId: user.id,
        phoneNumber: user.phone_number,
        email: user.email,
        role: user.role,
      })

      newRefreshToken = token

      // Store new refresh token
      const newTokenHash = hashToken(newRefreshToken)
      const refreshExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ) // 7 days

      await supabaseAdmin.from('refresh_tokens').insert({
        user_id: user.id,
        token_hash: newTokenHash,
        expires_at: refreshExpiresAt.toISOString(),
        revoked: false,
      })

      // Set new refresh token cookie
      setRefreshTokenCookie(newRefreshToken)
    }

    // Set new access token cookie
    setAccessTokenCookie(newAccessToken)

    // Return success response
    return successResponse(
      {
        accessToken: newAccessToken,
        ...(newRefreshToken && { refreshToken: newRefreshToken }),
      },
      'توکن با موفقیت تازه‌سازی شد'
    )
  } catch (error: any) {
    logError(error, 'refresh-token')

    if (error.name === 'AppError') {
       return errorResponse(error.message, error.statusCode, error.code);
    }

    return errorResponse('خطا در تازه‌سازی توکن', 401)
  }
}