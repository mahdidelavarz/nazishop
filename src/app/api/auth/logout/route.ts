// app/api/auth/logout/route.ts

import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/server';

import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);

      if (payload) {
        // Revoke all refresh tokens for this user
        await supabaseAdmin
          .from('refresh_tokens')
          .update({ revoked: true })
          .eq('user_id', payload.userId);
      }
    }

    // Clear access token and refresh token cookies
    const response = NextResponse.json({
      success: true,
      message: 'خروج موفقیت‌آمیز',
    });

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken'); // Clear refresh token cookie

    return response;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}