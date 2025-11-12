// src/shared/lib/jwt/types.ts

/**
 * JWT Token Payload Structure
 * Contains user identification and session metadata
 */
export interface JWTPayload {
  /** User's unique identifier from database */
  userId: string;
  
  /** User's phone number (for OTP auth) */
  phoneNumber: string | null;
  
  /** User's email (for OAuth) */
  email: string | null;
  
  /** User's role (customer, admin, etc.) */
  role: 'customer' | 'admin';
  
  /** Issued at timestamp (seconds since epoch) */
  iat: number;
  
  /** Expiration timestamp (seconds since epoch) */
  exp: number;
  
  /** Token type identifier */
  type: 'access' | 'refresh';
}

/**
 * Access Token Payload
 * Short-lived token for API authentication (15 minutes)
 */
export interface AccessTokenPayload extends JWTPayload {
  type: 'access';
}

/**
 * Refresh Token Payload
 * Long-lived token for generating new access tokens (7 days)
 */
export interface RefreshTokenPayload extends JWTPayload {
  type: 'refresh';
  
  /** Unique token identifier for revocation */
  jti: string;
}

/**
 * Token Pair
 * Both access and refresh tokens returned together
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number; // timestamp in milliseconds
  refreshTokenExpiry: number; // timestamp in milliseconds
}

/**
 * User Data for Token Generation
 * Minimal user info needed to create JWT tokens
 */
export interface TokenUserData {
  userId: string;
  phoneNumber: string | null;
  email: string | null;
  role: 'customer' | 'admin';
}

/**
 * JWT Verification Result
 * Result of token verification with payload or error
 */
export type JWTVerifyResult<T extends JWTPayload> =
  | { valid: true; payload: T }
  | { valid: false; error: JWTError };

/**
 * JWT Error Types
 */
export type JWTError =
  | 'TOKEN_EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'INVALID_TOKEN'
  | 'MISSING_TOKEN'
  | 'INVALID_TYPE';

/**
 * JWT Configuration
 * Environment-based configuration for token generation
 */
export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string; // e.g., '15m'
  refreshExpiresIn: string; // e.g., '7d'
}