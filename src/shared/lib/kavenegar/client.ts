// src/shared/lib/kavenegar/client.ts

import Kavenegar from 'kavenegar'
import { KavenegarConfig, SMSResult, SMSParams } from './types'

/**
 * Kavenegar SMS Client
 * Handles SMS sending via Kavenegar API
 */

let kavenegarClient: any = null

/**
 * Initialize Kavenegar Client
 * Creates singleton instance with API key from environment
 */
function getKavenegarClient() {
  if (kavenegarClient) {
    return kavenegarClient
  }

  const apiKey = process.env.KAVENEGAR_API_KEY

  if (!apiKey) {
    throw new Error(
      'KAVENEGAR_API_KEY is not defined in environment variables'
    )
  }

  kavenegarClient = Kavenegar.KavenegarApi({
    apikey: apiKey,
  })

  return kavenegarClient
}

/**
 * Get Kavenegar Configuration from Environment
 */
export function getKavenegarConfig(): KavenegarConfig {
  return {
    apiKey: process.env.KAVENEGAR_API_KEY || '',
    sender: process.env.KAVENEGAR_SENDER || '10004346',
    isDevelopment: process.env.NODE_ENV === 'development',
  }
}

/**
 * Send SMS via Kavenegar
 * Wrapper around Kavenegar.Send with proper error handling
 * 
 * @param params - SMS parameters (message, receptor, sender)
 * @returns Promise with SMS result
 */
export async function sendSMS(params: SMSParams): Promise<SMSResult> {
  const config = getKavenegarConfig()
  const client = getKavenegarClient()

  // In development, log but don't actually send (optional behavior)
  if (config.isDevelopment && !params.forceSend) {
    console.log('📱 [DEV MODE] SMS would be sent:', {
      to: params.receptor,
      message: params.message,
      sender: params.sender || config.sender,
    })

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
      status: 'queued',
      message: 'Development mode - SMS not actually sent',
    }
  }

  // Send SMS via Kavenegar
  return new Promise((resolve, reject) => {
    client.Send(
      {
        message: params.message,
        sender: params.sender || config.sender,
        receptor: params.receptor,
      },
      (response: any, status: number) => {
        console.log('Kavenegar API Response:', { response, status })

        // Success
        if (status === 200 && response) {
          resolve({
            success: true,
            messageId: response.return?.[0]?.messageid || response.entries?.[0]?.messageid,
            status: response.return?.[0]?.status || 'sent',
            message: 'SMS sent successfully',
          })
        } 
        // Error
        else {
          reject(new Error(`Kavenegar API error: Status ${status}`))
        }
      }
    )
  })
}

/**
 * Send OTP SMS
 * Specialized function for sending OTP codes
 * 
 * @param phoneNumber - Receptor phone number (98XXXXXXXXXX format)
 * @param otpCode - 6-digit OTP code
 * @returns Promise with SMS result
 */
export async function sendOTPSMS(
  phoneNumber: string,
  otpCode: string
): Promise<SMSResult> {
  const config = getKavenegarConfig()

  const message = `کد تایید شما: ${otpCode}\nاعتبار: 2 دقیقه\n${config.isDevelopment ? '[TEST]' : ''}`

  return sendSMS({
    receptor: phoneNumber,
    message,
    sender: config.sender,
  })
}

/**
 * Send OTP via Kavenegar Template (Lookup)
 * Uses Kavenegar's template feature for better delivery
 * You need to create a template in Kavenegar dashboard first
 * 
 * @param phoneNumber - Receptor phone number
 * @param otpCode - 6-digit OTP code
 * @param templateName - Template name in Kavenegar (default: 'otp-verify')
 * @returns Promise with SMS result
 */
export async function sendOTPViaTemplate(
  phoneNumber: string,
  otpCode: string,
  templateName: string = 'otp-verify'
): Promise<SMSResult> {
  const config = getKavenegarConfig()
  const client = getKavenegarClient()

  // In development mode
  if (config.isDevelopment) {
    console.log('📱 [DEV MODE] Template SMS would be sent:', {
      to: phoneNumber,
      template: templateName,
      token: otpCode,
    })

    return {
      success: true,
      messageId: `dev-template-${Date.now()}`,
      status: 'queued',
      message: 'Development mode - Template SMS not actually sent',
    }
  }

  return new Promise((resolve, reject) => {
    client.VerifyLookup(
      {
        receptor: phoneNumber,
        token: otpCode,
        template: templateName,
      },
      (response: any, status: number) => {
        console.log('Kavenegar Template Response:', { response, status })

        if (status === 200) {
          resolve({
            success: true,
            messageId: response.return?.[0]?.messageid,
            status: 'sent',
            message: 'Template SMS sent successfully',
          })
        } else {
          reject(new Error(`Kavenegar template error: Status ${status}`))
        }
      }
    )
  })
}

/**
 * Check SMS Delivery Status
 * Query Kavenegar for message delivery status
 * 
 * @param messageId - Message ID returned from send
 * @returns Promise with delivery status
 */
export async function checkSMSStatus(messageId: string): Promise<{
  status: string
  delivered: boolean
}> {
  const client = getKavenegarClient()

  return new Promise((resolve, reject) => {
    client.Status(
      {
        messageid: messageId,
      },
      (response: any, status: number) => {
        if (status === 200) {
          const smsStatus = response.return?.[0]?.status || 0
          resolve({
            status: getSMSStatusText(smsStatus),
            delivered: smsStatus === 10, // 10 = delivered in Kavenegar
          })
        } else {
          reject(new Error(`Failed to check SMS status: ${status}`))
        }
      }
    )
  })
}

/**
 * Get human-readable SMS status
 * Maps Kavenegar status codes to text
 */
function getSMSStatusText(statusCode: number): string {
  const statuses: Record<number, string> = {
    1: 'در صف ارسال',
    2: 'زمان‌بندی شده',
    4: 'ارسال شده به مخابرات',
    5: 'ارسال شده به مخابرات',
    10: 'رسیده به گیرنده',
    11: 'نرسیده به گیرنده',
    13: 'منتظر تایید',
    14: 'خطا در ارسال',
    100: 'بلک‌لیست شده',
  }

  return statuses[statusCode] || 'نامشخص'
}