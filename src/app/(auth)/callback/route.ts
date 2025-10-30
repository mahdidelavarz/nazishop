// app/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || '/'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
    }

    if (user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, profile_completed, full_name')
        .eq('id', user.id)
        .single()

      let profileCompleted = false
      let fullName = user.user_metadata?.full_name || user.user_metadata?.name || null

      if (!existingUser) {
        // Create user record for Google OAuth user
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            phone_number: user.phone || null,
            email: user.email,
            full_name: fullName,
            role: 'customer',
            profile_completed: !!fullName
          })

        if (insertError) {
          console.error('Error creating user:', insertError)
        } else {
          profileCompleted = !!fullName
        }
      } else {
        profileCompleted = existingUser.profile_completed
        fullName = existingUser.full_name
      }

      // Create session token for consistency with OTP auth
      const sessionToken = Buffer.from(
        JSON.stringify({
          userId: user.id,
          phoneNumber: user.phone || null,
          email: user.email,
          timestamp: Date.now()
        })
      ).toString('base64')

      // Redirect with session data
      const redirectUrl = new URL(profileCompleted ? redirectedFrom : '/profile', request.url)
      
      const response = NextResponse.redirect(redirectUrl)
      
      // Set session cookie
      response.cookies.set('session_token', sessionToken, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax',
        httpOnly: false
      })

      // Set auth state cookie for client-side
      response.cookies.set('auth_state', JSON.stringify({
        userId: user.id,
        email: user.email,
        phoneNumber: user.phone || null,
        isAuthenticated: true
      }), {
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
        httpOnly: false
      })

      return response
    }
  }

  // Redirect to login if something went wrong
  return NextResponse.redirect(new URL('/login', request.url))
}