// src/shared/utils/errors.ts
import toast from 'react-hot-toast'

/**
 * Custom Error Codes
 * Organized by category for better maintenance
 */
export enum ErrorCode {
  // Authentication Errors (1xxx)
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  INVALID_TOKEN = 1003,
  UNAUTHORIZED = 1004,
  FORBIDDEN = 1005,
  MISSING_TOKEN = 1006,
  INVALID_TOKEN_TYPE = 1007,
  INVALID_SIGNATURE = 1008,

  // OTP Errors (2xxx)
  OTP_EXPIRED = 2001,
  OTP_INVALID = 2002,
  OTP_MAX_ATTEMPTS = 2003,
  OTP_SEND_FAILED = 2004,
  OTP_NOT_FOUND = 2005,
  OTP_ALREADY_VERIFIED = 2006,

  // User Errors (3xxx)
  USER_NOT_FOUND = 3001,
  USER_ALREADY_EXISTS = 3002,
  INVALID_PHONE = 3003,
  INVALID_EMAIL = 3004,
  PROFILE_INCOMPLETE = 3005,

  // Validation Errors (4xxx)
  VALIDATION_ERROR = 4001,
  MISSING_REQUIRED_FIELD = 4002,
  INVALID_FORMAT = 4003,
  INVALID_INPUT = 4004,

  // Server Errors (5xxx)
  SERVER_ERROR = 5001,
  DATABASE_ERROR = 5002,
  EXTERNAL_API_ERROR = 5003,
  CONFIG_ERROR = 5004,

  // Rate Limiting (6xxx)
  RATE_LIMIT_EXCEEDED = 6001,

  // Token Errors (7xxx)
  REFRESH_TOKEN_EXPIRED = 7001,
  REFRESH_TOKEN_INVALID = 7002,
  REFRESH_TOKEN_REVOKED = 7003,
  TOKEN_ROTATION_FAILED = 7004,
}

/**
 * Custom Application Error Class
 * Extends Error with additional properties for better error handling
 */
export class AppError extends Error {
  public readonly timestamp: Date
  public readonly isOperational: boolean

  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.timestamp = new Date()
    this.isOperational = isOperational

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    }
  }

  /**
   * Check if error is a specific type
   */
  is(code: ErrorCode): boolean {
    return this.code === code
  }

  /**
   * Check if error is an auth error (1xxx)
   */
  isAuthError(): boolean {
    return this.code >= 1000 && this.code < 2000
  }

  /**
   * Check if error is an OTP error (2xxx)
   */
  isOTPError(): boolean {
    return this.code >= 2000 && this.code < 3000
  }

  /**
   * Check if error is a validation error (4xxx)
   */
  isValidationError(): boolean {
    return this.code >= 4000 && this.code < 5000
  }
}

/**
 * Error Messages Map (Persian)
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.INVALID_CREDENTIALS]: 'اطلاعات ورود نامعتبر است',
  [ErrorCode.TOKEN_EXPIRED]: 'زمان اعتبار توکن به پایان رسیده است',
  [ErrorCode.INVALID_TOKEN]: 'توکن نامعتبر است',
  [ErrorCode.UNAUTHORIZED]: 'لطفا وارد حساب کاربری خود شوید',
  [ErrorCode.FORBIDDEN]: 'شما به این بخش دسترسی ندارید',
  [ErrorCode.MISSING_TOKEN]: 'توکن یافت نشد',
  [ErrorCode.INVALID_TOKEN_TYPE]: 'نوع توکن اشتباه است',
  [ErrorCode.INVALID_SIGNATURE]: 'امضای توکن نامعتبر است',

  // OTP
  [ErrorCode.OTP_EXPIRED]: 'کد تایید منقضی شده است',
  [ErrorCode.OTP_INVALID]: 'کد تایید نامعتبر است',
  [ErrorCode.OTP_MAX_ATTEMPTS]: 'تعداد تلاش‌ها بیش از حد مجاز است',
  [ErrorCode.OTP_SEND_FAILED]: 'خطا در ارسال کد تایید',
  [ErrorCode.OTP_NOT_FOUND]: 'کد تایید یافت نشد',
  [ErrorCode.OTP_ALREADY_VERIFIED]: 'کد تایید قبلا استفاده شده است',

  // User
  [ErrorCode.USER_NOT_FOUND]: 'کاربر یافت نشد',
  [ErrorCode.USER_ALREADY_EXISTS]: 'کاربر از قبل وجود دارد',
  [ErrorCode.INVALID_PHONE]: 'شماره موبایل نامعتبر است',
  [ErrorCode.INVALID_EMAIL]: 'ایمیل نامعتبر است',
  [ErrorCode.PROFILE_INCOMPLETE]: 'لطفا پروفایل خود را تکمیل کنید',

  // Validation
  [ErrorCode.VALIDATION_ERROR]: 'اطلاعات وارد شده نامعتبر است',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'فیلد الزامی وارد نشده است',
  [ErrorCode.INVALID_FORMAT]: 'فرمت ورودی نامعتبر است',
  [ErrorCode.INVALID_INPUT]: 'ورودی نامعتبر است',

  // Server
  [ErrorCode.SERVER_ERROR]: 'خطای سرور، لطفا دوباره تلاش کنید',
  [ErrorCode.DATABASE_ERROR]: 'خطا در پایگاه داده',
  [ErrorCode.EXTERNAL_API_ERROR]: 'خطا در ارتباط با سرویس خارجی',
  [ErrorCode.CONFIG_ERROR]: 'خطای پیکربندی سرور',

  // Rate Limit
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'تعداد درخواست‌ها بیش از حد مجاز است',

  // Token
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'زمان اعتبار توکن تازه‌سازی به پایان رسیده است',
  [ErrorCode.REFRESH_TOKEN_INVALID]: 'توکن تازه‌سازی نامعتبر است',
  [ErrorCode.REFRESH_TOKEN_REVOKED]: 'توکن تازه‌سازی باطل شده است',
  [ErrorCode.TOKEN_ROTATION_FAILED]: 'خطا در تازه‌سازی توکن',
}

/**
 * Get Error Message by Code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || 'خطای نامشخص'
}

/**
 * Get HTTP Status Code by Error Code
 */
