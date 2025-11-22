// src/shared/lib/jwt/__tests__/verify.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  verifyAccessToken,
  verifyRefreshToken,
  verifyToken,
  decodeTokenUnsafe,
  isTokenExpired,
  shouldRefreshToken,
  getUserIdFromToken,
  getTokenExpiry,
  getTokenIssuedAt,
  getTimeUntilExpiry,
  getTokenAge,
  getTokenLifetime,
  getTokenType,
  getTokenJTI,
  isValidJWTFormat,
  getUserInfoFromToken,
  getJWTErrorMessage,
  clearVerifySecretCache,
} from '../verify'
import { signAccessToken, signRefreshToken, clearSecretCache } from '../sign'
import type { TokenUserData } from '../types'

// Mock environment variables
const mockEnv = {
  JWT_ACCESS_SECRET: 'test-access-secret-key-very-secure',
  JWT_REFRESH_SECRET: 'test-refresh-secret-key-very-secure',
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
}

const mockUser: TokenUserData = {
  id: '123',
  phoneNumber: '09123456789',
  email: 'test@example.com',
  role: 'customer',
}

describe('jwt/verify - Token Verification', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    clearSecretCache()
    clearVerifySecretCache()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
    clearSecretCache()
    clearVerifySecretCache()
  })

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const token = await signAccessToken(mockUser)
      const result = await verifyAccessToken(token)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.payload.userId).toBe(mockUser.id)
        expect(result.payload.type).toBe('access')
      }
    })

    it('should return error for missing token', async () => {
      const result = await verifyAccessToken('')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('MISSING_TOKEN')
      }
    })

    it('should return error for malformed token', async () => {
      const result = await verifyAccessToken('invalid.token')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('MALFORMED_TOKEN')
      }
    })

    it('should return error for wrong token type', async () => {
      const { token } = await signRefreshToken(mockUser)
      const result = await verifyAccessToken(token)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('INVALID_TYPE')
      }
    })

    it('should return error for expired token', async () => {
      // Create token with very short expiry
      const token = await signAccessToken(mockUser, { accessExpiresIn: '1s' })
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const result = await verifyAccessToken(token)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('TOKEN_EXPIRED')
      }
    })

    it('should return error for invalid signature', async () => {
      const token = await signAccessToken(mockUser)
      
      // Tamper with token
      const parts = token.split('.')
      parts[2] = 'invalid-signature'
      const tamperedToken = parts.join('.')
      
      const result = await verifyAccessToken(tamperedToken)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('INVALID_SIGNATURE')
      }
    })

    it('should verify with custom options', async () => {
      const token = await signAccessToken(mockUser, {
        issuer: 'test-issuer',
      })
      
      const result = await verifyAccessToken(token, {
        issuer: 'test-issuer',
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const { token } = await signRefreshToken(mockUser)
      const result = await verifyRefreshToken(token)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.payload.userId).toBe(mockUser.id)
        expect(result.payload.type).toBe('refresh')
        expect(result.payload.jti).toBeTruthy()
      }
    })

    it('should return error for missing token', async () => {
      const result = await verifyRefreshToken('')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('MISSING_TOKEN')
      }
    })

    it('should return error for wrong token type', async () => {
      const token = await signAccessToken(mockUser)
      const result = await verifyRefreshToken(token)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('INVALID_TYPE')
      }
    })

    it('should validate expected user ID if provided', async () => {
      const { token } = await signRefreshToken(mockUser)
      const result = await verifyRefreshToken(token, undefined, {
        expectedUserId: '123',
      })

      expect(result.valid).toBe(true)
    })

    it('should reject wrong user ID', async () => {
      const { token } = await signRefreshToken(mockUser)
      const result = await verifyRefreshToken(token, undefined, {
        expectedUserId: '999',
      })

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('INVALID_TOKEN')
      }
    })
  })

  describe('verifyToken', () => {
    it('should verify access token', async () => {
      const token = await signAccessToken(mockUser)
      const result = await verifyToken(token)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.payload.type).toBe('access')
      }
    })

    it('should verify refresh token', async () => {
      const { token } = await signRefreshToken(mockUser)
      const result = await verifyToken(token)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.payload.type).toBe('refresh')
      }
    })

    it('should handle invalid token', async () => {
      const result = await verifyToken('invalid.token.here')

      expect(result.valid).toBe(false)
    })
  })
})

