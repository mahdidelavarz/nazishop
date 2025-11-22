// src/shared/lib/kavenegar/types.ts

/**
 * Kavenegar Configuration
 */
export interface KavenegarConfig {
  /** API Key from Kavenegar dashboard */
  apiKey: string
  
  /** Sender number (usually a 10-digit number like 10004346) */
  sender: string
  
  /** Whether in development mode (skips actual sending) */
  isDevelopment: boolean
  
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  
  /** Max retry attempts for failed requests (default: 3) */
  maxRetries?: number
  
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number
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
  
  /** Scheduled send time (Unix timestamp) */
  date?: number
  
  /** Message type (1: Flash, 2: Voice, default: normal) */
  type?: 1 | 2
}

/**
 * Bulk SMS Parameters
 */
export interface BulkSMSParams {
  /** Array of messages */
  messages: string[]
  
  /** Array of receptor phone numbers (same length as messages) */
  receptors: string[]
  
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
  
  /** Error code from Kavenegar */
  errorCode?: number
  
  /** Cost of sending (in Rials) */
  cost?: number
}

/**
 * Bulk SMS Result
 */
export interface BulkSMSResult {
  /** Whether all messages were sent successfully */
  success: boolean
  
  /** Array of individual results */
  results: SMSResult[]
  
  /** Total number of messages sent */
  sentCount: number
  
  /** Total number of failed messages */
  failedCount: number
  
  /** Total cost (in Rials) */
  totalCost?: number
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
  
  /** Delivery timestamp (Unix timestamp) */
  deliveredAt?: number
  
  /** Cost of message (in Rials) */
  cost?: number
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
  
  /** Message type (1: SMS, 2: Call) */
  type?: 'sms' | 'call'
}

/**
 * Kavenegar API Response (raw)
 * Based on Kavenegar API documentation
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
  entries?: Array<{
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
 * Kavenegar Status Response
 */
export interface KavenegarStatusResponse {
  return: Array<{
    messageid: number
    status: number
    statustext: string
  }>
}

/**
 * Kavenegar Error Response
 */
export interface KavenegarErrorResponse {
  return: {
    status: number
    message: string
  }
}

/**
 * Kavenegar Error Codes
 */
export enum KavenegarErrorCode {
  /** استفاده از وب سرویس از آی پی مجاز نیست */
  UNAUTHORIZED_IP = 101,
  
  /** کد کاربری ارسال نشده است */
  MISSING_USER_CODE = 102,
  
  /** رمز عبور ارسال نشده است */
  MISSING_PASSWORD = 103,
  
  /** کد کاربری یا رمز عبور اشتباه است */
  INVALID_CREDENTIALS = 104,
  
  /** حساب کاربری غیرفعال شده است */
  ACCOUNT_DISABLED = 105,
  
  /** عملیات ناموفق */
  OPERATION_FAILED = 106,
  
  /** کلید API نامعتبر است */
  INVALID_API_KEY = 200,
  
  /** دسترسی به آی پی محدود شده است */
  IP_RESTRICTED = 201,
  
  /** شماره فرستنده خطا است */
  INVALID_SENDER = 407,
  
  /** شماره گیرنده خطا است */
  INVALID_RECEPTOR = 406,
  
  /** متن پیام خالی است */
  EMPTY_MESSAGE = 409,
  
  /** متن پیام نامعتبر است */
  INVALID_MESSAGE = 411,
  
  /** طول پیام بیش از حد مجاز است */
  MESSAGE_TOO_LONG = 412,
  
  /** مقدار ارسالی برای تاریخ معتبر نیست */
  INVALID_DATE = 413,
  
  /** اعتبار کافی نیست */
  INSUFFICIENT_CREDIT = 422,
  
  /** محدودیت در ارسال روزانه */
  DAILY_LIMIT_EXCEEDED = 423,
  
  /** محدودیت در حجم ارسال */
  VOLUME_LIMIT_EXCEEDED = 424,
  
  /** خطای سرور */
  SERVER_ERROR = 500,
  
  /** دریافت کننده نامعتبر است */
  INVALID_RECIPIENT = 501,
  
  /** خطای نامشخص */
  UNKNOWN_ERROR = 999,
}

/**
 * Kavenegar Error Messages (Persian)
 */
