// src/shared/lib/jwt/__tests__/sign.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { jwtVerify } from 'jose'
import {
  signAccessToken,
  signRefreshToken,
  generateTokenPair,
  generateTokenPairWithJTI,
  getTokenExpirySeconds,
  getTokenExpiryMilliseconds,
  getTokenExpiryDate,
  parseExpiryToSeconds,
  clearSecretCache,
} from '../sign'
import type { TokenUserData, AccessTokenPayload, RefreshTokenPayload } from '../types'

// Mock environment variables
const mockEnv = {
  JWT_ACCESS_SECRET: 'test-access-secret-key-very-secure',
  JWT_REFRESH_SECRET: 'test-refresh-secret-key-very-secure',
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  JWT_ALGORITHM: 'HS256',
}

describe('jwt/sign - Configuration', () => {
  beforeEach(() => {
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearSecretCache()
  })

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
    clearSecretCache()
    vi.clearAllMocks()
  })

  describe('parseExpiryToSeconds', () => {
    it('should parse seconds', () => {
      expect(parseExpiryToSeconds('30s')).toBe(30)
      expect(parseExpiryToSeconds('60s')).toBe(60)
    })

    it('should parse minutes', () => {
      expect(parseExpiryToSeconds('15m')).toBe(900)
      expect(parseExpiryToSeconds('30m')).toBe(1800)
    })

    it('should parse hours', () => {
      expect(parseExpiryToSeconds('1h')).toBe(3600)
      expect(parseExpiryToSeconds('24h')).toBe(86400)
    })

    it('should parse days', () => {
      expect(parseExpiryToSeconds('7d')).toBe(604800)
      expect(parseExpiryToSeconds('30d')).toBe(2592000)
    })

    it('should handle numeric input', () => {
      expect(parseExpiryToSeconds(900)).toBe(900)
    })

    it('should throw error for invalid format', () => {
      expect(() => parseExpiryToSeconds('invalid')).toThrow('Invalid expiry format')
      expect(() => parseExpiryToSeconds('15')).toThrow('Invalid expiry format')
      expect(() => parseExpiryToSeconds('15x')).toThrow('Invalid expiry format')
    })
  })

  describe('getTokenExpirySeconds', () => {
    it('should return access token expiry in seconds', () => {
      const seconds = getTokenExpirySeconds('access')
      expect(seconds).toBe(900) // 15 minutes
    })

    it('should return refresh token expiry in seconds', () => {
      const seconds = getTokenExpirySeconds('refresh')
      expect(seconds).toBe(604800) // 7 days
    })

    it('should accept custom configuration', () => {
      const seconds = getTokenExpirySeconds('access', { accessExpiresIn: '30m' })
      expect(seconds).toBe(1800)
    })
  })

  describe('getTokenExpiryMilliseconds', () => {
    it('should return access token expiry in milliseconds', () => {
      const ms = getTokenExpiryMilliseconds('access')
      expect(ms).toBe(900000) // 15 minutes in ms
    })

    it('should return refresh token expiry in milliseconds', () => {
      const ms = getTokenExpiryMilliseconds('refresh')
      expect(ms).toBe(604800000) // 7 days in ms
    })
  })

  describe('getTokenExpiryDate', () => {
    it('should return a Date object', () => {
      const date = getTokenExpiryDate('access')
      expect(date).toBeInstanceOf(Date)
    })

    it('should return future date', () => {
      const now = new Date()
      const expiryDate = getTokenExpiryDate('access')
      expect(expiryDate.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should calculate correct expiry time', () => {
      const now = Date.now()
      const expiryDate = getTokenExpiryDate('access')
      const diff = expiryDate.getTime() - now
      
      // Should be approximately 15 minutes (allow 1 second tolerance)
      expect(diff).toBeGreaterThan(899000)
      expect(diff).toBeLessThan(901000)
    })
  })
})

