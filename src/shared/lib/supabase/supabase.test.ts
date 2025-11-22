// src/shared/lib/supabase/__tests__/client.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    getSupabaseBrowserClient,
    clearSupabaseBrowserClient,
    isSupabaseAuthenticated,
    getCurrentSupabaseUser,
    signOutSupabase,
    getSupabaseClientInfo,
} from './client'

// Mock environment variables
const mockEnv = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn((url, key) => ({
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: '123' } } },
                error: null,
            }),
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: '123', email: 'test@test.com' } },
                error: null,
            }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    })),
}))

describe('supabase/client', () => {
    beforeEach(() => {
        Object.entries(mockEnv).forEach(([key, value]) => {
            process.env[key] = value
        })
        clearSupabaseBrowserClient()
    })

    afterEach(() => {
        Object.keys(mockEnv).forEach(key => {
            delete process.env[key]
        })
        clearSupabaseBrowserClient()
        vi.clearAllMocks()
    })

    describe('getSupabaseBrowserClient', () => {
        it('should create client successfully', () => {
            const client = getSupabaseBrowserClient()
            expect(client).toBeDefined()
        })

        it('should return same instance (singleton)', () => {
            const client1 = getSupabaseBrowserClient()
            const client2 = getSupabaseBrowserClient()
            expect(client1).toBe(client2)
        })

        it('should throw error if environment variables missing', () => {
            delete process.env.NEXT_PUBLIC_SUPABASE_URL
            clearSupabaseBrowserClient()

            expect(() => getSupabaseBrowserClient()).toThrow('Missing Supabase environment variables')
        })
    })

    describe('isSupabaseAuthenticated', () => {
        it('should return true when session exists', async () => {
            const isAuth = await isSupabaseAuthenticated()
            expect(isAuth).toBe(true)
        })
    })

    describe('getCurrentSupabaseUser', () => {
        it('should return user when authenticated', async () => {
            const user = await getCurrentSupabaseUser()
            expect(user).toBeDefined()
            expect(user?.id).toBe('123')
        })
    })

    describe('signOutSupabase', () => {
        it('should sign out successfully', async () => {
            const success = await signOutSupabase()
            expect(success).toBe(true)
        })
    })

    describe('getSupabaseClientInfo', () => {
        it('should return client info', () => {
            const info = getSupabaseClientInfo()
            expect(info.url).toBe(mockEnv.NEXT_PUBLIC_SUPABASE_URL)
            expect(info.hasAnonKey).toBe(true)
        })
    })
})

// src/shared/lib/supabase/__tests__/server.test.ts
import { describe as describeServer, it as itServer, expect as expectServer, beforeEach as beforeEachServer, afterEach as afterEachServer, vi as viServer } from 'vitest'
import {
    getSupabaseAdminClient,
    clearSupabaseAdminClient,
    createUserRecord,
    getUserByPhone,
    getUserByEmail,
    getUserById,
    updateUserProfile,
    storeRefreshToken,
    isRefreshTokenValid,
    revokeRefreshToken,
    revokeAllUserTokens,
    storeOTPCode,
    verifyOTPCode,
    createLoginLog,
} from './server'

// Mock environment variables for server
const mockServerEnv = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
}

// Mock @supabase/supabase-js
viServer.mock('@supabase/supabase-js', () => ({
    createClient: viServer.fn((url, key) => ({
        from: viServer.fn((table) => {
            const mockData = {
                users: {
                    id: '123',
                    phone_number: '989123456789',
                    email: 'test@test.com',
                    full_name: 'Test User',
                    role: 'customer',
                    profile_completed: true,
                    created_at: new Date().toISOString(),
                    address: null,
                    postal_code: null,
                    birthday: null,
                },
                refresh_tokens: {
                    id: 'token-123',
                    user_id: '123',
                    token_hash: 'hash123',
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                    revoked: false,
                    created_at: new Date().toISOString(),
                },
                otp_codes: {
                    id: 'otp-123',
                    phone_number: '989123456789',
                    otp_code: '123456',
                    expires_at: new Date(Date.now() + 120000).toISOString(),
                    verified: false,
                    attempts: 0,
                    created_at: new Date().toISOString(),
                },
            }

            return {
                select: viServer.fn().mockReturnThis(),
                insert: viServer.fn().mockReturnThis(),
                update: viServer.fn().mockReturnThis(),
                delete: viServer.fn().mockReturnThis(),
                eq: viServer.fn().mockReturnThis(),
                lt: viServer.fn().mockReturnThis(),
                order: viServer.fn().mockReturnThis(),
                limit: viServer.fn().mockReturnThis(),
                single: viServer.fn().mockResolvedValue({
                    data: mockData[table as keyof typeof mockData],
                    error: null,
                }),
            }
        }),
        auth: {
            getSession: viServer.fn().mockResolvedValue({
                data: { session: null },
                error: null,
            }),
        },
    })),
}))