export const KavenegarErrorMessages: Record<number, string> = {
  [KavenegarErrorCode.UNAUTHORIZED_IP]: 'استفاده از وب سرویس از این آی پی مجاز نیست',
  [KavenegarErrorCode.MISSING_USER_CODE]: 'کد کاربری ارسال نشده است',
  [KavenegarErrorCode.MISSING_PASSWORD]: 'رمز عبور ارسال نشده است',
  [KavenegarErrorCode.INVALID_CREDENTIALS]: 'کد کاربری یا رمز عبور اشتباه است',
  [KavenegarErrorCode.ACCOUNT_DISABLED]: 'حساب کاربری غیرفعال شده است',
  [KavenegarErrorCode.OPERATION_FAILED]: 'عملیات ناموفق بود',
  [KavenegarErrorCode.INVALID_API_KEY]: 'کلید API نامعتبر است',
  [KavenegarErrorCode.IP_RESTRICTED]: 'دسترسی از این آی پی محدود شده است',
  [KavenegarErrorCode.INVALID_SENDER]: 'شماره فرستنده نامعتبر است',
  [KavenegarErrorCode.INVALID_RECEPTOR]: 'شماره گیرنده نامعتبر است',
  [KavenegarErrorCode.EMPTY_MESSAGE]: 'متن پیام خالی است',
  [KavenegarErrorCode.INVALID_MESSAGE]: 'متن پیام نامعتبر است',
  [KavenegarErrorCode.MESSAGE_TOO_LONG]: 'طول پیام بیش از حد مجاز است',
  [KavenegarErrorCode.INVALID_DATE]: 'تاریخ نامعتبر است',
  [KavenegarErrorCode.INSUFFICIENT_CREDIT]: 'اعتبار کافی نیست',
  [KavenegarErrorCode.DAILY_LIMIT_EXCEEDED]: 'محدودیت ارسال روزانه رعایت نشده است',
  [KavenegarErrorCode.VOLUME_LIMIT_EXCEEDED]: 'محدودیت حجم ارسال رعایت نشده است',
  [KavenegarErrorCode.SERVER_ERROR]: 'خطای سرور کاوه نگار',
  [KavenegarErrorCode.INVALID_RECIPIENT]: 'دریافت کننده نامعتبر است',
  [KavenegarErrorCode.UNKNOWN_ERROR]: 'خطای نامشخص رخ داده است',
}

/**
 * SMS Status Codes
 * Based on Kavenegar documentation
 */
export enum SMSStatusCode {
  /** در صف ارسال */
  QUEUED = 1,
  
  /** زمان‌بندی شده */
  SCHEDULED = 2,
  
  /** ارسال شده به مخابرات */
  SENT_TO_TELCO = 4,
  
  /** ارسال شده به مخابرات (تکراری) */
  SENT_TO_TELCO_ALT = 5,
  
  /** رسیده به گیرنده */
  DELIVERED = 10,
  
  /** نرسیده به گیرنده */
  NOT_DELIVERED = 11,
  
  /** منتظر تایید */
  WAITING_CONFIRMATION = 13,
  
  /** خطا در ارسال */
  SEND_ERROR = 14,
  
  /** بلک‌لیست شده */
  BLACKLISTED = 100,
}

/**
 * SMS Status Text Mapping
 */
export const SMSStatusMessages: Record<number, string> = {
  [SMSStatusCode.QUEUED]: 'در صف ارسال',
  [SMSStatusCode.SCHEDULED]: 'زمان‌بندی شده',
  [SMSStatusCode.SENT_TO_TELCO]: 'ارسال شده به مخابرات',
  [SMSStatusCode.SENT_TO_TELCO_ALT]: 'ارسال شده به مخابرات',
  [SMSStatusCode.DELIVERED]: 'رسیده به گیرنده',
  [SMSStatusCode.NOT_DELIVERED]: 'نرسیده به گیرنده',
  [SMSStatusCode.WAITING_CONFIRMATION]: 'منتظر تایید',
  [SMSStatusCode.SEND_ERROR]: 'خطا در ارسال',
  [SMSStatusCode.BLACKLISTED]: 'بلک‌لیست شده',
}

/**
 * Kavenegar Client Options
 */
export interface KavenegarClientOptions {
  /** API Key */
  apiKey: string
  
  /** Request timeout */
  timeout?: number
  
  /** Base URL (for custom endpoints) */
  baseUrl?: string
}

/**
 * Type guard for Kavenegar error response
 */
export function isKavenegarError(response: any): response is KavenegarErrorResponse {
  return response && response.return && typeof response.return.status === 'number'
}

/**
 * Get error message from error code
 */
export function getKavenegarErrorMessage(code: number): string {
  return KavenegarErrorMessages[code] || KavenegarErrorMessages[KavenegarErrorCode.UNKNOWN_ERROR]
}

/**
 * Get status message from status code
 */
export function getSMSStatusMessage(code: number): string {
  return SMSStatusMessages[code] || 'وضعیت نامشخص'
}