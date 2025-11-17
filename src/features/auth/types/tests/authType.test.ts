// src/features/auth/types/__tests__/auth.types.test.ts
import { describe, it, expect } from 'vitest'
import {
  isUserProfile,
  isAuthUser,
  isAPISuccess,
  isAPIError,
  isRateLimitError,
  isJWTPayload,
  databaseUserToProfile,
  profileToDatabaseUser,
  type UserProfile,
  type AuthUser,
  type APISuccessResponse,
  type APIErrorResponse,
  type RateLimitError,
  type JWTPayload,
  type DatabaseUser,
} from '../authType'

describe('auth.types - Type Guards', () => {
  describe('isUserProfile', () => {
    it('should return true for valid UserProfile', () => {
      const validUser: UserProfile = {
        id: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        fullName: 'Test User',
        address: null,
        postalCode: null,
        birthday: null,
        role: 'customer',
        profileCompleted: true,
      }

      expect(isUserProfile(validUser)).toBe(true)
    })

    it('should return false for invalid user (missing id)', () => {
      const invalidUser = {
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        profileCompleted: true,
      }

      expect(isUserProfile(invalidUser)).toBe(false)
    })

    it('should return false for invalid role', () => {
      const invalidUser = {
        id: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'superadmin', // Invalid role
        profileCompleted: true,
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(isUserProfile(invalidUser)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isUserProfile(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUserProfile(undefined)).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isUserProfile('string')).toBe(false)
      expect(isUserProfile(123)).toBe(false)
      expect(isUserProfile(true)).toBe(false)
    })

    it('should accept null values for optional fields', () => {
      const userWithNulls: UserProfile = {
        id: '123',
        phoneNumber: null,
        email: null,
        fullName: null,
        address: null,
        postalCode: null,
        birthday: null,
        role: 'admin',
        profileCompleted: false,
      }

      expect(isUserProfile(userWithNulls)).toBe(true)
    })
  })

  describe('isAuthUser', () => {
    it('should return true for valid AuthUser', () => {
      const validAuthUser: AuthUser = {
        id: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
      }

      expect(isAuthUser(validAuthUser)).toBe(true)
    })

    it('should return false for invalid AuthUser', () => {
      const invalidAuthUser = {
        id: '123',
        phoneNumber: '09123456789',
        // Missing email and role
      }

      expect(isAuthUser(invalidAuthUser)).toBe(false)
    })

    it('should accept null email and phoneNumber', () => {
      const authUserWithNulls: AuthUser = {
        id: '123',
        phoneNumber: null,
        email: null,
        role: 'admin',
      }

      expect(isAuthUser(authUserWithNulls)).toBe(true)
    })
  })

  describe('isAPISuccess', () => {
    it('should return true for success response', () => {
      const successResponse: APISuccessResponse<string> = {
        success: true,
        data: 'test data',
        message: 'Success',
      }

      expect(isAPISuccess(successResponse)).toBe(true)
    })

    it('should return false for error response', () => {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'Something went wrong',
      }

      expect(isAPISuccess(errorResponse)).toBe(false)
    })
  })

  describe('isAPIError', () => {
    it('should return true for error response', () => {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'Something went wrong',
        code: 'AUTH_ERROR',
      }

      expect(isAPIError(errorResponse)).toBe(true)
    })

    it('should return false for success response', () => {
      const successResponse: APISuccessResponse = {
        success: true,
        data: {},
      }

      expect(isAPIError(successResponse)).toBe(false)
    })
  })

  describe('isRateLimitError', () => {
    it('should return true for rate limit error', () => {
      const rateLimitError: RateLimitError = {
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        rateLimitInfo: {
          limit: 5,
          remaining: 0,
          resetTime: Date.now() + 60000,
        },
      }

      expect(isRateLimitError(rateLimitError)).toBe(true)
    })

    it('should return false for regular error', () => {
      const regularError: APIErrorResponse = {
        success: false,
        error: 'Regular error',
        code: 'SOME_ERROR',
      }

      expect(isRateLimitError(regularError)).toBe(false)
    })

    it('should return false for success response', () => {
      const successResponse: APISuccessResponse = {
        success: true,
        data: {},
      }

      expect(isRateLimitError(successResponse)).toBe(false)
    })
  })

  describe('isJWTPayload', () => {
    it('should return true for valid JWT payload', () => {
      const validPayload: JWTPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      expect(isJWTPayload(validPayload)).toBe(true)
    })

    it('should return false for invalid payload (missing exp)', () => {
      const invalidPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'customer',
        iat: Math.floor(Date.now() / 1000),
      }

      expect(isJWTPayload(invalidPayload)).toBe(false)
    })

    it('should return false for invalid role', () => {
      const invalidPayload = {
        userId: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        role: 'superuser',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      expect(isJWTPayload(invalidPayload)).toBe(false)
    })

    it('should accept null phoneNumber and email', () => {
      const payloadWithNulls: JWTPayload = {
        userId: '123',
        phoneNumber: null,
        email: null,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      expect(isJWTPayload(payloadWithNulls)).toBe(true)
    })
  })
})

