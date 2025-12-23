// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { generateAccessToken, generateRefreshToken } from '@/shared/lib/jwt/jwt';

const MAX_ATTEMPTS = 5; // Allow 5 wrong attempts before lockout

export async function POST(req: NextRequest) {
  try {
    const { phone_number, otp_code } = await req.json();

    if (!phone_number || !otp_code) {
      return NextResponse.json(
        { success: false, message: 'شماره تلفن و کد تایید الزامی است' },
        { status: 400 }
      );
    }

    // Find the latest unverified OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { success: false, message: 'کد تایید یافت نشد' },
        { status: 404 }
      );
    }

    // Check if OTP is expired (expires_at should be greater than now for valid OTP)
    if (new Date(otpRecord.expires_at) < new Date(Date.now())) {
      return NextResponse.json(
        { success: false, message: 'کد تایید منقضی شده است' },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: 'تعداد تلاش‌های مجاز به پایان رسید' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp_code) {
      // Increment attempts
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      return NextResponse.json(
        {
          success: false,
          message: `کد تایید اشتباه است. ${
            MAX_ATTEMPTS - otpRecord.attempts - 1
          } تلاش باقی مانده`,
        },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    let user = existingUser;

    // Create new user if not exists
    if (userError || !existingUser) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          phone_number,
          role: 'customer',
          profile_completed: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { success: false, message: 'خطا در ایجاد کاربر' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد' },
        { status: 500 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      phone_number: user.phone_number || '',
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      phone_number: user.phone_number || '',
      role: user.role,
    });

    // Hash and store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000); // 4 months

    await supabaseAdmin.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });

    // Log login
    await supabaseAdmin.from('loginlog').insert({
      user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    // Set access token as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user,
      refreshToken,
      requiresProfileCompletion: user.profile_completed,
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}