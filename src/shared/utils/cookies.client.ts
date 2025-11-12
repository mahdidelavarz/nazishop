// clientCookies.ts
const COOKIE_CONFIG = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    MAX_AGE: {
        ACCESS: 45 * 60,
        REFRESH: 120 * 24 * 60 * 60,
    },
} as const;

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



export function clearAuthCookiesClient() {
    deleteCookie(COOKIE_CONFIG.ACCESS_TOKEN);
    deleteCookie(COOKIE_CONFIG.REFRESH_TOKEN);
}

export function getAccessTokenClient(): string | null {
    return getCookie(COOKIE_CONFIG.ACCESS_TOKEN);
}

export function getRefreshTokenClient(): string | null {
    return getCookie(COOKIE_CONFIG.REFRESH_TOKEN);
}
