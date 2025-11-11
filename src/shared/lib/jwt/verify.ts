// src/shared/lib/jwt/verify.ts
import { jwtVerify } from 'jose'
import { AccessTokenPayload, RefreshTokenPayload } from './types'
import {
  createMissingTokenError,
  createInvalidTokenError,
  createTokenExpiredError,
  createInvalidSignatureError,
  createInvalidTokenTypeError,
  logError,
} from '@/shared/utils/errors'

// Get secrets from environment variables
const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables')
  }
  return new TextEncoder().encode(secret)
}

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new Error(
      'JWT_REFRESH_SECRET is not defined in environment variables'
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Verify Access Token
 * Validates signature, expiry, and token type
 *
 * @param token - JWT access token string
 * @returns Verified payload
 * @throws AppError if verification fails
 */
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  try {
    // Check if token exists
    if (!token || token.trim() === '') {
      throw createMissingTokenError()
    }

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      algorithms: ['HS256'],
    })

    // Type guard: ensure it's an access token
    if (payload.type !== 'access') {
      throw createInvalidTokenTypeError('این توکن یک توکن دسترسی نیست')
    }

    return payload as unknown as AccessTokenPayload
  } catch (error: any) {
    // Log the error for debugging
    logError(error, 'verifyAccessToken')

    // Map jose errors to AppError
    throw mapJWTErrorToAppError(error)
  }
}

/**
 * Verify Refresh Token
 * Validates signature, expiry, token type, and JTI presence
 *
 * @param token - JWT refresh token string
 * @returns Verified payload
 * @throws AppError if verification fails
 */
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
  try {
    // Check if token exists
    if (!token || token.trim() === '') {
      throw createMissingTokenError()
    }

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      algorithms: ['HS256'],
    })

    // Type guard: ensure it's a refresh token with JTI
    if (payload.type !== 'refresh' || !payload.jti) {
      throw createInvalidTokenTypeError('این توکن یک توکن تازه‌سازی نیست')
    }

    return payload as unknown as RefreshTokenPayload
  } catch (error: any) {
    // Log the error for debugging
    logError(error, 'verifyRefreshToken')

    // Map jose errors to AppError
    throw mapJWTErrorToAppError(error)
  }
}

/**
 * Decode Token Without Verification
 * Use only for non-security purposes (e.g., checking expiry before refresh)
 * NEVER trust this data for authentication
 *
 * @param token - JWT token string
 * @returns Decoded payload or null
 */
export function decodeTokenUnsafe(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = Buffer.from(parts[1], 'base64').toString('utf-8')
    return JSON.parse(payload)
  } catch (error) {
    logError(error, 'decodeTokenUnsafe')
    return null
  }
}

/**
 * Check if Token is Expired
 * Uses unsafe decode, so only for client-side UX
 *
 * @param token - JWT token string
 * @returns true if expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenUnsafe(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Check if Token Needs Refresh
 * Returns true if token expires in less than 5 minutes
 *
 * @param token - JWT access token string
 * @returns true if should refresh soon
 */
export function shouldRefreshToken(token: string): boolean {
  const payload = decodeTokenUnsafe(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  const fiveMinutes = 5 * 60
  return payload.exp - now < fiveMinutes
}

/**
 * Extract User ID from Token
 * Uses unsafe decode for convenience
 *
 * @param token - JWT token string
 * @returns userId or null
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeTokenUnsafe(token)
  return payload?.userId || null
}

/**
 * Get Token Expiry Time
 * Returns the expiration timestamp
 *
 * @param token - JWT token string
 * @returns Expiry timestamp in seconds, or null if invalid
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeTokenUnsafe(token)
  return payload?.exp || null
}

/**
 * Get Time Until Token Expires
 * Returns seconds until expiration
 *
 * @param token - JWT token string
 * @returns Seconds until expiry, or 0 if expired/invalid
 */
export function getTimeUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token)
  if (!expiry) return 0

  const now = Math.floor(Date.now() / 1000)
  const timeLeft = expiry - now
  return Math.max(0, timeLeft)
}

/**
 * Map JWT Library Errors to AppError
 * Converts jose library errors to our custom error types
 *
 * @param error - Error from jose library
 * @returns AppError with appropriate error code
 */
function mapJWTErrorToAppError(error: any): Error {
  // Already an AppError, return as is
  if (error.name === 'AppError') {
    return error
  }

  const errorCode = error?.code || error?.message || ''
  const errorMessage = error?.message || ''

  // Token expired
  if (
    errorCode.includes('expired') ||
    errorCode.includes('exp') ||
    errorMessage.includes('expired')
  ) {
    return createTokenExpiredError()
  }

  // Invalid signature
  if (
    errorCode.includes('signature') ||
    errorMessage.includes('signature')
  ) {
    return createInvalidSignatureError()
  }

  // Missing or empty token
  if (
    errorCode.includes('compact') ||
    errorMessage.includes('compact') ||
    errorMessage.includes('Invalid')
  ) {
    return createInvalidTokenError('فرمت توکن نامعتبر است')
  }

  // Generic invalid token
  return createInvalidTokenError()
}

/**
 * Validate Token Format
 * Checks if string looks like a JWT before verification
 *
 * @param token - Token string to validate
 * @returns true if valid JWT format
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  // Check if parts are base64url encoded
  const base64urlPattern = /^[A-Za-z0-9_-]+$/
  return parts.every(part => base64urlPattern.test(part))
}

/**
 * Extract Token Type Without Verification
 * Gets the token type (access/refresh) without full verification
 * Use only for routing/UI decisions, not security
 *
 * @param token - JWT token string
 * @returns 'access' | 'refresh' | null
 */
export function getTokenType(
  token: string
): 'access' | 'refresh' | null {
  const payload = decodeTokenUnsafe(token)
  return payload?.type || null
}