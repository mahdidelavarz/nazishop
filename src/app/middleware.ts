// app/middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/shared/lib/jwt/verify'

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/profile',
  '/orders',
  '/checkout',
  '/dashboard',
]

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = [
  '/admin',
]

/**
 * Public routes (no auth required)
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/callback',
  '/products',
  '/about',
  '/contact',
]

/**
 * Check if path matches any route in array
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1))
    }
    return path === route || path.startsWith(route + '/')
  })
}

/**
 * Next.js Middleware
 * Runs on every request before reaching the page
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value

  // Check if route requires authentication
  const isProtectedRoute = matchesRoute(path, PROTECTED_ROUTES)
  const isAdminRoute = matchesRoute(path, ADMIN_ROUTES)
  const isPublicRoute = matchesRoute(path, PUBLIC_ROUTES)

  // Public routes - allow access
  if (isPublicRoute && !isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  // No token - redirect to login
  if (!accessToken) {
    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Verify token
  try {
    const payload = await verifyAccessToken(accessToken)

    // Admin route - check role
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Token valid - allow access
    return NextResponse.next()
  } catch (error) {
    // Token invalid or expired
    console.error('Middleware auth error:', error)

    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      
      // Clear invalid cookies
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      
      return response
    }

    // For public routes with invalid token, just clear cookies and continue
    const response = NextResponse.next()
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}