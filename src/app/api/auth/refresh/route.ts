// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateAccessToken, verifyRefreshToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from httpOnly cookie (more secure than localStorage)
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if refresh token exists and is not revoked
    const now = new Date().toISOString();
    
    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('revoked', false)
      .gte('expires_at', now);

    if (tokensError) {
      console.error('[Refresh] Database error:', tokensError);
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Refresh token not found or expired' },
        { status: 401 }
      );
    }

    // Verify token hash matches
    let validToken = null;
    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token_hash);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
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
    const newAccessToken = generateAccessToken({
      userId: user.id,
      phone_number: user.phone_number || '',
      role: user.role,
    });

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

    return response;
  } catch (error) {
    console.error('[Refresh] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}