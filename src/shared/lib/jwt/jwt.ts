import jwt from 'jsonwebtoken';
import { JWTPayload } from "@/features/auth/types/auth.type";

// Validate and read secrets
function getSecret(name: string, minLength: number = 32): string {
  const secret = process.env[name];
  
  if (!secret || secret.length < minLength) {
    console.error(`❌ ${name} is missing or too short (min ${minLength} chars)`);
    throw new Error(`${name} must be at least ${minLength} characters`);
  }
  
  return secret;
}

// Read secrets once and cache them
const ACCESS_SECRET = getSecret('JWT_ACCESS_SECRET') as jwt.Secret;
const REFRESH_SECRET = getSecret('JWT_REFRESH_SECRET') as jwt.Secret;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '7d'; // 1 week
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '120d'; // 4 months


/**
 * Generate Access Token (short-lived, stored in httpOnly cookie)
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

/**
 * Generate Refresh Token (long-lived, stored in Zustand)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions);
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
  } catch (error: unknown) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
  } catch (error: unknown) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Decode token without verification (useful for reading expired tokens)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}