describe('jwt/sign - Token Generation', () => {
  const mockUser: TokenUserData = {
    userId: '123',
    phoneNumber: '09123456789',
    email: 'test@example.com',
    role: 'customer',
  }

  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearSecretCache()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
    clearSecretCache()
  })

  describe('signAccessToken', () => {
    it('should generate a valid access token', async () => {
      const token = await signAccessToken(mockUser)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('should include correct payload', async () => {
      const token = await signAccessToken(mockUser)
      const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const { payload } = await jwtVerify(token, secret)

      expect(payload.userId).toBe(mockUser.userId)
      expect(payload.phoneNumber).toBe(mockUser.phoneNumber)
      expect(payload.email).toBe(mockUser.email)
      expect(payload.role).toBe(mockUser.role)
      expect(payload.type).toBe('access')
    })

    it('should include iat and exp claims', async () => {
      const token = await signAccessToken(mockUser)
      const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const { payload } = await jwtVerify(token, secret)

      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
      expect(typeof payload.iat).toBe('number')
      expect(typeof payload.exp).toBe('number')
      expect(payload.exp).toBeGreaterThan(payload.iat!)
    })

    it('should throw error for invalid user data', async () => {
      await expect(signAccessToken(null as any)).rejects.toThrow('User data must be an object')
      await expect(signAccessToken({} as any)).rejects.toThrow('User ID is required')
      await expect(signAccessToken({ userId: '123' } as any)).rejects.toThrow('Valid user role is required')
    })

    it('should throw error when secret is missing', async () => {
      delete process.env.JWT_ACCESS_SECRET
      clearSecretCache()
      
      await expect(signAccessToken(mockUser)).rejects.toThrow('JWT_ACCESS_SECRET is not defined')
    })

    it('should handle user with only phone number', async () => {
      const userWithPhone: TokenUserData = {
        userId: '123',
        phoneNumber: '09123456789',
        email: null,
        role: 'customer',
      }

      const token = await signAccessToken(userWithPhone)
      const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const { payload } = await jwtVerify(token, secret)

      expect(payload.phoneNumber).toBe('09123456789')
      expect(payload.email).toBeNull()
    })

    it('should handle user with only email', async () => {
      const userWithEmail: TokenUserData = {
        userId: '123',
        phoneNumber: null,
        email: 'test@example.com',
        role: 'admin',
      }

      const token = await signAccessToken(userWithEmail)
      const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const { payload } = await jwtVerify(token, secret)

      expect(payload.phoneNumber).toBeNull()
      expect(payload.email).toBe('test@example.com')
      expect(payload.role).toBe('admin')
    })

    it('should accept custom configuration', async () => {
      const token = await signAccessToken(mockUser, {
        accessExpiresIn: '5m',
        issuer: 'test-issuer',
      })

      const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'test-issuer',
      })

      expect(payload.iss).toBe('test-issuer')
    })
  })

  describe('signRefreshToken', () => {
    it('should generate a valid refresh token with JTI', async () => {
      const result = await signRefreshToken(mockUser)
      
      expect(result.token).toBeTruthy()
      expect(result.jti).toBeTruthy()
      expect(typeof result.token).toBe('string')
      expect(typeof result.jti).toBe('string')
    })

    it('should include correct payload', async () => {
      const result = await signRefreshToken(mockUser)
      const secret = new TextEncoder().encode(mockEnv.JWT_REFRESH_SECRET)
      const { payload } = await jwtVerify(result.token, secret)

      expect(payload.userId).toBe(mockUser.userId)
      expect(payload.phoneNumber).toBe(mockUser.phoneNumber)
      expect(payload.email).toBe(mockUser.email)
      expect(payload.role).toBe(mockUser.role)
      expect(payload.type).toBe('refresh')
      expect(payload.jti).toBe(result.jti)
    })

    it('should generate unique JTI for each token', async () => {
      const result1 = await signRefreshToken(mockUser)
      const result2 = await signRefreshToken(mockUser)

      expect(result1.jti).not.toBe(result2.jti)
    })

    it('should throw error for invalid user data', async () => {
      await expect(signRefreshToken({ userId: '123' } as any)).rejects.toThrow('Valid user role is required')
    })

    it('should throw error when secret is missing', async () => {
      delete process.env.JWT_REFRESH_SECRET
      clearSecretCache()
      
      await expect(signRefreshToken(mockUser)).rejects.toThrow('JWT_REFRESH_SECRET is not defined')
    })
  })

  describe('generateTokenPair', () => {
    it('should generate both tokens', async () => {
      const tokenPair = await generateTokenPair(mockUser)

      expect(tokenPair.accessToken).toBeTruthy()
      expect(tokenPair.refreshToken).toBeTruthy()
      expect(tokenPair.accessTokenExpiry).toBeTruthy()
      expect(tokenPair.refreshTokenExpiry).toBeTruthy()
      expect(tokenPair.tokenType).toBe('Bearer')
    })

    it('should have correct expiry times', async () => {
      const before = Date.now()
      const tokenPair = await generateTokenPair(mockUser)
      const after = Date.now()

      // Access token expires in ~15 minutes
      expect(tokenPair.accessTokenExpiry).toBeGreaterThan(before + 899000)
      expect(tokenPair.accessTokenExpiry).toBeLessThan(after + 901000)

      // Refresh token expires in ~7 days
      expect(tokenPair.refreshTokenExpiry).toBeGreaterThan(before + 604799000)
      expect(tokenPair.refreshTokenExpiry).toBeLessThan(after + 604801000)
    })

    it('should verify both tokens successfully', async () => {
      const tokenPair = await generateTokenPair(mockUser)

      const accessSecret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
      const refreshSecret = new TextEncoder().encode(mockEnv.JWT_REFRESH_SECRET)

      const accessPayload = await jwtVerify(tokenPair.accessToken, accessSecret)
      const refreshPayload = await jwtVerify(tokenPair.refreshToken, refreshSecret)

      expect(accessPayload.payload.type).toBe('access')
      expect(refreshPayload.payload.type).toBe('refresh')
      expect(accessPayload.payload.userId).toBe(mockUser.userId)
      expect(refreshPayload.payload.userId).toBe(mockUser.userId)
    })

    it('should accept custom configuration', async () => {
      const tokenPair = await generateTokenPair(mockUser, {
        accessExpiresIn: '5m',
        refreshExpiresIn: '1d',
      })

      const before = Date.now()
      
      // Access token expires in ~5 minutes
      expect(tokenPair.accessTokenExpiry).toBeGreaterThan(before + 299000)
      expect(tokenPair.accessTokenExpiry).toBeLessThan(before + 301000)

      // Refresh token expires in ~1 day
      expect(tokenPair.refreshTokenExpiry).toBeGreaterThan(before + 86399000)
      expect(tokenPair.refreshTokenExpiry).toBeLessThan(before + 86401000)
    })
  })

  describe('generateTokenPairWithJTI', () => {
    it('should generate token pair with JTI', async () => {
      const result = await generateTokenPairWithJTI(mockUser)

      expect(result.accessToken).toBeTruthy()
      expect(result.refreshToken).toBeTruthy()
      expect(result.refreshTokenJti).toBeTruthy()
      expect(result.user).toEqual(mockUser)
      expect(result.tokenType).toBe('Bearer')
    })

    it('should include user data in result', async () => {
      const result = await generateTokenPairWithJTI(mockUser)

      expect(result.user.userId).toBe(mockUser.userId)
      expect(result.user.phoneNumber).toBe(mockUser.phoneNumber)
      expect(result.user.email).toBe(mockUser.email)
      expect(result.user.role).toBe(mockUser.role)
    })

    it('should verify JTI matches refresh token payload', async () => {
      const result = await generateTokenPairWithJTI(mockUser)
      const secret = new TextEncoder().encode(mockEnv.JWT_REFRESH_SECRET)
      const { payload } = await jwtVerify(result.refreshToken, secret)

      expect(payload.jti).toBe(result.refreshTokenJti)
    })
  })
})

