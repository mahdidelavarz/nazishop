// src/shared/lib/jwt/types.ts

import type { UserRole, AuthUser } from '@/features/auth/types/authType'

/**
 * JWT Algorithm Types
 * Supported signing algorithms
 */
export type JWTAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512'

/**
 * JWT Token Type
 */
export type TokenType = 'access' | 'refresh'

/**
 * Base JWT Payload Structure
 * Contains user identification and session metadata
 */
export interface BaseJWTPayload {
  /** User's unique identifier from database */
  userId: string
  
  /** User's phone number (for OTP auth) */
  phoneNumber: string | null
  
  /** User's email (for OAuth) */
  email: string | null
  
  /** User's role */
  role: UserRole
  
  /** Issued at timestamp (seconds since epoch) */
  iat: number
  
  /** Expiration timestamp (seconds since epoch) */
  exp: number

  type?: TokenType
}

/**
 * Access Token Payload
 * Short-lived token for API authentication
 */
export interface AccessTokenPayload extends BaseJWTPayload {
  /** Token type identifier */
  type: 'access'
}

/**
 * Refresh Token Payload
 * Long-lived token for generating new access tokens
 */
export interface RefreshTokenPayload extends BaseJWTPayload {
  /** Token type identifier */
  type: 'refresh'
  
  /** Unique token identifier for revocation tracking */
  jti: string
}

/**
 * Combined JWT Payload Type
 * Union type for both access and refresh tokens
 */
export type JWTPayload = AccessTokenPayload | RefreshTokenPayload

/**
 * Token Pair
 * Both access and refresh tokens returned together
 */
export interface TokenPair {
  /** Encoded access token */
  accessToken: string
  
  /** Encoded refresh token */
  refreshToken: string
  
  /** Access token expiration timestamp (milliseconds) */
  accessTokenExpiry: number
  
  /** Refresh token expiration timestamp (milliseconds) */
  refreshTokenExpiry: number
  
  /** Token type (always 'Bearer') */
  tokenType?: 'Bearer'
}

/**
 * User Data for Token Generation
 * Minimal user info needed to create JWT tokens
 * This is an alias for AuthUser from auth.types.ts
 */
export type TokenUserData = AuthUser

/**
 * JWT Verification Result
 * Result of token verification with payload or error
 */
export type JWTVerifyResult<T extends BaseJWTPayload = JWTPayload> =
  | { valid: true; payload: T; error?: never }
  | { valid: false; payload?: never; error: JWTError }

/**
 * JWT Error Types
 */
export type JWTError =
  | 'TOKEN_EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'INVALID_TOKEN'
  | 'MISSING_TOKEN'
  | 'INVALID_TYPE'
  | 'MALFORMED_TOKEN'
  | 'TOKEN_NOT_YET_VALID'
  | 'INVALID_ISSUER'
  | 'INVALID_AUDIENCE'

/**
 * JWT Error Details
 * Extended error information
 */
export interface JWTErrorDetails {
  error: JWTError
  message: string
  expiredAt?: number
  code?: string
}

/**
 * JWT Configuration
 * Environment-based configuration for token generation
 */
export interface JWTConfig {
  /** Secret key for signing access tokens */
  accessSecret: string
  
  /** Secret key for signing refresh tokens */
  refreshSecret: string
  
  /** Access token expiration duration (e.g., '15m', '1h') */
  accessExpiresIn: string
  
  /** Refresh token expiration duration (e.g., '7d', '30d') */
  refreshExpiresIn: string
  
  /** JWT signing algorithm (default: 'HS256') */
  algorithm?: JWTAlgorithm
  
  /** Token issuer (optional, e.g., 'your-app.com') */
  issuer?: string
  
  /** Token audience (optional, e.g., 'your-app-users') */
  audience?: string
}

/**
 * JWT Sign Options
 * Options for signing a token
 */
export interface JWTSignOptions {
  /** Token expiration time */
  expiresIn: string | number
  
  /** Signing algorithm */
  algorithm?: JWTAlgorithm
  
  /** Token issuer */
  issuer?: string
  
  /** Token audience */
  audience?: string
  
  /** Not before timestamp */
  notBefore?: string | number
  
  /** JWT ID (for refresh tokens) */
  jwtid?: string
}

/**
 * JWT Verify Options
 * Options for verifying a token
 */
export interface JWTVerifyOptions {
  /** Signing algorithm to verify */
  algorithms?: JWTAlgorithm[]
  
  /** Expected issuer */
  issuer?: string
  
  /** Expected audience */
  audience?: string
  
  /** Clock tolerance in seconds */
  clockTolerance?: number
  
  /** Whether to ignore expiration */
  ignoreExpiration?: boolean
  
  /** Whether to ignore not before */
  ignoreNotBefore?: boolean
}

/**
 * Decoded JWT (before verification)
 * Raw decoded token structure
 */
export interface DecodedJWT<T = unknown> {
  header: {
    alg: string
    typ: string
    [key: string]: unknown
  }
  payload: T
  signature: string
}

/**
 * Refresh Token Database Record
 * Structure for storing refresh tokens in database
 */
export interface RefreshTokenRecord {
  /** Unique identifier */
  id: string
  
  /** User ID this token belongs to */
  userId: string
  
  /** Hashed token value */
  tokenHash: string
  
  /** JWT ID (jti claim) */
  jti: string
  
  /** Expiration timestamp */
  expiresAt: string
  
  /** Creation timestamp */
  createdAt: string
  
  /** Whether token has been revoked */
  revoked: boolean
  
  /** IP address of token creation */
  ipAddress?: string
  
  /** User agent of token creation */
  userAgent?: string
}

/**
 * Token Revocation Info
 * Information about a revoked token
 */
export interface TokenRevocationInfo {
  jti: string
  userId: string
  revokedAt: string
  reason?: 'manual' | 'logout' | 'security' | 'expired'
}

/**
 * Token Validation Context
 * Additional context for token validation
 */
export interface TokenValidationContext {
  /** IP address of the request */
  ipAddress?: string
  
  /** User agent of the request */
  userAgent?: string
  
  /** Whether to check token blacklist */
  checkBlacklist?: boolean
  
  /** Expected user ID (for additional validation) */
  expectedUserId?: string
}

/**
 * Token Generation Result
 * Result of token generation with metadata
 */
export interface TokenGenerationResult extends TokenPair {
  /** User data included in tokens */
  user: TokenUserData
  
  /** Refresh token JTI (for database storage) */
  refreshTokenJti: string
}

/**
 * Type guard for Access Token Payload
 */
export function isAccessTokenPayload(
  payload: BaseJWTPayload
): payload is AccessTokenPayload {
  return 'type' in payload && payload.type === 'access'
}

/**
 * Type guard for Refresh Token Payload
 */
export function isRefreshTokenPayload(
  payload: BaseJWTPayload
): payload is RefreshTokenPayload {
  return 'type' in payload && payload.type === 'refresh'
}

/**
 * Type guard for JWT Verification Success
 */
export function isJWTVerifySuccess<T extends BaseJWTPayload>(
  result: JWTVerifyResult<T>
): result is { valid: true; payload: T } {
  return result.valid === true
}

/**
 * Type guard for JWT Verification Failure
 */
export function isJWTVerifyFailure(
  result: JWTVerifyResult
): result is { valid: false; error: JWTError } {
  return result.valid === false
}