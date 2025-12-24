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

// Access token should be 7 days (1 week), refresh token should be 120 days (4 months)
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '7d'; // Default: 1 week
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '120d'; // Default: 4 months

// Warn if access token expiry is too short (less than 1 day)
if (process.env.JWT_ACCESS_EXPIRES_IN) {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
  // Check if it's less than 1 day (simple check: if it contains 'm' or 'h' and number is small)
  if ((expiresIn.includes('m') && parseInt(expiresIn) < 1440) || 
      (expiresIn.includes('h') && parseInt(expiresIn) < 24)) {
    console.warn(`⚠️ [JWT Config] Access token expiry is very short: ${expiresIn}. Recommended: 7d`);
  }
}

// Log expiry settings on module load (for debugging)
console.log('[JWT Config] Access token expires:', ACCESS_EXPIRES);
console.log('[JWT Config] Refresh token expires:', REFRESH_EXPIRES);


/**
 * Generate Access Token (short-lived, stored in httpOnly cookie)
 */
export function generateAccessToken(payload: JWTPayload): string {
  const token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
  
  // Debug: Log token expiry info
  const decoded = jwt.decode(token) as JWTPayload & { exp?: number };
  if (decoded?.exp) {
    const expiryDate = new Date(decoded.exp * 1000);
    console.log('[JWT Debug] Generated access token:', {
      expiresAt: expiryDate.toISOString(),
      expiresIn: ACCESS_EXPIRES,
      userId: payload.userId,
    });
  }
  
  return token;
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
    // Decode first to check expiry details
    const decoded = jwt.decode(token) as JWTPayload & { exp?: number; iat?: number };
    
    if (decoded && decoded.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();
      const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
      
      console.log('[JWT Debug] Token expiry:', {
        expiresAt: expiryDate.toISOString(),
        now: now.toISOString(),
        hoursUntilExpiry: hoursUntilExpiry.toFixed(2),
        isExpired: timeUntilExpiry < 0,
      });
    }
    
    return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      const decoded = jwt.decode(token) as JWTPayload & { exp?: number };
      if (decoded?.exp) {
        const expiryDate = new Date(decoded.exp * 1000);
        const now = new Date();
        console.error('[JWT Error] Token expired:', {
          expiredAt: expiryDate.toISOString(),
          currentTime: now.toISOString(),
          expiredBy: ((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60)).toFixed(2) + ' hours',
          configuredExpiry: ACCESS_EXPIRES,
        });
      }
    } else {
      console.error('Access token verification failed:', error);
    }
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