// // app/api/auth/send-otp/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'
// import Kavenegar from 'kavenegar'

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false
//     }
//   }
// )

// const kavenegarApi = Kavenegar.KavenegarApi({
//   apikey: process.env.KAVENEGAR_API_KEY!
// })

// const IRANIAN_PHONE_REGEX = /^09[0-9]{9}$/
// const OTP_EXPIRY_MINUTES = 2

// // Convert 09123456789 to 989123456789 (add country code for Kavenegar)
// function toKavenegarFormat(phone: string): string {
//   // Remove leading 0 and add 98 (Iran country code)
//   if (phone.startsWith('0')) {
//     return '98' + phone.slice(1)
//   }
//   return phone
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { phoneNumber } = await request.json()

//     // Validate phone number format
//     if (!IRANIAN_PHONE_REGEX.test(phoneNumber)) {
//       return NextResponse.json(
//         { error: 'فرمت شماره موبایل نامعتبر است' },
//         { status: 400 }
//       )
//     }

//     // Generate 6-digit OTP
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
//     const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

//     // Delete expired and old OTPs for this phone number
//     await supabase
//       .from('otp_codes')
//       .delete()
//       .eq('phone_number', phoneNumber)

//     // Store new OTP in database
//     const { error: dbError } = await supabase
//       .from('otp_codes')
//       .insert({
//         phone_number: phoneNumber,
//         otp_code: otpCode,
//         expires_at: expiresAt.toISOString(),
//         verified: false,
//         attempts: 0
//       })

//     if (dbError) {
//       console.error('Database error:', dbError)
//       return NextResponse.json(
//         { error: 'خطا در ذخیره کد تایید' },
//         { status: 500 }
//       )
//     }

//     // Send SMS via Kavenegar
//     try {
//       const receptorPhone = toKavenegarFormat(phoneNumber)
      
//       await new Promise((resolve, reject) => {
//         kavenegarApi.Send(
//           {
//             message: `کد تایید شما: ${otpCode}\nاعتبار: ${OTP_EXPIRY_MINUTES} دقیقه`,
//             sender: process.env.KAVENEGAR_SENDER || '10004346',
//             receptor: receptorPhone
//           },
//           (response: any, status: number) => {
//             console.log('Kavenegar response:', { response, status })
//             if (status === 200) {
//               resolve(response)
//             } else {
//               reject(new Error(`SMS failed with status: ${status}`))
//             }
//           }
//         )
//       })

//       console.log('✅ OTP sent successfully to:', phoneNumber)
//     } catch (smsError: any) {
//       console.error('SMS sending error:', smsError)
      
//       // In development, continue without SMS
//       if (process.env.NODE_ENV !== 'development') {
//         return NextResponse.json(
//           { error: 'خطا در ارسال پیامک' },
//           { status: 500 }
//         )
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'کد تایید ارسال شد',
//       expiresIn: OTP_EXPIRY_MINUTES * 60,
//       // Only in development
//       ...(process.env.NODE_ENV === 'development' && { 
//         debug: { otpCode } 
//       })
//     })

//   } catch (error) {
//     console.error('Send OTP error:', error)
//     return NextResponse.json(
//       { error: 'خطا در ارسال کد تایید' },
//       { status: 500 }
//     )
//   }
// }


//! new version
// Example: src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  successResponse,
  handleAPIRouteError,
  unauthorizedError,
} from '@/shared/utils/response'
import {
  createValidationError,
  createRateLimitError,
  createExternalAPIError,
  logError,
} from '@/shared/utils/errors'
import { sendOTPSMS } from '@/shared/lib/kavenegar/client'
import { supabaseAdmin } from '@/shared/lib/supabase/server'

// Validation schema
const sendOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09[0-9]{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد'),
})

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

