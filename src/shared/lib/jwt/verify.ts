// src/shared/lib/jwt/verify.ts

import { jwtVerify, decodeJwt, type JWTPayload as JoseJWTPayload } from 'jose'
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  JWTVerifyResult,
  JWTError,
  BaseJWTPayload,
  JWTVerifyOptions,
  TokenValidationContext,
  DecodedJWT,
  JWTConfig,
} from './types'

// ==================== SECRET MANAGEMENT ====================

/**
 * Cached secrets to avoid repeated encoding
 */
let cachedAccessSecret: Uint8Array | null = null
let cachedRefreshSecret: Uint8Array | null = null

/**
 * Get access token secret (cached)
 * @throws Error if JWT_ACCESS_SECRET is not defined
 */
function getAccessSecret(): Uint8Array {
  if (cachedAccessSecret) {
    return cachedAccessSecret
  }

  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables')
  }

  cachedAccessSecret = new TextEncoder().encode(secret)
  return cachedAccessSecret
}

/**
 * Get refresh token secret (cached)
 * @throws Error if JWT_REFRESH_SECRET is not defined
 */
function getRefreshSecret(): Uint8Array {
  if (cachedRefreshSecret) {
    return cachedRefreshSecret
  }

  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
  }

  cachedRefreshSecret = new TextEncoder().encode(secret)
  return cachedRefreshSecret
}

/**
 * Clear cached secrets (useful for testing)
 */
export function clearVerifySecretCache(): void {
  cachedAccessSecret = null
  cachedRefreshSecret = null
}

/**
 * Get JWT configuration
 */
function getConfig(): Partial<JWTConfig> {
  return {
    algorithm: (process.env.JWT_ALGORITHM as any) || 'HS256',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  }
}

// ==================== VERIFICATION FUNCTIONS ====================

/**
 * Verify Access Token
 * Validates signature, expiry, and token type
 *
 * @param token - JWT access token string
 * @param options - Optional verification options
 * @returns Verification result with payload or error
 */
export async function verifyAccessToken(
  token: string,
  options?: JWTVerifyOptions
): Promise<JWTVerifyResult<AccessTokenPayload>> {
  try {
    // Check if token exists
    if (!token || token.trim() === '') {
      return {
        valid: false,
        error: 'MISSING_TOKEN',
      }
    }

    // Validate JWT format
    if (!isValidJWTFormat(token)) {
      return {
        valid: false,
        error: 'MALFORMED_TOKEN',
      }
    }

    const config = getConfig()

    // Build verification options
    const verifyOptions: any = {
      algorithms: options?.algorithms || [config.algorithm || 'HS256'],
    }

    if (options?.issuer || config.issuer) {
      verifyOptions.issuer = options?.issuer || config.issuer
    }

    if (options?.audience || config.audience) {
      verifyOptions.audience = options?.audience || config.audience
    }

    if (options?.clockTolerance) {
      verifyOptions.clockTolerance = options.clockTolerance
    }

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, getAccessSecret(), verifyOptions)

    // Type guard: ensure it's an access token
    if (payload.type !== 'access') {
      return {
        valid: false,
        error: 'INVALID_TYPE',
      }
    }

    // Cast to AccessTokenPayload
    const accessPayload = payload as unknown as AccessTokenPayload

    return {
      valid: true,
      payload: accessPayload,
    }
  } catch (error: any) {
    const jwtError = mapJWTError(error)
    return {
      valid: false,
      error: jwtError,
    }
  }
}

/**
 * Verify Refresh Token
 * Validates signature, expiry, token type, and JTI presence
 *
 * @param token - JWT refresh token string
 * @param options - Optional verification options
 * @param context - Optional validation context (for blacklist checking)
 * @returns Verification result with payload or error
 */
