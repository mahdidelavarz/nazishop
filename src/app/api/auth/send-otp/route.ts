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
// app/api/auth/send-otp/route.ts

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase/server";
import { sendOTPSMS } from "@/shared/lib/kavenegar/client";
import {
  successResponse,
  errorResponse,
  rateLimitError,
} from "@/shared/utils/response";
import {
  createValidationError,
  createRateLimitError,
  createServerError,
  logError,
  ErrorCode,
} from "@/shared/utils/errors";

// Constants
const IRANIAN_PHONE_REGEX = /^09[0-9]{9}$/;
const OTP_EXPIRY_MINUTES = 2;
const MAX_OTP_REQUESTS_PER_HOUR = 3;

/**
 * Convert 09123456789 to 989123456789 (add country code for Kavenegar)
 */
function toKavenegarFormat(phone: string): string {
  if (phone.startsWith("0")) {
    return "98" + phone.slice(1);
  }
  return phone;
}

/**
 * Check rate limiting for OTP requests
 */
async function checkRateLimit(phoneNumber: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from("otp_codes")
    .select("id")
    .eq("phone_number", phoneNumber)
    .gte("created_at", oneHourAgo.toISOString());

  if (error) {
    logError(error, "checkRateLimit");
    return true; // Allow request if check fails
  }

  return (data?.length || 0) < MAX_OTP_REQUESTS_PER_HOUR;
}

/**
 * POST /api/auth/send-otp
 * Send OTP code to phone number via SMS
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!phoneNumber || typeof phoneNumber !== "string") {
      throw createValidationError("شماره موبایل الزامی است");
    }

    if (!IRANIAN_PHONE_REGEX.test(phoneNumber)) {
      throw createValidationError("فرمت شماره موبایل باید 09XXXXXXXXX باشد", {
        code: ErrorCode.INVALID_PHONE,
      });
    }

    // Check rate limiting
    const isAllowed = await checkRateLimit(phoneNumber);
    if (!isAllowed) {
      throw createRateLimitError(
        `حداکثر ${MAX_OTP_REQUESTS_PER_HOUR} درخواست در ساعت مجاز است`
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete expired and old OTPs for this phone number
    await supabaseAdmin
      .from("otp_codes")
      .delete()
      .eq("phone_number", phoneNumber);

    // Store new OTP in database
    const { error: dbError } = await supabaseAdmin.from("otp_codes").insert({
      phone_number: phoneNumber,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0,
    });

    if (dbError) {
      logError(dbError, "send-otp - database insert");
      throw createServerError("خطا در ذخیره کد تایید");
    }

    // Send SMS via Kavenegar
    try {
      const kavenegarPhone = toKavenegarFormat(phoneNumber);
      await sendOTPSMS(kavenegarPhone, otpCode);

      console.log("✅ OTP sent successfully to:", phoneNumber);
    } catch (smsError: any) {
      logError(smsError, "send-otp - SMS sending");

      // In development, continue without SMS error
      if (process.env.NODE_ENV !== "development") {
        throw createServerError("خطا در ارسال پیامک");
      }
    }

    // Return success response
    return successResponse(
      {
        expiresIn: OTP_EXPIRY_MINUTES * 60,
        // Only in development mode
        ...(process.env.NODE_ENV === "development" && {
          debug: { otpCode },
        }),
      },
      "کد تایید ارسال شد"
    );
  } catch (error: any) {
    logError(error, "send-otp");

    if (error.name === "AppError") {
      return errorResponse(error.message, error.statusCode, error.code);
    }

    return errorResponse("خطا در ارسال کد تایید", 500);
  }
}
