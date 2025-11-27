// app/(auth)/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/shared/lib/supabase/client'
import { supabaseAdmin } from '@/shared/lib/supabase/server'


/**
 * Hash refresh token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * GET /callback
 * Handle Google OAuth callback
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || '/'

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_code_missing', request.url)
    )
  }

  try {
    // Exchange code for session
    const { data: authData, error: authError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (authError || !authData.user) {
      logError(authError, 'oauth-callback - exchange code')
      return NextResponse.redirect(
        new URL('/login?error=oauth_failed', request.url)
      )
    }

    const user = authData.user

    // Check if user exists in our users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, profile_completed, full_name, role')
      .eq('id', user.id)
      .single()

    let profileCompleted = false
    let fullName =
      user.user_metadata?.full_name || user.user_metadata?.name || null
    let isNewUser = false
    let userRole: 'customer' | 'admin' = 'customer'

    if (!existingUser) {
      // Create user record for Google OAuth user
      isNewUser = true
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          phone_number: user.phone || null,
          email: user.email,
          full_name: fullName,
          role: 'customer',
          profile_completed: !!fullName,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        logError(insertError, 'oauth-callback - create user')
        return NextResponse.redirect(
          new URL('/login?error=user_creation_failed', request.url)
        )
      }

      profileCompleted = !!fullName
    } else {
      profileCompleted = existingUser.profile_completed
      fullName = existingUser.full_name
      userRole = existingUser.role
    }

    // Generate JWT tokens
    const tokens = await generateTokenPair({
      userId: user.id,
      phoneNumber: user.phone || null,
      email: user.email || null,
      role: userRole,
    })

    // Hash and store refresh token
    const refreshTokenHash = hashToken(tokens.refreshToken)
    const refreshExpiresAt = new Date(tokens.refreshTokenExpiry)

    await supabaseAdmin.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: refreshExpiresAt.toISOString(),
      revoked: false,
      created_at: new Date().toISOString(),
    })

    // Set auth cookies
    setAuthTokens(tokens.accessToken, tokens.refreshToken)

    // Redirect to appropriate page
    const redirectUrl = new URL(
      profileCompleted ? redirectedFrom : '/profile',
      request.url
    )

    return NextResponse.redirect(redirectUrl)
  } catch (error: any) {
    logError(error, 'oauth-callback')
    return NextResponse.redirect(
      new URL('/login?error=oauth_error', request.url)
    )
  }
}