describe('jwt/verify - Unsafe Decode Functions', () => {
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

  describe('decodeTokenUnsafe', () => {
    it('should decode valid token', async () => {
      const token = await signAccessToken(mockUser)
      const payload = decodeTokenUnsafe(token)

      expect(payload).toBeTruthy()
      expect(payload?.userId).toBe(mockUser.id)
      expect(payload?.type).toBe('access')
    })

    it('should return null for invalid token', () => {
      const payload = decodeTokenUnsafe('invalid.token')
      expect(payload).toBeNull()
    })

    it('should return null for empty token', () => {
      const payload = decodeTokenUnsafe('')
      expect(payload).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for valid token', async () => {
      const token = await signAccessToken(mockUser)
      expect(isTokenExpired(token)).toBe(false)
    })

    it('should return true for expired token', async () => {
      const token = await signAccessToken(mockUser, { accessExpiresIn: '1s' })
      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(isTokenExpired(token)).toBe(true)
    })

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid')).toBe(true)
    })
  })

  describe('shouldRefreshToken', () => {
    it('should return false for fresh token', async () => {
      const token = await signAccessToken(mockUser)
      expect(shouldRefreshToken(token)).toBe(false)
    })

    it('should return true for soon-to-expire token', async () => {
      const token = await signAccessToken(mockUser, { accessExpiresIn: '2m' })
      expect(shouldRefreshToken(token)).toBe(true) // Less than 5 minutes
    })

    it('should accept custom threshold', async () => {
      const token = await signAccessToken(mockUser, { accessExpiresIn: '10m' })
      expect(shouldRefreshToken(token, 600)).toBe(true) // 10 minutes threshold
    })

    it('should return true for invalid token', () => {
      expect(shouldRefreshToken('invalid')).toBe(true)
    })
  })

  describe('getUserIdFromToken', () => {
    it('should extract user ID', async () => {
      const token = await signAccessToken(mockUser)
      const userId = getUserIdFromToken(token)
      expect(userId).toBe(mockUser.id)
    })

    it('should return null for invalid token', () => {
      const userId = getUserIdFromToken('invalid')
      expect(userId).toBeNull()
    })
  })

  describe('getTokenExpiry', () => {
    it('should return expiry timestamp', async () => {
      const token = await signAccessToken(mockUser)
      const expiry = getTokenExpiry(token)
      
      expect(expiry).toBeTruthy()
      expect(typeof expiry).toBe('number')
      expect(expiry!).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('should return null for invalid token', () => {
      const expiry = getTokenExpiry('invalid')
      expect(expiry).toBeNull()
    })
  })

  describe('getTokenIssuedAt', () => {
    it('should return issued at timestamp', async () => {
      const token = await signAccessToken(mockUser)
      const iat = getTokenIssuedAt(token)
      
      expect(iat).toBeTruthy()
      expect(typeof iat).toBe('number')
    })

    it('should return null for invalid token', () => {
      const iat = getTokenIssuedAt('invalid')
      expect(iat).toBeNull()
    })
  })

  describe('getTimeUntilExpiry', () => {
    it('should return positive time for valid token', async () => {
      const token = await signAccessToken(mockUser)
      const timeLeft = getTimeUntilExpiry(token)
      
      expect(timeLeft).toBeGreaterThan(0)
      expect(timeLeft).toBeLessThanOrEqual(900) // 15 minutes
    })

    it('should return 0 for expired token', async () => {
      const token = await signAccessToken(mockUser, { accessExpiresIn: '1s' })
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const timeLeft = getTimeUntilExpiry(token)
      expect(timeLeft).toBe(0)
    })

    it('should return 0 for invalid token', () => {
      const timeLeft = getTimeUntilExpiry('invalid')
      expect(timeLeft).toBe(0)
    })
  })

  describe('getTokenAge', () => {
    it('should return positive age for token', async () => {
      const token = await signAccessToken(mockUser)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const age = getTokenAge(token)
      expect(age).toBeGreaterThan(0)
    })

    it('should return 0 for invalid token', () => {
      const age = getTokenAge('invalid')
      expect(age).toBe(0)
    })
  })

  describe('getTokenLifetime', () => {
    it('should return token lifetime', async () => {
      const token = await signAccessToken(mockUser)
      const lifetime = getTokenLifetime(token)
      
      expect(lifetime).toBe(900) // 15 minutes
    })

    it('should return 0 for invalid token', () => {
      const lifetime = getTokenLifetime('invalid')
      expect(lifetime).toBe(0)
    })
  })

  describe('getTokenType', () => {
    it('should detect access token', async () => {
      const token = await signAccessToken(mockUser)
      const type = getTokenType(token)
      expect(type).toBe('access')
    })

    it('should detect refresh token', async () => {
      const { token } = await signRefreshToken(mockUser)
      const type = getTokenType(token)
      expect(type).toBe('refresh')
    })

    it('should return null for invalid token', () => {
      const type = getTokenType('invalid')
      expect(type).toBeNull()
    })
  })

  describe('getTokenJTI', () => {
    it('should extract JTI from refresh token', async () => {
      const { token, jti } = await signRefreshToken(mockUser)
      const extractedJTI = getTokenJTI(token)
      expect(extractedJTI).toBe(jti)
    })

    it('should return null for access token', async () => {
      const token = await signAccessToken(mockUser)
      const jti = getTokenJTI(token)
      expect(jti).toBeNull()
    })

    it('should return null for invalid token', () => {
      const jti = getTokenJTI('invalid')
      expect(jti).toBeNull()
    })
  })

  describe('getUserInfoFromToken', () => {
    it('should extract user info', async () => {
      const token = await signAccessToken(mockUser)
      const userInfo = getUserInfoFromToken(token)
      
      expect(userInfo).toBeTruthy()
      expect(userInfo?.userId).toBe(mockUser.id)
      expect(userInfo?.phoneNumber).toBe(mockUser.phoneNumber)
      expect(userInfo?.email).toBe(mockUser.email)
      expect(userInfo?.role).toBe(mockUser.role)
    })

    it('should return null for invalid token', () => {
      const userInfo = getUserInfoFromToken('invalid')
      expect(userInfo).toBeNull()
    })
  })
})

