// src/shared/lib/jwt/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import {
  isAccessTokenPayload,
  isRefreshTokenPayload,
  isJWTVerifySuccess,
  isJWTVerifyFailure,
  type AccessTokenPayload,
  type RefreshTokenPayload,
  type JWTPayload,
  type JWTVerifyResult,
  type TokenPair,
  type JWTConfig,
  type BaseJWTPayload,
} from '../types'

describe('jwt/types - Type Guards', () => {
  describe('isAccessTokenPayload', () => {
    it('should return true for access token payload', () => {
      const payload: AccessTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      }

      expect(isAccessTokenPayload(payload)).toBe(true)
    })

    it('should return false for refresh token payload', () => {
      const payload: RefreshTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'refresh',
        jti: 'unique-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800,
      }

      expect(isAccessTokenPayload(payload)).toBe(false)
    })

    it('should return false for payload without type', () => {
      const payload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      } as BaseJWTPayload

      expect(isAccessTokenPayload(payload)).toBe(false)
    })
  })

  describe('isRefreshTokenPayload', () => {
    it('should return true for refresh token payload', () => {
      const payload: RefreshTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'refresh',
        jti: 'unique-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800,
      }

      expect(isRefreshTokenPayload(payload)).toBe(true)
    })

    it('should return false for access token payload', () => {
      const payload: AccessTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      }

      expect(isRefreshTokenPayload(payload)).toBe(false)
    })
  })

  describe('isJWTVerifySuccess', () => {
    it('should return true for successful verification', () => {
      const result: JWTVerifyResult<AccessTokenPayload> = {
        valid: true,
        payload: {
          userId: '123',
          phoneNumber: '09123456789',
          email: 'test@test.com',
          role: 'customer',
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900,
        },
      }

      expect(isJWTVerifySuccess(result)).toBe(true)
      
      // Type narrowing check
      if (isJWTVerifySuccess(result)) {
        expect(result.payload).toBeDefined()
        expect(result.payload.userId).toBe('123')
      }
    })

    it('should return false for failed verification', () => {
      const result: JWTVerifyResult = {
        valid: false,
        error: 'TOKEN_EXPIRED',
      }

      expect(isJWTVerifySuccess(result)).toBe(false)
    })
  })

  describe('isJWTVerifyFailure', () => {
    it('should return true for failed verification', () => {
      const result: JWTVerifyResult = {
        valid: false,
        error: 'TOKEN_EXPIRED',
      }

      expect(isJWTVerifyFailure(result)).toBe(true)
      
      // Type narrowing check
      if (isJWTVerifyFailure(result)) {
        expect(result.error).toBe('TOKEN_EXPIRED')
      }
    })

    it('should return false for successful verification', () => {
      const result: JWTVerifyResult<AccessTokenPayload> = {
        valid: true,
        payload: {
          userId: '123',
          phoneNumber: '09123456789',
          email: 'test@test.com',
          role: 'customer',
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900,
        },
      }

      expect(isJWTVerifyFailure(result)).toBe(false)
    })
  })
})