describeServer('supabase/server', () => {
    beforeEachServer(() => {
        Object.entries(mockServerEnv).forEach(([key, value]) => {
            process.env[key] = value
        })
        clearSupabaseAdminClient()
    })

    afterEachServer(() => {
        Object.keys(mockServerEnv).forEach(key => {
            delete process.env[key]
        })
        clearSupabaseAdminClient()
        viServer.clearAllMocks()
    })

    describeServer('getSupabaseAdminClient', () => {
        itServer('should create admin client successfully', () => {
            const client = getSupabaseAdminClient()
            expectServer(client).toBeDefined()
        })

        itServer('should return same instance (singleton)', () => {
            const client1 = getSupabaseAdminClient()
            const client2 = getSupabaseAdminClient()
            expectServer(client1).toBe(client2)
        })

        itServer('should throw error if service role key missing', () => {
            delete process.env.SUPABASE_SERVICE_ROLE_KEY
            clearSupabaseAdminClient()

            expectServer(() => getSupabaseAdminClient()).toThrow('Missing Supabase environment variables')
        })
    })

    describeServer('createUserRecord', () => {
        itServer('should create user successfully', async () => {
            const user = await createUserRecord({
                id: '123',
                phoneNumber: '989123456789',
                email: 'test@test.com',
                fullName: 'Test User',
            })

            expectServer(user).toBeDefined()
            expectServer(user.id).toBe('123')
        })
    })

    describeServer('getUserByPhone', () => {
        itServer('should get user by phone number', async () => {
            const user = await getUserByPhone('989123456789')
            expectServer(user).toBeDefined()
            expectServer(user?.phoneNumber).toBe('989123456789')
        })
    })

    describeServer('getUserByEmail', () => {
        itServer('should get user by email', async () => {
            const user = await getUserByEmail('test@test.com')
            expectServer(user).toBeDefined()
            expectServer(user?.email).toBe('test@test.com')
        })
    })

    describeServer('storeRefreshToken', () => {
        itServer('should store refresh token', async () => {
            const tokenId = await storeRefreshToken({
                userId: '123',
                tokenHash: 'hash123',
                jti: 'jti-123',
                expiresAt: new Date(Date.now() + 86400000),
            })

            expectServer(tokenId).toBeDefined()
        })
    })

    describeServer('isRefreshTokenValid', () => {
        itServer('should validate refresh token', async () => {
            const isValid = await isRefreshTokenValid('hash123')
            expectServer(isValid).toBe(true)
        })
    })

    describeServer('storeOTPCode', () => {
        itServer('should store OTP code', async () => {
            const otpId = await storeOTPCode({
                phoneNumber: '989123456789',
                otpCode: '123456',
                expiresAt: new Date(Date.now() + 120000),
            })

            expectServer(otpId).toBeDefined()
        })
    })

    describeServer('verifyOTPCode', () => {
        itServer('should verify valid OTP code', async () => {
            const result = await verifyOTPCode('989123456789', '123456')
            expectServer(result.valid).toBe(true)
        })
    })

    describeServer('createLoginLog', () => {
        itServer('should create login log', async () => {
            const logId = await createLoginLog({
                userId: '123',
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            })

            expectServer(logId).toBeDefined()
        })
    })
})