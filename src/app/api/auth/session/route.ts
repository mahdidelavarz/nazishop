// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeTokenUnsafe, isTokenExpired } from '@/shared/lib/jwt/verify'
import { getAccessTokenFromCookie } from '@/shared/utils/cookies'

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromCookie()

    if (!accessToken) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      )
    }

    if (isTokenExpired(accessToken)) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      )
    }

    const payload = decodeTokenUnsafe(accessToken)
    
    if (!payload) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
      },
      accessTokenExpiry: payload.exp * 1000, // Convert to milliseconds
    })

  } catch (error) {
    console.error('Error reading session:', error)
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 200 }
    )
  }
}