describe('auth.types - Conversion Utilities', () => {
  describe('databaseUserToProfile', () => {
    it('should convert snake_case to camelCase correctly', () => {
      const dbUser: DatabaseUser = {
        id: '123',
        phone_number: '09123456789',
        email: 'test@test.com',
        full_name: 'Test User',
        address: '123 Test St',
        postal_code: '1234567890',
        birthday: '1990-01-01',
        role: 'customer',
        profile_completed: true,
      }

      const profile = databaseUserToProfile(dbUser)

      expect(profile).toEqual({
        id: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        fullName: 'Test User',
        address: '123 Test St',
        postalCode: '1234567890',
        birthday: '1990-01-01',
        role: 'customer',
        profileCompleted: true,
        createdAt: '2024-01-01T00:00:00Z',
      })
    })

    it('should handle null values correctly', () => {
      const dbUser: DatabaseUser = {
        id: '123',
        phone_number: null,
        email: null,
        full_name: null,
        address: null,
        postal_code: null,
        birthday: null,
        role: 'admin',
        profile_completed: false,
      }

      const profile = databaseUserToProfile(dbUser)

      expect(profile.phoneNumber).toBeNull()
      expect(profile.email).toBeNull()
      expect(profile.fullName).toBeNull()
      expect(profile.address).toBeNull()
      expect(profile.postalCode).toBeNull()
      expect(profile.birthday).toBeNull()
    })
  })

  describe('profileToDatabaseUser', () => {
    it('should convert camelCase to snake_case correctly', () => {
      const profile: UserProfile = {
        id: '123',
        phoneNumber: '09123456789',
        email: 'test@test.com',
        fullName: 'Test User',
        address: '123 Test St',
        postalCode: '1234567890',
        birthday: '1990-01-01',
        role: 'customer',
        profileCompleted: true,
      }

      const dbUser = profileToDatabaseUser(profile)

      expect(dbUser).toEqual({
        id: '123',
        phone_number: '09123456789',
        email: 'test@test.com',
        full_name: 'Test User',
        address: '123 Test St',
        postal_code: '1234567890',
        birthday: '1990-01-01',
        role: 'customer',
        profile_completed: true,
        created_at: '2024-01-01T00:00:00Z',
      })
    })

    it('should handle null values correctly', () => {
      const profile: UserProfile = {
        id: '123',
        phoneNumber: null,
        email: null,
        fullName: null,
        address: null,
        postalCode: null,
        birthday: null,
        role: 'admin',
        profileCompleted: false,
      }

      const dbUser = profileToDatabaseUser(profile)

      expect(dbUser.phone_number).toBeNull()
      expect(dbUser.email).toBeNull()
      expect(dbUser.full_name).toBeNull()
      expect(dbUser.address).toBeNull()
      expect(dbUser.postal_code).toBeNull()
      expect(dbUser.birthday).toBeNull()
    })
  })

  describe('Round-trip conversion', () => {
    it('should maintain data integrity through round-trip conversion', () => {
      const originalDbUser: DatabaseUser = {
        id: '123',
        phone_number: '09123456789',
        email: 'test@test.com',
        full_name: 'Test User',
        address: '123 Test St',
        postal_code: '1234567890',
        birthday: '1990-01-01',
        role: 'customer',
        profile_completed: true,
      }

      const profile = databaseUserToProfile(originalDbUser)
      const convertedBackDbUser = profileToDatabaseUser(profile)

      expect(convertedBackDbUser).toEqual(originalDbUser)
    })
  })
})

describe('auth.types - Type Compatibility', () => {
  it('UserProfile should be compatible with AuthUser structure', () => {
    const userProfile: UserProfile = {
      id: '123',
      phoneNumber: '09123456789',
      email: 'test@test.com',
      fullName: 'Test User',
      address: null,
      postalCode: null,
      birthday: null,
      role: 'customer',
      profileCompleted: true,
    }

    // AuthUser can be extracted from UserProfile
    const authUser: AuthUser = {
      id: userProfile.id,
      phoneNumber: userProfile.phoneNumber,
      email: userProfile.email,
      role: userProfile.role,
    }

    expect(isAuthUser(authUser)).toBe(true)
  })

  it('JWTPayload should be compatible with AuthUser structure', () => {
    const jwtPayload: JWTPayload = {
      userId: '123',
      phoneNumber: '09123456789',
      email: 'test@test.com',
      role: 'customer',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }

    // AuthUser can be extracted from JWTPayload
    const authUser: AuthUser = {
      id: jwtPayload.userId,
      phoneNumber: jwtPayload.phoneNumber,
      email: jwtPayload.email,
      role: jwtPayload.role,
    }

    expect(isAuthUser(authUser)).toBe(true)
  })
})