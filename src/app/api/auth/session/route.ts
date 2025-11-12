// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeTokenUnsafe, isTokenExpired } from '@/shared/lib/jwt/verify'
import { getAccessTokenFromCookie } from '@/shared/utils/cookies'

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies (server-side)
    const accessToken = await getAccessTokenFromCookie()

    if (!accessToken) {
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          user: null 
        },
        { status: 200 } // Changed from 401 to 200!
      )
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          user: null 
        },
        { status: 200 }
      )
    }

    // Decode token payload
    const payload = decodeTokenUnsafe(accessToken)
    
    if (!payload) {
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          user: null 
        },
        { status: 200 }
      )
    }

    // Return session
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
      },
      accessTokenExpiry: payload.exp * 1000,
    })

  } catch (error) {
    console.error('Error reading session:', error)
    return NextResponse.json(
      { 
        isAuthenticated: false, 
        user: null 
      },
      { status: 200 } // Return 200, not 500
    )
  }
}