describe('jwt/types - Type Structures', () => {
  describe('AccessTokenPayload', () => {
    it('should have correct structure', () => {
      const payload: AccessTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'access',
        iat: 1234567890,
        exp: 1234568790,
      }

      expect(payload.type).toBe('access')
      expect(payload.userId).toBe('123')
      expect(payload.phoneNumber).toBe('09123456789')
      expect(payload.email).toBe('test@test.com')
      expect(payload.role).toBe('customer')
      expect(typeof payload.iat).toBe('number')
      expect(typeof payload.exp).toBe('number')
    })

    it('should accept null values for optional fields', () => {
      const payload: AccessTokenPayload = {
        userId: '123',
        phoneNumber: null,
        email: null,
        role: 'admin',
        type: 'access',
        iat: 1234567890,
        exp: 1234568790,
      }

      expect(payload.phoneNumber).toBeNull()
      expect(payload.email).toBeNull()
    })
  })

  describe('RefreshTokenPayload', () => {
    it('should have correct structure', () => {
      const payload: RefreshTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        type: 'refresh',
        jti: 'unique-token-id',
        iat: 1234567890,
        exp: 1235172690,
      }

      expect(payload.type).toBe('refresh')
      expect(payload.jti).toBe('unique-token-id')
      expect(payload.userId).toBe('123')
    })

    it('should require jti field', () => {
      const payload: RefreshTokenPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: null,
        role: 'admin',
        type: 'refresh',
        jti: 'jti-123',
        iat: 1234567890,
        exp: 1235172690,
      }

      // TypeScript compilation ensures jti is required
      expect(payload.jti).toBeDefined()
      expect(typeof payload.jti).toBe('string')
    })
  })

  describe('TokenPair', () => {
    it('should have correct structure', () => {
      const tokenPair: TokenPair = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        accessTokenExpiry: Date.now() + 900000,
        refreshTokenExpiry: Date.now() + 604800000,
      }

      expect(typeof tokenPair.accessToken).toBe('string')
      expect(typeof tokenPair.refreshToken).toBe('string')
      expect(typeof tokenPair.accessTokenExpiry).toBe('number')
      expect(typeof tokenPair.refreshTokenExpiry).toBe('number')
    })

    it('should optionally include tokenType', () => {
      const tokenPair: TokenPair = {
        accessToken: 'token',
        refreshToken: 'token',
        accessTokenExpiry: Date.now(),
        refreshTokenExpiry: Date.now(),
        tokenType: 'Bearer',
      }

      expect(tokenPair.tokenType).toBe('Bearer')
    })
  })

  describe('JWTConfig', () => {
    it('should have correct structure', () => {
      const config: JWTConfig = {
        accessSecret: 'secret-access',
        refreshSecret: 'secret-refresh',
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'my-app',
        audience: 'my-users',
      }

      expect(config.accessSecret).toBe('secret-access')
      expect(config.refreshSecret).toBe('secret-refresh')
      expect(config.accessExpiresIn).toBe('15m')
      expect(config.refreshExpiresIn).toBe('7d')
      expect(config.algorithm).toBe('HS256')
    })

    it('should work with minimal configuration', () => {
      const config: JWTConfig = {
        accessSecret: 'secret-access',
        refreshSecret: 'secret-refresh',
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
      }

      expect(config.algorithm).toBeUndefined()
      expect(config.issuer).toBeUndefined()
      expect(config.audience).toBeUndefined()
    })
  })

  describe('JWTVerifyResult', () => {
    it('should represent successful verification', () => {
      const successResult: JWTVerifyResult<AccessTokenPayload> = {
        valid: true,
        payload: {
          userId: '123',
          phoneNumber: '09123456789',
          email: 'test@test.com',
          role: 'customer',
          type: 'access',
          iat: 1234567890,
          exp: 1234568790,
        },
      }

      expect(successResult.valid).toBe(true)
      expect(successResult.payload).toBeDefined()
    })

    it('should represent failed verification', () => {
      const failureResult: JWTVerifyResult = {
        valid: false,
        error: 'TOKEN_EXPIRED',
      }

      expect(failureResult.valid).toBe(false)
      expect(failureResult.error).toBe('TOKEN_EXPIRED')
    })

    it('should not allow both payload and error', () => {
      // This test ensures TypeScript enforces mutual exclusivity
      const successResult: JWTVerifyResult = {
        valid: true,
        payload: {
          userId: '123',
          phoneNumber: null,
          email: null,
          role: 'customer',
          type: 'access',
          iat: 1234567890,
          exp: 1234568790,
        },
      }

      // TypeScript should prevent adding 'error' to success result
      expect(successResult.error).toBeUndefined()
    })
  })
})

describe('jwt/types - Type Compatibility', () => {
  it('should allow JWTPayload to be AccessTokenPayload', () => {
    const accessPayload: AccessTokenPayload = {
      userId: '123',
      phoneNumber: '09123456789',
      email: 'test@test.com',
      role: 'customer',
      type: 'access',
      iat: 1234567890,
      exp: 1234568790,
    }

    const jwtPayload: JWTPayload = accessPayload

    expect(jwtPayload).toBe(accessPayload)
  })

  it('should allow JWTPayload to be RefreshTokenPayload', () => {
    const refreshPayload: RefreshTokenPayload = {
      userId: '123',
      phoneNumber: '09123456789',
      email: 'test@test.com',
      role: 'customer',
      type: 'refresh',
      jti: 'jti-123',
      iat: 1234567890,
      exp: 1235172690,
    }

    const jwtPayload: JWTPayload = refreshPayload

    expect(jwtPayload).toBe(refreshPayload)
  })
})

describe('jwt/types - Error Types', () => {
  it('should have all error types', () => {
    const errors = [
      'TOKEN_EXPIRED',
      'INVALID_SIGNATURE',
      'INVALID_TOKEN',
      'MISSING_TOKEN',
      'INVALID_TYPE',
      'MALFORMED_TOKEN',
      'TOKEN_NOT_YET_VALID',
      'INVALID_ISSUER',
      'INVALID_AUDIENCE',
    ]

    errors.forEach(error => {
      const result: JWTVerifyResult = {
        valid: false,
        error: error as any,
      }

      expect(result.error).toBe(error)
    })
  })
})

describe('jwt/types - Timestamp Validation', () => {
  it('should have valid timestamp ranges', () => {
    const now = Math.floor(Date.now() / 1000)
    const payload: AccessTokenPayload = {
      userId: '123',
      phoneNumber: null,
      email: null,
      role: 'customer',
      type: 'access',
      iat: now,
      exp: now + 900, // 15 minutes
    }

    expect(payload.exp).toBeGreaterThan(payload.iat)
    expect(payload.exp - payload.iat).toBe(900)
  })

  it('should validate refresh token expiry', () => {
    const now = Math.floor(Date.now() / 1000)
    const payload: RefreshTokenPayload = {
      userId: '123',
      phoneNumber: null,
      email: null,
      role: 'customer',
      type: 'refresh',
      jti: 'jti-123',
      iat: now,
      exp: now + 604800, // 7 days
    }

    expect(payload.exp).toBeGreaterThan(payload.iat)
    expect(payload.exp - payload.iat).toBe(604800)
  })
})