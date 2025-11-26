// lib/kavenegar.ts

import axios from 'axios';

const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY!;
const KAVENEGAR_SENDER = process.env.KAVENEGAR_SENDER!;

interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries: any[];
}

/**
 * Send OTP via Kavenegar SMS
 */
export async function sendOTPSMS(
  phoneNumber: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `https://api.kavenegar.com/v1/${KAVENEGAR_API_KEY}/sms/send.json`;

    const message = `کد تایید شما: ${otpCode}\nاین کد تا 2 دقیقه معتبر است.`;

    const response = await axios.post<KavenegarResponse>(url, null, {
      params: {
        sender: KAVENEGAR_SENDER,
        receptor: phoneNumber,
        message: message,
      },
    });

    if (response.data.return.status === 200) {
      return {
        success: true,
        message: 'پیامک با موفقیت ارسال شد',
      };
    }

    return {
      success: false,
      message: 'خطا در ارسال پیامک',
    };
  } catch (error: any) {
    console.error('Kavenegar Error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'خطا در ارسال پیامک',
    };
  }
}

/**
 * Generate random 4-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}