// src/shared/lib/kavenegar/types.ts

/**
 * Kavenegar Configuration
 */
export interface KavenegarConfig {
  /** API Key from Kavenegar dashboard */
  apiKey: string
  
  /** Sender number (usually a 10-digit number like 10004346) */
  sender: string
  
  /** Whether in development mode */
  isDevelopment: boolean
}

/**
 * SMS Parameters for sending
 */
export interface SMSParams {
  /** Message content (text) */
  message: string
  
  /** Receptor phone number in 98XXXXXXXXXX format */
  receptor: string
  
  /** Sender number (optional, uses default from config) */
  sender?: string
  
  /** Force send even in development mode */
  forceSend?: boolean
}

/**
 * SMS Sending Result
 */
export interface SMSResult {
  /** Whether SMS was sent successfully */
  success: boolean
  
  /** Message ID from Kavenegar (for tracking) */
  messageId?: string
  
  /** SMS status (queued, sent, delivered, etc.) */
  status: string
  
  /** Human-readable message */
  message: string
  
  /** Error details if failed */
  error?: string
}

/**
 * SMS Delivery Status
 */
export interface SMSStatus {
  /** Status code from Kavenegar */
  statusCode: number
  
  /** Human-readable status */
  statusText: string
  
  /** Whether message was delivered */
  delivered: boolean
  
  /** Delivery timestamp */
  deliveredAt?: string
}

/**
 * OTP SMS Template Parameters
 * For Kavenegar's VerifyLookup API
 */
export interface OTPTemplateParams {
  /** Receptor phone number */
  receptor: string
  
  /** OTP token to insert in template */
  token: string
  
  /** Template name in Kavenegar dashboard */
  template: string
  
  /** Additional tokens (token2, token3) if template needs them */
  token2?: string
  token3?: string
  token10?: string
  token20?: string
}

/**
 * Kavenegar API Response (raw)
 */
export interface KavenegarAPIResponse {
  return: Array<{
    messageid: number
    message: string
    status: number
    statustext: string
    sender: string
    receptor: string
    date: number
    cost: number
  }>
  entries: Array<{
    messageid: number
    message: string
    status: number
    statustext: string
    sender: string
    receptor: string
    date: number
    cost: number
  }>
}

/**
 * Kavenegar Error Codes
 */
export enum KavenegarErrorCode {
  INVALID_API_KEY = 200,
  INVALID_RECEPTOR = 406,
  INVALID_SENDER = 407,
  INVALID_MESSAGE = 411,
  INSUFFICIENT_CREDIT = 422,
  SERVER_ERROR = 500,
}

/**
 * Kavenegar Error Messages (Persian)
 */
export const KavenegarErrorMessages: Record<KavenegarErrorCode, string> = {
  [KavenegarErrorCode.INVALID_API_KEY]: 'کلید API نامعتبر است',
  [KavenegarErrorCode.INVALID_RECEPTOR]: 'شماره گیرنده نامعتبر است',
  [KavenegarErrorCode.INVALID_SENDER]: 'شماره فرستنده نامعتبر است',
  [KavenegarErrorCode.INVALID_MESSAGE]: 'متن پیام نامعتبر است',
  [KavenegarErrorCode.INSUFFICIENT_CREDIT]: 'اعتبار کافی نیست',
  [KavenegarErrorCode.SERVER_ERROR]: 'خطای سرور کاوه نگار',
}