export async function verifyRefreshToken(
  token: string,
  options?: JWTVerifyOptions,
  context?: TokenValidationContext
): Promise<JWTVerifyResult<RefreshTokenPayload>> {
  try {
    // Check if token exists
    if (!token || token.trim() === '') {
      return {
        valid: false,
        error: 'MISSING_TOKEN',
      }
    }

    // Validate JWT format
    if (!isValidJWTFormat(token)) {
      return {
        valid: false,
        error: 'MALFORMED_TOKEN',
      }
    }

    const config = getConfig()

    // Build verification options
    const verifyOptions: any = {
      algorithms: options?.algorithms || [config.algorithm || 'HS256'],
    }

    if (options?.issuer || config.issuer) {
      verifyOptions.issuer = options?.issuer || config.issuer
    }

    if (options?.audience || config.audience) {
      verifyOptions.audience = options?.audience || config.audience
    }

    if (options?.clockTolerance) {
      verifyOptions.clockTolerance = options.clockTolerance
    }

    // Verify JWT signature and expiry
    const { payload } = await jwtVerify(token, getRefreshSecret(), verifyOptions)

    // Type guard: ensure it's a refresh token with JTI
    if (payload.type !== 'refresh' || !payload.jti) {
      return {
        valid: false,
        error: 'INVALID_TYPE',
      }
    }

    // Cast to RefreshTokenPayload
    const refreshPayload = payload as unknown as RefreshTokenPayload

    // Additional validation if context provided
    if (context?.expectedUserId && refreshPayload.userId !== context.expectedUserId) {
      return {
        valid: false,
        error: 'INVALID_TOKEN',
      }
    }

    return {
      valid: true,
      payload: refreshPayload,
    }
  } catch (error: any) {
    const jwtError = mapJWTError(error)
    return {
      valid: false,
      error: jwtError,
    }
  }
}

/**
 * Verify Token (Generic)
 * Automatically detects token type and verifies accordingly
 *
 * @param token - JWT token string
 * @param options - Optional verification options
 * @returns Verification result with payload or error
 */
export async function verifyToken(
  token: string,
  options?: JWTVerifyOptions
): Promise<JWTVerifyResult<BaseJWTPayload>> {
  // Try to detect token type first
  const tokenType = getTokenType(token)

  if (tokenType === 'access') {
    return verifyAccessToken(token, options)
  } else if (tokenType === 'refresh') {
    return verifyRefreshToken(token, options)
  }

  // Unknown type, try access token first
  const accessResult = await verifyAccessToken(token, options)
  if (accessResult.valid) {
    return accessResult
  }

  // Try refresh token
  return verifyRefreshToken(token, options)
}

// ==================== UNSAFE DECODE FUNCTIONS ====================

/**
 * Decode Token Without Verification
 * Use only for non-security purposes (e.g., checking expiry before refresh)
 * NEVER trust this data for authentication
 *
 * @param token - JWT token string
 * @returns Decoded payload or null
 */
export function decodeTokenUnsafe(token: string): JoseJWTPayload | null {
  try {
    if (!token || !isValidJWTFormat(token)) {
      return null
    }

    return decodeJwt(token)
  } catch (error) {
    return null
  }
}

/**
 * Decode Token with Header
 * Returns complete decoded structure without verification
 *
 * @param token - JWT token string
 * @returns Decoded JWT with header, payload, and signature
 */
export function decodeTokenComplete(token: string): DecodedJWT | null {
  try {
    if (!token || !isValidJWTFormat(token)) {
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode header
    const headerJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))
    const header = JSON.parse(headerJson)

    // Decode payload
    const payload = decodeJwt(token)

    return {
      header,
      payload,
      signature: parts[2],
    }
  } catch (error) {
    return null
  }
}

// ==================== TOKEN UTILITY FUNCTIONS ====================

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
 * Returns true if token expires in less than specified threshold
 *
 * @param token - JWT access token string
 * @param thresholdSeconds - Seconds before expiry to trigger refresh (default: 5 minutes)
 * @returns true if should refresh soon
 */
