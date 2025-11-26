// app/api/profile/complete/route.ts

import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { supabaseAdmin } from '@/shared/lib/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { full_name, address, postal_code, birthday } = await req.json();

    // Validate required fields
    if (!full_name || !address) {
      return NextResponse.json(
        {
          success: false,
          message: 'نام کامل و آدرس الزامی است',
        },
        { status: 400 }
      );
    }

    // Update user profile
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        address,
        postal_code: postal_code || null,
        birthday: birthday || null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.userId)
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'خطا در به‌روزرسانی پروفایل' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'پروفایل با موفقیت تکمیل شد',
      user,
    });
  } catch (error) {
    console.error('Complete Profile Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}