// src/shared/utils/cookies.ts
import { cookies } from 'next/headers'

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  MAX_AGE: {
    ACCESS: 45 * 60,
    REFRESH: 120 * 24 * 60 * 60,
  },
} as const

export function getSecureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(
    COOKIE_CONFIG.ACCESS_TOKEN,
    token,
    getSecureCookieOptions(COOKIE_CONFIG.MAX_AGE.ACCESS)
  )
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(
    COOKIE_CONFIG.REFRESH_TOKEN,
    token,
    getSecureCookieOptions(COOKIE_CONFIG.MAX_AGE.REFRESH)
  )
}

export async function getAccessTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  console.log(cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN))
  return cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN)?.value
}

export async function getRefreshTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN)?.value
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN)
  cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN)
}

export async function setAuthTokens(accessToken: string, refreshToken: string) {
  await setAccessTokenCookie(accessToken)
  await setRefreshTokenCookie(refreshToken)
}