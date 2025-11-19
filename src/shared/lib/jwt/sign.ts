// src/shared/lib/jwt/sign.ts

import { SignJWT } from 'jose'
import { randomUUID } from 'crypto'
import type {
  TokenPair,
  TokenUserData,
  AccessTokenPayload,
  RefreshTokenPayload,
  JWTConfig,
  JWTAlgorithm,
  TokenGenerationResult,
} from './types'

// ==================== CONFIGURATION ====================

/**
 * Default JWT Configuration
 */
const DEFAULT_CONFIG: Required<Omit<JWTConfig, 'accessSecret' | 'refreshSecret'>> = {
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
  algorithm: 'HS256',
  issuer: undefined,
  audience: undefined,
}

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
 * Get JWT configuration from environment or defaults
 */
function getConfig(): JWTConfig {
  return {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRY || DEFAULT_CONFIG.accessExpiresIn,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || DEFAULT_CONFIG.refreshExpiresIn,
    algorithm: (process.env.JWT_ALGORITHM as JWTAlgorithm) || DEFAULT_CONFIG.algorithm,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert time string to seconds
 * Supports: '15m', '7d', '1h', '30s'
 * @param expiry - Time string (e.g., '15m', '7d')
 * @returns Time in seconds
 * @throws Error if format is invalid
 */
export function parseExpiryToSeconds(expiry: string | number): number {
  // If already a number, return it
  if (typeof expiry === 'number') {
    return expiry
  }

  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}. Expected format: number + unit (s/m/h/d)`)
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }

  return value * multipliers[unit]
}

/**
 * Validate user data before token generation
 * @param userData - User data to validate
 * @throws Error if user data is invalid
 */
function validateUserData(userData: TokenUserData): void {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data must be an object')
  }

  if (!userData.userId || typeof userData.userId !== 'string') {
    throw new Error('User ID is required and must be a string')
  }

  if (!userData.role || (userData.role !== 'customer' && userData.role !== 'admin')) {
    throw new Error('Valid user role is required (customer or admin)')
  }

  // At least one of phoneNumber or email must be present
  if (!userData.phoneNumber && !userData.email) {
    throw new Error('Either phoneNumber or email must be provided')
  }
}

/**
 * Clear cached secrets (useful for testing)
 */
export function clearSecretCache(): void {
  cachedAccessSecret = null
  cachedRefreshSecret = null
}

// ==================== TOKEN SIGNING FUNCTIONS ====================

/**
 * Sign Access Token
 * Short-lived token for API authentication
 * 
 * @param userData - User data to include in token
 * @param options - Optional custom configuration
 * @returns Signed JWT access token string
 * @throws Error if secrets are missing or user data is invalid
 */
export async function signAccessToken(
  userData: TokenUserData,
  options?: Partial<JWTConfig>
): Promise<string> {
  // Validate user data
  validateUserData(userData)

  const config = { ...getConfig(), ...options }
  const now = Math.floor(Date.now() / 1000)
  const expirySeconds = parseExpiryToSeconds(config.accessExpiresIn)

  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    userId: userData.userId,
    phoneNumber: userData.phoneNumber ?? null,
    email: userData.email ?? null,
    role: userData.role,
    type: 'access',
  }

  let jwt = new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: config.algorithm || 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expirySeconds)

  // Add optional claims
  if (config.issuer) {
    jwt = jwt.setIssuer(config.issuer)
  }
  if (config.audience) {
    jwt = jwt.setAudience(config.audience)
  }

  const token = await jwt.sign(getAccessSecret())
  return token
}

/**
 * Sign Refresh Token
 * Long-lived token for generating new access tokens
 * Includes a unique JTI (JWT ID) for revocation tracking
 * 
 * @param userData - User data to include in token
 * @param options - Optional custom configuration
 * @returns Object containing signed JWT refresh token string and JTI
 * @throws Error if secrets are missing or user data is invalid
 */
export async function signRefreshToken(
  userData: TokenUserData,
  options?: Partial<JWTConfig>
): Promise<{ token: string; jti: string }> {
  // Validate user data
  validateUserData(userData)

  const config = { ...getConfig(), ...options }
  const now = Math.floor(Date.now() / 1000)
  const expirySeconds = parseExpiryToSeconds(config.refreshExpiresIn)
  const jti = randomUUID() // Unique token identifier for revocation

  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId: userData.userId,
    phoneNumber: userData.phoneNumber ?? null,
    email: userData.email ?? null,
    role: userData.role,
    type: 'refresh',
    jti,
  }

  let jwt = new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: config.algorithm || 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expirySeconds)
    .setJti(jti)

  // Add optional claims
  if (config.issuer) {
    jwt = jwt.setIssuer(config.issuer)
  }
  if (config.audience) {
    jwt = jwt.setAudience(config.audience)
  }

  const token = await jwt.sign(getRefreshSecret())
  return { token, jti }
}

/**
 * Generate Token Pair
 * Both access and refresh tokens returned together
 * 
 * @param userData - User data to include in tokens
 * @param options - Optional custom configuration
 * @returns Token pair containing access and refresh tokens with expiry times
 * @throws Error if secrets are missing or user data is invalid
 */
export async function generateTokenPair(
  userData: TokenUserData,
  options?: Partial<JWTConfig>
): Promise<TokenPair> {
  const config = { ...getConfig(), ...options }

  // Generate both tokens in parallel for better performance
  const [accessToken, refreshResult] = await Promise.all([
    signAccessToken(userData, options),
    signRefreshToken(userData, options),
  ])

  const now = Date.now()
  const accessExpiryMs = parseExpiryToSeconds(config.accessExpiresIn) * 1000
  const refreshExpiryMs = parseExpiryToSeconds(config.refreshExpiresIn) * 1000

  return {
    accessToken,
    refreshToken: refreshResult.token,
    accessTokenExpiry: now + accessExpiryMs,
    refreshTokenExpiry: now + refreshExpiryMs,
    tokenType: 'Bearer',
  }
}

/**
 * Generate Token Pair with JTI
 * Extended version that also returns the refresh token JTI
 * Useful when you need to store the JTI in database
 * 
 * @param userData - User data to include in tokens
 * @param options - Optional custom configuration
 * @returns Token generation result with JTI
 * @throws Error if secrets are missing or user data is invalid
 */
export async function generateTokenPairWithJTI(
  userData: TokenUserData,
  options?: Partial<JWTConfig>
): Promise<TokenGenerationResult> {
  const config = { ...getConfig(), ...options }

  // Generate both tokens in parallel
  const [accessToken, refreshResult] = await Promise.all([
    signAccessToken(userData, options),
    signRefreshToken(userData, options),
  ])

  const now = Date.now()
  const accessExpiryMs = parseExpiryToSeconds(config.accessExpiresIn) * 1000
  const refreshExpiryMs = parseExpiryToSeconds(config.refreshExpiresIn) * 1000

  return {
    accessToken,
    refreshToken: refreshResult.token,
    accessTokenExpiry: now + accessExpiryMs,
    refreshTokenExpiry: now + refreshExpiryMs,
    tokenType: 'Bearer',
    user: userData,
    refreshTokenJti: refreshResult.jti,
  }
}

/**
 * Calculate token expiry timestamp in seconds
 * Useful for setting cookie maxAge
 * 
 * @param tokenType - 'access' or 'refresh'
 * @param options - Optional custom configuration
 * @returns Expiry time in seconds
 */
export function getTokenExpirySeconds(
  tokenType: 'access' | 'refresh',
  options?: Partial<JWTConfig>
): number {
  const config = { ...getConfig(), ...options }
  const expiry = tokenType === 'access' ? config.accessExpiresIn : config.refreshExpiresIn
  return parseExpiryToSeconds(expiry)
}

/**
 * Calculate token expiry timestamp in milliseconds
 * Useful for JavaScript Date objects
 * 
 * @param tokenType - 'access' or 'refresh'
 * @param options - Optional custom configuration
 * @returns Expiry time in milliseconds
 */
export function getTokenExpiryMilliseconds(
  tokenType: 'access' | 'refresh',
  options?: Partial<JWTConfig>
): number {
  return getTokenExpirySeconds(tokenType, options) * 1000
}

/**
 * Get token expiry Date object
 * Returns a Date object representing when the token expires
 * 
 * @param tokenType - 'access' or 'refresh'
 * @param options - Optional custom configuration
 * @returns Date object for token expiry
 */
export function getTokenExpiryDate(
  tokenType: 'access' | 'refresh',
  options?: Partial<JWTConfig>
): Date {
  const now = Date.now()
  const expiryMs = getTokenExpiryMilliseconds(tokenType, options)
  return new Date(now + expiryMs)
}