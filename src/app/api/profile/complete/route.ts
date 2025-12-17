// app/api/profile/complete/route.ts

import { supabaseAdmin } from '@/shared/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/auth/serverAuth';

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireUser(req);
    if (response || !user) return response!;

    const { email, full_name, address, postal_code, birthday } = await req.json();

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

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'فرمت ایمیل نامعتبر است',
        },
        { status: 400 }
      );
    }

    // Update user profile
    const updateData: Record<string, unknown> = {
      full_name,
      address,
      postal_code: postal_code || null,
      birthday: birthday || null,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };

    // Only update email if provided
    if (email) {
      updateData.email = email;
    }

    // Don't update phone_number as it's used for authentication
    // phone_number is set during OTP verification and shouldn't be changed

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData as Record<string, unknown> & { role: 'customer' })
      .eq('id', user.id)
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