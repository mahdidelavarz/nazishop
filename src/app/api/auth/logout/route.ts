// app/api/auth/logout/route.ts

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/shared/lib/supabase/server'
import { getRefreshTokenFromCookie, clearAuthCookies } from '@/shared/utils/cookies'
import { successResponse, errorResponse } from '@/shared/utils/response'
import { logError } from '@/shared/utils/errors'

/**
 * Hash token for comparison
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * POST /api/auth/logout
 * Logout user and revoke refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = getRefreshTokenFromCookie()

    if (refreshToken) {
      // Hash token for database lookup
      const tokenHash = hashToken(refreshToken)

      // Revoke refresh token in database
      const { error } = await supabaseAdmin
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('token_hash', tokenHash)

      if (error) {
        logError(error, 'logout - revoke token')
        // Continue with logout even if revocation fails
      }
    }

    // Clear auth cookies
    clearAuthCookies()

    // Return success response
    return successResponse(
      { loggedOut: true },
      'خروج با موفقیت انجام شد'
    )
  } catch (error: any) {
    logError(error, 'logout')

    // Even on error, clear cookies and return success
    // Better UX than showing error on logout
    clearAuthCookies()
    
    return successResponse(
      { loggedOut: true },
      'خروج با موفقیت انجام شد'
    )
  }
}