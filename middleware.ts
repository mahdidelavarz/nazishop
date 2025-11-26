// middleware.ts

import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/profile'];

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // No token - redirect to login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Try to verify token, but don't fail if verification fails
    // Let the page handle token refresh through the API
    try {
      const payload = verifyAccessToken(accessToken);
      if (!payload) {
        // Token invalid but let the page handle refresh
        console.log('Token verification failed in middleware, letting page handle it');
      }
    } catch (error) {
      // Token verification error, let the page handle it
      console.log('Token verification error in middleware:', error);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login' && accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Invalid token, allow access to login page
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};