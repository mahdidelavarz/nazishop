
import { generateOTP, sendOTPSMS } from '@/shared/lib/kavenegar/kavenegar';
import { supabaseAdmin } from '@/shared/lib/supabase/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone_number } = await req.json();

    // Validate phone number format (Iranian format: 09xxxxxxxxx)
    if (!phone_number || !/^09[0-9]{9}$/.test(phone_number)) {
      return NextResponse.json(
        { success: false, message: 'شماره تلفن نامعتبر است' },
        { status: 400 }
      );
    }

    // Check for recent OTP (rate limiting - 1 OTP per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentOTP } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone_number)
      .gte('created_at', oneMinuteAgo)
      .single();

    if (recentOTP) {
      return NextResponse.json(
        {
          success: false,
          message: 'لطفا یک دقیقه صبر کنید و دوباره تلاش کنید',
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    console.log('expiresAt',expiresAt.toISOString());

    // Save OTP to database
    const { error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        phone_number,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        created_at : new Date(Date.now()).toISOString()
      });

    if (otpError) {
      console.error('OTP Save Error:', otpError);
      return NextResponse.json(
        { success: false, message: 'خطا در ذخیره کد تایید' },
        { status: 500 }
      );
    }

    // Send OTP via SMS (ignore errors in development)
    try {
      await sendOTPSMS(phone_number, otpCode);
    } catch (error) {
      console.log('SMS send failed (ignored for testing):', error);
    }

    // Return OTP code in response for testing purposes
    return NextResponse.json({
      success: true,
      message: 'کد تایید با موفقیت ارسال شد',
      otpCode: otpCode, // FOR TESTING ONLY - Remove in production
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}