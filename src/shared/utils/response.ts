// src/shared/utils/response.ts
import { NextResponse } from 'next/server'
import { AppError, ErrorCode, logError } from './errors'

/**
 * Standard API Response Structure
 */
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  code?: ErrorCode
  timestamp?: string
}

/**
 * Success Response Helper
 * Returns standardized success response
 *
 * @param data - Response data
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Error Response Helper
 * Returns standardized error response
 * Automatically handles AppError instances
 *
 * @param error - Error message, AppError, or Error instance
 * @param statusCode - HTTP status code (default: 400)
 * @param code - Optional error code
 * @param details - Optional error details
 */
export function errorResponse(
  error: string | Error | AppError,
  statusCode?: number,
  code?: ErrorCode,
  details?: any
): NextResponse<APIResponse> {
  let errorMessage: string
  let errorCode: ErrorCode | undefined
  let errorStatusCode: number
  let errorDetails: any

  // Handle AppError
  if (error instanceof AppError) {
    errorMessage = error.message
    errorCode = error.code
    errorStatusCode = error.statusCode
    errorDetails = error.details

    // Log the error
    logError(error, 'API Response')
  }
  // Handle standard Error
  else if (error instanceof Error) {
    errorMessage = error.message
    errorCode = code
    errorStatusCode = statusCode || 500
    errorDetails = details

    // Log the error
    logError(error, 'API Response')
  }
  // Handle string error
  else {
    errorMessage = error
    errorCode = code
    errorStatusCode = statusCode || 400
    errorDetails = details
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      statusCode: errorStatusCode,
      code: errorCode,
      timestamp: new Date().toISOString(),
      ...(errorDetails && { details: errorDetails }),
    },
    { status: errorStatusCode }
  )
}

/**
 * Handle API Route Error
 * Centralized error handler for API routes
 * Converts any error to proper response
 *
 * @param error - Any error type
 * @param context - Optional context for logging
 */
export function handleAPIRouteError(
  error: any,
  context?: string
): NextResponse<APIResponse> {
  // Log with context
  logError(error, context || 'API Route')

  // Handle AppError
  if (error instanceof AppError) {
    return errorResponse(error)
  }

  // Handle standard Error
  if (error instanceof Error) {
    return errorResponse(error, 500)
  }

  // Handle unknown errors
  return errorResponse('خطای نامشخص رخ داده است', 500)
}

// ==================== SPECIFIC RESPONSE HELPERS ====================

/**
 * Validation Error Response (400)
 */
export function validationError(
  message: string,
  details?: any
): NextResponse<APIResponse> {
  return errorResponse(message, 400, ErrorCode.VALIDATION_ERROR, details)
}

/**
 * Unauthorized Error Response (401)
 */
export function unauthorizedError(
  message: string = 'احراز هویت نشده‌اید'
): NextResponse<APIResponse> {
  return errorResponse(message, 401, ErrorCode.UNAUTHORIZED)
}

/**
 * Forbidden Error Response (403)
 */
export function forbiddenError(
  message: string = 'دسترسی غیرمجاز'
): NextResponse<APIResponse> {
  return errorResponse(message, 403, ErrorCode.FORBIDDEN)
}

/**
 * Not Found Error Response (404)
 */
export function notFoundError(
  message: string = 'یافت نشد'
): NextResponse<APIResponse> {
  return errorResponse(message, 404, ErrorCode.USER_NOT_FOUND)
}

/**
 * Rate Limit Error Response (429)
 */
export function rateLimitError(
  message: string = 'تعداد درخواست‌ها بیش از حد مجاز است'
): NextResponse<APIResponse> {
  return errorResponse(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED)
}

/**
 * Server Error Response (500)
 */
export function serverError(
  message: string = 'خطای سرور'
): NextResponse<APIResponse> {
  return errorResponse(message, 500, ErrorCode.SERVER_ERROR)
}

/**
 * Database Error Response (500)
 */
export function databaseError(
  message: string = 'خطا در پایگاه داده',
  details?: any
): NextResponse<APIResponse> {
  return errorResponse(message, 500, ErrorCode.DATABASE_ERROR, details)
}

/**
 * External API Error Response (500)
 */
export function externalAPIError(
  message: string = 'خطا در ارتباط با سرویس خارجی',
  details?: any
): NextResponse<APIResponse> {
  return errorResponse(message, 500, ErrorCode.EXTERNAL_API_ERROR, details)
}

// ==================== SUCCESS RESPONSE HELPERS ====================

/**
 * Created Response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<APIResponse<T>> {
  return successResponse(data, message, 201)
}

/**
 * Accepted Response (202)
 */
export function acceptedResponse<T>(
  data: T,
  message?: string
): NextResponse<APIResponse<T>> {
  return successResponse(data, message, 202)
}

/**
 * No Content Response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ==================== REDIRECT HELPERS ====================

/**
 * Redirect Response Helper
 */
export function redirectResponse(url: string, permanent: boolean = false) {
  return NextResponse.redirect(url, {
    status: permanent ? 308 : 307,
  })
}

/**
 * Redirect to Login
 * Helper for redirecting to login with optional return URL
 */
export function redirectToLogin(returnUrl?: string) {
  const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  
  if (returnUrl) {
    loginUrl.searchParams.set('redirectedFrom', returnUrl)
  }
  
  return redirectResponse(loginUrl.toString())
}

// ==================== COOKIE RESPONSE HELPERS ====================

/**
 * Success Response with Cookies
 * Returns success response and sets cookies
 */
export function successResponseWithCookies<T>(
  data: T,
  cookies: Array<{ name: string; value: string; options: any }>,
  message?: string,
  statusCode: number = 200
): NextResponse<APIResponse<T>> {
  const response = successResponse(data, message, statusCode)

  // Set all cookies
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}

/**
 * Error Response with Cookie Clearing
 * Returns error response and clears auth cookies
 */
export function errorResponseWithClearedCookies(
  error: string | Error | AppError,
  statusCode?: number,
  code?: ErrorCode
): NextResponse<APIResponse> {
  const response = errorResponse(error, statusCode, code)

  // Clear auth cookies
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')

  return response
}

// ==================== TYPE GUARDS ====================

/**
 * Check if response is successful
 */
export function isSuccessResponse(response: APIResponse): response is APIResponse & { success: true; data: any } {
  return response.success === true
}

/**
 * Check if response is error
 */
export function isErrorResponse(response: APIResponse): response is APIResponse & { success: false; error: string } {
  return response.success === false
}

// ==================== RESPONSE UTILITIES ====================

/**
 * Parse API Response
 * Helper for client-side to handle API responses
 */
export async function parseAPIResponse<T = any>(
  response: Response
): Promise<APIResponse<T>> {
  try {
    const data = await response.json()
    return data as APIResponse<T>
  } catch (error) {
    return {
      success: false,
      error: 'خطا در پردازش پاسخ سرور',
      statusCode: 500,
    }
  }
}