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
        const googleEmail = supabaseUser.email;
        const googlePhone = supabaseUser.phone;
        const fullName =
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            null;

        // Check if user exists by email first
        let { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', googleEmail || '')
            .maybeSingle();

        // If not found by email, check by phone_number (if Google provides it)
        if (!existingUser && googlePhone) {
            const { data: userByPhone } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('phone_number', googlePhone)
                .maybeSingle();
            
            if (userByPhone) {
                existingUser = userByPhone;
                // Link the email to existing account if it doesn't have one
                if (!existingUser.email && googleEmail) {
                    await supabaseAdmin
                        .from('users')
                        .update({ 
                            email: googleEmail,
                            role: existingUser.role // Preserve existing role
                        })
                        .eq('id', existingUser.id);
                    existingUser.email = googleEmail;
                }
            }
        }

        let user = existingUser;

        // Create new user if doesn't exist
        if (!existingUser) {
            const { data: newUser, error: createError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: googleEmail,
                    phone_number: googlePhone || null,
                    full_name: fullName,
                    role: 'customer', // New users are always customers
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
        } else if (user) {
            // User exists - update missing fields but PRESERVE role
            const updates: {
                email?: string;
                phone_number?: string | null;
                full_name?: string | null;
                profile_completed?: boolean;
                role: 'customer' | 'admin'; // Required by TypeScript, preserve existing value
            } = {
                role: user.role as 'customer' | 'admin', // Preserve existing role
            };

            // Only update email if it's missing
            if (!user.email && googleEmail) {
                updates.email = googleEmail;
            }

            // Only update phone if it's missing
            if (!user.phone_number && googlePhone) {
                updates.phone_number = googlePhone;
            }

            // Update full_name if missing or if Google provides a better one
            if (!user.full_name && fullName) {
                updates.full_name = fullName;
            }

            // Update profile_completed if we now have a name
            if (fullName && !user.profile_completed) {
                updates.profile_completed = true;
            }

            // Only update if there are changes (besides role which is always included)
            const hasChanges = Object.keys(updates).some(key => key !== 'role');
            if (hasChanges) {
                const { data: updatedUser, error: updateError } = await supabaseAdmin
                    .from('users')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single();

                if (!updateError && updatedUser) {
                    user = updatedUser;
                }
            }
        }

        // Generate our own JWT tokens (use actual role from database, never override)
        if (!user) {
            return NextResponse.redirect(
                new URL('/login?error=user_not_found', request.url)
            );
        }

        const accessTokenJWT = generateAccessToken({
            userId: user.id,
            phone_number: user.phone_number || user.email || '',
            role: user.role, // Use actual role from database (preserves admin role)
        });

        const refreshTokenJWT = generateRefreshToken({
            userId: user.id,
            phone_number: user.phone_number || user.email || '',
            role: user.role, // Use actual role from database (preserves admin role)
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

        // Set refresh token as httpOnly cookie (more secure than localStorage)
        response.cookies.set('refreshToken', refreshTokenJWT, {
            httpOnly: true, // Not accessible to JavaScript (XSS protection)
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', // CSRF protection
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