export function getStatusCodeByErrorCode(code: ErrorCode): number {
  // Auth errors
  if (code >= 1000 && code < 2000) {
    if (code === ErrorCode.FORBIDDEN) return 403
    return 401
  }
  
  // OTP errors
  if (code >= 2000 && code < 3000) return 400
  
  // User errors
  if (code >= 3000 && code < 4000) {
    if (code === ErrorCode.USER_NOT_FOUND) return 404
    return 400
  }
  
  // Validation errors
  if (code >= 4000 && code < 5000) return 400
  
  // Server errors
  if (code >= 5000 && code < 6000) return 500
  
  // Rate limiting
  if (code >= 6000 && code < 7000) return 429
  
  // Token errors
  if (code >= 7000 && code < 8000) return 401
  
  return 500
}

// ==================== ERROR HANDLERS ====================

/**
 * Handle API Error
 * Centralized error handler that converts any error to AppError
 */
export function handleAPIError(error: any): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      ErrorCode.SERVER_ERROR,
      error.message || 'خطای نامشخص',
      500,
      { originalError: error.message }
    )
  }

  // String error
  if (typeof error === 'string') {
    return new AppError(ErrorCode.SERVER_ERROR, error, 500)
  }

  // Unknown error
  return new AppError(
    ErrorCode.SERVER_ERROR,
    'خطای نامشخص رخ داده است',
    500,
    { error }
  )
}

/**
 * Log Error (Server-side)
 * Logs error with context for debugging
 */
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString()
  const prefix = `[ERROR${context ? ` - ${context}` : ''}] [${timestamp}]`

  if (error instanceof AppError) {
    console.error(prefix, {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: error.timestamp,
      stack: error.stack,
    })
  } else if (error instanceof Error) {
    console.error(prefix, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
  } else {
    console.error(prefix, error)
  }
}

// ==================== ERROR FACTORY FUNCTIONS ====================

/**
 * Create Validation Error
 */
export function createValidationError(
  message?: string,
  details?: any
): AppError {
  return new AppError(
    ErrorCode.VALIDATION_ERROR,
    message || getErrorMessage(ErrorCode.VALIDATION_ERROR),
    400,
    details
  )
}

/**
 * Create Unauthorized Error
 */
export function createUnauthorizedError(message?: string): AppError {
  return new AppError(
    ErrorCode.UNAUTHORIZED,
    message || getErrorMessage(ErrorCode.UNAUTHORIZED),
    401
  )
}

/**
 * Create Token Expired Error
 */
export function createTokenExpiredError(message?: string): AppError {
  return new AppError(
    ErrorCode.TOKEN_EXPIRED,
    message || getErrorMessage(ErrorCode.TOKEN_EXPIRED),
    401
  )
}

/**
 * Create Invalid Token Error
 */
export function createInvalidTokenError(message?: string): AppError {
  return new AppError(
    ErrorCode.INVALID_TOKEN,
    message || getErrorMessage(ErrorCode.INVALID_TOKEN),
    401
  )
}

/**
 * Create Missing Token Error
 */
export function createMissingTokenError(message?: string): AppError {
  return new AppError(
    ErrorCode.MISSING_TOKEN,
    message || getErrorMessage(ErrorCode.MISSING_TOKEN),
    401
  )
}

/**
 * Create Invalid Signature Error
 */
export function createInvalidSignatureError(message?: string): AppError {
  return new AppError(
    ErrorCode.INVALID_SIGNATURE,
    message || getErrorMessage(ErrorCode.INVALID_SIGNATURE),
    401
  )
}

/**
 * Create Invalid Token Type Error
 */
export function createInvalidTokenTypeError(message?: string): AppError {
  return new AppError(
    ErrorCode.INVALID_TOKEN_TYPE,
    message || getErrorMessage(ErrorCode.INVALID_TOKEN_TYPE),
    401
  )
}

