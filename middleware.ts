// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value
  const  pathname  = request.url

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/api/auth/send-otp', '/api/auth/verify-otp']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // If accessing protected route without session, redirect to login
  if (!isPublicPath && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access login page, redirect to home
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}