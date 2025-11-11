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
// ==================== CLIENT-SIDE HELPERS ====================

/**
 * Get Cookie Value (Client-side)
 * Use in browser only
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null
    }

    return null
}

/**
 * Set Cookie (Client-side)
 * Use in browser only
 */
export function setCookie(name: string, value: string, maxAge: number) {
    if (typeof document === 'undefined') return

    const secure = window.location.protocol === 'https:' ? 'Secure;' : ''
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure}`
}

/**
 * Delete Cookie (Client-side)
 */
export function deleteCookie(name: string) {
    if (typeof document === 'undefined') return

    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

/**
 * Clear All Auth Cookies (Client-side)
 */
export function clearAuthCookiesClient() {
    deleteCookie(COOKIE_CONFIG.ACCESS_TOKEN)
    deleteCookie(COOKIE_CONFIG.REFRESH_TOKEN)
}

/**
 * Get Access Token (Client-side)
 */
export function getAccessTokenClient(): string | null {
    return getCookie(COOKIE_CONFIG.ACCESS_TOKEN)
}

/**
 * Get Refresh Token (Client-side)
 */
export function getRefreshTokenClient(): string | null {
    return getCookie(COOKIE_CONFIG.REFRESH_TOKEN)
}