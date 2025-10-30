// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

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

const IRANIAN_PHONE_REGEX = /^09[0-9]{9}$/
const OTP_EXPIRY_MINUTES = 2

// Convert 09123456789 → 989123456789
function toFarazSMSFormat(phone: string): string {
  return phone.startsWith('0') ? '98' + phone.slice(1) : phone
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!IRANIAN_PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'فرمت شماره موبایل نامعتبر است' },
        { status: 400 }
      )
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    await supabase.from('otp_codes').delete().eq('phone_number', phoneNumber)

    const { error: dbError } = await supabase.from('otp_codes').insert({
      phone_number: phoneNumber,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0
    })

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'خطا در ذخیره کد' }, { status: 500 })
    }

    // =============================================
    // SEND SMS VIA FARAZSMS (OFFICIAL REST API)
    // =============================================
    try {
      const response = await axios.post(
        'https://ippanel.com/api/v1/sms/send/webservice/single',
        {
          originator: process.env.FARAZSMS_SENDER_NUMBER!,
          recipient: [toFarazSMSFormat(phoneNumber)],
          message: `کد تایید شما: ${otpCode}\nاعتبار: ${OTP_EXPIRY_MINUTES} دقیقه`
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.FARAZSMS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const data = response.data
      console.log('FarazSMS API Response:', data)

      if (data.status !== 'success') {
        throw new Error(data.message || 'SMS failed')
      }

      console.log('OTP sent successfully to:', phoneNumber)
    } catch (smsError: any) {
      console.error('SMS Error:', smsError.response?.data || smsError.message)

      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'خطا در ارسال پیامک' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'کد تایید ارسال شد',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
      ...(process.env.NODE_ENV === 'development' && { debug: { otpCode } })
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}