export function shouldRefreshToken(
  token: string,
  thresholdSeconds: number = 300
): boolean {
  const payload = decodeTokenUnsafe(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp - now < thresholdSeconds
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
  return payload?.userId as string || null
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
 * Get Token Issued At Time
 * Returns the issued at timestamp
 *
 * @param token - JWT token string
 * @returns Issued at timestamp in seconds, or null if invalid
 */
export function getTokenIssuedAt(token: string): number | null {
  const payload = decodeTokenUnsafe(token)
  return payload?.iat || null
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
 * Get Token Age
 * Returns how long ago the token was issued
 *
 * @param token - JWT token string
 * @returns Age in seconds, or 0 if invalid
 */
export function getTokenAge(token: string): number {
  const issuedAt = getTokenIssuedAt(token)
  if (!issuedAt) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, now - issuedAt)
}

/**
 * Get Token Lifetime
 * Returns total lifetime of token (exp - iat)
 *
 * @param token - JWT token string
 * @returns Lifetime in seconds, or 0 if invalid
 */
export function getTokenLifetime(token: string): number {
  const payload = decodeTokenUnsafe(token)
  if (!payload || !payload.exp || !payload.iat) return 0

  return payload.exp - payload.iat
}

/**
 * Extract Token Type Without Verification
 * Gets the token type (access/refresh) without full verification
 * Use only for routing/UI decisions, not security
 *
 * @param token - JWT token string
 * @returns 'access' | 'refresh' | null
 */
export function getTokenType(token: string): 'access' | 'refresh' | null {
  const payload = decodeTokenUnsafe(token)
  const type = payload?.type as string
  
  if (type === 'access' || type === 'refresh') {
    return type
  }
  
  return null
}

/**
 * Get JTI from Refresh Token
 * Extracts the JWT ID from a refresh token
 *
 * @param token - JWT refresh token string
 * @returns JTI string or null
 */
export function getTokenJTI(token: string): string | null {
  const payload = decodeTokenUnsafe(token)
  return payload?.jti as string || null
}

/**
 * Validate Token Format
 * Checks if string looks like a JWT
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
  return parts.every(part => part.length > 0 && base64urlPattern.test(part))
}

/**
 * Extract User Info from Token
 * Gets all user-related fields from token
 *
 * @param token - JWT token string
 * @returns User info object or null
 */
export function getUserInfoFromToken(token: string): {
  userId: string
  phoneNumber: string | null
  email: string | null
  role: string | null
} | null {
  const payload = decodeTokenUnsafe(token)
  if (!payload || !payload.userId) return null

  return {
    userId: payload.userId as string,
    phoneNumber: (payload.phoneNumber as string) || null,
    email: (payload.email as string) || null,
    role: (payload.role as string) || null,
  }
}

// ==================== ERROR MAPPING ====================

/**
 * Map JWT Library Errors to JWTError
 * Converts jose library errors to our error types
 *
 * @param error - Error from jose library
 * @returns JWTError type
 */
function mapJWTError(error: any): JWTError {
  const errorCode = error?.code || ''
  const errorMessage = error?.message || ''

  // Token expired
  if (
    errorCode.includes('ERR_JWT_EXPIRED') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('exp claim')
  ) {
    return 'TOKEN_EXPIRED'
  }

  // Invalid signature
  if (
    errorCode.includes('ERR_JWS_SIGNATURE') ||
    errorMessage.includes('signature')
  ) {
    return 'INVALID_SIGNATURE'
  }

  // Token not yet valid
  if (
    errorCode.includes('ERR_JWT_CLAIM_VALIDATION_FAILED') &&
    errorMessage.includes('nbf')
  ) {
    return 'TOKEN_NOT_YET_VALID'
  }

  // Invalid issuer
  if (errorMessage.includes('issuer') || errorMessage.includes('iss')) {
    return 'INVALID_ISSUER'
  }

  // Invalid audience
  if (errorMessage.includes('audience') || errorMessage.includes('aud')) {
    return 'INVALID_AUDIENCE'
  }

  // Malformed token
  if (
    errorCode.includes('ERR_JWT_MALFORMED') ||
    errorMessage.includes('compact') ||
    errorMessage.includes('Invalid')
  ) {
    return 'MALFORMED_TOKEN'
  }

  // Generic invalid token
  return 'INVALID_TOKEN'
}

/**
 * Get human-readable error message
 * Converts JWTError to Persian error message
 *
 * @param error - JWTError type
 * @returns Persian error message
 */
export function getJWTErrorMessage(error: JWTError): string {
  const messages: Record<JWTError, string> = {
    TOKEN_EXPIRED: 'توکن منقضی شده است',
    INVALID_SIGNATURE: 'امضای توکن نامعتبر است',
    INVALID_TOKEN: 'توکن نامعتبر است',
    MISSING_TOKEN: 'توکن یافت نشد',
    INVALID_TYPE: 'نوع توکن نامعتبر است',
    MALFORMED_TOKEN: 'فرمت توکن نامعتبر است',
    TOKEN_NOT_YET_VALID: 'توکن هنوز معتبر نیست',
    INVALID_ISSUER: 'صادرکننده توکن نامعتبر است',
    INVALID_AUDIENCE: 'مخاطب توکن نامعتبر است',
  }

  return messages[error] || 'خطای نامشخص در توکن'
}

/**
 * Convert atob for environments that don't have it (Node.js < 18)
 */
function atob(str: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(str)
  }
  
  // Fallback for Node.js
  return Buffer.from(str, 'base64').toString('utf-8')
}