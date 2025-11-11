// src/shared/lib/jwt/sign.ts

import { SignJWT } from 'jose';
import { randomUUID } from 'crypto';
import {
  TokenPair,
  TokenUserData,
  AccessTokenPayload,
  RefreshTokenPayload,
} from './types';

// Get secrets from environment variables
const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

// Token expiry times (configurable via env or defaults)
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Convert time string to seconds
 * Supports: '15m', '7d', '1h', '30s'
 */
function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * multipliers[unit];
}

/**
 * Sign Access Token
 * Short-lived token for API authentication
 * 
 * ?param userData - User data to include in token
 * ?returns Signed JWT access token string
 */
export async function signAccessToken(userData: TokenUserData): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = parseExpiryToSeconds(ACCESS_TOKEN_EXPIRY);

  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    userId: userData.userId,
    phoneNumber: userData.phoneNumber,
    email: userData.email,
    role: userData.role,
    type: 'access',
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expirySeconds)
    .sign(getAccessSecret());

  return token;
}

/**
 * Sign Refresh Token
 * Long-lived token for generating new access tokens
 * Includes a unique JTI (JWT ID) for revocation tracking
 * 
 * ?param userData - User data to include in token
 * ?returns Signed JWT refresh token string and JTI
 */
export async function signRefreshToken(
  userData: TokenUserData
): Promise<{ token: string; jti: string }> {
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
  const jti = randomUUID(); // Unique token identifier for revocation

  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId: userData.userId,
    phoneNumber: userData.phoneNumber,
    email: userData.email,
    role: userData.role,
    type: 'refresh',
    jti,
  };

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expirySeconds)
    .setJti(jti)
    .sign(getRefreshSecret());

  return { token, jti };
}

/**
 * Generate Token Pair
 * Both access and refresh tokens returned together
 * 
 * ?param userData - User data to include in tokens
 * ?returns Token pair containing access and refresh tokens
 */
export async function generateTokenPair(userData: TokenUserData): Promise<TokenPair> {
  const accessToken = await signAccessToken(userData);
  const { token: refreshToken } = await signRefreshToken(userData);

  const now = Date.now();
  const accessExpiryMs = parseExpiryToSeconds(ACCESS_TOKEN_EXPIRY) * 1000;
  const refreshExpiryMs = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY) * 1000;

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: now + accessExpiryMs,
    refreshTokenExpiry: now + refreshExpiryMs,
  };
}

/**
 * Calculate token expiry timestamp
 * Useful for setting cookie maxAge
 * 
 * ?param tokenType - 'access' or 'refresh'
 * ?returns Expiry time in seconds
 */
export function getTokenExpirySeconds(tokenType: 'access' | 'refresh'): number {
  const expiry = tokenType === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY;
  return parseExpiryToSeconds(expiry);
}