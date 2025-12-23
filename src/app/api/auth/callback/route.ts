// app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { generateAccessToken, generateRefreshToken } from '@/shared/lib/jwt/jwt';

/**
 * GET /api/auth/callback
 * Handle Google OAuth callback with PKCE flow
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || '/';

    if (!code) {
        return NextResponse.redirect(
            new URL('/login?error=oauth_code_missing', request.url)
        );
    }

    try {
        const cookieStore = await cookies();

        // Create Supabase client for PKCE exchange
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Exchange code for session (PKCE)
        const { data: authData, error: authError } =
            await supabase.auth.exchangeCodeForSession(code);

        if (authError || !authData.user) {
            console.error('OAuth exchange error:', authError);
            return NextResponse.redirect(
                new URL('/login?error=oauth_failed', request.url)
            );
        }

        const supabaseUser = authData.user;

        // Check if user exists in our users table
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', supabaseUser.email || '')
            .single();

        let user = existingUser;

        // Create new user if doesn't exist
        if (!existingUser) {
            const fullName =
                supabaseUser.user_metadata?.full_name ||
                supabaseUser.user_metadata?.name ||
                null;

            const { data: newUser, error: createError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: supabaseUser.email,
                    phone_number: supabaseUser.phone || null,
                    full_name: fullName,
                    role: 'customer',
                    profile_completed: !!fullName,
                    created_at: new Date(Date.now()).toISOString(),
                })
                .select()
                .single();

            if (createError || !newUser) {
                console.error('User creation error:', createError);
                return NextResponse.redirect(
                    new URL('/login?error=user_creation_failed', request.url)
                );
            }

            user = newUser;
        }

        // Generate our own JWT tokens
        const accessTokenJWT = generateAccessToken({
            userId: user?.id || '',
            phone_number: user?.phone_number || user?.email || '',
            role: user?.role || 'customer',
        });

        const refreshTokenJWT = generateRefreshToken({
            userId: user?.id || '',
            phone_number: user?.phone_number || user?.email || '',
            role: user?.role || 'customer',
        });

        // Hash and store refresh token (4 months = 120 days, same as OTP login)
        const tokenHash = await bcrypt.hash(refreshTokenJWT, 10);
        const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);

        await supabaseAdmin.from('refresh_tokens').insert({
            user_id: user?.id || '',
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            created_at: new Date(Date.now()).toISOString()
        });

        // Log login
        await supabaseAdmin.from('loginlog').insert({
            user_id: user?.id || '',
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
        });

        // Redirect to callback page
        const callbackUrl = new URL('/callback', request.url);
        callbackUrl.searchParams.set('redirectedFrom', redirectedFrom);

        const response = NextResponse.redirect(callbackUrl);

        // Set access token as httpOnly cookie (1 week, same as OTP login)
        response.cookies.set('accessToken', accessTokenJWT, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 1 week
            path: '/',
        });

        // Set refresh token as non-httpOnly cookie so client-side JS can read it
        // The client will store this in Zustand for the refresh flow
        response.cookies.set('refreshToken', refreshTokenJWT, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 120 * 24 * 60 * 60, // 4 months
            path: '/',
        });

        return response;
    } catch (error: unknown) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(
            new URL('/login?error=oauth_error', request.url)
        );
    }
}