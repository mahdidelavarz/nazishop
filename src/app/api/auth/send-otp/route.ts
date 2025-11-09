// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Kavenegar from 'kavenegar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const kavenegarApi = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY!
})

const IRANIAN_PHONE_REGEX = /^09[0-9]{9}$/
const OTP_EXPIRY_MINUTES = 2

// Convert 09123456789 to 989123456789 (add country code for Kavenegar)
function toKavenegarFormat(phone: string): string {
  // Remove leading 0 and add 98 (Iran country code)
  if (phone.startsWith('0')) {
    return '98' + phone.slice(1)
  }
  return phone
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    // Validate phone number format
    if (!IRANIAN_PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل نامعتبر است' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Delete expired and old OTPs for this phone number
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', phoneNumber)

    // Store new OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phoneNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'خطا در ذخیره کد تایید' },
        { status: 500 }
      )
    }

    // Send SMS via Kavenegar
    try {
      const receptorPhone = toKavenegarFormat(phoneNumber)
      
      await new Promise((resolve, reject) => {
        kavenegarApi.Send(
          {
            message: `کد تایید شما: ${otpCode}\nاعتبار: ${OTP_EXPIRY_MINUTES} دقیقه`,
            sender: process.env.KAVENEGAR_SENDER || '10004346',
            receptor: receptorPhone
          },
          (response: any, status: number) => {
            console.log('Kavenegar response:', { response, status })
            if (status === 200) {
              resolve(response)
            } else {
              reject(new Error(`SMS failed with status: ${status}`))
            }
          }
        )
      })

      console.log('✅ OTP sent successfully to:', phoneNumber)
    } catch (smsError: any) {
      console.error('SMS sending error:', smsError)
      
      // In development, continue without SMS
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'خطا در ارسال پیامک' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'کد تایید ارسال شد',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
      // Only in development
      ...(process.env.NODE_ENV === 'development' && { 
        debug: { otpCode } 
      })
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'خطا در ارسال کد تایید' },
      { status: 500 }
    )
  }
}