/**
 * Create Forbidden Error
 */
export function createForbiddenError(message?: string): AppError {
  return new AppError(
    ErrorCode.FORBIDDEN,
    message || getErrorMessage(ErrorCode.FORBIDDEN),
    403
  )
}

/**
 * Create Not Found Error
 */
export function createNotFoundError(message?: string): AppError {
  return new AppError(
    ErrorCode.USER_NOT_FOUND,
    message || getErrorMessage(ErrorCode.USER_NOT_FOUND),
    404
  )
}

/**
 * Create User Not Found Error
 */
export function createUserNotFoundError(message?: string): AppError {
  return new AppError(
    ErrorCode.USER_NOT_FOUND,
    message || getErrorMessage(ErrorCode.USER_NOT_FOUND),
    404
  )
}

/**
 * Create OTP Expired Error
 */
export function createOTPExpiredError(message?: string): AppError {
  return new AppError(
    ErrorCode.OTP_EXPIRED,
    message || getErrorMessage(ErrorCode.OTP_EXPIRED),
    400
  )
}

/**
 * Create OTP Invalid Error
 */
export function createOTPInvalidError(message?: string): AppError {
  return new AppError(
    ErrorCode.OTP_INVALID,
    message || getErrorMessage(ErrorCode.OTP_INVALID),
    400
  )
}

/**
 * Create OTP Max Attempts Error
 */
export function createOTPMaxAttemptsError(message?: string): AppError {
  return new AppError(
    ErrorCode.OTP_MAX_ATTEMPTS,
    message || getErrorMessage(ErrorCode.OTP_MAX_ATTEMPTS),
    429
  )
}

/**
 * Create Rate Limit Error
 */
export function createRateLimitError(message?: string): AppError {
  return new AppError(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    message || getErrorMessage(ErrorCode.RATE_LIMIT_EXCEEDED),
    429
  )
}

/**
 * Create Server Error
 */
export function createServerError(message?: string, details?: any): AppError {
  return new AppError(
    ErrorCode.SERVER_ERROR,
    message || getErrorMessage(ErrorCode.SERVER_ERROR),
    500,
    details
  )
}

/**
 * Create Database Error
 */
export function createDatabaseError(message?: string, details?: any): AppError {
  return new AppError(
    ErrorCode.DATABASE_ERROR,
    message || getErrorMessage(ErrorCode.DATABASE_ERROR),
    500,
    details
  )
}

/**
 * Create External API Error
 */
export function createExternalAPIError(
  message?: string,
  details?: any
): AppError {
  return new AppError(
    ErrorCode.EXTERNAL_API_ERROR,
    message || getErrorMessage(ErrorCode.EXTERNAL_API_ERROR),
    500,
    details
  )
}

/**
 * Create Refresh Token Error
 */
export function createRefreshTokenError(
  code: ErrorCode.REFRESH_TOKEN_EXPIRED | ErrorCode.REFRESH_TOKEN_INVALID | ErrorCode.REFRESH_TOKEN_REVOKED,
  message?: string
): AppError {
  return new AppError(
    code,
    message || getErrorMessage(code),
    401
  )
}

// ==================== CLIENT-SIDE ERROR HANDLING ====================

/**
 * Show Error Toast (Client-side)
 */
export function showErrorToast(error: any, fallbackMessage?: string) {
  let message = fallbackMessage || 'خطایی رخ داده است'

  if (error instanceof AppError) {
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else if (error?.response?.data?.error) {
    message = error.response.data.error
  } else if (error?.error) {
    message = error.error
  }

  toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#ef4444',
      color: '#fff',
      fontFamily: 'inherit',
    },
  })
}

/**
 * Show Success Toast (Client-side)
 */
export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      fontFamily: 'inherit',
    },
  })
}

/**
 * Show Loading Toast (Client-side)
 */
export function showLoadingToast(message: string = 'در حال پردازش...') {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      fontFamily: 'inherit',
    },
  })
}

/**
 * Dismiss Toast
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId)
}

/**
 * Check if Error is Retryable
 * Determines if the error can be retried by the user
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof AppError) {
    // Network errors and server errors are retryable
    return (
      error.code === ErrorCode.SERVER_ERROR ||
      error.code === ErrorCode.DATABASE_ERROR ||
      error.code === ErrorCode.EXTERNAL_API_ERROR
    )
  }
  return false
}

/**
 * Should Redirect to Login
 * Determines if the error should redirect user to login
 */
export function shouldRedirectToLogin(error: any): boolean {
  if (error instanceof AppError) {
    return (
      error.code === ErrorCode.UNAUTHORIZED ||
      error.code === ErrorCode.TOKEN_EXPIRED ||
      error.code === ErrorCode.INVALID_TOKEN ||
      error.code === ErrorCode.REFRESH_TOKEN_EXPIRED ||
      error.code === ErrorCode.REFRESH_TOKEN_REVOKED
    )
  }
  return false
}