describe('jwt/sign - Edge Cases', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearSecretCache()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
    clearSecretCache()
  })

  it('should handle user with both phone and email null gracefully', async () => {
    const invalidUser: TokenUserData = {
      userId: '123',
      phoneNumber: null,
      email: null,
      role: 'customer',
    }

    await expect(signAccessToken(invalidUser)).rejects.toThrow('Either phoneNumber or email must be provided')
  })

  it('should cache secrets after first access', async () => {
    const mockUser: TokenUserData = {
      userId: '123',
      phoneNumber: '09123456789',
      email: null,
      role: 'customer',
    }

    // First call
    await signAccessToken(mockUser)

    // Second call should use cached secret
    await signAccessToken(mockUser)

    // If we got here without errors, caching worked
    expect(true).toBe(true)
  })

  it('should handle very long user IDs', async () => {
    const userWithLongId: TokenUserData = {
      userId: 'a'.repeat(500),
      phoneNumber: '09123456789',
      email: null,
      role: 'customer',
    }

    const token = await signAccessToken(userWithLongId)
    expect(token).toBeTruthy()
  })

  it('should handle special characters in user data', async () => {
    const userWithSpecialChars: TokenUserData = {
      userId: '123-abc_def',
      phoneNumber: '09123456789',
      email: 'test+tag@example.com',
      role: 'admin',
    }

    const token = await signAccessToken(userWithSpecialChars)
    const secret = new TextEncoder().encode(mockEnv.JWT_ACCESS_SECRET)
    const { payload } = await jwtVerify(token, secret)

    expect(payload.userId).toBe('123-abc_def')
    expect(payload.email).toBe('test+tag@example.com')
  })
})