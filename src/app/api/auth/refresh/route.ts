// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateAccessToken, verifyRefreshToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from httpOnly cookie (more secure than localStorage)
    const refreshToken = req.cookies.get('refreshToken')?.value;

    console.log('[Refresh] Received refresh request');
    console.log('[Refresh] Refresh token exists:', !!refreshToken);
    console.log('[Refresh] Refresh token length:', refreshToken?.length || 0);

    if (!refreshToken) {
      console.log('[Refresh] No refresh token in cookie');
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    console.log('[Refresh] Verifying refresh token...');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      console.log('[Refresh] Refresh token verification failed');
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    console.log('[Refresh] Refresh token verified, userId:', payload.userId);

    // Check if refresh token exists and is not revoked
    const now = new Date().toISOString();
    console.log('[Refresh] Checking database for refresh tokens, expires_at >=', now);
    
    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('revoked', false)
      .gte('expires_at', now);

    console.log('[Refresh] Database query result:', {
      tokensFound: tokens?.length || 0,
      error: tokensError?.message,
    });

    if (tokensError) {
      console.error('[Refresh] Database error:', tokensError);
    }

    if (!tokens || tokens.length === 0) {
      console.log('[Refresh] No valid refresh tokens found in database');
      // Check if there are any tokens (even expired ones) for debugging
      const { data: allTokens } = await supabaseAdmin
        .from('refresh_tokens')
        .select('expires_at, revoked')
        .eq('user_id', payload.userId);
      console.log('[Refresh] All tokens for user:', allTokens);
      
      return NextResponse.json(
        { success: false, message: 'Refresh token not found or expired' },
        { status: 401 }
      );
    }

    console.log('[Refresh] Found', tokens.length, 'valid token(s) in database');

    // Verify token hash matches
    console.log('[Refresh] Comparing refresh token hash with', tokens.length, 'token(s)...');
    let validToken = null;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const isValid = await bcrypt.compare(refreshToken, token.token_hash);
      console.log(`[Refresh] Token ${i + 1} hash match:`, isValid);
      if (isValid) {
        validToken = token;
        console.log('[Refresh] Found matching token!');
        break;
      }
    }

    if (!validToken) {
      console.log('[Refresh] No matching token hash found');
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new access token
    console.log('[Refresh] Generating new access token for user:', user.id);
    const newAccessToken = generateAccessToken({
      userId: user.id,
      phone_number: user.phone_number || '',
      role: user.role,
    });

    console.log('[Refresh] New access token generated successfully');

    // Set new access token as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 1 week
      path: '/',
    });

    console.log('[Refresh] Access token cookie set, returning success');
    return response;
  } catch (error) {
    console.error('[Refresh] Error:', error);
    if (error instanceof Error) {
      console.error('[Refresh] Error message:', error.message);
      console.error('[Refresh] Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}