/**
 * POST /api/auth/send-otp
 * Send OTP code to phone number
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()

    // 2. Validate input
    const validationResult = sendOTPSchema.safeParse(body)
    if (!validationResult.success) {
      throw createValidationError(
        'شماره موبایل نامعتبر است',
        validationResult.error.message
      )
    }

    const { phoneNumber } = validationResult.data

    // 3. Check rate limiting
    const rateLimitKey = `otp:${phoneNumber}`
    const now = Date.now()
    const rateLimit = rateLimitMap.get(rateLimitKey)

    if (rateLimit && rateLimit.resetAt > now) {
      if (rateLimit.count >= 3) {
        throw createRateLimitError('شما بیش از حد مجاز درخواست ارسال کرده‌اید')
      }
      rateLimit.count++
    } else {
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetAt: now + 60 * 60 * 1000, // 1 hour
      })
    }

    // 4. Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 5. Store OTP in database
    try {
      // Delete old OTPs for this phone
      await supabaseAdmin
        .from('otp_codes')
        .delete()
        .eq('phone_number', phoneNumber)

      // Insert new OTP
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
      await supabaseAdmin.from('otp_codes').insert({
        phone_number: phoneNumber,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
      })
    } catch (dbError) {
      logError(dbError, 'Database - Store OTP')
      throw createExternalAPIError('خطا در ذخیره‌سازی کد تایید')
    }

    // 6. Send SMS
    try {
      await sendOTPSMS(phoneNumber, otpCode)
    } catch (smsError) {
      logError(smsError, 'Kavenegar - Send SMS')
      throw createExternalAPIError('خطا در ارسال پیامک')
    }

    // 7. Return success (don't expose OTP in production)
    return successResponse(
      {
        message: 'کد تایید با موفقیت ارسال شد',
        ...(process.env.NODE_ENV === 'development' && { otpCode }), // Only in dev
      },
      'کد تایید ارسال شد'
    )
  } catch (error) {
    // Centralized error handling
    return handleAPIRouteError(error, 'Send OTP')
  }
}

// ==================== ANOTHER EXAMPLE ====================

// Example: src/app/api/auth/verify-otp/route.ts
import { generateTokenPair } from '@/shared/lib/jwt/sign'
import { setAuthTokens } from '@/shared/utils/cookies'
import { getUserByPhone, createUserRecord } from '@/shared/lib/supabase/server'
import {
  createOTPInvalidError,
  createOTPExpiredError,
  createOTPMaxAttemptsError,
} from '@/shared/utils/errors'

const verifyOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است'),
  otpCode: z.string().length(6, 'کد تایید باید 6 رقم باشد'),
})

/**
 * POST /api/auth/verify-otp
 * Verify OTP and create session
 */
export async function POST_VERIFY(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json()
    const validationResult = verifyOTPSchema.safeParse(body)

    if (!validationResult.success) {
      throw createValidationError(
        'اطلاعات ورودی نامعتبر است',
        validationResult.error.message
      )
    }

    const { phoneNumber, otpCode } = validationResult.data

    // 2. Get OTP from database
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .single()

    if (otpError || !otpRecord) {
      throw createOTPInvalidError('کد تایید اشتباه است')
    }

    // 3. Check if OTP is expired
    const now = new Date()
    const expiresAt = new Date(otpRecord.expires_at)
    if (expiresAt < now) {
      throw createOTPExpiredError('کد تایید منقضی شده است')
    }

    // 4. Check if OTP is already verified
    if (otpRecord.verified) {
      throw createOTPInvalidError('کد تایید قبلا استفاده شده است')
    }

    // 5. Check max attempts
    if (otpRecord.attempts && otpRecord.attempts >= 3) {
      throw createOTPMaxAttemptsError('تعداد تلاش‌ها بیش از حد مجاز است')
    }

    // 6. Mark OTP as verified
    await supabaseAdmin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    // 7. Get or create user
    let user = await getUserByPhone(phoneNumber)
    
    if (!user) {
      // Create new user
      user = await createUserRecord({
        id: crypto.randomUUID(),
        phoneNumber,
        role: 'customer',
      })
    }

    // 8. Generate JWT tokens
    const tokenPair = await generateTokenPair({
      userId: user.id,
      phoneNumber: user.phone_number || undefined,
      email: user.email || undefined,
      role: user.role as 'customer' | 'admin',
    })

    // 9. Set auth cookies
    await setAuthTokens(tokenPair.accessToken, tokenPair.refreshToken)

    // 10. Return user data
    return successResponse(
      {
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          profileCompleted: user.profile_completed,
        },
        requiresProfileCompletion: !user.profile_completed,
      },
      'ورود با موفقیت انجام شد'
    )
  } catch (error) {
    return handleAPIRouteError(error, 'Verify OTP')
  }
}

// ==================== MIDDLEWARE EXAMPLE ====================

// Example: Middleware with error handling
import { getAccessTokenFromCookie } from '@/shared/utils/cookies'
import { verifyAccessToken } from '@/shared/lib/jwt/verify'

export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from cookie
    const token = await getAccessTokenFromCookie()

    if (!token) {
      return unauthorizedError('لطفا وارد حساب کاربری خود شوید')
    }

    // Verify token
    const payload = await verifyAccessToken(token)

    // Attach user to request (you can use headers or other methods)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return handleAPIRouteError(error, 'Auth Middleware')
  }
}