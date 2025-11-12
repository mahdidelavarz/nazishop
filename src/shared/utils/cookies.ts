import { cookies } from 'next/headers'

/**
 * Cookie Configuration
 */
export const COOKIE_CONFIG = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    MAX_AGE: {
        ACCESS: 45 * 60, // 45 minutes in seconds
        REFRESH: 120 * 24 * 60 * 60, // 120 days in seconds
    },
} as const

/**
 * Cookie Options for Secure Cookies
 */
export function getSecureCookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
    }
}

/**
 * Set Access Token Cookie (Server-side)
 * Use in API routes
 */
export async function setAccessTokenCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(
        COOKIE_CONFIG.ACCESS_TOKEN,
        token,
        getSecureCookieOptions(COOKIE_CONFIG.MAX_AGE.ACCESS)
    )
}

/**
 * Set Refresh Token Cookie (Server-side)
 * Use in API routes
 */
export async function setRefreshTokenCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(
        COOKIE_CONFIG.REFRESH_TOKEN,
        token,
        getSecureCookieOptions(COOKIE_CONFIG.MAX_AGE.REFRESH)
    )
}

/**
 * Get Access Token from Cookie (Server-side)
 */
export async function getAccessTokenFromCookie(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN)?.value
}

/**
 * Get Refresh Token from Cookie (Server-side)
 */
export async function getRefreshTokenFromCookie(): Promise<string | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN)?.value
}

/**
 * Clear Auth Cookies (Server-side)
 * Use on logout
 */
export async function clearAuthCookies() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN)
    cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN)
}

/**
 * Set Both Tokens at Once (Server-side)
 */
export async function setAuthTokens(accessToken: string, refreshToken: string) {
   await setAccessTokenCookie(accessToken)
   await setRefreshTokenCookie(refreshToken)
}
