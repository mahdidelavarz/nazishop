// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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

const MAX_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otpCode } = await request.json()

    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'شماره موبایل و کد تایید الزامی است' },
        { status: 400 }
      )
    }

    // Find valid OTP
    const now = new Date().toISOString()
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .gt('expires_at', now)
      .single()

    if (otpError || !otpRecord) {
      // Increment attempts for any matching unverified OTP
      const { data: unverifiedOtps } = await supabaseAdmin
        .from('otp_codes')
        .select('id, attempts')
        .eq('phone_number', phoneNumber)
        .eq('verified', false)
        .gt('expires_at', now)

      if (unverifiedOtps && unverifiedOtps.length > 0) {
        for (const otp of unverifiedOtps) {
          await supabaseAdmin
            .from('otp_codes')
            .update({ attempts: otp.attempts + 1 })
            .eq('id', otp.id)
        }
      }

      return NextResponse.json(
        { error: 'کد تایید نامعتبر یا منقضی شده است' },
        { status: 400 }
      )
    }

    // Check attempts limit
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها بیش از حد مجاز است. لطفا کد جدید درخواست کنید' },
        { status: 429 }
      )
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, profile_completed')
      .eq('phone_number', phoneNumber)
      .single()

    let userId: string
    let isNewUser = false
    let profileCompleted = false

    if (existingUser) {
      // Existing user
      userId = existingUser.id
      profileCompleted = existingUser.profile_completed ?? false
    } else {
      // Create new user WITHOUT Supabase Auth (since phone auth is blocked)
      // Generate a UUID for the user
      userId = randomUUID()
      isNewUser = true

      // Insert directly into public.users table
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          phone_number: phoneNumber,
          role: 'customer',
          profile_completed: false
        })

      if (insertError) {
        console.error('User table insert error:', insertError)
        return NextResponse.json(
          { error: 'خطا در ثبت اطلاعات کاربری' },
          { status: 500 }
        )
      }
    }

    // Create a session token (simple JWT alternative for Iranian context)
    // You can use this to maintain sessions without Supabase Auth
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId,
        phoneNumber,
        timestamp: Date.now()
      })
    ).toString('base64')

    return NextResponse.json({
      success: true,
      userId,
      phoneNumber,
      isNewUser,
      profileCompleted,
      sessionToken, // Client should store this
      message: isNewUser ? 'حساب کاربری با موفقیت ایجاد شد' : 'ورود موفقیت‌آمیز'
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'خطای سرور در تایید کد' },
      { status: 500 }
    )
  }
}