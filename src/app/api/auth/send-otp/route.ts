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
