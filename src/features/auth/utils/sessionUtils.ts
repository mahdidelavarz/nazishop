// src/shared/utils/sessionUtils.ts
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  phoneNumber: string
  timestamp: number
}

/**
 * Verify session token (server-side)
 */
export async function verifySession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const session: SessionData = JSON.parse(decoded)

    // Check if session is older than 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - session.timestamp > sevenDays) {
      return null
    }

    return session
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

/**
 * API route helper to get session
 */
export function getSessionFromRequest(request: Request): SessionData | null {
  try {
    const cookie = request.headers.get('cookie')
    if (!cookie) return null

    const sessionCookie = cookie
      .split(';')
      .find(c => c.trim().startsWith('session_token='))
    
    if (!sessionCookie) return null

    const token = sessionCookie.split('=')[1]
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const session: SessionData = JSON.parse(decoded)

    // Check expiry
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - session.timestamp > sevenDays) {
      return null
    }

    return session
  } catch {
    return null
  }
}