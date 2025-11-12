// middleware.ts (in project root, not in app/)

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/shared/lib/jwt/verify'

const PROTECTED_ROUTES = ['/profile', '/orders', '/checkout', '/dashboard']
const ADMIN_ROUTES = ['/admin']
const PUBLIC_ROUTES = ['/', '/login', '/callback', '/products']

function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1))
    }
    return path === route || path.startsWith(route + '/')
  })
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value

  const isProtectedRoute = matchesRoute(path, PROTECTED_ROUTES)
  const isAdminRoute = matchesRoute(path, ADMIN_ROUTES)
  const isPublicRoute = matchesRoute(path, PUBLIC_ROUTES)

  // Public routes - allow
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

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)

    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', path)
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      
      return response
    }

    const response = NextResponse.next()
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
}