describe('jwt/verify - Format Validation', () => {
  describe('isValidJWTFormat', () => {
    it('should validate correct JWT format', () => {
      expect(isValidJWTFormat('eyJ.eyJ.abc')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidJWTFormat('')).toBe(false)
      expect(isValidJWTFormat('invalid')).toBe(false)
      expect(isValidJWTFormat('part1.part2')).toBe(false)
      expect(isValidJWTFormat('part1.part2.part3.part4')).toBe(false)
    })

    it('should reject non-base64url characters', () => {
      expect(isValidJWTFormat('abc#.def$.ghi@')).toBe(false)
    })

    it('should reject empty parts', () => {
      expect(isValidJWTFormat('..')).toBe(false)
      expect(isValidJWTFormat('part1..part3')).toBe(false)
    })
  })
})

describe('jwt/verify - Error Messages', () => {
  describe('getJWTErrorMessage', () => {
    it('should return Persian error messages', () => {
      expect(getJWTErrorMessage('TOKEN_EXPIRED')).toContain('منقضی')
      expect(getJWTErrorMessage('INVALID_SIGNATURE')).toContain('امضا')
      expect(getJWTErrorMessage('INVALID_TOKEN')).toContain('نامعتبر')
      expect(getJWTErrorMessage('MISSING_TOKEN')).toContain('یافت نشد')
      expect(getJWTErrorMessage('INVALID_TYPE')).toContain('نوع')
      expect(getJWTErrorMessage('MALFORMED_TOKEN')).toContain('فرمت')
    })

    it('should handle all error types', () => {
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
      ] as const

      errors.forEach(error => {
        const message = getJWTErrorMessage(error)
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
      })
    })
  })
})